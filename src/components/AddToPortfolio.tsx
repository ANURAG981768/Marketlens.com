"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { addToPortfolio } from "@/lib/storage";

interface Props {
  symbol: string;
  name: string;
  currentPrice: number;
  onAdd?: () => void;
}

export default function AddToPortfolio({
  symbol,
  name,
  currentPrice,
  onAdd,
}: Props) {
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState("");
  const [cost, setCost] = useState(currentPrice.toFixed(2));

  function handleAdd() {
    const s = parseFloat(shares);
    const c = parseFloat(cost);
    if (!s || s <= 0 || !c || c <= 0) return;

    addToPortfolio({
      symbol,
      shares: s,
      avgCost: c,
      name,
      addedAt: new Date().toISOString(),
    });
    setOpen(false);
    setShares("");
    setCost(currentPrice.toFixed(2));
    onAdd?.();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/30 text-[var(--color-brand)] hover:bg-[var(--color-brand)]/20 transition-all"
      >
        <Plus size={13} />
        Add to Portfolio
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-2">
      <input
        type="number"
        placeholder="Shares"
        value={shares}
        onChange={(e) => setShares(e.target.value)}
        min="0"
        step="1"
        className="w-20 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded px-2 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)]"
      />
      <span className="text-xs text-[var(--color-text-muted)]">@</span>
      <input
        type="number"
        placeholder="Cost"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        min="0"
        step="0.01"
        className="w-24 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded px-2 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)]"
      />
      <button
        onClick={handleAdd}
        className="px-2.5 py-1 rounded bg-[var(--color-brand)] text-white text-xs font-medium hover:bg-[var(--color-brand-light)] transition-colors"
      >
        Add
      </button>
      <button
        onClick={() => setOpen(false)}
        className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
      >
        <X size={13} />
      </button>
    </div>
  );
}
