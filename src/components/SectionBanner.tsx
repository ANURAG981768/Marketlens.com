"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Accent = "brand" | "azure" | "violet" | "gold" | "teal";

// Each accent carries a vivid hue (for the icon tile / glow) and a darker text
// variant that stays legible on the light surface.
const ACCENT: Record<Accent, { hex: string; text: string }> = {
  brand: { hex: "#00b84a", text: "#0a7c3f" },
  azure: { hex: "#2563eb", text: "#1d4ed8" },
  violet: { hex: "#7c3aed", text: "#6d28d9" },
  gold: { hex: "#c9a227", text: "#9a7d18" },
  teal: { hex: "#0d9488", text: "#0f766e" },
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
 * The app-wide section header: a LIGHT, premium card — accent-colored top edge,
 * a vibrant gradient icon tile, an accent eyebrow, a serif title, and a soft
 * accent glow in the corner. Kept light on purpose: the dark "aurora" treatment
 * is reserved for the single landing hero, so the rest of the app reads clean
 * and colorful rather than a stack of black slabs.
 */
export default function SectionBanner({ eyebrow, title, subtitle, accent = "brand", icon: Icon, children }: Props) {
  const { hex, text } = ACCENT[accent];
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-sm"
      style={{ borderTop: `2px solid ${hex}` }}
    >
      {/* soft accent glow — a hint of color, not a dark wash */}
      <span
        className="absolute -top-16 -right-12 w-56 h-56 rounded-full blur-3xl pointer-events-none"
        style={{ background: hex, opacity: 0.1 }}
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1" style={{ color: text }}>
                {eyebrow}
              </p>
            )}
            <h2 className="font-display text-2xl sm:text-[28px] font-semibold text-[var(--color-text-primary)] leading-tight">{title}</h2>
          </div>
        </div>
        {subtitle && <p className="text-sm text-[var(--color-text-secondary)] mt-2.5 leading-relaxed">{subtitle}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
