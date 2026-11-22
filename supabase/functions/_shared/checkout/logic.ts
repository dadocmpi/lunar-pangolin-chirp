// ============================================================================
// Checkout logic — pure, dependency-light helpers shared by the browser
// checkout page and the Deno test suite.
//
// Everything here is a pure function: no React, no I/O, no `Deno.env`, no
// `import.meta.env`. The server remains the source of truth for plan, price,
// currency, payment status and entitlement; this module only decides how the
// UI presents what the server already decided.
// ============================================================================

import { validateProfile, type ProfileErrorCode } from "../profile/validation.ts";

export type CheckoutMethodId = "card" | "crypto" | "bank";

export const CHECKOUT_METHOD_IDS: CheckoutMethodId[] = ["card", "crypto", "bank"];

export interface CheckoutMethodAvailability {
  available: boolean;
  /** Stable reason code, localized by the UI. Null when available. */
  reason: string | null;
}

export interface CheckoutCryptoNetwork {
  id: string;
  symbol: string;
  /** True when the server has a destination configured for this network. */
  configured: boolean;
}

export interface CheckoutConfig {
  testMode: boolean;
  currency: string;
  currencies: string[];
  methods: {
    card: CheckoutMethodAvailability;
    crypto: CheckoutMethodAvailability & { networks: CheckoutCryptoNetwork[] };
    bank: CheckoutMethodAvailability;
  };
}

export interface CheckoutCustomerFields {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  country: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  postalCode: string;
}

export type CheckoutFieldKey = keyof CheckoutCustomerFields;
export type CheckoutErrorCode = ProfileErrorCode | "invalid_email";
export type CheckoutErrors = Partial<Record<CheckoutFieldKey, CheckoutErrorCode>>;

export interface CheckoutValidation {
  ok: boolean;
  errors: CheckoutErrors;
  /** Server-shaped payload: full name plus the validated address fields. */
  fullName: string;
  value: CheckoutCustomerFields & { fullName: string };
}

export const EMPTY_CHECKOUT_CUSTOMER: CheckoutCustomerFields = {
  firstName: "",
  lastName: "",
  email: "",
  phoneCountryCode: "",
  phone: "",
  country: "",
  street: "",
  number: "",
  complement: "",
  city: "",
  state: "",
  postalCode: "",
};

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Join the split name into the canonical single `full_name` value. */
export function composeFullName(firstName: string, lastName: string): string {
  return `${firstName ?? ""} ${lastName ?? ""}`.replace(/\s+/g, " ").trim();
}

/** Split a stored `full_name` into first / last for the checkout form. */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const clean = (fullName ?? "").trim().replace(/\s+/g, " ");
  if (!clean) return { firstName: "", lastName: "" };
  const parts = clean.split(" ");
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

/**
 * Deliberately conservative email check. The server never trusts this value for
 * identity — it only travels to the payment provider as billing metadata.
 */
export function isValidEmail(email: string): boolean {
  const value = (email ?? "").trim();
  if (value.length < 5 || value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/**
 * Pre-fill the checkout form from the authenticated profile, then the stored
 * application, then the auth account. Pre-filled values are a convenience only:
 * the server re-validates everything and never uses them for entitlement.
 */
export function prefillCheckoutCustomer(args: {
  profile?: Record<string, unknown> | null;
  application?: Record<string, unknown> | null;
  authEmail?: string | null;
  authFullName?: string | null;
}): CheckoutCustomerFields {
  const profile = args.profile ?? {};
  const application = args.application ?? {};

  const profileFullName = str(profile.full_name);
  const split = splitFullName(
    profileFullName || str(application.full_name) || str(args.authFullName),
  );

  return {
    firstName: str(profile.first_name) || split.firstName,
    lastName: str(profile.last_name) || split.lastName,
    email: str(application.email) || str(args.authEmail),
    phoneCountryCode: str(profile.phone_country_code),
    phone: str(profile.phone) || str(application.phone),
    country: str(profile.country) || str(application.country),
    street: str(profile.street) || str(application.residential_address_line1),
    number: str(profile.number),
    complement: str(profile.complement) || str(application.residential_address_line2),
    city: str(profile.city) || str(application.city),
    state: str(profile.state) || str(application.region),
    postalCode: str(profile.postal_code) || str(application.postal_code),
  };
}

/**
 * Validate the checkout customer section with the SAME rule set the server
 * applies (`_shared/profile/validation.ts`). First/last name are required
 * individually; the combined value must also satisfy the shared name rules.
 */
export function validateCheckoutCustomer(fields: CheckoutCustomerFields): CheckoutValidation {
  const fullName = composeFullName(fields.firstName, fields.lastName);
  const base = validateProfile({
    fullName,
    phoneCountryCode: fields.phoneCountryCode,
    phone: fields.phone,
    country: fields.country,
    street: fields.street,
    number: fields.number,
    complement: fields.complement,
    city: fields.city,
    state: fields.state,
    postalCode: fields.postalCode,
  });

  const baseErrors = base.errors as Record<string, CheckoutErrorCode>;
  const errors: CheckoutErrors = {};
  for (const [key, code] of Object.entries(baseErrors)) {
    if (key === "fullName") continue;
    errors[key as CheckoutFieldKey] = code;
  }

  if (baseErrors.fullName) {
    if (!fields.firstName.trim()) errors.firstName = "required";
    if (!fields.lastName.trim()) errors.lastName = "required";
    if (fields.firstName.trim() && fields.lastName.trim()) {
      errors.firstName = baseErrors.fullName;
    }
  }

  if (!isValidEmail(fields.email)) errors.email = "invalid_email";

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    fullName: base.value.fullName,
    value: { ...fields, country: base.value.country, fullName: base.value.fullName },
  };
}

/** True when the method may be offered to the customer. */
export function resolveMethodAvailability(
  config: CheckoutConfig | null,
  method: CheckoutMethodId,
): CheckoutMethodAvailability {
  if (!config) return { available: true, reason: null };
  return config.methods[method];
}

/** Only networks the server reports as configured may be selected. */
export function configuredCryptoNetworks(config: CheckoutConfig | null): CheckoutCryptoNetwork[] {
  if (!config) return [];
  return config.methods.crypto.networks.filter((n) => n.configured);
}

/** First available method, in visual order, or null when none is available. */
export function defaultMethod(config: CheckoutConfig | null): CheckoutMethodId | null {
  for (const id of CHECKOUT_METHOD_IDS) {
    if (resolveMethodAvailability(config, id).available) return id;
  }
  return null;
}

export type CheckoutNoticeTone = "pending" | "success" | "error" | "warning";

export interface CheckoutStatusNotice {
  key: string;
  tone: CheckoutNoticeTone;
}

/**
 * Map a canonical server payment status to a localized notice. `canceled` and
 * Stripe's `incomplete_expired` are the only "expired" signals the server can
 * produce; we never invent an expiry on the client.
 */
export function paymentStatusNotice(
  status: string | null | undefined,
  method?: CheckoutMethodId | null,
): CheckoutStatusNotice | null {
  switch (status) {
    case "confirmed":
      return { key: "checkoutPage.notices.confirmed", tone: "success" };
    case "failed":
    case "rejected":
    case "past_due":
      return { key: "checkoutPage.notices.failed", tone: "error" };
    case "canceled":
    case "incomplete_expired":
      return { key: "checkoutPage.notices.expired", tone: "error" };
    case "pending_manual":
      return { key: "checkoutPage.notices.manualReview", tone: "warning" };
    case "pending":
    case "processing":
    case "created":
    case "incomplete":
    case "trialing":
    case "paused":
      return method === "card"
        ? { key: "checkoutPage.notices.webhookDelayed", tone: "pending" }
        : { key: "checkoutPage.notices.pending", tone: "pending" };
    default:
      return null;
  }
}

const ERROR_KEYS: Record<string, string> = {
  payment_destination_unconfigured: "providerUnavailable",
  feature_disabled: "providerUnavailable",
  payments_disabled: "providerUnavailable",
  provider_unavailable: "providerUnavailable",
  rate_limited: "rateLimited",
  duplicate_checkout: "duplicateCheckout",
  unauthorized: "sessionExpired",
  session_expired: "sessionExpired",
  invalid_currency: "unsupportedCurrency",
  invalid_network: "unsupportedMethod",
  invalid_plan_id: "unsupportedMethod",
  invalid_profile: "invalidAddress",
  invalid_request: "generic",
  card_not_configured: "unsupportedMethod",
  crypto_not_configured: "unsupportedMethod",
  bank_not_configured: "unsupportedMethod",
  http_404: "providerUnavailable",
  http_500: "providerUnavailable",
  http_502: "providerUnavailable",
  http_503: "providerUnavailable",
};

/**
 * Map a raw provider/server error code to a localized message key. The raw code
 * is never shown to the customer.
 */
export function checkoutErrorKey(code: unknown): string {
  const normalized = typeof code === "string" ? code.trim().toLowerCase() : "";
  const mapped = ERROR_KEYS[normalized] ?? "generic";
  return `checkoutPage.errors.${mapped}`;
}

/** Localized key for a method's unavailable reason. */
export function methodReasonKey(reason: string | null | undefined): string | null {
  if (!reason) return null;
  const known = new Set([
    "card_not_configured",
    "crypto_not_configured",
    "bank_not_configured",
  ]);
  return known.has(reason)
    ? `checkoutPage.methods.reasons.${reason}`
    : "checkoutPage.methods.reasons.providerUnavailable";
}

/** Billing payload sent to the payment Edge Functions (never card data). */
export interface CheckoutBillingPayload {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  country: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  postalCode: string;
}

/** Build the billing payload from the validated form. */
export function toBillingPayload(
  fields: CheckoutCustomerFields,
  fullName: string,
): CheckoutBillingPayload {
  return {
    firstName: fields.firstName.trim(),
    lastName: fields.lastName.trim(),
    fullName,
    email: fields.email.trim(),
    phoneCountryCode: fields.phoneCountryCode.trim(),
    phone: fields.phone.trim(),
    country: fields.country.trim().toUpperCase(),
    street: fields.street.trim(),
    number: fields.number.trim(),
    complement: fields.complement.trim(),
    city: fields.city.trim(),
    state: fields.state.trim(),
    postalCode: fields.postalCode.trim(),
  };
}
