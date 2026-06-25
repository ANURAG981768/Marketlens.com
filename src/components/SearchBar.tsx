"use client";

import { Search, Loader2, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import { searchStocks, type SearchItem } from "@/lib/search-data";
import { displaySymbol } from "@/lib/format";

interface Props {
  onSearch: (symbol: string) => void;
  loading: boolean;
  /** Attach the global "/" + ⌘/Ctrl+K focus shortcut + keycap hint (header only). */
  shortcut?: boolean;
}

export default function SearchBar({ onSearch, loading, shortcut = false }: Props) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [liveResults, setLiveResults] = useState<SearchItem[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const select = useCallback(
    (symbol: string) => {
      setValue(symbol);
      setOpen(false);
      setResults([]);
      setLiveResults([]);
      onSearch(symbol);
    },
    [onSearch]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pro shortcut: "/" or ⌘/Ctrl+K jumps to search from anywhere on the page
  // (ignored while the user is already typing in a field).
  useEffect(() => {
    if (!shortcut) return;
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement as HTMLElement | null;
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      const slash = e.key === "/" && !typing;
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (slash || cmdK) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  const doSearch = useCallback((query: string) => {
    const local = searchStocks(query, 8);
    setResults(local);
    setHighlighted(-1);

    if (query.length >= 2) {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.results && json.results.length > 0) {
            const localSymbols = new Set(local.map((l) => l.symbol));
            const extra: SearchItem[] = json.results
              .filter((r: SearchItem) => !localSymbols.has(r.symbol))
              .slice(0, 10);
            setLiveResults(extra);
          } else {
            setLiveResults([]);
          }
        })
        .catch(() => setLiveResults([]));
    } else {
      setLiveResults([]);
    }
  }, []);

  function handleChange(raw: string) {
    setValue(raw);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (raw.trim().length === 0) {
      setResults([]);
      setLiveResults([]);
      setOpen(false);
      return;
    }

    setOpen(true);
    debounceRef.current = setTimeout(() => doSearch(raw.trim()), 150);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim().toUpperCase();
    if (trimmed) select(trimmed);
  }

  const allResults = [...results, ...liveResults];

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || allResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => (h < allResults.length - 1 ? h + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h > 0 ? h - 1 : allResults.length - 1));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      select(allResults[highlighted].symbol);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => {
              if (value.trim() && allResults.length > 0) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search any stock — ticker or company name..."
            className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg pl-11 pr-10 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-colors"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => {
                setValue("");
                setResults([]);
                setLiveResults([]);
                setOpen(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
            >
              <X size={16} />
            </button>
          )}
          {!value && shortcut && (
            <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center text-[11px] font-medium text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-1.5 py-0.5 pointer-events-none select-none">
              /
            </kbd>
          )}
        </div>
      </form>

      {open && allResults.length > 0 && (
        <div className="absolute z-50 top-full mt-1.5 w-full bg-white border border-[var(--color-border)] rounded-lg shadow-xl overflow-hidden max-h-[380px] overflow-y-auto">
          {results.length > 0 && (
            <div className="px-3 pt-2.5 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Stocks
              </span>
            </div>
          )}
          {results.map((item, i) => (
            <button
              key={item.symbol}
              onClick={() => select(item.symbol)}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                highlighted === i
                  ? "bg-[var(--color-brand)]/10"
                  : "hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <span className="shrink-0 w-16 text-sm font-bold text-[var(--color-brand)]">
                {displaySymbol(item.symbol)}
              </span>
              <span className="flex-1 text-sm text-[var(--color-text-secondary)] truncate">
                {item.name}
              </span>
              <span className="shrink-0 text-[10px] font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-card)] px-1.5 py-0.5 rounded">
                {item.exchange}
              </span>
            </button>
          ))}
          {liveResults.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1 border-t border-[var(--color-border)]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  More Results
                </span>
              </div>
              {liveResults.map((item, i) => {
                const idx = results.length + i;
                return (
                  <button
                    key={item.symbol}
                    onClick={() => select(item.symbol)}
                    onMouseEnter={() => setHighlighted(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      highlighted === idx
                        ? "bg-[var(--color-brand)]/10"
                        : "hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <span className="shrink-0 w-16 text-sm font-bold text-[var(--color-brand)]">
                      {displaySymbol(item.symbol)}
                    </span>
                    <span className="flex-1 text-sm text-[var(--color-text-secondary)] truncate">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-[10px] font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-card)] px-1.5 py-0.5 rounded">
                      {item.exchange}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
