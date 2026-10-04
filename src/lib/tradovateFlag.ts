// ============================================================================
// Single source of truth for the client-side Tradovate connect gate.
//
// Mirrors the server rule in
// `supabase/functions/_shared/tradovate/flag.ts` and MUST stay in sync.
// `npm run check:tradovate` enforces parity.
//
//   REQUIRE_TRADOVATE_CONNECTION is DEFAULT ON. It is only turned off when the
//   value is explicitly "false". Unset, "", "0", "no" all mean REQUIRED.
//
// These are build-time (Vite) env vars: set VITE_REQUIRE_TRADOVATE_CONNECTION
// in Vercel and redeploy to change. The frontend flag decides which UI renders;
// the server independently enforces ownership on every request.
// ============================================================================

/** True when the connect gate must be satisfied before the dashboard. */
export function isTradovateConnectionRequired(): boolean {
  return import.meta.env.VITE_REQUIRE_TRADOVATE_CONNECTION !== "false";
}

/** True only when the operator explicitly disabled the gate. */
export function isTradovateSkipAllowed(): boolean {
  return !isTradovateConnectionRequired();
}
