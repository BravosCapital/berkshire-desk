/**
 * Scenario helpers on top of a base Valuation:
 * - implied operating multiple the market is paying
 * - cash deployment (buybacks vs equities vs leave in T-bills)
 * - earnings x multiple sensitivity grid
 */

import type { Valuation } from "./compute";
import { A_PER_B } from "./quarterly";

export type ImpliedMultiple = {
  residualOpsValue: number;
  pretaxRunRate: number;
  impliedMultiple: number | null;
  residualShareOfIv: number;
};

/**
 * Market cap - (public equities + cash + other investments + insurance franchise - parent debt)
 * leaves the residual the market is paying for non-insurance operating businesses.
 * Divide by pretax run-rate -> implied multiple.
 */
export function computeImpliedMultiple(v: Valuation): ImpliedMultiple {
  const residualOpsValue =
    v.marketCap - (v.publicTotal + v.cashPreferred + v.otherInvestments + v.insurance - v.parentDebt);
  const pretax = v.pretaxRunRate;
  const impliedMultiple = pretax > 0 ? residualOpsValue / pretax : null;
  return {
    residualOpsValue,
    pretaxRunRate: pretax,
    impliedMultiple,
    residualShareOfIv: v.intrinsicValue ? residualOpsValue / v.intrinsicValue : 0,
  };
}

export type CashDeployInput = {
  buybackB: number;
  equitiesB: number;
};

export type CashDeployResult = {
  buybackUsd: number;
  equitiesUsd: number;
  cashLeft: number;
  sharesRetiredB: number;
  bEquivalentAfter: number;
  investmentsAfter: number;
  intrinsicValueAfter: number;
  ivPerBAfter: number;
  premiumAfter: number;
  marketCapAfter: number;
};

/**
 * Deploy I&O cash into buybacks and/or public equities.
 * Buybacks retire B-equivalent shares at the live BRK.B price.
 * Equity purchases are a cash->stocks swap inside investments.
 */
export function computeCashDeploy(v: Valuation, input: CashDeployInput): CashDeployResult {
  const buybackUsd = Math.max(0, Math.min(input.buybackB, v.cashPreferred / 1e9)) * 1e9;
  const remainingAfterBuyback = v.cashPreferred - buybackUsd;
  const equitiesUsd = Math.max(0, Math.min(input.equitiesB, remainingAfterBuyback / 1e9)) * 1e9;
  const cashLeft = v.cashPreferred - buybackUsd - equitiesUsd;

  const priceB = v.priceB || 1;
  const sharesRetiredB = buybackUsd / priceB;
  const bEquivalentAfter = Math.max(0, v.classA * A_PER_B + v.classB - sharesRetiredB);

  const investmentsAfter = v.investments - buybackUsd;
  const intrinsicValueAfter = investmentsAfter + v.operating + v.insurance - v.parentDebt;
  const ivPerBAfter = bEquivalentAfter ? intrinsicValueAfter / bEquivalentAfter : 0;
  const marketCapAfter = priceB * bEquivalentAfter;
  const premiumAfter = ivPerBAfter ? (priceB - ivPerBAfter) / ivPerBAfter : 0;

  return {
    buybackUsd,
    equitiesUsd,
    cashLeft,
    sharesRetiredB,
    bEquivalentAfter,
    investmentsAfter,
    intrinsicValueAfter,
    ivPerBAfter,
    premiumAfter,
    marketCapAfter,
  };
}

export type SensitivityCell = {
  earningsShock: number;
  multiple: number;
  ivPerB: number;
  premium: number;
};

/** Grid of IV/B under earnings shocks and multiples. */
export function computeSensitivityGrid(
  v: Valuation,
  shocks = [-0.2, -0.1, 0, 0.1],
  multiples = [12, 15, 18],
): SensitivityCell[] {
  const bEq = v.classA * A_PER_B + v.classB;
  const cells: SensitivityCell[] = [];
  for (const shock of shocks) {
    for (const mult of multiples) {
      const ops = v.pretaxRunRate * (1 + shock) * mult;
      const iv = v.investments + ops + v.insurance - v.parentDebt;
      const ivPerB = bEq ? iv / bEq : 0;
      const premium = ivPerB ? (v.priceB - ivPerB) / ivPerB : 0;
      cells.push({ earningsShock: shock, multiple: mult, ivPerB, premium });
    }
  }
  return cells;
}
