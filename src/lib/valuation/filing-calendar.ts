/**
 * Rough filing calendar for Berkshire. 13F-HR is due 45 days after quarter-end;
 * 10-Q typically arrives a few days earlier in the same window. Windows are
 * approximate — use for orientation, not a hard deadline.
 */

import { FILING } from "./quarterly";
import { formatDateLabel } from "./format";

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

function toIso(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Next calendar quarter-end strictly after the given period end. */
export function nextQuarterEnd(periodEndIso: string): string {
  const y = Number(periodEndIso.slice(0, 4));
  const ends = [
    `${y}-03-31`,
    `${y}-06-30`,
    `${y}-09-30`,
    `${y}-12-31`,
    `${y + 1}-03-31`,
  ];
  for (const e of ends) {
    if (e > periodEndIso) return e;
  }
  return `${y + 1}-03-31`;
}

/** ~45 calendar days after period end — typical 13F window midpoint. */
export function approxFilingWindow(periodEndIso: string): {
  periodEnd: string;
  windowStart: string;
  windowEnd: string;
  label: string;
} {
  const end = parseIso(periodEndIso);
  const mid = new Date(end);
  mid.setUTCDate(mid.getUTCDate() + 45);
  const start = new Date(mid);
  start.setUTCDate(start.getUTCDate() - 7);
  const finish = new Date(mid);
  finish.setUTCDate(finish.getUTCDate() + 7);

  const month = mid.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return {
    periodEnd: periodEndIso,
    windowStart: toIso(start),
    windowEnd: toIso(finish),
    label: `~mid-${month}`,
  };
}

export type FilingCalendar = {
  latest13FFiled: string;
  latest13FPeriod: string;
  latest10QFiled: string;
  latest10QPeriod: string;
  nextPeriodEnd: string;
  next13FLabel: string;
  next10QLabel: string;
  summary: string;
};

export function buildFilingCalendar(opts?: {
  thirteenFFiled?: string;
  thirteenFPeriod?: string;
  tenQFiled?: string;
  tenQPeriod?: string;
}): FilingCalendar {
  const latest13FFiled = opts?.thirteenFFiled ?? FILING.thirteenFFiled;
  const latest13FPeriod = opts?.thirteenFPeriod ?? FILING.thirteenFPeriod;
  const latest10QFiled = opts?.tenQFiled ?? FILING.tenQFiled;
  const latest10QPeriod = opts?.tenQPeriod ?? FILING.periodEnd;

  const nextPeriodEnd = nextQuarterEnd(latest13FPeriod);
  const window = approxFilingWindow(nextPeriodEnd);

  return {
    latest13FFiled,
    latest13FPeriod,
    latest10QFiled,
    latest10QPeriod,
    nextPeriodEnd,
    next13FLabel: window.label,
    next10QLabel: window.label,
    summary: `Latest 13F filed ${formatDateLabel(latest13FFiled)} · next window ${window.label}`,
  };
}
