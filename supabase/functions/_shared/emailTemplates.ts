// ============================================================================
// Braxel Markets — customer transactional email templates.
//
// Pure, dependency-free builders. They produce the copy only; delivery goes
// through `_shared/userEmail.ts` (the single customer-email module) and the
// owner notifications through `_shared/email.ts`.
//
// Security contract:
//   * No password, one-time code, card number, API key, provider token,
//     crypto private key or provider secret is ever placed in a template.
//   * Every interpolated value is escaped by the renderer, and the renderer
//     redacts secret-like values defensively.
//   * The activation email is only ever built after a server-side verified
//     payment; nothing here decides entitlement.
//
// The subject of the activation email is fixed by product requirement:
//   "Your Braxel Markets account is now active"
// ============================================================================

export interface TransactionalEmail {
  /** Stable key used for logging and the provider idempotency header. */
  templateKey: string;
  subject: string;
  heading: string;
  body: string;
  details: Array<[string, string]>;
  bullets?: string[];
  cta?: { label: string; url: string };
  footnote?: string;
}

export interface EmailContext {
  firstName: string;
  planName: string;
  /** Pre-formatted amount, e.g. "USD 350.00". */
  amountFormatted: string;
  /** card | crypto | bank | stripe | wise. */
  method: string;
  reference: string;
  accountId?: string | null;
  /** ISO timestamp of the activation. */
  activationDate?: string | null;
  status?: string | null;
  note?: string | null;
  dashboardUrl: string;
  supportEmail: string;
}

export const ACTIVATION_SUBJECT = "Your Braxel Markets account is now active";

const SECURITY_NOTICE =
  "Braxel Markets will never ask for your account credentials, one-time codes, " +
  "or payment details by email. If you receive such a request, do not reply and " +
  "contact support using the address below.";

const NEXT_STEPS = [
  "Sign in to your dashboard and review your plan and account status.",
  "Connect your external provider account from the dashboard when you are ready.",
  "Provider eligibility is confirmed by the provider. Until it is confirmed, the connection is shown as pending provider eligibility.",
];

/** ISO timestamp -> "2026-11-22" (UTC). Invalid/empty -> em dash. */
export function formatIsoDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
}

/** Human label for a payment method. Unknown methods are title-cased. */
export function methodLabel(method: string | null | undefined): string {
  const value = (method ?? "").toLowerCase();
  if (value === "stripe" || value === "card") return "Card";
  if (value === "crypto") return "Crypto";
  if (value === "wise" || value === "bank") return "Bank transfer";
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function firstNameOr(value: string | null | undefined): string {
  const clean = (value ?? "").trim();
  return clean || "there";
}

function baseDetails(ctx: EmailContext): Array<[string, string]> {
  return [
    ["Plan", ctx.planName],
    ["Amount", ctx.amountFormatted],
    ["Payment method", methodLabel(ctx.method)],
    ["Payment reference", ctx.reference],
  ];
}

function withNote(
  details: Array<[string, string]>,
  note: string | null | undefined,
): Array<[string, string]> {
  const clean = (note ?? "").trim();
  return clean ? [...details, ["Note from our team", clean]] : details;
}

export function buildAccountActivatedEmail(ctx: EmailContext): TransactionalEmail {
  const details: Array<[string, string]> = [
    ["Account ID", ctx.accountId ?? "—"],
    ["Plan", ctx.planName],
    ["Account status", "Active"],
    ["Activation date", formatIsoDate(ctx.activationDate)],
    ["Payment reference", ctx.reference],
    ["Support", ctx.supportEmail],
  ];
  return {
    templateKey: "account_activated",
    subject: ACTIVATION_SUBJECT,
    heading: "Your Braxel Markets account is now active",
    body:
      `Hi ${firstNameOr(ctx.firstName)}, your payment has been verified and your ` +
      `Braxel Markets account is now active. Your ${ctx.planName} plan is ready to use.`,
    details,
    bullets: NEXT_STEPS,
    cta: { label: "Open your dashboard", url: ctx.dashboardUrl },
    footnote: SECURITY_NOTICE,
  };
}

export function buildPaymentReceivedEmail(ctx: EmailContext): TransactionalEmail {
  return {
    templateKey: "payment_received",
    subject: "Payment received — Braxel Markets",
    heading: "We received your payment",
    body:
      `Hi ${firstNameOr(ctx.firstName)}, we received your payment for the ` +
      `${ctx.planName} plan and our team is verifying it. You will receive a ` +
      `separate email as soon as your account is active.`,
    details: withNote(baseDetails(ctx), ctx.note),
    cta: { label: "View your dashboard", url: ctx.dashboardUrl },
    footnote: SECURITY_NOTICE,
  };
}

export function buildPaymentPendingEmail(ctx: EmailContext): TransactionalEmail {
  return {
    templateKey: "payment_pending_manual_review",
    subject: "Payment pending review — Braxel Markets",
    heading: "Your payment is pending review",
    body:
      `Hi ${firstNameOr(ctx.firstName)}, your payment for the ${ctx.planName} ` +
      `plan is waiting for a manual review. You do not need to send the payment ` +
      `again. We will email you as soon as the review is complete.`,
    details: withNote(baseDetails(ctx), ctx.note),
    cta: { label: "View your dashboard", url: ctx.dashboardUrl },
    footnote: SECURITY_NOTICE,
  };
}

export function buildPaymentFailedEmail(ctx: EmailContext): TransactionalEmail {
  return {
    templateKey: "payment_failed",
    subject: "Payment failed — Braxel Markets",
    heading: "Your payment could not be completed",
    body:
      `Hi ${firstNameOr(ctx.firstName)}, your payment for the ${ctx.planName} ` +
      `plan could not be completed. No access was granted. You can start a new ` +
      `checkout from your dashboard with the same or a different payment method.`,
    details: withNote(baseDetails(ctx), ctx.note),
    cta: { label: "Return to checkout", url: ctx.dashboardUrl },
    footnote: SECURITY_NOTICE,
  };
}

export function buildAccountSuspendedEmail(ctx: EmailContext): TransactionalEmail {
  const details: Array<[string, string]> = [
    ["Account ID", ctx.accountId ?? "—"],
    ["Plan", ctx.planName],
    ["Account status", "Suspended"],
    ["Support", ctx.supportEmail],
  ];
  return {
    templateKey: "account_suspended",
    subject: "Your Braxel Markets account has been suspended",
    heading: "Your account has been suspended",
    body:
      `Hi ${firstNameOr(ctx.firstName)}, access to your ${ctx.planName} plan has ` +
      `been suspended. If you believe this is a mistake, contact support using ` +
      `the address below.`,
    details: withNote(details, ctx.note),
    footnote: SECURITY_NOTICE,
  };
}

export function buildPaymentRefundedEmail(ctx: EmailContext): TransactionalEmail {
  return {
    templateKey: "payment_refunded",
    subject: "Payment refunded — Braxel Markets",
    heading: "Your payment was refunded",
    body:
      `Hi ${firstNameOr(ctx.firstName)}, the payment for the ${ctx.planName} ` +
      `plan was refunded. Access tied to that payment is no longer active. ` +
      `Refunds are handled by the payment provider and may take a few business ` +
      `days to appear.`,
    details: withNote(baseDetails(ctx), ctx.note),
    footnote: SECURITY_NOTICE,
  };
}

export function buildPaymentDisputedEmail(ctx: EmailContext): TransactionalEmail {
  return {
    templateKey: "payment_disputed",
    subject: "Payment dispute opened — Braxel Markets",
    heading: "A dispute was opened on your payment",
    body:
      `Hi ${firstNameOr(ctx.firstName)}, a dispute was opened for the payment on ` +
      `the ${ctx.planName} plan. Access tied to that payment is under review. ` +
      `Our team will contact you if we need anything from you.`,
    details: withNote(baseDetails(ctx), ctx.note),
    cta: { label: "Contact support", url: `mailto:${ctx.supportEmail}` },
    footnote: SECURITY_NOTICE,
  };
}

export const TRANSACTIONAL_TEMPLATE_KEYS = [
  "payment_received",
  "payment_pending_manual_review",
  "payment_failed",
  "account_activated",
  "account_suspended",
  "payment_refunded",
  "payment_disputed",
] as const;

export type TransactionalTemplateKey =
  (typeof TRANSACTIONAL_TEMPLATE_KEYS)[number];
