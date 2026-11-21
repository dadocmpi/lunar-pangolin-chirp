# Account lifecycle runbook (registration, confirmation, recovery)

Scope: Feature 5 — the account creation and activation experience. This runbook
documents the Supabase Auth configuration that must stay in place, the
verification checklist for the production flow, the recommended wording for the
two transactional email templates, the consent evidence model, and the open
business decisions that are intentionally **not** implemented.

Nothing in this document changes authentication. Supabase Auth, RLS, Edge
Functions and the existing migrations remain the source of truth.

---

## 1. Supabase Auth configuration (manual, already applied)

These values live in the Supabase dashboard, not in the repository. They were
reported as configured; verify them, do not recreate them.

| Setting | Value |
|---|---|
| Site URL | `https://braxelmarkets.vercel.app` |
| Redirect URL (password recovery) | `https://braxelmarkets.vercel.app/reset-password` |
| Redirect URL (email confirmation) | `https://braxelmarkets.vercel.app/auth-callback` (**preserve**) |
| Confirm email | Enabled (`mailer_autoconfirm = false`) |
| Confirm signup template | Configured |
| Reset Password template | Configured |

Verification (read-only):

1. **Authentication → URL Configuration** — both redirect URLs above are listed
   and the Site URL is the production domain.
2. **Authentication → Providers → Email** — “Confirm email” is on.
3. **Authentication → Email Templates** — the Confirm signup and Reset Password
   templates contain `{{ .ConfirmationURL }}` and point at the production
   domain.
4. `GET /auth/v1/settings` (with the public anon key) reports
   `"mailer_autoconfirm": false` and `"disable_signup": false`.

If the recovery redirect URL is missing, Supabase replaces the redirect with the
Site URL and the customer lands on `/` instead of `/reset-password`. The SPA
still forwards a recovery URL that lands on `/login` (see `isRecoveryRedirect`),
but `/reset-password` is the intended destination.

---

## 2. Frontend routes and the redirect contract

| Route | Purpose |
|---|---|
| `/register` | Step 1 (email + password + consent), then step 2 (profile) |
| `/auth-callback` | Handles the signup confirmation link |
| `/login` | Sign in, forgot password, resend confirmation |
| `/complete-profile` | Step 2, reachable on its own after confirmation |
| `/reset-password` | Sets the new password from a recovery link |

- `signUp({ options: { emailRedirectTo: `${origin}/auth-callback` } })`
- `resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` })`
- `resend({ type: 'signup', options: { emailRedirectTo: `${origin}/auth-callback` } })`

`vercel.json` rewrites every path to `index.html`, so a direct hit on any route
returns the SPA (verified with HTTP 200 on production).

---

## 3. Production verification checklist

Run in an incognito window with a fresh address.

1. **Registration** — `/register` creates the account. With confirmation on, the
   customer sees “Check your email” and no session is created yet.
2. **Confirmation** — the email link opens `/auth-callback`, shows “Email
   Confirmed”, then `/login`.
3. **Resend** — the confirmation screen and `/login` (after an
   “email not confirmed” sign-in attempt) can resend the email. The copy is
   neutral: it never states whether the address exists.
4. **Duplicate signup** — registering an existing address shows the same neutral
   screen (anti-enumeration); no “already registered” message.
5. **Login before confirmation** — the login page reports the unconfirmed email
   and offers the resend action; it never routes to `/register`.
6. **Password recovery** — “Forgot password?” sends the link; it opens
   `/reset-password`, sets the new password, signs the recovery session out and
   returns to `/login`.
7. **Expired confirmation link** — the callback shows the localized “expired”
   message (never the provider's raw English text).
8. **Expired / already-used recovery link** — `/reset-password` shows the
   localized expired/used message and a button back to `/login`.
9. **Normal session on `/reset-password`** — a signed-in customer who opens the
   page without a recovery link is not allowed to set a password from that
   session; the page shows the invalid-link state.

Notes:
- Supabase does not always distinguish “expired” from “already used”; the
  expired copy states both outcomes and asks for a new link.
- The recovery session is marked in `sessionStorage`
  (`braxel-recovery-session`) so a page refresh keeps working while a normal
  signed-in session is never treated as a recovery session.
- A recovery session is signed out after the password is updated.

---

## 4. Email templates (recommended wording)

The templates are edited in **Authentication → Email Templates**. The copy below
is transactional only: no legal claims, no financial promises, no performance
claims. Brand colours match the SPA (`#05070A` background, `#C5A059` accent).

### Confirm signup

Subject: `Confirm your Braxel Markets account`

```html
<div style="background:#05070A;color:#ffffff;font-family:Arial,Helvetica,sans-serif;padding:32px">
  <h1 style="font-size:20px;margin:0 0 16px">Confirm your email</h1>
  <p style="color:#cbd5e1;font-size:14px;line-height:1.6">
    Thank you for creating a Braxel Markets account. Confirm your email address
    to finish setting up your access.
  </p>
  <p style="margin:24px 0">
    <a href="{{ .ConfirmationURL }}"
       style="background:#C5A059;color:#05070A;text-decoration:none;font-weight:bold;padding:14px 24px;display:inline-block">
      Confirm email
    </a>
  </p>
  <p style="color:#94a3b8;font-size:12px;line-height:1.6">
    If the button does not work, copy this link into your browser:<br>
    {{ .ConfirmationURL }}
  </p>
  <p style="color:#64748b;font-size:12px;line-height:1.6">
    If you did not create this account, you can ignore this email.
  </p>
</div>
```

### Reset password

Subject: `Reset your Braxel Markets password`

```html
<div style="background:#05070A;color:#ffffff;font-family:Arial,Helvetica,sans-serif;padding:32px">
  <h1 style="font-size:20px;margin:0 0 16px">Reset your password</h1>
  <p style="color:#cbd5e1;font-size:14px;line-height:1.6">
    We received a request to reset the password for your Braxel Markets account.
    Use the button below to choose a new password.
  </p>
  <p style="margin:24px 0">
    <a href="{{ .ConfirmationURL }}"
       style="background:#C5A059;color:#05070A;text-decoration:none;font-weight:bold;padding:14px 24px;display:inline-block">
      Choose a new password
    </a>
  </p>
  <p style="color:#94a3b8;font-size:12px;line-height:1.6">
    If the button does not work, copy this link into your browser:<br>
    {{ .ConfirmationURL }}
  </p>
  <p style="color:#64748b;font-size:12px;line-height:1.6">
    If you did not request a password reset, you can ignore this email; your
    password will not change.
  </p>
</div>
```

Both templates must use `{{ .ConfirmationURL }}` so Supabase appends the
`redirect_to` configured above. Do not hard-code a domain in the template.

---

## 5. Localized account-lifecycle messages

Added to all 11 locales (`en, pt, it, es, fr, de, ru, zh, ja, ar, he`):

| Key | Meaning |
|---|---|
| `auth.emailNotConfirmed` | Sign-in blocked until the email is confirmed |
| `auth.emailNotConfirmedHint` | Resend hint shown on the login page |
| `auth.resendConfirmation` | Resend action |
| `auth.resendSent` | Neutral resend acknowledgement |
| `auth.resetLinkExpired` | Recovery link invalid / expired / already used |
| `auth.resetLinkUsed` | Recovery link already consumed |
| `authCallback.expiredLink` | Confirmation link expired |
| `authCallback.usedLink` | Confirmation link already used |

Link failures are parsed from the redirect URL (`?error=` / `#error=`) and
classified by `readLinkError` / `classifyLinkError` in `src/lib/authFlow.ts`.
The provider's raw error text is never displayed.

---

## 6. Consent evidence (server-side)

- The step-1 checkbox is mandatory and its acceptance is sent to Supabase Auth
  as `terms_accepted: true`. The `handle_new_user_profile` trigger stamps
  `profiles.terms_accepted_at` / `privacy_accepted_at` with the **server** clock
  even if the customer abandons step 2.
- `profile-submit` stamps the timestamps (only the first acceptance) for any
  profile write; the browser never supplies a timestamp.
- `20261121000000_profile_consent_versions.sql` adds
  `profiles.terms_version` / `privacy_version` and a `BEFORE INSERT OR UPDATE`
  trigger that copies the current version from `public.legal_policy_versions`.
  The table is service-role only (RLS enabled, client roles revoked), so a
  customer cannot read or rewrite versions.
- The table is seeded with `draft` because the legal pages are still drafts with
  `[PLACEHOLDER]` values. Existing consents keep `NULL` versions; the migration
  does not fabricate a version for a past acceptance.
- When the lawyer approves a revision, update the row:

  ```sql
  UPDATE public.legal_policy_versions
     SET version = '<approved-version>', updated_at = now()
   WHERE document = 'terms';   -- and 'privacy'
  ```

  New acceptances then record the approved version with no code change.

**Open decision:** a Financial Disclaimer consent checkbox is **not** part of
registration. The approved text for such a consent does not exist (the Terms,
Privacy and Disclaimer pages are marked draft). Adding it is an owner/legal
decision; do not write the legal text in code.

---

## 7. Account suspension — not implemented

There is no suspension/disable state in the schema, no RPC and no UI. Blocking a
customer today means disabling the Supabase Auth user or flipping the
server-only `services.activated` / `applications.activation_status` flags, and
the SPA does not react to either.

This is recorded as a **separate business-rule decision**, not a bug. A future
implementation needs: a `suspended_at` / `suspension_reason` state, a
server-side check in the auth/session path, a localized message, an operator
action with an audit entry, and a defined effect on active plans.

---

## 8. Service deactivation after refund/cancellation — future checkout feature

Not implemented, by design. Before adding it, the owner must decide:

1. **Trigger** — which payment states (`refunded`, `canceled`) and which
   cancellation sources (customer request, operator, failed renewal) deactivate
   a service.
2. **Effective time** — immediately, at the end of the paid period, or after a
   grace window.
3. **Scope** — deactivate the `services` row, revoke dashboard access, revoke
   activation approvals, or all three.
4. **Reversibility** — how a re-purchase or re-activation restores access.
5. **Audit and notice** — who is notified, what the customer sees, and what is
   written to `payment_audit_log`.
6. **Refund vs chargeback** — whether a chargeback is treated differently from a
   voluntary refund.

Until those rules are approved, the server keeps the current terminal states
(`refunded` / `canceled` are final in `_shared/plans.ts`) without automatically
deactivating a service.

---

## 9. Tests and gates

| Command | What it covers |
|---|---|
| `npx tsc --noEmit -p tsconfig.app.json` | Type check |
| `npm run lint` | Lint (0 errors) |
| `npm run build` | Production build |
| `npm run check:i18n` | 11 locales, key parity, placeholders, plurals |
| `npm run check:profile` | Profile validation parity + consent-version migration/trigger |
| `npm run check:activation` | Activation contract unchanged |
| `npm run check:auth` | Link classification helpers + register/login/callback/reset wiring |
| `npm run check:security` | Security helpers and wiring |
| `make test-migrations` | Applies the whole chain, then re-applies for idempotency (needs Docker) |
