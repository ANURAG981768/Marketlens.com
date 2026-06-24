export interface CompanyProfile {
  symbol: string;
  companyName: string;
  exchange: string;
  industry: string;
  sector: string;
  country: string;
  description: string;
  ceo: string;
  fullTimeEmployees: string;
  website: string;
  image: string;
  price: number;
  changes: number;
  mktCap: number;
  volAvg: number;
  range: string;
  beta: number;
  lastDiv: number;
  ipoDate: string;
  currency: string;
}

export interface KeyMetrics {
  revenuePerShareTTM: number;
  netIncomePerShareTTM: number;
  operatingCashFlowPerShareTTM: number;
  freeCashFlowPerShareTTM: number;
  peRatioTTM: number;
  priceToSalesRatioTTM: number;
  pbRatioTTM: number;
  evToEbitdaTTM: number;
  evToRevenueTTM: number;
  debtToEquityTTM: number;
  currentRatioTTM: number;
  returnOnEquityTTM: number;
  returnOnAssetsTTM: number;
  dividendYieldTTM: number;
  earningsYieldTTM: number;
  freeCashFlowYieldTTM: number;
  debtToAssetsTTM: number;
  netDebtToEBITDATTM: number;
  interestCoverageTTM: number;
  payoutRatioTTM: number;
  marketCapTTM: number;
  netProfitMarginTTM?: number;
  grossProfitMarginTTM?: number;
  operatingProfitMarginTTM?: number;
  enterpriseValueOverEBITDATTM?: number;
  revenueGrowthTTM?: number;
}

export interface IncomeStatement {
  date: string;
  calendarYear: string;
  period: string;
  revenue: number;
  grossProfit: number;
  grossProfitRatio: number;
  operatingIncome: number;
  operatingIncomeRatio: number;
  netIncome: number;
  netIncomeRatio: number;
  eps: number;
  epsdiluted: number;
  ebitda: number;
  operatingExpenses: number;
  costOfRevenue: number;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changePercent: number;
}

export interface StockData {
  profile: CompanyProfile;
  metrics: KeyMetrics;
  income: IncomeStatement[];
  history: HistoricalPrice[];
  dividends?: { year: string; amount: number }[];
  analyst?: {
    low: number | null;
    mean: number | null;
    high: number | null;
    count: number | null;
    recommendationKey: string | null;
    recommendationMean: number | null;
  };
  quote: {
    price: number;
    changesPercentage: number;
    change: number;
    dayLow: number;
    dayHigh: number;
    yearHigh: number;
    yearLow: number;
    volume: number;
    avgVolume: number;
    open: number;
    previousClose: number;
    marketCap: number;
    pe: number;
    eps: number;
  };
}
