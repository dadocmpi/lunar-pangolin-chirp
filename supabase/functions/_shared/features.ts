// ============================================================================
// Runtime feature kill switches.
//
// These are read from Supabase Edge Function secrets on every invocation, so
// flipping one takes effect immediately WITHOUT redeploying any code. The
// default is ON; only the exact string "false" turns a feature off.
//
//   TRADOVATE_ENABLED              "false" -> Tradovate endpoints return 503
//   AI_KYC_ENABLED                 "false" -> AI check skipped, everything goes
//                                             to human manual review
//   WITHDRAWAL_KYC_GATE_ENABLED    "false" -> withdrawals are REFUSED (503).
//                                             Fails closed on purpose: a gate
//                                             that silently allows KYC-less
//                                             withdrawals would be a compliance
//                                             hole.
//
// The server flag is the boundary. A Vite build-time mirror (see
// src/lib/featureFlags.ts) only decides which UI renders and needs a redeploy.
// ============================================================================

export interface FeatureEnv {
  TRADOVATE_ENABLED?: string;
  AI_KYC_ENABLED?: string;
  WITHDRAWAL_KYC_GATE_ENABLED?: string;
}

/** A feature is off only when its switch is exactly "false". Default ON. */
export function flagEnabled(value: string | undefined): boolean {
  return value !== "false";
}

export function isTradovateEnabled(env: FeatureEnv = defaultEnv()): boolean {
  return flagEnabled(env.TRADOVATE_ENABLED);
}

export function isAiKycEnabled(env: FeatureEnv = defaultEnv()): boolean {
  return flagEnabled(env.AI_KYC_ENABLED);
}

export function isWithdrawalKycGateEnabled(env: FeatureEnv = defaultEnv()): boolean {
  return flagEnabled(env.WITHDRAWAL_KYC_GATE_ENABLED);
}

/** Canonical fail-closed body for a disabled feature. Never contains a secret. */
export function featureDisabledBody(feature: string) {
  return {
    ok: false,
    error: "feature_disabled",
    feature,
    message: `${feature} is disabled by its runtime switch.`,
  };
}

function defaultEnv(): FeatureEnv {
  return {
    TRADOVATE_ENABLED: Deno.env.get("TRADOVATE_ENABLED") ?? undefined,
    AI_KYC_ENABLED: Deno.env.get("AI_KYC_ENABLED") ?? undefined,
    WITHDRAWAL_KYC_GATE_ENABLED: Deno.env.get("WITHDRAWAL_KYC_GATE_ENABLED") ?? undefined,
  };
}
