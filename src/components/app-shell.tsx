import { useCallback, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { MethodologyDialog } from "@/components/methodology-dialog";
import { useLiveValuation } from "@/lib/use-valuation";
import { useTrackerStore } from "@/lib/store";
import type { Valuation } from "@/lib/valuation/compute";
import { A_PER_B } from "@/lib/valuation/quarterly";

export function AppShell({ children }: { children: ReactNode }) {
  const { v, query, filings } = useLiveValuation();
  const setMethodologyOpen = useTrackerStore((s) => s.setMethodologyOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setMethodologyOpen(true);
      }
      if (e.key === "/") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[aria-label="Search holdings"]')?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMethodologyOpen]);

  const exportSnapshot = useCallback(() => {
    downloadSnapshot(v, filings.data ?? null);
    toast("Snapshot exported", { description: "JSON and CSV downloaded." });
  }, [v, filings.data]);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <AppHeader onExport={exportSnapshot} pricesAt={query.data?.fetchedAt ?? null} />
      <div id="main">{children}</div>
      <footer className="mx-auto max-w-7xl space-y-2 px-4 pb-12 pt-4 text-xs text-faint sm:px-6">
        <p>
          Independent research desk. Not affiliated with Berkshire Hathaway Inc. Not investment
          advice. Intrinsic value is an estimate. Two-column SOTP: investments at market plus
          capitalized after-interest operating earnings plus underwriting franchise, less parent
          bonds. Float and deferred tax are not deducted. 13F share counts and 10-Q balance-sheet
          items refresh from SEC EDGAR; prices from Yahoo Finance.
        </p>
        <p>© {new Date().getFullYear()} Berkshire Desk</p>
      </footer>
      <MethodologyDialog />
    </div>
  );
}

function downloadSnapshot(v: Valuation, snap: { thirteenF?: unknown; tenQ?: unknown } | null) {
  const snapshot = {
    generatedAt: new Date().toISOString(),
    methodology:
      "Two-column SOTP: live public equities + I&O cash + other investments + capitalized ops + insurance underwriting franchise − parent bonds",
    multiple: v.multiple,
    insuranceMultiple: v.insuranceMultiple,
    mode: v.mode,
    filings: snap,
    intrinsicValue: v.intrinsicValue,
    ivPerA: v.ivPerA,
    ivPerB: v.ivPerB,
    marketPriceA: v.priceA,
    marketPriceB: v.priceB,
    premiumB: v.premiumB,
    components: {
      publicUs: v.publicUs,
      publicJapan: v.publicJapan,
      oxyWarrants: v.oxyWarrants,
      cashPreferred: v.cashPreferred,
      fixedMaturity: v.fixedMaturity,
      equityMethodResidual: v.equityMethodResidual,
      oxyPreferred: v.oxyPreferred,
      operating: v.operating,
      insurance: v.insurance,
      parentDebt: v.parentDebt,
    },
    shares: {
      classA: v.classA,
      classB: v.classB,
      aEquivalent: v.aEquivalent,
      aPerB: A_PER_B,
    },
    holdings: v.holdings.map((h) => ({
      ticker: h.ticker,
      name: h.name,
      source: h.source,
      shares: h.shares,
      price: h.price,
      currency: h.currency,
      value: h.value,
      changePct: h.changePct,
      weight: h.weight,
      live: h.live,
    })),
  };
  const json = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const csvLines = [
    "ticker,name,source,shares,price,currency,value,changePct,weight,live",
    ...v.holdings.map(
      (h) =>
        `${h.ticker},"${h.name}",${h.source},${h.shares},${h.price},${h.currency},${h.value},${h.changePct},${h.weight},${h.live}`,
    ),
    "",
    "component,value_usd",
    `public_us,${v.publicUs}`,
    `public_japan,${v.publicJapan}`,
    `cash,${v.cashPreferred}`,
    `other_investments,${v.otherInvestments}`,
    `operating,${v.operating}`,
    `insurance,${v.insurance}`,
    `parent_debt,${v.parentDebt}`,
    `intrinsic_value,${v.intrinsicValue}`,
    `iv_per_b,${v.ivPerB}`,
    `market_per_b,${v.priceB}`,
    `premium,${v.premiumB}`,
  ];
  const csv = new Blob([csvLines.join("\n")], { type: "text/csv" });
  const stamp = new Date().toISOString().slice(0, 10);
  download(json, `brk-iv-${stamp}.json`);
  download(csv, `brk-iv-${stamp}.csv`);
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
