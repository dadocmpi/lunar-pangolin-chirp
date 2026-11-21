#!/usr/bin/env node
/**
 * Security contract gate.
 *
 * Behavioural checks (modules are bundled and exercised, not just grepped):
 *  1. KYC action tokens are HMAC-signed, bound to user + action, expiring, and
 *     never contain the secret.
 *  2. safeEqual / readJsonBody enforce constant-time secret compare and a
 *     bounded body.
 *  3. The rate limiter counts within a window and recovers after it.
 *  4. The CORS resolver honours an allowlist and never reflects an unknown
 *     origin.
 *
 * Static checks (wiring that must not regress):
 *  5. application-reject is operator-only.
 *  6. kyc-action verifies a signed token (no reversible btoa token).
 *  7. The retired email relays stay retired.
 *  8. operator-notification is service-role only; crypto-auto-confirm fails
 *     closed.
 *  9. Every Edge Function resolves CORS per request instead of hard-coding "*".
 * 10. Sensitive endpoints carry a rate limiter.
 * 11. vercel.json ships the baseline security headers.
 *
 * Usage: node scripts/check-security-contract.mjs
 */
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const has = (p) => existsSync(resolve(root, p));
const stripComments = (s) =>
  s.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

let failures = 0;
function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${name}`);
  } else {
    failures++;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function bundle(entry) {
  const dir = mkdtempSync(join(tmpdir(), 'security-check-'));
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
// 1. Signed KYC action tokens
// ---------------------------------------------------------------------------
console.log('\n[1] Signed KYC action tokens');
const tokens = await bundle('supabase/functions/_shared/kyc/actionToken.ts');
const SECRET = 'unit-test-secret-value';
const USER = '11111111-1111-1111-1111-111111111111';
const now = 1_700_000_000_000;
const exp = now + 60_000;

const good = await tokens.buildActionToken(USER, 'approve', SECRET, exp);
check('token is built', typeof good === 'string' && good.includes('.'));
check('token never contains the secret', !good.includes(SECRET));
check('token is not reversible base64 of the secret',
  !Buffer.from(good.split('.')[0], 'base64url').toString('utf8').includes(SECRET));

check('valid token verifies',
  (await tokens.verifyActionToken(good, USER, 'approve', SECRET, now)).ok === true);
check('wrong user is rejected',
  (await tokens.verifyActionToken(good, 'other-user', 'approve', SECRET, now)).ok === false);
check('wrong action is rejected',
  (await tokens.verifyActionToken(good, USER, 'deny', SECRET, now)).ok === false);
check('wrong secret is rejected',
  (await tokens.verifyActionToken(good, USER, 'approve', 'other-secret', now)).ok === false);
check('expired token is rejected',
  (await tokens.verifyActionToken(good, USER, 'approve', SECRET, exp + 1)).ok === false);

const [payloadPart, sigPart] = good.split('.');
const forgedPayload = Buffer.from(
  JSON.stringify({ u: 'attacker', a: 'approve', e: exp }),
).toString('base64url');
check('tampered payload is rejected',
  (await tokens.verifyActionToken(
    `${forgedPayload}.${sigPart}`, 'attacker', 'approve', SECRET, now,
  )).ok === false);
check('tampered signature is rejected',
  (await tokens.verifyActionToken(
    `${payloadPart}.${sigPart.slice(0, -2)}AA`, USER, 'approve', SECRET, now,
  )).ok === false);

const legacy = Buffer.from(`${USER}:approve:${SECRET}`).toString('base64');
check('legacy reversible token is rejected',
  (await tokens.verifyActionToken(legacy, USER, 'approve', SECRET, now)).ok === false);

// ---------------------------------------------------------------------------
// 2. HTTP helpers
// ---------------------------------------------------------------------------
console.log('\n[2] Bounded bodies and constant-time compare');
const http = await bundle('supabase/functions/_shared/http.ts');
check('safeEqual accepts identical strings', http.safeEqual('abc123', 'abc123') === true);
check('safeEqual rejects different values', http.safeEqual('abc123', 'abc124') === false);
check('safeEqual rejects different lengths', http.safeEqual('abc', 'abcd') === false);
check('safeEqual rejects non-strings', http.safeEqual(undefined, 'a') === false);

const okBody = await http.readJsonBody(new Request('https://x.test/', {
  method: 'POST',
  body: JSON.stringify({ hello: 'world' }),
}));
check('valid JSON parses', okBody.ok === true && okBody.value.hello === 'world');

const badBody = await http.readJsonBody(new Request('https://x.test/', {
  method: 'POST',
  body: '{not json',
}));
check('invalid JSON is rejected', badBody.ok === false && badBody.error === 'invalid_json');

const bigBody = await http.readJsonBody(
  new Request('https://x.test/', { method: 'POST', body: 'x'.repeat(500) }),
  100,
);
check('oversized body is rejected before parsing',
  bigBody.ok === false && bigBody.error === 'payload_too_large');

const arrBody = await http.readJsonBody(new Request('https://x.test/', {
  method: 'POST',
  body: '[1,2,3]',
}));
check('non-object JSON is rejected', arrBody.ok === false && arrBody.error === 'invalid_json');

// ---------------------------------------------------------------------------
// 3. Rate limiter
// ---------------------------------------------------------------------------
console.log('\n[3] Rate limiter');
const rl = await bundle('supabase/functions/_shared/rateLimit.ts');
let clock = 1_000;
const limiter = rl.createRateLimiter({ windowMs: 1_000, max: 2, now: () => clock });
check('first hit allowed', limiter.hit('k') === false);
check('second hit allowed', limiter.hit('k') === false);
check('third hit blocked', limiter.hit('k') === true);
check('other keys are independent', limiter.hit('other') === false);
clock += 1_001;
check('window expiry resets the counter', limiter.hit('k') === false);

// ---------------------------------------------------------------------------
// 4. CORS resolver
// ---------------------------------------------------------------------------
console.log('\n[4] CORS allowlist');
const cors = await bundle('supabase/functions/_shared/cors.ts');
check('empty allowlist means wildcard', cors.resolveCorsOrigin('https://a.test', []) === '*');
check('allowlisted origin is echoed',
  cors.resolveCorsOrigin('https://a.test', ['https://a.test']) === 'https://a.test');
check('unknown origin gets no header',
  cors.resolveCorsOrigin('https://evil.test', ['https://a.test']) === null);
check('missing origin gets no header',
  cors.resolveCorsOrigin(null, ['https://a.test']) === null);
check('allowlist parsing trims and drops blanks',
  JSON.stringify(cors.parseAllowedOrigins(' https://a.test , ,https://b.test ')) ===
    JSON.stringify(['https://a.test', 'https://b.test']));

// ---------------------------------------------------------------------------
// 5. application-reject is operator-only
// ---------------------------------------------------------------------------
console.log('\n[5] application-reject authorization');
const reject = stripComments(read('supabase/functions/application-reject/index.ts'));
check('application-reject calls requireOperator', reject.includes('requireOperator(req)'));
check('application-reject no longer allows any authenticated user',
  !/allow any authenticated user/i.test(read('supabase/functions/application-reject/index.ts')));
check('application-reject bounds the reason', reject.includes('boundedString('));
check('application-reject is rate limited', reject.includes('createRateLimiter('));

// ---------------------------------------------------------------------------
// 6. kyc-action uses the signed token
// ---------------------------------------------------------------------------
console.log('\n[6] kyc-action token verification');
const kycAction = stripComments(read('supabase/functions/kyc-action/index.ts'));
check('kyc-action verifies a signed token', kycAction.includes('verifyActionToken('));
check('kyc-action no longer builds a reversible token',
  !kycAction.includes('btoa(') && !kycAction.includes('makeToken('));
check('kyc-action escapes HTML metacharacters',
  /"&":\s*"&amp;"/.test(kycAction) && /"<":\s*"&lt;"/.test(kycAction));
check('kyc-action does not echo database errors', !kycAction.includes('error.message'));
check('kyc-action is rate limited', kycAction.includes('createRateLimiter('));

// ---------------------------------------------------------------------------
// 7. Retired email relays stay retired
// ---------------------------------------------------------------------------
console.log('\n[7] Retired unauthenticated email relays');
for (const fn of ['send-email', 'user-registration', 'kyc-notification']) {
  const src = stripComments(read(`supabase/functions/${fn}/index.ts`));
  check(`${fn} refuses every request (410)`, /status:\s*410/.test(src));
  check(`${fn} is marked retired`, src.includes('endpoint_retired'));
  check(`${fn} cannot send email`, !src.includes('api.resend.com') && !src.includes('notifyOwner'));
}

// ---------------------------------------------------------------------------
// 8. Service-to-service endpoints
// ---------------------------------------------------------------------------
console.log('\n[8] Service-role boundaries');
const opNotif = stripComments(read('supabase/functions/operator-notification/index.ts'));
check('operator-notification requires the service role key',
  opNotif.includes('SUPABASE_SERVICE_ROLE_KEY') && opNotif.includes('safeEqual('));
const autoConfirm = stripComments(read('supabase/functions/crypto-auto-confirm/index.ts'));
check('crypto-auto-confirm fails closed when the key is unset',
  /!serviceKey\s*\|\|/.test(autoConfirm));
check('crypto-auto-confirm compares without a timing leak', autoConfirm.includes('safeEqual('));

// ---------------------------------------------------------------------------
// 9. CORS is resolved per request everywhere
// ---------------------------------------------------------------------------
console.log('\n[9] Per-request CORS');
const fnDirs = readdirSync(resolve(root, 'supabase/functions'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => d.name);
let wildcard = [];
let noResolver = [];
for (const fn of fnDirs) {
  const path = `supabase/functions/${fn}/index.ts`;
  if (!has(path)) continue;
  const src = read(path);
  if (/Access-Control-Allow-Origin"\s*:\s*"\*"/.test(src)) wildcard.push(fn);
  if (!src.includes('corsHeadersFor(req)')) noResolver.push(fn);
}
check('no Edge Function hard-codes a wildcard ACAO', wildcard.length === 0, wildcard.join(', '));
check('every Edge Function resolves CORS from the request',
  noResolver.length === 0, noResolver.join(', '));

// ---------------------------------------------------------------------------
// 10. Sensitive endpoints are rate limited
// ---------------------------------------------------------------------------
console.log('\n[10] Rate limiting on sensitive endpoints');
for (const fn of [
  'profile-submit', 'kyc-submit', 'withdrawal-request', 'payment-status',
  'kyc-action', 'stripe-checkout', 'crypto-checkout', 'wise-checkout',
  'activation-submit', 'activation-review', 'account-link', 'operator-action',
  'application-activate', 'application-reject', 'operator-notification',
  'stripe-reconcile',
]) {
  const src = read(`supabase/functions/${fn}/index.ts`);
  check(`${fn} is rate limited`, src.includes('createRateLimiter('));
}

// ---------------------------------------------------------------------------
// 11. Security headers
// ---------------------------------------------------------------------------
console.log('\n[11] Security headers');
const vercel = JSON.parse(read('vercel.json'));
const headerNames = new Set(
  (vercel.headers ?? []).flatMap((h) => (h.headers ?? []).map((x) => x.key)),
);
for (const name of [
  'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy',
  'Permissions-Policy', 'Strict-Transport-Security', 'Cross-Origin-Opener-Policy',
]) {
  check(`vercel.json sets ${name}`, headerNames.has(name));
}

if (failures > 0) {
  console.error(`\nsecurity contract check FAILED (${failures} violation(s))`);
  process.exit(1);
}
console.log('\nsecurity contract check passed');
