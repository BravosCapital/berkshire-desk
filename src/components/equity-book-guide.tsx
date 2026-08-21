import { Link } from "@tanstack/react-router";

/**
 * Structural guide only — not stock theses.
 * Letter-grounded notes limited to names Buffett has publicly framed.
 */
const LETTER_CONTEXT: Array<{ ticker: string; note: string }> = [
  {
    ticker: "KO",
    note: "Long-standing franchise holding: durable brand economics and distribution, often cited in the letters as a model of predictable consumer demand rather than a trading idea.",
  },
  {
    ticker: "AXP",
    note: "Framed in the letters as a high-quality financial franchise with network and card-member economics — closer to a business partnership than a pure portfolio ticker.",
  },
  {
    ticker: "AAPL",
    note: "Treated in later letters as a consumer-ecosystem holding of unusual scale; still marked here as a public equity, not as an operating subsidiary.",
  },
  {
    ticker: "Japan",
    note: "The five sogo shosha are a stake basket disclosed outside the 13F. Read them as one capital allocation theme (trading houses / Japan equity exposure), not five unrelated single-stock stories.",
  },
];

export function EquityBookGuide() {
  return (
    <section className="rounded-xl border border-border/70 bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <p className="text-kicker uppercase text-faint">How to read this book</p>
      <h2 className="mt-1 font-display text-lg font-medium tracking-tight">
        Equity portfolio · owner framing
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        This is not a stock-picking screen. It is the public half of Berkshire’s investment column:
        share counts from the latest 13F (and Japan ownership filings), marked at daily session
        closes. The desk does not invent a thesis for every name — most 13F lines are positions, not
        memos.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Frame
          title="Operating cousins vs pure portfolio"
          body="Some large holdings behave like long-duration business partnerships (consumer franchises, card networks). Others are more pure portfolio capital. Both sit in the same 13F table; the distinction is interpretive, not accounting."
        />
        <Frame
          title="Japan as a basket"
          body="Mitsubishi, Mitsui, Itochu, Marubeni and Sumitomo are shown with ownership %. Treat the group as one allocation theme disclosed outside U.S. 13F rules, not five independent ideas."
        />
        <Frame
          title="Cash is the residual"
          body="When the public book is quiet, the interesting capital is often I&O cash on the Overview — dry powder for buybacks, whole-business deals, or patience. Equity weights alone understate that optionality."
        />
      </div>

      <div className="mt-5 rounded-lg bg-surface-2 px-4 py-3">
        <p className="text-kicker uppercase text-faint">Letter-grounded context · selected only</p>
        <p className="mt-1 text-xs text-muted">
          Short structural notes where the annual letters have framed the holding. Not
          recommendations; not complete theses. See{" "}
          <Link to="/methodology" className="text-fg underline-offset-2 hover:underline">
            Letters & Lessons
          </Link>
          .
        </p>
        <ul className="mt-3 space-y-2.5">
          {LETTER_CONTEXT.map((row) => (
            <li key={row.ticker} className="text-sm leading-relaxed">
              <span className="font-mono text-xs font-medium text-fg">{row.ticker}</span>
              <span className="ml-2 text-muted">{row.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Frame({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg bg-surface-2 px-4 py-3">
      <p className="text-sm font-medium text-fg">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">{body}</p>
    </div>
  );
}
