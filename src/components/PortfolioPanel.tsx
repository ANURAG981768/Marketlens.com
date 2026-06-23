"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  X,
  TrendingUp,
  TrendingDown,
  PieChart,
} from "lucide-react";
import {
  getPortfolio,
  removeFromPortfolio,
  type PortfolioHolding,
} from "@/lib/storage";
import { formatCurrency } from "@/lib/format";

interface Props {
  onSelect: (symbol: string) => void;
  refreshKey: number;
  currentPrices?: Record<string, number>;
}

export default function PortfolioPanel({
  onSelect,
  refreshKey,
  currentPrices = {},
}: Props) {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);

  useEffect(() => {
    setHoldings(getPortfolio());
  }, [refreshKey]);

  function handleRemove(symbol: string) {
    const updated = removeFromPortfolio(symbol);
    setHoldings(updated);
  }

  if (!holdings.length) return null;

  const totalCost = holdings.reduce(
    (sum, h) => sum + h.shares * h.avgCost,
    0
  );
  const totalValue = holdings.reduce((sum, h) => {
    const price = currentPrices[h.symbol] ?? h.avgCost;
    return sum + h.shares * price;
  }, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="text-[var(--color-brand)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Portfolio
          </h3>
          <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface)] px-1.5 py-0.5 rounded-full">
            {holdings.length}
          </span>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="px-4 py-3 bg-[var(--color-surface)]/40 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[var(--color-text-muted)]">
            Total Value
          </span>
          <span className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
            {formatCurrency(totalValue)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-muted)]">
            Total P&L
          </span>
          <span
            className={`text-xs font-semibold tabular-nums flex items-center gap-1 ${
              totalPL >= 0
                ? "text-[var(--color-positive)]"
                : "text-[var(--color-negative)]"
            }`}
          >
            {totalPL >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {totalPL >= 0 ? "+" : ""}
            {formatCurrency(Math.abs(totalPL))} ({totalPLPct >= 0 ? "+" : ""}
            {totalPLPct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Holdings */}
      <div className="divide-y divide-[var(--color-border)]">
        {holdings.map((h) => {
          const currentPrice = currentPrices[h.symbol] ?? h.avgCost;
          const marketValue = h.shares * currentPrice;
          const costBasis = h.shares * h.avgCost;
          const pl = marketValue - costBasis;
          const plPct = costBasis > 0 ? (pl / costBasis) * 100 : 0;
          const weight = totalValue > 0 ? (marketValue / totalValue) * 100 : 0;

          return (
            <div
              key={h.symbol}
              className="px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors group cursor-pointer"
              onClick={() => onSelect(h.symbol)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    {h.symbol}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {h.shares} shares @ ${h.avgCost.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(h.symbol);
                  }}
                  className="p-1 opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-negative)] transition-all"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-[var(--color-text-muted)]">
                    Value: {formatCurrency(marketValue)}
                  </span>
                  <span className="text-[var(--color-text-muted)]">
                    {weight.toFixed(1)}% of portfolio
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold tabular-nums ${
                    pl >= 0
                      ? "text-[var(--color-positive)]"
                      : "text-[var(--color-negative)]"
                  }`}
                >
                  {pl >= 0 ? "+" : ""}${Math.abs(pl).toFixed(2)} (
                  {plPct >= 0 ? "+" : ""}
                  {plPct.toFixed(1)}%)
                </span>
              </div>
              {/* Weight bar */}
              <div className="mt-1.5 w-full h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-brand)]"
                  style={{ width: `${Math.min(weight, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
