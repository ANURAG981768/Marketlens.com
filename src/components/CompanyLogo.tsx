"use client";

import { useState, useEffect } from "react";

const LOGO_COLORS: Record<string, string> = {
  AAPL: "#555555", MSFT: "#00A4EF", GOOGL: "#4285F4", AMZN: "#FF9900",
  NVDA: "#76B900", TSLA: "#CC0000", META: "#0081FB", JPM: "#003A70",
  V: "#1A1F71", JNJ: "#D51900", WMT: "#0071CE", PG: "#003DA5",
  UNH: "#002677", MA: "#EB001B", HD: "#F96302", KO: "#F40009",
  PEP: "#004B93", ABBV: "#071D49", MRK: "#009A44", COST: "#E31837",
  AVGO: "#CC092F", TMO: "#0072CE", CSCO: "#049FD9", ACN: "#A100FF",
  CRM: "#00A1E0", ABT: "#0072BC", LLY: "#D52B1E", NFLX: "#E50914",
  AMD: "#ED1C24", INTC: "#0071C5", QCOM: "#3253DC", BA: "#0033A0",
  DIS: "#113CCF", NKE: "#111111", GS: "#6F9FD8", ADBE: "#FF0000",
  BTC: "#F7931A", ETH: "#627EEA", SOL: "#9945FF", BNB: "#F3BA2F",
  XRP: "#23292F", DOGE: "#C2A633", ADA: "#0033AD", AVAX: "#E84142",
  DOT: "#E6007A", LINK: "#2A5ADA", ORCL: "#F80000", IBM: "#0530AD",
  GE: "#3B7DDD", CAT: "#FFCD11", F: "#003478", GM: "#0170CE",
  T: "#00A8E0", VZ: "#CD040B", PYPL: "#003087", SQ: "#3E4348",
  SHOP: "#96BF48", SPOT: "#1DB954", UBER: "#000000", SNAP: "#FFFC00",
  PINS: "#E60023", ZM: "#2D8CFF", ABNB: "#FF5A5F", COIN: "#0052FF",
  HOOD: "#00C805", PLTR: "#101010", SNOW: "#29B5E8",
};

const LOGO_ICONS: Record<string, string> = {
  AAPL: "A", MSFT: "M", GOOGL: "G", AMZN: "a", NVDA: "N",
  TSLA: "T", META: "∞", JPM: "⌂", V: "V", JNJ: "+",
  WMT: "✦", KO: "C", PEP: "P", NFLX: "N", AMD: "◢",
  INTC: "i", QCOM: "Q", BA: "✈", DIS: "D", NKE: "✓",
  GS: "GS", ADBE: "Ai", CRM: "☁", BTC: "₿", ETH: "Ξ",
  SOL: "◎", BNB: "⬡", XRP: "✕", DOGE: "Ð", ADA: "₳",
  AVAX: "▲", DOT: "●", LINK: "⬡", ORCL: "O", IBM: "=",
  PYPL: "PP", SHOP: "S", SPOT: "♪", UBER: "U", SNAP: "👻",
  COIN: "C", HOOD: "⬡", PLTR: "◈", SNOW: "❄",
};

interface CompanyLogoProps {
  symbol: string;
  size?: number;
  className?: string;
}

export default function CompanyLogo({ symbol, size = 24, className = "" }: CompanyLogoProps) {
  const cleanSymbol = symbol.replace("-USD", "").toUpperCase();
  const isCrypto = symbol.toUpperCase().endsWith("-USD");
  const [failed, setFailed] = useState(false);

  // Reset error state when the symbol changes (this component is reused across rows)
  useEffect(() => { setFailed(false); }, [symbol]);

  const bgColor = LOGO_COLORS[cleanSymbol] || generateColor(cleanSymbol);
  const icon = LOGO_ICONS[cleanSymbol];
  const fontSize = size * 0.42;

  // Branded letter tile — the guaranteed fallback (and the look for crypto)
  const tile = (
    <div
      className={`rounded-lg flex items-center justify-center font-bold text-white shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.30), rgba(255,255,255,0) 55%)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.28), inset 0 -2px 3px rgba(0,0,0,0.18)",
        fontSize,
      }}
    >
      {icon || cleanSymbol.slice(0, 2)}
    </div>
  );

  if (isCrypto || failed) return tile;

  // Real company logo, falling back to the letter tile on any load error
  return (
    <div
      className={`relative rounded-lg overflow-hidden shrink-0 bg-white flex items-center justify-center border border-black/5 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Faint letter behind, so the tile is never blank if the logo is
          transparent/empty; a real opaque logo covers it. */}
      <span
        className="absolute inset-0 flex items-center justify-center font-bold text-[var(--color-text-muted)]/40 select-none"
        style={{ fontSize }}
        aria-hidden="true"
      >
        {icon || cleanSymbol.slice(0, 2)}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://assets.parqet.com/logos/symbol/${cleanSymbol}?format=png&size=128`}
        alt={cleanSymbol}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth <= 1 || img.naturalHeight <= 1) setFailed(true);
        }}
        className="relative w-full h-full object-contain"
        style={{ padding: size > 28 ? 3 : 2 }}
      />
    </div>
  );
}

function generateColor(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 40%)`;
}
