/**
 * Client-side "since you last visited" snapshot.
 * Stores the last meaningful desk view so return visits can show deltas.
 */

export type VisitSnapshot = {
  ts: number;
  priceB: number;
  ivPerB: number;
  cashB: number;
  premiumPct: number;
  marketCapB: number;
};

const KEY = "brk-desk-last-visit";

export function loadLastVisit(): VisitSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as VisitSnapshot;
    if (!p || typeof p.ts !== "number" || typeof p.priceB !== "number") return null;
    return p;
  } catch {
    return null;
  }
}

export function saveVisit(point: Omit<VisitSnapshot, "ts"> & { ts?: number }): void {
  if (typeof window === "undefined") return;
  try {
    const next: VisitSnapshot = {
      ts: point.ts ?? Date.now(),
      priceB: point.priceB,
      ivPerB: point.ivPerB,
      cashB: point.cashB,
      premiumPct: point.premiumPct,
      marketCapB: point.marketCapB,
    };
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export type VisitDelta = {
  hoursAgo: number;
  priceChg: number;
  ivChg: number;
  cashChgB: number;
  premiumChg: number;
  prev: VisitSnapshot;
};

/** Returns null if no prior visit, or if the visit was < 30 minutes ago (noise). */
export function computeVisitDelta(current: Omit<VisitSnapshot, "ts">): VisitDelta | null {
  const prev = loadLastVisit();
  if (!prev) return null;
  const hoursAgo = (Date.now() - prev.ts) / 3_600_000;
  if (hoursAgo < 0.5) return null;
  return {
    hoursAgo,
    priceChg: prev.priceB ? (current.priceB - prev.priceB) / prev.priceB : 0,
    ivChg: prev.ivPerB ? (current.ivPerB - prev.ivPerB) / prev.ivPerB : 0,
    cashChgB: current.cashB - prev.cashB,
    premiumChg: current.premiumPct - prev.premiumPct,
    prev,
  };
}

export function formatHoursAgo(hours: number): string {
  if (hours < 24) {
    const h = Math.max(1, Math.round(hours));
    return `${h}h ago`;
  }
  const d = Math.round(hours / 24);
  if (d === 1) return "yesterday";
  if (d < 14) return `${d}d ago`;
  const w = Math.round(d / 7);
  return `${w}w ago`;
}
