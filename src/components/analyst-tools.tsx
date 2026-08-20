import { useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { useTrackerStore } from "@/lib/store";
import type { Valuation } from "@/lib/valuation/compute";
import {
  computeCashDeploy,
  computeImpliedMultiple,
  computeSensitivityGrid,
} from "@/lib/valuation/scenarios";
import { computeLookthrough } from "@/lib/valuation/lookthrough";
import { formatBillions, formatMultiple, formatPerB, formatPct } from "@/lib/valuation/format";
import { cn } from "@/lib/utils";

export function AnalystTools({ v }: { v: Valuation }) {
  const cashBuybackB = useTrackerStore((s) => s.cashBuybackB);
  const setCashBuybackB = useTrackerStore((s) => s.setCashBuybackB);
  const cashEquitiesB = useTrackerStore((s) => s.cashEquitiesB);
  const setCashEquitiesB = useTrackerStore((s) => s.setCashEquitiesB);

  const cashMaxB = v.cashPreferred / 1e9;
  const implied = useMemo(() => computeImpliedMultiple(v), [v]);
  const deploy = useMemo(
    () => computeCashDeploy(v, { buybackB: cashBuybackB, equitiesB: cashEquitiesB }),
    [v, cashBuybackB, cashEquitiesB],
  );
  const grid = useMemo(() => computeSensitivityGrid(v), [v]);
  const look = useMemo(() => {
    const opsAfterTax = v.opsGroups.reduce((s, g) => s + g.group.afterTaxAnnualizedM * 1_000_000, 0);
    return computeLookthrough({
      holdings: v.holdings,
      usdJpy: v.usdJpy,
      opsAfterTaxUsd: opsAfterTax,
      insuranceUwAfterTaxUsd: v.insuranceRunRate,
    });
  }, [v]);

  const spread =
    implied.impliedMultiple !== null ? implied.impliedMultiple - v.multiple : null;

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">Implied operating multiple</h2>
          <p className="mt-1 text-sm text-muted">
            Market residual on non-insurance ops after stripping cash, public stocks, other
            investments and insurance, adding back parent bonds.
          </p>
          <p className="mt-4 font-mono text-3xl tabular tracking-tight">
            {implied.impliedMultiple === null ? "—" : formatMultiple(implied.impliedMultiple)}
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <Row k="Residual ops value" v={formatBillions(implied.residualOpsValue)} />
            <Row k="Pretax run-rate" v={formatBillions(implied.pretaxRunRate)} />
            <Row k="Desk multiple" v={formatMultiple(v.multiple)} />
            <Row
              k="Spread vs desk"
              v={
                spread === null
                  ? "—"
                  : `${spread > 0 ? "+" : ""}${spread.toFixed(1)}×`
              }
            />
            <Row
              k="Residual / IV"
              v={formatPct(implied.residualShareOfIv)}
            />
          </dl>

          {implied.impliedMultiple !== null ? (
            <p className="mt-4 rounded-lg bg-surface-2 px-3 py-3 text-xs leading-relaxed text-muted">
              {implied.impliedMultiple < v.multiple ? (
                <>
                  The market is capitalizing the operating businesses at a lower multiple than the
                  desk default ({formatMultiple(v.multiple)}). That is the main source of the
                  current discount.
                </>
              ) : implied.impliedMultiple > v.multiple ? (
                <>
                  The market is capitalizing the operating businesses above the desk default
                  ({formatMultiple(v.multiple)}). Most of any premium sits in the ops multiple.
                </>
              ) : (
                <>Market implied multiple is in line with the desk default.</>
              )}
            </p>
          ) : null}
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">Look-through earnings</h2>
          <p className="mt-1 text-sm text-muted">
            Share of public-portfolio TTM net income plus after-tax ops and underwriting.
          </p>
          <p className="mt-4 font-mono text-3xl tabular tracking-tight">
            {formatBillions(look.totalLookthrough)}
            <span className="ml-2 text-sm text-muted">/ year</span>
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <Row k="Public look-through" v={formatBillions(look.publicLookthrough)} />
            <Row k="Ops after-tax" v={formatBillions(look.opsAfterTax)} />
            <Row k="Underwriting after-tax" v={formatBillions(look.insuranceUw)} />
          </dl>
          <ul className="mt-4 max-h-36 space-y-1 overflow-y-auto text-xs">
            {look.lines.slice(0, 8).map((line) => (
              <li key={line.ticker} className="flex justify-between gap-2 border-b border-border/50 py-1">
                <span className="font-medium">{line.ticker}</span>
                <span className="font-mono tabular text-muted">{formatBillions(line.lookthroughUsd)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-lg font-medium tracking-tight">Cash deployment</h2>
        <p className="mt-1 text-sm text-muted">
          Buybacks retire B-equivalent shares at the live BRK.B price. Equity purchases swap cash
          for stocks inside column one.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-2 p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">Buybacks</p>
              <p className="font-mono tabular">${cashBuybackB.toFixed(0)}B</p>
            </div>
            <Slider
              className="mt-4"
              min={0}
              max={Math.max(1, Math.floor(cashMaxB))}
              step={5}
              value={[Math.min(cashBuybackB, cashMaxB)]}
              onValueChange={([n]) => setCashBuybackB(n ?? 0)}
              aria-label="Buyback billions"
            />
          </div>
          <div className="rounded-lg bg-surface-2 p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">Public equities</p>
              <p className="font-mono tabular">${cashEquitiesB.toFixed(0)}B</p>
            </div>
            <Slider
              className="mt-4"
              min={0}
              max={Math.max(1, Math.floor(cashMaxB))}
              step={5}
              value={[Math.min(cashEquitiesB, cashMaxB)]}
              onValueChange={([n]) => setCashEquitiesB(n ?? 0)}
              aria-label="Equities purchase billions"
            />
          </div>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <Stat k="Cash left" v={formatBillions(deploy.cashLeft)} />
          <Stat
            k="B shares retired"
            v={deploy.sharesRetiredB.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          />
          <Stat k="IV / B after" v={formatPerB(deploy.ivPerBAfter)} />
          <Stat
            k="Premium after"
            v={formatPct(deploy.premiumAfter)}
            tone={deploy.premiumAfter <= 0 ? "gain" : "loss"}
          />
        </dl>
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-lg font-medium tracking-tight">
          Sensitivity · earnings × multiple
        </h2>
        <p className="mt-1 text-sm text-muted">
          Shock pretax run-rate and re-capitalize. Market {formatPerB(v.priceB)}.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-kicker uppercase text-faint">
                <th className="py-2 pr-3 font-medium">Earnings</th>
                {[12, 15, 18].map((m) => (
                  <th key={m} className="py-2 pr-3 font-medium text-right">
                    {m}×
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[-0.2, -0.1, 0, 0.1].map((shock) => (
                <tr key={shock} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-3">
                    {shock === 0 ? "Base" : `${shock > 0 ? "+" : ""}${(shock * 100).toFixed(0)}%`}
                  </td>
                  {[12, 15, 18].map((m) => {
                    const cell = grid.find((c) => c.earningsShock === shock && c.multiple === m);
                    if (!cell) return <td key={m} />;
                    return (
                      <td key={m} className="py-2.5 pr-3 text-right">
                        <div className="font-mono tabular">{formatPerB(cell.ivPerB)}</div>
                        <div
                          className={cn(
                            "font-mono text-kicker tabular",
                            cell.premium <= 0 ? "text-gain" : "text-loss",
                          )}
                        >
                          {formatPct(cell.premium)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
      <dt className="text-muted">{k}</dt>
      <dd className="font-mono text-xs tabular">{v}</dd>
    </div>
  );
}

function Stat({ k, v, tone }: { k: string; v: string; tone?: "gain" | "loss" }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2">
      <p className="text-kicker uppercase text-faint">{k}</p>
      <p
        className={cn(
          "mt-1 font-mono text-base tabular",
          tone === "gain" && "text-gain",
          tone === "loss" && "text-loss",
        )}
      >
        {v}
      </p>
    </div>
  );
}
