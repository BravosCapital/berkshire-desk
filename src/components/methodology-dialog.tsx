import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTrackerStore } from "@/lib/store";
import { FILING } from "@/lib/valuation/quarterly";
import { formatDateLabel } from "@/lib/valuation/format";
import { Link } from "@tanstack/react-router";

export function MethodologyDialog() {
  const open = useTrackerStore((s) => s.methodologyOpen);
  const setOpen = useTrackerStore((s) => s.setMethodologyOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Methodology</DialogTitle>
          <DialogDescription>
            Two-column sum-of-the-parts. Independent estimate — not affiliated with Berkshire Hathaway.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-muted">
          <section>
            <h3 className="mb-1 font-medium text-fg">Why the old IV was too low</h3>
            <p>
              The previous model subtracted consolidated total liabilities ($513B) after replacing
              operating businesses with a capitalized earnings value. Those earnings are already
              after interest. Insurance float (~$178B) funds the investment portfolio that was
              already on the asset side. Deferred tax (~$90B) is interest-free leverage Buffett
              treats as a feature. Subtracting all three double-counted the capital structure and
              pushed IV ~$240 per BRK.B too low.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-medium text-fg">The identity</h3>
            <p>
              Intrinsic value = public equities (live) + Insurance & Other cash and T-bills +
              fixed-maturity securities + Occidental preferred + residual affiliates + capitalized
              non-insurance operating businesses + insurance underwriting franchise − Berkshire
              parent bonds.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-medium text-fg">Public equities</h3>
            <p>
              U.S. 13F holdings use the latest EDGAR information table (fallback: Q2 2026 13F
              filed {formatDateLabel(FILING.thirteenFFiled)}) multiplied by the current session
              price. Japanese trading houses are marked as ownership × live yen price, converted
              at spot USD/JPY. Occidental warrants (83.9 million, $59.62 strike) are included at
              intrinsic value.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-medium text-fg">Cash</h3>
            <p>
              Insurance & Other cash plus T-bills, net of T-bill payables: $359.2B as of{" "}
              {formatDateLabel(FILING.periodEnd)}. Railroad and utility cash is working capital of
              BNSF and BHE and stays inside those earnings.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-medium text-fg">Operating businesses</h3>
            <p>
              Default: capitalize the latest annualized pretax earnings of BNSF, BHE and
              Manufacturing / Service / Retailing at 10–15×. Earnings are after interest, so this is
              equity value — BNSF, BHE and BHFC debt is not subtracted again. The granular view
              applies railroad, utility and industrial multiples to each 10-Q reporting group.
              Subsidiary-level earnings are not disclosed; we value the reporting groups and list
              the companies inside them.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-medium text-fg">Insurance</h3>
            <p>
              After-tax underwriting profit is capitalized as a franchise. Float is not added as
              equity. Insurance investment income is the yield on cash, T-bills and stocks already
              marked in column one — capitalizing it would double-count.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-medium text-fg">Parent bonds</h3>
            <p>
              $20.4B of Berkshire Hathaway Inc. bonds (USD, euro and yen). The yen issues largely
              funded the Japanese trading-house purchases. BHFC debt funds Clayton and Marmon
              leasing and is already in after-interest building/service earnings.
            </p>
          </section>
          <p>
            <Link to="/data" className="text-fg underline-offset-2 hover:underline" onClick={() => setOpen(false)}>
              Data ledger — auto vs seeded
            </Link>
          </p>
          <p>
            <Link to="/methodology" className="text-fg underline-offset-2 hover:underline" onClick={() => setOpen(false)}>
              Full methodology page
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
