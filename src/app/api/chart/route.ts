import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/upstream";

// Intraday chart data — what every competitor shows by default ("today's"
// movement). Yahoo serves this via short intervals; we expose 1D (5-minute
// bars) and 5D (30-minute bars). Daily/weekly ranges keep using the full
// history already loaded on the stock page.
const CONFIGS: Record<string, { interval: string; range: string }> = {
  "1d": { interval: "5m", range: "1d" },
  "5d": { interval: "30m", range: "5d" },
};

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase().trim();
  const rangeKey = req.nextUrl.searchParams.get("range") || "1d";
  if (!symbol || !/^[A-Z0-9.=^-]{1,15}$/.test(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }
  const cfg = CONFIGS[rangeKey] || CONFIGS["1d"];

  try {
    const res = await fetchWithTimeout(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${cfg.interval}&range=${cfg.range}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`Yahoo ${res.status}`);
    const data = await res.json();
    const r = data?.chart?.result?.[0];
    if (!r) return NextResponse.json({ points: [], previousClose: 0 });

    const ts: number[] = r.timestamp || [];
    const closes: (number | null)[] = r.indicators?.quote?.[0]?.close || [];
    const points: { t: number; close: number }[] = [];
    for (let i = 0; i < ts.length; i++) {
      const c = closes[i];
      if (c == null) continue;
      points.push({ t: ts[i] * 1000, close: c });
    }
    const previousClose = r.meta?.chartPreviousClose || r.meta?.previousClose || 0;
    return NextResponse.json({ points, previousClose });
  } catch {
    return NextResponse.json({ points: [], previousClose: 0 }, { status: 200 });
  }
}
