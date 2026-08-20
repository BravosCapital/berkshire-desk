import { createServerFn } from "@tanstack/react-start";
import { FALLBACK_AS_OF, FALLBACK_QUOTES } from "@/lib/valuation/holdings";

export type QuoteResult = {
  price: number;
  prevClose: number;
  currency: string;
  symbol: string;
  source?: "yahoo" | "stooq" | "fallback";
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
      indicators?: {
        quote?: Array<{ close?: Array<number | null> }>;
      };
    }>;
  };
};

type YahooQuoteResponse = {
  quoteResponse?: {
    result?: Array<{
      symbol?: string;
      regularMarketPrice?: number;
      regularMarketPreviousClose?: number;
      currency?: string;
    }>;
  };
};

const cache = new Map<string, { at: number; data: QuoteResult }>();
const TTL_MS = 45_000;

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const YAHOO_HEADERS: HeadersInit = {
  "User-Agent": BROWSER_UA,
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com/",
};

function toStooq(symbol: string): string | null {
  if (symbol === "BRK-A") return "brk-a.us";
  if (symbol === "BRK-B") return "brk-b.us";
  if (symbol === "USDJPY=X") return "usdjpym";
  if (symbol.endsWith(".T")) return `${symbol.replace(".T", "")}.jp`;
  if (symbol.includes("=")) return null;
  return `${symbol.toLowerCase().replace(".", "-")}.us`;
}

function parseYahooChart(json: YahooChart, symbol: string): QuoteResult | null {
  const result = json.chart?.result?.[0];
  if (!result) return null;
  const meta = result.meta;
  const closes = (result.indicators?.quote?.[0]?.close ?? []).filter(
    (c): c is number => typeof c === "number" && Number.isFinite(c),
  );
  const price =
    typeof meta?.regularMarketPrice === "number" && Number.isFinite(meta.regularMarketPrice)
      ? meta.regularMarketPrice
      : closes.length
        ? closes[closes.length - 1]
        : null;
  if (price === null) return null;

  let prev: number;
  if (closes.length >= 2) prev = closes[closes.length - 2];
  else prev = meta?.chartPreviousClose ?? meta?.previousClose ?? price;
  if (typeof prev !== "number" || !Number.isFinite(prev)) prev = price;

  return {
    symbol,
    price,
    prevClose: prev,
    currency: meta?.currency ?? (symbol.endsWith(".T") ? "JPY" : "USD"),
    source: "yahoo",
  };
}

/** One HTTP call for many symbols — fewer cloud IP hits than per-name chart. */
async function fetchYahooQuoteBatch(symbols: string[]): Promise<Map<string, QuoteResult>> {
  const out = new Map<string, QuoteResult>();
  if (symbols.length === 0) return out;
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}`;
  try {
    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return out;
    const json = (await res.json()) as YahooQuoteResponse;
    for (const row of json.quoteResponse?.result ?? []) {
      const sym = row.symbol;
      const price = row.regularMarketPrice;
      if (!sym || typeof price !== "number" || !Number.isFinite(price)) continue;
      const prev =
        typeof row.regularMarketPreviousClose === "number" && Number.isFinite(row.regularMarketPreviousClose)
          ? row.regularMarketPreviousClose
          : price;
      out.set(sym, {
        symbol: sym,
        price,
        prevClose: prev,
        currency: row.currency ?? (sym.endsWith(".T") ? "JPY" : "USD"),
        source: "yahoo",
      });
    }
  } catch {
    // batch failed — per-symbol chart path still runs
  }
  return out;
}

async function fetchYahooHost(host: string, symbol: string): Promise<QuoteResult | null> {
  const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  try {
    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as YahooChart;
    return parseYahooChart(json, symbol);
  } catch {
    return null;
  }
}

async function fetchYahooChart(symbol: string): Promise<QuoteResult | null> {
  const a = await fetchYahooHost("query1.finance.yahoo.com", symbol);
  if (a) return a;
  return fetchYahooHost("query2.finance.yahoo.com", symbol);
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
    const close = Number(cols[6]);
    if (!Number.isFinite(close) || close <= 0) return null;
    const open = Number(cols[3]);
    const prevClose = Number.isFinite(open) && open > 0 ? open : close;
    return {
      symbol,
      price: close,
      prevClose,
      currency: symbol.endsWith(".T") || symbol === "USDJPY=X" ? "JPY" : "USD",
      source: "stooq",
    };
  } catch {
    return null;
  }
}

async function fetchOne(symbol: string): Promise<QuoteResult | null> {
  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;
  let data = await fetchYahooChart(symbol);
  if (!data) data = await fetchStooq(symbol);
  if (!data) return null;
  cache.set(symbol, { at: Date.now(), data });
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

export const fetchMarketQuotes = createServerFn({ method: "POST" })
  .validator((d: { symbols: string[] }) => d)
  .handler(async ({ data }) => {
    const symbols = Array.from(new Set(data.symbols)).slice(0, 60);
    const out: Record<string, QuoteResult> = {};
    const live: string[] = [];
    const failedSymbols: string[] = [];
    let yahooCount = 0;
    let stooqCount = 0;
    let usedBatch = false;

    // 1) Batch quote endpoint first (one request for most US names)
    const batchable = symbols.filter((s) => !s.includes("=") || s === "USDJPY=X");
    const batch = await fetchYahooQuoteBatch(batchable);
    if (batch.size > 0) usedBatch = true;
    for (const [sym, row] of batch) {
      out[sym] = row;
      live.push(sym);
      yahooCount += 1;
      cache.set(sym, { at: Date.now(), data: row });
    }

    // 2) Per-symbol chart + Stooq for anything the batch missed
    const missing = symbols.filter((s) => !out[s]);
    const chunk = 4;
    for (let i = 0; i < missing.length; i += chunk) {
      const slice = missing.slice(i, i + chunk);
      const rows = await Promise.all(slice.map((s) => fetchOne(s)));
      rows.forEach((row, idx) => {
        const sym = slice[idx];
        if (row) {
          out[sym] = row;
          live.push(sym);
          if (row.source === "yahoo") yahooCount += 1;
          if (row.source === "stooq") stooqCount += 1;
        } else {
          failedSymbols.push(sym);
          const fb = seedFallback(sym);
          if (fb) out[sym] = fb;
        }
      });
      if (i + chunk < missing.length) {
        await new Promise((r) => setTimeout(r, 120));
      }
    }

    // Ensure every requested symbol has something (seed table)
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
        : usedBatch && yahooCount > 0
          ? ("yahoo-quote" as const)
          : yahooCount > 0
            ? ("yahoo-chart" as const)
            : stooqCount > 0
              ? ("stooq" as const)
              : ("fallback" as const);

    return {
      quotes: out,
      fetchedAt: new Date().toISOString(),
      source,
      live,
      failedSymbols: Array.from(new Set(failedSymbols)),
      requested: symbols.length,
      fallbackAsOf: FALLBACK_AS_OF,
    };
  });
