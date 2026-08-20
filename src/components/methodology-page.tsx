import { AppShell } from "@/components/app-shell";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

const LETTERS = [
  {
    year: "Owner’s Manual",
    title: "Intrinsic value defined",
    takeaway:
      "Intrinsic value is the discounted value of the cash that can be taken out of a business during its remaining life. It is the only logical approach to evaluating the relative attractiveness of investments and businesses.",
    href: "https://www.berkshirehathaway.com/ownman.pdf",
  },
  {
    year: "1990s–2010s",
    title: "The two-column approach",
    takeaway:
      "Berkshire can be thought of as two parts: a pile of investments (stocks, bonds, cash) and a collection of operating businesses. Column one is marked at market. Column two is the equity value of the wholly-owned companies, best estimated by capitalizing after-interest earnings.",
    href: "https://www.berkshirehathaway.com/letters/letters.html",
  },
  {
    year: "Multiple letters",
    title: "Float is not a conventional liability",
    takeaway:
      "Insurance float appears as a liability on the balance sheet. When underwriting is profitable (or break-even), that float is cost-free or better — revolving capital that can be invested for shareholders. Deducting it in full from intrinsic value double-counts the capital structure.",
    href: "https://www.berkshirehathaway.com/letters/letters.html",
  },
  {
    year: "2018–2024",
    title: "Operating earnings over GAAP noise",
    takeaway:
      "Mark-to-market swings in the equity portfolio create large, volatile GAAP earnings. Buffett has repeatedly asked shareholders to focus on operating earnings — the real economic progress of the businesses — and to ignore the accounting volatility of unrealized gains and losses.",
    href: "https://www.berkshirehathaway.com/letters/2024ltr.pdf",
  },
  {
    year: "Ongoing",
    title: "Capital allocation and ownership",
    takeaway:
      "The long-term goal is to maximize the average annual rate of gain in intrinsic business value on a per-share basis. Share repurchases only make sense when the stock trades below a conservative estimate of intrinsic value. The preferred holding period is forever.",
    href: "https://www.berkshirehathaway.com/letters/letters.html",
  },
] as const;

export function MethodologyPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
        <div>
          <p className="text-kicker uppercase text-faint">Philosophy</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Letters & Lessons
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            This desk is a living application of ideas Warren Buffett has written about for decades.
            The model is independent and imperfect. The letters remain the primary source.
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
            Key takeaways from the letters
          </h2>
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

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Disclaimer</h2>
          <p>
            This is an independent research desk. It is not affiliated with Berkshire Hathaway Inc.,
            not investment advice, and not an offer to buy or sell securities. Intrinsic value is an
            estimate. The letters are the authoritative source. Do your own work.
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
