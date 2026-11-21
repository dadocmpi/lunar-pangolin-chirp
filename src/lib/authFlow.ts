// ============================================================================
// Pure helpers for the account lifecycle.
//
// Supabase Auth encodes several outcomes in the response shape rather than in
// an error code:
//   * signUp() for an email that already exists returns a user with an empty
//     `identities` array and no session (anti-enumeration obfuscation).
//   * signInWithPassword() returns an error message that distinguishes an
//     unconfirmed email from a wrong password.
// These helpers keep that parsing in one tested place.
// ============================================================================

/** True when signUp() answered for an email that is already registered. */
export function isDuplicateSignup(
  user: { identities?: unknown[] | null } | null | undefined,
): boolean {
  return !!user && Array.isArray(user.identities) && user.identities.length === 0;
}

export type AuthErrorKind = "email_not_confirmed" | "invalid_credentials" | "other";

/** Classify a Supabase sign-in error message without trusting any other field. */
export function classifyAuthError(message: string | null | undefined): AuthErrorKind {
  const m = (message ?? "").toLowerCase();
  if (m.includes("email not confirmed")) return "email_not_confirmed";
  if (m.includes("invalid login credentials")) return "invalid_credentials";
  return "other";
}

/**
 * True when signUp() rejected an address that already belongs to an account.
 * With email confirmation disabled Supabase returns an error instead of the
 * obfuscated user; the caller must NOT echo it, because doing so confirms that
 * the address is registered.
 */
export function isExistingAccountError(message: string | null | undefined): boolean {
  const m = (message ?? "").toLowerCase();
  return m.includes("already registered") || m.includes("already exists");
}

/**
 * True when the current URL is a Supabase password-recovery redirect.
 * Implicit links carry `#type=recovery`; PKCE links carry `?type=recovery`
 * (and a `code`).
 */
export function isRecoveryRedirect(hash: string, search: string): boolean {
  const strip = (s: string, prefix: string) => (s.startsWith(prefix) ? s.slice(1) : s);
  if (new URLSearchParams(strip(hash, "#")).get("type") === "recovery") return true;
  return new URLSearchParams(strip(search, "?")).get("type") === "recovery";
}
