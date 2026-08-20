import { AppShell } from "@/components/app-shell";
import { Link } from "@tanstack/react-router";

export function LegalPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
        <div>
          <p className="text-kicker uppercase text-faint">Legal</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Disclaimer, trademarks and privacy
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Please read this before using Berkshire Desk. Using the site means you accept these
            terms. This page is a notice, not legal advice.
          </p>
        </div>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Independence</h2>
          <p>
            Berkshire Desk is an independent, unofficial research site. It is not affiliated with,
            endorsed by, sponsored by, or connected to Berkshire Hathaway Inc., Warren Buffett,
            Greg Abel, or any Berkshire subsidiary. Nothing here is an official Berkshire
            communication.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Trademarks</h2>
          <p>
            Berkshire Hathaway®, BRK.A, BRK.B, and the names of Berkshire’s businesses are
            trademarks or trade names of Berkshire Hathaway Inc. or its affiliates. They are used
            here only to identify the public company this unofficial model is about (nominative
            fair use). This site does not use Berkshire’s corporate logo. “Berkshire Desk” is an
            independent name for this research tool and does not imply any licence from Berkshire
            Hathaway Inc.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Not investment advice</h2>
          <p>
            Nothing on this site is investment, tax, legal or accounting advice. Nothing is a
            recommendation, solicitation, or invitation to buy, sell or hold any security. Intrinsic
            value figures are <em>our estimates</em>, not facts, not a price target, and not a
            statement of what Berkshire is “worth.” Do not make investment decisions based on this
            desk. Do your own work, or consult a qualified adviser authorised in your jurisdiction.
          </p>
          <p>
            This site is not a registered investment adviser, broker-dealer, or commodity trading
            advisor. It is not authorised or regulated by the UK Financial Conduct Authority. It is
            not a financial promotion and is not an invitation or inducement to engage in
            investment activity under the UK Financial Services and Markets Act 2000.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Estimates and no warranty</h2>
          <p>
            Filings, prices and exchange rates can be delayed, incomplete or wrong. Some inputs are
            seeded judgements (for example Japan ownership percentages, warrant terms, and the
            multiples you choose). The model can contain errors. Data is provided “as is,” without
            warranty of any kind, express or implied, including accuracy, merchantability, or
            fitness for a particular purpose.
          </p>
          <p>
            To the fullest extent permitted by law, the operator of Berkshire Desk is not liable
            for any loss or damage arising from use of the site, including trading losses, data
            errors, or downtime.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Shareholder letters</h2>
          <p>
            Warren Buffett’s shareholder letters and the Owner’s Manual are copyrighted works of
            Berkshire Hathaway Inc. This site does not reproduce those documents. Summaries on the
            Letters page are our own paraphrases for commentary, with links to the originals on
            Berkshire’s website. Read the letters there. They are the primary source.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Data sources</h2>
          <p>
            SEC EDGAR filings are public records. Market prices and FX are taken from third-party
            public feeds (currently Yahoo Finance, with a Stooq fallback). Those providers are not
            affiliated with this site and do not endorse it. See{" "}
            <Link to="/data" className="text-fg underline-offset-2 hover:underline">
              Sources
            </Link>{" "}
            for what is automatic versus seeded.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Privacy</h2>
          <p>
            Preferences (theme, multiples, last-visit snapshot) are stored in your browser’s
            localStorage. They are not sent to us as a profile. Optional sign-in, if you use it,
            stores only what the auth provider supplies (typically name and email) to keep a
            session. We do not sell personal data. Server logs may include standard request
            metadata. Analytics, if enabled, is used only to understand aggregate traffic.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl font-medium text-fg">Governing notice</h2>
          <p>
            If any part of this notice is held unenforceable, the rest still applies. We may update
            this page. The version on the site when you use it is the one that applies.
          </p>
        </section>
      </main>
    </AppShell>
  );
}
