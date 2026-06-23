import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.FMP_API_KEY;
const BASE = "https://financialmodelingprep.com/api/v3";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams
    .get("symbol")
    ?.toUpperCase()
    .trim();

  if (!API_KEY) {
    return NextResponse.json({ error: "demo" }, { status: 200 });
  }

  try {
    const path = symbol
      ? `/stock_news?tickers=${symbol}&limit=12&apikey=${API_KEY}`
      : `/stock_news?limit=20&apikey=${API_KEY}`;

    const res = await fetch(`${BASE}${path}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`FMP API error: ${res.status}`);
    const data = await res.json();

    return NextResponse.json({ articles: data ?? [] });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
