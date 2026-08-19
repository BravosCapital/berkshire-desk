import type { ThirteenFLine } from "./types";

function local(block: string, name: string): string {
  const re = new RegExp(
    `<(?:[\\w.-]+:)?${name}>([^<]*)</(?:[\\w.-]+:)?${name}>`,
    "i",
  );
  return block.match(re)?.[1]?.trim() ?? "";
}

function num(raw: string): number {
  const n = Number(String(raw).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Parse an SEC 13F information table. Values are USD (post-2023 convention). */
export function parse13FTable(xml: string): ThirteenFLine[] {
  const blocks = xml.match(/<(?:[\w.-]+:)?infoTable\b[\s\S]*?<\/(?:[\w.-]+:)?infoTable>/gi) ?? [];
  const byCusip = new Map<string, ThirteenFLine>();

  for (const block of blocks) {
    const cusip = local(block, "cusip").toUpperCase();
    if (!cusip) continue;
    const shares = num(local(block, "sshPrnamt"));
    const reportedValue = num(local(block, "value"));
    const prev = byCusip.get(cusip);
    if (prev) {
      prev.shares += shares;
      prev.reportedValue += reportedValue;
    } else {
      byCusip.set(cusip, {
        cusip,
        name: local(block, "nameOfIssuer") || cusip,
        title: local(block, "titleOfClass"),
        shares,
        reportedValue,
      });
    }
  }

  const rows = [...byCusip.values()];
  const total = rows.reduce((s, r) => s + r.reportedValue, 0);
  // Pre-2023 13F values were in $ thousands. Berkshire's book is hundreds of billions.
  if (total > 0 && total < 10_000_000_000) {
    for (const r of rows) r.reportedValue *= 1000;
  }
  return rows.sort((a, b) => b.reportedValue - a.reportedValue);
}
