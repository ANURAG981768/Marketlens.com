"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

export default function PriceChart({ history }: Props) {
  const [range, setRange] = useState<number>(252);
  const data = range >= 99999 ? history : history.slice(-range);

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
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {data.length} trading days
        </span>
        <div className="flex gap-1">
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
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Close"]}
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
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
