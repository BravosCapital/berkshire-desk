import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { Slider } from "@/components/ui/slider";
import { Hint } from "@/components/ui/tooltip";
import { useLiveValuation } from "@/lib/use-valuation";
import { useTrackerStore } from "@/lib/store";
import {
  ENGINE_STEPS,
  FLOAT_HISTORY,
  GEICO_UNDERWRITING,
  GROUP_COMBINED,
  INSURANCE_DATA_SOURCE,
  INSURANCE_HOUSES,
  LETTER_NOTES,
  PREMIUM_MIX_H1_2026,
  PREMIUMS_EARNED_B,
} from "@/lib/valuation/insurance";
import { INSURANCE_GROUP } from "@/lib/valuation/ops";
import { formatBillions, formatMultiple, formatPct, formatPerB } from "@/lib/valuation/format";
import {
  A_PER_B,
  DEFAULT_INSURANCE_MULTIPLE,
  INSURANCE_MULTIPLE_MAX,
  INSURANCE_MULTIPLE_MIN,
  OPS,
} from "@/lib/valuation/quarterly";
import { Info } from "lucide-react";

const TOOLTIP = {
  background: "var(--color-surface-3)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--color-fg)",
};

const TICK = { fill: "var(--color-muted)", fontSize: 11 };

const TOC = [
  { href: "#engine", label: "Engine" },
  { href: "#ratios", label: "Ratios" },
  { href: "#premiums", label: "Premiums" },
  { href: "#ledger", label: "Ledger" },
  { href: "#float", label: "Float" },
] as const;

export function InsurancePage() {
  const { v } = useLiveValuation();
  const insuranceMultiple = useTrackerStore((s) => s.insuranceMultiple);
  const setInsuranceMultiple = useTrackerStore((s) => s.setInsuranceMultiple);

  const bEq = v.classA * A_PER_B + v.classB;
  const floatPerB = bEq > 0 ? v.float / bEq : 0;
  const uwOnFloat = v.float > 0 ? v.insuranceRunRate / v.float : 0;
  const franchiseShareIv = v.intrinsicValue > 0 ? v.insurance / v.intrinsicValue : 0;
  const floatShareMkt = v.marketCap > 0 ? v.float / v.marketCap : 0;
  const costOfFloat = -uwOnFloat;
  const invIncome = OPS.insuranceInvestmentIncomeAfterTaxAnnualizedM * 1_000_000;

  const latestGeico = GEICO_UNDERWRITING[GEICO_UNDERWRITING.length - 1];
  const geico2024 = GEICO_UNDERWRITING.find((r) => r.label === "2024");
  const pe2025 = PREMIUMS_EARNED_B.find((r) => r.label === "2025");
  const pe2025Total = pe2025 ? pe2025.geico + pe2025.primary + pe2025.bhrgPc : 0;
  const h1MixTotal = PREMIUM_MIX_H1_2026.reduce((s, r) => s + r.value, 0);

  const geicoRatioBars = GEICO_UNDERWRITING.map((r) => ({
    label: r.label,
    loss: r.lossRatio,
    expense: r.expenseRatio,
    combined: r.combinedRatio,
  }));

  const groupCrLines = GROUP_COMBINED.map((r) => ({
    label: r.label,
    GEICO: r.geico,
    Primary: r.primary,
    "BHRG P/C": r.bhrgPc,
  }));

  const premiumBars = PREMIUMS_EARNED_B.map((r) => ({
    label: r.label,
    GEICO: r.geico,
    Primary: r.primary,
    "BHRG P/C": r.bhrgPc,
  }));

  const floatSeries = FLOAT_HISTORY.map((p) => ({
    label: p.label,
    floatB: p.floatB,
  }));

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <p className="text-kicker uppercase text-faint">The engine</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">
            Insurance · float and underwriting
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            Insurance funds column one and, when combined ratios stay under 100, produces the
            franchise this desk capitalizes. Ratios and premiums below are from the 10-K / 10-Q
            reporting groups — GEICO, BH Primary and BHRG — not invented subsidiary valuations.
          </p>
          <nav className="mt-4 flex flex-wrap gap-1.5" aria-label="On this page">
            {TOC.map((t) => (
              <a
                key={t.href}
                href={t.href}
                className="rounded-md bg-surface-2 px-2.5 py-1.5 text-xs text-muted shadow-[var(--shadow-border)] transition-colors hover:bg-surface-3 hover:text-fg"
              >
                {t.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            k="Float"
            v={formatBillions(v.float)}
            s={`${formatPerB(floatPerB)} per B · not deducted`}
          />
          <Stat
            k="UW after-tax run-rate"
            v={formatBillions(v.insuranceRunRate)}
            s="H1 2026 annualized"
          />
          <Stat
            k="GEICO combined · H1’26"
            v={`${latestGeico.combinedRatio.toFixed(1)}%`}
            s={`Loss ${latestGeico.lossRatio.toFixed(1)} · expense ${latestGeico.expenseRatio.toFixed(1)}`}
          />
          <Stat
            k="UW / float"
            v={formatPct(uwOnFloat).replace("+", "")}
            s="Implied after-tax underwriting yield on float"
          />
        </div>

        <section
          id="engine"
          className="scroll-mt-28 rounded-xl border border-border/70 bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6"
        >
          <p className="text-kicker uppercase text-faint">How the engine works</p>
          <h2 className="mt-1 font-display text-lg font-medium tracking-tight">
            Three moving parts · only one is capitalized
          </h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {ENGINE_STEPS.map((s) => (
              <div key={s.n} className="rounded-lg bg-surface-2 px-4 py-4">
                <p className="font-mono text-xs tabular text-faint">{s.n}</p>
                <p className="mt-1 text-sm font-medium text-fg">{s.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Cost of float on this run-rate is{" "}
            <span className="font-mono tabular text-fg">{formatPct(costOfFloat)}</span>
            {costOfFloat < 0
              ? " — negative: Berkshire is being paid to hold the capital. That is the H1 2026 picture, not a law of nature."
              : " — positive: float would be expensive on this run-rate."}{" "}
            Float is {formatPct(floatShareMkt).replace("+", "")} of market cap. Franchise is{" "}
            {formatPct(franchiseShareIv).replace("+", "")} of IV at {formatMultiple(insuranceMultiple)}.
          </p>
        </section>

        <div id="ratios" className="grid scroll-mt-28 gap-6 lg:grid-cols-2">
          <ChartCard
            title="GEICO loss vs expense"
            note="Stacked ratios to premiums earned. Combined = loss + expense. Line at 100 is break-even underwriting. H1’26 is six months, not a full year."
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={geicoRatioBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis
                  tick={TICK}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 120]}
                  tickFormatter={(n: number) => `${n}%`}
                  width={40}
                />
                <ReferenceLine
                  y={100}
                  stroke="var(--color-loss)"
                  strokeDasharray="4 4"
                  label={{ value: "100", fill: "var(--color-muted)", fontSize: 10, position: "insideTopRight" }}
                />
                <Tooltip
                  contentStyle={TOOLTIP}
                  formatter={(value, name) => [`${Number(value ?? 0).toFixed(1)}%`, String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-muted)" }} />
                <Bar dataKey="loss" name="Loss ratio" stackId="r" fill="var(--color-chart-ins)" />
                <Bar
                  dataKey="expense"
                  name="Expense ratio"
                  stackId="r"
                  fill="var(--color-chart-ops)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <Insight>
              2022 was the loss-ratio spike ({GEICO_UNDERWRITING[0].lossRatio}% loss, combined{" "}
              {GEICO_UNDERWRITING[0].combinedRatio}%) — float was expensive. 2024 was the repair
              {geico2024
                ? ` (combined ${geico2024.combinedRatio}%, expense held at ${geico2024.expenseRatio}%)`
                : ""}
              . H1’26 the loss ratio has drifted up and the expense ratio is rising as GEICO
              reinvests — still profitable, no longer spectacular.
            </Insight>
          </ChartCard>

          <ChartCard
            title="Combined ratio by group"
            note="Under 100 = underwriting profit. BHRG is property/casualty only (ex life/health). H1’26 BHRG omitted — P/C vs life mix is not split in the 10-Q table we use."
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={groupCrLines} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis
                  tick={TICK}
                  axisLine={false}
                  tickLine={false}
                  domain={[70, 110]}
                  tickFormatter={(n: number) => `${n}%`}
                  width={40}
                />
                <ReferenceLine
                  y={100}
                  stroke="var(--color-loss)"
                  strokeDasharray="4 4"
                  label={{ value: "100", fill: "var(--color-muted)", fontSize: 10, position: "insideTopRight" }}
                />
                <Tooltip
                  contentStyle={TOOLTIP}
                  formatter={(value, name) =>
                    value == null ? ["—", String(name)] : [`${Number(value).toFixed(1)}%`, String(name)]
                  }
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-muted)" }} />
                <Line
                  type="monotone"
                  dataKey="GEICO"
                  stroke="var(--color-chart-ins)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="Primary"
                  stroke="var(--color-chart-ops)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="BHRG P/C"
                  stroke="var(--color-chart-public)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <Insight>
              GEICO is a low-expense machine (~10–14%). Primary is specialty commercial: expense
              ratio near 28%, so a mid-90s combined is still an underwriting profit. Reinsurance
              P/C has run the mid-80s — catastrophe years will move it.
            </Insight>
          </ChartCard>
        </div>

        <div id="premiums" className="grid scroll-mt-28 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <ChartCard
            title="Premiums earned by group"
            note="Calendar-year P/C earned premium, $ billions. BHRG excludes life/health (~$5B a year). Alleghany/TransRe sits inside BHRG/Primary from 2022."
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={premiumBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis
                  tick={TICK}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(n: number) => `$${n}B`}
                  width={44}
                />
                <Tooltip
                  contentStyle={TOOLTIP}
                  formatter={(value, name) => [`$${Number(value ?? 0).toFixed(1)}B`, String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-muted)" }} />
                <Bar dataKey="GEICO" stackId="p" fill="var(--color-chart-ins)" />
                <Bar dataKey="Primary" stackId="p" fill="var(--color-chart-ops)" />
                <Bar
                  dataKey="BHRG P/C"
                  stackId="p"
                  fill="var(--color-chart-public)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <Insight>
              {pe2025
                ? `In 2025 GEICO was ${((pe2025.geico / pe2025Total) * 100).toFixed(0)}% of this P/C earned book, Primary ${((pe2025.primary / pe2025Total) * 100).toFixed(0)}%, BHRG P/C ${((pe2025.bhrgPc / pe2025Total) * 100).toFixed(0)}%. `
                : ""}
              Volume is not the franchise — combined ratio is. GEICO’s 2024 profit came from a
              better loss ratio on a book that barely grew in 2022–23.
            </Insight>
          </ChartCard>

          <ChartCard
            title="H1 2026 earned mix"
            note={`Six months ended June 30, 2026. BHRG here includes life/health. Total ${h1MixTotal.toFixed(1)}B earned.`}
          >
            <div className="relative">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[...PREMIUM_MIX_H1_2026]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {PREMIUM_MIX_H1_2026.map((s) => (
                      <Cell key={s.name} fill={s.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP}
                    formatter={(value, name) => [`$${Number(value ?? 0).toFixed(1)}B`, String(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-mono text-lg tabular tracking-tight text-fg">
                  ${h1MixTotal.toFixed(1)}B
                </p>
                <p className="text-kicker uppercase text-faint">H1 earned</p>
              </div>
            </div>
            <ul className="mt-1 space-y-1.5 text-xs text-muted">
              {PREMIUM_MIX_H1_2026.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ background: s.fill }}
                    />
                    {s.name}
                  </span>
                  <span className="font-mono tabular text-fg">
                    ${s.value.toFixed(1)}B · {((s.value / h1MixTotal) * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </ChartCard>
        </div>

        <section
          id="ledger"
          className="scroll-mt-28 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6"
        >
          <h2 className="font-display text-lg font-medium tracking-tight">GEICO underwriting ledger</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            The auto book is large enough that its loss ratio is the swing factor for Berkshire’s
            cost of float. H1’26 is not annualized.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-kicker uppercase text-faint">
                  <th className="py-2 font-medium">Period</th>
                  <th className="py-2 text-right font-medium">Earned</th>
                  <th className="py-2 text-right font-medium">Loss</th>
                  <th className="py-2 text-right font-medium">Expense</th>
                  <th className="py-2 text-right font-medium">Combined</th>
                  <th className="py-2 text-right font-medium">UW pretax</th>
                </tr>
              </thead>
              <tbody>
                {GEICO_UNDERWRITING.map((r) => (
                  <tr key={r.label} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5">
                      {r.label}
                      {r.halfYear ? (
                        <span className="ml-2 text-xs text-muted">half year</span>
                      ) : null}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular">
                      {formatBillions(r.premiumsEarnedM * 1_000_000)}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular">{r.lossRatio.toFixed(1)}%</td>
                    <td className="py-2.5 text-right font-mono tabular">
                      {r.expenseRatio.toFixed(1)}%
                    </td>
                    <td
                      className={`py-2.5 text-right font-mono tabular ${
                        r.combinedRatio > 100 ? "text-loss" : "text-gain"
                      }`}
                    >
                      {r.combinedRatio.toFixed(1)}%
                    </td>
                    <td
                      className={`py-2.5 text-right font-mono tabular ${
                        r.uwPretaxM < 0 ? "text-loss" : "text-fg"
                      }`}
                    >
                      {formatBillions(r.uwPretaxM * 1_000_000)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">{INSURANCE_DATA_SOURCE}</p>
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-kicker uppercase text-faint">Desk treatment</p>
              <h2 className="mt-1 font-display text-lg font-medium tracking-tight">
                Capitalize underwriting · do not add float
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                {INSURANCE_GROUP.description} Slider is the same control as Overview — it writes to
                one store.
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl tabular">{formatBillions(v.insurance)}</p>
              <p className="text-kicker text-faint">
                {formatBillions(v.insuranceRunRate)} × {formatMultiple(insuranceMultiple)}
              </p>
            </div>
          </div>

          <div className="mt-5 max-w-lg">
            <div className="flex items-baseline justify-between text-xs text-muted">
              <span>After-tax underwriting multiple</span>
              <Hint label={INSURANCE_GROUP.multipleNote}>
                <button type="button" className="inline-flex items-center gap-1">
                  Why {formatMultiple(DEFAULT_INSURANCE_MULTIPLE)}
                  <Info className="size-3" />
                </button>
              </Hint>
            </div>
            <Slider
              className="mt-2"
              min={INSURANCE_MULTIPLE_MIN}
              max={INSURANCE_MULTIPLE_MAX}
              step={0.5}
              value={[insuranceMultiple]}
              onValueChange={([n]) => setInsuranceMultiple(n ?? DEFAULT_INSURANCE_MULTIPLE)}
              aria-label="Insurance underwriting multiple"
            />
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            <Mini k="In IV" val={`${formatBillions(v.insurance)} franchise`} />
            <Mini k="Not in IV" val={`${formatBillions(v.float)} float`} />
            <Mini
              k="Also not in IV"
              val={`${formatBillions(invIncome)} investment income (yield on column one)`}
            />
          </dl>
        </section>

        <section
          id="float"
          className="scroll-mt-28 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6"
        >
          <h2 className="font-display text-lg font-medium tracking-tight">Float through time</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            Year-end figures reconstructed from 10-Ks and shareholder letters; Q2 2026 is the desk
            seed ({formatBillions(v.float)}). Not XBRL-tagged.
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height={256}>
              <AreaChart data={floatSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis
                  tick={TICK}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(n: number) => `$${n}B`}
                  width={44}
                />
                <Tooltip
                  contentStyle={TOOLTIP}
                  formatter={(value) => [`$${Number(value ?? 0).toFixed(1)}B`, "Float"]}
                />
                <Area
                  type="monotone"
                  dataKey="floatB"
                  stroke="var(--color-chart-ins)"
                  fill="var(--color-chart-ins)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">The insurance book</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            2025 calendar-year P/C earned premium and combined ratio at the reporting-group grain
            Berkshire actually publishes.
          </p>
          <ul className="mt-4 divide-y divide-border/70">
            {INSURANCE_HOUSES.map((h) => (
              <li key={h.name} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <div className="min-w-0 max-w-3xl">
                  <p className="text-sm font-medium text-fg">{h.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{h.role}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm tabular text-fg">${h.pe2025B.toFixed(1)}B earned</p>
                  <p className="text-kicker text-faint">
                    {h.cluster} · CR {h.cr2025.toFixed(1)}%
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border/70 bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <p className="text-kicker uppercase text-faint">Letter-grounded</p>
          <h2 className="mt-1 font-display text-lg font-medium tracking-tight">
            What the letters ask owners to notice
          </h2>
          <p className="mt-1 text-xs text-muted">
            Paraphrase only. Originals on{" "}
            <a
              href="https://www.berkshirehathaway.com/letters/letters.html"
              className="text-fg underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              berkshirehathaway.com
            </a>
            . Also{" "}
            <Link to="/methodology" className="text-fg underline-offset-2 hover:underline">
              Letters & Lessons
            </Link>
            .
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {LETTER_NOTES.map((n) => (
              <div key={n.title} className="rounded-lg bg-surface-2 px-4 py-3">
                <p className="text-sm font-medium text-fg">{n.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{n.body}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-xs text-muted">
          {INSURANCE_DATA_SOURCE} Float is a judgement input — see{" "}
          <Link to="/data" className="text-fg underline-offset-2 hover:underline">
            Sources
          </Link>
          . Unofficial estimate, not investment advice.
        </p>
      </main>
    </AppShell>
  );
}

function ChartCard({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <h2 className="font-display text-lg font-medium tracking-tight">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">{note}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Insight({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-xs leading-relaxed text-muted">{children}</p>;
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

function Mini({ k, val }: { k: string; val: string }) {
  return (
    <div>
      <dt className="text-kicker uppercase text-faint">{k}</dt>
      <dd className="mt-1 text-sm text-fg">{val}</dd>
    </div>
  );
}
