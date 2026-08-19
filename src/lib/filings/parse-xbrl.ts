import type { SegmentPretax, TenQFacts } from "./types";

type Fact = {
  local: string;
  value: number;
  end: string;
  start: string;
  duration: boolean;
  unit: string;
  members: string[];
};

type Context = {
  end: string;
  start: string;
  duration: boolean;
  members: string[];
};

function parseContexts(xml: string): Map<string, Context> {
  const out = new Map<string, Context>();
  const re = /<context id="([^"]+)">([\s\S]*?)<\/context>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const body = m[2];
    const end =
      body.match(/<endDate>([^<]+)<\/endDate>/)?.[1] ??
      body.match(/<instant>([^<]+)<\/instant>/)?.[1] ??
      "";
    const start = body.match(/<startDate>([^<]+)<\/startDate>/)?.[1] ?? "";
    const members = [...body.matchAll(/<xbrldi:explicitMember dimension="[^"]+">([^<]+)<\/xbrldi:explicitMember>/g)].map(
      (x) => x[1].split(":").pop() ?? x[1],
    );
    out.set(m[1], { end, start, duration: Boolean(start), members });
  }
  return out;
}

const WANT = new Set([
  "CashAndCashEquivalentsAtCarryingValue",
  "USTreasuryBills",
  "EquityMethodInvestments",
  "AvailableForSaleSecuritiesDebtSecurities",
  "PreferredStockInvestmentLiquidationValue",
  "IncomeTaxesPrincipallyDeferred",
  "DebtAndCapitalLeaseObligations",
  "Liabilities",
  "StockholdersEquity",
  "EntityCommonStockSharesOutstanding",
  "CommonStockSharesOutstanding",
  "IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest",
]);

const WANT_RE = [...WANT].join("|");
const FACT_RE = new RegExp(
  `<(?:([\\w.-]+):)?(${WANT_RE})\\b([^>]*)>([^<]*)</(?:[\\w.-]+:)?(?:${WANT_RE})>`,
  "g",
);

function parseFacts(xml: string, contexts: Map<string, Context>): Fact[] {
  const out: Fact[] = [];
  let m: RegExpExecArray | null;
  FACT_RE.lastIndex = 0;
  while ((m = FACT_RE.exec(xml))) {
    const local = m[2];
    const attrs = m[3];
    const cref = attrs.match(/contextRef="([^"]+)"/)?.[1];
    if (!cref) continue;
    const ctx = contexts.get(cref);
    if (!ctx) continue;
    const raw = m[4].trim();
    if (!raw || raw === "true" || raw === "false") continue;
    const value = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(value)) continue;
    out.push({
      local,
      value,
      end: ctx.end,
      start: ctx.start,
      duration: ctx.duration,
      unit: attrs.match(/unitRef="([^"]+)"/)?.[1] ?? "",
      members: ctx.members,
    });
  }
  return out;
}

function unique(facts: Fact[]): Fact[] {
  const seen = new Set<string>();
  const out: Fact[] = [];
  for (const f of facts) {
    const k = `${f.local}|${f.end}|${f.start}|${f.value}|${f.unit}|${f.members.join(",")}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(f);
  }
  return out;
}

function has(members: string[], name: string) {
  return members.includes(name);
}

function pickInstant(
  facts: Fact[],
  local: string,
  periodEnd: string,
  opts: {
    unit?: string;
    require?: string[];
    exclude?: string[];
    allowEmpty?: boolean;
  } = {},
): Fact | undefined {
  const unit = opts.unit ?? "U_USD";
  const candidates = facts.filter((f) => {
    if (f.local !== local || f.duration || f.end !== periodEnd) return false;
    if (f.unit && f.unit !== unit) return false;
    if (opts.require && !opts.require.every((r) => has(f.members, r))) return false;
    if (opts.exclude && opts.exclude.some((r) => has(f.members, r))) return false;
    if (!opts.allowEmpty && opts.require?.length && f.members.length === 0) return false;
    return true;
  });
  candidates.sort((a, b) => a.members.length - b.members.length);
  return candidates[0];
}

function monthsCovered(start: string, end: string): number {
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 6;
  return (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth()) + 1;
}

function latestInstantDate(facts: Fact[]): string {
  const dates = facts.filter((f) => !f.duration && f.end).map((f) => f.end);
  dates.sort();
  return dates.at(-1) ?? "";
}

function pickShare(facts: Fact[], cls: string): { value: number; asOf: string } | undefined {
  const dei = facts.filter(
    (f) =>
      f.local === "EntityCommonStockSharesOutstanding" &&
      !f.duration &&
      has(f.members, cls),
  );
  dei.sort((a, b) => a.end.localeCompare(b.end));
  const best = dei.at(-1);
  if (best) return { value: best.value, asOf: best.end };
  const gaap = facts.filter(
    (f) => f.local === "CommonStockSharesOutstanding" && !f.duration && has(f.members, cls),
  );
  gaap.sort((a, b) => a.end.localeCompare(b.end));
  const g = gaap.at(-1);
  if (g) return { value: g.value, asOf: g.end };
  return undefined;
}

function pickSegment(
  facts: Fact[],
  start: string,
  end: string,
  member: string,
  extra?: string[],
): number | undefined {
  const rows = facts.filter((f) => {
    if (f.local !== "IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest") {
      return false;
    }
    if (!f.duration || f.start !== start || f.end !== end) return false;
    if (f.unit && f.unit !== "U_USD") return false;
    if (!has(f.members, "OperatingSegmentsMember")) return false;
    if (!has(f.members, member)) return false;
    if (extra && !extra.every((x) => has(f.members, x))) return false;
    return true;
  });
  rows.sort((a, b) => a.members.length - b.members.length);
  return rows[0]?.value;
}

function toMillions(usd: number | undefined): number {
  if (!usd) return 0;
  return Math.round(usd / 1_000_000);
}

export function parseTenQInstance(xml: string): TenQFacts | null {
  const contexts = parseContexts(xml);
  if (contexts.size === 0) return null;
  const facts = unique(parseFacts(xml, contexts));
  const periodEnd = latestInstantDate(facts.filter((f) => f.local === "Liabilities" || f.local === "USTreasuryBills"));
  if (!periodEnd) return null;

  const cashIO = pickInstant(facts, "CashAndCashEquivalentsAtCarryingValue", periodEnd, {
    require: ["InsuranceAndOtherMember"],
    exclude: ["RailroadUtilitiesAndEnergyMember"],
  });
  const cashRue = pickInstant(facts, "CashAndCashEquivalentsAtCarryingValue", periodEnd, {
    require: ["RailroadUtilitiesAndEnergyMember"],
  });
  const tBills = pickInstant(facts, "USTreasuryBills", periodEnd, {
    require: ["InsuranceAndOtherMember"],
  }) ?? pickInstant(facts, "USTreasuryBills", periodEnd);

  const afs = pickInstant(facts, "AvailableForSaleSecuritiesDebtSecurities", periodEnd, {
    require: ["InsuranceAndOtherMember"],
    exclude: ["FairValueMeasurementsRecurringMember", "USTreasuryAndGovernmentMember"],
  }) ?? pickInstant(facts, "AvailableForSaleSecuritiesDebtSecurities", periodEnd, {
    exclude: ["FairValueMeasurementsRecurringMember", "USTreasuryAndGovernmentMember", "ForeignGovernmentDebtSecuritiesMember"],
  });

  const equityMethod =
    pickInstant(facts, "EquityMethodInvestments", periodEnd, { require: ["InsuranceAndOtherMember"] }) ??
    pickInstant(facts, "EquityMethodInvestments", periodEnd, { allowEmpty: true });
  const berkadia = pickInstant(facts, "EquityMethodInvestments", periodEnd, {
    require: ["BerkadiaCommercialMortgageMember"],
  });
  const oxyPref = pickInstant(facts, "PreferredStockInvestmentLiquidationValue", periodEnd, {
    require: ["OccidentalPetroleumCorporationMember"],
  });
  const deferred = pickInstant(facts, "IncomeTaxesPrincipallyDeferred", periodEnd, { allowEmpty: true });
  const liabilities = pickInstant(facts, "Liabilities", periodEnd, {
    allowEmpty: true,
    exclude: ["TheKraftHeinzCompanyMember", "OccidentalPetroleumCorporationMember"],
  });
  const equity = pickInstant(facts, "StockholdersEquity", periodEnd, {
    allowEmpty: true,
    exclude: [
      "AccumulatedOtherComprehensiveIncomeMember",
      "AccumulatedNetUnrealizedInvestmentGainLossMember",
      "AccumulatedTranslationAdjustmentMember",
      "AccumulatedLongDurationInsuranceContractsMember",
      "AccumulatedDefinedBenefitPlansAdjustmentMember",
      "OtherAccumulatedOtherComprehensiveIncomeMember",
    ],
  });

  const parentFacts = facts.filter((f) => {
    if (f.local !== "DebtAndCapitalLeaseObligations" || f.duration) return false;
    if (f.end !== periodEnd || f.unit !== "U_USD") return false;
    if (!has(f.members, "ParentCompanyMember")) return false;
    if (!has(f.members, "InsuranceAndOtherMember")) return false;
    if (has(f.members, "BerkshireHathawayFinanceCorporationMember")) return false;
    if (has(f.members, "SubsidiariesMember")) return false;
    return true;
  });
  const parentDebt = unique(parentFacts).reduce((s, f) => s + f.value, 0);

  const bhfcUsd = pickInstant(facts, "DebtAndCapitalLeaseObligations", periodEnd, {
    require: ["BerkshireHathawayFinanceCorporationMember", "USD"],
  });
  const bhfcGbp = pickInstant(facts, "DebtAndCapitalLeaseObligations", periodEnd, {
    require: ["BerkshireHathawayFinanceCorporationMember", "GBP"],
    unit: "U_USD",
  });
  const bhfcEur = pickInstant(facts, "DebtAndCapitalLeaseObligations", periodEnd, {
    require: ["BerkshireHathawayFinanceCorporationMember", "EUR"],
    unit: "U_USD",
  });
  const ioNotes = pickInstant(facts, "DebtAndCapitalLeaseObligations", periodEnd, {
    require: ["InsuranceAndOtherMember"],
    exclude: ["ParentCompanyMember", "SubsidiariesMember", "RailroadUtilitiesAndEnergyMember"],
  });
  const rueNotes = pickInstant(facts, "DebtAndCapitalLeaseObligations", periodEnd, {
    require: ["RailroadUtilitiesAndEnergyMember"],
    exclude: ["BurlingtonNorthernSantaFeAndSubsidiariesMember", "BerkshireHathawayEnergySubsidiariesMember"],
  });
  const bnsfDebt = pickInstant(facts, "DebtAndCapitalLeaseObligations", periodEnd, {
    require: ["BurlingtonNorthernSantaFeAndSubsidiariesMember"],
  });
  const bheDebt = pickInstant(facts, "DebtAndCapitalLeaseObligations", periodEnd, {
    require: ["BerkshireHathawayEnergySubsidiariesMember"],
  });

  const classA = pickShare(facts, "CommonClassAMember");
  const classB = pickShare(facts, "CommonClassBMember");

  const ytd = facts.filter(
    (f) =>
      f.duration &&
      f.end === periodEnd &&
      f.local === "IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest",
  );
  const starts = [...new Set(ytd.map((f) => f.start))].sort();
  const periodStart = starts[0] ?? `${periodEnd.slice(0, 4)}-01-01`;
  const months = monthsCovered(periodStart, periodEnd);

  const uwRows = ytd.filter(
    (f) =>
      f.start === periodStart &&
      f.unit === "U_USD" &&
      has(f.members, "OperatingSegmentsMember") &&
      has(f.members, "UnderwritingMember") &&
      has(f.members, "BerkshireHathawayInsuranceGroupMember") &&
      !has(f.members, "GeicoMember") &&
      !has(f.members, "BerkshireHathawayPrimaryGroupMember") &&
      !has(f.members, "BerkshireHathawayReinsuranceGroupMember"),
  );
  uwRows.sort((a, b) => a.members.length - b.members.length);

  const segments: SegmentPretax | null = ytd.length
    ? {
        bnsf: pickSegment(facts, periodStart, periodEnd, "BurlingtonNorthernSantaFeCorporationMember") ?? 0,
        bhe: pickSegment(facts, periodStart, periodEnd, "BerkshireHathawayEnergyCompanyMember") ?? 0,
        manufacturing: pickSegment(facts, periodStart, periodEnd, "ManufacturingBusinessesMember") ?? 0,
        serviceRetailing: pickSegment(facts, periodStart, periodEnd, "ServiceAndRetailingBusinessesMember") ?? 0,
        mclane: pickSegment(facts, periodStart, periodEnd, "McLaneCompanyMember") ?? 0,
        pilot: pickSegment(facts, periodStart, periodEnd, "PilotTravelCentersLLCMember") ?? 0,
        insuranceUw: uwRows[0]?.value ?? 0,
        periodStart,
        periodEnd,
        months,
      }
    : null;

  return {
    periodEnd,
    cashInsuranceOther: cashIO?.value ?? 0,
    cashRue: cashRue?.value ?? 0,
    treasuryBills: tBills?.value ?? 0,
    afsDebt: afs?.value ?? 0,
    equityMethod: equityMethod?.value ?? 0,
    berkadia: berkadia?.value ?? 0,
    oxyPreferred: oxyPref?.value ?? 0,
    deferredTax: deferred?.value ?? 0,
    parentDebt,
    bhfcDebt: (bhfcUsd?.value ?? 0) + (bhfcGbp?.value ?? 0) + (bhfcEur?.value ?? 0),
    bnsfDebt: bnsfDebt?.value ?? 0,
    bheDebt: bheDebt?.value ?? 0,
    ioNotes: ioNotes?.value ?? 0,
    rueNotes: rueNotes?.value ?? 0,
    totalLiabilities: liabilities?.value ?? 0,
    bookEquity: equity?.value ?? 0,
    classA: classA?.value ?? 0,
    classB: classB?.value ?? 0,
    shareCountAsOf: classA?.asOf || classB?.asOf || periodEnd,
    segments,
  };
}

export function millions(usd: number): number {
  return toMillions(usd);
}

export { monthsCovered };
