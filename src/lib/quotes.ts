import { createServerFn } from "@tanstack/react-start";
import { FALLBACK_AS_OF, FALLBACK_QUOTES } from "@/lib/valuation/holdings";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Daily session-close mark book (not intraday).
 *
 * Resolution order when building a response:
 *  1. Warm in-memory book (same process, ≤6h)
 *  2. Fresh Yahoo/Stooq daily bars
 *  3. Last-good book on globalThis (survives warm recycles)
 *  4. Shipped public/marks/daily.json (deployed with the site)
 *  5. Hardcoded FALLBACK_QUOTES (emergency seeds)
 */

export type QuoteResult = {
  price: number;
  prevClose: number;
  currency: string;
  symbol: string;
  source?: "yahoo" | "stooq" | "fallback" | "shipped";
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

type BookPayload = {
  quotes: Record<string, QuoteResult>;
  fetchedAt: string;
  source: "yahoo-chart" | "yahoo+stooq" | "stooq" | "shipped" | "fallback";
  daily: string[];
  live: string[];
  failedSymbols: string[];
  requested: number;
  fallbackAsOf: string;
  marksAsOf: string;
};

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const YAHOO_HEADERS: HeadersInit = {
  "User-Agent": BROWSER_UA,
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com/",
};

const CRITICAL = ["BRK-B", "BRK-A", "AAPL", "AXP", "KO", "BAC", "GOOGL", "GOOG"];

const symbolCache = new Map<string, { at: number; data: QuoteResult }>();
const SYMBOL_TTL_MS = 30 * 60_000;

let bookCache: { key: string; at: number; payload: BookPayload } | null = null;
const BOOK_TTL_MS = 6 * 60 * 60_000;

type GlobalBook = { payload: BookPayload; at: number };
const g = globalThis as typeof globalThis & { __brkDailyBook?: GlobalBook };

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoFromUnix(sec: number): string {
  return new Date(sec * 1000).toISOString().slice(0, 10);
}

function toStooq(symbol: string): string | null {
  if (symbol === "BRK-A") return "brk-a.us";
  if (symbol === "BRK-B") return "brk-b.us";
  if (symbol === "USDJPY=X") return "usdjpym";
  if (symbol.endsWith(".T")) return `${symbol.replace(".T", "")}.jp`;
  if (symbol.includes("=")) return null;
  return `${symbol.toLowerCase().replace(".", "-")}.us`;
}

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
      /* next host */
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
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return null;
    const cols = lines[1].split(",");
    const date = cols[1]?.trim();
    const close = Number(cols[6]);
    if (!Number.isFinite(close) || close <= 0) return null;
    const open = Number(cols[3]);
    const prevClose = Number.isFinite(open) && open > 0 ? open : close;
    const asOf = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayUtc();
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

function daysBetween(isoDate: string, now = new Date()): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return 99;
  const then = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.round((today - then) / 86_400_000));
}

async function loadShippedBook(): Promise<BookPayload | null> {
  try {
    const file = join(process.cwd(), "public", "marks", "daily.json");
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as {
      marksAsOf: string;
      fetchedAt?: string;
      source?: string;
      quotes: Record<string, QuoteResult>;
    };
    if (!parsed?.quotes || !parsed.marksAsOf) return null;
    // Reject if older than 10 calendar days — then emergency seeds are clearer
    if (daysBetween(parsed.marksAsOf) > 10) return null;
    const quotes: Record<string, QuoteResult> = {};
    const daily: string[] = [];
    for (const [sym, q] of Object.entries(parsed.quotes)) {
      quotes[sym] = {
        symbol: sym,
        price: q.price,
        prevClose: q.prevClose,
        currency: q.currency,
        source: "shipped",
        asOf: q.asOf ?? parsed.marksAsOf,
      };
      daily.push(sym);
    }
    return {
      quotes,
      fetchedAt: parsed.fetchedAt ?? new Date().toISOString(),
      source: "shipped",
      daily,
      live: daily,
      failedSymbols: [],
      requested: daily.length,
      fallbackAsOf: FALLBACK_AS_OF,
      marksAsOf: parsed.marksAsOf,
    };
  } catch {
    return null;
  }
}

function bookFromQuotes(
  symbols: string[],
  out: Record<string, QuoteResult>,
  daily: string[],
  failedSymbols: string[],
  yahooCount: number,
  stooqCount: number,
): BookPayload {
  const source =
    yahooCount > 0 && stooqCount > 0
      ? ("yahoo+stooq" as const)
      : yahooCount > 0
        ? ("yahoo-chart" as const)
        : stooqCount > 0
          ? ("stooq" as const)
          : ("fallback" as const);
  return {
    quotes: out,
    fetchedAt: new Date().toISOString(),
    source,
    daily,
    live: daily,
    failedSymbols: Array.from(new Set(failedSymbols)),
    requested: symbols.length,
    fallbackAsOf: FALLBACK_AS_OF,
    marksAsOf: daily.length > 0 ? majorityAsOf(out) : FALLBACK_AS_OF,
  };
}

function mergeShippedOntoGaps(
  symbols: string[],
  out: Record<string, QuoteResult>,
  daily: string[],
  failedSymbols: string[],
  shipped: BookPayload | null,
) {
  if (!shipped) return;
  for (const sym of symbols) {
    if (out[sym]?.source && out[sym].source !== "fallback") continue;
    const q = shipped.quotes[sym];
    if (!q) continue;
    out[sym] = { ...q, source: "shipped" };
    if (!daily.includes(sym)) daily.push(sym);
    const ix = failedSymbols.indexOf(sym);
    if (ix >= 0) failedSymbols.splice(ix, 1);
  }
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

    if (
      g.__brkDailyBook &&
      Date.now() - g.__brkDailyBook.at < BOOK_TTL_MS &&
      g.__brkDailyBook.payload.daily.length > symbols.length * 0.5
    ) {
      const warm = g.__brkDailyBook.payload;
      // Re-slice to requested symbols if present
      const quotes: Record<string, QuoteResult> = {};
      const daily: string[] = [];
      for (const sym of symbols) {
        if (warm.quotes[sym]) {
          quotes[sym] = warm.quotes[sym];
          if (warm.quotes[sym].source !== "fallback") daily.push(sym);
        }
      }
      if (daily.length >= symbols.length * 0.5) {
        const payload: BookPayload = {
          ...warm,
          quotes: { ...warm.quotes, ...quotes },
          daily,
          live: daily,
          requested: symbols.length,
        };
        bookCache = { key: cacheKey, at: Date.now(), payload };
        return payload;
      }
    }

    const out: Record<string, QuoteResult> = {};
    const daily: string[] = [];
    const failedSymbols: string[] = [];
    let yahooCount = 0;
    let stooqCount = 0;

    // Critical names first so BRK.B / AAPL land even if later batch throttles
    const ordered = [
      ...CRITICAL.filter((s) => symbols.includes(s)),
      ...symbols.filter((s) => !CRITICAL.includes(s)),
    ];

    const chunk = 3;
    for (let i = 0; i < ordered.length; i += chunk) {
      const slice = ordered.slice(i, i + chunk);
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
        }
      });
      if (i + chunk < ordered.length) {
        await new Promise((r) => setTimeout(r, 180));
      }
    }

    const shipped = await loadShippedBook();
    mergeShippedOntoGaps(symbols, out, daily, failedSymbols, shipped);

    for (const sym of symbols) {
      if (!out[sym]) {
        failedSymbols.push(sym);
        const fb = seedFallback(sym);
        if (fb) out[sym] = fb;
      }
    }

    let payload = bookFromQuotes(
      symbols,
      out,
      daily,
      failedSymbols,
      yahooCount,
      stooqCount,
    );

    // If the feed produced almost nothing, prefer the shipped book wholesale
    if (yahooCount + stooqCount === 0 && shipped && shipped.daily.length > 0) {
      payload = {
        ...shipped,
        requested: symbols.length,
        failedSymbols: symbols.filter((s) => !shipped.quotes[s]),
      };
      // Ensure every requested symbol exists
      for (const sym of symbols) {
        if (!payload.quotes[sym]) {
          const fb = seedFallback(sym);
          if (fb) payload.quotes[sym] = fb;
        }
      }
    }

    if (payload.daily.length > 0) {
      bookCache = { key: cacheKey, at: Date.now(), payload };
      g.__brkDailyBook = { payload, at: Date.now() };
    }

    return payload;
  });
