// ============================================================================
// Server-side Tradovate connect-gate flag.
//
// Mirrors src/lib/tradovateFlag.ts and MUST stay in sync
// (`npm run check:tradovate` enforces parity).
//
// REQUIRE_TRADOVATE_CONNECTION is DEFAULT ON: only the explicit string
// "false" turns it off. Unset, "", "0", "no" all mean REQUIRED.
//
// This is an Edge Function secret. It decides whether the server will serve
// dashboard data to a user who has not connected; ownership is always enforced
// independently by RLS + the server-derived user_id.
// ============================================================================

/** True when a valid Tradovate connection is required before the dashboard. */
export function isTradovateConnectionRequired(): boolean {
  return (Deno.env.get("REQUIRE_TRADOVATE_CONNECTION") ?? "true") !== "false";
}

/** True only when the operator explicitly disabled the gate. */
export function isTradovateSkipAllowed(): boolean {
  return !isTradovateConnectionRequired();
}
