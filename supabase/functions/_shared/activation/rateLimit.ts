// ============================================================================
// Best-effort per-instance sliding-window rate limiter.
//
// Edge isolates are ephemeral, so this is a SOFT limit (like the one in
// notify-owner): it stops accidental double-submits and casual abuse, while
// the real anti-forgery boundary is the verified JWT plus the server-side
// validation in activation-submit. No secret is read or logged here.
//
// `now` is injectable so the behaviour is unit-testable without waiting.
// ============================================================================

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  maxKeys?: number;
  now?: () => number;
}

export interface RateLimiter {
  /** Record a hit for `key`. Returns true when the key is now over the limit. */
  hit: (key: string) => boolean;
}

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const { windowMs, max } = options;
  const maxKeys = options.maxKeys ?? 1000;
  const now = options.now ?? (() => Date.now());
  const buckets = new Map<string, number[]>();

  return {
    hit(key: string): boolean {
      const t = now();
      const hits = (buckets.get(key) ?? []).filter((ts) => t - ts < windowMs);
      if (hits.length >= max) {
        buckets.set(key, hits);
        return true;
      }
      hits.push(t);
      buckets.set(key, hits);
      if (buckets.size > maxKeys) {
        const oldest = buckets.keys().next().value;
        if (oldest !== undefined) buckets.delete(oldest);
      }
      return false;
    },
  };
}
