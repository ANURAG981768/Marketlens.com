"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for debugging without crashing the whole app.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)] mb-4">
        Something went wrong
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-3 text-[var(--color-text-primary)]">
        We hit an unexpected snag
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-md mb-8 leading-relaxed">
        This part of the app ran into an error. Your data is safe — try again, and
        if it keeps happening, reload the page.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-light)] transition-colors shadow-lg shadow-[var(--color-brand)]/25"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-semibold hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
