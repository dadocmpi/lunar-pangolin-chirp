# Stripe checkout verification runbook

This runbook covers the Stripe card/subscription checkout only. Wise and crypto
checkout are unchanged.

## 1. What the server trusts

The browser is never the source of truth for payment. A payment becomes
`confirmed` only when the `stripe-webhook` handler:

1. verifies the raw `Stripe-Signature` with `STRIPE_WEBHOOK_SECRET`;
2. finds the caller-owned `pending_payments` row by id;
3. fetches the Stripe object again with `STRIPE_SECRET_KEY`;
4. checks the canonical plan, amount in USD, Price ID, Customer identity and
   Subscription identity; and
5. writes both `status` and `status_enum` to a canonical value.

The `CheckoutSuccess` page only reads `payment-status` and only shows
"Payment completed" when that endpoint returns `confirmed`. A redirect to the
success URL is not proof of payment.

## 2. Canonical payment statuses

`created`, `pending`, `processing`, `confirmed`, `failed`, `rejected`,
`refunded`, `disputed`, `canceled`, `pending_manual`.

Stripe lifecycle strings (`past_due`, `unpaid`, `incomplete`,
`incomplete_expired`, `trialing`, `paused`) are **not** app statuses. They are
mapped as follows:

| Stripe subscription status | App status |
| --- | --- |
| `active` | `confirmed` |
| `past_due` | `failed` |
| `unpaid` | `failed` |
| `incomplete` | `failed` |
| `incomplete_expired` | `failed` |
| `trialing` | `pending` |
| `paused` | `pending` |
| `canceled` | `canceled` |
| unknown value | `failed` (fail closed) |

A failed renewal therefore never leaves the customer `confirmed`. If Stripe
later collects the payment, `invoice.paid` verifies the charge and moves the row
back to `confirmed`. A `customer.subscription.updated` with `active` alone does
not confirm a payment; without invoice evidence it stays `pending`.

## 3. Webhook events

| Event | Behaviour |
| --- | --- |
| `checkout.session.completed` | Verify the Checkout Session, then confirm the pending payment. |
| `invoice.paid` | Recovery path for a lost checkout event and renewals. Verify the invoice and its Subscription. |
| `invoice.payment_failed` | Map the subscription status (`failed` for `past_due`/`unpaid`), update the application, notify the owner. Never confirms. |
| `customer.subscription.updated` | Apply the canonical mapping. |
| `customer.subscription.deleted` | Apply `canceled`. |
| `charge.refunded` | Mark `refunded`; never activate. |
| `charge.dispute.created` | Mark `disputed`; never activate. |

Idempotency is stored in `pending_payments.metadata.processed_event_ids` and in
the unique `payment_audit_log` index on `(payment_table, payment_id, event_id)`.

## 4. Manual configuration required

Supabase Edge Function secrets:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`
- `STRIPE_PRICE_STARTER_USD`
- `STRIPE_PRICE_PROFESSIONAL_USD`
- `STRIPE_PRICE_BUSINESS_USD`
- `STRIPE_PRICE_ENTERPRISE_USD`

Stripe Dashboard:

- Enable the card payment method for the account.
- Add a webhook endpoint pointing at
  `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`.
- Subscribe it to the seven events in section 3.
- Keep the existing Price IDs. Do not create or rotate prices as part of a
  deploy.

Deployment:

- Deploy `stripe-webhook`, `stripe-checkout` and `stripe-reconcile`.
- `stripe-reconcile` has `verify_jwt = true` in `supabase/config.toml`.
- No database migration is required for this change.

## 5. Customer recovery path

If Stripe redirects the customer before the webhook arrives, the success page
shows "Payment received" and a **Check payment again** button. That button calls
`stripe-reconcile`, which:

- derives the user from the JWT;
- looks up only that user's pending payment;
- fetches the Checkout Session or latest Subscription invoice from Stripe;
- runs the same verification helper as the webhook; and
- returns `confirmed`, `unchanged`, `not_found` or a retryable error.

It never activates an account and never trusts a browser-supplied amount,
status or user id.

## 6. Provider and legal assumptions (not invented here)

- Braxel sells an operational management/software service. It is not the prop
  firm, does not custody customer funds and does not process prop-firm payouts
  in this phase.
- The customer's external prop-firm account rules apply. Payouts remain subject
  to the external provider's rules.
- Account connectivity depends on provider eligibility and authorization. Data
  may be delayed.
- Braxel does not guarantee profits.
- The existing "Managed Capital" product semantics are unchanged. This change
  adds no new claim about Tradeify, Tradovate, guaranteed returns, custody or
  payout processing.
- Tradovate remains read-only. No order placement, modification, liquidation,
  payout, withdrawal, ACH, wire or money-transfer operation is added.

## 7. Open items / blockers

1. **Signals plan has no Stripe product or Price ID.** The app has no canonical
   `signals` plan. Do not invent a Price ID. The owner must decide the product
   name, amount and billing interval, create the Stripe Price, and add it to
   the server plan table and env before a signals checkout can be enabled.
2. **Webhook endpoint must exist in Stripe.** Without it, payments stay pending.
   `stripe-reconcile` is a recovery path, not a replacement for the webhook.
3. **Refund/cancellation does not automatically deactivate a service.** That
   remains an owner/business decision and is unchanged by this work.
4. **Legal review is still required** for subscription terms, renewal wording,
   refund policy and the customer-facing checkout copy.
5. **No automatic dunning emails.** A failed renewal is visible in the app and
   the owner is notified, but the customer is not emailed by this code.
6. **Taxes, discounts and proration are not modelled.** Verification requires
   the paid amount to equal the canonical plan price exactly. If Stripe Tax,
   coupons, trials or mid-cycle proration are enabled later, the amount rule
   must be revisited before those invoices can confirm.
