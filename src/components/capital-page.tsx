import { AppShell } from "@/components/app-shell";
import { Hint } from "@/components/ui/tooltip";
import { useLiveValuation } from "@/lib/use-valuation";
import { formatBillions, formatPct } from "@/lib/valuation/format";
import { Info } from "lucide-react";

export function CapitalPage() {
  const { v } = useLiveValuation();

  const rows = [
    {
      label: "Insurance float",
      value: v.float,
      treat: "Not deducted",
      hint: "Net liabilities assumed under insurance contracts, $177.5B. Funds the investment portfolio already marked in column one. Cost of float is negative while underwriting is profitable.",
    },
    {
      label: "Deferred tax",
      value: v.deferredTax,
      treat: "Not deducted",
      hint: "Mostly unrealized appreciation on equities. No due date, no coupon. Buffett treats it as interest-free leverage. Subtracting it would haircut stocks that are already after-tax-of-sale in no realistic scenario.",
    },
    {
      label: "BNSF bonds",
      value: v.bnsfDebt,
      treat: "Not deducted",
      hint: "Railroad debt. BNSF pretax earnings are after interest, so the 13× multiple is an equity value.",
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
      hint: "Berkshire Hathaway Inc. USD, euro and yen bonds ($20.4B). Yen issues largely funded the Japanese trading-house purchases that are marked live.",
    },
  ];

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <p className="text-kicker uppercase text-faint">Capital structure</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Float, debt and book</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Why $513B of GAAP liabilities is the wrong number to subtract from a two-column SOTP.
            Only parent-level bonds come off intrinsic value. Everything else is either the funding
            of assets already marked, or debt already inside after-interest earnings.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat k="GAAP liabilities" v={formatBillions(v.liabilities)} />
          <Stat k="Book equity" v={formatBillions(v.bookEquity)} />
          <Stat k="Deducted in IV" v={formatBillions(v.parentDebt)} />
        </div>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">Liability stack</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-kicker uppercase text-faint">
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium">Amount</th>
                  <th className="py-2 font-medium">SOTP treatment</th>
                  <th className="py-2 font-medium">Share of GAAP liabilities</th>
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
                    <td className="py-3 font-mono tabular">{formatBillions(r.value)}</td>
                    <td className="py-3">
                      <span className={r.treat === "Deducted" ? "text-loss" : "text-muted"}>{r.treat}</span>
                    </td>
                    <td className="py-3 font-mono tabular text-muted">{formatPct(r.value / v.liabilities).replace("+", "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">What the old model did</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            Gross assets (investments + capitalized ops) minus <em>all</em> $513B of liabilities
            produced an IV around $366 per BRK.B while the stock traded near $495. That gap was an
            accounting identity error, not a 26% overvaluation. Railroad and utility debt was
            deducted after it had already reduced the earnings being capitalized. Float was
            deducted after the assets it funds were counted. Deferred tax on unrealized gains was
            deducted as if Berkshire were liquidating the portfolio tomorrow.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            Book equity of {formatBillions(v.bookEquity)} is the GAAP residual after those
            liabilities. Two-column IV sits above book because operating businesses are worth more
            than the plant, inventory and goodwill on the balance sheet, and because the public
            equity portfolio is marked at market rather than a mix of cost and equity-method
            carrying values.
          </p>
        </section>
      </main>
    </AppShell>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-kicker uppercase text-faint">{k}</p>
      <p className="mt-1 font-mono text-xl tabular">{v}</p>
    </div>
  );
}
