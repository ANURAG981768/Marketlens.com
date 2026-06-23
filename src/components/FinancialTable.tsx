"use client";

import type { IncomeStatement } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/format";

interface Props {
  income: IncomeStatement[];
}

export default function FinancialTable({ income }: Props) {
  const data = [...income].reverse();

  const rows = [
    {
      label: "Revenue",
      values: data.map((d) => d.revenue),
      format: formatCurrency,
    },
    {
      label: "Cost of Revenue",
      values: data.map((d) => d.costOfRevenue),
      format: formatCurrency,
    },
    {
      label: "Gross Profit",
      values: data.map((d) => d.grossProfit),
      format: formatCurrency,
      bold: true,
    },
    {
      label: "Gross Margin",
      values: data.map((d) => d.grossProfitRatio),
      format: formatPercent,
      isPercent: true,
    },
    {
      label: "Operating Expenses",
      values: data.map((d) => d.operatingExpenses),
      format: formatCurrency,
    },
    {
      label: "Operating Income",
      values: data.map((d) => d.operatingIncome),
      format: formatCurrency,
      bold: true,
    },
    {
      label: "Operating Margin",
      values: data.map((d) => d.operatingIncomeRatio),
      format: formatPercent,
      isPercent: true,
    },
    {
      label: "Net Income",
      values: data.map((d) => d.netIncome),
      format: formatCurrency,
      bold: true,
    },
    {
      label: "Net Margin",
      values: data.map((d) => d.netIncomeRatio),
      format: formatPercent,
      isPercent: true,
    },
    {
      label: "EBITDA",
      values: data.map((d) => d.ebitda),
      format: formatCurrency,
    },
    {
      label: "EPS (Diluted)",
      values: data.map((d) => d.epsdiluted),
      format: (v: number) => `$${v.toFixed(2)}`,
    },
  ];

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-5 border-b border-[var(--color-border)]">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Income Statement (Annual)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-3 px-5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Metric
              </th>
              {data.map((d) => (
                <th
                  key={d.calendarYear}
                  className="text-right py-3 px-5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider"
                >
                  FY {d.calendarYear}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.label}
                className={`border-b border-[var(--color-border)] last:border-b-0 ${
                  row.isPercent
                    ? "bg-[var(--color-surface)]/40"
                    : ""
                } hover:bg-[var(--color-surface-hover)] transition-colors`}
              >
                <td
                  className={`py-2.5 px-5 text-[var(--color-text-secondary)] ${
                    row.bold ? "font-semibold text-[var(--color-text-primary)]" : ""
                  }`}
                >
                  {row.label}
                </td>
                {row.values.map((v, j) => (
                  <td
                    key={j}
                    className={`py-2.5 px-5 text-right tabular-nums ${
                      row.bold
                        ? "font-semibold text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {row.format(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
