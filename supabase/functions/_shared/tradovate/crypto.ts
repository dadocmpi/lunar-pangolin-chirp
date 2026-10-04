// ============================================================================
// AES-256-GCM credential envelope.
//
// The browser NEVER sees these values. Encryption and decryption happen only
// inside Edge Functions (service role) with TRADOVATE_ENCRYPTION_KEY, a
// Supabase Edge Function secret that is never committed and never logged.
//
// Envelope layout (each part stored as its own base64 column):
//   ciphertext = AES-GCM ciphertext (no tag)
//   iv         = 12 random bytes (NIST-recommended for GCM)
//   auth_tag   = 16-byte GCM authentication tag
//   key_version= integer, allows a future re-wrap without a schema change
//
// Key material: TRADOVATE_ENCRYPTION_KEY may be either
//   * a base64/hex string decoding to exactly 32 bytes (used as the raw key), or
//   * any other non-empty string (hashed with SHA-256 to derive 32 bytes).
// Rotating the key is a re-wrap operation; see docs in AGENTS.md.
// ============================================================================

import type { TradovateCredentials } from "./types.ts";

export const KEY_VERSION = 1;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

export interface EncryptedParts {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: number;
}

export class EncryptionConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EncryptionConfigError";
  }
}

export class DecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DecryptionError";
  }
}

/** True when the encryption secret is present. Never returns the value. */
export function isEncryptionConfigured(): boolean {
  return (Deno.env.get("TRADOVATE_ENCRYPTION_KEY") ?? "").length > 0;
}

function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function hexToBytes(hex: string) {
  const clean = hex.trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(clean) || clean.length % 2 !== 0) return null;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** Decode a 32-byte raw key from base64 or hex; null if it is neither. */
function tryRawKey(secret: string) {
  const hex = hexToBytes(secret);
  if (hex && hex.length === KEY_BYTES) return hex;
  try {
    const b64 = base64ToBytes(secret);
    if (b64.length === KEY_BYTES) return b64;
  } catch {
    // not valid base64 — fall through to hashing
  }
  return null;
}

async function importAesKey(secret: string): Promise<CryptoKey> {
  if (!secret) {
    throw new EncryptionConfigError(
      "TRADOVATE_ENCRYPTION_KEY is not set",
    );
  }
  let raw = tryRawKey(secret);
  if (!raw) {
    // Derive 32 bytes from an arbitrary passphrase.
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(secret),
    );
    raw = new Uint8Array(digest);
  }
  return await crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Encrypt a credentials object. */
export async function encryptCredentials(
  creds: TradovateCredentials,
  secret: string,
): Promise<EncryptedParts> {
  const key = await importAesKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plaintext = new TextEncoder().encode(JSON.stringify(creds));
  const sealed = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      key,
      plaintext,
    ),
  );
  const tag = sealed.slice(sealed.length - TAG_BYTES);
  const body = sealed.slice(0, sealed.length - TAG_BYTES);
  return {
    ciphertext: bytesToBase64(body),
    iv: bytesToBase64(iv),
    authTag: bytesToBase64(tag),
    keyVersion: KEY_VERSION,
  };
}

/** Decrypt a credentials envelope. Throws DecryptionError on tamper/wrong key. */
export async function decryptCredentials(
  parts: EncryptedParts,
  secret: string,
): Promise<TradovateCredentials> {
  const key = await importAesKey(secret);
  const iv = base64ToBytes(parts.iv);
  const tag = base64ToBytes(parts.authTag);
  const body = base64ToBytes(parts.ciphertext);
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
    throw new DecryptionError("malformed credential envelope");
  }
  const sealed = new Uint8Array(body.length + tag.length);
  sealed.set(body, 0);
  sealed.set(tag, body.length);
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      key,
      sealed,
    );
  } catch {
    // Never echo the ciphertext or key material.
    throw new DecryptionError(
      "could not decrypt credentials (wrong key or tampered ciphertext)",
    );
  }
  return JSON.parse(new TextDecoder().decode(plaintext)) as TradovateCredentials;
}

/**
 * Redact anything that looks like a secret before it reaches a log line.
 * Defense in depth on top of the rule that services never log credentials.
 */
export function redact(value: unknown): string {
  const s = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return s
    .replace(/(password|passwd|pwd)"?\s*[:=]\s*"?[^",}\s]+/gi, "$1=[REDACTED]")
    .replace(/(accessToken|access_token|token|sec|cid|authorization)"?\s*[:=]\s*"?[^",}\s]+/gi, "$1=[REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]");
}
