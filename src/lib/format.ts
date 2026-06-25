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

// Human-readable names for the cryptic futures (=F) and index (^) tickers
// Yahoo uses. A student shouldn't have to know that "CL=F" means crude oil or
// "^GSPC" is the S&P 500 — display-only, the raw symbol still drives every API
// call and storage key.
const COMMODITY_NAMES: Record<string, string> = {
  "CL=F": "Crude Oil",
  "BZ=F": "Brent Crude",
  "NG=F": "Natural Gas",
  "GC=F": "Gold",
  "SI=F": "Silver",
  "PL=F": "Platinum",
  "PA=F": "Palladium",
  "HG=F": "Copper",
  "ZC=F": "Corn",
  "ZW=F": "Wheat",
  "ZS=F": "Soybeans",
  "KC=F": "Coffee",
  "SB=F": "Sugar",
  "CT=F": "Cotton",
  "CC=F": "Cocoa",
  "LE=F": "Live Cattle",
  "ES=F": "S&P 500 Futures",
  "NQ=F": "Nasdaq Futures",
  "YM=F": "Dow Futures",
};
const INDEX_NAMES: Record<string, string> = {
  "^GSPC": "S&P 500",
  "^DJI": "Dow Jones",
  "^IXIC": "Nasdaq",
  "^NDX": "Nasdaq 100",
  "^RUT": "Russell 2000",
  "^VIX": "VIX",
  "^TNX": "10Y Treasury",
  "^FTSE": "FTSE 100",
  "^GDAXI": "DAX",
  "^FCHI": "CAC 40",
  "^N225": "Nikkei 225",
  "^HSI": "Hang Seng",
  "^STOXX50E": "Euro Stoxx 50",
  "^BSESN": "Sensex",
  "^NSEI": "Nifty 50",
};

// Clean display label for a ticker. Forex pairs like "EURUSD=X" render as
// "EUR/USD"; commodities ("CL=F") and indices ("^GSPC") render with their
// friendly names. Display-only — the real symbol is unchanged and still used
// for API calls and as the storage key.
export function displaySymbol(symbol: string): string {
  if (!symbol) return symbol;
  const upper = symbol.toUpperCase();
  if (COMMODITY_NAMES[upper]) return COMMODITY_NAMES[upper];
  if (INDEX_NAMES[upper]) return INDEX_NAMES[upper];
  if (upper.endsWith("=X")) {
    const base = upper.slice(0, -2);
    if (/^[A-Z]{6}$/.test(base)) return `${base.slice(0, 3)}/${base.slice(3)}`;
    return base;
  }
  return symbol;
}
