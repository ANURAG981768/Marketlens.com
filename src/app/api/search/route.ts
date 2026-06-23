import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.FMP_API_KEY;
const BASE = "https://financialmodelingprep.com/api/v3";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 1 || query.length > 50) {
    return NextResponse.json({ results: [] });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: "demo" });
  }

  try {
    const res = await fetch(
      `${BASE}/search?query=${encodeURIComponent(query)}&limit=20&apikey=${API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`FMP error: ${res.status}`);
    const data = await res.json();

    const results = (data ?? []).map((item: any) => ({
      symbol: item.symbol,
      name: item.name,
      exchange: item.stockExchange || item.exchangeShortName || "",
      type: item.type || "stock",
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
