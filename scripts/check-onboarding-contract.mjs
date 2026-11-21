#!/usr/bin/env node
/**
 * Managed-account onboarding contract gate + focused scenario tests.
 *
 * Behavioural (pure modules are bundled and exercised):
 *   1. Paid user onboarding
 *   2. Unpaid user cannot activate
 *   3. Cross-user account-link access
 *   4. Duplicate account-link submission
 *   5. Operator approval and rejection
 *   6. Disconnected account
 *   7. Suspended account
 *   8. Disabled execution kill switch
 *   9. Payment refund or cancellation state
 *
 * Static (wiring that must not regress):
 *   - ONBOARDING_FLOW_ENABLED / EXECUTION_ENABLED live in features.ts, with
 *     execution defaulting OFF.
 *   - Every customer mutation derives identity from the JWT, bounds its body,
 *     validates the firm server-side and audits the action.
 *   - The plan is derived from the confirmed payment, never from the body.
 *   - No broker credential field exists in the form, payload or schema.
 *   - The migration has owner/operator RLS and explicit client-write denials.
 *   - Nothing calls Tradovate and no order/execution engine was added.
 *
 * Usage: node scripts/check-onboarding-contract.mjs
 */
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
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
const sqlCode = (p) => stripComments(read(p)).replace(/--[^\n]*/g, '');

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
  const dir = mkdtempSync(join(tmpdir(), 'onboarding-check-'));
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
console.log('\n[0] Files exist');
for (const file of [
  'supabase/functions/_shared/onboarding/config.ts',
  'supabase/functions/_shared/onboarding/entitlement.ts',
  'supabase/functions/_shared/onboarding/status.ts',
  'supabase/functions/_shared/onboarding/validation.ts',
  'supabase/functions/_shared/onboarding/access.ts',
  'supabase/functions/_shared/onboarding/effective.ts',
  'supabase/functions/_shared/onboarding/audit.ts',
  'supabase/functions/_shared/execution/guard.ts',
  'supabase/functions/onboarding-config/index.ts',
  'supabase/functions/onboarding-status/index.ts',
  'supabase/functions/account-link-submit/index.ts',
  'supabase/functions/account-link-review/index.ts',
  'supabase/functions/account-link-disconnect/index.ts',
  'src/lib/onboardingConfig.ts',
  'src/lib/onboardingStatus.ts',
  'src/components/OnboardingView.tsx',
  'src/pages/Onboarding.tsx',
  'src/pages/OperatorAccountLinks.tsx',
  'supabase/migrations/20261122000000_managed_account_onboarding.sql',
]) {
  check(file, has(file));
}

const ent = await bundle('supabase/functions/_shared/onboarding/entitlement.ts');
const st = await bundle('supabase/functions/_shared/onboarding/status.ts');
const val = await bundle('supabase/functions/_shared/onboarding/validation.ts');
const eff = await bundle('supabase/functions/_shared/onboarding/effective.ts');
const access = await bundle('supabase/functions/_shared/onboarding/access.ts');
const guard = await bundle('supabase/functions/_shared/execution/guard.ts');
const cfg = await bundle('supabase/functions/_shared/onboarding/config.ts');

const ACTIVE_PAYMENT = {
  id: 'pay_1',
  plan_id: 'professional',
  amount_cents: 35000,
  currency: 'USD',
  status_enum: 'confirmed',
  status: 'confirmed',
  created_at: '2026-11-01T10:00:00Z',
};

// ---------------------------------------------------------------------------
console.log('\n[1] Paid user onboarding');
const paid = ent.resolveEntitlement([ACTIVE_PAYMENT], []);
check('confirmed payment -> active', paid.state === 'active' && paid.active === true);
check('plan comes from the payment', paid.planId === 'professional');
check('payment id is exposed for audit', paid.paymentId === 'pay_1');
check('isPaidEntitlement accepts an active payment', ent.isPaidEntitlement(paid) === true);
const okPayload = val.validateLinkPayload(
  {
    firmId: 'tradeify',
    accountLogin: 'ACC-123',
    confirmedOwnership: true,
    confirmedExternalRules: true,
    confirmedNoProfitGuarantee: true,
    confirmedEligibility: true,
    confirmedDataDelayed: true,
    confirmedPayoutsProvider: true,
    confirmedNoFundsHeld: true,
  },
  (id) => id === 'tradeify',
);
check('a complete paid submission validates', okPayload.ok === true);
check('the payload has no credential field',
  !/password|token|secret|cid/i.test(Object.keys(okPayload.value ?? {}).join(',')));

// ---------------------------------------------------------------------------
console.log('\n[2] Unpaid user cannot activate');
for (const state of ['none', 'pending', 'refunded', 'canceled', 'disputed', 'failed', 'rejected']) {
  const payments = state === 'none'
    ? []
    : [{ ...ACTIVE_PAYMENT, status_enum: state, status: state }];
  const e = ent.resolveEntitlement(payments, []);
  check(`${state} -> not active`, ent.isPaidEntitlement(e) === false);
}

// ---------------------------------------------------------------------------
console.log('\n[3] Cross-user account-link access');
check('owner can access their row', access.ownsRow('user-a', { user_id: 'user-a' }) === true);
check('another user cannot access the row', access.ownsRow('user-b', { user_id: 'user-a' }) === false);
check('a null requester is refused', access.ownsRow(null, { user_id: 'user-a' }) === false);
check('a null row is refused', access.ownsRow('user-a', null) === false);

// ---------------------------------------------------------------------------
console.log('\n[4] Duplicate account-link submission');
check('pending blocks a duplicate', st.isOpenLinkStatus('pending') === true);
check('in_review blocks a duplicate', st.isOpenLinkStatus('in_review') === true);
check('approved blocks a duplicate', st.isOpenLinkStatus('approved') === true);
check('suspended blocks a duplicate', st.isOpenLinkStatus('suspended') === true);
check('rejected allows a new request', st.isOpenLinkStatus('rejected') === false);
check('disconnected allows a new request', st.isOpenLinkStatus('disconnected') === false);

// ---------------------------------------------------------------------------
console.log('\n[5] Operator approval and rejection');
check('pending -> approve', st.canTransition('pending', 'approved') === true);
check('pending -> reject', st.canTransition('pending', 'rejected') === true);
check('in_review -> approve', st.canTransition('in_review', 'approved') === true);
check('rejected is terminal', st.canTransition('rejected', 'approved') === false);
check('approve maps to the connection audit event',
  st.linkAuditEvent('approve', 'pending') === 'account_link_connected');
check('reject maps to the rejection audit event',
  st.linkAuditEvent('reject', 'in_review') === 'account_link_rejected');

// ---------------------------------------------------------------------------
console.log('\n[6] Disconnected account');
check('approved -> disconnect', st.canTransition('approved', 'disconnected') === true);
check('suspended -> disconnect', st.canTransition('suspended', 'disconnected') === true);
check('disconnected is terminal', st.isTerminalLinkStatus('disconnected') === true);
check('disconnect maps to the disconnection audit event',
  st.linkAuditEvent('disconnect', 'approved') === 'account_link_disconnected');

// ---------------------------------------------------------------------------
console.log('\n[7] Suspended account');
check('approved -> suspend', st.canTransition('approved', 'suspended') === true);
check('in_review -> suspend', st.canTransition('in_review', 'suspended') === true);
check('suspended -> approve is a reconnection', st.canTransition('suspended', 'approved') === true);
check('reconnect maps to the reconnection audit event',
  st.linkAuditEvent('approve', 'suspended') === 'account_link_reconnected');
check('suspend maps to the suspension audit event',
  st.linkAuditEvent('suspend', 'approved') === 'account_link_suspended');
const suspendedByPayment = eff.deriveEffectiveLinkStatus(
  'approved',
  ent.resolveEntitlement([{ ...ACTIVE_PAYMENT, status_enum: 'refunded', status: 'refunded' }], []),
);
check('an approved link reads suspended when the payment is inactive',
  suspendedByPayment.effective === 'suspended' && suspendedByPayment.suspendedByPayment === true);

// ---------------------------------------------------------------------------
console.log('\n[8] Disabled execution kill switch');
check('unset -> disabled', guard.isExecutionEnabled(undefined) === false);
check('empty -> disabled', guard.isExecutionEnabled('') === false);
check('"false" -> disabled', guard.isExecutionEnabled('false') === false);
check('"TRUE" -> disabled (case-sensitive)', guard.isExecutionEnabled('TRUE') === false);
check('"1" -> disabled', guard.isExecutionEnabled('1') === false);
check('only "true" enables it', guard.isExecutionEnabled('true') === true);
check('executionDisabledBody is fail-closed',
  guard.executionDisabledBody().error === 'execution_disabled');

// ---------------------------------------------------------------------------
console.log('\n[9] Payment refund or cancellation state');
for (const state of ['refunded', 'canceled', 'disputed']) {
  const e = ent.resolveEntitlement([{ ...ACTIVE_PAYMENT, status_enum: state, status: state }], []);
  check(`${state} is inactive`, ent.isPaidEntitlement(e) === false);
  check(`${state} is an inactive payment state`, ent.isInactivePaymentState(e.state) === true);
}
const refundedAfterConfirmed = ent.resolveEntitlement(
  [
    { ...ACTIVE_PAYMENT, id: 'pay_old', created_at: '2026-10-01T10:00:00Z' },
    { ...ACTIVE_PAYMENT, id: 'pay_new', status_enum: 'refunded', status: 'refunded', created_at: '2026-11-01T10:00:00Z' },
  ],
  [],
);
check('a later refund overrides an earlier confirmation',
  refundedAfterConfirmed.state === 'refunded' && refundedAfterConfirmed.active === false);
const reconfirmed = ent.resolveEntitlement(
  [
    { ...ACTIVE_PAYMENT, id: 'pay_old', status_enum: 'refunded', status: 'refunded', created_at: '2026-10-01T10:00:00Z' },
    { ...ACTIVE_PAYMENT, id: 'pay_new', created_at: '2026-11-01T10:00:00Z' },
  ],
  [],
);
check('a later confirmation overrides an earlier refund',
  reconfirmed.state === 'active' && reconfirmed.active === true);

// ---------------------------------------------------------------------------
console.log('\n[10] Flag wiring');
const features = read('supabase/functions/_shared/features.ts');
check('ONBOARDING_FLOW_ENABLED is registered', features.includes('ONBOARDING_FLOW_ENABLED'));
check('EXECUTION_ENABLED is registered', features.includes('EXECUTION_ENABLED'));
check('execution defaults OFF (only "true" enables it)',
  /isExecutionCapabilityEnabled[\s\S]{0,120}=== "true"/.test(features));
check('onboarding config resolves enabled from the flag',
  /enabled:\s*env\.ONBOARDING_FLOW_ENABLED !== "false"/.test(read('supabase/functions/_shared/onboarding/config.ts')));
check('plans come from the canonical server table',
  cfg.resolveOnboardingConfig({}).plans.length === 4);
check('execution defaults OFF in the onboarding config',
  cfg.resolveOnboardingConfig({}).executionEnabled === false);
check('execution is only on for the exact "true"',
  cfg.resolveOnboardingConfig({ EXECUTION_ENABLED: 'true' }).executionEnabled === true);
check('onboarding-config reports enabled + executionEnabled',
  /enabled:\s*config\.enabled/.test(read('supabase/functions/onboarding-config/index.ts')) &&
  /executionEnabled:\s*config\.executionEnabled/.test(read('supabase/functions/onboarding-config/index.ts')));
check('onboarding-config is public (verify_jwt=false)',
  /\[functions\.onboarding-config\][\s\S]{0,40}verify_jwt = false/.test(read('supabase/config.toml')));

// ---------------------------------------------------------------------------
console.log('\n[11] Customer mutations are JWT-bound and server-validated');
const submit = stripComments(read('supabase/functions/account-link-submit/index.ts'));
const review = stripComments(read('supabase/functions/account-link-review/index.ts'));
const disconnect = stripComments(read('supabase/functions/account-link-disconnect/index.ts'));
check('submit requires the verified user', submit.includes('requireUser(req)'));
check('submit never reads a body user id', !/body\.user_?id|parsed\.value\.user_?id/.test(submit));
check('submit never reads a body plan id', !/parsed\.value\.plan|body\.plan_?id/.test(submit));
check('submit never reads a body payment/activation status',
  !/parsed\.value\.(status|paymentStatus|activationStatus)/.test(submit));
check('submit derives the plan from the entitlement', submit.includes('entitlement.planId'));
check('submit validates the firm against server config', submit.includes('isConfiguredOnboardingFirm('));
check('submit validates the payload server-side', submit.includes('validateLinkPayload('));
check('submit bounds the JSON body', /readJsonBody\s*[<(]/.test(submit));
check('submit checks payment before inserting', submit.indexOf('isPaidEntitlement(') < submit.indexOf('.insert('));
check('submit refuses a duplicate (409)', /already_open[\s\S]{0,80}409/.test(submit));
check('submit scopes the duplicate lookup by the JWT user',
  /\.eq\("user_id",\s*ctx\.user\.id\)/.test(submit));
check('submit writes the submission audit event', submit.includes('account_link_submitted'));
check('submit records the checkout-completion audit event', submit.includes('logCheckoutVerified('));
check('submit has no broker credential field',
  !/accountLogin\s*[:=][^,]*password|password\s*:/.test(submit));
check('submit is rate limited', submit.includes('createRateLimiter('));

check('review is operator-only', review.includes('requireOperator(req)'));
check('review returns 403 for a non-operator', /ForbiddenError[\s\S]{0,80}403/.test(review));
check('review uses the shared state machine', review.includes('canTransition(') && review.includes('ACTION_RESULT'));
check('review refuses an illegal transition (409)', review.includes('invalid_transition'));
check('review re-checks payment before approving', /action === "approve"[\s\S]{0,400}isPaidEntitlement\(/.test(review));
check('review writes the append-only audit log', review.includes('logLinkAudit('));
check('review notifies the customer through the shared module', review.includes('sendUserEmailInBackground('));
check('review is rate limited', review.includes('createRateLimiter('));

check('customer disconnect requires the verified user', disconnect.includes('requireUser(req)'));
check('customer disconnect scopes by id AND user id',
  /\.eq\("id",\s*id\)[\s\S]{0,80}\.eq\("user_id",\s*ctx\.user\.id\)/.test(disconnect));
check('customer disconnect audits the action', disconnect.includes('account_link_disconnected'));
check('customer disconnect is rate limited', disconnect.includes('createRateLimiter('));

const statusFn = stripComments(read('supabase/functions/onboarding-status/index.ts'));
check('status derives the user from the JWT', statusFn.includes('requireUser(req)'));
check('status derives entitlement server-side', statusFn.includes('resolveEntitlement('));
check('status returns the effective link status', statusFn.includes('deriveEffectiveLinkStatus('));
check('status never reads a user id from the query',
  !/searchParams\.get\(["']user_?id/.test(statusFn));

// ---------------------------------------------------------------------------
console.log('\n[12] Migration: RLS, duplicate guard, no credential column');
const migration = sqlCode('supabase/migrations/20261122000000_managed_account_onboarding.sql');
check('account_links table is created', /CREATE TABLE IF NOT EXISTS public\.account_links/.test(migration));
check('RLS is enabled', /ALTER TABLE public\.account_links ENABLE ROW LEVEL SECURITY/.test(migration));
check('owner select policy', /account_links_owner_select[\s\S]{0,120}user_id = auth\.uid\(\)/.test(migration));
check('operator select requires a strict boolean',
  /jsonb_typeof\(auth\.jwt\(\) -> 'app_metadata' -> 'operator'\) = 'boolean'/.test(migration));
check('client INSERT is denied', /account_links_no_client_insert[\s\S]{0,120}WITH CHECK \(false\)/.test(migration));
check('client UPDATE is denied', /account_links_no_client_update[\s\S]{0,120}USING \(false\)/.test(migration));
check('client DELETE is denied', /account_links_no_client_delete[\s\S]{0,120}USING \(false\)/.test(migration));
check('one open link per user', /account_links_one_open_per_user[\s\S]{0,200}WHERE status IN/.test(migration));
check('all six statuses are allowed',
  /'pending','in_review','approved','rejected','suspended','disconnected'/.test(migration));
check('audit log accepts account_links', /'account_links'/.test(migration));
check('no credential column exists',
  !/^\s*(password|broker_password|provider_token|secret|cid)\s+/im.test(migration));

// ---------------------------------------------------------------------------
console.log('\n[13] No Tradovate call, no execution engine');
check('submit makes no Tradovate call', !/restService|authService|tradovateapi/.test(submit));
check('review makes no Tradovate call', !/restService|authService|tradovateapi/.test(review));
check('disconnect makes no Tradovate call', !/restService|authService|tradovateapi/.test(disconnect));
for (const path of [
  'supabase/functions/_shared/onboarding/orderEngine.ts',
  'supabase/functions/copy-trade/index.ts',
  'supabase/functions/execution-engine/index.ts',
]) {
  check(`no execution module (${path})`, has(path) === false);
}
const onboardingSources = [
  submit, review, disconnect, statusFn,
  read('supabase/functions/_shared/onboarding/config.ts'),
  read('supabase/functions/_shared/execution/guard.ts'),
].join('\n');
check('no order placement/modification/liquidation call',
  !/placeOrder|modifyOrder|cancelOrder|liquidate|flattenPosition/i.test(onboardingSources));

// ---------------------------------------------------------------------------
console.log('\n[14] Customer disclosures and UI wiring');
const view = read('src/components/OnboardingView.tsx');
for (const key of [
  'ownership', 'externalRules', 'noProfitGuarantee',
  'eligibility', 'dataDelayed', 'payoutsProvider', 'noFundsHeld',
]) {
  check(`disclosure acknowledgement: ${key}`, view.includes(`"${key}"`));
}
check('the view renders every acknowledgement from i18n',
  view.includes('ACK_KEYS.map') && view.includes('onboarding.confirm.${key}'));
check('the view never collects a password', !/name=["'](password|token|secret|cid)["']/i.test(view));
check('the view states execution is disabled', view.includes('onboarding.executionDisabledNote'));
check('the dashboard hides the view behind the flag',
  /onboarding\.config\.enabled[\s\S]{0,120}id:\s*'onboarding'/.test(read('src/pages/Dashboard.tsx')));
check('the checkout success page links to onboarding',
  /\/onboarding/.test(read('src/pages/CheckoutSuccess.tsx')));

const i18n = read('src/i18n.ts');
check('onboarding namespace exists in every locale',
  (i18n.match(/^  onboarding: \{/gm) ?? []).length === 11);
check('operatorLinks namespace exists in every locale',
  (i18n.match(/^  operatorLinks: \{/gm) ?? []).length === 11);

if (failures > 0) {
  console.error(`\nonboarding contract check FAILED (${failures} violation(s))`);
  process.exit(1);
}
console.log('\nonboarding contract check passed');
