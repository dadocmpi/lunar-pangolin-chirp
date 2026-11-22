// ============================================================================
// Braxel Markets — user-facing transactional emails.
//
// The SINGLE module that sends TO a customer. The recipient address is always
// supplied by the caller from the verified server-side user record; it is
// validated before use. The Resend key is read at call time and never logged.
// Delivery failure never throws: the caller's action must not break.
//
// `idempotencyKey` is forwarded as Resend's Idempotency-Key header, so a
// retried webhook/reconciliation cannot deliver the same email twice.
// ============================================================================

import { EMAIL_PATTERN, escapeHtml } from "./email.ts";

interface SendUserEmailInput {
  to: string | null | undefined;
  subject: string;
  heading: string;
  body: string;
  /** Optional extra lines rendered as a definition list. */
  details?: Array<[string, string]>;
  /** Optional bullet list (e.g. next steps). */
  bullets?: string[];
  /** Optional call-to-action button. Only http(s) or mailto URLs are used. */
  cta?: { label: string; url: string };
  /** Optional footer note (e.g. a security notice). */
  footnote?: string;
  /** Stable provider idempotency key; the same key never sends twice. */
  idempotencyKey?: string;
  /** Template name for structured logging only. */
  templateKey?: string;
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

const CARD_LIKE = /(?:\d[ -]?){13,19}/;
const SECRET_LIKE =
  /(secret|password|passwd|bearer|sk_live|sk_test|whsec_|api[_-]?key|private[_-]?key|-----BEGIN)/i;

/** Defence in depth: never render a value that looks like a credential. */
export function redactDetailValue(value: string): string {
  const text = String(value ?? "");
  if (SECRET_LIKE.test(text) || CARD_LIKE.test(text)) return "«redacted»";
  return text;
}

/** Only http(s)/mailto links are rendered as a CTA. */
export function safeCtaUrl(url: string): string | null {
  const value = (url ?? "").trim();
  if (!value) return null;
  if (value.startsWith("mailto:")) {
    return EMAIL_PATTERN.test(value.slice("mailto:".length)) ? value : null;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? value
      : null;
  } catch {
    return null;
  }
}

function renderDetails(details: Array<[string, string]>): string {
  return details
    .map(([k, v]) =>
      `<p style="margin:5px 0;font-size:14px"><strong>${
        escapeHtml(k)
      }:</strong> ${escapeHtml(redactDetailValue(v))}</p>`
    )
    .join("");
}

function renderBullets(bullets: string[]): string {
  if (bullets.length === 0) return "";
  return `<ul style="margin:16px 0;padding-inline-start:20px;color:#555;font-size:14px;line-height:1.7">${
    bullets.map((b) => `<li style="margin:4px 0">${escapeHtml(b)}</li>`).join("")
  }</ul>`;
}

function renderCta(cta: { label: string; url: string } | undefined): string {
  if (!cta) return "";
  const href = safeCtaUrl(cta.url);
  if (!href) return "";
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:#D4AF37;color:#0a0e27;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:3px;font-size:14px">${
    escapeHtml(cta.label)
  }</a></p>`;
}

function renderFootnote(footnote: string | undefined): string {
  if (!footnote) return "";
  return `<p style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#888;line-height:1.6">${
    escapeHtml(footnote)
  }</p>`;
}

export async function sendUserEmail(
  input: SendUserEmailInput,
): Promise<SendUserEmailResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = (input.to ?? "").trim();
  if (!apiKey) {
    console.warn("[user-email] not configured — event logged only", {
      subject: input.subject,
      template: input.templateKey ?? null,
    });
    return { ok: false, skipped: "not_configured" };
  }
  if (!EMAIL_PATTERN.test(to)) {
    return { ok: false, skipped: "bad_recipient" };
  }

  const details = input.details ?? [];
  const rows = renderDetails(details);

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden">
  <div style="background:#0a0e27;padding:40px;text-align:center">
    <h1 style="color:#D4AF37;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0">Braxel Markets</h1>
  </div>
  <div style="padding:40px">
    <div style="font-size:20px;font-weight:bold;color:#222;margin-bottom:20px">${
    escapeHtml(input.heading)
  }</div>
    <p style="font-size:15px;color:#555;line-height:1.7">${
    escapeHtml(input.body)
  }</p>
    ${rows ? `<div style="padding:20px;background:#f9f9f9;border-radius:4px;margin:20px 0">${rows}</div>` : ""}
    ${renderBullets(input.bullets ?? [])}
    ${renderCta(input.cta)}
    ${renderFootnote(input.footnote)}
  </div>
  <div style="padding:20px 40px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee">© 2026 Braxel Markets</div>
</div></body></html>`;

  const textParts = [
    `${input.heading} — Braxel Markets`,
    "",
    input.body,
    ...(details.length
      ? ["", ...details.map(([k, v]) => `${k}: ${redactDetailValue(v)}`)]
      : []),
    ...((input.bullets ?? []).length
      ? ["", ...(input.bullets ?? []).map((b) => `- ${b}`)]
      : []),
  ];
  if (input.cta && safeCtaUrl(input.cta.url)) {
    textParts.push("", `${input.cta.label}: ${input.cta.url}`);
  }
  if (input.footnote) textParts.push("", input.footnote);
  const text = textParts.join("\n");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (input.idempotencyKey) {
    headers["Idempotency-Key"] = input.idempotencyKey.slice(0, 255);
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
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
        template: input.templateKey ?? null,
        detail: detail.slice(0, 200),
      });
      return { ok: false, error: `resend_${res.status}` };
    }
    const result = await res.json().catch(() => ({}));
    return { ok: true, id: result?.id };
  } catch (err) {
    console.error("[user-email] send failed (non-blocking)", {
      template: input.templateKey ?? null,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown_error",
    };
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
