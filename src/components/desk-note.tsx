import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { MarkedHolding } from "@/lib/valuation/compute";
import {
  computeThirteenFChanges,
  PRIOR_13F_PERIOD,
  type HoldingChange,
} from "@/lib/valuation/prior-13f";
import { buildFilingCalendar } from "@/lib/valuation/filing-calendar";
import { formatBillions, formatDateLabel, formatPct, formatShares } from "@/lib/valuation/format";
import { cn } from "@/lib/utils";

const MATERIAL_NOTIONAL = 250_000_000; // $250m at daily marks

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

  const material = useMemo(
    () =>
      changes.filter(
        (c) =>
          c.action !== "unchanged" &&
          (Math.abs(c.notionalDelta) >= MATERIAL_NOTIONAL ||
            c.action === "added" ||
            c.action === "exited"),
      ),
    [changes],
  );

  const buys = material
    .filter((c) => c.action === "added" || c.action === "increased")
    .slice(0, 4);
  const sells = material
    .filter((c) => c.action === "decreased" || c.action === "exited")
    .slice(0, 4);

  const netNotional = useMemo(
    () => material.reduce((s, c) => s + c.notionalDelta, 0),
    [material],
  );

  const periodLabel = calendar.latest13FPeriod
    ? formatDateLabel(calendar.latest13FPeriod)
    : PRIOR_13F_PERIOD.label;

  const filedLabel = calendar.latest13FFiled
    ? formatDateLabel(calendar.latest13FFiled)
    : formatDateLabel(PRIOR_13F_PERIOD.filed);

  const daysSinceFiled = useMemo(() => {
    const filed = calendar.latest13FFiled;
    if (!filed) return null;
    const [y, m, d] = filed.split("-").map(Number);
    if (!y || !m || !d) return null;
    const then = Date.UTC(y, m - 1, d);
    const now = Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
    );
    return Math.max(0, Math.round((now - then) / 86_400_000));
  }, [calendar.latest13FFiled]);

  const takeaway = useMemo(
    () => buildTakeaway({ buys, sells, netNotional, cashPreferred, material }),
    [buys, sells, netNotional, cashPreferred, material],
  );

  return (
    <section className="rounded-xl border border-border/70 bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6 print:hidden">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-kicker uppercase text-faint">Post-13F desk note</p>
          <h2 className="mt-1 font-display text-lg font-medium tracking-tight">
            What moved · period ended {periodLabel}
          </h2>
          <p className="mt-1 text-xs text-muted">
            Filed {filedLabel}
            {daysSinceFiled != null ? ` · ${daysSinceFiled}d ago` : ""} · vs{" "}
            {PRIOR_13F_PERIOD.label}
          </p>
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

      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{takeaway}</p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span>
          Material moves (≥{formatBillions(MATERIAL_NOTIONAL)} notional or new/exit):{" "}
          <span className="font-mono tabular text-fg">{material.length}</span>
        </span>
        <span>
          Net notional (adds − cuts):{" "}
          <span
            className={cn(
              "font-mono tabular",
              netNotional > 0 ? "text-gain" : netNotional < 0 ? "text-loss" : "text-fg",
            )}
          >
            {formatBillions(netNotional)}
          </span>
        </span>
        <span>
          I&O cash: <span className="font-mono tabular text-fg">{formatBillions(cashPreferred)}</span>
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Movers title="Largest adds / increases" rows={buys} tone="gain" />
        <Movers title="Largest cuts / exits" rows={sells} tone="loss" />
      </div>

      <p className="mt-4 text-xs text-muted">
        Notional uses daily session marks × Δ shares — not 13F period-end prices. Full change log on{" "}
        <Link to="/equities" className="text-fg underline-offset-2 hover:underline">
          Equities
        </Link>
        .
      </p>
    </section>
  );
}

function buildTakeaway({
  buys,
  sells,
  netNotional,
  cashPreferred,
  material,
}: {
  buys: HoldingChange[];
  sells: HoldingChange[];
  netNotional: number;
  cashPreferred: number;
  material: HoldingChange[];
}): string {
  if (material.length === 0) {
    return `Quiet book versus ${PRIOR_13F_PERIOD.label}: no material share changes above the desk threshold. Attention stays on I&O cash at ${formatBillions(cashPreferred)} and the private operating column — not on trading the public portfolio.`;
  }

  const topBuy = buys[0];
  const topSell = sells[0];
  const parts: string[] = [];

  if (topBuy) {
    parts.push(
      `Largest add was ${topBuy.ticker} (${topBuy.action}, ${formatShares(Math.abs(topBuy.shareDelta))} shares, ~${formatBillions(topBuy.notionalDelta)} at daily marks)`,
    );
  }
  if (topSell) {
    parts.push(
      `largest cut was ${topSell.ticker} (${topSell.action}, ${formatShares(Math.abs(topSell.shareDelta))} shares, ~${formatBillions(topSell.notionalDelta)})`,
    );
  }

  const lead =
    parts.length > 0
      ? `${parts.join("; ")}.`
      : `Several positions moved versus ${PRIOR_13F_PERIOD.label}.`;

  const netLine =
    Math.abs(netNotional) >= MATERIAL_NOTIONAL
      ? ` Net notional into the public book was ${formatBillions(netNotional)} (desk marks × share delta).`
      : ` Net notional was small relative to the book (${formatBillions(netNotional)}).`;

  const cashLine = ` I&O cash remains ${formatBillions(cashPreferred)} — for owners, the residual capital story still sits as much in cash and private ops as in any single ticker.`;

  return lead + netLine + cashLine;
}

function Movers({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: HoldingChange[];
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
      <ul className="mt-2 space-y-2.5">
        {rows.map((r) => (
          <li key={r.ticker} className="text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span>
                <span className="font-medium text-fg">{r.ticker}</span>
                <span className="ml-2 text-xs capitalize text-muted">{r.action}</span>
              </span>
              <span
                className={cn(
                  "font-mono text-xs tabular",
                  tone === "gain" ? "text-gain" : "text-loss",
                )}
              >
                {formatBillions(r.notionalDelta)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {formatShares(r.priorShares)} → {formatShares(r.currentShares)}
              {r.shareDeltaPct != null ? (
                <>
                  {" · "}
                  <span className="font-mono tabular">{formatPct(r.shareDeltaPct)}</span> shares
                </>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
