import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/upstream";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// Returns the S&P 500's percentage return since a given date, so the paper
// portfolio can be measured against "the market" — the core investing yardstick.
export async function GET(req: NextRequest) {
  const since = req.nextUrl.searchParams.get("since");
  const sinceMs = since ? Date.parse(since) : NaN;
  if (isNaN(sinceMs)) {
    return NextResponse.json({ error: "bad_date" }, { status: 200 });
  }

  // Pick the smallest range that covers the holding period.
  const days = (Date.now() - sinceMs) / 86400000;
  const range = days <= 5 ? "5d" : days <= 30 ? "1mo" : days <= 90 ? "3mo" : days <= 180 ? "6mo" : days <= 365 ? "1y" : days <= 730 ? "2y" : "5y";

  try {
    const res = await fetchWithTimeout(
      `https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=${range}`,
      { headers: { "User-Agent": UA }, next: { revalidate: 300 } }
    );
    if (!res.ok) return NextResponse.json({ error: "unavailable" }, { status: 200 });
    const data = await res.json();
    const r = data?.chart?.result?.[0];
    const ts: number[] = r?.timestamp || [];
    const closes: (number | null)[] = r?.indicators?.quote?.[0]?.close || [];
    const meta = r?.meta;
    const current: number | null = meta?.regularMarketPrice ?? null;
    if (!ts.length || current == null) {
      return NextResponse.json({ error: "unavailable" }, { status: 200 });
    }

    // First close at or after the start date.
    let startClose: number | null = null;
    for (let i = 0; i < ts.length; i++) {
      if (ts[i] * 1000 >= sinceMs && closes[i] != null) {
        startClose = closes[i];
        break;
      }
    }
    // Fall back to the earliest available close if the start predates the range.
    if (startClose == null) {
      startClose = closes.find((c) => c != null) ?? null;
    }
    if (startClose == null || startClose <= 0) {
      return NextResponse.json({ error: "unavailable" }, { status: 200 });
    }

    const returnPct = ((current - startClose) / startClose) * 100;
    return NextResponse.json({
      index: "S&P 500",
      since,
      startValue: startClose,
      currentValue: current,
      returnPct,
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 200 });
  }
}
