/**
 * Wholly-owned operating businesses.
 *
 * Valuation units are the 10-Q reporting groups (BNSF, BHE, MSR subgroups,
 * insurance underwriting). Constituent companies are listed underneath so
 * investors can see what is inside each estimate. Subsidiary-level earnings
 * are not disclosed; we do not invent them.
 */

import { MSR_GROUPS, OPS, SEGMENT_DEFAULTS } from "./quarterly";

export type EarningsBasis = "pretax" | "afterTax";

export type OpCompany = {
  name: string;
  role: string;
  acquired?: string;
};

export type OpGroup = {
  id: keyof typeof SEGMENT_DEFAULTS | "insurance";
  name: string;
  shortName: string;
  segment: "Railroad" | "Energy" | "Manufacturing" | "Service" | "Retail" | "Insurance";
  description: string;
  pretaxAnnualizedM: number;
  afterTaxAnnualizedM: number;
  basis: EarningsBasis;
  defaultMultiple: number;
  multipleNote: string;
  source: string;
  companies: OpCompany[];
};

const TAX = 0.24;

function afterTaxFromPretax(pretaxM: number) {
  return Math.round(pretaxM * (1 - TAX));
}

export const OP_GROUPS: OpGroup[] = [
  {
    id: "bnsf",
    name: "BNSF Railway",
    shortName: "BNSF",
    segment: "Railroad",
    description:
      "One of the largest freight railroads in North America. Class I network across the western United States. Earnings are after interest on BNSF's own bonds.",
    pretaxAnnualizedM: OPS.bnsfPretaxAnnualizedM,
    afterTaxAnnualizedM: OPS.bnsfAfterTaxAnnualizedM,
    basis: "pretax",
    defaultMultiple: SEGMENT_DEFAULTS.bnsf,
    multipleNote: "13× pretax is in line with Class I railroad equity comps (UNP, CSX, NSC typically 15–18× after-tax, implying ~12–14× pretax).",
    source: "Earnings release · H1 2026 annualized",
    companies: [
      { name: "BNSF Railway", role: "Class I freight railroad", acquired: "2010" },
    ],
  },
  {
    id: "bhe",
    name: "Berkshire Hathaway Energy",
    shortName: "BHE",
    segment: "Energy",
    description:
      "Regulated utilities, pipelines, transmission and renewables. Tax credits make GAAP pretax a poor measure of earning power, so the model capitalizes after-tax earnings.",
    pretaxAnnualizedM: OPS.bhePretaxAnnualizedM,
    afterTaxAnnualizedM: OPS.bheAfterTaxAnnualizedM,
    basis: "afterTax",
    defaultMultiple: SEGMENT_DEFAULTS.bhe,
    multipleNote: "14× after-tax sits between regulated-utility (~12×) and contracted-renewable (~16×) comps.",
    source: "Earnings release · H1 2026 annualized after-tax",
    companies: [
      { name: "PacifiCorp", role: "Regulated electric utility (Pacific Power, Rocky Mountain Power)" },
      { name: "MidAmerican Energy", role: "Regulated Iowa utility" },
      { name: "NV Energy", role: "Nevada electric & gas" },
      { name: "Northern Powergrid", role: "UK electricity distribution" },
      { name: "AltaLink", role: "Alberta transmission" },
      { name: "BHE Pipeline Group", role: "Northern Natural Gas, Kern River" },
      { name: "BHE Renewables", role: "Wind, solar, geothermal" },
      { name: "HomeServices of America", role: "Residential real-estate brokerage" },
    ],
  },
  {
    id: "industrial",
    name: "Industrial products",
    shortName: "Industrial",
    segment: "Manufacturing",
    description:
      "Aerospace components, specialty chemicals, metalworking tools and Marmon's diversified industrial portfolio. Includes OxyChem, acquired January 2, 2026 for $9.4B.",
    pretaxAnnualizedM: MSR_GROUPS.industrial.pretaxAnnualizedM,
    afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.industrial.pretaxAnnualizedM),
    basis: "pretax",
    defaultMultiple: SEGMENT_DEFAULTS.industrial,
    multipleNote: "14× pretax for a mix of aerospace (PCC), tools (IMC) and specialty chemicals. Quality industrials often clear 12–16× pretax.",
    source: "10-Q MD&A · H1 2026 pretax $4,508m × 2",
    companies: [
      { name: "Precision Castparts", role: "Aerospace castings, forgings, fasteners", acquired: "2016" },
      { name: "Marmon Holdings", role: "Diversified industrial (rail, electrical, plumbing, tank cars)", acquired: "2008–2013" },
      { name: "Lubrizol", role: "Specialty chemicals and additives", acquired: "2011" },
      { name: "IMC (Iscar)", role: "Metal-cutting tools", acquired: "2006–2013" },
      { name: "OxyChem", role: "Chemicals (chlor-alkali, PVC). Acquired from Occidental.", acquired: "2026" },
      { name: "CTB / other industrials", role: "Agriculture equipment, smaller manufacturing" },
    ],
  },
  {
    id: "building",
    name: "Building products",
    shortName: "Building",
    segment: "Manufacturing",
    description:
      "Factory-built housing plus flooring, insulation, paint and engineered building components. Clayton's mortgage book sits here; earnings are after BHFC funding cost.",
    pretaxAnnualizedM: MSR_GROUPS.building.pretaxAnnualizedM,
    afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.building.pretaxAnnualizedM),
    basis: "pretax",
    defaultMultiple: SEGMENT_DEFAULTS.building,
    multipleNote: "11× pretax. Housing is cyclical; Clayton's finance arm earns on the loan book already.",
    source: "10-Q MD&A · H1 2026 pretax $1,921m × 2",
    companies: [
      { name: "Clayton Homes", role: "Manufactured & site-built housing, mortgage origination", acquired: "2003" },
      { name: "Shaw Industries", role: "Flooring", acquired: "2000" },
      { name: "Johns Manville", role: "Insulation, roofing", acquired: "2001" },
      { name: "Benjamin Moore", role: "Paint", acquired: "2000" },
      { name: "MiTek", role: "Engineered building connectors" },
      { name: "Acme Brick", role: "Brick and masonry" },
    ],
  },
  {
    id: "consumer",
    name: "Consumer products",
    shortName: "Consumer",
    segment: "Manufacturing",
    description: "RVs, batteries, apparel and other branded consumer goods.",
    pretaxAnnualizedM: MSR_GROUPS.consumer.pretaxAnnualizedM,
    afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.consumer.pretaxAnnualizedM),
    basis: "pretax",
    defaultMultiple: SEGMENT_DEFAULTS.consumer,
    multipleNote: "11× pretax. Forest River dominates the group; Duracell and apparel are steadier but slower-growth.",
    source: "10-Q MD&A · H1 2026 pretax $747m × 2",
    companies: [
      { name: "Forest River", role: "Recreational vehicles", acquired: "2005" },
      { name: "Duracell", role: "Batteries", acquired: "2016" },
      { name: "Fruit of the Loom", role: "Apparel", acquired: "2002" },
      { name: "Brooks Running", role: "Performance running shoes" },
      { name: "Garan / Richline", role: "Apparel and jewelry manufacturing" },
    ],
  },
  {
    id: "service",
    name: "Service businesses",
    shortName: "Service",
    segment: "Service",
    description:
      "Aviation training and fractional jets, electronics distribution, and a cluster of smaller service companies.",
    pretaxAnnualizedM: MSR_GROUPS.service.pretaxAnnualizedM,
    afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.service.pretaxAnnualizedM),
    basis: "pretax",
    defaultMultiple: SEGMENT_DEFAULTS.service,
    multipleNote: "13× pretax. FlightSafety and TTI are high-quality compounders; NetJets is more cyclical.",
    source: "10-Q MD&A · H1 2026 pretax $1,664m × 2",
    companies: [
      { name: "NetJets", role: "Fractional business aviation", acquired: "1998" },
      { name: "FlightSafety International", role: "Pilot and technician training", acquired: "1996" },
      { name: "TTI, Inc.", role: "Electronic components distribution", acquired: "2007" },
      { name: "Business Wire", role: "Press-release distribution", acquired: "2006" },
      { name: "CORT Business Services", role: "Furniture rental" },
      { name: "Charter Brokerage", role: "Customs brokerage" },
    ],
  },
  {
    id: "retailing",
    name: "Retailing",
    shortName: "Retail",
    segment: "Retail",
    description: "Furniture, jewelry, candy and restaurant retail — the original Berkshire collection.",
    pretaxAnnualizedM: MSR_GROUPS.retailing.pretaxAnnualizedM,
    afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.retailing.pretaxAnnualizedM),
    basis: "pretax",
    defaultMultiple: SEGMENT_DEFAULTS.retailing,
    multipleNote: "10× pretax. See's is a jewel; furniture and jewelry retail earn a lower multiple.",
    source: "10-Q MD&A · H1 2026 pretax $683m × 2",
    companies: [
      { name: "Nebraska Furniture Mart", role: "Home furnishings", acquired: "1983" },
      { name: "See's Candies", role: "Boxed chocolate", acquired: "1972" },
      { name: "Dairy Queen", role: "QSR franchise system", acquired: "1998" },
      { name: "Borsheims", role: "Jewelry", acquired: "1989" },
      { name: "Helzberg Diamonds", role: "Jewelry retail", acquired: "1995" },
      { name: "R.C. Willey / Jordan's / Star", role: "Regional furniture" },
    ],
  },
  {
    id: "pilot",
    name: "Pilot Travel Centers",
    shortName: "Pilot",
    segment: "Retail",
    description:
      "North America's largest travel-center network. Fuel retail is high-revenue, thin-margin. Wholly owned since January 2024.",
    pretaxAnnualizedM: MSR_GROUPS.pilot.pretaxAnnualizedM,
    afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.pilot.pretaxAnnualizedM),
    basis: "pretax",
    defaultMultiple: SEGMENT_DEFAULTS.pilot,
    multipleNote: "8× pretax. Fuel margins are commodity-like; the franchise is the network and diesel retail share.",
    source: "10-Q MD&A · H1 2026 pretax $240m × 2",
    companies: [
      { name: "Pilot Flying J", role: "Travel centers, diesel, food service", acquired: "2017–2024" },
    ],
  },
  {
    id: "mclane",
    name: "McLane Company",
    shortName: "McLane",
    segment: "Retail",
    description:
      "Wholesale grocery and foodservice distribution to convenience stores, mass merchants and restaurant chains. Very high turnover, very thin margin.",
    pretaxAnnualizedM: MSR_GROUPS.mclane.pretaxAnnualizedM,
    afterTaxAnnualizedM: afterTaxFromPretax(MSR_GROUPS.mclane.pretaxAnnualizedM),
    basis: "pretax",
    defaultMultiple: SEGMENT_DEFAULTS.mclane,
    multipleNote: "8× pretax, in line with food distributors (USFD, PFGC).",
    source: "10-Q MD&A · H1 2026 pretax $317m × 2",
    companies: [{ name: "McLane Company", role: "Grocery & foodservice wholesale", acquired: "2003" }],
  },
];

export const INSURANCE_GROUP: OpGroup = {
  id: "insurance",
  name: "Insurance underwriting",
  shortName: "Insurance",
  segment: "Insurance",
  description:
    "GEICO, the reinsurance group, and the primary-commercial cluster. Capitalized on after-tax underwriting profit only. Float funds column-one investments and is not added as equity; investment income is the yield on those same assets and is not capitalized.",
  pretaxAnnualizedM: Math.round(OPS.insuranceUnderwritingAfterTaxAnnualizedM / (1 - TAX)),
  afterTaxAnnualizedM: OPS.insuranceUnderwritingAfterTaxAnnualizedM,
  basis: "afterTax",
  defaultMultiple: 8,
  multipleNote:
    "8× after-tax underwriting is a conservative franchise multiple. Combined ratio has been profitable; cost of $177.5B of float is negative.",
  source: "Earnings release · H1 2026 after-tax underwriting $3,448m × 2",
  companies: [
    { name: "GEICO", role: "Private-passenger auto", acquired: "1996 (full)" },
    { name: "Berkshire Hathaway Reinsurance Group", role: "National Indemnity and affiliates — retrocessional, catastrophe, structured" },
    { name: "General Re", role: "Global reinsurance", acquired: "1998" },
    { name: "Berkshire Hathaway Primary Group", role: "Commercial specialty, MedPro, Guard, USLI, BH Specialty" },
    { name: "Alleghany / TransRe / RSUI", role: "Reinsurance and excess & surplus", acquired: "2022" },
  ],
};

export const ALL_OP_GROUPS: OpGroup[] = [...OP_GROUPS, INSURANCE_GROUP];
