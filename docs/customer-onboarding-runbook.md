# Customer onboarding & managed-account product flow — runbook

Status: implementation foundation (2026-11-22). No execution capability ships.

## 1. Business model (authoritative wording)

- Braxel sells an **operational management / software service** (signals,
  account monitoring and operational oversight).
- The customer obtains and uses an account at an **external prop-firm partner**
  (for example Tradeify). Braxel is **not** the prop firm.
- Braxel may provide monitoring, risk management, signals and operational
  management **only where the provider contract and applicable authorization
  permit it**.
- Braxel **does not custody customer funds** and **does not process prop-firm
  payouts** in this phase.

Do not publish stronger claims (guaranteed returns, custody, payout
processing, "we trade for you") without a signed provider/legal decision.

## 2. Customer flow

1. `/pricing` → select a Braxel package.
2. `/checkout` → existing Stripe / Wise / crypto architecture. The browser
   never declares the price.
3. `/checkout/success` → payment status; the page points to onboarding.
4. Dashboard → **Activate account** (`ActivateAccountView`):
   - reads the server-derived package and payment status from `account-link`;
   - shows the mandatory disclosures;
   - collects the external prop-firm account login (never a password), the
     prop-firm plan name, the purchase email, a receipt and notes;
   - requires four confirmations (ownership, responsibility, firm rules allow
     automation, risk read);
   - submits to `activation-submit`.
5. The request is `pending` → an operator moves it through `in_review` to
   `approved`, `rejected` or `info_requested`.
6. An approved link is `active`. The customer can disconnect it at any time.
   An operator can suspend, disconnect or reinstate it.

## 3. Lifecycle states

`pending | in_review | info_requested | approved | rejected | suspended | disconnected`

Allowed transitions (`supabase/functions/_shared/activation/status.ts`):

| From | To |
| --- | --- |
| pending | in_review, approved, rejected, info_requested |
| in_review | approved, rejected, info_requested |
| info_requested | in_review, approved, rejected |
| approved | suspended, disconnected |
| suspended | approved (reinstate), disconnected |
| rejected | — (terminal; a new request may be submitted) |
| disconnected | — (terminal; a new request may be submitted) |

A new submission is refused while the latest link is `pending`, `in_review`,
`approved` or `suspended`. Only `rejected` and `disconnected` can be replaced.

## 4. Server-side enforcement

- **Identity** is always the verified JWT (`requireUser`). No handler reads a
  `user_id` from the body or query.
- **Payment entitlement** is resolved server-side in
  `_shared/activation/entitlement.ts` from `pending_payments`, scoped to the JWT
  user. A payment is entitled only when its normalized status is `confirmed`
  (or the legacy `payment_confirmed`), the plan key is a known Braxel plan, and
  a test-mode payment is not used in live mode.
- The browser may send a `paymentId` only to disambiguate several checkouts.
  The plan key, plan name and payment status always come from the row.
- An unentitled user receives `402 { error: "payment_not_confirmed", reason }`.
- Refunded, canceled, failed and disputed payments are **not** entitled.
- `account-link` returns only the caller's rows. A foreign id answers `404`,
  exactly like a missing id.
- Customer disconnect is a scoped update (`id` **and** `user_id`) plus an audit
  event.
- No broker password, API key, CID or token is collected, stored, logged or
  returned.

## 5. Audit events

Append-only rows in `public.payment_audit_log` with
`payment_table = 'account_activations'` (`_shared/activation/audit.ts`):

- `checkout_completed`
- `onboarding_submitted`
- `in_review`
- `info_requested`
- `approved`
- `connected`
- `rejected`
- `suspended`
- `disconnected`
- `reinstated`

Only identifiers and statuses are recorded; no secret or credential is ever
written. An audit failure never rolls back the customer or operator decision.
`checkout_completed` is emitted when `activation-submit` verifies the confirmed
payment row; the payment webhooks are intentionally untouched.

## 6. Execution kill switch (future capability)

- `supabase/functions/_shared/features.ts` exposes
  `isExecutionCapabilityEnabled(env)`.
- The Edge secret `EXECUTION_CAPABILITY_ENABLED` must be the **exact** string
  `"true"` to enable. Unset, empty, `"false"` or `"TRUE"` all keep it disabled.
- `EXECUTION_CAPABILITY_IMPLEMENTED` is a hard-coded `false`. Even if the flag
  is enabled, no execution code exists.
- **No order placement, order modification, liquidation, payout, withdrawal,
  ACH, wire or money-transfer operation exists in this phase.** Do not add one
  without an officially approved provider execution contract and a legal
  review.

## 7. Manual configuration

No new secrets are required for this phase.

| Setting | Where | Default | Meaning |
| --- | --- | --- | --- |
| `ACTIVATION_FLOW_ENABLED` | Edge secret | on | `"false"` hides the onboarding cards/views and returns `503 feature_disabled`. |
| `EXECUTION_CAPABILITY_ENABLED` | Edge secret | off | `"true"` is the only enabling value; there is still no implementation. |
| `AFFILIATE_TRADEIFY_URL` / `AFFILIATE_LUCID_URL` | Edge secret | unset | A firm without a URL is dropped everywhere. |
| `SIGNALS_PLAN_NAME` / `SIGNALS_PLAN_PRICE_CENTS` / `SIGNALS_PLAN_CURRENCY` | Edge secret | unset | Public package label/price. |

Deploy order: apply `20261122000000_account_link_lifecycle.sql`, then deploy
the `activation-submit`, `activation-review` and `account-link` Edge Functions.

## 8. Provider / legal assumptions (unresolved — do not invent copy)

These require an owner + lawyer + provider decision before launch:

1. **Tradeify / Lucid authorization** for monitoring, signals and operational
   management of a customer's external account. The current affiliate
   relationship is not, by itself, evidence of that authorization.
2. **Execution**: whether any third-party execution tool may act on signals in
   a prop-firm account, and under which provider rules. Execution remains
   disabled.
3. **Payouts**: whether Braxel may ever discuss, facilitate or process a
   prop-firm payout. This phase says no.
4. **Data protection**: the lawful basis for storing the external account
   login, purchase email and receipt, and the retention period.
5. **Disclosure wording**: the six customer disclosures and the four
   confirmations are product copy, not approved legal text. They are marked as
   drafts in the runbook and must be reviewed.
6. **Managed Capital semantics**: unchanged in this phase. Do not attach new
   claims to it.

## 9. Unresolved blockers

- No account suspension mechanism exists at the Auth level; suspension here
  means the **account link** is suspended, not the Braxel user.
- Automatic service deactivation after a refund/cancellation is not
  implemented. A refunded customer cannot create a new link (entitlement
  fails), but an already-approved link is not auto-suspended.
- Monthly billing wiring reuses the existing checkout but the renewal timing is
  undecided.
- Deno is not installed in the default image; run `make test-onboarding` in an
  environment with Deno.
- Docker is required for the RLS and migration apply-order tests.

## 10. Verification

```
npx tsc --noEmit -p tsconfig.app.json
npm run lint
npm run build
npm run check:i18n
npm run check:payments
npm run check:profile
npm run check:activation
npm run check:dashboard
npm run check:tradovate
npm run check:auth
npm run check:security
npm run bundle:functions
make test-onboarding          # Deno
```

Headless flow: `node scripts/screenshot-activation-flow.mjs` (needs a served
build and `/usr/bin/chromium`).
