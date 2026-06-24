"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { HistoricalPrice } from "@/lib/types";

interface Props {
  history: HistoricalPrice[];
}

const RANGES = [
  { label: "1M", days: 22 },
  { label: "3M", days: 66 },
  { label: "6M", days: 132 },
  { label: "1Y", days: 252 },
  { label: "2Y", days: 504 },
  { label: "5Y", days: 1260 },
  { label: "MAX", days: 99999 },
] as const;

// Trailing simple moving average over the close series.
function trailingSMA(closes: number[], i: number, period: number): number | null {
  if (i < period - 1) return null;
  let sum = 0;
  for (let k = i - period + 1; k <= i; k++) sum += closes[k];
  return sum / period;
}

export default function PriceChart({ history }: Props) {
  const [range, setRange] = useState<number>(252);
  const [showMA, setShowMA] = useState(true);

  // Compute moving averages over the FULL history (so they're accurate at the
  // left edge of whatever window is shown), then slice to the selected range.
  const withMA = useMemo(() => {
    const closes = history.map((d) => d.close);
    return history.map((d, i) => ({
      ...d,
      sma50: trailingSMA(closes, i, 50),
      sma200: trailingSMA(closes, i, 200),
    }));
  }, [history]);

  const data = range >= 99999 ? withMA : withMA.slice(-range);

  const prices = data.map((d) => d.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.08;

  const first = data[0]?.close ?? 0;
  const last = data[data.length - 1]?.close ?? 0;
  const isPositive = last >= first;
  const changePct = first > 0 ? ((last - first) / first) * 100 : 0;

  const lineColor = isPositive ? "#00c805" : "#ff5000";
  const gradientColor = isPositive ? "#00c805" : "#ff5000";

  // Plain-language trend read for non-experts: where does the price sit relative
  // to its 50-day average? Above = recent momentum up, below = down.
  const sma50Last = data[data.length - 1]?.sma50 ?? null;
  const trend =
    sma50Last == null
      ? null
      : last >= sma50Last
      ? { up: true, text: "Trading above its 50-day average — recent trend is upward" }
      : { up: false, text: "Trading below its 50-day average — recent trend is downward" };

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Price History
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold tabular-nums ${
              isPositive ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
            }`}
          >
            {isPositive ? "+" : ""}
            {changePct.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {data.length} trading days
        </span>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setShowMA((v) => !v)}
            className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${
              showMA
                ? "bg-[var(--color-ink)] text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
            }`}
            title="Show 50-day and 200-day average trend lines"
          >
            Trend lines
          </button>
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.days)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${
                range === r.days
                  ? "bg-[var(--color-brand)] text-white shadow-sm shadow-[var(--color-brand)]/20"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plain-language trend read — so a non-expert understands the chart at a
          glance without needing to interpret indicator numbers. */}
      {trend && (
        <div className="flex items-center gap-2 mb-4 text-[11px]">
          <span className={`inline-block w-2 h-2 rounded-full ${trend.up ? "bg-[var(--color-positive)]" : "bg-[var(--color-negative)]"}`} />
          <span className="text-[var(--color-text-secondary)]">{trend.text}</span>
        </div>
      )}

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={gradientColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e8e8e8"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#9a9a9a" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(d: string) => {
                const date = new Date(d);
                if (range > 504) {
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit",
                  });
                }
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis
              domain={[min - pad, max + pad]}
              tick={{ fontSize: 10, fill: "#9a9a9a" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v.toFixed(0)}`}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e8e8e8",
                borderRadius: "10px",
                fontSize: "12px",
                color: "#1a1a1a",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              }}
              formatter={(value: any, name: any) => {
                const label = name === "sma50" ? "50-day avg" : name === "sma200" ? "200-day avg" : "Close";
                return [`$${Number(value).toFixed(2)}`, label];
              }}
              labelFormatter={(label: any) =>
                new Date(label).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={lineColor}
              strokeWidth={1.5}
              fill="url(#priceGradient)"
              dot={false}
            />
            {showMA && (
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#2563eb"
                strokeWidth={1.5}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}
            {showMA && (
              <Line
                type="monotone"
                dataKey="sma200"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend for the trend lines — kept simple and labeled in plain words. */}
      {showMA && (
        <div className="flex items-center gap-4 mt-3 text-[10px] text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded" style={{ background: lineColor }} /> Price</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded" style={{ background: "#2563eb" }} /> 50-day average</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded" style={{ background: "#f59e0b" }} /> 200-day average</span>
        </div>
      )}
    </div>
  );
}
