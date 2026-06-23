"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Target,
  CalendarClock,
  AlertTriangle,
  Lightbulb,
  Info,
  Newspaper,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import CompanyLogo from "./CompanyLogo";

/* ------------------------------------------------------------------ */
/*  Types — mirror the /api/transcripts response                      */
/* ------------------------------------------------------------------ */

type EpsResult = "beat" | "miss" | "met";

interface QuarterRecord {
  quarter: string;
  date: string;
  epsActual: number | null;
  epsEstimate: number | null;
  surprisePercent: number | null;
  result: EpsResult | null;
  revenue: string | null;
}

interface NewsItem {
  title: string;
  url: string;
  site: string;
  date: string;
}

interface TranscriptData {
  symbol: string;
  company: string;
  quarters: QuarterRecord[];
  news: NewsItem[];
  nextEarnings: string | null;
}

interface SearchMatch {
  symbol: string;
  name: string;
  exchange?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const POPULAR = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "JPM"];

function epsResultBadge(result: EpsResult | null) {
  if (result === "beat")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-positive)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-positive)]">
        <TrendingUp className="h-3 w-3" /> Beat
      </span>
    );
  if (result === "miss")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-negative)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-negative)]">
        <TrendingDown className="h-3 w-3" /> Miss
      </span>
    );
  if (result === "met")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-text-muted)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-text-muted)]">
        <Minus className="h-3 w-3" /> In line
      </span>
    );
  return null;
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (isNaN(d)) return "";
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EarningsTranscripts() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [data, setData] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfoBox, setShowInfoBox] = useState(true);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (symbol: string) => {
    setLoading(true);
    setError(null);
    setMatches([]);
    setQuery("");
    try {
      const res = await fetch(`/api/transcripts?symbol=${encodeURIComponent(symbol)}`);
      const json = await res.json();
      if (json.error) {
        setData(null);
        setError(
          json.error === "not_found"
            ? `No earnings record found for "${symbol}".`
            : "Earnings data is temporarily unavailable. Please try again."
        );
      } else {
        setData(json as TranscriptData);
      }
    } catch {
      setData(null);
      setError("Couldn't reach the data feed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load a default on first mount so the panel is never empty
  useEffect(() => {
    load("AAPL");
  }, [load]);

  // Universal search across the whole market (name → ticker)
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const q = query.trim();
    if (q.length < 1) {
      setMatches([]);
      return;
    }
    debounce.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((json) => setMatches(Array.isArray(json.results) ? json.results.slice(0, 8) : []))
        .catch(() => setMatches([]));
    }, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-[var(--color-brand)]" />
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Earnings Tracker
          </h2>
        </div>
        <span className="rounded-full bg-[var(--color-positive)]/10 px-3 py-1 text-xs font-medium text-[var(--color-positive)]">
          Live from Yahoo Finance
        </span>
      </div>

      {/* Educational info box */}
      {showInfoBox && (
        <div className="relative rounded-xl border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/5 p-4">
          <button
            onClick={() => setShowInfoBox(false)}
            className="absolute right-3 top-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex gap-3">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                What is an Earnings Call?
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Every quarter, public companies report results and the CEO and CFO
                discuss them with Wall Street analysts. The key question: did
                earnings per share (EPS) <strong>beat</strong> or <strong>miss</strong>{" "}
                what analysts expected? A beat often lifts the stock; a miss can
                sink it. Search any company below to see its real recent track
                record and the latest headlines covering it.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search — any company, any sector */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && matches[0]) load(matches[0].symbol);
          }}
          placeholder="Search any company — e.g. Nvidia, Costco, PLTR…"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand)] transition-colors"
        />
        {matches.length > 0 && (
          <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
            {matches.map((m) => (
              <button
                key={m.symbol}
                onClick={() => load(m.symbol)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-[var(--color-surface-elevated)] transition-colors"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-[var(--color-brand)]">{m.symbol}</span>
                  <span className="truncate text-sm text-[var(--color-text-secondary)]">
                    {m.name}
                  </span>
                </span>
                {m.exchange && (
                  <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
                    {m.exchange}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick picks */}
      {!query && (
        <div className="flex flex-wrap gap-2">
          {POPULAR.map((t) => (
            <button
              key={t}
              onClick={() => load(t)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                data?.symbol === t
                  ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)]/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--color-text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading earnings record…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 text-sm text-[var(--color-text-secondary)]">
          <AlertTriangle className="h-4 w-4 text-[var(--color-warning,#f59e0b)]" />
          {error}
        </div>
      )}

      {/* Result */}
      {!loading && data && (
        <div className="space-y-5">
          {/* Company header */}
          <div className="flex items-center gap-3">
            <CompanyLogo symbol={data.symbol} size={44} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--color-text-primary)]">{data.symbol}</span>
                <span className="truncate text-sm text-[var(--color-text-muted)]">
                  {data.company}
                </span>
              </div>
              {data.nextEarnings && (
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                  <CalendarClock className="h-3.5 w-3.5 text-[var(--color-brand)]" />
                  Next report:{" "}
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {data.nextEarnings}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Earnings track record */}
          {data.quarters.length > 0 && (
            <section>
              <div className="mb-2.5 flex items-center gap-2">
                <Target className="h-4 w-4 text-[var(--color-brand)]" />
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Earnings Track Record
                </h3>
                <span className="text-xs text-[var(--color-text-muted)]">
                  · EPS actual vs. analyst estimate
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--color-surface-elevated)] text-xs text-[var(--color-text-muted)]">
                      <th className="px-3 py-2 text-left font-medium">Quarter</th>
                      <th className="px-3 py-2 text-right font-medium">EPS</th>
                      <th className="px-3 py-2 text-right font-medium">Est.</th>
                      <th className="px-3 py-2 text-right font-medium">Surprise</th>
                      <th className="px-3 py-2 text-right font-medium">Revenue</th>
                      <th className="px-3 py-2 text-right font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.quarters.map((q, i) => (
                      <tr
                        key={i}
                        className="border-t border-[var(--color-border)] text-[var(--color-text-secondary)]"
                      >
                        <td className="px-3 py-2.5 font-medium text-[var(--color-text-primary)]">
                          {q.quarter || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {q.epsActual != null ? `$${q.epsActual.toFixed(2)}` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-[var(--color-text-muted)]">
                          {q.epsEstimate != null ? `$${q.epsEstimate.toFixed(2)}` : "—"}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-right tabular-nums font-medium ${
                            q.surprisePercent == null
                              ? "text-[var(--color-text-muted)]"
                              : q.surprisePercent >= 0
                              ? "text-[var(--color-positive)]"
                              : "text-[var(--color-negative)]"
                          }`}
                        >
                          {q.surprisePercent != null
                            ? `${q.surprisePercent >= 0 ? "+" : ""}${q.surprisePercent}%`
                            : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {q.revenue || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right">{epsResultBadge(q.result)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <DollarSign className="h-3 w-3" />
                Revenue shown where reported by the data feed. A “beat” means actual
                EPS came in above the consensus analyst estimate.
              </p>
            </section>
          )}

          {/* Latest coverage */}
          {data.news.length > 0 && (
            <section>
              <div className="mb-2.5 flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-[var(--color-brand)]" />
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Latest Coverage
                </h3>
              </div>
              <div className="space-y-2">
                {data.news.map((n, i) => (
                  <a
                    key={i}
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors hover:border-[var(--color-brand)]/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] leading-snug group-hover:text-[var(--color-brand)] transition-colors">
                        {n.title}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {n.site} · {timeAgo(n.date)}
                      </p>
                    </div>
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand)] transition-colors" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-3">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Earnings figures and headlines are sourced live from Yahoo Finance and
              may be delayed or revised. For the official record, see the company’s
              SEC filings and investor-relations page. For education only — not
              investment advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
