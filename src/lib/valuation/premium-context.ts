/**
 * Where today's premium/discount sits vs the reconstructed quarterly history.
 */

import { IV_HISTORY, type HistoryPoint } from "@/lib/valuation/history";

export type PremiumContext = {
  current: number;
  min: number;
  max: number;
  median: number;
  /** 0 = cheapest (most discount), 1 = richest (most premium) in the series */
  percentile: number;
  n: number;
  label: string;
};

export function computePremiumContext(
  livePremium: number,
  history: HistoryPoint[] = IV_HISTORY,
): PremiumContext {
  const samples = history
    .filter((p) => p.note !== "live" && Number.isFinite(p.premiumPct) && p.ivPerB > 0)
    .map((p) => p.premiumPct);

  const all = [...samples, livePremium].filter(Number.isFinite).sort((a, b) => a - b);
  const n = all.length;
  const min = all[0] ?? livePremium;
  const max = all[n - 1] ?? livePremium;
  const median = n ? all[Math.floor((n - 1) / 2)] : livePremium;

  let rank = 0;
  for (const v of all) {
    if (v < livePremium) rank += 1;
    else break;
  }
  const percentile = n > 1 ? rank / (n - 1) : 0.5;

  let label: string;
  if (percentile <= 0.2) {
    label = "near the cheapest levels in the reconstructed history";
  } else if (percentile <= 0.4) {
    label = "cheaper than typical in the reconstructed history";
  } else if (percentile <= 0.6) {
    label = "around the middle of the reconstructed history";
  } else if (percentile <= 0.8) {
    label = "richer than typical in the reconstructed history";
  } else {
    label = "near the richest levels in the reconstructed history";
  }

  return { current: livePremium, min, max, median, percentile, n, label };
}
