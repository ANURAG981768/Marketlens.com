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

// Full EMA series over a chronological (oldest-first) array — one value per
// point from the seed onward (length = prices.length − period + 1).
function emaSeries(chrono: number[], period: number): number[] {
  if (chrono.length < period) return [];
  const k = 2 / (period + 1);
  let e = chrono.slice(0, period).reduce((s, v) => s + v, 0) / period;
  const out = [e];
  for (let i = period; i < chrono.length; i++) {
    e = chrono[i] * k + e * (1 - k);
    out.push(e);
  }
  return out;
}

// MACD (12, 26, 9): the MACD line (EMA12 − EMA26), its 9-period signal line, and
// the histogram. `closes` is newest-first; computed on the chronological series.
function macdCalc(closesNewestFirst: number[]): { macd: number | null; signal: number | null; histogram: number | null } {
  const chrono = [...closesNewestFirst].reverse();
  const e12 = emaSeries(chrono, 12);
  const e26 = emaSeries(chrono, 26);
  if (e12.length === 0 || e26.length === 0) return { macd: null, signal: null, histogram: null };
  const offset = e12.length - e26.length; // e26 starts later; align the tails
  const macdLine: number[] = [];
  for (let i = 0; i < e26.length; i++) macdLine.push(e12[i + offset] - e26[i]);
  const signalLine = emaSeries(macdLine, 9);
  const macd = macdLine.length ? macdLine[macdLine.length - 1] : null;
  const signal = signalLine.length ? signalLine[signalLine.length - 1] : null;
  const histogram = macd !== null && signal !== null ? macd - signal : null;
  return { macd, signal, histogram };
}

// Wilder's RSI — the professional standard used by TradingView, Yahoo Finance,
// etc. It smooths the average gain/loss across the whole series rather than a
// plain average of just the last `period` changes, so our number matches what
// traders see elsewhere. `prices` arrives newest-first, so we walk it
// oldest → newest.
function rsi(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;
  const chrono = [...prices].reverse(); // oldest-first
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = chrono[i] - chrono[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;
  // Wilder smoothing for every later point.
  for (let i = period + 1; i < chrono.length; i++) {
    const change = chrono[i] - chrono[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
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
    const { macd, signal: macdSignal, histogram: macdHist } = macdCalc(closes);
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
    // Proper MACD signal: bullish when the MACD line is above its signal line.
    if (macd !== null && macdSignal !== null) {
      if (macd > macdSignal) signals++;
      else signals--;
    }
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
      macdSignal,
      macdHist,
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
      value:
        indicators.macd !== null && indicators.macdSignal !== null
          ? indicators.macd > indicators.macdSignal
            ? "Above signal"
            : "Below signal"
          : "—",
      signal:
        indicators.macd !== null && indicators.macdSignal !== null
          ? indicators.macd > indicators.macdSignal
          : null,
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
