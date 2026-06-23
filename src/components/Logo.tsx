export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00d906" />
          <stop offset="100%" stopColor="#009e04" />
        </linearGradient>
        <linearGradient id="lensGrad" x1="18" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
      {/* Stylized rising chart bars */}
      <rect x="8" y="24" width="4" height="8" rx="1" fill="white" opacity="0.5" />
      <rect x="14" y="19" width="4" height="13" rx="1" fill="white" opacity="0.65" />
      <rect x="20" y="14" width="4" height="18" rx="1" fill="white" opacity="0.8" />
      <rect x="26" y="9" width="4" height="23" rx="1" fill="white" opacity="0.95" />
      {/* Lens circle overlay */}
      <circle cx="24" cy="18" r="9" stroke="url(#lensGrad)" strokeWidth="2.5" fill="none" />
      {/* Lens handle */}
      <line x1="30" y1="24" x2="34" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

export function LogoFull({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={36} />
      <div>
        <h1 className="text-base font-bold tracking-tight leading-none text-[var(--color-text-primary)]">
          Market<span className="text-[var(--color-brand)]">Lens</span>
        </h1>
        <p className="text-[9px] text-[var(--color-text-muted)] leading-none mt-0.5 tracking-wider uppercase">
          Research Platform
        </p>
      </div>
    </div>
  );
}

export function LogoHero({ className = "" }: { className?: string }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="heroLogoGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00d906" />
          <stop offset="100%" stopColor="#009e04" />
        </linearGradient>
        <filter id="heroGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>
      {/* Glow behind */}
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#00c805" opacity="0.12" filter="url(#heroGlow)" />
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#heroLogoGrad)" />
      {/* Chart bars */}
      <rect x="13" y="38" width="6" height="13" rx="1.5" fill="white" opacity="0.45" />
      <rect x="22" y="30" width="6" height="21" rx="1.5" fill="white" opacity="0.6" />
      <rect x="31" y="22" width="6" height="29" rx="1.5" fill="white" opacity="0.75" />
      <rect x="40" y="14" width="6" height="37" rx="1.5" fill="white" opacity="0.9" />
      {/* Lens */}
      <circle cx="38" cy="28" r="14" stroke="white" strokeWidth="3.5" fill="none" opacity="0.9" />
      <line x1="47.5" y1="38" x2="53" y2="43.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function QuizSectionIcon({ icon, className = "" }: { icon: string; className?: string }) {
  const iconConfig: Record<string, { bg: string; fg: string; symbol: string }> = {
    "📊": { bg: "from-emerald-500 to-teal-600", fg: "text-white", symbol: "M" },
    "📋": { bg: "from-blue-500 to-indigo-600", fg: "text-white", symbol: "F" },
    "🎯": { bg: "from-violet-500 to-purple-600", fg: "text-white", symbol: "V" },
    "📈": { bg: "from-green-500 to-emerald-600", fg: "text-white", symbol: "T" },
    "⚡": { bg: "from-amber-500 to-orange-600", fg: "text-white", symbol: "O" },
    "🛡️": { bg: "from-cyan-500 to-blue-600", fg: "text-white", symbol: "R" },
    "🏦": { bg: "from-slate-500 to-gray-700", fg: "text-white", symbol: "B" },
    "🌍": { bg: "from-teal-500 to-cyan-600", fg: "text-white", symbol: "G" },
    "🧮": { bg: "from-rose-500 to-pink-600", fg: "text-white", symbol: "P" },
    "🧠": { bg: "from-fuchsia-500 to-purple-600", fg: "text-white", symbol: "B" },
  };

  const config = iconConfig[icon] || { bg: "from-gray-500 to-gray-600", fg: "text-white", symbol: "?" };

  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.bg} flex items-center justify-center shadow-sm ${className}`}>
      <span className={`text-sm font-black ${config.fg}`}>{config.symbol}</span>
    </div>
  );
}

export function FeatureIcon({ type, className = "" }: { type: "market" | "screener" | "earnings" | "trade" | "quiz" | "glossary" | "journal"; className?: string }) {
  const configs = {
    market: {
      gradient: "from-emerald-500 to-green-600",
      path: (
        <>
          <polyline points="4,14 8,8 12,11 16,4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="16" cy="4" r="1.5" fill="white" />
        </>
      ),
    },
    screener: {
      gradient: "from-blue-500 to-indigo-600",
      path: (
        <>
          <rect x="3" y="3" width="14" height="3" rx="1" fill="white" opacity="0.5" />
          <rect x="3" y="8" width="10" height="3" rx="1" fill="white" opacity="0.7" />
          <rect x="3" y="13" width="14" height="3" rx="1" fill="white" opacity="0.9" />
        </>
      ),
    },
    earnings: {
      gradient: "from-amber-500 to-orange-600",
      path: (
        <>
          <rect x="3" y="2" width="14" height="15" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
          <line x1="3" y1="6" x2="17" y2="6" stroke="white" strokeWidth="1.5" />
          <circle cx="7" cy="11" r="1" fill="white" />
          <circle cx="10" cy="11" r="1" fill="white" />
          <circle cx="13" cy="11" r="1" fill="white" />
        </>
      ),
    },
    trade: {
      gradient: "from-green-500 to-emerald-600",
      path: (
        <>
          <path d="M10 3L10 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M6 7L10 3L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="4" y1="17" x2="16" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ),
    },
    quiz: {
      gradient: "from-violet-500 to-purple-600",
      path: (
        <>
          <path d="M4 3H16L14 10H6L4 3Z" stroke="white" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <rect x="6" y="12" width="8" height="5" rx="1" stroke="white" strokeWidth="1.5" fill="none" />
          <line x1="10" y1="10" x2="10" y2="12" stroke="white" strokeWidth="1.5" />
        </>
      ),
    },
    glossary: {
      gradient: "from-teal-500 to-cyan-600",
      path: (
        <>
          <rect x="3" y="2" width="14" height="16" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
          <line x1="7" y1="6" x2="15" y2="6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="7" y1="10" x2="13" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="7" y1="14" x2="11" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="4.5" cy="6" r="0.8" fill="white" />
          <circle cx="4.5" cy="10" r="0.8" fill="white" />
          <circle cx="4.5" cy="14" r="0.8" fill="white" />
        </>
      ),
    },
    journal: {
      gradient: "from-purple-500 to-fuchsia-600",
      path: (
        <>
          <rect x="4" y="2" width="12" height="16" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
          <line x1="7" y1="6" x2="13" y2="6" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="7" y1="9" x2="13" y2="9" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="7" y1="12" x2="11" y2="12" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M14 13L16 15L18 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      ),
    },
  };

  const config = configs[type];

  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-sm ${className}`}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        {config.path}
      </svg>
    </div>
  );
}
