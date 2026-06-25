// Flag emoji render inconsistently across platforms — they appear as little
// flags on Apple devices but collapse to the bare letters ("US", "IN", …) on
// Windows/Chrome/Edge, which looks broken (e.g. "US US Markets"). We render our
// own clean, platform-consistent country chip from the ISO code instead.

// Convert a flag emoji (two regional-indicator code points) to its ISO 2-letter
// code, e.g. "🇮🇳" → "IN". Returns "" if the input isn't a flag emoji (or is
// already a plain code), so callers can fall back gracefully.
export function flagToCode(flag: string): string {
  if (!flag) return "";
  const cps = Array.from(flag).map((c) => c.codePointAt(0) ?? 0);
  if (cps.length >= 2 && cps[0] >= 0x1f1e6 && cps[0] <= 0x1f1ff && cps[1] >= 0x1f1e6 && cps[1] <= 0x1f1ff) {
    return String.fromCharCode(cps[0] - 0x1f1e6 + 65) + String.fromCharCode(cps[1] - 0x1f1e6 + 65);
  }
  // Already a plain 2–3 letter code (e.g. "EU", "US") — pass it through.
  return /^[A-Za-z]{2,3}$/.test(flag) ? flag.toUpperCase() : "";
}

// A small, designed country-code chip — identical on every OS/browser.
export default function CountryBadge({ code, className = "" }: { code: string; className?: string }) {
  if (!code) return null;
  return (
    <span
      className={`inline-flex items-center justify-center text-[9px] font-bold tracking-wide leading-none px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] ${className}`}
    >
      {code}
    </span>
  );
}
