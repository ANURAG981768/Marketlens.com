"use client";

import { useState, useEffect, useCallback } from "react";
import { DEMO_NEWS_AAPL, DEMO_NEWS_GENERAL } from "@/lib/demo-news";
import { Newspaper, ExternalLink, Clock, ChevronRight } from "lucide-react";

interface Article {
  symbol: string;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
}

interface Props {
  symbol?: string;
  isDemo?: boolean;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getSiteColor(site: string): string {
  const s = site.toLowerCase();
  if (s.includes("bloomberg")) return "#7c3aed";
  if (s.includes("reuters")) return "#f97316";
  if (s.includes("cnbc")) return "#2563eb";
  if (s.includes("wsj") || s.includes("wall street")) return "#854d0e";
  if (s.includes("seeking")) return "#ea580c";
  if (s.includes("financial times") || s.includes("ft")) return "#d4a574";
  if (s.includes("marketwatch")) return "#16a34a";
  if (s.includes("verge")) return "#8b5cf6";
  if (s.includes("nikkei")) return "#dc2626";
  if (s.includes("coindesk")) return "#f59e0b";
  return "#6b7280";
}

export default function NewsFeed({ symbol, isDemo }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchNews = useCallback(async () => {
    setLoading(true);

    if (isDemo) {
      setArticles(symbol ? DEMO_NEWS_AAPL : DEMO_NEWS_GENERAL);
      setLoading(false);
      return;
    }

    try {
      const params = symbol ? `?symbol=${encodeURIComponent(symbol)}` : "";
      const res = await fetch(`/api/news${params}`);
      const json = await res.json();

      if (json.error === "demo") {
        setArticles(symbol ? DEMO_NEWS_AAPL : DEMO_NEWS_GENERAL);
      } else if (json.articles) {
        setArticles(json.articles);
      }
    } catch {
      setArticles(symbol ? DEMO_NEWS_AAPL : DEMO_NEWS_GENERAL);
    } finally {
      setLoading(false);
    }
  }, [symbol, isDemo]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const displayed = showAll ? articles : articles.slice(0, 5);

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Newspaper size={16} className="text-[var(--color-brand)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {symbol ? `${symbol} News` : "Market News"}
          </h3>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          {symbol
            ? `Latest headlines and analysis for ${symbol}`
            : "Today's top financial headlines"}
        </p>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          {displayed.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-4 p-4 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-hover)] transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      color: getSiteColor(article.site),
                      backgroundColor: `color-mix(in srgb, ${getSiteColor(article.site)} 12%, transparent)`,
                    }}
                  >
                    {article.site}
                  </span>
                  {article.symbol && article.symbol !== symbol && (
                    <span className="text-[10px] font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-card)] px-1.5 py-0.5 rounded">
                      {article.symbol}
                    </span>
                  )}
                  <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-0.5">
                    <Clock size={9} />
                    {timeAgo(article.publishedDate)}
                  </span>
                </div>

                <h4 className="text-sm font-medium text-[var(--color-text-primary)] leading-snug group-hover:text-[var(--color-brand)] transition-colors line-clamp-2">
                  {article.title}
                </h4>

                <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2 leading-relaxed">
                  {article.text}
                </p>
              </div>

              <div className="shrink-0 flex items-center">
                <ExternalLink
                  size={14}
                  className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </a>
          ))}

          {articles.length > 5 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowAll(!showAll);
              }}
              className="w-full px-5 py-3 flex items-center justify-center gap-1 text-xs font-medium text-[var(--color-brand)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              {showAll ? "Show less" : `View all ${articles.length} articles`}
              <ChevronRight
                size={12}
                className={`transition-transform ${showAll ? "rotate-90" : ""}`}
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
