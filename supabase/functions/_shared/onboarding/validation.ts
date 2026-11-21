// ============================================================================
// Account-link request validation.
//
// Pure: no I/O, no secrets. The payload contains NO credential field — there
// is nowhere to send a broker password, provider token, CID or secret. Only
// the external account login/ID and free-text notes are accepted.
// ============================================================================

export const LINK_FIELD_LIMITS = {
  firmId: 40,
  accountLogin: 120,
  note: 500,
  operatorNote: 500,
} as const;

export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export interface LinkPayload {
  firmId: string;
  accountLogin: string;
  note: string;
  confirmedOwnership: boolean;
  confirmedExternalRules: boolean;
  confirmedNoProfitGuarantee: boolean;
  confirmedEligibility: boolean;
  confirmedDataDelayed: boolean;
  confirmedPayoutsProvider: boolean;
  confirmedNoFundsHeld: boolean;
}

export type LinkPayloadError =
  | "firm_not_configured"
  | "missing_account_login"
  | "confirmations_required";

export interface LinkPayloadValidation {
  ok: boolean;
  error?: LinkPayloadError;
  value?: LinkPayload;
}

const CONFIRMATION_FIELDS = [
  "confirmedOwnership",
  "confirmedExternalRules",
  "confirmedNoProfitGuarantee",
  "confirmedEligibility",
  "confirmedDataDelayed",
  "confirmedPayoutsProvider",
  "confirmedNoFundsHeld",
] as const;

function isTrue(value: unknown): boolean {
  return value === true || value === "true";
}

/**
 * Validate the textual part of a submission. `firmAllowed` comes from the
 * server-side firm configuration, never from the request.
 */
export function validateLinkPayload(
  input: Record<string, unknown>,
  firmAllowed: (firmId: unknown) => boolean,
): LinkPayloadValidation {
  const firmId = cleanText(input.firmId, LINK_FIELD_LIMITS.firmId);
  if (!firmAllowed(firmId)) return { ok: false, error: "firm_not_configured" };

  const accountLogin = cleanText(input.accountLogin, LINK_FIELD_LIMITS.accountLogin);
  if (!accountLogin) return { ok: false, error: "missing_account_login" };

  for (const field of CONFIRMATION_FIELDS) {
    if (!isTrue(input[field])) return { ok: false, error: "confirmations_required" };
  }

  return {
    ok: true,
    value: {
      firmId,
      accountLogin,
      note: cleanText(input.note, LINK_FIELD_LIMITS.note),
      confirmedOwnership: true,
      confirmedExternalRules: true,
      confirmedNoProfitGuarantee: true,
      confirmedEligibility: true,
      confirmedDataDelayed: true,
      confirmedPayoutsProvider: true,
      confirmedNoFundsHeld: true,
    },
  };
}
