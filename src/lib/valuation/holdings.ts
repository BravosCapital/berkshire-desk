/**
 * Seed 13F share counts (Q2 2026, filed Aug 14 2026) and Japanese ownership.
 * Live value = shares × current price. The 13F table is auto-pulled from EDGAR
 * and overrides these share counts; this file is the cold-start fallback and
 * the CUSIP fallback prices. Japan ownership % is still seeded.
 *
 * FALLBACK_AS_OF must be bumped whenever fallbackPrice / fallbackPrev are
 * refreshed. Prefer public/marks/daily.json for durable daily marks; these
 * seeds are last-resort only.
 */

export const FALLBACK_AS_OF = "2026-08-21";

export type HoldingSource = "13F" | "Japan" | "Warrant";

export type UsHolding = {
  ticker: string;
  yahoo: string;
  name: string;
  shares: number;
  sector: string;
  source: HoldingSource;
  reportedValue: number;
  fallbackPrice: number;
  fallbackPrev: number;
};

export type JapanHolding = {
  ticker: string;
  yahoo: string;
  name: string;
  shares: number;
  ownershipPct: number;
  ownershipAsOf: string;
  source: HoldingSource;
  fallbackPrice: number;
  fallbackPrev: number;
};

export const US_HOLDINGS: UsHolding[] = [
  { ticker: "AAPL", yahoo: "AAPL", name: "Apple Inc.", shares: 227_917_808, sector: "Technology", source: "13F", reportedValue: 65_950_296_000, fallbackPrice: 308.69, fallbackPrev: 311.3 },
  { ticker: "AXP", yahoo: "AXP", name: "American Express", shares: 151_610_700, sector: "Financials", source: "13F", reportedValue: 51_282_319_000, fallbackPrice: 334.75, fallbackPrev: 331.15 },
  { ticker: "KO", yahoo: "KO", name: "Coca-Cola Co.", shares: 400_000_000, sector: "Consumer", source: "13F", reportedValue: 32_507_999_000, fallbackPrice: 90.85, fallbackPrev: 90.5 },
  { ticker: "GOOGL", yahoo: "GOOGL", name: "Alphabet Inc. Class A", shares: 78_791_167, sector: "Technology", source: "13F", reportedValue: 28_157_600_000, fallbackPrice: 345.24, fallbackPrev: 340.67 },
  { ticker: "BAC", yahoo: "BAC", name: "Bank of America", shares: 483_394_015, sector: "Financials", source: "13F", reportedValue: 27_543_792_000, fallbackPrice: 61.79, fallbackPrev: 61.86 },
  { ticker: "CVX", yahoo: "CVX", name: "Chevron Corp.", shares: 84_375_856, sector: "Energy", source: "13F", reportedValue: 13_986_142_000, fallbackPrice: 205.81, fallbackPrev: 205.77 },
  { ticker: "OXY", yahoo: "OXY", name: "Occidental Petroleum", shares: 264_941_431, sector: "Energy", source: "13F", reportedValue: 12_868_205_000, fallbackPrice: 61.53, fallbackPrev: 61.52 },
  { ticker: "CB", yahoo: "CB", name: "Chubb Ltd.", shares: 34_249_183, sector: "Financials", source: "13F", reportedValue: 11_670_067_000, fallbackPrice: 341.28, fallbackPrev: 342.87 },
  { ticker: "MCO", yahoo: "MCO", name: "Moody's Corp.", shares: 24_669_778, sector: "Financials", source: "13F", reportedValue: 11_173_436_000, fallbackPrice: 502.92, fallbackPrev: 498.77 },
  { ticker: "GOOG", yahoo: "GOOG", name: "Alphabet Inc. Class C", shares: 27_188_433, sector: "Technology", source: "13F", reportedValue: 9_606_489_000, fallbackPrice: 342.23, fallbackPrev: 338.2 },
  { ticker: "KHC", yahoo: "KHC", name: "Kraft Heinz Co.", shares: 325_634_818, sector: "Consumer", source: "13F", reportedValue: 7_691_494_000, fallbackPrice: 25.56, fallbackPrev: 25.57 },
  { ticker: "DVA", yahoo: "DVA", name: "DaVita Inc.", shares: 28_880_209, sector: "Healthcare", source: "13F", reportedValue: 6_425_269_000, fallbackPrice: 174.91, fallbackPrev: 175.24 },
  { ticker: "DAL", yahoo: "DAL", name: "Delta Air Lines", shares: 57_320_000, sector: "Industrials", source: "13F", reportedValue: 5_368_591_000, fallbackPrice: 82.36, fallbackPrev: 81.06 },
  { ticker: "SIRI", yahoo: "SIRI", name: "SiriusXM Holdings", shares: 124_807_117, sector: "Media", source: "13F", reportedValue: 3_686_803_000, fallbackPrice: 28.67, fallbackPrev: 28.39 },
  { ticker: "VRSN", yahoo: "VRSN", name: "VeriSign Inc.", shares: 8_989_880, sector: "Technology", source: "13F", reportedValue: 2_261_495_000, fallbackPrice: 279.22, fallbackPrev: 276.9 },
  { ticker: "KR", yahoo: "KR", name: "Kroger Co.", shares: 39_000_000, sector: "Consumer", source: "13F", reportedValue: 2_165_671_000, fallbackPrice: 57.78, fallbackPrev: 56.32 },
  { ticker: "ALLY", yahoo: "ALLY", name: "Ally Financial", shares: 27_000_000, sector: "Financials", source: "13F", reportedValue: 1_240_650_000, fallbackPrice: 42.68, fallbackPrev: 42.29 },
  { ticker: "LEN", yahoo: "LEN", name: "Lennar Corp. Class A", shares: 13_111_741, sector: "Housing", source: "13F", reportedValue: 1_186_482_000, fallbackPrice: 86.79, fallbackPrev: 85.42 },
  { ticker: "LLYVK", yahoo: "LLYVK", name: "Liberty Live Series C", shares: 10_587_143, sector: "Media", source: "13F", reportedValue: 1_118_425_000, fallbackPrice: 105.17, fallbackPrev: 105.45 },
  { ticker: "NYT", yahoo: "NYT", name: "New York Times Class A", shares: 15_700_000, sector: "Media", source: "13F", reportedValue: 1_098_686_000, fallbackPrice: 65.76, fallbackPrev: 65.3 },
  { ticker: "COF", yahoo: "COF", name: "Capital One Financial", shares: 3_000_000, sector: "Financials", source: "13F", reportedValue: 601_860_000, fallbackPrice: 217.35, fallbackPrev: 212.48 },
  { ticker: "LLYVA", yahoo: "LLYVA", name: "Liberty Live Series A", shares: 4_986_588, sector: "Media", source: "13F", reportedValue: 504_942_000, fallbackPrice: 101.69, fallbackPrev: 101.9 },
  { ticker: "LPX", yahoo: "LPX", name: "Louisiana-Pacific", shares: 5_664_793, sector: "Industrials", source: "13F", reportedValue: 445_593_000, fallbackPrice: 74.06, fallbackPrev: 73.75 },
  { ticker: "NUE", yahoo: "NUE", name: "Nucor Corp.", shares: 1_857_752, sector: "Industrials", source: "13F", reportedValue: 413_814_000, fallbackPrice: 242.29, fallbackPrev: 240.48 },
  { ticker: "M", yahoo: "M", name: "Macy's Inc.", shares: 7_347_426, sector: "Consumer", source: "13F", reportedValue: 173_031_000, fallbackPrice: 22.64, fallbackPrev: 22.58 },
  { ticker: "NVR", yahoo: "NVR", name: "NVR Inc.", shares: 11_112, sector: "Housing", source: "13F", reportedValue: 75_711_000, fallbackPrice: 6375.64, fallbackPrev: 6300 },
  { ticker: "LEN.B", yahoo: "LEN-B", name: "Lennar Corp. Class B", shares: 298_117, sector: "Housing", source: "13F", reportedValue: 26_446_000, fallbackPrice: 85.11, fallbackPrev: 83.84 },
  { ticker: "JEF", yahoo: "JEF", name: "Jefferies Financial", shares: 433_558, sector: "Financials", source: "13F", reportedValue: 21_669_000, fallbackPrice: 52.44, fallbackPrev: 51.78 },
  { ticker: "DHI", yahoo: "DHI", name: "D.R. Horton", shares: 3_564, sector: "Housing", source: "13F", reportedValue: 581_000, fallbackPrice: 148.64, fallbackPrev: 147.33 },
];

export const JAPAN_HOLDINGS: JapanHolding[] = [
  { ticker: "8058.T", yahoo: "8058.T", name: "Mitsubishi Corporation", shares: 445_000_000, ownershipPct: 11.06, ownershipAsOf: "2026-04-30", source: "Japan", fallbackPrice: 4696, fallbackPrev: 4648 },
  { ticker: "8031.T", yahoo: "8031.T", name: "Mitsui & Co.", shares: 310_100_000, ownershipPct: 10.83, ownershipAsOf: "2026-07-01", source: "Japan", fallbackPrice: 4774, fallbackPrev: 4779 },
  { ticker: "8001.T", yahoo: "8001.T", name: "Itochu Corporation", shares: 806_000_000, ownershipPct: 10.2, ownershipAsOf: "2026-05-07", source: "Japan", fallbackPrice: 2004, fallbackPrev: 1977 },
  { ticker: "8002.T", yahoo: "8002.T", name: "Marubeni Corporation", shares: 175_400_000, ownershipPct: 10.32, ownershipAsOf: "2026-07-01", source: "Japan", fallbackPrice: 4856, fallbackPrev: 4796 },
  { ticker: "8053.T", yahoo: "8053.T", name: "Sumitomo Corporation", shares: 622_000_000, ownershipPct: 10.2, ownershipAsOf: "2026-05-07", source: "Japan", fallbackPrice: 1701.5, fallbackPrev: 1678 },
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
  "BRK-A": { price: 746_631, prevClose: 744_600, currency: "USD" },
  "BRK-B": { price: 497.63, prevClose: 496.86, currency: "USD" },
  "USDJPY=X": { price: 159.04, prevClose: 158.28, currency: "JPY" },
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
