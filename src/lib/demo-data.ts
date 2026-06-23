import type { StockData } from "./types";

export const DEMO_DATA: StockData = {
  profile: {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    exchange: "NASDAQ",
    industry: "Consumer Electronics",
    sector: "Technology",
    country: "US",
    description:
      "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home and accessories.",
    ceo: "Mr. Timothy D. Cook",
    fullTimeEmployees: "161000",
    website: "https://www.apple.com",
    image: "",
    price: 214.24,
    changes: 3.56,
    mktCap: 3280000000000,
    volAvg: 54230000,
    range: "164.08 - 260.10",
    beta: 1.24,
    lastDiv: 1.0,
    ipoDate: "1980-12-12",
    currency: "USD",
  },
  quote: {
    price: 214.24,
    changesPercentage: 1.69,
    change: 3.56,
    dayLow: 210.3,
    dayHigh: 215.18,
    yearHigh: 260.1,
    yearLow: 164.08,
    volume: 62340000,
    avgVolume: 54230000,
    open: 211.56,
    previousClose: 210.68,
    marketCap: 3280000000000,
    pe: 33.48,
    eps: 6.4,
  },
  metrics: {
    revenuePerShareTTM: 25.78,
    netIncomePerShareTTM: 6.4,
    operatingCashFlowPerShareTTM: 7.62,
    freeCashFlowPerShareTTM: 6.95,
    peRatioTTM: 33.48,
    priceToSalesRatioTTM: 8.31,
    pbRatioTTM: 62.4,
    evToEbitdaTTM: 26.12,
    evToRevenueTTM: 8.65,
    debtToEquityTTM: 1.87,
    currentRatioTTM: 0.87,
    returnOnEquityTTM: 1.57,
    returnOnAssetsTTM: 0.285,
    dividendYieldTTM: 0.0047,
    earningsYieldTTM: 0.0299,
    freeCashFlowYieldTTM: 0.0324,
    debtToAssetsTTM: 0.33,
    netDebtToEBITDATTM: 0.55,
    interestCoverageTTM: 29.16,
    payoutRatioTTM: 0.156,
    marketCapTTM: 3280000000000,
    netProfitMarginTTM: 0.2397,
    grossProfitMarginTTM: 0.4621,
    operatingProfitMarginTTM: 0.3151,
    enterpriseValueOverEBITDATTM: 26.12,
    revenueGrowthTTM: 0.02,
  },
  income: [
    {
      date: "2024-09-28",
      calendarYear: "2024",
      period: "FY",
      revenue: 391035000000,
      grossProfit: 180683000000,
      grossProfitRatio: 0.4621,
      operatingIncome: 123216000000,
      operatingIncomeRatio: 0.3151,
      netIncome: 93736000000,
      netIncomeRatio: 0.2397,
      eps: 6.11,
      epsdiluted: 6.08,
      ebitda: 134658000000,
      operatingExpenses: 57467000000,
      costOfRevenue: 210352000000,
    },
    {
      date: "2023-09-30",
      calendarYear: "2023",
      period: "FY",
      revenue: 383285000000,
      grossProfit: 169148000000,
      grossProfitRatio: 0.4413,
      operatingIncome: 114301000000,
      operatingIncomeRatio: 0.2982,
      netIncome: 96995000000,
      netIncomeRatio: 0.2531,
      eps: 6.16,
      epsdiluted: 6.13,
      ebitda: 125820000000,
      operatingExpenses: 54847000000,
      costOfRevenue: 214137000000,
    },
    {
      date: "2022-09-24",
      calendarYear: "2022",
      period: "FY",
      revenue: 394328000000,
      grossProfit: 170782000000,
      grossProfitRatio: 0.4331,
      operatingIncome: 119437000000,
      operatingIncomeRatio: 0.3029,
      netIncome: 99803000000,
      netIncomeRatio: 0.2531,
      eps: 6.15,
      epsdiluted: 6.11,
      ebitda: 130541000000,
      operatingExpenses: 51345000000,
      costOfRevenue: 223546000000,
    },
    {
      date: "2021-09-25",
      calendarYear: "2021",
      period: "FY",
      revenue: 365817000000,
      grossProfit: 152836000000,
      grossProfitRatio: 0.4178,
      operatingIncome: 108949000000,
      operatingIncomeRatio: 0.2978,
      netIncome: 94680000000,
      netIncomeRatio: 0.2588,
      eps: 5.67,
      epsdiluted: 5.61,
      ebitda: 120233000000,
      operatingExpenses: 43887000000,
      costOfRevenue: 212981000000,
    },
    {
      date: "2020-09-26",
      calendarYear: "2020",
      period: "FY",
      revenue: 274515000000,
      grossProfit: 104956000000,
      grossProfitRatio: 0.3823,
      operatingIncome: 66288000000,
      operatingIncomeRatio: 0.2415,
      netIncome: 57411000000,
      netIncomeRatio: 0.2091,
      eps: 3.28,
      epsdiluted: 3.28,
      ebitda: 77344000000,
      operatingExpenses: 38668000000,
      costOfRevenue: 169559000000,
    },
  ],
  history: generateDemoHistory(),
};

function generateDemoHistory() {
  const totalDays = 1826;
  const result = [];
  const startDate = new Date("2021-06-22");

  let price = 130;
  const milestones = [
    { day: 0, target: 130 },
    { day: 180, target: 155 },
    { day: 365, target: 175 },
    { day: 550, target: 140 },
    { day: 730, target: 165 },
    { day: 900, target: 190 },
    { day: 1100, target: 180 },
    { day: 1300, target: 195 },
    { day: 1500, target: 210 },
    { day: 1826, target: 214 },
  ];

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;

    let targetPrice = milestones[0].target;
    for (let m = 0; m < milestones.length - 1; m++) {
      if (i >= milestones[m].day && i < milestones[m + 1].day) {
        const progress =
          (i - milestones[m].day) /
          (milestones[m + 1].day - milestones[m].day);
        targetPrice =
          milestones[m].target +
          (milestones[m + 1].target - milestones[m].target) * progress;
        break;
      }
    }

    const drift = (targetPrice - price) * 0.02;
    const volatility = price * 0.015;
    const noise = (Math.random() - 0.5) * 2 * volatility;
    price = Math.max(80, price + drift + noise);

    const close = Math.round(price * 100) / 100;
    const dayRange = price * 0.012;

    result.push({
      date: date.toISOString().split("T")[0],
      open: Math.round((close + (Math.random() - 0.5) * dayRange) * 100) / 100,
      high: Math.round((close + Math.random() * dayRange * 1.5) * 100) / 100,
      low: Math.round((close - Math.random() * dayRange * 1.5) * 100) / 100,
      close,
      volume: Math.round(35000000 + Math.random() * 40000000),
      changePercent: Math.round((Math.random() - 0.5) * 400) / 100,
    });
  }

  return result;
}
