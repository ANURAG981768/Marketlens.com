"use client";

import { useState, useEffect } from "react";
import { Flame, BookOpen, CheckCircle2, Award, ArrowRight, GraduationCap } from "lucide-react";
import { LESSONS } from "@/lib/lessons-data";
import { getStreak } from "@/lib/streak";

interface Props {
  onContinue?: (lessonId: string) => void;
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function ProgressDashboard({ onContinue }: Props) {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [lessonsDone, setLessonsDone] = useState(0);
  const [quizzesPassed, setQuizzesPassed] = useState(0);
  const [certs, setCerts] = useState(0);
  const [streak, setStreak] = useState({ current: 0, longest: 0, activeToday: false });
  const [nextLesson, setNextLesson] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    const progress = readJSON<Record<string, string[]>>("marketlens_lessons_progress", {});
    const done = LESSONS.filter((l) => (progress[l.id]?.length ?? 0) >= l.sections.length).length;
    const next = LESSONS.find((l) => (progress[l.id]?.length ?? 0) < l.sections.length);

    const quizzes = readJSON<Array<{ sectionId: string; score: number; total: number }>>("marketlens_quiz_results", []);
    const passed = new Set(quizzes.filter((q) => q.total && q.score / q.total >= 0.7).map((q) => q.sectionId)).size;

    const certObj = readJSON<Record<string, unknown>>("marketlens_certificates", {});

    setName(localStorage.getItem("marketlens_user_name") || "");
    setLessonsDone(done);
    setQuizzesPassed(passed);
    setCerts(Object.keys(certObj).length);
    setStreak(getStreak());
    setNextLesson(next ? { id: next.id, title: next.title } : null);
    setReady(true);
  }, []);

  if (!ready) return null;

  const pct = Math.round((lessonsDone / LESSONS.length) * 100);
  const greeting = name ? `Welcome back, ${name.split(" ")[0]}` : "Your learning journey";

  const stats = [
    { icon: Flame, label: streak.current === 1 ? "day streak" : "day streak", value: streak.current, accent: "text-orange-500", bg: "bg-orange-50" },
    { icon: BookOpen, label: `of ${LESSONS.length} lessons`, value: lessonsDone, accent: "text-blue-600", bg: "bg-blue-50" },
    { icon: CheckCircle2, label: "quizzes passed", value: quizzesPassed, accent: "text-[var(--color-positive)]", bg: "bg-green-50" },
    { icon: Award, label: "certificates", value: certs, accent: "text-[var(--color-gold-dim)]", bg: "bg-amber-50" },
  ];

  return (
    <div className="bg-[var(--color-ink)] rounded-2xl overflow-hidden border-t-2 border-t-[var(--color-gold)] mb-6">
      <div className="px-6 py-6 sm:px-8 sm:py-7">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-gold-light)] font-semibold mb-1.5">
              {streak.current > 0 ? `${streak.current}-day streak — keep it alive` : "Start your streak today"}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white">{greeting}</h2>
          </div>
          {nextLesson ? (
            <button
              onClick={() => onContinue?.(nextLesson.id)}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-light)] transition-all shadow-lg shadow-[var(--color-brand)]/25"
            >
              {lessonsDone === 0 ? "Start first lesson" : "Continue learning"}
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-brand)]/15 text-[var(--color-brand-light)] text-sm font-semibold">
              <GraduationCap size={16} /> All lessons complete
            </span>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                <s.icon size={16} className={s.accent} />
              </div>
              <p className="text-2xl font-bold text-white tabular-nums leading-none">{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Overall progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span>Course completion</span>
            <span className="font-semibold text-white tabular-nums">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-light)] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          {nextLesson && (
            <p className="text-xs text-gray-500 mt-2.5">
              Up next: <span className="text-gray-300">{nextLesson.title}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
