/**
 * Client-side daily IV snapshots so the history chart becomes a real series
 * after the desk has been open a few weeks. One point per UTC day.
 */

export type DailySnapshot = {
  date: string;
  priceB: number;
  ivPerB: number;
  cashB: number;
  premiumPct: number;
  marketCapB: number;
  publicB: number;
};

const KEY = "brk-desk-daily-snapshots";
const MAX = 400;

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadSnapshots(): DailySnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DailySnapshot[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p) => p && typeof p.date === "string" && typeof p.ivPerB === "number");
  } catch {
    return [];
  }
}

export function recordSnapshot(
  point: Omit<DailySnapshot, "date"> & { date?: string },
): DailySnapshot[] {
  if (typeof window === "undefined") return [];
  const date = point.date ?? todayUtc();
  const existing = loadSnapshots();
  const next = existing.filter((p) => p.date !== date);
  next.push({
    date,
    priceB: point.priceB,
    ivPerB: point.ivPerB,
    cashB: point.cashB,
    premiumPct: point.premiumPct,
    marketCapB: point.marketCapB,
    publicB: point.publicB,
  });
  next.sort((a, b) => a.date.localeCompare(b.date));
  const trimmed = next.slice(-MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* quota */
  }
  return trimmed;
}
