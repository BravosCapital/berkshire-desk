/**
 * Seed 13F share counts (Q2 2026, filed Aug 14 2026) and Japanese ownership.
 * Live value = shares × current price. The 13F table is auto-pulled from EDGAR
 * and overrides these share counts; this file is the cold-start fallback and
 * the CUSIP fallback prices. Japan ownership % is still seeded.
 *
 * FALLBACK_AS_OF must be bumped whenever fallbackPrice / fallbackPrev are
 * refreshed. UI surfaces this date when the live feed is down.
 */

export const FALLBACK_AS_OF = "2026-08-20";

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
  { ticker: "AAPL", yahoo: "AAPL", name: "Apple Inc.", shares: 227_917_808, sector: "Technology", source: "13F", reportedValue: 65_950_296_000, fallbackPrice: 314.87, fallbackPrev: 316.83 },
  { ticker: "AXP", yahoo: "AXP", name: "American Express", shares: 151_610_700, sector: "Financials", source: "13F", reportedValue: 51_282_319_000, fallbackPrice: 331.7, fallbackPrev: 339.9 },
  { ticker: "KO", yahoo: "KO", name: "Coca-Cola Co.", shares: 400_000_000, sector: "Consumer", source: "13F", reportedValue: 32_507_999_000, fallbackPrice: 91.1, fallbackPrev: 90.35 },
  { ticker: "GOOGL", yahoo: "GOOGL", name: "Alphabet Inc. Class A", shares: 78_791_167, sector: "Technology", source: "13F", reportedValue: 28_157_600_000, fallbackPrice: 340.2, fallbackPrev: 344.72 },
  { ticker: "BAC", yahoo: "BAC", name: "Bank of America", shares: 483_394_015, sector: "Financials", source: "13F", reportedValue: 27_543_792_000, fallbackPrice: 62.35, fallbackPrev: 63.17 },
  { ticker: "CVX", yahoo: "CVX", name: "Chevron Corp.", shares: 84_375_856, sector: "Energy", source: "13F", reportedValue: 13_986_142_000, fallbackPrice: 206.58, fallbackPrev: 205.76 },
  { ticker: "OXY", yahoo: "OXY", name: "Occidental Petroleum", shares: 264_941_431, sector: "Energy", source: "13F", reportedValue: 12_868_205_000, fallbackPrice: 61.42, fallbackPrev: 60.09 },
  { ticker: "CB", yahoo: "CB", name: "Chubb Ltd.", shares: 34_249_183, sector: "Financials", source: "13F", reportedValue: 11_670_067_000, fallbackPrice: 343.23, fallbackPrev: 340.92 },
  { ticker: "MCO", yahoo: "MCO", name: "Moody's Corp.", shares: 24_669_778, sector: "Financials", source: "13F", reportedValue: 11_173_436_000, fallbackPrice: 497.86, fallbackPrev: 497.03 },
  { ticker: "GOOG", yahoo: "GOOG", name: "Alphabet Inc. Class C", shares: 27_188_433, sector: "Technology", source: "13F", reportedValue: 9_606_489_000, fallbackPrice: 337.68, fallbackPrev: 341.7 },
  { ticker: "KHC", yahoo: "KHC", name: "Kraft Heinz Co.", shares: 325_634_818, sector: "Consumer", source: "13F", reportedValue: 7_691_494_000, fallbackPrice: 25.53, fallbackPrev: 25.68 },
  { ticker: "DVA", yahoo: "DVA", name: "DaVita Inc.", shares: 28_880_209, sector: "Healthcare", source: "13F", reportedValue: 6_425_269_000, fallbackPrice: 176.23, fallbackPrev: 177.27 },
  { ticker: "DAL", yahoo: "DAL", name: "Delta Air Lines", shares: 57_320_000, sector: "Industrials", source: "13F", reportedValue: 5_368_591_000, fallbackPrice: 80.73, fallbackPrev: 83.29 },
  { ticker: "SIRI", yahoo: "SIRI", name: "SiriusXM Holdings", shares: 124_807_117, sector: "Media", source: "13F", reportedValue: 3_686_803_000, fallbackPrice: 28.5, fallbackPrev: 28.67 },
  { ticker: "VRSN", yahoo: "VRSN", name: "VeriSign Inc.", shares: 8_989_880, sector: "Technology", source: "13F", reportedValue: 2_261_495_000, fallbackPrice: 277.73, fallbackPrev: 273.03 },
  { ticker: "KR", yahoo: "KR", name: "Kroger Co.", shares: 39_000_000, sector: "Consumer", source: "13F", reportedValue: 2_165_671_000, fallbackPrice: 56.21, fallbackPrev: 56.27 },
  { ticker: "ALLY", yahoo: "ALLY", name: "Ally Financial", shares: 27_000_000, sector: "Financials", source: "13F", reportedValue: 1_240_650_000, fallbackPrice: 42.54, fallbackPrev: 43.11 },
  { ticker: "LEN", yahoo: "LEN", name: "Lennar Corp. Class A", shares: 13_111_741, sector: "Housing", source: "13F", reportedValue: 1_186_482_000, fallbackPrice: 86.25, fallbackPrev: 87.3 },
  { ticker: "LLYVK", yahoo: "LLYVK", name: "Liberty Live Series C", shares: 10_587_143, sector: "Media", source: "13F", reportedValue: 1_118_425_000, fallbackPrice: 105.54, fallbackPrev: 106.84 },
  { ticker: "NYT", yahoo: "NYT", name: "New York Times Class A", shares: 15_700_000, sector: "Media", source: "13F", reportedValue: 1_098_686_000, fallbackPrice: 65.39, fallbackPrev: 65.96 },
  { ticker: "COF", yahoo: "COF", name: "Capital One Financial", shares: 3_000_000, sector: "Financials", source: "13F", reportedValue: 601_860_000, fallbackPrice: 214.55, fallbackPrev: 220.73 },
  { ticker: "LLYVA", yahoo: "LLYVA", name: "Liberty Live Series A", shares: 4_986_588, sector: "Media", source: "13F", reportedValue: 504_942_000, fallbackPrice: 102.32, fallbackPrev: 103.46 },
  { ticker: "LPX", yahoo: "LPX", name: "Louisiana-Pacific", shares: 5_664_793, sector: "Industrials", source: "13F", reportedValue: 445_593_000, fallbackPrice: 74.12, fallbackPrev: 75.99 },
  { ticker: "NUE", yahoo: "NUE", name: "Nucor Corp.", shares: 1_857_752, sector: "Industrials", source: "13F", reportedValue: 413_814_000, fallbackPrice: 241.82, fallbackPrev: 248.74 },
  { ticker: "M", yahoo: "M", name: "Macy's Inc.", shares: 7_347_426, sector: "Consumer", source: "13F", reportedValue: 173_031_000, fallbackPrice: 22.68, fallbackPrev: 23.4 },
  { ticker: "NVR", yahoo: "NVR", name: "NVR Inc.", shares: 11_112, sector: "Housing", source: "13F", reportedValue: 75_711_000, fallbackPrice: 6331.08, fallbackPrev: 6418.86 },
  { ticker: "LEN.B", yahoo: "LEN-B", name: "Lennar Corp. Class B", shares: 298_117, sector: "Housing", source: "13F", reportedValue: 26_446_000, fallbackPrice: 84.83, fallbackPrev: 85.87 },
  { ticker: "JEF", yahoo: "JEF", name: "Jefferies Financial", shares: 433_558, sector: "Financials", source: "13F", reportedValue: 21_669_000, fallbackPrice: 51.93, fallbackPrev: 53.55 },
  { ticker: "DHI", yahoo: "DHI", name: "D.R. Horton", shares: 3_564, sector: "Housing", source: "13F", reportedValue: 581_000, fallbackPrice: 148.99, fallbackPrev: 151.86 },
];

export const JAPAN_HOLDINGS: JapanHolding[] = [
  { ticker: "8058.T", yahoo: "8058.T", name: "Mitsubishi Corporation", shares: 445_000_000, ownershipPct: 11.06, ownershipAsOf: "2026-04-30", source: "Japan", fallbackPrice: 4696, fallbackPrev: 4778 },
  { ticker: "8031.T", yahoo: "8031.T", name: "Mitsui & Co.", shares: 310_100_000, ownershipPct: 10.83, ownershipAsOf: "2026-07-01", source: "Japan", fallbackPrice: 4774, fallbackPrev: 4873 },
  { ticker: "8001.T", yahoo: "8001.T", name: "Itochu Corporation", shares: 806_000_000, ownershipPct: 10.2, ownershipAsOf: "2026-05-07", source: "Japan", fallbackPrice: 2004, fallbackPrev: 2000.5 },
  { ticker: "8002.T", yahoo: "8002.T", name: "Marubeni Corporation", shares: 175_400_000, ownershipPct: 10.32, ownershipAsOf: "2026-07-01", source: "Japan", fallbackPrice: 4856, fallbackPrev: 4938 },
  { ticker: "8053.T", yahoo: "8053.T", name: "Sumitomo Corporation", shares: 622_000_000, ownershipPct: 10.2, ownershipAsOf: "2026-05-07", source: "Japan", fallbackPrice: 1701.5, fallbackPrev: 1757.5 },
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
  "BRK-A": { price: 748_600, prevClose: 750_170, currency: "USD" },
  "BRK-B": { price: 497.88, prevClose: 499.62, currency: "USD" },
  "USDJPY=X": { price: 159.15, prevClose: 159.55, currency: "JPY" },
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
