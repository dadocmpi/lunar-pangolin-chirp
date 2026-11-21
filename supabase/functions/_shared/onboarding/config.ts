// ============================================================================
// Managed-account onboarding configuration.
//
// The customer buys a Braxel package (existing checkout), then links the
// external prop-firm account they intend to use. The link request is reviewed
// manually by an operator. Braxel never stores a broker password, provider
// token or other credential in this flow.
//
// Configurable values come from Edge Function secrets, never hard-coded and
// never shipped as a secret in the browser bundle:
//
//   ONBOARDING_FLOW_ENABLED   "false" -> the onboarding flow is refused (503)
//                             and hidden in the UI. Default ON.
//   EXECUTION_ENABLED         only the exact "true" enables the future
//                             execution capability. Default OFF.
//   AFFILIATE_TRADEIFY_URL    / AFFILIATE_LUCID_URL: the firm list. A firm
//                             without a configured URL is dropped everywhere.
//
// Plan ids and prices come from the canonical server table _shared/plans.ts;
// the browser never declares them.
// ============================================================================

import {
  resolveActivationConfig,
  type ActivationEnv,
  type ActivationFirm,
} from "../activation/config.ts";
import { PLANS, PLAN_IDS, type PlanId } from "../plans.ts";

/** Bump when the disclosure copy materially changes (stored for evidence). */
export const DISCLOSURES_VERSION = "draft-2026-11";

export interface OnboardingPlan {
  id: PlanId;
  name: string;
  priceCents: number;
  managedCapitalUsd: number;
}

export interface OnboardingConfig {
  enabled: boolean;
  /** Future execution capability. Always false unless EXECUTION_ENABLED="true". */
  executionEnabled: boolean;
  firms: ActivationFirm[];
  plans: OnboardingPlan[];
  disclosuresVersion: string;
}

export interface OnboardingEnv extends ActivationEnv {
  ONBOARDING_FLOW_ENABLED?: string;
  EXECUTION_ENABLED?: string;
}

function planCatalog(): OnboardingPlan[] {
  return PLAN_IDS.map((id) => ({
    id,
    name: PLANS[id].name,
    priceCents: PLANS[id].priceCents,
    managedCapitalUsd: PLANS[id].managedCapitalUsd,
  }));
}

/** Pure resolver so it can be unit-tested without Deno.env. */
export function resolveOnboardingConfig(env: OnboardingEnv): OnboardingConfig {
  return {
    enabled: env.ONBOARDING_FLOW_ENABLED !== "false",
    executionEnabled: env.EXECUTION_ENABLED === "true",
    firms: resolveActivationConfig(env).firms,
    plans: planCatalog(),
    disclosuresVersion: DISCLOSURES_VERSION,
  };
}

/** The firm ids the server will accept for an account-link request. */
export function configuredFirmIds(config: OnboardingConfig): string[] {
  return config.firms.map((f) => f.id);
}

export function isConfiguredOnboardingFirm(
  config: OnboardingConfig,
  firmId: unknown,
): boolean {
  return typeof firmId === "string" && config.firms.some((f) => f.id === firmId);
}

/** The plan ids the server will accept. Never read from the request. */
export function isKnownPlanId(planId: unknown): planId is PlanId {
  return typeof planId === "string" &&
    (PLAN_IDS as readonly string[]).includes(planId);
}

export function onboardingConfigFromEnv(): OnboardingConfig {
  return resolveOnboardingConfig({
    ONBOARDING_FLOW_ENABLED: Deno.env.get("ONBOARDING_FLOW_ENABLED") ?? undefined,
    EXECUTION_ENABLED: Deno.env.get("EXECUTION_ENABLED") ?? undefined,
    ACTIVATION_FLOW_ENABLED: Deno.env.get("ACTIVATION_FLOW_ENABLED") ?? undefined,
    AFFILIATE_TRADEIFY_URL: Deno.env.get("AFFILIATE_TRADEIFY_URL") ?? undefined,
    AFFILIATE_LUCID_URL: Deno.env.get("AFFILIATE_LUCID_URL") ?? undefined,
  });
}
