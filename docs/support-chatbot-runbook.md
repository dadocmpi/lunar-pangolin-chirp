# Support chatbot runbook

The Braxel Markets AI support assistant answers customer questions from a fixed
approved knowledge base. It is a text-only assistant: it has no tools, no
database access and no ability to change a payment, account, activation or
connection status.

## What it is

- **Edge Function:** `support-chat` (`verify_jwt = false`).
- **UI:** floating panel on the home page and the dashboard
  (`src/components/SupportChatbot.tsx`).
- **Client:** `src/lib/supportChat.ts`.
- **Server logic:** `supabase/functions/_shared/chat/`.
- **Kill switch:** `SUPPORT_CHAT_ENABLED` (exact `"false"` disables it).

The function is public because visitors who cannot sign in still need help with
account creation, email confirmation and password recovery. A bearer JWT is
optional; when present it is verified against Supabase Auth and used only as a
rate-limit key. The request body never supplies a user id.

## Provider and secret

The chatbot reuses the existing Gemini AI integration and the same server-only
key posture as the KYC AI check.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `CHAT_AI_API_KEY` | Preferred | — | Dedicated Gemini key for the chatbot. |
| `KYC_AI_API_KEY` | Fallback | — | Existing Gemini key, reused when `CHAT_AI_API_KEY` is unset. |
| `CHAT_AI_MODEL` | No | `gemini-2.0-flash` | Gemini model id. |
| `CHAT_AI_PROVIDER` | No | `gemini` | Provider registry id. |
| `SUPPORT_CHAT_ENABLED` | No | on | Only the exact string `"false"` disables the function. |
| `SUPPORT_CHAT_TIMEOUT_MS` | No | `20000` | Provider timeout, clamped to 2000–30000 ms. |
| `APP_URL` | No | `https://braxelmarkets.vercel.app` | Origin used to build official source links. |
| `SUPPORT_INBOX_EMAIL` | No | `marketsbraxel@ouvidor.net` | Human handoff address. |

Set the key as a **Supabase Edge Function secret**, never in a `VITE_*`
variable. Vite inlines `VITE_*` values into the browser bundle.

**Without a key the chatbot still works** using deterministic answers from the
approved knowledge base. It never fabricates an answer.

## Knowledge sources

`supabase/functions/_shared/chat/knowledge.ts` is the single approved source.
It covers:

- account creation
- email confirmation
- password recovery
- plans and pricing (read from the canonical server `PLANS` table)
- checkout and payment methods
- payment status
- onboarding
- account activation
- dashboard usage
- Tradovate connection status
- support procedures
- Terms, Privacy, Disclaimer and the risk warning (marked as drafts)

Official links are built server-side from `APP_URL`; the model cannot supply a
URL. An answer with no approved article is returned as **unknown**, never as a
guess.

## Behaviour rules

1. Identifies itself as an AI support assistant.
2. Answers in the requested locale (`en, pt, it, es, fr, de, ru, zh, ja, ar, he`).
3. Says clearly when it does not know.
4. Includes official Braxel links when available.
5. Escalates payment disputes, KYC, account suspension, legal questions,
   provider problems and refund requests to human support.
6. Never gives personalised financial, investment, tax or legal advice.
7. Never promises profits, payouts, account approval, safety or returns.
8. Never asks for passwords, card numbers, Tradovate credentials, API keys, MFA
   codes or private keys. If a customer pastes a secret, the assistant refuses
   and does not echo it.
9. Performs no action: no activation, payment approval, status change,
   connection, order or withdrawal.
10. Never claims a status changed unless the server verified it (it cannot
    verify or change anything).
11. Conversations are per browser tab; there is no conversation id.
12. Conversations are not stored.

## Privacy and retention

- **Stored:** nothing. No table, no log of message content, no conversation id.
- **Logged:** reply type, provider name, escalation flag and whether the caller
  was authenticated. No message text, no user id, no email.
- **Sent to the provider:** the recent turns (up to 8) and the approved
  knowledge prompt. No account data, no secrets.
- **Response header:** `Cache-Control: no-store`.
- **Client:** messages live in React state only; no `localStorage`,
  `sessionStorage` or cookie persistence.

Because the server is stateless and never reads a user id from the body, one
user cannot read another user's conversation through this API.

## Limits

- JSON body cap: 32 KB.
- Message cap: 2000 characters.
- History cap: 8 turns.
- Reply cap: 4000 characters.
- Rate limit: 30 messages / 10 min per verified user and 40 / 10 min per IP
  (soft, per Edge instance). A 429 response carries `Retry-After: 600`.
- Timeout: 20 s by default; a timeout returns HTTP 504 and a localized error.

## Escalation categories

`payment_dispute`, `kyc`, `account_suspension`, `legal`, `provider_problem`,
`refund`, `human_request`. Every escalation returns the support email and a
link to `/contact`.

## Manual configuration

1. Apply the migration/deploy workflow as usual. `support-chat` has no new
   table and no migration.
2. Deploy the function:
   `supabase functions deploy support-chat` (or paste
   `docs/edge-functions/support-chat.ts` into the dashboard editor).
3. Set the secret:
   `supabase secrets set CHAT_AI_API_KEY=<your Gemini key>`.
4. Optional: set `CHAT_AI_MODEL`, `SUPPORT_CHAT_TIMEOUT_MS`, `APP_URL`.
5. Verify: open the site, send “How do I reset my password?” and confirm the
   answer and the `/reset-password` source link.
6. To disable: `supabase secrets set SUPPORT_CHAT_ENABLED=false`. The endpoint
   returns 503 and the UI hides the panel on the next load.

## Tests

```bash
deno run -A supabase/functions/_test/support-chat-tests.ts   # or: make test-support-chat
npm run check:chatbot
```

The suite covers grounded answers, unknown questions, prompt injection,
financial-advice requests, secret requests and sharing, cross-user access,
timeouts, rate limiting, human escalation, the absence of any privileged
payment/account action, and all 11 locales.

## Known limitations

- Without `CHAT_AI_API_KEY` / `KYC_AI_API_KEY` the deterministic answers are
  **English**; the model path is what answers in the other 10 locales.
- The legal pages are drafts pending legal review. The assistant links to them
  and escalates legal questions; it does not give legal advice.
- Rate limiting is per Edge instance (soft). The hard ceiling remains the
  platform gateway and the optional verified JWT.
- There is no conversation transcript for human support. If a customer needs a
  human, the handoff is by email and they should restate the issue there.
- The assistant cannot look up an individual payment, account or activation
  status. It explains the process and directs status questions to the dashboard
  and human support.
