import {
  A_PER_B,
  CAPITAL,
  CASH_PREFERRED_M,
  CLASS_A_SHARES,
  CLASS_B_SHARES,
  EQUITY_METHOD_RESIDUAL_M,
  FILING,
  FIXED_MATURITY_M,
  MSR_GROUPS,
  OPS,
  OXY_PREFERRED_M,
  TBILL_PAYABLE_M,
  TOTAL_LIABILITIES_M,
  BOOK_EQUITY_M,
} from "@/lib/valuation/quarterly";
import { JAPAN_HOLDINGS, US_HOLDINGS } from "@/lib/valuation/holdings";
import { lookupCusip } from "./cusip";
import { millions } from "./parse-xbrl";
import type {
  DeskSnapshot,
  JapanLine,
  LedgerRow,
  OpsAnnualized,
  Origin,
  SegmentPretax,
  SnapshotHolding,
  TenQFacts,
  ThirteenFLine,
} from "./types";
import type { EdgarFiling } from "./edgar";
import { edgarFilingPage } from "./edgar";

const TAX = 0.24;

/** H1 2026 pretax baselines used to scale MD&A subgroup mix when a new 10-Q arrives. */
const BASELINE_PRETAX_H1 = {
  bnsf: 3_881,
  bhe: 1_348,
  manufacturing: 7_176,
  serviceRetailing: 2_347,
  mclane: 317,
  pilot: 240,
  insuranceUw: 4_445,
} as const;

function usd(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}B`;
  if (abs >= 1) return `${sign}$${abs.toFixed(abs >= 100 ? 0 : 1)}M`;
  return `${sign}$${(abs * 1_000).toFixed(0)}K`;
}

function daysSince(iso: string): number {
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(t)) return 0;
  return Math.floor((Date.now() - t) / 86_400_000);
}

function filingStale(filed: string | undefined): boolean {
  if (!filed) return true;
  return daysSince(filed) > 110;
}

function annualizeYtd(ytdUsd: number, months: number): number {
  const m = months > 0 ? months : 6;
  return (ytdUsd / 1_000_000) * (12 / m);
}

function afterTaxFromPretax(pretaxM: number) {
  return Math.round(pretaxM * (1 - TAX));
}

function seedOps(): OpsAnnualized {
  return {
    bnsfPretaxM: OPS.bnsfPretaxAnnualizedM,
    bhePretaxM: OPS.bhePretaxAnnualizedM,
    bheAfterTaxM: OPS.bheAfterTaxAnnualizedM,
    msrPretaxM: OPS.msrPretaxAnnualizedM,
    blendedPretaxM: OPS.blendedPretaxAnnualizedM,
    insuranceUwAfterTaxM: OPS.insuranceUnderwritingAfterTaxAnnualizedM,
    groups: {
      bnsf: {
        pretaxAnnualizedM: OPS.bnsfPretaxAnnualizedM,
        afterTaxAnnualizedM: OPS.bnsfAfterTaxAnnualizedM,
      },
      bhe: {
        pretaxAnnualizedM: OPS.bhePretaxAnnualizedM,
        afterTaxAnnualizedM: OPS.bheAfterTaxAnnualizedM,
      },
      industrial: {
        pretaxAnnualizedM: MSR_GROUPS.industrial.pretaxAnnualizedM,
        afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.industrial.pretaxAnnualizedM),
      },
      building: {
        pretaxAnnualizedM: MSR_GROUPS.building.pretaxAnnualizedM,
        afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.building.pretaxAnnualizedM),
      },
      consumer: {
        pretaxAnnualizedM: MSR_GROUPS.consumer.pretaxAnnualizedM,
        afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.consumer.pretaxAnnualizedM),
      },
      service: {
        pretaxAnnualizedM: MSR_GROUPS.service.pretaxAnnualizedM,
        afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.service.pretaxAnnualizedM),
      },
      retailing: {
        pretaxAnnualizedM: MSR_GROUPS.retailing.pretaxAnnualizedM,
        afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.retailing.pretaxAnnualizedM),
      },
      pilot: {
        pretaxAnnualizedM: MSR_GROUPS.pilot.pretaxAnnualizedM,
        afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.pilot.pretaxAnnualizedM),
      },
      mclane: {
        pretaxAnnualizedM: MSR_GROUPS.mclane.pretaxAnnualizedM,
        afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.mclane.pretaxAnnualizedM),
      },
    },
  };
}

function scaleOps(seg: SegmentPretax): { ops: OpsAnnualized; origin: Origin } {
  // Compare annualized new vs annualized baseline (H1 × 2).
  const mfgScale = BASELINE_PRETAX_H1.manufacturing
    ? annualizeYtd(seg.manufacturing, seg.months) / (BASELINE_PRETAX_H1.manufacturing * 2)
    : 1;
  const srScale = BASELINE_PRETAX_H1.serviceRetailing
    ? annualizeYtd(seg.serviceRetailing, seg.months) / (BASELINE_PRETAX_H1.serviceRetailing * 2)
    : 1;
  const bheScale = BASELINE_PRETAX_H1.bhe
    ? annualizeYtd(seg.bhe, seg.months) / (BASELINE_PRETAX_H1.bhe * 2)
    : 1;
  const uwScale = BASELINE_PRETAX_H1.insuranceUw
    ? annualizeYtd(seg.insuranceUw, seg.months) / (BASELINE_PRETAX_H1.insuranceUw * 2)
    : 1;

  const bnsfPretaxM = Math.round(annualizeYtd(seg.bnsf, seg.months));
  const bhePretaxM = Math.round(annualizeYtd(seg.bhe, seg.months));
  const mclaneM = Math.round(annualizeYtd(seg.mclane, seg.months));
  const pilotM = Math.round(annualizeYtd(seg.pilot, seg.months));
  const mfgM = Math.round(annualizeYtd(seg.manufacturing, seg.months));
  const srM = Math.round(annualizeYtd(seg.serviceRetailing, seg.months));

  const industrial = Math.round(MSR_GROUPS.industrial.pretaxAnnualizedM * mfgScale);
  const building = Math.round(MSR_GROUPS.building.pretaxAnnualizedM * mfgScale);
  const consumer = Math.round(MSR_GROUPS.consumer.pretaxAnnualizedM * mfgScale);
  const service = Math.round(MSR_GROUPS.service.pretaxAnnualizedM * srScale);
  const retailing = Math.round(MSR_GROUPS.retailing.pretaxAnnualizedM * srScale);

  const msrPretaxM = mfgM + srM + mclaneM + pilotM;
  const bheAfterTaxM = Math.round(OPS.bheAfterTaxAnnualizedM * bheScale);
  const insuranceUwAfterTaxM = Math.round(OPS.insuranceUnderwritingAfterTaxAnnualizedM * uwScale);

  return {
    origin: mfgScale === 1 && srScale === 1 && bheScale === 1 && uwScale === 1 ? "auto" : "scaled",
    ops: {
      bnsfPretaxM,
      bhePretaxM,
      bheAfterTaxM,
      msrPretaxM,
      blendedPretaxM: bnsfPretaxM + bhePretaxM + msrPretaxM,
      insuranceUwAfterTaxM,
      groups: {
        bnsf: { pretaxAnnualizedM: bnsfPretaxM, afterTaxAnnualizedM: afterTaxFromPretax(bnsfPretaxM) },
        bhe: { pretaxAnnualizedM: bhePretaxM, afterTaxAnnualizedM: bheAfterTaxM },
        industrial: { pretaxAnnualizedM: industrial, afterTaxAnnualizedM: afterTaxFromPretax(industrial) },
        building: { pretaxAnnualizedM: building, afterTaxAnnualizedM: afterTaxFromPretax(building) },
        consumer: { pretaxAnnualizedM: consumer, afterTaxAnnualizedM: afterTaxFromPretax(consumer) },
        service: { pretaxAnnualizedM: service, afterTaxAnnualizedM: afterTaxFromPretax(service) },
        retailing: { pretaxAnnualizedM: retailing, afterTaxAnnualizedM: afterTaxFromPretax(retailing) },
        pilot: { pretaxAnnualizedM: pilotM, afterTaxAnnualizedM: afterTaxFromPretax(pilotM) },
        mclane: { pretaxAnnualizedM: mclaneM, afterTaxAnnualizedM: afterTaxFromPretax(mclaneM) },
      },
    },
  };
}

function seedHoldings(): SnapshotHolding[] {
  return US_HOLDINGS.map((h) => ({
    cusip: "",
    ticker: h.ticker,
    yahoo: h.yahoo,
    name: h.name,
    shares: h.shares,
    sector: h.sector,
    reportedValue: h.reportedValue,
    mapped: true,
    fallbackPrice: h.fallbackPrice,
    fallbackPrev: h.fallbackPrev,
  }));
}

function holdingsFrom13F(lines: ThirteenFLine[]): { holdings: SnapshotHolding[]; unmapped: ThirteenFLine[] } {
  const seedByTicker = new Map(US_HOLDINGS.map((h) => [h.ticker, h]));
  const holdings: SnapshotHolding[] = [];
  const unmapped: ThirteenFLine[] = [];
  for (const line of lines) {
    const meta = lookupCusip(line.cusip);
    if (!meta) {
      unmapped.push(line);
      const price = line.shares ? line.reportedValue / line.shares : 0;
      holdings.push({
        cusip: line.cusip,
        ticker: line.cusip.slice(-4),
        yahoo: "",
        name: line.name,
        shares: line.shares,
        sector: "Unmapped",
        reportedValue: line.reportedValue,
        mapped: false,
        fallbackPrice: price,
        fallbackPrev: price,
      });
      continue;
    }
    const seed = seedByTicker.get(meta.ticker);
    holdings.push({
      cusip: line.cusip,
      ticker: meta.ticker,
      yahoo: meta.yahoo,
      name: meta.name,
      shares: line.shares,
      sector: meta.sector,
      reportedValue: line.reportedValue,
      mapped: true,
      fallbackPrice: seed?.fallbackPrice ?? (line.shares ? line.reportedValue / line.shares : 0),
      fallbackPrev: seed?.fallbackPrev ?? (line.shares ? line.reportedValue / line.shares : 0),
    });
  }
  return { holdings, unmapped };
}

function japanLines(): JapanLine[] {
  return JAPAN_HOLDINGS.map((h) => ({
    ticker: h.ticker,
    yahoo: h.yahoo,
    name: h.name,
    shares: h.shares,
    ownershipPct: h.ownershipPct,
    ownershipAsOf: h.ownershipAsOf,
    origin: "seeded" as const,
  }));
}

function linkOf(f: EdgarFiling | null, form: string) {
  if (!f) return null;
  return {
    form: f.form || form,
    accession: f.accession,
    filed: f.filed,
    periodEnd: f.periodEnd,
    url: edgarFilingPage(f),
  };
}

export function buildSnapshot(opts: {
  thirteenFFiling?: EdgarFiling | null;
  thirteenFLines?: ThirteenFLine[] | null;
  tenQFiling?: EdgarFiling | null;
  tenQ?: TenQFacts | null;
  refreshedAt?: string;
  source?: DeskSnapshot["source"];
  error?: string;
}): DeskSnapshot {
  const refreshedAt = opts.refreshedAt ?? new Date().toISOString();
  const ledger: LedgerRow[] = [];
  const f13 = opts.thirteenFFiling ?? null;
  const tq = opts.tenQFiling ?? null;
  const facts = opts.tenQ ?? null;
  const parsed13 = opts.thirteenFLines ?? null;

  const { holdings, unmapped } = parsed13
    ? holdingsFrom13F(parsed13)
    : { holdings: seedHoldings(), unmapped: [] as ThirteenFLine[] };

  const japan = japanLines();

  const cashIO = facts?.cashInsuranceOther ? millions(facts.cashInsuranceOther) : 35_096;
  const tBills = facts?.treasuryBills ? millions(facts.treasuryBills) : 324_905;
  const tBillPayableM = TBILL_PAYABLE_M;
  const cashPreferredM = facts
    ? cashIO + tBills - tBillPayableM
    : CASH_PREFERRED_M;
  const fixedMaturityM = facts?.afsDebt ? millions(facts.afsDebt) : FIXED_MATURITY_M;
  const equityMethodResidualM = facts?.berkadia ? millions(facts.berkadia) : EQUITY_METHOD_RESIDUAL_M;
  const oxyPreferredM = facts?.oxyPreferred ? millions(facts.oxyPreferred) : OXY_PREFERRED_M;
  const parentDebtM = facts?.parentDebt ? millions(facts.parentDebt) : CAPITAL.parentDebtM;
  const deferredTaxM = facts?.deferredTax ? millions(facts.deferredTax) : CAPITAL.deferredTaxM;
  const floatM = CAPITAL.floatM;
  const bookEquityM = facts?.bookEquity ? millions(facts.bookEquity) : BOOK_EQUITY_M;
  const totalLiabilitiesM = facts?.totalLiabilities ? millions(facts.totalLiabilities) : TOTAL_LIABILITIES_M;
  const bnsfDebtM = facts?.bnsfDebt ? millions(facts.bnsfDebt) : CAPITAL.bnsfDebtM;
  const bheDebtM = facts?.bheDebt ? millions(facts.bheDebt) : CAPITAL.bheDebtM;
  const bhfcDebtM = facts?.bhfcDebt ? millions(facts.bhfcDebt) : CAPITAL.bhfcDebtM;
  const classA = facts?.classA || CLASS_A_SHARES;
  const classB = facts?.classB || CLASS_B_SHARES;
  const shareCountAsOf = facts?.shareCountAsOf || FILING.shareCountAsOf;

  const scaled = facts?.segments ? scaleOps(facts.segments) : { ops: seedOps(), origin: "seeded" as Origin };
  const ops = scaled.ops;

  const as13 = f13?.periodEnd || FILING.thirteenFPeriod;
  const as10 = tq?.periodEnd || facts?.periodEnd || FILING.periodEnd;
  const filed13 = f13?.filed || FILING.thirteenFFiled;
  const filed10 = tq?.filed || FILING.tenQFiled;

  const stale13 = filingStale(filed13);
  const stale10 = filingStale(filed10);

  ledger.push({
    id: "prices",
    label: "Public prices & USD/JPY",
    value: "Live session",
    origin: "live",
    asOf: refreshedAt.slice(0, 10),
    source: "Yahoo Finance chart API",
    note: "Polled about every 60 seconds. Fallback marks if a symbol fails.",
  });
  ledger.push({
    id: "13f",
    label: "U.S. 13F share counts",
    value: parsed13 ? `${holdings.filter((h) => h.mapped).length} mapped names` : `${US_HOLDINGS.length} seeded names`,
    origin: parsed13 ? "auto" : "seeded",
    asOf: as13,
    source: parsed13 ? `Form ${f13?.form ?? "13F-HR"} ${filed13}` : FILING.source13F,
    note: unmapped.length
      ? `${unmapped.length} CUSIP(s) unmapped — included at 13F carrying value.`
      : "CUSIPs aggregated across Berkshire managers, marked live.",
    stale: stale13,
  });
  ledger.push({
    id: "japan",
    label: "Japanese trading houses",
    value: "Ownership % × last disclosed shares",
    origin: "seeded",
    asOf: FILING.japaneseAsOf,
    source: "Issuer large-shareholder filings (not in the 13F)",
    note: "Prices are live yen converted at spot USD/JPY. Share counts = last disclosed ownership % × issuer shares; update the % when a large-shareholder report lands.",
  });
  ledger.push({
    id: "cash",
    label: "I&O cash + T-bills",
    value: usd(cashPreferredM),
    origin: facts ? "auto" : "seeded",
    asOf: as10,
    source: facts ? "10-Q XBRL (cash I&O + brka:USTreasuryBills − $771m payable)" : FILING.sourceTenQ,
    note: "Railroad/utility cash stays inside BNSF and BHE. T-bill payable is not tagged; $771m seed is subtracted.",
    stale: stale10,
  });
  ledger.push({
    id: "afs",
    label: "Fixed-maturity (AFS debt)",
    value: usd(fixedMaturityM),
    origin: facts ? "auto" : "seeded",
    asOf: as10,
    source: "us-gaap:AvailableForSaleSecuritiesDebtSecurities",
    stale: stale10,
  });
  ledger.push({
    id: "berkadia",
    label: "Berkadia residual",
    value: usd(equityMethodResidualM),
    origin: facts ? "auto" : "seeded",
    asOf: as10,
    source: "Equity-method — Berkadia member. KHC and OXY common are in the 13F, not added again.",
    stale: stale10,
  });
  ledger.push({
    id: "oxy-pref",
    label: "Occidental preferred",
    value: usd(oxyPreferredM),
    origin: facts?.oxyPreferred ? "auto" : "seeded",
    asOf: as10,
    source: facts?.oxyPreferred
      ? "brka:PreferredStockInvestmentLiquidationValue ($8.5B remaining)"
      : "Original $10B par; remaining $8.5B tagged in the 10-Q (seed matches tagged figure)",
    note: "Warrants stay seeded (83.9m, $59.62 strike) and are marked at intrinsic value.",
    stale: stale10,
  });
  ledger.push({
    id: "parent",
    label: "Parent bonds",
    value: usd(parentDebtM),
    origin: facts?.parentDebt ? "auto" : "seeded",
    asOf: as10,
    source: "DebtAndCapitalLeaseObligations · ParentCompany · I&O · USD/EUR/JPY",
    stale: stale10,
  });
  ledger.push({
    id: "shares",
    label: "Share count",
    value: `${classA.toLocaleString("en-US")} A · ${(classB / 1e6).toFixed(1)}M B  (${(classA + classB / A_PER_B).toFixed(0)} A-eq.)`,
    origin: facts?.classA ? "auto" : "seeded",
    asOf: shareCountAsOf,
    source: "dei:EntityCommonStockSharesOutstanding (subsequent-event date when tagged)",
    stale: stale10,
  });
  ledger.push({
    id: "ops",
    label: "Operating earnings run-rate",
    value: `${usd(ops.blendedPretaxM)} pretax annualized`,
    origin: facts?.segments ? scaled.origin : "seeded",
    asOf: as10,
    source: facts?.segments
      ? "YTD pretax by operating segment, annualized. MSR mix scaled from last MD&A split."
      : "H1 2026 earnings release / 10-Q MD&A (seed)",
    note: "BHE after-tax and insurance after-tax are scaled from the last earnings-release ratio — those are not clean XBRL tags.",
    stale: stale10,
  });
  ledger.push({
    id: "float",
    label: "Insurance float",
    value: usd(floatM),
    origin: "seeded",
    asOf: as10,
    source: "Earnings release (not a tagged XBRL fact)",
    note: "Displayed on Capital. Not deducted in the two-column estimate.",
    stale: stale10,
  });
  ledger.push({
    id: "multiples",
    label: "Valuation multiples",
    value: "Your 10–18× ops / 0–12× insurance (saved on this device)",
    origin: "seeded",
    asOf: refreshedAt.slice(0, 10),
    source: "Judgement — Buffett’s 10–15× pretax band is the default",
  });

  const quoteSymbols = [
    "BRK-A",
    "BRK-B",
    "USDJPY=X",
    ...holdings.filter((h) => h.yahoo).map((h) => h.yahoo),
    ...japan.map((h) => h.yahoo),
  ];

  return {
    refreshedAt,
    source: opts.source ?? (parsed13 || facts ? "edgar" : "seed"),
    error: opts.error,
    thirteenF: parsed13
      ? {
          ...(linkOf(f13, "13F-HR") ?? {
            form: "13F-HR",
            accession: "",
            filed: FILING.thirteenFFiled,
            periodEnd: FILING.thirteenFPeriod,
            url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001067983",
          }),
          count: holdings.length,
          totalValue: holdings.reduce((s, h) => s + h.reportedValue, 0),
          unmapped,
        }
      : f13
        ? {
            ...linkOf(f13, "13F-HR")!,
            count: holdings.length,
            totalValue: holdings.reduce((s, h) => s + h.reportedValue, 0),
            unmapped,
          }
        : {
            form: "13F-HR",
            accession: "",
            filed: FILING.thirteenFFiled,
            periodEnd: FILING.thirteenFPeriod,
            url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001067983",
            count: holdings.length,
            totalValue: holdings.reduce((s, h) => s + h.reportedValue, 0),
            unmapped,
          },
    tenQ: linkOf(tq, "10-Q") ?? {
      form: "10-Q",
      accession: "",
      filed: FILING.tenQFiled,
      periodEnd: FILING.periodEnd,
      url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001067983",
    },
    holdings,
    japan,
    cashPreferredM,
    tBillPayableM,
    fixedMaturityM,
    equityMethodResidualM,
    oxyPreferredM,
    parentDebtM,
    deferredTaxM,
    floatM,
    bookEquityM,
    totalLiabilitiesM,
    bnsfDebtM,
    bheDebtM,
    bhfcDebtM,
    classA,
    classB,
    shareCountAsOf,
    ops,
    ledger,
    quoteSymbols: [...new Set(quoteSymbols)],
    stale: stale13 || stale10,
  };
}

export function seedSnapshot(error?: string): DeskSnapshot {
  return buildSnapshot({ source: "seed", error, refreshedAt: new Date().toISOString() });
}
