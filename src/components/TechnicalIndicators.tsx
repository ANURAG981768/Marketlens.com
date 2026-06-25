"use client";

import { useMemo } from "react";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { HistoricalPrice } from "@/lib/types";

interface Props {
  history: HistoricalPrice[];
  currentPrice: number;
}

function sma(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const slice = prices.slice(0, period);
  return slice.reduce((s, v) => s + v, 0) / period;
}

function ema(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const k = 2 / (period + 1);
  let e = prices.slice(prices.length - period).reduce((s, v) => s + v, 0) / period;
  for (let i = prices.length - period - 1; i >= 0; i--) {
    e = prices[i] * k + e * (1 - k);
  }
  return e;
}

function rsi(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
  for (let i = 0; i < period; i++) {
    const change = prices[i] - prices[i + 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export default function TechnicalIndicators({ history, currentPrice }: Props) {
  const indicators = useMemo(() => {
    // `history` arrives oldest-first (chronological, as the price chart needs).
    // Every indicator helper below expects newest-first (slice(0, period) =
    // most recent N), so reverse once here. Without this, SMA/RSI/EMA/52w were
    // all computed on data from ~a year ago instead of the latest days.
    const ordered = [...history].reverse();
    const closes = ordered.map((h) => h.close);

    const sma20 = sma(closes, 20);
    const sma50 = sma(closes, 50);
    const sma200 = sma(closes, 200);
    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const macd = ema12 && ema26 ? ema12 - ema26 : null;
    const rsiVal = rsi(closes);

    const high52 = Math.max(...closes.slice(0, 252));
    const low52 = Math.min(...closes.slice(0, 252));
    const fromHigh = ((currentPrice - high52) / high52) * 100;
    const fromLow = ((currentPrice - low52) / low52) * 100;

    const avgVol20 =
      history.length >= 20
        ? ordered.slice(0, 20).reduce((s, h) => s + h.volume, 0) / 20
        : null;

    let signals = 0;
    if (sma20 && currentPrice > sma20) signals++;
    else if (sma20) signals--;
    if (sma50 && currentPrice > sma50) signals++;
    else if (sma50) signals--;
    if (sma200 && currentPrice > sma200) signals++;
    else if (sma200) signals--;
    if (macd && macd > 0) signals++;
    else if (macd) signals--;
    // RSI convention: oversold (<30) leans bullish (mean-reversion bounce),
    // overbought (>70) leans bearish; the neutral band is a non-signal.
    if (rsiVal && rsiVal < 30) signals++;
    else if (rsiVal && rsiVal > 70) signals--;

    let overall: "Bullish" | "Bearish" | "Neutral" = "Neutral";
    if (signals >= 3) overall = "Bullish";
    else if (signals <= -3) overall = "Bearish";

    return {
      sma20,
      sma50,
      sma200,
      ema12,
      ema26,
      macd,
      rsiVal,
      high52,
      low52,
      fromHigh,
      fromLow,
      avgVol20,
      overall,
      signals,
    };
  }, [history, currentPrice]);

  const overallColor =
    indicators.overall === "Bullish"
      ? "text-[var(--color-positive)]"
      : indicators.overall === "Bearish"
      ? "text-[var(--color-negative)]"
      : "text-[var(--color-warning)]";

  const OverallIcon =
    indicators.overall === "Bullish"
      ? TrendingUp
      : indicators.overall === "Bearish"
      ? TrendingDown
      : Minus;

  // Adaptive precision so sub-cent instruments (e.g. small crypto) don't collapse
  // every level to "$0.00".
  function formatPrice(v: number | null) {
    if (v == null || !Number.isFinite(v)) return "—";
    const abs = Math.abs(v);
    const d = abs >= 1 ? 2 : abs >= 0.01 ? 4 : abs >= 0.0001 ? 6 : 8;
    return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: d })}`;
  }

  function signalBadge(condition: boolean | "neutral" | null) {
    if (condition === null) return <span className="text-[10px] text-[var(--color-text-muted)]">N/A</span>;
    if (condition === "neutral")
      return <span className="text-[10px] font-semibold text-[var(--color-warning)]">NEUTRAL</span>;
    return condition ? (
      <span className="text-[10px] font-semibold text-[var(--color-positive)]">BUY</span>
    ) : (
      <span className="text-[10px] font-semibold text-[var(--color-negative)]">SELL</span>
    );
  }

  const rows = [
    {
      label: "SMA (20)",
      value: formatPrice(indicators.sma20),
      signal: indicators.sma20 ? currentPrice > indicators.sma20 : null,
    },
    {
      label: "SMA (50)",
      value: formatPrice(indicators.sma50),
      signal: indicators.sma50 ? currentPrice > indicators.sma50 : null,
    },
    {
      label: "SMA (200)",
      value: formatPrice(indicators.sma200),
      signal: indicators.sma200 ? currentPrice > indicators.sma200 : null,
    },
    {
      label: "EMA (12)",
      value: formatPrice(indicators.ema12),
      signal: indicators.ema12 ? currentPrice > indicators.ema12 : null,
    },
    {
      label: "EMA (26)",
      value: formatPrice(indicators.ema26),
      signal: indicators.ema26 ? currentPrice > indicators.ema26 : null,
    },
    {
      label: "MACD",
      value: indicators.macd ? indicators.macd.toFixed(4) : "—",
      signal: indicators.macd ? indicators.macd > 0 : null,
    },
    {
      label: "RSI (14)",
      value: indicators.rsiVal ? indicators.rsiVal.toFixed(2) : "—",
      signal: indicators.rsiVal
        ? indicators.rsiVal < 30
          ? true // oversold → bullish lean
          : indicators.rsiVal > 70
          ? false // overbought → bearish lean
          : "neutral"
        : null,
    } as { label: string; value: string; signal: boolean | "neutral" | null },
  ];

  const rsiPct = indicators.rsiVal ? indicators.rsiVal : 50;
  const rsiZone =
    rsiPct < 30
      ? "Oversold"
      : rsiPct > 70
      ? "Overbought"
      : "Neutral";

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[var(--color-brand)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Technical Indicators
          </h3>
        </div>
        <div className={`flex items-center gap-1.5 ${overallColor}`}>
          <OverallIcon size={14} />
          <span className="text-xs font-bold">{indicators.overall}</span>
        </div>
      </div>

      {/* Plain-language read — so a beginner understands the panel without
          knowing what RSI, SMA or MACD mean. The friend's key point: numbers
          alone are useless to most people. */}
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/40">
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <span className="font-semibold text-[var(--color-text-primary)]">In plain words: </span>
          {indicators.overall === "Bullish"
            ? "recent momentum looks positive — the price is mostly trading above its average trend lines, and RSI isn't overheated."
            : indicators.overall === "Bearish"
            ? "recent momentum looks weak — the price is mostly trading below its average trend lines."
            : "signals are mixed — there's no clear short-term direction right now."}
        </p>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1">An educational read of price trends — not financial advice.</p>
      </div>

      {/* RSI Gauge */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-[var(--color-text-muted)]">RSI (14)</span>
          <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">
            {indicators.rsiVal?.toFixed(1) ?? "—"} — {rsiZone}
          </span>
        </div>
        <div className="relative w-full h-2 rounded-full overflow-hidden">
          <div className="absolute inset-0 flex">
            <div className="w-[30%] bg-[var(--color-negative)]/30" />
            <div className="w-[40%] bg-[var(--color-positive)]/20" />
            <div className="w-[30%] bg-[var(--color-negative)]/30" />
          </div>
          {indicators.rsiVal && (
            <div
              className="absolute top-0 h-full w-1 bg-white rounded-full"
              style={{ left: `${Math.min(Math.max(rsiPct, 0), 100)}%` }}
            />
          )}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-[var(--color-negative)]">Oversold</span>
          <span className="text-[9px] text-[var(--color-positive)]">Neutral</span>
          <span className="text-[9px] text-[var(--color-negative)]">Overbought</span>
        </div>
      </div>

      {/* 52-Week Range */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-[var(--color-text-muted)]">52-Week Range</span>
        </div>
        <div className="relative w-full h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
          <div
            className="absolute top-0 h-full w-1.5 bg-[var(--color-brand)] rounded-full"
            style={{
              left: `${
                indicators.high52 - indicators.low52 > 0
                  ? ((currentPrice - indicators.low52) /
                      (indicators.high52 - indicators.low52)) *
                    100
                  : 50
              }%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] tabular-nums text-[var(--color-text-muted)]">
            {formatPrice(indicators.low52)}
          </span>
          <span className="text-[10px] tabular-nums text-[var(--color-text-muted)]">
            {formatPrice(indicators.high52)}
          </span>
        </div>
      </div>

      {/* Indicator Table */}
      <div className="divide-y divide-[var(--color-border)]">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-4 py-2">
            <span className="text-xs text-[var(--color-text-muted)]">{r.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs tabular-nums text-[var(--color-text-secondary)]">
                {r.value}
              </span>
              {signalBadge(r.signal)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
