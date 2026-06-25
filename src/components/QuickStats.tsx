"use client";

import type { StockData } from "@/lib/types";
import { formatCurrency, formatPrice } from "@/lib/format";

interface Props {
  data: StockData;
}

export default function QuickStats({ data }: Props) {
  const { quote } = data;

  const stats = [
    { label: "Open", value: formatPrice(quote.open) },
    { label: "Previous Close", value: formatPrice(quote.previousClose) },
    { label: "Day Range", value: `${formatPrice(quote.dayLow)} – ${formatPrice(quote.dayHigh)}` },
    { label: "52W Range", value: `${formatPrice(quote.yearLow)} – ${formatPrice(quote.yearHigh)}` },
    { label: "Volume", value: formatCurrency(quote.volume).replace("$", "") },
    { label: "Avg Volume", value: formatCurrency(quote.avgVolume).replace("$", "") },
    { label: "P/E", value: quote.pe?.toFixed(2) ?? "N/A" },
    { label: "EPS", value: `$${quote.eps?.toFixed(2) ?? "N/A"}` },
  ];

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
        Trading Summary
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] last:border-b-0"
          >
            <span className="text-xs text-[var(--color-text-muted)]">
              {stat.label}
            </span>
            <span className="text-xs font-medium tabular-nums text-[var(--color-text-secondary)]">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
