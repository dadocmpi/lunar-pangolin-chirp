// ============================================================================
// Compatibility re-export.
//
// The limiter now lives in `_shared/rateLimit.ts` so every Edge Function can
// use one implementation. Existing imports of this path keep working.
// ============================================================================

export {
  clientIp,
  createRateLimiter,
  type RateLimiter,
  type RateLimiterOptions,
} from "../rateLimit.ts";
