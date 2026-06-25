import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/upstream";

// Two independent Yahoo hosts. If the first hiccups, rate-limits, or times out,
// we fail over to the second before giving up — so a single-host blip never
// blanks the live price that trading, the watchlist and alerts depend on.
const HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];

interface QuoteMeta {
  regularMarketPrice?: number;
  symbol?: string;
  chartPreviousClose?: number;
  previousClose?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  regularMarketVolume?: number;
  currency?: string;
  exchangeName?: string;
}

async function fetchMeta(host: string, symbol: string): Promise<QuoteMeta | null> {
  const res = await fetchWithTimeout(
    `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
    { next: { revalidate: 30 }, headers: { "User-Agent": "Mozilla/5.0" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta as QuoteMeta | undefined;
  return meta && typeof meta.regularMarketPrice === "number" ? meta : null;
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase().trim();
  if (!symbol || !/^[A-Z0-9.=^-]{1,15}$/.test(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  let meta: QuoteMeta | null = null;
  for (const host of HOSTS) {
    try {
      meta = await fetchMeta(host, symbol);
      if (meta) break;
    } catch {
      /* primary host failed — try the next one */
    }
  }

  if (!meta || typeof meta.regularMarketPrice !== "number") {
    return NextResponse.json({ error: "unavailable" }, { status: 200 });
  }

  const price = meta.regularMarketPrice;
  const prevClose = meta.chartPreviousClose || meta.previousClose || 0;
  const change = prevClose ? price - prevClose : 0;
  const changePercent = prevClose ? (change / prevClose) * 100 : 0;

  return NextResponse.json(
    {
      symbol: meta.symbol,
      price,
      previousClose: prevClose,
      change,
      changePercent,
      dayHigh: meta.regularMarketDayHigh ?? null,
      dayLow: meta.regularMarketDayLow ?? null,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
      volume: meta.regularMarketVolume ?? null,
      currency: meta.currency || "USD",
      exchange: meta.exchangeName || "",
    },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
  );
}
