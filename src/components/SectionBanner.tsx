"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Accent = "brand" | "azure" | "violet" | "gold" | "teal";

const ACCENT_HEX: Record<Accent, string> = {
  brand: "#00b84a",
  azure: "#2563eb",
  violet: "#7c3aed",
  gold: "#c9a227",
  teal: "#0d9488",
};

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  accent?: Accent;
  icon?: LucideIcon;
  children?: ReactNode;
}

/*
 * The app-wide premium section header: a "market-aurora" dark banner with a
 * gold edge, terminal-grid texture, and a soft accent-hued glow. Used across
 * every major view so the whole app reads as one cohesively designed product
 * rather than a set of plain strips.
 */
export default function SectionBanner({ eyebrow, title, subtitle, accent = "brand", icon: Icon, children }: Props) {
  const hex = ACCENT_HEX[accent];
  return (
    <div className="relative overflow-hidden rounded-2xl premium-ink border-t-2 border-t-[var(--color-gold)]">
      <div className="absolute inset-0 hero-grid pointer-events-none" />
      {/* soft accent glow, top-right */}
      <span
        className="absolute -top-16 -right-10 w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: hex }}
        aria-hidden="true"
      />
      <div className="relative px-6 py-6 sm:px-8 sm:py-7 max-w-2xl">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
              style={{ background: `linear-gradient(135deg, ${hex}, ${hex}cc)`, boxShadow: `0 6px 16px -6px ${hex}` }}
            >
              <Icon size={18} className="text-white" />
            </div>
          )}
          <div>
            {eyebrow && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-light)] mb-1">
                {eyebrow}
              </p>
            )}
            <h2 className="font-display text-2xl sm:text-[28px] font-semibold text-white leading-tight">{title}</h2>
          </div>
        </div>
        {subtitle && <p className="text-sm text-gray-400 mt-2.5 leading-relaxed">{subtitle}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
