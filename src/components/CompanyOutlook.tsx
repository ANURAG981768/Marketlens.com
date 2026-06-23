"use client";

import { useState, useCallback } from "react";
import { Search, TrendingUp, TrendingDown, Minus, ShieldCheck, AlertTriangle, Scale, Sprout, Gauge, Activity, Info, Loader2 } from "lucide-react";
import { searchStocks, type SearchItem } from "@/lib/search-data";
import CompanyLogo from "./CompanyLogo";
import type { Fundamentals } from "./StockCompare";

interface Factor {
  key: string;
  label: string;
  icon: typeof Scale;
  score: number; // 0-100
  detail: string;
}

function n(v: number | null | undefined): number | null {
  return typeof v === "number" && isFinite(v) ? v : null;
}

function analyze(f: Fundamentals) {
  const factors: Factor[] = [];

  // Valuation — lower multiples are more favorable. Prefer P/E, but fall back
  // to P/S for companies with no positive earnings (otherwise an unprofitable
  // name would dodge valuation scrutiny entirely and score deceptively well).
  const pe = n(f.pe);
  const ps = n(f.ps);
  if (pe !== null && pe > 0) {
    const s = pe < 15 ? 85 : pe < 22 ? 68 : pe < 35 ? 50 : pe < 55 ? 32 : 18;
    factors.push({ key: "val", label: "Valuation", icon: Scale, score: s, detail: `P/E ${pe.toFixed(1)}x${ps !== null ? ` · P/S ${ps.toFixed(1)}x` : ""}` });
  } else if (ps !== null && ps > 0) {
    const s = ps < 2 ? 80 : ps < 5 ? 60 : ps < 10 ? 44 : ps < 20 ? 30 : 18;
    factors.push({ key: "val", label: "Valuation", icon: Scale, score: s, detail: `P/S ${ps.toFixed(1)}x · not yet profitable (no P/E)` });
  }
  // Growth
  const g = n(f.revenueGrowth);
  if (g !== null) {
    const s = g > 25 ? 90 : g > 12 ? 74 : g > 4 ? 56 : g > 0 ? 42 : 22;
    factors.push({ key: "growth", label: "Growth", icon: Sprout, score: s, detail: `Revenue ${g >= 0 ? "+" : ""}${g.toFixed(1)}% YoY` });
  }
  // Profitability
  const roe = n(f.roe);
  const margin = n(f.profitMargin);
  if (roe !== null || margin !== null) {
    const rs = roe !== null ? (roe > 20 ? 90 : roe > 12 ? 72 : roe > 5 ? 52 : 30) : 50;
    const ms = margin !== null ? (margin > 20 ? 88 : margin > 10 ? 70 : margin > 3 ? 50 : 28) : 50;
    factors.push({ key: "prof", label: "Profitability", icon: TrendingUp, score: Math.round((rs + ms) / 2), detail: `${roe !== null ? `ROE ${roe.toFixed(0)}%` : ""}${roe !== null && margin !== null ? " · " : ""}${margin !== null ? `Net margin ${margin.toFixed(0)}%` : ""}` });
  }
  // Financial health
  const de = n(f.debtToEquity);
  const cr = n(f.currentRatio);
  if (de !== null || cr !== null) {
    const ds = de !== null ? (de < 0.4 ? 88 : de < 1 ? 68 : de < 2 ? 48 : 28) : 50;
    const cs = cr !== null ? (cr > 2 ? 85 : cr > 1.2 ? 66 : cr > 1 ? 50 : 32) : 50;
    factors.push({ key: "health", label: "Financial health", icon: ShieldCheck, score: Math.round((ds + cs) / 2), detail: `${de !== null ? `D/E ${de.toFixed(2)}x` : ""}${de !== null && cr !== null ? " · " : ""}${cr !== null ? `Current ${cr.toFixed(2)}` : ""}` });
  }
  // Timing / momentum — position within 52-week range
  const price = n(f.price);
  const hi = n(f.fiftyTwoWeekHigh);
  const lo = n(f.fiftyTwoWeekLow);
  let pos52: number | null = null;
  if (price !== null && hi !== null && lo !== null && hi > lo) {
    pos52 = ((price - lo) / (hi - lo)) * 100;
    // Mid-range is the most constructive entry; extremes are riskier either way
    const s = pos52 < 25 ? 70 : pos52 < 55 ? 78 : pos52 < 80 ? 56 : 38;
    factors.push({ key: "timing", label: "Entry timing", icon: Gauge, score: s, detail: `${pos52.toFixed(0)}% of 52-week range` });
  }

  const overall = factors.length ? Math.round(factors.reduce((a, b) => a + b.score, 0) / factors.length) : 50;

  let verdict: "Favorable" | "Neutral" | "Exercise caution";
  if (overall >= 65) verdict = "Favorable";
  else if (overall >= 45) verdict = "Neutral";
  else verdict = "Exercise caution";

  return { factors, overall, verdict, pos52 };
}

function narrative(f: Fundamentals, a: ReturnType<typeof analyze>): string {
  const name = f.name || f.symbol;
  const pe = n(f.pe);
  const ps = n(f.ps);
  const g = n(f.revenueGrowth);
  const roe = n(f.roe);
  const margin = n(f.profitMargin);

  // Lead sentence: valuation + profitability status, built so it stays
  // grammatical whether or not the company is profitable.
  let lead: string;
  if (pe !== null && pe > 0) {
    const v = pe < 18 ? "trades at a modest valuation" : pe < 32 ? "carries a moderate valuation" : "commands a premium valuation";
    lead = `${name} ${v} (P/E ${pe.toFixed(1)}x)`;
    if (roe !== null && roe > 15) lead += `, supported by strong returns on equity (${roe.toFixed(0)}%)`;
    else if (roe !== null && roe > 0) lead += `, with moderate capital efficiency (ROE ${roe.toFixed(0)}%)`;
  } else {
    // No positive earnings — describe it honestly and value on sales instead.
    lead = `${name} is not yet consistently profitable`;
    if (margin !== null && margin < 0) lead += ` (net margin ${margin.toFixed(0)}%)`;
    if (ps !== null) lead += `, and is valued at ${ps.toFixed(1)}x sales`;
  }
  lead += ".";

  // Growth as its own sentence so connectors never dangle.
  let growthSentence = "";
  if (g !== null) {
    growthSentence =
      g > 10
        ? ` Revenue is growing at a double-digit pace (${g.toFixed(0)}% YoY).`
        : g > 0
        ? ` Revenue is growing modestly (${g.toFixed(0)}% YoY).`
        : ` Revenue has contracted over the past year (${g.toFixed(0)}% YoY).`;
  }
  const parts: string[] = [lead + growthSentence];

  let timing = "";
  if (a.pos52 !== null) {
    if (a.pos52 > 80) timing = ` The stock sits near its 52-week high, so patient investors may prefer to wait for a pullback before committing.`;
    else if (a.pos52 < 25) timing = ` It trades near the low end of its 52-week range — potentially an opportunity, but worth confirming the reason for the weakness.`;
    else timing = ` It trades in the middle of its 52-week range, neither stretched nor distressed.`;
  }
  let target = "";
  const tp = n(f.targetPrice);
  const px = n(f.price);
  if (tp !== null && px !== null && px > 0) {
    const up = ((tp - px) / px) * 100;
    target = ` Wall Street's mean price target of $${tp.toFixed(2)} implies ${up >= 0 ? "+" : ""}${up.toFixed(0)}% versus the current price.`;
  }

  const closer =
    a.verdict === "Favorable"
      ? ` On balance, the fundamentals look constructive for a long-term horizon.`
      : a.verdict === "Neutral"
      ? ` Overall it's a balanced picture — reasonable, but without a single compelling signal.`
      : ` Several indicators warrant caution; deeper diligence is advisable before acting.`;

  return parts.join(" ") + timing + target + closer;
}

export default function CompanyOutlook() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [data, setData] = useState<Fundamentals | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.length >= 1) {
      const local = searchStocks(q, 6);
      setResults(local);
      setShowResults(true);
      if (q.length >= 2) {
        fetch(`/api/search?q=${encodeURIComponent(q)}`)
          .then((r) => r.json())
          .then((json) => {
            if (json.results?.length) {
              const have = new Set(local.map((l) => l.symbol));
              setResults([...local, ...json.results.filter((r: SearchItem) => !have.has(r.symbol)).slice(0, 8)]);
            }
          })
          .catch(() => {});
      }
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const analyzeCompany = useCallback(async (item: SearchItem) => {
    setQuery(item.symbol);
    setShowResults(false);
    setResults([]);
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/fundamentals?symbol=${encodeURIComponent(item.symbol)}`);
      const json = await res.json();
      if (json.error || json.price == null) {
        setError(`We couldn't analyze ${item.symbol.toUpperCase()} right now. Try again in a moment.`);
      } else {
        setData(json as Fundamentals);
      }
    } catch {
      setError("Network issue — please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const a = data ? analyze(data) : null;
  const verdictStyle = a
    ? a.verdict === "Favorable"
      ? { color: "var(--color-positive)", bg: "var(--color-positive)", Icon: TrendingUp }
      : a.verdict === "Neutral"
      ? { color: "var(--color-warning)", bg: "var(--color-warning)", Icon: Minus }
      : { color: "var(--color-negative)", bg: "var(--color-negative)", Icon: TrendingDown }
    : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold">Company Outlook</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          Search any company for an instant fundamentals-based outlook and timing read.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search a company — Apple, NVDA, Reliance…"
          className="w-full pl-11 pr-4 py-3 text-sm border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)]"
        />
        {showResults && results.length > 0 && (
          <div className="absolute z-30 mt-1 w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden">
            {results.map((r) => (
              <button
                key={r.symbol}
                onClick={() => analyzeCompany(r)}
                className="w-full px-4 py-2.5 text-left hover:bg-[var(--color-surface-hover)] flex items-center gap-3 border-b last:border-b-0 border-[var(--color-border)] transition-colors"
              >
                <CompanyLogo symbol={r.symbol} size={20} />
                <span className="text-sm font-bold">{r.symbol}</span>
                <span className="text-xs text-[var(--color-text-muted)] truncate">{r.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] py-8 justify-center">
          <Loader2 size={16} className="animate-spin" /> Analyzing fundamentals…
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-warning)]/10 text-[var(--color-warning)] text-sm">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {!loading && !data && !error && (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <Activity size={28} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Search a company above to generate its outlook.</p>
        </div>
      )}

      {data && a && verdictStyle && (
        <div className="space-y-5 animate-fade-in-up">
          {/* Company + verdict banner */}
          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <CompanyLogo symbol={data.symbol} size={42} />
                <div>
                  <h3 className="font-display text-xl font-semibold leading-tight">{data.symbol}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{data.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-semibold tabular-nums">${n(data.price)?.toFixed(2) ?? "—"}</p>
                {n(data.changePercent) !== null && (
                  <p className={`text-xs font-semibold ${(data.changePercent ?? 0) >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
                    {(data.changePercent ?? 0) >= 0 ? "+" : ""}{(data.changePercent ?? 0).toFixed(2)}%
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-xl p-4 flex items-center gap-3" style={{ background: `color-mix(in srgb, ${verdictStyle.bg} 10%, transparent)` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${verdictStyle.bg} 18%, transparent)` }}>
                <verdictStyle.Icon size={20} style={{ color: verdictStyle.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">Outlook · score {a.overall}/100</p>
                <p className="font-display text-lg font-semibold" style={{ color: verdictStyle.color }}>{a.verdict}</p>
              </div>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-4">{narrative(data, a)}</p>
          </div>

          {/* Factor breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {a.factors.map((fac) => {
              const col = fac.score >= 65 ? "var(--color-positive)" : fac.score >= 45 ? "var(--color-warning)" : "var(--color-negative)";
              return (
                <div key={fac.key} className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <fac.icon size={15} className="text-[var(--color-text-muted)]" /> {fac.label}
                    </span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: col }}>{fac.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-surface-card)] overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all" style={{ width: `${fac.score}%`, background: col }} />
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{fac.detail}</p>
                </div>
              );
            })}
          </div>

          {/* Legal disclaimer */}
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
            <Info size={14} className="text-[var(--color-text-muted)] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
              This is an automated, educational assessment generated from publicly available fundamentals — <strong>not investment advice</strong> and not a recommendation to buy or sell. MarketLens is not a registered investment advisor. Markets carry risk; do your own research and consult a licensed professional before investing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
