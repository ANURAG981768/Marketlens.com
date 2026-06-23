"use client";

import { useState, useEffect, useRef } from "react";
import { Award, Download, Share2, CheckCircle, Lock, ChevronRight, BookOpen, Target, Trophy } from "lucide-react";
import { LESSONS } from "@/lib/lessons-data";

const STORAGE_KEY = "marketlens_lessons_progress";
const CERT_KEY = "marketlens_certificates";

interface Certificate {
  id: string;
  title: string;
  earnedDate: string;
  lessonsRequired: string[];
  quizMinScore?: number;
}

const CERTIFICATE_TRACKS: {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  lessonsRequired: string[];
  description: string;
}[] = [
  {
    id: "foundations",
    title: "Investment Foundations",
    subtitle: "Core knowledge every investor needs",
    icon: "🏛️",
    gradient: "from-emerald-500 to-green-600",
    lessonsRequired: ["intro-stock-market", "reading-financial-statements", "valuation-basics"],
    description: "Complete the Stock Market, Financial Statements, and Valuation lessons to earn this certificate.",
  },
  {
    id: "analyst",
    title: "Junior Equity Analyst",
    subtitle: "Technical and fundamental analysis skills",
    icon: "📊",
    gradient: "from-blue-500 to-indigo-600",
    lessonsRequired: ["intro-stock-market", "reading-financial-statements", "valuation-basics", "technical-analysis-intro", "risk-management"],
    description: "Complete 5 core lessons including technical analysis and risk management.",
  },
  {
    id: "portfolio-manager",
    title: "Portfolio Strategist",
    subtitle: "Advanced portfolio and global market knowledge",
    icon: "🎯",
    gradient: "from-violet-500 to-purple-600",
    lessonsRequired: ["portfolio-construction", "etfs-index-investing", "risk-management", "global-markets", "behavioral-finance"],
    description: "Master portfolio construction, ETFs, global markets, and behavioral finance.",
  },
  {
    id: "complete",
    title: "MarketLens Scholar",
    subtitle: "All courses completed — full platform mastery",
    icon: "🏆",
    gradient: "from-amber-500 to-orange-600",
    lessonsRequired: LESSONS.map((l) => l.id),
    description: "Complete every single lesson on MarketLens to earn this prestigious certificate.",
  },
];

function loadProgress(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadCertificates(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CERT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCertificate(certId: string) {
  const certs = loadCertificates();
  if (!certs[certId]) {
    certs[certId] = new Date().toISOString();
    localStorage.setItem(CERT_KEY, JSON.stringify(certs));
  }
  return certs[certId];
}

function isLessonComplete(progress: Record<string, string[]>, lessonId: string): boolean {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return false;
  const completed = progress[lessonId] || [];
  return completed.length >= lesson.sections.length;
}

export default function CertificateGenerator() {
  const [progress, setProgress] = useState<Record<string, string[]>>({});
  const [certificates, setCertificates] = useState<Record<string, string>>({});
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProgress(loadProgress());
    setCertificates(loadCertificates());
  }, []);

  const totalLessonsCompleted = LESSONS.filter((l) => isLessonComplete(progress, l.id)).length;

  function handleClaim(trackId: string) {
    const date = saveCertificate(trackId);
    setCertificates((prev) => ({ ...prev, [trackId]: date }));
    setSelectedCert(trackId);
    setShowCertificate(true);
  }

  function handleDownload() {
    if (!certRef.current || !selectedCert) return;
    const track = CERTIFICATE_TRACKS.find((t) => t.id === selectedCert);
    if (!track) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 850;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 850);
    bgGrad.addColorStop(0, "#0f1419");
    bgGrad.addColorStop(0.5, "#1a2332");
    bgGrad.addColorStop(1, "#0f1419");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 850);

    // Border
    ctx.strokeStyle = "#00c805";
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 1140, 790);

    // Inner border
    ctx.strokeStyle = "rgba(0, 200, 5, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, 1120, 770);

    // Corner decorations
    const cornerSize = 40;
    ctx.strokeStyle = "#00c805";
    ctx.lineWidth = 2;
    [[45, 45], [1115, 45], [45, 765], [1115, 765]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + cornerSize);
      ctx.lineTo(x, y);
      ctx.lineTo(x + (x < 600 ? cornerSize : -cornerSize), y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + (x < 600 ? cornerSize : -cornerSize), y + (y < 400 ? 0 : 0));
      ctx.stroke();
    });

    // Green glow circle
    const glowGrad = ctx.createRadialGradient(600, 200, 0, 600, 200, 300);
    glowGrad.addColorStop(0, "rgba(0, 200, 5, 0.08)");
    glowGrad.addColorStop(1, "rgba(0, 200, 5, 0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, 1200, 850);

    // Icon
    ctx.font = "64px serif";
    ctx.textAlign = "center";
    ctx.fillText(track.icon, 600, 150);

    // "Certificate of Completion" text
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#00c805";
    ctx.letterSpacing = "6px";
    ctx.fillText("C E R T I F I C A T E   O F   C O M P L E T I O N", 600, 210);

    // Title
    ctx.font = "bold 42px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(track.title, 600, 290);

    // Subtitle
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#8899a6";
    ctx.fillText(track.subtitle, 600, 330);

    // Divider
    const divGrad = ctx.createLinearGradient(300, 0, 900, 0);
    divGrad.addColorStop(0, "rgba(0, 200, 5, 0)");
    divGrad.addColorStop(0.5, "rgba(0, 200, 5, 0.5)");
    divGrad.addColorStop(1, "rgba(0, 200, 5, 0)");
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(300, 365);
    ctx.lineTo(900, 365);
    ctx.stroke();

    // "This certifies that"
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#8899a6";
    ctx.fillText("This certifies that a student of", 600, 410);

    // Platform name
    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "#00c805";
    ctx.fillText("MarketLens Research Platform", 600, 455);

    // Achievement text
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#8899a6";
    ctx.fillText(`has successfully completed the ${track.title} track`, 600, 500);
    ctx.fillText(`comprising ${track.lessonsRequired.length} comprehensive lessons in equity research and investing`, 600, 525);

    // Second divider
    ctx.strokeStyle = divGrad;
    ctx.beginPath();
    ctx.moveTo(300, 565);
    ctx.lineTo(900, 565);
    ctx.stroke();

    // Lessons completed
    ctx.font = "bold 48px sans-serif";
    ctx.fillStyle = "#00c805";
    ctx.fillText(`${track.lessonsRequired.length}`, 400, 640);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#8899a6";
    ctx.fillText("LESSONS COMPLETED", 400, 665);

    // Date
    const dateStr = certificates[track.id]
      ? new Date(certificates[track.id]).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(dateStr, 800, 635);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#8899a6";
    ctx.fillText("DATE ISSUED", 800, 665);

    // Footer
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#536471";
    ctx.fillText("MarketLens — Free Equity Research & Education Platform for Students Worldwide", 600, 760);
    ctx.fillText("marketlens.app • Verify at marketlens.app/verify", 600, 780);

    // Download
    const link = document.createElement("a");
    link.download = `MarketLens_Certificate_${track.title.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const activeCert = CERTIFICATE_TRACKS.find((t) => t.id === selectedCert);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <Award size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Certificates</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Complete lesson tracks to earn downloadable certificates
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[var(--color-brand)]" />
            <p className="text-sm font-bold">Learning Progress</p>
          </div>
          <p className="text-sm font-bold text-[var(--color-brand)]">
            {totalLessonsCompleted} / {LESSONS.length} lessons
          </p>
        </div>
        <div className="w-full h-3 bg-[var(--color-surface-card)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-700"
            style={{ width: `${(totalLessonsCompleted / LESSONS.length) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {Object.keys(certificates).length} certificate{Object.keys(certificates).length !== 1 ? "s" : ""} earned
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {LESSONS.length - totalLessonsCompleted} lessons remaining
          </span>
        </div>
      </div>

      {/* Certificate Tracks */}
      <div className="space-y-3">
        {CERTIFICATE_TRACKS.map((track) => {
          const completedCount = track.lessonsRequired.filter((id) => isLessonComplete(progress, id)).length;
          const totalRequired = track.lessonsRequired.length;
          const pct = Math.round((completedCount / totalRequired) * 100);
          const isEarned = !!certificates[track.id];
          const canClaim = completedCount === totalRequired && !isEarned;

          return (
            <div
              key={track.id}
              className={`bg-white border rounded-xl overflow-hidden transition-all ${
                isEarned
                  ? "border-[var(--color-brand)]/30 shadow-md"
                  : canClaim
                  ? "border-amber-300 shadow-lg shadow-amber-100"
                  : "border-[var(--color-border)]"
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${track.gradient} flex items-center justify-center shadow-md shrink-0`}>
                    <span className="text-2xl">{track.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                        {track.title}
                      </h3>
                      {isEarned && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)] text-[10px] font-semibold">
                          <CheckCircle size={10} />
                          Earned
                        </span>
                      )}
                      {canClaim && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold animate-pulse">
                          <Trophy size={10} />
                          Ready to Claim!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">{track.subtitle}</p>

                    {/* Required lessons */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {track.lessonsRequired.map((lessonId) => {
                        const lesson = LESSONS.find((l) => l.id === lessonId);
                        const done = isLessonComplete(progress, lessonId);
                        return (
                          <span
                            key={lessonId}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${
                              done
                                ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                                : "bg-[var(--color-surface-card)] text-[var(--color-text-muted)]"
                            }`}
                          >
                            {done ? <CheckCircle size={9} /> : <Lock size={9} />}
                            {lesson?.title.split(" ").slice(0, 3).join(" ") || lessonId}
                          </span>
                        );
                      })}
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-[var(--color-surface-card)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isEarned ? "bg-[var(--color-brand)]" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-[var(--color-text-muted)] tabular-nums shrink-0">
                        {completedCount}/{totalRequired}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {isEarned ? (
                      <button
                        onClick={() => { setSelectedCert(track.id); setShowCertificate(true); }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dim)] transition-colors shadow-sm"
                      >
                        <Download size={13} />
                        Download
                      </button>
                    ) : canClaim ? (
                      <button
                        onClick={() => handleClaim(track.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-200 animate-pulse"
                      >
                        <Award size={13} />
                        Claim
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                        <Lock size={12} />
                        {totalRequired - completedCount} left
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificate Preview Modal */}
      {showCertificate && activeCert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-fade-in-scale">
            {/* Certificate Preview */}
            <div ref={certRef} className="relative bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419] p-8 sm:p-12">
              {/* Decorative border */}
              <div className="absolute inset-4 border-2 border-[var(--color-brand)]/30 rounded-xl pointer-events-none" />
              <div className="absolute inset-5 border border-[var(--color-brand)]/10 rounded-lg pointer-events-none" />

              {/* Green glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[var(--color-brand)]/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative text-center">
                <span className="text-5xl mb-4 block">{activeCert.icon}</span>
                <p className="text-[10px] text-[var(--color-brand)] uppercase tracking-[0.3em] font-semibold mb-4">
                  Certificate of Completion
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{activeCert.title}</h3>
                <p className="text-sm text-gray-400 mb-6">{activeCert.subtitle}</p>

                <div className="w-48 h-px bg-gradient-to-r from-transparent via-[var(--color-brand)]/50 to-transparent mx-auto mb-6" />

                <p className="text-xs text-gray-500 mb-1">This certifies that a student of</p>
                <p className="text-lg font-bold text-[var(--color-brand)] mb-1">MarketLens Research Platform</p>
                <p className="text-xs text-gray-500 mb-6">
                  has successfully completed the {activeCert.title} track<br />
                  comprising {activeCert.lessonsRequired.length} comprehensive lessons
                </p>

                <div className="flex items-center justify-center gap-12">
                  <div>
                    <p className="text-3xl font-bold text-[var(--color-brand)]">{activeCert.lessonsRequired.length}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">Lessons</p>
                  </div>
                  <div className="w-px h-10 bg-gray-700" />
                  <div>
                    <p className="text-sm font-bold text-white">
                      {certificates[activeCert.id]
                        ? new Date(certificates[activeCert.id]).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                        : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">Date Issued</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 flex items-center justify-between bg-[var(--color-surface)]">
              <button
                onClick={() => setShowCertificate(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Close
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dim)] transition-colors shadow-md shadow-[var(--color-brand)]/20"
                >
                  <Download size={14} />
                  Download PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
