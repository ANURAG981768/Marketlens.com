// In-memory "last known good" store. Each warm serverless instance keeps its
// own copy — this is not a shared/distributed cache — but that's enough to ride
// out a transient upstream blip: if a symbol's data loaded successfully once on
// this instance, a later upstream failure can serve the last good payload
// (clearly flagged stale) instead of dropping the user to a demo/error screen.
// Capped + LRU-evicted so memory can't grow unbounded on a long-lived instance.

const MAX_ENTRIES = 300;
const store = new Map<string, { at: number; data: unknown }>();

/** Save a successful payload under a key (overwrites + moves to most-recent). */
export function remember(key: string, data: unknown): void {
  store.delete(key);
  store.set(key, { at: Date.now(), data });
  while (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest === undefined) break;
    store.delete(oldest);
  }
}

/**
 * Return the last good payload for a key if we have one no older than maxAgeMs.
 * Default ceiling is 6 hours — old enough to cover an outage, recent enough that
 * we never show wildly stale prices. Refreshes the entry's LRU position.
 */
export function recall<T = unknown>(key: string, maxAgeMs = 6 * 60 * 60 * 1000): { data: T; ageMs: number } | null {
  const hit = store.get(key);
  if (!hit) return null;
  const ageMs = Date.now() - hit.at;
  if (ageMs > maxAgeMs) {
    store.delete(key);
    return null;
  }
  store.delete(key);
  store.set(key, hit);
  return { data: hit.data as T, ageMs };
}
