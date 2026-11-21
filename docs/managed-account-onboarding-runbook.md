# Managed-account onboarding — operator and engineering runbook

Status: **foundation phase**. Customer onboarding, manual account-link review
and status display are implemented. **No execution capability exists.** Braxel
does not place, modify or liquidate orders, does not custody funds and does not
process prop-firm payouts in this phase.

## 1. What the customer does

1. Selects a Braxel package on `/pricing` and pays through the existing
   checkout (`stripe-checkout`, `wise-checkout` or `crypto-checkout`).
2. Lands on `/checkout/success`, then continues to `/onboarding`
   (also available as the dashboard view "Account onboarding").
3. Reads the onboarding instructions and the disclosures, enters the **account
   login/ID** they use at the external prop firm, and submits the link request.
4. Sees `pending`, `in_review`, `approved`, `rejected`, `suspended` or
   `disconnected`. An approved link can be disconnected by the customer.

The customer never enters a broker password, provider token, CID or secret.
There is no field for one in the form, the request payload or the database.

## 2. What the operator does

`/operator/account-links` lists link requests (open by default) and offers
`start_review`, `approve`, `reject`, `suspend` and `disconnect`.

- `approve` re-checks the customer's payment entitlement server-side. A
  refunded, canceled, disputed, failed or rejected payment cannot be approved.
- `reject` and `suspend` require a note; the note is shown to the customer.
- An illegal transition is refused with `409 invalid_transition`.
- Every action writes an append-only row to `payment_audit_log`.

## 3. Runtime switches (Supabase Edge Function secrets)

| Secret | Default | Effect |
| --- | --- | --- |
| `ONBOARDING_FLOW_ENABLED` | ON | Only the exact string `false` disables the flow. `onboarding-config`/`onboarding-status` hide it and the three mutations answer `503 feature_disabled`. |
| `EXECUTION_ENABLED` | **OFF** | Only the exact string `true` enables the future execution capability. **Do not set it in this phase.** |
| `AFFILIATE_TRADEIFY_URL` / `AFFILIATE_LUCID_URL` | unset | A firm with no configured URL is dropped from the config and the server rejects a submission for it (`firm_not_configured`). |

There is no client-side equivalent for either flag. The server is the boundary.

## 4. Data model

`public.account_links` (migration `20261122000000_managed_account_onboarding.sql`):

- `user_id` → `auth.users(id)`, `firm`, `plan_id` (derived from the confirmed
  payment), `account_login`, bounded `note`.
- `status` in `pending | in_review | approved | rejected | suspended |
  disconnected`.
- The seven disclosure acknowledgements plus `disclosures_version` are stored
  as consent evidence.
- Timestamps: `submitted_at`, `reviewed_at`, `connected_at`, `suspended_at`,
  `disconnected_at`.
- A partial unique index allows **one open link per customer**
  (`pending`, `in_review`, `approved`, `suspended`). A second line of defence
  behind the Edge Function's duplicate check.
- RLS: owner `SELECT` only; operator `SELECT` all when
  `app_metadata.operator` is a **strict JSON boolean** `true`; explicit deny
  for client `INSERT`/`UPDATE`/`DELETE`. Writes go through the JWT-verified
  Edge Functions.

`payment_audit_log.payment_table` now also accepts `account_links`.

Audit events written by this flow:

- `onboarding:checkout_verified:<payment_id>` — checkout completion observed by
  the onboarding surface (idempotent per payment).
- `account_link_submitted`
- `account_link_review_started`
- `account_link_connected` / `account_link_reconnected`
- `account_link_rejected`
- `account_link_suspended`
- `account_link_disconnected`

## 5. Edge Functions

| Function | Auth | Purpose |
| --- | --- | --- |
| `onboarding-config` | public (`verify_jwt=false`) | Public flag, firm list, canonical plan catalog, disclosure version. No secrets. |
| `onboarding-status` | JWT | Server-derived entitlement + latest link with its **effective** status. |
| `account-link-submit` | JWT | Validates firm/payload, derives the plan from the confirmed payment, enforces one open link, audits, notifies the owner. |
| `account-link-review` | JWT + operator | Shared state machine, payment re-check on approve, audit, customer email. |
| `account-link-disconnect` | JWT | Customer closes their own link (scoped by id **and** JWT user id). |

Every mutation derives identity from the JWT, bounds its JSON body
(`readJsonBody`), is rate limited, and never reads a user id, plan id, payment
status or activation status from the browser.

## 6. Payment entitlement

`_shared/onboarding/entitlement.ts` resolves the state from the customer's own
`pending_payments` rows (most recent decided row wins) with a `services`
fallback for legacy activated customers.

- `confirmed` / `payment_confirmed` → `active`.
- `refunded`, `canceled`, `disputed`, `failed`, `rejected` → inactive; a later
  row overrides an earlier one in either direction.
- No decided row → `pending` (rows exist) or `none` (no rows).
- An approved link whose governing payment is no longer active is **displayed
  as `suspended`** (`deriveEffectiveLinkStatus`). The stored status is not
  mutated on a read.

## 7. Provider and legal assumptions — UNRESOLVED, do not invent

The following are **not decided** and must be resolved by the owner/lawyer
before this flow is marketed as a managed service:

1. **Provider authorization.** Whether Tradeify, Lucid or any other firm
   permits Braxel to monitor or operate a customer account is unverified. The
   product copy says connectivity "depends on provider eligibility and
   authorization"; it does not claim that any firm authorizes it.
2. **Monitoring mechanism.** No provider API contract exists. The account
   login/ID alone may not be sufficient for monitoring. If a provider issues
   API credentials, they must go into a purpose-built encrypted-secret store
   (like `integration_credentials`), never into `account_links`.
3. **Execution.** There is no execution contract. `EXECUTION_ENABLED` is a
   kill switch only. Enabling execution requires a separately reviewed design,
   encrypted credentials, an operator approval trail and a provider contract
   that explicitly permits it.
4. **Payouts.** Braxel does not process prop-firm payouts. Payout rules remain
   the external provider's. No payout, withdrawal, ACH, wire or money-transfer
   operation exists in this code.
5. **Custody.** Braxel does not hold customer funds and is not the prop firm.
6. **Legal copy.** The disclosure statements and the "draft wording" notice in
   the onboarding view are **drafts pending legal review**. Replace them only
   with approved wording and bump `DISCLOSURES_VERSION` in
   `_shared/onboarding/config.ts`.
7. **Recurring billing.** The managed service reuses the existing one-off
   checkout. Whether and when to charge monthly is undecided; do not add a
   subscription or auto-charge without an explicit product decision.
8. **Suspension policy.** Suspension is operator-driven, and an inactive
   payment is *displayed* as suspended. There is no automatic stored
   transition, no automatic reactivation and no proration/refund policy.
9. **Account-identifier retention.** How long to keep `account_login` after a
   link is disconnected is undecided. Do not add a purge job without a
   retention decision.

## 8. Manual configuration and deploy

1. Apply the migration: `supabase db push` (head
   `20261122000000_managed_account_onboarding`).
2. Deploy the five functions:
   `onboarding-config`, `onboarding-status`, `account-link-submit`,
   `account-link-review`, `account-link-disconnect`.
3. Keep `EXECUTION_ENABLED` unset. Leave `ONBOARDING_FLOW_ENABLED` unset to
   keep the flow on.
4. Ensure the affiliate URLs used by the activation flow are configured; the
   onboarding firm list is the same list.
5. Optionally make the operator an operator (`app_metadata.operator = true`)
   to use `/operator/account-links`.

## 9. Tests

- `npm run check:onboarding` — pure-module scenarios (paid/unpaid onboarding,
  cross-user access, duplicate submit, approve/reject, disconnect, suspension,
  execution kill switch, refund/cancellation) plus static wiring checks.
- `make test-onboarding` — same script.
- `npm run check:i18n`, `check:payments`, `check:profile`, `check:activation`,
  `check:dashboard`, `check:tradovate`, `check:auth`, `check:security`,
  `check:no-hardcoded`.
- `make test-migrations` (Docker) proves the migration chain still applies and
  is idempotent.
