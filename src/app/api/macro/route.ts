import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/upstream";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// Real, live macro/market indicators available via free Yahoo endpoints (no key).
// We deliberately only include indicators we can source live — we do NOT
// hardcode CPI/unemployment/Fed-funds figures we can't verify in real time.
const INDICATORS: {
  symbol: string;
  name: string;
  unit: "%" | "$" | "pt";
  decimals: number;
  explanation: string;
}[] = [
  { symbol: "^TNX", name: "10-Yr Treasury Yield", unit: "%", decimals: 2, explanation: "The benchmark U.S. interest rate. It drives mortgage and loan rates and is the discount rate behind most stock valuations — when it rises, growth stocks usually fall." },
  { symbol: "^TYX", name: "30-Yr Treasury Yield", unit: "%", decimals: 2, explanation: "The long-bond yield reflects the market's long-term inflation and growth expectations." },
  { symbol: "^IRX", name: "13-Wk T-Bill Rate", unit: "%", decimals: 2, explanation: "A short-term rate that closely tracks the Federal Reserve's policy rate — a real-time read on Fed tightening or easing." },
  { symbol: "^VIX", name: "VIX (Volatility)", unit: "pt", decimals: 2, explanation: "Wall Street's 'fear gauge' — the expected 30-day volatility of the S&P 500. Below ~15 is calm; above ~30 signals fear." },
  { symbol: "DX-Y.NYB", name: "U.S. Dollar Index", unit: "pt", decimals: 2, explanation: "The dollar's strength against a basket of major currencies. A strong dollar pressures commodities and U.S. multinationals' overseas earnings." },
  { symbol: "GC=F", name: "Gold", unit: "$", decimals: 0, explanation: "A classic safe-haven asset. Gold tends to rise during inflation, uncertainty, or falling real rates." },
  { symbol: "CL=F", name: "Crude Oil (WTI)", unit: "$", decimals: 2, explanation: "Energy prices feed directly into inflation and consumer spending. Oil spikes can pressure the whole economy." },
];

interface MacroResult {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePct: number;
  unit: string;
  decimals: number;
  explanation: string;
}

async function fetchOne(ind: (typeof INDICATORS)[number]): Promise<MacroResult | null> {
  try {
    const res = await fetchWithTimeout(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ind.symbol)}?interval=1d&range=5d`,
      { headers: { "User-Agent": UA }, next: { revalidate: 120 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    if (typeof price !== "number") return null;
    const prev = meta.chartPreviousClose || meta.previousClose || price;
    const change = price - prev;
    return {
      name: ind.name,
      symbol: ind.symbol,
      value: price,
      change,
      changePct: prev ? (change / prev) * 100 : 0,
      unit: ind.unit,
      decimals: ind.decimals,
      explanation: ind.explanation,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const results = await Promise.all(INDICATORS.map(fetchOne));
  const indicators = results.filter((r): r is MacroResult => r !== null);
  if (indicators.length === 0) {
    return NextResponse.json({ error: "unavailable" }, { status: 200 });
  }
  return NextResponse.json({ indicators });
}
