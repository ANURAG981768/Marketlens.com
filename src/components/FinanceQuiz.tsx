"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Clock,
  Target,
  Award,
  Flame,
} from "lucide-react";
import { QUIZ_SECTIONS, type QuizSection, type QuizQuestion } from "@/lib/quiz-data";
import { QuizSectionIcon } from "@/components/Logo";

interface QuizResult {
  sectionId: string;
  score: number;
  total: number;
  date: string;
}

function getQuizResults(): QuizResult[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("marketlens_quiz_results") || "[]");
  } catch {
    return [];
  }
}

function saveQuizResult(result: QuizResult) {
  const results = getQuizResults();
  const idx = results.findIndex((r) => r.sectionId === result.sectionId);
  if (idx >= 0) {
    if (result.score >= results[idx].score) results[idx] = result;
  } else {
    results.push(result);
  }
  localStorage.setItem("marketlens_quiz_results", JSON.stringify(results));
}

export default function FinanceQuiz() {
  const [activeSection, setActiveSection] = useState<QuizSection | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setResults(getQuizResults());
  }, []);

  function startQuiz(section: QuizSection) {
    setActiveSection(section);
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setAnswers(new Array(section.questions.length).fill(null));
    setStartTime(Date.now());
    setStreak(0);
  }

  function handleSelect(optionIndex: number) {
    if (answered) return;
    setSelected(optionIndex);
    setAnswered(true);
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
    if (activeSection && optionIndex === activeSection.questions[currentQ].correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }

  function nextQuestion() {
    if (!activeSection) return;
    if (currentQ + 1 >= activeSection.questions.length) {
      setFinished(true);
      const finalScore = score;
      const result: QuizResult = {
        sectionId: activeSection.id,
        score: finalScore,
        total: activeSection.questions.length,
        date: new Date().toISOString(),
      };
      saveQuizResult(result);
      setResults(getQuizResults());
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  function getBestScore(sectionId: string): QuizResult | undefined {
    return results.find((r) => r.sectionId === sectionId);
  }

  function getGrade(pct: number): { label: string; color: string; message: string } {
    if (pct >= 90) return { label: "A+", color: "text-[var(--color-positive)]", message: "Outstanding — you've mastered this topic." };
    if (pct >= 80) return { label: "A", color: "text-[var(--color-positive)]", message: "Excellent grasp of the material." };
    if (pct >= 70) return { label: "B", color: "text-[var(--color-brand)]", message: "Solid understanding — review a few concepts." };
    if (pct >= 60) return { label: "C", color: "text-[var(--color-gold)]", message: "Decent effort — revisit the explanations below." };
    if (pct >= 50) return { label: "D", color: "text-[var(--color-warning)]", message: "Room for improvement — study and retry." };
    return { label: "F", color: "text-[var(--color-negative)]", message: "Keep learning — every expert started here." };
  }

  const totalQuestions = QUIZ_SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);
  const totalCompleted = results.length;
  const totalCorrect = results.reduce((sum, r) => sum + r.score, 0);
  const totalAnswered = results.reduce((sum, r) => sum + r.total, 0);

  if (finished && activeSection) {
    const pct = Math.round((score / activeSection.questions.length) * 100);
    const grade = getGrade(pct);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          <div className={`p-8 text-center ${pct >= 70 ? "bg-gradient-to-b from-[var(--color-positive)]/5 to-transparent" : "bg-gradient-to-b from-[var(--color-gold)]/5 to-transparent"}`}>
            <div className="w-20 h-20 rounded-full bg-white border-4 border-[var(--color-border)] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className={`text-3xl font-black ${grade.color}`}>{grade.label}</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Quiz Complete</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">{activeSection.title}</p>

            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-3xl font-black tabular-nums">{score}<span className="text-lg text-[var(--color-text-muted)] font-medium">/{activeSection.questions.length}</span></p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Correct</p>
              </div>
              <div className="w-px h-12 bg-[var(--color-border)]" />
              <div className="text-center">
                <p className={`text-3xl font-black tabular-nums ${grade.color}`}>{pct}%</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Score</p>
              </div>
              <div className="w-px h-12 bg-[var(--color-border)]" />
              <div className="text-center">
                <p className="text-3xl font-black tabular-nums">{mins}:{secs.toString().padStart(2, "0")}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Time</p>
              </div>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] mb-6">{grade.message}</p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => startQuiz(activeSection)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dim)] transition-colors shadow-md shadow-[var(--color-brand)]/20"
              >
                <RotateCcw size={14} />
                Retry
              </button>
              <button
                onClick={() => { setActiveSection(null); setFinished(false); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                All Sections
              </button>
            </div>
          </div>

          <div className="p-6 border-t border-[var(--color-border)]">
            <h3 className="text-sm font-semibold mb-4">Review Answers</h3>
            <div className="space-y-3">
              {activeSection.questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correct;
                return (
                  <div key={i} className={`p-4 rounded-xl border ${isCorrect ? "bg-[var(--color-positive)]/5 border-[var(--color-positive)]/20" : "bg-[var(--color-negative)]/5 border-[var(--color-negative)]/20"}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? <CheckCircle2 size={16} className="text-[var(--color-positive)] shrink-0 mt-0.5" /> : <XCircle size={16} className="text-[var(--color-negative)] shrink-0 mt-0.5" />}
                      <p className="text-sm font-medium">{q.question}</p>
                    </div>
                    {!isCorrect && userAnswer !== null && (
                      <p className="text-xs text-[var(--color-negative)] ml-6 mb-1">Your answer: {q.options[userAnswer]}</p>
                    )}
                    <p className="text-xs text-[var(--color-positive)] ml-6 mb-2 font-medium">Correct: {q.options[q.correct]}</p>
                    <p className="text-xs text-[var(--color-text-muted)] ml-6 leading-relaxed">{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection) {
    const q = activeSection.questions[currentQ];
    const progress = ((currentQ + (answered ? 1 : 0)) / activeSection.questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => { setActiveSection(null); setFinished(false); }}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ChevronLeft size={16} />
            All Sections
          </button>
          <div className="flex items-center gap-3">
            {streak >= 3 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-[var(--color-gold)]">
                <Flame size={14} />
                {streak} streak
              </div>
            )}
            <span className="text-xs font-semibold text-[var(--color-text-muted)] tabular-nums">
              {currentQ + 1} / {activeSection.questions.length}
            </span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-[var(--color-surface-card)] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-[var(--color-brand)] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <QuizSectionIcon icon={activeSection.icon} className="w-8 h-8 rounded-lg" />
            <span className="text-xs font-medium text-[var(--color-text-muted)]">{activeSection.title}</span>
          </div>

          <h3 className="text-lg font-bold mb-6 leading-snug">{q.question}</h3>

          <div className="space-y-3 mb-6">
            {q.options.map((opt, i) => {
              let style = "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-brand)]/5";
              if (answered) {
                if (i === q.correct) {
                  style = "bg-[var(--color-positive)]/10 border-[var(--color-positive)]/40 ring-1 ring-[var(--color-positive)]/20";
                } else if (i === selected && i !== q.correct) {
                  style = "bg-[var(--color-negative)]/10 border-[var(--color-negative)]/40";
                } else {
                  style = "bg-[var(--color-surface)] border-[var(--color-border)] opacity-50";
                }
              } else if (i === selected) {
                style = "bg-[var(--color-brand)]/10 border-[var(--color-brand)]/40";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-white border border-[var(--color-border)] flex items-center justify-center text-xs font-bold text-[var(--color-text-muted)] shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                    {answered && i === q.correct && <CheckCircle2 size={16} className="text-[var(--color-positive)] ml-auto shrink-0" />}
                    {answered && i === selected && i !== q.correct && <XCircle size={16} className="text-[var(--color-negative)] ml-auto shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] mb-4">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Explanation</p>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {answered && (
            <button
              onClick={nextQuestion}
              className="w-full py-3 rounded-xl bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dim)] transition-colors shadow-md shadow-[var(--color-brand)]/20 flex items-center justify-center gap-2"
            >
              {currentQ + 1 >= activeSection.questions.length ? "View Results" : "Next Question"}
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-5">
          {activeSection.questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i < currentQ
                  ? answers[i] === activeSection.questions[i].correct
                    ? "bg-[var(--color-positive)]"
                    : "bg-[var(--color-negative)]"
                  : i === currentQ
                    ? "bg-[var(--color-brand)] w-4"
                    : "bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/20">
          <BookOpen size={32} className="text-white" />
        </div>
        <h2 className="font-display text-4xl font-semibold mb-2">Finance Knowledge Hub</h2>
        <p className="text-sm text-[var(--color-text-muted)] max-w-lg mx-auto leading-relaxed">
          {totalQuestions} questions across {QUIZ_SECTIONS.length} essential topics.
          Test your understanding, track your progress, and master the fundamentals.
        </p>

        {totalCompleted > 0 && (
          <div className="flex items-center justify-center gap-6 mt-6 px-6 py-3 bg-white border border-[var(--color-border)] rounded-2xl inline-flex mx-auto shadow-sm">
            <div className="text-center">
              <p className="text-lg font-bold tabular-nums">{totalCompleted}/{QUIZ_SECTIONS.length}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Completed</p>
            </div>
            <div className="w-px h-8 bg-[var(--color-border)]" />
            <div className="text-center">
              <p className="text-lg font-bold tabular-nums">{totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%</p>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Accuracy</p>
            </div>
            <div className="w-px h-8 bg-[var(--color-border)]" />
            <div className="text-center">
              <p className="text-lg font-bold tabular-nums">{totalCorrect}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Correct</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUIZ_SECTIONS.map((section) => {
          const best = getBestScore(section.id);
          const bestPct = best ? Math.round((best.score / best.total) * 100) : null;
          return (
            <button
              key={section.id}
              onClick={() => startQuiz(section)}
              className="bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:border-[var(--color-brand)]/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <QuizSectionIcon icon={section.icon} />
                {bestPct !== null && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
                    bestPct >= 70 ? "bg-[var(--color-positive)]/10 text-[var(--color-positive)]" : "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                  }`}>
                    {bestPct >= 90 ? <Trophy size={10} /> : bestPct >= 70 ? <Award size={10} /> : <Target size={10} />}
                    {bestPct}%
                  </div>
                )}
              </div>
              <h3 className="text-sm font-bold mb-1.5 group-hover:text-[var(--color-brand)] transition-colors">
                {section.title}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-3">
                {section.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                  {section.questions.length} questions
                </span>
                <span className="text-xs font-semibold text-[var(--color-brand)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Start <ArrowRight size={12} />
                </span>
              </div>
              {best && (
                <div className="mt-3 w-full h-1 bg-[var(--color-surface-card)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bestPct! >= 70 ? "bg-[var(--color-positive)]" : "bg-[var(--color-gold)]"}`}
                    style={{ width: `${bestPct}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
