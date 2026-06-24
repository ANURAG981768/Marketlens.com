export interface WatchlistItem {
  symbol: string;
  addedAt: string;
  name?: string;
  price?: number;
  change?: number;
}

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  avgCost: number;
  addedAt: string;
  name?: string;
}

const WATCHLIST_KEY = "equityiq_watchlist";
const PORTFOLIO_KEY = "equityiq_portfolio";

export function getWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToWatchlist(item: WatchlistItem): WatchlistItem[] {
  const list = getWatchlist().filter((w) => w.symbol !== item.symbol);
  list.unshift(item);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  return list;
}

export function removeFromWatchlist(symbol: string): WatchlistItem[] {
  const list = getWatchlist().filter((w) => w.symbol !== symbol);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  return list;
}

export function isInWatchlist(symbol: string): boolean {
  return getWatchlist().some((w) => w.symbol === symbol);
}

export function getPortfolio(): PortfolioHolding[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PORTFOLIO_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToPortfolio(holding: PortfolioHolding): PortfolioHolding[] {
  const list = getPortfolio();
  const existing = list.find((h) => h.symbol === holding.symbol);
  if (existing) {
    const totalShares = existing.shares + holding.shares;
    const totalCost =
      existing.shares * existing.avgCost + holding.shares * holding.avgCost;
    existing.shares = totalShares;
    existing.avgCost = totalCost / totalShares;
  } else {
    list.unshift(holding);
  }
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(list));
  return list;
}

export function removeFromPortfolio(symbol: string): PortfolioHolding[] {
  const list = getPortfolio().filter((h) => h.symbol !== symbol);
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(list));
  return list;
}

export function updatePortfolioHolding(
  symbol: string,
  shares: number,
  avgCost: number
): PortfolioHolding[] {
  const list = getPortfolio();
  const item = list.find((h) => h.symbol === symbol);
  if (item) {
    item.shares = shares;
    item.avgCost = avgCost;
  }
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(list));
  return list;
}

// ─── Paper Trading ───

export interface PaperTrade {
  id: string;
  symbol: string;
  name: string;
  type: "buy" | "sell";
  shares: number;
  price: number;
  total: number;
  timestamp: string;
}

export interface PendingOrder {
  id: string;
  symbol: string;
  name: string;
  type: "buy" | "sell";
  shares: number;
  placedAt: string;
}

export interface PaperPortfolio {
  cash: number;
  holdings: Record<string, { shares: number; avgCost: number; name: string }>;
  trades: PaperTrade[];
  startDate: string;
  startingBalance: number;
  pendingOrders?: PendingOrder[];
}

const PAPER_KEY = "marketlens_paper_trading";
const DEFAULT_BALANCE = 1_000_000;

export function getPaperPortfolio(): PaperPortfolio {
  if (typeof window === "undefined") {
    return { cash: DEFAULT_BALANCE, holdings: {}, trades: [], startDate: new Date().toISOString(), startingBalance: DEFAULT_BALANCE };
  }
  try {
    const raw = localStorage.getItem(PAPER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { cash: DEFAULT_BALANCE, holdings: {}, trades: [], startDate: new Date().toISOString(), startingBalance: DEFAULT_BALANCE };
}

function savePaper(p: PaperPortfolio) {
  localStorage.setItem(PAPER_KEY, JSON.stringify(p));
}

function validOrder(shares: number, price: number) {
  if (!Number.isFinite(shares) || shares <= 0) throw new Error("Enter a valid number of shares");
  if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a valid price");
}

export function paperBuy(symbol: string, name: string, shares: number, price: number): PaperPortfolio {
  validOrder(shares, price);
  const p = getPaperPortfolio();
  const total = shares * price;
  if (total > p.cash) throw new Error("Insufficient funds");

  p.cash -= total;
  const h = p.holdings[symbol];
  if (h) {
    const newShares = h.shares + shares;
    h.avgCost = (h.shares * h.avgCost + total) / newShares;
    h.shares = newShares;
    h.name = name;
  } else {
    p.holdings[symbol] = { shares, avgCost: price, name };
  }

  p.trades.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    symbol, name, type: "buy", shares, price, total,
    timestamp: new Date().toISOString(),
  });

  savePaper(p);
  return p;
}

export function paperSell(symbol: string, name: string, shares: number, price: number): PaperPortfolio {
  validOrder(shares, price);
  const p = getPaperPortfolio();
  const h = p.holdings[symbol];
  if (!h || h.shares < shares) throw new Error("Not enough shares");

  const total = shares * price;
  p.cash += total;
  h.shares -= shares;
  if (h.shares <= 0.0000001) delete p.holdings[symbol];

  p.trades.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    symbol, name, type: "sell", shares, price, total,
    timestamp: new Date().toISOString(),
  });

  savePaper(p);
  return p;
}

function orderId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Queue an order to fill at the next market open (used when the market is closed).
export function queuePaperOrder(
  symbol: string,
  name: string,
  type: "buy" | "sell",
  shares: number
): PaperPortfolio {
  if (!Number.isFinite(shares) || shares <= 0) throw new Error("Enter a valid number of shares");
  const p = getPaperPortfolio();
  if (!p.pendingOrders) p.pendingOrders = [];
  p.pendingOrders.unshift({
    id: orderId(),
    symbol,
    name,
    type,
    shares,
    placedAt: new Date().toISOString(),
  });
  savePaper(p);
  return p;
}

export function cancelPendingOrder(id: string): PaperPortfolio {
  const p = getPaperPortfolio();
  p.pendingOrders = (p.pendingOrders || []).filter((o) => o.id !== id);
  savePaper(p);
  return p;
}

// Fill queued orders at the supplied live prices (called once the market opens).
// Orders with no available price stay queued; buys without funds / sells without
// shares are cancelled with a reason. Returns the messages for a user toast.
export function fillPendingOrders(
  prices: Record<string, number>
): { portfolio: PaperPortfolio; filled: string[]; cancelled: string[] } {
  const p = getPaperPortfolio();
  const pending = p.pendingOrders || [];
  const filled: string[] = [];
  const cancelled: string[] = [];
  if (pending.length === 0) return { portfolio: p, filled, cancelled };

  const remaining: PendingOrder[] = [];
  for (const o of pending) {
    const price = prices[o.symbol];
    if (!Number.isFinite(price) || price <= 0) {
      remaining.push(o); // no quote yet — keep it queued
      continue;
    }
    const total = o.shares * price;
    if (o.type === "buy") {
      if (total > p.cash) {
        cancelled.push(`${o.symbol}: buy cancelled — not enough cash at the open price`);
        continue;
      }
      p.cash -= total;
      const h = p.holdings[o.symbol];
      if (h) {
        const ns = h.shares + o.shares;
        h.avgCost = (h.shares * h.avgCost + total) / ns;
        h.shares = ns;
        h.name = o.name;
      } else {
        p.holdings[o.symbol] = { shares: o.shares, avgCost: price, name: o.name };
      }
      p.trades.unshift({ id: orderId(), symbol: o.symbol, name: o.name, type: "buy", shares: o.shares, price, total, timestamp: new Date().toISOString() });
      filled.push(`Bought ${o.shares} ${o.symbol} at $${price.toFixed(2)}`);
    } else {
      const h = p.holdings[o.symbol];
      if (!h || h.shares < o.shares) {
        cancelled.push(`${o.symbol}: sell cancelled — you no longer hold enough shares`);
        continue;
      }
      p.cash += total;
      h.shares -= o.shares;
      if (h.shares <= 0.0000001) delete p.holdings[o.symbol];
      p.trades.unshift({ id: orderId(), symbol: o.symbol, name: o.name, type: "sell", shares: o.shares, price, total, timestamp: new Date().toISOString() });
      filled.push(`Sold ${o.shares} ${o.symbol} at $${price.toFixed(2)}`);
    }
  }
  p.pendingOrders = remaining;
  savePaper(p);
  return { portfolio: p, filled, cancelled };
}

export function resetPaperPortfolio(): PaperPortfolio {
  const p: PaperPortfolio = {
    cash: DEFAULT_BALANCE,
    holdings: {},
    trades: [],
    startDate: new Date().toISOString(),
    startingBalance: DEFAULT_BALANCE,
    pendingOrders: [],
  };
  savePaper(p);
  return p;
}
