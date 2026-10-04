# Tradovate integration — operator runbook

## Architecture

- Credentials are encrypted server-side with AES-256-GCM and only ever touched
  inside Edge Functions (`supabase/functions/_shared/tradovate/`). The browser
  never sees a username, password, cid/sec, or token.
- The connect gate is `REQUIRE_TRADOVATE_CONNECTION`, default **ON**. It is only
  disabled by the literal string `"false"`.
  - Frontend: `VITE_REQUIRE_TRADOVATE_CONNECTION` (Vite build-time; set in
    Vercel and redeploy).
  - Server: `REQUIRE_TRADOVATE_CONNECTION` (Supabase Edge Function secret).
  - `npm run check:tradovate` asserts both default ON and stay in sync.
- Data path: incremental polling of `/fill/list` keyed on
  `integrations.last_fill_id`, with Supabase Realtime pushing trade/fill diffs
  to the browser. There is no long-lived WebSocket — Edge Functions cannot hold
  one.
- Scheduling: `20261004000001_tradovate_sync_schedule.sql` creates a pg_cron job
  every 2 minutes that calls `tradovate-sync` with the service-role token. It
  no-ops if pg_cron/pg_net/Vault are unavailable.

## Required secrets (Supabase Edge Function secrets)

| Secret | Purpose |
| --- | --- |
| `TRADOVATE_ENCRYPTION_KEY` | AES-256-GCM key for credential envelopes |
| `REQUIRE_TRADOVATE_CONNECTION` | `"false"` disables the gate; anything else = ON |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | present by default in Supabase |

Vault secrets for the scheduler: `project_url`, `service_role_key`.

## Rotating TRADOVATE_ENCRYPTION_KEY

Credentials are stored as `{ciphertext, iv, auth_tag, key_version}`. Rotation is
online and needs no downtime:

1. Generate a new 256-bit key and store it as `TRADOVATE_ENCRYPTION_KEY_NEXT`.
2. Deploy a decrypt path that tries the current key first, then the next key,
   and records which one succeeded. Reads must accept both during the window.
3. Run a backfill that, for each `integration_credentials` row, decrypts with
   whichever key works and re-encrypts with the new key, bumping `key_version`.
4. Once every row is on the new key, promote `_NEXT` to the primary and delete
   the old key from the secret store.

Do not delete the old key until step 3 has covered every row — a credential
encrypted under a discarded key is unrecoverable and the user must reconnect.

## What is verified vs. still a risk

Verified locally (see `supabase/functions/_test/` and `make test-tradovate`):

- PnL engine, rate limiting, auth/REST wiring, sync idempotency, the connect
  gate, log safety, per-user ownership scoping.
- RLS isolation with two users against the real migration
  (`make test-tradovate-rls`).
- A full login → auth → renewal → `/fill/list` → PnL run against an emulated
  provider (`tradovate-e2e-demo-tests.ts`), where the engine's net PnL matched
  the provider-reported cash delta.

Still a risk without live credentials:

- The emulated wire format is documented but not confirmed byte-for-byte
  against `demo.tradovateapi.com`. First live run should confirm field names
  (`qty`, `action`, `timestamp`), the token payload, and error shapes.
- The pg_cron schedule only activates once the Vault secrets exist; until then
  sync must be triggered manually or by an external scheduler.
