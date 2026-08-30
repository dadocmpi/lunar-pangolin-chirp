# Payment Foundation — Option A — Test Report

## STATUS: NOT EXECUTED

This report documents the Option A payment foundation. **All tests below are NOT EXECUTED** until the harness is run:

```bash
deno run -A supabase/functions/_test/run-tests-option-a.ts
```

The number of assertions in the harness (48) is not a measurement of test runs. The 42/0 figure from prior turns is retracted.

---

## Test suite summary

| # | Suite | Cases | Status |
|---|---|---|---|
| 1 | Canonical plan and price validation | 8 | NOT EXECUTED |
| 2 | Status state machine (corrected: `failed` is retryable, not terminal) | 18 | NOT EXECUTED |
| 3 | Idempotency on `(user_id, idempotency_key)` | 2 | NOT EXECUTED |
| 4 | Wise flow safety (always `pending_manual` until admin) | 1 | NOT EXECUTED |
| 5 | Crypto flow safety (no confirmed without going through `processing`) | 5 | NOT EXECUTED |
| 6 | Failed verification path | 2 | NOT EXECUTED |
| 7 | Auth and authorization (fail-closed on missing secrets) | 2 | NOT EXECUTED |
| 8 | Audit log append-only invariants | 3 | NOT EXECUTED |
| 9 | Plan and status enums completeness | 2 | NOT EXECUTED |
| 10 | Currency and network helpers | 4 | NOT EXECUTED |
| **Total** | | **48** | **NOT EXECUTED** |

---

## What was tested (pre-write prediction)

### 1. Canonical plan and price validation

- Unknown plan id is rejected with `invalid_plan_id`.
- Non-string plan id is rejected.
- Client-supplied amount is ignored; canonical server-side price wins.
- Client-supplied currency is rejected unless it is `USD`.
- Client-supplied network is rejected unless it is in the allow-list.
- Missing idempotency key (too short) is rejected.
- Oversize idempotency key (>200 chars) is rejected.

### 2. Status state machine

All allowed and disallowed transitions between the 10 statuses:

| From | To | Expected |
|---|---|---|
| `created` | `pending` | ALLOWED |
| `created` | `pending_manual` | BLOCKED |
| `created` | `confirmed` | BLOCKED |
| `pending` | `processing` | ALLOWED |
| `pending` | `pending_manual` | ALLOWED |
| `pending` | `confirmed` | BLOCKED (must go through `processing`) |
| `pending` | `failed` | ALLOWED |
| `pending` | `rejected` | ALLOWED |
| `processing` | `confirmed` | ALLOWED |
| `pending_manual` | `processing` | BLOCKED (manual cannot auto-progress) |
| `pending_manual` | `pending` | BLOCKED (manual cannot revert) |
| `pending_manual` | `confirmed` | ALLOWED (admin path) |
| `confirmed` | `refunded` | ALLOWED |
| `confirmed` | `disputed` | ALLOWED |
| `disputed` | `refunded` | ALLOWED |
| `disputed` | `rejected` | ALLOWED |
| `failed` | `pending` | ALLOWED (retry path) |
| `rejected` | (anything) | BLOCKED (terminal) |
| `canceled` | (anything) | BLOCKED (terminal) |

**Key correction from prior turns:** `failed` is NOT terminal. It can retry to `pending`. This is reflected in the corrected state machine.

### 3. Idempotency

- Duplicate `(user_id, idempotency_key)` returns the original row, not a new one. The canonical amount and plan are preserved.
- Different idempotency keys create independent rows.

### 4. Wise safety

- wise-checkout creates the row with `status_enum = 'pending_manual'`.
- No UI click, checkbox, or user action can transition to `confirmed`.
- Only an admin path (authorized by `ADMIN_SECRET`) can confirm a Wise payment.
- The unique partial index on `services` requires `activated = true`; this is never set by the UI.

### 5. Crypto flow safety

- `pending → confirmed` is blocked.
- The only confirmed path is `pending → processing → confirmed`.
- Amount tolerance ±5% is enforced.
- Network mismatch is rejected.
- Test placeholder wallet is not a real address.

### 6. Failed verification

- 0 confirmations is below minimum for every network.
- ETH/BNB/POLYGON/SOL require >1 confirmation.

### 7. Auth and authorization

- Missing planId throws `Error`.
- Non-USD currency is rejected.

### 8. Audit log invariants

- `created → pending` is a valid audit event.
- `confirmed → refunded` is a valid audit event.
- Terminal statuses have no outbound transitions.

### 9. Plan and status enums

- All 4 plan IDs are present.
- All 10 statuses are present.
- `PLAN_IDS` has exactly 4 entries.

### 10. Currency and network helpers

- `USD` is supported.
- `EUR` is not supported.
- `BTC` is a valid network with 1 confirmation.
- Invalid network throws `Error`.

---

## Production gate status

| Gate | Default | Required to enable |
|---|---|---|
| `PAYMENTS_ENABLED` | missing → test mode | Set to `"true"` in Supabase Edge Function Secrets |
| `VITE_PAYMENTS_ENABLED` | missing → disabled notice | Set to `"true"` in frontend build env |
| `ADMIN_SECRET` | missing → HTTP 500 | Set in Supabase Edge Function Secrets |
| `KYC_ACTION_SECRET` | missing → HTTP 500 | Set in Supabase Edge Function Secrets |
| `EXCHANGERATE_API_KEY` | missing → stub rates | Set in Supabase Edge Function Secrets (optional) |
| `RESEND_API_KEY` | missing → logged, not sent | Set in Supabase Edge Function Secrets (for email) |
| Cron / scheduler | not registered | Separate action required |
| Wallet monitor | not implemented | Separate action required |
| Wise API | not integrated | Separate action required |

## What is still manual

| Area | Status | Required action |
|---|---|---|
| Apply migration | NOT EXECUTED | Run in Supabase SQL editor after pre-checks pass |
| `PAYMENTS_ENABLED` | not set | Set to `"true"` in Supabase Edge Function Secrets |
| `VITE_PAYMENTS_ENABLED` | not set | Set to `"true"` in frontend build env |
| `ADMIN_SECRET` | not set | Set in Supabase Edge Function Secrets |
| `KYC_ACTION_SECRET` | not set | Set in Supabase Edge Function Secrets |
| `EXCHANGERATE_API_KEY` | not set | Set in Supabase Edge Function Secrets (optional) |
| `RESEND_API_KEY` | not set | Set in Supabase Edge Function Secrets (for email) |
| Cron / wallet monitor | not registered | Separate action required |
| Webhook | not registered | Separate action required |
| Refunds / disputes | not implemented | Separate action required |
| Live Wise integration | not implemented | Separate action required |

## Test execution record

| Date | Session | Passed | Failed | Notes |
|---|---|---|---|---|
| — | NOT EXECUTED | — | — | Awaiting first run |