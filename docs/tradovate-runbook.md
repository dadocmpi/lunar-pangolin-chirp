# Tradovate integration — operator runbook

> **Decision:** the connect flow is in-dashboard. On first access the dashboard
> shows a dedicated welcome/connect screen (`TradovateWelcome.tsx`) — a **soft
> gate, not a blocking gate**: the sidebar and other views stay reachable and
> "Skip for now" is persisted per user. Do not build a login-flow gate and do not
> add `REQUIRE_TRADOVATE_CONNECTION` or any `/dashboard` guard (this supersedes
> the earlier "Option A: no first-run screen"). **Recommended launch config:**
> `TRADOVATE_ENABLED=false` until the live demo test passes (the welcome screen
> and card hide themselves, no redeploy needed); set the encryption/app secrets
> before enabling. Full go-live order: `docs/supabase-deploy-order.md`.

## Architecture

- Credentials are encrypted server-side with AES-256-GCM and only ever touched
  inside Edge Functions (`supabase/functions/_shared/tradovate/`). The browser
  never sees a username, password, cid/sec, or token.
- The connect flow is **in-dashboard**, not a gate. Login goes straight to the
  dashboard; the Tradovate view shows an empty state with a "Connect to
  Tradovate" button that opens a modal (username, password, demo/live). There
  is no router guard and no `REQUIRE_TRADOVATE_CONNECTION` flag.
- Data path: incremental polling of `/fill/list` keyed on
  `integrations.last_fill_id`, with Supabase Realtime pushing trade/fill diffs
  to the browser. There is no long-lived WebSocket — Edge Functions cannot hold
  one.
- Scheduling: `20261004000001_tradovate_sync_schedule.sql` creates a pg_cron job
  every 2 minutes that calls `tradovate-sync` with the service-role token. It
  no-ops if pg_cron/pg_net/Vault are unavailable.

## First-run welcome screen (soft gate)

- On first access (no connection, never connected, not skipped) the dashboard's
  default view renders `TradovateWelcome.tsx` **instead of** dashboard content:
  black/gold, primary "Log in on Tradovate" CTA opening the same connect panel,
  secondary "Skip for now". It is not a router guard — the sidebar and every
  other view stay reachable, and no dashboard content renders behind it.
- `tradovate-status` reports `welcome: { show, skipped }`. `show` is true only
  when `TRADOVATE_ENABLED` is on, there is no live connection, the user has
  never had an integration row (a revoked row after a disconnect counts as
  "already welcomed"), and they have not skipped.
- "Skip for now" POSTs `{action:"skip"}` to `tradovate-status`, which upserts
  `tradovate_welcome_state` (one row per user; migration
  `20261008000000_tradovate_welcome_skip.sql`). RLS is owner-read-only; writes
  go through the Edge Function (service role). The client also hides the screen
  optimistically, so a slow request never blocks the dashboard.
- `TRADOVATE_ENABLED=false` returns `welcome.show=false`, so the welcome screen
  and the connect card both disappear with no frontend redeploy.
- Headless proof: `node scripts/screenshot-welcome.mjs` (needs `puppeteer-core`
  + `/usr/bin/chromium`; serves a build and mocks the user + Edge Functions).
  Captures `docs/assets/welcome-ltr.png`, `welcome-rtl.png`,
  `dashboard-after-skip.png`, `dashboard-after-connect.png` and
  `dashboard-tradovate-disabled.png`, and asserts the soft-gate behaviour.

## Required secrets (Supabase Edge Function secrets)

| Secret | Purpose |
| --- | --- |
| `TRADOVATE_ENCRYPTION_KEY` | AES-256-GCM key for credential envelopes |
| `TRADOVATE_APP_CID` | App-level API key id (from Tradovate API Access) |
| `TRADOVATE_APP_SECRET` | App-level API secret |
| `TRADOVATE_APP_ID` | Optional app label sent as `appId` (default `Braxel`) |
| `TRADOVATE_APP_VERSION` | Optional version sent as `appVersion` (default `1.3.0`) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | present by default in Supabase |

Vault secrets for the scheduler: `project_url`, `service_role_key`.

### What Tradovate actually requires for third-party use

`POST {host}/auth/accesstokenrequest` takes a JSON body:

```
{ name, password, appId, appVersion, deviceId, cid, sec }
```

- `name` / `password` are the **end user's** Tradovate login. That is all a
  normal customer ever types.
- `cid` / `sec` identify the **software**, not the customer. They come from the
  Tradovate **API Access add-on**: the operator funds a live account (min
  balance), subscribes to API Access, generates a key pair once, and stores the
  values as Edge Function secrets. The key is shown a single time.
- Tradovate's own sample request includes `cid`/`sec`, and API Access is their
  documented route for a third-party app. We therefore default to the
  operator's app-level pair and treat a client-supplied pair purely as an
  advanced override for shops that were issued their own key.
- Eligibility: a live, funded **personal brokerage** account with the API Access
  add-on. Prop-firm / evaluation accounts are not eligible. The add-on covers
  orders and account data but not real-time market data (that needs a separate
  CME license).
- Tokens last ~90 minutes; renew via `/auth/renewAccessToken`.

Ask Tradovate support:

1. Is the `cid`/`sec` **app-level** (one pair for our terminal) or **per end
   user**? This decides whether customers ever need their own key.
2. Does `/auth/accesstokenrequest` accept `cid`/`sec` omitted when the app is a
   registered partner app, or are they always required?
3. Does demo API access require the same funded-account/add-on prerequisites as
   live?
4. What `appId` / `appVersion` / `deviceId` values do you expect from our
   integration, and is device pinning enforced?
5. Which CID/secret should be used in `demo` vs `live` — the same pair or two
   separate pairs?

## Go-live order (first production setup)

Do these in order. Keep `TRADOVATE_ENABLED=false` (step 1 below) until step 6 —
the connect card hides itself while the switch is off, so the dashboard stays
non-blocking with no nav gate and no redeploy.

1. **Kill switch off** — set `TRADOVATE_ENABLED=false` so the card does not
   render while the integration is half-configured.
2. **DB migrations** — from a machine with the Supabase CLI linked to prod:
   `supabase db push` (creates `integrations`, `integration_credentials`,
   `tradovate_fills`, `tradovate_trades`, RLS policies, and the sync schedule).
3. **Edge Function secrets** — set `TRADOVATE_ENCRYPTION_KEY`,
   `TRADOVATE_APP_CID`, `TRADOVATE_APP_SECRET` (and optionally
   `TRADOVATE_APP_ID` / `TRADOVATE_APP_VERSION`, `TEST_PAYMENT_MODE`) via
   `supabase secrets set` or the dashboard. Without the encryption key every
   connect call fails closed with `encryption_not_configured`.
4. **Deploy functions** — `supabase functions deploy tradovate-connect
   tradovate-status tradovate-sync tradovate-disconnect`. Verify with
   `curl POST .../functions/v1/tradovate-status` returning 401 without a JWT.
5. **Vault secrets for pg_cron** — the schedule job calls the sync function over
   `pg_net`; store `project_url` and `service_role_key` in Vault so the job can
   authenticate. Until these exist the cron job no-ops and sync is manual.
6. **Enable after the live demo test** — only after a successful connect against
   a real demo account, set `TRADOVATE_ENABLED=true`. The card then appears in
   the dashboard. Do not enable it before the connect flow is proven, because a
   visible card with no app cid/sec just shows a failing connect panel.

## UI reference (rendered from the real components)

Captured headlessly with the actual `TradovateTrades` + `TradovateConnectPanel`
bundled and mounted (Supabase unconfigured, fail-closed path), ~1280×900:

- `docs/assets/tradovate-empty.png` — empty state + "Connect to Tradovate"
- `docs/assets/tradovate-panel.png` — connect panel (LTR, "Advanced options" collapsed)
- `docs/assets/tradovate-empty-rtl.png` — empty state, Arabic (`dir="rtl"`)
- `docs/assets/tradovate-panel-rtl.png` — panel, Arabic RTL

Regenerate any time with `npx vite build` then screenshotting the served
`dist/`; the panel's cid/sec fields only appear after expanding "Advanced
options".

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

- PnL engine, rate limiting, auth/REST wiring, sync idempotency, log safety,
  per-user ownership scoping.
- RLS isolation with two users against the real migration
  (`make test-tradovate-rls`).
- A full login → auth → renewal → `/fill/list` → PnL run against an emulated
  provider (`tradovate-e2e-demo-tests.ts`), where the engine's net PnL matched
  the provider-reported cash delta.
- The dashboard always loads without a connection; the empty state renders the
  connect CTA and the connect panel opens (see `tradovate-dashboard-tests.ts`).

Still a risk without live credentials:

- The emulated wire format is documented but not confirmed byte-for-byte
  against `demo.tradovateapi.com`. First live run should confirm field names
  (`qty`, `action`, `timestamp`), the token payload, and error shapes.
- The pg_cron schedule only activates once the Vault secrets exist; until then
  sync must be triggered manually or by an external scheduler.

## Live probe results (2026-10-04, no user credentials required)

A single unauthenticated request was made against the real demo host to pin the
error wire format:

- `POST /v1/auth/accesstokenrequest` with a bad login returns **HTTP 200** and
  `{"errorText":"Incorrect username or password. Please try again, noting that
  passwords are case-sensitive."}` — **not** a 401. `authenticate()` was fixed
  to classify this body into `invalid_credentials`.
- `POST /v1/account/list` and `/v1/fill/list` without a token return **404**.
- The `cid`/`sec` question is still open: a bad `cid`/`sec` pair returned the
  same "Incorrect username or password" text, so the failure was attributed to
  the user login before the app credentials were evaluated. Confirm with
  Tradovate whether a wrong app pair is distinguishable.

What the probe could NOT verify without a real DEMO account (username +
password, API Access enabled):

- the success payload field names (`accessToken`, `expirationTime`, `userId`),
- `/fill/list` row shape (`qty` vs `quantity`, `action`, `timestamp` format),
- `/account/list` shape, and the account-without-API-access error text,
- the PnL-vs-reported-cash comparison on real fills.

