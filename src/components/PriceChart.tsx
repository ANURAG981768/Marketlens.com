"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { HistoricalPrice } from "@/lib/types";

interface Props {
  history: HistoricalPrice[];
  symbol?: string;
}

type RangeDef = { label: string; key: string; days?: number; intraday?: boolean };

const RANGES: RangeDef[] = [
  { label: "1D", key: "1d", intraday: true },
  { label: "5D", key: "5d", intraday: true },
  { label: "1M", key: "1m", days: 22 },
  { label: "6M", key: "6m", days: 132 },
  { label: "1Y", key: "1y", days: 252 },
  { label: "5Y", key: "5y", days: 1260 },
  { label: "MAX", key: "max", days: 99999 },
];

function trailingSMA(closes: number[], i: number, period: number): number | null {
  if (i < period - 1) return null;
  let sum = 0;
  for (let k = i - period + 1; k <= i; k++) sum += closes[k];
  return sum / period;
}

type Point = { date: string; close: number; sma50?: number | null; sma200?: number | null };

export default function PriceChart({ history, symbol }: Props) {
  const [rangeKey, setRangeKey] = useState<string>("1y");
  const [showMA, setShowMA] = useState(true);
  const [intraday, setIntraday] = useState<{ key: string; points: Point[]; previousClose: number } | null>(null);
  const [loadingIntraday, setLoadingIntraday] = useState(false);

  const activeRange = RANGES.find((r) => r.key === rangeKey) ?? RANGES[4];
  const isIntraday = !!activeRange.intraday;

  // Daily moving averages over the full history, then sliced to range.
  const withMA = useMemo<Point[]>(() => {
    const closes = history.map((d) => d.close);
    return history.map((d, i) => ({
      date: d.date,
      close: d.close,
      sma50: trailingSMA(closes, i, 50),
      sma200: trailingSMA(closes, i, 200),
    }));
  }, [history]);

  // Fetch intraday data on demand when a 1D/5D range is selected.
  useEffect(() => {
    if (!isIntraday || !symbol) return;
    if (intraday?.key === rangeKey) return;
    let cancelled = false;
    setLoadingIntraday(true);
    fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&range=${rangeKey}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const points: Point[] = (json.points ?? []).map((p: { t: number; close: number }) => ({
          date: new Date(p.t).toISOString(),
          close: p.close,
        }));
        setIntraday({ key: rangeKey, points, previousClose: json.previousClose ?? 0 });
      })
      .catch(() => { if (!cancelled) setIntraday({ key: rangeKey, points: [], previousClose: 0 }); })
      .finally(() => { if (!cancelled) setLoadingIntraday(false); });
    return () => { cancelled = true; };
  }, [isIntraday, symbol, rangeKey, intraday?.key]);

  const data: Point[] = isIntraday
    ? (intraday?.key === rangeKey ? intraday.points : [])
    : activeRange.days! >= 99999
    ? withMA
    : withMA.slice(-activeRange.days!);

  const prices = data.map((d) => d.close);
  const intradayPrevClose = isIntraday ? (intraday?.previousClose ?? 0) : 0;
  // Include the previous-close baseline in the domain for 1D so it's visible.
  const domainVals = isIntraday && rangeKey === "1d" && intradayPrevClose > 0 ? [...prices, intradayPrevClose] : prices;
  const min = domainVals.length ? Math.min(...domainVals) : 0;
  const max = domainVals.length ? Math.max(...domainVals) : 0;
  const pad = (max - min) * 0.08 || 1;

  const first = data[0]?.close ?? 0;
  const last = data[data.length - 1]?.close ?? 0;
  // 1D change is measured against the prior session's close (the standard
  // "today" change); other ranges measure from the first visible point.
  const refPrice = isIntraday && rangeKey === "1d" && intradayPrevClose > 0 ? intradayPrevClose : first;
  const isPositive = last >= refPrice;
  const changePct = refPrice > 0 ? ((last - refPrice) / refPrice) * 100 : 0;
  const changeAbs = last - refPrice;

  const lineColor = isPositive ? "#00c805" : "#ff5000";
  const gradientColor = isPositive ? "#00c805" : "#ff5000";

  const sma50Last = data[data.length - 1]?.sma50 ?? null;
  const trend =
    isIntraday || sma50Last == null
      ? null
      : last >= sma50Last
      ? { up: true, text: "Trading above its 50-day average — recent trend is upward" }
      : { up: false, text: "Trading below its 50-day average — recent trend is downward" };

  const formatX = (d: string) => {
    const date = new Date(d);
    if (rangeKey === "1d") return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    if (rangeKey === "5d") return date.toLocaleDateString("en-US", { weekday: "short" });
    if (activeRange.days && activeRange.days > 504) return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Price History</h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold tabular-nums ${isPositive ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
            {isPositive ? "+" : ""}{changeAbs.toFixed(2)} ({isPositive ? "+" : ""}{changePct.toFixed(2)}%)
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {isIntraday ? (rangeKey === "1d" ? "Today, intraday" : "Last 5 days") : `${data.length} trading days`}
        </span>
        <div className="flex gap-1 flex-wrap">
          {!isIntraday && (
            <button
              onClick={() => setShowMA((v) => !v)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${showMA ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"}`}
              title="Show 50-day and 200-day average trend lines"
            >
              Trend lines
            </button>
          )}
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRangeKey(r.key)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${rangeKey === r.key ? "bg-[var(--color-brand)] text-white shadow-sm shadow-[var(--color-brand)]/20" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-2 mb-4 text-[11px]">
          <span className={`inline-block w-2 h-2 rounded-full ${trend.up ? "bg-[var(--color-positive)]" : "bg-[var(--color-negative)]"}`} />
          <span className="text-[var(--color-text-secondary)]">{trend.text}</span>
        </div>
      )}

      <div className="h-[320px]">
        {loadingIntraday && data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)]">
            No intraday data right now (market may be closed).
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={gradientColor} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={gradientColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9a9a9a" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatX}
                interval={Math.floor(data.length / 6)}
                minTickGap={20}
              />
              <YAxis
                domain={[min - pad, max + pad]}
                tick={{ fontSize: 10, fill: "#9a9a9a" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${v < 10 ? v.toFixed(2) : v.toFixed(0)}`}
                width={55}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "10px", fontSize: "12px", color: "#1a1a1a", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                formatter={(value: any, name: any) => {
                  const label = name === "sma50" ? "50-day avg" : name === "sma200" ? "200-day avg" : "Price";
                  return [`$${Number(value).toFixed(2)}`, label];
                }}
                labelFormatter={(label: any) => {
                  const date = new Date(label);
                  return rangeKey === "1d" || rangeKey === "5d"
                    ? date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                    : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
                }}
              />
              {isIntraday && rangeKey === "1d" && intradayPrevClose > 0 && (
                <ReferenceLine y={intradayPrevClose} stroke="#9a9a9a" strokeDasharray="4 4" strokeWidth={1} />
              )}
              <Area type="monotone" dataKey="close" stroke={lineColor} strokeWidth={1.5} fill="url(#priceGradient)" dot={false} isAnimationActive={false} />
              {showMA && !isIntraday && (
                <Line type="monotone" dataKey="sma50" stroke="#2563eb" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
              )}
              {showMA && !isIntraday && (
                <Line type="monotone" dataKey="sma200" stroke="#f59e0b" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {showMA && !isIntraday && (
        <div className="flex items-center gap-4 mt-3 text-[10px] text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded" style={{ background: lineColor }} /> Price</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded" style={{ background: "#2563eb" }} /> 50-day average</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded" style={{ background: "#f59e0b" }} /> 200-day average</span>
        </div>
      )}
      {isIntraday && rangeKey === "1d" && intradayPrevClose > 0 && data.length > 0 && (
        <div className="flex items-center gap-2 mt-3 text-[10px] text-[var(--color-text-muted)]">
          <span className="w-3 border-t border-dashed border-[#9a9a9a]" /> Previous close ${intradayPrevClose.toFixed(2)}
        </div>
      )}
    </div>
  );
}
