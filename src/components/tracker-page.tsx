import { useEffect, useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { HeroPanel } from "@/components/hero-panel";
import { BreakdownPanel } from "@/components/breakdown-panel";
import { HoldingsTable } from "@/components/holdings-table";
import { HistoryChart } from "@/components/history-chart";
import { AnalystTools } from "@/components/analyst-tools";
import { TwoColumnExplainer } from "@/components/two-column-explainer";
import { VisitDeltaStrip } from "@/components/visit-delta-strip";
import { useLiveValuation } from "@/lib/use-valuation";
import { useTrackerStore } from "@/lib/store";
import { FILING, DEFAULT_MULTIPLE, DEFAULT_INSURANCE_MULTIPLE } from "@/lib/valuation/quarterly";
import { formatBillions, formatDateLabel, formatPerB, formatPct } from "@/lib/valuation/format";
import { recordSnapshot } from "@/lib/valuation/snapshots";
import { computePremiumContext } from "@/lib/valuation/premium-context";
import { Link } from "@tanstack/react-router";
import type { DeskSnapshot } from "@/lib/filings/types";
import { cn } from "@/lib/utils";

const PRESETS = [
  { id: "conservative", label: "Conservative", multiple: 12, insurance: 6 },
  { id: "base", label: "Base", multiple: DEFAULT_MULTIPLE, insurance: DEFAULT_INSURANCE_MULTIPLE },
  { id: "optimistic", label: "Optimistic", multiple: 18, insurance: 10 },
] as const;

export function TrackerPage() {
  const { v, query, filings } = useLiveValuation();
  const snap = filings.data;
  const multiple = useTrackerStore((s) => s.multiple);
  const insuranceMultiple = useTrackerStore((s) => s.insuranceMultiple);
  const setMultiple = useTrackerStore((s) => s.setMultiple);
  const setInsuranceMultiple = useTrackerStore((s) => s.setInsuranceMultiple);

  useEffect(() => {
    const disc = formatPct(v.premiumB).replace("+", "");
    document.title = `BRK.B ${formatPerB(v.priceB)} · IV ${formatPerB(v.ivPerB)} · ${disc} · Berkshire Desk`;
  }, [v.priceB, v.ivPerB, v.premiumB]);

  useEffect(() => {
    if (!v.ivPerB || !v.priceB) return;
    recordSnapshot({
      priceB: v.priceB,
      ivPerB: v.ivPerB,
      cashB: v.cashPreferred / 1e9,
      premiumPct: v.premiumB,
      marketCapB: v.marketCap / 1e9,
      publicB: v.publicTotal / 1e9,
    });
  }, [v.ivPerB, v.priceB, v.cashPreferred, v.premiumB, v.marketCap, v.publicTotal]);

  function applyPreset(p: (typeof PRESETS)[number]) {
    setMultiple(p.multiple);
    setInsuranceMultiple(p.insurance);
  }

  const activePreset = PRESETS.find(
    (p) => p.multiple === multiple && p.insurance === insuranceMultiple,
  );

  const cashPctMkt = v.marketCap > 0 ? v.cashPreferred / v.marketCap : 0;
  const ivVsBook = v.bookEquity > 0 ? (v.intrinsicValue - v.bookEquity) / v.bookEquity : 0;
  const cashYearsOfPretax =
    v.pretaxRunRate > 0 ? v.cashPreferred / v.pretaxRunRate : 0;

  const premiumCtx = useMemo(() => computePremiumContext(v.premiumB), [v.premiumB]);

  // Rough IV lift if ~$50B of cash is used for buybacks at the live price while at a discount
  const buybackIllustrationB = Math.min(50, v.cashPreferred / 1e9);
  const sharesRetiredIllust = v.priceB > 0 ? (buybackIllustrationB * 1e9) / v.priceB : 0;
  const bEqAfter = Math.max(0, v.aEquivalent - sharesRetiredIllust);
  const ivAfterIllust =
    bEqAfter > 0
      ? (v.intrinsicValue - buybackIllustrationB * 1e9) / bEqAfter
      : v.ivPerB;
  const ivLiftPct =
    v.ivPerB > 0 && v.premiumB < 0 ? (ivAfterIllust - v.ivPerB) / v.ivPerB : 0;

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 print:max-w-none">
        <div className="print:hidden">
          <p className="text-kicker uppercase text-faint">Owner’s dashboard</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Berkshire Hathaway
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            A live two-column estimate of intrinsic value — investments at market plus the equity
            value of the wholly-owned businesses, less parent bonds. Float is not deducted. Press{" "}
            <kbd className="rounded-xs bg-surface-2 px-1.5 py-0.5 font-mono text-kicker">M</kbd> for
            Letters & Lessons.
          </p>
        </div>

        <div className="hidden print:block">
          <h1 className="font-display text-2xl font-medium">Berkshire Desk — one-pager</h1>
          <p className="text-sm text-muted">
            IV {formatPerB(v.ivPerB)} / B · Market {formatPerB(v.priceB)} ·{" "}
            {formatPct(v.premiumB)} · Printed {new Date().toISOString().slice(0, 10)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Two-column SOTP · {multiple}× pretax ops · {insuranceMultiple}× underwriting · parent
            bonds deducted · float not deducted
          </p>
        </div>

        <VisitDeltaStrip
          priceB={v.priceB}
          ivPerB={v.ivPerB}
          cashB={v.cashPreferred / 1e9}
          premiumPct={v.premiumB}
          marketCapB={v.marketCap / 1e9}
        />

        <TwoColumnExplainer />
        <HeroPanel v={v} />

        {/* Historical premium context */}
        <div className="rounded-xl border border-border/70 bg-surface-2/60 px-4 py-3 text-sm print:hidden">
          <p className="text-kicker uppercase text-faint">Premium in context</p>
          <p className="mt-1 leading-relaxed text-muted">
            Today’s {formatPct(v.premiumB)} is {premiumCtx.label}
            {" "}
            <span className="text-fg">
              (range {formatPct(premiumCtx.min)} to {formatPct(premiumCtx.max)}, median{" "}
              {formatPct(premiumCtx.median)})
            </span>
            . Reconstructed quarterly series at a constant 15× / 8× policy.
          </p>
        </div>

        {/* Scenario presets */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <span className="text-kicker uppercase text-faint">Scenario</span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                activePreset?.id === p.id
                  ? "bg-surface-2 font-medium text-fg shadow-[var(--shadow-border)]"
                  : "text-muted hover:bg-surface-2/70 hover:text-fg",
              )}
            >
              {p.label}
              <span className="ml-1.5 font-mono text-kicker tabular text-faint">
                {p.multiple}× / {p.insurance}×
              </span>
            </button>
          ))}
        </div>

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

        <div className="grid items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <BreakdownPanel v={v} />
          <aside className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
            <h2 className="font-display text-lg font-medium tracking-tight">Vintage</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row k="Public prices" v={v.live ? "Live · Yahoo / Stooq" : "Fallback marks"} />
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
              <Row k="Cash / market" v={formatPct(cashPctMkt)} />
              <Row
                k="Cash / pretax ops"
                v={cashYearsOfPretax > 0 ? `${cashYearsOfPretax.toFixed(1)} yrs` : "—"}
              />
              <Row k="Market cap" v={formatBillions(v.marketCap)} />
              <Row k="Book equity" v={formatBillions(v.bookEquity)} />
              <Row k="IV vs book" v={formatPct(ivVsBook)} />
              <Row k="Premium / discount" v={formatPct(v.premiumB)} />
              <Row k="Float (not deducted)" v={formatBillions(v.float)} />
            </dl>

            <div className="mt-5 space-y-2 rounded-lg bg-surface-2 px-3 py-3 text-xs leading-relaxed text-muted">
              <p>
                {v.premiumB <= 0 ? (
                  <>
                    Shares trade at a {formatPct(Math.abs(v.premiumB)).replace("+", "")} discount to
                    the desk estimate. Cash alone is {formatPct(cashPctMkt).replace("+", "")} of
                    market cap
                    {cashYearsOfPretax > 0
                      ? ` and covers ~${cashYearsOfPretax.toFixed(1)} years of pretax operating run-rate`
                      : ""}
                    .
                  </>
                ) : (
                  <>
                    Shares trade at a {formatPct(v.premiumB).replace("+", "")} premium to the desk
                    estimate. Cash is {formatPct(cashPctMkt).replace("+", "")} of market cap.
                  </>
                )}
              </p>
              {v.premiumB < -0.02 && ivLiftPct > 0 ? (
                <p>
                  At this discount, deploying ~${buybackIllustrationB.toFixed(0)}B into buybacks at
                  the live price would lift IV per B by roughly{" "}
                  <span className="font-mono tabular text-fg">{formatPct(ivLiftPct)}</span> on the
                  desk’s current estimate (illustration only).
                </p>
              ) : null}
            </div>

            {query.isError ? (
              <p className="mt-4 text-xs text-warn">
                Live feed unavailable. Showing last seeded prices. Refresh to retry.
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm print:hidden">
              <Link to="/businesses" className="text-fg underline-offset-2 hover:underline">
                Private businesses →
              </Link>
              <Link to="/charts" className="text-fg underline-offset-2 hover:underline">
                Charts →
              </Link>
              <Link to="/methodology" className="text-fg underline-offset-2 hover:underline">
                Letters & Lessons →
              </Link>
              <button
                type="button"
                className="text-fg underline-offset-2 hover:underline"
                onClick={() => window.print()}
              >
                Print one-pager
              </button>
            </div>
          </aside>
        </div>

        <AnalystTools v={v} />

        <div className="print:hidden">
          <HoldingsTable holdings={v.holdings} />
          <div className="mt-6">
            <HistoryChart ivPerB={v.ivPerB} priceB={v.priceB} />
          </div>
        </div>
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
