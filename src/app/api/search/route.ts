import { NextRequest, NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// Universal symbol search via Yahoo Finance — covers virtually every public
// company, ETF, index and crypto globally (no hardcoded list, no API key).
const ALLOWED = new Set(["EQUITY", "ETF", "INDEX", "CRYPTOCURRENCY", "MUTUALFUND"]);

const TYPE_LABEL: Record<string, string> = {
  EQUITY: "stock",
  ETF: "etf",
  INDEX: "index",
  CRYPTOCURRENCY: "crypto",
  MUTUALFUND: "fund",
};

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 1 || query.length > 50) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=12&newsCount=0&listsCount=0`,
      { headers: { "User-Agent": UA }, next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`Yahoo search ${res.status}`);
    const data = await res.json();

    const results = (data?.quotes ?? [])
      .filter((q: { symbol?: string; quoteType?: string }) => q.symbol && q.quoteType && ALLOWED.has(q.quoteType))
      .map((q: { symbol: string; shortname?: string; longname?: string; exchDisp?: string; exchange?: string; quoteType: string }) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchDisp || q.exchange || "",
        type: TYPE_LABEL[q.quoteType] || "stock",
      }))
      .slice(0, 12);

    return NextResponse.json({ results });
  } catch {
    // Client falls back to its built-in local database
    return NextResponse.json({ error: "demo" }, { status: 200 });
  }
}
