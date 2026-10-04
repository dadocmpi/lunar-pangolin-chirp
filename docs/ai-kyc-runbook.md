# AI KYC on withdrawal — runbook

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
2. **Deploy the Edge Functions**: `kyc-submit`, `kyc-action`,
   `withdrawal-request` (unchanged files ship with the branch).
3. **Set Edge Function secrets** (Supabase → Edge Functions → Secrets):
   - `KYC_AI_API_KEY` — a Gemini API key (aistudio.google.com).
   - `KYC_AI_MODEL` — optional, defaults to `gemini-2.0-flash`.
   - Leave both **unset** to keep 100% human review; the AI step is skipped and
     every submission goes to manual review. This is the safe default.
4. **Deploy the frontend** (Vercel, via push to `main`).
5. Verify with the two-user RLS test and the AI unit tests (below).

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
