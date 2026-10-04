// ============================================================================
// Single source of truth for the server-side payments gate.
//
// Every Edge Function that can create, read, confirm, or activate a payment
// MUST call `isPaymentsEnabled()` before doing any work and fail closed when it
// returns false.
//
// The gate is deliberately OR-based so the same binary works in both modes:
//
//   TEST mode : TEST_PAYMENT_MODE = "true"
//   LIVE mode : PAYMENTS_ENABLED  = "true"
//
// Both are Supabase Edge Function secrets (never committed, never bundled into
// the browser). The frontend has a mirror of this rule in
// `src/lib/paymentsFlag.ts`; `npm run check:payments` enforces that they stay
// in sync.
// ============================================================================

/** True when either the test or the live payment flag is set to "true". */
export function isPaymentsEnabled(): boolean {
  return Deno.env.get("PAYMENTS_ENABLED") === "true" ||
    Deno.env.get("TEST_PAYMENT_MODE") === "true";
}

/** True when the test flag specifically is on. */
export function isTestPaymentMode(): boolean {
  return Deno.env.get("TEST_PAYMENT_MODE") === "true";
}

/** True when the live/production flag specifically is on. */
export function isLivePaymentMode(): boolean {
  return Deno.env.get("PAYMENTS_ENABLED") === "true";
}

/**
 * Human-readable mode label for API responses and logs.
 * Never contains a secret.
 */
export function paymentsMode(): "test" | "production" | "disabled" {
  if (isLivePaymentMode()) return "production";
  if (isTestPaymentMode()) return "test";
  return "disabled";
}

/**
 * Canonical fail-closed response body. Every gated function returns the same
 * shape so a caller can tell "disabled" apart from any other error.
 */
export function paymentsDisabledBody(extra?: Record<string, unknown>) {
  return {
    ok: false,
    error: "payments_disabled",
    mode: "disabled",
    message:
      "PAYMENTS_ENABLED and TEST_PAYMENT_MODE are both off. No payment action was performed.",
    ...(extra ?? {}),
  };
}
