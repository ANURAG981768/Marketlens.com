"use client";

import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";

const STORAGE_KEY = "marketlens_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 animate-fade-in-up">
      <div className="max-w-3xl mx-auto bg-[#0f1419] border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-brand)]/20 flex items-center justify-center shrink-0">
            <Shield size={18} className="text-[var(--color-brand)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white mb-1">We value your privacy</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              MarketLens uses localStorage to save your progress, watchlist, and preferences locally on your device. We do not use tracking cookies or share your data with third parties. By continuing, you agree to our{" "}
              <button onClick={() => {}} className="text-[var(--color-brand)] hover:underline">Privacy Policy</button>{" "}
              and{" "}
              <button onClick={() => {}} className="text-[var(--color-brand)] hover:underline">Terms of Service</button>.
            </p>
          </div>
          <button onClick={() => setVisible(false)} className="text-gray-500 hover:text-white transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dim)] transition-colors shadow-md shadow-[var(--color-brand)]/20"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
