import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";
import { Hint } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrackerStore } from "@/lib/store";
import type { SegmentMultiples, Valuation } from "@/lib/valuation/compute";
import { formatBillions, formatMultiple, formatPct } from "@/lib/valuation/format";
import {
  INSURANCE_MULTIPLE_MAX,
  INSURANCE_MULTIPLE_MIN,
  MULTIPLE_MAX,
  MULTIPLE_MIN,
} from "@/lib/valuation/quarterly";
import { Info } from "lucide-react";
import { Link } from "@tanstack/react-router";

const PIE_COLORS = [
  "var(--color-chart-public)",
  "var(--color-chart-cash)",
  "var(--color-chart-other)",
  "var(--color-chart-ops)",
  "var(--color-chart-ins)",
];

export function BreakdownPanel({ v }: { v: Valuation }) {
  const { multiple, setMultiple, mode, setMode, segment, setSegment, insuranceMultiple, setInsuranceMultiple } =
    useTrackerStore();

  const rows = [
    {
      key: "public",
      label: "Public equities",
      value: v.publicTotal,
      hint: "13F holdings at live market prices plus Japanese trading houses (ownership × live market cap) and Occidental warrants.",
    },
    {
      key: "cash",
      label: "Cash & T-bills (I&O)",
      value: v.cashPreferred,
      hint: `Insurance & Other cash plus T-bills, net of T-bill payables: ${formatBillions(v.cashPreferred)}. Railroad/utility cash stays inside BNSF and BHE.`,
    },
    {
      key: "other",
      label: "Other investments",
      value: v.otherInvestments,
      hint: "Available-for-sale debt securities + Occidental preferred (tagged liquidation value) + Berkadia residual. Kraft Heinz and Occidental common are live-marked in the 13F.",
    },
    {
      key: "ops",
      label: "Operating businesses",
      value: v.operating,
      hint:
        mode === "blended"
          ? `Non-insurance pretax run-rate ${formatBillions(v.pretaxRunRate)} capitalized at ${formatMultiple(multiple)}. Earnings are after interest, so this is equity value.`
          : "Granular SOTP of BNSF, BHE and each MSR reporting group at sector multiples.",
    },
    {
      key: "ins",
      label: "Insurance franchise",
      value: v.insurance,
      hint: `After-tax underwriting run-rate ${formatBillions(v.insuranceRunRate)} at ${formatMultiple(insuranceMultiple)}. Float is not added — it already funds the investment column.`,
    },
  ];

  const pieData = rows.map((r) => ({ name: r.label, value: Math.max(0, r.value) }));

  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-medium tracking-tight">Sum of the parts</h2>
          <p className="text-sm text-muted">Two-column identity. Hover any line for the accounting treatment.</p>
        </div>
        <Tabs value={mode} onValueChange={(val) => setMode(val as typeof mode)}>
          <TabsList>
            <TabsTrigger value="blended">Blended {formatMultiple(multiple)}</TabsTrigger>
            <TabsTrigger value="segment">Granular</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="none">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <ReTooltip
                contentStyle={{
                  background: "var(--color-surface-3)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--color-fg)",
                }}
                formatter={(val) => formatBillions(Number(val))}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1">
          {rows.map((r, i) => (
            <div key={r.key} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-surface-2">
              <span className="size-2 shrink-0 rounded-full" style={{ background: PIE_COLORS[i] }} />
              <Hint label={r.hint}>
                <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span className="text-sm text-fg">{r.label}</span>
                  <Info className="size-3 shrink-0 text-faint" />
                </button>
              </Hint>
              <span className="font-mono text-sm tabular text-fg">{formatBillions(r.value)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-2 py-2 text-sm text-muted">
            <span>Gross value</span>
            <span className="font-mono tabular">{formatBillions(v.grossAssets)}</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-loss-dim/40 px-2 py-2 text-sm">
            <Hint label="Berkshire parent bonds (USD, euro, yen) of $20.4B. These largely funded the Japanese trading-house stakes that are marked live. BNSF, BHE and BHFC debt stays inside after-interest earnings and is not subtracted again. Insurance float and deferred tax are funding sources, not deductions.">
              <button type="button" className="flex items-center gap-2 text-left">
                Parent bonds
                <Info className="size-3 text-faint" />
              </button>
            </Hint>
            <span className="font-mono tabular text-loss">−{formatBillions(v.parentDebt)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border px-2 pt-3">
            <span className="text-sm font-medium">Intrinsic value</span>
            <span className="font-mono text-base tabular">{formatBillions(v.intrinsicValue)}</span>
          </div>
        </div>
      </div>

      {mode === "blended" ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-2 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium">Operating multiple</p>
              <p className="font-mono text-lg tabular">{formatMultiple(multiple)}</p>
            </div>
            <p className="mt-1 text-xs text-muted">
              Capitalizes {formatBillions(v.pretaxRunRate)} of annualized pretax earnings from BNSF, BHE and
              Manufacturing / Service / Retailing. Buffett’s range is 10–15× pretax.
            </p>
            <Slider
              className="mt-4"
              min={MULTIPLE_MIN}
              max={MULTIPLE_MAX}
              step={0.1}
              value={[multiple]}
              onValueChange={([n]) => setMultiple(n ?? 15)}
              aria-label="Operating earnings multiple"
            />
            <div className="mt-2 flex justify-between font-mono text-kicker text-faint">
              <span>10×</span>
              <span>15× default</span>
              <span>18×</span>
            </div>
          </div>
          <div className="rounded-lg bg-surface-2 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium">Insurance franchise</p>
              <p className="font-mono text-lg tabular">{formatMultiple(insuranceMultiple)}</p>
            </div>
            <p className="mt-1 text-xs text-muted">
              After-tax underwriting only. Investment income is the yield on cash and stocks already in
              column one — capitalizing it would double-count.{" "}
              <Link to="/insurance" className="text-fg underline-offset-2 hover:underline">
                Insurance engine →
              </Link>
            </p>
            <Slider
              className="mt-4"
              min={INSURANCE_MULTIPLE_MIN}
              max={INSURANCE_MULTIPLE_MAX}
              step={0.5}
              value={[insuranceMultiple]}
              onValueChange={([n]) => setInsuranceMultiple(n ?? 8)}
              aria-label="Insurance underwriting multiple"
            />
            <div className="mt-2 flex justify-between font-mono text-kicker text-faint">
              <span>0×</span>
              <span>8× default</span>
              <span>12×</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {v.opsGroups.map((g) => {
            const key = g.group.id as keyof SegmentMultiples;
            return (
              <div key={g.group.id} className="rounded-lg bg-surface-2 p-4">
                <p className="text-xs text-muted">{g.group.shortName}</p>
                <p className="mt-1 font-mono text-lg tabular">{formatMultiple(segment[key])}</p>
                <Slider
                  className="mt-3"
                  min={6}
                  max={20}
                  step={0.5}
                  value={[segment[key]]}
                  onValueChange={([n]) => setSegment(key, n ?? segment[key])}
                  aria-label={`${g.group.shortName} multiple`}
                />
                <p className="mt-2 text-kicker text-faint">
                  {formatBillions(g.runRate)} · {g.group.basis} → {formatBillions(g.value)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-kicker text-faint">
        Market cap is {formatPct((v.marketCap - v.intrinsicValue) / v.intrinsicValue)} versus this estimate.
        Subtracting all GAAP liabilities after capitalizing after-interest earnings would double-count
        railroad/utility debt, insurance float and deferred tax.
      </p>
    </section>
  );
}
