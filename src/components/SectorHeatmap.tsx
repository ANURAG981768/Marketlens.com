"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Info, BarChart3 } from "lucide-react";

interface SectorData {
  name: string;
  change: number;
  marketCap: string;
  topStocks: { symbol: string; change: number | null }[];
  weekChange: number;
  monthChange: number;
  ytdChange: number;
}

const SECTOR_DATA_DEFAULT: SectorData[] = [
  {
    name: "Technology",
    change: 1.42,
    marketCap: "$17.8T",
    topStocks: [
      { symbol: "AAPL", change: 1.69 },
      { symbol: "MSFT", change: 0.52 },
      { symbol: "NVDA", change: 3.21 },
      { symbol: "GOOGL", change: 0.87 },
    ],
    weekChange: 2.85,
    monthChange: 5.12,
    ytdChange: 24.3,
  },
  {
    name: "Healthcare",
    change: 0.38,
    marketCap: "$7.2T",
    topStocks: [
      { symbol: "UNH", change: -0.45 },
      { symbol: "JNJ", change: 0.82 },
      { symbol: "LLY", change: 2.14 },
      { symbol: "PFE", change: -1.23 },
    ],
    weekChange: 0.92,
    monthChange: 2.41,
    ytdChange: 8.7,
  },
  {
    name: "Financial Services",
    change: 0.73,
    marketCap: "$9.1T",
    topStocks: [
      { symbol: "JPM", change: 1.15 },
      { symbol: "V", change: 0.63 },
      { symbol: "BAC", change: 0.91 },
      { symbol: "GS", change: 1.42 },
    ],
    weekChange: 1.56,
    monthChange: 3.28,
    ytdChange: 15.2,
  },
  {
    name: "Consumer Cyclical",
    change: 0.95,
    marketCap: "$6.4T",
    topStocks: [
      { symbol: "AMZN", change: 1.13 },
      { symbol: "TSLA", change: -0.84 },
      { symbol: "HD", change: 0.67 },
      { symbol: "NKE", change: -1.45 },
    ],
    weekChange: 1.23,
    monthChange: 2.87,
    ytdChange: 12.8,
  },
  {
    name: "Communication",
    change: 1.18,
    marketCap: "$5.3T",
    topStocks: [
      { symbol: "META", change: 1.87 },
      { symbol: "GOOG", change: 0.92 },
      { symbol: "NFLX", change: 2.31 },
      { symbol: "DIS", change: -0.56 },
    ],
    weekChange: 2.14,
    monthChange: 4.56,
    ytdChange: 19.4,
  },
  {
    name: "Industrials",
    change: 0.28,
    marketCap: "$5.8T",
    topStocks: [
      { symbol: "CAT", change: 0.45 },
      { symbol: "RTX", change: 0.78 },
      { symbol: "UNP", change: -0.32 },
      { symbol: "HON", change: 0.51 },
    ],
    weekChange: 0.67,
    monthChange: 1.89,
    ytdChange: 9.3,
  },
  {
    name: "Consumer Defensive",
    change: -0.15,
    marketCap: "$4.1T",
    topStocks: [
      { symbol: "WMT", change: 0.34 },
      { symbol: "PG", change: -0.28 },
      { symbol: "KO", change: 0.12 },
      { symbol: "PEP", change: -0.67 },
    ],
    weekChange: -0.34,
    monthChange: 0.92,
    ytdChange: 4.1,
  },
  {
    name: "Energy",
    change: -0.67,
    marketCap: "$3.9T",
    topStocks: [
      { symbol: "XOM", change: -0.89 },
      { symbol: "CVX", change: -0.54 },
      { symbol: "COP", change: -1.12 },
      { symbol: "SLB", change: 0.23 },
    ],
    weekChange: -1.45,
    monthChange: -2.87,
    ytdChange: -3.2,
  },
  {
    name: "Basic Materials",
    change: 0.42,
    marketCap: "$2.1T",
    topStocks: [
      { symbol: "LIN", change: 0.56 },
      { symbol: "APD", change: 0.34 },
      { symbol: "FCX", change: 1.23 },
      { symbol: "NEM", change: 0.89 },
    ],
    weekChange: 0.89,
    monthChange: 2.34,
    ytdChange: 7.6,
  },
  {
    name: "Real Estate",
    change: -0.34,
    marketCap: "$1.4T",
    topStocks: [
      { symbol: "PLD", change: -0.67 },
      { symbol: "AMT", change: 0.23 },
      { symbol: "EQIX", change: 0.45 },
      { symbol: "SPG", change: -0.89 },
    ],
    weekChange: -0.78,
    monthChange: -1.23,
    ytdChange: 2.1,
  },
  {
    name: "Utilities",
    change: -0.21,
    marketCap: "$1.6T",
    topStocks: [
      { symbol: "NEE", change: 0.34 },
      { symbol: "DUK", change: -0.45 },
      { symbol: "SO", change: -0.12 },
      { symbol: "AEP", change: 0.23 },
    ],
    weekChange: -0.56,
    monthChange: 0.45,
    ytdChange: 5.8,
  },
];

type TimeFrame = "today" | "week" | "month" | "ytd";

function getChangeValue(sector: SectorData, tf: TimeFrame): number {
  switch (tf) {
    case "today": return sector.change;
    case "week": return sector.weekChange;
    case "month": return sector.monthChange;
    case "ytd": return sector.ytdChange;
  }
}

function getHeatColor(change: number, maxAbs: number): string {
  const intensity = Math.min(Math.abs(change) / maxAbs, 1);
  if (change > 0) {
    const r = Math.round(240 - intensity * 200);
    const g = Math.round(240 - intensity * 40);
    const b = Math.round(240 - intensity * 200);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (change < 0) {
    const r = Math.round(240 - intensity * 20);
    const g = Math.round(240 - intensity * 180);
    const b = Math.round(240 - intensity * 180);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return "#f0f1f2";
}

function getTextColor(change: number, maxAbs: number): string {
  const intensity = Math.min(Math.abs(change) / maxAbs, 1);
  return intensity > 0.4 ? "white" : "#1a1a1a";
}

export default function SectorHeatmap() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("today");
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);
  const [sectorData, setSectorData] = useState<SectorData[]>(SECTOR_DATA_DEFAULT);
  const [isLive, setIsLive] = useState(false);

  // Load live sector performance from sector ETFs
  useEffect(() => {
    function loadSectors() {
      fetch("/api/sectors")
        .then((r) => r.json())
        .then((json) => {
          if (!json.sectors) return;
          setSectorData((prev) =>
            prev.map((s) => {
              const live = json.sectors.find((x: { name: string }) => x.name === s.name);
              if (!live) return s;
              return {
                ...s,
                change: live.change,
                weekChange: live.weekChange,
                monthChange: live.monthChange,
                ytdChange: live.ytdChange,
                topStocks: (live.topStocks as string[]).map((sym) => ({ symbol: sym, change: null })),
              };
            })
          );
          setIsLive(true);
        })
        .catch(() => {});
    }
    loadSectors();
    const interval = setInterval(loadSectors, 60000);
    return () => clearInterval(interval);
  }, []);

  // When a sector is selected, fetch live day-change for its top holdings
  const loadHoldingChanges = useCallback(async (sector: SectorData) => {
    const updated = await Promise.all(
      sector.topStocks.map(async (st) => {
        try {
          const res = await fetch(`/api/quote?symbol=${encodeURIComponent(st.symbol)}`);
          const j = await res.json();
          if (j.price && j.previousClose) {
            return { symbol: st.symbol, change: ((j.price - j.previousClose) / j.previousClose) * 100 };
          }
        } catch {}
        return { symbol: st.symbol, change: st.change };
      })
    );
    setSelectedSector((cur) => (cur && cur.name === sector.name ? { ...cur, topStocks: updated } : cur));
  }, []);

  const maxAbs = Math.max(...sectorData.map((s) => Math.abs(getChangeValue(s, timeFrame))), 0.01);

  const sorted = [...sectorData].sort(
    (a, b) => getChangeValue(b, timeFrame) - getChangeValue(a, timeFrame)
  );

  const gainers = sorted.filter((s) => getChangeValue(s, timeFrame) > 0).length;
  const losers = sorted.filter((s) => getChangeValue(s, timeFrame) < 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight flex items-center gap-2">
              Sector Heatmap
              {isLive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              {gainers} sectors up · {losers} sectors down{isLive ? " · via sector ETFs" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[var(--color-surface-card)] rounded-lg p-0.5 border border-[var(--color-border)]">
          {(["today", "week", "month", "ytd"] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeFrame === tf
                  ? "bg-white shadow-sm text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {tf === "today" ? "1D" : tf === "week" ? "1W" : tf === "month" ? "1M" : "YTD"}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
        <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>How to read this:</strong> Green = positive performance, Red = negative. Darker color = stronger move. Click any sector to see its top holdings and performance breakdown.
        </p>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {sorted.map((sector) => {
          const change = getChangeValue(sector, timeFrame);
          const bgColor = getHeatColor(change, maxAbs);
          const textColor = getTextColor(change, maxAbs);
          const isSelected = selectedSector?.name === sector.name;

          return (
            <button
              key={sector.name}
              onClick={() => {
                if (isSelected) {
                  setSelectedSector(null);
                } else {
                  setSelectedSector(sector);
                  loadHoldingChanges(sector);
                }
              }}
              className={`relative rounded-xl p-4 text-left transition-all duration-200 border-2 ${
                isSelected
                  ? "border-[var(--color-brand)] shadow-lg scale-[1.02]"
                  : "border-transparent hover:scale-[1.01] hover:shadow-md"
              }`}
              style={{ backgroundColor: bgColor, color: textColor }}
            >
              <p className="text-xs font-medium opacity-80 truncate">{sector.name}</p>
              <p className="text-xl font-bold mt-1 tabular-nums">
                {change >= 0 ? "+" : ""}
                {change.toFixed(2)}%
              </p>
              <p className="text-[10px] opacity-60 mt-1">{sector.marketCap} mkt cap</p>
              <div className="absolute top-3 right-3 opacity-60">
                {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Sector Detail */}
      {selectedSector && (
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">{selectedSector.name} Sector</h3>
            <span className="text-xs text-[var(--color-text-muted)]">{selectedSector.marketCap} total market cap</span>
          </div>

          {/* Performance Timeline */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "Today", value: selectedSector.change },
              { label: "1 Week", value: selectedSector.weekChange },
              { label: "1 Month", value: selectedSector.monthChange },
              { label: "YTD", value: selectedSector.ytdChange },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[var(--color-surface)] rounded-lg p-3 text-center"
              >
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <p
                  className={`text-sm font-bold tabular-nums ${
                    item.value >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
                  }`}
                >
                  {item.value >= 0 ? "+" : ""}
                  {item.value.toFixed(2)}%
                </p>
              </div>
            ))}
          </div>

          {/* Top Holdings */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              Top Holdings
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectedSector.topStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between bg-[var(--color-surface)] rounded-lg px-3 py-2.5"
                >
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    {stock.symbol}
                  </span>
                  {stock.change === null ? (
                    <span className="text-xs text-[var(--color-text-muted)]">…</span>
                  ) : (
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        stock.change >= 0
                          ? "text-[var(--color-positive)]"
                          : "text-[var(--color-negative)]"
                      }`}
                    >
                      {stock.change >= 0 ? "+" : ""}
                      {stock.change.toFixed(2)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Market Breadth Summary */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
        <h3 className="text-sm font-bold mb-3">Market Breadth</h3>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="h-3 rounded-full bg-[var(--color-positive)]"
            style={{ width: `${(gainers / sectorData.length) * 100}%` }}
          />
          <div
            className="h-3 rounded-full bg-[var(--color-negative)]"
            style={{ width: `${(losers / sectorData.length) * 100}%` }}
          />
          {gainers + losers < sectorData.length && (
            <div
              className="h-3 rounded-full bg-gray-300"
              style={{
                width: `${((sectorData.length - gainers - losers) / sectorData.length) * 100}%`,
              }}
            />
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span className="text-[var(--color-positive)] font-medium">{gainers} Advancing</span>
          <span className="text-[var(--color-negative)] font-medium">{losers} Declining</span>
        </div>
      </div>
    </div>
  );
}
