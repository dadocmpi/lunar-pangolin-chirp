// ============================================================================
// Single source of truth for the client-side payments gate.
//
// This mirrors the server rule in
// `supabase/functions/_shared/payments-flag.ts` and MUST stay in sync.
// `npm run check:payments` enforces the parity.
//
//   TEST mode : VITE_TEST_PAYMENT_MODE = "true"
//   LIVE mode : VITE_PAYMENTS_ENABLED  = "true"
//
// These are build-time (Vite) env vars. They are set in Vercel under
// Project Settings → Environment Variables and require a redeploy to change.
//
// IMPORTANT: the frontend flag only decides what UI to render. It is NOT the
// security boundary — every payment Edge Function re-checks the server flag
// and fails closed on its own.
// ============================================================================

/** True when either the test or the live payment flag is set to "true". */
export function isPaymentsEnabled(): boolean {
  return import.meta.env.VITE_PAYMENTS_ENABLED === "true" ||
    import.meta.env.VITE_TEST_PAYMENT_MODE === "true";
}

/** True when the test flag specifically is on. Drives the test-mode banner. */
export function isTestPaymentMode(): boolean {
  return import.meta.env.VITE_TEST_PAYMENT_MODE === "true";
}

/** True when the live/production flag specifically is on. */
export function isLivePaymentMode(): boolean {
  return import.meta.env.VITE_PAYMENTS_ENABLED === "true";
}
