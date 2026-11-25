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
//   EXECUTION_CAPABILITY_ENABLED   Opt-in only: execution is OFF unless this is
//                                  exactly "true". It is a forward-looking kill
//                                  switch; no execution code ships in this phase.
//   SUPPORT_CHAT_ENABLED           "false" -> support-chat returns 503 and the
//                                             chat widget hides in the UI.
//
// The server flag is the boundary. The client reads the public
// `activation-config` Edge Function (src/lib/activationConfig.ts) purely to
// decide which UI renders; the server re-checks every request and fails closed.
// ============================================================================

export interface FeatureEnv {
  TRADOVATE_ENABLED?: string;
  AI_KYC_ENABLED?: string;
  WITHDRAWAL_KYC_GATE_ENABLED?: string;
  ACTIVATION_FLOW_ENABLED?: string;
  EXECUTION_CAPABILITY_ENABLED?: string;
  SUPPORT_CHAT_ENABLED?: string;
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

/** Support chatbot kill switch. Off => support-chat refuses with 503. */
export function isSupportChatEnabled(env: FeatureEnv = defaultEnv()): boolean {
  return flagEnabled(env.SUPPORT_CHAT_ENABLED);
}

/**
 * Execution capability kill switch. Unlike the other switches this one is
 * OPT-IN: it is false unless the secret is exactly "true". No order placement,
 * modification, liquidation, payout, withdrawal, ACH, wire or money-transfer
 * capability exists in this phase; this flag only reserves the boundary for a
 * future, separately reviewed contract.
 */
export function isExecutionCapabilityEnabled(env: FeatureEnv = defaultEnv()): boolean {
  return env.EXECUTION_CAPABILITY_ENABLED === "true";
}

/** No execution implementation ships yet. The UI reports this as unavailable. */
export const EXECUTION_CAPABILITY_IMPLEMENTED = false;

/** Canonical fail-closed body for a disabled execution capability. */
export function executionDisabledBody() {
  return {
    ok: false,
    error: "execution_disabled",
    feature: "execution_capability",
    implemented: EXECUTION_CAPABILITY_IMPLEMENTED,
    message: "Execution capability is disabled.",
  };
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
    EXECUTION_CAPABILITY_ENABLED: Deno.env.get("EXECUTION_CAPABILITY_ENABLED") ?? undefined,
    SUPPORT_CHAT_ENABLED: Deno.env.get("SUPPORT_CHAT_ENABLED") ?? undefined,
  };
}
