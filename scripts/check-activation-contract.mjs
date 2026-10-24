#!/usr/bin/env node
/**
 * Account-activation contract gate.
 *
 * Static checks that guard the invariants the activation flow must not
 * regress:
 *  1. The flow is gated by ACTIVATION_FLOW_ENABLED and fails closed.
 *  2. No secret, affiliate link or price is hard-coded: everything comes from
 *     Edge Function secrets through the public activation-config function.
 *  3. The customer NEVER submits a broker password / CID / secret — no such
 *     field exists in the form, the payload or the schema.
 *  4. The user id always comes from the verified JWT, never the request body.
 *  5. activation-review is operator-only (app_metadata.operator) and every
 *     action writes the append-only audit log.
 *  6. Receipts live in a PRIVATE bucket; the operator reads them through a
 *     short-lived signed URL.
 *  7. Nothing calls Tradovate, and no order/copy-trading engine was added.
 *
 * Exits non-zero on any violation. Read-only: parses files, runs nothing.
 *
 * Usage: node scripts/check-activation-contract.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const has = (p) => existsSync(resolve(root, p));
// Strip comments so a word inside a comment never satisfies a check.
const code = (p) => read(p).replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
// SQL variant: also strip `--` line comments.
const sqlCode = (p) => code(p).replace(/--[^\n]*/g, '');

let failures = 0;
function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${name}`);
  } else {
    failures++;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

console.log('\n[1] Files exist');
check('shared activation config module', has('supabase/functions/_shared/activation/config.ts'));
check('shared activation limits module', has('supabase/functions/_shared/activation/limits.ts'));
check('shared activation status module', has('supabase/functions/_shared/activation/status.ts'));
check('shared activation operator module', has('supabase/functions/_shared/activation/operator.ts'));
check('activation-config function', has('supabase/functions/activation-config/index.ts'));
check('activation-submit function', has('supabase/functions/activation-submit/index.ts'));
check('activation-review function', has('supabase/functions/activation-review/index.ts'));
check('accounts page', has('src/pages/Accounts.tsx'));
check('activate-account view', has('src/components/ActivateAccountView.tsx'));
check('plan-active checklist', has('src/components/PlanActiveChecklist.tsx'));
check('operator activations page', has('src/pages/OperatorActivations.tsx'));
check('client activation config', has('src/lib/activationConfig.ts'));
check('migration', has('supabase/migrations/20261010000000_account_activation.sql'));

console.log('\n[2] ACTIVATION_FLOW_ENABLED gates the flow and fails closed');
const features = read('supabase/functions/_shared/features.ts');
check('flag is registered in features.ts', features.includes('ACTIVATION_FLOW_ENABLED'));
const submit = code('supabase/functions/activation-submit/index.ts');
const review = code('supabase/functions/activation-review/index.ts');
const configFn = code('supabase/functions/activation-config/index.ts');
check('activation-submit refuses when disabled (503)', /!config\.enabled[\s\S]{0,140}503/.test(submit));
check('activation-review refuses when disabled (503)', /!config\.enabled[\s\S]{0,140}503/.test(review));
check('activation-config reports enabled:false', /enabled:\s*config\.enabled/.test(configFn));

console.log('\n[3] No hard-coded affiliate link, price or secret');
const config = read('supabase/functions/_shared/activation/config.ts');
check('affiliate links come from env', config.includes('AFFILIATE_TRADEIFY_URL') && config.includes('AFFILIATE_LUCID_URL'));
check('plan price comes from env', config.includes('SIGNALS_PLAN_PRICE_CENTS'));
check('a firm with no configured url is dropped', /sanitizeAffiliateUrl[\s\S]{0,200}if \(tradeify\)/.test(config));
check('no affiliate URL literal is hard-coded in the page', !/https?:\/\/(tradeify|lucid)/i.test(read('src/pages/Accounts.tsx')));
check('no price literal is hard-coded in the page', !/\$\d/.test(code('src/pages/Accounts.tsx')));
check('the client never reads a VITE affiliate/price env var', !/VITE_AFFILIATE|VITE_SIGNALS_PLAN/.test(read('src/pages/Accounts.tsx')));

console.log('\n[4] The customer never submits a broker credential');
check('no password/cid/secret field in the submit function', !/password|cid|secret/i.test(submit));
check('no password/cid/secret field in the form', !/name=["'](password|cid|secret)["']/i.test(read('src/components/ActivateAccountView.tsx')));
check('the schema has no credential column', !/password|cid|secret/i.test(sqlCode('supabase/migrations/20261010000000_account_activation.sql')));
check('the submit payload is validated server-side', submit.includes('validateActivationPayload('));
check('the firm is validated against server config', submit.includes('isConfiguredFirm('));
check('the receipt is validated server-side', submit.includes('validateReceiptFile('));

console.log('\n[5] Ownership is server-side (JWT, never the body)');
check('submit derives the user from the JWT', submit.includes('requireUser(req)'));
check('submit never reads a body user id', !/body\.user_?id|form\.get\(\s*["']user_?id["']/.test(submit));
check('submit scopes the duplicate check by the JWT user', /\.eq\(\s*["']user_id["'],\s*ctx\.user\.id\s*\)/.test(submit));

console.log('\n[6] Review is operator-only and audited');
const operator = code('supabase/functions/_shared/activation/operator.ts');
check('operator predicate requires a strict boolean', /operator\s*===\s*true/.test(operator));
check('review requires an operator', review.includes('requireOperator(req)'));
check('review returns 403 for a non-operator', /ForbiddenError[\s\S]{0,80}403/.test(review));
check('review uses the shared state machine', review.includes('canReview(') && review.includes('ACTION_RESULT'));
check('review rejects an illegal transition (409)', review.includes('invalid_transition'));
check('review writes the append-only audit log', review.includes('payment_audit_log'));

console.log('\n[7] Receipts are private, read via a short-lived signed URL');
const migration = read('supabase/migrations/20261010000000_account_activation.sql');
check('private bucket created', /'activation-receipts',\s*'activation-receipts',\s*false/.test(migration));
check('object paths are user-scoped', /storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/.test(migration));
check('no public URL is ever generated', !submit.includes('getPublicUrl') && !review.includes('getPublicUrl'));
check('operator reads via createSignedUrl', review.includes('createSignedUrl('));
check('signed URL TTL is short (<= 600s)',
  /SIGNED_URL_TTL_SECONDS\s*=\s*(\d+)/.test(review) &&
    Number(/SIGNED_URL_TTL_SECONDS\s*=\s*(\d+)/.exec(review)[1]) <= 600);
check('RLS is enabled on the table', /ENABLE ROW LEVEL SECURITY/.test(migration));
check('client INSERT is denied', /account_activations_no_client_insert[\s\S]{0,120}WITH CHECK \(false\)/.test(migration));

console.log('\n[8] No Tradovate call, no order engine');
check('submit makes no Tradovate API call', !/restService|authService|tradovateapi/.test(submit));
check('review makes no Tradovate API call', !/restService|authService|tradovateapi/.test(review));
check('no copy-trading / order engine module was added',
  !has('supabase/functions/_shared/activation/orderEngine.ts') &&
    !has('supabase/functions/copy-trade/index.ts'));

console.log('\n[9] The Tradovate card is hidden when TRADOVATE_ENABLED=false');
const dashboard = read('src/pages/Dashboard.tsx');
check('the terminal nav item is behind tradovate.enabled',
  /\.\.\.\(tradovate\.enabled[\s\S]{0,160}id:\s*'tradovate'/.test(dashboard));
check('the connect card is behind tradovate.enabled',
  /tradovate\.enabled && <TradovateConnectCard \/>/.test(dashboard));
check('the terminal view is behind tradovate.enabled',
  /activeView === 'tradovate' && tradovate\.enabled/.test(dashboard));

console.log(
  failures === 0
    ? '\nactivation contract check passed'
    : `\nactivation contract check FAILED (${failures})`,
);
process.exit(failures === 0 ? 0 : 1);
