"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  getPaperPortfolio,
  paperBuy,
  paperSell,
  type PaperPortfolio,
} from "@/lib/storage";
import { getUSMarketStatus } from "@/lib/market-hours";

interface Props {
  symbol: string;
  name: string;
  price: number;
}

export default function QuickTrade({ symbol, name, price }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [shares, setShares] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function openBuy() {
    setMode("buy");
    setShares("");
    setError("");
    setSuccess("");
    setOpen(true);
  }

  function openSell() {
    setMode("sell");
    setShares("");
    setError("");
    setSuccess("");
    setOpen(true);
  }

  function execute() {
    setError("");
    const qty = parseInt(shares);
    if (!qty || qty <= 0) {
      setError("Enter a valid number of shares");
      return;
    }
    const market = getUSMarketStatus();
    try {
      // Mirror the Trade tab: orders always fill immediately at the freshest
      // available price (live during the session, last close when shut) so a
      // trade is never silently lost — we just note when the market was closed.
      if (mode === "buy") {
        paperBuy(symbol, name, qty, price);
      } else {
        paperSell(symbol, name, qty, price);
      }
      const total = qty * price;
      setSuccess(
        `${mode === "buy" ? "Bought" : "Sold"} ${qty.toLocaleString()} shares @ $${price.toFixed(2)} = $${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}${market.isOpen ? "" : " · last close (market closed)"}`
      );
      setShares("");
      setTimeout(() => setOpen(false), 2000);
    } catch (e: any) {
      setError(e.message || "Trade failed");
    }
  }

  const portfolio = typeof window !== "undefined" ? getPaperPortfolio() : null;
  const holding = portfolio?.holdings[symbol];
  const qty = parseInt(shares) || 0;
  const total = qty * price;
  const market = open ? getUSMarketStatus() : null;

  return (
    <>
      <button
        onClick={openBuy}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--color-positive)]/10 text-[var(--color-positive)] border border-[var(--color-positive)]/20 hover:bg-[var(--color-positive)]/20 transition-colors"
      >
        <ArrowUpRight size={13} />
        Buy
      </button>
      {holding && (
        <button
          onClick={openSell}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--color-negative)]/10 text-[var(--color-negative)] border border-[var(--color-negative)]/20 hover:bg-[var(--color-negative)]/20 transition-colors"
        >
          <ArrowDownRight size={13} />
          Sell ({holding.shares})
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setOpen(false)}>
          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl p-6 max-w-sm shadow-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  mode === "buy" ? "bg-[var(--color-positive)]/10" : "bg-[var(--color-negative)]/10"
                }`}>
                  {mode === "buy" ? (
                    <ArrowUpRight size={16} className="text-[var(--color-positive)]" />
                  ) : (
                    <ArrowDownRight size={16} className="text-[var(--color-negative)]" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {mode === "buy" ? "Buy" : "Sell"} {symbol}
                  </h3>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{name}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
                <X size={16} />
              </button>
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-lg p-1 mb-4">
              <button
                onClick={() => { setMode("buy"); setError(""); setSuccess(""); }}
                className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${
                  mode === "buy" ? "bg-[var(--color-positive)] text-white" : "text-[var(--color-text-muted)]"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => { setMode("sell"); setError(""); setSuccess(""); }}
                className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${
                  mode === "sell" ? "bg-[var(--color-negative)] text-white" : "text-[var(--color-text-muted)]"
                }`}
              >
                Sell {holding ? `(${holding.shares})` : ""}
              </button>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between text-xs mb-3 px-1">
              <span className="text-[var(--color-text-muted)]">Market Price</span>
              <span className="font-bold tabular-nums">${price.toFixed(2)}</span>
            </div>

            {/* Shares Input */}
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="Number of shares"
              min="1"
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)] tabular-nums mb-2"
              autoFocus
            />

            {/* Quick amounts */}
            <div className="flex items-center gap-1.5 mb-4">
              {[10, 25, 50, 100].map((n) => (
                <button
                  key={n}
                  onClick={() => setShares(n.toString())}
                  className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)]/30 hover:text-[var(--color-brand)] transition-colors"
                >
                  {n}
                </button>
              ))}
              {mode === "sell" && holding && (
                <button
                  onClick={() => setShares(holding.shares.toString())}
                  className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--color-negative)]/10 text-[var(--color-negative)] hover:bg-[var(--color-negative)]/20 transition-colors"
                >
                  All
                </button>
              )}
            </div>

            {/* Summary */}
            {qty > 0 && (
              <div className="flex items-center justify-between text-xs px-3 py-2.5 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] mb-4">
                <span className="text-[var(--color-text-muted)]">
                  {qty.toLocaleString()} × ${price.toFixed(2)}
                </span>
                <span className="font-bold tabular-nums">
                  ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Buying Power */}
            {portfolio && (
              <div className="flex items-center justify-between text-[10px] px-1 mb-4 text-[var(--color-text-muted)]">
                <span>Buying Power</span>
                <span className="tabular-nums">${portfolio.cash.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-negative)]/10 text-xs text-[var(--color-negative)] mb-3">
                <AlertTriangle size={11} /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-positive)]/10 text-xs text-[var(--color-positive)] mb-3">
                <CheckCircle2 size={11} /> {success}
              </div>
            )}

            {market && (
              <div className={`flex items-start gap-2 px-3 py-2 rounded-lg text-[11px] mb-3 ${market.isOpen ? "bg-[var(--color-positive)]/8 text-[var(--color-positive)]" : "bg-[var(--color-surface)] text-[var(--color-text-secondary)]"}`}>
                <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${market.isOpen ? "bg-[var(--color-positive)]" : "bg-[var(--color-text-muted)]"}`} />
                <span><span className="font-semibold">{market.isOpen ? "Market open" : "Market closed"}</span> · {market.detail}</span>
              </div>
            )}

            <button
              onClick={execute}
              className={`w-full py-3 rounded-xl text-white text-sm font-semibold transition-colors ${
                mode === "buy"
                  ? "bg-[var(--color-positive)] hover:bg-emerald-400"
                  : "bg-[var(--color-negative)] hover:bg-red-400"
              }`}
            >
              {`${mode === "buy" ? "Buy" : "Sell"} ${symbol}`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
