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

```bash
supabase functions deploy support-message
```
