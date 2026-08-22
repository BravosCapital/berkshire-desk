import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Hint } from "@/components/ui/tooltip";
import { useLiveValuation } from "@/lib/use-valuation";
import { useTrackerStore } from "@/lib/store";
import type { SegmentMultiples } from "@/lib/valuation/compute";
import { INSURANCE_GROUP } from "@/lib/valuation/ops";
import { formatBillions, formatMultiple } from "@/lib/valuation/format";
import {
  DEFAULT_INSURANCE_MULTIPLE,
  INSURANCE_MULTIPLE_MAX,
  INSURANCE_MULTIPLE_MIN,
} from "@/lib/valuation/quarterly";
import { Info } from "lucide-react";

export function BusinessesPage() {
  const { v } = useLiveValuation();
  const segment = useTrackerStore((s) => s.segment);
  const setSegment = useTrackerStore((s) => s.setSegment);
  const insuranceMultiple = useTrackerStore((s) => s.insuranceMultiple);
  const setInsuranceMultiple = useTrackerStore((s) => s.setInsuranceMultiple);

  useEffect(() => {
    document.title = "Businesses · Berkshire Desk";
  }, []);

  const opsGranular = v.opsGroups.reduce((s, g) => s + g.value, 0);
  const privateTotal = opsGranular + v.insurance;

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <p className="text-kicker uppercase text-faint">Private portfolio</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Operating businesses</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Wholly-owned companies valued at the 10-Q reporting-group level. Berkshire does not
            publish subsidiary earnings, so we do not invent Precision Castparts or Clayton Homes
            stand-alone numbers. Each group uses H1 2026 annualized earnings × a sector multiple —
            not the blended 15× on Overview. Constituent companies are listed so you can see what
            sits inside the estimate.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat k="Private + insurance value" v={formatBillions(privateTotal)} />
          <Stat k="Non-insurance ops" v={formatBillions(opsGranular)} />
          <Stat k="Insurance franchise" v={formatBillions(v.insurance)} />
        </div>

        <div className="space-y-4">
          {v.opsGroups.map((g) => {
            const key = g.group.id as keyof SegmentMultiples;
            const share = privateTotal ? g.value / privateTotal : 0;
            return (
              <article key={g.group.id} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-medium tracking-tight">{g.group.name}</h2>
                      <Badge>{g.group.segment}</Badge>
                    </div>
                    <p className="mt-2 max-w-3xl text-sm text-muted">{g.group.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-2xl tabular">{formatBillions(g.value)}</p>
                    <p className="text-kicker text-faint">{(share * 100).toFixed(1)}% of private book</p>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 sm:grid-cols-4">
                  <Mini
                    k={g.group.basis === "afterTax" ? "After-tax run-rate" : "Pretax run-rate"}
                    val={formatBillions(g.runRate)}
                  />
                  <Mini k="Multiple" val={formatMultiple(g.multiple)} />
                  <Mini k="H1 2026 source" val={g.group.source} />
                  <Mini k="Companies" val={String(g.group.companies.length)} />
                </dl>

                <div className="mt-4 max-w-md">
                  <div className="flex items-baseline justify-between text-xs text-muted">
                    <span>Sector multiple</span>
                    <Hint label={g.group.multipleNote}>
                      <button type="button" className="inline-flex items-center gap-1">
                        Why this range
                        <Info className="size-3" />
                      </button>
                    </Hint>
                  </div>
                  <Slider
                    className="mt-2"
                    min={6}
                    max={20}
                    step={0.5}
                    value={[segment[key]]}
                    onValueChange={([n]) => setSegment(key, n ?? segment[key])}
                    aria-label={`${g.group.shortName} multiple`}
                  />
                </div>

                <ul className="mt-5 divide-y divide-border/70">
                  {g.group.companies.map((c) => (
                    <li key={c.name} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted">{c.role}</p>
                      </div>
                      {c.acquired ? <p className="font-mono text-kicker text-faint">{c.acquired}</p> : null}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}

          <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-medium tracking-tight">{INSURANCE_GROUP.name}</h2>
                  <Badge>Insurance</Badge>
                </div>
                <p className="mt-2 max-w-3xl text-sm text-muted">
                  The compounding engine — float funds the investment column; only after-tax
                  underwriting is capitalized. Full treatment on{" "}
                  <Link to="/insurance" className="text-fg underline-offset-2 hover:underline">
                    Insurance
                  </Link>
                  .
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl tabular">{formatBillions(v.insurance)}</p>
                <p className="text-kicker text-faint">
                  {privateTotal ? ((v.insurance / privateTotal) * 100).toFixed(1) : "0"}% of private book
                </p>
              </div>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-4">
              <Mini k="After-tax underwriting" val={formatBillions(v.insuranceRunRate)} />
              <Mini k="Multiple" val={formatMultiple(insuranceMultiple)} />
              <Mini k="Float (not added)" val={formatBillions(v.float)} />
              <Mini k="Source" val={INSURANCE_GROUP.source} />
            </dl>
            <div className="mt-4 max-w-md">
              <p className="text-xs text-muted">Underwriting franchise multiple</p>
              <Slider
                className="mt-2"
                min={INSURANCE_MULTIPLE_MIN}
                max={INSURANCE_MULTIPLE_MAX}
                step={0.5}
                value={[insuranceMultiple]}
                onValueChange={([n]) => setInsuranceMultiple(n ?? DEFAULT_INSURANCE_MULTIPLE)}
                aria-label="Insurance multiple"
              />
            </div>
          </article>
        </div>
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

function Mini({ k, val }: { k: string; val: string }) {
  return (
    <div>
      <dt className="text-kicker uppercase text-faint">{k}</dt>
      <dd className="mt-1 text-sm text-fg">{val}</dd>
    </div>
  );
}
