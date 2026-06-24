import { supabase } from "./supabase";

/*
 * Cloud sync — mirrors the app's localStorage state to a single per-user JSON
 * row in Supabase (user_data.data). The app remains fully functional offline;
 * when signed in, state follows the student across devices.
 */

// localStorage keys that represent a user's learning/progress state.
// (Device-only keys like cookie consent are intentionally excluded.)
export const SYNCED_KEYS = [
  "marketlens_lessons_progress",
  "marketlens_quiz_results",
  "marketlens_certificates",
  "marketlens_user_name",
  "marketlens_achievements",
  // NOTE: the watchlist + "add to portfolio" features store under the legacy
  // equityiq_* keys (see storage.ts), so those are the keys that must sync.
  "equityiq_watchlist",
  "equityiq_portfolio",
  "marketlens_paper_trading",
  "marketlens_paper_trades",
  "marketlens_trade_journal",
  "marketlens_price_alerts",
] as const;

type Bag = Record<string, unknown>;

function parse(raw: string | null): unknown {
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw; // plain string (e.g. user name)
  }
}

export function readLocal(): Bag {
  if (typeof window === "undefined") return {};
  const bag: Bag = {};
  for (const k of SYNCED_KEYS) {
    const v = parse(localStorage.getItem(k));
    if (v !== undefined && v !== null && v !== "") bag[k] = v;
  }
  return bag;
}

export function writeLocal(bag: Bag) {
  if (typeof window === "undefined") return;
  for (const k of SYNCED_KEYS) {
    if (k in bag && bag[k] !== undefined && bag[k] !== null) {
      const v = bag[k];
      localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
    }
  }
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// Merge two state bags. Collection-like keys union; scalars prefer the
// non-empty / richer value so no progress is ever silently lost.
export function mergeBags(local: Bag, cloud: Bag): Bag {
  const out: Bag = { ...cloud, ...local };

  // Lesson progress: { lessonId: string[] } — union completed sections
  out["marketlens_lessons_progress"] = unionRecordOfArrays(
    local["marketlens_lessons_progress"],
    cloud["marketlens_lessons_progress"]
  );

  // Quiz results: [{ sectionId, score, total, date }] — keep best score per section
  out["marketlens_quiz_results"] = mergeQuiz(
    local["marketlens_quiz_results"],
    cloud["marketlens_quiz_results"]
  );

  // Certificates: { trackId: record } — union, keep earliest issue
  out["marketlens_certificates"] = { ...(asObj(cloud["marketlens_certificates"])), ...(asObj(local["marketlens_certificates"])) };

  // Achievements: array of unlocked ids — union
  out["marketlens_achievements"] = unionArray(
    local["marketlens_achievements"],
    cloud["marketlens_achievements"]
  );

  // Watchlist: array of { symbol, ... } objects — union by symbol so an item
  // added on either device is never dropped.
  out["equityiq_watchlist"] = unionBySymbol(
    local["equityiq_watchlist"],
    cloud["equityiq_watchlist"]
  );

  // Name: prefer whichever is set (local wins if both)
  const ln = local["marketlens_user_name"];
  const cn = cloud["marketlens_user_name"];
  out["marketlens_user_name"] = (typeof ln === "string" && ln.trim()) ? ln : cn;

  // Clean undefined keys
  for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
  return out;
}

function asObj(v: unknown): Record<string, unknown> {
  return isObj(v) ? v : {};
}

function unionRecordOfArrays(a: unknown, b: unknown): Record<string, unknown[]> {
  const ao = asObj(a);
  const bo = asObj(b);
  const out: Record<string, unknown[]> = {};
  for (const key of new Set([...Object.keys(ao), ...Object.keys(bo)])) {
    const arr = new Set([
      ...(Array.isArray(ao[key]) ? (ao[key] as unknown[]) : []),
      ...(Array.isArray(bo[key]) ? (bo[key] as unknown[]) : []),
    ]);
    out[key] = [...arr];
  }
  return out;
}

function unionArray(a: unknown, b: unknown): unknown[] {
  const arr = [
    ...(Array.isArray(a) ? a : []),
    ...(Array.isArray(b) ? b : []),
  ];
  // de-dupe primitives
  return [...new Set(arr)];
}

// Union two arrays of { symbol, ... } objects, keyed by symbol (local wins on a
// clash so the freshest entry survives). Used for the watchlist.
function unionBySymbol(a: unknown, b: unknown): unknown[] {
  const bySymbol = new Map<string, unknown>();
  const add = (arr: unknown) => {
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      const sym = isObj(item) && typeof item.symbol === "string" ? item.symbol : null;
      if (sym && !bySymbol.has(sym)) bySymbol.set(sym, item);
    }
  };
  add(a); // local first — its entries win
  add(b);
  return [...bySymbol.values()];
}

function mergeQuiz(a: unknown, b: unknown): unknown[] {
  const all = [
    ...(Array.isArray(a) ? a : []),
    ...(Array.isArray(b) ? b : []),
  ] as Array<{ sectionId?: string; score?: number; total?: number }>;
  const best: Record<string, { sectionId?: string; score?: number; total?: number }> = {};
  for (const r of all) {
    if (!r || typeof r.sectionId !== "string") continue;
    const cur = best[r.sectionId];
    const ratio = (r.score ?? 0) / (r.total || 1);
    const curRatio = cur ? (cur.score ?? 0) / (cur.total || 1) : -1;
    if (!cur || ratio > curRatio) best[r.sectionId] = r;
  }
  return Object.values(best);
}

// --- Supabase I/O -----------------------------------------------------------

export async function fetchCloud(userId: string): Promise<Bag | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("user_data")
    .select("data")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return (data?.data as Bag) ?? {};
}

export async function pushCloud(userId: string, bag: Bag): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("user_data")
    .upsert({ id: userId, data: bag, updated_at: new Date().toISOString() });
  return !error;
}

/*
 * On sign-in: pull cloud state, merge with whatever is already on this device,
 * write the merged result back to BOTH localStorage and the cloud. Returns true
 * if the local store changed (caller may reload to refresh component state).
 */
export async function syncOnLogin(userId: string): Promise<boolean> {
  const local = readLocal();
  const cloud = (await fetchCloud(userId)) ?? {};
  const merged = mergeBags(local, cloud);
  writeLocal(merged);
  await pushCloud(userId, merged);
  // Did cloud bring anything new to this device?
  return JSON.stringify(merged) !== JSON.stringify(local);
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let lastUserId: string | null = null;

// Push the full local state, retrying a couple of times on transient failure so
// a flaky network never quietly drops a trade.
async function doPush(userId: string, attempt = 0): Promise<void> {
  const ok = await pushCloud(userId, readLocal());
  if (!ok && attempt < 2) {
    setTimeout(() => { void doPush(userId, attempt + 1); }, 2000 * (attempt + 1));
  }
}

export function schedulePush(userId: string) {
  lastUserId = userId;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void doPush(userId);
  }, 1500);
}

// Flush any pending push immediately — call this when the tab is backgrounded or
// closed so the last trade isn't lost to the 1.5s debounce. (Because pushCloud
// sends the entire local state, a later successful push self-heals any miss.)
export function flushPush() {
  if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
  if (lastUserId) void doPush(lastUserId);
}
