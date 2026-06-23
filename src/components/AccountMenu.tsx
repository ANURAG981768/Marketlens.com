"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { User, LogOut, X, Loader2, Cloud, CheckCircle2 } from "lucide-react";

export default function AccountMenu() {
  const { user, cloudEnabled, syncing, signUp, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  if (!cloudEnabled) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const res =
        mode === "signup"
          ? await signUp(email.trim(), password, name.trim())
          : await signIn(email.trim(), password);
      if (res.error) {
        setError(res.error);
      } else if (mode === "signup") {
        setNotice("Account created. If email confirmation is on, check your inbox, then sign in.");
        setMode("signin");
      } else {
        setOpen(false);
      }
    } finally {
      setBusy(false);
    }
  }

  // Signed in — show account chip + menu
  if (user) {
    const label = (user.user_metadata?.display_name as string) || user.email || "Account";
    const initial = label.charAt(0).toUpperCase();
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
          title={user.email ?? undefined}
        >
          <span className="w-6 h-6 rounded-full bg-[var(--color-ink)] text-white text-xs font-bold flex items-center justify-center">
            {syncing ? <Loader2 size={12} className="animate-spin" /> : initial}
          </span>
          <span className="text-xs font-medium max-w-[90px] truncate hidden sm:block">{label}</span>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-60 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <p className="text-xs font-semibold truncate">{label}</p>
                <p className="text-[11px] text-[var(--color-text-muted)] truncate">{user.email}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-[var(--color-positive)]">
                  <Cloud size={11} /> {syncing ? "Syncing…" : "Progress synced to cloud"}
                </p>
              </div>
              <button
                onClick={async () => { setMenuOpen(false); await signOut(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Signed out — show sign-in trigger + modal
  return (
    <>
      <button
        onClick={() => { setOpen(true); setError(""); setNotice(""); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-ink)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
      >
        <User size={13} /> Sign in
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm bg-[var(--color-surface-elevated)] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="premium-ink px-6 py-5 border-t-2 border-t-[var(--color-gold)] relative">
              <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white">
                <X size={16} />
              </button>
              <h3 className="font-display text-xl font-semibold text-white">
                {mode === "signup" ? "Create your free account" : "Welcome back"}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {mode === "signup"
                  ? "Save your progress and certificates across every device."
                  : "Sign in to sync your progress and certificates."}
              </p>
            </div>

            <form onSubmit={submit} className="px-6 py-5 space-y-3">
              {mode === "signup" && (
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1 block">Full name</label>
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (appears on certificates)"
                    className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand)]"
                  />
                </div>
              )}
              <div>
                <label className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1 block">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1 block">Password</label>
                <input
                  type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand)]"
                />
              </div>

              {error && <p className="text-xs text-[var(--color-negative)]">{error}</p>}
              {notice && (
                <p className="text-xs text-[var(--color-positive)] flex items-start gap-1.5">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> {notice}
                </p>
              )}

              <button
                type="submit" disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dim)] disabled:opacity-60 transition-colors"
              >
                {busy && <Loader2 size={15} className="animate-spin" />}
                {mode === "signup" ? "Create account" : "Sign in"}
              </button>

              <p className="text-center text-xs text-[var(--color-text-muted)]">
                {mode === "signup" ? "Already have an account?" : "New to MarketLens?"}{" "}
                <button
                  type="button"
                  onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); setNotice(""); }}
                  className="font-semibold text-[var(--color-brand-dim)] hover:underline"
                >
                  {mode === "signup" ? "Sign in" : "Create one free"}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
