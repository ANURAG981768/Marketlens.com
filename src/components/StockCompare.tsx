"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Search,
  X,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  BarChart3,
  TrendingUp,
  Shield,
  DollarSign,
  Zap,
  RefreshCw,
  Crown,
} from "lucide-react";
import { searchStocks, type SearchItem } from "@/lib/search-data";
import CompanyLogo from "./CompanyLogo";

const MAX_STOCKS = 4;
const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444"];

export interface Fundamentals {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  marketCap: number | null;
  pe: number | null;
  forwardPe: number | null;
  ps: number | null;
  pb: number | null;
  beta: number | null;
  eps: number | null;
  dividendYield: number | null;
  profitMargin: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  roe: number | null;
  roa: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  revenueGrowth: number | null;
  targetPrice: number | null;
  recommendation: string | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
}

interface CompareStock {
  symbol: string;
  name: string;
  data: Fundamentals | null;
  loading: boolean;
  error: boolean;
}

async function fetchFundamentals(symbol: string): Promise<Fundamentals | null> {
  try {
    const res = await fetch(`/api/fundamentals?symbol=${encodeURIComponent(symbol)}`);
    const json = await res.json();
    if (json.error || json.price == null) return null;
    return json as Fundamentals;
  } catch {
    return null;
  }
}

interface MetricRow {
  label: string;
  key: keyof Fundamentals;
  format: (v: number) => string;
  higherIsBetter: boolean;
  category: string;
  icon: typeof DollarSign;
  hint?: string;
}

const METRICS: MetricRow[] = [
  { label: "Price", key: "price", format: (v) => `$${v.toFixed(2)}`, higherIsBetter: false, category: "Price", icon: DollarSign },
  { label: "Market Cap", key: "marketCap", format: (v) => (v >= 1e12 ? `$${(v / 1e12).toFixed(2)}T` : v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`), higherIsBetter: true, category: "Price", icon: BarChart3, hint: "Total company value" },
  { label: "Day Change", key: "changePercent", format: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`, higherIsBetter: true, category: "Price", icon: TrendingUp },
  { label: "52W High", key: "fiftyTwoWeekHigh", format: (v) => `$${v.toFixed(2)}`, higherIsBetter: true, category: "Price", icon: TrendingUp },
  { label: "Analyst Target", key: "targetPrice", format: (v) => `$${v.toFixed(2)}`, higherIsBetter: true, category: "Price", icon: TrendingUp, hint: "Mean analyst price target" },

  { label: "P/E Ratio", key: "pe", format: (v) => `${v.toFixed(1)}x`, higherIsBetter: false, category: "Valuation", icon: BarChart3, hint: "Price / Earnings — lower is cheaper" },
  { label: "Forward P/E", key: "forwardPe", format: (v) => `${v.toFixed(1)}x`, higherIsBetter: false, category: "Valuation", icon: BarChart3, hint: "Based on next-year earnings" },
  { label: "P/S Ratio", key: "ps", format: (v) => `${v.toFixed(2)}x`, higherIsBetter: false, category: "Valuation", icon: BarChart3, hint: "Price / Sales" },
  { label: "P/B Ratio", key: "pb", format: (v) => `${v.toFixed(2)}x`, higherIsBetter: false, category: "Valuation", icon: BarChart3, hint: "Price / Book value" },

  { label: "Gross Margin", key: "grossMargin", format: (v) => `${v.toFixed(1)}%`, higherIsBetter: true, category: "Profitability", icon: TrendingUp },
  { label: "Operating Margin", key: "operatingMargin", format: (v) => `${v.toFixed(1)}%`, higherIsBetter: true, category: "Profitability", icon: TrendingUp },
  { label: "Net Margin", key: "profitMargin", format: (v) => `${v.toFixed(1)}%`, higherIsBetter: true, category: "Profitability", icon: TrendingUp },
  { label: "ROE", key: "roe", format: (v) => `${v.toFixed(1)}%`, higherIsBetter: true, category: "Profitability", icon: Zap, hint: "Return on Equity" },
  { label: "ROA", key: "roa", format: (v) => `${v.toFixed(1)}%`, higherIsBetter: true, category: "Profitability", icon: Zap, hint: "Return on Assets" },

  { label: "Revenue Growth", key: "revenueGrowth", format: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`, higherIsBetter: true, category: "Growth", icon: TrendingUp, hint: "YoY revenue growth" },
  { label: "EPS", key: "eps", format: (v) => `$${v.toFixed(2)}`, higherIsBetter: true, category: "Growth", icon: DollarSign, hint: "Earnings per share" },

  { label: "Debt / Equity", key: "debtToEquity", format: (v) => `${v.toFixed(2)}x`, higherIsBetter: false, category: "Health", icon: Shield, hint: "Lower = less leveraged" },
  { label: "Current Ratio", key: "currentRatio", format: (v) => `${v.toFixed(2)}`, higherIsBetter: true, category: "Health", icon: Shield, hint: "Short-term liquidity" },

  { label: "Dividend Yield", key: "dividendYield", format: (v) => `${v.toFixed(2)}%`, higherIsBetter: true, category: "Income", icon: DollarSign },

  { label: "Beta", key: "beta", format: (v) => v.toFixed(2), higherIsBetter: false, category: "Risk", icon: Shield, hint: "Volatility vs market (1.0 = market)" },
];

const CATEGORIES = ["Price", "Valuation", "Profitability", "Growth", "Health", "Income", "Risk"];

export default function StockCompare() {
  const [stocks, setStocks] = useState<CompareStock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const stocksRef = useRef<CompareStock[]>([]);
  stocksRef.current = stocks;

  const addStock = useCallback(async (item: SearchItem) => {
    setStocks((prev) => {
      if (prev.length >= MAX_STOCKS || prev.some((s) => s.symbol === item.symbol)) return prev;
      return [...prev, { symbol: item.symbol, name: item.name, data: null, loading: true, error: false }];
    });
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);

    const data = await fetchFundamentals(item.symbol);
    setStocks((prev) =>
      prev.map((s) =>
        s.symbol === item.symbol ? { ...s, data, loading: false, error: data === null } : s
      )
    );
    setLastUpdated(new Date());
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.length >= 1) {
      const results = searchStocks(q).filter(
        (r) => !stocksRef.current.some((s) => s.symbol === r.symbol)
      );
      setSearchResults(results.slice(0, 8));
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const removeStock = (symbol: string) => {
    setStocks((prev) => prev.filter((s) => s.symbol !== symbol));
  };

  const refreshAll = useCallback(async () => {
    const current = stocksRef.current;
    if (current.length === 0) return;
    setRefreshing(true);
    await Promise.all(
      current.map(async (s) => {
        const data = await fetchFundamentals(s.symbol);
        if (data) {
          setStocks((prev) =>
            prev.map((st) => (st.symbol === s.symbol ? { ...st, data, error: false } : st))
          );
        }
      })
    );
    setLastUpdated(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (stocks.length === 0) return;
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, [stocks.length, refreshAll]);

  const filteredMetrics = activeCategory
    ? METRICS.filter((m) => m.category === activeCategory)
    : METRICS;

  const { winners, overallWinner } = useMemo(() => {
    const loaded = stocks.filter((s) => s.data);
    if (loaded.length < 2) return { winners: {} as Record<string, number>, overallWinner: null };
    const w: Record<string, number> = {};
    for (const s of loaded) w[s.symbol] = 0;

    for (const metric of METRICS) {
      const vals = loaded
        .map((s) => ({ symbol: s.symbol, value: s.data![metric.key] as number | null }))
        .filter((v) => v.value !== null && v.value !== undefined && !isNaN(v.value as number));
      if (vals.length < 2) continue;
      vals.sort((a, b) =>
        metric.higherIsBetter ? (b.value as number) - (a.value as number) : (a.value as number) - (b.value as number)
      );
      if (vals[0]) w[vals[0].symbol]++;
    }

    let best = "";
    let bestCount = -1;
    for (const [sym, count] of Object.entries(w)) {
      if (count > bestCount) {
        bestCount = count;
        best = sym;
      }
    }
    return { winners: w, overallWinner: best };
  }, [stocks]);

  // ---------- Empty state ----------
  if (stocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-14">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
            <BarChart3 size={32} className="text-white" />
          </div>
          <h2 className="font-display text-4xl font-semibold mb-3 tracking-tight">Compare Stocks</h2>
          <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">
            Side-by-side analysis of up to {MAX_STOCKS} companies across 20 live metrics — valuation, profitability, growth, financial health, and risk.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-xs font-medium text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live data · auto-refresh every 30s
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative mb-6">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search a stock — AAPL, MSFT, GOOGL…"
              className="w-full pl-11 pr-4 py-3.5 text-sm border border-[var(--color-border)] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            />
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="mb-6 border border-[var(--color-border)] rounded-xl bg-white shadow-lg overflow-hidden">
              {searchResults.map((r) => (
                <button
                  key={r.symbol}
                  onClick={() => addStock(r)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between transition-colors border-b last:border-b-0 border-[var(--color-border)]"
                >
                  <div className="flex items-center gap-3">
                    <CompanyLogo symbol={r.symbol} size={22} />
                    <div>
                      <span className="text-sm font-bold block">{r.symbol}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{r.name}</span>
                    </div>
                  </div>
                  <Plus size={16} className="text-blue-500" />
                </button>
              ))}
            </div>
          )}

          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3 text-center">Popular Matchups</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { symbols: ["AAPL", "MSFT"], label: "Apple vs Microsoft" },
              { symbols: ["GOOGL", "META"], label: "Google vs Meta" },
              { symbols: ["NVDA", "AMD"], label: "NVIDIA vs AMD" },
              { symbols: ["TSLA", "F"], label: "Tesla vs Ford" },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  preset.symbols.forEach((sym) => {
                    const item = searchStocks(sym).find((r) => r.symbol === sym);
                    if (item) addStock(item);
                  });
                }}
                className="px-4 py-3 border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:bg-blue-50 hover:border-blue-500/40 hover:text-blue-600 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Comparison view ----------
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Stock Comparison</h2>
            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live · {lastUpdated ? `updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "loading…"}
            </p>
          </div>
        </div>
        <button
          onClick={refreshAll}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface-hover)] disabled:opacity-50 transition-all"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Updating…" : "Refresh"}
        </button>
      </div>

      {/* Stock cards */}
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(stocks.length + (stocks.length < MAX_STOCKS ? 1 : 0), MAX_STOCKS + 1)}, minmax(0, 1fr))` }}>
        {stocks.map((s, i) => {
          const up = (s.data?.changePercent ?? 0) >= 0;
          return (
            <div
              key={s.symbol}
              className="relative rounded-xl border-2 bg-white p-4 transition-all"
              style={{ borderColor: COLORS[i] }}
            >
              {s.symbol === overallWinner && (
                <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md ring-2 ring-white">
                  <Crown size={14} className="text-white" />
                </div>
              )}
              <button
                onClick={() => removeStock(s.symbol)}
                className="absolute top-2 right-2 p-1 hover:bg-red-50 rounded-md text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <CompanyLogo symbol={s.symbol} size={32} />
                <div className="min-w-0">
                  <div className="font-bold text-sm leading-tight">{s.symbol}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)] truncate">{s.data?.name || s.name}</div>
                </div>
              </div>
              {s.loading ? (
                <div className="animate-pulse h-7 bg-gray-100 rounded w-24" />
              ) : s.data ? (
                <>
                  <div className="text-xl font-bold tabular-nums">${s.data.price?.toFixed(2)}</div>
                  <div className={`text-xs font-semibold flex items-center gap-0.5 ${up ? "text-green-600" : "text-red-600"}`}>
                    {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {up ? "+" : ""}{s.data.changePercent?.toFixed(2)}%
                  </div>
                </>
              ) : (
                <div className="text-xs text-red-500">Data unavailable</div>
              )}
            </div>
          );
        })}
        {stocks.length < MAX_STOCKS && (
          <div className="relative">
            <div className="rounded-xl border-2 border-dashed border-[var(--color-border)] p-4 h-full flex items-center justify-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="+ Add stock"
                className="w-full text-xs text-center bg-transparent focus:outline-none placeholder:text-[var(--color-text-muted)]"
              />
            </div>
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-60 border border-[var(--color-border)] rounded-lg bg-white shadow-xl z-50 overflow-hidden">
                {searchResults.map((r) => (
                  <button
                    key={r.symbol}
                    onClick={() => addStock(r)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 border-b last:border-b-0 border-[var(--color-border)] transition-colors"
                  >
                    <CompanyLogo symbol={r.symbol} size={18} />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold block">{r.symbol}</span>
                      <span className="text-xs text-[var(--color-text-muted)] truncate block">{r.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Winner banner */}
      {overallWinner && stocks.filter((s) => s.data).length >= 2 && (
        <div className="mb-6 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center shrink-0">
            <Trophy size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">
              {overallWinner} leads overall
            </p>
            <p className="text-xs text-amber-700">
              Best on {winners[overallWinner]} of {METRICS.length} metrics · based on live fundamentals
            </p>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="mb-5 flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
            activeCategory === null
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeCategory === cat
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <th className="px-4 py-3.5 text-left font-bold sticky left-0 bg-[var(--color-surface)] z-10 min-w-[150px]">Metric</th>
              {stocks.map((s, i) => (
                <th key={s.symbol} className="px-4 py-3.5 text-center font-bold min-w-[130px]" style={{ borderTop: `3px solid ${COLORS[i]}` }}>
                  <div className="flex items-center justify-center gap-1.5">
                    <CompanyLogo symbol={s.symbol} size={18} />
                    {s.symbol}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredMetrics.map((metric, idx) => {
              const MetricIcon = metric.icon;
              const vals = stocks.map((s) => ({
                symbol: s.symbol,
                value: s.data ? (s.data[metric.key] as number | null) : null,
              }));
              const valid = vals.filter((v) => v.value !== null && v.value !== undefined && !isNaN(v.value as number));
              let best: string | null = null;
              if (valid.length > 1) {
                const sorted = [...valid].sort((a, b) =>
                  metric.higherIsBetter ? (b.value as number) - (a.value as number) : (a.value as number) - (b.value as number)
                );
                best = sorted[0]?.symbol ?? null;
              }

              return (
                <tr
                  key={metric.key as string}
                  className={`border-b border-[var(--color-border)] last:border-b-0 ${idx % 2 === 0 ? "bg-white" : "bg-[var(--color-surface)]/40"} hover:bg-blue-50/50 transition-colors`}
                >
                  <td className="px-4 py-3 font-medium sticky left-0 bg-inherit z-10">
                    <div className="flex items-center gap-2">
                      <MetricIcon size={15} className="text-[var(--color-text-muted)] shrink-0" />
                      <span>{metric.label}</span>
                    </div>
                    {metric.hint && <span className="text-[10px] text-[var(--color-text-muted)] ml-7 block leading-tight">{metric.hint}</span>}
                  </td>
                  {stocks.map((s, si) => {
                    const v = vals.find((x) => x.symbol === s.symbol)?.value;
                    const isBest = best === s.symbol && valid.length > 1;
                    return (
                      <td
                        key={`${s.symbol}-${metric.key as string}`}
                        className={`px-4 py-3 text-center tabular-nums transition-colors ${isBest ? "bg-green-50" : ""}`}
                        style={isBest ? { boxShadow: `inset 3px 0 0 ${COLORS[si]}` } : {}}
                      >
                        {s.loading ? (
                          <div className="animate-pulse h-4 bg-gray-100 rounded w-14 mx-auto" />
                        ) : v !== null && v !== undefined && !isNaN(v) ? (
                          <span className={isBest ? "font-bold text-green-700" : ""}>{metric.format(v)}</span>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-[var(--color-text-muted)] mt-3 text-center">
        Live market data via Yahoo Finance · Highlighted cells indicate the best value per metric · For valuation ratios, risk, and leverage, lower is better
      </p>
    </div>
  );
}
