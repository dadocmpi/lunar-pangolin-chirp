# Braxel Markets — Frontend

Vite + React + TS SPA. Single-page app with client-side routing.

## Commands
- `npm run build` — production build (outputs `dist/`). **Exit 0 required before deploy.**
- `npx tsc --noEmit -p tsconfig.app.json` — typecheck.
- `npm run lint` — lint (0 errors; ~11 warnings are baseline fast-refresh/exhaustive-deps).
- `npm run check:i18n` — i18n integrity gate (all 11 locales, key parity, no empty/interp drift).
- `npm run check:payments` — payment/checkout contract gate (see Payments below).
- No test runner configured (`package.json` has no `test` script). Deno tests live under `supabase/functions/_test/` (`deno run -A supabase/functions/_test/run-tests.ts`, `run-tests-option-a.ts`); Deno is not installed in the default image.
- **Run `npm run check:i18n` and `npm run check:payments` before opening a PR that touches checkout, pricing, or i18n.**

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
- Do not touch Stripe price IDs, webhook signature verification, payment/activation logic, Supabase functions, migrations, or RLS.

## Owner notifications (Resend)
- ONE module sends every owner email: `supabase/functions/_shared/email.ts` → `notifyOwner({ type, subject, data, replyTo, idempotencyKey })`. Never call `api.resend.com` directly from new code; route through `notifyOwner` / `notifyOwnerInBackground`.
- `src/lib/notifyOwner.ts` is the browser-side helper. It forwards to the `notify-owner` Edge Function (which owns the Resend key) — the key must never reach the client bundle.
- Event types and subject prefixes: `novo_cliente` `[Novo Cliente]`, `novo_lead` `[Lead]`, `compra` `[Compra]`, `pagamento` `[Pagamento]`, `conta` `[Conta]`, `erro` `[Erro]`, `webhook` `[Webhook]`.
- Env (Supabase Edge Function secrets, never committed): `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, `EMAIL_TEST_SECRET`.
- Test: `deno run -A supabase/functions/_test/email-tests.ts` (unit) and `deno run -A supabase/functions/_test/run-email-samples.ts` (one sample per type). Deployed: `POST /functions/v1/email-test` with `{"secret":"<EMAIL_TEST_SECRET>"}`.
- Redaction is automatic by key name (password/secret/token/card/cvv/iban/...) and for card-like digit runs; HTML is escaped before rendering.
- Owner notifications are fire-and-forget: a provider failure must never break signup, checkout, a form submit, or a webhook.

## Deployment
- Deployment is via Vercel's GitHub integration: pushing to `main` triggers a `Production` deployment for the `braxelmarkets` project (`https://braxelmarkets.vercel.app/`).
- No local Vercel CLI/auth; do not attempt `vercel deploy` — push to `main` instead.
- `.github/workflows/deploy.yml` deploys docs to GitHub Pages (separate; repo has `has_pages: false`, unused).