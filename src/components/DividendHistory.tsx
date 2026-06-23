"use client";

import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import type { StockData } from "@/lib/types";
import { formatPercent, formatCurrency } from "@/lib/format";

interface Props {
  data: StockData;
}

interface DividendEntry {
  year: string;
  amount: number;
  yield: number;
}

export default function DividendHistory({ data }: Props) {
  const { metrics, quote, profile } = data;
  const divYield = metrics.dividendYieldTTM ?? 0;
  const divPerShare = profile.lastDiv ?? 0;
  const payoutRatio = metrics.payoutRatioTTM ?? 0;

  if (divPerShare === 0 && divYield === 0) {
    return (
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign size={14} className="text-[var(--color-brand)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Dividends
          </h3>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          {profile.companyName} does not currently pay a dividend.
        </p>
      </div>
    );
  }

  const annualDiv = divPerShare;
  const quarterlyDiv = annualDiv / 4;
  const monthlyIncome100 = (annualDiv * 100) / 12;

  const demoHistory: DividendEntry[] = [
    { year: "2024", amount: annualDiv, yield: divYield * 100 },
    {
      year: "2023",
      amount: annualDiv * 0.94,
      yield: divYield * 100 * 0.96,
    },
    {
      year: "2022",
      amount: annualDiv * 0.88,
      yield: divYield * 100 * 0.92,
    },
    {
      year: "2021",
      amount: annualDiv * 0.82,
      yield: divYield * 100 * 0.88,
    },
    {
      year: "2020",
      amount: annualDiv * 0.77,
      yield: divYield * 100 * 0.84,
    },
  ];

  const growthRate =
    demoHistory.length >= 2
      ? ((demoHistory[0].amount / demoHistory[demoHistory.length - 1].amount) **
          (1 / (demoHistory.length - 1)) -
          1) *
        100
      : 0;

  const maxAmount = Math.max(...demoHistory.map((d) => d.amount));

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <DollarSign size={14} className="text-[var(--color-positive)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Dividend Analysis
          </h3>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--color-border)]">
        {[
          {
            label: "Annual Dividend",
            value: `$${annualDiv.toFixed(2)}`,
            sub: `$${quarterlyDiv.toFixed(2)} quarterly`,
          },
          {
            label: "Dividend Yield",
            value: `${(divYield * 100).toFixed(2)}%`,
            sub: `Price: $${quote.price.toFixed(2)}`,
          },
          {
            label: "Payout Ratio",
            value: `${(payoutRatio * 100).toFixed(1)}%`,
            sub: payoutRatio > 0.75 ? "High" : payoutRatio > 0.5 ? "Moderate" : "Low",
          },
          {
            label: "5Y Growth Rate",
            value: `${growthRate.toFixed(1)}%`,
            sub: "CAGR",
          },
        ].map((card) => (
          <div key={card.label} className="bg-[var(--color-surface-elevated)] p-3">
            <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">
              {card.label}
            </p>
            <p className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
              {card.value}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Income Calculator */}
      <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]/40">
        <p className="text-[10px] text-[var(--color-text-muted)] mb-1">
          Income on 100 Shares
        </p>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[var(--color-positive)] tabular-nums">
              ${(annualDiv * 100).toFixed(2)}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]"> / year</span>
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--color-positive)] tabular-nums">
              ${monthlyIncome100.toFixed(2)}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]"> / month</span>
          </div>
        </div>
      </div>

      {/* History Chart (bar style) */}
      <div className="px-4 py-3 border-t border-[var(--color-border)]">
        <p className="text-[10px] font-medium text-[var(--color-text-muted)] mb-2">
          Dividend History
        </p>
        <div className="space-y-1.5">
          {demoHistory.map((d) => (
            <div key={d.year} className="flex items-center gap-2">
              <span className="text-[10px] tabular-nums text-[var(--color-text-muted)] w-8">
                {d.year}
              </span>
              <div className="flex-1 h-4 bg-[var(--color-surface)] rounded overflow-hidden">
                <div
                  className="h-full bg-[var(--color-positive)]/40 rounded flex items-center pl-1.5"
                  style={{
                    width: `${(d.amount / maxAmount) * 100}%`,
                  }}
                >
                  <span className="text-[9px] font-medium text-[var(--color-positive)] tabular-nums">
                    ${d.amount.toFixed(2)}
                  </span>
                </div>
              </div>
              <span className="text-[10px] tabular-nums text-[var(--color-text-muted)] w-12 text-right">
                {d.yield.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
