// Price alerts — "tell me when SYMBOL crosses $X". Stored locally (and synced
// to the cloud via the existing write-hook, since the key is registered there).
export interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  target: number;
  direction: "above" | "below";
  createdAt: string;
  triggeredAt: string | null;
}

const KEY = "marketlens_price_alerts";

export function getAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? (v as PriceAlert[]) : [];
  } catch {
    return [];
  }
}

function save(alerts: PriceAlert[]) {
  localStorage.setItem(KEY, JSON.stringify(alerts));
}

export function addAlert(symbol: string, name: string, target: number, direction: "above" | "below"): PriceAlert[] {
  if (!isFinite(target) || target <= 0) throw new Error("Enter a valid target price");
  const alerts = getAlerts();
  alerts.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    symbol: symbol.toUpperCase(),
    name,
    target,
    direction,
    createdAt: new Date().toISOString(),
    triggeredAt: null,
  });
  save(alerts);
  return alerts;
}

export function removeAlert(id: string): PriceAlert[] {
  const alerts = getAlerts().filter((a) => a.id !== id);
  save(alerts);
  return alerts;
}

// Evaluate alerts against a {symbol: price} map. Marks newly-crossed alerts as
// triggered and returns { alerts, newlyTriggered } so the caller can notify.
export function evaluateAlerts(prices: Record<string, number>): { alerts: PriceAlert[]; newlyTriggered: PriceAlert[] } {
  const alerts = getAlerts();
  const newlyTriggered: PriceAlert[] = [];
  let changed = false;
  for (const a of alerts) {
    if (a.triggeredAt) continue;
    const price = prices[a.symbol];
    if (typeof price !== "number" || price <= 0) continue;
    const hit = a.direction === "above" ? price >= a.target : price <= a.target;
    if (hit) {
      a.triggeredAt = new Date().toISOString();
      newlyTriggered.push(a);
      changed = true;
    }
  }
  if (changed) save(alerts);
  return { alerts, newlyTriggered };
}
