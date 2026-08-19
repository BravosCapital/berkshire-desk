import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFilingsSnapshot, useLiveValuation } from "@/lib/use-valuation";
import { refreshFilings } from "@/lib/filings/server";
import type { LedgerRow, Origin } from "@/lib/filings/types";
import { formatBillions, formatDateLabel, formatShares } from "@/lib/valuation/format";
import { FILING } from "@/lib/valuation/quarterly";
import { RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const TONE: Record<Origin, "gain" | "warn" | "neutral"> = {
  auto: "gain",
  live: "gain",
  scaled: "warn",
  seeded: "neutral",
};

export function DataPage() {
  const { v } = useLiveValuation();
  const filings = useFilingsSnapshot();
  const snap = filings.data;
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function onRefresh() {
    setBusy(true);
    try {
      const next = await refreshFilings();
      qc.setQueryData(["filings"], next);
      await qc.invalidateQueries({ queryKey: ["quotes"] });
      toast("Filings refreshed", {
        description: next.error ? next.error : `Source: ${next.source}`,
      });
    } catch (err) {
      toast("Refresh failed", {
        description: err instanceof Error ? err.message : "EDGAR did not respond",
      });
    } finally {
      setBusy(false);
    }
  }

  const unmapped = snap?.thirteenF?.unmapped ?? [];
  const fetching = filings.isFetching || busy;
  const usingSeed = snap?.source === "seed";

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-kicker uppercase text-faint">Inputs</p>
            <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">
              How the desk stays current
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              You do not re-type the 13F or the 10-Q. Share counts, cash, T-bills, parent bonds
              and segment pretax are pulled from SEC EDGAR. This page is the ledger of every
              input — auto, scaled from the last MD&A mix, or still seeded.
            </p>
          </div>
          <Button variant="secondary" onClick={onRefresh} disabled={busy}>
            <RefreshCw className={fetching ? "animate-spin" : undefined} />
            {busy ? "Refreshing…" : "Refresh filings"}
          </Button>
        </div>

        {usingSeed ? (
          <p className="rounded-xl bg-warn-dim px-4 py-3 text-sm text-warn">
            Showing Q2 2026 seeds while EDGAR is fetched in the background. Figures flip to
            “auto” as soon as the 13F and 10-Q parse. Press Refresh if this sits more than a
            minute.
          </p>
        ) : null}
        {snap?.error && !usingSeed ? (
          <p className="rounded-xl bg-warn-dim px-4 py-3 text-sm text-warn">{snap.error}</p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            k="13F"
            v={formatDateLabel(snap?.thirteenF?.periodEnd || FILING.thirteenFPeriod)}
            s={`Filed ${formatDateLabel(snap?.thirteenF?.filed || FILING.thirteenFFiled)}`}
          />
          <Stat
            k="10-Q / 10-K"
            v={formatDateLabel(snap?.tenQ?.periodEnd || FILING.periodEnd)}
            s={`Filed ${formatDateLabel(snap?.tenQ?.filed || FILING.tenQFiled)}`}
          />
          <Stat
            k="Last pull"
            v={snap?.refreshedAt ? new Date(snap.refreshedAt).toLocaleString("en-GB") : "—"}
            s={
              snap?.source === "edgar"
                ? "Direct from SEC"
                : snap?.source === "cache"
                  ? "Cached up to 6 hours"
                  : "Seeded fallback"
            }
          />
          <Stat
            k="Status"
            v={fetching ? "Refreshing" : snap?.stale ? "Stale window" : snap?.error ? "Partial" : "Current"}
            s={snap?.error ?? "Next 13F ~45 days after quarter-end"}
          />
        </div>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Do I update this after each 13F and 10-Q?
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            No. On load the server reads Berkshire’s latest 13F information table and 10-Q/10-K
            XBRL instance from EDGAR, caches them for six hours (and in memory), and feeds the
            two-column model. The next quarter’s filing replaces the numbers without a code
            change. Press Refresh to force a pull the day a filing drops.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-kicker uppercase text-faint">
                  <th className="py-2 pr-3 font-medium">Input</th>
                  <th className="py-2 pr-3 font-medium">Automatic?</th>
                  <th className="py-2 font-medium">What you still own</th>
                </tr>
              </thead>
              <tbody>
                <Guide
                  input="U.S. 13F share counts"
                  auto="Yes — latest 13F-HR from EDGAR, CUSIPs aggregated across managers"
                  you="A brand-new CUSIP is still counted at 13F carrying value until it is added to the ticker map"
                />
                <Guide
                  input="Prices & USD/JPY"
                  auto="Yes — Yahoo Finance, about every 60 seconds"
                  you="Nothing. Fallback marks if a symbol fails"
                />
                <Guide
                  input="Cash, T-bills, AFS debt, parent bonds, share count"
                  auto="Yes — 10-Q / 10-K XBRL tags"
                  you="T-bill payable ($771m) is untagged and stays seeded"
                />
                <Guide
                  input="Segment pretax (BNSF, BHE, MSR, Pilot, McLane, UW)"
                  auto="Yes — YTD XBRL, annualized (×2 after Q2, ×4/3 after Q3, ×4 after Q1)"
                  you="Industrial / building / consumer mix inside Manufacturing is scaled from the last MD&A split"
                />
                <Guide
                  input="Occidental preferred"
                  auto="Yes — tagged $8.5B remaining liquidation value"
                  you="Warrant count and $59.62 strike (exercise would be a one-line seed)"
                />
                <Guide
                  input="Japanese trading houses"
                  auto="Prices only (yen × spot USD/JPY)"
                  you="Ownership % when Mitsubishi, Mitsui, Itochu, Marubeni or Sumitomo file a large-shareholder report — typically yearly, not quarterly"
                />
                <Guide
                  input="Insurance float"
                  auto="No clean XBRL tag"
                  you="Update the seed after an earnings release if you care about the Capital page. Float is not deducted from IV"
                />
                <Guide
                  input="Valuation multiples"
                  auto="No — they are judgement"
                  you="15× pretax and 8× underwriting defaults. Sliders persist in this browser"
                />
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">Live ledger</h2>
          <p className="mt-1 text-sm text-muted">
            Origin <Badge tone="gain">auto</Badge> came from this pull.{" "}
            <Badge tone="warn">scaled</Badge> is XBRL pretax with the last MD&A mix.{" "}
            <Badge>seeded</Badge> is a Q2 2026 fallback.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-kicker uppercase text-faint">
                  <th className="py-2 pr-3 font-medium">Input</th>
                  <th className="py-2 pr-3 font-medium">Figure</th>
                  <th className="py-2 pr-3 font-medium">Origin</th>
                  <th className="py-2 pr-3 font-medium">As of</th>
                  <th className="py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {(snap?.ledger ?? []).map((row) => (
                  <LedgerLine key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
            <h2 className="font-display text-lg font-medium tracking-tight">The two-column identity</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted">
              <li>
                <span className="text-fg">Column one, investments.</span> Live 13F marks + Japanese
                trading houses + I&O cash and T-bills + AFS bonds + Occidental preferred +
                Berkadia.
              </li>
              <li>
                <span className="text-fg">Column two, businesses.</span> Annualized after-interest
                earnings of BNSF, BHE and Manufacturing / Service / Retailing, capitalized at your
                multiple, plus after-tax underwriting capitalized as a franchise.
              </li>
              <li>
                <span className="text-fg">Only parent bonds come off.</span> Float, deferred tax,
                railroad, utility and BHFC debt stay — they already sit in column one or in
                after-interest earnings. Per-share IV is total IV ÷ A-equivalents ÷ 1,500.
              </li>
            </ol>
            <p className="mt-4 text-sm text-muted">
              IV {formatBillions(v.intrinsicValue)} · {formatShares(v.aEquivalent)} A-equivalents ·{" "}
              <Link to="/methodology" className="text-fg underline-offset-2 hover:underline">
                Full method
              </Link>
            </p>
          </section>

          <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
            <h2 className="font-display text-lg font-medium tracking-tight">Filing calendar</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              After each quarter the SEC clock is ~40 days for the 10-Q and 45 days for the 13F.
              The 10-K follows in late February. This desk re-reads EDGAR on first load and every
              six hours, and whenever you press Refresh. Cache survives a process restart on the
              published database; the preview database is in-memory plus a process cache.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Q1 YTD is 3 months (annualize ×4). Q2 is 6 months (×2). Q3 is 9 months (×4/3). The
              10-K is a full year (×1). That is why you should not paste H1 run-rates into Q3
              by hand — the parser already annualizes.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {snap?.thirteenF?.url ? (
                <a
                  href={snap.thirteenF.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-fg underline-offset-2 hover:underline"
                >
                  Latest 13F <ExternalLink className="size-3.5" />
                </a>
              ) : null}
              {snap?.tenQ?.url ? (
                <a
                  href={snap.tenQ.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-fg underline-offset-2 hover:underline"
                >
                  Latest 10-Q/10-K <ExternalLink className="size-3.5" />
                </a>
              ) : null}
              <a
                href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001067983"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-fg underline-offset-2 hover:underline"
              >
                Berkshire EDGAR <ExternalLink className="size-3.5" />
              </a>
            </div>
          </section>
        </div>

        {unmapped.length ? (
          <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
            <h2 className="font-display text-lg font-medium tracking-tight">Unmapped 13F CUSIPs</h2>
            <p className="mt-2 text-sm text-muted">
              Included in public equities at period-end carrying value until a ticker is assigned
              in the CUSIP map. They still sit in intrinsic value.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {unmapped.map((u) => (
                <li key={u.cusip} className="flex justify-between gap-3 border-b border-border/70 py-2">
                  <span>
                    <span className="font-mono">{u.cusip}</span> · {u.name}
                  </span>
                  <span className="font-mono tabular">{formatBillions(u.reportedValue)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </AppShell>
  );
}

function Guide({ input, auto, you }: { input: string; auto: string; you: string }) {
  return (
    <tr className="border-b border-border/60 align-top last:border-0">
      <td className="py-2.5 pr-3 text-fg">{input}</td>
      <td className="py-2.5 pr-3 text-muted">{auto}</td>
      <td className="py-2.5 text-muted">{you}</td>
    </tr>
  );
}

function Stat({ k, v, s }: { k: string; v: string; s: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-kicker uppercase text-faint">{k}</p>
      <p className="mt-1 font-mono text-base tabular">{v}</p>
      <p className="text-xs text-muted">{s}</p>
    </div>
  );
}

function LedgerLine({ row }: { row: LedgerRow }) {
  return (
    <tr className="border-b border-border/60 align-top last:border-0">
      <td className="py-2.5 pr-3">
        <div className="text-fg">{row.label}</div>
        {row.note ? <div className="mt-0.5 max-w-md text-xs text-faint">{row.note}</div> : null}
      </td>
      <td className="py-2.5 pr-3 font-mono text-xs tabular">{row.value}</td>
      <td className="py-2.5 pr-3">
        <Badge tone={row.stale ? "warn" : TONE[row.origin]}>{row.stale ? "stale" : row.origin}</Badge>
      </td>
      <td className="py-2.5 pr-3 font-mono text-xs tabular text-muted">
        {row.asOf.length === 10 ? formatDateLabel(row.asOf) : row.asOf}
      </td>
      <td className="py-2.5 text-xs text-muted">{row.source}</td>
    </tr>
  );
}
