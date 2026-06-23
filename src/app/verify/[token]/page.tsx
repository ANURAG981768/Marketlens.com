"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, BookOpen, Target, Calendar, ArrowRight } from "lucide-react";
import { decodeCertificate } from "@/lib/certificate";
import { supabase } from "@/lib/supabase";

export default function VerifyCertificatePage() {
  const params = useParams();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const cert = useMemo(() => (token ? decodeCertificate(token) : null), [token]);
  const [registry, setRegistry] = useState<"checking" | "confirmed" | "not_found" | "unavailable">("checking");

  useEffect(() => {
    if (!cert || !supabase) {
      setRegistry("unavailable");
      return;
    }
    let active = true;
    supabase
      .from("certificates")
      .select("cert_id,name")
      .eq("cert_id", cert.id)
      .maybeSingle()
      .then(({ data, error }: { data: { name?: string } | null; error: unknown }) => {
        if (!active) return;
        if (error) setRegistry("unavailable");
        else if (data && data.name === cert.n) setRegistry("confirmed");
        else setRegistry("not_found");
      });
    return () => { active = false; };
  }, [cert]);

  return (
    <main className="min-h-screen bg-[var(--color-surface)] flex flex-col items-center px-5 py-12">
      {/* Wordmark */}
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-white font-bold">M</div>
        <span className="text-lg font-bold tracking-tight">
          Market<span className="text-[var(--color-brand)]">Lens</span>
        </span>
      </Link>

      <div className="w-full max-w-lg">
        {cert ? (
          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
            {/* Verified banner */}
            <div className="premium-ink px-6 py-5 flex items-center gap-3 border-t-2 border-t-[var(--color-gold)]">
              <div className="w-10 h-10 rounded-full bg-[var(--color-positive)]/15 flex items-center justify-center">
                <ShieldCheck size={22} className="text-[var(--color-brand-light)]" />
              </div>
              <div>
                <p className="text-white font-semibold">Certificate verified</p>
                <p className="text-xs text-gray-400">
                  {registry === "confirmed"
                    ? "Issued by MarketLens · confirmed in credential registry"
                    : registry === "checking"
                    ? "Issued by MarketLens · checking registry…"
                    : "Issued by MarketLens · authenticated via secure link"}
                </p>
              </div>
            </div>

            <div className="px-6 py-7 text-center">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] mb-2">
                This certifies that
              </p>
              <h1 className="font-display text-3xl font-semibold mb-1">{cert.n}</h1>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                successfully completed the program
              </p>
              <div className="inline-block px-4 py-2 rounded-lg bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 mb-7">
                <span className="font-display text-lg font-semibold text-[var(--color-gold-dim)]">{cert.t}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <Stat icon={<Calendar size={15} />} label="Issued" value={new Date(cert.d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} />
                <Stat icon={<BookOpen size={15} />} label="Lessons" value={String(cert.l)} />
                <Stat icon={<Target size={15} />} label="Quiz avg" value={`${cert.s}%`} />
              </div>

              <div className="border-t border-[var(--color-border)] pt-4">
                <p className="text-[11px] text-[var(--color-text-muted)]">Certificate ID</p>
                <p className="font-mono font-bold text-sm">{cert.id}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl px-6 py-10 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[var(--color-warning)]/12 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={24} className="text-[var(--color-warning)]" />
            </div>
            <h1 className="font-display text-2xl font-semibold mb-2">Couldn&apos;t verify this certificate</h1>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto">
              This verification link is incomplete or has been altered. Ask for the original link from the
              certificate, or earn your own on MarketLens.
            </p>
          </div>
        )}

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-brand-dim)] hover:underline"
        >
          Learn and earn your own certificate — free
          <ArrowRight size={15} />
        </Link>
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-lg py-3 px-2">
      <div className="flex items-center justify-center text-[var(--color-text-muted)] mb-1">{icon}</div>
      <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
      <p className="text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}
