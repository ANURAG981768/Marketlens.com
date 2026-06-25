"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, X, Plus, TrendingUp, TrendingDown } from "lucide-react";
import CompanyLogo from "./CompanyLogo";
import { formatPrice } from "@/lib/format";
import { getAlerts, addAlert, removeAlert, evaluateAlerts, type PriceAlert } from "@/lib/alerts";

export default function PriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [target, setTarget] = useState("");
  const [refPrice, setRefPrice] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setAlerts(getAlerts());
  }, []);

  // Poll live prices for every alerted symbol and trip any that cross.
  const symbolsKey = [...new Set(alerts.map((a) => a.symbol))].join(",");
  useEffect(() => {
    if (!symbolsKey) return;
    let active = true;
    const load = () => {
      fetch(`/api/quotes?symbols=${encodeURIComponent(symbolsKey)}`)
        .then((r) => r.json())
        .then((j) => {
          if (!active || !j.quotes) return;
          const map: Record<string, number> = {};
          for (const [sym, q] of Object.entries(j.quotes as Record<string, { price: number }>)) map[sym] = q.price;
          setPrices(map);
          const { alerts: updated } = evaluateAlerts(map);
          setAlerts([...updated]);
        })
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [symbolsKey]);

  // Fetch a reference price when the user types a symbol, to suggest direction.
  const fetchRef = useCallback((sym: string) => {
    if (!/^[A-Z0-9.\-]{1,12}$/.test(sym)) {
      setRefPrice(null);
      return;
    }
    fetch(`/api/quote?symbol=${encodeURIComponent(sym)}`)
      .then((r) => r.json())
      .then((j) => setRefPrice(typeof j.price === "number" ? j.price : null))
      .catch(() => setRefPrice(null));
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const sym = symbol.trim().toUpperCase();
    const t = parseFloat(target);
    if (!/^[A-Z0-9.\-]{1,12}$/.test(sym)) {
      setError("Enter a valid ticker");
      return;
    }
    if (!isFinite(t) || t <= 0) {
      setError("Enter a valid target price");
      return;
    }
    // Direction is implied by where the target sits vs the current price.
    const direction: "above" | "below" = refPrice != null && t < refPrice ? "below" : "above";
    try {
      const updated = addAlert(sym, sym, t, direction);
      setAlerts([...updated]);
      setSymbol("");
      setTarget("");
      setRefPrice(null);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add alert");
    }
  }

  const active = alerts.filter((a) => !a.triggeredAt);
  const triggered = alerts.filter((a) => a.triggeredAt);

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-[var(--color-brand)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Price Alerts</h3>
          {alerts.length > 0 && (
            <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface)] px-1.5 py-0.5 rounded-full">
              {active.length} active
            </span>
          )}
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setError(""); }}
          className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand)] hover:underline"
        >
          <Plus size={13} /> New
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/40 space-y-2.5">
          <div className="flex gap-2">
            <input
              value={symbol}
              onChange={(e) => { setSymbol(e.target.value.toUpperCase()); fetchRef(e.target.value.toUpperCase()); }}
              placeholder="Ticker (e.g. AAPL)"
              className="flex-1 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand)]"
            />
            <input
              type="number"
              step="0.01"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Target $"
              className="w-28 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand)]"
            />
          </div>
          {refPrice != null && (
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {symbol} is at {formatPrice(refPrice)} now — you&apos;ll be alerted when it crosses your target.
            </p>
          )}
          {error && <p className="text-[11px] text-[var(--color-negative)]">{error}</p>}
          <button type="submit" className="w-full py-2 rounded-lg bg-[var(--color-brand)] text-white text-xs font-semibold hover:bg-[var(--color-brand-dim)] transition-colors">
            Add alert
          </button>
        </form>
      )}

      {alerts.length === 0 && !showForm ? (
        <div className="p-6 text-center">
          <Bell size={20} className="mx-auto mb-2 text-[var(--color-text-muted)] opacity-40" />
          <p className="text-xs text-[var(--color-text-secondary)]">No price alerts yet.</p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Get notified when a stock hits your target price.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-border)]">
          {[...triggered, ...active].map((a) => {
            const cur = prices[a.symbol];
            const isTriggered = !!a.triggeredAt;
            return (
              <div key={a.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CompanyLogo symbol={a.symbol} size={22} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{a.symbol}</span>
                      {isTriggered && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[var(--color-brand)] bg-[var(--color-brand)]/10 px-1.5 py-0.5 rounded-full">
                          <BellRing size={9} /> Hit
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                      {a.direction === "above" ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                      {a.direction === "above" ? "Above" : "Below"} {formatPrice(a.target)}
                      {cur != null && <span> · now {formatPrice(cur)}</span>}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAlerts([...removeAlert(a.id)])}
                  className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-negative)] transition-colors"
                  aria-label="Remove alert"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
