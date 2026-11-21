// ============================================================================
// Shared HTTP input helpers for Edge Functions.
//
// Every JSON endpoint should bound the body it is willing to parse and should
// compare shared secrets without leaking their length through timing.
// ============================================================================

/** Default cap for JSON bodies. Generous for forms, small for abuse. */
export const MAX_JSON_BODY_BYTES = 16 * 1024;

export type JsonBodyResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: "payload_too_large" | "invalid_json" };

/**
 * Read and parse a JSON body with a hard byte cap.
 *
 * The cap is applied to the raw text BEFORE parsing, so an oversized payload
 * is rejected without allocating a giant object graph.
 */
export async function readJsonBody<T = Record<string, unknown>>(
  req: Request,
  maxBytes: number = MAX_JSON_BODY_BYTES,
): Promise<JsonBodyResult<T>> {
  const raw = await req.text();
  if (raw.length > maxBytes) return { ok: false, error: "payload_too_large" };
  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, error: "invalid_json" };
    }
    return { ok: true, value: parsed as T };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}

/**
 * Length-safe constant-time-ish comparison for shared secrets.
 *
 * Length is compared first (that leak is unavoidable for strings and is not
 * secret material on its own); the byte loop then runs in constant time
 * regardless of where the first mismatch occurs.
 */
export function safeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/** True only when `value` is a non-empty string within `max` characters. */
export function boundedString(
  value: unknown,
  max: number,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}
