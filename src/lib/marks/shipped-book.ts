/**
 * Durable daily session-close book shipped with the app.
 * Used when Yahoo/Stooq fail on serverless. Refresh with public/marks/daily.json.
 * marksAsOf: 2026-08-21
 */

export type ShippedQuote = {
  price: number;
  prevClose: number;
  currency: string;
  source: "yahoo";
  asOf: string;
  symbol: string;
};

export const SHIPPED_MARKS_AS_OF = "2026-08-21";

export const SHIPPED_QUOTES: Record<string, ShippedQuote> = {
  "BRK-A": { price: 746630.81, prevClose: 744600, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "BRK-A" },
  "BRK-B": { price: 497.625, prevClose: 496.86, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "BRK-B" },
  "USDJPY=X": { price: 159.038, prevClose: 158.276, currency: "JPY", source: "yahoo", asOf: "2026-08-21", symbol: "USDJPY=X" },
  AAPL: { price: 308.69, prevClose: 311.3, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "AAPL" },
  AXP: { price: 334.745, prevClose: 331.15, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "AXP" },
  KO: { price: 90.845, prevClose: 90.5, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "KO" },
  GOOGL: { price: 345.24, prevClose: 340.67, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "GOOGL" },
  BAC: { price: 61.79, prevClose: 61.86, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "BAC" },
  CVX: { price: 205.81, prevClose: 205.77, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "CVX" },
  OXY: { price: 61.53, prevClose: 61.52, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "OXY" },
  CB: { price: 341.28, prevClose: 342.87, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "CB" },
  MCO: { price: 502.92, prevClose: 498.77, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "MCO" },
  GOOG: { price: 342.23, prevClose: 338.2, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "GOOG" },
  KHC: { price: 25.555, prevClose: 25.57, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "KHC" },
  DVA: { price: 174.91, prevClose: 175.24, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "DVA" },
  DAL: { price: 82.355, prevClose: 81.06, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "DAL" },
  SIRI: { price: 28.665, prevClose: 28.39, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "SIRI" },
  VRSN: { price: 279.22, prevClose: 276.9, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "VRSN" },
  KR: { price: 57.78, prevClose: 56.32, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "KR" },
  ALLY: { price: 42.675, prevClose: 42.29, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "ALLY" },
  LEN: { price: 86.785, prevClose: 85.42, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "LEN" },
  LLYVK: { price: 105.165, prevClose: 105.45, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "LLYVK" },
  NYT: { price: 65.76, prevClose: 65.3, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "NYT" },
  COF: { price: 217.35, prevClose: 212.48, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "COF" },
  LLYVA: { price: 101.69, prevClose: 101.9, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "LLYVA" },
  LPX: { price: 74.055, prevClose: 73.75, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "LPX" },
  NUE: { price: 242.285, prevClose: 240.48, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "NUE" },
  M: { price: 22.635, prevClose: 22.58, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "M" },
  NVR: { price: 6375.64, prevClose: 6300, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "NVR" },
  "LEN-B": { price: 85.11, prevClose: 83.84, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "LEN-B" },
  JEF: { price: 52.435, prevClose: 51.78, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "JEF" },
  DHI: { price: 148.64, prevClose: 147.33, currency: "USD", source: "yahoo", asOf: "2026-08-21", symbol: "DHI" },
  "8058.T": { price: 4696, prevClose: 4648, currency: "JPY", source: "yahoo", asOf: "2026-08-20", symbol: "8058.T" },
  "8031.T": { price: 4774, prevClose: 4779, currency: "JPY", source: "yahoo", asOf: "2026-08-20", symbol: "8031.T" },
  "8001.T": { price: 2004, prevClose: 1977, currency: "JPY", source: "yahoo", asOf: "2026-08-20", symbol: "8001.T" },
  "8002.T": { price: 4856, prevClose: 4796, currency: "JPY", source: "yahoo", asOf: "2026-08-20", symbol: "8002.T" },
  "8053.T": { price: 1701.5, prevClose: 1678, currency: "JPY", source: "yahoo", asOf: "2026-08-20", symbol: "8053.T" },
};
