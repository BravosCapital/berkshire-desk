/**
 * Desk data-health model.
 * Marks are a daily session-close set, not intraday ticks.
 */

import { FALLBACK_AS_OF } from "@/lib/valuation/holdings";

export type QuoteMode = "daily" | "partial" | "seed";

export type QuoteHealth = {
  mode: QuoteMode;
  dailyCount: number;
  liveCount: number;
  fallbackCount: number;
  requested: number;
  coverage: number;
  source:
    | "yahoo-chart"
    | "yahoo+stooq"
    | "stooq"
    | "shipped"
    | "fallback"
    | "unknown";
  fetchedAt: string | null;
  marksAsOf: string;
  fallbackAsOf: string;
  brkBDaily: boolean;
  failedSymbols: string[];
};

export type FilingHealth = {
  source: "edgar" | "cache" | "seed";
  stale: boolean;
  error?: string;
};

export type DeskHealth = {
  quotes: QuoteHealth;
  filings: FilingHealth;
  degraded: boolean;
  summary: string;
};

export function buildQuoteHealth(opts: {
  requested: number;
  dailySymbols: string[];
  source?: string;
  fetchedAt?: string | null;
  failedSymbols?: string[];
  marksAsOf?: string;
}): QuoteHealth {
  const dailyCount = opts.dailySymbols.length;
  const requested = Math.max(opts.requested, dailyCount);
  const fallbackCount = Math.max(0, requested - dailyCount);
  const coverage = requested > 0 ? dailyCount / requested : 0;
  const brkBDaily = opts.dailySymbols.includes("BRK-B");
  const marksAsOf = opts.marksAsOf ?? FALLBACK_AS_OF;

  let mode: QuoteMode;
  if (dailyCount === 0) mode = "seed";
  else if (coverage < 0.85 || !brkBDaily) mode = "partial";
  else mode = "daily";

  const source =
    (opts.source as QuoteHealth["source"]) || (dailyCount === 0 ? "fallback" : "unknown");

  return {
    mode,
    dailyCount,
    liveCount: dailyCount,
    fallbackCount,
    requested,
    coverage,
    source,
    fetchedAt: opts.fetchedAt ?? null,
    marksAsOf,
    fallbackAsOf: FALLBACK_AS_OF,
    brkBDaily,
    failedSymbols: opts.failedSymbols ?? [],
  };
}

export function buildDeskHealth(
  quotes: QuoteHealth,
  filings: FilingHealth,
): DeskHealth {
  const marksStaleDays = daysBetween(quotes.marksAsOf, new Date());
  const marksTooOld = quotes.mode === "daily" && marksStaleDays > 3;

  const degraded =
    quotes.mode !== "daily" ||
    marksTooOld ||
    filings.source === "seed" ||
    Boolean(filings.error) ||
    filings.stale;

  const parts: string[] = [];
  if (quotes.mode === "seed") {
    parts.push(
      `Using emergency seed prices (table ${quotes.fallbackAsOf}) — daily feed unavailable`,
    );
  } else if (quotes.mode === "partial") {
    parts.push(
      `Partial daily book: ${quotes.dailyCount}/${quotes.requested} · ${quotes.fallbackCount} seeded`,
    );
  } else if (marksTooOld) {
    parts.push(`Daily marks are ${marksStaleDays} days old (${quotes.marksAsOf})`);
  } else if (quotes.source === "shipped") {
    // Still healthy, but note provenance if filings degraded alone
  }
  if (filings.source === "seed") {
    parts.push("Filings are seeded (EDGAR not yet applied)");
  } else if (filings.error) {
    parts.push(`Filings warning: ${filings.error}`);
  }

  return {
    quotes,
    filings,
    degraded,
    summary:
      parts.join(" · ") ||
      `Daily marks as of ${quotes.marksAsOf}${quotes.source === "shipped" ? " (shipped book)" : ""}`,
  };
}

export function quoteModeLabel(mode: QuoteMode): string {
  if (mode === "daily") return "Daily marks";
  if (mode === "partial") return "Partial marks";
  return "Seeded marks";
}

function daysBetween(isoDate: string, now: Date): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return 99;
  const then = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.round((today - then) / 86_400_000));
}
