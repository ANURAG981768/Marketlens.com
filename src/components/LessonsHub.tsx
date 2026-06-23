"use client";

import { useState, useEffect, useMemo } from "react";
import { LESSONS, type Lesson } from "@/lib/lessons-data";
import {
  BookOpen,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  BarChart3,
  Brain,
  Sparkles,
  Target,
} from "lucide-react";

const STORAGE_KEY = "marketlens_lessons_progress";

function loadProgress(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, string[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getQuizResults(): Record<string, { bestScore: number; total: number }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("marketlens_quiz_results");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const DIFFICULTY_COLORS = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
};

export default function LessonsHub({ onNavigateToQuiz, onNavigateToCerts }: { onNavigateToQuiz?: () => void; onNavigateToCerts?: () => void }) {
  const [progress, setProgress] = useState<Record<string, string[]>>({});
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const completedLessons = useMemo(() => {
    return LESSONS.filter((l) => {
      const completed = progress[l.id] || [];
      return completed.length === l.sections.length;
    }).length;
  }, [progress]);

  // Smart Study Coach
  const recommendations = useMemo(() => {
    const quizResults = getQuizResults();
    const recs: { lessonId: string; reason: string }[] = [];

    for (const lesson of LESSONS) {
      const completed = (progress[lesson.id] || []).length;
      const total = lesson.sections.length;
      const quizName = lesson.relatedQuiz;

      if (quizName && quizResults[quizName]) {
        const { bestScore, total: qTotal } = quizResults[quizName];
        const pct = qTotal > 0 ? (bestScore / qTotal) * 100 : 0;
        if (pct < 70) {
          recs.push({
            lessonId: lesson.id,
            reason: `You scored ${pct.toFixed(0)}% on ${quizName} — this lesson covers the fundamentals`,
          });
        }
      } else if (completed === 0) {
        recs.push({
          lessonId: lesson.id,
          reason: "You haven't started this lesson yet",
        });
      } else if (completed < total) {
        recs.push({
          lessonId: lesson.id,
          reason: `${completed}/${total} sections completed — pick up where you left off`,
        });
      }
    }

    return recs.slice(0, 3);
  }, [progress]);

  function markSectionComplete(lessonId: string, sectionIndex: number) {
    const key = `${sectionIndex}`;
    const current = progress[lessonId] || [];
    if (!current.includes(key)) {
      const updated = { ...progress, [lessonId]: [...current, key] };
      setProgress(updated);
      saveProgress(updated);
    }
  }

  function handleNext() {
    if (!activeLesson) return;
    markSectionComplete(activeLesson.id, activeSection);
    if (activeSection < activeLesson.sections.length - 1) {
      setActiveSection(activeSection + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handlePrev() {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleFinish() {
    if (!activeLesson) return;
    markSectionComplete(activeLesson.id, activeSection);
    setActiveLesson(null);
    setActiveSection(0);
  }

  // Active lesson reader view
  if (activeLesson) {
    const section = activeLesson.sections[activeSection];
    const completedSections = progress[activeLesson.id] || [];
    const isLast = activeSection === activeLesson.sections.length - 1;

    return (
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        {/* Back button */}
        <button
          onClick={() => { setActiveLesson(null); setActiveSection(0); }}
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Lessons
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-6">
          {activeLesson.sections.map((_, i) => (
            <button
              key={i}
              onClick={() => { markSectionComplete(activeLesson.id, activeSection); setActiveSection(i); }}
              className={`h-2 rounded-full transition-all ${
                i === activeSection
                  ? "w-8 bg-[var(--color-brand)]"
                  : completedSections.includes(`${i}`)
                  ? "w-2 bg-[var(--color-brand)]/40"
                  : "w-2 bg-[var(--color-border)]"
              }`}
            />
          ))}
          <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">
            {activeSection + 1} of {activeLesson.sections.length}
          </span>
        </div>

        {/* Content Card */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-[var(--color-text-primary)]">
            {section.heading}
          </h2>

          <div className="prose prose-sm max-w-none">
            {section.content.split("\n\n").map((para, i) => (
              <p
                key={i}
                className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4 last:mb-0"
              >
                {para}
              </p>
            ))}
          </div>

          {/* Key Takeaway */}
          {section.keyTakeaway && (
            <div className="mt-6 p-4 bg-[var(--color-brand)]/5 border border-[var(--color-brand)]/15 rounded-xl">
              <div className="flex items-start gap-2.5">
                <Lightbulb size={16} className="text-[var(--color-brand)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-[var(--color-brand)] uppercase tracking-wider mb-1">
                    Key Takeaway
                  </p>
                  <p className="text-sm text-[var(--color-text-primary)] font-medium leading-relaxed">
                    {section.keyTakeaway}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={activeSection === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          {isLast ? (
            <div className="flex gap-2">
              {activeLesson.relatedQuiz && onNavigateToQuiz && (
                <button
                  onClick={onNavigateToQuiz}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium border border-[var(--color-brand)]/30 text-[var(--color-brand)] hover:bg-[var(--color-brand)]/5 transition-colors"
                >
                  <Target size={14} />
                  Take the Quiz
                </button>
              )}
              <button
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dim)] transition-colors shadow-md shadow-[var(--color-brand)]/20"
              >
                <CheckCircle size={14} />
                Complete Lesson
              </button>
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dim)] transition-colors shadow-md shadow-[var(--color-brand)]/20"
            >
              Continue
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Hub view
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center py-6 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
          <BookOpen size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Learning Center</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Structured lessons to take you from beginner to confident investor
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold">{completedLessons} of {LESSONS.length} Lessons Completed</p>
          <p className="text-sm font-bold text-[var(--color-brand)]">
            {LESSONS.length > 0 ? Math.round((completedLessons / LESSONS.length) * 100) : 0}%
          </p>
        </div>
        <div className="w-full h-3 bg-[var(--color-surface-card)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
            style={{ width: `${LESSONS.length > 0 ? (completedLessons / LESSONS.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Certificate CTA */}
      {completedLessons >= 3 && onNavigateToCerts && (
        <button
          onClick={onNavigateToCerts}
          className="w-full mb-6 flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-left hover:from-amber-100 hover:to-orange-100 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm shrink-0">
            <span className="text-lg">🏆</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--color-text-primary)]">
              {completedLessons >= LESSONS.length ? "All lessons complete! Claim your Scholar certificate" : "Certificates available!"}
            </p>
            <p className="text-xs text-amber-600">
              {completedLessons >= LESSONS.length
                ? "You've mastered every lesson — download your achievement"
                : `${completedLessons} lessons done — check which certificates you can earn`}
            </p>
          </div>
          <ChevronRight size={16} className="text-amber-400 group-hover:text-amber-600 shrink-0" />
        </button>
      )}

      {/* AI Study Coach Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Study Coach
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
              AI-Powered
            </span>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec) => {
              const lesson = LESSONS.find((l) => l.id === rec.lessonId);
              if (!lesson) return null;
              return (
                <button
                  key={rec.lessonId}
                  onClick={() => { setActiveLesson(lesson); setActiveSection(0); }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-violet-50 border border-violet-100 rounded-xl text-left hover:bg-violet-100/50 transition-colors group"
                >
                  <Brain size={16} className="text-violet-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--color-text-primary)]">
                      {lesson.title}
                    </p>
                    <p className="text-[11px] text-violet-600">{rec.reason}</p>
                  </div>
                  <ArrowRight size={14} className="text-violet-400 group-hover:text-violet-600 transition-colors shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lesson Cards */}
      <div className="space-y-3">
        {LESSONS.map((lesson) => {
          const completed = progress[lesson.id] || [];
          const pct = lesson.sections.length > 0 ? Math.round((completed.length / lesson.sections.length) * 100) : 0;
          const isComplete = pct === 100;

          return (
            <button
              key={lesson.id}
              onClick={() => { setActiveLesson(lesson); setActiveSection(0); }}
              className={`w-full bg-white border rounded-xl p-5 text-left transition-all group hover:shadow-md ${
                isComplete ? "border-[var(--color-brand)]/20" : "border-[var(--color-border)]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl shrink-0 mt-0.5">{lesson.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors">
                      {lesson.title}
                    </h3>
                    {isComplete && (
                      <CheckCircle size={14} className="text-[var(--color-brand)] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-2.5">
                    {lesson.subtitle}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[lesson.difficulty]}`}>
                      {lesson.difficulty}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                      <Clock size={10} />
                      {lesson.duration}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {lesson.sections.length} sections
                    </span>
                    {lesson.relatedQuiz && (
                      <span className="text-[10px] text-violet-500 flex items-center gap-1">
                        <Target size={10} />
                        Quiz available
                      </span>
                    )}
                  </div>
                  {/* Mini progress bar */}
                  {completed.length > 0 && !isComplete && (
                    <div className="mt-2.5 w-full h-1.5 bg-[var(--color-surface-card)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-brand)] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
                <ChevronRight size={16} className="text-[var(--color-text-muted)] shrink-0 mt-2 group-hover:text-[var(--color-brand)] transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
