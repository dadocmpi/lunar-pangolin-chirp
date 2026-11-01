#!/usr/bin/env node
/**
 * Profile contract gate.
 *
 * The client (src/lib/profileValidation.ts) and the server
 * (supabase/functions/_shared/profile/validation.ts) must apply the SAME rules,
 * otherwise a form the browser accepts could be rejected by the API (or worse,
 * a value the browser rejects could slip through). This gate bundles both with
 * esbuild and asserts they agree on a shared fixture set, then checks the static
 * guarantees around the profile flow.
 *
 * Exits non-zero on any violation. Read-only (bundles to a temp file).
 *
 * Usage: node scripts/check-profile-contract.mjs
 */
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

let failed = false;
const pass = (msg) => console.log(`  PASS  ${msg}`);
const fail = (msg) => {
  failed = true;
  console.log(`  FAIL  ${msg}`);
};

async function bundle(entry) {
  const dir = mkdtempSync(join(tmpdir(), 'profile-check-'));
  const outfile = join(dir, 'bundle.mjs');
  await build({
    entryPoints: [resolve(root, entry)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    logLevel: 'silent',
  });
  const mod = await import(pathToFileURL(outfile).href);
  rmSync(dir, { recursive: true, force: true });
  return mod;
}

// ---------------------------------------------------------------------------
// 1. Client and server agree on a shared fixture set
// ---------------------------------------------------------------------------
const { validateProfile: clientValidate } = await bundle('src/lib/profileValidation.ts');
const { validateProfile: serverValidate } = await bundle(
  'supabase/functions/_shared/profile/validation.ts',
);

const valid = {
  fullName: 'Maria Silva',
  phoneCountryCode: '+55',
  phone: '(11) 91234-5678',
  country: 'BR',
  street: 'Avenida Paulista',
  number: '1000',
  complement: 'Apto 42',
  city: 'São Paulo',
  state: 'SP',
  postalCode: '01310-100',
};

const fixtures = [
  { name: 'complete profile', input: valid, valid: true },
  { name: 'complement optional', input: { ...valid, complement: '' }, valid: true },
  { name: 'US phone format', input: { ...valid, phone: '(212) 555-0198' }, valid: true },
  { name: 'missing name', input: { ...valid, fullName: '' }, valid: false },
  { name: 'name too short', input: { ...valid, fullName: 'A' }, valid: false },
  { name: 'missing phone code', input: { ...valid, phoneCountryCode: '' }, valid: false },
  { name: 'bad phone code', input: { ...valid, phoneCountryCode: '55' }, valid: false },
  { name: 'phone with letters', input: { ...valid, phone: 'abc1234' }, valid: false },
  { name: 'phone too few digits', input: { ...valid, phone: '123' }, valid: false },
  { name: 'unknown country', input: { ...valid, country: 'ZZ' }, valid: false },
  { name: 'missing street', input: { ...valid, street: '' }, valid: false },
  { name: 'missing number', input: { ...valid, number: '' }, valid: false },
  { name: 'missing city', input: { ...valid, city: '' }, valid: false },
  { name: 'missing state', input: { ...valid, state: '' }, valid: false },
  { name: 'bad postal code', input: { ...valid, postalCode: '!' }, valid: false },
];

for (const f of fixtures) {
  const c = clientValidate(f.input);
  const s = serverValidate(f.input);
  const cOk = Object.keys(c).length === 0;
  const sOk = s.ok;
  if (cOk !== f.valid || sOk !== f.valid) {
    fail(`fixture "${f.name}": expected valid=${f.valid}, client=${cOk}, server=${sOk}`);
  } else if (cOk !== sOk) {
    fail(`fixture "${f.name}": client/server disagree (client=${cOk}, server=${sOk})`);
  } else {
    pass(`fixture "${f.name}" -> valid=${f.valid}`);
  }
}

// Error codes must match per field for an invalid fixture.
const bad = { ...valid, fullName: '', phone: 'x', country: 'ZZ', postalCode: '!' };
const cErr = clientValidate(bad);
const sErr = serverValidate(bad).errors;
for (const key of Object.keys(sErr)) {
  if (cErr[key] !== sErr[key]) {
    fail(`error code mismatch on ${key}: client=${cErr[key]} server=${sErr[key]}`);
  }
}
pass('per-field error codes match between client and server');

// The country sets must be identical: the browser only offers codes the server
// accepts, and the server accepts every code the browser can send.
const clientCountries = new Set(
  [...read('src/lib/countries.ts').matchAll(/\{ code: "([A-Z]{2})"/g)].map((m) => m[1]),
);
const serverCountries = new Set(
  [...read('supabase/functions/_shared/profile/countries.ts').matchAll(/"([A-Z]{2})"/g)].map((m) => m[1]),
);
const onlyClient = [...clientCountries].filter((c) => !serverCountries.has(c));
const onlyServer = [...serverCountries].filter((c) => !clientCountries.has(c));
if (onlyClient.length || onlyServer.length) {
  fail(`country sets differ: client-only=${onlyClient} server-only=${onlyServer}`);
} else {
  pass(`country sets match (${clientCountries.size} codes)`);
}

// ---------------------------------------------------------------------------
// 2. Static guarantees
// ---------------------------------------------------------------------------
const migration = read('supabase/migrations/20261011000000_client_profiles.sql');
for (const col of [
  'full_name', 'phone', 'country', 'street', 'number', 'complement',
  'city', 'state', 'postal_code', 'profile_completed', 'stripe_customer_id', 'updated_at',
  'terms_accepted_at', 'privacy_accepted_at',
]) {
  if (!migration.includes(`ADD COLUMN IF NOT EXISTS ${col}`)) {
    fail(`migration is missing ADD COLUMN IF NOT EXISTS ${col}`);
  }
}
pass('migration adds every profile column idempotently');

if (!migration.includes('ENABLE ROW LEVEL SECURITY')) fail('profiles RLS not enabled');
if (!migration.includes('id = auth.uid()')) fail('profiles RLS does not key on auth.uid()');
pass('profiles RLS keys on auth.uid()');

const submit = read('supabase/functions/profile-submit/index.ts');
if (!/requireUser\(req\)/.test(submit)) fail('profile-submit does not derive the user from the JWT');
if (!/validateProfile\(body\)/.test(submit)) fail('profile-submit does not re-validate server-side');
if (/password|card_number|cvc|cvv/i.test(submit.replace(/\/\/.*$/gm, ''))) {
  fail('profile-submit references password or card data');
}
pass('profile-submit is JWT-scoped, re-validates, and never touches password/card data');

const billing = read('supabase/functions/_shared/profile/billing.ts');
if (/card_number|cvc|cvv|cardnumber/i.test(billing)) fail('billing module references card data');
pass('billing module never handles card data');

const stripe = read('supabase/functions/stripe-checkout/index.ts');
if (!/resolveStripeCustomer/.test(stripe)) fail('stripe-checkout does not resolve a Stripe Customer');
if (!/stripe_customer_id/.test(stripe)) fail('stripe-checkout does not persist stripe_customer_id');
pass('stripe-checkout reuses/creates a Stripe Customer and stores its id');

// The checkout must block an incomplete profile before payment.
const checkout = read('src/pages/Checkout.tsx');
if (!/complete-profile/.test(checkout)) fail('checkout does not redirect an incomplete profile to step 2');
pass('checkout redirects an incomplete profile to /complete-profile');

// The register page must not store a password anywhere but Supabase Auth.
const register = read('src/pages/Register.tsx');
if (/localStorage\.setItem\([^)]*password/i.test(register)) fail('register stores a password in localStorage');
pass('register never persists a password client-side');

if (failed) {
  console.error('\nprofile contract check FAILED');
  process.exit(1);
}
console.log('\nprofile contract check passed');
