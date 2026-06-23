"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, X, TrendingUp, TrendingDown } from "lucide-react";
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

  useEffect(() => {
    setItems(getWatchlist());
  }, [refreshKey]);

  function handleRemove(symbol: string) {
    const updated = removeFromWatchlist(symbol);
    setItems(updated);
  }

  if (!items.length) return null;

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
        </div>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {items.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--color-surface-hover)] transition-colors group cursor-pointer"
            onClick={() => onSelect(item.symbol)}
          >
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
            <div className="flex items-center gap-2">
              {item.price && (
                <div className="text-right">
                  <p className="text-xs tabular-nums text-[var(--color-text-secondary)]">
                    ${item.price.toFixed(2)}
                  </p>
                  {item.change !== undefined && (
                    <p
                      className={`text-[10px] tabular-nums flex items-center gap-0.5 justify-end ${
                        item.change >= 0
                          ? "text-[var(--color-positive)]"
                          : "text-[var(--color-negative)]"
                      }`}
                    >
                      {item.change >= 0 ? (
                        <TrendingUp size={9} />
                      ) : (
                        <TrendingDown size={9} />
                      )}
                      {item.change >= 0 ? "+" : ""}
                      {item.change.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
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
