"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown, Loader2, ChevronRight, Telescope } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import CompanyLogo from "./CompanyLogo";
import SectionBanner from "./SectionBanner";
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

type SortKey = "marketCap" | "price" | "beta" | "volume" | "lastAnnualDividend" | "changePercent" | "pe";
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
  const [searchMatches, setSearchMatches] = useState<ScreenResult[]>([]);
  const [webResults, setWebResults] = useState<{ symbol: string; name: string; exchange?: string }[]>([]);

  // Overlay live price / market cap / volume / change% from the batch quote
  // endpoint onto a set of screener rows (one Yahoo call for the whole list).
  const overlayLiveQuotes = useCallback(async (
    rows: ScreenResult[],
    preset?: { min: number; max: number } | null,
  ): Promise<ScreenResult[]> => {
    const symbols = rows.map((r) => r.symbol).slice(0, 60);
    if (symbols.length === 0) return rows;
    try {
      const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(symbols.join(","))}`);
      const json = await res.json();
      if (!json.quotes) return rows;
      const overlaid = rows.map((r) => {
        const q = json.quotes[r.symbol.toUpperCase()];
        if (!q) return r;
        return {
          ...r,
          price: q.price ?? r.price,
          marketCap: q.marketCap || r.marketCap,
          volume: q.volume || r.volume,
          changePercent: q.changePercent,
          pe: q.pe ?? null,
        };
      });
      // Re-filter against the LIVE market cap so results always match the
      // selected size band (a stock whose real cap fell below the threshold
      // must drop off, even if its cached cap qualified).
      if (preset) {
        return overlaid.filter((r) => r.marketCap >= preset.min && r.marketCap < preset.max);
      }
      return overlaid;
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
        const live = await overlayLiveQuotes(base, preset);
        setResults(live);
      } else {
        setIsDemo(false);
        setResults(json.results ?? []);
      }
    } catch {
      setIsDemo(true);
      setResults(await overlayLiveQuotes(staticUniverse(), preset));
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
    const preset = capPreset >= 0 ? MARKET_CAP_PRESETS[capPreset] : null;
    const interval = setInterval(async () => {
      const live = await overlayLiveQuotes(results, preset);
      setResults(live);
    }, 60000);
    return () => clearInterval(interval);
  }, [results, overlayLiveQuotes, capPreset]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  // When searching, scan the WHOLE universe (every sector) — not just the
  // currently selected sector — and overlay live prices on the matches.
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) { setSearchMatches([]); return; }
    const matches = SCREENER_DATABASE.filter(
      (r) =>
        r.symbol.toLowerCase().includes(q) ||
        r.companyName.toLowerCase().includes(q) ||
        (r.industry && r.industry.toLowerCase().includes(q))
    ).slice(0, 40);
    setSearchMatches(matches);
    if (matches.length > 0) {
      setWebResults([]);
      const t = setTimeout(async () => {
        const live = await overlayLiveQuotes(matches);
        setSearchMatches((cur) => (cur.length === matches.length ? live : cur));
      }, 300);
      return () => clearTimeout(t);
    }
    // No curated match — resolve the query across the whole market (name → ticker)
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
        .then((r) => r.json())
        .then((json) => setWebResults(Array.isArray(json.results) ? json.results.slice(0, 8) : []))
        .catch(() => setWebResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, overlayLiveQuotes]);

  const isSearching = searchQuery.trim().length > 0;
  const baseList = isSearching ? searchMatches : results;

  const sorted = [...baseList].sort((a, b) => {
    // P/E only makes sense when positive — a 0/none P/E means no earnings, not
    // "cheap", so push those to the bottom regardless of sort direction.
    if (sortKey === "pe") {
      const ap = typeof a.pe === "number" && a.pe > 0 ? a.pe : null;
      const bp = typeof b.pe === "number" && b.pe > 0 ? b.pe : null;
      if (ap === null && bp === null) return 0;
      if (ap === null) return 1;
      if (bp === null) return -1;
      return sortDir === "desc" ? bp - ap : ap - bp;
    }
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    return sortDir === "desc" ? bv - av : av - bv;
  });

  return (
    <div className="space-y-6">
      {/* Header — light section banner (the dark aurora is reserved for the
          landing hero, so the rest of the app stays clean and colorful). */}
      <SectionBanner
        accent="brand"
        icon={Telescope}
        eyebrow="Live prices · refreshes every 60s"
        title="Stock Screener"
        subtitle="Scan thousands of stocks, commodities and funds — sort by price, today's move, P/E, market cap and more to spot your next idea."
      />

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
                {isSearching ? `result${sorted.length === 1 ? "" : "s"} for "${searchQuery.trim()}"` : `stocks${sector ? ` in ${sector}` : ""}`}
              </span>
            )}
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any stock — searches every sector"
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
                  <SortHeader label="Chg %" sortKey="changePercent" currentKey={sortKey} dir={sortDir} onClick={handleSort} />
                  <SortHeader label="P/E" sortKey="pe" currentKey={sortKey} dir={sortDir} onClick={handleSort} />
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
                    <td className="py-2.5 px-4 text-xs tabular-nums font-medium">
                      {typeof r.changePercent === "number" ? (
                        <span className={r.changePercent >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}>
                          {r.changePercent >= 0 ? "+" : ""}{r.changePercent.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-xs tabular-nums text-[var(--color-text-secondary)]">
                      {typeof r.pe === "number" && r.pe > 0 ? `${r.pe.toFixed(1)}x` : <span className="text-[var(--color-text-muted)]">—</span>}
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
        ) : isSearching && webResults.length > 0 ? (
          <div>
            <p className="px-4 pt-4 pb-2 text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
              Found on the market — open for live data
            </p>
            {webResults.map((r) => (
              <button
                key={r.symbol}
                onClick={() => onSelect(r.symbol)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CompanyLogo symbol={r.symbol} size={22} />
                  <span className="font-bold text-[var(--color-gold)] text-xs shrink-0">{r.symbol}</span>
                  <span className="text-xs text-[var(--color-text-secondary)] truncate">{r.name}</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand-dim)] shrink-0">
                  Open <ChevronRight size={14} />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
            {isSearching
              ? `No stocks matching "${searchQuery.trim()}". Try a ticker or company name.`
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
