# Institutional Support Inbox — Setup

The public "Institutional Support" form (`/contact`) routes every message to
`marketsbraxel@ouvidor.net` through the `support-message` Edge Function, which
sends via Resend. No custom domain is required to start.

## How it works

```
Browser form (/contact)
  -> POST /functions/v1/support-message   (validates, honeypot, rate limit)
     -> _shared/email.ts sendSupportMessage()
        -> Resend API
           to:      SUPPORT_INBOX_EMAIL
           from:    EMAIL_FROM
           reply-to: the customer's email
           subject:  "[Braxel Support] <topic> — <name>"
```

The Resend API key and the inbox address exist only server-side; neither is in
the client bundle.

## Environment variables

Set these as **Supabase Edge Function secrets**
(Supabase Dashboard → Edge Functions → Secrets). Names only — never commit
values.

| Name | Purpose | Value until a domain is verified |
| --- | --- | --- |
| `RESEND_API_KEY` | Resend API key (starts with `re_`) | your Resend key |
| `EMAIL_FROM` | Sender on every outgoing email | `onboarding@resend.dev` |
| `EMAIL_TO` | Owner-notification inbox | `marketsbraxel@ouvidor.net` |
| `SUPPORT_INBOX_EMAIL` | Public support form recipient | `marketsbraxel@ouvidor.net` |
| `EMAIL_TEST_SECRET` | Guards the `/email-test` endpoint | any long random string |

`SUPPORT_INBOX_EMAIL` falls back to `EMAIL_TO` when unset, so setting `EMAIL_TO`
alone is enough. It only ever applies to owner/support email — customer-facing
emails keep their own routing.

The frontend needs **no** new Vercel variables for this feature.

## Resend account requirement (no domain yet)

While there is no verified domain, Resend only delivers to the **email address
that owns the Resend account**, and only from `onboarding@resend.dev`. So:

1. Create/log in to the Resend account whose email is `marketsbraxel@ouvidor.net`
   (or add it as an authorized recipient).
2. Keep `EMAIL_FROM=onboarding@resend.dev`.
3. Set `SUPPORT_INBOX_EMAIL=marketsbraxel@ouvidor.net`.

If the account email differs from the inbox, Resend returns a 403 and the form
shows its error state until this is corrected.

## Switching to a real domain later (env-only, no code change)

1. Buy a domain (e.g. `braxelmarkets.com`).
2. In Resend → Domains, add the domain and create the DNS records (SPF, DKIM,
   DMARC). Wait for "Verified".
3. In Supabase → Edge Functions → Secrets, change:
   `EMAIL_FROM=Braxel Markets <notifications@your-domain.com>`
4. Optionally set up forwarding from the domain (e.g. `support@your-domain.com`)
   to `marketsbraxel@ouvidor.net`, and point `SUPPORT_INBOX_EMAIL` at it.
5. Optionally replace the public `mailto:` links with the branded address.

No code change and no redeploy of the app are required for steps 3–4; only the
Edge Function secret changes. If the public email address shown on the site
changes, update it in `src/pages/Contact.tsx`, `src/components/Footer.tsx`,
`src/components/PaymentsDisabledNotice.tsx`, `src/components/SupportChatbot.tsx`
and the `contact.messageFailed` string in `src/i18n.ts`.

## Deploying the function

The frontend calls the function at
`https://<project-ref>.supabase.co/functions/v1/support-message`. Deploy it to
**the same project the site uses** (project ref `ymzdxifedtjwkxkzfwqu`):

```bash
supabase link --project-ref ymzdxifedtjwkxkzfwqu
supabase functions deploy support-message
```

Pushing to `main` deploys the **site** on Vercel, but it does **not** deploy
Edge Functions — publishing the function is a manual Supabase step. If it is
missing, the form's `fetch` receives a `404` and the visitor sees the generic
error, so always confirm the deploy below.

## Verify the deploy (troubleshooting)

An unauthenticated request must return **401** (function exists, auth required).
A **404** means the function is not deployed to that project:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  https://ymzdxifedtjwkxkzfwqu.supabase.co/functions/v1/support-message \
  -H "Content-Type: application/json" -d '{}'
# 401 -> deployed and healthy
# 404 -> not deployed (run the deploy command above)
```

You can also list what is live: `supabase functions list --project-ref ymzdxifedtjwkxkzfwqu`.

If the endpoint returns **502**, the function ran but Resend refused the send
(most often the account-email mismatch described above). Check the function logs
in Supabase → Edge Functions → `support-message` → Logs; the reason is logged as
`[email] resend request failed` or `[email] support message skipped`.
