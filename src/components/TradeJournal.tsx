"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface JournalEntry {
  id: string;
  date: string;
  symbol: string;
  action: "buy" | "sell" | "watch";
  price: number;
  quantity?: number;
  reasoning: string;
  strategy: string;
  emotion: string;
  outcome?: "profit" | "loss" | "pending";
  exitPrice?: number;
  lessons: string;
  tags: string[];
}

const STORAGE_KEY = "marketlens_trade_journal";
const STRATEGIES = [
  "Value Investing",
  "Growth Investing",
  "Momentum",
  "Mean Reversion",
  "Breakout",
  "Earnings Play",
  "Dividend Capture",
  "Sector Rotation",
  "Technical Pattern",
  "Fundamental Analysis",
  "Other",
];
const EMOTIONS = [
  "Confident",
  "Cautious",
  "Excited",
  "Fearful",
  "FOMO",
  "Disciplined",
  "Uncertain",
  "Neutral",
];

function loadEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function TradeJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterOutcome, setFilterOutcome] = useState<string | null>(null);

  // Form state
  const [symbol, setSymbol] = useState("");
  const [action, setAction] = useState<"buy" | "sell" | "watch">("buy");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [strategy, setStrategy] = useState(STRATEGIES[0]);
  const [emotion, setEmotion] = useState(EMOTIONS[0]);
  const [outcome, setOutcome] = useState<"profit" | "loss" | "pending">("pending");
  const [exitPrice, setExitPrice] = useState("");
  const [lessons, setLessons] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const e of entries) for (const t of e.tags) s.add(t);
    return Array.from(s).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    let list = entries;
    if (filterTag) list = list.filter((e) => e.tags.includes(filterTag));
    if (filterOutcome) list = list.filter((e) => e.outcome === filterOutcome);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, filterTag, filterOutcome]);

  const stats = useMemo(() => {
    const total = entries.length;
    const profits = entries.filter((e) => e.outcome === "profit").length;
    const losses = entries.filter((e) => e.outcome === "loss").length;
    const pending = entries.filter((e) => e.outcome === "pending").length;
    const winRate = total > 0 ? ((profits / Math.max(profits + losses, 1)) * 100).toFixed(0) : "0";
    return { total, profits, losses, pending, winRate };
  }, [entries]);

  function resetForm() {
    setSymbol("");
    setAction("buy");
    setPrice("");
    setQuantity("");
    setReasoning("");
    setStrategy(STRATEGIES[0]);
    setEmotion(EMOTIONS[0]);
    setOutcome("pending");
    setExitPrice("");
    setLessons("");
    setTags([]);
    setTagInput("");
  }

  function handleSubmit() {
    if (!symbol.trim() || !price.trim() || !reasoning.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: new Date().toISOString(),
      symbol: symbol.toUpperCase().trim(),
      action,
      price: parseFloat(price),
      quantity: quantity ? parseFloat(quantity) : undefined,
      reasoning: reasoning.trim(),
      strategy,
      emotion,
      outcome,
      exitPrice: exitPrice ? parseFloat(exitPrice) : undefined,
      lessons: lessons.trim(),
      tags,
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    resetForm();
    setShowForm(false);
  }

  function deleteEntry(id: string) {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center py-6 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
          <BookOpen size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Trade Journal</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Document your reasoning, track outcomes, and learn from every trade
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-[var(--color-text-primary)]">{stats.total}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Entries</p>
        </div>
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-[var(--color-positive)]">{stats.profits}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Wins</p>
        </div>
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-[var(--color-negative)]">{stats.losses}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Losses</p>
        </div>
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-amber-500">{stats.pending}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Open</p>
        </div>
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-[var(--color-brand)]">{stats.winRate}%</p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Win Rate</p>
        </div>
      </div>

      {/* New Entry Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dim)] transition-colors shadow-md shadow-[var(--color-brand)]/20"
      >
        <Plus size={16} />
        {showForm ? "Cancel" : "New Journal Entry"}
      </button>

      {/* Entry Form */}
      {showForm && (
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 mb-6 shadow-sm animate-fade-in-up">
          <h3 className="text-sm font-bold mb-4">Record a Trade</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Symbol *
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="AAPL"
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as "buy" | "sell" | "watch")}
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="watch">Watch</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Price *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150.00"
                step="0.01"
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Strategy
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
              >
                {STRATEGIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Emotional State
              </label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
              >
                {EMOTIONS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Reasoning / Thesis *
            </label>
            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Why are you making this trade? What's your thesis?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Outcome
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as "profit" | "loss" | "pending")}
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
              >
                <option value="pending">Pending (Still Open)</option>
                <option value="profit">Profit</option>
                <option value="loss">Loss</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Exit Price
              </label>
              <input
                type="number"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="If closed"
                step="0.01"
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Lessons Learned
            </label>
            <textarea
              value={lessons}
              onChange={(e) => setLessons(e.target.value)}
              placeholder="What did you learn from this trade?"
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 resize-none"
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Tags
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tag and press Enter"
                className="flex-1 px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
              />
              <button
                onClick={addTag}
                className="px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm hover:bg-[var(--color-surface-hover)]"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)] text-xs font-medium"
                  >
                    {t}
                    <button
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="hover:text-[var(--color-negative)]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!symbol.trim() || !price.trim() || !reasoning.trim()}
            className="w-full py-3 rounded-xl bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dim)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Entry
          </button>
        </div>
      )}

      {/* Filters */}
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => { setFilterOutcome(null); setFilterTag(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !filterOutcome && !filterTag
                ? "bg-[var(--color-brand)] text-white"
                : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}
          >
            All
          </button>
          {(["profit", "loss", "pending"] as const).map((o) => (
            <button
              key={o}
              onClick={() => setFilterOutcome(filterOutcome === o ? null : o)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filterOutcome === o
                  ? "bg-[var(--color-brand)] text-white"
                  : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              {o === "pending" ? "Open" : o === "profit" ? "Wins" : "Losses"}
            </button>
          ))}
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTag(filterTag === t ? null : t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterTag === t
                  ? "bg-[var(--color-brand)] text-white"
                  : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {/* Entries */}
      {filtered.length === 0 && entries.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[var(--color-border)] rounded-xl">
          <BookOpen size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
          <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Your journal is empty
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Start documenting your trades to build a track record
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const pnl =
              entry.exitPrice && entry.price
                ? entry.action === "buy"
                  ? ((entry.exitPrice - entry.price) / entry.price) * 100
                  : ((entry.price - entry.exitPrice) / entry.price) * 100
                : null;

            return (
              <div
                key={entry.id}
                className={`bg-white border rounded-xl transition-all ${
                  isExpanded
                    ? "border-[var(--color-brand)]/30 shadow-md"
                    : "border-[var(--color-border)] hover:shadow-sm"
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        entry.action === "buy"
                          ? "bg-[var(--color-positive)]/10"
                          : entry.action === "sell"
                          ? "bg-[var(--color-negative)]/10"
                          : "bg-amber-500/10"
                      }`}
                    >
                      {entry.action === "buy" ? (
                        <TrendingUp size={16} className="text-[var(--color-positive)]" />
                      ) : entry.action === "sell" ? (
                        <TrendingDown size={16} className="text-[var(--color-negative)]" />
                      ) : (
                        <Target size={16} className="text-amber-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">
                          {entry.symbol}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                            entry.action === "buy"
                              ? "bg-[var(--color-positive)]/10 text-[var(--color-positive)]"
                              : entry.action === "sell"
                              ? "bg-[var(--color-negative)]/10 text-[var(--color-negative)]"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {entry.action}
                        </span>
                        {entry.outcome === "profit" && (
                          <CheckCircle size={12} className="text-[var(--color-positive)]" />
                        )}
                        {entry.outcome === "loss" && (
                          <XCircle size={12} className="text-[var(--color-negative)]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                        {entry.reasoning.slice(0, 60)}{entry.reasoning.length > 60 ? "..." : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums">${entry.price.toFixed(2)}</p>
                      {pnl !== null && (
                        <p
                          className={`text-[11px] font-semibold tabular-nums ${
                            pnl >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
                          }`}
                        >
                          {pnl >= 0 ? "+" : ""}
                          {pnl.toFixed(2)}%
                        </p>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={14} className="text-[var(--color-text-muted)]" />
                    ) : (
                      <ChevronDown size={14} className="text-[var(--color-text-muted)]" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)] space-y-3 animate-fade-in-up">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Date</p>
                        <p className="text-xs font-medium flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Strategy</p>
                        <p className="text-xs font-medium">{entry.strategy}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Emotion</p>
                        <p className="text-xs font-medium">{entry.emotion}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Quantity</p>
                        <p className="text-xs font-medium">{entry.quantity || "—"}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Reasoning</p>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-surface)] rounded-lg p-3">
                        {entry.reasoning}
                      </p>
                    </div>

                    {entry.exitPrice !== undefined && (
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Exit Price</p>
                          <p className="text-xs font-bold">${entry.exitPrice.toFixed(2)}</p>
                        </div>
                        {pnl !== null && (
                          <div>
                            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Return</p>
                            <p className={`text-xs font-bold ${pnl >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
                              {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}%
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {entry.lessons && (
                      <div>
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Lessons Learned</p>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-3">
                          {entry.lessons}
                        </p>
                      </div>
                    )}

                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {entry.tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-surface-card)] text-[var(--color-text-muted)] text-[10px] font-medium"
                          >
                            <Tag size={8} />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEntry(entry.id);
                        }}
                        className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-negative)] transition-colors"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
