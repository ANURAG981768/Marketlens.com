"use client";

import type { StockData } from "@/lib/types";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  DollarSign,
  Activity,
} from "lucide-react";

interface Props {
  data: StockData;
}

interface Signal {
  label: string;
  value: string;
  sentiment: "bullish" | "bearish" | "neutral";
  weight: number;
}

function analyzeStock(data: Props["data"]): {
  overallScore: number;
  verdict: string;
  summary: string;
  signals: Signal[];
  strengths: string[];
  risks: string[];
  priceTarget: { low: number; mid: number; high: number };
  indicatorsUsed: number;
  targetSource: string;
} {
  const { profile, metrics, quote, income } = data;
  const signals: Signal[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  // P/E Analysis
  const pe = metrics.peRatioTTM || quote.pe;
  if (pe && pe > 0) {
    const peSentiment = pe < 15 ? "bullish" : pe < 30 ? "neutral" : "bearish";
    const peScore = pe < 15 ? 85 : pe < 20 ? 70 : pe < 30 ? 55 : pe < 50 ? 35 : 20;
    signals.push({
      label: "P/E Ratio",
      value: `${pe.toFixed(1)}x`,
      sentiment: peSentiment,
      weight: 15,
    });
    totalScore += peScore * 15;
    totalWeight += 15;
  }

  // Revenue Growth
  if (income && income.length >= 2) {
    const latest = income[0]?.revenue || 0;
    const prior = income[1]?.revenue || 0;
    if (prior > 0) {
      const growth = ((latest - prior) / prior) * 100;
      const growthSentiment = growth > 10 ? "bullish" : growth > 0 ? "neutral" : "bearish";
      const growthScore = growth > 20 ? 90 : growth > 10 ? 75 : growth > 0 ? 55 : growth > -10 ? 35 : 20;
      signals.push({
        label: "Revenue Growth",
        value: `${growth.toFixed(1)}%`,
        sentiment: growthSentiment,
        weight: 15,
      });
      totalScore += growthScore * 15;
      totalWeight += 15;
    }
  }

  // Profit Margins
  const netMargin = metrics.netIncomePerShareTTM && quote.price
    ? (metrics.netIncomePerShareTTM / quote.price) * 100
    : null;
  if (income && income.length > 0) {
    const latestIncome = income[0];
    if (latestIncome.revenue && latestIncome.revenue > 0 && latestIncome.netIncome !== undefined) {
      const margin = (latestIncome.netIncome / latestIncome.revenue) * 100;
      const marginSentiment = margin > 15 ? "bullish" : margin > 5 ? "neutral" : "bearish";
      const marginScore = margin > 20 ? 85 : margin > 10 ? 70 : margin > 5 ? 55 : margin > 0 ? 40 : 20;
      signals.push({
        label: "Net Margin",
        value: `${margin.toFixed(1)}%`,
        sentiment: marginSentiment,
        weight: 12,
      });
      totalScore += marginScore * 12;
      totalWeight += 12;
    }
  }

  // ROE
  const roe = metrics.returnOnEquityTTM;
  if (roe !== undefined && roe !== null) {
    const roeVal = roe * 100;
    const roeSentiment = roeVal > 15 ? "bullish" : roeVal > 8 ? "neutral" : "bearish";
    const roeScore = roeVal > 20 ? 90 : roeVal > 15 ? 75 : roeVal > 8 ? 55 : roeVal > 0 ? 35 : 15;
    signals.push({
      label: "Return on Equity",
      value: `${roeVal.toFixed(1)}%`,
      sentiment: roeSentiment,
      weight: 12,
    });
    totalScore += roeScore * 12;
    totalWeight += 12;
  }

  // Debt to Equity
  const de = metrics.debtToEquityTTM;
  if (de !== undefined && de !== null) {
    const deSentiment = de < 0.5 ? "bullish" : de < 1.5 ? "neutral" : "bearish";
    const deScore = de < 0.3 ? 90 : de < 0.5 ? 75 : de < 1 ? 60 : de < 1.5 ? 45 : 25;
    signals.push({
      label: "Debt/Equity",
      value: `${de.toFixed(2)}x`,
      sentiment: deSentiment,
      weight: 10,
    });
    totalScore += deScore * 10;
    totalWeight += 10;
  }

  // Current Ratio
  const cr = metrics.currentRatioTTM;
  if (cr !== undefined && cr !== null) {
    const crSentiment = cr > 1.5 ? "bullish" : cr > 1 ? "neutral" : "bearish";
    const crScore = cr > 2 ? 85 : cr > 1.5 ? 70 : cr > 1 ? 55 : cr > 0.5 ? 35 : 20;
    signals.push({
      label: "Current Ratio",
      value: `${cr.toFixed(2)}`,
      sentiment: crSentiment,
      weight: 8,
    });
    totalScore += crScore * 8;
    totalWeight += 8;
  }

  // Dividend Yield
  const divYield = metrics.dividendYieldTTM;
  if (divYield !== undefined && divYield !== null && divYield > 0) {
    const yieldPct = divYield * 100;
    const divSentiment = yieldPct > 2 ? "bullish" : yieldPct > 0.5 ? "neutral" : "neutral";
    signals.push({
      label: "Dividend Yield",
      value: `${yieldPct.toFixed(2)}%`,
      sentiment: divSentiment,
      weight: 5,
    });
    totalScore += (yieldPct > 3 ? 80 : yieldPct > 1.5 ? 65 : 50) * 5;
    totalWeight += 5;
  }

  // Price Momentum (52-week range)
  const high52 = quote.yearHigh;
  const low52 = quote.yearLow;
  const price = quote.price;
  if (high52 && low52 && price) {
    const range = high52 - low52;
    const position = range > 0 ? ((price - low52) / range) * 100 : 50;
    const momSentiment = position > 70 ? "bullish" : position > 30 ? "neutral" : "bearish";
    signals.push({
      label: "52-Week Position",
      value: `${position.toFixed(0)}%`,
      sentiment: momSentiment,
      weight: 8,
    });
    totalScore += (position > 60 ? 65 : position > 40 ? 55 : 45) * 8;
    totalWeight += 8;
  }

  const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;

  // Generate verdict
  let verdict: string;
  if (overallScore >= 75) verdict = "Strong Buy";
  else if (overallScore >= 65) verdict = "Buy";
  else if (overallScore >= 55) verdict = "Hold";
  else if (overallScore >= 40) verdict = "Underperform";
  else verdict = "Sell";

  // Generate summary
  const companyName = profile.companyName || profile.symbol;
  const sector = profile.sector || "its sector";
  const bullCount = signals.filter((s) => s.sentiment === "bullish").length;
  const bearCount = signals.filter((s) => s.sentiment === "bearish").length;

  let summary: string;
  if (overallScore >= 70) {
    summary = `${companyName} demonstrates strong fundamentals with ${bullCount} of ${signals.length} indicators bullish. Operating in ${sector}, its valuation, profitability, and balance-sheet metrics screen well against common benchmarks. On balance the fundamentals look constructive, though no single metric guarantees future returns.`;
  } else if (overallScore >= 55) {
    summary = `${companyName} presents a mixed picture with both strengths and areas of concern. The company operates in ${sector} with ${bullCount} positive and ${bearCount} cautionary indicators. Investors should monitor upcoming earnings and industry trends before making significant position changes.`;
  } else {
    summary = `${companyName} currently faces headwinds with ${bearCount} bearish signals outweighing positives. Operating in ${sector}, the company shows signs of financial stress or overvaluation. Risk-averse investors may want to wait for improved fundamentals before considering entry.`;
  }

  // Strengths and risks
  const strengths: string[] = [];
  const risks: string[] = [];

  for (const s of signals) {
    if (s.sentiment === "bullish") {
      if (s.label === "P/E Ratio") strengths.push("Attractively valued relative to earnings");
      else if (s.label === "Revenue Growth") strengths.push("Strong revenue growth trajectory");
      else if (s.label === "Net Margin") strengths.push("Healthy profit margins above industry average");
      else if (s.label === "Return on Equity") strengths.push("Efficient use of shareholder capital");
      else if (s.label === "Debt/Equity") strengths.push("Conservative balance sheet with low leverage");
      else if (s.label === "Current Ratio") strengths.push("Strong short-term liquidity position");
      else if (s.label === "Dividend Yield") strengths.push("Attractive dividend income for shareholders");
      else if (s.label === "52-Week Position") strengths.push("Positive price momentum near 52-week highs");
    }
    if (s.sentiment === "bearish") {
      if (s.label === "P/E Ratio") risks.push("Elevated valuation may limit upside potential");
      else if (s.label === "Revenue Growth") risks.push("Declining or stagnant revenue trajectory");
      else if (s.label === "Net Margin") risks.push("Thin or negative profit margins raise concerns");
      else if (s.label === "Return on Equity") risks.push("Below-average returns on shareholder capital");
      else if (s.label === "Debt/Equity") risks.push("High debt levels increase financial risk");
      else if (s.label === "Current Ratio") risks.push("Weak liquidity may constrain operational flexibility");
      else if (s.label === "52-Week Position") risks.push("Trading near 52-week lows suggests bearish sentiment");
    }
  }

  if (strengths.length === 0) strengths.push("Limited bullish signals at current levels");
  if (risks.length === 0) risks.push("No major red flags identified");

  // Price targets — prefer REAL Wall Street analyst targets (low/mean/high)
  // when the stock is covered; only fall back to a model estimate otherwise.
  const a = data.analyst;
  const hasAnalyst = !!(a && a.mean && a.count && a.count > 0);
  const priceTarget = hasAnalyst
    ? {
        low: Math.round((a!.low ?? a!.mean! * 0.85) * 100) / 100,
        mid: Math.round(a!.mean! * 100) / 100,
        high: Math.round((a!.high ?? a!.mean! * 1.15) * 100) / 100,
      }
    : {
        low: Math.round(price * (overallScore >= 60 ? 0.85 : 0.7) * 100) / 100,
        mid: Math.round(price * (overallScore >= 60 ? 1.1 : 0.95) * 100) / 100,
        high: Math.round(price * (overallScore >= 60 ? 1.3 : 1.15) * 100) / 100,
      };

  return {
    overallScore,
    verdict,
    summary,
    signals,
    strengths,
    risks,
    priceTarget,
    indicatorsUsed: signals.length,
    targetSource: hasAnalyst
      ? `${a!.count} Wall Street analysts`
      : "model estimate · no analyst coverage",
  };
}

const RECO_LABEL: Record<string, string> = {
  strong_buy: "Strong Buy",
  buy: "Buy",
  hold: "Hold",
  underperform: "Underperform",
  sell: "Sell",
};

export default function AIAnalyst({ data }: Props) {
  const analysis = analyzeStock(data);
  const price = data.quote.price;
  const asOf = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Real Wall Street consensus (separate from our own computed score).
  const an = data.analyst;
  const consensus =
    an && an.recommendationKey && an.count && an.count > 0
      ? {
          label: RECO_LABEL[an.recommendationKey] || an.recommendationKey.replace(/_/g, " "),
          count: an.count,
          bullish:
            an.recommendationKey === "strong_buy" || an.recommendationKey === "buy",
          bearish:
            an.recommendationKey === "sell" || an.recommendationKey === "underperform",
        }
      : null;

  const verdictColor =
    analysis.verdict === "Strong Buy" || analysis.verdict === "Buy"
      ? "text-[var(--color-positive)]"
      : analysis.verdict === "Hold"
      ? "text-amber-500"
      : "text-[var(--color-negative)]";

  const scoreColor =
    analysis.overallScore >= 70
      ? "from-green-400 to-emerald-500"
      : analysis.overallScore >= 55
      ? "from-amber-400 to-orange-500"
      : "from-red-400 to-rose-500";

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)] bg-gradient-to-r from-violet-500/5 to-purple-500/5">
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                AI Stock Analysis
              </h3>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                Computed live from {analysis.indicatorsUsed} fundamental indicators
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--color-positive)] bg-green-50 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-positive)] animate-pulse" />
            Live · as of {asOf}
          </span>
        </div>
        {analysis.indicatorsUsed < 4 && (
          <div className="mt-2.5 flex items-start gap-1.5 text-[10px] text-[var(--color-warning)] bg-[var(--color-warning)]/8 rounded-lg px-2.5 py-1.5">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            Limited data available for this company — treat this score as preliminary.
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Score + Verdict */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e8e8e8"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                className={`stroke-current ${analysis.overallScore >= 70 ? "text-emerald-500" : analysis.overallScore >= 55 ? "text-amber-500" : "text-red-500"}`}
                strokeWidth="3"
                strokeDasharray={`${analysis.overallScore}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black">{analysis.overallScore}</span>
            </div>
          </div>
          <div>
            <p className={`text-lg font-black ${verdictColor}`}>{analysis.verdict}</p>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              MarketLens score · {analysis.signals.length} fundamental indicators
            </p>
            {consensus && (
              <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
                Wall St consensus:{" "}
                <span
                  className={`font-semibold ${
                    consensus.bullish
                      ? "text-[var(--color-positive)]"
                      : consensus.bearish
                      ? "text-[var(--color-negative)]"
                      : "text-amber-500"
                  }`}
                >
                  {consensus.label}
                </span>{" "}
                <span className="text-[var(--color-text-muted)]">· {consensus.count} analysts</span>
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-surface)] rounded-lg p-3">
          {analysis.summary}
        </p>

        {/* Signals Grid */}
        <div>
          <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Key Signals
          </p>
          <div className="grid grid-cols-2 gap-2">
            {analysis.signals.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
              >
                <span className="text-[11px] text-[var(--color-text-muted)]">{s.label}</span>
                <span
                  className={`text-[11px] font-bold ${
                    s.sentiment === "bullish"
                      ? "text-[var(--color-positive)]"
                      : s.sentiment === "bearish"
                      ? "text-[var(--color-negative)]"
                      : "text-[var(--color-text-primary)]"
                  }`}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Targets */}
        <div>
          <div className="flex items-baseline justify-between mb-2 gap-2">
            <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              12-Month Price Estimates
            </p>
            <p className="text-[9px] text-[var(--color-text-muted)] normal-case tracking-normal truncate">
              {analysis.targetSource}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[var(--color-surface)] rounded-lg p-2.5 text-center border border-[var(--color-border)]">
              <p className="text-[10px] text-[var(--color-negative)] font-medium">Bear</p>
              <p className="text-sm font-bold">${analysis.priceTarget.low.toFixed(0)}</p>
            </div>
            <div className="flex-1 bg-[var(--color-brand)]/5 rounded-lg p-2.5 text-center border border-[var(--color-brand)]/20">
              <p className="text-[10px] text-[var(--color-brand)] font-medium">Base</p>
              <p className="text-sm font-bold text-[var(--color-brand)]">${analysis.priceTarget.mid.toFixed(0)}</p>
            </div>
            <div className="flex-1 bg-[var(--color-surface)] rounded-lg p-2.5 text-center border border-[var(--color-border)]">
              <p className="text-[10px] text-[var(--color-positive)] font-medium">Bull</p>
              <p className="text-sm font-bold">${analysis.priceTarget.high.toFixed(0)}</p>
            </div>
          </div>
          <div className="relative mt-2 h-2 bg-[var(--color-surface-card)] rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-red-400 via-amber-400 to-green-400 rounded-full"
              style={{ left: "0%", width: "100%" }}
            />
            {price > 0 && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[var(--color-text-primary)] rounded-full shadow"
                style={{
                  left: `${Math.min(Math.max(((price - analysis.priceTarget.low) / (analysis.priceTarget.high - analysis.priceTarget.low)) * 100, 2), 98)}%`,
                }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-[var(--color-text-muted)]">${analysis.priceTarget.low.toFixed(0)}</span>
            <span className="text-[9px] text-[var(--color-text-muted)]">Current: ${price.toFixed(2)}</span>
            <span className="text-[9px] text-[var(--color-text-muted)]">${analysis.priceTarget.high.toFixed(0)}</span>
          </div>
        </div>

        {/* Strengths & Risks */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-medium text-[var(--color-positive)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <CheckCircle size={10} />
              Strengths
            </p>
            <ul className="space-y-1">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="text-[11px] text-[var(--color-text-secondary)] leading-snug">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-medium text-[var(--color-negative)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <AlertTriangle size={10} />
              Risks
            </p>
            <ul className="space-y-1">
              {analysis.risks.map((r, i) => (
                <li key={i} className="text-[11px] text-[var(--color-text-secondary)] leading-snug">
                  • {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[9px] text-[var(--color-text-muted)] text-center pt-2 border-t border-[var(--color-border)]">
          A transparent, rules-based score computed from live fundamentals — for education only, not financial advice.
        </p>
      </div>
    </div>
  );
}
