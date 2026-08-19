/**
 * Reconstructed quarterly history of estimated IV per BRK.B vs market price.
 *
 * IV is the two-column method used on the live desk: Insurance & Other cash +
 * public equities + other investments + capitalized non-insurance ops +
 * insurance underwriting franchise − parent-level bonds.
 *
 * Pre-2026 points are reconstructed from period-end cash, then-prevailing
 * marks, and a constant 15× pretax / 8× underwriting policy so the series
 * is comparable to the live estimate. They are not a re-run of each 10-Q.
 * Market prices are month-end closes from Yahoo Finance.
 */

export type HistoryPoint = {
  date: string;
  label: string;
  priceB: number;
  ivPerB: number;
  cashB: number;
  premiumPct: number;
  note?: string;
};

export const IV_HISTORY: HistoryPoint[] = [
  { date: "2023-03-31", label: "Q1'23", priceB: 308.77, ivPerB: 348, cashB: 131, premiumPct: (308.77 - 348) / 348 },
  { date: "2023-06-30", label: "Q2'23", priceB: 341.0, ivPerB: 368, cashB: 147, premiumPct: (341.0 - 368) / 368 },
  { date: "2023-09-30", label: "Q3'23", priceB: 350.3, ivPerB: 384, cashB: 157, premiumPct: (350.3 - 384) / 384 },
  { date: "2023-12-31", label: "Q4'23", priceB: 356.66, ivPerB: 402, cashB: 168, premiumPct: (356.66 - 402) / 402 },
  { date: "2024-03-31", label: "Q1'24", priceB: 420.52, ivPerB: 438, cashB: 189, premiumPct: (420.52 - 438) / 438 },
  { date: "2024-06-30", label: "Q2'24", priceB: 406.8, ivPerB: 512, cashB: 277, premiumPct: (406.8 - 512) / 512 },
  { date: "2024-09-30", label: "Q3'24", priceB: 460.26, ivPerB: 548, cashB: 325, premiumPct: (460.26 - 548) / 548 },
  { date: "2024-12-31", label: "Q4'24", priceB: 453.28, ivPerB: 558, cashB: 334, premiumPct: (453.28 - 558) / 558 },
  { date: "2025-03-31", label: "Q1'25", priceB: 532.58, ivPerB: 572, cashB: 348, premiumPct: (532.58 - 572) / 572 },
  { date: "2025-06-30", label: "Q2'25", priceB: 485.77, ivPerB: 568, cashB: 344, premiumPct: (485.77 - 568) / 568 },
  { date: "2025-09-30", label: "Q3'25", priceB: 502.74, ivPerB: 592, cashB: 382, premiumPct: (502.74 - 592) / 592 },
  { date: "2025-12-31", label: "Q4'25", priceB: 502.65, ivPerB: 586, cashB: 373, premiumPct: (502.65 - 586) / 586 },
  { date: "2026-03-31", label: "Q1'26", priceB: 479.2, ivPerB: 604, cashB: 397, premiumPct: (479.2 - 604) / 604 },
  { date: "2026-06-30", label: "Q2'26", priceB: 500.39, ivPerB: 0, cashB: 359.2, premiumPct: 0, note: "live" },
];

export const CASH_HISTORY = IV_HISTORY.map((p) => ({
  date: p.date,
  label: p.label,
  cashB: p.cashB,
}));

export function withLiveIv(
  history: HistoryPoint[],
  liveIvPerB: number,
  livePriceB: number,
): HistoryPoint[] {
  return history.map((p) =>
    p.note === "live"
      ? {
          ...p,
          ivPerB: liveIvPerB,
          priceB: livePriceB,
          premiumPct: liveIvPerB ? (livePriceB - liveIvPerB) / liveIvPerB : 0,
        }
      : p,
  );
}
