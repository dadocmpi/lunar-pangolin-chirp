# Braxel Markets — Full-Site Audit (i18n, currency, a11y, SEO)

Branch: `audit/full-site-review-i18n` · Base: `main`
Scope: 11 locales (`en, pt, it, es, fr, de, ru, zh, ja, ar, he`), React 19 + TS + Vite + i18next + Tailwind/shadcn.

## 1. Overall status

**Merged / merge-ready.** All quality gates green at the tip of the branch:

| Gate | Command | Result |
|---|---|---|
| Type-check | `npx tsc --noEmit -p tsconfig.app.json` | PASS |
| i18n integrity | `npm run check:i18n` | PASS (11/11 locales: 807 keys, 0 missing, 0 extra, 0 empty, 0 interpolation mismatches) |
| Lint | `npm run lint` | PASS (0 errors; ~11 pre-existing warnings) |
| Production build | `npm run build` | PASS (`exit 0`) |
| Runtime smoke | headless Chromium, 11 locales × 10 routes | 0 console errors, `<html lang>`/`dir` correct everywhere, no raw `key.path` leaks |

Baseline note: `deno` is not installed in this environment, so the Deno test harness (`make test`) could not be run here — it is unrelated to the front-end changes.

## 2. Languages audited

All 11 locales share the same 807-key tree. "Fixed" counts values changed in this branch (including the translation batches landed in earlier commits on the branch).

| Locale | Keys | Missing | Empty | Fixed (branch) | Remaining concerns |
|---|---|---|---|---|---|
| en | 807 | 0 | 0 | source | 11 legal strings contain `[PLACEHOLDER: …]` (see §4) |
| pt | 807 | 0 | 0 | ~200 | legal placeholders; `drawdown`/`status`/`network.*` intentionally EN |
| it | 807 | 0 | 0 | ~200 | legal placeholders |
| es | 807 | 0 | 0 | ~200 | legal placeholders |
| fr | 807 | 0 | 0 | ~200 | legal placeholders |
| de | 807 | 0 | 0 | ~200 | legal placeholders |
| ru | 807 | 0 | 0 | ~200 | legal placeholders |
| zh | 807 | 0 | 0 | ~200 | legal placeholders |
| ja | 807 | 0 | 0 | ~200 | legal placeholders |
| ar | 807 | 0 | 0 | ~200 | legal placeholders; RTL: layout uses flex/grid + `text-left` in a few nav spots |
| he | 807 | 0 | 0 | ~200 | legal placeholders; same RTL note |

## 3. Bugs found vs. fixed

### Critical
1. **Language switcher lost the current page and did not persist.** Switching language navigated to `/` and a reload reverted to the previously stored locale because the detector ranked `localStorage` above the URL. Fixed: the switcher keeps `pathname`, writes `?lng=<code>`, and the detector order is now `querystring → localStorage → navigator → …`.
2. **Currency formatting was hard-coded to `en-US`.** `formatCurrency` / `convertPrice` always used US grouping, so `de`/`fr`/`pt` showed `$1,234.00` instead of `1.234,00 €`. Fixed: locale flows from `i18n.language`; **Managed Capital stays USD in every language** as required.

### High
3. **Plan names were hard-coded English.** `Checkout.tsx` derived the tier name from the raw `plan_key` (`starter → "Starter"`) and `RegisterApplication.tsx` fallbacks were English literals, so every non-EN locale saw English tier names. Fixed with `t('plans.<id>')`.
4. **Legal pages rendered incomplete content.** Privacy/Terms/Disclaimer rendered only 2–3 sections; the full section list now renders from i18n in all 11 locales.
5. **Hardcoded strings across the app** (toasts, error/validation messages, buttons, placeholders, empty states, aria-labels) bypassed i18n. Fixed and added to all 11 locale objects.

### Medium
6. **Missing keys / raw-key leaks.** `auth.features`, `howItWorks.steps`, and the `kyc.*` dynamic prefixes were only partially covered; all are now present in every locale (verified by the gate).
7. **Images without `alt`.** Decorative hero images now use `alt=""` (correct for decorative art); logo images carry brand alt text.
8. **`target="_blank"` without `rel`** — `rel="noopener noreferrer"` added.
9. **SEO/i18n metadata.** Per-locale `<title>`, description, Open Graph and Twitter tags via `useDocumentMeta`; `hreflang` alternates for all 11 locales plus `x-default` in `public/sitemap.xml`; `og:locale` mapped per locale.
10. **RTL.** `document.documentElement.dir` is set for `ar`/`he` on init *and* on change (previously the initial detected RTL load stayed LTR).

### Low
11. Typo in the Supabase env-var hint (`env.localand` → `env.local and`).
12. `Dashboard` dead branch removed; unused imports cleaned; a11y labels added to icon-only controls.

## 4. Needs human review

- **Legal text placeholders (do not ship as-is).** These 11 keys still contain `[PLACEHOLDER: …]` in **every** locale and need a real legal decision:
  `privacyPage.legalBasisText`, `privacyPage.retentionText`, `privacyPage.thirdPartiesText`,
  `privacyPage.userRightsText`, `privacyPage.contactText`, `termsPage.effectiveDateText`,
  `termsPage.changesToTermsText`, `termsPage.accountTerminationText`, `termsPage.disputeResolutionText`,
  `termsPage.contactText`, `disclaimerPage.notLicensedText`.
  The pages already show a visible "draft under legal review" banner. I did **not** invent legal facts (jurisdiction, DPO contact, retention period); supply the values and I/you can drop them in.
- **Jurisdiction/DPO contact** must be consistent with the entity address in `footer.addressValue` (Madrid, Spain) — verify which jurisdiction the Terms should name.
- **Managed Capital USD rule** verified: `$25,000.00` / `$50,000.00` / `$100,000.00` / `$150,000.00` render as USD in all locales (never converted). Please confirm the monthly service fee may be shown in local currency (that is the current behaviour).
- **Terminology choices** worth a native check: `plans.*` tier names (`Inicial`, `Einsteiger`, `Débutant`, …), `dashboard.drawdown` kept as "Drawdown" in pt/it/es/fr/de (technical loanword) vs. `Просадка`/`回撤` elsewhere, and `nav.support` in fr/de.

## 5. Not tested / limitations

- **Deno edge functions** (`supabase/functions/**`, incl. `_shared/email.ts`): `deno` is not installed here, so `make test` / email sample rendering could not be executed. Reviewed by reading only. The owner-notification emails are internal (HTML `<html lang="pt">`, Portuguese owner-facing copy) and were left unchanged per the repo rule not to alter Resend routing/config.
- **Authenticated flows** (`/dashboard` KYC upload, checkout with real Supabase): no `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` in this sandbox. The pages render and fail closed; the post-login data paths were not exercised end-to-end.
- **Real payment providers** (Stripe/PayPal/Wise/crypto): not exercised; the payments gate was verified to fail closed when `VITE_PAYMENTS_ENABLED !== "true"`.
- **Text-overflow at 3 viewports × 11 locales** was checked at desktop width in the smoke run; a full mobile/tablet sweep of the longest strings (de/ru) is recommended before launch.

## 6. Recommended next steps (priority order)

1. Fill the 11 legal placeholders and remove the draft banner (requires legal sign-off).
2. Install Deno in CI and wire `make test` + `npm run check:i18n` as required checks.
3. Run a mobile/tablet overflow pass in `de`, `ru`, `ar`, `he` (longest strings + RTL).
4. Native-speaker review of tier names and trading terminology per locale.
5. Add a CI job running `npm ci && npm run lint && npx tsc --noEmit -p tsconfig.app.json && npm run check:i18n && npm run build`.

## 7. Automated gate added

`scripts/check-i18n.mjs` (wired as `npm run check:i18n`) fails the build when any locale has a missing key, an orphaned key, an empty value, or an interpolation-placeholder mismatch against English. Run it before every deploy.
