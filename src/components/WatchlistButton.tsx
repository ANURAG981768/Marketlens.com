"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import {
  isInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "@/lib/storage";

interface Props {
  symbol: string;
  name: string;
  price: number;
  change: number;
  onUpdate?: () => void;
}

export default function WatchlistButton({
  symbol,
  name,
  price,
  change,
  onUpdate,
}: Props) {
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(isInWatchlist(symbol));
  }, [symbol]);

  function toggle() {
    if (watched) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist({
        symbol,
        name,
        price,
        change,
        addedAt: new Date().toISOString(),
      });
    }
    setWatched(!watched);
    onUpdate?.();
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        watched
          ? "bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 text-[var(--color-warning)]"
          : "bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-warning)]/30"
      }`}
    >
      <Star size={13} fill={watched ? "currentColor" : "none"} />
      {watched ? "Watching" : "Watch"}
    </button>
  );
}
