import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { buildSnapshot, seedSnapshot } from "./build-snapshot";
import {
  listBerkshireFilings,
  pickLatest13F,
  pickLatestTenQ,
  fetch13FTableXml,
  fetchTenQInstanceXml,
} from "./edgar";
import { parse13FTable } from "./parse-13f";
import { parseTenQInstance } from "./parse-xbrl";
import type { DeskSnapshot } from "./types";

const CACHE_KEY = "latest";
const TTL_MS = 6 * 60 * 60 * 1000;

const g = globalThis as typeof globalThis & {
  __brkFilingsInflight__?: Promise<DeskSnapshot>;
  __brkFilingsMemory__?: { snapshot: DeskSnapshot; fetchedAt: number };
};

function asSnapshot(payload: unknown): DeskSnapshot | null {
  if (!payload || typeof payload !== "object") return null;
  const row = payload as DeskSnapshot;
  if (!Array.isArray(row.holdings) || !row.ops) return null;
  return row;
}

async function readCache(): Promise<{ snapshot: DeskSnapshot; fetchedAt: number } | null> {
  const mem = g.__brkFilingsMemory__;
  if (mem) return mem;
  try {
    const sql = await getSql();
    const rows = await sql.query<{ payload: unknown; fetched_at: string }>(
      "select payload, fetched_at::text as fetched_at from desk_cache where key = $1",
      [CACHE_KEY],
    );
    const row = rows[0];
    if (!row) return null;
    const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
    const snapshot = asSnapshot(payload);
    if (!snapshot) return null;
    const fetchedAt = Date.parse(row.fetched_at);
    const parsed = { snapshot, fetchedAt: Number.isFinite(fetchedAt) ? fetchedAt : 0 };
    g.__brkFilingsMemory__ = parsed;
    return parsed;
  } catch {
    return null;
  }
}

async function writeCache(snapshot: DeskSnapshot) {
  g.__brkFilingsMemory__ = { snapshot, fetchedAt: Date.now() };
  try {
    const sql = await getSql();
    await sql.query(
      `insert into desk_cache (key, payload, fetched_at)
       values ($1, $2::jsonb, now())
       on conflict (key) do update set payload = excluded.payload, fetched_at = now()`,
      [CACHE_KEY, JSON.stringify(snapshot)],
    );
  } catch (err) {
    console.error("[filings] cache write failed", err);
  }
}

async function pullEdgar(): Promise<DeskSnapshot> {
  const filings = await listBerkshireFilings();
  const f13 = pickLatest13F(filings);
  const tq = pickLatestTenQ(filings);
  if (!f13 && !tq) throw new Error("No 13F or 10-Q found in EDGAR submissions");

  let lines = null;
  let facts = null;
  const errors: string[] = [];

  if (f13) {
    try {
      const { xml } = await fetch13FTableXml(f13);
      lines = parse13FTable(xml);
      if (!lines.length) errors.push("13F table parsed empty");
    } catch (err) {
      errors.push(`13F: ${err instanceof Error ? err.message : "failed"}`);
    }
  } else {
    errors.push("No 13F-HR in recent submissions");
  }

  if (tq) {
    try {
      const { xml } = await fetchTenQInstanceXml(tq);
      facts = parseTenQInstance(xml);
      if (!facts) errors.push("10-Q instance did not yield facts");
    } catch (err) {
      errors.push(`10-Q: ${err instanceof Error ? err.message : "failed"}`);
    }
  } else {
    errors.push("No 10-Q/10-K in recent submissions");
  }

  return buildSnapshot({
    thirteenFFiling: f13,
    thirteenFLines: lines,
    tenQFiling: tq,
    tenQ: facts,
    source: "edgar",
    error: errors.length ? errors.join(" · ") : undefined,
    refreshedAt: new Date().toISOString(),
  });
}

function startPull(): Promise<DeskSnapshot> {
  if (g.__brkFilingsInflight__) return g.__brkFilingsInflight__;
  g.__brkFilingsInflight__ = (async () => {
    try {
      const snap = await pullEdgar();
      await writeCache(snap);
      return snap;
    } catch (err) {
      const message = err instanceof Error ? err.message : "EDGAR refresh failed";
      const cached = await readCache();
      if (cached?.snapshot) return { ...cached.snapshot, source: "cache", error: message };
      return seedSnapshot(message);
    } finally {
      g.__brkFilingsInflight__ = undefined;
    }
  })();
  return g.__brkFilingsInflight__;
}

async function loadOrRefresh(force: boolean): Promise<DeskSnapshot> {
  if (force) return startPull();

  const cached = await readCache();
  const fresh = cached && Date.now() - cached.fetchedAt < TTL_MS;
  if (fresh && cached) {
    return { ...cached.snapshot, source: cached.snapshot.source === "edgar" ? "cache" : cached.snapshot.source };
  }

  // Never block the first paint on SEC. Serve last-good or Q2 2026 seeds and
  // pull EDGAR in the background; the client retries while source is seed.
  const pull = startPull();
  if (cached?.snapshot) {
    void pull;
    return { ...cached.snapshot, source: "cache" };
  }
  void pull;
  return seedSnapshot("EDGAR refresh in progress — figures will flip from seed to auto");
}

export const getFilingsSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  return loadOrRefresh(false);
});

export const refreshFilings = createServerFn({ method: "POST" }).handler(async () => {
  return loadOrRefresh(true);
});
