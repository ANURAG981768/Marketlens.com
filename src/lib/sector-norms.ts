// Typical long-run P/E by GICS sector. Used so valuation is judged against a
// stock's OWN sector (30x is cheap for tech, rich for a utility) rather than a
// single absolute threshold. Shared by the stock-page AI Analyst and the
// Analytics Company Outlook so both engines stay consistent.
export const SECTOR_PE_NORM: Record<string, number> = {
  Technology: 28,
  Healthcare: 21,
  "Financial Services": 13,
  "Consumer Cyclical": 22,
  "Communication Services": 19,
  Industrials: 20,
  "Consumer Defensive": 22,
  Energy: 12,
  "Real Estate": 30,
  Utilities: 18,
  "Basic Materials": 15,
};

// Default when the sector is unknown — roughly the broad-market average P/E.
export const MARKET_PE_NORM = 20;

export function sectorPeNorm(sector?: string | null): number {
  return (sector && SECTOR_PE_NORM[sector]) || MARKET_PE_NORM;
}
