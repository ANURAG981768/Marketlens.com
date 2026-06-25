import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/upstream";

const API_KEY = process.env.FMP_API_KEY;
const BASE = "https://financialmodelingprep.com/api/v3";

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "demo" }, { status: 200 });
  }

  const params = req.nextUrl.searchParams;
  const marketCapMin = params.get("mcMin") || "";
  const marketCapMax = params.get("mcMax") || "";
  const sector = (params.get("sector") || "").slice(0, 50);
  const exchange = (params.get("exchange") || "").slice(0, 20);
  const rawLimit = parseInt(params.get("limit") || "100", 10);
  const limit = String(Math.min(Math.max(isNaN(rawLimit) ? 100 : rawLimit, 1), 200));

  if ((marketCapMin && isNaN(Number(marketCapMin))) || (marketCapMax && isNaN(Number(marketCapMax)))) {
    return NextResponse.json({ error: "Invalid market cap parameters" }, { status: 400 });
  }

  try {
    const qp = new URLSearchParams({ apikey: API_KEY, limit });
    if (marketCapMin) qp.set("marketCapMoreThan", marketCapMin);
    if (marketCapMax) qp.set("marketCapLowerThan", marketCapMax);
    if (sector) qp.set("sector", sector);
    if (exchange) qp.set("exchange", exchange);
    qp.set("isActivelyTrading", "true");
    qp.set("country", "US");

    const res = await fetchWithTimeout(
      `${BASE}/stock-screener?${qp.toString()}`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) throw new Error(`FMP error: ${res.status}`);
    const data = await res.json();

    const results = (data ?? []).map((item: any) => ({
      symbol: item.symbol,
      companyName: item.companyName,
      marketCap: item.marketCap,
      sector: item.sector,
      industry: item.industry,
      price: item.price,
      beta: item.beta ?? 0,
      lastAnnualDividend: item.lastAnnualDividend ?? 0,
      volume: item.volume ?? 0,
      exchange: item.exchangeShortName || item.exchange || "",
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Failed to screen stocks" },
      { status: 500 }
    );
  }
}
