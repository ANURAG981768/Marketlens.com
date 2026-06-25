import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/upstream";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

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

function field(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decodeEntities(m[1]) : "";
}

// Build a query that targets the actual company / instrument rather than the
// raw ticker — Yahoo's per-symbol RSS feed is deprecated and now returns the
// same generic market news for every symbol, which is exactly the complaint
// from user testing ("NVDA shows news about other stocks"). Searching Google
// News by company name returns genuinely company-specific, fresh headlines.
function buildQuery(symbol: string | null, name: string | null): string {
  if (!symbol) return "stock market today";
  const isDerivative = /[=^]/.test(symbol); // futures / forex / index
  let base = (name || "").trim();
  if (base) {
    base = base
      // drop corporate suffixes / share-class noise so the match is clean
      .replace(/\b(Inc|Incorporated|Corporation|Corp|Company|Co|Ltd|Limited|PLC|LLC|Holdings|Group|AG|NV|SA)\b\.?/gi, "")
      .replace(/\bClass\s+[A-C]\b/gi, "")
      .replace(/[,.]+\s*$/, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  if (!base) base = symbol;
  // Equities read better with "stock"; commodities/forex don't.
  return isDerivative ? base : `${base} stock`;
}

function parseGoogleNews(xml: string, symbol: string): Article[] {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  const out: Article[] = [];
  const seen = new Set<string>();
  for (const raw of items) {
    let title = field(raw, "title");
    const link = field(raw, "link");
    if (!title || !link) continue;
    // Google News sometimes repeats the same headline — drop duplicates.
    const key = title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    const pub = (raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || "";
    const source = field(raw, "source");
    // Google News titles are "Headline - Publisher"; strip the publisher tail.
    if (source && title.endsWith(` - ${source}`)) {
      title = title.slice(0, -(source.length + 3)).trim();
    } else {
      title = title.replace(/\s[-–]\s[^-–]{2,40}$/, "").trim();
    }
    out.push({
      symbol,
      title,
      url: link,
      text: "",
      publishedDate: pub ? new Date(pub).toISOString() : new Date().toISOString(),
      site: source || "Google News",
      image: "",
    });
  }
  // Freshest first so the feed reads as "latest".
  out.sort((a, b) => +new Date(b.publishedDate) - +new Date(a.publishedDate));
  return out;
}

export async function GET(req: NextRequest) {
  const rawSymbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase().trim() || null;
  const symbol = rawSymbol && /^[A-Z0-9.=^-]{1,15}$/.test(rawSymbol) ? rawSymbol : null;
  // Company name from our own quote/profile data — sanitized before use.
  const name = (req.nextUrl.searchParams.get("name") || "")
    .replace(/[^\w\s.&/-]/g, "")
    .slice(0, 60)
    .trim() || null;

  const query = buildQuery(symbol, name);
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    `${query} when:7d`
  )}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const res = await fetchWithTimeout(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 180 }, // fresh every few minutes without hammering
    });
    if (!res.ok) throw new Error(`Google News ${res.status}`);
    const xml = await res.text();
    const articles = parseGoogleNews(xml, symbol || "").slice(0, 20);
    if (articles.length === 0) {
      return NextResponse.json({ error: "demo" }, { status: 200 });
    }
    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ error: "demo" }, { status: 200 });
  }
}
