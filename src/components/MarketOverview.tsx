"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Activity, Globe } from "lucide-react";

interface SectorData {
  name: string;
  change: number;
  marketCap: string;
}

const DEMO_SECTORS: SectorData[] = [
  { name: "Technology", change: 1.42, marketCap: "$16.8T" },
  { name: "Healthcare", change: -0.38, marketCap: "$7.2T" },
  { name: "Financial", change: 0.89, marketCap: "$9.1T" },
  { name: "Consumer Cyclical", change: 0.56, marketCap: "$5.8T" },
  { name: "Communication", change: 1.15, marketCap: "$4.3T" },
  { name: "Industrials", change: 0.23, marketCap: "$5.4T" },
  { name: "Consumer Defensive", change: -0.12, marketCap: "$3.9T" },
  { name: "Energy", change: -1.05, marketCap: "$3.2T" },
  { name: "Real Estate", change: -0.67, marketCap: "$1.4T" },
  { name: "Utilities", change: 0.31, marketCap: "$1.6T" },
  { name: "Basic Materials", change: -0.45, marketCap: "$1.8T" },
];

interface IndexData {
  name: string;
  value: number;
  change: number;
  changePct: number;
  flag: string;
  region: string;
}

const US_INDICES: IndexData[] = [
  { name: "S&P 500", value: 5667.20, change: 32.41, changePct: 0.58, flag: "🇺🇸", region: "US" },
  { name: "NASDAQ", value: 18352.76, change: 145.23, changePct: 0.80, flag: "🇺🇸", region: "US" },
  { name: "DOW", value: 42654.89, change: 112.77, changePct: 0.26, flag: "🇺🇸", region: "US" },
  { name: "Russell 2000", value: 2089.45, change: -8.34, changePct: -0.40, flag: "🇺🇸", region: "US" },
];

const GLOBAL_INDICES: IndexData[] = [
  { name: "Nifty 50", value: 24834.85, change: 104.32, changePct: 0.42, flag: "🇮🇳", region: "India" },
  { name: "Sensex", value: 81721.34, change: 312.56, changePct: 0.38, flag: "🇮🇳", region: "India" },
  { name: "SSE Composite", value: 3261.56, change: -6.84, changePct: -0.21, flag: "🇨🇳", region: "China" },
  { name: "Hang Seng", value: 18456.32, change: 205.12, changePct: 1.12, flag: "🇭🇰", region: "HK" },
  { name: "Nikkei 225", value: 39583.08, change: 264.21, changePct: 0.67, flag: "🇯🇵", region: "Japan" },
  { name: "FTSE 100", value: 8312.89, change: -12.47, changePct: -0.15, flag: "🇬🇧", region: "UK" },
  { name: "DAX", value: 18692.01, change: 61.68, changePct: 0.33, flag: "🇩🇪", region: "Germany" },
  { name: "CAC 40", value: 7628.45, change: 14.49, changePct: 0.19, flag: "🇫🇷", region: "France" },
  { name: "KOSPI", value: 2684.23, change: 18.95, changePct: 0.71, flag: "🇰🇷", region: "Korea" },
  { name: "ASX 200", value: 8156.40, change: -23.12, changePct: -0.28, flag: "🇦🇺", region: "Australia" },
  { name: "Bovespa", value: 131245.67, change: 892.34, changePct: 0.68, flag: "🇧🇷", region: "Brazil" },
  { name: "TSX", value: 22341.56, change: 45.67, changePct: 0.20, flag: "🇨🇦", region: "Canada" },
];

export default function MarketOverview() {
  const [sectors] = useState(DEMO_SECTORS);
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const maxAbsChange = Math.max(...sectors.map((s) => Math.abs(s.change)));

  function getHeatColor(change: number): string {
    const intensity = Math.min(Math.abs(change) / maxAbsChange, 1);
    if (change > 0) {
      const alpha = 0.12 + intensity * 0.4;
      return `rgba(16, 185, 129, ${alpha})`;
    } else if (change < 0) {
      const alpha = 0.12 + intensity * 0.4;
      return `rgba(239, 68, 68, ${alpha})`;
    }
    return "rgba(128,128,128,0.1)";
  }

  const regions = ["all", "Asia", "Europe", "Americas"];
  const filteredGlobal = regionFilter === "all"
    ? GLOBAL_INDICES
    : GLOBAL_INDICES.filter((idx) => {
        if (regionFilter === "Asia") return ["India", "China", "HK", "Japan", "Korea"].includes(idx.region);
        if (regionFilter === "Europe") return ["UK", "Germany", "France"].includes(idx.region);
        if (regionFilter === "Americas") return ["Brazil", "Canada", "Australia"].includes(idx.region);
        return true;
      });

  return (
    <div className="space-y-8">
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/20 flex items-center justify-center mx-auto mb-4">
          <Activity size={28} className="text-[var(--color-brand)]" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Market Overview</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          US markets, global indices, and sector performance
        </p>
      </div>

      {/* US Major Indices */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">🇺🇸</span>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">US Markets</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {US_INDICES.map((idx) => (
            <div
              key={idx.name}
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4 hover:border-[var(--color-border-light)] transition-colors"
            >
              <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                {idx.name}
              </p>
              <p className="text-xl font-bold tabular-nums text-[var(--color-text-primary)]">
                {idx.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <div
                className={`flex items-center gap-1 text-xs font-semibold tabular-nums mt-1.5 ${
                  idx.change >= 0
                    ? "text-[var(--color-positive)]"
                    : "text-[var(--color-negative)]"
                }`}
              >
                {idx.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {idx.change >= 0 ? "+" : ""}
                {idx.change.toFixed(2)} ({idx.changePct >= 0 ? "+" : ""}
                {idx.changePct.toFixed(2)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Indices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-[var(--color-gold)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Global Indices</h3>
          </div>
          <div className="flex items-center gap-1 bg-[var(--color-surface-elevated)] rounded-lg p-0.5 border border-[var(--color-border)]">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                  regionFilter === r
                    ? "bg-[var(--color-brand)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                }`}
              >
                {r === "all" ? "All" : r}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filteredGlobal.map((idx) => (
            <div
              key={idx.name}
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-3.5 hover:border-[var(--color-border-light)] transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{idx.flag}</span>
                <span className="text-[10px] font-medium text-[var(--color-text-muted)] truncate">
                  {idx.name}
                </span>
              </div>
              <p className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
                {idx.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <div
                className={`flex items-center gap-1 text-xs font-semibold tabular-nums mt-0.5 ${
                  idx.change >= 0
                    ? "text-[var(--color-positive)]"
                    : "text-[var(--color-negative)]"
                }`}
              >
                {idx.change >= 0 ? "+" : ""}
                {idx.changePct.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector Heatmap */}
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
          US Sector Performance
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {sectors.map((s) => (
            <div
              key={s.name}
              className="rounded-xl p-3.5 border border-transparent hover:border-[var(--color-border)] transition-colors"
              style={{ backgroundColor: getHeatColor(s.change) }}
            >
              <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                {s.name}
              </p>
              <p
                className={`text-base font-bold tabular-nums mt-1 ${
                  s.change >= 0
                    ? "text-[var(--color-positive)]"
                    : "text-[var(--color-negative)]"
                }`}
              >
                {s.change >= 0 ? "+" : ""}
                {s.change.toFixed(2)}%
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                {s.marketCap}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
