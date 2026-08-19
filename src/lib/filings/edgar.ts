const CIK = "0001067983";
const CIK_NUM = "1067983";
const UA = "BerkshireDesk/1.0 research@example.com";
const BASE_SUB = `https://data.sec.gov/submissions/CIK${CIK}.json`;
const ARCH = `https://www.sec.gov/Archives/edgar/data/${CIK_NUM}`;

export type EdgarFiling = {
  form: string;
  accession: string;
  accessionPath: string;
  filed: string;
  periodEnd: string;
  primaryDocument: string;
};

type Submissions = {
  filings?: {
    recent?: {
      form: string[];
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      primaryDocument: string[];
    };
  };
};

type DirIndex = {
  directory?: { item?: Array<{ name: string; size?: string | number }> };
};

async function secGet(url: string, timeoutMs = 25_000): Promise<Response> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json, application/xml, text/xml, */*" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 1200));
    const retry = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json, application/xml, text/xml, */*" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!retry.ok) throw new Error(`SEC ${retry.status} ${url}`);
    return retry;
  }
  if (!res.ok) throw new Error(`SEC ${res.status} ${url}`);
  return res;
}

function accessionPath(accession: string) {
  return accession.replace(/-/g, "");
}

function archiveUrl(accession: string, file: string) {
  return `${ARCH}/${accessionPath(accession)}/${file}`;
}

function filingUrl(f: EdgarFiling) {
  return `https://www.sec.gov/Archives/edgar/data/${CIK_NUM}/${accessionPath(f.accession)}/${f.primaryDocument}`;
}

export async function listBerkshireFilings(): Promise<EdgarFiling[]> {
  const json = (await (await secGet(BASE_SUB)).json()) as Submissions;
  const r = json.filings?.recent;
  if (!r) return [];
  const out: EdgarFiling[] = [];
  for (let i = 0; i < r.form.length; i += 1) {
    out.push({
      form: r.form[i],
      accession: r.accessionNumber[i],
      accessionPath: accessionPath(r.accessionNumber[i]),
      filed: r.filingDate[i],
      periodEnd: r.reportDate[i] ?? "",
      primaryDocument: r.primaryDocument[i],
    });
  }
  return out;
}

function latestByPeriod(filings: EdgarFiling[], forms: string[]): EdgarFiling | null {
  const rows = filings.filter((f) => forms.includes(f.form) && f.periodEnd);
  if (!rows.length) return null;
  const latestPeriod = rows.reduce((a, b) => (a.periodEnd >= b.periodEnd ? a : b)).periodEnd;
  const forPeriod = rows.filter((f) => f.periodEnd === latestPeriod);
  return forPeriod[0] ?? null;
}

export function pickLatest13F(filings: EdgarFiling[]): EdgarFiling | null {
  return latestByPeriod(filings, ["13F-HR", "13F-HR/A"]);
}

export function pickLatestTenQ(filings: EdgarFiling[]): EdgarFiling | null {
  return latestByPeriod(filings, ["10-Q", "10-Q/A", "10-K", "10-K/A"]);
}

async function listDocuments(accession: string): Promise<Array<{ name: string; size: number }>> {
  const json = (await (await secGet(`${ARCH}/${accessionPath(accession)}/index.json`)).json()) as DirIndex;
  return (json.directory?.item ?? []).map((it) => ({
    name: it.name,
    size: Number(it.size) || 0,
  }));
}

export async function fetch13FTableXml(filing: EdgarFiling): Promise<{ xml: string; file: string }> {
  const files = await listDocuments(filing.accession);
  const xmls = files.filter((f) => /\.xml$/i.test(f.name) && !/primary_doc|index|xsl/i.test(f.name));
  const named = xmls.find((f) => /info[-_]?table/i.test(f.name));
  const file = named ?? [...xmls].sort((a, b) => b.size - a.size)[0];
  if (!file) throw new Error("13F information table not found");
  const xml = await (await secGet(archiveUrl(filing.accession, file.name), 40_000)).text();
  return { xml, file: file.name };
}

export async function fetchTenQInstanceXml(filing: EdgarFiling): Promise<{ xml: string; file: string }> {
  const files = await listDocuments(filing.accession);
  const names = files.map((f) => f.name);
  const file =
    names.find((n) => /_htm\.xml$/i.test(n)) ??
    names.find((n) => n.toLowerCase().endsWith(".xml") && /brka-/i.test(n) && !/filing/i.test(n));
  if (!file) throw new Error("10-Q/10-K instance document not found");
  const xml = await (await secGet(archiveUrl(filing.accession, file), 60_000)).text();
  return { xml, file };
}

export function edgarFilingPage(f: EdgarFiling): string {
  return filingUrl(f);
}

export const BERKSHIRE_CIK = CIK;
