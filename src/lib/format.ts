// All formatters guard against missing / NaN / Infinity values (common now
// that commodities, forex and partial-data stocks flow through the app) so the
// UI never shows "$NaN" or "NaN%" — it shows a clean em-dash instead.
const MISSING = "—";

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return MISSING;
  if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
}

export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return MISSING;
  return `$${formatNumber(value)}`;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return MISSING;
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;
}

export function formatPercentRaw(value: number): string {
  if (!Number.isFinite(value)) return MISSING;
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatRatio(value: number): string {
  if (!value || !isFinite(value)) return "N/A";
  return value.toFixed(2);
}

// Price with adaptive precision + thousands separators. Normal prices show 2
// decimals ($62,000.00); sub-$1 / crypto prices scale up so a token like
// $0.00002 isn't rounded away to "$0.00".
export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return MISSING;
  const abs = Math.abs(value);
  const decimals = abs >= 1 || abs === 0 ? 2 : abs >= 0.01 ? 4 : abs >= 0.0001 ? 6 : 8;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: decimals })}`;
}

// Clean display label for a ticker. Forex pairs like "EURUSD=X" render as
// "EUR/USD" (cleaner and more professional). Display-only — the real symbol is
// unchanged and still used for API calls and as the storage key.
export function displaySymbol(symbol: string): string {
  if (!symbol) return symbol;
  if (symbol.endsWith("=X")) {
    const base = symbol.slice(0, -2).toUpperCase();
    if (/^[A-Z]{6}$/.test(base)) return `${base.slice(0, 3)}/${base.slice(3)}`;
    return base;
  }
  return symbol;
}
