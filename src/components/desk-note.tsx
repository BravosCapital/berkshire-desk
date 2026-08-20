import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { MarkedHolding } from "@/lib/valuation/compute";
import { computeThirteenFChanges, PRIOR_13F_PERIOD } from "@/lib/valuation/prior-13f";
import { buildFilingCalendar } from "@/lib/valuation/filing-calendar";
import { formatBillions, formatDateLabel } from "@/lib/valuation/format";
import { cn } from "@/lib/utils";

export function DeskNote({
  holdings,
  cashPreferred,
  thirteenFFiled,
  thirteenFPeriod,
  tenQFiled,
  tenQPeriod,
}: {
  holdings: MarkedHolding[];
  cashPreferred: number;
  thirteenFFiled?: string;
  thirteenFPeriod?: string;
  tenQFiled?: string;
  tenQPeriod?: string;
}) {
  const changes = useMemo(() => computeThirteenFChanges(holdings), [holdings]);
  const calendar = useMemo(
    () =>
      buildFilingCalendar({
        thirteenFFiled,
        thirteenFPeriod,
        tenQFiled,
        tenQPeriod,
      }),
    [thirteenFFiled, thirteenFPeriod, tenQFiled, tenQPeriod],
  );

  const buys = changes
    .filter((c) => c.action === "added" || c.action === "increased")
    .slice(0, 3);
  const sells = changes
    .filter((c) => c.action === "decreased" || c.action === "exited")
    .slice(0, 3);

  const periodLabel = calendar.latest13FPeriod
    ? formatDateLabel(calendar.latest13FPeriod)
    : PRIOR_13F_PERIOD.label;

  return (
    <section className="rounded-xl border border-border/70 bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6 print:hidden">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-kicker uppercase text-faint">Quarterly desk note</p>
          <h2 className="mt-1 font-display text-lg font-medium tracking-tight">
            What moved · 13F period {periodLabel}
          </h2>
        </div>
        <div className="rounded-lg bg-surface-2 px-3 py-2 text-xs leading-snug text-muted">
          <p className="font-medium text-fg">Filing calendar</p>
          <p className="mt-0.5">
            13F filed {formatDateLabel(calendar.latest13FFiled)} · 10-Q filed{" "}
            {formatDateLabel(calendar.latest10QFiled)}
          </p>
          <p className="mt-0.5">
            Next window {calendar.next13FLabel} (period ending{" "}
            {formatDateLabel(calendar.nextPeriodEnd)})
          </p>
        </div>
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
        QoQ share changes vs {PRIOR_13F_PERIOD.label}. Notional is live price × Δ shares — not
        period-end marks. I&O cash sits at {formatBillions(cashPreferred)}. Full change log on{" "}
        <Link to="/equities" className="text-fg underline-offset-2 hover:underline">
          Equities
        </Link>
        .
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Movers title="Largest adds / increases" rows={buys} tone="gain" />
        <Movers title="Largest cuts / exits" rows={sells} tone="loss" />
      </div>
    </section>
  );
}

function Movers({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: Array<{ ticker: string; name: string; action: string; notionalDelta: number }>;
  tone: "gain" | "loss";
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg bg-surface-2 px-4 py-3 text-sm text-muted">
        <p className="text-kicker uppercase text-faint">{title}</p>
        <p className="mt-2">No material moves in this direction.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-surface-2 px-4 py-3">
      <p className="text-kicker uppercase text-faint">{title}</p>
      <ul className="mt-2 space-y-2">
        {rows.map((r) => (
          <li key={r.ticker} className="flex items-baseline justify-between gap-3 text-sm">
            <span>
              <span className="font-medium text-fg">{r.ticker}</span>
              <span className="ml-2 hidden text-xs capitalize text-muted sm:inline">{r.action}</span>
            </span>
            <span
              className={cn(
                "font-mono text-xs tabular",
                tone === "gain" ? "text-gain" : "text-loss",
              )}
            >
              {formatBillions(r.notionalDelta)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
