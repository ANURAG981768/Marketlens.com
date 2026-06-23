"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Scale,
  BarChart3,
  TrendingUp,
  Shield,
  DollarSign,
  Zap,
} from "lucide-react";
import { searchStocks, type SearchItem } from "@/lib/search-data";
import { DEMO_DATA } from "@/lib/demo-data";
import type { StockData } from "@/lib/types";

const MAX_STOCKS = 4;

function generateMockData(symbol: string, name: string): StockData {
  const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (min: number, max: number) => {
    const x = Math.sin(seed * 9301 + 49297) % 1;
    return min + Math.abs(x) * (max - min);
  };

  const price = rand(20, 500);
  const pe = rand(8, 60);
  const change = rand(-5, 5);
  const mktCap = rand(10, 3000) * 1e9;

  return {
    profile: {
      symbol,
      companyName: name,
      exchange: "NASDAQ",
      industry: "Technology",
      sector: "Technology",
      country: "US",
      description: "",
      ceo: "",
      fullTimeEmployees: "10000",
      website: "",
      image: "",
      price,
      changes: change,
      mktCap,
      volAvg: rand(5, 80) * 1e6,
      range: `${(price * 0.7).toFixed(2)} - ${(price * 1.3).toFixed(2)}`,
      beta: rand(0.5, 2.0),
      lastDiv: rand(0, 3),
      ipoDate: "2000-01-01",
      currency: "USD",
    },
    quote: {
      price,
      changesPercentage: (change / price) * 100,
      change,
      dayLow: price * 0.98,
      dayHigh: price * 1.02,
      yearHigh: price * 1.3,
      yearLow: price * 0.7,
      volume: rand(10, 100) * 1e6,
      avgVolume: rand(10, 80) * 1e6,
      open: price - change / 2,
      previousClose: price - change,
      marketCap: mktCap,
      pe,
      eps: price / pe,
    },
    metrics: {
      revenuePerShareTTM: rand(5, 50),
      netIncomePerShareTTM: rand(1, 15),
      operatingCashFlowPerShareTTM: rand(2, 20),
      freeCashFlowPerShareTTM: rand(1, 18),
      peRatioTTM: pe,
      priceToSalesRatioTTM: rand(1, 15),
      pbRatioTTM: rand(1, 30),
      evToEbitdaTTM: rand(5, 30),
      evToRevenueTTM: rand(1, 15),
      debtToEquityTTM: rand(0.1, 3),
      currentRatioTTM: rand(0.5, 3),
      returnOnEquityTTM: rand(0.05, 0.5),
      returnOnAssetsTTM: rand(0.02, 0.25),
      dividendYieldTTM: rand(0, 0.04),
      earningsYieldTTM: rand(0.02, 0.08),
      freeCashFlowYieldTTM: rand(0.02, 0.06),
      debtToAssetsTTM: rand(0.1, 0.6),
      netDebtToEBITDATTM: rand(0, 3),
      interestCoverageTTM: rand(5, 30),
      payoutRatioTTM: rand(0, 0.6),
      marketCapTTM: mktCap,
      netProfitMarginTTM: rand(0.05, 0.35),
      grossProfitMarginTTM: rand(0.2, 0.7),
      operatingProfitMarginTTM: rand(0.1, 0.4),
      enterpriseValueOverEBITDATTM: rand(5, 30),
      revenueGrowthTTM: rand(-0.1, 0.4),
    },
    income: Array.from({ length: 5 }, (_, i) => {
      const rev = rand(20, 400) * 1e9;
      const gp = rev * rand(0.3, 0.6);
      const oi = gp * rand(0.3, 0.7);
      const ni = oi * rand(0.5, 0.9);
      return {
        date: `${2024 - i}-09-30`,
        calendarYear: `${2024 - i}`,
        period: "FY" as const,
        revenue: rev,
        grossProfit: gp,
        grossProfitRatio: gp / rev,
        operatingIncome: oi,
        operatingIncomeRatio: oi / rev,
        netIncome: ni,
        netIncomeRatio: ni / rev,
        eps: rand(1, 15),
        epsdiluted: rand(1, 14),
        ebitda: oi * 1.15,
        operatingExpenses: gp - oi,
        costOfRevenue: rev - gp,
      };
    }),
    history: [],
  };
}

interface CompareStock {
  symbol: string;
  name: string;
  data: StockData;
}

interface MetricRow {
  label: string;
  key: string;
  getValue: (d: StockData) => number | null | undefined;
  format: (v: number) => string;
  higherIsBetter: boolean;
  category: string;
  icon: typeof DollarSign;
}

const METRICS: MetricRow[] = [
  {
    label: "Price",
    key: "price",
    getValue: (d) => d.quote.price,
    format: (v) => `$${v.toFixed(2)}`,
    higherIsBetter: false,
    category: "Price",
    icon: DollarSign,
  },
  {
    label: "Market Cap",
    key: "mktcap",
    getValue: (d) => d.quote.marketCap,
    format: (v) => {
      if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
      if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
      return `$${(v / 1e6).toFixed(0)}M`;
    },
    higherIsBetter: true,
    category: "Price",
    icon: BarChart3,
  },
  {
    label: "Day Change",
    key: "change",
    getValue: (d) => d.quote.changesPercentage,
    format: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`,
    higherIsBetter: true,
    category: "Price",
    icon: TrendingUp,
  },
  {
    label: "P/E Ratio",
    key: "pe",
    getValue: (d) => d.metrics.peRatioTTM || d.quote.pe,
    format: (v) => `${v.toFixed(1)}x`,
    higherIsBetter: false,
    category: "Valuation",
    icon: Scale,
  },
  {
    label: "P/S Ratio",
    key: "ps",
    getValue: (d) => d.metrics.priceToSalesRatioTTM,
    format: (v) => `${v.toFixed(2)}x`,
    higherIsBetter: false,
    category: "Valuation",
    icon: Scale,
  },
  {
    label: "P/B Ratio",
    key: "pb",
    getValue: (d) => d.metrics.pbRatioTTM,
    format: (v) => `${v.toFixed(1)}x`,
    higherIsBetter: false,
    category: "Valuation",
    icon: Scale,
  },
  {
    label: "EV/EBITDA",
    key: "evebitda",
    getValue: (d) => d.metrics.enterpriseValueOverEBITDATTM,
    format: (v) => `${v.toFixed(1)}x`,
    higherIsBetter: false,
    category: "Valuation",
    icon: Scale,
  },
  {
    label: "Gross Margin",
    key: "gm",
    getValue: (d) => d.metrics.grossProfitMarginTTM ? d.metrics.grossProfitMarginTTM * 100 : null,
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: true,
    category: "Profitability",
    icon: TrendingUp,
  },
  {
    label: "Net Margin",
    key: "nm",
    getValue: (d) => d.metrics.netProfitMarginTTM ? d.metrics.netProfitMarginTTM * 100 : null,
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: true,
    category: "Profitability",
    icon: TrendingUp,
  },
  {
    label: "Operating Margin",
    key: "om",
    getValue: (d) => d.metrics.operatingProfitMarginTTM ? d.metrics.operatingProfitMarginTTM * 100 : null,
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: true,
    category: "Profitability",
    icon: TrendingUp,
  },
  {
    label: "ROE",
    key: "roe",
    getValue: (d) => d.metrics.returnOnEquityTTM ? d.metrics.returnOnEquityTTM * 100 : null,
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: true,
    category: "Profitability",
    icon: Zap,
  },
  {
    label: "ROA",
    key: "roa",
    getValue: (d) => d.metrics.returnOnAssetsTTM ? d.metrics.returnOnAssetsTTM * 100 : null,
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: true,
    category: "Profitability",
    icon: Zap,
  },
  {
    label: "Revenue Growth",
    key: "revgrowth",
    getValue: (d) => d.metrics.revenueGrowthTTM ? d.metrics.revenueGrowthTTM * 100 : null,
    format: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
    higherIsBetter: true,
    category: "Growth",
    icon: TrendingUp,
  },
  {
    label: "Debt/Equity",
    key: "de",
    getValue: (d) => d.metrics.debtToEquityTTM,
    format: (v) => `${v.toFixed(2)}x`,
    higherIsBetter: false,
    category: "Health",
    icon: Shield,
  },
  {
    label: "Current Ratio",
    key: "cr",
    getValue: (d) => d.metrics.currentRatioTTM,
    format: (v) => `${v.toFixed(2)}`,
    higherIsBetter: true,
    category: "Health",
    icon: Shield,
  },
  {
    label: "Dividend Yield",
    key: "divy",
    getValue: (d) => d.metrics.dividendYieldTTM ? d.metrics.dividendYieldTTM * 100 : null,
    format: (v) => `${v.toFixed(2)}%`,
    higherIsBetter: true,
    category: "Income",
    icon: DollarSign,
  },
  {
    label: "EPS",
    key: "eps",
    getValue: (d) => d.quote.eps,
    format: (v) => `$${v.toFixed(2)}`,
    higherIsBetter: true,
    category: "Income",
    icon: DollarSign,
  },
  {
    label: "Beta",
    key: "beta",
    getValue: (d) => d.profile.beta,
    format: (v) => v.toFixed(2),
    higherIsBetter: false,
    category: "Risk",
    icon: Shield,
  },
];

const CATEGORIES = ["Price", "Valuation", "Profitability", "Growth", "Health", "Income", "Risk"];

export default function StockCompare() {
  const [stocks, setStocks] = useState<CompareStock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  function handleSearch(q: string) {
    setSearchQuery(q);
    if (q.length >= 1) {
      const results = searchStocks(q).filter(
        (r) => !stocks.some((s) => s.symbol === r.symbol)
      );
      setSearchResults(results.slice(0, 8));
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }

  function addStock(item: SearchItem) {
    if (stocks.length >= MAX_STOCKS) return;
    if (stocks.some((s) => s.symbol === item.symbol)) return;

    const data =
      item.symbol === "AAPL"
        ? DEMO_DATA
        : generateMockData(item.symbol, item.name);

    setStocks((prev) => [...prev, { symbol: item.symbol, name: item.name, data }]);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  }

  function removeStock(symbol: string) {
    setStocks((prev) => prev.filter((s) => s.symbol !== symbol));
  }

  const filteredMetrics = activeCategory
    ? METRICS.filter((m) => m.category === activeCategory)
    : METRICS;

  const winners = useMemo(() => {
    if (stocks.length < 2) return {};
    const w: Record<string, number> = {};
    for (const s of stocks) w[s.symbol] = 0;

    for (const metric of METRICS) {
      const values = stocks.map((s) => ({
        symbol: s.symbol,
        value: metric.getValue(s.data),
      }));
      const valid = values.filter((v) => v.value !== null && v.value !== undefined);
      if (valid.length < 2) continue;

      valid.sort((a, b) => {
        if (metric.higherIsBetter) return (b.value ?? 0) - (a.value ?? 0);
        return (a.value ?? 0) - (b.value ?? 0);
      });

      if (valid[0]) w[valid[0].symbol]++;
    }
    return w;
  }, [stocks]);

  const overallWinner = useMemo(() => {
    if (stocks.length < 2) return null;
    let best = "";
    let bestCount = 0;
    for (const [sym, count] of Object.entries(winners)) {
      if (count > bestCount) {
        bestCount = count;
        best = sym;
      }
    }
    return best;
  }, [stocks, winners]);

  if (stocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-10 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <Scale size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Stock Comparison</h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
            Compare up to {MAX_STOCKS} stocks side-by-side on valuation, profitability, growth, and risk metrics
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search stocks to compare — e.g. AAPL, MSFT, GOOGL"
              className="w-full pl-9 pr-4 py-3 text-sm border border-[var(--color-border)] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)]"
            />
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="mt-1 border border-[var(--color-border)] rounded-xl bg-white shadow-lg overflow-hidden">
              {searchResults.map((r) => (
                <button
                  key={r.symbol}
                  onClick={() => addStock(r)}
                  className="w-full px-4 py-3 text-left hover:bg-[var(--color-surface-hover)] flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="text-sm font-bold">{r.symbol}</span>
                    <span className="text-xs text-[var(--color-text-muted)] ml-2">{r.name}</span>
                  </div>
                  <Plus size={14} className="text-[var(--color-brand)]" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { symbols: ["AAPL", "MSFT"], label: "Apple vs Microsoft" },
              { symbols: ["GOOGL", "META"], label: "Google vs Meta" },
              { symbols: ["NVDA", "AMD"], label: "NVIDIA vs AMD" },
              { symbols: ["TSLA", "F"], label: "Tesla vs Ford" },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  for (const sym of preset.symbols) {
                    const item = searchStocks(sym).find((r) => r.symbol === sym);
                    if (item) addStock(item);
                  }
                }}
                className="px-4 py-3 border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-brand)]/30 transition-all text-center"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with search */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Scale size={16} className="text-white" />
          </div>
          <h2 className="text-lg font-bold">Compare</h2>
        </div>

        {/* Stock chips */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {stocks.map((s, i) => (
            <div
              key={s.symbol}
              className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full border border-[var(--color-border)] bg-white text-xs font-medium group"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ["#10b981", "#6366f1", "#f59e0b", "#ef4444"][i],
                }}
              />
              <span className="font-bold">{s.symbol}</span>
              {s.symbol === overallWinner && (
                <Trophy size={10} className="text-amber-500" />
              )}
              <button
                onClick={() => removeStock(s.symbol)}
                className="p-0.5 rounded-full hover:bg-red-50 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {stocks.length < MAX_STOCKS && (
            <div className="relative">
              <div className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="+ Add stock"
                  className="w-28 px-3 py-1.5 text-xs border border-dashed border-[var(--color-border)] rounded-full bg-transparent focus:outline-none focus:border-[var(--color-brand)] focus:bg-white transition-all"
                />
              </div>
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-64 border border-[var(--color-border)] rounded-xl bg-white shadow-xl z-50 overflow-hidden">
                  {searchResults.map((r) => (
                    <button
                      key={r.symbol}
                      onClick={() => addStock(r)}
                      className="w-full px-3 py-2 text-left hover:bg-[var(--color-surface-hover)] flex items-center gap-2 transition-colors"
                    >
                      <span className="text-xs font-bold">{r.symbol}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] truncate">{r.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Winner banner */}
      {stocks.length >= 2 && overallWinner && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <Trophy size={18} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-800">
              {overallWinner} leads on {winners[overallWinner]}/{METRICS.length} metrics
            </p>
            <p className="text-[10px] text-amber-600">
              Based on fundamental analysis — lower is better for valuation ratios and risk metrics
            </p>
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
            activeCategory === null
              ? "bg-[var(--color-brand)] text-white"
              : "bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          All Metrics
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-[var(--color-brand)] text-white"
                : "bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Comparison table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
        {/* Header row */}
        <div className="grid border-b border-[var(--color-border)] bg-[var(--color-surface-card)]"
          style={{ gridTemplateColumns: `180px repeat(${stocks.length}, 1fr)` }}
        >
          <div className="px-4 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            Metric
          </div>
          {stocks.map((s, i) => (
            <div key={s.symbol} className="px-4 py-3 text-center border-l border-[var(--color-border)]">
              <p className="text-xs font-bold">{s.symbol}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">{s.name}</p>
            </div>
          ))}
        </div>

        {/* Metric rows */}
        {filteredMetrics.map((metric, idx) => {
          const values = stocks.map((s) => metric.getValue(s.data));
          const validValues = values.filter(
            (v): v is number => v !== null && v !== undefined
          );

          let bestIdx = -1;
          let worstIdx = -1;
          if (validValues.length >= 2 && stocks.length >= 2) {
            let bestVal = metric.higherIsBetter ? -Infinity : Infinity;
            let worstVal = metric.higherIsBetter ? Infinity : -Infinity;
            values.forEach((v, i) => {
              if (v === null || v === undefined) return;
              if (metric.higherIsBetter ? v > bestVal : v < bestVal) {
                bestVal = v;
                bestIdx = i;
              }
              if (metric.higherIsBetter ? v < worstVal : v > worstVal) {
                worstVal = v;
                worstIdx = i;
              }
            });
          }

          return (
            <div
              key={metric.key}
              className={`grid ${idx % 2 === 0 ? "bg-white" : "bg-[var(--color-surface-card)]/30"} hover:bg-[var(--color-brand)]/[0.02] transition-colors`}
              style={{ gridTemplateColumns: `180px repeat(${stocks.length}, 1fr)` }}
            >
              <div className="px-4 py-3 flex items-center gap-2">
                <metric.icon size={12} className="text-[var(--color-text-muted)] shrink-0" />
                <span className="text-xs font-medium text-[var(--color-text-primary)]">
                  {metric.label}
                </span>
              </div>
              {stocks.map((s, i) => {
                const val = values[i];
                const isBest = i === bestIdx && stocks.length >= 2;
                const isWorst = i === worstIdx && stocks.length >= 2;

                return (
                  <div
                    key={s.symbol}
                    className={`px-4 py-3 text-center border-l border-[var(--color-border)] ${
                      isBest ? "bg-emerald-50/60" : isWorst ? "bg-red-50/40" : ""
                    }`}
                  >
                    {val !== null && val !== undefined ? (
                      <span
                        className={`text-xs font-bold ${
                          isBest
                            ? "text-emerald-600"
                            : isWorst
                            ? "text-red-500"
                            : "text-[var(--color-text-primary)]"
                        }`}
                      >
                        {metric.format(val)}
                        {isBest && " ✓"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--color-text-muted)]">N/A</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-4">
        Comparison uses demo data for educational purposes. Add your FMP API key for live data.
      </p>
    </div>
  );
}
