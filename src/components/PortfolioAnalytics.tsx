"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Gauge,
  Info,
  Layers,
  Lightbulb,
  PieChart,
  Shield,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import EmptyState from "./EmptyState";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
}

interface RiskMetrics {
  sharpeRatio: number;
  portfolioBeta: number;
  diversificationScore: number;
  maxDrawdown: number;
  valueAtRisk: number;
  concentrationRisk: { symbol: string; pct: number };
}

interface SectorAllocation {
  sector: string;
  pct: number;
  color: string;
}

interface PositionRow {
  symbol: string;
  name: string;
  weight: number;
  pnl: number;
  pnlPct: number;
  beta: number;
  riskContribution: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BETA_MAP: Record<string, number> = {
  AAPL: 1.24,
  MSFT: 0.89,
  NVDA: 1.68,
  GOOGL: 1.05,
  AMZN: 1.15,
  META: 1.22,
  TSLA: 2.05,
  JPM: 1.12,
};

const SECTOR_MAP: Record<string, string> = {
  AAPL: "Technology",
  MSFT: "Technology",
  NVDA: "Technology",
  GOOGL: "Communication Services",
  AMZN: "Consumer Cyclical",
  META: "Communication Services",
  TSLA: "Consumer Cyclical",
  JPM: "Financial Services",
  JNJ: "Healthcare",
  UNH: "Healthcare",
  PG: "Consumer Defensive",
  V: "Financial Services",
  MA: "Financial Services",
  HD: "Consumer Cyclical",
  DIS: "Communication Services",
  NFLX: "Communication Services",
  PFE: "Healthcare",
  XOM: "Energy",
  CVX: "Energy",
  KO: "Consumer Defensive",
  PEP: "Consumer Defensive",
  WMT: "Consumer Defensive",
  BAC: "Financial Services",
  GS: "Financial Services",
  INTC: "Technology",
  AMD: "Technology",
  CRM: "Technology",
  ORCL: "Technology",
  CSCO: "Technology",
  ADBE: "Technology",
};

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#00c805",
  "Communication Services": "#3b82f6",
  "Consumer Cyclical": "#f59e0b",
  "Financial Services": "#8b5cf6",
  Healthcare: "#ec4899",
  "Consumer Defensive": "#14b8a6",
  Energy: "#f97316",
  Industrials: "#6366f1",
  "Real Estate": "#a855f7",
  Utilities: "#06b6d4",
  "Basic Materials": "#84cc16",
};

const RISK_FREE_RATE = 0.052; // ~5.2% 10-yr proxy

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function fmtCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtPct(n: number, decimals = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

function getBeta(symbol: string): number {
  return BETA_MAP[symbol.toUpperCase()] ?? 1.0;
}

function getSector(symbol: string): string {
  // Unmapped tickers fall into "Other" rather than being silently counted as
  // Technology — otherwise the sector breakdown and diversification score would
  // overstate tech concentration for any stock outside the known map.
  return SECTOR_MAP[symbol.toUpperCase()] ?? "Other";
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/* ------------------------------------------------------------------ */
/*  Data loading                                                       */
/* ------------------------------------------------------------------ */

// Returns the user's real paper-trading holdings (no prices yet — those are
// fetched live). currentPrice is seeded to avgCost as a placeholder.
function loadHoldingsBase(): Holding[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("marketlens_paper_trading");
    if (raw) {
      const data = JSON.parse(raw);
      if (data.holdings && typeof data.holdings === "object") {
        const entries = Object.entries(data.holdings) as [string, { shares: number; avgCost: number; name: string }][];
        if (entries.length > 0) {
          return entries.map(([symbol, h]) => ({
            symbol,
            name: h.name,
            shares: h.shares,
            avgCost: h.avgCost,
            currentPrice: h.avgCost,
          }));
        }
      }
    }
  } catch {}
  return [];
}

/* ------------------------------------------------------------------ */
/*  Computation                                                        */
/* ------------------------------------------------------------------ */

function computeMetrics(holdings: Holding[]) {
  const totalValue = holdings.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const totalCost = holdings.reduce((s, h) => s + h.shares * h.avgCost, 0);
  const totalPnl = totalValue - totalCost;
  const portfolioReturn = totalCost > 0 ? totalPnl / totalCost : 0;

  // Weights
  const weights = holdings.map((h) => ({
    ...h,
    value: h.shares * h.currentPrice,
    weight: (h.shares * h.currentPrice) / totalValue,
    beta: getBeta(h.symbol),
    pnl: (h.currentPrice - h.avgCost) * h.shares,
    pnlPct: ((h.currentPrice - h.avgCost) / h.avgCost) * 100,
  }));

  // Portfolio beta
  const portfolioBeta = weights.reduce((s, w) => s + w.weight * w.beta, 0);

  // Estimated std dev (using beta-implied vol, assuming market vol ~16%)
  const marketVol = 0.16;
  const portVol = portfolioBeta * marketVol;
  // Annualize the holding-period return, but cap it so a big early paper gain
  // doesn't produce an absurd (unrealistic) annualized figure.
  const annualizedReturn = Math.max(-0.9, Math.min(0.6, portfolioReturn * (252 / 60)));
  const rawSharpe = portVol > 0 ? (annualizedReturn - RISK_FREE_RATE) / portVol : 0;
  // Real-world Sharpe ratios sit roughly within [-3, 3]; clamp for credibility.
  const sharpeRatio = Math.max(-3, Math.min(3.5, rawSharpe));

  // Diversification score based on HHI and sector count
  const hhi = weights.reduce((s, w) => s + w.weight * w.weight, 0);
  const uniqueSectors = new Set(weights.map((w) => getSector(w.symbol)));
  const sectorCount = uniqueSectors.size;
  const maxSectors = 11;
  const hhiScore = (1 - hhi) * 100; // lower HHI = more diversified
  const sectorScore = (sectorCount / maxSectors) * 100;
  const diversificationScore = clamp(hhiScore * 0.6 + sectorScore * 0.4, 0, 100);

  // Max drawdown estimate
  const maxDrawdown = -(portfolioBeta * 0.15 + 0.03) * 100; // rough estimate

  // VaR (95%) daily — parametric approach
  const dailyVol = portVol / Math.sqrt(252);
  const valueAtRisk = totalValue * dailyVol * 1.645;

  // Concentration risk
  const sorted = [...weights].sort((a, b) => b.weight - a.weight);
  const concentrationRisk = {
    symbol: sorted[0]?.symbol ?? "N/A",
    pct: (sorted[0]?.weight ?? 0) * 100,
  };

  // Sector allocation
  const sectorMap = new Map<string, number>();
  for (const w of weights) {
    const sector = getSector(w.symbol);
    sectorMap.set(sector, (sectorMap.get(sector) ?? 0) + w.weight * 100);
  }
  const sectorAllocation: SectorAllocation[] = Array.from(sectorMap.entries())
    .map(([sector, pct]) => ({
      sector,
      pct,
      color: SECTOR_COLORS[sector] ?? "#6b7280",
    }))
    .sort((a, b) => b.pct - a.pct);

  // Risk contribution per position (marginal contribution ~ weight * beta / portfolio beta)
  const positions: PositionRow[] = weights
    .map((w) => ({
      symbol: w.symbol,
      name: w.name,
      weight: w.weight * 100,
      pnl: w.pnl,
      pnlPct: w.pnlPct,
      beta: w.beta,
      riskContribution: portfolioBeta > 0 ? ((w.weight * w.beta) / portfolioBeta) * 100 : 0,
    }))
    .sort((a, b) => b.weight - a.weight);

  // Risk insights
  const insights: string[] = [];
  const topSector = sectorAllocation[0];
  if (topSector && topSector.pct > 50) {
    insights.push(
      `Your portfolio is heavily concentrated in ${topSector.sector} (${topSector.pct.toFixed(0)}%). Consider adding Healthcare or Consumer Staples for better diversification.`
    );
  }
  const highRisk = positions.find((p) => p.riskContribution > p.weight + 10);
  if (highRisk) {
    insights.push(
      `${highRisk.symbol} contributes ${highRisk.riskContribution.toFixed(0)}% of portfolio risk despite being only ${highRisk.weight.toFixed(0)}% of value — consider trimming.`
    );
  }
  if (portfolioBeta > 1.2) {
    const marketDrop = 10;
    const expectedLoss = (portfolioBeta * marketDrop).toFixed(1);
    insights.push(
      `Your portfolio beta of ${portfolioBeta.toFixed(2)} means you'll amplify market moves by ${((portfolioBeta - 1) * 100).toFixed(0)}%. In a ${marketDrop}% market drop, expect ~${expectedLoss}% loss.`
    );
  }
  if (concentrationRisk.pct > 25) {
    insights.push(
      `${concentrationRisk.symbol} makes up ${concentrationRisk.pct.toFixed(0)}% of your portfolio. A single position above 25% creates outsized idiosyncratic risk.`
    );
  }
  if (sectorCount <= 2) {
    insights.push(
      `You only have exposure to ${sectorCount} sector${sectorCount === 1 ? "" : "s"}. Broadening to 4-5 sectors can significantly reduce downside risk.`
    );
  }
  if (insights.length < 3) {
    insights.push(
      `Your estimated daily VaR of ${fmtCurrency(valueAtRisk)} means on 1 out of 20 trading days, your losses could exceed this amount. Size positions accordingly.`
    );
  }

  return {
    totalValue,
    totalCost,
    totalPnl,
    portfolioReturn,
    metrics: {
      sharpeRatio,
      portfolioBeta,
      diversificationScore,
      maxDrawdown,
      valueAtRisk,
      concentrationRisk,
    } as RiskMetrics,
    sectorAllocation,
    positions,
    insights,
  };
}

/* ------------------------------------------------------------------ */
/*  Gauge SVG                                                          */
/* ------------------------------------------------------------------ */

function SharpeGauge({ value }: { value: number }) {
  const clamped = clamp(value, -1, 3);
  const angle = ((clamped + 1) / 4) * 180; // -1..3 maps to 0..180
  const ratingColor =
    value >= 2 ? "var(--color-positive)" : value >= 1 ? "var(--color-warning)" : "var(--color-negative)";
  const ratingLabel = value >= 2 ? "Excellent" : value >= 1 ? "Good" : value >= 0 ? "Fair" : "Poor";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-28 h-16">
        {/* Background arc */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Colored arc segments */}
        <path d="M 10 60 A 50 50 0 0 1 35 18" fill="none" stroke="var(--color-negative)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
        <path d="M 35 18 A 50 50 0 0 1 60 10" fill="none" stroke="var(--color-warning)" strokeWidth="8" opacity="0.3" />
        <path d="M 60 10 A 50 50 0 0 1 85 18" fill="none" stroke="var(--color-warning)" strokeWidth="8" opacity="0.3" />
        <path d="M 85 18 A 50 50 0 0 1 110 60" fill="none" stroke="var(--color-positive)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
        {/* Needle */}
        <line
          x1="60"
          y1="60"
          x2={60 + 40 * Math.cos(((180 - angle) * Math.PI) / 180)}
          y2={60 - 40 * Math.sin(((180 - angle) * Math.PI) / 180)}
          stroke={ratingColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="4" fill={ratingColor} />
      </svg>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-2xl font-bold tabular-nums" style={{ color: ratingColor }}>
          {value.toFixed(2)}
        </span>
        <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ color: ratingColor, background: `${ratingColor}15` }}>
          {ratingLabel}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Metric Card (internal)                                             */
/* ------------------------------------------------------------------ */

function RiskCard({
  icon,
  title,
  children,
  explanation,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  explanation: string;
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-brand)]/30 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-brand)]">{icon}</span>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          aria-label={`Info about ${title}`}
        >
          <Info size={14} />
        </button>
      </div>
      <div className="min-h-[60px]">{children}</div>
      {showInfo && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sector Bar                                                         */
/* ------------------------------------------------------------------ */

function SectorBar({ sectors }: { sectors: SectorAllocation[] }) {
  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div className="h-8 rounded-lg overflow-hidden flex" role="img" aria-label="Sector allocation bar chart">
        {sectors.map((s) => (
          <div
            key={s.sector}
            className="h-full transition-all duration-300 relative group"
            style={{ width: `${s.pct}%`, backgroundColor: s.color }}
          >
            {s.pct > 8 && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                {s.pct.toFixed(0)}%
              </span>
            )}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded text-[10px] text-[var(--color-text-primary)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
              {s.sector}: {s.pct.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {sectors.map((s) => (
          <div key={s.sector} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-[var(--color-text-secondary)]">
              {s.sector} <span className="text-[var(--color-text-muted)]">{s.pct.toFixed(1)}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function PortfolioAnalytics({ onStartTrading }: { onStartTrading?: () => void }) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [eduOpen, setEduOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const base = loadHoldingsBase();
    if (base.length === 0) { setReady(true); return; }
    setHoldings(base); // show immediately with avgCost as placeholder
    // Fetch real current prices so all analytics are based on live data
    fetch(`/api/quotes?symbols=${encodeURIComponent(base.map((h) => h.symbol).join(","))}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.quotes) {
          setHoldings(base.map((h) => ({ ...h, currentPrice: json.quotes[h.symbol]?.price || h.avgCost })));
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const data = useMemo(() => computeMetrics(holdings), [holdings]);
  const { totalValue, totalPnl, portfolioReturn, metrics, sectorAllocation, positions, insights } = data;

  const isDemo = false;

  // Empty state — no holdings to analyze yet
  if (ready && holdings.length === 0) {
    return (
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl">
        <EmptyState
          icon={<Shield size={22} />}
          title="No portfolio to analyze yet"
          description="Buy a few stocks in Paper Trading, then come back here for live risk analytics — Sharpe ratio, beta, diversification, and concentration risk on your real positions."
          action={
            onStartTrading ? (
              <button
                onClick={onStartTrading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dim)] transition-colors"
              >
                Start paper trading
              </button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/*  Header                                                      */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand)]/60 flex items-center justify-center shadow-lg shadow-[var(--color-brand)]/20">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">Portfolio Analytics</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Live risk metrics for your paper-trading portfolio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-muted)]">Portfolio Value</p>
            <p className="text-lg font-bold tabular-nums text-[var(--color-text-primary)]">{fmtCurrency(totalValue)}</p>
          </div>
          <div className="h-8 w-px bg-[var(--color-border)]" />
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-muted)]">Total P&L</p>
            <p
              className="text-lg font-bold tabular-nums"
              style={{ color: totalPnl >= 0 ? "var(--color-positive)" : "var(--color-negative)" }}
            >
              {fmtCurrency(totalPnl)}{" "}
              <span className="text-sm font-medium">({fmtPct(portfolioReturn * 100)})</span>
            </p>
          </div>
        </div>
      </div>

      {isDemo && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20">
          <AlertTriangle size={14} className="text-[var(--color-warning)] shrink-0" />
          <p className="text-xs text-[var(--color-warning)]">
            Showing demo portfolio. Start paper trading to see your own risk analytics.
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/*  Risk Metrics Grid                                           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Sharpe Ratio */}
        <RiskCard
          icon={<Gauge size={16} />}
          title="Sharpe Ratio"
          explanation="Measures risk-adjusted return. It tells you how much excess return you earn per unit of risk. Above 1.0 is good, above 2.0 is excellent. A negative Sharpe means you're losing money on a risk-adjusted basis."
        >
          <SharpeGauge value={metrics.sharpeRatio} />
        </RiskCard>

        {/* 2. Portfolio Beta */}
        <RiskCard
          icon={<Activity size={16} />}
          title="Portfolio Beta"
          explanation="Measures sensitivity to market moves. A beta of 1.0 means your portfolio moves exactly with the S&P 500. Above 1.0 = more volatile than the market, below 1.0 = less volatile."
        >
          <div className="flex items-end gap-3">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{
                color:
                  metrics.portfolioBeta > 1.3
                    ? "var(--color-negative)"
                    : metrics.portfolioBeta > 1.0
                    ? "var(--color-warning)"
                    : "var(--color-positive)",
              }}
            >
              {metrics.portfolioBeta.toFixed(2)}
            </span>
            <div className="pb-1">
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{
                  color:
                    metrics.portfolioBeta > 1.3
                      ? "var(--color-negative)"
                      : metrics.portfolioBeta > 1.0
                      ? "var(--color-warning)"
                      : "var(--color-positive)",
                  background:
                    metrics.portfolioBeta > 1.3
                      ? "color-mix(in srgb, var(--color-negative) 15%, transparent)"
                      : metrics.portfolioBeta > 1.0
                      ? "color-mix(in srgb, var(--color-warning) 15%, transparent)"
                      : "color-mix(in srgb, var(--color-positive) 15%, transparent)",
                }}
              >
                {metrics.portfolioBeta > 1.3 ? "Aggressive" : metrics.portfolioBeta > 1.0 ? "Moderate" : "Defensive"}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            {metrics.portfolioBeta > 1 ? (
              <TrendingUp size={12} className="text-[var(--color-warning)]" />
            ) : (
              <TrendingDown size={12} className="text-[var(--color-positive)]" />
            )}
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {metrics.portfolioBeta > 1
                ? `${((metrics.portfolioBeta - 1) * 100).toFixed(0)}% more volatile than S&P 500`
                : `${((1 - metrics.portfolioBeta) * 100).toFixed(0)}% less volatile than S&P 500`}
            </span>
          </div>
        </RiskCard>

        {/* 3. Diversification Score */}
        <RiskCard
          icon={<PieChart size={16} />}
          title="Diversification Score"
          explanation="Based on position concentration (Herfindahl-Hirschman Index) and sector breadth. Higher is better. Below 40% is poor diversification, 40-70% is fair, above 70% is well-diversified."
        >
          <div className="flex items-end gap-3">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{
                color:
                  metrics.diversificationScore >= 70
                    ? "var(--color-positive)"
                    : metrics.diversificationScore >= 40
                    ? "var(--color-warning)"
                    : "var(--color-negative)",
              }}
            >
              {metrics.diversificationScore.toFixed(0)}%
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="mt-2 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${metrics.diversificationScore}%`,
                backgroundColor:
                  metrics.diversificationScore >= 70
                    ? "var(--color-positive)"
                    : metrics.diversificationScore >= 40
                    ? "var(--color-warning)"
                    : "var(--color-negative)",
              }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-[var(--color-text-muted)]">
            <span>Poor</span>
            <span>Fair</span>
            <span>Excellent</span>
          </div>
        </RiskCard>

        {/* 4. Max Drawdown */}
        <RiskCard
          icon={<TrendingDown size={16} />}
          title="Max Drawdown (Est.)"
          explanation="Estimated maximum peak-to-trough decline based on your portfolio's beta and historical market drawdown patterns. This is the worst-case scenario in a typical bear market correction."
        >
          <span className="text-3xl font-bold tabular-nums text-[var(--color-negative)]">
            {metrics.maxDrawdown.toFixed(1)}%
          </span>
          <div className="mt-2 flex items-center gap-1.5">
            <ShieldAlert size={12} className="text-[var(--color-negative)]" />
            <span className="text-[11px] text-[var(--color-text-muted)]">
              On a {fmtCurrency(totalValue)} portfolio, that&apos;s ~{fmtCurrency(Math.abs(totalValue * metrics.maxDrawdown / 100))}
            </span>
          </div>
        </RiskCard>

        {/* 5. Value at Risk */}
        <RiskCard
          icon={<Target size={16} />}
          title="Value at Risk (95%)"
          explanation="Maximum expected daily loss with 95% confidence. On 19 out of 20 trading days, your loss should not exceed this amount. Based on parametric VaR using portfolio volatility."
        >
          <span className="text-3xl font-bold tabular-nums text-[var(--color-negative)]">
            -{fmtCurrency(metrics.valueAtRisk)}
          </span>
          <div className="mt-2 flex items-center gap-1.5">
            <BarChart3 size={12} className="text-[var(--color-text-muted)]" />
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {((metrics.valueAtRisk / totalValue) * 100).toFixed(2)}% of portfolio per day
            </span>
          </div>
        </RiskCard>

        {/* 6. Concentration Risk */}
        <RiskCard
          icon={<Layers size={16} />}
          title="Concentration Risk"
          explanation="Shows your largest position as a percentage of total portfolio value. If any single position exceeds 25%, you face outsized risk from that one stock's performance."
        >
          <div className="flex items-end gap-2">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{
                color: metrics.concentrationRisk.pct > 25 ? "var(--color-negative)" : "var(--color-positive)",
              }}
            >
              {metrics.concentrationRisk.pct.toFixed(1)}%
            </span>
            <span className="text-sm text-[var(--color-text-muted)] pb-0.5">{metrics.concentrationRisk.symbol}</span>
          </div>
          {metrics.concentrationRisk.pct > 25 && (
            <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--color-negative)]/10">
              <AlertTriangle size={12} className="text-[var(--color-negative)] shrink-0" />
              <span className="text-[11px] text-[var(--color-negative)]">
                Above 25% threshold — consider rebalancing
              </span>
            </div>
          )}
          {metrics.concentrationRisk.pct <= 25 && (
            <div className="mt-2 flex items-center gap-1.5">
              <Shield size={12} className="text-[var(--color-positive)]" />
              <span className="text-[11px] text-[var(--color-text-muted)]">Within healthy concentration limits</span>
            </div>
          )}
        </RiskCard>
      </div>

      {/* ============================================================ */}
      {/*  Sector Allocation                                           */}
      {/* ============================================================ */}
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <PieChart size={16} className="text-[var(--color-brand)]" />
          Sector Allocation
        </h3>
        <SectorBar sectors={sectorAllocation} />
      </div>

      {/* ============================================================ */}
      {/*  Position-Level Analysis                                     */}
      {/* ============================================================ */}
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <BarChart3 size={16} className="text-[var(--color-brand)]" />
            Position-Level Analysis
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-[var(--color-border)]">
                <th className="text-left py-2.5 px-5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                  Symbol
                </th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                  Weight %
                </th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                  P&L %
                </th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                  Beta
                </th>
                <th className="text-right py-2.5 px-5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                  Risk Contrib.
                </th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, i) => (
                <tr
                  key={pos.symbol}
                  className={`border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface)]/50 transition-colors ${
                    i === positions.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="py-3 px-5">
                    <div>
                      <span className="font-semibold text-[var(--color-text-primary)]">{pos.symbol}</span>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate max-w-[120px]">{pos.name}</p>
                    </div>
                  </td>
                  <td className="text-right py-3 px-3 tabular-nums text-[var(--color-text-secondary)]">
                    {pos.weight.toFixed(1)}%
                    {/* Mini bar */}
                    <div className="mt-1 h-1 rounded-full bg-[var(--color-border)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--color-brand)]"
                        style={{ width: `${pos.weight}%` }}
                      />
                    </div>
                  </td>
                  <td className="text-right py-3 px-3 tabular-nums font-medium" style={{ color: pos.pnlPct >= 0 ? "var(--color-positive)" : "var(--color-negative)" }}>
                    {fmtPct(pos.pnlPct)}
                  </td>
                  <td className="text-right py-3 px-3 tabular-nums text-[var(--color-text-secondary)]">
                    {pos.beta.toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-5">
                    <div className="flex items-center justify-end gap-2">
                      <span className="tabular-nums text-[var(--color-text-secondary)]">
                        {pos.riskContribution.toFixed(1)}%
                      </span>
                      {pos.riskContribution > pos.weight + 5 && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-[var(--color-negative)]/10 text-[var(--color-negative)] font-medium">
                          HIGH
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Risk Insights                                               */}
      {/* ============================================================ */}
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-brand)]/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
          <Lightbulb size={16} className="text-[var(--color-brand)]" />
          Risk Insights
        </h3>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-[var(--color-brand)]/10 flex items-center justify-center">
                  <Zap size={10} className="text-[var(--color-brand)]" />
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Educational Footer                                          */}
      {/* ============================================================ */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <button
          onClick={() => setEduOpen(!eduOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--color-surface-elevated)] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info size={16} className="text-[var(--color-brand)]" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              Understanding These Metrics
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-brand)]/10 text-[var(--color-brand)] px-1.5 py-0.5 rounded font-medium">
              LEARN
            </span>
          </div>
          {eduOpen ? (
            <ChevronUp size={16} className="text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
          )}
        </button>

        {eduOpen && (
          <div className="px-5 pb-5 space-y-4 border-t border-[var(--color-border)]">
            <div className="pt-4" />

            <EduSection
              term="Sharpe Ratio"
              explanation="Think of this as your &quot;return per unit of stress.&quot; If you earn 10% with wild daily swings, your Sharpe is lower than someone who earned 8% with smooth, steady growth. Named after Nobel laureate William Sharpe. A ratio above 1.0 means you're being compensated well for the risk you're taking."
            />

            <EduSection
              term="Beta"
              explanation="Beta measures how much your portfolio moves relative to the overall stock market (S&P 500). A beta of 1.0 means your portfolio moves exactly with the market. A beta of 1.5 means if the market drops 10%, your portfolio drops about 15%. Lower beta = smoother ride, higher beta = wilder swings."
            />

            <EduSection
              term="Diversification Score"
              explanation="This measures how spread out your investments are. It considers two things: (1) How evenly your money is distributed across positions (using the Herfindahl-Hirschman Index, or HHI, which regulators use to measure market concentration), and (2) How many different industry sectors you're in. More sectors + more even distribution = higher score."
            />

            <EduSection
              term="Max Drawdown"
              explanation="The worst peak-to-trough decline your portfolio could experience. If your portfolio hit $100K and then dropped to $80K, that's a 20% drawdown. This metric estimates your likely worst-case scenario based on your portfolio's risk profile. It's what keeps risk managers up at night."
            />

            <EduSection
              term="Value at Risk (VaR)"
              explanation="VaR answers the question: &quot;What's the most I could lose on a bad day?&quot; A 95% daily VaR of $5,000 means that on 19 out of 20 trading days, your loss should be less than $5,000. On that 20th day (about once a month), the loss could be worse. It's not a guarantee — it's a statistical estimate."
            />

            <EduSection
              term="Concentration Risk"
              explanation="Putting too many eggs in one basket. If one stock makes up 40% of your portfolio and it drops 20%, your whole portfolio drops 8% from that one position alone. Professional fund managers typically keep individual positions under 5-10%. For a college portfolio, keeping any single position under 25% is a reasonable guideline."
            />

            <EduSection
              term="Risk Contribution"
              explanation="Not all positions contribute equally to your portfolio's risk. A 20% position in a high-beta stock like NVDA (beta 1.68) contributes more risk than a 20% position in a defensive stock like JNJ (beta 0.55). Risk contribution shows each stock's actual share of total portfolio risk, which can differ significantly from its weight."
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Educational section helper                                         */
/* ------------------------------------------------------------------ */

function EduSection({ term, explanation }: { term: string; explanation: string }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{term}</h4>
      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{explanation}</p>
    </div>
  );
}
