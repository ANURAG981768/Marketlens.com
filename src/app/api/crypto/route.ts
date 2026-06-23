import { NextResponse } from "next/server";

const COIN_MAP: Record<string, string> = {
  "BTC-USD": "bitcoin", "ETH-USD": "ethereum", "SOL-USD": "solana",
  "BNB-USD": "binancecoin", "XRP-USD": "ripple", "DOGE-USD": "dogecoin",
  "ADA-USD": "cardano", "AVAX-USD": "avalanche-2", "DOT-USD": "polkadot",
  "LINK-USD": "chainlink", "MATIC-USD": "matic-network", "UNI-USD": "uniswap",
  "ATOM-USD": "cosmos", "LTC-USD": "litecoin", "NEAR-USD": "near",
  "SHIB-USD": "shiba-inu", "BCH-USD": "bitcoin-cash", "XLM-USD": "stellar",
  "ALGO-USD": "algorand", "FIL-USD": "filecoin", "APT-USD": "aptos",
  "SUI-USD": "sui", "ARB-USD": "arbitrum", "OP-USD": "optimism",
  "PEPE-USD": "pepe", "AAVE-USD": "aave", "MKR-USD": "maker",
  "INJ-USD": "injective-protocol", "HBAR-USD": "hedera-hashgraph",
  "ICP-USD": "internet-computer", "STX-USD": "blockstack",
  "RENDER-USD": "render-token", "GRT-USD": "the-graph", "IMX-USD": "immutable-x",
  "FET-USD": "fetch-ai", "TIA-USD": "celestia", "SEI-USD": "sei-network",
  "VET-USD": "vechain", "RUNE-USD": "thorchain", "BONK-USD": "bonk",
  "WIF-USD": "dogwifcoin", "SAND-USD": "the-sandbox", "MANA-USD": "decentraland",
  "AXS-USD": "axie-infinity", "CRV-USD": "curve-dao-token",
  "JASMY-USD": "jasmycoin", "ENS-USD": "ethereum-name-service",
};

const REVERSE_MAP = Object.fromEntries(
  Object.entries(COIN_MAP).map(([sym, id]) => [id, sym])
);

export async function GET() {
  const ids = Object.values(COIN_MAP).join(",");
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();

    const prices: Record<string, { price: number; change24h: number }> = {};
    for (const [coinId, vals] of Object.entries(data)) {
      const symbol = REVERSE_MAP[coinId];
      if (symbol && vals && typeof vals === "object") {
        const v = vals as { usd?: number; usd_24h_change?: number };
        prices[symbol] = {
          price: v.usd ?? 0,
          change24h: v.usd_24h_change ?? 0,
        };
      }
    }
    return NextResponse.json({ prices });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 200 });
  }
}
