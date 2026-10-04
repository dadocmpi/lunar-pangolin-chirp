# AI KYC on withdrawal — runbook

> **Decision (Option A, closed):** KYC is required only at withdrawal; the
> terminal opens for any logged-in user and there is no login-flow gate (do not
> build one, do not add `REQUIRE_TRADOVATE_CONNECTION` or a `/dashboard` guard).
> **Recommended launch config:** `AI_KYC_ENABLED=false` (and leave
> `KYC_AI_API_KEY` unset) until the AI-provider / ID-data-protection review is
> signed off — every submission then goes to human manual review. Leave
> `WITHDRAWAL_KYC_GATE_ENABLED` **unset** (never `false` in normal operation; it
> refuses withdrawals rather than bypassing KYC). Full go-live order:
> `docs/supabase-deploy-order.md`.

## What this adds

The terminal is **fully open** to any logged-in user. Identity verification
(KYC) is required **only when the user requests a withdrawal**, and the
submission is first checked by an AI consistency model:

1. `kyc-submit` stores the documents in the private `kyc-documents` bucket and
   inserts a `kyc_submissions` row (`status = submitted`).
2. It then runs the vision model over the images (front/back/selfie) and asks
   for a strict JSON verdict: name match, expiry, age, document type, readable.
3. `decideFromAiOutput` validates that JSON and **fails closed**:
   - no key / provider error / null / malformed / missing check -> manual review
   - any failed check, or any check below the confidence floor -> manual review
   - a low-confidence "rejected" -> manual review (a human confirms)
   - **only** a complete, internally consistent, high-confidence pass is
     auto-approved.
4. Every decision is written to `public.kyc_ai_checks` (service-role only).
5. On auto-approval the submission is set to `approved`; otherwise it stays
   `submitted` and the owner email includes the AI verdict.

The model judges **consistency, not authenticity**. It never has the final say
on a rejection.

## Go-live order

1. **Apply the migrations** (in order):
   - `20261005000000_kyc_on_withdrawal.sql`
   - `20261006000000_ai_kyc_checks.sql`
   - `20261007000000_withdrawal_manual_review.sql`
2. **Deploy the Edge Functions**: `kyc-submit`, `kyc-action`,
   `withdrawal-request` (unchanged files ship with the branch).
3. **Set Edge Function secrets** (Supabase → Edge Functions → Secrets):
   - `KYC_AI_API_KEY` — a Gemini API key (aistudio.google.com).
   - `KYC_AI_MODEL` — optional, defaults to `gemini-2.0-flash`.
   - `KYC_AI_PROVIDER` — optional, defaults to `gemini` (see swappable providers).
   - `KYC_MANUAL_REVIEW_THRESHOLD_CENTS` — optional; e.g. `1000000` = $10,000.
     At/above it an approved withdrawal is stored as `manual_review` instead of
     auto-processing. Unset/`0` = off.
   - Leave the AI keys **unset** to keep 100% human review; the AI step is
     skipped and every submission goes to manual review. This is the safe default.
4. **Deploy the frontend** (Vercel, via push to `main`).
5. Verify with the two-user RLS test and the unit tests (below).

## Vercel environment variables (Preview scope)

For a **preview** deployment to actually let you log in, the following must be
set for the **Preview** environment in Vercel → Project → Settings → Environment
Variables (a value set only for Production is blank in previews, which makes the
app render the "payments/supabase not configured" fail-closed state):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PAYMENTS_ENABLED` — optional; `"true"` only if you want the payment UI in previews.
- `VITE_TEST_PAYMENT_MODE` — optional test-mode switch.

These are **build-time** Vite variables: after changing them you must **redeploy**
the preview (a new commit or "Redeploy") for them to take effect. Server-side
secrets (`SUPABASE_SERVICE_ROLE_KEY`, `KYC_AI_*`, `TRADOVATE_*`, `RESEND_API_KEY`)
are Supabase Edge Function secrets and are **not** set in Vercel.

## Swappable AI provider

The model is behind one interface (`AiProvider`) and one registry
(`AI_PROVIDER_REGISTRY` in `_shared/kyc/aiProvider.ts`). `kyc-submit` only calls
`createAiProviderFromEnv`, so changing vendors means adding one registry entry —
no caller changes. `KYC_AI_PROVIDER` selects it; an unknown provider or a missing
key returns `null` and the submission fails closed to manual review.

### What is sent to the AI provider (Gemini)

- the ID front image, and the back/selfie when provided (base64),
- the name the user declared,
- the current timestamp (for expiry/age reasoning), inside the prompt.

Nothing else. Passwords, Tradovate tokens, Supabase keys and other users' data
are never sent.

### What we log

- to `public.kyc_ai_checks`: provider, model name, decision, confidence, the
  per-check pass/flags, the reason, and flags for malformed/unavailable.
- HTTP errors log **only the status code**; the API key is sent in a request
  header (never the URL) and is never logged or included in an error.
- the raw model output and the image bytes are **not** stored and **not** logged.

## Manual-review threshold

Config name: **`KYC_MANUAL_REVIEW_THRESHOLD_CENTS`** (Edge Function secret,
integer cents). When set > 0, an approved withdrawal whose amount is **≥** the
threshold is accepted but written with `status = 'manual_review'` and
`manual_review = true`, and the owner email subject is prefixed `[Revisao]`.
Below the threshold it auto-processes as `pending`. The threshold never lets a
non-approved user through. Tests: `kyc-gate-tests.ts` section `[6]`.

## What the operator does for a manual-review submission

A review-needed submission appears in the owner notification email with
`ai_decision`, `ai_confidence` and `ai_reason`. Open the existing `kyc-action`
approve/deny link; that flow sets `profiles.kyc_status` and mirrors the latest
submission. The `kyc_ai_checks` row is an audit record and is never edited by hand.

## Tests (all runnable without credentials)

```bash
# Fail-closed decision logic + orchestration + provider (40 checks)
deno run -A supabase/functions/_test/ai-kyc-tests.ts

# Withdrawal gate (24 checks)
deno run -A supabase/functions/_test/kyc-gate-tests.ts

# Document limits / path building (22 checks)
deno run -A supabase/functions/_test/kyc-document-tests.ts

# Real 2-user RLS + private storage + AI-table isolation (Postgres in Docker)
bash supabase/functions/_test/rls-kyc/run.sh
```

## Risk / limits

- The AI is **advisory**. A stolen-but-consistent document can pass an
  auto-approval; the audit row and the owner email make that auditable. To
  disable auto-approval entirely, leave `KYC_AI_API_KEY` unset.
- Sending ID images to a third-party model is a data-processing decision; the
  documents themselves stay in your private bucket and are not retained by the
  provider beyond the request under its API terms. Review that before going live.
- The AI step adds latency to `kyc-submit` (one vision call). If it ever
  exceeds the Edge Function limit, move the call to a cron worker reading
  pending submissions — the decision module is pure and portable.
