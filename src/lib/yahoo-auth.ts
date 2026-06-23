// Shared Yahoo Finance cookie + crumb handshake.
// Yahoo's quote/quoteSummary endpoints require a session cookie and a matching
// "crumb" token. We fetch both once and cache them in module scope (shared
// across all API routes that import this) with a 30-minute TTL.

export const YAHOO_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

let cachedCrumb: string | null = null;
let cachedCookie: string | null = null;
let fetchedAt = 0;
const TTL = 1000 * 60 * 30;

export async function getYahooAuth(force = false): Promise<{ crumb: string; cookie: string } | null> {
  if (!force && cachedCrumb && cachedCookie && Date.now() - fetchedAt < TTL) {
    return { crumb: cachedCrumb, cookie: cachedCookie };
  }
  try {
    const cookieRes = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": YAHOO_UA },
      cache: "no-store",
    });
    const cookie = (cookieRes.headers.get("set-cookie") || "").split(";")[0] || "";

    const crumbRes = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": YAHOO_UA, Cookie: cookie },
      cache: "no-store",
    });
    const crumb = (await crumbRes.text()).trim();
    if (!crumb || crumb.includes("<")) return null;

    cachedCrumb = crumb;
    cachedCookie = cookie;
    fetchedAt = Date.now();
    return { crumb, cookie };
  } catch {
    return null;
  }
}

export function invalidateYahooAuth() {
  cachedCrumb = null;
  cachedCookie = null;
}
