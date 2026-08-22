/**
 * Insurance as the Berkshire engine.
 *
 * The desk capitalizes after-tax underwriting profit only. Float already
 * funds column one (cash + equities) and is not added as equity. Investment
 * income is the yield on those same assets and is not capitalized again.
 *
 * Underwriting ratios and premiums are reconstructed from 10-K / 10-Q MD&A
 * (GEICO, BH Primary, BHRG). We do not invent GEICO or GenRe stand-alone
 * intrinsic values — only what the filings report at group grain.
 */

export const INSURANCE_DATA_SOURCE =
  "10-K years 2022–2025 and 10-Q for the six months ended June 30, 2026. Ratios are as reported (or loss + expense). H1’26 is a half-year, not annualized.";

export const FLOAT_HISTORY: Array<{
  date: string;
  label: string;
  floatB: number;
  note?: string;
}> = [
  { date: "1970-12-31", label: "1970", floatB: 0.04 },
  { date: "1990-12-31", label: "1990", floatB: 1.6 },
  { date: "2000-12-31", label: "2000", floatB: 27.9 },
  { date: "2010-12-31", label: "2010", floatB: 65.8 },
  { date: "2015-12-31", label: "2015", floatB: 87.7 },
  { date: "2020-12-31", label: "2020", floatB: 138.0 },
  { date: "2022-12-31", label: "2022", floatB: 164.2 },
  { date: "2023-12-31", label: "2023", floatB: 169.0 },
  { date: "2024-12-31", label: "2024", floatB: 171.0 },
  { date: "2025-12-31", label: "2025", floatB: 176.0 },
  { date: "2026-06-30", label: "Q2'26", floatB: 177.5, note: "desk seed · 10-Q period" },
];

/** GEICO — the scale auto book. Ratios to premiums earned. */
export const GEICO_UNDERWRITING: Array<{
  label: string;
  premiumsEarnedM: number;
  lossRatio: number;
  expenseRatio: number;
  combinedRatio: number;
  uwPretaxM: number;
  halfYear?: boolean;
}> = [
  { label: "2022", premiumsEarnedM: 38_984, lossRatio: 93.1, expenseRatio: 11.7, combinedRatio: 104.8, uwPretaxM: -1_880 },
  { label: "2023", premiumsEarnedM: 39_264, lossRatio: 81.0, expenseRatio: 9.7, combinedRatio: 90.7, uwPretaxM: 3_635 },
  { label: "2024", premiumsEarnedM: 42_252, lossRatio: 71.8, expenseRatio: 9.7, combinedRatio: 81.5, uwPretaxM: 7_813 },
  { label: "2025", premiumsEarnedM: 44_481, lossRatio: 72.3, expenseRatio: 12.4, combinedRatio: 84.7, uwPretaxM: 6_806 },
  { label: "H1'26", premiumsEarnedM: 22_477, lossRatio: 75.3, expenseRatio: 14.0, combinedRatio: 89.3, uwPretaxM: 2_410, halfYear: true },
];

/** Combined ratios by 10-K reporting group. BHRG is P/C only (ex life/health, ex retroactive). */
export const GROUP_COMBINED: Array<{
  label: string;
  geico: number;
  primary: number;
  bhrgPc: number | null;
  halfYear?: boolean;
}> = [
  { label: "2022", geico: 104.8, primary: 97.1, bhrgPc: 86.4 },
  { label: "2023", geico: 90.7, primary: 92.0, bhrgPc: 84.0 },
  { label: "2024", geico: 81.5, primary: 95.4, bhrgPc: 82.9 },
  { label: "2025", geico: 84.7, primary: 95.8, bhrgPc: 84.5 },
  { label: "H1'26", geico: 89.3, primary: 91.9, bhrgPc: null, halfYear: true },
];

/** Premiums earned, $ billions. BHRG is property/casualty earned (not life/health). */
export const PREMIUMS_EARNED_B: Array<{
  label: string;
  geico: number;
  primary: number;
  bhrgPc: number;
}> = [
  { label: "2022", geico: 38.98, primary: 13.75, bhrgPc: 16.04 },
  { label: "2023", geico: 39.26, primary: 17.13, bhrgPc: 21.94 },
  { label: "2024", geico: 42.25, primary: 18.73, bhrgPc: 22.24 },
  { label: "2025", geico: 44.48, primary: 18.71, bhrgPc: 20.44 },
];

/** H1 2026 earned mix including BHRG life/health in the BHRG slice. $ billions. */
export const PREMIUM_MIX_H1_2026 = [
  { name: "GEICO", value: 22.477, fill: "var(--color-chart-ins)" },
  { name: "BH Primary", value: 9.264, fill: "var(--color-chart-ops)" },
  { name: "BHRG", value: 12.739, fill: "var(--color-chart-public)" },
] as const;

export const ENGINE_STEPS = [
  {
    n: "01",
    title: "Premiums become float",
    body: "Policyholders pay now; claims are paid later. The lag is float — money Berkshire holds and invests until losses come due. It sits as a GAAP liability.",
  },
  {
    n: "02",
    title: "Float funds column one",
    body: "That liability is the cheap revolving capital behind cash, T-bills and the public equity book. Adding float on top of those marks would double-count the same dollars.",
  },
  {
    n: "03",
    title: "Underwriting is the franchise",
    body: "When combined ratios stay under 100, the cost of float is negative — Berkshire is paid to hold the capital. That underwriting profit is what this desk capitalizes.",
  },
] as const;

export const INSURANCE_HOUSES = [
  {
    name: "GEICO",
    cluster: "Auto",
    acquired: "1996 (full)",
    role: "Private-passenger auto. Direct writer; the scale engine of primary underwriting.",
    pe2025B: 44.48,
    cr2025: 84.7,
  },
  {
    name: "Berkshire Hathaway Reinsurance Group",
    cluster: "Reinsurance",
    acquired: "National Indemnity lineage",
    role: "National Indemnity, GenRe, TransRe — retrocessional, catastrophe, structured and treaty. P/C earned shown on the mix chart; life/health sits here too.",
    pe2025B: 20.44,
    cr2025: 84.5,
  },
  {
    name: "Berkshire Hathaway Primary Group",
    cluster: "Commercial",
    acquired: "built over decades",
    role: "Specialty commercial: MedPro, Guard, USLI, BH Specialty, RSUI. Higher expense ratio than GEICO; mid-90s combined is still underwriting profit.",
    pe2025B: 18.71,
    cr2025: 95.8,
  },
] as const;

export const LETTER_NOTES = [
  {
    title: "Float is revolving capital, not a loan to repay tomorrow",
    body: "The letters treat float as a rolling fund that is replaced as old policies run off and new ones are written. This desk therefore does not subtract it like parent bonds. That is a modelling choice — read the originals.",
  },
  {
    title: "Cost of float is the underwriting result",
    body: "When underwriting is profitable, Berkshire has described the cost of that capital as negative. When it is not, float can be expensive. The 2022 GEICO combined ratio above 100 is the recent reminder.",
  },
  {
    title: "Do not capitalize investment income twice",
    body: "Insurance investment income is the yield on cash, T-bills and stocks already marked in column one. Capitalizing it as a third earnings stream would count the same assets twice.",
  },
] as const;
