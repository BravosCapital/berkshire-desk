import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFilingsSnapshot, useLiveValuation } from "@/lib/use-valuation";
import { refreshFilings } from "@/lib/filings/server";
import type { LedgerRow, Origin } from "@/lib/filings/types";
import { formatBillions, formatDateLabel } from "@/lib/valuation/format";
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

  useEffect(() => {
    document.title = "Sources · Berkshire Desk";
  }, []);

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

  const fetching = filings.isFetching || busy;
  const usingSeed = snap?.source === "seed";

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-kicker uppercase text-faint">Transparency</p>
            <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">
              Sources
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Live prices, the latest 13F and 10-Q, and a short ledger of what is automatic versus
              still seeded. For the philosophy behind the model, see{" "}
              <Link to="/methodology" className="text-fg underline-offset-2 hover:underline">
                Letters & Lessons
              </Link>
              .
            </p>
          </div>
          <Button variant="secondary" onClick={onRefresh} disabled={busy}>
            <RefreshCw className={fetching ? "animate-spin" : undefined} />
            {busy ? "Refreshing…" : "Refresh filings"}
          </Button>
        </div>

        {usingSeed ? (
          <p className="rounded-xl bg-warn-dim px-4 py-3 text-sm text-warn">
            Showing Q2 2026 seeds while EDGAR is fetched in the background. Figures flip to “auto”
            once the 13F and 10-Q parse. Press Refresh if this sits more than a minute.
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
            v={
              fetching
                ? "Refreshing"
                : snap?.stale
                  ? "Stale window"
                  : snap?.error
                    ? "Partial"
                    : "Current"
            }
            s={snap?.error ?? "Next 13F ~45 days after quarter-end"}
          />
        </div>

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
            <h2 className="font-display text-lg font-medium tracking-tight">
              What stays seeded on purpose
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              <li>Japan ownership percentages (large-shareholder reports, not quarterly)</li>
              <li>Occidental warrant terms and strike</li>
              <li>Insurance float (no clean XBRL tag; not deducted from IV anyway)</li>
              <li>Your valuation multiples (they are judgement)</li>
            </ul>
            <p className="mt-4 text-sm text-muted">
              New 13F CUSIPs appear at carrying value until mapped. Press Refresh the morning a
              filing drops — the desk re-reads EDGAR automatically every six hours.
            </p>
          </section>

          <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
            <h2 className="font-display text-lg font-medium tracking-tight">Official filings</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The desk pulls the latest 13F information table and 10-Q/10-K instance document from
              SEC EDGAR. Prices come from Yahoo Finance with Stooq fallback.
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
            <p className="mt-4 text-sm text-muted">
              IV {formatBillions(v.intrinsicValue)} ·{" "}
              <Link to="/methodology" className="text-fg underline-offset-2 hover:underline">
                Letters & Lessons →
              </Link>
            </p>
          </section>
        </div>
      </main>
    </AppShell>
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
        <Badge tone={row.stale ? "warn" : TONE[row.origin]}>
          {row.stale ? "stale" : row.origin}
        </Badge>
      </td>
      <td className="py-2.5 pr-3 font-mono text-xs tabular text-muted">
        {row.asOf.length === 10 ? formatDateLabel(row.asOf) : row.asOf}
      </td>
      <td className="py-2.5 text-xs text-muted">{row.source}</td>
    </tr>
  );
}
