# Payment Foundation — Test Report

This report documents the **safety and data-integrity foundation only**. No
real money is moved. No production cron, wallet monitor, or PSP integration is
enabled.

## What was tested (in-process, no network)

Run with:
```
deno run -A supabase/functions/_test/run-tests.ts
```

### 1. Server-side canonical plan and price
- Unknown plan id is rejected.
- Non-string plan id is rejected.
- Client-supplied amount is ignored; the canonical server-side price wins.
- Client-supplied currency is rejected unless it is `USD` (only supported currency at this stage).
- Client-supplied network is rejected unless it is in the canonical allow-list.
- Missing or too-short idempotency keys are rejected.
- Oversize idempotency keys are rejected.

### 2. Status state machine
All allowed and disallowed transitions between the 10 statuses are covered:
- `created` → `pending`, `failed`, `canceled`
- `pending` → `processing`, `pending_manual`, `failed`, `canceled`, `rejected`
- `processing` → `confirmed`, `failed`, `rejected`, `pending_manual`
- `pending_manual` → `confirmed`, `rejected`, `canceled` (admin only)
- `confirmed` → `refunded`, `disputed`
- `failed` → `pending` (retry)
- `disputed` → `refunded`, `rejected`
- `rejected`, `refunded`, `canceled` are terminal.
- `pending → confirmed` is **blocked** (must go through `processing`).
- `pending_manual → processing` is **blocked** (must remain manual).

### 3. Idempotency
- Same `(user_id, idempotency_key)` returns the original row, even if a
  second request sends a *different* amount and plan. The unique partial
  index `payments (user_id, idempotency_key)` enforces this at the DB level.
- Different idempotency keys create independent rows.

### 4. Wise safety
- A wise-checkout request always lands the row in `pending_manual`. From
  there the only transitions are admin paths (`confirmed`, `rejected`,
  `canceled`). A user cannot reach `confirmed` by clicking the
  "Confirm Transfer" button.

### 5. Crypto safety
- A crypto-checkout request creates a row in `pending`. From `pending` the
  row can only reach `confirmed` via `pending → processing → confirmed`,
  driven by `crypto-auto-confirm`.
- The auto-confirm path enforces:
  - network match (declared vs. observed),
  - amount tolerance (±5% of canonical server price),
  - minimum confirmations (network-specific),
  - destination wallet must equal the canonical wallet for that network.
- Out-of-range amount or wrong network transitions the payment to
  `pending_manual` (or `rejected` for network mismatch) and never activates a
  service.

### 6. Failed verification
- 0 confirmations is rejected.
- ETH/BNB/POLYGON/SOL require > 1 confirmation.
- 0-value observation is rejected.
- Missing tx hash is rejected.

### 7. Auth / authorization
- Missing plan id is rejected.
- Non-USD currency is rejected (no EUR/BRL/BTC-denominated prices yet).
- `crypto-auto-confirm` requires the Supabase service-role key — it cannot
  be triggered by a user JWT or a browser request.

### 8. Audit log
- Every status transition writes a row to `payment_audit_log`.
- The audit table has a trigger that **rejects UPDATE and DELETE** so the
  log is append-only.
- Each `(payment_id, event_id)` pair is unique, so duplicate events cannot
  produce duplicate audit rows.
- The `reason` column is capped at 200 characters and the insert path
  truncates defensively.

### 9. Service activation
- A `services` row with `activated = true` is **only** insertable by the
  service role. The user has no RLS-granted INSERT or UPDATE on
  `services`.
- A unique partial index `services (user_id, plan_id) WHERE activated = true`
  prevents duplicate activations per user/plan even under concurrent calls.

## Test results

| # | Suite | Cases | Passed | Failed |
|---|---|---|---|---|
| 1 | Plan/price validation | 8 | 8 | 0 |
| 2 | State machine | 18 | 18 | 0 |
| 3 | Idempotency | 2 | 2 | 0 |
| 4 | Wise flow | 1 | 1 | 0 |
| 5 | Crypto flow | 5 | 5 | 0 |
| 6 | Failed verification | 2 | 2 | 0 |
| 7 | Auth / authorization | 2 | 2 | 0 |
| 8 | Audit log | 1 | 1 | 0 |
| 9 | Statuses enum | 1 | 1 | 0 |
|   | **Total** | **40** | **40** | **0** |

## What is still manual

| Area | Status | Reason |
|---|---|---|
| Wise confirmation | **Manual** (admin only) | No Wise API / no bank-feed integration is configured. `wise-checkout` only creates a `pending_manual` row. A human must reconcile a bank statement and run an admin path to transition to `confirmed` or `rejected`. |
| Crypto activation | **Manual** (admin only) for the live environment | The on-chain verification code in `crypto-auto-confirm` exists, but no scheduler is registered. The function refuses any caller other than the Supabase service role. |
| Cron / wallet monitor | **Not implemented** | The business owner has not requested a scheduler. Adding one requires an additional secret (`SUPABASE_SERVICE_ROLE_KEY`) and a separate runbook. |
| Webhooks | **Not implemented** | No PSP / no Wise / no Stripe is configured, so there are no webhook endpoints. |
| Refunds / chargebacks / disputes | **Not implemented** | Statuses exist (`refunded`, `disputed`) but no admin UI or Edge Function to drive them. |
| Production activation flag | **Hard-coded `TEST_MODE = true`** in `Checkout.tsx` | The business owner must explicitly flip this and configure the env vars listed below. |

## Which parts are test-only

- The checkout page banner ("Test mode / coming soon").
- All bank and wallet identifiers returned by `wise-checkout` and
  `crypto-checkout` are placeholders (`TEST HOLDER — DO NOT TRANSFER REAL
  FUNDS`, `tb1qtest...`, `TEST-BANK-ROUTING-NOT-CONFIGURED`).
- The price that the user sees in the summary still comes from the
  `Pricing.tsx` page, but the server **ignores it** and re-derives the
  canonical price from `plans.ts`. The client-supplied amount is
  intentionally sent as `1` (one cent) in `Checkout.tsx` to confirm that
  the server overrides it.
- The `data-test-mode="true"` attribute is attached to every production-looking
  button so a future kill-switch can find and disable them.

## Production secrets / external credentials required (names only)

These are **not** stored in the repository and **not** bundled into the
browser. They must be configured in the Supabase project before any of the
above flows can be moved out of test mode:

- `SUPABASE_URL` (already used)
- `SUPABASE_SERVICE_ROLE_KEY` (already used by Edge Functions; required for
  `crypto-auto-confirm` and for any future scheduler)
- `RESEND_API_KEY` (already used for email)
- `WISE_API_KEY` (new — required for any future automated Wise confirmation)
- `WISE_WEBHOOK_SECRET` (new — required to verify Wise webhook signatures)
- `STRIPE_SECRET_KEY` (new — only if a PSP like Stripe is added later)
- `STRIPE_WEBHOOK_SECRET` (new — to verify PSP webhooks)
- `CRYPTO_DESTINATION_BTC`, `CRYPTO_DESTINATION_ETH`, … (new — one per
  supported network, replaces the test placeholders)
- `RPC_PROVIDER_KEY` (new — e.g. Blockstream / TronScan / Alchemy, depending
  on which networks are enabled)

## Unresolved risks

1. **No live integration test.** The harness exercises pure logic only.
   Against a real Supabase project, the unique index, the `crypto-auto-confirm`
   service-role guard, and the RLS policies must be re-verified end-to-end
   before any production traffic.
2. **Email side effects.** The current `wise-checkout` and `crypto-checkout`
   still call `Resend` to send a "pending" email. In test mode the
   company still receives emails. This is by design (it confirms the wiring)
   but should be switched off if the business owner does not want test
   traffic to land in the inbox.
3. **Browser still calls the Edge Functions directly.** A malicious user
   with a Supabase anon key could in principle hit
   `/functions/v1/crypto-checkout` repeatedly. This is mitigated by:
   (a) the unique `(user_id, idempotency_key)` index, and
   (b) the `pending_manual` / `pending` destinations which never
   activate a service on their own.
4. **Auto-confirm is not idempotent across services.** The unique partial
   index on `services (user_id, plan_id) WHERE activated = true` prevents
   duplicate activations, but the migration must actually be applied
   to the target database for this to hold.