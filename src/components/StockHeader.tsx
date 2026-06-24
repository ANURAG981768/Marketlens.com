"use client";

import type { StockData } from "@/lib/types";
import { formatCurrency, formatPercentRaw, formatPrice } from "@/lib/format";
import { TrendingUp, TrendingDown, Building2, Globe, Users } from "lucide-react";
import CompanyLogo from "./CompanyLogo";

interface Props {
  data: StockData;
}

export default function StockHeader({ data }: Props) {
  const { profile, quote } = data;
  const isPositive = quote.change >= 0;
  const employees = Number(profile.fullTimeEmployees);

  const chips = [
    { icon: Building2, text: profile.industry && profile.industry !== "—" ? `${profile.sector} · ${profile.industry}` : profile.sector },
    { icon: Globe, text: profile.country },
    employees ? { icon: Users, text: `${employees.toLocaleString()} employees` } : null,
  ].filter(Boolean) as { icon: typeof Globe; text: string }[];

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Identity */}
        <div className="min-w-0">
          <div className="flex items-center gap-3.5 mb-3">
            <CompanyLogo symbol={profile.symbol} size={48} className="shadow-sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-3xl font-semibold tracking-tight leading-none">
                  {profile.symbol}
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md bg-[var(--color-brand)]/10 text-[var(--color-brand-dim)]">
                  {profile.exchange}
                </span>
              </div>
              <p className="text-[var(--color-text-secondary)] text-sm mt-1.5 truncate max-w-xs sm:max-w-md">
                {profile.companyName}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-2.5 py-1"
              >
                <c.icon size={12} className="text-[var(--color-text-muted)]" />
                {c.text}
              </span>
            ))}
          </div>
        </div>

        {/* Price block */}
        <div className="md:text-right shrink-0">
          <p className="font-display text-4xl sm:text-5xl font-semibold tabular-nums tracking-tight leading-none">
            {formatPrice(quote.price)}
          </p>
          <div className="mt-3 md:flex md:justify-end">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${
                isPositive
                  ? "bg-[var(--color-positive)]/10 text-[var(--color-positive)]"
                  : "bg-[var(--color-negative)]/10 text-[var(--color-negative)]"
              }`}
            >
              {isPositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {isPositive ? "+" : ""}
              {quote.change.toFixed(2)} ({formatPercentRaw(quote.changesPercentage)})
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-3">
            Market cap{" "}
            <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">
              {formatCurrency(quote.marketCap)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
