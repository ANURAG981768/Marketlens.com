import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase().trim();
  if (!symbol || !/^[A-Z0-9.\-]{1,12}$/.test(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
      {
        next: { revalidate: 30 },
        headers: { "User-Agent": "Mozilla/5.0" },
      }
    );

    if (!res.ok) throw new Error(`Yahoo ${res.status}`);
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta?.regularMarketPrice) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      symbol: meta.symbol,
      price: meta.regularMarketPrice,
      previousClose: meta.chartPreviousClose || meta.previousClose || 0,
      currency: meta.currency || "USD",
      exchange: meta.exchangeName || "",
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 200 });
  }
}
