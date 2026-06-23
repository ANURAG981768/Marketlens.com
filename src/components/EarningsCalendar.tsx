"use client";

import { useState } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface EarningsEvent {
  symbol: string;
  company: string;
  date: string;
  time: "BMO" | "AMC" | "TNS";
  epsEstimate: number | null;
  revenueEstimate: string | null;
}

const DEMO_EARNINGS: EarningsEvent[] = [
  { symbol: "AAPL", company: "Apple Inc.", date: "2026-07-30", time: "AMC", epsEstimate: 1.35, revenueEstimate: "$85.2B" },
  { symbol: "MSFT", company: "Microsoft Corp.", date: "2026-07-22", time: "AMC", epsEstimate: 3.22, revenueEstimate: "$64.8B" },
  { symbol: "GOOGL", company: "Alphabet Inc.", date: "2026-07-22", time: "AMC", epsEstimate: 2.01, revenueEstimate: "$88.3B" },
  { symbol: "AMZN", company: "Amazon.com", date: "2026-07-31", time: "AMC", epsEstimate: 1.14, revenueEstimate: "$158.2B" },
  { symbol: "META", company: "Meta Platforms", date: "2026-07-23", time: "AMC", epsEstimate: 5.12, revenueEstimate: "$42.1B" },
  { symbol: "NVDA", company: "NVIDIA Corp.", date: "2026-08-27", time: "AMC", epsEstimate: 0.82, revenueEstimate: "$37.5B" },
  { symbol: "TSLA", company: "Tesla Inc.", date: "2026-07-23", time: "AMC", epsEstimate: 0.62, revenueEstimate: "$25.8B" },
  { symbol: "JPM", company: "JPMorgan Chase", date: "2026-07-15", time: "BMO", epsEstimate: 4.56, revenueEstimate: "$42.8B" },
  { symbol: "V", company: "Visa Inc.", date: "2026-07-22", time: "AMC", epsEstimate: 2.42, revenueEstimate: "$9.2B" },
  { symbol: "JNJ", company: "Johnson & Johnson", date: "2026-07-15", time: "BMO", epsEstimate: 2.78, revenueEstimate: "$22.5B" },
  { symbol: "WMT", company: "Walmart Inc.", date: "2026-08-15", time: "BMO", epsEstimate: 0.65, revenueEstimate: "$168.5B" },
  { symbol: "PG", company: "Procter & Gamble", date: "2026-07-29", time: "BMO", epsEstimate: 1.37, revenueEstimate: "$21.4B" },
];

const TIME_LABELS: Record<string, string> = {
  BMO: "Before Market Open",
  AMC: "After Market Close",
  TNS: "Time Not Specified",
};

const TIME_COLORS: Record<string, string> = {
  BMO: "text-[var(--color-warning)]",
  AMC: "text-[var(--color-brand)]",
  TNS: "text-[var(--color-text-muted)]",
};

interface Props {
  onSelect?: (symbol: string) => void;
}

export default function EarningsCalendar({ onSelect }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  function formatDate(d: Date) {
    return d.toISOString().split("T")[0];
  }

  function getEventsForDate(d: Date) {
    const ds = formatDate(d);
    return DEMO_EARNINGS.filter((e) => e.date === ds);
  }

  const weekLabel = `${weekDays[0].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${weekDays[4].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  const upcomingEvents = DEMO_EARNINGS.filter(
    (e) => new Date(e.date) >= today
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <Calendar size={32} className="text-[var(--color-brand)] mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-1">Earnings Calendar</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Track upcoming earnings releases for major companies.
        </p>
      </div>

      {/* Week Navigator */}
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {weekDays.map((d) => {
            const events = getEventsForDate(d);
            const isToday = formatDate(d) === formatDate(today);

            return (
              <div
                key={formatDate(d)}
                className={`rounded-lg p-2 min-h-[80px] border transition-colors ${
                  isToday
                    ? "border-[var(--color-brand)]/40 bg-[var(--color-brand)]/5"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]"
                }`}
              >
                <p
                  className={`text-[10px] font-medium mb-1.5 ${
                    isToday
                      ? "text-[var(--color-brand)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                </p>
                {events.length > 0 ? (
                  <div className="space-y-1">
                    {events.map((e) => (
                      <div
                        key={e.symbol}
                        onClick={() => onSelect?.(e.symbol)}
                        className="text-[10px] font-medium text-[var(--color-text-primary)] cursor-pointer hover:text-[var(--color-brand)] transition-colors truncate"
                        title={`${e.company} — ${TIME_LABELS[e.time]}`}
                      >
                        <span className={TIME_COLORS[e.time]}>●</span> {e.symbol}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[9px] text-[var(--color-text-muted)] italic">
                    No earnings
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming List */}
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Upcoming Earnings
          </h3>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {upcomingEvents.slice(0, 8).map((e) => (
            <div
              key={e.symbol + e.date}
              onClick={() => onSelect?.(e.symbol)}
              className="px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-brand)]/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-[var(--color-brand)]">
                    {e.symbol.slice(0, 3)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                    {e.symbol}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {e.company}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {new Date(e.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  <Clock size={9} className={TIME_COLORS[e.time]} />
                  <span className={`text-[10px] font-medium ${TIME_COLORS[e.time]}`}>
                    {e.time}
                  </span>
                </div>
                {e.epsEstimate && (
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Est. EPS: ${e.epsEstimate.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
