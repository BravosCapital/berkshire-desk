export function formatBillions(usd: number, digits = 1): string {
  const abs = Math.abs(usd);
  const sign = usd < 0 ? "−" : "";
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(digits)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function formatCompact(usd: number): string {
  return formatBillions(usd, usd >= 1e11 ? 0 : 1);
}

export function formatFull(usd: number): string {
  const sign = usd < 0 ? "−" : "";
  return `${sign}$${Math.abs(usd).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatPerB(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPerA(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatPct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n * 100).toFixed(digits)}%`;
}

export function formatShares(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e8 ? 0 : 1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString("en-US");
}

export function formatPrice(n: number, currency = "USD"): string {
  if (!Number.isFinite(n)) return "—";
  if (currency === "JPY") {
    return `¥${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  if (n >= 1000) {
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${n.toFixed(2)}`;
}

export function formatMultiple(n: number): string {
  return `${n.toFixed(1)}×`;
}

export function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
