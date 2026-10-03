#!/usr/bin/env node
/**
 * Payment/checkout contract gate.
 *
 * Static checks that guard the specific failure modes this review fixed:
 *  1. The browser checkout must send the fields the server requires
 *     (currency=USD, applicationId for Stripe).
 *  2. Stripe pending rows must be created with the canonical USD amount, never
 *     placeholder zero / "eur".
 *  3. The two legacy free-service endpoints (card-checkout, paypal-checkout)
 *     must stay disabled.
 *  4. No Edge Function may call Resend directly except the central module.
 *  5. The client plan table must match the server plan table (prices + managed
 *     capital) so UI and charged amount can never diverge.
 *
 * Exits non-zero on any violation. Read-only: parses files, runs nothing.
 *
 * Usage: node scripts/check-payment-contract.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

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

console.log('\n[1] Browser checkout sends the server-required fields');
const checkout = read('src/pages/Checkout.tsx');
check(
  'checkout sends currency: "USD" to edge functions',
  /currency:\s*"USD"/.test(checkout),
);
check(
  'stripe checkout sends applicationId',
  /applicationId:\s*application\.id/.test(checkout),
);
check('checkout calls wise-checkout', /"wise-checkout"/.test(checkout));
check('checkout calls crypto-checkout', /"crypto-checkout"/.test(checkout));
check('checkout calls stripe-checkout', /"stripe-checkout"/.test(checkout));

console.log('\n[2] Stripe pending rows use canonical USD amount');
const stripeCheckout = read('supabase/functions/stripe-checkout/index.ts');
check(
  'stripe-checkout does not persist currency "eur"',
  !/currency:\s*"eur"/i.test(stripeCheckout),
);
check(
  'stripe-checkout derives the plan server-side',
  /getPlan\(/.test(stripeCheckout),
);
check(
  'stripe-checkout persists canonical priceCents',
  /amount_cents:\s*canonicalPlan\.priceCents/.test(stripeCheckout),
);

console.log('\n[3] Legacy free-service endpoints stay disabled');
for (const fn of ['card-checkout', 'paypal-checkout']) {
  const src = read(`supabase/functions/${fn}/index.ts`);
  check(
    `${fn} returns endpoint_disabled`,
    /endpoint_disabled/.test(src),
  );
}

console.log('\n[4] Resend call sites are accounted for');
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.ts')) out.push(full);
  }
  return out;
}
const fnRoot = resolve(root, 'supabase/functions');
// Owner notifications MUST all go through _shared/email.ts. The functions in
// USER_EMAIL_ALLOWLIST send transactional emails to the *customer*, not the
// owner; consolidating them is tracked separately.
const USER_EMAIL_ALLOWLIST = new Set([
  'card-checkout/index.ts',        // disabled legacy endpoint
  'paypal-checkout/index.ts',      // disabled legacy endpoint
  'crypto-confirmation/index.ts',
  'confirm-signup/index.ts',
  'withdrawal-notification/index.ts',
]);
const directResend = walk(fnRoot)
  .filter((f) => /api\.resend\.com/.test(readFileSync(f, 'utf8')))
  .map((f) => f.replace(`${fnRoot}/`, ''))
  .filter((f) => f !== '_shared/email.ts');
const unexpected = directResend.filter((f) => !USER_EMAIL_ALLOWLIST.has(f));
check(
  'no unexpected direct api.resend.com calls',
  unexpected.length === 0,
  unexpected.join(', '),
);
check(
  'owner-notification functions never call Resend directly',
  !directResend.some((f) => /operator-notification/.test(f)),
);

console.log('\n[5] Client and server plan tables agree');
function parseNumberMap(src, objectName) {
  const start = src.indexOf(`const ${objectName}`);
  if (start === -1) return null;
  const brace = src.indexOf('{', start);
  let depth = 0;
  let end = -1;
  for (let i = brace; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  const body = src.slice(brace, end + 1);
  const map = {};
  for (const m of body.matchAll(/(\w+):\s*\{([^}]*)\}/g)) {
    const plan = m[1];
    const inner = m[2];
    const cents = inner.match(/priceCents:\s*([\d_]+)/);
    const usd = inner.match(/monthlyUsd:\s*([\d_]+)/);
    const cap = inner.match(/managedCapitalUsd:\s*([\d_]+)/);
    const num = (s) => s ? Number(String(s).replace(/_/g, '')) : null;
    map[plan] = { priceCents: num(cents?.[1]), monthlyUsd: num(usd?.[1]), managedCapitalUsd: num(cap?.[1]) };
  }
  return map;
}

const clientPlans = parseNumberMap(read('src/lib/plans.ts'), 'PLAN_PRICING');
const serverPlans = parseNumberMap(read('supabase/functions/_shared/plans.ts'), 'PLANS');

check('client plan table parsed', !!clientPlans && Object.keys(clientPlans).length === 4);
check('server plan table parsed', !!serverPlans && Object.keys(serverPlans).length === 4);

if (clientPlans && serverPlans) {
  for (const plan of ['starter', 'professional', 'business', 'enterprise']) {
    const c = clientPlans[plan];
    const s = serverPlans[plan];
    check(
      `${plan}: client monthlyUsd*100 === server priceCents`,
      c && s && c.monthlyUsd * 100 === s.priceCents,
      `client=${c?.monthlyUsd} server=${s?.priceCents}`,
    );
    check(
      `${plan}: managed capital matches`,
      c && s && c.managedCapitalUsd === s.managedCapitalUsd,
      `client=${c?.managedCapitalUsd} server=${s?.managedCapitalUsd}`,
    );
  }
}

console.log('\n[6] Managed Capital is always USD on the client');
const currency = read('src/hooks/useCurrency.tsx');
check(
  'formatManagedCapital renders USD, not local currency',
  /formatManagedCapital[\s\S]*?formatUsdAmount/.test(currency),
);

if (failures > 0) {
  console.error(`\npayment contract check FAILED (${failures} failure(s))`);
  process.exit(1);
}
console.log('\npayment contract check passed');
