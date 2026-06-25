import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/upstream";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const INDICES: { symbol: string; name: string; flag: string; region: string }[] = [
  { symbol: "^GSPC", name: "S&P 500", flag: "🇺🇸", region: "US" },
  { symbol: "^IXIC", name: "NASDAQ", flag: "🇺🇸", region: "US" },
  { symbol: "^DJI", name: "DOW", flag: "🇺🇸", region: "US" },
  { symbol: "^RUT", name: "Russell 2000", flag: "🇺🇸", region: "US" },
  { symbol: "^NSEI", name: "Nifty 50", flag: "🇮🇳", region: "India" },
  { symbol: "^BSESN", name: "Sensex", flag: "🇮🇳", region: "India" },
  { symbol: "000001.SS", name: "SSE Composite", flag: "🇨🇳", region: "China" },
  { symbol: "^HSI", name: "Hang Seng", flag: "🇭🇰", region: "HK" },
  { symbol: "^N225", name: "Nikkei 225", flag: "🇯🇵", region: "Japan" },
  { symbol: "^FTSE", name: "FTSE 100", flag: "🇬🇧", region: "UK" },
  { symbol: "^GDAXI", name: "DAX", flag: "🇩🇪", region: "Germany" },
  { symbol: "^FCHI", name: "CAC 40", flag: "🇫🇷", region: "France" },
  { symbol: "^KS11", name: "KOSPI", flag: "🇰🇷", region: "Korea" },
  { symbol: "^AXJO", name: "ASX 200", flag: "🇦🇺", region: "Australia" },
  { symbol: "^BVSP", name: "Bovespa", flag: "🇧🇷", region: "Brazil" },
  { symbol: "^GSPTSE", name: "TSX", flag: "🇨🇦", region: "Canada" },
];

async function fetchOne(symbol: string): Promise<{ price: number; prevClose: number } | null> {
  try {
    const res = await fetchWithTimeout(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
      { headers: { "User-Agent": UA }, next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    return {
      price: meta.regularMarketPrice,
      prevClose: meta.chartPreviousClose || meta.previousClose || meta.regularMarketPrice,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const results = await Promise.all(
    INDICES.map(async (idx) => {
      const q = await fetchOne(idx.symbol);
      if (!q) return null;
      const change = q.price - q.prevClose;
      const changePct = q.prevClose ? (change / q.prevClose) * 100 : 0;
      return {
        name: idx.name,
        flag: idx.flag,
        region: idx.region,
        value: q.price,
        change,
        changePct,
      };
    })
  );

  const indices = results.filter((r): r is NonNullable<typeof r> => r !== null);
  if (indices.length === 0) {
    return NextResponse.json({ error: "unavailable" }, { status: 200 });
  }
  return NextResponse.json({ indices });
}
