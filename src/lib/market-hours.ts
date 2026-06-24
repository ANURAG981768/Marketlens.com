// Real U.S. equity market (NYSE/Nasdaq) trading-hours logic, in Eastern Time.
// Regular session: 9:30 AM – 4:00 PM ET, Monday–Friday, excluding NYSE holidays.

export interface MarketStatus {
  isOpen: boolean;
  state: "open" | "pre" | "after" | "weekend" | "holiday";
  label: string; // short: "Open" / "Closed"
  detail: string; // human sentence with the next change
}

// NYSE full-day holidays (Eastern dates). Covers the current era; outside this
// range we fall back to weekday+hours, which is correct except on rare holidays.
const NYSE_HOLIDAYS = new Set<string>([
  // 2026
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25",
  "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  // 2027
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31",
  "2027-06-18", "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24",
]);

const OPEN_MIN = 9 * 60 + 30; // 9:30 AM
const CLOSE_MIN = 16 * 60; // 4:00 PM

// Extract Eastern-Time parts regardless of the user's local timezone.
function easternParts(now: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const hour = parseInt(get("hour"), 10) % 24;
  const minute = parseInt(get("minute"), 10);
  return {
    dateStr: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: get("weekday"), // "Mon" … "Sun"
    minutes: hour * 60 + minute,
    hour,
    minute,
  };
}

export function getUSMarketStatus(now: Date = new Date()): MarketStatus {
  const { dateStr, weekday, minutes } = easternParts(now);
  const isWeekend = weekday === "Sat" || weekday === "Sun";
  const isHoliday = NYSE_HOLIDAYS.has(dateStr);

  if (isWeekend) {
    return {
      isOpen: false,
      state: "weekend",
      label: "Closed",
      detail: "Markets are closed for the weekend — they reopen Monday at 9:30 AM ET.",
    };
  }
  if (isHoliday) {
    return {
      isOpen: false,
      state: "holiday",
      label: "Closed",
      detail: "It's a U.S. market holiday — trading resumes the next business day at 9:30 AM ET.",
    };
  }
  if (minutes < OPEN_MIN) {
    return {
      isOpen: false,
      state: "pre",
      label: "Closed",
      detail: "Pre-market — the regular session opens at 9:30 AM ET.",
    };
  }
  if (minutes >= CLOSE_MIN) {
    return {
      isOpen: false,
      state: "after",
      label: "Closed",
      detail: "After-hours — the market reopens tomorrow at 9:30 AM ET.",
    };
  }
  // Minutes until close, for a gentle heads-up near the bell.
  const minsToClose = CLOSE_MIN - minutes;
  return {
    isOpen: true,
    state: "open",
    label: "Open",
    detail:
      minsToClose <= 30
        ? `Closing soon — ${minsToClose} min left in the regular session.`
        : "NYSE & Nasdaq are open until 4:00 PM ET.",
  };
}
