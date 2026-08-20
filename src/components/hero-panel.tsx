import { useMemo } from "react";
import { AnimatedNumber } from "@/components/animated-number";
import { Badge } from "@/components/ui/badge";
import { Hint } from "@/components/ui/tooltip";
import type { Valuation } from "@/lib/valuation/compute";
import { computeImpliedMultiple } from "@/lib/valuation/scenarios";
import { formatMultiple, formatPerA, formatPerB, formatPct } from "@/lib/valuation/format";
import { quoteModeLabel, type QuoteHealth } from "@/lib/data-health";
import { Info } from "lucide-react";

function Gauge({ premium }: { premium: number }) {
  const clamped = Math.max(-0.4, Math.min(0.4, premium));
  const t = (clamped + 0.4) / 0.8;
  const cx = 120;
  const cy = 110;
  const r = 86;
  const angle = Math.PI * (1 - t);
  const nx = cx + r * Math.cos(angle);
  const ny = cy - r * Math.sin(angle);
  const isDiscount = premium <= 0;
  const tone = isDiscount ? "gain" : premium < 0.1 ? "warn" : "loss";

  return (
    <svg viewBox="0 0 240 132" className="w-full max-w-xs" aria-hidden="true">
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="var(--color-surface-3)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`}
        fill="none"
        stroke="var(--color-gain)"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="var(--color-loss)"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.9"
      />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--color-fg)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4.5" fill="var(--color-fg)" />
      <text x="16" y="128" fill="var(--color-muted)" fontSize="10" fontFamily="var(--font-mono)">
        −40%
      </text>
      <text x="104" y="128" fill="var(--color-muted)" fontSize="10" fontFamily="var(--font-mono)">
        Fair
      </text>
      <text x="196" y="128" fill="var(--color-muted)" fontSize="10" fontFamily="var(--font-mono)">
        +40%
      </text>
      <text
        x={cx}
        y="78"
        textAnchor="middle"
        fill={`var(--color-${tone})`}
        fontSize="12"
        fontFamily="var(--font-mono)"
      >
        {isDiscount ? "Discount" : "Premium"}
      </text>
    </svg>
  );
}

export function HeroPanel({ v, quoteHealth }: { v: Valuation; quoteHealth?: QuoteHealth }) {
  const premium = v.premiumB;
  const tone = premium <= 0 ? "gain" : premium < 0.1 ? "warn" : "loss";
  const label = premium <= 0 ? "trading below estimate" : "trading above estimate";
  const pxChg = v.prevPriceB ? (v.priceB - v.prevPriceB) / v.prevPriceB : 0;
  const implied = useMemo(() => computeImpliedMultiple(v), [v]);
  const mode = quoteHealth?.mode ?? (v.live ? "live" : "seed");

  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-kicker font-medium uppercase text-faint">Unofficial estimate · BRK.B</p>
        <Hint label="Two-column estimate: investments at market (cash, public equities, bonds, preferreds) plus capitalized after-interest operating earnings plus an insurance underwriting franchise, minus parent-level bonds only. Float, deferred tax, and railroad/utility debt are not deducted — they already fund or sit inside the columns above.">
          <button type="button" className="text-faint hover:text-muted" aria-label="What is intrinsic value">
            <Info className="size-3.5" />
          </button>
        </Hint>
        {mode === "live" ? (
          <Badge>Live marks</Badge>
        ) : mode === "partial" ? (
          <Badge tone="warn">
            Partial · {quoteHealth?.liveCount}/{quoteHealth?.requested}
          </Badge>
        ) : (
          <Badge tone="warn">
            Seeded · {quoteHealth?.fallbackAsOf ?? "see Sources"}
          </Badge>
        )}
      </div>

      <div className="mt-4 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
        <div>
          <AnimatedNumber
            value={v.ivPerB}
            format={formatPerB}
            className="font-mono text-display font-medium tabular tracking-tight text-fg"
          />
          <p className="mt-1 text-sm text-muted">Estimated intrinsic value per Class B share</p>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div>
              <p className="text-kicker uppercase text-faint">Market · BRK.B</p>
              <p className="font-mono text-lg tabular">
                {formatPerB(v.priceB)}{" "}
                <span className={pxChg >= 0 ? "text-gain" : "text-loss"}>{formatPct(pxChg)}</span>
              </p>
            </div>
            <div>
              <p className="text-kicker uppercase text-faint">IV · BRK.A</p>
              <p className="font-mono text-lg tabular">{formatPerA(v.ivPerA)}</p>
            </div>
            <div>
              <p className="text-kicker uppercase text-faint">Market · BRK.A</p>
              <p className="font-mono text-lg tabular">{formatPerA(v.priceA)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone={tone}>
              {formatPct(premium)} {premium <= 0 ? "discount" : "premium"}
            </Badge>
            <span className="text-sm text-muted">{label}</span>
          </div>

          {mode !== "live" ? (
            <p className="mt-3 text-xs text-warn">
              {quoteModeLabel(mode)}. Portfolio values and IV use{" "}
              {mode === "seed" ? "seeded" : "mixed live/seeded"} marks
              {quoteHealth?.fallbackAsOf ? ` (seed table ${quoteHealth.fallbackAsOf})` : ""}.
            </p>
          ) : null}

          {implied.impliedMultiple !== null ? (
            <p className="mt-3 text-xs text-muted">
              Market is paying roughly{" "}
              <span className="font-mono tabular text-fg">
                {formatMultiple(implied.impliedMultiple)}
              </span>{" "}
              pretax for the operating businesses after stripping investments and the insurance
              franchise. Desk default is {formatMultiple(v.multiple)}.
            </p>
          ) : null}
        </div>
        <div className="justify-self-center lg:justify-self-end">
          <Gauge premium={premium} />
        </div>
      </div>
    </section>
  );
}
