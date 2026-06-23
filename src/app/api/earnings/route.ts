import { NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

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

let cachedCrumb: string | null = null;
let cachedCookie: string | null = null;
let crumbAt = 0;
const CRUMB_TTL = 1000 * 60 * 30;

async function getAuth(): Promise<{ crumb: string; cookie: string } | null> {
  if (cachedCrumb && cachedCookie && Date.now() - crumbAt < CRUMB_TTL) {
    return { crumb: cachedCrumb, cookie: cachedCookie };
  }
  try {
    const c = await fetch("https://fc.yahoo.com", { headers: { "User-Agent": UA }, cache: "no-store" });
    const cookie = (c.headers.get("set-cookie") || "").split(";")[0] || "";
    const cr = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": UA, Cookie: cookie },
      cache: "no-store",
    });
    const crumb = (await cr.text()).trim();
    if (!crumb || crumb.includes("<")) return null;
    cachedCrumb = crumb;
    cachedCookie = cookie;
    crumbAt = Date.now();
    return { crumb, cookie };
  } catch {
    return null;
  }
}

function fmtRevenue(v: number | null): string | null {
  if (v == null) return null;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toFixed(0)}`;
}

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "auth_failed" }, { status: 200 });

  const events = await Promise.all(
    TICKERS.map(async (t) => {
      try {
        const u = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${t.symbol}?modules=calendarEvents&crumb=${encodeURIComponent(auth.crumb)}`;
        const res = await fetch(u, {
          headers: { "User-Agent": UA, Cookie: auth.cookie },
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
          time: "AMC" as const, // Yahoo doesn't reliably expose BMO/AMC; default to AMC
          epsEstimate: typeof e?.earningsAverage?.raw === "number" ? Number(e.earningsAverage.raw.toFixed(2)) : null,
          revenueEstimate: fmtRevenue(typeof e?.revenueAverage?.raw === "number" ? e.revenueAverage.raw : null),
        };
      } catch {
        return null;
      }
    })
  );

  const list = events
    .filter((e): e is NonNullable<typeof e> => e !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (list.length === 0) return NextResponse.json({ error: "unavailable" }, { status: 200 });
  return NextResponse.json({ earnings: list });
}
