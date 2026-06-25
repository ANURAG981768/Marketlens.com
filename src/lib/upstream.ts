// A fetch wrapper that aborts if a third party (Yahoo, Google News, CoinGecko)
// takes too long to respond. Without this, a slow or stalled upstream can hang a
// serverless function until the platform's hard timeout — burning the request
// budget and leaving the user staring at a spinner. With it, we fail fast and
// the route's own try/catch returns a graceful "unavailable" instead.

type FetchInit = NonNullable<Parameters<typeof fetch>[1]>;

export async function fetchWithTimeout(
  url: string,
  init: FetchInit = {},
  timeoutMs = 6000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
