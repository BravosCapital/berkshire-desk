# Berkshire Desk

Live two-column intrinsic value tracker for Berkshire Hathaway (BRK.A / BRK.B).

Independent research. Not affiliated with Berkshire Hathaway Inc. Not investment advice.

## What it does

Intrinsic value is estimated as:

**public equities (live) + I&O cash and T-bills + other investments + capitalized operating businesses + insurance underwriting franchise − parent bonds**

Insurance float, deferred tax, and railroad/utility debt are **not** subtracted. Operating earnings are after interest, so those liabilities are already inside the multiple.

- **13F share counts and 10-Q cash/debt/share count/segment pretax** auto-pull from SEC EDGAR.
- **Prices** from Yahoo Finance about every 60 seconds.
- Default **15× pretax** on non-insurance ops and **8× after-tax underwriting**. Sliders persist in the browser.
- Japan trading-house **ownership %**, float, and Occidental warrant terms stay seeded (not in the 13F / not tagged in XBRL).

See `/data` in the app for the live ledger of auto vs seeded inputs.

## Deploy live (Vercel)

The app is already wired for Vercel (Nitro `vercel` preset). This sandbox cannot log into your Vercel account — you import the GitHub repo once, then every push to `main` ships.

1. Open **[vercel.com/new](https://vercel.com/new)** and sign in with GitHub (`BravosCapital`).
2. Import **[BravosCapital/berkshire-desk](https://github.com/BravosCapital/berkshire-desk)**.
3. Leave the defaults:
   - Framework: Other
   - Build command: `npm run build`
   - Install command: `npm ci`
   - Node: 22
4. Optional environment variables (Project → Settings → Environment Variables):

   | Name | Required | Purpose |
   |---|---|---|
   | `EDGAR_USER_AGENT` | recommended | SEC requires a contact. Example: `BerkshireDesk/1.0 you@email.com` |
   | `DATABASE_URL` | no | Neon Postgres if you want the filings cache to persist across cold starts. Without it, PGLite + seed fallback still works. |
   | `BETTER_AUTH_SECRET` | no | Only if you turn on sign-in. The desk is public without it. |

5. Click **Deploy**. First build takes ~2 minutes. You get a URL like `https://berkshire-desk.vercel.app`.
6. Custom domain: Project → Settings → Domains → add `desk.yourdomain.com` (or similar) and set the DNS record Vercel shows.

After that, pushing to `main` auto-deploys. No extra CLI step.

## Run locally

```bash
npm install
npm run dev
```

App binds `0.0.0.0:8080`. Postgres is optional — without `DATABASE_URL` it uses embedded PGLite.

```bash
npm run typecheck
npm test
npm run build
```

## Updating after a quarter

You do **not** re-type the 13F or 10-Q. The server reads Berkshire’s latest 13F-HR and 10-Q/10-K instance from EDGAR, caches them for six hours, and feeds the model. Press **Refresh filings** on the Data page the morning a filing drops.

Rare manual seeds (in `src/lib/valuation/`):

- Japanese ownership percentages
- Insurance float (Capital page only)
- Occidental warrant count / strike
- T-bill payable (untagged, ~$771m)
- New 13F CUSIPs in `src/lib/filings/cusip.ts` (unmapped names still sit in IV at carrying value)

## Stack

TanStack Start, React 19, Tailwind v4, Recharts, Zustand, Better Auth. Deploy target: Vercel.
