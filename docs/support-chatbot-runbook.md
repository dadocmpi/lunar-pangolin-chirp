# Support chatbot runbook

The Braxel Markets AI support assistant answers customer questions from a fixed
approved knowledge base. It is a text-only assistant: it has no tools, no
database access and no ability to change a payment, account, activation or
connection status.

## What it is

- **Edge Function:** `support-chat` (`verify_jwt = false`).
- **UI:** a circular headset launcher fixed at the bottom-right of the home
  page and the dashboard, opening a branded support window on desktop and a
  near-full-width bottom sheet on mobile (`src/components/SupportChatbot.tsx`).
  It includes suggested questions, a loading state, an error state with retry,
  a human-handoff action, focus management and reduced-motion support.
- **Client:** `src/lib/supportChat.ts`.
- **Server logic:** `supabase/functions/_shared/chat/`.
- **Kill switch:** `SUPPORT_CHAT_ENABLED` (exact `"false"` disables it).

The function is public because visitors who cannot sign in still need help with
account creation, email confirmation and password recovery. A bearer JWT is
optional; when present it is verified against Supabase Auth and used only as a
rate-limit key. The request body never supplies a user id.

## Provider and secret

The chatbot talks to a model through a small server-side provider abstraction
(`supabase/functions/_shared/chat/provider.ts`). Two providers are supported and
selected by configuration; both use the same server-only key posture.

| Provider | Status | Endpoint | Key |
| --- | --- | --- | --- |
| `openrouter` | **Default** | `https://openrouter.ai/api/v1/chat/completions` (OpenAI-compatible) | `CHAT_AI_API_KEY` only |
| `gemini` | Optional | `generativelanguage.googleapis.com` | `CHAT_AI_API_KEY`, else `KYC_AI_API_KEY` |

The OpenRouter request sends the key in the `Authorization: Bearer …` header,
never in the URL, and adds the optional attribution headers
`HTTP-Referer: https://braxelmarkets.vercel.app` and
`X-OpenRouter-Title: Braxel Markets`. The key is never logged and never
returned in an error: a failure surfaces as a stable code
(`ai_provider_unauthorized`, `ai_provider_rate_limited`, `ai_provider_http_<n>`,
`ai_provider_network`, `ai_provider_timeout`).

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `CHAT_AI_PROVIDER` | No | `openrouter` | `openrouter` (default) or `gemini`. An unknown id fails closed. |
| `CHAT_AI_API_KEY` | Yes (for AI answers) | — | Server-side OpenRouter key. The only key OpenRouter ever receives. |
| `CHAT_AI_MODEL` | No | `openrouter/free` (openrouter) / `gemini-2.0-flash` (gemini) | Model id passed to the provider. |
| `KYC_AI_API_KEY` | No | — | Existing **Gemini** key. Reused only by the gemini provider; never sent to OpenRouter. |
| `SUPPORT_CHAT_ENABLED` | No | on | Only the exact string `"false"` disables the function. |
| `SUPPORT_CHAT_TIMEOUT_MS` | No | `20000` | Provider timeout, clamped to 2000–30000 ms. |
| `APP_URL` | No | `https://braxelmarkets.vercel.app` | Origin used to build official source links. |
| `SUPPORT_INBOX_EMAIL` | No | `marketsbraxel@ouvidor.net` | Human handoff address. |

Provider resolution order when `CHAT_AI_PROVIDER` is unset: a `CHAT_AI_API_KEY`
selects `openrouter`; otherwise a legacy `KYC_AI_API_KEY` selects `gemini`;
otherwise the default `openrouter` (with no key, which yields the deterministic
fallback).

Set the key as a **Supabase Edge Function secret**, never in a `VITE_*`
variable. Vite inlines `VITE_*` values into the browser bundle.

**Without a key the chatbot still works** using deterministic answers from the
approved knowledge base. It never fabricates an answer.

## Knowledge sources

`supabase/functions/_shared/chat/knowledge.ts` is the single approved source.
It was audited against `src/App.tsx`, the public pages, `src/i18n.ts`,
`src/lib/plans.ts`, the canonical server `PLANS` table and `AGENTS.md`, and
covers:

- every public route and page (`public_routes`)
- company overview, leadership and business address (`company_overview`)
- how the service works (`how_it_works`)
- account creation, email confirmation and password recovery
- profile and two-step signup details (`profile_and_signup`)
- plans and pricing (read from the canonical server `PLANS` table)
- prop-firm accounts and the affiliate disclosure (`accounts_prop_firms`)
- checkout (`checkout`) and card / Wise bank transfer / crypto
  (`payment_methods`)
- payment status (`payment_status`)
- refunds and cancellation, routed to a person (`refunds_cancellation`)
- onboarding (`onboarding`) and account activation (`activation`)
- dashboard features (`dashboard_usage`)
- Tradovate connection and its read-only limits (`tradovate_connection`)
- withdrawals and the server-side KYC gate (`withdrawal_kyc`)
- support procedures (`support_procedures`)
- contact details and business address (`contact_and_company`)
- the public FAQ topics (`faq_help`)
- what the assistant can and cannot do (`account_actions`)
- chat privacy and security (`security_privacy`)
- the 11 supported languages (`languages`)
- Terms, Privacy, Disclaimer and the risk warning (marked as drafts)

The knowledge base never invents prices, wallet addresses, bank details, legal
claims, Tradovate compatibility or company promises. It does not claim to know
an individual customer's payment, activation, account or trading status.

Official links are built server-side from `APP_URL`; the model cannot supply a
URL. An answer with no approved article is returned as **unknown**, never as a
guess.

## Behaviour rules

1. Identifies itself as an AI support assistant.
2. Answers in the language of the customer's **latest message**
   (`en, pt, it, es, fr, de, ru, zh, ja, ar, he`), not the website locale.
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

## Language detection

`supabase/functions/_shared/chat/language.ts` is deterministic and pure:

1. Script ranges decide Russian, Chinese, Japanese, Arabic and Hebrew.
2. For Latin scripts, distinctive function words and diacritics are scored;
   the winner needs a minimum score and margin.
3. The latest message wins when it is clear. A short/ambiguous message
   (`ok`, `lo`, `hi`, `sim`) reuses the most recent clearly detected **user**
   language from the supplied history. The website locale is used only when no
   message language can be detected.
4. The detected language is written explicitly into the system prompt, and a
   model completion that confidently answers in a different language is not
   shown (the localized deterministic fallback is used instead).

All deterministic messages — unknown, timeout, provider error, rate limit,
disabled feature, refusals and every human-handoff category — exist in
`supabase/functions/_shared/chat/messages.ts` for all 11 locales. The function
also localizes its 429/503/504/400 bodies, so a Portuguese customer does not get
an English error because the site locale is English.

## Privacy and retention

- **Stored:** nothing. No table, no log of message content, no conversation id.
- **Logged:** reply type, provider name, escalation flag, whether the caller
  was authenticated, the detected locale and where the language decision came
  from. No message text, no user id, no email.
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
3. Set the secrets:
   ```bash
   supabase secrets set CHAT_AI_PROVIDER=openrouter
   supabase secrets set CHAT_AI_MODEL=openrouter/free
   supabase secrets set CHAT_AI_API_KEY=<server-side OpenRouter key>
   ```
   `openrouter/free` is the documented default; set `CHAT_AI_MODEL` to any
   OpenRouter model id your account can use. To keep using Gemini instead:
   `CHAT_AI_PROVIDER=gemini` with a Gemini key in `CHAT_AI_API_KEY`.
4. Optional: set `SUPPORT_CHAT_TIMEOUT_MS`, `APP_URL`.
5. Verify: open the site, send “How do I reset my password?” and confirm the
   answer and the `/reset-password` source link. Then check the function log for
   `[support-chat] { type, provider: "openrouter", … }` — it must never contain
   the key or message text.
6. To disable: `supabase secrets set SUPPORT_CHAT_ENABLED=false`. The endpoint
   returns 503 and the UI hides the panel on the next load.

## Tests

```bash
deno run -A supabase/functions/_test/support-chat-tests.ts   # or: make test-support-chat
npm run check:chatbot
```

The suite (802 checks) covers grounded answers, unknown questions, prompt
injection, financial-advice requests, secret requests and sharing, cross-user
access, timeouts, rate limiting, human escalation, the absence of any privileged
payment/account action, and all 11 locales. Sections [15]–[17] cover
deterministic language detection (English, Portuguese, Spanish, Italian, French,
German, Russian, Chinese, Japanese, Arabic, Hebrew, mixed input, short ambiguous
input, history fallback, website-locale last resort), localized fallbacks and
provider failure in every language. Section [18] covers the expanded knowledge
base and the public questions for every major site section. Section [19] covers
the widget UI contract (headset icon, states, accessibility, mobile/desktop,
reduced motion). The provider sections [12]–[12b] cover OpenRouter provider
selection and the request shape (endpoint, bearer header,
`HTTP-Referer`/`X-OpenRouter-Title`, model default and override) plus success,
invalid key (401), rate limit (429), 5xx, network failure and timeout, asserting
no key or provider body ever reaches the user.

## Known limitations

- Without `CHAT_AI_API_KEY` / `KYC_AI_API_KEY` the deterministic answer is the
  full approved article for English, and a localized pointer to the official
  page plus source links for the other 10 locales. The model path is what
  produces a full prose answer in those languages.
- The default OpenRouter model `openrouter/free` is a free-tier route and can be
  rate limited or slow. Set `CHAT_AI_MODEL` to a paid model for production
  traffic. A provider 429 degrades to the approved-knowledge answer (it does not
  fail the request); a provider timeout returns the localized timeout state.
- The legal pages are drafts pending legal review. The assistant links to them
  and escalates legal questions; it does not give legal advice.
- Rate limiting is per Edge instance (soft). The hard ceiling remains the
  platform gateway and the optional verified JWT.
- There is no conversation transcript for human support. If a customer needs a
  human, the handoff is by email and they should restate the issue there.
- The assistant cannot look up an individual payment, account or activation
  status. It explains the process and directs status questions to the dashboard
  and human support.
