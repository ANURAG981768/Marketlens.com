import { NextRequest, NextResponse } from "next/server";
import { getYahooAuth, invalidateYahooAuth, YAHOO_UA } from "@/lib/yahoo-auth";

// Live peer comparison: real peer symbols from Yahoo recommendations + real
// fundamentals for the target and each peer. No paid key required.

const num = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && typeof (v as { raw?: number }).raw === "number") return (v as { raw: number }).raw;
  return 0;
};

async function getPeerSymbols(symbol: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v6/finance/recommendationsbysymbol/${encodeURIComponent(symbol)}`,
      { headers: { "User-Agent": YAHOO_UA }, next: { revalidate: 86400 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const recs = json?.finance?.result?.[0]?.recommendedSymbols || [];
    return recs.map((r: { symbol: string }) => r.symbol).filter(Boolean).slice(0, 5);
  } catch {
    return [];
  }
}

async function fetchOne(symbol: string, isTarget: boolean, crumb: string, cookie: string) {
  const mods = "price,summaryDetail,defaultKeyStatistics,financialData,assetProfile";
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${mods}&crumb=${encodeURIComponent(crumb)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": YAHOO_UA, Cookie: cookie }, next: { revalidate: 120 } });
    if (!res.ok) return null;
    const json = await res.json();
    const r = json?.quoteSummary?.result?.[0];
    if (!r?.price?.regularMarketPrice) return null;
    const price = r.price || {};
    const sd = r.summaryDetail || {};
    const ks = r.defaultKeyStatistics || {};
    const fd = r.financialData || {};
    const ap = r.assetProfile || {};
    return {
      symbol,
      isTarget,
      profile: {
        symbol,
        companyName: price.longName || price.shortName || symbol,
        sector: ap.sector || "—",
        industry: ap.industry || "—",
        mktCap: num(price.marketCap),
        price: num(price.regularMarketPrice),
        changes: num(price.regularMarketChange),
        beta: num(sd.beta),
      },
      metrics: {
        peRatioTTM: num(sd.trailingPE),
        priceToSalesRatioTTM: num(sd.priceToSalesTrailing12Months),
        pbRatioTTM: num(ks.priceToBook),
        evToEbitdaTTM: num(ks.enterpriseToEbitda),
        enterpriseValueOverEBITDATTM: num(ks.enterpriseToEbitda),
        returnOnEquityTTM: num(fd.returnOnEquity),
        returnOnAssetsTTM: num(fd.returnOnAssets),
        debtToEquityTTM: num(fd.debtToEquity) / 100,
        currentRatioTTM: num(fd.currentRatio),
        dividendYieldTTM: num(sd.dividendYield),
        marketCapTTM: num(price.marketCap),
      },
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase().trim();
  if (!symbol || !/^[A-Z0-9.\-]{1,12}$/.test(symbol)) {
    return NextResponse.json({ error: "Invalid ticker symbol" }, { status: 400 });
  }

  let auth = await getYahooAuth();
  if (!auth) return NextResponse.json({ error: "demo" }, { status: 200 });

  try {
    const peerSymbols = await getPeerSymbols(symbol);
    const allSymbols = [symbol, ...peerSymbols.filter((s) => s !== symbol)].slice(0, 6);

    let results = await Promise.all(allSymbols.map((s, i) => fetchOne(s, s === symbol, auth!.crumb, auth!.cookie)));

    // If everything failed, the crumb may be stale — refresh once and retry.
    if (results.every((r) => r === null)) {
      invalidateYahooAuth();
      const fresh = await getYahooAuth(true);
      if (fresh) {
        auth = fresh;
        results = await Promise.all(allSymbols.map((s) => fetchOne(s, s === symbol, fresh.crumb, fresh.cookie)));
      }
    }

    const peers = results.filter((p): p is NonNullable<typeof p> => p !== null);
    if (peers.length === 0) return NextResponse.json({ error: "demo" }, { status: 200 });
    return NextResponse.json({ peers });
  } catch {
    return NextResponse.json({ error: "demo" }, { status: 200 });
  }
}
