// ============================================================================
// Minimal read-only Stripe API client for webhook verification/reconciliation.
// The secret key is used only server-side and is never logged or returned.
// ============================================================================

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const STRIPE_API_VERSION = "2020-08-27";

export interface StripeApiSuccess<T> {
  ok: true;
  data: T;
}

export interface StripeApiFailure {
  ok: false;
  status: number;
  error: string;
}

export type StripeApiResult<T> = StripeApiSuccess<T> | StripeApiFailure;

export async function stripeGet<T>(
  path: string,
  secretKey: string,
): Promise<StripeApiResult<T>> {
  try {
    const response = await fetch(`${STRIPE_API_BASE}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Stripe-Version": STRIPE_API_VERSION,
      },
    });

    if (!response.ok) {
      // Never log the response body: Stripe errors can echo request data.
      await response.text().catch(() => "");
      return {
        ok: false,
        status: response.status,
        error: `stripe_http_${response.status}`,
      };
    }

    return { ok: true, data: await response.json() as T };
  } catch {
    return { ok: false, status: 0, error: "stripe_unreachable" };
  }
}

export function fetchCheckoutSession<T>(id: string, secretKey: string) {
  return stripeGet<T>(
    `/checkout/sessions/${encodeURIComponent(id)}?expand[]=line_items.data.price`,
    secretKey,
  );
}

export function fetchSubscription<T>(id: string, secretKey: string) {
  return stripeGet<T>(
    `/subscriptions/${encodeURIComponent(id)}?expand[]=items.data.price`,
    secretKey,
  );
}

export function fetchCustomer<T>(id: string, secretKey: string) {
  return stripeGet<T>(`/customers/${encodeURIComponent(id)}`, secretKey);
}

export function fetchInvoice<T>(id: string, secretKey: string) {
  return stripeGet<T>(
    `/invoices/${encodeURIComponent(id)}?expand[]=lines.data.price`,
    secretKey,
  );
}

export function fetchLatestInvoiceForSubscription<T>(
  subscriptionId: string,
  secretKey: string,
) {
  return stripeGet<{ data?: T[] }>(
    `/invoices?subscription=${
      encodeURIComponent(subscriptionId)
    }&limit=1&expand[]=lines.data.price`,
    secretKey,
  );
}
