"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Search,
  History,
  PieChart,
  Wallet,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  Clock,
  Award,
  Layers,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getUSMarketStatus, type MarketStatus } from "@/lib/market-hours";
import {
  getPaperPortfolio,
  paperBuy,
  paperSell,
  resetPaperPortfolio,
  type PaperPortfolio,
} from "@/lib/storage";
import { searchStocks, STOCK_DATABASE, type SearchItem } from "@/lib/search-data";

interface Props {
  onSelect: (symbol: string) => void;
}

type TradeTab = "portfolio" | "trade" | "history" | "analytics";
type OrderType = "market" | "limit" | "stop" | "stop_limit" | "trailing_stop";
type BuyMode = "shares" | "dollars" | "recurring";

const SECTORS = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Consumer Cyclical",
  "Communication Services",
  "Industrials",
  "Consumer Defensive",
  "Energy",
  "Crypto",
  "Real Estate",
  "Utilities",
  "Basic Materials",
];

const ORDER_TYPES: { key: OrderType; label: string; desc: string }[] = [
  { key: "market", label: "Market Order", desc: "Buy or sell immediately at the current market price" },
  { key: "limit", label: "Limit Order", desc: "Set a maximum buy price or minimum sell price" },
  { key: "stop", label: "Stop Order", desc: "Triggers a market order when price reaches your stop" },
  { key: "stop_limit", label: "Stop Limit", desc: "Triggers a limit order when price hits your stop" },
  { key: "trailing_stop", label: "Trailing Stop", desc: "Stop price trails the market by a percentage" },
];

export default function PaperTrading({ onSelect }: Props) {
  const [portfolio, setPortfolio] = useState<PaperPortfolio | null>(null);
  const [activeTab, setActiveTab] = useState<TradeTab>("portfolio");
  const [tradeSymbol, setTradeSymbol] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [tradeShares, setTradeShares] = useState("");
  const [tradePrice, setTradePrice] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [buyMode, setBuyMode] = useState<BuyMode>("shares");
  const [dollarAmount, setDollarAmount] = useState("");
  const [trailingPercent, setTrailingPercent] = useState("");
  const [stopLimitPrice, setStopLimitPrice] = useState("");
  const [recurringFreq, setRecurringFreq] = useState<"daily" | "weekly" | "biweekly" | "monthly">("weekly");
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [sectorStocks, setSectorStocks] = useState<any[]>([]);
  const [sectorLoading, setSectorLoading] = useState(false);
  const [sectorSearch, setSectorSearch] = useState("");
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [market, setMarket] = useState<MarketStatus>(() => getUSMarketStatus());

  // Keep the live market clock fresh (re-checks open/closed each minute).
  useEffect(() => {
    const tick = () => setMarket(getUSMarketStatus());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const p = getPaperPortfolio();
    setPortfolio(p);
    fetchLivePrices(p);

    const interval = setInterval(() => {
      const current = getPaperPortfolio();
      setPortfolio(current);
      fetchLivePrices(current);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLivePrices(p: PaperPortfolio) {
    const symbols = Object.keys(p.holdings);
    if (symbols.length === 0) return;
    const prices: Record<string, number> = {};
    await Promise.all(
      symbols.map(async (sym) => {
        try {
          const res = await fetch(`/api/quote?symbol=${encodeURIComponent(sym)}`);
          const json = await res.json();
          if (json.price) prices[sym] = json.price;
        } catch {}
      })
    );
    setLivePrices((prev) => ({ ...prev, ...prices }));
  }

  const fetchPrice = useCallback(async (symbol: string) => {
    setPriceLoading(true);
    try {
      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
      const json = await res.json();
      if (json.price) {
        setTradePrice(json.price.toFixed(2));
      }
    } catch {} finally {
      setPriceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeSector || sectorStocks.length === 0) return;
    const interval = setInterval(async () => {
      const batch = sectorStocks.slice(0, 20);
      const prices: Record<string, number> = {};
      await Promise.all(
        batch.map(async (s) => {
          try {
            const res = await fetch(`/api/quote?symbol=${encodeURIComponent(s.symbol)}`);
            const json = await res.json();
            if (json.price) prices[s.symbol] = json.price;
          } catch {}
        })
      );
      setSectorStocks((prev) =>
        prev.map((s) => (prices[s.symbol] ? { ...s, price: prices[s.symbol] } : s))
      );
    }, 30000);
    return () => clearInterval(interval);
  }, [activeSector, sectorStocks.length]);

  useEffect(() => {
    if (!tradeSymbol) return;
    const interval = setInterval(() => {
      fetch(`/api/quote?symbol=${encodeURIComponent(tradeSymbol)}`)
        .then((r) => r.json())
        .then((json) => { if (json.price) setTradePrice(json.price.toFixed(2)); })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [tradeSymbol]);

  async function fetchSectorStocks(sector: string) {
    setActiveSector(sector);
    setSectorLoading(true);
    setSectorStocks([]);
    setSectorSearch("");

    const SECTOR_STOCKS: Record<string, { symbol: string; companyName: string }[]> = {
      Crypto: STOCK_DATABASE.filter((s) => s.exchange === "CRYPTO").map((s) => ({ symbol: s.symbol, companyName: s.name })),
      Technology: [
        { symbol: "AAPL", companyName: "Apple Inc." }, { symbol: "MSFT", companyName: "Microsoft Corp." },
        { symbol: "NVDA", companyName: "NVIDIA Corp." }, { symbol: "GOOGL", companyName: "Alphabet Inc." },
        { symbol: "META", companyName: "Meta Platforms" }, { symbol: "TSLA", companyName: "Tesla Inc." },
        { symbol: "AVGO", companyName: "Broadcom Inc." }, { symbol: "AMD", companyName: "AMD Inc." },
        { symbol: "CRM", companyName: "Salesforce Inc." }, { symbol: "ADBE", companyName: "Adobe Inc." },
        { symbol: "INTC", companyName: "Intel Corp." }, { symbol: "CSCO", companyName: "Cisco Systems" },
        { symbol: "ORCL", companyName: "Oracle Corp." }, { symbol: "QCOM", companyName: "Qualcomm" },
        { symbol: "IBM", companyName: "IBM Corp." }, { symbol: "NFLX", companyName: "Netflix Inc." },
      ],
      Healthcare: [
        { symbol: "UNH", companyName: "UnitedHealth Group" }, { symbol: "JNJ", companyName: "Johnson & Johnson" },
        { symbol: "LLY", companyName: "Eli Lilly" }, { symbol: "ABBV", companyName: "AbbVie Inc." },
        { symbol: "MRK", companyName: "Merck & Co." }, { symbol: "TMO", companyName: "Thermo Fisher" },
        { symbol: "ABT", companyName: "Abbott Labs" }, { symbol: "PFE", companyName: "Pfizer Inc." },
      ],
      "Financial Services": [
        { symbol: "JPM", companyName: "JPMorgan Chase" }, { symbol: "V", companyName: "Visa Inc." },
        { symbol: "MA", companyName: "Mastercard" }, { symbol: "BAC", companyName: "Bank of America" },
        { symbol: "GS", companyName: "Goldman Sachs" }, { symbol: "MS", companyName: "Morgan Stanley" },
        { symbol: "PYPL", companyName: "PayPal Holdings" }, { symbol: "AXP", companyName: "American Express" },
      ],
      "Consumer Cyclical": [
        { symbol: "AMZN", companyName: "Amazon.com" }, { symbol: "HD", companyName: "Home Depot" },
        { symbol: "NKE", companyName: "Nike Inc." }, { symbol: "SBUX", companyName: "Starbucks" },
        { symbol: "TGT", companyName: "Target Corp." }, { symbol: "F", companyName: "Ford Motor" },
        { symbol: "GM", companyName: "General Motors" }, { symbol: "ABNB", companyName: "Airbnb Inc." },
      ],
      "Communication Services": [
        { symbol: "GOOG", companyName: "Alphabet (C)" }, { symbol: "DIS", companyName: "Walt Disney" },
        { symbol: "T", companyName: "AT&T Inc." }, { symbol: "VZ", companyName: "Verizon" },
        { symbol: "SNAP", companyName: "Snap Inc." }, { symbol: "SPOT", companyName: "Spotify" },
      ],
      Industrials: [
        { symbol: "CAT", companyName: "Caterpillar" }, { symbol: "BA", companyName: "Boeing Co." },
        { symbol: "GE", companyName: "GE Aerospace" }, { symbol: "UPS", companyName: "United Parcel Service" },
        { symbol: "HON", companyName: "Honeywell" }, { symbol: "DE", companyName: "Deere & Co." },
      ],
      "Consumer Defensive": [
        { symbol: "WMT", companyName: "Walmart Inc." }, { symbol: "PG", companyName: "Procter & Gamble" },
        { symbol: "KO", companyName: "Coca-Cola" }, { symbol: "PEP", companyName: "PepsiCo" },
        { symbol: "COST", companyName: "Costco Wholesale" }, { symbol: "CL", companyName: "Colgate-Palmolive" },
      ],
      Energy: [
        { symbol: "XOM", companyName: "Exxon Mobil" }, { symbol: "CVX", companyName: "Chevron Corp." },
        { symbol: "COP", companyName: "ConocoPhillips" }, { symbol: "SLB", companyName: "Schlumberger" },
        { symbol: "EOG", companyName: "EOG Resources" }, { symbol: "OXY", companyName: "Occidental Petroleum" },
      ],
    };

    const stocks = SECTOR_STOCKS[sector] || SECTOR_STOCKS["Technology"];
    const initial = stocks.map((s) => ({ ...s, price: 0, sector }));
    setSectorStocks(initial);

    try {
      const res = await fetch(`/api/screener?sector=${encodeURIComponent(sector)}&limit=50`);
      const json = await res.json();
      if (json.results && json.error !== "demo") {
        setSectorStocks(json.results);
        setSectorLoading(false);
        return;
      }
    } catch {}

    const prices: Record<string, number> = {};
    const batch = stocks.slice(0, 20);
    await Promise.all(
      batch.map(async (s) => {
        try {
          const res = await fetch(`/api/quote?symbol=${encodeURIComponent(s.symbol)}`);
          const json = await res.json();
          if (json.price) prices[s.symbol] = json.price;
        } catch {}
      })
    );
    setSectorStocks(
      stocks.map((s) => ({ ...s, price: prices[s.symbol] || 0, sector }))
    );
    setSectorLoading(false);
  }

  function selectSectorStock(stock: any) {
    setTradeSymbol(stock.symbol);
    setTradeName(stock.companyName);
    setSearchQuery(stock.symbol);
    setActiveSector(null);
    if (stock.price && stock.price > 0) setTradePrice(stock.price.toFixed(2));
    fetchPrice(stock.symbol);
  }

  function handleSearchStock(query: string) {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    const local = searchStocks(query, 6);
    setSearchResults(local);
    setShowSearch(true);

    if (query.length >= 2) {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.results?.length > 0) {
            const localSymbols = new Set(local.map((l) => l.symbol));
            const extra = json.results
              .filter((r: SearchItem) => !localSymbols.has(r.symbol))
              .slice(0, 6);
            setSearchResults([...local, ...extra]);
          }
        })
        .catch(() => {});
    }
  }

  function selectStock(item: SearchItem) {
    setTradeSymbol(item.symbol);
    setTradeName(item.name);
    setSearchQuery(item.symbol);
    setShowSearch(false);
    setSearchResults([]);
    fetchPrice(item.symbol);
  }

  function initSell(symbol: string) {
    if (!portfolio) return;
    const h = portfolio.holdings[symbol];
    if (!h) return;
    setTradeSymbol(symbol);
    setTradeName(h.name);
    setSearchQuery(symbol);
    setTradeType("sell");
    setActiveTab("trade");
    fetchPrice(symbol);
  }

  function initBuyMore(symbol: string) {
    if (!portfolio) return;
    const h = portfolio.holdings[symbol];
    if (!h) return;
    setTradeSymbol(symbol);
    setTradeName(h.name);
    setSearchQuery(symbol);
    setTradeType("buy");
    setActiveTab("trade");
    fetchPrice(symbol);
  }

  function getResolvedShares(): number {
    if (tradeType === "buy" && buyMode === "dollars") {
      const dollars = parseFloat(dollarAmount);
      const price = parseFloat(tradePrice);
      if (!dollars || !price || price <= 0) return 0;
      return Math.floor(dollars / price);
    }
    return parseInt(tradeShares) || 0;
  }

  function getResolvedPrice(): number {
    if (orderType === "market") return parseFloat(tradePrice) || 0;
    if (orderType === "trailing_stop") {
      const pct = parseFloat(trailingPercent) || 0;
      const mktPrice = parseFloat(tradePrice) || 0;
      return tradeType === "sell" ? mktPrice * (1 - pct / 100) : mktPrice * (1 + pct / 100);
    }
    if (orderType === "stop_limit") return parseFloat(stopLimitPrice || limitPrice || tradePrice) || 0;
    return parseFloat(limitPrice || tradePrice) || 0;
  }

  function handlePreConfirm() {
    setError("");
    setSuccess("");
    // Real exchanges only fill orders during the regular session — mirror that.
    const status = getUSMarketStatus();
    if (!status.isOpen) {
      setMarket(status);
      setError(`Market closed — orders fill during U.S. trading hours (9:30 AM–4:00 PM ET, Mon–Fri). ${status.detail}`);
      return;
    }
    if (!tradeSymbol) { setError("Select a stock"); return; }
    const shares = getResolvedShares();
    const price = getResolvedPrice();
    if (!shares || shares <= 0) {
      if (tradeType === "buy" && buyMode === "dollars") {
        setError("Enter a dollar amount (minimum enough for 1 share)");
      } else {
        setError("Enter valid number of shares");
      }
      return;
    }
    if (!price || price <= 0) { setError("Enter valid price"); return; }

    if (tradeType === "buy" && portfolio) {
      const total = shares * price;
      if (total > portfolio.cash) { setError(`Insufficient buying power. Need $${total.toLocaleString("en-US", { minimumFractionDigits: 2 })} — available $${portfolio.cash.toLocaleString("en-US", { minimumFractionDigits: 2 })}`); return; }
    }
    if (tradeType === "sell" && portfolio) {
      const h = portfolio.holdings[tradeSymbol];
      if (!h || h.shares < shares) { setError(`You own ${h?.shares ?? 0} shares of ${tradeSymbol}`); return; }
    }
    setShowConfirm(true);
  }

  function executeTrade() {
    setError("");
    setSuccess("");
    setShowConfirm(false);
    const shares = getResolvedShares();
    const price = getResolvedPrice();

    try {
      let updated: PaperPortfolio;
      if (tradeType === "buy") {
        updated = paperBuy(tradeSymbol, tradeName || tradeSymbol, shares, price);
      } else {
        updated = paperSell(tradeSymbol, tradeName || tradeSymbol, shares, price);
      }
      setPortfolio(updated);
      setLivePrices((prev) => ({ ...prev, [tradeSymbol]: price }));
      const total = shares * price;
      const orderLabel = orderType === "market" ? "" : ` (${ORDER_TYPES.find(o => o.key === orderType)?.label})`;
      const recurLabel = buyMode === "recurring" ? ` — ${recurringFreq} recurring` : "";
      setSuccess(
        `${tradeType === "buy" ? "Bought" : "Sold"} ${shares.toLocaleString()} shares of ${tradeSymbol} at $${price.toFixed(2)}${orderLabel}${recurLabel}`
      );
      setTradeShares("");
      setDollarAmount("");
      setTimeout(() => setActiveTab("portfolio"), 1500);
    } catch (e: any) {
      setError(e.message || "Trade failed");
    }
  }

  function handleReset() {
    const updated = resetPaperPortfolio();
    setPortfolio(updated);
    setShowReset(false);
    setSuccess("Account reset to $1,000,000");
    setActiveTab("portfolio");
  }

  if (!portfolio) return null;

  const holdingEntries = Object.entries(portfolio.holdings);
  const holdingsValue = holdingEntries.reduce((sum, [sym, h]) => {
    const price = livePrices[sym] || h.avgCost;
    return sum + h.shares * price;
  }, 0);
  const totalValue = portfolio.cash + holdingsValue;
  const totalReturn = totalValue - portfolio.startingBalance;
  const totalReturnPct = (totalReturn / portfolio.startingBalance) * 100;
  const numTrades = portfolio.trades.length;
  const buyTrades = portfolio.trades.filter((t) => t.type === "buy");
  const sellTrades = portfolio.trades.filter((t) => t.type === "sell");
  const totalBuyVolume = buyTrades.reduce((s, t) => s + t.total, 0);
  const totalSellVolume = sellTrades.reduce((s, t) => s + t.total, 0);
  const daysSinceStart = Math.max(1, Math.floor((Date.now() - new Date(portfolio.startDate).getTime()) / 86400000));
  const biggestHolding = [...holdingEntries].sort(([symA, a], [symB, b]) => {
    const priceA = livePrices[symA] || a.avgCost;
    const priceB = livePrices[symB] || b.avgCost;
    return b.shares * priceB - a.shares * priceA;
  })[0];

  const TABS: { key: TradeTab; label: string; icon: typeof Wallet }[] = [
    { key: "portfolio", label: "Investing", icon: PieChart },
    { key: "trade", label: "Trade", icon: ArrowUpRight },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "history", label: "Activity", icon: History },
  ];

  const execPrice = getResolvedPrice();
  const resolvedShares = getResolvedShares();
  const orderTotal = resolvedShares * execPrice;

  const filteredSectorStocks = sectorSearch
    ? sectorStocks.filter((s) =>
        s.symbol.toLowerCase().includes(sectorSearch.toLowerCase()) ||
        s.companyName?.toLowerCase().includes(sectorSearch.toLowerCase())
      )
    : sectorStocks;

  return (
    <div className="space-y-5">
      {/* Account Value — Robinhood-style hero */}
      <div className="pt-4 pb-1">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)] font-semibold mb-1.5">Portfolio value</p>
        <h2 className="font-display text-4xl sm:text-5xl font-semibold tabular-nums tracking-tight leading-none">
          {formatCurrency(totalValue)}
        </h2>
        <div className="mt-3">
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${totalReturn >= 0 ? "bg-[var(--color-positive)]/10 text-[var(--color-positive)]" : "bg-[var(--color-negative)]/10 text-[var(--color-negative)]"}`}>
            {totalReturn >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            {totalReturn >= 0 ? "+" : ""}{formatCurrency(Math.abs(totalReturn))} ({totalReturn >= 0 ? "+" : ""}{totalReturnPct.toFixed(2)}%)
            <span className="font-normal opacity-70">· all time</span>
          </span>
        </div>
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          {[
            { label: "Buying power", value: formatCurrency(portfolio.cash), accent: "text-[var(--color-positive)]" },
            { label: "Positions", value: String(holdingEntries.length), accent: "text-[var(--color-text-primary)]" },
            { label: "Trades", value: String(numTrades), accent: "text-[var(--color-text-primary)]" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)] mb-1">{s.label}</p>
              <p className={`text-base font-bold tabular-nums ${s.accent}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Allocation Bar */}
      <div>
        <div className="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden flex">
          <div className="h-full bg-[var(--color-positive)] transition-all" style={{ width: `${(holdingsValue / Math.max(totalValue, 1)) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
          <span>Stocks {((holdingsValue / Math.max(totalValue, 1)) * 100).toFixed(0)}%</span>
          <span>Cash {((portfolio.cash / Math.max(totalValue, 1)) * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[var(--color-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setError(""); setSuccess(""); }}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-[var(--color-positive)] text-[var(--color-text-primary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Success / Error Banners */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/20 text-sm text-[var(--color-positive)]">
          <CheckCircle2 size={16} />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess("")}><X size={14} /></button>
        </div>
      )}
      {error && activeTab !== "trade" && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-negative)]/10 border border-[var(--color-negative)]/20 text-sm text-[var(--color-negative)]">
          <AlertTriangle size={16} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      {/* ═══ INVESTING TAB ═══ */}
      {activeTab === "portfolio" && (
        <div>
          {holdingEntries.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Stocks</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setTradeType("buy"); setActiveTab("trade"); setTradeSymbol(""); setSearchQuery(""); setTradeShares(""); setTradePrice(""); }}
                    className="text-xs font-semibold text-[var(--color-positive)] hover:underline"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setShowReset(true)}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-negative)]"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {holdingEntries
                  .sort(([symA, a], [symB, b]) => {
                    const priceA = livePrices[symA] || a.avgCost;
                    const priceB = livePrices[symB] || b.avgCost;
                    return b.shares * priceB - a.shares * priceA;
                  })
                  .map(([symbol, h]) => {
                    const curPrice = livePrices[symbol] || h.avgCost;
                    const value = h.shares * curPrice;
                    const costBasis = h.shares * h.avgCost;
                    const pnl = value - costBasis;
                    const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
                    const hasLive = !!livePrices[symbol];
                    return (
                      <div key={symbol} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-[var(--color-surface-hover)] -mx-2 px-2 rounded-lg transition-colors">
                        <div className="flex items-center gap-3" onClick={() => onSelect(symbol)}>
                          <div className="w-10 h-10 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold text-[var(--color-text-primary)]">
                            {symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{symbol}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{h.shares.toLocaleString()} shares</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-semibold tabular-nums">{formatCurrency(value)}</p>
                            {hasLive ? (
                              <p className={`text-xs tabular-nums font-medium ${pnl >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
                                {pnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(pnl))} ({pnl >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)
                              </p>
                            ) : (
                              <p className="text-xs text-[var(--color-text-muted)] tabular-nums">${h.avgCost.toFixed(2)}/share</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); initBuyMore(symbol); }}
                              className="px-2 py-1 rounded text-[10px] font-semibold text-[var(--color-positive)] bg-[var(--color-positive)]/10 hover:bg-[var(--color-positive)]/20"
                            >
                              Buy
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); initSell(symbol); }}
                              className="px-2 py-1 rounded text-[10px] font-semibold text-[var(--color-negative)] bg-[var(--color-negative)]/10 hover:bg-[var(--color-negative)]/20"
                            >
                              Sell
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
                <Wallet size={28} className="text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Investing</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-xs mx-auto">
                You have ${(1_000_000).toLocaleString()} in buying power. Search for a stock and place your first trade.
              </p>
              <button
                onClick={() => { setActiveTab("trade"); setTradeType("buy"); }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-positive)] text-black text-sm font-bold hover:bg-[var(--color-brand-light)] transition-colors"
              >
                Search Stocks
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ TRADE TAB ═══ */}
      {activeTab === "trade" && (
        <div className="space-y-5">
          {/* Buy / Sell Toggle */}
          <div className="flex items-center gap-0 bg-[var(--color-surface-elevated)] rounded-full p-1 border border-[var(--color-border)]">
            <button
              onClick={() => setTradeType("buy")}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                tradeType === "buy" ? "bg-[var(--color-positive)] text-black" : "text-[var(--color-text-muted)]"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setTradeType("sell")}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                tradeType === "sell" ? "bg-[var(--color-negative)] text-white" : "text-[var(--color-text-muted)]"
              }`}
            >
              Sell
            </button>
          </div>

          {/* Stock Search */}
          <div className="relative">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchStock(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowSearch(true); }}
                placeholder="Search stocks..."
                className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-full pl-11 pr-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-positive)] transition-colors"
              />
            </div>
            {showSearch && searchResults.length > 0 && (
              <div className="absolute z-20 top-full mt-2 w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden max-h-[280px] overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => selectStock(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[10px] font-bold">
                      {item.symbol.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{item.symbol}</p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">{item.name}</p>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{item.exchange}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Browse by Sector */}
          {!tradeSymbol && !activeSector && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers size={14} className="text-[var(--color-text-muted)]" />
                <h4 className="text-sm font-semibold text-[var(--color-text-secondary)]">Browse by Sector</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SECTORS.map((sector) => (
                  <button
                    key={sector}
                    onClick={() => fetchSectorStocks(sector)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-left hover:border-[var(--color-positive)]/30 hover:bg-[var(--color-surface-hover)] transition-all group"
                  >
                    <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">{sector}</span>
                    <ChevronRight size={12} className="text-[var(--color-text-muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sector Stocks List */}
          {activeSector && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveSector(null)} className="text-[var(--color-positive)] text-sm font-medium hover:underline">
                    ← Back
                  </button>
                  <h4 className="text-sm font-semibold">{activeSector}</h4>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{filteredSectorStocks.length} stocks</span>
              </div>
              {/* Search within sector */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  value={sectorSearch}
                  onChange={(e) => setSectorSearch(e.target.value)}
                  placeholder={`Search in ${activeSector}...`}
                  className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-positive)]"
                />
              </div>
              {sectorLoading ? (
                <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">Loading stocks...</div>
              ) : (
                <div className="divide-y divide-[var(--color-border)] max-h-[300px] overflow-y-auto rounded-xl border border-[var(--color-border)]">
                  {filteredSectorStocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => selectSectorStock(stock)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[10px] font-bold">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{stock.symbol}</p>
                          <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[180px]">{stock.companyName}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">${stock.price?.toFixed(2) || "—"}</p>
                    </button>
                  ))}
                  {filteredSectorStocks.length === 0 && (
                    <div className="py-6 text-center text-sm text-[var(--color-text-muted)]">No stocks found</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Selected Stock */}
          {tradeSymbol && (
            <>
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)]">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold">
                  {tradeSymbol.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{tradeSymbol}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{tradeName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">${tradePrice || "—"}</p>
                  {tradeType === "sell" && portfolio.holdings[tradeSymbol] && (
                    <p className="text-[10px] text-[var(--color-text-muted)]">{portfolio.holdings[tradeSymbol].shares} shares owned</p>
                  )}
                </div>
                <button onClick={() => { setTradeSymbol(""); setSearchQuery(""); setTradePrice(""); }} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
                  <X size={14} />
                </button>
              </div>

              {/* Buy Mode: Shares / Dollars / Recurring */}
              {tradeType === "buy" && (
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Buy In</p>
                  <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-lg p-1 border border-[var(--color-border)]">
                    {(["shares", "dollars", "recurring"] as BuyMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setBuyMode(m)}
                        className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all capitalize ${
                          buyMode === m
                            ? "bg-[var(--color-positive)]/15 text-[var(--color-positive)]"
                            : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {m === "shares" ? "Shares" : m === "dollars" ? "Dollars" : "Recurring"}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
                    {buyMode === "shares" && "Buy a specific number of shares"}
                    {buyMode === "dollars" && "Invest a dollar amount — we'll calculate shares for you"}
                    {buyMode === "recurring" && "Set up automatic recurring investments"}
                  </p>
                </div>
              )}

              {/* Order Type */}
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Order Type</p>
                <div className="space-y-1.5">
                  {ORDER_TYPES.map((ot) => (
                    <button
                      key={ot.key}
                      onClick={() => setOrderType(ot.key)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                        orderType === ot.key
                          ? "bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/30"
                          : "bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-light)]"
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${orderType === ot.key ? "text-[var(--color-positive)]" : "text-[var(--color-text-primary)]"}`}>
                          {ot.label}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{ot.desc}</p>
                      </div>
                      {orderType === ot.key && (
                        <div className="w-4 h-4 rounded-full bg-[var(--color-positive)] flex items-center justify-center shrink-0">
                          <CheckCircle2 size={12} className="text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recurring Frequency */}
              {tradeType === "buy" && buyMode === "recurring" && (
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Frequency</p>
                  <div className="flex items-center gap-2">
                    {(["daily", "weekly", "biweekly", "monthly"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setRecurringFreq(f)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                          recurringFreq === f
                            ? "bg-[var(--color-positive)]/15 text-[var(--color-positive)] border border-[var(--color-positive)]/30"
                            : "bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">
                    {tradeType === "buy" && buyMode === "dollars" ? "Amount ($)" : "Shares"}
                  </p>
                  {tradeType === "buy" && buyMode === "dollars" ? (
                    <>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                        <input
                          type="number"
                          value={dollarAmount}
                          onChange={(e) => setDollarAmount(e.target.value)}
                          placeholder="0.00"
                          min="1"
                          step="0.01"
                          className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg pl-8 pr-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-positive)] tabular-nums"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        {[100, 500, 1000, 5000].map((n) => (
                          <button
                            key={n}
                            onClick={() => setDollarAmount(n.toString())}
                            className="px-2 py-1 rounded text-[10px] font-semibold bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-positive)] hover:border-[var(--color-positive)]/30 transition-colors"
                          >
                            ${n >= 1000 ? `${n / 1000}K` : n}
                          </button>
                        ))}
                      </div>
                      {parseFloat(dollarAmount) > 0 && parseFloat(tradePrice) > 0 && (
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
                          ≈ {Math.floor(parseFloat(dollarAmount) / parseFloat(tradePrice)).toLocaleString()} shares at ${parseFloat(tradePrice).toFixed(2)}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        type="number"
                        value={tradeShares}
                        onChange={(e) => setTradeShares(e.target.value)}
                        placeholder="0"
                        min="1"
                        className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-positive)] tabular-nums"
                      />
                      <div className="flex items-center gap-1.5 mt-2">
                        {[10, 25, 50, 100].map((n) => (
                          <button
                            key={n}
                            onClick={() => setTradeShares(n.toString())}
                            className="px-2 py-1 rounded text-[10px] font-semibold bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-positive)] hover:border-[var(--color-positive)]/30 transition-colors"
                          >
                            {n}
                          </button>
                        ))}
                        {tradeType === "sell" && portfolio.holdings[tradeSymbol] && (
                          <button
                            onClick={() => setTradeShares(portfolio.holdings[tradeSymbol].shares.toString())}
                            className="px-2 py-1 rounded text-[10px] font-semibold text-[var(--color-negative)] bg-[var(--color-negative)]/10 hover:bg-[var(--color-negative)]/20 transition-colors"
                          >
                            All
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {orderType === "market" && (
                    <>
                      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Market Price</p>
                      <input type="number" value={tradePrice} onChange={(e) => setTradePrice(e.target.value)} placeholder="0.00" step="0.01"
                        className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-positive)] tabular-nums" />
                    </>
                  )}
                  {orderType === "limit" && (
                    <>
                      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Limit Price</p>
                      <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder={tradePrice || "0.00"} step="0.01"
                        className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-positive)] tabular-nums" />
                      {tradePrice && <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">Current: ${parseFloat(tradePrice).toFixed(2)}</p>}
                    </>
                  )}
                  {orderType === "stop" && (
                    <>
                      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Stop Price</p>
                      <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder={tradePrice || "0.00"} step="0.01"
                        className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-positive)] tabular-nums" />
                      {tradePrice && <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">Current: ${parseFloat(tradePrice).toFixed(2)}</p>}
                    </>
                  )}
                  {orderType === "stop_limit" && (
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Stop Price</p>
                        <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder={tradePrice || "0.00"} step="0.01"
                          className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-positive)] tabular-nums" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Limit Price</p>
                        <input type="number" value={stopLimitPrice} onChange={(e) => setStopLimitPrice(e.target.value)} placeholder={limitPrice || tradePrice || "0.00"} step="0.01"
                          className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-positive)] tabular-nums" />
                      </div>
                    </div>
                  )}
                  {orderType === "trailing_stop" && (
                    <>
                      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Trail (%)</p>
                      <div className="relative">
                        <input type="number" value={trailingPercent} onChange={(e) => setTrailingPercent(e.target.value)} placeholder="5" min="0.1" step="0.5"
                          className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-4 pr-8 py-3 text-sm font-semibold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-positive)] tabular-nums" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm">%</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        {[1, 3, 5, 10].map((n) => (
                          <button key={n} onClick={() => setTrailingPercent(n.toString())}
                            className="px-2 py-1 rounded text-[10px] font-semibold bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-positive)] hover:border-[var(--color-positive)]/30 transition-colors">
                            {n}%
                          </button>
                        ))}
                      </div>
                      {tradePrice && trailingPercent && (
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
                          Trigger: ${(parseFloat(tradePrice) * (1 - parseFloat(trailingPercent) / 100)).toFixed(2)} ({tradeType === "sell" ? "below" : "above"} market)
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              {resolvedShares > 0 && execPrice > 0 && (
                <div className="bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)] p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Estimated Cost</span>
                    <span className="font-bold tabular-nums">
                      ${orderTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-[var(--color-border)] pt-2">
                    <span className="text-[var(--color-text-muted)]">Buying Power After</span>
                    <span className={`tabular-nums font-medium ${
                      tradeType === "buy" && (portfolio.cash - orderTotal < 0) ? "text-[var(--color-negative)]" : "text-[var(--color-text-secondary)]"
                    }`}>
                      ${(tradeType === "buy" ? portfolio.cash - orderTotal : portfolio.cash + orderTotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Market status — orders fill only during the regular session */}
              <div className={`flex items-start gap-2 px-3.5 py-2.5 rounded-lg text-xs ${market.isOpen ? "bg-[var(--color-positive)]/8 text-[var(--color-positive)]" : "bg-[var(--color-surface-card)] text-[var(--color-text-secondary)]"}`}>
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${market.isOpen ? "bg-[var(--color-positive)] animate-pulse" : "bg-[var(--color-text-muted)]"}`} />
                <span>
                  <span className="font-semibold">{market.isOpen ? "Market open" : "Market closed"}</span>
                  <span className="text-[var(--color-text-muted)]"> · {market.detail}</span>
                </span>
              </div>

              {/* Error in trade */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-negative)]/10 text-sm text-[var(--color-negative)]">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handlePreConfirm}
                disabled={!market.isOpen}
                className={`w-full py-4 rounded-full text-sm font-bold transition-colors disabled:cursor-not-allowed ${
                  !market.isOpen
                    ? "bg-[var(--color-surface-card)] text-[var(--color-text-muted)]"
                    : tradeType === "buy"
                    ? "bg-[var(--color-positive)] text-black hover:bg-[var(--color-brand-light)]"
                    : "bg-[var(--color-negative)] text-white hover:brightness-110"
                }`}
              >
                {!market.isOpen ? "Market Closed" : `Review ${tradeType === "buy" ? "Buy" : "Sell"} Order`}
              </button>
            </>
          )}
        </div>
      )}

      {/* ═══ ANALYTICS TAB ═══ */}
      {activeTab === "analytics" && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-semibold mb-4">Performance</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Starting Balance</p>
                <p className="text-lg font-bold tabular-nums">{formatCurrency(portfolio.startingBalance)}</p>
              </div>
              <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Current Value</p>
                <p className="text-lg font-bold tabular-nums">{formatCurrency(totalValue)}</p>
              </div>
              <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Return</p>
                <p className={`text-lg font-bold tabular-nums ${totalReturn >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
                  {totalReturn >= 0 ? "+" : ""}{totalReturnPct.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Total Trades</p>
              <p className="text-xl font-bold">{numTrades}</p>
            </div>
            <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Buy Volume</p>
              <p className="text-xl font-bold tabular-nums text-[var(--color-positive)]">{formatCurrency(totalBuyVolume)}</p>
            </div>
            <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Sell Volume</p>
              <p className="text-xl font-bold tabular-nums text-[var(--color-negative)]">{formatCurrency(totalSellVolume)}</p>
            </div>
            <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Avg Trade</p>
              <p className="text-xl font-bold tabular-nums">
                {numTrades > 0 ? formatCurrency((totalBuyVolume + totalSellVolume) / numTrades) : "—"}
              </p>
            </div>
          </div>

          {/* Allocation */}
          {holdingEntries.length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-4">Allocation</h3>
              <div className="space-y-3">
                {holdingEntries
                  .sort(([symA, a], [symB, b]) => {
                    const priceA = livePrices[symA] || a.avgCost;
                    const priceB = livePrices[symB] || b.avgCost;
                    return b.shares * priceB - a.shares * priceA;
                  })
                  .map(([symbol, h]) => {
                    const curPrice = livePrices[symbol] || h.avgCost;
                    const value = h.shares * curPrice;
                    const pct = (value / totalValue) * 100;
                    return (
                      <div key={symbol} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[10px] font-bold shrink-0">
                          {symbol.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold">{symbol}</span>
                            <span className="text-sm tabular-nums">{pct.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-positive)] transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                        <span className="text-xs tabular-nums text-[var(--color-text-muted)] w-16 text-right shrink-0">
                          {formatCurrency(value)}
                        </span>
                      </div>
                    );
                  })}
                <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-border)]">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[10px] font-bold shrink-0 text-[var(--color-positive)]">
                    $
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">Cash</span>
                      <span className="text-sm tabular-nums">{((portfolio.cash / totalValue) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--color-text-muted)] transition-all" style={{ width: `${(portfolio.cash / totalValue) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs tabular-nums text-[var(--color-text-muted)] w-16 text-right shrink-0">
                    {formatCurrency(portfolio.cash)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div>
            <h3 className="text-base font-semibold mb-4">Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Top Holding</p>
                <p className="text-sm font-bold">{biggestHolding ? biggestHolding[0] : "—"}</p>
              </div>
              <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Account Age</p>
                <p className="text-sm font-bold">{daysSinceStart} day{daysSinceStart !== 1 ? "s" : ""}</p>
              </div>
              <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Utilization</p>
                <p className="text-sm font-bold tabular-nums">{((holdingsValue / totalValue) * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Positions</p>
                <p className="text-sm font-bold">{holdingEntries.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ACTIVITY TAB ═══ */}
      {activeTab === "history" && (
        <div>
          {portfolio.trades.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Recent Activity</h3>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {buyTrades.length} buys · {sellTrades.length} sells
                </span>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {portfolio.trades.slice(0, 50).map((trade) => (
                  <div
                    key={trade.id}
                    onClick={() => onSelect(trade.symbol)}
                    className="py-4 flex items-center justify-between cursor-pointer hover:bg-[var(--color-surface-hover)] -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        trade.type === "buy" ? "bg-[var(--color-positive)]/10" : "bg-[var(--color-negative)]/10"
                      }`}>
                        {trade.type === "buy" ? (
                          <ArrowUpRight size={18} className="text-[var(--color-positive)]" />
                        ) : (
                          <ArrowDownRight size={18} className="text-[var(--color-negative)]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{trade.symbol}</span>
                          <span className={`text-[10px] font-bold uppercase ${
                            trade.type === "buy" ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
                          }`}>
                            {trade.type}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {trade.shares.toLocaleString()} shares · ${trade.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        ${trade.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {new Date(trade.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <History size={32} className="text-[var(--color-text-muted)] mx-auto mb-3 opacity-30" />
              <h3 className="text-lg font-semibold mb-1">No activity yet</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Your trades will show up here</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ TRADE CONFIRMATION MODAL ═══ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl p-6 max-w-sm mx-4 shadow-2xl w-full">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold">
                {tradeType === "buy" ? "Buy" : "Sell"} {tradeSymbol}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)]">{tradeName}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Order</span>
                <span className="capitalize">{orderType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Shares</span>
                <span className="tabular-nums">{parseInt(tradeShares).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Price</span>
                <span className="tabular-nums">${execPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-[var(--color-border)] pt-3 flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold tabular-nums">
                  ${orderTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-full border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={executeTrade}
                className={`flex-1 py-3 rounded-full text-sm font-bold transition-colors ${
                  tradeType === "buy"
                    ? "bg-[var(--color-positive)] text-black hover:bg-[var(--color-brand-light)]"
                    : "bg-[var(--color-negative)] text-white hover:brightness-110"
                }`}
              >
                {tradeType === "buy" ? "Buy" : "Sell"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ RESET MODAL ═══ */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-center mb-2">Reset Account?</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-6 text-center">
              This clears all {holdingEntries.length} position{holdingEntries.length !== 1 ? "s" : ""} and {portfolio.trades.length} trade{portfolio.trades.length !== 1 ? "s" : ""}, resetting your balance to $1,000,000.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-3 rounded-full border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-full bg-[var(--color-negative)] text-white text-sm font-bold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
