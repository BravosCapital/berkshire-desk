import { computeThirteenFChanges, PRIOR_13F_PERIOD } from "@/lib/valuation/prior-13f";
import type { MarkedHolding } from "@/lib/valuation/compute";
import { formatBillions, formatPct, formatShares } from "@/lib/valuation/format";
import { cn } from "@/lib/utils";

const ACTION_TONE: Record<string, string> = {
  added: "text-gain",
  increased: "text-gain",
  decreased: "text-loss",
  exited: "text-loss",
  unchanged: "text-muted",
};

export function ThirteenFChanges({ holdings }: { holdings: MarkedHolding[] }) {
  const changes = computeThirteenFChanges(holdings);
  const material = changes.filter((c) => c.action !== "unchanged" || Math.abs(c.notionalDelta) > 50_000_000);
  const shown = material.slice(0, 40);

  const netNotional = changes.reduce((s, c) => s + c.notionalDelta, 0);
  const added = changes.filter((c) => c.action === "added").length;
  const exited = changes.filter((c) => c.action === "exited").length;
  const increased = changes.filter((c) => c.action === "increased").length;
  const decreased = changes.filter((c) => c.action === "decreased").length;

  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-medium tracking-tight">13F change log</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            QoQ share delta vs {PRIOR_13F_PERIOD.label} (filed {PRIOR_13F_PERIOD.filed}). Notional uses
            the live price × share change — not period-end marks. Unchanged names under $50m are
            hidden.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-kicker uppercase text-faint">
          <span>+{added} added</span>
          <span>{increased} up</span>
          <span>{decreased} down</span>
          <span>−{exited} exited</span>
        </div>
      </div>

      <p className="mt-3 font-mono text-sm tabular text-muted">
        Net notional of share changes at live prices:{" "}
        <span className={cn(netNotional >= 0 ? "text-gain" : "text-loss")}>
          {formatBillions(netNotional)}
        </span>
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-kicker uppercase text-faint">
              <th className="py-2 pr-3 font-medium">Ticker</th>
              <th className="py-2 pr-3 font-medium">Action</th>
              <th className="py-2 pr-3 font-medium text-right">Prior</th>
              <th className="py-2 pr-3 font-medium text-right">Current</th>
              <th className="py-2 pr-3 font-medium text-right">Δ shares</th>
              <th className="py-2 pr-3 font-medium text-right">Δ %</th>
              <th className="py-2 font-medium text-right">Notional</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.ticker} className="border-b border-border/60 last:border-0">
                <td className="py-2.5 pr-3">
                  <span className="font-medium text-fg">{c.ticker}</span>
                  <span className="ml-2 hidden text-xs text-muted sm:inline">{c.name}</span>
                </td>
                <td className={cn("py-2.5 pr-3 capitalize", ACTION_TONE[c.action])}>{c.action}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs tabular text-muted">
                  {formatShares(c.priorShares)}
                </td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs tabular">
                  {formatShares(c.currentShares)}
                </td>
                <td
                  className={cn(
                    "py-2.5 pr-3 text-right font-mono text-xs tabular",
                    c.shareDelta > 0 ? "text-gain" : c.shareDelta < 0 ? "text-loss" : "text-muted",
                  )}
                >
                  {c.shareDelta > 0 ? "+" : ""}
                  {formatShares(c.shareDelta)}
                </td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs tabular text-muted">
                  {c.shareDeltaPct === null ? "new" : formatPct(c.shareDeltaPct).replace("+", "")}
                </td>
                <td
                  className={cn(
                    "py-2.5 text-right font-mono text-xs tabular",
                    c.notionalDelta > 0 ? "text-gain" : c.notionalDelta < 0 ? "text-loss" : "text-muted",
                  )}
                >
                  {formatBillions(c.notionalDelta)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
