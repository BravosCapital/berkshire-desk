import { createServerFn } from "@tanstack/react-start";
import { FALLBACK_QUOTES } from "@/lib/valuation/holdings";

export type QuoteResult = {
  price: number;
  prevClose: number;
  currency: string;
  symbol: string;
  source?: "yahoo" | "stooq" | "fallback";
};

type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        previousClose?: number;
        currency?: string;
        symbol?: string;
      };
    }>;
    error?: unknown;
  };
};

const cache = new Map<string, { at: number; data: QuoteResult }>();
const TTL_MS = 45_000;

function toStooq(symbol: string): string | null {
  if (symbol === "BRK-A") return "brk-a.us";
  if (symbol === "BRK-B") return "brk-b.us";
  if (symbol === "USDJPY=X") return "usdjpym";
  if (symbol.endsWith(".T")) return `${symbol.replace(".T", "")}.jp`;
  if (symbol.includes("=")) return null;
  return `${symbol.toLowerCase().replace(".", "-")}.us`;
}

async function fetchYahoo(symbol: string): Promise<QuoteResult | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; BerkshireDesk/1.0; +https://github.com/BravosCapital/berkshire-desk)",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as YahooChart;
  const meta = json.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  if (typeof price !== "number" || !Number.isFinite(price)) return null;
  const prev = meta?.chartPreviousClose ?? meta?.previousClose ?? price;
  return {
    symbol,
    price,
    prevClose: typeof prev === "number" ? prev : price,
    currency: meta?.currency ?? (symbol.endsWith(".T") ? "JPY" : "USD"),
    source: "yahoo",
  };
}

async function fetchStooq(symbol: string): Promise<QuoteResult | null> {
  const stooqSym = toStooq(symbol);
  if (!stooqSym) return null;
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(stooqSym)}&f=sd2t2ohlcv&h&e=csv`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "BerkshireDesk/1.0", Accept: "text/csv,*/*" },
      signal: AbortSignal.timeout(8_000),
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
  let data = await fetchYahoo(symbol);
  if (!data) data = await fetchStooq(symbol);
  if (!data) return null;
  cache.set(symbol, { at: Date.now(), data });
  return data;
}

export const fetchMarketQuotes = createServerFn({ method: "POST" })
  .validator((d: { symbols: string[] }) => d)
  .handler(async ({ data }) => {
    const symbols = Array.from(new Set(data.symbols)).slice(0, 60);
    const out: Record<string, QuoteResult> = {};
    const live: string[] = [];
    let yahooCount = 0;
    let stooqCount = 0;
    const chunk = 6;
    for (let i = 0; i < symbols.length; i += chunk) {
      const slice = symbols.slice(i, i + chunk);
      const rows = await Promise.all(slice.map((s) => fetchOne(s)));
      rows.forEach((row, idx) => {
        const sym = slice[idx];
        if (row) {
          out[sym] = row;
          live.push(sym);
          if (row.source === "yahoo") yahooCount += 1;
          if (row.source === "stooq") stooqCount += 1;
        } else {
          const fb = FALLBACK_QUOTES[sym];
          if (fb) out[sym] = { symbol: sym, ...fb, source: "fallback" };
        }
      });
    }
    const source =
      yahooCount > 0 && stooqCount > 0
        ? ("yahoo+stooq" as const)
        : yahooCount > 0
          ? ("yahoo-chart" as const)
          : stooqCount > 0
            ? ("stooq" as const)
            : ("fallback" as const);
    return { quotes: out, fetchedAt: new Date().toISOString(), source, live };
  });
