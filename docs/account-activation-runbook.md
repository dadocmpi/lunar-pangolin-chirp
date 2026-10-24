# Account activation — operator runbook

> **Status:** draft, pending your approval. Nothing here is applied to
> production yet. The migration, the Edge Functions and the secrets must be
> applied in the order below, and only after the PR is approved.

This runbook covers the **buy-your-account / activate-signals-plan** flow. It
replaces the previous model where Braxel connected to the customer's Tradovate
account through an API. Under the new model:

- the customer buys an evaluation/funded account **directly from the prop firm**
  (Tradeify or Lucid) through **our affiliate link**;
- the customer returns to the dashboard and **requests activation**;
- an operator **reviews and approves** the request manually;
- the signals plan becomes active, and the customer executes the signals
  **themselves**, in their own account, with a third-party tool.

Braxel **never operates the customer's account** and **never stores broker
credentials**. There is no password / CID / secret field anywhere in the flow.

## 1. Configuration (Supabase Edge Function Secrets)

Set these in **Supabase Dashboard → Edge Functions → Secrets**. They are read on
every invocation; no redeploy is needed to change them.

| Secret | Meaning | Default when unset |
| --- | --- | --- |
| `ACTIVATION_FLOW_ENABLED` | `"false"` turns the whole flow off (503 + hidden UI). Any other value keeps it on. | on |
| `AFFILIATE_TRADEIFY_URL` | Tradeify affiliate link. **Unset ⇒ Tradeify is not offered anywhere.** | hidden |
| `AFFILIATE_LUCID_URL` | Lucid affiliate link. Same rule. | hidden |
| `SIGNALS_PLAN_NAME` | Display name of the monthly signals plan. | "Signals Plan" |
| `SIGNALS_PLAN_PRICE_CENTS` | Monthly fee in USD cents (e.g. `9900` = $99.00). Presentation only. | 0 (no price shown) |
| `SIGNALS_PLAN_CURRENCY` | ISO currency for display. | USD |
| `TRADERSPOST_STRATEGY_SHARE_URL` | Share link for **our** strategy on TradersPost. The customer subscribes to it in **their own** TradersPost account; execution happens on the customer's account. Unset ⇒ the onboarding shows the steps with no subscribe button. | hidden |
| `ACTIVATION_MAX_ACTIVE` | Pilot capacity: the maximum number of **approved** activations. When reached, `activation-submit` returns `409 waitlist` and the dashboard shows the waitlist instead of the form. Unset or `0` ⇒ unlimited (no waitlist). | unlimited |

**Fail-closed rule:** a firm is offered **only** when its affiliate URL is set
and is a valid `http(s)` URL. An unconfigured firm never appears on `/accounts`
or in the activation form, and the server rejects a submission for it with
`firm_not_configured`.

> Affiliate links and prices are **never** hard-coded in the repository. The
> public `activation-config` Edge Function serves them to the browser, and the
> server re-checks every request. `npm run check:activation` enforces this.

## 2. Apply the migration (schema before code)

One migration ships with this change:

```
supabase/migrations/20261010000000_account_activation.sql
```

It is **idempotent** and additive:

1. `public.account_activations` — one row per activation request. RLS:
   - `owner_select`: a user reads **only** their own rows;
   - `operator_select`: an operator (`app_metadata.operator === true`, strict
     JSON boolean) reads **every** row;
   - `no_client_insert` / `no_client_update` / `no_client_delete`: the browser
     **cannot** write directly. All writes go through the JWT-verified
     `activation-submit` / `activation-review` Edge Functions (service role).
2. A **private** bucket `activation-receipts` + owner-only object policies
   (path `<user_id>/<uuid>.<ext>`). Operators read receipts through a
   **short-lived signed URL** (300 s) minted by `activation-review`.
3. Widens the `payment_audit_log.payment_table` CHECK (whichever variant exists)
   to allow `'account_activations'`.

A second, **additive** migration ships with the TradersPost onboarding:

```
supabase/migrations/20261012000000_traderspost_onboarding.sql
```

It adds two nullable columns to `public.account_activations`
(`strategy_confirmed_at`, `strategy_confirmed_by`) and widens the
`payment_audit_log.source` CHECK (whichever variant exists) to allow the
`'activation'` source used by the strategy-confirmation audit row. RLS is
row-scoped, so the existing owner/operator/no-client-write policies already
cover the new columns; no new policy is required. There is **no credential
column** of any kind.

Apply with `supabase db push` (or `supabase migration up --linked`). Verify
locally first with `make test-migrations` (needs Docker).

## 3. Deploy the Edge Functions

Four functions ship with this change:

- `activation-config` — **public** (`verify_jwt = false`); returns the firms and
  plan. No secret, no credential, no user data.
- `activation-submit` — **JWT required**. Validates server-side, rate-limits per
  IP and per user, uploads the receipt to the private bucket, inserts the row,
  and notifies the owner through `_shared/email.ts` (Resend, fire-and-forget).
- `activation-review` — **JWT required, operator-only**. Approves / rejects /
  requests information / starts review, writes the append-only audit log, emails
  the customer through `_shared/userEmail.ts`, and returns a short-lived signed
  receipt URL.
- `activation-strategy-confirm` — **JWT required**. Records that the customer
  subscribed to **our** TradersPost strategy in their own account (a
  self-declaration, not a payment and not a credential). Only the customer's own
  **approved** activation can be stamped; the write is idempotent (keeps the
  first timestamp) and appends to the audit log with source `'activation'`.

Deploy with `supabase functions deploy` (the GitHub workflow does this on push
to `main` once the migration pre-flight passes). Confirm no function returns 404:

```
SUPABASE_URL=https://<project>.supabase.co npm run smoke:functions
```

## 4. Operator access

An operator is a Supabase user whose `app_metadata.operator` is exactly `true`.
That flag can **only** be set with the service role; a user cannot promote
themselves. Set it from the Supabase dashboard (Authentication → user →
app_metadata) or the admin API.

Operators open the panel at `/operator/activations`.

## 5. Verification checklist

- [ ] `npm run check:i18n` passes (all 11 locales).
- [ ] `npm run check:activation` passes.
- [ ] `npm run check:no-hardcoded` passes.
- [ ] `npx tsc --noEmit -p tsconfig.app.json` clean.
- [ ] `npm run build` exits 0.
- [ ] `make test-migrations` passes (needs Docker).
- [ ] `deno run -A supabase/functions/_test/activation-submit-tests.ts` passes.
- [ ] `deno run -A supabase/functions/_test/activation-review-tests.ts` passes.
- [ ] `deno run -A supabase/functions/_test/traderspost-onboarding-tests.ts` passes.
- [ ] `bash supabase/functions/_test/rls-activation/run.sh` passes (needs Docker).
- [ ] Headless: `node scripts/screenshot-activation-flow.mjs` (visitor → customer
      submit → operator approve → customer sees "Plan active" → customer confirms
      the TradersPost strategy → the waitlist shows when the pilot is full).

## 6. Rollback

- **UI / functions:** set `ACTIVATION_FLOW_ENABLED=false`. The flow returns 503
  and the `/accounts` cards and the dashboard view disappear immediately, with no
  redeploy. The `account_activations` table and receipts stay intact.
- **Schema:** the migration is additive; nothing existing is dropped or
  rewritten. To fully revert, drop the table, the bucket and the object policies
  (see `docs/ROLLBACK.md` for the project-wide rollback conventions).

## 7. Open questions (need your decision)

1. **Monthly billing.** The plan price is display-only today. The brief says to
   reuse the existing Stripe/crypto payment flow, but it does not say *when* the
   monthly charge is raised or what happens to an already-active plan when it
   lapses. Options are listed in the PR description — please pick one before we
   wire billing.
2. **Legal copy.** The risk warning, the affiliate-commission disclosure and the
   four confirmations are **drafts**, flagged in the UI with a "draft — pending
   legal review" banner. They need your lawyer's sign-off.
3. **Execution-tool content.** The "connect your tool" steps are placeholders
   (`planActive.tools.*` in `src/i18n.ts`) alongside the real TradersPost block.
   Replace them with the final per-tool instructions once you confirm the
   supported tools.
4. **TradersPost strategy subscription vs. monthly billing.** The onboarding
   records a **self-declaration** that the customer subscribed to our TradersPost
   strategy (`activation-strategy-confirm`); it does **not** verify the
   subscription and is **not** a payment. How (and whether) to reconcile it with
   the monthly charge is still open — see the PR description. Until you decide,
   the confirmation is informational only.
