"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatRatio, formatPercent } from "@/lib/format";

interface PeerData {
  symbol: string;
  isTarget: boolean;
  metrics: Record<string, number>;
}

interface Props {
  peers: PeerData[];
}

const COMPARISONS = [
  { label: "P/E Ratio", key: "peRatioTTM", format: formatRatio },
  { label: "ROE", key: "returnOnEquityTTM", format: formatPercent },
  { label: "P/S Ratio", key: "priceToSalesRatioTTM", format: formatRatio },
  { label: "Debt/Equity", key: "debtToEquityTTM", format: formatRatio },
  { label: "EV/EBITDA", key: "evToEbitdaTTM", format: formatRatio },
  { label: "ROA", key: "returnOnAssetsTTM", format: formatPercent },
] as const;

export default function PeerBarChart({ peers }: Props) {
  const [selected, setSelected] = useState(0);
  const metric = COMPARISONS[selected];

  const data = peers.map((p) => ({
    symbol: p.symbol,
    value: p.metrics[metric.key] ?? 0,
    isTarget: p.isTarget,
  }));

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Peer Benchmark
        </h3>
        <div className="flex flex-wrap gap-1">
          {COMPARISONS.map((c, i) => (
            <button
              key={c.key}
              onClick={() => setSelected(i)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                selected === i
                  ? "bg-[var(--color-brand)] text-white shadow-sm shadow-[var(--color-brand)]/20"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e8e8e8"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#9a9a9a" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => metric.format(v)}
            />
            <YAxis
              type="category"
              dataKey="symbol"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
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
              formatter={(value: any) => [metric.format(Number(value)), metric.label]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isTarget ? "#00c805" : "#d0d0d0"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
