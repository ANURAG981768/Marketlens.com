import { NextRequest, NextResponse } from "next/server";
import { getYahooAuth, invalidateYahooAuth, YAHOO_UA } from "@/lib/yahoo-auth";
import { fetchWithTimeout } from "@/lib/upstream";

// Batch quote endpoint — returns live price/marketcap/volume/PE for many
// symbols in a single Yahoo call. Used by the screener and any view that needs
// to refresh a list of tickers at once.

const HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];

type Quote = {
  price: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  pe: number | null;
};

// Fallback path: the crumb-authenticated v7 batch endpoint is fast but its auth
// is fragile (Yahoo rotates crumbs/cookies aggressively). When it fails — or
// only returns some symbols — we fill the gaps from the PUBLIC chart endpoint,
// which needs no auth and is dual-host. Market cap / PE aren't available there,
// so those degrade to 0/null, but price, % change and volume stay correct —
// which is what the screener actually ranks on. Better a complete list with a
// couple blank columns than a blank screen.
async function fetchViaChart(symbol: string): Promise<Quote | null> {
  for (const host of HOSTS) {
    try {
      const res = await fetchWithTimeout(
        `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
        { headers: { "User-Agent": YAHOO_UA }, next: { revalidate: 30 } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (meta && typeof meta.regularMarketPrice === "number") {
        const prev = meta.chartPreviousClose || meta.previousClose || 0;
        const price = meta.regularMarketPrice;
        return {
          price,
          changePercent: prev ? ((price - prev) / prev) * 100 : 0,
          marketCap: 0,
          volume: typeof meta.regularMarketVolume === "number" ? meta.regularMarketVolume : 0,
          pe: null,
        };
      }
    } catch {
      /* try the next host */
    }
  }
  return null;
}

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

  const quotes: Record<string, Quote> = {};

  // Fast path: one authenticated batch call.
  try {
    let auth = await getYahooAuth();
    if (auth) {
      let res = await fetchQuotes(auth.crumb, auth.cookie);
      if (res.status === 401) {
        invalidateYahooAuth();
        auth = await getYahooAuth(true);
        if (auth) res = await fetchQuotes(auth.crumb, auth.cookie);
      }
      if (res.ok) {
        const json = await res.json();
        const list = json?.quoteResponse?.result || [];
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
      }
    }
  } catch {
    /* fall through to the public chart fallback below */
  }

  // Fill anything the batch call didn't return (auth failure, partial result,
  // or a symbol Yahoo dropped) from the no-auth chart endpoint, in parallel.
  const missing = symbols.filter((s) => !quotes[s]);
  if (missing.length > 0) {
    const filled = await Promise.all(missing.map((s) => fetchViaChart(s)));
    missing.forEach((s, i) => {
      const q = filled[i];
      if (q) quotes[s] = q;
    });
  }

  if (Object.keys(quotes).length === 0) {
    return NextResponse.json({ error: "unavailable" }, { status: 200 });
  }

  return NextResponse.json(
    { quotes },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
  );
}
