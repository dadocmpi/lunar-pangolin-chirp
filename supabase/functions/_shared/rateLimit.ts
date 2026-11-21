// ============================================================================
// Best-effort per-instance sliding-window rate limiter.
//
// Edge isolates are ephemeral, so this is a SOFT limit: it stops accidental
// double-submits and casual abuse from one address, while the real boundary
// stays the verified JWT plus server-side validation. Platform-level limits
// (Supabase Auth, the API gateway) remain the hard ceiling.
//
// Pure: no I/O, no secrets. `now` is injectable so behaviour is testable
// without waiting.
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

/**
 * Client address as reported by the platform proxy. Falls back to a stable
 * sentinel so an absent header can never bypass the limiter.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || req.headers.get("cf-connecting-ip")?.trim() || "unknown";
}
