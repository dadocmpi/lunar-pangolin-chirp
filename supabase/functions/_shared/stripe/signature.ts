// ============================================================================
// Stripe-Signature verification.
//
// Stripe sends:  t=<unix seconds>,v1=<hex hmac>[,v1=<hex hmac>...]
// The signed payload is exactly `${t}.${rawBody}`. A request is accepted only
// when at least one v1 signature verifies and the timestamp is within the
// tolerance window. Multiple v1 values are supported so secret rotation does
// not reject a valid delivery.
// ============================================================================

export type StripeSignatureFailure =
  | "missing"
  | "invalid_format"
  | "timestamp_outside_tolerance"
  | "invalid_signature"
  | "verification_error";

export interface StripeSignatureResult {
  ok: boolean;
  reason?: StripeSignatureFailure;
}

export function parseStripeSignatureHeader(
  header: string | null | undefined,
): { timestamp: number; signatures: string[] } | null {
  if (!header) return null;

  const timestampPart = header
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.startsWith("t="));
  const timestamp = Number.parseInt(timestampPart?.slice(2) ?? "", 10);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return null;

  const signatures = header
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3))
    .filter((value) => value.length > 0);

  if (signatures.length === 0) return null;
  return { timestamp, signatures };
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  if (hex.length === 0 || hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) {
    throw new Error("invalid_hex");
  }
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export async function verifyStripeSignature(
  rawBody: string,
  header: string | null | undefined,
  secret: string,
  options: { nowSeconds?: number; toleranceSeconds?: number } = {},
): Promise<StripeSignatureResult> {
  if (!header) return { ok: false, reason: "missing" };

  const parsed = parseStripeSignatureHeader(header);
  if (!parsed) return { ok: false, reason: "invalid_format" };

  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const tolerance = options.toleranceSeconds ?? 60 * 5;
  if (Math.abs(parsed.timestamp - now) > tolerance) {
    return { ok: false, reason: "timestamp_outside_tolerance" };
  }

  const signedPayload = `${parsed.timestamp}.${rawBody}`;
  const data = new TextEncoder().encode(signedPayload);
  const keyBytes = new TextEncoder().encode(secret);

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    for (const signature of parsed.signatures) {
      let signatureBytes: Uint8Array<ArrayBuffer>;
      try {
        signatureBytes = hexToBytes(signature);
      } catch {
        continue;
      }
      const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        signatureBytes,
        data,
      );
      if (valid) return { ok: true };
    }

    return { ok: false, reason: "invalid_signature" };
  } catch {
    return { ok: false, reason: "verification_error" };
  }
}
