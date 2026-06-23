"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { IncomeStatement } from "@/lib/types";

interface Props {
  income: IncomeStatement[];
}

export default function MarginTrend({ income }: Props) {
  const data = [...income].reverse().map((row) => ({
    year: row.calendarYear,
    gross: +(row.grossProfitRatio * 100).toFixed(2),
    operating: +(row.operatingIncomeRatio * 100).toFixed(2),
    net: +(row.netIncomeRatio * 100).toFixed(2),
  }));

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Margin Trends
        </h3>
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded bg-[var(--color-gold)]" />
            Gross
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded bg-[var(--color-brand)]" />
            Operating
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded bg-emerald-300" />
            Net
          </span>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e8e8e8"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9a9a9a" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
              width={45}
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
              formatter={(value: any, name: any) => [
                `${Number(value).toFixed(2)}%`,
                name === "gross"
                  ? "Gross Margin"
                  : name === "operating"
                  ? "Operating Margin"
                  : "Net Margin",
              ]}
            />
            <Line
              type="monotone"
              dataKey="gross"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ fill: "#f59e0b", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="operating"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="#6ee7b7"
              strokeWidth={2.5}
              dot={{ fill: "#6ee7b7", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
