import { NextRequest, NextResponse } from "next/server";
import { getYahooAuth, invalidateYahooAuth, YAHOO_UA } from "@/lib/yahoo-auth";
import { fetchWithTimeout } from "@/lib/upstream";

// Batch quote endpoint — returns live price/marketcap/volume/PE for many
// symbols in a single Yahoo call. Used by the screener and any view that needs
// to refresh a list of tickers at once.

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("symbols") || "";
  const symbols = raw
    .toUpperCase()
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[A-Z0-9.=^-]{1,15}$/.test(s))
    .slice(0, 60);

  if (symbols.length === 0) {
    return NextResponse.json({ error: "no_symbols" }, { status: 400 });
  }

  async function fetchQuotes(crumb: string, cookie: string) {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
      symbols.join(",")
    )}&crumb=${encodeURIComponent(crumb)}`;
    return fetchWithTimeout(url, {
      headers: { "User-Agent": YAHOO_UA, Cookie: cookie },
      next: { revalidate: 30 },
    });
  }

  try {
    let auth = await getYahooAuth();
    if (!auth) return NextResponse.json({ error: "auth_failed" }, { status: 200 });

    let res = await fetchQuotes(auth.crumb, auth.cookie);
    if (res.status === 401) {
      invalidateYahooAuth();
      auth = await getYahooAuth(true);
      if (!auth) return NextResponse.json({ error: "auth_failed" }, { status: 200 });
      res = await fetchQuotes(auth.crumb, auth.cookie);
    }
    if (!res.ok) return NextResponse.json({ error: "unavailable" }, { status: 200 });

    const json = await res.json();
    const list = json?.quoteResponse?.result || [];
    const quotes: Record<
      string,
      { price: number; changePercent: number; marketCap: number; volume: number; pe: number | null }
    > = {};
    for (const q of list) {
      if (!q?.symbol || typeof q.regularMarketPrice !== "number") continue;
      quotes[q.symbol.toUpperCase()] = {
        price: q.regularMarketPrice,
        changePercent: typeof q.regularMarketChangePercent === "number" ? q.regularMarketChangePercent : 0,
        marketCap: typeof q.marketCap === "number" ? q.marketCap : 0,
        volume: typeof q.regularMarketVolume === "number" ? q.regularMarketVolume : 0,
        pe: typeof q.trailingPE === "number" ? q.trailingPE : null,
      };
    }
    return NextResponse.json(
      { quotes },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
    );
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 200 });
  }
}
