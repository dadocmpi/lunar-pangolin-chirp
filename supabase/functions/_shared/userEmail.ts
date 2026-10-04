// ============================================================================
// Braxel Markets — user-facing transactional emails.
//
// Sends TO a customer (KYC status changes). The recipient address is always
// supplied by the caller from the verified server-side user record; it is
// validated before use. The Resend key is read at call time and never logged.
// Delivery failure never throws: the caller's action must not break.
// ============================================================================

import { EMAIL_PATTERN, escapeHtml } from "./email.ts";

interface SendUserEmailInput {
  to: string | null | undefined;
  subject: string;
  heading: string;
  body: string;
  /** Optional extra lines rendered as a bullet list. */
  details?: Array<[string, string]>;
}

export interface SendUserEmailResult {
  ok: boolean;
  skipped?: "not_configured" | "bad_recipient";
  id?: string;
  error?: string;
}

function getFromAddress(): string {
  return Deno.env.get("EMAIL_FROM") ??
    "Braxel Markets <onboarding@resend.dev>";
}

export async function sendUserEmail(
  input: SendUserEmailInput,
): Promise<SendUserEmailResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = (input.to ?? "").trim();
  if (!apiKey) {
    console.warn("[user-email] not configured — event logged only", {
      subject: input.subject,
    });
    return { ok: false, skipped: "not_configured" };
  }
  if (!EMAIL_PATTERN.test(to)) {
    return { ok: false, skipped: "bad_recipient" };
  }

  const rows = (input.details ?? [])
    .map(([k, v]) =>
      `<p style="margin:5px 0;font-size:14px"><strong>${
        escapeHtml(k)
      }:</strong> ${escapeHtml(v)}</p>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden">
  <div style="background:#0a0e27;padding:40px;text-align:center">
    <h1 style="color:#D4AF37;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0">Braxel Markets</h1>
  </div>
  <div style="padding:40px">
    <div style="font-size:20px;font-weight:bold;color:#222;margin-bottom:20px">${escapeHtml(input.heading)}</div>
    <p style="font-size:15px;color:#555;line-height:1.7">${escapeHtml(input.body)}</p>
    <div style="padding:20px;background:#f9f9f9;border-radius:4px;margin:20px 0">${rows}</div>
  </div>
  <div style="padding:20px 40px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee">© 2026 Braxel Markets</div>
</div></body></html>`;

  const text = `${input.heading} — Braxel Markets\n\n${input.body}\n${
    (input.details ?? []).map(([k, v]) => `${k}: ${v}`).join("\n")
  }`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to,
        subject: input.subject.slice(0, 200),
        html,
        text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[user-email] resend request failed", {
        status: res.status,
        detail: detail.slice(0, 200),
      });
      return { ok: false, error: `resend_${res.status}` };
    }
    const result = await res.json().catch(() => ({}));
    return { ok: true, id: result?.id };
  } catch (err) {
    console.error("[user-email] send failed (non-blocking)", {
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: err instanceof Error ? err.message : "unknown_error" };
  }
}

/** Fire-and-forget for callers that must not await delivery. */
export function sendUserEmailInBackground(input: SendUserEmailInput): void {
  const run = () => sendUserEmail(input).catch(() => {});
  const runtime = (globalThis as {
    EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void };
  }).EdgeRuntime;
  if (runtime?.waitUntil) runtime.waitUntil(run());
  else void run();
}
