"use client";

import type { StockData } from "@/lib/types";
import { formatCurrency, formatPercentRaw } from "@/lib/format";
import { TrendingUp, TrendingDown, Building2, Globe, Users } from "lucide-react";

interface Props {
  data: StockData;
}

export default function StockHeader({ data }: Props) {
  const { profile, quote } = data;
  const isPositive = quote.change >= 0;

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              {profile.symbol}
            </h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
              {profile.exchange}
            </span>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm">
            {profile.companyName}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[var(--color-text-muted)] pt-1">
            <span className="flex items-center gap-1.5">
              <Building2 size={13} /> {profile.sector} &middot;{" "}
              {profile.industry}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe size={13} /> {profile.country}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={13} />{" "}
              {Number(profile.fullTimeEmployees).toLocaleString()} employees
            </span>
          </div>
        </div>

        <div className="text-right space-y-1">
          <p className="text-3xl font-bold tabular-nums tracking-tight">
            ${quote.price.toFixed(2)}
          </p>
          <div
            className={`flex items-center justify-end gap-1.5 text-sm font-medium ${
              isPositive
                ? "text-[var(--color-positive)]"
                : "text-[var(--color-negative)]"
            }`}
          >
            {isPositive ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            <span>
              {isPositive ? "+" : ""}
              {quote.change.toFixed(2)} ({formatPercentRaw(quote.changesPercentage)})
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Mkt Cap: {formatCurrency(quote.marketCap)}
          </p>
        </div>
      </div>
    </div>
  );
}
