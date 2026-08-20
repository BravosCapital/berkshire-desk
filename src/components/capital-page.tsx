import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Hint } from "@/components/ui/tooltip";
import { useLiveValuation } from "@/lib/use-valuation";
import { formatBillions, formatPct, formatShares } from "@/lib/valuation/format";
import { A_PER_B } from "@/lib/valuation/quarterly";
import { Info } from "lucide-react";

export function CapitalPage() {
  const { v } = useLiveValuation();

  useEffect(() => {
    document.title = "Capital · Berkshire Desk";
  }, []);

  const cashPctMkt = v.marketCap ? v.cashPreferred / v.marketCap : 0;
  const ivVsBook = v.bookEquity ? (v.intrinsicValue - v.bookEquity) / v.bookEquity : 0;
  const bEquivalent = v.classA * A_PER_B + v.classB;

  const rows = [
    {
      label: "Insurance float",
      value: v.float,
      treat: "Not deducted",
      hint: "Net liabilities assumed under insurance contracts. Funds the investment portfolio already marked in column one. Cost of float is negative while underwriting is profitable.",
    },
    {
      label: "Deferred tax",
      value: v.deferredTax,
      treat: "Not deducted",
      hint: "Mostly unrealized appreciation on equities. No due date, no coupon. Buffett treats it as interest-free leverage.",
    },
    {
      label: "BNSF bonds",
      value: v.bnsfDebt,
      treat: "Not deducted",
      hint: "Railroad debt. BNSF pretax earnings are after interest, so the multiple is an equity value.",
    },
    {
      label: "BHE bonds",
      value: v.bheDebt,
      treat: "Not deducted",
      hint: "Utility and pipeline debt. Same treatment as BNSF — after-interest earnings are capitalized.",
    },
    {
      label: "BHFC notes",
      value: v.bhfcDebt,
      treat: "Not deducted",
      hint: "Funds Clayton Homes mortgages and Marmon leasing. Interest already sits in building-products and service earnings.",
    },
    {
      label: "Parent bonds",
      value: v.parentDebt,
      treat: "Deducted",
      hint: "Berkshire Hathaway Inc. USD, euro and yen bonds. Yen issues largely funded the Japanese trading-house purchases that are marked live.",
    },
  ];

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <p className="text-kicker uppercase text-faint">Capital structure</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Float, debt and book</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Why GAAP liabilities are the wrong number to subtract from a two-column SOTP. Only
            parent-level bonds come off intrinsic value.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat k="GAAP liabilities" v={formatBillions(v.liabilities)} />
          <Stat k="Book equity" v={formatBillions(v.bookEquity)} />
          <Stat k="Deducted in IV" v={formatBillions(v.parentDebt)} />
          <Stat k="Cash / market cap" v={formatPct(cashPctMkt).replace("+", "")} s="I&O cash + T-bills" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat k="Class A shares" v={formatShares(v.classA)} />
          <Stat k="Class B shares" v={formatShares(v.classB)} />
          <Stat k="B-equivalent" v={formatShares(bEquivalent)} s="A × 1,500 + B" />
          <Stat
            k="IV vs book"
            v={formatPct(ivVsBook)}
            s={`${formatBillions(v.intrinsicValue)} IV`}
          />
        </div>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">Dry powder</h2>
          <p className="mt-1 text-sm text-muted">
            Insurance & Other cash and T-bills relative to the live market cap. Deploy scenarios
            live on the Overview page.
          </p>
          <div className="mt-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted">Cash share of market cap</span>
              <span className="font-mono tabular">{formatPct(cashPctMkt).replace("+", "")}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-[var(--color-chart-cash)]"
                style={{ width: `${Math.min(100, Math.max(0, cashPctMkt * 100))}%` }}
              />
            </div>
            <p className="mt-2 font-mono text-xs tabular text-faint">
              {formatBillions(v.cashPreferred)} cash · {formatBillions(v.marketCap)} market
            </p>
          </div>
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">Liability stack</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-kicker uppercase text-faint">
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium text-right">Amount</th>
                  <th className="py-2 font-medium">SOTP treatment</th>
                  <th className="py-2 font-medium text-right">Share of GAAP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-border/60 last:border-0">
                    <td className="py-3">
                      <Hint label={r.hint}>
                        <button type="button" className="inline-flex items-center gap-1.5 text-left">
                          {r.label}
                          <Info className="size-3 text-faint" />
                        </button>
                      </Hint>
                    </td>
                    <td className="py-3 text-right font-mono tabular">{formatBillions(r.value)}</td>
                    <td className="py-3">
                      <span className={r.treat === "Deducted" ? "text-loss" : "text-muted"}>
                        {r.treat}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono tabular text-muted">
                      {formatPct(r.value / v.liabilities).replace("+", "")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">What the old model did</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            Gross assets minus <em>all</em> GAAP liabilities double-counted railroad and utility
            debt (already inside after-interest earnings), insurance float (already funding column
            one), and deferred tax on unrealized gains. Book equity of{" "}
            {formatBillions(v.bookEquity)} is the GAAP residual. Two-column IV sits above book
            because operating businesses are worth more than plant and goodwill on the balance
            sheet, and because the public equity portfolio is marked at market.
          </p>
        </section>
      </main>
    </AppShell>
  );
}

function Stat({ k, v, s }: { k: string; v: string; s?: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-kicker uppercase text-faint">{k}</p>
      <p className="mt-1 font-mono text-xl tabular">{v}</p>
      {s ? <p className="text-xs text-muted">{s}</p> : null}
    </div>
  );
}
