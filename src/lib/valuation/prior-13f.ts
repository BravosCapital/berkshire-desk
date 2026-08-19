/**
 * Prior-quarter 13F share counts for the QoQ change table.
 * Period: Q1 2026 (filed ~May 15 2026, period ended Mar 31 2026).
 * Current desk uses Q2 2026 (filed Aug 14 2026).
 *
 * When EDGAR can supply a second 13F snapshot these seeds are the fallback.
 * Share counts are units. Names absent here but present in the live 13F
 * appear as new positions; names here but gone from the live 13F are exits.
 */

export const PRIOR_13F_PERIOD = {
  periodEnd: "2026-03-31",
  filed: "2026-05-15",
  label: "Q1 2026",
} as const;

/** ticker → prior-quarter share count */
export const PRIOR_13F_SHARES: Record<string, number> = {
  AAPL: 300_000_000,
  AXP: 151_610_700,
  KO: 400_000_000,
  GOOGL: 78_791_167,
  BAC: 530_000_000,
  CVX: 84_375_856,
  OXY: 264_941_431,
  CB: 27_000_000,
  MCO: 24_669_778,
  GOOG: 17_000_000,
  KHC: 325_634_818,
  DVA: 33_000_000,
  DAL: 57_320_000,
  SIRI: 124_807_117,
  VRSN: 10_500_000,
  KR: 39_000_000,
  ALLY: 29_000_000,
  LEN: 15_000_000,
  LLYVK: 10_587_143,
  NYT: 15_700_000,
  COF: 3_000_000,
  LLYVA: 4_986_588,
  LPX: 5_664_793,
  NUE: 1_857_752,
  M: 7_347_426,
  NVR: 11_112,
  "LEN.B": 298_117,
  JEF: 433_558,
  DHI: 3_564,
};

export type HoldingChange = {
  ticker: string;
  name: string;
  priorShares: number;
  currentShares: number;
  shareDelta: number;
  shareDeltaPct: number | null;
  notionalDelta: number;
  action: "added" | "exited" | "increased" | "decreased" | "unchanged";
  price: number;
  currentValue: number;
};

export function computeThirteenFChanges(
  holdings: Array<{
    ticker: string;
    name: string;
    shares: number;
    price: number;
    value: number;
    source: string;
  }>,
  prior: Record<string, number> = PRIOR_13F_SHARES,
): HoldingChange[] {
  const current = holdings.filter((h) => h.source === "13F");
  const seen = new Set<string>();
  const out: HoldingChange[] = [];

  for (const h of current) {
    seen.add(h.ticker);
    const priorShares = prior[h.ticker] ?? 0;
    const shareDelta = h.shares - priorShares;
    const action: HoldingChange["action"] =
      priorShares === 0
        ? "added"
        : shareDelta === 0
          ? "unchanged"
          : shareDelta > 0
            ? "increased"
            : "decreased";
    out.push({
      ticker: h.ticker,
      name: h.name,
      priorShares,
      currentShares: h.shares,
      shareDelta,
      shareDeltaPct: priorShares ? shareDelta / priorShares : null,
      notionalDelta: shareDelta * h.price,
      action,
      price: h.price,
      currentValue: h.value,
    });
  }

  for (const [ticker, priorShares] of Object.entries(prior)) {
    if (seen.has(ticker)) continue;
    out.push({
      ticker,
      name: ticker,
      priorShares,
      currentShares: 0,
      shareDelta: -priorShares,
      shareDeltaPct: -1,
      notionalDelta: 0,
      action: "exited",
      price: 0,
      currentValue: 0,
    });
  }

  return out.sort((a, b) => Math.abs(b.notionalDelta) - Math.abs(a.notionalDelta));
}
