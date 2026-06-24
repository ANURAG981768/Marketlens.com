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
const safeDiv = (a: number, b: number) => (b ? a / b : 0);

async function quoteSummary(symbol: string, crumb: string, cookie: string) {
  const mods = "assetProfile,price,summaryDetail,defaultKeyStatistics,financialData,incomeStatementHistory";
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${mods}&crumb=${encodeURIComponent(crumb)}`;
  return fetch(url, { headers: { "User-Agent": YAHOO_UA, Cookie: cookie }, next: { revalidate: 120 } });
}

// Full annual income statements from Yahoo's fundamentals-timeseries endpoint.
// (The legacy quoteSummary income module now returns only revenue + net income.)
async function fetchIncome(symbol: string, crumb: string, cookie: string, shares: number): Promise<unknown[]> {
  try {
    const types = "annualTotalRevenue,annualCostOfRevenue,annualGrossProfit,annualOperatingIncome,annualNetIncome,annualEBITDA,annualDilutedEPS,annualOperatingExpense";
    const p2 = Math.floor(Date.now() / 1000);
    const url = `https://query2.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${encodeURIComponent(symbol)}?symbol=${encodeURIComponent(symbol)}&type=${types}&period1=1500000000&period2=${p2}&crumb=${encodeURIComponent(crumb)}`;
    const res = await fetch(url, { headers: { "User-Agent": YAHOO_UA, Cookie: cookie }, next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const groups: Array<Record<string, unknown>> = json?.timeseries?.result || [];

    const byDate: Record<string, Record<string, number>> = {};
    const put = (typeName: string, field: string) => {
      const g = groups.find((x) => (x.meta as { type?: string[] })?.type?.[0] === typeName);
      const arr = (g?.[typeName] as Array<{ asOfDate?: string; reportedValue?: { raw?: number } }>) || [];
      for (const item of arr) {
        if (!item?.asOfDate) continue;
        byDate[item.asOfDate] = byDate[item.asOfDate] || {};
        byDate[item.asOfDate][field] = item.reportedValue?.raw ?? 0;
      }
    };
    put("annualTotalRevenue", "revenue");
    put("annualCostOfRevenue", "costOfRevenue");
    put("annualGrossProfit", "grossProfit");
    put("annualOperatingIncome", "operatingIncome");
    put("annualNetIncome", "netIncome");
    put("annualEBITDA", "ebitda");
    put("annualDilutedEPS", "eps");
    put("annualOperatingExpense", "operatingExpenses");

    const dates = Object.keys(byDate).sort().reverse(); // newest first
    return dates.map((d) => {
      const v = byDate[d];
      const revenue = v.revenue || 0;
      const grossProfit = v.grossProfit || 0;
      const operatingIncome = v.operatingIncome || 0;
      const netIncome = v.netIncome || 0;
      const eps = v.eps != null ? v.eps : safeDiv(netIncome, shares);
      return {
        date: d,
        calendarYear: d.slice(0, 4),
        period: "FY",
        revenue,
        grossProfit,
        grossProfitRatio: safeDiv(grossProfit, revenue),
        operatingIncome,
        operatingIncomeRatio: safeDiv(operatingIncome, revenue),
        netIncome,
        netIncomeRatio: safeDiv(netIncome, revenue),
        eps,
        epsdiluted: eps,
        ebitda: v.ebitda || operatingIncome,
        operatingExpenses: v.operatingExpenses || (revenue - operatingIncome),
        costOfRevenue: v.costOfRevenue || (revenue - grossProfit),
      };
    });
  } catch {
    return [];
  }
}

// Real dividend payment history from Yahoo's chart events. Returns the actual
// per-payment amounts so we never synthesize a fake dividend track record.
async function fetchDividends(
  symbol: string
): Promise<{ history: { year: string; amount: number }[]; trailingAnnual: number }> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        symbol
      )}?interval=1mo&range=10y&events=div`,
      { headers: { "User-Agent": YAHOO_UA }, next: { revalidate: 86400 } }
    );
    if (!res.ok) return { history: [], trailingAnnual: 0 };
    const data = await res.json();
    const divs = data?.chart?.result?.[0]?.events?.dividends as
      | Record<string, { amount?: number; date?: number }>
      | undefined;
    if (!divs) return { history: [], trailingAnnual: 0 };

    // Group real payments by calendar year
    const byYear: Record<string, number> = {};
    const payments: { ts: number; amount: number }[] = [];
    for (const k of Object.keys(divs)) {
      const d = divs[k];
      if (typeof d?.amount !== "number" || typeof d?.date !== "number") continue;
      const year = new Date(d.date * 1000).getUTCFullYear().toString();
      byYear[year] = (byYear[year] || 0) + d.amount;
      payments.push({ ts: d.date, amount: d.amount });
    }

    const history = Object.keys(byYear)
      .sort()
      .reverse()
      .slice(0, 6)
      .map((year) => ({ year, amount: +byYear[year].toFixed(4) }));

    // Trailing 12-month dividend = sum of payments in the last 365 days
    const cutoff = Date.now() / 1000 - 365 * 24 * 3600;
    const trailingAnnual = +payments
      .filter((p) => p.ts >= cutoff)
      .reduce((s, p) => s + p.amount, 0)
      .toFixed(4);

    return { history, trailingAnnual };
  } catch {
    return { history: [], trailingAnnual: 0 };
  }
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

  let auth = await getYahooAuth();
  if (!auth) return NextResponse.json({ error: "demo" }, { status: 200 });

  try {
    let res = await quoteSummary(symbol, auth.crumb, auth.cookie);
    if (res.status === 401) {
      invalidateYahooAuth();
      const fresh = await getYahooAuth(true);
      if (!fresh) return NextResponse.json({ error: "demo" }, { status: 200 });
      auth = fresh;
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

    // Real balance-sheet cash & debt for an accurate DCF equity bridge.
    // Net debt can be negative (net cash) for cash-rich companies, which
    // should raise — not lower — intrinsic equity value.
    const balance = {
      totalCash: num(fd.totalCash) || null,
      totalDebt: num(fd.totalDebt) || null,
    };

    // Real Wall Street analyst price targets + consensus (when covered).
    const analyst = {
      low: num(fd.targetLowPrice) || null,
      mean: num(fd.targetMeanPrice) || null,
      high: num(fd.targetHighPrice) || null,
      count: num(fd.numberOfAnalystOpinions) || null,
      recommendationKey: typeof fd.recommendationKey === "string" ? fd.recommendationKey : null,
      recommendationMean: num(fd.recommendationMean) || null,
    };

    const [income, history, dividends] = await Promise.all([
      fetchIncome(symbol, auth.crumb, auth.cookie, shares),
      fetchHistory(symbol),
      fetchDividends(symbol),
    ]);

    // Prefer the real trailing-12-month dividend (summed from actual payments)
    // over Yahoo's sometimes-stale dividendRate field.
    if (dividends.trailingAnnual > 0) {
      profile.lastDiv = dividends.trailingAnnual;
    }

    return NextResponse.json({ profile, quote, metrics, income, history, dividends: dividends.history, analyst, balance });
  } catch {
    return NextResponse.json({ error: "demo" }, { status: 200 });
  }
}
