import { useEffect, useState } from "react";
import {
  computeVisitDelta,
  formatHoursAgo,
  saveVisit,
  type VisitDelta,
} from "@/lib/valuation/visit-delta";
import { formatBillions, formatPct } from "@/lib/valuation/format";
import { cn } from "@/lib/utils";

type Props = {
  priceB: number;
  ivPerB: number;
  cashB: number;
  premiumPct: number;
  marketCapB: number;
};

export function VisitDeltaStrip({ priceB, ivPerB, cashB, premiumPct, marketCapB }: Props) {
  const [delta, setDelta] = useState<VisitDelta | null>(null);

  useEffect(() => {
    if (!priceB || !ivPerB) return;
    const current = {
      priceB,
      ivPerB,
      cashB,
      premiumPct,
      marketCapB,
    };
    const d = computeVisitDelta(current);
    setDelta(d);
    // Always refresh the stored visit so the next return has a baseline
    saveVisit(current);
  }, [priceB, ivPerB, cashB, premiumPct, marketCapB]);

  if (!delta) return null;

  const chips: { label: string; value: string; tone?: "gain" | "loss" }[] = [
    {
      label: "Price",
      value: formatPct(delta.priceChg),
      tone: delta.priceChg >= 0 ? "gain" : "loss",
    },
    {
      label: "IV",
      value: formatPct(delta.ivChg),
      tone: delta.ivChg >= 0 ? "gain" : "loss",
    },
    {
      label: "Cash",
      value:
        Math.abs(delta.cashChgB) < 0.05
          ? "unch."
          : `${delta.cashChgB > 0 ? "+" : "−"}${formatBillions(Math.abs(delta.cashChgB) * 1e9)}`,
    },
    {
      label: "Premium",
      value: formatPct(delta.premiumChg),
      tone: delta.premiumChg <= 0 ? "gain" : "loss",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border/80 bg-surface-2/80 px-4 py-2.5 text-xs print:hidden">
      <span className="text-kicker uppercase text-faint">
        Since last visit · {formatHoursAgo(delta.hoursAgo)}
      </span>
      {chips.map((c) => (
        <span key={c.label} className="inline-flex items-baseline gap-1.5">
          <span className="text-muted">{c.label}</span>
          <span
            className={cn(
              "font-mono tabular",
              c.tone === "gain" && "text-gain",
              c.tone === "loss" && "text-loss",
            )}
          >
            {c.value}
          </span>
        </span>
      ))}
    </div>
  );
}
