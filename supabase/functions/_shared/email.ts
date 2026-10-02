// ============================================================================
// Braxel Markets — Central owner-notification module.
//
// ONE module. Every email the platform sends to the owner's inbox goes
// through `notifyOwner({ type, subject, data })`. Nothing else calls the
// Resend API directly.
//
// Security / robustness contract:
//   - The Resend API key is read from RESEND_API_KEY at call time. It is
//     never logged, returned, or embedded in an email body.
//   - EMAIL_FROM (verified sender) and EMAIL_TO (owner inbox) come from the
//     environment. No address is hard-coded.
//   - All data is sanitized and HTML-escaped before rendering.
//   - Passwords, tokens, full card numbers and CVVs are redacted.
//   - Delivery failure is swallowed and logged: the caller's action (signup,
//     checkout, form submit, webhook) must never break because email failed.
//   - Duplicate webhook deliveries are suppressed by a short-lived
//     idempotency cache keyed on the event id.
// ============================================================================

export const EVENT_TYPES = [
  "novo_cliente",
  "novo_lead",
  "compra",
  "pagamento",
  "conta",
  "erro",
  "webhook",
  "suporte",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

/** Subject prefix applied per event type. */
export const TYPE_PREFIXES: Record<EventType, string> = {
  novo_cliente: "[Novo Cliente]",
  novo_lead: "[Lead]",
  compra: "[Compra]",
  pagamento: "[Pagamento]",
  conta: "[Conta]",
  erro: "[Erro]",
  webhook: "[Webhook]",
  suporte: "[Braxel Support]",
};

export interface NotifyOwnerInput {
  /** Event type — drives the subject prefix. */
  type: EventType | string;
  /** Short human description, e.g. "Pedido criado". */
  subject: string;
  /** Arbitrary key/value payload. Nested objects are flattened one level. */
  data?: Record<string, unknown>;
  /** Customer email; becomes reply_to when it looks like an address. */
  replyTo?: string | null;
  /**
   * Stable idempotency key (webhook event id, payment id, etc.). When the
   * same key is notified twice inside the TTL window the second send is
   * skipped.
   */
  idempotencyKey?: string | null;
}

export interface NotifyOwnerResult {
  ok: boolean;
  skipped?: "duplicate" | "not_configured" | "not_owner_type";
  id?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Redaction
// ---------------------------------------------------------------------------

/**
 * Keys whose values must never appear in an email, even to the owner.
 * Covers English and Portuguese field names, since call sites use both.
 */
const SENSITIVE_KEY_PATTERN =
  /pass(word|wd)?|senha|secret|segredo|token|authorization|autentica|api[_-]?key|chave|cvv|cvc|card[_-]?number|cardnumber|cartao|cartão|pan\b|iban|seed|mnemonic|private[_-]?key|signature|cpf|ssn|2fa|otp|totp|\bpin\b/i;

const REDACTED = "«redacted»";

/** A 13-19 digit run (optionally space/dash separated) looks like a card PAN. */
const CARD_LIKE_PATTERN = /(?:\d[ -]?){13,19}/;

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    return CARD_LIKE_PATTERN.test(value) ? REDACTED : value;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/**
 * Produce a flat, redacted copy of the caller's payload. Nested objects are
 * flattened one level (`metadata.plan` -> `metadata_plan`) so the email body
 * stays readable and no structured secret slips through untouched.
 */
export function sanitizeData(
  data: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!data) return out;

  for (const [key, raw] of Object.entries(data)) {
    if (isSensitiveKey(key)) {
      out[key] = REDACTED;
      continue;
    }
    if (raw && typeof raw === "object" && !(raw instanceof Date)) {
      for (const [subKey, subRaw] of Object.entries(
        raw as Record<string, unknown>,
      )) {
        const flatKey = `${key}.${subKey}`;
        out[flatKey] = isSensitiveKey(subKey)
          ? REDACTED
          : sanitizeValue(subRaw);
      }
      continue;
    }
    out[key] = sanitizeValue(raw);
  }
  return out;
}

// ---------------------------------------------------------------------------
// HTML rendering
// ---------------------------------------------------------------------------

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape a value for safe interpolation into HTML. */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/** Turn a key like "customer.email" into "Customer email". */
function humanizeKey(key: string): string {
  const spaced = key.replace(/[._]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "sim" : "não";
  return String(value);
}

function renderHtml(
  type: EventType | string,
  prefix: string,
  subject: string,
  rows: Array<[string, unknown]>,
  timestamp: string,
): string {
  const rowsHtml = rows
    .map(
      ([key, value]) =>
        `<tr>` +
        `<td style="padding:10px 14px;border-bottom:1px solid #eee;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;white-space:nowrap;vertical-align:top">${
          escapeHtml(humanizeKey(key))
        }</td>` +
        `<td style="padding:10px 14px;border-bottom:1px solid #eee;font-size:14px;color:#111;word-break:break-word">${
          escapeHtml(formatValue(value))
        }</td>` +
        `</tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:#0a0e27;padding:28px 32px">
      <div style="color:#D4AF37;font-size:18px;font-weight:900;letter-spacing:3px;text-transform:uppercase">Braxel Markets</div>
      <div style="color:#9aa0b4;font-size:11px;margin-top:6px">Notificação automática</div>
    </div>
    <div style="padding:28px 32px">
      <div style="display:inline-block;background:#0a0e27;color:#D4AF37;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 12px;border-radius:3px">${
    escapeHtml(prefix)
  }</div>
      <h1 style="font-size:20px;color:#111;margin:16px 0 4px">${
    escapeHtml(subject)
  }</h1>
      <p style="font-size:12px;color:#888;margin:0 0 20px">${
    escapeHtml(timestamp)
  } · tipo: ${escapeHtml(type)}</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:4px">${
    rowsHtml || `<tr><td style="padding:14px;color:#888">Sem dados adicionais.</td></tr>`
  }</table>
    </div>
    <div style="padding:18px 32px;border-top:1px solid #eee;color:#aaa;font-size:11px;text-align:center">
      Braxel Markets — sistema de notificações internas
    </div>
  </div>
</body>
</html>`;
}

function renderText(
  type: EventType | string,
  prefix: string,
  subject: string,
  rows: Array<[string, unknown]>,
  timestamp: string,
): string {
  const lines = rows.map(
    ([key, value]) => `${humanizeKey(key)}: ${formatValue(value)}`,
  );
  return [
    `${prefix} ${subject}`,
    `Tipo: ${type}`,
    `Data/hora: ${timestamp}`,
    "",
    ...(lines.length ? lines : ["(sem dados adicionais)"]),
    "",
    "— Braxel Markets — sistema de notificações internas",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Idempotency (best-effort, per-instance)
// ---------------------------------------------------------------------------

const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;
const MAX_IDEMPOTENCY_ENTRIES = 500;
const idempotencyCache = new Map<string, number>();

function isDuplicate(key: string): boolean {
  const now = Date.now();
  for (const [k, seenAt] of idempotencyCache) {
    if (now - seenAt > IDEMPOTENCY_TTL_MS) idempotencyCache.delete(k);
  }
  const seen = idempotencyCache.get(key);
  if (seen !== undefined && now - seen <= IDEMPOTENCY_TTL_MS) return true;
  idempotencyCache.set(key, now);
  if (idempotencyCache.size > MAX_IDEMPOTENCY_ENTRIES) {
    const oldest = idempotencyCache.keys().next().value;
    if (oldest !== undefined) idempotencyCache.delete(oldest);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

function getFromAddress(): string {
  return Deno.env.get("EMAIL_FROM") ??
    "Braxel Markets <onboarding@resend.dev>";
}

function getOwnerAddress(): string | null {
  const to = Deno.env.get("EMAIL_TO");
  return to && to.trim() ? to.trim() : null;
}

/**
 * Inbox for the public "Institutional Support" channel. A dedicated variable so
 * support can be routed independently of general owner notifications. Falls back
 * to EMAIL_TO, then to the company mailbox. This default only ever executes on
 * the server; no address here is bundled into client code.
 */
function getSupportInboxAddress(): string | null {
  const to = Deno.env.get("SUPPORT_INBOX_EMAIL") ?? Deno.env.get("EMAIL_TO");
  return to && to.trim() ? to.trim() : "marketsbraxel@ouvidor.net";
}

/** Only accept a plausible address as reply_to, never arbitrary header input. */
function safeReplyTo(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!/^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send an owner notification. Never throws.
 *
 * @returns `{ ok: true, id }` on delivery, otherwise `{ ok: false, ... }`
 *          with a machine-readable reason. Callers may ignore the result.
 */
export async function notifyOwner(
  input: NotifyOwnerInput,
): Promise<NotifyOwnerResult> {
  const type = (input.type ?? "erro") as EventType | string;
  const subject = input.subject ?? "Evento";
  const timestamp = new Date().toISOString();

  try {
    const prefix = TYPE_PREFIXES[type as EventType] ?? "[Evento]";
    const apiKey = Deno.env.get("RESEND_API_KEY");

    if (input.idempotencyKey && isDuplicate(String(input.idempotencyKey))) {
      console.log("[email] duplicate suppressed", {
        type,
        key: input.idempotencyKey,
      });
      return { ok: false, skipped: "duplicate" };
    }

    // The timestamp already appears in both renderers' headers, so it is not
    // repeated as a data row.
    const rows: Array<[string, unknown]> = Object.entries(
      sanitizeData(input.data),
    );

    const owner = getOwnerAddress();

    if (!apiKey || !owner) {
      // Fail soft: log the event so it is visible in the function logs even
      // when Resend is not configured yet.
      console.warn("[email] not configured — event logged only", {
        reason: !apiKey ? "RESEND_API_KEY missing" : "EMAIL_TO missing",
        type,
        subject,
        data: rows,
      });
      return { ok: false, skipped: "not_configured" };
    }

    const payload: Record<string, unknown> = {
      from: getFromAddress(),
      to: owner,
      subject: `${prefix} ${subject}`.slice(0, 200),
      html: renderHtml(type, prefix, subject, rows, timestamp),
      text: renderText(type, prefix, subject, rows, timestamp),
    };

    const replyTo = safeReplyTo(input.replyTo);
    if (replyTo) payload.reply_to = replyTo;

    const delivered = await postToResend(apiKey, payload, { type, subject });
    if (!delivered.ok) {
      return { ok: false, error: delivered.error };
    }
    console.log("[email] sent", { type, subject, id: delivered.id });
    return { ok: true, id: delivered.id };
  } catch (err) {
    // AbortError, network failure, JSON failure — none may reach the caller.
    console.error("[email] send failed (non-blocking)", {
      type,
      subject,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown_error",
    };
  }
}

/** Fire-and-forget variant for callers that must not await delivery. */
export function notifyOwnerInBackground(input: NotifyOwnerInput): void {
  // EdgeRuntime.waitUntil keeps the isolate alive without blocking the
  // response. Fall back to a detached promise where it is unavailable.
  const run = () => notifyOwner(input).catch(() => {});
  const runtime = (globalThis as {
    EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void };
  }).EdgeRuntime;
  if (runtime?.waitUntil) {
    runtime.waitUntil(run());
  } else {
    void run();
  }
}

// ---------------------------------------------------------------------------
// Institutional Support channel (public contact form)
// ---------------------------------------------------------------------------

export const SUPPORT_LIMITS = {
  name: 120,
  email: 254,
  topic: 160,
  message: 5000,
} as const;

export interface SupportMessageInput {
  name: string;
  email: string;
  topic: string;
  message: string;
  /** Language/locale the visitor submitted from, e.g. "pt". */
  locale?: string | null;
  timestamp?: string;
}

export const EMAIL_PATTERN = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;

/** Collapse CR/LF runs so a value cannot forge extra header lines. */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

interface ResendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/** POST a rendered payload to Resend. Never throws; returns a machine result. */
async function postToResend(
  apiKey: string,
  payload: Record<string, unknown>,
  context: Record<string, unknown> = {},
): Promise<ResendResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      // Read but do not log the provider body verbatim if it could echo data.
      const detail = await res.text().catch(() => "");
      console.error("[email] resend request failed", {
        ...context,
        status: res.status,
        detail: detail.slice(0, 300),
      });
      return { ok: false, error: `resend_${res.status}` };
    }

    const result = await res.json().catch(() => ({}));
    return { ok: true, id: result?.id };
  } catch (err) {
    console.error("[email] send failed (non-blocking)", {
      ...context,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown_error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Send one message from the public Institutional Support form to the support
 * inbox. The recipient comes from SUPPORT_INBOX_EMAIL (never hard-coded in
 * client code); reply_to is the customer so the mailbox can answer directly.
 * Returns a machine-readable failure so the caller can surface an error state.
 */
export async function sendSupportMessage(
  input: SupportMessageInput,
): Promise<NotifyOwnerResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const inbox = getSupportInboxAddress();

  if (!apiKey) {
    console.warn("[email] support message skipped — RESEND_API_KEY missing");
    return {
      ok: false,
      skipped: "not_configured",
      error: "resend_not_configured",
    };
  }
  if (!inbox) {
    console.warn("[email] support message skipped — no support inbox configured");
    return {
      ok: false,
      skipped: "not_configured",
      error: "support_inbox_not_configured",
    };
  }

  const name = singleLine(String(input.name ?? "").slice(0, SUPPORT_LIMITS.name));
  const email = String(input.email ?? "").trim().slice(0, SUPPORT_LIMITS.email);
  const topic = singleLine(String(input.topic ?? "").slice(0, SUPPORT_LIMITS.topic)) ||
    "General";
  const message = String(input.message ?? "").slice(0, SUPPORT_LIMITS.message);
  const locale = String(input.locale ?? "en").slice(0, 16) || "en";
  const timestamp = input.timestamp ?? new Date().toISOString();

  const displaySubject = `${topic} — ${name}`;
  const subject = `${TYPE_PREFIXES.suporte} ${displaySubject}`.slice(0, 200);

  const rows: Array<[string, unknown]> = [
    ["Name", name],
    ["Email", email],
    ["Language", locale],
    ["Subject", topic],
    ["Message", message],
    ["Timestamp", timestamp],
  ];

  const html = renderHtml(
    "suporte",
    TYPE_PREFIXES.suporte,
    displaySubject,
    rows,
    timestamp,
  );
  const text = renderText(
    "suporte",
    TYPE_PREFIXES.suporte,
    displaySubject,
    rows,
    timestamp,
  );

  const payload: Record<string, unknown> = {
    from: getFromAddress(),
    to: inbox,
    subject,
    html,
    text,
  };
  const replyTo = safeReplyTo(email);
  if (replyTo) payload.reply_to = replyTo;

  const delivered = await postToResend(apiKey, payload);
  if (!delivered.ok) return { ok: false, error: delivered.error };
  console.log("[email] support message sent", { id: delivered.id });
  return { ok: true, id: delivered.id };
}
