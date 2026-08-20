import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMarketQuotes } from "@/lib/quotes";
import { getFilingsSnapshot } from "@/lib/filings/server";
import { seedSnapshot } from "@/lib/filings/build-snapshot";
import { FILING } from "@/lib/valuation/quarterly";
import { useTrackerStore } from "@/lib/store";
import { computeValuation, type Quote } from "@/lib/valuation/compute";
import { ALL_QUOTE_SYMBOLS, FALLBACK_QUOTES } from "@/lib/valuation/holdings";
import {
  buildDeskHealth,
  buildQuoteHealth,
  type DeskHealth,
  type QuoteHealth,
} from "@/lib/data-health";

const PLACEHOLDER_FILINGS = seedSnapshot();
PLACEHOLDER_FILINGS.refreshedAt = `${FILING.periodEnd}T00:00:00.000Z`;

function mergeQuotes(
  live?: Record<string, { price: number; prevClose: number; currency: string }>,
): Record<string, Quote> {
  const out: Record<string, Quote> = {};
  for (const [k, v] of Object.entries(FALLBACK_QUOTES)) out[k] = v;
  if (live) {
    for (const [k, v] of Object.entries(live)) out[k] = v;
  }
  return out;
}

export function useFilingsSnapshot() {
  return useQuery({
    queryKey: ["filings"],
    queryFn: () => getFilingsSnapshot(),
    staleTime: 10 * 60_000,
    placeholderData: PLACEHOLDER_FILINGS,
    retry: 3,
    retryDelay: (n) => Math.min(8_000, 1_000 * 2 ** n),
    refetchInterval: (q) => {
      if (q.state.status === "error" || q.state.status === "pending") return 8_000;
      const d = q.state.data;
      if (!d || d.source === "seed" || d.error) return 15_000;
      return 30 * 60_000;
    },
  });
}

export function useLiveValuation() {
  const multiple = useTrackerStore((s) => s.multiple);
  const mode = useTrackerStore((s) => s.mode);
  const segment = useTrackerStore((s) => s.segment);
  const insuranceMultiple = useTrackerStore((s) => s.insuranceMultiple);
  const filings = useFilingsSnapshot();

  const symbols = filings.data?.quoteSymbols ?? [...ALL_QUOTE_SYMBOLS];

  const query = useQuery({
    queryKey: ["quotes", symbols.join(",")],
    queryFn: () => fetchMarketQuotes({ data: { symbols } }),
    refetchInterval: 60_000,
    retry: 2,
    staleTime: 30_000,
  });

  const quotes = useMemo(() => mergeQuotes(query.data?.quotes), [query.data]);
  const liveSymbols = query.data?.live ?? [];

  const quoteHealth: QuoteHealth = useMemo(
    () =>
      buildQuoteHealth({
        requested: query.data?.requested ?? symbols.length,
        liveSymbols,
        source: query.data?.source,
        fetchedAt: query.data?.fetchedAt ?? null,
        failedSymbols: query.data?.failedSymbols,
      }),
    [query.data, liveSymbols, symbols.length],
  );

  const health: DeskHealth = useMemo(
    () =>
      buildDeskHealth(quoteHealth, {
        source: filings.data?.source ?? "seed",
        stale: Boolean(filings.data?.stale),
        error: filings.data?.error,
      }),
    [quoteHealth, filings.data],
  );

  // Valuation.live means “majority live marks including BRK.B” — not “any seed ok”.
  const live = quoteHealth.mode === "live";

  const v = useMemo(
    () =>
      computeValuation({
        quotes,
        multiple,
        mode,
        segmentMultiples: segment,
        insuranceMultiple,
        live,
        liveSymbols,
        snapshot: filings.data ?? null,
      }),
    [quotes, multiple, mode, segment, insuranceMultiple, live, liveSymbols, filings.data],
  );

  return { v, query, live, filings, quoteHealth, health };
}
