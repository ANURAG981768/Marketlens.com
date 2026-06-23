"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  Award,
  Star,
  Target,
  BookOpen,
  TrendingUp,
  Shield,
  Flame,
  Zap,
  Crown,
  Lock,
  CheckCircle,
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "quiz" | "trading" | "research" | "streak";
  icon: typeof Trophy;
  gradient: string;
  check: () => boolean;
}

interface AchievementState {
  unlockedIds: string[];
  firstUnlockedAt: Record<string, string>;
}

const STORAGE_KEY = "marketlens_achievements";

function loadState(): AchievementState {
  if (typeof window === "undefined") return { unlockedIds: [], firstUnlockedAt: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { unlockedIds: [], firstUnlockedAt: {} };
  } catch {
    return { unlockedIds: [], firstUnlockedAt: {} };
  }
}

function getQuizResults(): Record<string, { bestScore: number; total: number }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("marketlens_quiz_results");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getTradeJournal(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("marketlens_trade_journal");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getWatchlist(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("marketlens_watchlist");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getPortfolio(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("marketlens_portfolio");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getPaperTrades(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("marketlens_paper_trades");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const ACHIEVEMENTS: Achievement[] = [
  // Quiz Achievements
  {
    id: "quiz_first",
    title: "First Steps",
    description: "Complete your first quiz section",
    category: "quiz",
    icon: BookOpen,
    gradient: "from-emerald-400 to-emerald-600",
    check: () => Object.keys(getQuizResults()).length >= 1,
  },
  {
    id: "quiz_five",
    title: "Dedicated Learner",
    description: "Complete 5 quiz sections",
    category: "quiz",
    icon: Star,
    gradient: "from-blue-400 to-blue-600",
    check: () => Object.keys(getQuizResults()).length >= 5,
  },
  {
    id: "quiz_all",
    title: "Knowledge Master",
    description: "Complete all 14 quiz sections",
    category: "quiz",
    icon: Crown,
    gradient: "from-amber-400 to-amber-600",
    check: () => Object.keys(getQuizResults()).length >= 14,
  },
  {
    id: "quiz_perfect",
    title: "Perfect Score",
    description: "Score 100% on any quiz section",
    category: "quiz",
    icon: Target,
    gradient: "from-violet-400 to-violet-600",
    check: () => {
      const results = getQuizResults();
      return Object.values(results).some((r) => r.bestScore === r.total);
    },
  },
  {
    id: "quiz_all_90",
    title: "Honor Roll",
    description: "Score 90%+ on all completed sections",
    category: "quiz",
    icon: Award,
    gradient: "from-rose-400 to-rose-600",
    check: () => {
      const results = getQuizResults();
      const vals = Object.values(results);
      return vals.length >= 3 && vals.every((r) => r.bestScore / r.total >= 0.9);
    },
  },

  // Trading Achievements
  {
    id: "trade_first",
    title: "Market Debut",
    description: "Execute your first paper trade",
    category: "trading",
    icon: TrendingUp,
    gradient: "from-green-400 to-green-600",
    check: () => getPaperTrades().length >= 1,
  },
  {
    id: "trade_ten",
    title: "Active Trader",
    description: "Execute 10 paper trades",
    category: "trading",
    icon: Zap,
    gradient: "from-cyan-400 to-cyan-600",
    check: () => getPaperTrades().length >= 10,
  },
  {
    id: "trade_fifty",
    title: "Seasoned Investor",
    description: "Execute 50 paper trades",
    category: "trading",
    icon: Shield,
    gradient: "from-indigo-400 to-indigo-600",
    check: () => getPaperTrades().length >= 50,
  },
  {
    id: "journal_first",
    title: "Reflective Trader",
    description: "Write your first trade journal entry",
    category: "trading",
    icon: BookOpen,
    gradient: "from-purple-400 to-purple-600",
    check: () => getTradeJournal().length >= 1,
  },
  {
    id: "journal_ten",
    title: "Disciplined Mind",
    description: "Write 10 trade journal entries",
    category: "trading",
    icon: Flame,
    gradient: "from-orange-400 to-orange-600",
    check: () => getTradeJournal().length >= 10,
  },

  // Research Achievements
  {
    id: "watchlist_first",
    title: "On the Radar",
    description: "Add your first stock to the watchlist",
    category: "research",
    icon: Star,
    gradient: "from-amber-400 to-yellow-500",
    check: () => getWatchlist().length >= 1,
  },
  {
    id: "watchlist_ten",
    title: "Market Observer",
    description: "Track 10 stocks on your watchlist",
    category: "research",
    icon: Target,
    gradient: "from-teal-400 to-teal-600",
    check: () => getWatchlist().length >= 10,
  },
  {
    id: "portfolio_first",
    title: "Portfolio Builder",
    description: "Add your first holding to the portfolio",
    category: "research",
    icon: TrendingUp,
    gradient: "from-sky-400 to-sky-600",
    check: () => getPortfolio().length >= 1,
  },
  {
    id: "portfolio_diverse",
    title: "Diversified",
    description: "Hold 5+ different stocks in your portfolio",
    category: "research",
    icon: Shield,
    gradient: "from-lime-400 to-lime-600",
    check: () => getPortfolio().length >= 5,
  },
];

export default function Achievements() {
  const [state, setState] = useState<AchievementState>({ unlockedIds: [], firstUnlockedAt: {} });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const prev = loadState();
    const now = new Date().toISOString();
    let changed = false;

    for (const a of ACHIEVEMENTS) {
      if (!prev.unlockedIds.includes(a.id) && a.check()) {
        prev.unlockedIds.push(a.id);
        prev.firstUnlockedAt[a.id] = now;
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
    }
    setState(prev);
  }, []);

  const categories = [
    { key: null, label: "All" },
    { key: "quiz", label: "Learning" },
    { key: "trading", label: "Trading" },
    { key: "research", label: "Research" },
  ];

  const filtered = useMemo(() => {
    if (!activeCategory) return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  const unlocked = state.unlockedIds.length;
  const total = ACHIEVEMENTS.length;
  const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center py-6 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/20">
          <Trophy size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Achievements</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Track your learning milestones and trading progress
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold">{unlocked} of {total} Unlocked</p>
          <p className="text-sm font-bold text-[var(--color-brand)]">{pct}%</p>
        </div>
        <div className="w-full h-3 bg-[var(--color-surface-card)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-light)] rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6">
        {categories.map((c) => (
          <button
            key={c.key ?? "all"}
            onClick={() => setActiveCategory(c.key)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeCategory === c.key
                ? "bg-[var(--color-brand)] text-white shadow-sm"
                : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((a) => {
          const isUnlocked = state.unlockedIds.includes(a.id);
          const unlockedAt = state.firstUnlockedAt[a.id];
          const Icon = a.icon;

          return (
            <div
              key={a.id}
              className={`relative bg-white border rounded-xl p-4 transition-all ${
                isUnlocked
                  ? "border-[var(--color-brand)]/20 shadow-sm"
                  : "border-[var(--color-border)] opacity-60"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? `bg-gradient-to-br ${a.gradient} shadow-md`
                      : "bg-[var(--color-surface-card)]"
                  }`}
                >
                  {isUnlocked ? (
                    <Icon size={20} className="text-white" />
                  ) : (
                    <Lock size={16} className="text-[var(--color-text-muted)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                      {a.title}
                    </h4>
                    {isUnlocked && (
                      <CheckCircle size={13} className="text-[var(--color-brand)] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {a.description}
                  </p>
                  {isUnlocked && unlockedAt && (
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
                      Unlocked {new Date(unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
