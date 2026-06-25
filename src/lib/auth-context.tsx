"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isCloudEnabled } from "./supabase";
import { SYNCED_KEYS, schedulePush, syncOnLogin, flushPush } from "./cloud-sync";

interface AuthState {
  user: User | null;
  loading: boolean;
  syncing: boolean;
  cloudEnabled: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

// Capture same-tab localStorage writes to synced keys and debounce a push.
function installWriteHook(getUserId: () => string | null) {
  if (typeof window === "undefined") return () => {};
  const original = window.localStorage.setItem.bind(window.localStorage);
  const synced = new Set<string>(SYNCED_KEYS);
  window.localStorage.setItem = (key: string, value: string) => {
    original(key, value);
    const uid = getUserId();
    if (uid && synced.has(key)) schedulePush(uid);
  };
  return () => {
    window.localStorage.setItem = original;
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const uninstall = installWriteHook(() => userIdRef.current);

    // When the user backgrounds or closes the tab, flush any debounced push so
    // the most recent trade reaches the cloud (mobile users switch apps a lot).
    const flushIfSignedIn = () => {
      if (userIdRef.current) flushPush();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushIfSignedIn();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushIfSignedIn);

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setLoading(false);
      if (event === "SIGNED_IN" && nextUser) {
        setSyncing(true);
        try {
          const changed = await syncOnLogin(nextUser.id);
          // Previously this did a hard window.location.reload() to surface the
          // freshly-merged cloud data — but on mobile that full-page reload right
          // after sign-in looked like an error and broke the back button. Instead
          // we fire a lightweight event the app listens for to re-read state in
          // place (no reload, no flash).
          if (changed && typeof window !== "undefined") {
            window.dispatchEvent(new Event("marketlens:synced"));
          }
        } finally {
          setSyncing(false);
        }
      }
    });

    return () => {
      sub.subscription.unsubscribe();
      uninstall();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushIfSignedIn);
    };
  }, []);

  async function signUp(email: string, password: string, name: string) {
    if (!supabase) return { error: "Cloud accounts are not configured." };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    if (error) return { error: error.message };
    // Seed the name locally so it's available immediately
    if (name && typeof window !== "undefined") localStorage.setItem("marketlens_user_name", name);
    return {};
  }

  async function signIn(email: string, password: string) {
    if (!supabase) return { error: "Cloud accounts are not configured." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, syncing, cloudEnabled: isCloudEnabled, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Graceful no-op when provider is absent (cloud disabled)
    return {
      user: null,
      loading: false,
      syncing: false,
      cloudEnabled: false,
      signUp: async () => ({ error: "Not configured" }),
      signIn: async () => ({ error: "Not configured" }),
      signOut: async () => {},
    };
  }
  return ctx;
}
