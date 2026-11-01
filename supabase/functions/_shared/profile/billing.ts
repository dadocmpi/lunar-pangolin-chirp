// ============================================================================
// Billing details for checkout.
//
// The browser sends the customer's billing data (pre-filled from their profile,
// editable for the purchase). The server NEVER trusts it: every field is
// trimmed, capped and stripped of control characters before it is passed to
// Stripe. NO card data is ever part of this payload — the card stays entirely
// with Stripe.
// ============================================================================

export interface BillingInput {
  fullName?: unknown;
  email?: unknown;
  phoneCountryCode?: unknown;
  phone?: unknown;
  country?: unknown;
  street?: unknown;
  number?: unknown;
  complement?: unknown;
  city?: unknown;
  state?: unknown;
  postalCode?: unknown;
}

export interface SanitizedBilling {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/** Drop ASCII control characters before a value reaches Stripe. */
function stripControlChars(value: string): string {
  let out = "";
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) continue;
    out += ch;
  }
  return out;
}

function clean(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return stripControlChars(value).trim().slice(0, maxLength);
}

/**
 * Normalise the billing payload into the flat shape used for Stripe
 * (customer name/phone + billing_details.address). Missing values become empty
 * strings, which the caller treats as "not provided".
 */
export function sanitizeBilling(input: BillingInput | null | undefined): SanitizedBilling {
  const src = input ?? {};
  const line1 = [clean(src.street, 200), clean(src.number, 20)]
    .filter(Boolean)
    .join(", ");
  return {
    name: clean(src.fullName, 120),
    email: clean(src.email, 254),
    phone: [clean(src.phoneCountryCode, 8), clean(src.phone, 20)]
      .filter(Boolean)
      .join(" "),
    line1,
    line2: clean(src.complement, 200),
    city: clean(src.city, 120),
    state: clean(src.state, 120),
    postalCode: clean(src.postalCode, 12),
    country: clean(src.country, 2).toUpperCase(),
  };
}
