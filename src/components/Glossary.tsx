"use client";

import { useState, useMemo } from "react";
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES } from "@/lib/glossary-data";
import { Search, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

export default function Glossary() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let terms = GLOSSARY_TERMS;
    if (activeCategory) {
      terms = terms.filter((t) => t.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      terms = terms.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
      );
    }
    return terms;
  }, [search, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of GLOSSARY_TERMS) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const t of filtered) {
      const letter = t.term[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center py-6 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <BookOpen size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Finance Dictionary</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          {GLOSSARY_TERMS.length} essential terms every investor should know
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms or definitions..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)]/40 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            !activeCategory
              ? "bg-[var(--color-brand)] text-white shadow-sm"
              : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)]"
          }`}
        >
          All ({GLOSSARY_TERMS.length})
        </button>
        {GLOSSARY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === cat
                ? "bg-[var(--color-brand)] text-white shadow-sm"
                : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)]"
            }`}
          >
            {cat} ({categoryCounts[cat] || 0})
          </button>
        ))}
      </div>

      {/* Results Count */}
      {(search || activeCategory) && (
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          {filtered.length} term{filtered.length !== 1 ? "s" : ""} found
          {activeCategory && ` in ${activeCategory}`}
          {search && ` matching "${search}"`}
        </p>
      )}

      {/* Terms List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-[var(--color-text-muted)]">
            No terms match your search.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([letter, terms]) => (
            <div key={letter}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-lg bg-[var(--color-brand)]/10 text-[var(--color-brand)] font-bold text-sm flex items-center justify-center">
                  {letter}
                </span>
                <div className="h-px flex-1 bg-[var(--color-border)]" />
              </div>
              <div className="space-y-1.5">
                {terms.map((t) => {
                  const isExpanded = expandedTerm === t.term;
                  return (
                    <button
                      key={t.term}
                      onClick={() =>
                        setExpandedTerm(isExpanded ? null : t.term)
                      }
                      className={`w-full text-left bg-white border rounded-xl px-4 py-3 transition-all ${
                        isExpanded
                          ? "border-[var(--color-brand)]/30 shadow-md"
                          : "border-[var(--color-border)] hover:border-[var(--color-border-light)] hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                              {t.term}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface-card)] text-[var(--color-text-muted)] font-medium shrink-0">
                              {t.category}
                            </span>
                          </div>
                          <p
                            className={`text-xs leading-relaxed text-[var(--color-text-secondary)] ${
                              isExpanded ? "" : "line-clamp-2"
                            }`}
                          >
                            {t.definition}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp
                            size={14}
                            className="text-[var(--color-text-muted)] shrink-0 mt-1"
                          />
                        ) : (
                          <ChevronDown
                            size={14}
                            className="text-[var(--color-text-muted)] shrink-0 mt-1"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
