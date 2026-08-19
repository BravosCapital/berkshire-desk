/**
 * Seed 13F share counts (Q2 2026, filed Aug 14 2026) and Japanese ownership.
 * Live value = shares × current price. The 13F table is auto-pulled from EDGAR
 * and overrides these share counts; this file is the cold-start fallback and
 * the CUSIP fallback prices. Japan ownership % is still seeded.
 */

export type HoldingSource = "13F" | "Japan" | "Warrant";

export type UsHolding = {
  ticker: string;
  yahoo: string;
  name: string;
  shares: number;
  sector: string;
  source: HoldingSource;
  /** 13F reported value at Jun 30, 2026 (USD). */
  reportedValue: number;
  fallbackPrice: number;
  fallbackPrev: number;
};

export type JapanHolding = {
  ticker: string;
  yahoo: string;
  name: string;
  /** Berkshire shares held (estimated from latest ownership disclosure). */
  shares: number;
  ownershipPct: number;
  ownershipAsOf: string;
  source: HoldingSource;
  fallbackPrice: number;
  fallbackPrev: number;
};

export const US_HOLDINGS: UsHolding[] = [
  { ticker: "AAPL", yahoo: "AAPL", name: "Apple Inc.", shares: 227_917_808, sector: "Technology", source: "13F", reportedValue: 65_950_296_000, fallbackPrice: 310.03, fallbackPrev: 304.91 },
  { ticker: "AXP", yahoo: "AXP", name: "American Express", shares: 151_610_700, sector: "Financials", source: "13F", reportedValue: 51_282_319_000, fallbackPrice: 338.52, fallbackPrev: 340.81 },
  { ticker: "KO", yahoo: "KO", name: "Coca-Cola Co.", shares: 400_000_000, sector: "Consumer", source: "13F", reportedValue: 32_507_999_000, fallbackPrice: 88.82, fallbackPrev: 86.48 },
  { ticker: "GOOGL", yahoo: "GOOGL", name: "Alphabet Inc. Class A", shares: 78_791_167, sector: "Technology", source: "13F", reportedValue: 28_157_600_000, fallbackPrice: 344.2, fallbackPrev: 343.8 },
  { ticker: "BAC", yahoo: "BAC", name: "Bank of America", shares: 483_394_015, sector: "Financials", source: "13F", reportedValue: 27_543_792_000, fallbackPrice: 64.23, fallbackPrev: 64.0 },
  { ticker: "CVX", yahoo: "CVX", name: "Chevron Corp.", shares: 84_375_856, sector: "Energy", source: "13F", reportedValue: 13_986_142_000, fallbackPrice: 205.74, fallbackPrev: 196.66 },
  { ticker: "OXY", yahoo: "OXY", name: "Occidental Petroleum", shares: 264_941_431, sector: "Energy", source: "13F", reportedValue: 12_868_205_000, fallbackPrice: 59.8, fallbackPrev: 59.06 },
  { ticker: "CB", yahoo: "CB", name: "Chubb Ltd.", shares: 34_249_183, sector: "Financials", source: "13F", reportedValue: 11_670_067_000, fallbackPrice: 345.29, fallbackPrev: 347.07 },
  { ticker: "MCO", yahoo: "MCO", name: "Moody's Corp.", shares: 24_669_778, sector: "Financials", source: "13F", reportedValue: 11_173_436_000, fallbackPrice: 485.79, fallbackPrev: 476.48 },
  { ticker: "GOOG", yahoo: "GOOG", name: "Alphabet Inc. Class C", shares: 27_188_433, sector: "Technology", source: "13F", reportedValue: 9_606_489_000, fallbackPrice: 341.28, fallbackPrev: 343.0 },
  { ticker: "KHC", yahoo: "KHC", name: "Kraft Heinz Co.", shares: 325_634_818, sector: "Consumer", source: "13F", reportedValue: 7_691_494_000, fallbackPrice: 24.82, fallbackPrev: 24.65 },
  { ticker: "DVA", yahoo: "DVA", name: "DaVita Inc.", shares: 28_880_209, sector: "Healthcare", source: "13F", reportedValue: 6_425_269_000, fallbackPrice: 177.91, fallbackPrev: 178.34 },
  { ticker: "DAL", yahoo: "DAL", name: "Delta Air Lines", shares: 57_320_000, sector: "Industrials", source: "13F", reportedValue: 5_368_591_000, fallbackPrice: 85.7, fallbackPrev: 90.41 },
  { ticker: "SIRI", yahoo: "SIRI", name: "SiriusXM Holdings", shares: 124_807_117, sector: "Media", source: "13F", reportedValue: 3_686_803_000, fallbackPrice: 28.62, fallbackPrev: 28.51 },
  { ticker: "VRSN", yahoo: "VRSN", name: "VeriSign Inc.", shares: 8_989_880, sector: "Technology", source: "13F", reportedValue: 2_261_495_000, fallbackPrice: 276.74, fallbackPrev: 287.63 },
  { ticker: "KR", yahoo: "KR", name: "Kroger Co.", shares: 39_000_000, sector: "Consumer", source: "13F", reportedValue: 2_165_671_000, fallbackPrice: 56.34, fallbackPrev: 56.25 },
  { ticker: "ALLY", yahoo: "ALLY", name: "Ally Financial", shares: 27_000_000, sector: "Financials", source: "13F", reportedValue: 1_240_650_000, fallbackPrice: 43.63, fallbackPrev: 43.95 },
  { ticker: "LEN", yahoo: "LEN", name: "Lennar Corp. Class A", shares: 13_111_741, sector: "Housing", source: "13F", reportedValue: 1_186_482_000, fallbackPrice: 84.94, fallbackPrev: 87.55 },
  { ticker: "LLYVK", yahoo: "LLYVK", name: "Liberty Live Series C", shares: 10_587_143, sector: "Media", source: "13F", reportedValue: 1_118_425_000, fallbackPrice: 103.73, fallbackPrev: 104.26 },
  { ticker: "NYT", yahoo: "NYT", name: "New York Times Class A", shares: 15_700_000, sector: "Media", source: "13F", reportedValue: 1_098_686_000, fallbackPrice: 65.07, fallbackPrev: 63.73 },
  { ticker: "COF", yahoo: "COF", name: "Capital One Financial", shares: 3_000_000, sector: "Financials", source: "13F", reportedValue: 601_860_000, fallbackPrice: 221.47, fallbackPrev: 219.15 },
  { ticker: "LLYVA", yahoo: "LLYVA", name: "Liberty Live Series A", shares: 4_986_588, sector: "Media", source: "13F", reportedValue: 504_942_000, fallbackPrice: 100.0, fallbackPrev: 100.53 },
  { ticker: "LPX", yahoo: "LPX", name: "Louisiana-Pacific", shares: 5_664_793, sector: "Industrials", source: "13F", reportedValue: 445_593_000, fallbackPrice: 71.23, fallbackPrev: 75.52 },
  { ticker: "NUE", yahoo: "NUE", name: "Nucor Corp.", shares: 1_857_752, sector: "Industrials", source: "13F", reportedValue: 413_814_000, fallbackPrice: 264.19, fallbackPrev: 271.95 },
  { ticker: "M", yahoo: "M", name: "Macy's Inc.", shares: 7_347_426, sector: "Consumer", source: "13F", reportedValue: 173_031_000, fallbackPrice: 23.23, fallbackPrev: 24.52 },
  { ticker: "NVR", yahoo: "NVR", name: "NVR Inc.", shares: 11_112, sector: "Housing", source: "13F", reportedValue: 75_711_000, fallbackPrice: 6248.37, fallbackPrev: 6429.96 },
  { ticker: "LEN.B", yahoo: "LEN-B", name: "Lennar Corp. Class B", shares: 298_117, sector: "Housing", source: "13F", reportedValue: 26_446_000, fallbackPrice: 83.5, fallbackPrev: 86.2 },
  { ticker: "JEF", yahoo: "JEF", name: "Jefferies Financial", shares: 433_558, sector: "Financials", source: "13F", reportedValue: 21_669_000, fallbackPrice: 53.84, fallbackPrev: 55.0 },
  { ticker: "DHI", yahoo: "DHI", name: "D.R. Horton", shares: 3_564, sector: "Housing", source: "13F", reportedValue: 581_000, fallbackPrice: 145.68, fallbackPrev: 150.79 },
];

/**
 * Japanese sogo shosha. Not in the 13F (non-US). Share counts derived from
 * the latest ownership-percentage disclosures × shares outstanding.
 * Mitsubishi 11.06% (Apr 30 2026); Mitsui 10.83% / Marubeni 10.32% (Jul 2026);
 * Itochu and Sumitomo ~10.2% (all five above 10% as of May 2026).
 */
export const JAPAN_HOLDINGS: JapanHolding[] = [
  { ticker: "8058.T", yahoo: "8058.T", name: "Mitsubishi Corporation", shares: 445_000_000, ownershipPct: 11.06, ownershipAsOf: "2026-04-30", source: "Japan", fallbackPrice: 4648, fallbackPrev: 4832 },
  { ticker: "8031.T", yahoo: "8031.T", name: "Mitsui & Co.", shares: 310_100_000, ownershipPct: 10.83, ownershipAsOf: "2026-07-01", source: "Japan", fallbackPrice: 4779, fallbackPrev: 4894 },
  { ticker: "8001.T", yahoo: "8001.T", name: "Itochu Corporation", shares: 806_000_000, ownershipPct: 10.2, ownershipAsOf: "2026-05-07", source: "Japan", fallbackPrice: 1977, fallbackPrev: 2078 },
  { ticker: "8002.T", yahoo: "8002.T", name: "Marubeni Corporation", shares: 175_400_000, ownershipPct: 10.32, ownershipAsOf: "2026-07-01", source: "Japan", fallbackPrice: 4796, fallbackPrev: 4972 },
  { ticker: "8053.T", yahoo: "8053.T", name: "Sumitomo Corporation", shares: 622_000_000, ownershipPct: 10.2, ownershipAsOf: "2026-05-07", source: "Japan", fallbackPrice: 1678, fallbackPrev: 1779.5 },
];

export const ALL_QUOTE_SYMBOLS = [
  "BRK-A",
  "BRK-B",
  "USDJPY=X",
  ...US_HOLDINGS.map((h) => h.yahoo),
  ...JAPAN_HOLDINGS.map((h) => h.yahoo),
] as const;

export const FALLBACK_QUOTES: Record<
  string,
  { price: number; prevClose: number; currency: string }
> = {
  "BRK-A": { price: 753_600, prevClose: 775_000, currency: "USD" },
  "BRK-B": { price: 502.96, prevClose: 516.38, currency: "USD" },
  "USDJPY=X": { price: 159.044, prevClose: 159.044, currency: "JPY" },
  ...Object.fromEntries(
    US_HOLDINGS.map((h) => [
      h.yahoo,
      { price: h.fallbackPrice, prevClose: h.fallbackPrev, currency: "USD" },
    ]),
  ),
  ...Object.fromEntries(
    JAPAN_HOLDINGS.map((h) => [
      h.yahoo,
      { price: h.fallbackPrice, prevClose: h.fallbackPrev, currency: "JPY" },
    ]),
  ),
};
