"use client";

import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  positive?: boolean;
}

export default function MetricCard({ label, value, sub, icon, positive }: Props) {
  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4 hover:border-[var(--color-border-light)] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </p>
        {icon && (
          <span className="text-[var(--color-text-muted)]">{icon}</span>
        )}
      </div>
      <p
        className={`text-xl font-bold tabular-nums ${
          positive === true
            ? "text-[var(--color-positive)]"
            : positive === false
            ? "text-[var(--color-negative)]"
            : "text-[var(--color-text-primary)]"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[var(--color-text-muted)] mt-1">{sub}</p>
      )}
    </div>
  );
}
