import { NextRequest, NextResponse } from "next/server";
import { getYahooAuth, invalidateYahooAuth, YAHOO_UA } from "@/lib/yahoo-auth";

// Real per-symbol company data assembled from free Yahoo Finance endpoints.
// No paid key required — searching any ticker returns THAT company's data
// (not a hardcoded demo fallback).

const num = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && typeof (v as { raw?: number }).raw === "number") return (v as { raw: number }).raw;
  return 0;
};
const str = (v: unknown): string => {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && typeof (v as { fmt?: string }).fmt === "string") return (v as { fmt: string }).fmt;
  return "";
};
const safeDiv = (a: number, b: number) => (b ? a / b : 0);

async function quoteSummary(symbol: string, crumb: string, cookie: string) {
  const mods = "assetProfile,price,summaryDetail,defaultKeyStatistics,financialData,incomeStatementHistory";
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${mods}&crumb=${encodeURIComponent(crumb)}`;
  return fetch(url, { headers: { "User-Agent": YAHOO_UA, Cookie: cookie }, next: { revalidate: 120 } });
}

async function fetchHistory(symbol: string): Promise<unknown[]> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y`,
      { headers: { "User-Agent": YAHOO_UA }, next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const r = data?.chart?.result?.[0];
    if (!r) return [];
    const ts: number[] = r.timestamp || [];
    const q = r.indicators?.quote?.[0] || {};
    const out: unknown[] = [];
    let prevClose = 0;
    for (let i = 0; i < ts.length; i++) {
      const close = q.close?.[i];
      if (close == null) continue;
      const changePercent = prevClose ? ((close - prevClose) / prevClose) * 100 : 0;
      out.push({
        date: new Date(ts[i] * 1000).toISOString().split("T")[0],
        open: q.open?.[i] ?? close,
        high: q.high?.[i] ?? close,
        low: q.low?.[i] ?? close,
        close,
        volume: q.volume?.[i] ?? 0,
        changePercent,
      });
      prevClose = close;
    }
    return out;
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase().trim();
  if (!symbol || !/^[A-Z0-9.\-]{1,12}$/.test(symbol)) {
    return NextResponse.json({ error: "Invalid ticker symbol" }, { status: 400 });
  }

  const auth = await getYahooAuth();
  if (!auth) return NextResponse.json({ error: "demo" }, { status: 200 });

  try {
    let res = await quoteSummary(symbol, auth.crumb, auth.cookie);
    if (res.status === 401) {
      invalidateYahooAuth();
      const fresh = await getYahooAuth(true);
      if (!fresh) return NextResponse.json({ error: "demo" }, { status: 200 });
      res = await quoteSummary(symbol, fresh.crumb, fresh.cookie);
    }
    if (!res.ok) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const json = await res.json();
    const r = json?.quoteSummary?.result?.[0];
    if (!r?.price?.regularMarketPrice) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const price = r.price || {};
    const sd = r.summaryDetail || {};
    const ks = r.defaultKeyStatistics || {};
    const fd = r.financialData || {};
    const ap = r.assetProfile || {};

    const px = num(price.regularMarketPrice);
    const mktCap = num(price.marketCap);
    const shares = px ? mktCap / px : 0;
    const pe = num(sd.trailingPE);

    const profile = {
      symbol: price.symbol || symbol,
      companyName: price.longName || price.shortName || symbol,
      exchange: price.exchangeName || price.fullExchangeName || "",
      industry: ap.industry || "—",
      sector: ap.sector || "—",
      country: ap.country || "—",
      description: ap.longBusinessSummary || "",
      ceo: ap.companyOfficers?.[0]?.name || "",
      fullTimeEmployees: ap.fullTimeEmployees ? String(ap.fullTimeEmployees) : "—",
      website: ap.website || "",
      image: "",
      price: px,
      changes: num(price.regularMarketChange),
      mktCap,
      volAvg: num(sd.averageVolume),
      range: `${num(sd.fiftyTwoWeekLow).toFixed(2)} - ${num(sd.fiftyTwoWeekHigh).toFixed(2)}`,
      beta: num(sd.beta),
      lastDiv: num(sd.dividendRate),
      ipoDate: "",
      currency: price.currency || "USD",
    };

    const quote = {
      price: px,
      changesPercentage: num(price.regularMarketChangePercent) * 100,
      change: num(price.regularMarketChange),
      dayLow: num(sd.dayLow),
      dayHigh: num(sd.dayHigh),
      yearHigh: num(sd.fiftyTwoWeekHigh),
      yearLow: num(sd.fiftyTwoWeekLow),
      volume: num(price.regularMarketVolume),
      avgVolume: num(sd.averageVolume),
      open: num(price.regularMarketOpen),
      previousClose: num(sd.previousClose),
      marketCap: mktCap,
      pe,
      eps: num(ks.trailingEps),
    };

    const metrics = {
      revenuePerShareTTM: num(fd.revenuePerShare),
      netIncomePerShareTTM: num(ks.trailingEps),
      operatingCashFlowPerShareTTM: safeDiv(num(fd.operatingCashflow), shares),
      freeCashFlowPerShareTTM: safeDiv(num(fd.freeCashflow), shares),
      peRatioTTM: pe,
      priceToSalesRatioTTM: num(sd.priceToSalesTrailing12Months),
      pbRatioTTM: num(ks.priceToBook),
      evToEbitdaTTM: num(ks.enterpriseToEbitda),
      evToRevenueTTM: num(ks.enterpriseToRevenue),
      debtToEquityTTM: safeDiv(num(fd.debtToEquity), 100),
      currentRatioTTM: num(fd.currentRatio),
      returnOnEquityTTM: num(fd.returnOnEquity),
      returnOnAssetsTTM: num(fd.returnOnAssets),
      dividendYieldTTM: num(sd.dividendYield),
      earningsYieldTTM: pe ? 1 / pe : 0,
      freeCashFlowYieldTTM: safeDiv(num(fd.freeCashflow), mktCap),
      debtToAssetsTTM: 0,
      netDebtToEBITDATTM: 0,
      interestCoverageTTM: 0,
      payoutRatioTTM: num(sd.payoutRatio),
      marketCapTTM: mktCap,
      netProfitMarginTTM: num(fd.profitMargins),
      grossProfitMarginTTM: num(fd.grossMargins),
      operatingProfitMarginTTM: num(fd.operatingMargins),
      enterpriseValueOverEBITDATTM: num(ks.enterpriseToEbitda),
      revenueGrowthTTM: num(fd.revenueGrowth),
    };

    const rawIncome = r.incomeStatementHistory?.incomeStatementHistory || [];
    const income = rawIncome.map((s: Record<string, unknown>) => {
      const revenue = num(s.totalRevenue);
      const grossProfit = num(s.grossProfit);
      const operatingIncome = num(s.operatingIncome);
      const netIncome = num(s.netIncome);
      const year = str(s.endDate).slice(0, 4);
      return {
        date: str(s.endDate),
        calendarYear: year,
        period: "FY",
        revenue,
        grossProfit,
        grossProfitRatio: safeDiv(grossProfit, revenue),
        operatingIncome,
        operatingIncomeRatio: safeDiv(operatingIncome, revenue),
        netIncome,
        netIncomeRatio: safeDiv(netIncome, revenue),
        eps: safeDiv(netIncome, shares),
        epsdiluted: safeDiv(netIncome, shares),
        ebitda: num(s.ebit) || operatingIncome,
        operatingExpenses: num(s.totalOperatingExpenses) || (revenue - operatingIncome),
        costOfRevenue: num(s.costOfRevenue) || (revenue - grossProfit),
      };
    });

    const history = await fetchHistory(symbol);

    return NextResponse.json({ profile, quote, metrics, income, history });
  } catch {
    return NextResponse.json({ error: "demo" }, { status: 200 });
  }
}
