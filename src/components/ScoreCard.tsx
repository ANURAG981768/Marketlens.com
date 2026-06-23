"use client";

import type { StockData } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  DollarSign,
  BarChart3,
  Zap,
} from "lucide-react";

interface Props {
  data: StockData;
}

interface Score {
  category: string;
  score: number;
  icon: React.ReactNode;
  details: string;
}

function getValuationScore(pe: number, ps: number, evEbitda: number): Score {
  let score = 50;
  if (pe > 0 && pe < 15) score += 25;
  else if (pe >= 15 && pe < 25) score += 15;
  else if (pe >= 25 && pe < 40) score -= 5;
  else if (pe >= 40) score -= 15;

  if (ps < 3) score += 10;
  else if (ps > 10) score -= 10;

  if (evEbitda < 12) score += 10;
  else if (evEbitda > 25) score -= 10;

  score = Math.max(0, Math.min(100, score));
  const details =
    score >= 70
      ? "Attractively valued relative to earnings"
      : score >= 40
      ? "Fairly valued with moderate premium"
      : "Premium valuation — growth must justify price";

  return { category: "Valuation", score, icon: <DollarSign size={16} />, details };
}

function getProfitabilityScore(roe: number, roa: number): Score {
  let score = 50;
  if (roe > 0.25) score += 25;
  else if (roe > 0.15) score += 15;
  else if (roe > 0.08) score += 5;
  else score -= 10;

  if (roa > 0.15) score += 15;
  else if (roa > 0.08) score += 5;
  else score -= 5;

  score = Math.max(0, Math.min(100, score));
  const details =
    score >= 70
      ? "Strong profitability and capital efficiency"
      : score >= 40
      ? "Adequate returns on equity and assets"
      : "Below-average profitability metrics";

  return { category: "Profitability", score, icon: <TrendingUp size={16} />, details };
}

function getHealthScore(debtToEquity: number, currentRatio: number, coverage: number): Score {
  let score = 50;
  if (debtToEquity < 0.5) score += 20;
  else if (debtToEquity < 1) score += 10;
  else if (debtToEquity > 2) score -= 15;

  if (currentRatio > 2) score += 15;
  else if (currentRatio > 1) score += 5;
  else score -= 10;

  if (coverage > 10) score += 10;
  else if (coverage < 3) score -= 10;

  score = Math.max(0, Math.min(100, score));
  const details =
    score >= 70
      ? "Solid balance sheet with manageable debt"
      : score >= 40
      ? "Moderate leverage — monitor debt levels"
      : "High leverage may pose risk in downturns";

  return { category: "Financial Health", score, icon: <Shield size={16} />, details };
}

function getOverallScore(scores: Score[]): number {
  return Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
}

function getScoreColor(score: number): string {
  if (score >= 70) return "var(--color-positive)";
  if (score >= 40) return "var(--color-warning)";
  return "var(--color-negative)";
}

function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C+";
  if (score >= 40) return "C";
  if (score >= 30) return "D";
  return "F";
}

export default function ScoreCard({ data }: Props) {
  const { metrics } = data;

  const scores: Score[] = [
    getValuationScore(
      metrics.peRatioTTM,
      metrics.priceToSalesRatioTTM,
      metrics.evToEbitdaTTM
    ),
    getProfitabilityScore(metrics.returnOnEquityTTM, metrics.returnOnAssetsTTM),
    getHealthScore(
      metrics.debtToEquityTTM,
      metrics.currentRatioTTM,
      metrics.interestCoverageTTM
    ),
  ];

  const overall = getOverallScore(scores);
  const overallColor = getScoreColor(overall);

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Zap size={16} className="text-[var(--color-brand)]" />
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Quick Score
        </h3>
      </div>

      {/* Overall score */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#e8e8e8"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={overallColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(overall / 100) * 264} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-2xl font-bold"
              style={{ color: overallColor }}
            >
              {getGrade(overall)}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {overall}/100
            </span>
          </div>
        </div>
      </div>

      {/* Category scores */}
      <div className="space-y-4">
        {scores.map((s) => (
          <div key={s.category}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-text-muted)]">{s.icon}</span>
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                  {s.category}
                </span>
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: getScoreColor(s.score) }}
              >
                {s.score}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${s.score}%`,
                  backgroundColor: getScoreColor(s.score),
                }}
              />
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
              {s.details}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
