import { createServerFn } from "@tanstack/react-start";
import { FALLBACK_QUOTES } from "@/lib/valuation/holdings";

export type QuoteResult = {
  price: number;
  prevClose: number;
  currency: string;
  symbol: string;
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

async function fetchOne(symbol: string): Promise<QuoteResult | null> {
  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; BRK-Tracker/1.0; +https://grok.com)",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as YahooChart;
  const meta = json.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  if (typeof price !== "number" || !Number.isFinite(price)) return null;
  const prev =
    meta?.chartPreviousClose ??
    meta?.previousClose ??
    price;
  const data: QuoteResult = {
    symbol,
    price,
    prevClose: typeof prev === "number" ? prev : price,
    currency: meta?.currency ?? "USD",
  };
  cache.set(symbol, { at: Date.now(), data });
  return data;
}

export const fetchMarketQuotes = createServerFn({ method: "POST" })
  .validator((d: { symbols: string[] }) => d)
  .handler(async ({ data }) => {
    const symbols = Array.from(new Set(data.symbols)).slice(0, 60);
    const out: Record<string, QuoteResult> = {};
    const live: string[] = [];
    const chunk = 6;
    for (let i = 0; i < symbols.length; i += chunk) {
      const slice = symbols.slice(i, i + chunk);
      const rows = await Promise.all(slice.map((s) => fetchOne(s)));
      rows.forEach((row, idx) => {
        const sym = slice[idx];
        if (row) {
          out[sym] = row;
          live.push(sym);
        } else {
          const fb = FALLBACK_QUOTES[sym];
          if (fb) out[sym] = { symbol: sym, ...fb };
        }
      });
    }
    return { quotes: out, fetchedAt: new Date().toISOString(), source: "yahoo-chart" as const, live };
  });
