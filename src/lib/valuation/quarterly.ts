/**
 * FALLBACK SEEDS — used when EDGAR is unreachable.
 * The live desk pulls the latest 13F and 10-Q from SEC and overrides these.
 * Remaining judgement inputs (multiples, Japan ownership %, float, OXY warrants,
 * T-bill payable, MD&A subgroup mix) stay here on purpose.
 *
 * All dollar figures are USD millions unless noted. Share counts are units.
 */

export const FILING = {
  periodEnd: "2026-06-30",
  tenQFiled: "2026-08-10",
  thirteenFFiled: "2026-08-14",
  thirteenFPeriod: "2026-06-30",
  shareCountAsOf: "2026-07-29",
  japaneseAsOf: "2026-07-01",
  sourceTenQ: "Berkshire Hathaway 10-Q for the quarter ended June 30, 2026",
  source13F: "Form 13F-HR filed August 14, 2026 (period June 30, 2026)",
  sourceEarnings:
    "Berkshire Hathaway earnings release dated August 8, 2026",
} as const;

/** Cash and cash equivalents, consolidated. 10-Q Jun 30, 2026. */
export const CASH_AND_EQUIVALENTS_M = 40_609;
export const CASH_BREAKDOWN = {
  insuranceAndOther: 35_096,
  railroadUtilitiesEnergy: 5_513,
} as const;

/**
 * Short-term investments in U.S. Treasury Bills (consolidated).
 * Includes $771m of unsettled purchases (also in liabilities). Not XBRL-tagged.
 */
export const TREASURY_BILLS_M = 324_905;
export const TBILL_PAYABLE_M = 771;

/**
 * Berkshire's preferred cash metric: Insurance & Other cash + T-bills,
 * net of T-bill payables. 35,096 + 324,905 − 771 = 359,230.
 */
export const CASH_PREFERRED_M =
  CASH_BREAKDOWN.insuranceAndOther + TREASURY_BILLS_M - TBILL_PAYABLE_M;

/** Gross cash + T-bills (includes RUE working cash). Display only. */
export const CASH_GROSS_M = CASH_AND_EQUIVALENTS_M + TREASURY_BILLS_M;

/**
 * Available-for-sale debt securities (I&O). 10-Q Jun 30, 2026.
 * Not the equity-method total ($19.9B) — that includes KHC/OXY already in the 13F.
 */
export const FIXED_MATURITY_M = 17_034;

/**
 * Equity-method affiliates on the 10-Q: Kraft Heinz, Occidental common, Berkadia.
 * KHC and OXY common are marked live in the 13F, so they are NOT added again.
 * Residual is Berkadia commercial-mortgage joint venture (~$0.46B carrying).
 */
export const EQUITY_METHOD_REPORTED_M = 19_948;
export const EQUITY_METHOD_RESIDUAL_M = 461;

/**
 * Occidental 8% preferred — original $10B commitment. 10-Q tags $8.5B
 * remaining liquidation value. Seed matches the tagged figure so a cold
 * start does not jump $1.5B when EDGAR answers.
 */
export const OXY_PREFERRED_M = 8_500;

/** Occidental common-stock warrants. Strike $59.62; 83.858m shares. */
export const OXY_WARRANTS = {
  shares: 83_858_816,
  strike: 59.62,
  ticker: "OXY",
} as const;

/** Total liabilities, consolidated, 10-Q Jun 30, 2026. Display / capital stack. */
export const TOTAL_LIABILITIES_M = 512_894;

/** Berkshire shareholders' equity (book), for reference. */
export const BOOK_EQUITY_M = 747_910;

export const CAPITAL = {
  floatM: 177_500,
  deferredTaxM: 90_176,
  parentDebtM: 20_400,
  bhfcDebtM: 18_200,
  bnsfDebtM: 23_530,
  bheDebtM: 61_800,
  ioNotesM: 43_302,
  rueNotesM: 85_297,
  ioLiabilitiesM: 309_999,
  rueLiabilitiesM: 112_719,
} as const;

export const CLASS_A_SHARES = 488_450;
export const CLASS_B_SHARES = 1_408_035_161;
export const A_PER_B = 1500;

export const A_EQUIVALENT = CLASS_A_SHARES + CLASS_B_SHARES / A_PER_B;

export const OPS = {
  bnsfPretaxAnnualizedM: 7_764,
  bnsfAfterTaxAnnualizedM: 5_870,
  bhePretaxAnnualizedM: 2_696,
  bheAfterTaxAnnualizedM: 4_010,
  msrPretaxAnnualizedM: 20_160,
  msrAfterTaxAnnualizedM: 15_338,
  blendedPretaxAnnualizedM: 7_764 + 2_696 + 20_160,
  insuranceUnderwritingAfterTaxAnnualizedM: 6_896,
  insuranceInvestmentIncomeAfterTaxAnnualizedM: 11_476,
  operatingEarningsAfterTaxAnnualizedM: 48_658,
  asOf: "H1 2026 annualized · 10-Q / earnings release Jun 30, 2026",
} as const;

export const MSR_GROUPS = {
  industrial: { pretaxAnnualizedM: 9_016, h1PretaxM: 4_508, q2PretaxM: 2_577 },
  building: { pretaxAnnualizedM: 3_842, h1PretaxM: 1_921, q2PretaxM: 1_117 },
  consumer: { pretaxAnnualizedM: 1_494, h1PretaxM: 747, q2PretaxM: 423 },
  service: { pretaxAnnualizedM: 3_328, h1PretaxM: 1_664, q2PretaxM: 879 },
  retailing: { pretaxAnnualizedM: 1_366, h1PretaxM: 683, q2PretaxM: 387 },
  pilot: { pretaxAnnualizedM: 480, h1PretaxM: 240, q2PretaxM: 290 },
  mclane: { pretaxAnnualizedM: 634, h1PretaxM: 317, q2PretaxM: 173 },
} as const;

export const DEFAULT_MULTIPLE = 15;
export const MULTIPLE_MIN = 10;
export const MULTIPLE_MAX = 18;

export const DEFAULT_INSURANCE_MULTIPLE = 8;
export const INSURANCE_MULTIPLE_MIN = 0;
export const INSURANCE_MULTIPLE_MAX = 12;

export const SEGMENT_DEFAULTS = {
  bnsf: 13,
  bhe: 14,
  industrial: 14,
  building: 11,
  consumer: 11,
  service: 13,
  retailing: 10,
  pilot: 8,
  mclane: 8,
} as const;

export const DEFAULT_MULTIPLE_NOTE =
  "Buffett has repeatedly described 10–15× pretax as a reasonable range for businesses of Berkshire's operating quality. 15× is the upper end of that range. The two-column method capitalizes after-interest earnings (equity value), so operating-company debt is not subtracted again.";
