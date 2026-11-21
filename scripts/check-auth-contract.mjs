#!/usr/bin/env node
/**
 * Account lifecycle contract gate.
 *
 * Guards the transitions that were audited and fixed:
 *  1. Duplicate signup is detected (Supabase returns an empty `identities`
 *     array) instead of pushing the visitor into step 2 with no session.
 *  2. An unconfirmed email is reported as such and never routed to /register.
 *  3. Password reset completes on /reset-password (a recovery link must not
 *     leave the customer in the terminal without setting a new password).
 *  4. The retired confirm-signup relay is not called and cannot send email.
 *  5. profiles is not client-writable outside first/last name (so a customer
 *     cannot self-approve KYC, mark the profile complete or repoint Stripe).
 *  6. services is owner-read-only (no client-side activation).
 *
 * The pure helpers in src/lib/authFlow.ts are bundled and exercised against
 * fixtures, so this checks behaviour, not just the presence of a string.
 *
 * Usage: node scripts/check-auth-contract.mjs
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
const stripComments = (s) => s.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

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
  const dir = mkdtempSync(join(tmpdir(), 'auth-check-'));
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
// 1. Pure helpers behave as the pages assume
// ---------------------------------------------------------------------------
const { isDuplicateSignup, classifyAuthError, isRecoveryRedirect, isExistingAccountError, readLinkError, classifyLinkError } =
  await bundle('src/lib/authFlow.ts');

check('duplicate signup: empty identities -> true', isDuplicateSignup({ identities: [] }) === true);
check('duplicate signup: one identity -> false', isDuplicateSignup({ identities: [{}] }) === false);
check('duplicate signup: null user -> false', isDuplicateSignup(null) === false);
check('duplicate signup: missing identities -> false', isDuplicateSignup({}) === false);

check('existing account error: registered', isExistingAccountError('User already registered') === true);
check('existing account error: exists', isExistingAccountError('An account with this email already exists') === true);
check('existing account error: unrelated', isExistingAccountError('Password should be at least 6 characters') === false);

check('auth error: unconfirmed email', classifyAuthError('Email not confirmed') === 'email_not_confirmed');
check('auth error: wrong password', classifyAuthError('Invalid login credentials') === 'invalid_credentials');
check('auth error: anything else', classifyAuthError('Too many requests') === 'other');

check('recovery redirect: implicit hash', isRecoveryRedirect('#access_token=a&type=recovery', '') === true);
check('recovery redirect: PKCE query', isRecoveryRedirect('', '?code=a&type=recovery') === true);
check('recovery redirect: normal signup hash', isRecoveryRedirect('#access_token=a&type=signup', '?lng=pt') === false);
check('recovery redirect: empty URL', isRecoveryRedirect('', '') === false);

check('link error: reads an implicit fragment error',
  readLinkError('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired', '')?.code === 'otp_expired');
check('link error: reads a query error',
  readLinkError('', '?error=access_denied&error_code=otp_expired')?.code === 'otp_expired');
check('link error: normal link is not an error', readLinkError('#access_token=a&type=recovery', '') === null);
check('link error: empty URL is not an error', readLinkError('', '') === null);

check('link kind: otp_expired -> expired', classifyLinkError({ code: 'otp_expired' }) === 'expired');
check('link kind: expired description -> expired',
  classifyLinkError({ message: 'Email link is invalid or has expired' }) === 'expired');
check('link kind: already used -> used',
  classifyLinkError({ message: 'This link has already been used' }) === 'used');
check('link kind: anything else -> invalid', classifyLinkError({ message: 'boom' }) === 'invalid');
check('link kind: empty input -> invalid', classifyLinkError({}) === 'invalid');

// ---------------------------------------------------------------------------
// 2. Registration / login wiring
// ---------------------------------------------------------------------------
const register = stripComments(read('src/pages/Register.tsx'));
check('register detects a duplicate signup', register.includes('isDuplicateSignup(data.user)'));
check('duplicate signup never reveals that the address exists',
  /isDuplicateSignup\(data\.user\)[\s\S]{0,200}setConfirmationPending\(true\)/.test(register) &&
  !register.includes('emailAlreadyRegistered'));
check('existing-account error is masked', register.includes('isExistingAccountError(message)'));
check('register can resend the confirmation email', register.includes('supabase.auth.resend('));
check('register shows the resend copy',
  register.includes("t('auth.resendConfirmation')") && register.includes("t('auth.resendSent')"));
check('register no longer calls confirm-signup', !register.includes('confirm-signup'));
check('register never stores a password', !/localStorage\.setItem\([^)]*password/i.test(register));
check('register handles signUp without a session (email confirmation)',
  /if \(!data\.session\)[\s\S]{0,200}setConfirmationPending\(true\)/.test(register));
check('register renders the confirmation screen',
  register.includes("t('auth.confirmEmailTitle')") && register.includes("t('auth.confirmEmailSent'"));
check('register hides the step indicator while confirming',
  register.includes('{!confirmationPending && stepIndicator}'));

const login = stripComments(read('src/pages/Login.tsx'));
check('login classifies the auth error', login.includes('classifyAuthError('));
check('login distinguishes an unconfirmed email', login.includes("t('auth.emailNotConfirmed')"));
check('login never routes a failed sign-in to /register', !login.includes("navigate('/register'"));
check('login redirects recovery links to /reset-password', login.includes("navigate('/reset-password'"));
check('login sends the reset email to /reset-password', /resetPasswordForEmail[\s\S]{0,200}\/reset-password/.test(login));
check('login can resend the confirmation email', /supabase\.auth\.resend\(/.test(login));
check('login shows the resend hint for an unconfirmed email',
  login.includes("t('auth.emailNotConfirmedHint')") && login.includes("t('auth.resendConfirmation')"));
check('login resend targets /auth-callback', /auth\.resend\([\s\S]{0,240}\/auth-callback/.test(login));

const registerCode = register;
check('register requires the consent checkbox', /if \(!acceptedTerms\)/.test(registerCode));
check('register sends the consent to the server-side trigger',
  /signUp\(\{[\s\S]{0,400}terms_accepted:\s*true/.test(registerCode));

// ---------------------------------------------------------------------------
// 3. Password reset page
// ---------------------------------------------------------------------------
check('reset page exists', has('src/pages/ResetPassword.tsx'));
const reset = stripComments(read('src/pages/ResetPassword.tsx'));
check('reset page exchanges the PKCE code', reset.includes('exchangeCodeForSession'));
check('reset page listens for PASSWORD_RECOVERY', reset.includes('PASSWORD_RECOVERY'));
check('reset page updates the password', /updateUser\(\{\s*password\s*\}\)/.test(reset));
check('reset page signs the recovery session out', reset.includes('signOut()'));
check('reset page never logs the password value', !/console\.[a-z]+\([^)]*\b(password|confirmPassword)\b\s*[,)]/.test(reset));
check('reset route is registered', read('src/App.tsx').includes('path="/reset-password"'));
check('reset page reads link errors from the URL', reset.includes('readLinkError('));
check('reset page classifies expired/used links', reset.includes('classifyLinkError('));
check('reset page distinguishes the localized messages',
  reset.includes("'auth.resetLinkExpired'") && reset.includes("'auth.resetLinkUsed'"));
check('reset page only accepts a recovery session',
  reset.includes('RECOVERY_FLAG') && /isRecoveryRedirect\(/.test(reset) && reset.includes('hasRecoveryFlag()'));
check('reset page clears the recovery marker after the update', /clearRecoveryFlag\(\)[\s\S]{0,120}signOut\(\)/.test(reset));

const callback = stripComments(read('src/pages/AuthCallback.tsx'));
check('auth callback reads link errors from the URL', callback.includes('readLinkError('));
check('auth callback classifies expired/used links', callback.includes('classifyLinkError('));
check('auth callback localizes the expired confirmation message',
  callback.includes("expired: 'authCallback.expiredLink'") &&
  callback.includes("used: 'authCallback.usedLink'"));
check('auth callback never echoes the provider error text',
  !/setErrorMessage\(\s*decodeURIComponent\(/.test(callback) &&
  !/setErrorMessage\(\s*error instanceof Error \? error\.message/.test(callback));

// ---------------------------------------------------------------------------
// 4. confirm-signup is retired, not an open relay
// ---------------------------------------------------------------------------
const confirmSignup = stripComments(read('supabase/functions/confirm-signup/index.ts'));
check('confirm-signup refuses every request (410)', /status:\s*410/.test(confirmSignup));
check('confirm-signup is marked retired', confirmSignup.includes('endpoint_retired'));
check('confirm-signup no longer calls Resend', !confirmSignup.includes('api.resend.com'));
check('confirm-signup no longer accepts a body', !confirmSignup.includes('req.json()'));

// ---------------------------------------------------------------------------
// 5. Database hardening migration
// ---------------------------------------------------------------------------
const migrationPath = 'supabase/migrations/20261012000000_secure_profile_and_services_rls.sql';
check('hardening migration exists', has(migrationPath));
const migration = stripComments(read(migrationPath));

check('profiles: client INSERT/UPDATE is revoked', /REVOKE INSERT, UPDATE ON public\.profiles FROM anon, authenticated/.test(migration));
check('profiles: only first/last name are writable', /GRANT UPDATE \(first_name, last_name\) ON public\.profiles TO authenticated/.test(migration));
for (const col of ['kyc_status', 'profile_completed', 'stripe_customer_id', 'terms_accepted_at']) {
  check(`profiles: ${col} is not granted`, !new RegExp(`GRANT [^;]*${col}`).test(migration));
}
check('services: RLS is enabled', /ALTER TABLE public\.services ENABLE ROW LEVEL SECURITY/.test(migration));
check('services: owner read policy', migration.includes('services_owner_select'));
check('services: client INSERT is denied', /services_no_client_insert[\s\S]{0,120}WITH CHECK \(false\)/.test(migration));
check('services: client UPDATE is denied', /services_no_client_update[\s\S]{0,120}USING \(false\)/.test(migration));
check('services: client DELETE is denied', /services_no_client_delete[\s\S]{0,120}USING \(false\)/.test(migration));
check('services: write grants are revoked', /REVOKE INSERT, UPDATE, DELETE ON public\.services FROM anon, authenticated/.test(migration));
check('legacy services write policies are dropped',
  migration.includes('"Users can only insert their own services"') &&
  migration.includes('"Users can only update their own services"'));

// The untracked manual RLS script must stay inert: re-running it must never
// re-grant client writes on services or profiles.
if (has('supabase_rls_fix.sql')) {
  const legacy = stripComments(read('supabase_rls_fix.sql'));
  check('legacy RLS fix script grants no services writes', !/GRANT\s+(INSERT|UPDATE|DELETE|ALL)[^;]*services/i.test(legacy));
  check('legacy RLS fix script creates no policies', !/CREATE POLICY/i.test(legacy));
}

// ---------------------------------------------------------------------------
// 6. Activation and payment states are server-controlled and terminal
// ---------------------------------------------------------------------------
const activationStatus = await bundle('supabase/functions/_shared/activation/status.ts');
check('activation: rejected is terminal', activationStatus.canReview('rejected', 'approved') === false);
check('activation: approved is terminal', activationStatus.canReview('approved', 'rejected') === false);
check('activation: info_requested can be reviewed', activationStatus.canReview('info_requested', 'in_review') === true);
check('activation: open statuses block duplicates',
  activationStatus.isOpenStatus('pending') === true && activationStatus.isOpenStatus('in_review') === true);
check('activation: decided statuses do not block',
  activationStatus.isOpenStatus('approved') === false && activationStatus.isOpenStatus('rejected') === false);

const plans = await bundle('supabase/functions/_shared/plans.ts');
check('payment: confirmed can be refunded', plans.canTransition('confirmed', 'refunded') === true);
check('payment: refunded is terminal', plans.canTransition('refunded', 'confirmed') === false);
check('payment: canceled is terminal', plans.canTransition('canceled', 'confirmed') === false);

const activationView = stripComments(read('src/components/ActivateAccountView.tsx'));
check('activation UI keeps no client-side state',
  !/localStorage|sessionStorage|location\.search|useSearchParams/.test(activationView));
check('activation UI reads the row from the server endpoint',
  activationView.includes('functionsUrl("account-link")'));
check('activation UI never reads activation rows directly',
  !/\.from\(\s*["']account_activations["']\s*\)/.test(activationView));
check('activation UI gates the active plan on the server status',
  activationView.includes('resolveOnboardingStep(') && /step === ["']active["']/.test(activationView));

const activationMigration = read('supabase/migrations/20261010000000_account_activation.sql');
check('account_activations: owner-only read',
  activationMigration.includes('account_activations_owner_select'));
check('account_activations: client INSERT denied',
  /account_activations_no_client_insert[\s\S]{0,120}WITH CHECK \(false\)/.test(activationMigration));

const dashboard = stripComments(read('src/pages/Dashboard.tsx'));
check('logout calls supabase signOut', /handleLogout[\s\S]{0,400}signOut\(\)/.test(dashboard));

// ---------------------------------------------------------------------------
// 7. The KYC gate still reads server-side state
// ---------------------------------------------------------------------------
const gate = stripComments(read('supabase/functions/_shared/kyc/gate.ts'));
check('withdrawal gate reads the DB status, not the body', gate.includes('db.readKycStatus(authenticatedUserId)'));
const withdrawal = stripComments(read('supabase/functions/withdrawal-request/index.ts'));
check('withdrawal-request derives the user from the JWT', withdrawal.includes('auth.getUser()'));

// ---------------------------------------------------------------------------
// 8. Localization coverage and documented redirect URLs
// ---------------------------------------------------------------------------
const i18n = read('src/i18n.ts');
for (const key of ['emailNotConfirmedHint', 'resetLinkExpired', 'resetLinkUsed', 'expiredLink', 'usedLink']) {
  const count = (i18n.match(new RegExp(`\\b${key}:`, 'g')) || []).length;
  check(`i18n: ${key} exists in all 11 locales`, count === 11, `found ${count}`);
}

const runbook = read('docs/account-lifecycle-runbook.md');
check('runbook documents the production reset URL',
  runbook.includes('https://braxelmarkets.vercel.app/reset-password'));
check('runbook preserves the auth-callback URL',
  runbook.includes('https://braxelmarkets.vercel.app/auth-callback'));
check('runbook records the suspension gap', /Account suspension — not implemented/.test(runbook));

if (failures > 0) {
  console.error(`\naccount lifecycle contract check FAILED (${failures} violation(s))`);
  process.exit(1);
}
console.log('\naccount lifecycle contract check passed');
