import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { MethodologyDialog } from "@/components/methodology-dialog";
import { KeyboardHints } from "@/components/keyboard-hints";
import { useLiveValuation } from "@/lib/use-valuation";
import { useTrackerStore } from "@/lib/store";
import type { Valuation } from "@/lib/valuation/compute";
import { A_PER_B } from "@/lib/valuation/quarterly";
import { LEGAL_FOOTER } from "@/lib/legal";
import { Link } from "@tanstack/react-router";

const LAST_SEEN_KEY = "brk-last-seen-filings";

type LastSeen = {
  thirteenFFiled?: string;
  tenQFiled?: string;
  source?: string;
};

function readLastSeen(): LastSeen {
  try {
    const raw = localStorage.getItem(LAST_SEEN_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LastSeen;
  } catch {
    return {};
  }
}

function writeLastSeen(next: LastSeen) {
  try {
    localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const { v, query, filings } = useLiveValuation();
  const setMethodologyOpen = useTrackerStore((s) => s.setMethodologyOpen);
  const prevSource = useRef<string | null>(null);
  const hydrated = useRef(false);

  // Keyboard shortcuts
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

  // Filing ping: toast when we leave seed, or when a newer filing appears
  useEffect(() => {
    const snap = filings.data;
    if (!snap) return;

    const source = snap.source ?? "seed";
    const filed13 = snap.thirteenF?.filed;
    const filed10 = snap.tenQ?.filed;

    // First paint — just record, don't toast
    if (!hydrated.current) {
      hydrated.current = true;
      prevSource.current = source;
      const last = readLastSeen();
      writeLastSeen({
        thirteenFFiled: filed13 ?? last.thirteenFFiled,
        tenQFiled: filed10 ?? last.tenQFiled,
        source,
      });
      return;
    }

    // Seed → live/cache
    if (prevSource.current === "seed" && (source === "edgar" || source === "cache")) {
      toast("EDGAR filings loaded", {
        description: "13F and 10-Q figures are now live.",
      });
    }

    // Newer filing than last seen in this browser
    const last = readLastSeen();
    const newer13 = filed13 && last.thirteenFFiled && filed13 > last.thirteenFFiled;
    const newer10 = filed10 && last.tenQFiled && filed10 > last.tenQFiled;

    if (newer13 || newer10) {
      const parts: string[] = [];
      if (newer13) parts.push(`13F ${filed13}`);
      if (newer10) parts.push(`10-Q ${filed10}`);
      toast("New filing detected", {
        description: parts.join(" · "),
      });
    }

    prevSource.current = source;
    writeLastSeen({
      thirteenFFiled: filed13 ?? last.thirteenFFiled,
      tenQFiled: filed10 ?? last.tenQFiled,
      source,
    });
  }, [filings.data]);

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
      <footer className="mx-auto max-w-7xl space-y-2 border-t border-border px-4 pb-12 pt-6 text-xs text-faint sm:px-6">
        <KeyboardHints />
        <p>{LEGAL_FOOTER}</p>
        <p>
          13F and 10-Q inputs refresh from SEC EDGAR; prices from Yahoo Finance with Stooq
          fallback.{" "}
          <Link to="/legal" className="text-muted underline-offset-2 hover:text-fg hover:underline">
            Full legal notice
          </Link>
          .
        </p>
        <p>© {new Date().getFullYear()} Berkshire Desk. Unofficial. Not Berkshire Hathaway Inc.</p>
      </footer>
      <MethodologyDialog />
    </div>
  );
}

function downloadSnapshot(v: Valuation, snap: { thirteenF?: unknown; tenQ?: unknown } | null) {
  const snapshot = {
    generatedAt: new Date().toISOString(),
    methodology:
      "Unofficial two-column SOTP estimate only — not investment advice, not affiliated with Berkshire Hathaway Inc. Investments at market + capitalized ops + insurance franchise − parent bonds. See berkshiredesk.com/legal.",
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
