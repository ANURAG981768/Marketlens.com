"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, TrendingUp, TrendingDown, Loader2, Medal, Lock, Share2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getPaperPortfolio } from "@/lib/storage";
import { publishRank, fetchLeaderboard, type LeaderEntry } from "@/lib/leaderboard";
import { shareText } from "@/lib/share";

// Compute the signed-in user's current return from their paper portfolio,
// using live prices for held symbols.
async function computeMyReturn(): Promise<{ returnPct: number; trades: number } | null> {
  const p = getPaperPortfolio();
  const trades = p.trades.length;
  const holdings = Object.entries(p.holdings);
  let holdingsValue = 0;
  if (holdings.length > 0) {
    const syms = holdings.map(([s]) => s).join(",");
    try {
      const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(syms)}`);
      const json = await res.json();
      const quotes = (json.quotes || {}) as Record<string, { price: number }>;
      for (const [sym, h] of holdings) {
        const price = quotes[sym]?.price ?? h.avgCost;
        holdingsValue += h.shares * price;
      }
    } catch {
      for (const [, h] of holdings) holdingsValue += h.shares * h.avgCost;
    }
  }
  const totalValue = p.cash + holdingsValue;
  const returnPct = p.startingBalance > 0 ? ((totalValue - p.startingBalance) / p.startingBalance) * 100 : 0;
  return { returnPct, trades };
}

const MEDAL = ["#d4af37", "#9ca3af", "#b87333"]; // gold / silver / bronze

export default function Leaderboard() {
  const { user, cloudEnabled } = useAuth();
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  const myIndex = user ? entries.findIndex((e) => e.user_id === user.id) : -1;

  async function shareRank() {
    if (myIndex < 0) return;
    const me = entries[myIndex];
    const res = await shareText(
      `I'm ranked #${myIndex + 1} on MarketLens's global trading leaderboard with a ${me.return_pct >= 0 ? "+" : ""}${me.return_pct.toFixed(2)}% return. Think you can beat me? Practice investing free —`
    );
    if (res === "copied") setShareMsg("Link copied — paste it anywhere!");
    else if (res === "shared") setShareMsg("Shared!");
    if (res !== "failed") setTimeout(() => setShareMsg(""), 2500);
  }

  const load = useCallback(async () => {
    if (!cloudEnabled) return;
    setLoading(true);
    try {
      // Publish my own latest standing first, so the board reflects me.
      if (user) {
        const mine = await computeMyReturn();
        if (mine && mine.trades > 0) {
          const name = (user.user_metadata?.display_name as string) || (user.email ? user.email.split("@")[0] : "Investor");
          await publishRank(user.id, name, mine.returnPct, mine.trades);
        }
      }
      setEntries(await fetchLeaderboard(100));
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [cloudEnabled, user]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <Trophy size={28} className="text-white" />
        </div>
        <h2 className="font-display text-3xl font-semibold mb-1">Leaderboard</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Top paper-trading returns from learners around the world. Can you beat them?
        </p>
      </div>

      {/* Not configured */}
      {!cloudEnabled && (
        <div className="flex flex-col items-center text-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8">
          <Lock size={22} className="text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">The leaderboard unlocks once accounts are enabled.</p>
        </div>
      )}

      {/* Configured but signed out */}
      {cloudEnabled && !user && (
        <div className="flex flex-col items-center text-center gap-2 rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/8 p-8">
          <Trophy size={22} className="text-[var(--color-gold)]" />
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Sign in to join the competition</p>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm">
            Create a free account (Sign in, top-right), start paper trading, and your return appears on the global board.
          </p>
        </div>
      )}

      {/* Share my rank — virality: each share brings new learners in */}
      {cloudEnabled && user && myIndex >= 0 && (
        <div className="flex items-center justify-between gap-3 mb-3 rounded-xl border border-[var(--color-brand)]/25 bg-[var(--color-brand)]/8 px-4 py-2.5">
          <span className="text-xs text-[var(--color-text-secondary)]">
            You&apos;re <span className="font-bold text-[var(--color-text-primary)]">#{myIndex + 1}</span> in the world
            {shareMsg && <span className="ml-2 text-[var(--color-positive)] font-medium">{shareMsg}</span>}
          </span>
          <button
            onClick={shareRank}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-brand)] text-white text-xs font-semibold hover:bg-[var(--color-brand-dim)] transition-colors shrink-0"
          >
            <Share2 size={13} /> Share my rank
          </button>
        </div>
      )}

      {/* Signed in */}
      {cloudEnabled && user && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden">
          {loading && !loaded ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--color-text-muted)]">
              <Loader2 size={16} className="animate-spin" /> Loading rankings…
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Medal size={24} className="mx-auto mb-2 text-[var(--color-text-muted)] opacity-40" />
              <p className="text-sm text-[var(--color-text-secondary)]">No ranked traders yet.</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Make your first paper trade to claim the top spot.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {entries.map((e, i) => {
                const isMe = e.user_id === user.id;
                const pos = e.return_pct >= 0;
                return (
                  <div
                    key={e.user_id}
                    className={`flex items-center justify-between px-4 py-3 ${isMe ? "bg-[var(--color-brand)]/8" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-7 text-center text-sm font-bold tabular-nums shrink-0"
                        style={{ color: i < 3 ? MEDAL[i] : "var(--color-text-muted)" }}
                      >
                        {i < 3 ? "★" : i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {e.display_name}
                          {isMe && <span className="ml-1.5 text-[10px] font-bold text-[var(--color-brand)]">YOU</span>}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{e.trades} trades</p>
                      </div>
                    </div>
                    <span
                      className={`flex items-center gap-1 text-sm font-bold tabular-nums ${
                        pos ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
                      }`}
                    >
                      {pos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {pos ? "+" : ""}
                      {e.return_pct.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="px-4 py-2.5 text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface-card)] border-t border-[var(--color-border)]">
            Ranked by total paper-trading return. Updates when you open this page. Simulated funds — for learning, not financial advice.
          </p>
        </div>
      )}
    </div>
  );
}
