// ============================================================================
// onboardingStatus — client types and pure helpers for the onboarding flow.
//
// Mirrors supabase/functions/_shared/onboarding/status.ts and entitlement.ts.
// The server is the authority: this module only formats what it returned and
// never decides whether the customer has paid or may submit.
// ============================================================================

import { functionsUrl } from "@/integrations/supabase/client";
import type { OnboardingFirm, OnboardingPlan } from "@/lib/onboardingConfig";

export const LINK_STATUSES = [
  "pending",
  "in_review",
  "approved",
  "rejected",
  "suspended",
  "disconnected",
] as const;

export type LinkStatus = (typeof LINK_STATUSES)[number];

export type EntitlementState =
  | "none"
  | "pending"
  | "active"
  | "failed"
  | "rejected"
  | "refunded"
  | "canceled"
  | "disputed";

export interface Entitlement {
  state: EntitlementState;
  active: boolean;
  planId: string | null;
  paymentId: string | null;
  amountCents: number;
  currency: string;
}

export interface AccountLink {
  id: string;
  firm: string;
  plan_id: string;
  account_login: string;
  note: string | null;
  status: LinkStatus;
  storedStatus: LinkStatus;
  suspendedByPayment: boolean;
  operator_note: string | null;
  suspension_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  connected_at: string | null;
  suspended_at: string | null;
  disconnected_at: string | null;
  created_at: string;
}

export interface OnboardingStatus {
  enabled: boolean;
  executionEnabled: boolean;
  disclosuresVersion: string;
  firms: OnboardingFirm[];
  plans: OnboardingPlan[];
  entitlement: Entitlement;
  link: AccountLink | null;
}

export function isLinkStatus(value: unknown): value is LinkStatus {
  return typeof value === "string" && (LINK_STATUSES as readonly string[]).includes(value);
}

export function isEntitlementState(value: unknown): value is EntitlementState {
  return typeof value === "string" &&
    ["none", "pending", "active", "failed", "rejected", "refunded", "canceled", "disputed"].includes(value);
}

export function isTerminalLinkStatus(status: LinkStatus): boolean {
  return status === "rejected" || status === "disconnected";
}

/** A new request is allowed only when no link exists or the last one closed. */
export function canSubmitNewLink(link: AccountLink | null): boolean {
  return link === null || isTerminalLinkStatus(link.status);
}

export type StatusTone =
  | "pending"
  | "progress"
  | "approved"
  | "rejected"
  | "suspended"
  | "disconnected";

export function statusTone(status: LinkStatus): StatusTone {
  switch (status) {
    case "pending":
      return "pending";
    case "in_review":
      return "progress";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "suspended":
      return "suspended";
    case "disconnected":
      return "disconnected";
  }
}

export type PaymentTone = "active" | "pending" | "inactive" | "none";

export function paymentTone(entitlement: Entitlement): PaymentTone {
  if (entitlement.active) return "active";
  if (entitlement.state === "pending") return "pending";
  if (entitlement.state === "none") return "none";
  return "inactive";
}

function str(value: unknown, max = 500): string | null {
  return typeof value === "string" ? value.slice(0, max) : null;
}

function parseLink(raw: unknown): AccountLink | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!isLinkStatus(r.status)) return null;
  return {
    id: str(r.id, 60) ?? "",
    firm: str(r.firm, 40) ?? "",
    plan_id: str(r.plan_id, 40) ?? "",
    account_login: str(r.account_login, 120) ?? "",
    note: str(r.note),
    status: r.status,
    storedStatus: isLinkStatus(r.storedStatus) ? r.storedStatus : r.status,
    suspendedByPayment: r.suspendedByPayment === true,
    operator_note: str(r.operator_note),
    suspension_reason: str(r.suspension_reason),
    submitted_at: str(r.submitted_at, 40),
    reviewed_at: str(r.reviewed_at, 40),
    connected_at: str(r.connected_at, 40),
    suspended_at: str(r.suspended_at, 40),
    disconnected_at: str(r.disconnected_at, 40),
    created_at: str(r.created_at, 40) ?? "",
  };
}

function parseEntitlement(raw: unknown): Entitlement {
  const fallback: Entitlement = {
    state: "none",
    active: false,
    planId: null,
    paymentId: null,
    amountCents: 0,
    currency: "USD",
  };
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  const state = isEntitlementState(r.state) ? r.state : "none";
  return {
    state,
    // `active` is true only when the server said so AND the state agrees.
    active: r.active === true && state === "active",
    planId: str(r.planId, 40),
    paymentId: str(r.paymentId, 60),
    amountCents: Number.isFinite(Number(r.amountCents)) ? Number(r.amountCents) : 0,
    currency: str(r.currency, 8) ?? "USD",
  };
}

/** FAIL-CLOSED: a malformed payload disables the flow rather than guessing. */
export function resolveOnboardingStatus(data: unknown): OnboardingStatus | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.enabled !== true) {
    return {
      enabled: false,
      executionEnabled: false,
      disclosuresVersion: "",
      firms: [],
      plans: [],
      entitlement: parseEntitlement(null),
      link: null,
    };
  }

  const firms: OnboardingFirm[] = [];
  if (Array.isArray(d.firms)) {
    for (const raw of d.firms) {
      if (!raw || typeof raw !== "object") continue;
      const f = raw as Record<string, unknown>;
      const id = str(f.id, 40);
      const name = str(f.name, 80);
      if (id && name) firms.push({ id, name });
    }
  }

  const plans: OnboardingPlan[] = [];
  if (Array.isArray(d.plans)) {
    for (const raw of d.plans) {
      if (!raw || typeof raw !== "object") continue;
      const p = raw as Record<string, unknown>;
      const id = str(p.id, 40);
      if (!id) continue;
      plans.push({
        id,
        name: str(p.name, 80) ?? id,
        priceCents: Number.isFinite(Number(p.priceCents)) ? Number(p.priceCents) : 0,
        managedCapitalUsd: Number.isFinite(Number(p.managedCapitalUsd))
          ? Number(p.managedCapitalUsd)
          : 0,
      });
    }
  }

  return {
    enabled: firms.length > 0,
    executionEnabled: d.executionEnabled === true,
    disclosuresVersion: str(d.disclosuresVersion, 60) ?? "",
    firms,
    plans,
    entitlement: parseEntitlement(d.entitlement),
    link: parseLink(d.link),
  };
}

/** Fetch the server-derived status. Throws only on a transport failure. */
export async function fetchOnboardingStatus(token: string): Promise<OnboardingStatus> {
  const res = await fetch(functionsUrl("onboarding-status"), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`http_${res.status}`);
  const parsed = resolveOnboardingStatus(await res.json());
  if (!parsed) throw new Error("invalid_response");
  return parsed;
}
