import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/upstream";
import { getYahooAuth, invalidateYahooAuth, YAHOO_UA } from "@/lib/yahoo-auth";

/* ------------------------------------------------------------------ */
/*  Real per-company earnings record + news.                           */
/*  No fabricated quotes or numbers — everything here comes from        */
/*  Yahoo Finance (earningsHistory / earnings modules + RSS news).      */
/* ------------------------------------------------------------------ */

const RSS_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function fmtRevenue(v: number | null): string | null {
  if (v == null || !isFinite(v)) return null;
  if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toFixed(0)}`;
}

interface QuarterRecord {
  quarter: string; // e.g. "3Q2025"
  date: string; // earnings date, fmt
  epsActual: number | null;
  epsEstimate: number | null;
  surprisePercent: number | null;
  result: "beat" | "miss" | "met" | null;
  revenue: string | null;
}

interface NewsItem {
  title: string;
  url: string;
  site: string;
  date: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function rssTag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decodeEntities(m[1]) : "";
}

function siteFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const map: Record<string, string> = {
      "finance.yahoo": "Yahoo Finance",
      bloomberg: "Bloomberg",
      reuters: "Reuters",
      cnbc: "CNBC",
      wsj: "WSJ",
      marketwatch: "MarketWatch",
      fool: "Motley Fool",
      seekingalpha: "Seeking Alpha",
      barrons: "Barron's",
      benzinga: "Benzinga",
      investorplace: "InvestorPlace",
      forbes: "Forbes",
    };
    for (const key of Object.keys(map)) if (host.includes(key)) return map[key];
    const base = host.replace(/\.(com|net|org|co)$/, "").split(".").pop() || host;
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return "Market News";
  }
}

async function fetchNews(symbol: string): Promise<NewsItem[]> {
  try {
    const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(
      symbol
    )}&region=US&lang=en-US`;
    const res = await fetchWithTimeout(url, { headers: { "User-Agent": RSS_UA }, next: { revalidate: 300 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
    const out: NewsItem[] = [];
    for (const raw of items.slice(0, 8)) {
      const title = rssTag(raw, "title");
      const link = rssTag(raw, "link");
      if (!title || !link) continue;
      const pub = rssTag(raw, "pubDate");
      out.push({
        title,
        url: link,
        site: siteFromUrl(link),
        date: pub ? new Date(pub).toISOString() : new Date().toISOString(),
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function fetchSummary(symbol: string, crumb: string, cookie: string) {
  const modules = "earningsHistory,earnings,calendarEvents,price";
  const u = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(
    symbol
  )}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`;
  const res = await fetchWithTimeout(u, {
    headers: { "User-Agent": YAHOO_UA, Cookie: cookie },
    next: { revalidate: 3600 },
  });
  return res;
}

function quarterLabel(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${q}Q${d.getFullYear()}`;
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase().trim();
  if (!symbol || !/^[A-Z0-9.=^-]{1,15}$/.test(symbol)) {
    return NextResponse.json({ error: "bad_symbol" }, { status: 200 });
  }

  let auth = await getYahooAuth();
  if (!auth) return NextResponse.json({ error: "auth_failed" }, { status: 200 });

  let res = await fetchSummary(symbol, auth.crumb, auth.cookie);
  if (res.status === 401) {
    invalidateYahooAuth();
    const fresh = await getYahooAuth(true);
    if (fresh) {
      auth = fresh;
      res = await fetchSummary(symbol, fresh.crumb, fresh.cookie);
    }
  }

  if (!res.ok) {
    // Even if fundamentals fail, still try to return news so the page isn't empty.
    const news = await fetchNews(symbol);
    if (news.length === 0) return NextResponse.json({ error: "not_found" }, { status: 200 });
    return NextResponse.json({ symbol, company: symbol, quarters: [], news, nextEarnings: null });
  }

  const json = await res.json();
  const result = json?.quoteSummary?.result?.[0];
  if (!result) {
    return NextResponse.json({ error: "not_found" }, { status: 200 });
  }

  const company: string =
    result?.price?.longName || result?.price?.shortName || symbol;

  // ---- Quarterly revenue (from earnings.financialsChart.quarterly) ----
  const revByQuarter = new Map<string, number>();
  const finQuarters = result?.earnings?.financialsChart?.quarterly;
  if (Array.isArray(finQuarters)) {
    for (const q of finQuarters) {
      const label: string | undefined = q?.date; // e.g. "3Q2024"
      const rev: number | undefined = q?.revenue?.raw;
      if (label && typeof rev === "number") revByQuarter.set(label, rev);
    }
  }

  // ---- EPS beat/miss history (last quarters, newest first) ----
  const history = result?.earningsHistory?.history;
  const quarters: QuarterRecord[] = [];
  if (Array.isArray(history)) {
    for (const h of history) {
      const epsActual = typeof h?.epsActual?.raw === "number" ? h.epsActual.raw : null;
      const epsEstimate = typeof h?.epsEstimate?.raw === "number" ? h.epsEstimate.raw : null;
      const surprise =
        typeof h?.surprisePercent?.raw === "number" ? h.surprisePercent.raw * 100 : null;
      const dateFmt: string = h?.quarter?.fmt || "";
      const label = quarterLabel(dateFmt);
      let res2: QuarterRecord["result"] = null;
      if (epsActual != null && epsEstimate != null) {
        if (epsActual > epsEstimate) res2 = "beat";
        else if (epsActual < epsEstimate) res2 = "miss";
        else res2 = "met";
      }
      quarters.push({
        quarter: label,
        date: dateFmt,
        epsActual,
        epsEstimate,
        surprisePercent: surprise != null ? Number(surprise.toFixed(1)) : null,
        result: res2,
        revenue: revByQuarter.has(label) ? fmtRevenue(revByQuarter.get(label)!) : null,
      });
    }
  }
  // newest first
  quarters.reverse();

  // ---- Next scheduled earnings date ----
  const nextEarnings: string | null =
    result?.calendarEvents?.earnings?.earningsDate?.[0]?.fmt || null;

  // ---- Real news headlines ----
  const news = await fetchNews(symbol);

  if (quarters.length === 0 && news.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 200 });
  }

  return NextResponse.json({ symbol, company, quarters, news, nextEarnings });
}
