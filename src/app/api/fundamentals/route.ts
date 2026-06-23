import { NextRequest, NextResponse } from "next/server";
import { getYahooAuth, invalidateYahooAuth, YAHOO_UA } from "@/lib/yahoo-auth";

function raw(obj: any): number | null {
  if (obj == null) return null;
  if (typeof obj === "number") return obj;
  if (typeof obj.raw === "number") return obj.raw;
  return null;
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase().trim();
  if (!symbol || !/^[A-Z0-9.\-]{1,12}$/.test(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  let auth = await getYahooAuth();
  if (!auth) {
    return NextResponse.json({ error: "auth_failed" }, { status: 200 });
  }

  const modules = "price,summaryDetail,defaultKeyStatistics,financialData";
  const buildUrl = (crumb: string) =>
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`;

  try {
    let res = await fetch(buildUrl(auth.crumb), {
      headers: { "User-Agent": YAHOO_UA, Cookie: auth.cookie },
      next: { revalidate: 30 },
    });

    // Crumb expired — refresh once and retry rather than failing
    if (res.status === 401) {
      invalidateYahooAuth();
      const fresh = await getYahooAuth(true);
      if (!fresh) return NextResponse.json({ error: "auth_failed" }, { status: 200 });
      auth = fresh;
      res = await fetch(buildUrl(fresh.crumb), {
        headers: { "User-Agent": YAHOO_UA, Cookie: fresh.cookie },
        next: { revalidate: 30 },
      });
    }
    if (!res.ok) return NextResponse.json({ error: "not_found" }, { status: 200 });

    const json = await res.json();
    const r = json?.quoteSummary?.result?.[0];
    if (!r) return NextResponse.json({ error: "not_found" }, { status: 200 });

    const price = r.price || {};
    const sd = r.summaryDetail || {};
    const ks = r.defaultKeyStatistics || {};
    const fd = r.financialData || {};

    const de = raw(fd.debtToEquity);

    return NextResponse.json({
      symbol,
      name: price.longName || price.shortName || symbol,
      price: raw(price.regularMarketPrice),
      changePercent: raw(price.regularMarketChangePercent) != null ? (raw(price.regularMarketChangePercent) as number) * 100 : null,
      marketCap: raw(price.marketCap),
      pe: raw(sd.trailingPE),
      forwardPe: raw(sd.forwardPE),
      ps: raw(sd.priceToSalesTrailing12Months),
      pb: raw(ks.priceToBook),
      beta: raw(sd.beta),
      eps: raw(ks.trailingEps),
      dividendYield: raw(sd.dividendYield) != null ? (raw(sd.dividendYield) as number) * 100 : null,
      profitMargin: raw(fd.profitMargins) != null ? (raw(fd.profitMargins) as number) * 100 : null,
      grossMargin: raw(fd.grossMargins) != null ? (raw(fd.grossMargins) as number) * 100 : null,
      operatingMargin: raw(fd.operatingMargins) != null ? (raw(fd.operatingMargins) as number) * 100 : null,
      roe: raw(fd.returnOnEquity) != null ? (raw(fd.returnOnEquity) as number) * 100 : null,
      roa: raw(fd.returnOnAssets) != null ? (raw(fd.returnOnAssets) as number) * 100 : null,
      debtToEquity: de != null ? de / 100 : null, // Yahoo reports as percent
      currentRatio: raw(fd.currentRatio),
      revenueGrowth: raw(fd.revenueGrowth) != null ? (raw(fd.revenueGrowth) as number) * 100 : null,
      targetPrice: raw(fd.targetMeanPrice),
      recommendation: fd.recommendationKey || null,
      fiftyTwoWeekHigh: raw(sd.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: raw(sd.fiftyTwoWeekLow),
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 200 });
  }
}
