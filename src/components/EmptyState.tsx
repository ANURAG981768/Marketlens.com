"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;          // a lucide icon element
  title: string;
  description: string;
  action?: ReactNode;       // optional CTA button
}

/*
 * A calm, on-brand empty state — soft concentric rings behind a single icon,
 * a clear headline and one next step. Vector only (no photos), so it stays
 * crisp, fast, and never reads as stock-photo filler.
 */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="relative mb-6 flex items-center justify-center">
        <span className="absolute w-28 h-28 rounded-full bg-[var(--color-brand)]/5" />
        <span className="absolute w-20 h-20 rounded-full bg-[var(--color-brand)]/10" />
        <span className="relative w-14 h-14 rounded-2xl bg-[var(--color-ink)] flex items-center justify-center text-white">
          {icon}
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
