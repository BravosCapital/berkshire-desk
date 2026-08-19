import {
  A_EQUIVALENT,
  A_PER_B,
  BOOK_EQUITY_M,
  CAPITAL,
  CASH_PREFERRED_M,
  CLASS_A_SHARES,
  CLASS_B_SHARES,
  DEFAULT_INSURANCE_MULTIPLE,
  DEFAULT_MULTIPLE,
  EQUITY_METHOD_RESIDUAL_M,
  FIXED_MATURITY_M,
  OPS,
  OXY_PREFERRED_M,
  OXY_WARRANTS,
  SEGMENT_DEFAULTS,
  TOTAL_LIABILITIES_M,
} from "./quarterly";
import { JAPAN_HOLDINGS, US_HOLDINGS, type HoldingSource } from "./holdings";
import { OP_GROUPS, type OpGroup } from "./ops";
import type { DeskSnapshot, SnapshotHolding } from "@/lib/filings/types";

export type Quote = {
  price: number;
  prevClose: number;
  currency: string;
};

export type MarkedHolding = {
  ticker: string;
  yahoo: string;
  name: string;
  shares: number;
  sector: string;
  source: HoldingSource | "13F" | "Japan" | "Warrant";
  price: number;
  prevClose: number;
  currency: string;
  value: number;
  prevValue: number;
  change: number;
  changePct: number;
  weight: number;
  ownershipPct?: number;
  live: boolean;
  mapped: boolean;
};

export type OpsMode = "blended" | "segment";

export type SegmentMultiples = {
  bnsf: number;
  bhe: number;
  industrial: number;
  building: number;
  consumer: number;
  service: number;
  retailing: number;
  pilot: number;
  mclane: number;
};

export type ValuedOpGroup = {
  group: OpGroup;
  multiple: number;
  runRate: number;
  value: number;
};

export type Valuation = {
  holdings: MarkedHolding[];
  publicUs: number;
  publicJapan: number;
  publicTotal: number;
  oxyWarrants: number;
  cashPreferred: number;
  cashGross: number;
  fixedMaturity: number;
  equityMethodResidual: number;
  oxyPreferred: number;
  otherInvestments: number;
  investments: number;
  opsBnsf: number;
  opsBhe: number;
  opsMsr: number;
  opsGroups: ValuedOpGroup[];
  operating: number;
  insurance: number;
  insuranceRunRate: number;
  insuranceMultiple: number;
  multiple: number;
  mode: OpsMode;
  segmentMultiples: SegmentMultiples;
  pretaxRunRate: number;
  parentDebt: number;
  bnsfDebt: number;
  bheDebt: number;
  bhfcDebt: number;
  liabilities: number;
  float: number;
  deferredTax: number;
  bookEquity: number;
  grossAssets: number;
  intrinsicValue: number;
  aEquivalent: number;
  classA: number;
  classB: number;
  ivPerA: number;
  ivPerB: number;
  ivPerBAt10: number;
  ivPerBAt12: number;
  ivPerBAt15: number;
  ivPerBAt18: number;
  priceA: number;
  priceB: number;
  prevPriceA: number;
  prevPriceB: number;
  premiumB: number;
  premiumA: number;
  marketCap: number;
  usdJpy: number;
  live: boolean;
};

const M = 1_000_000;

function ivFromOperating(
  investments: number,
  operating: number,
  insurance: number,
  parentDebt: number,
  bEquivalent: number,
) {
  const iv = investments + operating + insurance - parentDebt;
  return bEquivalent ? iv / bEquivalent : 0;
}

export function computeValuation(opts: {
  quotes: Record<string, Quote>;
  multiple?: number;
  mode?: OpsMode;
  segmentMultiples?: SegmentMultiples;
  insuranceMultiple?: number;
  live?: boolean;
  liveSymbols?: string[];
  snapshot?: DeskSnapshot | null;
}): Valuation {
  const multiple = opts.multiple ?? DEFAULT_MULTIPLE;
  const mode = opts.mode ?? "blended";
  const segment = opts.segmentMultiples ?? { ...SEGMENT_DEFAULTS };
  const insuranceMultiple = opts.insuranceMultiple ?? DEFAULT_INSURANCE_MULTIPLE;
  const q = opts.quotes;
  const snap = opts.snapshot;
  const liveSet = new Set(opts.liveSymbols ?? []);

  const usdJpy = q["USDJPY=X"]?.price || 159.044;

  const usRows: SnapshotHolding[] = snap?.holdings?.length
    ? snap.holdings
    : US_HOLDINGS.map((h) => ({
        cusip: "",
        ticker: h.ticker,
        yahoo: h.yahoo,
        name: h.name,
        shares: h.shares,
        sector: h.sector,
        reportedValue: h.reportedValue,
        mapped: true,
        fallbackPrice: h.fallbackPrice,
        fallbackPrev: h.fallbackPrev,
      }));

  const usMarked: MarkedHolding[] = usRows.map((h) => {
    const quote = h.yahoo ? q[h.yahoo] : undefined;
    const live = Boolean(h.yahoo && liveSet.has(h.yahoo) && quote);
    const price = quote?.price ?? h.fallbackPrice;
    const prevClose = quote?.prevClose ?? h.fallbackPrev;
    const value = h.yahoo && quote ? h.shares * price : h.shares * price || h.reportedValue;
    const prevValue = h.shares * prevClose || h.reportedValue;
    return {
      ticker: h.ticker,
      yahoo: h.yahoo,
      name: h.name,
      shares: h.shares,
      sector: h.sector,
      source: "13F",
      price,
      prevClose,
      currency: "USD",
      value,
      prevValue,
      change: value - prevValue,
      changePct: prevClose ? (price - prevClose) / prevClose : 0,
      weight: 0,
      live,
      mapped: h.mapped,
    };
  });

  const japanSrc = snap?.japan?.length ? snap.japan : JAPAN_HOLDINGS;
  const jpMarked: MarkedHolding[] = japanSrc.map((h) => {
    const fallback = JAPAN_HOLDINGS.find((j) => j.yahoo === h.yahoo);
    const quote = q[h.yahoo];
    const yen = quote?.price ?? fallback?.fallbackPrice ?? 0;
    const prevYen = quote?.prevClose ?? fallback?.fallbackPrev ?? yen;
    const price = usdJpy ? yen / usdJpy : 0;
    const prevClose = usdJpy ? prevYen / usdJpy : 0;
    const value = h.shares * price;
    const prevValue = h.shares * prevClose;
    return {
      ticker: h.ticker,
      yahoo: h.yahoo,
      name: h.name,
      shares: h.shares,
      sector: "Trading houses",
      source: "Japan",
      price: yen,
      prevClose: prevYen,
      currency: "JPY",
      value,
      prevValue,
      change: value - prevValue,
      changePct: prevYen ? (yen - prevYen) / prevYen : 0,
      weight: 0,
      ownershipPct: h.ownershipPct,
      live: liveSet.has(h.yahoo),
      mapped: true,
    };
  });

  const oxyPx = q.OXY?.price ?? 59.8;
  const oxyPrev = q.OXY?.prevClose ?? 59.06;
  const warrantValue = OXY_WARRANTS.shares * Math.max(0, oxyPx - OXY_WARRANTS.strike);
  const warrantPrev = OXY_WARRANTS.shares * Math.max(0, oxyPrev - OXY_WARRANTS.strike);
  const warrantRow: MarkedHolding = {
    ticker: "OXY ws",
    yahoo: "OXY",
    name: "Occidental warrants",
    shares: OXY_WARRANTS.shares,
    sector: "Energy",
    source: "Warrant",
    price: Math.max(0, oxyPx - OXY_WARRANTS.strike),
    prevClose: Math.max(0, oxyPrev - OXY_WARRANTS.strike),
    currency: "USD",
    value: warrantValue,
    prevValue: warrantPrev,
    change: warrantValue - warrantPrev,
    changePct: 0,
    weight: 0,
    live: liveSet.has("OXY"),
    mapped: true,
  };

  const publicUs = usMarked.reduce((s, h) => s + h.value, 0);
  const publicJapan = jpMarked.reduce((s, h) => s + h.value, 0);
  const publicTotal = publicUs + publicJapan + warrantValue;

  const holdings = [...usMarked, ...jpMarked, warrantRow]
    .map((h) => ({ ...h, weight: publicTotal ? h.value / publicTotal : 0 }))
    .sort((a, b) => b.value - a.value);

  const cashPreferred = (snap?.cashPreferredM ?? CASH_PREFERRED_M) * M;
  const fixedMaturity = (snap?.fixedMaturityM ?? FIXED_MATURITY_M) * M;
  const equityMethodResidual = (snap?.equityMethodResidualM ?? EQUITY_METHOD_RESIDUAL_M) * M;
  const oxyPreferred = (snap?.oxyPreferredM ?? OXY_PREFERRED_M) * M;
  const otherInvestments = fixedMaturity + equityMethodResidual + oxyPreferred;
  const investments = publicTotal + cashPreferred + otherInvestments;

  const opsGroups: ValuedOpGroup[] = OP_GROUPS.map((group) => {
    const key = group.id as keyof SegmentMultiples;
    const over = snap?.ops.groups[key];
    const pretaxM = over?.pretaxAnnualizedM ?? group.pretaxAnnualizedM;
    const afterTaxM = over?.afterTaxAnnualizedM ?? group.afterTaxAnnualizedM;
    const mult = segment[key];
    const runRate = (group.basis === "afterTax" ? afterTaxM : pretaxM) * M;
    const g: OpGroup = { ...group, pretaxAnnualizedM: pretaxM, afterTaxAnnualizedM: afterTaxM };
    return { group: g, multiple: mult, runRate, value: runRate * mult };
  });

  const opsBnsf = opsGroups.find((g) => g.group.id === "bnsf")?.value ?? 0;
  const opsBhe = opsGroups.find((g) => g.group.id === "bhe")?.value ?? 0;
  const opsMsr = opsGroups
    .filter((g) => g.group.id !== "bnsf" && g.group.id !== "bhe")
    .reduce((s, g) => s + g.value, 0);

  const pretaxRunRate = (snap?.ops.blendedPretaxM ?? OPS.blendedPretaxAnnualizedM) * M;
  const operating =
    mode === "blended" ? pretaxRunRate * multiple : opsBnsf + opsBhe + opsMsr;

  const uwAfterTax = (snap?.ops.insuranceUwAfterTaxM ?? OPS.insuranceUnderwritingAfterTaxAnnualizedM) * M;
  const insurance = uwAfterTax * insuranceMultiple;

  const parentDebt = (snap?.parentDebtM ?? CAPITAL.parentDebtM) * M;
  const bnsfDebt = (snap?.bnsfDebtM ?? CAPITAL.bnsfDebtM) * M;
  const bheDebt = (snap?.bheDebtM ?? CAPITAL.bheDebtM) * M;
  const bhfcDebt = (snap?.bhfcDebtM ?? CAPITAL.bhfcDebtM) * M;
  const liabilities = (snap?.totalLiabilitiesM ?? TOTAL_LIABILITIES_M) * M;
  const float = (snap?.floatM ?? CAPITAL.floatM) * M;
  const deferredTax = (snap?.deferredTaxM ?? CAPITAL.deferredTaxM) * M;
  const bookEquity = (snap?.bookEquityM ?? BOOK_EQUITY_M) * M;

  const grossAssets = investments + operating + insurance;
  const intrinsicValue = grossAssets - parentDebt;

  const classA = snap?.classA ?? CLASS_A_SHARES;
  const classB = snap?.classB ?? CLASS_B_SHARES;
  // One Class A = 1,500 Class B. Per-B IV is total IV divided by B-equivalents,
  // never by A-equivalents (that bug labeled ~$840 as a Class B price).
  const aEquivalent = classA + classB / A_PER_B;
  const bEquivalent = classA * A_PER_B + classB;
  const ivPerB = bEquivalent ? intrinsicValue / bEquivalent : 0;
  const ivPerA = ivPerB * A_PER_B;

  const ivPerBAt10 = ivFromOperating(investments, pretaxRunRate * 10, insurance, parentDebt, bEquivalent);
  const ivPerBAt12 = ivFromOperating(investments, pretaxRunRate * 12, insurance, parentDebt, bEquivalent);
  const ivPerBAt15 = ivFromOperating(investments, pretaxRunRate * 15, insurance, parentDebt, bEquivalent);
  const ivPerBAt18 = ivFromOperating(investments, pretaxRunRate * 18, insurance, parentDebt, bEquivalent);

  const priceA = q["BRK-A"]?.price ?? 753_600;
  const priceB = q["BRK-B"]?.price ?? 502.96;
  const prevPriceA = q["BRK-A"]?.prevClose ?? 775_000;
  const prevPriceB = q["BRK-B"]?.prevClose ?? 516.38;

  const premiumB = ivPerB ? (priceB - ivPerB) / ivPerB : 0;
  const premiumA = ivPerA ? (priceA - ivPerA) / ivPerA : 0;
  const marketCap = priceB * bEquivalent;

  return {
    holdings,
    publicUs,
    publicJapan,
    publicTotal,
    oxyWarrants: warrantValue,
    cashPreferred,
    cashGross: cashPreferred,
    fixedMaturity,
    equityMethodResidual,
    oxyPreferred,
    otherInvestments,
    investments,
    opsBnsf,
    opsBhe,
    opsMsr,
    opsGroups,
    operating,
    insurance,
    insuranceRunRate: uwAfterTax,
    insuranceMultiple,
    multiple,
    mode,
    segmentMultiples: segment,
    pretaxRunRate,
    parentDebt,
    bnsfDebt,
    bheDebt,
    bhfcDebt,
    liabilities,
    float,
    deferredTax,
    bookEquity,
    grossAssets,
    intrinsicValue,
    aEquivalent,
    classA,
    classB,
    ivPerA,
    ivPerB,
    ivPerBAt10,
    ivPerBAt12,
    ivPerBAt15,
    ivPerBAt18,
    priceA,
    priceB,
    prevPriceA,
    prevPriceB,
    premiumB,
    premiumA,
    marketCap,
    usdJpy,
    live: opts.live ?? false,
  };
}

export const SHARE_COUNT = {
  classA: CLASS_A_SHARES,
  classB: CLASS_B_SHARES,
  aEquivalent: A_EQUIVALENT,
  aPerB: A_PER_B,
};
