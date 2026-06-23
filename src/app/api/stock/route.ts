import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.FMP_API_KEY;
const BASE = "https://financialmodelingprep.com/api/v3";

async function fmpFetch(path: string) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}${path}${sep}apikey=${API_KEY}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`FMP API error: ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams
    .get("symbol")
    ?.toUpperCase()
    .trim();

  if (!symbol || !/^[A-Z.]{1,6}$/.test(symbol)) {
    return NextResponse.json(
      { error: "Invalid ticker symbol" },
      { status: 400 }
    );
  }

  if (!API_KEY) {
    return NextResponse.json({ error: "demo" }, { status: 200 });
  }

  try {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const fromDate = fiveYearsAgo.toISOString().split("T")[0];
    const toDate = new Date().toISOString().split("T")[0];

    const [profileRes, metricsRes, incomeRes, historyRes, quoteRes] =
      await Promise.all([
        fmpFetch(`/profile/${symbol}`),
        fmpFetch(`/key-metrics-ttm/${symbol}`),
        fmpFetch(`/income-statement/${symbol}?period=annual&limit=5`),
        fmpFetch(
          `/historical-price-full/${symbol}?from=${fromDate}&to=${toDate}`
        ),
        fmpFetch(`/quote/${symbol}`),
      ]);

    if (!profileRes?.length) {
      return NextResponse.json(
        { error: "Ticker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: profileRes[0],
      metrics: metricsRes[0] ?? {},
      income: incomeRes ?? [],
      history: historyRes?.historical?.reverse() ?? [],
      quote: quoteRes?.[0] ?? {},
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
