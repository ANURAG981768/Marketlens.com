// Lightweight learning-streak tracker (device-local).
// Records each day the student opens MarketLens and computes their current
// and longest consecutive-day streaks — the core of the retention loop.

const KEY = "marketlens_activity_dates";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function load(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function recordActivity(): void {
  if (typeof window === "undefined") return;
  const today = todayStr();
  const dates = load();
  if (!dates.includes(today)) {
    dates.push(today);
    // keep ~14 months of history, plenty for streaks
    localStorage.setItem(KEY, JSON.stringify(dates.slice(-420)));
  }
}

function dayDiff(a: string, b: string): number {
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000);
}

export function getStreak(): { current: number; longest: number; activeToday: boolean } {
  const dates = [...new Set(load())].sort(); // ascending unique
  if (dates.length === 0) return { current: 0, longest: 0, activeToday: false };

  // Longest run of consecutive days
  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    if (dayDiff(dates[i], dates[i - 1]) === 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  // Current streak: count back from today (or yesterday as grace)
  const today = todayStr();
  const last = dates[dates.length - 1];
  const gap = dayDiff(today, last);
  let current = 0;
  if (gap <= 1) {
    current = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      if (dayDiff(dates[i], dates[i - 1]) === 1) current++;
      else break;
    }
  }

  return { current, longest, activeToday: dates.includes(today) };
}
