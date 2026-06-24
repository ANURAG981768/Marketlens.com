import { supabase } from "./supabase";

export interface LeaderEntry {
  user_id: string;
  display_name: string;
  return_pct: number;
  trades: number;
  updated_at: string;
}

// Publish (upsert) the signed-in user's current paper-trading return.
export async function publishRank(
  userId: string,
  displayName: string,
  returnPct: number,
  trades: number
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("leaderboard").upsert({
    user_id: userId,
    display_name: displayName || "Investor",
    return_pct: Number.isFinite(returnPct) ? Math.round(returnPct * 100) / 100 : 0,
    trades,
    updated_at: new Date().toISOString(),
  });
  return !error;
}

// Top performers by return. Requires at least one completed trade so empty
// $1M accounts don't clutter the board with 0.00%.
export async function fetchLeaderboard(limit = 50): Promise<LeaderEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("leaderboard")
    .select("user_id, display_name, return_pct, trades, updated_at")
    .gt("trades", 0)
    .order("return_pct", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data as LeaderEntry[]) ?? [];
}
