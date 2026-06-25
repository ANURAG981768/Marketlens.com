"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  getPaperPortfolio,
  paperBuy,
  paperSell,
  type PaperPortfolio,
} from "@/lib/storage";
import { getMarketStatus, classifyInstrument } from "@/lib/market-hours";
import { formatCurrency, formatPrice } from "@/lib/format";
import CompanyLogo from "./CompanyLogo";
import Modal from "./Modal";

interface Props {
  onSelect: (symbol: string) => void;
  refreshKey: number;
  onStartTrading?: () => void;
  onTraded?: () => void;
}

// Whole numbers for stocks, trimmed fractions for crypto/forex.
function fmtQty(q: number): string {
  if (!Number.isFinite(q)) return "0";
  return Number.isInteger(q) ? q.toLocaleString() : q.toLocaleString("en-US", { maximumFractionDigits: 8 });
}

// Round a fractional quantity down to 8 dp so an estimate never *exceeds* the
// cash/holding it was derived from (avoids "insufficient funds" by a rounding hair).
function trimUnits(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n * 1e8) / 1e8;
}

// The Portfolio tab mirrors the ONE source of truth — your paper-trading
// account — so anything you buy (stocks, crypto, fractional) shows up here with
// live value, P&L and today's change. You can also Buy more / Sell any position
// right from the list (a fresh live quote is pulled the moment you open a
// ticket, so you always trade at the current price).
export default function PortfolioPanel({ onSelect, refreshKey, onStartTrading, onTraded }: Props) {
  const [portfolio, setPortfolio] = useState<PaperPortfolio | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [loadError, setLoadError] = useState(false);
  // The position being traded from the list (null = ticket closed).
  const [ticket, setTicket] = useState<{ symbol: string; name: string; shares: number; avgCost: number; mode: "buy" | "sell" } | null>(null);

  const load = useCallback(async () => {
    let p: PaperPortfolio;
    try {
      p = getPaperPortfolio();
      setLoadError(false);
    } catch {
      // getPaperPortfolio is hardened, but never let a bad read blank the panel.
      setLoadError(true);
      return;
    }
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
          if (typeof j.change === "number" && Number.isFinite(j.change)) nc[sym] = j.change;
        } catch {
          /* keep last-known price; never throw */
        }
      })
    );
    setPrices((prev) => ({ ...prev, ...np }));
    setChanges((prev) => ({ ...prev, ...nc }));
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  // Keep value fresh while you watch (paused while a ticket is open so the
  // price you're about to trade on can't shift under you mid-decision).
  useEffect(() => {
    if (ticket) return;
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load, ticket]);

  // After a trade, refresh local state immediately and let the rest of the app know.
  const handleTraded = useCallback(() => {
    load();
    onTraded?.();
  }, [load, onTraded]);

  if (loadError) {
    return (
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl px-5 py-8 text-center">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Couldn&apos;t load your portfolio</p>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">Your data is safe — this is just a display hiccup.</p>
        <button onClick={() => load()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--color-brand)] text-white text-xs font-semibold hover:bg-[var(--color-brand-light)] transition-colors">
          Try again
        </button>
      </div>
    );
  }

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
              <div key={sym} className="px-5 py-3 hover:bg-[var(--color-surface-hover)] transition-colors">
                <button onClick={() => onSelect(sym)} className="w-full text-left">
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
                {/* Direct actions — trade this position without leaving the list */}
                <div className="flex items-center justify-end gap-2 mt-2.5">
                  <button
                    onClick={() => setTicket({ symbol: sym, name: h.name || sym, shares: h.shares, avgCost: h.avgCost, mode: "buy" })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[var(--color-positive)]/10 text-[var(--color-positive)] border border-[var(--color-positive)]/20 hover:bg-[var(--color-positive)]/20 transition-colors"
                  >
                    <ArrowUpRight size={12} /> Buy
                  </button>
                  <button
                    onClick={() => setTicket({ symbol: sym, name: h.name || sym, shares: h.shares, avgCost: h.avgCost, mode: "sell" })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[var(--color-negative)]/10 text-[var(--color-negative)] border border-[var(--color-negative)]/20 hover:bg-[var(--color-negative)]/20 transition-colors"
                  >
                    <ArrowDownRight size={12} /> Sell
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ticket && (
        <TradeTicket
          key={ticket.symbol + ticket.mode}
          symbol={ticket.symbol}
          name={ticket.name}
          heldShares={ticket.shares}
          avgCost={ticket.avgCost}
          cash={portfolio.cash}
          fallbackPrice={prices[ticket.symbol] || ticket.avgCost}
          initialMode={ticket.mode}
          onClose={() => setTicket(null)}
          onDone={handleTraded}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline trade ticket — Buy more / Sell a position straight from the portfolio.
// Pulls a fresh live quote on open, is fractional-aware (crypto/forex), guards
// against double-submits, bad prices, and over-selling/over-spending.
// ---------------------------------------------------------------------------
function TradeTicket({
  symbol,
  name,
  heldShares,
  avgCost,
  cash,
  fallbackPrice,
  initialMode,
  onClose,
  onDone,
}: {
  symbol: string;
  name: string;
  heldShares: number;
  avgCost: number;
  cash: number;
  fallbackPrice: number;
  initialMode: "buy" | "sell";
  onClose: () => void;
  onDone: () => void;
}) {
  const [mode, setMode] = useState<"buy" | "sell">(initialMode);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState<number>(fallbackPrice);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const frac = classifyInstrument(symbol) !== "equity";
  const market = getMarketStatus(symbol);

  // Pull the freshest possible price the moment the ticket opens.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
        const j = await r.json();
        if (alive && typeof j.price === "number" && j.price > 0) {
          setLivePrice(j.price);
          setPrice(j.price);
        }
      } catch {
        /* fall back to the price we were handed */
      } finally {
        if (alive) setPriceLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [symbol]);

  const units = (frac ? parseFloat(amount) : parseInt(amount)) || 0;
  const estTotal = units * price;
  const maxBuyUnits = price > 0 ? (frac ? trimUnits(cash / price) : Math.floor(cash / price)) : 0;

  // Quick chips set the amount to a fraction of what's available.
  function setPct(pct: number) {
    const base = mode === "sell" ? heldShares : maxBuyUnits;
    let u = pct >= 1 ? base : base * pct;
    u = frac ? trimUnits(u) : Math.floor(u);
    setAmount(u > 0 ? String(u) : "");
    setError("");
  }

  function execute() {
    if (submittingRef.current) return;
    setError("");
    if (!Number.isFinite(price) || price <= 0) {
      setError("Live price unavailable right now — please try again in a moment.");
      return;
    }
    if (!Number.isFinite(units) || units <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (mode === "sell" && units > heldShares + 1e-8) {
      setError(`You only hold ${fmtQty(heldShares)} ${symbol}.`);
      return;
    }
    if (mode === "buy" && estTotal > cash + 1e-6) {
      setError(`That's ${formatCurrency(estTotal)} — more than your ${formatCurrency(cash)} buying power.`);
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      if (mode === "buy") paperBuy(symbol, name, units, price);
      else paperSell(symbol, name, units, price);
      setSuccess(
        `${mode === "buy" ? "Bought" : "Sold"} ${fmtQty(units)} ${symbol} at ${formatPrice(price)} · ${formatCurrency(estTotal)}${market.isOpen ? "" : " (market closed — filled at last price)"}`
      );
      onDone();
      setTimeout(onClose, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Trade failed — please try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const isBuy = mode === "buy";

  return (
    <Modal onClose={onClose} panelClassName="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <CompanyLogo symbol={symbol} size={32} />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] truncate">{symbol}</h3>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">{name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
            <X size={16} />
          </button>
        </div>

        {/* Buy / Sell toggle */}
        <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-lg p-1 mb-4">
          <button
            onClick={() => { setMode("buy"); setError(""); setAmount(""); }}
            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${isBuy ? "bg-[var(--color-positive)] text-white" : "text-[var(--color-text-muted)]"}`}
          >
            Buy more
          </button>
          <button
            onClick={() => { setMode("sell"); setError(""); setAmount(""); }}
            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${!isBuy ? "bg-[var(--color-negative)] text-white" : "text-[var(--color-text-muted)]"}`}
          >
            Sell
          </button>
        </div>

        {/* Live price */}
        <div className="flex items-center justify-between text-xs mb-3 px-1">
          <span className="text-[var(--color-text-muted)] inline-flex items-center gap-1.5">
            {priceLoading ? <Loader2 size={11} className="animate-spin" /> : <span className={`w-1.5 h-1.5 rounded-full ${livePrice ? "bg-[var(--color-positive)]" : "bg-[var(--color-text-muted)]"}`} />}
            {livePrice ? "Live price" : "Last price"}
          </span>
          <span className="font-bold tabular-nums text-[var(--color-text-primary)]">{formatPrice(price)}</span>
        </div>

        {/* Amount */}
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError(""); }}
          placeholder={frac ? "Amount (units)" : "Number of shares"}
          min="0"
          step={frac ? "any" : "1"}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)] tabular-nums mb-2"
          autoFocus
        />

        {/* Quick chips */}
        <div className="flex items-center gap-1.5 mb-4">
          {[0.25, 0.5, 1].map((p) => (
            <button
              key={p}
              onClick={() => setPct(p)}
              className="px-2.5 py-1 rounded text-[10px] font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)]/30 hover:text-[var(--color-brand)] transition-colors"
            >
              {p >= 1 ? (isBuy ? "Max" : "All") : `${p * 100}%`}
            </button>
          ))}
        </div>

        {/* Summary */}
        {units > 0 && (
          <div className="flex items-center justify-between text-xs px-3 py-2.5 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] mb-3">
            <span className="text-[var(--color-text-muted)]">{fmtQty(units)} × {formatPrice(price)}</span>
            <span className="font-bold tabular-nums text-[var(--color-text-primary)]">{formatCurrency(estTotal)}</span>
          </div>
        )}

        {/* Context line */}
        <div className="flex items-center justify-between text-[10px] px-1 mb-3 text-[var(--color-text-muted)]">
          {isBuy ? (
            <><span>Buying power</span><span className="tabular-nums">{formatCurrency(cash)}</span></>
          ) : (
            <><span>You hold</span><span className="tabular-nums">{fmtQty(heldShares)} {symbol} · avg {formatPrice(avgCost)}</span></>
          )}
        </div>

        {/* Market status */}
        <div className={`flex items-start gap-2 px-3 py-2 rounded-lg text-[11px] mb-3 ${market.isOpen ? "bg-[var(--color-positive)]/8 text-[var(--color-positive)]" : "bg-[var(--color-surface)] text-[var(--color-text-secondary)]"}`}>
          <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${market.isOpen ? "bg-[var(--color-positive)]" : "bg-[var(--color-text-muted)]"}`} />
          <span><span className="font-semibold">{market.isOpen ? "Market open" : "Market closed"}</span> · {market.detail}</span>
        </div>

        {error && (
          <div className="flex items-start gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-negative)]/10 text-xs text-[var(--color-negative)] mb-3">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-positive)]/10 text-xs text-[var(--color-positive)] mb-3">
            <CheckCircle2 size={12} className="mt-0.5 shrink-0" /> {success}
          </div>
        )}

        <button
          onClick={execute}
          disabled={submitting || priceLoading || !!success}
          className={`w-full py-3 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isBuy ? "bg-[var(--color-positive)] hover:bg-emerald-400" : "bg-[var(--color-negative)] hover:bg-red-400"}`}
        >
          {submitting ? "Processing…" : priceLoading ? "Getting live price…" : `${isBuy ? "Buy" : "Sell"} ${symbol}`}
        </button>
    </Modal>
  );
}
