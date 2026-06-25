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

// Two Yahoo hosts — fail over to the second if the first blips, so a chart
// never goes blank on a single-host hiccup.
const HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];

interface ChartResult {
  timestamp?: number[];
  indicators?: { quote?: { close?: (number | null)[] }[] };
  meta?: { chartPreviousClose?: number; previousClose?: number };
}

async function fetchChartResult(host: string, symbol: string, cfg: { interval: string; range: string }): Promise<ChartResult | null> {
  const res = await fetchWithTimeout(
    `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${cfg.interval}&range=${cfg.range}`,
    { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.chart?.result?.[0] as ChartResult) ?? null;
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase().trim();
  const rangeKey = req.nextUrl.searchParams.get("range") || "1d";
  if (!symbol || !/^[A-Z0-9.=^-]{1,15}$/.test(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }
  const cfg = CONFIGS[rangeKey] || CONFIGS["1d"];
  const cacheHeaders = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

  let r: ChartResult | null = null;
  for (const host of HOSTS) {
    try {
      r = await fetchChartResult(host, symbol, cfg);
      if (r) break;
    } catch {
      /* try the next host */
    }
  }
  if (!r) return NextResponse.json({ points: [], previousClose: 0 }, { status: 200, headers: cacheHeaders });

  const ts: number[] = r.timestamp || [];
  const closes: (number | null)[] = r.indicators?.quote?.[0]?.close || [];
  const points: { t: number; close: number }[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (c == null) continue;
    points.push({ t: ts[i] * 1000, close: c });
  }
  const previousClose = r.meta?.chartPreviousClose || r.meta?.previousClose || 0;
  return NextResponse.json({ points, previousClose }, { headers: cacheHeaders });
}
