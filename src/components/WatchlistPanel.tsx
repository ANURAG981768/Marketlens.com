"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, X, TrendingUp, TrendingDown } from "lucide-react";
import CompanyLogo from "./CompanyLogo";
import EmptyState from "./EmptyState";
import { formatPrice } from "@/lib/format";
import {
  getWatchlist,
  removeFromWatchlist,
  type WatchlistItem,
} from "@/lib/storage";

interface Props {
  onSelect: (symbol: string) => void;
  refreshKey: number;
}

export default function WatchlistPanel({ onSelect, refreshKey }: Props) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [live, setLive] = useState<Record<string, { price: number; changePercent: number }>>({});

  useEffect(() => {
    setItems(getWatchlist());
  }, [refreshKey]);

  // Live, polling prices for every watchlist symbol — a watchlist with stale
  // add-time prices isn't useful.
  const symbolsKey = items.map((i) => i.symbol).join(",");
  useEffect(() => {
    if (!symbolsKey) return;
    let active = true;
    const load = () => {
      fetch(`/api/quotes?symbols=${encodeURIComponent(symbolsKey)}`)
        .then((r) => r.json())
        .then((j) => {
          if (active && j.quotes) setLive(j.quotes);
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

  function handleRemove(symbol: string) {
    const updated = removeFromWatchlist(symbol);
    setItems(updated);
  }

  if (!items.length) {
    return (
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl">
        <EmptyState
          icon={<Star size={22} />}
          title="Your watchlist is empty"
          description="Search any stock, open it, and tap the star to track its price here."
        />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-[var(--color-warning)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Watchlist
          </h3>
          <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface)] px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
          {Object.keys(live).length > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
            </span>
          )}
        </div>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {items.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--color-surface-hover)] transition-colors group cursor-pointer"
            onClick={() => onSelect(item.symbol)}
          >
            <div className="flex items-center gap-2">
              <CompanyLogo symbol={item.symbol} size={22} />
              <div>
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                {item.symbol}
              </p>
              {item.name && (
                <p className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[120px]">
                  {item.name}
                </p>
              )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const q = live[item.symbol.toUpperCase()];
                const price = q?.price ?? item.price;
                const pct = q?.changePercent;
                if (price == null) return null;
                return (
                  <div className="text-right">
                    <p className="text-xs tabular-nums text-[var(--color-text-primary)]">
                      {formatPrice(price)}
                    </p>
                    {pct !== undefined && (
                      <p
                        className={`text-[10px] tabular-nums flex items-center gap-0.5 justify-end ${
                          pct >= 0
                            ? "text-[var(--color-positive)]"
                            : "text-[var(--color-negative)]"
                        }`}
                      >
                        {pct >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                        {pct >= 0 ? "+" : ""}
                        {pct.toFixed(2)}%
                      </p>
                    )}
                  </div>
                );
              })()}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item.symbol);
                }}
                className="p-1 opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-negative)] transition-all"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
