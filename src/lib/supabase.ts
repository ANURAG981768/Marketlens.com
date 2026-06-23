import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public, safe-to-expose credentials. All data access is guarded by
// Row-Level-Security policies defined in supabase/schema.sql, so the anon key
// can only ever read/write the signed-in user's own rows.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// `null` when env vars are absent — the app stays fully functional on
// localStorage alone, so cloud sync is purely additive.
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const isCloudEnabled = Boolean(url && anonKey);
