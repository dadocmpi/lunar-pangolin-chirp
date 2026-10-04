# HOW TO ENABLE PAYMENTS

This is the operator runbook for the payments gate. It is the **only** place
you need to change to turn checkout on or off. Everything is controlled by one
documented pair of flags — no code change, no migration, no redeploy of Edge
Functions required to flip modes.

> Status out of the box: **payments are DISABLED**. `/checkout` and
> `/checkout/success` render the localized "Payments are currently disabled"
> notice, and every payment Edge Function fails closed with HTTP 503
> `payments_disabled`.

---

## 0. FIRST: the Edge Functions must actually be deployed

This is a separate deploy target from the frontend. **Vercel deploys the SPA;
it does not deploy Supabase Edge Functions.** Merging `supabase/functions/**`
to `main` changes nothing in production until the functions are deployed with
the Supabase CLI.

How to tell whether they are deployed: an unauthenticated `POST` to a function
that exists returns `401 Unauthorized`; a function that is **not deployed**
returns:

```json
{"code":"NOT_FOUND","message":"Requested function was not found"}
```

```bash
# Deploy every function in supabase/functions/ to the project
supabase functions deploy --project-ref ymzdxifedtjwkxkzfwqu
```

`.github/workflows/deploy-supabase-functions.yml` automates this on push to
`main`, but it needs two repository secrets (GitHub → Settings → Secrets and
variables → Actions):

- `SUPABASE_ACCESS_TOKEN` — a Supabase personal access token (`sbp_…`)
- `SUPABASE_PROJECT_ID` — `ymzdxifedtjwkxkzfwqu`

Until the functions are deployed, the frontend flag can be on and the UI will
still fail: the calls 404. Deploy the functions **before** expecting checkout
to work.

---

## 1. The single source of truth

The gate is ON when **either** flag is the exact string `"true"`:

| Mode | Frontend (build) | Server (Edge Function secrets) |
|------|------------------|-------------------------------|
| **TEST** | `VITE_TEST_PAYMENT_MODE=true` | `TEST_PAYMENT_MODE=true` |
| **LIVE** | `VITE_PAYMENTS_ENABLED=true` | `PAYMENTS_ENABLED=true` |
| **OFF** (default) | unset / not `"true"` | unset / not `"true"` |

Two small modules implement this rule and **must stay in sync** — `npm run
check:payments` fails the build if they drift:

- Frontend: `src/lib/paymentsFlag.ts` → `isPaymentsEnabled()`
- Server: `supabase/functions/_shared/payments-flag.ts` → `isPaymentsEnabled()`

The **server flag is the real security boundary.** Every payment Edge Function
re-checks it and returns `503 payments_disabled` before doing any work:

- `stripe-checkout`, `wise-checkout`, `crypto-checkout` (create a payment)
- `crypto-confirmation` (admin confirm)
- `payment-status` (reads a payment)

The frontend flag only decides which UI renders. Changing it without changing
the server flag (or vice versa) leaves one side disagreeing with the other, so
always change **both**.

---

## 2. Enable TEST mode (no real money)

### 2a. Vercel — frontend

1. Vercel Dashboard → project **`braxelmarkets`** → **Settings → Environment
   Variables**.
2. Add (or edit) for the **Production** environment:
   - `VITE_TEST_PAYMENT_MODE` = `true`
   - leave `VITE_PAYMENTS_ENABLED` unset (or `false`).
3. **Redeploy** — Vite inlines `VITE_*` at build time, so the change is not
   live until a new deployment builds. Push to `main` (or "Redeploy" in
   Vercel).

### 2b. Supabase — Edge Functions

1. Supabase Dashboard → project `ymzdxifedtjwkxkzfwqu` → **Edge Functions →
   Secrets** (a.k.a. Project Settings → Edge Functions).
2. Add (or edit):
   - `TEST_PAYMENT_MODE` = `true`
   - leave `PAYMENTS_ENABLED` unset (or `false`).
3. Secrets apply to the next invocation — no redeploy needed.

### 2c. Stripe test configuration (Supabase secrets)

Required for the **card** flow to leave `/checkout`:

- `STRIPE_SECRET_KEY` = `sk_test_…` (Stripe sandbox secret key)
- `STRIPE_WEBHOOK_SECRET` = `whsec_…` (from the Stripe test webhook endpoint)
- `STRIPE_PRICE_STARTER_USD`, `STRIPE_PRICE_PROFESSIONAL_USD`,
  `STRIPE_PRICE_BUSINESS_USD`, `STRIPE_PRICE_ENTERPRISE_USD` = `price_…` test price IDs
- `STRIPE_SUCCESS_URL` = `https://braxelmarkets.vercel.app/checkout/success`
- `STRIPE_CANCEL_URL` = `https://braxelmarkets.vercel.app/pricing`

Stripe Dashboard → **Developers → Webhooks** → add endpoint
`https://ymzdxifedtjwkxkzfwqu.supabase.co/functions/v1/stripe-webhook` and
subscribe at minimum to `checkout.session.completed` (plus `invoice.paid`,
`customer.subscription.updated`, `customer.subscription.deleted`,
`charge.refunded`, `charge.dispute.created` if you want the full lifecycle).

### 2d. Wise / crypto test configuration

In TEST mode the Wise and crypto flows return **test placeholders**
(`TEST HOLDER — DO NOT TRANSFER REAL FUNDS`, `tb1qtest…`) and never
auto-confirm, regardless of whether real destinations are configured. To
exercise the admin confirmation path set:

- `TEST_CONFIRM_SECRET` = a long random string (guards `test-confirm-payment`)
- `ADMIN_SECRET` = a long random string (guards `crypto-confirmation`)

Real bank details / deposit addresses are only used in LIVE mode (section 3).

---

## 3. Enable LIVE mode (real money)

Do this only after a successful TEST run. Change **both** sides in one go.

1. **Vercel** → Settings → Environment Variables (Production):
   - `VITE_PAYMENTS_ENABLED` = `true`
   - set `VITE_TEST_PAYMENT_MODE` = `false` (or remove it)
   - Redeploy.
2. **Supabase** → Edge Functions → Secrets:
   - `PAYMENTS_ENABLED` = `true`
   - set `TEST_PAYMENT_MODE` = `false` (or remove it)
3. **Stripe (live keys)** — replace the test secrets with live values:
   - `STRIPE_SECRET_KEY` = `sk_live_…`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_…` from the **live** webhook endpoint
   - the four `STRIPE_PRICE_*_USD` = live `price_…` IDs
   - `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL` as above
4. Stripe Dashboard (live mode) → Developers → Webhooks → the same
   `…/functions/v1/stripe-webhook` URL, live events.
5. **Wise bank account (Supabase secrets)** — required, or `wise-checkout`
   fails closed with `503 payment_destination_unconfigured`:
   - `WISE_HOLDER_NAME` = account holder name
   - `WISE_BANK_NAME` = bank name
   - `WISE_ACCOUNT_NUMBER` **or** `WISE_IBAN` = the account to receive funds
   - `WISE_ROUTING_NUMBER`, `WISE_SWIFT` = optional, for US/SWIFT rails
6. **Crypto deposit addresses (Supabase secrets)** — set one per network you
   accept. A network with no address fails closed with `503
   payment_destination_unconfigured`; it is never shown a placeholder address:
   - `CRYPTO_DESTINATION_BTC`, `CRYPTO_DESTINATION_TRC20`,
     `CRYPTO_DESTINATION_ETH`, `CRYPTO_DESTINATION_BNB`,
     `CRYPTO_DESTINATION_POLYGON`, `CRYPTO_DESTINATION_SOL`

> Rule of thumb: `sk_test_…` + `TEST_PAYMENT_MODE` go together, and
> `sk_live_…` + `PAYMENTS_ENABLED` go together. Never mix a live secret key
> with test mode or vice versa. In LIVE mode a missing Wise/crypto destination
> is a **hard 503**, never a silent fallback to the test placeholder.

---

## 4. Rollback — disable payments instantly

Fastest and safest order (server first so no new payment can be created even if
a stale frontend is still cached):

1. **Supabase** → Edge Functions → Secrets: delete `PAYMENTS_ENABLED` and
   `TEST_PAYMENT_MODE` (or set both to `false`). Takes effect on the next
   invocation — new checkout attempts immediately get `503 payments_disabled`.
2. **Vercel** → Environment Variables: delete `VITE_PAYMENTS_ENABLED` and
   `VITE_TEST_PAYMENT_MODE`, then redeploy. `/checkout` returns to the
   localized disabled notice.

Rollback is a configuration change only — no code, migration, or data edit.

---

## 5. What you must provide

Before TEST or LIVE can complete a payment, provide these (values only — do
**not** commit them):

| Needed | Where it goes | Notes |
|--------|---------------|-------|
| Stripe secret key (`sk_test_…` / `sk_live_…`) | Supabase secret `STRIPE_SECRET_KEY` | never in the browser |
| Stripe webhook signing secret (`whsec_…`) | Supabase secret `STRIPE_WEBHOOK_SECRET` | from the webhook endpoint you create |
| 4 Stripe price IDs (`price_…`) | Supabase secrets `STRIPE_PRICE_<PLAN>_USD` | one per plan, in **USD** |
| Stripe success/cancel URLs | `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL` | point at `/checkout/success` and `/pricing` |
| Admin secrets | `ADMIN_SECRET`, `TEST_CONFIRM_SECRET` | long random strings |
| Real Wise bank details | Supabase secrets `WISE_*` | LIVE only; missing ⇒ 503 |
| Real crypto deposit addresses | Supabase secrets `CRYPTO_DESTINATION_*` | LIVE only; missing ⇒ 503 |

Canonical plan prices (server source of truth, `supabase/functions/_shared/plans.ts`):
Starter **$200**, Professional **$350**, Business **$600**, Enterprise **$820**
per month, always charged in USD.

---

## 6. Verify after enabling

1. `POST` an Edge Function directly with no auth and both flags off →
   expect `503 {"error":"payments_disabled"}`.
2. In TEST mode, open `/checkout` with an application id → the yellow
   "TEST MODE" banner shows and the three methods are selectable:
   - **Card** → redirects to Stripe Checkout (test card `4242 4242 4242 4242`).
   - **Wise** → shows the test bank placeholder and a `pending_manual` payment.
   - **Crypto** → shows the placeholder wallet and a `pending` payment.
3. `/checkout/success?session_id=…` never says "completed" until the server
   confirms via the Stripe webhook.
4. `card-checkout` and `paypal-checkout` still return **HTTP 410**
   `endpoint_disabled`, in every mode. Enabling payments must **never**
   re-enable them.
5. `npm run check:payments` passes (it enforces the shared flag, the 410s, and
   client/server price parity).

---

## 7. Safety invariants (do not weaken)

- `card-checkout` and `paypal-checkout` remain **unconditionally disabled**
  (HTTP 410). They are not gated by the flag and must not be re-enabled.
- Card payments go only through `stripe-checkout` + the Stripe-verified
  webhook; the browser never declares a price.
- The server flag is authoritative; the client flag is presentation only.
- No secret is ever placed in a `.env` file, the repo, or the browser bundle.
