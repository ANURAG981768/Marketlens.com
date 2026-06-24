"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  BarChart3,
  Globe,
  AlertTriangle,
  Clock,
  Activity,
  DollarSign,
  Building2,
  Factory,
  Landmark,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Impact = "High" | "Medium" | "Low";
type TimeFilter = "this-week" | "next-week" | "this-month";
type Outcome = "Beat" | "Miss" | "In-Line" | null;

interface EconomicEvent {
  id: string;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:MM ET
  name: string;
  country: string;       // flag emoji
  countryName: string;
  impact: Impact;
  previous: string;
  forecast: string;
  actual: string | null;
  outcome: Outcome;
  description: string;
  marketImpact: string;
  historicalContext: string;
  sectorsAffected: string[];
}


/* ------------------------------------------------------------------ */
/*  Demo data — economic events                                        */
/* ------------------------------------------------------------------ */

const DEMO_EVENTS: EconomicEvent[] = [
  {
    id: "fomc-jun",
    date: "2025-06-18",
    time: "14:00",
    name: "FOMC Interest Rate Decision",
    country: "🇺🇸",
    countryName: "United States",
    impact: "High",
    previous: "5.25-5.50%",
    forecast: "5.25-5.50%",
    actual: "5.25-5.50%",
    outcome: "In-Line",
    description: "The Federal Open Market Committee (FOMC) sets the target range for the federal funds rate — the rate banks charge each other for overnight loans. This is the most influential interest rate in the world because it affects borrowing costs for everything from mortgages to corporate bonds.",
    marketImpact: "Rate decisions cause some of the largest single-day moves in markets. A surprise hike tends to hurt growth stocks (especially tech) because higher rates reduce the present value of future earnings. Financials may benefit from wider lending margins.",
    historicalContext: "The Fed has held rates steady at 5.25-5.50% since July 2023 after the most aggressive tightening cycle in decades. Markets are watching closely for signals of when cuts may begin.",
    sectorsAffected: ["Technology", "Real Estate", "Financials", "Utilities"],
  },
  {
    id: "cpi-jun",
    date: "2025-06-11",
    time: "08:30",
    name: "CPI Report (YoY)",
    country: "🇺🇸",
    countryName: "United States",
    impact: "High",
    previous: "3.4%",
    forecast: "3.3%",
    actual: "3.2%",
    outcome: "Beat",
    description: "The Consumer Price Index measures the average change in prices paid by consumers for a basket of goods and services including food, housing, transportation, and medical care. It is the most closely watched measure of inflation in the United States.",
    marketImpact: "Lower-than-expected CPI is generally bullish for stocks because it signals the Fed may cut rates sooner. Higher CPI readings spook markets as they suggest more rate hikes or 'higher for longer' policy. Bond yields move inversely to CPI surprises.",
    historicalContext: "Inflation peaked at 9.1% in June 2022 and has been on a gradual decline. The Fed targets 2% inflation, so readings above 3% still keep pressure on policy makers to maintain restrictive rates.",
    sectorsAffected: ["Consumer Staples", "Real Estate", "Technology", "Bonds"],
  },
  {
    id: "nfp-jun",
    date: "2025-06-06",
    time: "08:30",
    name: "Non-Farm Payrolls",
    country: "🇺🇸",
    countryName: "United States",
    impact: "High",
    previous: "272K",
    forecast: "185K",
    actual: "206K",
    outcome: "Miss",
    description: "Non-Farm Payrolls (NFP) measures the change in the number of employed people in the US, excluding farm workers, government employees, private household employees, and non-profit workers. It is the most important employment indicator released monthly.",
    marketImpact: "Strong jobs numbers can be a double-edged sword: they signal a healthy economy but may delay Fed rate cuts. Weak numbers can boost rate-cut hopes but also raise recession fears. The market's reaction depends on which narrative dominates at the time.",
    historicalContext: "The US labor market has remained surprisingly resilient despite aggressive rate hikes. Monthly job gains have averaged around 200K+ in recent months, well above the ~100K needed to keep pace with population growth.",
    sectorsAffected: ["Consumer Discretionary", "Financials", "Industrials", "Technology"],
  },
  {
    id: "gdp-q1",
    date: "2025-06-26",
    time: "08:30",
    name: "GDP Growth Rate (Q1 Final)",
    country: "🇺🇸",
    countryName: "United States",
    impact: "High",
    previous: "3.4%",
    forecast: "1.3%",
    actual: null,
    outcome: null,
    description: "Gross Domestic Product measures the total value of goods and services produced in the US. The final reading is the third and last estimate for the quarter, incorporating the most complete data available. GDP is the broadest measure of economic health.",
    marketImpact: "GDP growth above expectations is generally positive for stocks as it signals strong corporate revenue potential. However, very hot GDP can worry markets about inflation and rate hikes. A negative GDP surprise can trigger sell-offs, especially in cyclical sectors.",
    historicalContext: "Q1 2025 GDP slowed significantly from Q4 2024's 3.4% pace, partly reflecting the lagged effects of high interest rates on consumer spending and business investment.",
    sectorsAffected: ["Industrials", "Consumer Discretionary", "Technology", "Materials"],
  },
  {
    id: "unemployment-jun",
    date: "2025-06-06",
    time: "08:30",
    name: "Unemployment Rate",
    country: "🇺🇸",
    countryName: "United States",
    impact: "High",
    previous: "3.9%",
    forecast: "3.9%",
    actual: "3.8%",
    outcome: "Beat",
    description: "The unemployment rate represents the percentage of the total labor force that is unemployed but actively seeking employment. It is released alongside Non-Farm Payrolls and is a key indicator of labor market slack.",
    marketImpact: "A falling unemployment rate signals economic strength but can also mean wage inflation is building, which pressures the Fed to keep rates higher. A rising rate may signal economic weakness but could accelerate rate cuts.",
    historicalContext: "At 3.8%, unemployment remains near historic lows. The last time unemployment was consistently below 4% for this long was in the late 1960s. Economists watch for any uptick as an early recession signal.",
    sectorsAffected: ["Consumer Discretionary", "Retail", "Restaurants", "Staffing"],
  },
  {
    id: "retail-sales",
    date: "2025-06-17",
    time: "08:30",
    name: "Retail Sales (MoM)",
    country: "🇺🇸",
    countryName: "United States",
    impact: "Medium",
    previous: "0.0%",
    forecast: "0.3%",
    actual: "0.4%",
    outcome: "Beat",
    description: "Retail Sales measures the total receipts at stores that sell merchandise and related services to consumers. It is a major indicator of consumer spending, which makes up about 70% of US GDP.",
    marketImpact: "Strong retail sales signal consumer confidence and can boost retail and consumer discretionary stocks. Weak data raises concerns about consumer pullback and potential economic slowdown. E-commerce vs. brick-and-mortar trends are also closely watched.",
    historicalContext: "Consumer spending has remained resilient despite high interest rates, partly supported by a strong labor market and accumulated pandemic savings, though excess savings are now largely depleted.",
    sectorsAffected: ["Consumer Discretionary", "Retail", "E-Commerce", "Consumer Staples"],
  },
  {
    id: "consumer-confidence",
    date: "2025-06-24",
    time: "10:00",
    name: "Consumer Confidence Index",
    country: "🇺🇸",
    countryName: "United States",
    impact: "Medium",
    previous: "97.0",
    forecast: "96.0",
    actual: null,
    outcome: null,
    description: "The Consumer Confidence Index, published by The Conference Board, measures how optimistic or pessimistic consumers are about the economy. It surveys 5,000 households about current business conditions, employment, and their expectations for the next six months.",
    marketImpact: "Higher confidence generally correlates with increased consumer spending, which benefits retailers and the broader economy. Declining confidence can be an early warning of reduced spending ahead. Markets tend to react to large surprises rather than small moves.",
    historicalContext: "Consumer confidence has been trending lower from its 2024 highs as persistent inflation and high interest rates weigh on household sentiment, despite strong employment numbers.",
    sectorsAffected: ["Consumer Discretionary", "Retail", "Homebuilders", "Autos"],
  },
  {
    id: "pmi-mfg",
    date: "2025-06-23",
    time: "09:45",
    name: "PMI Manufacturing",
    country: "🇺🇸",
    countryName: "United States",
    impact: "Medium",
    previous: "51.3",
    forecast: "51.0",
    actual: null,
    outcome: null,
    description: "The Purchasing Managers' Index for manufacturing surveys purchasing managers at over 400 companies about new orders, production, employment, supplier deliveries, and inventories. A reading above 50 indicates expansion; below 50 signals contraction.",
    marketImpact: "PMI above 50 suggests the manufacturing sector is expanding, which is positive for industrial and materials stocks. The new orders sub-index is considered a leading indicator. A drop below 50 can signal an industrial recession even if the broader economy is growing.",
    historicalContext: "US manufacturing PMI has oscillated around the 50 threshold for over a year, reflecting mixed conditions. The services sector has been much stronger, creating a two-speed economy.",
    sectorsAffected: ["Industrials", "Materials", "Machinery", "Transportation"],
  },
  {
    id: "ppi-jun",
    date: "2025-06-12",
    time: "08:30",
    name: "PPI Report (MoM)",
    country: "🇺🇸",
    countryName: "United States",
    impact: "Medium",
    previous: "0.5%",
    forecast: "0.1%",
    actual: "0.0%",
    outcome: "Beat",
    description: "The Producer Price Index measures the average change in selling prices received by domestic producers. Unlike CPI which measures consumer prices, PPI captures inflation at the wholesale level. It is often seen as a leading indicator for consumer inflation.",
    marketImpact: "A declining PPI suggests cost pressures are easing for businesses, which can improve profit margins. It also signals that consumer inflation may follow lower, which is positive for rate-cut expectations. Rising PPI can squeeze corporate margins.",
    historicalContext: "Producer prices have been moderating after sharp increases during the supply-chain disruptions of 2021-2022. The gap between PPI and CPI trends helps analysts gauge whether businesses are absorbing or passing on costs.",
    sectorsAffected: ["Manufacturing", "Consumer Staples", "Energy", "Agriculture"],
  },
  {
    id: "jobless-claims",
    date: "2025-06-19",
    time: "08:30",
    name: "Initial Jobless Claims",
    country: "🇺🇸",
    countryName: "United States",
    impact: "Medium",
    previous: "229K",
    forecast: "225K",
    actual: "222K",
    outcome: "Beat",
    description: "Initial Jobless Claims counts the number of people filing for unemployment insurance for the first time each week. It is one of the most timely economic indicators because it is released weekly, giving a near real-time pulse on the labor market.",
    marketImpact: "Rising claims suggest a weakening labor market, which can boost rate-cut expectations but also raise recession fears. Falling claims signal labor market strength. The 4-week moving average is watched more closely than any single week to smooth volatility.",
    historicalContext: "Weekly claims have remained in the 200K-240K range, consistent with a healthy labor market. Economists would start worrying about a sustained move above 280K-300K as a sign of meaningful deterioration.",
    sectorsAffected: ["Consumer Discretionary", "Staffing", "Insurance", "Retail"],
  },
  {
    id: "housing-starts",
    date: "2025-06-19",
    time: "08:30",
    name: "Housing Starts",
    country: "🇺🇸",
    countryName: "United States",
    impact: "Medium",
    previous: "1.36M",
    forecast: "1.38M",
    actual: "1.41M",
    outcome: "Beat",
    description: "Housing Starts measures the number of new residential construction projects that began during a given month. It is a key leading indicator because housing construction has wide-reaching effects on the economy, from materials to appliances to employment.",
    marketImpact: "Higher housing starts signal confidence from builders and growing demand, benefiting homebuilder stocks, building materials, and home improvement retailers. The data also reflects mortgage rate sensitivity — starts tend to fall when rates rise sharply.",
    historicalContext: "Housing starts have been constrained by elevated mortgage rates above 7%, but a persistent housing shortage has kept builder activity above recession-era lows. The market is watching for any rate-driven rebound.",
    sectorsAffected: ["Homebuilders", "Building Materials", "Home Improvement", "REITs"],
  },
  {
    id: "ecb-rate",
    date: "2025-06-05",
    time: "07:45",
    name: "ECB Interest Rate Decision",
    country: "🇪🇺",
    countryName: "European Union",
    impact: "High",
    previous: "4.50%",
    forecast: "4.25%",
    actual: "4.25%",
    outcome: "In-Line",
    description: "The European Central Bank sets interest rates for the 20-nation Eurozone. Rate decisions affect the euro, European equities, and have spillover effects on global markets. The ECB has been on its own inflation-fighting campaign parallel to the Fed.",
    marketImpact: "ECB rate cuts weaken the euro relative to the dollar, which can hurt European exporters but benefit US companies selling in Europe. Divergence between Fed and ECB policy creates opportunities in currency and bond markets. European bank stocks are directly affected.",
    historicalContext: "The ECB cut rates for the first time in this cycle in June 2025, moving ahead of the Fed. This divergence is unusual and reflects Europe's weaker economic growth compared to the US.",
    sectorsAffected: ["European Equities", "Financials", "Exporters", "Currency Markets"],
  },
  {
    id: "boe-rate",
    date: "2025-06-19",
    time: "07:00",
    name: "BoE Interest Rate Decision",
    country: "🇬🇧",
    countryName: "United Kingdom",
    impact: "High",
    previous: "5.25%",
    forecast: "5.25%",
    actual: null,
    outcome: null,
    description: "The Bank of England's Monetary Policy Committee sets the UK base rate. This affects UK mortgage rates, the pound sterling, and the FTSE index. The BoE faces a unique challenge balancing persistent UK inflation with sluggish economic growth.",
    marketImpact: "BoE decisions primarily affect UK equities and the GBP/USD exchange rate. US investors with international exposure watch this for global rate trends. A rate cut by the BoE before the Fed could strengthen the dollar and create headwinds for US exporters.",
    historicalContext: "UK inflation has been stickier than in the US or Eurozone, partly due to energy market structure and labor shortages post-Brexit. The BoE has signaled patience, keeping markets guessing on the first cut.",
    sectorsAffected: ["UK Equities", "British Banks", "Real Estate", "Currency Markets"],
  },
  {
    id: "rbi-rate",
    date: "2025-06-06",
    time: "05:30",
    name: "RBI Interest Rate Decision",
    country: "🇮🇳",
    countryName: "India",
    impact: "Medium",
    previous: "6.50%",
    forecast: "6.50%",
    actual: "6.50%",
    outcome: "In-Line",
    description: "The Reserve Bank of India sets the repo rate, which is the rate at which the RBI lends to commercial banks. India's monetary policy affects the world's fifth-largest economy and a rapidly growing equity market that has attracted significant foreign investment.",
    marketImpact: "RBI decisions affect Indian ADRs and ETFs popular with US investors (like INDA). Rate cuts tend to boost Indian equities. The decision also impacts the INR/USD exchange rate and foreign portfolio flows into emerging markets.",
    historicalContext: "The RBI has held rates steady at 6.50% while monitoring domestic inflation and the impact of global rate dynamics. India's economy has been one of the fastest-growing major economies, supporting a resilient stock market.",
    sectorsAffected: ["Indian IT", "Indian Financials", "Emerging Markets", "Auto"],
  },
  {
    id: "boj-rate",
    date: "2025-06-13",
    time: "23:00",
    name: "BoJ Interest Rate Decision",
    country: "🇯🇵",
    countryName: "Japan",
    impact: "High",
    previous: "0.10%",
    forecast: "0.10%",
    actual: "0.10%",
    outcome: "In-Line",
    description: "The Bank of Japan sets monetary policy for the world's third-largest economy. After decades of ultra-loose policy including negative rates, the BoJ has been cautiously normalizing. Their decisions have outsized effects on global bond and currency markets.",
    marketImpact: "BoJ tightening strengthens the yen, which can trigger unwinding of the 'yen carry trade' — a massive global flow where investors borrow in cheap yen to invest elsewhere. This unwinding can cause sharp sell-offs in US and global equities.",
    historicalContext: "The BoJ ended negative interest rates in March 2024, a historic shift after 8 years. Further rate hikes have been cautious as Japan balances its first sustained inflation in decades against a fragile economic recovery.",
    sectorsAffected: ["Japanese Equities", "Global Bonds", "Currency Markets", "Carry Trade"],
  },
  {
    id: "michigan-sentiment",
    date: "2025-06-13",
    time: "10:00",
    name: "Michigan Consumer Sentiment",
    country: "🇺🇸",
    countryName: "United States",
    impact: "Medium",
    previous: "69.1",
    forecast: "72.0",
    actual: "68.2",
    outcome: "Miss",
    description: "The University of Michigan Consumer Sentiment Index surveys 500 households about their personal financial conditions, business conditions, and buying conditions. Unlike the Conference Board measure, it includes inflation expectations which the Fed monitors closely.",
    marketImpact: "The inflation expectations component of this survey is what moves markets most. If consumers expect higher future inflation, the Fed may need to stay restrictive longer. The headline sentiment number affects consumer discretionary stocks.",
    historicalContext: "Consumer sentiment has remained well below pre-pandemic levels despite strong employment, reflecting the psychological impact of cumulative price increases. The gap between 'hard' economic data and 'soft' sentiment data is unusually wide.",
    sectorsAffected: ["Consumer Discretionary", "Retail", "Homebuilders", "Autos"],
  },
  {
    id: "industrial-prod",
    date: "2025-06-17",
    time: "09:15",
    name: "Industrial Production (MoM)",
    country: "🇺🇸",
    countryName: "United States",
    impact: "Low",
    previous: "0.0%",
    forecast: "0.2%",
    actual: "0.3%",
    outcome: "Beat",
    description: "Industrial Production measures the output of factories, mines, and utilities in the US. It covers about 20% of the economy and is a coincident indicator of business cycle conditions, often confirming trends seen in other data.",
    marketImpact: "This report has a moderate market impact as it mostly confirms what other data (like PMI) has already suggested. Large surprises can move industrial stocks. The capacity utilization sub-component signals whether the economy is overheating.",
    historicalContext: "Industrial production has been flat to slightly positive, reflecting the sluggish manufacturing sector even as services boom. The divergence between goods and services production remains a key feature of this cycle.",
    sectorsAffected: ["Industrials", "Materials", "Utilities", "Mining"],
  },
  {
    id: "trade-balance",
    date: "2025-06-05",
    time: "08:30",
    name: "Trade Balance",
    country: "🇺🇸",
    countryName: "United States",
    impact: "Low",
    previous: "-$69.4B",
    forecast: "-$69.0B",
    actual: "-$74.6B",
    outcome: "Miss",
    description: "The Trade Balance measures the difference between US exports and imports. A deficit means the US imports more than it exports. It is a component of GDP and reflects the competitiveness of US goods and services in global markets.",
    marketImpact: "The trade balance has a relatively small immediate market impact but is important for understanding GDP contributions and dollar strength. A widening deficit can weigh on the dollar over time, benefiting multinational companies with overseas revenue.",
    historicalContext: "The US has run persistent trade deficits for decades, reflecting strong domestic consumption and the dollar's role as the global reserve currency. Recent geopolitical tensions have added focus on supply chain dependencies.",
    sectorsAffected: ["Exporters", "Importers", "Shipping", "Agriculture"],
  },
];

/* ------------------------------------------------------------------ */
/*  Key indicator cards                                                */
/* ------------------------------------------------------------------ */

// Live macro indicators come from /api/macro (real Yahoo data). We map each to
// an icon by its symbol. No hardcoded CPI/GDP/Fed-funds figures we can't verify.
interface LiveMacro {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePct: number;
  unit: "%" | "$" | "pt";
  decimals: number;
  explanation: string;
}

const MACRO_ICON: Record<string, React.ReactNode> = {
  "^TNX": <Landmark className="w-4 h-4" />,
  "^TYX": <Landmark className="w-4 h-4" />,
  "^IRX": <Building2 className="w-4 h-4" />,
  "^VIX": <Activity className="w-4 h-4" />,
  "DX-Y.NYB": <DollarSign className="w-4 h-4" />,
  "GC=F": <BarChart3 className="w-4 h-4" />,
  "CL=F": <Factory className="w-4 h-4" />,
};

function formatMacro(m: LiveMacro): string {
  if (m.unit === "%") return `${m.value.toFixed(m.decimals)}%`;
  if (m.unit === "$") return `$${m.value.toLocaleString("en-US", { maximumFractionDigits: m.decimals })}`;
  return m.value.toFixed(m.decimals);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getImpactColor(impact: Impact): string {
  switch (impact) {
    case "High":
      return "bg-red-100 text-red-700 border-red-200";
    case "Medium":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Low":
      return "bg-gray-100 text-[var(--color-text-muted)] border-gray-200";
  }
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isEventInRange(event: EconomicEvent, filter: TimeFilter): boolean {
  const eventDate = new Date(event.date + "T12:00:00");
  const now = new Date(); // real current date — events are rebased to this month
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() + mondayOffset);
  thisMonday.setHours(0, 0, 0, 0);

  const thisSunday = new Date(thisMonday);
  thisSunday.setDate(thisMonday.getDate() + 6);
  thisSunday.setHours(23, 59, 59, 999);

  switch (filter) {
    case "this-week": {
      return eventDate >= thisMonday && eventDate <= thisSunday;
    }
    case "next-week": {
      const nextMonday = new Date(thisMonday);
      nextMonday.setDate(thisMonday.getDate() + 7);
      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);
      nextSunday.setHours(23, 59, 59, 999);
      return eventDate >= nextMonday && eventDate <= nextSunday;
    }
    case "this-month": {
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    }
  }
}

/*
 * Re-base the event templates onto the current month so the calendar always
 * reflects the present period, and strip any fabricated "actual"/"outcome"
 * results — we never show invented release numbers as if they were real.
 * The day-of-month from each template preserves the real release cadence
 * (jobs early month, CPI mid-month, GDP/confidence late month, etc.).
 */
function rebaseEvents(events: EconomicEvent[]): EconomicEvent[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  return events.map((e) => {
    const origDay = parseInt(e.date.split("-")[2], 10) || 1;
    const day = Math.min(origDay, daysInMonth);
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    // Strip every fabricated figure (previous/forecast/actual/outcome). We keep
    // only the real release cadence and the educational context — never invented numbers.
    return { ...e, date: dateStr, previous: "", forecast: "", actual: null, outcome: null };
  });
}

const SCHEDULED_EVENTS: EconomicEvent[] = rebaseEvents(DEMO_EVENTS);

function countThisWeekEvents(): number {
  return SCHEDULED_EVENTS.filter((e) => isEventInRange(e, "this-week")).length;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EconomicCalendar() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("this-month");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [macro, setMacro] = useState<LiveMacro[]>([]);

  // Live macro indicators (Treasury yields, VIX, dollar, gold, oil) from Yahoo.
  useEffect(() => {
    let active = true;
    const load = () =>
      fetch("/api/macro")
        .then((r) => r.json())
        .then((j) => {
          if (active && Array.isArray(j.indicators)) setMacro(j.indicators as LiveMacro[]);
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 120000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const filteredEvents = SCHEDULED_EVENTS.filter((e) => isEventInRange(e, timeFilter)).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const thisWeekCount = countThisWeekEvents();

  const TIME_FILTER_OPTIONS: { key: TimeFilter; label: string }[] = [
    { key: "this-week", label: "This Week" },
    { key: "next-week", label: "Next Week" },
    { key: "this-month", label: "This Month" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand)] to-emerald-400 flex items-center justify-center text-white shadow-sm">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">
            Economic Calendar
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {thisWeekCount} event{thisWeekCount !== 1 ? "s" : ""} this week
          </p>
        </div>
      </div>

      {/* ── Educational Banner ── */}
      {showBanner && (
        <div className="relative bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fade-in-up">
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-blue-100 text-blue-400 hover:text-blue-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Why Economic Data Matters for Stocks
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Economic indicators like GDP, inflation, and employment data drive Federal Reserve
                policy decisions, which directly affect interest rates and stock valuations. Strong
                economic data can boost corporate earnings expectations, while surprising weakness
                can trigger market sell-offs. Understanding these releases helps you anticipate
                market-moving events and make more informed investment decisions.
              </p>
              <p className="text-xs text-blue-700/80 leading-relaxed mt-2">
                <strong>Note:</strong> This calendar shows the typical monthly release schedule with
                illustrative forecast figures for learning. Confirm exact dates and live figures on
                official sources (federalreserve.gov, bls.gov).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Time Filters ── */}
      <div className="flex gap-2">
        {TIME_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setTimeFilter(opt.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeFilter === opt.key
                ? "bg-[var(--color-brand)] text-white shadow-sm"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Event List ── */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl divide-y divide-[var(--color-border)] overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--color-text-muted)]">
              No economic events scheduled for this period.
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isExpanded = expandedEvent === event.id;

            return (
              <div key={event.id} className="transition-colors">
                {/* Event row */}
                <button
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  className="w-full text-left px-4 py-3.5 hover:bg-[var(--color-surface)] transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left side: date, flag, name, impact */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Date block */}
                      <div className="shrink-0 w-16 text-center">
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {formatEventDate(event.date)}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {event.time} ET
                        </div>
                      </div>

                      {/* Flag */}
                      <span className="text-lg shrink-0" title={event.countryName}>
                        {event.country}
                      </span>

                      {/* Name + impact */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                            {event.name}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${getImpactColor(
                              event.impact
                            )}`}
                          >
                            {event.impact === "High" && (
                              <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                            )}
                            {event.impact}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: expand chevron */}
                    <div className="flex items-center gap-4 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] animate-fade-in-up">
                    <div className="grid sm:grid-cols-2 gap-4 pt-4">
                      {/* What is this? */}
                      <div className="bg-white border border-[var(--color-border)] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-blue-500" />
                          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                            What is this?
                          </h4>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      {/* Why it matters */}
                      <div className="bg-white border border-[var(--color-border)] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-[var(--color-brand)]" />
                          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                            Why it matters for stocks
                          </h4>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                          {event.marketImpact}
                        </p>
                      </div>

                      {/* Historical context */}
                      <div className="bg-white border border-[var(--color-border)] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                            Historical context
                          </h4>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                          {event.historicalContext}
                        </p>
                      </div>

                      {/* Sectors most affected */}
                      <div className="bg-white border border-[var(--color-border)] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-purple-500" />
                          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                            Sectors most affected
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {event.sectorsAffected.map((sector) => (
                            <span
                              key={sector}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                            >
                              {sector}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Key Indicators Dashboard (live market-based macro data) ── */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[var(--color-brand)]" />
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Key Market Indicators
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE · Yahoo Finance
          </span>
        </div>

        {macro.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-[var(--color-border)] rounded-xl p-4 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {macro.map((m) => {
              const up = m.changePct >= 0;
              return (
                <div
                  key={m.symbol}
                  className="bg-white border border-[var(--color-border)] rounded-xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                      {m.name}
                    </span>
                    <span className="text-[var(--color-text-muted)]">{MACRO_ICON[m.symbol]}</span>
                  </div>

                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-xl font-bold text-[var(--color-text-primary)]">
                      {formatMacro(m)}
                    </span>
                    <div className="flex items-center gap-1 pb-0.5">
                      {up ? (
                        <TrendingUp className="w-3.5 h-3.5 text-[var(--color-positive)]" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-[var(--color-negative)]" />
                      )}
                      <span className={`text-xs font-medium ${up ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
                        {up ? "+" : ""}{m.changePct.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {m.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
