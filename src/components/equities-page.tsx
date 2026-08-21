import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { EquityBookGuide } from "@/components/equity-book-guide";
import { HoldingsTable } from "@/components/holdings-table";
import { ThirteenFChanges } from "@/components/thirteenf-changes";
import { useLiveValuation } from "@/lib/use-valuation";
import { formatBillions, formatDateLabel, formatPct } from "@/lib/valuation/format";
import { FILING } from "@/lib/valuation/quarterly";
import { quoteModeLabel } from "@/lib/data-health";

export function EquitiesPage() {
  const { v, filings, quoteHealth } = useLiveValuation();
  const us = v.holdings.filter((h) => h.source === "13F");
  const top = v.holdings[0];
  const snapPeriod = filings.data?.thirteenF?.periodEnd ?? FILING.thirteenFPeriod;

  useEffect(() => {
    document.title = `Equities · Berkshire Desk`;
  }, []);

  const marksLine =
    quoteHealth.mode === "daily"
      ? `Daily session closes as of ${quoteHealth.marksAsOf} · ${quoteHealth.dailyCount}/${quoteHealth.requested} names`
      : quoteHealth.mode === "partial"
        ? `Partial book · ${quoteHealth.dailyCount}/${quoteHealth.requested} daily, rest seeded (${quoteHealth.fallbackAsOf})`
        : `Emergency seeds as of ${quoteHealth.fallbackAsOf} · daily feed unavailable`;

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <p className="text-kicker uppercase text-faint">Public portfolio</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Equity holdings</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Latest 13F share counts, auto-pulled from SEC EDGAR
            {snapPeriod ? ` (period ${formatDateLabel(snapPeriod)})` : ""}. Japanese sogo shosha
            from the latest ownership disclosures. Kraft Heinz and Occidental common are here, not
            in the equity-method residual.
          </p>
          <p className="mt-2 text-sm text-muted">
            Marks: <span className="font-medium text-fg">{quoteModeLabel(quoteHealth.mode)}</span>
            {" · "}
            {marksLine}. Each row shows Daily vs Seed.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat k="U.S. 13F" v={formatBillions(v.publicUs)} s={`${us.length} names`} />
          <Stat k="Japan" v={formatBillions(v.publicJapan)} s="Five trading houses" />
          <Stat k="Warrants" v={formatBillions(v.oxyWarrants)} s="OXY $59.62 strike" />
          <Stat
            k="Largest"
            v={top ? formatBillions(top.value) : "—"}
            s={top ? `${top.ticker} · ${formatPct(top.weight).replace("+", "")}` : ""}
          />
        </div>

        <EquityBookGuide />

        <ThirteenFChanges holdings={v.holdings} />
        <HoldingsTable holdings={v.holdings} />
      </main>
    </AppShell>
  );
}

function Stat({ k, v, s }: { k: string; v: string; s: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-kicker uppercase text-faint">{k}</p>
      <p className="mt-1 font-mono text-xl tabular">{v}</p>
      <p className="text-xs text-muted">{s}</p>
    </div>
  );
}
