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

TanStack Start, React 19, Tailwind v4, Recharts, Zustand, Better Auth.
