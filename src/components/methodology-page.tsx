import { AppShell } from "@/components/app-shell";
import { FILING } from "@/lib/valuation/quarterly";
import { formatDateLabel } from "@/lib/valuation/format";
import { Link } from "@tanstack/react-router";

export function MethodologyPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
        <div>
          <p className="text-kicker uppercase text-faint">Notes</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Methodology</h1>
          <p className="mt-2 text-sm text-muted">
            Independent two-column estimate. Not affiliated with Berkshire Hathaway Inc. Not
            investment advice.
          </p>
        </div>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">The error we fixed</h2>
          <p>
            The first version of this desk subtracted consolidated total liabilities ($512.9B as of
            June 30, 2026) from a gross asset pile that already included operating businesses at a
            10–15× pretax multiple. That multiple is applied to earnings after interest. The
            deduction therefore counted railroad debt, utility debt, insurance float and deferred
            tax a second time. Intrinsic value per BRK.B landed near $366 while the shares traded
            near $495 — a gap that looked like a 26% overvaluation and was, in fact, an identity
            mistake.
          </p>
          <p>
            Buffett’s two-column framing is the correction. Column one is investments at market.
            Column two is the equity value of the wholly-owned businesses. Float and deferred tax
            are the cheap leverage that lets column one be larger than tangible equity; they are
            not a subtraction from owner value when underwriting is profitable and the stock
            portfolio is not being liquidated.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Column one — investments</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Insurance & Other cash and T-bills, net of T-bill payables ($359.2B). Railroad
              and utility cash stays in BNSF / BHE.
            </li>
            <li>
              U.S. 13F holdings at the live mark. Share counts from the{" "}
              {formatDateLabel(FILING.thirteenFFiled)} filing.
            </li>
            <li>
              Japanese trading houses at ownership × live yen price, converted at spot USD/JPY.
              These names are not in the 13F.
            </li>
            <li>Occidental warrants at intrinsic value; remaining 8% OXY preferred at the tagged $8.5B liquidation value (original $10B commitment).</li>
            <li>
              Fixed-maturity (AFS) debt at 10-Q carrying value and Berkadia. Kraft Heinz and
              Occidental common are live in the 13F and are not added again. Occidental preferred
              uses the tagged liquidation value when EDGAR answers.
            </li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Column two — operating businesses</h2>
          <p>
            Default: capitalize H1 2026 annualized pretax earnings of BNSF, Berkshire Hathaway
            Energy and Manufacturing / Service / Retailing at 15×. Buffett has described 10–15×
            pretax as a reasonable band. Because those earnings are after interest, the result is
            an equity value. BNSF, BHE and BHFC debt is not subtracted again.
          </p>
          <p>
            The granular view uses 10-Q MD&A reporting groups — industrial products, building
            products, consumer products, service, retailing, Pilot and McLane — each with its own
            pretax run-rate and sector multiple. Berkshire does not disclose Precision Castparts or
            Clayton Homes stand-alone earnings. We list the companies inside each group and value
            the group, not invented subsidiary numbers.
          </p>
          <p>
            BHE is capitalized on after-tax earnings. Tax credits make GAAP pretax a poor measure
            of earning power at the utility.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Insurance franchise</h2>
          <p>
            After-tax underwriting profit (H1 $3.45B, annualized $6.9B) is capitalized at 8× by
            default. That is the negative cost of $177.5B of float. Insurance investment income is
            the coupon and dividend on cash, T-bills and stocks already in column one. Capitalizing
            it would count those assets twice. Float itself is not added as equity.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Parent bonds</h2>
          <p>
            $20.4B of Berkshire Hathaway Inc. notes (USD, euro, yen) are deducted. The yen issues
            financed the sogo shosha purchases. Everything else in the $513B GAAP liability total
            stays on the capital-structure page as context.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Share count</h2>
          <p>
            Class A 488,450 and Class B 1,408,035,161 as of {formatDateLabel(FILING.shareCountAsOf)}.
            One A equals 1,500 B. Per-share IV is total IV divided by A-equivalents, then by 1,500
            for Class B.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Data vintage</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Public prices and USD/JPY: live, Yahoo Finance chart endpoint.</li>
            <li>
              13F share counts, 10-Q cash/debt/share count and segment pretax: auto-pulled from SEC
              EDGAR. See{" "}
              <Link to="/data" className="text-fg underline-offset-2 hover:underline">
                Data
              </Link>
              .
            </li>
            <li>
              Fallback seeds: 13F {formatDateLabel(FILING.thirteenFFiled)}, 10-Q{" "}
              {formatDateLabel(FILING.periodEnd)}.
            </li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Keeping the desk current</h2>
          <p>
            After publish you should not have to hand-edit share counts or cash each quarter. On
            load the server reads Berkshire’s latest 13F information table and 10-Q/10-K instance
            document from SEC EDGAR, caches them for six hours, and feeds the two-column model.
            Press Refresh on the Data page to force a pull the morning a filing drops. Segment
            pretax is annualized from year-to-date XBRL; the industrial / building / consumer mix
            inside Manufacturing is scaled from the last MD&A split because those five lines are
            not tagged. Per-share IV is total IV ÷ A-equivalents ÷ 1,500 — a Class B share is
            1/1,500 of an A-equivalent, not 1/A-equivalent.
          </p>
          <p>
            Still seeded on purpose: Japan ownership percentages, Occidental warrants, insurance
            float, the $771m T-bill payable (untagged), and your multiples. New 13F CUSIPs that are
            not in the map are included at carrying value and listed on Data until mapped to a
            ticker. See Data for the owner runbook.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Disclaimer</h2>
          <p>
            This is an independent estimate for research and education. It is not investment
            advice, not an offer, and not affiliated with Berkshire Hathaway Inc. Intrinsic value
            is inherently imprecise. Operating earnings are quarterly and will not be linear. Live
            prices can be delayed or fail over; the model then uses the last seeded marks. Do your
            own work.
          </p>
        </section>
      </main>
    </AppShell>
  );
}
