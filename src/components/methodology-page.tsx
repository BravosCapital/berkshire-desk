import { AppShell } from "@/components/app-shell";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

const LETTERS = [
  {
    year: "Owner’s Manual",
    title: "Intrinsic value, as Berkshire describes it",
    takeaway:
      "Berkshire’s Owner’s Manual describes the worth of a business as the cash it can distribute over its remaining life, discounted. That idea is the starting point for this unofficial model. The wording here is our paraphrase — read the original.",
    href: "https://www.berkshirehathaway.com/ownman.pdf",
  },
  {
    year: "Shareholder letters",
    title: "Two columns, not one pile of assets",
    takeaway:
      "The letters describe Berkshire as two parts: investments marked at market, and wholly-owned operating businesses whose equity value is estimated from after-interest earnings. This desk follows that split. Our summary, not a quotation.",
    href: "https://www.berkshirehathaway.com/letters/letters.html",
  },
  {
    year: "Shareholder letters",
    title: "How this desk treats float",
    takeaway:
      "Insurance float is a balance-sheet liability. When underwriting is profitable, Berkshire has described that float as cheap revolving capital. This model therefore does not deduct float as if it were ordinary debt. That is our modelling choice, explained against the letters — not Berkshire’s official valuation of itself.",
    href: "https://www.berkshirehathaway.com/letters/letters.html",
  },
  {
    year: "Shareholder letters",
    title: "Operating earnings, not GAAP noise",
    takeaway:
      "GAAP earnings swing with unrealized gains and losses on the stock portfolio. The letters ask readers to look at operating earnings instead. This desk capitalizes operating earnings, not mark-to-market GAAP. Paraphrase only — see the letters.",
    href: "https://www.berkshirehathaway.com/letters/2024ltr.pdf",
  },
  {
    year: "Shareholder letters",
    title: "Per-share value and buybacks",
    takeaway:
      "Berkshire has described its aim as growing per-share intrinsic value, and has said buybacks make sense only below a conservative estimate of that value. That is Berkshire’s stated policy, not a buy or sell recommendation from this desk.",
    href: "https://www.berkshirehathaway.com/letters/letters.html",
  },
] as const;

const FAQS = [
  {
    q: "What is Berkshire Desk?",
    a: "Berkshire Desk is an independent, unofficial research tool that publishes a two-column SOTP estimate for Berkshire Hathaway (BRK.A / BRK.B). It is not affiliated with, endorsed by, or sponsored by Berkshire Hathaway Inc. It is not investment advice.",
  },
  {
    q: "How is Berkshire Hathaway’s intrinsic value estimated?",
    a: "This desk’s estimate is the sum of two columns: investments at market plus a capitalized estimate of wholly-owned operating businesses and the insurance underwriting franchise, less parent-level bonds only. The result is an estimate, not a fact and not Berkshire’s own figure.",
  },
  {
    q: "Why isn’t insurance float deducted from intrinsic value?",
    a: "This model does not deduct float as ordinary debt, because when underwriting is profitable the letters describe float as cheap revolving capital. That is a modelling choice. It is not a statement of how Berkshire officially values itself. The Insurance page walks through the engine.",
  },
  {
    q: "Should I look at GAAP earnings or operating earnings?",
    a: "This desk capitalizes operating earnings rather than GAAP earnings, because mark-to-market swings on the equity portfolio can dominate the latter. That is a modelling choice, not advice about what you should buy or sell.",
  },
  {
    q: "Where can I read Warren Buffett’s shareholder letters?",
    a: "On Berkshire Hathaway’s own website. This desk paraphrases ideas from those public letters and links to them. It does not reproduce the letters. They remain the primary source.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export function MethodologyPage() {
  return (
    <AppShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
        <div>
          <p className="text-kicker uppercase text-faint">Philosophy</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Letters & Lessons
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            This desk is an independent, unofficial application of ideas discussed in Berkshire’s
            public shareholder letters. The model is imperfect. The letters on Berkshire’s own
            site remain the primary source. Nothing here is a quotation of those letters.
          </p>
        </div>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">
            How this desk is built
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Intrinsic value is estimated as the sum of two columns: investments at market (cash,
            T-bills, public equities, Japan trading houses, other holdings) plus the equity value of
            the wholly-owned operating businesses (capitalized pretax earnings) and the insurance
            underwriting franchise, less parent-level bonds only. Float and deferred tax are not
            deducted — they already fund or sit inside the columns above.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Multiples, share counts and segment earnings are adjustable so you can test your own
            assumptions. The numbers are live where possible; the framing comes from the letters.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="font-display text-xl font-medium tracking-tight">
            Key takeaways (our paraphrases)
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            These are unofficial summaries for commentary. They are not quotations. Copyright in
            the letters belongs to Berkshire Hathaway Inc. — follow the link and read the original.
          </p>
          <div className="space-y-5">
            {LETTERS.map((item) => (
              <article
                key={item.title}
                className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-kicker uppercase text-faint">{item.year}</p>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-fg"
                  >
                    Read the letter
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
                <h3 className="mt-1.5 font-display text-lg font-medium tracking-tight text-fg">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.takeaway}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Full archive
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Every annual letter from 1977 onward is available on Berkshire’s site. The Owner’s Manual
            remains the clearest short statement of the principles that guide this desk.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a
              href="https://www.berkshirehathaway.com/letters/letters.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-fg underline-offset-2 hover:underline"
            >
              All shareholder letters
              <ExternalLink className="size-3.5" />
            </a>
            <a
              href="https://www.berkshirehathaway.com/ownman.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-fg underline-offset-2 hover:underline"
            >
              Owner’s Manual
              <ExternalLink className="size-3.5" />
            </a>
            <a
              href="https://www.berkshirehathaway.com/letters/2024ltr.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-fg underline-offset-2 hover:underline"
            >
              2024 letter
              <ExternalLink className="size-3.5" />
            </a>
            <a
              href="https://www.berkshirehathaway.com/letters/2025ltr.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-fg underline-offset-2 hover:underline"
            >
              2025 letter
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-display text-xl font-medium tracking-tight">FAQ</h2>
          <div className="space-y-4">
            {FAQS.map((item) => (
              <article
                key={item.q}
                className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6"
              >
                <h3 className="font-display text-base font-medium tracking-tight text-fg">
                  {item.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Disclaimer</h2>
          <p>
            This is an independent, unofficial research desk. It is not affiliated with, endorsed
            by, or sponsored by Berkshire Hathaway Inc. It is not investment advice, not a
            recommendation, and not an offer to buy or sell securities. Intrinsic-value figures are
            estimates. The letters are the authoritative source. Do your own work. Full notice on
            the{" "}
            <Link to="/legal" className="text-fg underline-offset-2 hover:underline">
              Legal
            </Link>{" "}
            page.
          </p>
          <p>
            Technical sources and filing status live on the{" "}
            <Link to="/data" className="text-fg underline-offset-2 hover:underline">
              Sources
            </Link>{" "}
            page.
          </p>
        </section>
      </main>
    </AppShell>
  );
}
