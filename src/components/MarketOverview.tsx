"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity, Globe, Flag } from "lucide-react";
import SectionBanner from "./SectionBanner";
import CountryBadge, { flagToCode } from "./CountryBadge";

interface SectorData {
  name: string;
  change: number;
}

// Real GICS sector names only — performance is filled in live from /api/sectors.
// No fabricated change or market-cap figures.
const SECTOR_NAMES: SectorData[] = [
  { name: "Technology", change: 0 },
  { name: "Healthcare", change: 0 },
  { name: "Financial", change: 0 },
  { name: "Consumer Cyclical", change: 0 },
  { name: "Communication", change: 0 },
  { name: "Industrials", change: 0 },
  { name: "Consumer Defensive", change: 0 },
  { name: "Energy", change: 0 },
  { name: "Real Estate", change: 0 },
  { name: "Utilities", change: 0 },
  { name: "Basic Materials", change: 0 },
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
  const [sectors, setSectors] = useState(SECTOR_NAMES);
  const [sectorsLive, setSectorsLive] = useState(false);
  const [regionFilter, setRegionFilter] = useState<string>("all");

  useEffect(() => {
    function loadSectors() {
      fetch("/api/sectors")
        .then((r) => r.json())
        .then((json) => {
          if (!json.sectors) return;
          setSectors((prev) =>
            prev.map((s) => {
              const live = json.sectors.find((x: { name: string }) =>
                x.name === s.name || (s.name === "Financial" && x.name === "Financial Services") || (s.name === "Communication" && x.name === "Communication Services")
              );
              return live ? { ...s, change: live.change } : s;
            })
          );
          setSectorsLive(true);
        })
        .catch(() => {});
    }
    loadSectors();
    const interval = setInterval(loadSectors, 60000);
    return () => clearInterval(interval);
  }, []);
  const [usIndices, setUsIndices] = useState<IndexData[]>([]);
  const [globalIndices, setGlobalIndices] = useState<IndexData[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const flagMap: Record<string, { flag: string; region: string }> = {};
    [...US_INDICES, ...GLOBAL_INDICES].forEach((i) => {
      flagMap[i.name] = { flag: i.flag, region: i.region };
    });

    async function loadIndices() {
      try {
        const res = await fetch("/api/indices");
        const json = await res.json();
        if (!json.indices) return;
        const usNames = new Set(US_INDICES.map((i) => i.name));
        const mapped: IndexData[] = json.indices.map((idx: { name: string; value: number; change: number; changePct: number; flag: string; region: string }) => ({
          name: idx.name,
          value: idx.value,
          change: idx.change,
          changePct: idx.changePct,
          flag: idx.flag || flagMap[idx.name]?.flag || "🏳️",
          region: idx.region || flagMap[idx.name]?.region || "",
        }));
        const us = mapped.filter((i) => usNames.has(i.name));
        const global = mapped.filter((i) => !usNames.has(i.name));
        if (us.length) setUsIndices(us);
        if (global.length) setGlobalIndices(global);
        setIsLive(true);
        setUpdatedAt(new Date());
      } catch {}
    }
    loadIndices();
    const interval = setInterval(loadIndices, 60000);
    return () => clearInterval(interval);
  }, []);

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
    ? globalIndices
    : globalIndices.filter((idx) => {
        if (regionFilter === "Asia") return ["India", "China", "HK", "Japan", "Korea"].includes(idx.region);
        if (regionFilter === "Europe") return ["UK", "Germany", "France"].includes(idx.region);
        if (regionFilter === "Americas") return ["Brazil", "Canada", "Australia"].includes(idx.region);
        return true;
      });

  return (
    <div className="space-y-8">
      <SectionBanner
        eyebrow="Live market data"
        title="Market Overview"
        subtitle="U.S. markets, global indices, and sector performance."
        accent="brand"
        icon={Activity}
      >
        {isLive && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-positive)]/15 border border-[var(--color-positive)]/30 text-xs font-medium text-[var(--color-positive)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-positive)] animate-pulse" />
            Live · {updatedAt ? `updated ${updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""} · refreshes every 60s
          </div>
        )}
      </SectionBanner>

      {/* US Major Indices */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flag size={14} className="text-[var(--color-brand)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">US Markets</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {usIndices.length === 0 &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`sk-${i}`} className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4 h-[88px] animate-pulse" />
            ))}
          {usIndices.map((idx) => (
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
          {globalIndices.length === 0 &&
            Array.from({ length: 8 }).map((_, i) => (
              <div key={`gsk-${i}`} className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-3.5 h-[68px] animate-pulse" />
            ))}
          {filteredGlobal.map((idx) => (
            <div
              key={idx.name}
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-3.5 hover:border-[var(--color-border-light)] transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <CountryBadge code={flagToCode(idx.flag)} />
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
              {sectorsLive ? (
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
              ) : (
                <p className="text-base font-bold tabular-nums mt-1 text-[var(--color-text-muted)]">—</p>
              )}
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Today</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
