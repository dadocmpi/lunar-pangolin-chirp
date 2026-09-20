# Stripe Test Mode — runtime readiness verification

Date: 2026-09-20
Project: `ymzdxifedtjwkxkzfwqu`
Scope of this report: **configuration verification only**. No payment, customer,
Checkout Session, webhook delivery, or account activation was performed, and no
secret value appears anywhere in this document.

## What was verified by live probes

All probes below are unauthenticated, read-only requests that fail closed
**before** any state-changing code runs.

### `stripe-webhook` — reachable without a Supabase JWT

`stripe-webhook` is the only function with `verify_jwt = false`
(`supabase/config.toml`). Confirmed live:

| Probe | Response |
| --- | --- |
| `POST /functions/v1/stripe-webhook` with **no** `Authorization` header | `400 {"error":"No stripe-signature header"}` |

The request reached the function's own logic instead of being rejected by the
platform gateway, proving `verify_jwt = false` is in effect.

### `stripe-webhook` — Stripe signature verification is still enabled

| Probe | Response |
| --- | --- |
| No `stripe-signature` header | `400 {"error":"No stripe-signature header"}` |
| `stripe-signature: garbage` | `400 {"error":"Invalid signature format"}` |
| `stripe-signature: t=1,v1=deadbeef…` | `400 {"error":"Timestamp outside tolerance"}` |

Every request is rejected at the signature-verification stage. Confirms
`STRIPE_WEBHOOK_SECRET` is now configured (the function previously returned
`503 Webhook secret not configured`) and that authenticity is enforced **inside**
the function via `constructEventAsync`, independent of JWT.

### `stripe-checkout` — `STRIPE_SECRET_KEY`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL` present

`stripe-checkout` validates configuration in this order:
secrets → success/cancel URLs → **user auth** → Stripe session creation.

| Probe | Response |
| --- | --- |
| No auth header | `401 {"code":"UNAUTHORIZED_NO_AUTH_HEADER"}` |
| Malformed JWT | `401 {"code":"UNAUTHORIZED_INVALID_JWT_FORMAT"}` |

A `401` rather than `503` proves the earlier config guards passed — i.e. all
three variables exist. Because authentication is checked **before** the Stripe
API call, neither probe created a Checkout Session or customer.

## Verified / not verified summary

| Item | Status | Evidence |
| --- | --- | --- |
| `STRIPE_WEBHOOK_SECRET` exists | Verified | `400` signature errors replaced the previous `503` |
| `STRIPE_CANCEL_URL` exists | Verified | checkout returns `401`, not `503 Stripe URLs not configured` |
| `STRIPE_SECRET_KEY` exists | Verified | checkout returns `401`, not `503 Stripe not configured` |
| `stripe-webhook` reachable without Supabase JWT | Verified | function logic runs with no `Authorization` header |
| `Stripe-Signature` verification enabled | Verified | bogus/missing/expired signatures all rejected `400` |
| `PAYMENTS_ENABLED = true` | **Not verifiable without the Supabase access token** | read only inside functions gated behind `verify_jwt` |
| `TEST_PAYMENT_MODE = true` | **Not verifiable without the Supabase access token** | read only inside functions gated behind `verify_jwt` |
| `STRIPE_SECRET_KEY` is Test Mode | **Not verifiable without the Supabase access token** | mode is a property of the key, not observable from HTTP probes |

The three unverified rows require either the Supabase access token (to read
secret **names** only) or an authenticated user session. Reading the flags from
`payment-status`, `crypto-checkout`, `wise-checkout`, or `test-confirm-payment`
is not possible anonymously: those functions keep the platform default
(`verify_jwt = true`), so the gateway returns `401` before the function body —
and therefore before the flag checks — runs.

## Readiness for one controlled Stripe Test Mode checkout

**Partially ready.**

Serving path is verified end to end up to the point of session creation:

- application submission → live DB insert works (`HTTP 200`, `application_id`);
- `stripe-webhook` is JWT-exempt and signature-verified;
- checkout configuration guards pass and the function stops at auth as intended.

To reach a fully verified "ready", two things remain:

1. Confirm `PAYMENTS_ENABLED = true` and `TEST_PAYMENT_MODE = true`, and confirm
   the `STRIPE_SECRET_KEY` is a `sk_test_…` key. This needs the Supabase access
   token, entered directly in the terminal.
2. After the first controlled Test Mode checkout, confirm the webhook receives
   the event and that activation still requires manual operator action.

## Safety confirmation

- No Checkout Session created
- No Stripe customer created
- No payment made
- No account activated
- No webhook event forged or delivered
- No secret value printed, logged, committed, or transmitted