"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { IncomeStatement } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface Props {
  income: IncomeStatement[];
}

export default function RevenueChart({ income }: Props) {
  const data = [...income].reverse().map((row) => ({
    year: row.calendarYear,
    revenue: row.revenue,
    netIncome: row.netIncome,
    grossProfit: row.grossProfit,
  }));

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Revenue & Profitability
        </h3>
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-gold)]" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-positive)]" />
            Net Income
          </span>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e8e8e8"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: "#8b90a0" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9a9a9a" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatCurrency(v)}
              width={65}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#1a1a1a",
              }}
              formatter={(value: any, name: any) => [
                formatCurrency(Number(value)),
                name === "revenue" ? "Revenue" : "Net Income",
              ]}
            />
            <Bar
              dataKey="revenue"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="netIncome"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
