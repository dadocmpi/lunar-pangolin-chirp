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
//   ACTIVATION_FLOW_ENABLED        "false" -> the buy-account / activate flow is
//                                             refused (503) and hidden in the UI.
//   ONBOARDING_FLOW_ENABLED        "false" -> the managed-account onboarding
//                                             flow (account-link requests) is
//                                             refused (503) and hidden.
//   EXECUTION_ENABLED              DEFAULT OFF. Only the exact string "true"
//                                             enables the future execution
//                                             capability. Nothing in this
//                                             phase places or modifies orders.
//
// The server flag is the boundary. The client reads the public
// `activation-config` / `onboarding-config` Edge Functions purely to decide
// which UI renders; the server re-checks every request and fails closed.
// ============================================================================

export interface FeatureEnv {
  TRADOVATE_ENABLED?: string;
  AI_KYC_ENABLED?: string;
  WITHDRAWAL_KYC_GATE_ENABLED?: string;
  ACTIVATION_FLOW_ENABLED?: string;
  ONBOARDING_FLOW_ENABLED?: string;
  EXECUTION_ENABLED?: string;
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

export function isActivationFlowEnabled(env: FeatureEnv = defaultEnv()): boolean {
  return flagEnabled(env.ACTIVATION_FLOW_ENABLED);
}

export function isOnboardingFlowEnabled(env: FeatureEnv = defaultEnv()): boolean {
  return flagEnabled(env.ONBOARDING_FLOW_ENABLED);
}

/**
 * Execution is DEFAULT OFF. Only the exact string "true" enables it, so an
 * unset secret, an empty value or a typo all keep it disabled.
 */
export function isExecutionCapabilityEnabled(env: FeatureEnv = defaultEnv()): boolean {
  return env.EXECUTION_ENABLED === "true";
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
    ACTIVATION_FLOW_ENABLED: Deno.env.get("ACTIVATION_FLOW_ENABLED") ?? undefined,
    ONBOARDING_FLOW_ENABLED: Deno.env.get("ONBOARDING_FLOW_ENABLED") ?? undefined,
    EXECUTION_ENABLED: Deno.env.get("EXECUTION_ENABLED") ?? undefined,
  };
}
