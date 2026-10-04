# Braxel Markets — Frontend

Vite + React + TS SPA. Single-page app with client-side routing.

## Commands
- `npm run build` — production build (outputs `dist/`). **Exit 0 required before deploy.**
- `npx tsc --noEmit -p tsconfig.app.json` — typecheck.
- `npm run lint` — lint (0 errors; ~11 warnings are baseline fast-refresh/exhaustive-deps).
- `npm run check:i18n` — i18n integrity gate (all 11 locales, key parity, no empty/interp drift).
- `npm run check:payments` — payment/checkout contract gate (see Payments below).
- No test runner configured (`package.json` has no `test` script). Deno tests live under `supabase/functions/_test/` (`deno run -A supabase/functions/_test/run-tests.ts`, `run-tests-option-a.ts`, `run-payments-flag-tests.ts`, `run-payment-destination-tests.ts`); Deno is not installed in the default image.
- `npm run check:tradovate` — Tradovate contract gate (no blocking connect gate or flag, JWT-verified handlers that never trust a body `user_id`, encrypted-only credential writes, envelope/migration match, the in-dashboard empty state + connect panel, no password stored/logged client-side, disconnect deletes credentials).
- **Run `npm run check:i18n` and `npm run check:payments` before opening a PR that touches checkout, pricing, or i18n.**

## Tradovate integration
- Server code lives in `supabase/functions/_shared/tradovate/` (crypto, authService, restService, http, rateLimiter, credentialStore, sync, pnl) and the `supabase/functions/tradovate-*` Edge Functions.
- `make test-tradovate` runs every Deno suite (pnl, rate-limit, auth-rest, sync, dashboard, log-safety, ownership, e2e-demo). `make test-tradovate-rls` runs the 2-user RLS test against a real Postgres (needs Docker; see `supabase/functions/_test/rls/`).
- There is NO `tradovate-stream`. Edge Functions cannot hold a WebSocket; the data path is incremental polling on `integrations.last_fill_id` (idempotent), scheduled by `20261004000001_tradovate_sync_schedule.sql`, with Supabase Realtime pushing diffs to the browser.
- The connect flow is IN-DASHBOARD, not a gate: login goes straight to the dashboard, the Tradovate view shows an empty state (`TradovateTrades.tsx`) whose "Connect to Tradovate" button opens `TradovateConnectPanel.tsx`. There is no router guard and NO `REQUIRE_TRADOVATE_CONNECTION` flag — do not reintroduce one.
- Credentials are AES-256-GCM envelopes `{ciphertext, iv, auth_tag, key_version}`; the browser never sees them and RLS gives authenticated roles no read on `integration_credentials`. `docs/tradovate-runbook.md` has the key-rotation plan.
- App-level API credentials (`cid`/`sec`) are SERVER SECRETS: `TRADOVATE_APP_CID` / `TRADOVATE_APP_SECRET` (plus optional `TRADOVATE_APP_ID` / `TRADOVATE_APP_VERSION`). `resolveAppCredentials()` in `supabase/functions/_shared/tradovate/appCredentials.ts` sends the client-supplied pair if present, else the server pair. The default UX is username + password only; the panel's cid/sec fields are a collapsed "Advanced options" fallback. NEVER add a `VITE_TRADOVATE_APP_*` client env var.

## Local preview
- `npx vite preview --port 4321 --host 127.0.0.1` after a build (serves `dist/`).
- Headless Chromium is available at `/usr/bin/chromium` for `--dump-dom` checks.

## i18n
- `src/i18n.ts` holds one big object per locale: `enTranslation`, `ptTranslation`, `itTranslation`, `esTranslation`, `frTranslation`, `deTranslation`, `ruTranslation`, `zhTranslation`, `jaTranslation`, `arTranslation`, `heTranslation`.
- `resources` maps locale keys `en|pt|it|es|fr|de|ru|zh|ja|ar|he` to those objects; `fallbackLng: 'en'`.
- RTL handled by `i18n.on('languageChanged')` setting `document.documentElement.dir` for `ar`/`he`.
- IMPORTANT: the per-locale objects contain every namespace including `application` and `checkoutSuccess`. When adding a key, add it to ALL 11 locales (or rely on the EN fallback policy). Historically, all 11 locales were once mis-wired to `enTranslation` — keep each locale object pointed at its own translations.

## Routes
- `/` home, `/pricing` (four plan cards → `GARANTIR ESTE PLANO` buttons), `/register-application` (pre-registration form; plan passed via router `state.plan`), `/checkout`, `/checkout/success`, `/login`, `/register`, `/about`, `/how-it-works`, `/contact`, `/terms`, `/privacy`, `/disclaimer`.
- `src/App.tsx` registers `/register-application` (lazy).

## Error handling / no black screens
- Every route is wrapped by `src/components/ErrorBoundary.tsx` + `Suspense` (`RouteView` in `App.tsx`), and `src/main.tsx` adds a top-level boundary. A render error or failed lazy-chunk import must never unmount the whole app into an empty black page — it shows the localized recovery screen instead.
- The boundary auto-reloads once (throttled by `braxel-chunk-reload-at` in sessionStorage) when a stale hashed chunk fails after a new deploy.
- Use `<Link to="...">` for in-app navigation. Raw `<a href="/...">` does a full reload and bypasses the router; only use it for external links or the `window.location.reload()` escape hatch.
- Return early with a themed loader (`min-h-screen bg-[#05070A]` + `Loader2`), not a bare empty div, for loading states.

## Payments / Supabase
- Checkout + CheckoutSuccess fail closed when `isSupabaseConfigured()` is false (render `PaymentsDisabledNotice` or "could not verify" state).
- **ONE payments gate.** The frontend reads `src/lib/paymentsFlag.ts` (`isPaymentsEnabled()` = `VITE_PAYMENTS_ENABLED === "true" || VITE_TEST_PAYMENT_MODE === "true"`). Every payment Edge Function reads `supabase/functions/_shared/payments-flag.ts` (`PAYMENTS_ENABLED === "true" || TEST_PAYMENT_MODE === "true"`) and fails closed (503 `payments_disabled`) when off. These two modules MUST stay in sync; `npm run check:payments` enforces it. Never re-introduce a raw `import.meta.env` gate in a page or a per-function `Deno.env` gate.
- Frontend flags are Vite build-time env vars (Vercel) and need a redeploy to change. Server flags are Supabase Edge Function secrets and take effect on the next invocation. The server flag is the security boundary; the frontend flag only decides which UI renders.
- `HOW_TO_ENABLE_PAYMENTS.md` is the operator runbook (TEST/LIVE values + rollback).
- Do not touch Stripe price IDs, webhook signature verification, payment/activation logic, Supabase functions, migrations, or RLS.
- Plan prices live in ONE canonical client table: `src/lib/plans.ts` `PLAN_PRICING` (USD). It MUST mirror the server table `supabase/functions/_shared/plans.ts` `PLANS` (`priceCents` + `managedCapitalUsd`). `npm run check:payments` enforces parity; never hard-code prices in a page again.
- Managed Capital is always charged in **USD**. Local currency is presentation only.
- Active checkout methods: `stripe-checkout` (Stripe-verified via webhook), `wise-checkout` (pending_manual), `crypto-checkout` (on-chain confirm). Browser flows never declare the price.
- Real payout destinations come from ONE server resolver: `supabase/functions/_shared/payment-destinations.ts` (Wise `WISE_*` secrets, crypto `CRYPTO_DESTINATION_*` secrets). TEST mode returns the safe placeholders; LIVE mode with a missing destination fails closed (503 `payment_destination_unconfigured`) and must never fall back to the test placeholder. The destination check runs after auth.
- `card-checkout` and `paypal-checkout` are **hard-disabled** (HTTP 410): they used to activate a paid service from client-supplied values with no payment verification. Do not re-enable them; card payments go through `stripe-checkout`.
- Test mode is server-side only (`TEST_PAYMENT_MODE` env). Never trust an `isTest` flag from the request body.

## Owner notifications (Resend)
- ONE module sends every owner email: `supabase/functions/_shared/email.ts` → `notifyOwner({ type, subject, data, replyTo, idempotencyKey })`. Never call `api.resend.com` directly from new code; route through `notifyOwner` / `notifyOwnerInBackground`.
- `src/lib/notifyOwner.ts` is the browser-side helper. It forwards to the `notify-owner` Edge Function (which owns the Resend key) — the key must never reach the client bundle.
- Event types and subject prefixes: `novo_cliente` `[Novo Cliente]`, `novo_lead` `[Lead]`, `compra` `[Compra]`, `pagamento` `[Pagamento]`, `conta` `[Conta]`, `erro` `[Erro]`, `webhook` `[Webhook]`.
- Env (Supabase Edge Function secrets, never committed): `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, `EMAIL_TEST_SECRET`.
- Test: `deno run -A supabase/functions/_test/email-tests.ts` (unit) and `deno run -A supabase/functions/_test/run-email-samples.ts` (one sample per type). Deployed: `POST /functions/v1/email-test` with `{"secret":"<EMAIL_TEST_SECRET>"}`.
- Redaction is automatic by key name (password/secret/token/card/cvv/iban/...) and for card-like digit runs; HTML is escaped before rendering.
- Owner notifications are fire-and-forget: a provider failure must never break signup, checkout, a form submit, or a webhook.

## KYC (identity verification)
- The terminal opens for any logged-in user. KYC is **not** required to enter the dashboard.
- KYC is enforced only when a withdrawal is requested. `src/pages/Dashboard.tsx` (withdraw view) renders `src/components/WithdrawalKycGate.tsx` unless the latest `kyc_submissions.status` is `approved`.
- Documents are uploaded through the authenticated `kyc-submit` Edge Function into the **private** bucket `kyc-documents` at `<user_id>/<uuid>.<ext>`; only object paths are stored, never public URLs. Object RLS keys on `(storage.foldername(name))[1] = auth.uid()::text`.
- `withdrawal-request` is the server-side gate: it reads KYC status via the `kyc_status_for_user(uuid)` SECURITY DEFINER RPC for the **JWT** user and returns 403 `kyc_required` unless approved. A `kycStatus`/`userId` in the request body is ignored.
- `kyc-action` mirrors an owner approve/deny onto the latest submission, records the rejection reason, and emails the user via `_shared/userEmail.ts`.
- `_shared/userEmail.ts` is the single module for **customer-facing** transactional email (analogous to `_shared/email.ts` for owner notifications); do not call `api.resend.com` directly. `npm run check:payments` enforces both.
- AI consistency check at submission (`_shared/kyc/aiDecision.ts`, `aiProvider.ts`, `aiKyc.ts`): advisory, **fails closed** — no key / provider error / malformed / low-confidence / failed check -> manual review; only a clean high-confidence pass auto-approves. Decisions are audited in `kyc_ai_checks` (service-role only). Provider is swappable via `AI_PROVIDER_REGISTRY` + `KYC_AI_PROVIDER` (default `gemini`); `KYC_AI_API_KEY` unset = 100% human review.
- `KYC_MANUAL_REVIEW_THRESHOLD_CENTS` (Edge secret) forces human review for an approved withdrawal at/above that amount (`status=manual_review`).
- Schema: `supabase/migrations/*_kyc_on_withdrawal.sql` (`kyc_submissions`, `withdrawal_requests`, gate RPCs, bucket), `*_ai_kyc_checks.sql` (`kyc_ai_checks`), `*_withdrawal_manual_review.sql` (status + `manual_review` column). Gate RPCs are `service_role`-only.
- Tests: `deno run -A supabase/functions/_test/kyc-gate-tests.ts`, `kyc-document-tests.ts`, `ai-kyc-tests.ts`; RLS/storage isolation `bash supabase/functions/_test/rls-kyc/run.sh` (needs Docker).

## Deployment
- Deployment is via Vercel's GitHub integration: pushing to `main` triggers a `Production` deployment for the `braxelmarkets` project (`https://braxelmarkets.vercel.app/`).
- **Vercel deploys ONLY the SPA.** Supabase Edge Functions are a separate target: `.github/workflows/deploy-supabase-functions.yml` runs `supabase functions deploy` on push to `main` (needs `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_ID` repo secrets). Until functions are deployed, calls return `{"code":"NOT_FOUND"}`. Merging `supabase/functions/**` alone does NOT change production.
- No local Vercel CLI/auth; do not attempt `vercel deploy` — push to `main` instead.
- `.github/workflows/deploy.yml` deploys docs to GitHub Pages (separate; repo has `has_pages: false`, unused).