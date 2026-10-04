# Supabase deploy order (schema before code)

> **Decision:** keep the non-blocking dashboard with the in-dashboard Tradovate
> connect. On first access the dashboard shows a dedicated welcome/connect screen
> (`TradovateWelcome.tsx`) — a **soft gate, not a blocking gate**: the sidebar and
> other views stay reachable and "Skip for now" is persisted per user. The
> login-flow gate is intentionally **NOT** part of the product — do not build one
> and do not add `REQUIRE_TRADOVATE_CONNECTION` or any `/dashboard` guard.
>
> **Recommended launch config (Edge secrets):** `TRADOVATE_ENABLED=false` and
> `AI_KYC_ENABLED=false` until the live Tradovate demo test and the AI-provider /
> ID-data-protection review are done. Leave `WITHDRAWAL_KYC_GATE_ENABLED`
> **unset** (never `false` in normal operation).
>
> **Go-live order:** Supabase secrets → `supabase db push` (all 6 migrations,
> filename order) → `supabase functions deploy` → smoke test no function returns
> 404 → merge **PR #47 only** (close #45/#46) → Vercel redeploy → final test in an
> incognito window with a fresh account. See "Manual go-live order" below.

Edge Functions call tables and RPCs introduced by migrations. If a function is
deployed before its migration, every call fails on a fresh database. The
deploy order is therefore: **migrations first, then Edge Functions.**

## How the safety gate works

`.github/workflows/deploy-supabase-functions.yml` runs on every push to `main`
that touches `supabase/functions/**`, `supabase/migrations/**` or
`supabase/config.toml` (and can be run manually via `workflow_dispatch`).

Before deploying it runs a pre-flight step *Check target DB is migrated to this
commit*:

1. It takes the highest migration filename in the commit (`ls | sort | tail -1`).
2. It reads the applied migration versions from the linked project
   (`supabase migration list --linked`).
3. If the commit's head migration is **not** in the remote list, the deploy step
   is skipped (`proceed=false`) with a warning telling the operator to apply
   migrations and re-run.

This is a deliberate choice over making the workflow `workflow_dispatch`-only:
it keeps automatic deploys for the common functions-only change (DB already up
to date) while making "deploy code before schema" impossible.

## Required secrets for the gate

| Secret | Purpose |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | `supabase` CLI auth |
| `SUPABASE_PROJECT_ID` | target project ref |
| `SUPABASE_DB_PASSWORD` | lets the pre-check read applied migrations |

If `SUPABASE_DB_PASSWORD` is unset the pre-check cannot read the remote
migration list and **skips the deploy** (fails safe). Add it to enable
automatic deploys.

## Manual go-live order

1. **Supabase secrets** — set the Edge Function secrets (Tradovate, AI KYC,
   encryption, Resend) with the recommended launch values above.
2. **Apply migrations** — `supabase db push` (or `supabase migration up --linked`),
   all 6 pending migrations in filename order. See
   `supabase/functions/_test/migrations/apply-order.sh` for a fresh-DB
   reproduction of the exact apply order.
3. Confirm the migration head matches: `supabase migration list --linked`.
4. **Deploy functions** — re-run the workflow (Actions -> Deploy Supabase Edge
   Functions -> Run workflow) or push a functions change.
5. **Smoke test** — confirm no function returns 404 (`{"code":"NOT_FOUND"}` means
   it is not deployed yet).
6. **Merge PR #47 only** (close #45 and #46).
7. **Vercel redeploy** the SPA.
8. **Final test** in an incognito window with a fresh account.
