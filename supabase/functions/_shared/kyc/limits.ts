// ============================================================================
// KYC document limits + path generation.
//
// Pure functions: no I/O, no secrets, no network. Unit-tested directly.
// ============================================================================

/** Sensible upper bound for an ID photo / PDF. Selfies are photos. */
export const KYC_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export const KYC_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
] as const;

export const KYC_ALLOWED_EXT = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".pdf",
] as const;

export type KycDocumentKind = "front" | "back" | "selfie";

export interface KycFileLike {
  name?: string | null;
  type?: string | null;
  size?: number | null;
}

export interface KycValidation {
  ok: boolean;
  error?:
    | "missing_file"
    | "empty_file"
    | "too_large"
    | "bad_type"
    | "bad_extension";
}

/** Validate an uploaded identity document. Rejects type and size violations. */
export function validateKycFile(file: KycFileLike | null | undefined): KycValidation {
  if (!file || !file.name) return { ok: false, error: "missing_file" };
  if (typeof file.size === "number") {
    if (file.size <= 0) return { ok: false, error: "empty_file" };
    if (file.size > KYC_MAX_BYTES) return { ok: false, error: "too_large" };
  }
  const mime = (file.type ?? "").toLowerCase();
  const ext = extensionOf(file.name);
  // A declared mime must be in the allow-list. An absent mime falls back to
  // the extension check so a legitimate upload without a Content-Type is not
  // rejected, while a clearly wrong mime is.
  if (mime && !KYC_ALLOWED_MIME.includes(mime as typeof KYC_ALLOWED_MIME[number])) {
    return { ok: false, error: "bad_type" };
  }
  if (!KYC_ALLOWED_EXT.includes(ext as typeof KYC_ALLOWED_EXT[number])) {
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
export function buildObjectPath(
  userId: string,
  kind: KycDocumentKind,
  originalName: string,
  uuid: string,
): string {
  const ext = KYC_ALLOWED_EXT.includes(extensionOf(originalName) as typeof KYC_ALLOWED_EXT[number])
    ? extensionOf(originalName)
    : ".bin";
  return `${userId}/${kind}-${uuid}${ext}`;
}
