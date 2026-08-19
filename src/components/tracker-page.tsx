import { AppShell } from "@/components/app-shell";
import { HeroPanel } from "@/components/hero-panel";
import { BreakdownPanel } from "@/components/breakdown-panel";
import { HoldingsTable } from "@/components/holdings-table";
import { HistoryChart } from "@/components/history-chart";
import { useLiveValuation } from "@/lib/use-valuation";
import { FILING, DEFAULT_MULTIPLE } from "@/lib/valuation/quarterly";
import { formatBillions, formatDateLabel, formatPerB, formatPct } from "@/lib/valuation/format";
import { Link } from "@tanstack/react-router";
import type { DeskSnapshot } from "@/lib/filings/types";

export function TrackerPage() {
  const { v, query, filings } = useLiveValuation();
  const snap = filings.data;

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Berkshire Hathaway
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            A live two-column estimate of intrinsic value. Default {DEFAULT_MULTIPLE}× pretax on
            non-insurance operating earnings, 8× after-tax underwriting, parent bonds deducted.
            Press{" "}
            <kbd className="rounded-xs bg-surface-2 px-1.5 py-0.5 font-mono text-kicker">M</kbd> for
            methodology.
          </p>
        </div>
        <HeroPanel v={v} />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["IV at 10×", formatPerB(v.ivPerBAt10)],
            ["IV at 12×", formatPerB(v.ivPerBAt12)],
            ["IV at 15×", formatPerB(v.ivPerBAt15)],
          ].map(([k, val]) => (
            <div key={k} className="rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
              <p className="text-kicker uppercase text-faint">{k}</p>
              <p className="mt-1 font-mono text-xl tabular">{val}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <BreakdownPanel v={v} />
          <aside className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
            <h2 className="font-display text-lg font-medium tracking-tight">Vintage</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row
                k="Public prices"
                v={v.live ? "Live · Yahoo Finance" : "Fallback marks"}
              />
              <Row
                k="13F share counts"
                v={
                  snap?.thirteenF
                    ? `Filed ${formatDateLabel(snap.thirteenF.filed)}`
                    : `Filed ${FILING.thirteenFFiled}`
                }
                note={ledgerOrigin(snap, "13f")}
              />
              <Row
                k="Cash, earnings, debt"
                v={`10-Q ${formatDateLabel(snap?.tenQ?.periodEnd ?? FILING.periodEnd)}`}
                note={ledgerOrigin(snap, "cash")}
              />
              <Row k="Share count" v={snap?.shareCountAsOf ?? FILING.shareCountAsOf} />
              <Row
                k="A-equivalent shares"
                v={v.aEquivalent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              />
              <Row k="I&O cash" v={formatBillions(v.cashPreferred)} />
              <Row k="Market cap" v={formatBillions(v.marketCap)} />
              <Row k="Book equity" v={formatBillions(v.bookEquity)} />
              <Row k="Premium / discount" v={formatPct(v.premiumB)} />
              <Row k="Float (not deducted)" v={formatBillions(v.float)} />
            </dl>
            {query.isError ? (
              <p className="mt-4 text-xs text-warn">
                Live feed unavailable. Showing last seeded prices. Refresh to retry.
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link to="/businesses" className="text-fg underline-offset-2 hover:underline">
                Private businesses →
              </Link>
              <Link to="/charts" className="text-fg underline-offset-2 hover:underline">
                Charts →
              </Link>
              <Link to="/data" className="text-fg underline-offset-2 hover:underline">
                Data ledger →
              </Link>
            </div>
          </aside>
        </div>
        <HoldingsTable holdings={v.holdings} />
        <HistoryChart ivPerB={v.ivPerB} priceB={v.priceB} />
      </main>
    </AppShell>
  );
}

function ledgerOrigin(snap: DeskSnapshot | undefined, id: string) {
  return snap?.ledger.find((r) => r.id === id)?.origin;
}

function Row({ k, v, note }: { k: string; v: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/70 pb-2 last:border-0">
      <dt className="text-muted">
        {k}
        {note ? <span className="ml-2 text-kicker uppercase text-faint">{note}</span> : null}
      </dt>
      <dd className="font-mono text-xs tabular text-fg">{v}</dd>
    </div>
  );
}
