"use client";

import { useState, useEffect, useCallback } from "react";
import { Briefcase, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { getPaperPortfolio, type PaperPortfolio } from "@/lib/storage";
import { formatCurrency, formatPrice } from "@/lib/format";
import CompanyLogo from "./CompanyLogo";

interface Props {
  onSelect: (symbol: string) => void;
  refreshKey: number;
  onStartTrading?: () => void;
}

// Whole numbers for stocks, trimmed fractions for crypto/forex.
function fmtQty(q: number): string {
  if (!Number.isFinite(q)) return "0";
  return Number.isInteger(q) ? q.toLocaleString() : q.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

// The Portfolio tab now mirrors the ONE source of truth — your paper-trading
// account — so anything you buy (stocks, crypto, fractional) shows up here with
// live value, P&L and today's change. Previously this read a separate manual
// list, so paper trades never appeared.
export default function PortfolioPanel({ onSelect, refreshKey, onStartTrading }: Props) {
  const [portfolio, setPortfolio] = useState<PaperPortfolio | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [changes, setChanges] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    const p = getPaperPortfolio();
    setPortfolio(p);
    const symbols = Object.keys(p.holdings);
    if (symbols.length === 0) return;
    const np: Record<string, number> = {};
    const nc: Record<string, number> = {};
    await Promise.all(
      symbols.map(async (sym) => {
        try {
          const r = await fetch(`/api/quote?symbol=${encodeURIComponent(sym)}`);
          const j = await r.json();
          if (typeof j.price === "number" && j.price > 0) np[sym] = j.price;
          if (typeof j.change === "number") nc[sym] = j.change;
        } catch {}
      })
    );
    setPrices((prev) => ({ ...prev, ...np }));
    setChanges((prev) => ({ ...prev, ...nc }));
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  // Keep value fresh while you watch.
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  if (!portfolio) return null;

  const entries = Object.entries(portfolio.holdings);
  const holdingsValue = entries.reduce((s, [sym, h]) => s + h.shares * (prices[sym] || h.avgCost), 0);
  const totalValue = portfolio.cash + holdingsValue;
  const totalReturn = totalValue - portfolio.startingBalance;
  const totalReturnPct = portfolio.startingBalance > 0 ? (totalReturn / portfolio.startingBalance) * 100 : 0;
  const todayChange = entries.reduce((s, [sym, h]) => s + h.shares * (changes[sym] ?? 0), 0);
  const priorVal = holdingsValue - todayChange;
  const todayPct = priorVal > 0 ? (todayChange / priorVal) * 100 : 0;
  const hasToday = entries.some(([sym]) => sym in changes);

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      {/* Account summary */}
      <div className="px-5 py-5 border-b border-[var(--color-border)]">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)] font-semibold mb-1.5">Portfolio value</p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight leading-none">
          {formatCurrency(totalValue)}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${totalReturn >= 0 ? "bg-[var(--color-positive)]/10 text-[var(--color-positive)]" : "bg-[var(--color-negative)]/10 text-[var(--color-negative)]"}`}>
            {totalReturn >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {totalReturn >= 0 ? "+" : ""}{formatCurrency(Math.abs(totalReturn))} ({totalReturn >= 0 ? "+" : ""}{totalReturnPct.toFixed(2)}%)
            <span className="font-normal opacity-70">· all time</span>
          </span>
          {hasToday && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${todayChange >= 0 ? "bg-[var(--color-positive)]/10 text-[var(--color-positive)]" : "bg-[var(--color-negative)]/10 text-[var(--color-negative)]"}`}>
              {todayChange >= 0 ? "+" : ""}{formatCurrency(Math.abs(todayChange))} ({todayChange >= 0 ? "+" : ""}{todayPct.toFixed(2)}%)
              <span className="font-normal opacity-70">· today</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-5 mt-4 text-xs">
          <div>
            <span className="text-[var(--color-text-muted)]">Cash</span>{" "}
            <span className="font-semibold tabular-nums">{formatCurrency(portfolio.cash)}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Holdings</span>{" "}
            <span className="font-semibold tabular-nums">{formatCurrency(holdingsValue)}</span>
          </div>
        </div>
      </div>

      {/* Positions */}
      {entries.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand)]/10 flex items-center justify-center mx-auto mb-3">
            <Briefcase size={22} className="text-[var(--color-brand)]" />
          </div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">No positions yet</p>
          <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto mb-4">
            Buy your first stock, ETF, or crypto in the Trade tab — it&apos;ll show up here with live value and profit/loss.
          </p>
          {onStartTrading && (
            <button
              onClick={onStartTrading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--color-brand)] text-white text-xs font-semibold hover:bg-[var(--color-brand-light)] transition-colors"
            >
              Start trading <ArrowRight size={13} />
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-border)]">
          {entries.map(([sym, h]) => {
            const price = prices[sym] || h.avgCost;
            const marketValue = h.shares * price;
            const costBasis = h.shares * h.avgCost;
            const pl = marketValue - costBasis;
            const plPct = costBasis > 0 ? (pl / costBasis) * 100 : 0;
            const weight = totalValue > 0 ? (marketValue / totalValue) * 100 : 0;
            return (
              <button
                key={sym}
                onClick={() => onSelect(sym)}
                className="w-full text-left px-5 py-3 hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CompanyLogo symbol={sym} size={28} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">{sym}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate">{fmtQty(h.shares)} @ {formatPrice(h.avgCost)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(marketValue)}</p>
                    <p className={`text-[11px] font-semibold tabular-nums ${pl >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
                      {pl >= 0 ? "+" : ""}{formatCurrency(Math.abs(pl))} ({plPct >= 0 ? "+" : ""}{plPct.toFixed(1)}%)
                    </p>
                  </div>
                </div>
                <div className="w-full h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--color-brand)]" style={{ width: `${Math.min(weight, 100)}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
