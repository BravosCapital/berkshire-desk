/**
 * CUSIP → ticker map for Berkshire 13F names.
 * New CUSIPs (spin-offs, share-class recodes) must be added here or they
 * appear on the Data page as unmapped and are marked at 13F carrying value.
 */
export type CusipMeta = {
  ticker: string;
  yahoo: string;
  name: string;
  sector: string;
};

export const CUSIP_MAP: Record<string, CusipMeta> = {
  "037833100": { ticker: "AAPL", yahoo: "AAPL", name: "Apple Inc.", sector: "Technology" },
  "025816109": { ticker: "AXP", yahoo: "AXP", name: "American Express", sector: "Financials" },
  "191216100": { ticker: "KO", yahoo: "KO", name: "Coca-Cola Co.", sector: "Consumer" },
  "02079K305": { ticker: "GOOGL", yahoo: "GOOGL", name: "Alphabet Inc. Class A", sector: "Technology" },
  "060505104": { ticker: "BAC", yahoo: "BAC", name: "Bank of America", sector: "Financials" },
  "166764100": { ticker: "CVX", yahoo: "CVX", name: "Chevron Corp.", sector: "Energy" },
  "674599105": { ticker: "OXY", yahoo: "OXY", name: "Occidental Petroleum", sector: "Energy" },
  H1467J104: { ticker: "CB", yahoo: "CB", name: "Chubb Ltd.", sector: "Financials" },
  "615369105": { ticker: "MCO", yahoo: "MCO", name: "Moody's Corp.", sector: "Financials" },
  "02079K107": { ticker: "GOOG", yahoo: "GOOG", name: "Alphabet Inc. Class C", sector: "Technology" },
  "500754106": { ticker: "KHC", yahoo: "KHC", name: "Kraft Heinz Co.", sector: "Consumer" },
  "23918K108": { ticker: "DVA", yahoo: "DVA", name: "DaVita Inc.", sector: "Healthcare" },
  "247361702": { ticker: "DAL", yahoo: "DAL", name: "Delta Air Lines", sector: "Industrials" },
  "829933100": { ticker: "SIRI", yahoo: "SIRI", name: "SiriusXM Holdings", sector: "Media" },
  "92343E102": { ticker: "VRSN", yahoo: "VRSN", name: "VeriSign Inc.", sector: "Technology" },
  "501044101": { ticker: "KR", yahoo: "KR", name: "Kroger Co.", sector: "Consumer" },
  "02005N100": { ticker: "ALLY", yahoo: "ALLY", name: "Ally Financial", sector: "Financials" },
  "526057104": { ticker: "LEN", yahoo: "LEN", name: "Lennar Corp. Class A", sector: "Housing" },
  "526057302": { ticker: "LEN.B", yahoo: "LEN-B", name: "Lennar Corp. Class B", sector: "Housing" },
  "650111107": { ticker: "NYT", yahoo: "NYT", name: "New York Times Class A", sector: "Media" },
  "14040H105": { ticker: "COF", yahoo: "COF", name: "Capital One Financial", sector: "Financials" },
  "546347105": { ticker: "LPX", yahoo: "LPX", name: "Louisiana-Pacific", sector: "Industrials" },
  "670346105": { ticker: "NUE", yahoo: "NUE", name: "Nucor Corp.", sector: "Industrials" },
  "55616P104": { ticker: "M", yahoo: "M", name: "Macy's Inc.", sector: "Consumer" },
  "62944T105": { ticker: "NVR", yahoo: "NVR", name: "NVR Inc.", sector: "Housing" },
  "47233W109": { ticker: "JEF", yahoo: "JEF", name: "Jefferies Financial", sector: "Financials" },
  "23331A109": { ticker: "DHI", yahoo: "DHI", name: "D.R. Horton", sector: "Housing" },
  // Liberty Live — CUSIP recoded in 2026 after the Liberty/Sirius split.
  "530909100": { ticker: "LLYVA", yahoo: "LLYVA", name: "Liberty Live Series A", sector: "Media" },
  "530909308": { ticker: "LLYVK", yahoo: "LLYVK", name: "Liberty Live Series C", sector: "Media" },
  "531229607": { ticker: "LLYVA", yahoo: "LLYVA", name: "Liberty Live Series A", sector: "Media" },
  "531229706": { ticker: "LLYVK", yahoo: "LLYVK", name: "Liberty Live Series C", sector: "Media" },
};

export function lookupCusip(cusip: string): CusipMeta | undefined {
  return CUSIP_MAP[cusip.trim().toUpperCase()];
}
