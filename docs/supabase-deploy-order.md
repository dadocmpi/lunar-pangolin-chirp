# Supabase deploy order (schema before code)

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

1. Apply migrations: `supabase db push` (or `supabase migration up --linked`).
   See `supabase/functions/_test/migrations/apply-order.sh` for a fresh-DB
   reproduction of the exact apply order.
2. Confirm the migration head matches: `supabase migration list --linked`.
3. Deploy functions: re-run the workflow (Actions -> Deploy Supabase Edge
   Functions -> Run workflow) or push a functions change.
