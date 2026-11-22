#!/usr/bin/env node
/**
 * Checkout redesign contract gate.
 *
 * Static checks that guard the single-page checkout and its payment-method
 * orchestration. Runs without Deno or a database.
 *
 * Usage: node scripts/check-checkout-contract.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

let failures = 0;
function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${name}`);
  } else {
    failures++;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const FILES = {
  page: 'src/pages/Checkout.tsx',
  summary: 'src/components/checkout/PlanSummaryCard.tsx',
  form: 'src/components/checkout/CheckoutCustomerForm.tsx',
  methods: 'src/components/checkout/PaymentMethodSelector.tsx',
  card: 'src/components/checkout/CardPaymentPanel.tsx',
  crypto: 'src/components/checkout/CryptoPaymentPanel.tsx',
  bank: 'src/components/checkout/BankTransferPanel.tsx',
  notice: 'src/components/checkout/CheckoutNotice.tsx',
  logic: 'supabase/functions/_shared/checkout/logic.ts',
  config: 'supabase/functions/_shared/checkout/config.ts',
  configFn: 'supabase/functions/checkout-config/index.ts',
  stripe: 'supabase/functions/stripe-checkout/index.ts',
  wise: 'supabase/functions/wise-checkout/index.ts',
  cryptoFn: 'supabase/functions/crypto-checkout/index.ts',
  success: 'src/pages/CheckoutSuccess.tsx',
  i18n: 'src/i18n.ts',
};
for (const [name, path] of Object.entries(FILES)) {
  check(`${name} exists`, existsSync(resolve(root, path)), path);
}
const S = Object.fromEntries(Object.entries(FILES).map(([k, p]) => [k, read(p)]));

console.log('\n[1] One cohesive, responsive page');
check('mobile single column', S.page.includes('grid-cols-1'));
check('desktop two columns', S.page.includes('lg:grid-cols-12'));
check('summary is sticky only on large screens', S.summary.includes('lg:sticky'));
check('summary is not sticky on mobile', !/(?<!lg:)sticky/.test(S.summary));
check('focus-visible ring on interactive controls', S.page.includes('focus-visible:ring-2'));
check('loading uses the themed loader', S.page.includes('Loader2') && S.page.includes('bg-[#05070A]'));

console.log('\n[2] Plan summary');
for (const key of ['checkoutPage.planLabel', 'checkoutPage.intervalLabel', 'checkoutPage.recurringDisclosure', 'checkoutPage.changePlan']) {
  check(`summary renders ${key}`, S.summary.includes(key));
}
check('amount comes from the canonical plan table', S.page.includes('PLAN_PRICING[planKey].monthlyUsd'));
check('currency shown as USD', S.page.includes('currency="USD"'));

console.log('\n[3] Customer information');
for (const key of ['firstName', 'lastName', 'email', 'phone', 'country', 'street', 'number', 'complement', 'city', 'state', 'postalCode']) {
  check(`form has ${key}`, S.form.includes(`"${key}"`));
}
check('profile prefill is used', S.page.includes('prefillCheckoutCustomer'));
check('server-shaped validation is used', S.logic.includes('validateProfile('));
check('required fields are marked', S.form.includes('aria-required="true"'));
check('errors are not color-only', S.form.includes('<AlertCircle'));
check('update-profile option is present', S.form.includes('checkoutBilling.updateProfile'));

console.log('\n[4] No secrets or card data in the browser');
for (const forbidden of ['cardNumber', 'card_number', 'cvc', 'cvv', 'privateKey', 'private_key']) {
  check(`checkout surface does not reference ${forbidden}`, !new RegExp(forbidden, 'i').test(S.page + S.form + S.card + S.crypto + S.bank));
}
check('card panel sends the customer to Stripe', S.card.includes('checkoutPage.card.secureNote'));
check('no card field is rendered', !/<input[^>]*name="card/i.test(S.card));

console.log('\n[5] Payment method orchestration');
for (const fn of ['"stripe-checkout"', '"crypto-checkout"', '"wise-checkout"']) {
  check(`page calls ${fn}`, S.page.includes(fn));
}
check('methods are gated by server config', S.methods.includes('resolveMethodAvailability'));
check('unavailable methods are disabled', S.methods.includes('disabled={!availability.available}'));
check('method selector exposes pressed state', S.methods.includes('aria-pressed'));
check('all three methods are present', ['card', 'crypto', 'bank'].every((m) => S.methods.includes(`id: "${m}"`)));

console.log('\n[6] Server is the source of truth');
check('page sends currency USD', /currency:\s*"USD"/.test(S.page));
check('page sends the server-ensured applicationId', /applicationId:\s*prepared\.applicationId/.test(S.page));
check('page ensures the application server-side', S.page.includes('functionsUrl("application-ensure")'));
check('page never sends an amount', !/amountCents\s*:/.test(S.page));
check('stripe re-derives the plan', S.stripe.includes('getPlan(planKey)'));
check('stripe uses the canonical amount', S.stripe.includes('amount_cents: canonicalPlan.priceCents'));
check('stripe stays a subscription', S.stripe.includes('"mode", "subscription"'));
check('stripe keeps USD price ids', S.stripe.includes('STRIPE_PRICE_STARTER_USD'));
check('wise amount comes from the server plan', S.wise.includes('validated.amountCents'));
check('crypto amount comes from the server plan', S.cryptoFn.includes('validated.amountCents'));
check('success page waits for server confirmation', S.success.includes('serverStatus?.status === "confirmed"'));
check('success page reconciles a lost webhook', S.success.includes('stripe-reconcile'));
check('stripe-checkout handles duplicate checkout', S.stripe.includes('duplicate_checkout'));

console.log('\n[7] Crypto and bank provider honesty');
check('crypto warning is always rendered', S.crypto.includes('checkoutPage.crypto.wrongNetworkWarning'));
check('crypto only lists server networks', S.crypto.includes('networks.map'));
check('crypto shows the server deposit address only', S.crypto.includes('response?.deposit_address'));
check('crypto has no fabricated QR', !/qrcode|qr-code|QRCode/i.test(S.crypto));
check('bank shows server bank details only', S.bank.includes('response?.bank_details'));
check('bank has no "I paid" action', !/markPaid|confirmPayment|wise-confirm|I have paid/i.test(S.bank));
check('bank says instructions are not payment', S.bank.includes('checkoutPage.bank.notPaidNotice'));
check('bank states settlement delay', S.bank.includes('checkoutPage.bank.settlementNote'));
check('copy control exists', S.bank.includes('CopyButton') && S.crypto.includes('CopyButton'));

console.log('\n[8] Status and error states');
for (const key of ['notices.confirmed', 'notices.pending', 'notices.webhookDelayed', 'notices.failed', 'notices.expired', 'notices.manualReview']) {
  check(`logic maps ${key}`, S.logic.includes(`checkoutPage.${key}`));
}
for (const [code, mapped] of [
  ['duplicate_checkout', 'duplicateCheckout'],
  ['unauthorized', 'sessionExpired'],
  ['invalid_currency', 'unsupportedCurrency'],
  ['invalid_network', 'unsupportedMethod'],
  ['invalid_profile', 'invalidAddress'],
]) {
  check(`logic maps ${code}`, S.logic.includes(`${code}: "${mapped}"`));
}
check('invalid email is localized', S.form.includes('checkoutPage.errors.invalidEmail'));
check('raw errors are never shown', S.page.includes('checkoutErrorKey(code)'));
check('payment status is polled', S.page.includes('usePaymentStatus('));

console.log('\n[9] Server config endpoint');
check('checkout-config is JWT-protected', read('supabase/config.toml').includes('[functions.checkout-config]'));
check('checkout-config is rate limited', S.configFn.includes('createRateLimiter('));
check('checkout-config returns no destination', !/deposit_address|bank_details|account_number/.test(S.configFn));
check('card availability checks every price id', S.config.includes('STRIPE_PRICE_ENV_VARS.every'));
check('crypto availability is per network', S.config.includes('resolveCryptoAddress(network.id, env)'));
check('bank availability uses Wise secrets', S.config.includes('resolveBankDetails(env)'));

console.log('\n[10] All 11 locales');
const LOCALES = ['en', 'pt', 'it', 'es', 'fr', 'de', 'ru', 'zh', 'ja', 'ar', 'he'];
check('11 locale objects exist', LOCALES.every((l) => S.i18n.includes(`const ${l}Translation = `)));
check('checkoutPage namespace exists in all 11', (S.i18n.match(/checkoutPage: \{/g) ?? []).length === 11);
check('wrong-network warning is translated', (S.i18n.match(/"wrongNetworkWarning"/g) ?? []).length === 11);
check('duplicate checkout error is translated', (S.i18n.match(/"duplicateCheckout"/g) ?? []).length === 11);

if (failures > 0) {
  console.error(`\ncheckout contract check FAILED (${failures} failure(s))`);
  process.exit(1);
}
console.log('\ncheckout contract check passed');
