import { createServerFn } from "@tanstack/react-start";
import { FALLBACK_AS_OF, FALLBACK_QUOTES } from "@/lib/valuation/holdings";

/**
 * Daily marks — not intraday.
 * The desk uses one session-close set per day (Yahoo/Stooq daily bars).
 * Cached for hours so we do not hammer feeds or chase ticks.
 */

export type QuoteResult = {
  price: number;
  prevClose: number;
  currency: string;
  symbol: string;
  source?: "yahoo" | "stooq" | "fallback";
  /** Session date of the mark (YYYY-MM-DD) */
  asOf?: string;
};

type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        previousClose?: number;
        currency?: string;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{ close?: Array<number | null> }>;
      };
    }>;
  };
};

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const YAHOO_HEADERS: HeadersInit = {
  "User-Agent": BROWSER_UA,
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com/",
};

/** Per-symbol short cache while building the book */
const symbolCache = new Map<string, { at: number; data: QuoteResult }>();
const SYMBOL_TTL_MS = 30 * 60_000;

/** Whole-book cache — one daily set reused for hours */
type BookPayload = {
  quotes: Record<string, QuoteResult>;
  fetchedAt: string;
  source: "yahoo-chart" | "yahoo+stooq" | "stooq" | "fallback";
  daily: string[];
  failedSymbols: string[];
  requested: number;
  fallbackAsOf: string;
  marksAsOf: string;
};

let bookCache: { key: string; at: number; payload: BookPayload } | null = null;
const BOOK_TTL_MS = 6 * 60 * 60_000; // 6 hours

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function toStooq(symbol: string): string | null {
  if (symbol === "BRK-A") return "brk-a.us";
  if (symbol === "BRK-B") return "brk-b.us";
  if (symbol === "USDJPY=X") return "usdjpym";
  if (symbol.endsWith(".T")) return `${symbol.replace(".T", "")}.jp`;
  if (symbol.includes("=")) return null;
  return `${symbol.toLowerCase().replace(".", "-")}.us`;
}

function isoFromUnix(sec: number): string {
  return new Date(sec * 1000).toISOString().slice(0, 10);
}

/** Last completed daily close from a Yahoo chart (not intraday last). */
function parseDailyChart(json: YahooChart, symbol: string): QuoteResult | null {
  const result = json.chart?.result?.[0];
  if (!result) return null;
  const timestamps = result.timestamp ?? [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const bars: Array<{ t: number; c: number }> = [];
  for (let i = 0; i < Math.max(timestamps.length, closes.length); i++) {
    const c = closes[i];
    const t = timestamps[i];
    if (typeof c === "number" && Number.isFinite(c) && typeof t === "number") {
      bars.push({ t, c });
    }
  }

  if (bars.length === 0) {
    // Fallback to meta if series empty
    const meta = result.meta;
    const price = meta?.regularMarketPrice;
    if (typeof price !== "number" || !Number.isFinite(price)) return null;
    const prev = meta?.chartPreviousClose ?? meta?.previousClose ?? price;
    return {
      symbol,
      price,
      prevClose: typeof prev === "number" ? prev : price,
      currency: meta?.currency ?? (symbol.endsWith(".T") ? "JPY" : "USD"),
      source: "yahoo",
      asOf: todayUtc(),
    };
  }

  const last = bars[bars.length - 1];
  const prev = bars.length >= 2 ? bars[bars.length - 2].c : last.c;
  return {
    symbol,
    price: last.c,
    prevClose: prev,
    currency: result.meta?.currency ?? (symbol.endsWith(".T") ? "JPY" : "USD"),
    source: "yahoo",
    asOf: isoFromUnix(last.t),
  };
}

async function fetchYahooChart(symbol: string): Promise<QuoteResult | null> {
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=10d`;
    try {
      const res = await fetch(url, {
        headers: YAHOO_HEADERS,
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as YahooChart;
      const parsed = parseDailyChart(json, symbol);
      if (parsed) return parsed;
    } catch {
      /* try next host */
    }
  }
  return null;
}

async function fetchStooq(symbol: string): Promise<QuoteResult | null> {
  const stooqSym = toStooq(symbol);
  if (!stooqSym) return null;
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(stooqSym)}&f=sd2t2ohlcv&h&e=csv`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA, Accept: "text/csv,*/*" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return null;
    const cols = lines[1].split(",");
    // s, date, time, o, h, l, c, v
    const date = cols[1]?.trim();
    const close = Number(cols[6]);
    if (!Number.isFinite(close) || close <= 0) return null;
    const open = Number(cols[3]);
    const prevClose = Number.isFinite(open) && open > 0 ? open : close;
    const asOf =
      date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayUtc();
    return {
      symbol,
      price: close,
      prevClose,
      currency: symbol.endsWith(".T") || symbol === "USDJPY=X" ? "JPY" : "USD",
      source: "stooq",
      asOf,
    };
  } catch {
    return null;
  }
}

async function fetchOne(symbol: string): Promise<QuoteResult | null> {
  const cached = symbolCache.get(symbol);
  if (cached && Date.now() - cached.at < SYMBOL_TTL_MS) return cached.data;
  let data = await fetchYahooChart(symbol);
  if (!data) data = await fetchStooq(symbol);
  if (!data) return null;
  symbolCache.set(symbol, { at: Date.now(), data });
  return data;
}

function seedFallback(symbol: string): QuoteResult | null {
  const fb = FALLBACK_QUOTES[symbol];
  if (!fb) return null;
  return {
    symbol,
    price: fb.price,
    prevClose: fb.prevClose,
    currency: fb.currency,
    source: "fallback",
    asOf: FALLBACK_AS_OF,
  };
}

function majorityAsOf(quotes: Record<string, QuoteResult>): string {
  const counts = new Map<string, number>();
  for (const q of Object.values(quotes)) {
    if (q.source === "fallback" || !q.asOf) continue;
    counts.set(q.asOf, (counts.get(q.asOf) ?? 0) + 1);
  }
  let best = FALLBACK_AS_OF;
  let n = 0;
  for (const [d, c] of counts) {
    if (c > n) {
      n = c;
      best = d;
    }
  }
  return best;
}

export const fetchMarketQuotes = createServerFn({ method: "POST" })
  .validator((d: { symbols: string[] }) => d)
  .handler(async ({ data }) => {
    const symbols = Array.from(new Set(data.symbols)).slice(0, 60);
    const cacheKey = `${todayUtc()}|${symbols.slice().sort().join(",")}`;

    if (
      bookCache &&
      bookCache.key === cacheKey &&
      Date.now() - bookCache.at < BOOK_TTL_MS &&
      bookCache.payload.daily.length > 0
    ) {
      return bookCache.payload;
    }

    const out: Record<string, QuoteResult> = {};
    const daily: string[] = [];
    const failedSymbols: string[] = [];
    let yahooCount = 0;
    let stooqCount = 0;

    const chunk = 4;
    for (let i = 0; i < symbols.length; i += chunk) {
      const slice = symbols.slice(i, i + chunk);
      const rows = await Promise.all(slice.map((s) => fetchOne(s)));
      rows.forEach((row, idx) => {
        const sym = slice[idx];
        if (row) {
          out[sym] = row;
          daily.push(sym);
          if (row.source === "yahoo") yahooCount += 1;
          if (row.source === "stooq") stooqCount += 1;
        } else {
          failedSymbols.push(sym);
          const fb = seedFallback(sym);
          if (fb) out[sym] = fb;
        }
      });
      if (i + chunk < symbols.length) {
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    for (const sym of symbols) {
      if (!out[sym]) {
        failedSymbols.push(sym);
        const fb = seedFallback(sym);
        if (fb) out[sym] = fb;
      }
    }

    const source =
      yahooCount > 0 && stooqCount > 0
        ? ("yahoo+stooq" as const)
        : yahooCount > 0
          ? ("yahoo-chart" as const)
          : stooqCount > 0
            ? ("stooq" as const)
            : ("fallback" as const);

    const payload: BookPayload = {
      quotes: out,
      fetchedAt: new Date().toISOString(),
      source,
      daily,
      // keep `live` alias for older clients / types during transition
      failedSymbols: Array.from(new Set(failedSymbols)),
      requested: symbols.length,
      fallbackAsOf: FALLBACK_AS_OF,
      marksAsOf: daily.length > 0 ? majorityAsOf(out) : FALLBACK_AS_OF,
    };

    // Attach live for backward compatibility with use-valuation
    const withLive = { ...payload, live: daily };

    if (daily.length > 0) {
      bookCache = { key: cacheKey, at: Date.now(), payload: withLive as BookPayload & { live: string[] } };
    }

    return withLive;
  });
