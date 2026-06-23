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

  if (!symbol || !/^[A-Z]{1,5}$/.test(symbol)) {
    return NextResponse.json(
      { error: "Invalid ticker symbol" },
      { status: 400 }
    );
  }

  if (!API_KEY) {
    return NextResponse.json({ error: "demo" }, { status: 200 });
  }

  try {
    const peersRes = await fmpFetch(`/stock_peers?symbol=${symbol}`);
    const peerList: string[] = peersRes?.[0]?.peersList ?? [];
    const top5 = peerList.slice(0, 5);

    if (!top5.length) {
      return NextResponse.json({ peers: [] });
    }

    const allSymbols = [symbol, ...top5];
    const [profiles, metrics] = await Promise.all([
      Promise.all(allSymbols.map((s) => fmpFetch(`/profile/${s}`))),
      Promise.all(allSymbols.map((s) => fmpFetch(`/key-metrics-ttm/${s}`))),
    ]);

    const peers = allSymbols.map((s, i) => ({
      symbol: s,
      isTarget: s === symbol,
      profile: profiles[i]?.[0] ?? null,
      metrics: metrics[i]?.[0] ?? null,
    }));

    return NextResponse.json({ peers: peers.filter((p) => p.profile) });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch peer data" },
      { status: 500 }
    );
  }
}
