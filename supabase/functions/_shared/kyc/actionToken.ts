// ============================================================================
// Signed KYC action tokens (owner approve/deny links).
//
// The previous scheme was `btoa("<userId>:<action>:<secret>")`. Base64 is
// reversible, so anyone who saw an emailed link (mail provider, browser
// history, a forwarded message) could decode KYC_ACTION_SECRET and then forge
// an approve/deny token for ANY user. That is a full operator-boundary bypass
// on the KYC gate.
//
// This module replaces it with an HMAC-SHA256 signature over a small JSON
// payload that also carries an expiry. The secret is never part of the token,
// and a token is valid only for the user, action and window it was minted for.
//
// Format: base64url(payloadJson) + "." + base64url(hmacSha256(payloadJson))
// ============================================================================

export interface ActionTokenPayload {
  /** user id */
  u: string;
  /** "approve" | "deny" */
  a: string;
  /** expiry, epoch milliseconds */
  e: number;
}

/** Default lifetime of an emailed action link. */
export const ACTION_TOKEN_TTL_MS = 72 * 60 * 60 * 1000;

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Mint a token for `userId` + `action`, valid until `expiresAtMs`. */
export async function buildActionToken(
  userId: string,
  action: string,
  secret: string,
  expiresAtMs: number,
): Promise<string> {
  const payload: ActionTokenPayload = { u: userId, a: action, e: expiresAtMs };
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const key = await hmacKey(secret);
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, payloadBytes),
  );
  return `${base64UrlEncode(payloadBytes)}.${base64UrlEncode(signature)}`;
}

export type ActionTokenFailure =
  | "malformed"
  | "bad_signature"
  | "expired"
  | "wrong_user"
  | "wrong_action";

export type ActionTokenResult =
  | { ok: true; payload: ActionTokenPayload }
  | { ok: false; error: ActionTokenFailure };

/**
 * Verify a token. The signature is checked before the payload is trusted, so
 * a tampered payload can never reach the identity/action checks.
 */
export async function verifyActionToken(
  token: string,
  expectedUserId: string,
  expectedAction: string,
  secret: string,
  nowMs: number = Date.now(),
): Promise<ActionTokenResult> {
  if (typeof token !== "string") return { ok: false, error: "malformed" };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, error: "malformed" };

  const payloadBytes = base64UrlDecode(parts[0]);
  const signatureBytes = base64UrlDecode(parts[1]);
  if (!payloadBytes || !signatureBytes) return { ok: false, error: "malformed" };

  const key = await hmacKey(secret);
  let valid = false;
  try {
    valid = await crypto.subtle.verify("HMAC", key, signatureBytes, payloadBytes);
  } catch {
    return { ok: false, error: "malformed" };
  }
  if (!valid) return { ok: false, error: "bad_signature" };

  let payload: ActionTokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return { ok: false, error: "malformed" };
  }
  if (
    !payload ||
    typeof payload.u !== "string" ||
    typeof payload.a !== "string" ||
    typeof payload.e !== "number"
  ) {
    return { ok: false, error: "malformed" };
  }

  if (payload.u !== expectedUserId) return { ok: false, error: "wrong_user" };
  if (payload.a !== expectedAction) return { ok: false, error: "wrong_action" };
  if (!Number.isFinite(payload.e) || payload.e <= nowMs) {
    return { ok: false, error: "expired" };
  }
  return { ok: true, payload };
}
