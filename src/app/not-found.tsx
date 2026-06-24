import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)] mb-4">
        404 — Not found
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-3 text-[var(--color-text-primary)]">
        This page wandered off the chart
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-md mb-8 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back to the markets.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-light)] transition-colors shadow-lg shadow-[var(--color-brand)]/25"
      >
        Back to MarketLens
      </Link>
    </div>
  );
}
