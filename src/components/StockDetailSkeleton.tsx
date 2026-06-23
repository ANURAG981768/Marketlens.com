// Shimmer placeholder shown while a stock's data loads — mirrors the real
// dashboard layout so the page doesn't flash blank (premium loading UX).
export default function StockDetailSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in-up" aria-hidden="true">
      {/* Header card */}
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-7">
        <div className="flex justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="skeleton w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <div className="skeleton h-7 w-28" />
              <div className="skeleton h-4 w-40" />
            </div>
          </div>
          <div className="space-y-2 sm:text-right">
            <div className="skeleton h-10 w-40" />
            <div className="skeleton h-6 w-32 rounded-full ml-auto" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <div className="skeleton h-7 w-44 rounded-full" />
          <div className="skeleton h-7 w-28 rounded-full" />
          <div className="skeleton h-7 w-32 rounded-full" />
        </div>
      </div>

      {/* Chart + summary row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl p-6">
          <div className="skeleton h-5 w-32 mb-5" />
          <div className="skeleton h-56 w-full rounded-xl" />
        </div>
        <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl p-6">
          <div className="skeleton h-5 w-36 mb-5" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl p-5">
            <div className="skeleton h-3 w-16 mb-3" />
            <div className="skeleton h-7 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
