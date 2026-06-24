"use client";

import { useState, useCallback, useEffect } from "react";
import type { StockData } from "@/lib/types";
import { getUSMarketStatus } from "@/lib/market-hours";
import SearchBar from "@/components/SearchBar";
import StockHeader from "@/components/StockHeader";
import StockDetailSkeleton from "@/components/StockDetailSkeleton";
import PriceChart from "@/components/PriceChart";
import RevenueChart from "@/components/RevenueChart";
import KeyMetricsGrid from "@/components/KeyMetricsGrid";
import FinancialTable from "@/components/FinancialTable";
import QuickStats from "@/components/QuickStats";
import CompanyOverview from "@/components/CompanyOverview";
import PeerComparison from "@/components/PeerComparison";
import PeerBarChart from "@/components/PeerBarChart";
import MarginTrend from "@/components/MarginTrend";
import ScoreCard from "@/components/ScoreCard";
import DCFModel from "@/components/DCFModel";
import NewsFeed from "@/components/NewsFeed";
import WatchlistButton from "@/components/WatchlistButton";
import AddToPortfolio from "@/components/AddToPortfolio";
import WatchlistPanel from "@/components/WatchlistPanel";
import PriceAlerts from "@/components/PriceAlerts";
import Leaderboard from "@/components/Leaderboard";
import PortfolioPanel from "@/components/PortfolioPanel";
import StockScreener from "@/components/StockScreener";
import MarketOverview from "@/components/MarketOverview";
import EarningsCalendar from "@/components/EarningsCalendar";
import TechnicalIndicators from "@/components/TechnicalIndicators";
import DividendHistory from "@/components/DividendHistory";
import PaperTrading from "@/components/PaperTrading";
import QuickTrade from "@/components/QuickTrade";
import FinanceQuiz from "@/components/FinanceQuiz";
import Glossary from "@/components/Glossary";
import TradeJournal from "@/components/TradeJournal";
import Achievements from "@/components/Achievements";
import AIAnalyst from "@/components/AIAnalyst";
import LessonsHub from "@/components/LessonsHub";
import StockCompare from "@/components/StockCompare";
import InvestmentCalculator from "@/components/InvestmentCalculator";
import SectorHeatmap from "@/components/SectorHeatmap";
import EarningsTranscripts from "@/components/EarningsTranscripts";
import EconomicCalendar from "@/components/EconomicCalendar";
import PortfolioAnalytics from "@/components/PortfolioAnalytics";
import CompanyOutlook from "@/components/CompanyOutlook";
import RatioExplainer from "@/components/RatioExplainer";
import CertificateGenerator from "@/components/CertificateGenerator";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import CompanyLogo from "@/components/CompanyLogo";
import { LogoMark, LogoHero, FeatureIcon } from "@/components/Logo";
import AccountMenu from "@/components/AccountMenu";
import ProgressDashboard from "@/components/ProgressDashboard";
import { recordActivity } from "@/lib/streak";
import {
  BarChart3,
  AlertCircle,
  Home as HomeIcon,
  Star,
  Briefcase,
  Filter,
  Activity,
  Calendar,
  TrendingUp,
  Globe,
  Zap,
  ArrowRight,
  Search,
  DollarSign,
  Bitcoin,
  GraduationCap,
  BookText,
  BookMarked,
  Medal,
  Trophy,
  ArrowLeft,
  Scale,
  Calculator,
  ChevronRight,
  Sparkles,
  Users,
  BarChart2,
  BookOpen,
  Target,
  Shield,
  LayoutGrid,
  FileText,
  Award,
  Menu,
  X,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

const POPULAR = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "JPM"];

const TRENDING = [
  { symbol: "NVDA", name: "NVIDIA", change: 3.21 },
  { symbol: "AAPL", name: "Apple", change: 1.69 },
  { symbol: "TSLA", name: "Tesla", change: -0.84 },
  { symbol: "MSFT", name: "Microsoft", change: 0.52 },
  { symbol: "AMD", name: "AMD", change: 2.45 },
  { symbol: "AMZN", name: "Amazon", change: 1.13 },
];

const GLOBAL_INDICES_DEFAULT = [
  { name: "S&P 500", value: "5,667.20", change: "+0.58%", positive: true, flag: "🇺🇸" },
  { name: "NASDAQ", value: "18,352.76", change: "+0.80%", positive: true, flag: "🇺🇸" },
  { name: "Nifty 50", value: "24,834.85", change: "+0.42%", positive: true, flag: "🇮🇳" },
  { name: "Sensex", value: "81,721.34", change: "+0.38%", positive: true, flag: "🇮🇳" },
  { name: "SSE Composite", value: "3,261.56", change: "-0.21%", positive: false, flag: "🇨🇳" },
  { name: "Hang Seng", value: "18,456.32", change: "+1.12%", positive: true, flag: "🇭🇰" },
  { name: "Nikkei 225", value: "39,583.08", change: "+0.67%", positive: true, flag: "🇯🇵" },
  { name: "FTSE 100", value: "8,312.89", change: "-0.15%", positive: false, flag: "🇬🇧" },
  { name: "DAX", value: "18,692.01", change: "+0.33%", positive: true, flag: "🇩🇪" },
  { name: "CAC 40", value: "7,628.45", change: "+0.19%", positive: true, flag: "🇫🇷" },
];

const CRYPTO_DEFAULTS = [
  { symbol: "BTC-USD", name: "Bitcoin", price: "64,014.00", change: "-0.31%", positive: false },
  { symbol: "ETH-USD", name: "Ethereum", price: "1,727.67", change: "-0.49%", positive: false },
  { symbol: "SOL-USD", name: "Solana", price: "71.81", change: "-2.66%", positive: false },
  { symbol: "BNB-USD", name: "BNB", price: "590.99", change: "-0.07%", positive: false },
  { symbol: "XRP-USD", name: "XRP", price: "1.13", change: "-0.64%", positive: false },
  { symbol: "DOGE-USD", name: "Dogecoin", price: "0.0819", change: "-1.50%", positive: false },
  { symbol: "ADA-USD", name: "Cardano", price: "0.1589", change: "-0.34%", positive: false },
  { symbol: "AVAX-USD", name: "Avalanche", price: "6.29", change: "+0.66%", positive: true },
  { symbol: "DOT-USD", name: "Polkadot", price: "0.9355", change: "-2.00%", positive: false },
  { symbol: "LINK-USD", name: "Chainlink", price: "7.88", change: "-0.33%", positive: false },
];

type Tab = "home" | "watchlist" | "portfolio" | "screener" | "market" | "earnings" | "paper" | "quiz" | "glossary" | "journal" | "achievements" | "lessons" | "compare" | "calculator" | "heatmap" | "transcripts" | "economy" | "analytics" | "ratios" | "certificates" | "leaderboard";

export default function Home() {
  const [data, setData] = useState<StockData | null>(null);
  const [peers, setPeers] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // Commodities, forex and indices have no income statements — gate the
  // equity-only financial sections so their detail page stays clean (price,
  // chart, technicals, news) instead of showing empty/broken financial cards.
  const hasFinancials = (data?.income?.length ?? 0) > 0;
  const [activeTab, setActiveTab] = useState<Tab>("screener");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [marketOpen, setMarketOpen] = useState(false);
  const [analyticsView, setAnalyticsView] = useState<"outlook" | "portfolio">("outlook");

  useEffect(() => { recordActivity(); }, []);
  const [cryptoPrices, setCryptoPrices] = useState(CRYPTO_DEFAULTS);
  const [globalIndices, setGlobalIndices] = useState(GLOBAL_INDICES_DEFAULT);

  useEffect(() => {
    function loadIndices() {
      fetch("/api/indices")
        .then((r) => r.json())
        .then((json) => {
          if (!json.indices) return;
          setGlobalIndices((prev) =>
            prev.map((idx) => {
              const live = json.indices.find((i: { name: string }) => i.name === idx.name);
              if (!live) return idx;
              return {
                ...idx,
                value: live.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                change: `${live.changePct >= 0 ? "+" : ""}${live.changePct.toFixed(2)}%`,
                positive: live.changePct >= 0,
              };
            })
          );
        })
        .catch(() => {});
    }
    loadIndices();
    const interval = setInterval(loadIndices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Global U.S. market open/closed status for the ticker bar.
  useEffect(() => {
    const tick = () => setMarketOpen(getUSMarketStatus().isOpen);
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function refreshCrypto() {
      fetch("/api/crypto")
        .then((r) => r.json())
        .then((json) => {
          if (json.prices) {
            setCryptoPrices((prev) =>
              prev.map((coin) => {
                const live = json.prices[coin.symbol];
                if (!live) return coin;
                const p = live.price;
                const ch = live.change24h;
                return {
                  ...coin,
                  price: p >= 1 ? p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : p.toPrecision(4),
                  change: `${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%`,
                  positive: ch >= 0,
                };
              })
            );
          }
        })
        .catch(() => {});
    }
    refreshCrypto();
    const interval = setInterval(refreshCrypto, 60000);
    return () => clearInterval(interval);
  }, []);

  const refresh = () => setRefreshKey((k) => k + 1);

  const fetchPeers = useCallback(async (symbol: string) => {
    // Only ever show real peer data — never a fabricated fallback. If the peer
    // feed is unavailable, the peer sections simply hide (peers stays null).
    try {
      const res = await fetch(`/api/peers?symbol=${encodeURIComponent(symbol)}`);
      const json = await res.json();
      if (json.peers && Array.isArray(json.peers) && json.peers.length > 0) {
        setPeers(json.peers);
      } else {
        setPeers(null);
      }
    } catch {
      setPeers(null);
    }
  }, []);

  const fetchStock = useCallback(
    async (symbol: string) => {
      setLoading(true);
      setError(null);
      setIsDemo(false);
      setPeers(null);
      setActiveSymbol(symbol);
      setActiveTab("home");

      try {

        const res = await fetch(
          `/api/stock?symbol=${encodeURIComponent(symbol)}`
        );
        const json = await res.json();

        // Transient upstream/auth issue — never substitute another company's
        // data. Show a clean, retryable message instead.
        if (json.error === "demo" || json.error === "auth_failed") {
          setError(`We couldn't load ${symbol.toUpperCase()} right now. Please try again in a moment.`);
          return;
        }

        if (!res.ok || json.error === "not_found" || !json.profile) {
          setError(`No market data found for "${symbol.toUpperCase()}". Double-check the ticker and try again.`);
          return;
        }

        setData(json);
        fetchPeers(symbol);
      } catch {
        setError("Network issue — please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [fetchPeers]
  );

  const NAV_ROW1: { key: Tab; label: string; icon: typeof HomeIcon }[] = [
    { key: "home", label: "Research", icon: HomeIcon },
    { key: "market", label: "Market", icon: Activity },
    { key: "screener", label: "Screener", icon: Filter },
    { key: "heatmap", label: "Heatmap", icon: LayoutGrid },
    { key: "earnings", label: "Earnings", icon: Calendar },
    { key: "transcripts", label: "Track Record", icon: FileText },
    { key: "economy", label: "Economy", icon: Globe },
    { key: "compare", label: "Compare", icon: Scale },
    { key: "calculator", label: "Calculator", icon: Calculator },
    { key: "ratios", label: "Ratios", icon: BookOpen },
  ];

  const NAV_ROW2: { key: Tab; label: string; icon: typeof HomeIcon }[] = [
    { key: "paper", label: "Trade", icon: DollarSign },
    { key: "watchlist", label: "Watchlist", icon: Star },
    { key: "portfolio", label: "Portfolio", icon: Briefcase },
    { key: "leaderboard", label: "Leaderboard", icon: Trophy },
    { key: "analytics", label: "Analytics", icon: Shield },
    { key: "lessons", label: "Lessons", icon: BookMarked },
    { key: "quiz", label: "Quiz", icon: GraduationCap },
    { key: "certificates", label: "Certificates", icon: Award },
    { key: "journal", label: "Journal", icon: BookText },
    { key: "glossary", label: "Glossary", icon: BookText },
    { key: "achievements", label: "Awards", icon: Medal },
  ];

  const ALL_TABS = [...NAV_ROW1, ...NAV_ROW2];

  const btcLive = cryptoPrices.find(c => c.symbol === "BTC-USD");
  const ethLive = cryptoPrices.find(c => c.symbol === "ETH-USD");
  const TICKER_ITEMS = [
    ...globalIndices.map(i => ({ label: i.name, value: i.value, change: i.change, positive: i.positive })),
    { label: "BTC", value: `$${btcLive?.price || "64,014"}`, change: btcLive?.change || "-0.39%", positive: btcLive?.positive ?? false },
    { label: "ETH", value: `$${ethLive?.price || "1,728"}`, change: ethLive?.change || "-0.49%", positive: ethLive?.positive ?? false },
    { label: "Gold", value: "$2,438", change: "+0.32%", positive: true },
    { label: "Oil", value: "$78.42", change: "-0.67%", positive: false },
    { label: "VIX", value: "13.28", change: "-2.14%", positive: false },
  ];

  return (
    <div className="min-h-screen">
      {/* Live Market Ticker Bar */}
      <div className="bg-[#0f1419] text-white overflow-hidden relative z-50">
        <div className="flex items-center">
          <div className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-brand)] text-white text-[10px] font-bold uppercase tracking-wider z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live
          </div>
          <div className="overflow-hidden flex-1">
            <div className="ticker-track flex items-center gap-8 py-1.5 whitespace-nowrap">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="flex items-center gap-2 text-[11px]">
                  <span className="text-gray-400 font-medium">{item.label}</span>
                  <span className="font-semibold text-white tabular-nums">{item.value}</span>
                  <span className={`font-semibold tabular-nums ${item.positive ? "text-[#00e676]" : "text-[#ff5252]"}`}>
                    {item.change}
                  </span>
                </span>
              ))}
            </div>
          </div>
          {/* Global U.S. market status — always visible, like a real terminal */}
          <div className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 border-l border-white/10 bg-[#0f1419]">
            <span className={`w-1.5 h-1.5 rounded-full ${marketOpen ? "bg-[#00e676] animate-pulse" : "bg-gray-500"}`} />
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${marketOpen ? "text-[#00e676]" : "text-gray-400"}`}>
              <span className="hidden sm:inline">US Markets </span>{marketOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass bg-white/80 border-b border-[var(--color-border)] shadow-sm">
        {/* Top bar: logo + search */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-6">
          <div
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            onClick={() => {
              setData(null);
              setActiveSymbol(null);
              setActiveTab("screener");
            }}
          >
            <LogoMark size={42} className="shadow-lg shadow-[var(--color-brand)]/20 group-hover:shadow-[var(--color-brand)]/30 transition-shadow rounded-xl" />
            <div className="leading-none">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-none text-[var(--color-text-primary)]">
                Market<span className="text-gradient-brand">Lens</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)] leading-none mt-1 tracking-[0.12em] uppercase font-medium">
                Equity Research &amp; Education
              </p>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <SearchBar onSearch={fetchStock} loading={loading} />
          </div>
          <div className="shrink-0">
            <AccountMenu />
          </div>
        </div>

        {/* Two-row nav — Desktop */}
        <div className="hidden md:block border-t border-[var(--color-border)] bg-white/50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Row 1: Research & Analysis */}
            <div className="flex items-center gap-1 py-1.5 border-b border-[var(--color-border)]/50">
              <span className="text-[10px] font-semibold text-[var(--color-text-muted)]/70 uppercase tracking-widest mr-2.5 shrink-0">Research</span>
              {NAV_ROW1.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-[var(--color-brand)] text-white shadow-sm shadow-[var(--color-brand)]/25"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/80"
                  }`}
                >
                  <tab.icon size={16} className="shrink-0" />
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Row 2: Trading & Learning */}
            <div className="flex items-center gap-1 py-1.5">
              <span className="text-[10px] font-semibold text-[var(--color-text-muted)]/70 uppercase tracking-widest mr-2.5 shrink-0">Learn</span>
              {NAV_ROW2.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-[var(--color-brand)] text-white shadow-sm shadow-[var(--color-brand)]/25"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/80"
                  }`}
                >
                  <tab.icon size={16} className="shrink-0" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Nav — current tab + menu trigger */}
        <div className="md:hidden border-t border-[var(--color-border)] bg-white/60 glass">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="w-full flex items-center justify-between px-4 py-2.5"
            aria-label="Open navigation menu"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
              {(() => {
                const cur = ALL_TABS.find((t) => t.key === activeTab);
                if (!cur) return "Menu";
                const Icon = cur.icon;
                return <><Icon size={15} className="text-[var(--color-brand)]" /> {cur.label}</>;
              })()}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)]">
              <Menu size={18} /> Menu
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-[95] bg-black/50" onClick={() => setMobileNavOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-[82%] max-w-xs bg-[var(--color-surface-elevated)] shadow-2xl flex flex-col animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <span className="font-display text-lg font-semibold">Menu</span>
              <button onClick={() => setMobileNavOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              {([
                { title: "Research & Analysis", tabs: NAV_ROW1 },
                { title: "Learn & Track", tabs: NAV_ROW2 },
              ] as const).map((group) => (
                <div key={group.title} className="mb-5">
                  <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]/70">
                    {group.title}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.tabs.map((tab) => {
                      const Icon = tab.icon;
                      const active = activeTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => { setActiveTab(tab.key); setMobileNavOpen(false); }}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            active
                              ? "bg-[var(--color-brand)] text-white shadow-sm"
                              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                          }`}
                        >
                          <Icon size={15} className={active ? "text-white" : "text-[var(--color-text-muted)]"} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Demo Banner */}
        {isDemo && activeTab === "home" && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-warning)]/8 border border-[var(--color-warning)]/15 text-[var(--color-warning)] text-xs">
            <AlertCircle size={14} />
            <span>
              Demo mode — showing sample Apple data. Add your free{" "}
              <strong>Financial Modeling Prep</strong> API key to{" "}
              <code className="bg-[var(--color-surface-card)] px-1.5 py-0.5 rounded text-[var(--color-warning)]">
                .env.local
              </code>{" "}
              for live data.
            </span>
          </div>
        )}

        {/* Market Tab */}
        {activeTab === "market" && (
          <div className="max-w-5xl mx-auto animate-fade-in-up">
            <MarketOverview />
          </div>
        )}

        {/* Screener Tab — Default Landing */}
        {activeTab === "screener" && (
          <div className="animate-fade-in-up">
            {/* Hero — editorial terminal thesis */}
            <div className="relative overflow-hidden rounded-2xl mb-8 premium-ink border-t-2 border-t-[var(--color-gold)]">
              {/* terminal grid texture */}
              <div className="absolute inset-0 hero-grid pointer-events-none" />

              {/* Animated market chart — right side, decorative, desktop only */}
              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[46%] pointer-events-none overflow-hidden" aria-hidden="true">
                <svg viewBox="0 0 520 360" className="absolute right-0 bottom-0 w-full h-full" preserveAspectRatio="xMaxYMax meet">
                  <defs>
                    <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00b84a" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#00b84a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* candlesticks */}
                  {[
                    { x: 70, o: 250, c: 220, h: 210, l: 262, up: true },
                    { x: 110, o: 222, c: 238, h: 214, l: 244, up: false },
                    { x: 150, o: 236, c: 200, h: 192, l: 242, up: true },
                    { x: 190, o: 202, c: 188, h: 178, l: 210, up: true },
                    { x: 230, o: 190, c: 206, h: 182, l: 214, up: false },
                    { x: 270, o: 204, c: 166, h: 158, l: 210, up: true },
                    { x: 310, o: 168, c: 150, h: 140, l: 176, up: true },
                    { x: 350, o: 152, c: 168, h: 144, l: 176, up: false },
                    { x: 390, o: 166, c: 120, h: 112, l: 170, up: true },
                    { x: 430, o: 122, c: 96, h: 88, l: 128, up: true },
                  ].map((b, i) => {
                    const col = b.up ? "#00b84a" : "#e5484d";
                    const top = Math.min(b.o, b.c);
                    const bh = Math.max(Math.abs(b.o - b.c), 3);
                    return (
                      <g key={i} className="hero-bar" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
                        <line x1={b.x} y1={b.h} x2={b.x} y2={b.l} stroke={col} strokeWidth="1.5" opacity="0.5" />
                        <rect x={b.x - 6} y={top} width="12" height={bh} rx="1.5" fill={col} opacity="0.55" />
                      </g>
                    );
                  })}
                  {/* trend area + line */}
                  <path className="hero-chart-area" d="M40 256 L90 232 L150 214 L210 196 L270 176 L330 150 L390 128 L450 100 L470 92 L470 360 L40 360 Z" fill="url(#heroArea)" />
                  <path className="hero-chart-line" d="M40 256 L90 232 L150 214 L210 196 L270 176 L330 150 L390 128 L450 100 L470 92" fill="none" stroke="#1fd35e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle className="hero-chart-dot" cx="470" cy="92" r="5" fill="#1fd35e" />
                </svg>
              </div>

              <div className="relative px-6 sm:px-10 py-12 sm:py-16 max-w-3xl">
                <div className="inline-flex items-center gap-2 mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-gold-light)]">
                  <Sparkles size={13} />
                  Free — for every student who dreams to learn
                </div>

                <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.05] font-semibold mb-5">
                  Learn the markets
                  <br className="hidden sm:block" />{" "}
                  like a professional.
                </h1>

                <p className="text-[15px] sm:text-base text-gray-400 max-w-xl leading-relaxed mb-8">
                  Institutional-grade research, live market data, hands-on paper trading, and a
                  verifiable certificate — at zero cost, anywhere in the world.
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-10">
                  <button
                    onClick={() => setActiveTab("lessons")}
                    className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[var(--color-brand)] text-white text-[15px] font-semibold hover:bg-[var(--color-brand-light)] transition-all shadow-lg shadow-[var(--color-brand)]/25 hover:shadow-[var(--color-brand)]/40"
                  >
                    Start learning — free
                    <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={() => setActiveTab("paper")}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 border border-white/20 text-white text-[15px] font-semibold hover:bg-white/15 transition-colors backdrop-blur-sm"
                  >
                    <TrendingUp size={17} />
                    Start paper trading
                  </button>
                </div>

                {/* Stat strip — quiet, monospace, terminal-style */}
                <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-6 border-t border-white/10">
                  {[
                    { value: "5,000+", label: "stocks covered" },
                    { value: "12", label: "guided courses" },
                    { value: "$1M", label: "paper capital" },
                    { value: "210+", label: "quiz questions" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-baseline gap-2">
                      <span className="font-mono text-lg font-bold text-white tabular-nums">{s.value}</span>
                      <span className="text-[11px] text-gray-500 uppercase tracking-wide">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust strip */}
            <div className="relative mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden animate-fade-in-up">
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
              <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 px-5 py-3.5">
                {[
                  "100% free — no credit card",
                  "Live market data",
                  "Verifiable certificates",
                  "Built for students worldwide",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
                    <CheckCircle2 size={15} className="text-[var(--color-positive)] shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Access Cards — distinct accent per feature, disciplined */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-in-up animate-delay-100">
              {[
                { tab: "paper" as Tab, icon: DollarSign, label: "Paper Trade", desc: "Practice risk-free", color: "#0a7c3f", bg: "rgba(10,124,63,0.10)" },
                { tab: "lessons" as Tab, icon: BookMarked, label: "Learn", desc: "12 guided courses", color: "#185fa5", bg: "rgba(24,95,165,0.10)" },
                { tab: "heatmap" as Tab, icon: LayoutGrid, label: "Heatmap", desc: "Sector performance", color: "#6d28d9", bg: "rgba(109,40,217,0.10)" },
                { tab: "quiz" as Tab, icon: GraduationCap, label: "Quiz", desc: "210+ questions", color: "#a8851a", bg: "rgba(184,147,47,0.12)" },
              ].map((card) => (
                <button
                  key={card.label}
                  onClick={() => setActiveTab(card.tab)}
                  className="card-glow bg-[var(--color-surface-elevated)] rounded-xl p-5 text-left border border-[var(--color-border)] group relative overflow-hidden"
                >
                  <span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300" style={{ background: card.color }} />
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105" style={{ background: card.bg }}>
                    <card.icon size={20} style={{ color: card.color }} />
                  </div>
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{card.label}</h4>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{card.desc}</p>
                </button>
              ))}
            </div>

            {/* Screener Component */}
            <div className="max-w-5xl mx-auto animate-fade-in-up animate-delay-200">
              <StockScreener onSelect={fetchStock} />
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <EarningsCalendar onSelect={fetchStock} />
          </div>
        )}

        {/* Paper Trading Tab */}
        {activeTab === "paper" && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <PaperTrading onSelect={fetchStock} />
          </div>
        )}

        {/* Quiz / Learn Tab */}
        {activeTab === "quiz" && (
          <div className="animate-fade-in-up">
            <FinanceQuiz />
          </div>
        )}

        {/* Glossary Tab */}
        {activeTab === "glossary" && (
          <div className="animate-fade-in-up">
            <Glossary />
          </div>
        )}

        {/* Trade Journal Tab */}
        {activeTab === "journal" && (
          <div className="animate-fade-in-up">
            <TradeJournal />
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === "lessons" && (
          <div className="max-w-5xl mx-auto animate-fade-in-up">
            <ProgressDashboard onContinue={(id) => setOpenLessonId(id)} />
            <LessonsHub
              openLessonId={openLessonId}
              onLessonOpened={() => setOpenLessonId(null)}
              onNavigateToQuiz={() => setActiveTab("quiz")}
              onNavigateToCerts={() => setActiveTab("certificates")}
            />
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="animate-fade-in-up">
            <Achievements />
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div className="animate-fade-in-up">
            <Leaderboard />
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === "compare" && (
          <div className="animate-fade-in-up">
            <StockCompare />
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <div className="animate-fade-in-up">
            <InvestmentCalculator />
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === "heatmap" && (
          <div className="max-w-5xl mx-auto animate-fade-in-up">
            <SectorHeatmap />
          </div>
        )}

        {/* Earnings Transcripts Tab */}
        {activeTab === "transcripts" && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <EarningsTranscripts />
          </div>
        )}

        {/* Economic Calendar Tab */}
        {activeTab === "economy" && (
          <div className="max-w-5xl mx-auto animate-fade-in-up">
            <EconomicCalendar />
          </div>
        )}

        {/* Analytics Tab — Company Outlook + Portfolio risk */}
        {activeTab === "analytics" && (
          <div className="max-w-5xl mx-auto animate-fade-in-up">
            <div className="flex gap-2 mb-6">
              {([
                { key: "outlook" as const, label: "Company Outlook" },
                { key: "portfolio" as const, label: "My Portfolio" },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setAnalyticsView(t.key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    analyticsView === t.key
                      ? "bg-[var(--color-ink)] text-white"
                      : "bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {analyticsView === "outlook" ? (
              <CompanyOutlook />
            ) : (
              <PortfolioAnalytics onStartTrading={() => setActiveTab("paper")} />
            )}
          </div>
        )}

        {/* Financial Ratios Guide Tab */}
        {activeTab === "ratios" && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <RatioExplainer />
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === "certificates" && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <CertificateGenerator />
          </div>
        )}

        {/* Watchlist Tab */}
        {activeTab === "watchlist" && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                <Star size={28} className="text-white" />
              </div>
              <h2 className="font-display text-[28px] font-semibold mb-2">Watchlist</h2>
              <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
                Monitor price movements on the equities that matter to you
              </p>
            </div>
            <WatchlistPanel onSelect={fetchStock} refreshKey={refreshKey} />
            <PriceAlerts />
            <NewsFeed isDemo />
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === "portfolio" && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                <Briefcase size={28} className="text-white" />
              </div>
              <h2 className="font-display text-[28px] font-semibold mb-2">Portfolio</h2>
              <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
                Track holdings, cost basis, and unrealized P&L at a glance
              </p>
            </div>
            <PortfolioPanel onSelect={fetchStock} refreshKey={refreshKey} />
            <NewsFeed isDemo />
          </div>
        )}

        {/* Home / Research Tab */}
        {activeTab === "home" && (
          <>
            {!data && !loading && !error ? (
              /* Landing State — Robinhood-style */
              <div className="animate-fade-in-up">
                {/* Hero Section */}
                <div className="relative text-center py-16 mb-10">
                  <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brand)]/5 via-transparent to-transparent rounded-3xl pointer-events-none" />
                  <div className="relative">
                    <div className="flex justify-center mb-6">
                      <LogoHero />
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/20 text-[var(--color-brand)] text-xs font-medium mb-6">
                      <Zap size={12} />
                      Your Equity Research Terminal
                    </div>
                    <h2 className="font-display text-4xl sm:text-5xl font-semibold mb-4 leading-[1.08] text-[var(--color-text-primary)]">
                      Invest with{" "}
                      <span className="text-[var(--color-brand)]">
                        Confidence
                      </span>
                    </h2>
                    <p className="text-[var(--color-text-secondary)] text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                      Professional-grade research, real-time market intelligence,
                      and hands-on practice — everything you need to make informed decisions.
                    </p>

                    {/* Inline Search CTA */}
                    <div className="max-w-lg mx-auto mb-8">
                      <SearchBar onSearch={fetchStock} loading={loading} />
                    </div>

                    {/* Popular Tickers */}
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                        Popular
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {POPULAR.map((ticker) => (
                          <button
                            key={ticker}
                            onClick={() => fetchStock(ticker)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white border border-[var(--color-border)] rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:border-[var(--color-brand)]/30 hover:bg-[var(--color-brand)]/5 transition-all shadow-sm"
                          >
                            <CompanyLogo symbol={ticker} size={18} />
                            {ticker}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Global Market Indices Ticker */}
                <div className="mb-10 animate-fade-in-up animate-delay-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe size={16} className="text-[var(--color-brand)]" />
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Global Markets
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {globalIndices.map((idx) => (
                      <div
                        key={idx.name}
                        className="bg-white border border-[var(--color-border)] rounded-xl p-3.5 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-sm">{idx.flag}</span>
                          <span className="text-[10px] font-medium text-[var(--color-text-muted)] truncate">
                            {idx.name}
                          </span>
                        </div>
                        <p className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
                          {idx.value}
                        </p>
                        <p
                          className={`text-xs font-semibold tabular-nums mt-0.5 ${
                            idx.positive
                              ? "text-[var(--color-positive)]"
                              : "text-[var(--color-negative)]"
                          }`}
                        >
                          {idx.change}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crypto Prices */}
                <div className="mb-10 animate-fade-in-up animate-delay-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bitcoin size={16} className="text-[#f7931a]" />
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Crypto
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("paper")}
                      className="text-xs font-medium text-[var(--color-brand)] hover:underline flex items-center gap-1"
                    >
                      Trade Crypto <ArrowRight size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {cryptoPrices.map((coin) => (
                      <button
                        key={coin.symbol}
                        onClick={() => {
                          setActiveTab("paper");
                        }}
                        className="bg-white border border-[var(--color-border)] rounded-xl p-3.5 hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <CompanyLogo symbol={coin.symbol} size={18} />
                          <span className="text-[10px] font-medium text-[var(--color-text-muted)] truncate group-hover:text-[var(--color-text-primary)] transition-colors">
                            {coin.name}
                          </span>
                        </div>
                        <p className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
                          ${coin.price}
                        </p>
                        <p
                          className={`text-xs font-semibold tabular-nums mt-0.5 ${
                            coin.positive
                              ? "text-[var(--color-positive)]"
                              : "text-[var(--color-negative)]"
                          }`}
                        >
                          {coin.change}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trending + News Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in-up animate-delay-200">
                  {/* Trending Stocks */}
                  <div className="lg:col-span-2">
                    <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden h-full shadow-sm">
                      <div className="p-4 border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={14} className="text-[var(--color-brand)]" />
                          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                            Trending Today
                          </h3>
                        </div>
                      </div>
                      <div>
                        {TRENDING.map((stock, i) => (
                          <button
                            key={stock.symbol}
                            onClick={() => fetchStock(stock.symbol)}
                            className="w-full flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-hover)] transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-medium text-[var(--color-text-muted)] w-4">
                                {i + 1}
                              </span>
                              <CompanyLogo symbol={stock.symbol} size={28} />
                              <div className="text-left">
                                <p className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors">
                                  {stock.symbol}
                                </p>
                                <p className="text-[11px] text-[var(--color-text-muted)]">
                                  {stock.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold tabular-nums ${
                                  stock.change >= 0
                                    ? "text-[var(--color-positive)]"
                                    : "text-[var(--color-negative)]"
                                }`}
                              >
                                {stock.change >= 0 ? "+" : ""}
                                {stock.change.toFixed(2)}%
                              </span>
                              <ArrowRight
                                size={12}
                                className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Market News */}
                  <div className="lg:col-span-3">
                    <NewsFeed isDemo />
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-10 animate-fade-in-up animate-delay-300">
                  <button
                    onClick={() => setActiveTab("market")}
                    className="card-glow bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:border-[var(--color-brand)]/30 transition-all group shadow-sm"
                  >
                    <FeatureIcon type="market" className="mb-3" />
                    <h4 className="text-sm font-bold mb-1 group-hover:text-[var(--color-brand)] transition-colors">
                      Market Pulse
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      Live sector heatmaps, global indices, and breadth indicators
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("screener")}
                    className="card-glow bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:border-[var(--color-brand)]/30 transition-all group shadow-sm"
                  >
                    <FeatureIcon type="screener" className="mb-3" />
                    <h4 className="text-sm font-bold mb-1 group-hover:text-[var(--color-brand)] transition-colors">
                      Stock Screener
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      Filter 5,000+ equities by fundamentals, sector, and valuation
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("earnings")}
                    className="card-glow bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:border-[var(--color-brand)]/30 transition-all group shadow-sm"
                  >
                    <FeatureIcon type="earnings" className="mb-3" />
                    <h4 className="text-sm font-bold mb-1 group-hover:text-[var(--color-brand)] transition-colors">
                      Earnings Calendar
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      Upcoming reports, consensus estimates, and surprise history
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("paper")}
                    className="card-glow bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:border-[var(--color-brand)]/30 transition-all group shadow-sm"
                  >
                    <FeatureIcon type="trade" className="mb-3" />
                    <h4 className="text-sm font-bold mb-1 group-hover:text-[var(--color-brand)] transition-colors">
                      Paper Trading
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      Practice with $1M virtual capital — zero risk, real strategy
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("quiz")}
                    className="card-glow bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:border-[var(--color-brand)]/30 transition-all group shadow-sm"
                  >
                    <FeatureIcon type="quiz" className="mb-3" />
                    <h4 className="text-sm font-bold mb-1 group-hover:text-[var(--color-brand)] transition-colors">
                      Finance Quizzes
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      210 questions across 14 topics — test what you know
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("glossary")}
                    className="card-glow bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:border-[var(--color-brand)]/30 transition-all group shadow-sm"
                  >
                    <FeatureIcon type="glossary" className="mb-3" />
                    <h4 className="text-sm font-bold mb-1 group-hover:text-[var(--color-brand)] transition-colors">
                      Finance Dictionary
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      140+ essential terms with clear, plain-language definitions
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("lessons")}
                    className="card-glow bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:border-[var(--color-brand)]/30 transition-all group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm mb-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="3" y="2" width="14" height="16" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
                        <line x1="7" y1="7" x2="13" y2="7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1="7" y1="10" x2="13" y2="10" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1="7" y1="13" x2="11" y2="13" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold mb-1 group-hover:text-[var(--color-brand)] transition-colors">
                      Guided Lessons
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      6 structured courses with AI study coach and key takeaways
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("compare")}
                    className="card-glow bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:border-[var(--color-brand)]/30 transition-all group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm mb-3">
                      <Scale size={20} className="text-white" />
                    </div>
                    <h4 className="text-sm font-bold mb-1 group-hover:text-[var(--color-brand)] transition-colors">
                      Stock Compare
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      Compare up to 4 stocks side-by-side on 18 key metrics
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("calculator")}
                    className="card-glow bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:border-[var(--color-brand)]/30 transition-all group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm mb-3">
                      <Calculator size={20} className="text-white" />
                    </div>
                    <h4 className="text-sm font-bold mb-1 group-hover:text-[var(--color-brand)] transition-colors">
                      Invest Calculator
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      Compound growth, DCA, and goal planning calculators
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("achievements")}
                    className="card-glow bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:border-[var(--color-brand)]/30 transition-all group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm mb-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 3H16L14 10H6L4 3Z" stroke="white" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                        <line x1="10" y1="10" x2="10" y2="14" stroke="white" strokeWidth="1.5" />
                        <line x1="7" y1="14" x2="13" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold mb-1 group-hover:text-[var(--color-brand)] transition-colors">
                      Achievements
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      Earn badges as you learn, trade, and build your portfolio
                    </p>
                  </button>
                </div>

                <footer className="text-center py-10 text-xs text-[var(--color-text-muted)] space-y-2">
                  <p>Market data via Yahoo Finance · prices may be delayed · not financial advice.</p>
                  <p>
                    Questions or suggestions?{" "}
                    <a href="https://wa.me/15403979223" target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand)] hover:underline font-medium">WhatsApp</a>
                    {" · "}
                    <a href="mailto:mokshaglobal.org@gmail.com" className="text-[var(--color-brand)] hover:underline font-medium">mokshaglobal.org@gmail.com</a>
                  </p>
                </footer>
              </div>
            ) : data ? (
              /* Research Dashboard */
              <div className="space-y-6 animate-fade-in-up">
                {/* Back to search/screener */}
                <button
                  onClick={() => { setData(null); setActiveSymbol(null); setError(null); }}
                  className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <ArrowLeft size={14} /> Back to search
                </button>
                {/* Stock Header + Actions */}
                <div>
                  <StockHeader data={data} />
                  <div className="flex items-center gap-2 mt-3">
                    <WatchlistButton
                      symbol={data.profile.symbol}
                      name={data.profile.companyName}
                      price={data.quote.price}
                      change={data.quote.change}
                      onUpdate={refresh}
                    />
                    <AddToPortfolio
                      symbol={data.profile.symbol}
                      name={data.profile.companyName}
                      currentPrice={data.quote.price}
                      onAdd={refresh}
                    />
                    <QuickTrade
                      symbol={data.profile.symbol}
                      name={data.profile.companyName}
                      price={data.quote.price}
                    />
                  </div>
                </div>

                {/* Row 1: Price chart + technicals (left) · stats + about (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2 space-y-6">
                    <PriceChart history={data.history} />
                    <TechnicalIndicators
                      history={data.history}
                      currentPrice={data.quote.price}
                    />
                  </div>
                  <div className="space-y-6">
                    <QuickStats data={data} />
                    <CompanyOverview profile={data.profile} />
                  </div>
                </div>

                {/* Row 2: AI Analysis + Score card + Margin trend (equities only) */}
                {hasFinancials && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <AIAnalyst data={data} />
                    <ScoreCard data={data} />
                    <MarginTrend income={data.income} />
                  </div>
                )}

                {/* Key Metrics (equities only) */}
                {hasFinancials && <KeyMetricsGrid data={data} />}

                {/* DCF Valuation Model + Dividend Analysis (equities only) */}
                {hasFinancials && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <DCFModel data={data} />
                    </div>
                    <DividendHistory data={data} />
                  </div>
                )}

                {/* Row 3: Revenue + Peer Benchmark bar chart (equities only) */}
                {hasFinancials && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RevenueChart income={data.income} />
                    {peers && peers.length > 1 && (
                      <PeerBarChart peers={peers} />
                    )}
                  </div>
                )}

                {/* Stock News */}
                <NewsFeed symbol={activeSymbol ?? undefined} name={data?.profile?.companyName} isDemo={isDemo} />

                {/* Peer Comparison Table */}
                {peers && peers.length > 1 && (
                  <PeerComparison peers={peers} />
                )}

                {/* Income Statement (equities only) */}
                {hasFinancials && <FinancialTable income={data.income} />}

                {/* Data attribution — credibility */}
                <p className="text-[11px] text-[var(--color-text-muted)] text-center pt-2 pb-1 leading-relaxed">
                  Market data via Yahoo Finance · prices may be delayed and are for educational use only · not investment advice
                </p>
              </div>
            ) : loading ? (
              <StockDetailSkeleton />
            ) : error ? (
              <div className="max-w-md mx-auto text-center py-16 animate-fade-in-up">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-warning)]/10 flex items-center justify-center mx-auto mb-5">
                  <AlertCircle size={26} className="text-[var(--color-warning)]" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Couldn&apos;t load that stock</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6">{error}</p>
                <div className="flex items-center justify-center gap-2.5">
                  {activeSymbol && (
                    <button
                      onClick={() => fetchStock(activeSymbol)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dim)] transition-colors"
                    >
                      <RefreshCw size={15} /> Try again
                    </button>
                  )}
                  <button
                    onClick={() => { setError(null); setActiveSymbol(null); setActiveTab("screener"); }}
                    className="inline-flex items-center px-5 py-2.5 rounded-full border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    Back to screener
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </main>

      <Footer
        onNavigate={(t) => {
          setActiveTab(t as Tab);
          if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
      <CookieConsent />
    </div>
  );
}
