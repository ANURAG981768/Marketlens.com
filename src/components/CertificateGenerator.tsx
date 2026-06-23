"use client";

import { useState, useEffect } from "react";
import { Award, Download, CheckCircle, Lock, BookOpen, Trophy, User, Sparkles, ShieldCheck, Clock, Target, AlertTriangle, Copy, Check } from "lucide-react";
import { LESSONS } from "@/lib/lessons-data";
import { encodeCertificate } from "@/lib/certificate";

const STORAGE_KEY = "marketlens_lessons_progress";
const CERT_KEY = "marketlens_certificates";
const NAME_KEY = "marketlens_user_name";
const QUIZ_KEY = "marketlens_quiz_results";

interface CertRecord {
  date: string;
  name: string;
  certId: string;
  quizAvg: number;
}

interface QuizResult {
  sectionId: string;
  score: number;
  total: number;
}

const QUIZ_MAP: Record<string, string[]> = {
  foundations: ["market-fundamentals", "financial-statements"],
  analyst: ["market-fundamentals", "financial-statements", "valuation-methods", "technical-analysis"],
  "portfolio-manager": ["portfolio-management", "risk-management", "behavioral-finance"],
  complete: ["market-fundamentals", "financial-statements", "valuation-methods", "technical-analysis", "options-derivatives", "risk-management", "fixed-income", "macroeconomics", "portfolio-management", "behavioral-finance", "etfs-index-funds", "behavioral-finance-biases", "global-markets", "esg-investing"],
};

const CERTIFICATE_TRACKS = [
  {
    id: "foundations",
    title: "Investment Foundations",
    subtitle: "Core knowledge every investor needs",
    icon: "\u{1F3DB}️",
    gradient: "from-emerald-500 to-green-600",
    color: "#10b981",
    lessonsRequired: ["intro-stock-market", "reading-financial-statements", "valuation-basics"],
    minQuizScore: 70,
    description: "Complete 3 lessons + pass 2 quizzes with 70%+ average.",
  },
  {
    id: "analyst",
    title: "Junior Equity Analyst",
    subtitle: "Technical and fundamental analysis",
    icon: "\u{1F4CA}",
    gradient: "from-blue-500 to-indigo-600",
    color: "#6366f1",
    lessonsRequired: ["intro-stock-market", "reading-financial-statements", "valuation-basics", "technical-analysis-intro", "risk-management"],
    minQuizScore: 75,
    description: "Complete 5 lessons + pass 4 quizzes with 75%+ average.",
  },
  {
    id: "portfolio-manager",
    title: "Portfolio Strategist",
    subtitle: "Advanced portfolio and global market knowledge",
    icon: "\u{1F3AF}",
    gradient: "from-violet-500 to-purple-600",
    color: "#8b5cf6",
    lessonsRequired: ["portfolio-construction", "etfs-index-investing", "risk-management", "global-markets", "behavioral-finance"],
    minQuizScore: 80,
    description: "Complete 5 lessons + pass 3 quizzes with 80%+ average.",
  },
  {
    id: "complete",
    title: "MarketLens Scholar",
    subtitle: "Full platform mastery — the ultimate credential",
    icon: "\u{1F3C6}",
    gradient: "from-amber-500 to-orange-600",
    color: "#f59e0b",
    lessonsRequired: LESSONS.map((l) => l.id),
    minQuizScore: 80,
    description: "Complete ALL 12 lessons + pass ALL 14 quizzes with 80%+ average.",
  },
];

function loadProgress(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function loadCertificates(): Record<string, CertRecord> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(CERT_KEY) || "{}"); } catch { return {}; }
}
function loadQuizResults(): QuizResult[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(QUIZ_KEY) || "[]"); } catch { return []; }
}
function isLessonComplete(progress: Record<string, string[]>, lessonId: string): boolean {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return false;
  return (progress[lessonId] || []).length >= lesson.sections.length;
}
function generateCertId(trackId: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `ML-${trackId.slice(0, 4).toUpperCase()}-${code}`;
}

export default function CertificateGenerator() {
  const [progress, setProgress] = useState<Record<string, string[]>>({});
  const [certificates, setCertificates] = useState<Record<string, CertRecord>>({});
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingClaimId, setPendingClaimId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  function getVerifyUrl(trackId: string, trackTitle: string, lessons: number): string {
    const cert = certificates[trackId];
    if (!cert || typeof window === "undefined") return "";
    const token = encodeCertificate({
      n: cert.name,
      t: trackTitle,
      d: cert.date,
      id: cert.certId,
      s: cert.quizAvg,
      l: lessons,
    });
    return `${window.location.origin}/verify/${token}`;
  }

  async function copyVerifyLink(trackId: string, trackTitle: string, lessons: number) {
    const url = getVerifyUrl(trackId, trackTitle, lessons);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {}
  }

  useEffect(() => {
    setProgress(loadProgress());
    setCertificates(loadCertificates());
    setQuizResults(loadQuizResults());
    const saved = localStorage.getItem(NAME_KEY);
    if (saved) { setUserName(saved); setNameInput(saved); }
  }, []);

  const totalLessonsCompleted = LESSONS.filter((l) => isLessonComplete(progress, l.id)).length;
  const totalQuizzesPassed = quizResults.filter((r) => (r.score / r.total) * 100 >= 70).length;

  function getQuizAvg(trackId: string): number {
    const requiredQuizzes = QUIZ_MAP[trackId] || [];
    const scores = requiredQuizzes.map((qId) => {
      const result = quizResults.find((r) => r.sectionId === qId);
      return result ? (result.score / result.total) * 100 : 0;
    });
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  function getQuizzesDone(trackId: string): { done: number; total: number } {
    const requiredQuizzes = QUIZ_MAP[trackId] || [];
    const done = requiredQuizzes.filter((qId) => {
      const result = quizResults.find((r) => r.sectionId === qId);
      return result && (result.score / result.total) * 100 >= 70;
    }).length;
    return { done, total: requiredQuizzes.length };
  }

  function handleStartClaim(trackId: string) {
    if (userName) { finalizeClaim(trackId, userName); }
    else { setPendingClaimId(trackId); setShowNamePrompt(true); }
  }

  function handleNameSubmit() {
    const name = nameInput.trim();
    if (!name) return;
    setUserName(name);
    localStorage.setItem(NAME_KEY, name);
    setShowNamePrompt(false);
    if (pendingClaimId) { finalizeClaim(pendingClaimId, name); setPendingClaimId(null); }
  }

  function finalizeClaim(trackId: string, name: string) {
    const certs = loadCertificates();
    if (!certs[trackId]) {
      certs[trackId] = { date: new Date().toISOString(), name, certId: generateCertId(trackId), quizAvg: getQuizAvg(trackId) };
      localStorage.setItem(CERT_KEY, JSON.stringify(certs));
    }
    setCertificates(certs);
    setSelectedCert(trackId);
    setShowCertificate(true);
  }

  function handleDownload() {
    if (!selectedCert) return;
    const track = CERTIFICATE_TRACKS.find((t) => t.id === selectedCert);
    if (!track) return;
    const cert = certificates[track.id];
    const name = cert?.name || userName || "Student";
    const certId = cert?.certId || generateCertId(track.id);
    const quizAvg = cert?.quizAvg || getQuizAvg(track.id);
    const dateStr = cert ? new Date(cert.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 1400;
    canvas.height = 1000;

    // BG
    const bg = ctx.createLinearGradient(0, 0, 1400, 1000);
    bg.addColorStop(0, "#06090d"); bg.addColorStop(0.3, "#0c1420"); bg.addColorStop(0.7, "#0c1420"); bg.addColorStop(1, "#06090d");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1400, 1000);

    // Double border
    ctx.strokeStyle = "#c8a84e"; ctx.lineWidth = 3; ctx.strokeRect(24, 24, 1352, 952);
    ctx.strokeStyle = "rgba(200,168,78,0.25)"; ctx.lineWidth = 1; ctx.strokeRect(34, 34, 1332, 932);

    // Corner L-brackets
    ctx.strokeStyle = "#c8a84e"; ctx.lineWidth = 3;
    ([[42, 42, 1, 1], [1318, 42, -1, 1], [42, 918, 1, -1], [1318, 918, -1, -1]] as [number, number, number, number][]).forEach(([x, y, dx, dy]) => {
      ctx.beginPath(); ctx.moveTo(x, y + dy * 50); ctx.lineTo(x, y); ctx.lineTo(x + dx * 50, y); ctx.stroke();
    });

    // Glow
    const glow = ctx.createRadialGradient(700, 200, 0, 700, 200, 400);
    glow.addColorStop(0, "rgba(200,168,78,0.06)"); glow.addColorStop(1, "rgba(200,168,78,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 1400, 600);

    ctx.textAlign = "center";

    // Icon
    ctx.font = "64px serif"; ctx.fillText(track.icon, 700, 130);

    // Certificate header
    ctx.font = "bold 13px sans-serif"; ctx.fillStyle = "#c8a84e";
    ctx.fillText("C E R T I F I C A T E   O F   A C H I E V E M E N T", 700, 185);

    // Line
    const lineGrad = ctx.createLinearGradient(380, 0, 1020, 0);
    lineGrad.addColorStop(0, "rgba(200,168,78,0)"); lineGrad.addColorStop(0.5, "rgba(200,168,78,0.6)"); lineGrad.addColorStop(1, "rgba(200,168,78,0)");
    ctx.strokeStyle = lineGrad; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(380, 200); ctx.lineTo(1020, 200); ctx.stroke();

    // Track title
    ctx.font = "bold 40px sans-serif"; ctx.fillStyle = "#ffffff"; ctx.fillText(track.title, 700, 260);
    ctx.font = "16px sans-serif"; ctx.fillStyle = "#7a8a9a"; ctx.fillText(track.subtitle, 700, 295);

    // "Awarded to"
    ctx.font = "14px sans-serif"; ctx.fillStyle = "#7a8a9a"; ctx.fillText("This is to certify that", 700, 360);

    // NAME
    ctx.font = "bold 50px serif"; ctx.fillStyle = "#c8a84e"; ctx.fillText(name, 700, 425);
    const nw = ctx.measureText(name).width;
    ctx.strokeStyle = "rgba(200,168,78,0.35)"; ctx.beginPath(); ctx.moveTo(700 - nw / 2 - 30, 442); ctx.lineTo(700 + nw / 2 + 30, 442); ctx.stroke();

    // Achievement
    ctx.font = "14px sans-serif"; ctx.fillStyle = "#7a8a9a"; ctx.fillText("has demonstrated proficiency in equity research by completing the", 700, 490);
    ctx.font = "bold 22px sans-serif"; ctx.fillStyle = "#00c805"; ctx.fillText(`${track.title} Track`, 700, 525);
    ctx.font = "13px sans-serif"; ctx.fillStyle = "#7a8a9a";
    ctx.fillText(`${track.lessonsRequired.length} lessons completed • ${(QUIZ_MAP[track.id] || []).length} quizzes passed • ${quizAvg}% average score`, 700, 560);
    ctx.fillText("on the MarketLens Research Platform", 700, 585);

    // Divider
    ctx.strokeStyle = lineGrad; ctx.beginPath(); ctx.moveTo(300, 620); ctx.lineTo(1100, 620); ctx.stroke();

    // Stats row
    // Lessons
    ctx.font = "bold 36px sans-serif"; ctx.fillStyle = "#00c805"; ctx.fillText(`${track.lessonsRequired.length}`, 330, 690);
    ctx.font = "9px sans-serif"; ctx.fillStyle = "#7a8a9a"; ctx.fillText("LESSONS", 330, 710);

    // Quiz avg
    ctx.font = "bold 36px sans-serif"; ctx.fillStyle = quizAvg >= 90 ? "#c8a84e" : "#00c805"; ctx.fillText(`${quizAvg}%`, 560, 690);
    ctx.font = "9px sans-serif"; ctx.fillStyle = "#7a8a9a"; ctx.fillText("QUIZ SCORE", 560, 710);

    // Cert ID
    ctx.font = "bold 15px monospace"; ctx.fillStyle = "#ffffff"; ctx.fillText(certId, 790, 690);
    ctx.font = "9px sans-serif"; ctx.fillStyle = "#7a8a9a"; ctx.fillText("CERTIFICATE ID", 790, 710);

    // Date
    ctx.font = "bold 16px sans-serif"; ctx.fillStyle = "#ffffff"; ctx.fillText(dateStr, 1050, 690);
    ctx.font = "9px sans-serif"; ctx.fillStyle = "#7a8a9a"; ctx.fillText("DATE ISSUED", 1050, 710);

    // Credential badge
    if (quizAvg >= 90) {
      ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#c8a84e"; ctx.fillText("★ DISTINCTION — Top Performer ★", 700, 760);
    } else if (quizAvg >= 80) {
      ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#00c805"; ctx.fillText("✓ MERIT — Strong Performance", 700, 760);
    }

    // Signatures
    ctx.strokeStyle = "rgba(200,168,78,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(230, 860); ctx.lineTo(530, 860); ctx.stroke();
    ctx.font = "italic 17px serif"; ctx.fillStyle = "#c8a84e"; ctx.fillText("MarketLens", 380, 850);
    ctx.font = "9px sans-serif"; ctx.fillStyle = "#7a8a9a"; ctx.fillText("PLATFORM DIRECTOR", 380, 876);

    ctx.beginPath(); ctx.moveTo(870, 860); ctx.lineTo(1170, 860); ctx.stroke();
    ctx.font = "italic 17px serif"; ctx.fillStyle = "#c8a84e"; ctx.fillText("Equity Education", 1020, 850);
    ctx.font = "9px sans-serif"; ctx.fillStyle = "#7a8a9a"; ctx.fillText("HEAD OF CURRICULUM", 1020, 876);

    // Verification footer
    ctx.font = "10px sans-serif"; ctx.fillStyle = "#3a4a5a";
    ctx.fillText("MarketLens — Free Equity Research & Education for Students Worldwide", 700, 925);
    ctx.fillText(`Verify authenticity at ${typeof window !== "undefined" ? window.location.host : "marketlens-com.vercel.app"}/verify • Certificate ID: ${certId}`, 700, 945);

    const link = document.createElement("a");
    link.download = `MarketLens_${track.title.replace(/\s+/g, "_")}_${name.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const activeCert = CERTIFICATE_TRACKS.find((t) => t.id === selectedCert);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <Award size={28} className="text-white" />
        </div>
        <h2 className="font-display text-3xl font-semibold mb-2">Certificates of Achievement</h2>
        <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
          Earn verified credentials by completing lessons <strong>and</strong> passing quizzes. Each certificate has a unique ID.
        </p>
      </div>

      {/* Profile + Stats Card */}
      <div className="bg-gradient-to-r from-[#0f1419] to-[#1a2332] rounded-2xl p-6 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand)]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/20">
              {userName ? userName.charAt(0).toUpperCase() : <User size={22} />}
            </div>
            <div>
              {userName ? (
                <>
                  <p className="text-base font-bold">{userName}</p>
                  <p className="text-[11px] text-gray-400">MarketLens Student</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-300">Set your name to get started</p>
                  <p className="text-[11px] text-gray-500">Required for certificates</p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => { setShowNamePrompt(true); setPendingClaimId(null); }}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
          >
            {userName ? "Edit" : "Enter Name"}
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: BookOpen, label: "Lessons", value: `${totalLessonsCompleted}/${LESSONS.length}`, pct: (totalLessonsCompleted / LESSONS.length) * 100, color: "from-emerald-500 to-green-500" },
            { icon: Target, label: "Quizzes Passed", value: `${totalQuizzesPassed}`, pct: Math.min(totalQuizzesPassed * 15, 100), color: "from-blue-500 to-indigo-500" },
            { icon: Award, label: "Certificates", value: `${Object.keys(certificates).length}`, pct: (Object.keys(certificates).length / 4) * 100, color: "from-amber-500 to-orange-500" },
            { icon: ShieldCheck, label: "Avg Score", value: quizResults.length > 0 ? `${Math.round(quizResults.reduce((a, r) => a + (r.score / r.total) * 100, 0) / quizResults.length)}%` : "—", pct: quizResults.length > 0 ? quizResults.reduce((a, r) => a + (r.score / r.total) * 100, 0) / quizResults.length : 0, color: "from-violet-500 to-purple-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={13} className="text-gray-400" />
                <span className="text-[10px] text-gray-400 font-medium">{stat.label}</span>
              </div>
              <p className="text-lg font-bold mb-1.5">{stat.value}</p>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${stat.color} transition-all duration-700`} style={{ width: `${Math.min(stat.pct, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Tracks */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <ShieldCheck size={16} className="text-[var(--color-brand)]" />
          Certificate Tracks
          <span className="text-[10px] font-normal text-[var(--color-text-muted)] ml-1">Requires lessons + quizzes</span>
        </h3>

        {CERTIFICATE_TRACKS.map((track) => {
          const completedLessons = track.lessonsRequired.filter((id) => isLessonComplete(progress, id)).length;
          const totalRequired = track.lessonsRequired.length;
          const lessonPct = Math.round((completedLessons / totalRequired) * 100);
          const quizInfo = getQuizzesDone(track.id);
          const quizAvg = getQuizAvg(track.id);
          const cert = certificates[track.id];
          const isEarned = !!cert;

          const lessonsOk = completedLessons === totalRequired;
          const quizzesOk = quizInfo.done === quizInfo.total;
          const scoreOk = quizAvg >= track.minQuizScore;
          const canClaim = lessonsOk && quizzesOk && scoreOk && !isEarned && !!userName;

          return (
            <div
              key={track.id}
              className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                isEarned
                  ? "border-[var(--color-brand)]/30 shadow-lg ring-1 ring-[var(--color-brand)]/10"
                  : canClaim
                  ? "border-amber-300 shadow-xl shadow-amber-100/50"
                  : "border-[var(--color-border)] shadow-sm"
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${track.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                    <span className="text-2xl">{track.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold">{track.title}</h3>
                      {isEarned && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)] text-[10px] font-bold">
                          <CheckCircle size={10} /> Verified
                        </span>
                      )}
                      {canClaim && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold animate-pulse">
                          <Trophy size={10} /> Ready!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">{track.description}</p>

                    {/* Requirements checklist */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {/* Lessons */}
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium border ${lessonsOk ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                        {lessonsOk ? <CheckCircle size={12} /> : <BookOpen size={12} />}
                        <span>{completedLessons}/{totalRequired} Lessons</span>
                      </div>
                      {/* Quizzes */}
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium border ${quizzesOk ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                        {quizzesOk ? <CheckCircle size={12} /> : <Target size={12} />}
                        <span>{quizInfo.done}/{quizInfo.total} Quizzes</span>
                      </div>
                      {/* Score */}
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium border ${scoreOk ? "bg-emerald-50 border-emerald-200 text-emerald-700" : quizAvg > 0 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                        {scoreOk ? <CheckCircle size={12} /> : quizAvg > 0 ? <AlertTriangle size={12} /> : <ShieldCheck size={12} />}
                        <span>{quizAvg > 0 ? `${quizAvg}%` : "—"} / {track.minQuizScore}% min</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-[var(--color-surface-card)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isEarned ? "bg-[var(--color-brand)]" : "bg-gradient-to-r from-blue-500 to-indigo-500"}`}
                          style={{ width: `${lessonPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] tabular-nums">{lessonPct}%</span>
                    </div>

                    {/* Cert ID if earned */}
                    {isEarned && cert && (
                      <div className="mt-3 flex items-center gap-4 px-3 py-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <ShieldCheck size={11} className="text-[var(--color-brand)]" />
                          <span className="font-mono font-bold text-[var(--color-text-primary)]">{cert.certId}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                          <Clock size={10} />
                          {new Date(cert.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                          <Target size={10} />
                          {cert.quizAvg}% avg
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {isEarned ? (
                      <button
                        onClick={() => { setSelectedCert(track.id); setShowCertificate(true); }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dim)] transition-colors shadow-md shadow-[var(--color-brand)]/20"
                      >
                        <Download size={13} /> Download
                      </button>
                    ) : canClaim ? (
                      <button
                        onClick={() => handleStartClaim(track.id)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-200 animate-pulse"
                      >
                        <Award size={13} /> Claim Certificate
                      </button>
                    ) : !userName ? (
                      <button
                        onClick={() => { setShowNamePrompt(true); setPendingClaimId(null); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium border border-amber-300 text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <User size={12} /> Set name first
                      </button>
                    ) : (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                          <Lock size={12} />
                          In Progress
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works */}
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-5">
        <h4 className="text-xs font-bold mb-3 text-[var(--color-text-primary)]">How Certificates Work</h4>
        <div className="grid grid-cols-4 gap-3">
          {[
            { step: "1", title: "Complete Lessons", desc: "Read all sections in required lessons" },
            { step: "2", title: "Pass Quizzes", desc: "Score above minimum on related quizzes" },
            { step: "3", title: "Enter Your Name", desc: "Your real name for the certificate" },
            { step: "4", title: "Download & Share", desc: "Get a verified PNG with unique ID" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-8 h-8 rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)] text-xs font-bold flex items-center justify-center mx-auto mb-2">{s.step}</div>
              <p className="text-[11px] font-bold text-[var(--color-text-primary)]">{s.title}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Name Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setShowNamePrompt(false); setPendingClaimId(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-center mb-1">Enter Your Full Name</h3>
              <p className="text-xs text-[var(--color-text-muted)] text-center mb-5">
                This will appear on your certificate exactly as typed. Use your real name.
              </p>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                placeholder="e.g. Anurag Pondey"
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-border)] text-sm font-medium focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all placeholder:text-gray-300"
                autoFocus
              />
            </div>
            <div className="px-6 pb-5 flex gap-2">
              <button onClick={() => { setShowNamePrompt(false); setPendingClaimId(null); }} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">Cancel</button>
              <button onClick={handleNameSubmit} disabled={!nameInput.trim()} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dim)] transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
                {pendingClaimId ? "Save & Claim" : "Save Name"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {showCertificate && activeCert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowCertificate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-[#06090d] via-[#0c1420] to-[#06090d] p-8 sm:p-10">
              <div className="absolute inset-4 border-2 border-[#c8a84e]/25 rounded-xl pointer-events-none" />
              <div className="absolute inset-5 border border-[#c8a84e]/10 rounded-lg pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#c8a84e]/8 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative text-center">
                <span className="text-4xl mb-3 block">{activeCert.icon}</span>
                <p className="text-[9px] text-[#c8a84e] uppercase tracking-[0.3em] font-bold mb-3">Certificate of Achievement</p>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{activeCert.title}</h3>
                <p className="text-xs text-gray-500 mb-5">{activeCert.subtitle}</p>

                <div className="w-40 h-px bg-gradient-to-r from-transparent via-[#c8a84e]/40 to-transparent mx-auto mb-4" />

                <p className="text-[10px] text-gray-500 mb-1">Awarded to</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#c8a84e] font-serif mb-1">
                  {certificates[activeCert.id]?.name || userName || "Student"}
                </p>
                <div className="w-56 h-px bg-[#c8a84e]/25 mx-auto mb-4" />

                <p className="text-[10px] text-gray-500 mb-5">
                  {activeCert.lessonsRequired.length} lessons • {(QUIZ_MAP[activeCert.id] || []).length} quizzes passed • {certificates[activeCert.id]?.quizAvg || getQuizAvg(activeCert.id)}% avg score
                </p>

                <div className="flex items-center justify-center gap-6 text-center">
                  <div>
                    <p className="text-xs font-mono font-bold text-white">{certificates[activeCert.id]?.certId || "—"}</p>
                    <p className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5">Certificate ID</p>
                  </div>
                  <div className="w-px h-8 bg-gray-700" />
                  <div>
                    <p className="text-xs font-bold text-white">
                      {certificates[activeCert.id] ? new Date(certificates[activeCert.id].date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                    </p>
                    <p className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5">Date Issued</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between gap-2 bg-[var(--color-surface)]">
              <button onClick={() => setShowCertificate(false)} className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">Close</button>
              <div className="flex items-center gap-2">
                {certificates[activeCert.id] && (
                  <button
                    onClick={() => copyVerifyLink(activeCert.id, activeCert.title, activeCert.lessonsRequired.length)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    {copiedLink ? <><Check size={14} className="text-[var(--color-positive)]" /> Link copied</> : <><Copy size={14} /> Copy verify link</>}
                  </button>
                )}
                <button onClick={handleDownload} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dim)] transition-colors shadow-lg shadow-[var(--color-brand)]/20">
                  <Download size={14} /> Download Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
