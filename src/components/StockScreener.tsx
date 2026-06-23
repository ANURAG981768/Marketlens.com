"use client";

import { useState, useEffect, useCallback } from "react";
import { Filter, Search, ChevronDown, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import CompanyLogo from "./CompanyLogo";
import { SCREENER_DATABASE, type ScreenResult } from "@/lib/screener-data";

const SECTORS = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Consumer Cyclical",
  "Communication Services",
  "Industrials",
  "Consumer Defensive",
  "Energy",
  "Basic Materials",
  "Real Estate",
  "Utilities",
];

const MARKET_CAP_PRESETS = [
  { label: "Mega Cap (>200B)", min: 200000000000, max: Infinity },
  { label: "Large Cap (10B–200B)", min: 10000000000, max: 200000000000 },
  { label: "Mid Cap (2B–10B)", min: 2000000000, max: 10000000000 },
  { label: "Small Cap (300M–2B)", min: 300000000, max: 2000000000 },
  { label: "Micro Cap (<300M)", min: 0, max: 300000000 },
];

type SortKey = "marketCap" | "price" | "beta" | "volume" | "lastAnnualDividend";
type SortDir = "asc" | "desc";

interface Props {
  onSelect: (symbol: string) => void;
}

export default function StockScreener({ onSelect }: Props) {
  const [sector, setSector] = useState("Technology");
  const [capPreset, setCapPreset] = useState(-1);
  const [results, setResults] = useState<ScreenResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Overlay live price / market cap / volume / change% from the batch quote
  // endpoint onto a set of screener rows (one Yahoo call for the whole list).
  const overlayLiveQuotes = useCallback(async (rows: ScreenResult[]): Promise<ScreenResult[]> => {
    const symbols = rows.map((r) => r.symbol).slice(0, 60);
    if (symbols.length === 0) return rows;
    try {
      const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(symbols.join(","))}`);
      const json = await res.json();
      if (!json.quotes) return rows;
      return rows.map((r) => {
        const q = json.quotes[r.symbol.toUpperCase()];
        if (!q) return r;
        return {
          ...r,
          price: q.price ?? r.price,
          marketCap: q.marketCap || r.marketCap,
          volume: q.volume || r.volume,
          changePercent: q.changePercent,
        };
      });
    } catch {
      return rows;
    }
  }, []);

  const fetchStocks = useCallback(async (sectorVal: string, capIdx: number) => {
    setLoading(true);
    const preset = capIdx >= 0 ? MARKET_CAP_PRESETS[capIdx] : null;

    function staticUniverse(): ScreenResult[] {
      let filtered = SCREENER_DATABASE;
      if (sectorVal) filtered = filtered.filter((r) => r.sector === sectorVal);
      if (preset) {
        filtered = filtered.filter((r) => r.marketCap >= preset.min && r.marketCap < preset.max);
      }
      return filtered;
    }

    try {
      const params = new URLSearchParams();
      if (sectorVal) params.set("sector", sectorVal);
      if (preset) {
        if (preset.min > 0) params.set("mcMin", preset.min.toString());
        if (preset.max < Infinity) params.set("mcMax", preset.max.toString());
      }
      params.set("limit", "150");

      const res = await fetch(`/api/screener?${params.toString()}`);
      const json = await res.json();

      if (json.error === "demo") {
        // No paid screener key — use the curated universe but overlay LIVE quotes
        // so prices, market caps and volumes are real, not stale samples.
        setIsDemo(true);
        const base = staticUniverse();
        setResults(base); // show immediately
        const live = await overlayLiveQuotes(base);
        setResults(live);
      } else {
        setIsDemo(false);
        setResults(json.results ?? []);
      }
    } catch {
      setIsDemo(true);
      setResults(await overlayLiveQuotes(staticUniverse()));
    } finally {
      setLoading(false);
    }
  }, [overlayLiveQuotes]);

  useEffect(() => {
    fetchStocks(sector, capPreset);
  }, [sector, capPreset, fetchStocks]);

  // Keep prices fresh while the user is looking at the screener.
  useEffect(() => {
    if (results.length === 0) return;
    const interval = setInterval(async () => {
      const live = await overlayLiveQuotes(results);
      setResults(live);
    }, 60000);
    return () => clearInterval(interval);
  }, [results, overlayLiveQuotes]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filtered = searchQuery
    ? results.filter(
        (r) =>
          r.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.industry && r.industry.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : results;

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    return sortDir === "desc" ? bv - av : av - bv;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-ink)] flex items-center justify-center shadow-sm">
            <Filter size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold leading-tight">Stock Screener</h2>
            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-positive)] animate-pulse" />
              Live prices · refreshes every 60s
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">
              Sector
            </label>
            <select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                setSearchQuery("");
              }}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)]"
            >
              <option value="">All Sectors</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">
              Market Cap
            </label>
            <select
              value={capPreset}
              onChange={(e) => setCapPreset(parseInt(e.target.value))}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)]"
            >
              <option value={-1}>Any Size</option>
              {MARKET_CAP_PRESETS.map((p, i) => (
                <option key={p.label} value={i}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {loading ? (
              <Loader2 size={14} className="text-[var(--color-brand)] animate-spin" />
            ) : (
              <span className="text-xs font-medium text-[var(--color-text-muted)]">
                <span className="text-[var(--color-brand)] font-bold">{sorted.length}</span>{" "}
                {sorted.length !== results.length && (
                  <>of {results.length} </>
                )}
                stocks{sector ? ` in ${sector}` : ""}
              </span>
            )}
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by ticker, name, or industry..."
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg pl-8 pr-3 py-2 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)]"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="text-[var(--color-brand)] animate-spin mx-auto mb-3" />
            <p className="text-xs text-[var(--color-text-muted)]">
              Fetching {sector || "all"} stocks...
            </p>
          </div>
        ) : sorted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Industry
                  </th>
                  <SortHeader label="Price" sortKey="price" currentKey={sortKey} dir={sortDir} onClick={handleSort} />
                  <th className="text-right py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Chg %
                  </th>
                  <SortHeader label="Market Cap" sortKey="marketCap" currentKey={sortKey} dir={sortDir} onClick={handleSort} />
                  <SortHeader label="Beta" sortKey="beta" currentKey={sortKey} dir={sortDir} onClick={handleSort} />
                  <SortHeader label="Dividend" sortKey="lastAnnualDividend" currentKey={sortKey} dir={sortDir} onClick={handleSort} />
                  <SortHeader label="Volume" sortKey="volume" currentKey={sortKey} dir={sortDir} onClick={handleSort} />
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Exch
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr
                    key={r.symbol}
                    onClick={() => onSelect(r.symbol)}
                    className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <CompanyLogo symbol={r.symbol} size={22} />
                        <span className="font-bold text-[var(--color-gold)] text-xs group-hover:text-[var(--color-gold-light)]">{r.symbol}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-[var(--color-text-secondary)] max-w-[180px] truncate">
                      {r.companyName}
                    </td>
                    <td className="py-2.5 px-4 text-[10px] text-[var(--color-text-muted)] max-w-[140px] truncate">
                      {r.industry}
                    </td>
                    <td className="py-2.5 px-4 text-xs tabular-nums font-medium text-[var(--color-text-primary)]">
                      ${(r.price ?? 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-xs tabular-nums text-right font-medium">
                      {typeof r.changePercent === "number" ? (
                        <span className={r.changePercent >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}>
                          {r.changePercent >= 0 ? "+" : ""}{r.changePercent.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-xs tabular-nums text-[var(--color-text-secondary)]">
                      {formatCurrency(r.marketCap)}
                    </td>
                    <td className="py-2.5 px-4 text-xs tabular-nums text-[var(--color-text-secondary)]">
                      <span
                        className={
                          (r.beta ?? 0) > 1.3
                            ? "text-[var(--color-negative)]"
                            : (r.beta ?? 0) < 0.8
                            ? "text-[var(--color-positive)]"
                            : "text-[var(--color-text-secondary)]"
                        }
                      >
                        {(r.beta ?? 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs tabular-nums text-[var(--color-text-secondary)]">
                      {(r.lastAnnualDividend ?? 0) > 0 ? (
                        <span className="text-[var(--color-brand)]">
                          ${(r.lastAnnualDividend ?? 0).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-xs tabular-nums text-[var(--color-text-muted)]">
                      {((r.volume ?? 0) / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-2.5 px-4 text-[10px] font-medium text-[var(--color-text-muted)]">
                      {r.exchange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
            {searchQuery
              ? `No stocks matching "${searchQuery}" in ${sector || "any sector"}.`
              : "No stocks match your criteria. Try adjusting the filters."}
          </div>
        )}
      </div>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  currentKey,
  dir,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  dir: SortDir;
  onClick: (key: SortKey) => void;
}) {
  const active = currentKey === sortKey;
  return (
    <th
      onClick={() => onClick(sortKey)}
      className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider cursor-pointer hover:text-[var(--color-text-secondary)] transition-colors select-none"
    >
      <span className="flex items-center gap-1">
        {label}
        {active && (
          <ChevronDown
            size={10}
            className={`transition-transform ${dir === "asc" ? "rotate-180" : ""}`}
          />
        )}
      </span>
    </th>
  );
}
