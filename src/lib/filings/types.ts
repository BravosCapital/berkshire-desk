export type Origin = "auto" | "seeded" | "scaled" | "live";

export type LedgerRow = {
  id: string;
  label: string;
  value: string;
  origin: Origin;
  asOf: string;
  source: string;
  note?: string;
  stale?: boolean;
};

export type FilingLink = {
  form: string;
  accession: string;
  filed: string;
  periodEnd: string;
  url: string;
};

export type ThirteenFLine = {
  cusip: string;
  name: string;
  title: string;
  shares: number;
  reportedValue: number;
};

export type SnapshotHolding = {
  cusip: string;
  ticker: string;
  yahoo: string;
  name: string;
  shares: number;
  sector: string;
  reportedValue: number;
  mapped: boolean;
  fallbackPrice: number;
  fallbackPrev: number;
};

export type SegmentPretax = {
  bnsf: number;
  bhe: number;
  manufacturing: number;
  serviceRetailing: number;
  mclane: number;
  pilot: number;
  insuranceUw: number;
  periodStart: string;
  periodEnd: string;
  months: number;
};

export type TenQFacts = {
  periodEnd: string;
  cashInsuranceOther: number;
  cashRue: number;
  treasuryBills: number;
  afsDebt: number;
  equityMethod: number;
  berkadia: number;
  oxyPreferred: number;
  deferredTax: number;
  parentDebt: number;
  bhfcDebt: number;
  bnsfDebt: number;
  bheDebt: number;
  ioNotes: number;
  rueNotes: number;
  totalLiabilities: number;
  bookEquity: number;
  classA: number;
  classB: number;
  shareCountAsOf: string;
  segments: SegmentPretax | null;
};

export type JapanLine = {
  ticker: string;
  yahoo: string;
  name: string;
  shares: number;
  ownershipPct: number;
  ownershipAsOf: string;
  origin: Origin;
};

export type OpsAnnualized = {
  bnsfPretaxM: number;
  bhePretaxM: number;
  bheAfterTaxM: number;
  msrPretaxM: number;
  blendedPretaxM: number;
  insuranceUwAfterTaxM: number;
  groups: Record<
    | "bnsf"
    | "bhe"
    | "industrial"
    | "building"
    | "consumer"
    | "service"
    | "retailing"
    | "pilot"
    | "mclane",
    { pretaxAnnualizedM: number; afterTaxAnnualizedM: number }
  >;
};

export type DeskSnapshot = {
  refreshedAt: string;
  source: "edgar" | "cache" | "seed";
  error?: string;
  thirteenF: (FilingLink & { count: number; totalValue: number; unmapped: ThirteenFLine[] }) | null;
  tenQ: FilingLink | null;
  holdings: SnapshotHolding[];
  japan: JapanLine[];
  cashPreferredM: number;
  tBillPayableM: number;
  fixedMaturityM: number;
  equityMethodResidualM: number;
  oxyPreferredM: number;
  parentDebtM: number;
  deferredTaxM: number;
  floatM: number;
  bookEquityM: number;
  totalLiabilitiesM: number;
  bnsfDebtM: number;
  bheDebtM: number;
  bhfcDebtM: number;
  classA: number;
  classB: number;
  shareCountAsOf: string;
  ops: OpsAnnualized;
  ledger: LedgerRow[];
  quoteSymbols: string[];
  stale: boolean;
};
