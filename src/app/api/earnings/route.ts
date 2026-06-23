import { NextResponse } from "next/server";
import { getYahooAuth, invalidateYahooAuth, YAHOO_UA } from "@/lib/yahoo-auth";

const TICKERS: { symbol: string; company: string }[] = [
  { symbol: "AAPL", company: "Apple Inc." },
  { symbol: "MSFT", company: "Microsoft Corp." },
  { symbol: "GOOGL", company: "Alphabet Inc." },
  { symbol: "AMZN", company: "Amazon.com" },
  { symbol: "META", company: "Meta Platforms" },
  { symbol: "NVDA", company: "NVIDIA Corp." },
  { symbol: "TSLA", company: "Tesla Inc." },
  { symbol: "JPM", company: "JPMorgan Chase" },
  { symbol: "V", company: "Visa Inc." },
  { symbol: "JNJ", company: "Johnson & Johnson" },
  { symbol: "WMT", company: "Walmart Inc." },
  { symbol: "PG", company: "Procter & Gamble" },
  { symbol: "MA", company: "Mastercard" },
  { symbol: "HD", company: "Home Depot" },
  { symbol: "BAC", company: "Bank of America" },
  { symbol: "NFLX", company: "Netflix Inc." },
  { symbol: "DIS", company: "Walt Disney" },
  { symbol: "KO", company: "Coca-Cola" },
];

function fmtRevenue(v: number | null): string | null {
  if (v == null) return null;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toFixed(0)}`;
}

type EarningsEvent = {
  symbol: string;
  company: string;
  date: string;
  time: "AMC";
  epsEstimate: number | null;
  revenueEstimate: string | null;
};

async function runBatch(crumb: string, cookie: string): Promise<(EarningsEvent | null)[]> {
  return Promise.all(
    TICKERS.map(async (t) => {
      try {
        const u = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${t.symbol}?modules=calendarEvents&crumb=${encodeURIComponent(crumb)}`;
        const res = await fetch(u, {
          headers: { "User-Agent": YAHOO_UA, Cookie: cookie },
          next: { revalidate: 3600 }, // earnings dates change slowly — cache 1h
        });
        if (!res.ok) return null;
        const json = await res.json();
        const e = json?.quoteSummary?.result?.[0]?.calendarEvents?.earnings;
        const dateFmt: string | undefined = e?.earningsDate?.[0]?.fmt;
        if (!dateFmt) return null;
        return {
          symbol: t.symbol,
          company: t.company,
          date: dateFmt,
          time: "AMC",
          epsEstimate: typeof e?.earningsAverage?.raw === "number" ? Number(e.earningsAverage.raw.toFixed(2)) : null,
          revenueEstimate: fmtRevenue(typeof e?.revenueAverage?.raw === "number" ? e.revenueAverage.raw : null),
        };
      } catch {
        return null;
      }
    })
  );
}

export async function GET() {
  let auth = await getYahooAuth();
  if (!auth) return NextResponse.json({ error: "auth_failed" }, { status: 200 });

  let events = await runBatch(auth.crumb, auth.cookie);

  // If everything came back empty, the crumb likely rotated — refresh once and retry
  if (events.every((e) => e === null)) {
    invalidateYahooAuth();
    const fresh = await getYahooAuth(true);
    if (fresh) {
      auth = fresh;
      events = await runBatch(fresh.crumb, fresh.cookie);
    }
  }

  const list = events
    .filter((e): e is EarningsEvent => e !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (list.length === 0) return NextResponse.json({ error: "unavailable" }, { status: 200 });
  return NextResponse.json({ earnings: list });
}
