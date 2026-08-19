import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { HistoryChart } from "@/components/history-chart";
import { useLiveValuation } from "@/lib/use-valuation";
import { CASH_HISTORY, IV_HISTORY, withLiveIv } from "@/lib/valuation/history";
import { formatBillions, formatPerB, formatPct } from "@/lib/valuation/format";

const TOOLTIP = {
  background: "var(--color-surface-3)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--color-fg)",
};

const PIE = [
  "var(--color-chart-public)",
  "var(--color-chart-cash)",
  "var(--color-chart-other)",
  "var(--color-chart-ops)",
  "var(--color-chart-ins)",
];

export function ChartsPage() {
  const { v } = useLiveValuation();
  const history = withLiveIv(IV_HISTORY, v.ivPerB, v.priceB);

  const allocation = [
    { name: "Public equities", value: v.publicTotal },
    { name: "Cash & T-bills", value: v.cashPreferred },
    { name: "Other investments", value: v.otherInvestments },
    { name: "Operating businesses", value: v.operating },
    { name: "Insurance franchise", value: v.insurance },
  ];

  const sectors = Object.entries(
    v.holdings.reduce<Record<string, number>>((acc, h) => {
      acc[h.sector] = (acc[h.sector] ?? 0) + h.value;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const topHoldings = v.holdings.slice(0, 12).map((h) => ({
    name: h.ticker,
    value: h.value / 1e9,
  }));

  const opsBars = [
    ...v.opsGroups.map((g) => ({ name: g.group.shortName, value: g.value / 1e9 })),
    { name: "Insurance", value: v.insurance / 1e9 },
  ];

  const premiumSeries = history.map((p) => ({
    label: p.label,
    premium: Math.round(p.premiumPct * 1000) / 10,
  }));

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <p className="text-kicker uppercase text-faint">Charts</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Market, IV and mix</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Live composition of the two-column estimate, the public book by sector, cash through
            time, and the premium or discount versus estimated IV.
          </p>
        </div>

        <HistoryChart ivPerB={v.ivPerB} priceB={v.priceB} />

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="SOTP mix" note="Gross value before parent bonds.">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={allocation} dataKey="value" innerRadius={70} outerRadius={110} paddingAngle={2} stroke="none">
                  {allocation.map((_, i) => (
                    <Cell key={allocation[i].name} fill={PIE[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP} formatter={(val) => formatBillions(Number(val))} />
                <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-muted)" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Premium / discount to IV" note="Negative is a discount. Percent.">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={premiumSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 11 }} tickLine={false} />
                <YAxis
                  tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(n) => `${n}%`}
                  width={40}
                />
                <Tooltip contentStyle={TOOLTIP} formatter={(val) => [`${val}%`, "Premium"]} />
                <Bar dataKey="premium" radius={[3, 3, 0, 0]}>
                  {premiumSeries.map((p) => (
                    <Cell key={p.label} fill={p.premium <= 0 ? "var(--color-gain)" : "var(--color-loss)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Cash & T-bills" note="Insurance & Other preferred metric, $ billions.">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={CASH_HISTORY} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 11 }} tickLine={false} />
                <YAxis
                  tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(n) => `$${n}B`}
                  width={52}
                />
                <Tooltip contentStyle={TOOLTIP} formatter={(val) => [`$${val}B`, "Cash"]} />
                <Line type="monotone" dataKey="cashB" stroke="var(--color-chart-cash)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Public book by sector" note="Live marks, 13F + Japan + warrants.">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sectors} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                  tickFormatter={(n) => `$${Math.round(n / 1e9)}B`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={TOOLTIP} formatter={(val) => formatBillions(Number(val))} />
                <Bar dataKey="value" fill="var(--color-chart-public)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top public holdings" note="Billions of dollars at the live mark.">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topHoldings} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--color-muted)", fontSize: 11 }} tickLine={false} />
                <YAxis
                  tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(n) => `$${n}B`}
                  width={44}
                />
                <Tooltip contentStyle={TOOLTIP} formatter={(val) => [`$${Number(val).toFixed(1)}B`, "Value"]} />
                <Bar dataKey="value" fill="var(--color-chart-ops)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Private groups at current multiples" note="Equity value, $ billions.">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={opsBars} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                  tickFormatter={(n) => `$${n}B`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={88}
                  tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={TOOLTIP} formatter={(val) => [`$${Number(val).toFixed(1)}B`, "Value"]} />
                <Bar dataKey="value" fill="var(--color-chart-ops)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">Sensitivity · BRK.B</h2>
          <p className="text-sm text-muted">
            Same investments and insurance franchise; only the blended operating multiple moves.
            Market {formatPerB(v.priceB)}.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-kicker uppercase text-faint">
                  <th className="py-2 font-medium">Multiple</th>
                  <th className="py-2 font-medium">Est. IV / B</th>
                  <th className="py-2 font-medium">vs market</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["10× pretax", v.ivPerBAt10],
                    ["12× pretax", v.ivPerBAt12],
                    ["15× pretax", v.ivPerBAt15],
                    ["18× pretax", v.ivPerBAt18],
                    ["Current slider", v.ivPerB],
                  ] as const
                ).map(([label, iv]) => (
                  <tr key={label} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5">{label}</td>
                    <td className="py-2.5 font-mono tabular">{formatPerB(iv)}</td>
                    <td className="py-2.5 font-mono tabular">{formatPct((v.priceB - iv) / iv)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function ChartCard({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <h2 className="font-display text-lg font-medium tracking-tight">{title}</h2>
      <p className="text-sm text-muted">{note}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
