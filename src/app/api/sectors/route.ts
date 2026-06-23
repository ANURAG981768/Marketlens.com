import { NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// SPDR sector ETFs are the standard proxy for sector performance
const SECTORS: { name: string; etf: string; top: string[] }[] = [
  { name: "Technology", etf: "XLK", top: ["AAPL", "MSFT", "NVDA", "AVGO"] },
  { name: "Healthcare", etf: "XLV", top: ["LLY", "UNH", "JNJ", "MRK"] },
  { name: "Financial Services", etf: "XLF", top: ["JPM", "V", "MA", "BAC"] },
  { name: "Consumer Cyclical", etf: "XLY", top: ["AMZN", "TSLA", "HD", "NKE"] },
  { name: "Communication Services", etf: "XLC", top: ["GOOGL", "META", "NFLX", "DIS"] },
  { name: "Industrials", etf: "XLI", top: ["GE", "CAT", "BA", "HON"] },
  { name: "Consumer Defensive", etf: "XLP", top: ["WMT", "PG", "KO", "COST"] },
  { name: "Energy", etf: "XLE", top: ["XOM", "CVX", "COP", "SLB"] },
  { name: "Real Estate", etf: "XLRE", top: ["PLD", "AMT", "EQIX", "SPG"] },
  { name: "Utilities", etf: "XLU", top: ["NEE", "SO", "DUK", "CEG"] },
  { name: "Basic Materials", etf: "XLB", top: ["LIN", "SHW", "FCX", "ECL"] },
];

interface SectorResult {
  name: string;
  etf: string;
  change: number;
  weekChange: number;
  monthChange: number;
  ytdChange: number;
  topStocks: string[];
}

async function fetchSector(s: { name: string; etf: string; top: string[] }): Promise<SectorResult | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${s.etf}?interval=1d&range=1y`,
      { headers: { "User-Agent": UA }, next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const r = data?.chart?.result?.[0];
    if (!r) return null;

    const timestamps: number[] = r.timestamp || [];
    const rawCloses: (number | null)[] = r.indicators?.quote?.[0]?.close || [];

    // Build aligned arrays of (timestamp, close) with no nulls
    const series: { t: number; c: number }[] = [];
    for (let i = 0; i < rawCloses.length; i++) {
      if (rawCloses[i] != null) series.push({ t: timestamps[i], c: rawCloses[i] as number });
    }
    if (series.length < 2) return null;

    const lastClose = r.meta?.regularMarketPrice ?? series[series.length - 1].c;
    const n = series.length;
    const pct = (from: number) => (from ? ((lastClose - from) / from) * 100 : 0);

    const dayFrom = series[n - 2].c;
    const weekFrom = series[Math.max(0, n - 6)].c;
    const monthFrom = series[Math.max(0, n - 22)].c;

    // YTD: first trading day of the current calendar year
    const year = new Date().getUTCFullYear();
    const ytdEntry = series.find((p) => new Date(p.t * 1000).getUTCFullYear() === year);
    const ytdFrom = ytdEntry ? ytdEntry.c : series[0].c;

    return {
      name: s.name,
      etf: s.etf,
      change: pct(dayFrom),
      weekChange: pct(weekFrom),
      monthChange: pct(monthFrom),
      ytdChange: pct(ytdFrom),
      topStocks: s.top,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const results = await Promise.all(SECTORS.map(fetchSector));
  const sectors = results.filter((r): r is SectorResult => r !== null);
  if (sectors.length === 0) {
    return NextResponse.json({ error: "unavailable" }, { status: 200 });
  }
  return NextResponse.json({ sectors });
}
