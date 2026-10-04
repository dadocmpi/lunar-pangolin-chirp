# Client dashboard / trading terminal overhaul — report

Branch: `feat/client-dashboard-overhaul` · base `main` @ `3e68af5`
Commits: `1c136bb`, `12f5df1`, `c6d04b0`, `1a42526`, `f447a0a`, `357f86b`, `064d4ef`, `6adf913`

---

## 1. Audit of the dashboard (what exists today)

The client terminal is one route (`/dashboard`, `src/pages/Dashboard.tsx`) with six
sub-views: **services**, **tradovate**, **performance**, **withdraw**, **auditlog**,
**settings**.

| Component / hook / function | Data it shows | Where the data came from (before) | After |
|---|---|---|---|
| `Dashboard.tsx` (services view) | allocations, balances, KYC banner | `services` table (real) | unchanged, real |
| `Dashboard.tsx` (performance view) | growth %, drawdown, monthly returns | **mock** `+12.4% / -2.1% / $-axis` | real `trades` via `computePerformance` |
| `Dashboard.tsx` (auditlog) | trade rows | `trades` table (real) | unchanged, real |
| `PerformanceChart.tsx` | growth chart | **mock series** | **deleted** (replaced by `terminal/PerformancePanel`) |
| `ProfitCalculator.tsx` | projected profit | **hardcoded** | **deleted** (unused) |
| `LiveSignals.tsx` | demo signal feed | **hardcoded demo** | **deleted** (unused) |
| `RiskTransparency.tsx` | risk copy | static | **deleted** (unused) |
| `TradovateTrades.tsx` | trade list | mixed mock/real | **deleted** (replaced by `terminal/*`) |
| `terminal/TradingTerminal.tsx` | whole terminal | new | real, via `useTradovateTerminal` |
| `terminal/AccountSummary.tsx` | balance/equity/margin/P&L | new | live `tradovate-dashboard` snapshot |
| `terminal/AccountSelector.tsx` | account picker | new | server-driven `integrations` list |
| `terminal/OpenPositions.tsx` | open positions | new | live `/position/list` |
| `terminal/OpenOrders.tsx` | working orders | new | live `/order/list` + `/orderVersion/list` |
| `terminal/TradeJournal.tsx` | closed trades | new | `trades` (FIFO-reconstructed) |
| `terminal/PerformancePanel.tsx` | stats + equity curve + calendar | new | `tradovate-data.performance` |
| `useTradovateTerminal.ts` | data loader | new | both Edge Functions |
| `lib/dashboardData.ts` | view models | pure resolvers | unchanged, real |
| `lib/terminalFormat.ts` | Intl formatting | new | locale-aware USD/UTC |
| `supabase/functions/tradovate-dashboard` | live snapshot | new | provider + cache table |
| `supabase/functions/tradovate-data` | trades + stats | extended | real rows + server stats |

**Flagged and fixed:** the mock `+12.4%`/`-2.1%`/`$-axis` performance block, the demo
signal feed, the unused profit calculator and the old mixed mock/real trade list.
**Flagged and removed:** 4 unused components, 33 dead demo i18n keys
(`growthPerformanceMtd`, `demoData`, `demoDataNotice`).
**KYC:** the terminal is **not** blocked; the only gate is `WithdrawalKycGate` inside
the **withdraw** view (correct), plus a non-blocking, session-dismissible
`KycReminderBanner` at the top. No `REQUIRE_TRADOVATE_CONNECTION` and no router guard
exist anywhere (pinned by `tradovate-dashboard-tests.ts` / `tradovate-welcome-tests.ts`).
**Dead code / errors:** 4 deleted components; `tsc` 0 errors; lint 0 errors (11
baseline warnings, all pre-existing fast-refresh/exhaustive-deps).

---

## 2. Terminal data now comes from the client's Tradovate account

| Requirement | Where it comes from |
|---|---|
| Balance, equity, net liq, available/initial/maintenance margin, open P&L, realized P&L (day/week/month/all-time) | `tradovate-dashboard` → `/cashBalance/getCashBalanceSnapshot`, cached in `tradovate_account_snapshots` (`TRADOVATE_SNAPSHOT_TTL_SECONDS`, default 20s; `?fresh=1` bypasses) |
| Open positions (symbol, side, qty, avg price) | `tradovate-dashboard` → `/position/list` |
| Working orders + order history | `tradovate-dashboard` → `/order/list` + `/orderVersion/list` |
| Closed trades / fills (entry, exit, duration, P&L, fees, symbol) | `tradovate-data` → `trades` / `tradovate_fills` (FIFO reconstruction in `_shared/tradovate/pnl.ts`) |
| Win rate, profit factor, avg win/loss, max drawdown, best/worst, equity curve, P&L calendar | `tradovate-data` → `_shared/tradovate/performance.ts` (same module the browser uses) |
| Demo vs live, multiple accounts | `integrations` list + `AccountSelector` (server-driven) |
| Futures specs (tick/point value, roll MGCZ6/MESZ6) | `POINT_VALUES` table + `rootFromSymbol` (keyed by contract so a roll never nets months) |
| USD + local-timezone formatting | `src/lib/terminalFormat.ts` (Intl, USD, UTC stored / local shown) |

**Security / robustness (already in place, verified):**
- Credentials are AES-256-GCM envelopes, server-only; `integration_credentials` has
  **no** authenticated RLS policy (explicit deny). Tokens never reach the browser.
- Ownership is server-side: `requireUser` reads the JWT; any body/query `user_id` is
  ignored; every service-role query is scoped by `user_id`.
- **New in this branch:** the access token is cached *inside the encrypted envelope*
  and reused while valid (`ensureToken({ stored })` + `storeSessionToken`), so polls
  stop re-authenticating on every call — fewer "novel" auth requests → fewer
  `p-ticket`/`p-captcha` penalties.
- Rate limits: plain 429 → exponential backoff; `p-time`/`p-ticket` → wait + resend;
  `p-captcha` → ~1h `CircuitOpenError` → UI `circuit_open`; 429 → `rate_limited`.
- RLS review: `integrations`/`tradovate_fills`/`trades`/`tradovate_account_snapshots`
  are owner-read-only through `integrations.user_id = auth.uid()`; all writes are
  service-role with `WITH CHECK (false)` deny policies. 2-user test: `bash
  supabase/functions/_test/rls/run.sh` (needs Docker).
- Loading skeletons, empty states, error+retry, "last synced" + manual refresh, and a
  "Disconnect Tradovate" action (deletes the credential row) are all implemented.

---

## 3. i18n review (11 locales)

- **0 hardcoded strings** in the dashboard surface — enforced by
  `npm run check:no-hardcoded` (`scripts/check-no-hardcoded-text.mjs`).
- **Key parity** in all 11 locales — `npm run check:i18n` reports
  `keys=1066 missing=0 extra=0 empty=0 interp=0 plural=0` for every locale.
- **Pluralization:** real CLDR categories per locale (`terminal.calendarTrades`,
  `application.note_limit`): en/de `one,other`; pt/it/es/fr `one,many,other`;
  ru `one,few,many,other`; zh/ja `other`; ar `zero,one,two,few,many,other`;
  he `one,two,other`. The gate validates the exact category set per locale.
- **Interpolation:** only `{{count}}` is allowed in plural forms; all other
  placeholders are diffed against EN.
- **Formatting:** every number/currency/percent/date/duration goes through
  `Intl` with the active locale (`terminalFormat.ts`).
- **RTL (ar/he):** all physical direction utilities in the dashboard surface were
  converted to logical (`ms/me/ps/pe`, `start/end`, `text-start/end`); verified the
  compiled CSS emits each logical class.
- **Long languages (de/ru/fr):** layout uses `min-w` scroll tables + `truncate`
  where needed; no fixed-width text containers were added.
- **Not touched (as requested):** the legal `[PLACEHOLDER]` texts remain, listed below.

### Legal `[PLACEHOLDER]` keys (left untouched)
`privacyPage.legalBasisText`, `privacyPage.retentionText`,
`privacyPage.thirdPartiesText`, `privacyPage.userRightsText`,
`privacyPage.contactText`, `disclaimerPage.notLicensedText`,
`termsPage.accountTerminationText`, `termsPage.disputeResolutionText`,
`termsPage.changesToTermsText`, `termsPage.effectiveDateText`,
`termsPage.contactText`.

---

## 4. UI/UX and quality

- Responsive 360px → desktop; dark theme consistent (`bg-[#05070A]`/`#121212`).
- Accessibility: table `scope="col"`, `role="status"`/`aria-busy` skeletons, chart
  `aria-label`, `sr-only` labels on the account selector.
- KYC: only the dismissible top banner remains; the withdraw-view gate is unchanged.
- `npm run build` passes clean; `tsc` 0 errors; lint 0 errors.

---

## 5. Verification (paste-ready)

```
== i18n ==
en: keys=1066 missing=0 extra=0 empty=0 interp=0 plural=0
pt: keys=1066 missing=0 extra=0 empty=0 interp=0 plural=0
it: keys=1066 missing=0 extra=0 empty=0 interp=0 plural=0
es: keys=1066 missing=0 extra=0 empty=0 interp=0 plural=0
fr: keys=1066 missing=0 extra=0 empty=0 interp=0 plural=0
de: keys=1066 missing=0 extra=0 empty=0 interp=0 plural=0
ru: keys=1066 missing=0 extra=0 empty=0 interp=0 plural=0
zh: keys=1066 missing=0 extra=0 empty=0 interp=0 plural=0
ja: keys=1066 missing=0 extra=0 empty=0 interp=0 plural=0
ar: keys=1066 missing=0 extra=0 empty=0 interp=0 plural=0
he: keys=1066 missing=0 extra=0 empty=0 interp=0 plural=0

== tsc ==    tsc: 0 errors
== lint ==   ✖ 11 problems (0 errors, 11 warnings)   [baseline]
== build ==  ✓ built in ~5.5s
== gates ==  dashboard data check passed / tradovate contract check passed /
             check-no-hardcoded-text passed (14 files scanned) / payment contract check passed
== deno ==   make test-tradovate → 19/10/20/6/82/71/7/4/7/16/48/30/24 passed, 0 failed
```

### Manual test checklist
1. Connect Tradovate (demo) → balance/positions/orders appear; "last synced" shows.
2. Open a position → it appears in Open positions; close it → appears in the journal
   and the stats/equity curve update.
3. Disconnect Tradovate → credential row deleted; terminal shows the empty state.
4. Switch each language, especially **ar / he / ru / de** → labels, RTL, tables.
5. Mobile 360px → tables scroll, no overflow.
6. New user with no Tradovate → empty state, no blocking screen.
7. User with KYC pending → banner only; withdraw view shows the gate.

### Adversarial edge cases tested
| Case | UI behaviour |
|---|---|
| Wrong password | `invalid_credentials` ("Wrong credentials") |
| Expired token | token reused until expiry, then silent re-auth; if rejected → `session_expired` |
| Account with zero trades | `hasData:false` → "No performance data yet" (no fake numbers) |
| Open position, no history | positions panel filled, journal empty state |
| Huge trade history | server caps at 2000 trades / 5000 fills; tables scroll |
| API down / function 404 | `service_unavailable`; snapshot `null` → explicit "not available" |
| Rate limit / captcha | `rate_limited` / `circuit_open` with wait messaging |
| Feature off (`TRADOVATE_ENABLED=false`) | `not_enabled` (never "unavailable"); card hides |

---

## 6. Edge functions changed + no-CLI deploy

The three Tradovate functions that changed are bundled (esbuild inlines `_shared/*`)
into **single self-contained files** under `docs/edge-functions/`:

- `docs/edge-functions/tradovate-dashboard.ts` (**new**)
- `docs/edge-functions/tradovate-data.ts` (updated)
- `docs/edge-functions/tradovate-connect.ts`, `-disconnect.ts`, `-status.ts`, `-sync.ts`
  (included because the shared credential/token modules they import changed)

Regenerate any time with `npm run bundle:functions`.

**Deploy from the Supabase dashboard (no CLI):**
1. Apply migration `20261009000000_tradovate_dashboard_snapshot.sql` first
   (SQL editor) — or push the branch and let the release workflow do it.
2. Edge Functions → the function → paste the whole `docs/edge-functions/<name>.ts`
   file → Deploy.
3. Repeat for each of the six functions.

**Secrets / env vars required (Edge Function secrets):**
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`TRADOVATE_ENCRYPTION_KEY`, `TRADOVATE_APP_CID`, `TRADOVATE_APP_SECRET`
(optional `TRADOVATE_APP_ID`, `TRADOVATE_APP_VERSION`), `TRADOVATE_ENABLED`,
`TRADOVATE_SNAPSHOT_TTL_SECONDS`, optional `TRADOVATE_ALLOWED_ENVIRONMENTS`.

---

## 7. Remaining risks / decisions needed

1. **"Part 2" (possibly invoicing) was truncated in my context** — I implemented the
   Part 2 in the task text (real terminal data). If there is a separate invoicing
   Part 2, please share it.
2. **`pnl.ts` is "NOT YET VERIFIED against real Tradovate fill data"** — the P&L math
   is unit-tested but not yet confirmed against a live demo account.
3. **Live trading stays disabled** (`TRADOVATE_ALLOWED_ENVIRONMENTS` unset → demo-only).
4. **Migration head is now `20261009000000`** (was `20261008000000`); update the
   release workflow's expected head if it is pinned.
5. **`pnl.ts` default fallback point value** is `1` for unknown roots — an unknown
   root would mis-scale P&L; consider failing to "not available" instead.
6. Legal `[PLACEHOLDER]` texts still need owner copy.
