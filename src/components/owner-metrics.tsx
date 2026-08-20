import { useMemo } from "react";
import type { Valuation } from "@/lib/valuation/compute";
import { A_PER_B } from "@/lib/valuation/quarterly";
import { computeLookthrough } from "@/lib/valuation/lookthrough";
import { formatPerB } from "@/lib/valuation/format";

export function OwnerMetrics({ v }: { v: Valuation }) {
  const bEq = v.classA * A_PER_B + v.classB;

  const look = useMemo(() => {
    const opsAfterTax = v.opsGroups.reduce(
      (s, g) => s + g.group.afterTaxAnnualizedM * 1_000_000,
      0,
    );
    return computeLookthrough({
      holdings: v.holdings,
      usdJpy: v.usdJpy,
      opsAfterTaxUsd: opsAfterTax,
      insuranceUwAfterTaxUsd: v.insuranceRunRate,
    });
  }, [v]);

  const cashPerB = bEq > 0 ? v.cashPreferred / bEq : 0;
  const floatPerB = bEq > 0 ? v.float / bEq : 0;
  const bookPerB = bEq > 0 ? v.bookEquity / bEq : 0;
  const ltPerB = bEq > 0 ? look.totalLookthrough / bEq : 0;

  const cells = [
    { k: "Cash / B", v: formatPerB(cashPerB), hint: "I&O cash + T-bills net" },
    { k: "Float / B", v: formatPerB(floatPerB), hint: "Not deducted from IV" },
    { k: "Book / B", v: formatPerB(bookPerB), hint: "Shareholders’ equity" },
    { k: "Look-through / B", v: formatPerB(ltPerB), hint: "Annualised after-tax" },
    { k: "IV / B", v: formatPerB(v.ivPerB), hint: "Desk estimate" },
    { k: "Market / B", v: formatPerB(v.priceB), hint: "Live mark" },
  ] as const;

  return (
    <section className="print:hidden">
      <p className="mb-2 text-kicker uppercase text-faint">Owner metrics · per Class B</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cells.map((c) => (
          <div
            key={c.k}
            className="rounded-xl bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
          >
            <p className="text-kicker uppercase text-faint">{c.k}</p>
            <p className="mt-1 font-mono text-lg tabular tracking-tight text-fg">{c.v}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">{c.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
