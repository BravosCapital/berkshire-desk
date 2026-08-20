/**
 * Desk data-health model.
 *
 * Silent degradation (stale seed prices looking “fine”) is a product failure.
 * Every consumer of market marks or filings should read this and surface it.
 */

import { FALLBACK_AS_OF } from "@/lib/valuation/holdings";

export type QuoteMode = "live" | "partial" | "seed";

export type QuoteHealth = {
  mode: QuoteMode;
  /** Symbols successfully fetched from Yahoo or Stooq */
  liveCount: number;
  /** Symbols served from hardcoded FALLBACK_QUOTES */
  fallbackCount: number;
  requested: number;
  /** liveCount / requested, 0–1 */
  coverage: number;
  source: "yahoo-chart" | "yahoo-quote" | "yahoo+stooq" | "stooq" | "fallback" | "unknown";
  fetchedAt: string | null;
  /** Calendar date the seed table was last refreshed */
  fallbackAsOf: string;
  /** True when BRK-B specifically came from a live feed */
  brkBLive: boolean;
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
  /** True when the user should see a prominent warning */
  degraded: boolean;
  summary: string;
};

export function buildQuoteHealth(opts: {
  requested: number;
  liveSymbols: string[];
  source?: string;
  fetchedAt?: string | null;
  failedSymbols?: string[];
}): QuoteHealth {
  const liveCount = opts.liveSymbols.length;
  const requested = Math.max(opts.requested, liveCount);
  const fallbackCount = Math.max(0, requested - liveCount);
  const coverage = requested > 0 ? liveCount / requested : 0;
  const brkBLive = opts.liveSymbols.includes("BRK-B");

  let mode: QuoteMode;
  if (liveCount === 0) mode = "seed";
  else if (coverage < 0.85 || !brkBLive) mode = "partial";
  else mode = "live";

  const source = (opts.source as QuoteHealth["source"]) || (liveCount === 0 ? "fallback" : "unknown");

  return {
    mode,
    liveCount,
    fallbackCount,
    requested,
    coverage,
    source,
    fetchedAt: opts.fetchedAt ?? null,
    fallbackAsOf: FALLBACK_AS_OF,
    brkBLive,
    failedSymbols: opts.failedSymbols ?? [],
  };
}

export function buildDeskHealth(
  quotes: QuoteHealth,
  filings: FilingHealth,
): DeskHealth {
  const degraded =
    quotes.mode !== "live" ||
    filings.source === "seed" ||
    Boolean(filings.error) ||
    filings.stale;

  const parts: string[] = [];
  if (quotes.mode === "seed") {
    parts.push(
      `Market marks are seeded (as of ${quotes.fallbackAsOf}) — live feed unavailable`,
    );
  } else if (quotes.mode === "partial") {
    parts.push(
      `Partial marks: ${quotes.liveCount}/${quotes.requested} live · ${quotes.fallbackCount} seeded`,
    );
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
    summary: parts.join(" · ") || "Live prices and filings",
  };
}

export function quoteModeLabel(mode: QuoteMode): string {
  if (mode === "live") return "Live marks";
  if (mode === "partial") return "Partial marks";
  return "Seeded marks";
}
