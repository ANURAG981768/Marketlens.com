import { NextRequest, NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// Popular tickers used to build a broad "market news" feed when no symbol is given
const MARKET_TICKERS = "AAPL,MSFT,NVDA,GOOGL,AMZN,META,TSLA,JPM,V,WMT";

interface Article {
  symbol: string;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
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

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decodeEntities(m[1]) : "";
}

function siteFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").replace(/\.com$|\.net$|\.org$|\.co$/, "");
    const map: Record<string, string> = {
      "finance.yahoo": "Yahoo Finance",
      "247wallst": "24/7 Wall St",
      bloomberg: "Bloomberg",
      reuters: "Reuters",
      cnbc: "CNBC",
      wsj: "WSJ",
      marketwatch: "MarketWatch",
      fool: "Motley Fool",
      "seekingalpha": "Seeking Alpha",
      barrons: "Barron's",
      investorplace: "InvestorPlace",
      benzinga: "Benzinga",
      thestreet: "TheStreet",
      "businessinsider": "Business Insider",
      forbes: "Forbes",
      coindesk: "CoinDesk",
      ft: "Financial Times",
    };
    for (const key of Object.keys(map)) {
      if (host.includes(key)) return map[key];
    }
    // Title-case the bare hostname as a fallback
    const base = host.split(".").pop() || host;
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return "Market News";
  }
}

function parseRss(xml: string, fallbackSymbol: string): Article[] {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  const out: Article[] = [];
  for (const raw of items) {
    const title = tag(raw, "title");
    const link = tag(raw, "link");
    if (!title || !link) continue;
    const desc = tag(raw, "description");
    const pub = tag(raw, "pubDate");
    out.push({
      symbol: fallbackSymbol,
      title,
      url: link,
      text: desc.length > 240 ? desc.slice(0, 240) + "…" : desc,
      publishedDate: pub ? new Date(pub).toISOString() : new Date().toISOString(),
      site: siteFromUrl(link),
      image: "",
    });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase().trim();
  const tickers = symbol && /^[A-Z0-9.=^-]{1,15}$/.test(symbol) ? symbol : MARKET_TICKERS;

  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(
    tickers
  )}&region=US&lang=en-US`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 300 }, // cache 5 min — fresh but not hammering
    });
    if (!res.ok) throw new Error(`Yahoo RSS ${res.status}`);
    const xml = await res.text();
    const articles = parseRss(xml, symbol || "");
    if (articles.length === 0) {
      return NextResponse.json({ error: "demo" }, { status: 200 });
    }
    return NextResponse.json({ articles });
  } catch {
    // Fall back to demo data on the client
    return NextResponse.json({ error: "demo" }, { status: 200 });
  }
}
