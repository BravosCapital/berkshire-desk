/**
 * Look-through earnings: Berkshire's share of the public portfolio's
 * trailing twelve-month net income, plus non-insurance operating after-tax
 * run-rate and insurance underwriting after-tax.
 *
 * EPS figures are seeded TTM estimates (USD per share). Update quarterly
 * alongside the 13F. Japan names use approximate JPY EPS converted at a
 * fixed USDJPY for the seed; live FX is applied at compute time when quotes
 * supply USDJPY.
 */

export type LookthroughLine = {
  ticker: string;
  name: string;
  shares: number;
  epsTtm: number;
  currency: "USD" | "JPY";
  lookthroughUsd: number;
  weight: number;
};

/** TTM EPS (USD unless noted). Seeded for major weights; zero means skip. */
export const EPS_TTM: Record<string, { eps: number; currency: "USD" | "JPY" }> = {
  AAPL: { eps: 7.4, currency: "USD" },
  AXP: { eps: 14.2, currency: "USD" },
  KO: { eps: 2.9, currency: "USD" },
  GOOGL: { eps: 9.5, currency: "USD" },
  GOOG: { eps: 9.5, currency: "USD" },
  BAC: { eps: 3.5, currency: "USD" },
  CVX: { eps: 8.8, currency: "USD" },
  OXY: { eps: 2.6, currency: "USD" },
  CB: { eps: 22.0, currency: "USD" },
  MCO: { eps: 12.5, currency: "USD" },
  KHC: { eps: 2.8, currency: "USD" },
  DVA: { eps: 10.0, currency: "USD" },
  DAL: { eps: 6.5, currency: "USD" },
  SIRI: { eps: 1.2, currency: "USD" },
  VRSN: { eps: 8.5, currency: "USD" },
  KR: { eps: 4.2, currency: "USD" },
  ALLY: { eps: 3.8, currency: "USD" },
  LEN: { eps: 12.0, currency: "USD" },
  NYT: { eps: 1.8, currency: "USD" },
  COF: { eps: 16.0, currency: "USD" },
  "8058.T": { eps: 420, currency: "JPY" },
  "8031.T": { eps: 380, currency: "JPY" },
  "8001.T": { eps: 210, currency: "JPY" },
  "8002.T": { eps: 350, currency: "JPY" },
  "8053.T": { eps: 180, currency: "JPY" },
};

export function computeLookthrough(opts: {
  holdings: Array<{
    ticker: string;
    yahoo: string;
    name: string;
    shares: number;
    source: string;
  }>;
  usdJpy: number;
  opsAfterTaxUsd: number;
  insuranceUwAfterTaxUsd: number;
}): {
  lines: LookthroughLine[];
  publicLookthrough: number;
  opsAfterTax: number;
  insuranceUw: number;
  totalLookthrough: number;
} {
  const lines: LookthroughLine[] = [];
  let publicLookthrough = 0;

  for (const h of opts.holdings) {
    if (h.source === "Warrant") continue;
    const key = h.ticker in EPS_TTM ? h.ticker : h.yahoo in EPS_TTM ? h.yahoo : null;
    if (!key) continue;
    const row = EPS_TTM[key];
    if (!row || !row.eps) continue;
    const epsUsd = row.currency === "JPY" ? row.eps / (opts.usdJpy || 150) : row.eps;
    const lookthroughUsd = h.shares * epsUsd;
    publicLookthrough += lookthroughUsd;
    lines.push({
      ticker: h.ticker,
      name: h.name,
      shares: h.shares,
      epsTtm: row.eps,
      currency: row.currency,
      lookthroughUsd,
      weight: 0,
    });
  }

  lines.sort((a, b) => b.lookthroughUsd - a.lookthroughUsd);
  for (const line of lines) {
    line.weight = publicLookthrough ? line.lookthroughUsd / publicLookthrough : 0;
  }

  const total = publicLookthrough + opts.opsAfterTaxUsd + opts.insuranceUwAfterTaxUsd;

  return {
    lines,
    publicLookthrough,
    opsAfterTax: opts.opsAfterTaxUsd,
    insuranceUw: opts.insuranceUwAfterTaxUsd,
    totalLookthrough: total,
  };
}
