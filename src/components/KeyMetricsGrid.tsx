"use client";

import type { StockData } from "@/lib/types";
import { formatRatio, formatPercent, formatCurrency } from "@/lib/format";
import MetricCard from "./MetricCard";
import {
  DollarSign,
  TrendingUp,
  Percent,
  BarChart3,
  Shield,
  Banknote,
} from "lucide-react";

interface Props {
  data: StockData;
}

export default function KeyMetricsGrid({ data }: Props) {
  const { metrics, quote } = data;

  const sections = [
    {
      title: "Valuation",
      icon: <DollarSign size={14} />,
      items: [
        {
          label: "P/E Ratio",
          value: formatRatio(metrics.peRatioTTM),
          sub: metrics.peRatioTTM > 25 ? "Above market avg" : "Below market avg",
        },
        {
          label: "P/S Ratio",
          value: formatRatio(metrics.priceToSalesRatioTTM),
        },
        {
          label: "P/B Ratio",
          value: formatRatio(metrics.pbRatioTTM),
        },
        {
          label: "EV/EBITDA",
          value: formatRatio(metrics.evToEbitdaTTM),
        },
      ],
    },
    {
      title: "Profitability",
      icon: <TrendingUp size={14} />,
      items: [
        {
          label: "ROE",
          value: formatPercent(metrics.returnOnEquityTTM),
          positive: metrics.returnOnEquityTTM > 0,
        },
        {
          label: "ROA",
          value: formatPercent(metrics.returnOnAssetsTTM),
          positive: metrics.returnOnAssetsTTM > 0,
        },
        {
          label: "Earnings Yield",
          value: formatPercent(metrics.earningsYieldTTM),
        },
        {
          label: "FCF Yield",
          value: formatPercent(metrics.freeCashFlowYieldTTM),
        },
      ],
    },
    {
      title: "Financial Health",
      icon: <Shield size={14} />,
      items: [
        {
          label: "Debt/Equity",
          value: formatRatio(metrics.debtToEquityTTM),
          positive: metrics.debtToEquityTTM < 1,
        },
        {
          label: "Current Ratio",
          value: formatRatio(metrics.currentRatioTTM),
          positive: metrics.currentRatioTTM > 1,
        },
        {
          label: "Interest Coverage",
          value: formatRatio(metrics.interestCoverageTTM),
          positive: metrics.interestCoverageTTM > 3,
        },
        {
          label: "Net Debt/EBITDA",
          value: formatRatio(metrics.netDebtToEBITDATTM),
        },
      ],
    },
    {
      title: "Trading",
      icon: <BarChart3 size={14} />,
      items: [
        {
          label: "Market Cap",
          value: formatCurrency(quote.marketCap),
        },
        {
          label: "EPS",
          value: `$${quote.eps.toFixed(2)}`,
        },
        {
          label: "52W Range",
          value: `$${quote.yearLow.toFixed(0)} - $${quote.yearHigh.toFixed(0)}`,
        },
        {
          label: "Avg Volume",
          value: formatCurrency(quote.avgVolume).replace("$", ""),
        },
      ],
    },
    {
      title: "Dividends",
      icon: <Banknote size={14} />,
      items: [
        {
          label: "Dividend Yield",
          value: formatPercent(metrics.dividendYieldTTM),
        },
        {
          label: "Payout Ratio",
          value: formatPercent(metrics.payoutRatioTTM),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--color-brand)]">{section.icon}</span>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {section.title}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {section.items.map((item) => (
              <MetricCard
                key={item.label}
                label={item.label}
                value={item.value}
                sub={"sub" in item ? item.sub : undefined}
                positive={"positive" in item ? item.positive : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
