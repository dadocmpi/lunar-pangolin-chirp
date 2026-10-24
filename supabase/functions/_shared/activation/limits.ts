// ============================================================================
// Account-activation input limits + receipt path generation.
//
// Pure functions: no I/O, no secrets, no network. Unit-tested directly.
// The receipt is a proof of purchase (an image or a PDF) — NEVER a broker
// password, CID or secret. Those fields are not part of the payload at all.
// ============================================================================

/** Upper bound for a purchase receipt (screenshot or PDF). */
export const RECEIPT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export const RECEIPT_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
] as const;

export const RECEIPT_ALLOWED_EXT = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".pdf",
] as const;

export const ACTIVATION_FIELD_LIMITS = {
  planName: 120,
  accountLogin: 120,
  purchaseEmail: 254,
  note: 500,
  operatorNote: 500,
} as const;

export interface ReceiptFileLike {
  name?: string | null;
  type?: string | null;
  size?: number | null;
}

export interface ReceiptValidation {
  ok: boolean;
  error?:
    | "missing_file"
    | "empty_file"
    | "too_large"
    | "bad_type"
    | "bad_extension";
}

/** Validate an uploaded receipt. Rejects type and size violations. */
export function validateReceiptFile(
  file: ReceiptFileLike | null | undefined,
): ReceiptValidation {
  if (!file || !file.name) return { ok: false, error: "missing_file" };
  if (typeof file.size === "number") {
    if (file.size <= 0) return { ok: false, error: "empty_file" };
    if (file.size > RECEIPT_MAX_BYTES) return { ok: false, error: "too_large" };
  }
  const mime = (file.type ?? "").toLowerCase();
  const ext = extensionOf(file.name);
  // A declared mime must be in the allow-list. An absent mime falls back to the
  // extension check so a legitimate upload without a Content-Type is not
  // rejected, while a clearly wrong mime (executable, svg) is.
  if (mime && !RECEIPT_ALLOWED_MIME.includes(mime as typeof RECEIPT_ALLOWED_MIME[number])) {
    return { ok: false, error: "bad_type" };
  }
  if (!RECEIPT_ALLOWED_EXT.includes(ext as typeof RECEIPT_ALLOWED_EXT[number])) {
    return { ok: false, error: "bad_extension" };
  }
  return { ok: true };
}

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot).toLowerCase();
}

/**
 * Build a non-guessable object path inside the private bucket. The first path
 * segment is always the user id so the storage RLS policy
 * (`(storage.foldername(name))[1] = auth.uid()::text`) can enforce ownership.
 * The filename is a random UUID, never the user-supplied name.
 */
export function buildReceiptPath(
  userId: string,
  originalName: string,
  uuid: string,
): string {
  const ext = RECEIPT_ALLOWED_EXT.includes(extensionOf(originalName) as typeof RECEIPT_ALLOWED_EXT[number])
    ? extensionOf(originalName)
    : ".bin";
  return `${userId}/${uuid}${ext}`;
}

const EMAIL_PATTERN = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;

export function isValidEmail(value: unknown): boolean {
  return typeof value === "string" && value.length <= ACTIVATION_FIELD_LIMITS.purchaseEmail &&
    EMAIL_PATTERN.test(value.trim());
}

/** Trim and cap a free-text field. Returns "" when the input is not a string. */
export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export interface ActivationPayload {
  firmId: string;
  planName: string;
  accountLogin: string;
  purchaseEmail: string;
  note: string;
  confirmedOwnership: boolean;
  confirmedResponsibility: boolean;
  confirmedFirmRules: boolean;
  confirmedRisk: boolean;
}

export interface PayloadValidation {
  ok: boolean;
  error?:
    | "firm_not_configured"
    | "missing_plan_name"
    | "missing_account_login"
    | "invalid_purchase_email"
    | "confirmations_required";
  value?: ActivationPayload;
}

/**
 * Validate the textual part of a submission. `firmAllowed` comes from the
 * server-side firm configuration, never from the request.
 */
export function validateActivationPayload(
  input: Record<string, unknown>,
  firmAllowed: (firmId: unknown) => boolean,
): PayloadValidation {
  const firmId = cleanText(input.firmId, 40);
  if (!firmAllowed(firmId)) return { ok: false, error: "firm_not_configured" };

  const planName = cleanText(input.planName, ACTIVATION_FIELD_LIMITS.planName);
  if (!planName) return { ok: false, error: "missing_plan_name" };

  const accountLogin = cleanText(input.accountLogin, ACTIVATION_FIELD_LIMITS.accountLogin);
  if (!accountLogin) return { ok: false, error: "missing_account_login" };

  const purchaseEmail = cleanText(input.purchaseEmail, ACTIVATION_FIELD_LIMITS.purchaseEmail);
  if (!isValidEmail(purchaseEmail)) return { ok: false, error: "invalid_purchase_email" };

  const confirmations = [
    input.confirmedOwnership,
    input.confirmedResponsibility,
    input.confirmedFirmRules,
    input.confirmedRisk,
  ];
  if (!confirmations.every((c) => c === true || c === "true")) {
    return { ok: false, error: "confirmations_required" };
  }

  return {
    ok: true,
    value: {
      firmId,
      planName,
      accountLogin,
      purchaseEmail,
      note: cleanText(input.note, ACTIVATION_FIELD_LIMITS.note),
      confirmedOwnership: true,
      confirmedResponsibility: true,
      confirmedFirmRules: true,
      confirmedRisk: true,
    },
  };
}
