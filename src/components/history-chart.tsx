import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IV_HISTORY, withLiveIv } from "@/lib/valuation/history";
import { formatPerB } from "@/lib/valuation/format";

export function HistoryChart({ ivPerB, priceB }: { ivPerB: number; priceB: number }) {
  const data = withLiveIv(IV_HISTORY, ivPerB, priceB);

  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <h2 className="font-display text-lg font-medium tracking-tight">IV vs market price</h2>
      <p className="text-sm text-muted">
        Two-column intrinsic value per BRK.B at a constant 15× pretax / 8× underwriting policy,
        against the Class B close. History before Q2 2026 is reconstructed so the series is
        comparable to the live estimate.
      </p>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--color-muted)", fontSize: 11 }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(n) => `$${n}`}
              domain={["auto", "auto"]}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-surface-3)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--color-fg)",
              }}
              formatter={(val, name) => [formatPerB(Number(val)), String(name)]}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-muted)", paddingTop: 8 }} />
            <Line
              type="monotone"
              name="Estimated IV / B"
              dataKey="ivPerB"
              stroke="var(--color-chart-iv)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              name="BRK.B price"
              dataKey="priceB"
              stroke="var(--color-chart-price)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
