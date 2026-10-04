#!/usr/bin/env node
/**
 * Tradovate contract gate.
 *
 * Static checks that guard the failure modes this integration must not regress:
 *  1. There is no blocking connect gate: no REQUIRE_TRADOVATE_CONNECTION flag,
 *     no router guard, and the dashboard route is not wrapped.
 *  2. Every Tradovate Edge Function verifies the JWT server-side and never
 *     trusts a user_id from the request body.
 *  3. Credentials are only ever persisted through the encrypted store.
 *  4. The credential envelope columns stay in sync with the migration.
 *  5. The in-dashboard view owns the empty state and the connect panel.
 *  6. The browser never stores or logs the password; the panel sends it only to
 *     the Edge Function.
 *  7. Disconnect truly deletes credentials.
 *
 * Exits non-zero on any violation. Read-only: parses files, runs nothing.
 *
 * Usage: node scripts/check-tradovate-contract.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const has = (p) => existsSync(resolve(root, p));

let failures = 0;
function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${name}`);
  } else {
    failures++;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

console.log('\n[1] No blocking connect gate remains');
check('client gate flag module is gone', !has('src/lib/tradovateFlag.ts'));
check('server gate flag module is gone', !has('supabase/functions/_shared/tradovate/flag.ts'));
check('router guard component is gone', !has('src/components/ProtectedRoute.tsx'));
check('blocking gate page is gone', !has('src/pages/ConnectTradovate.tsx'));
const app = read('src/App.tsx');
check('dashboard route is not wrapped in a guard',
  /<Route path="\/dashboard"[\s\S]{0,120}?<Dashboard \/>/.test(app) &&
    !/ProtectedRoute/.test(app));
check('no REQUIRE_TRADOVATE_CONNECTION flag anywhere',
  !/REQUIRE_TRADOVATE_CONNECTION/.test(read('src/App.tsx')) &&
    !existsSync(resolve(root, 'src/lib/tradovateFlag.ts')) &&
    !existsSync(resolve(root, 'supabase/functions/_shared/tradovate/flag.ts')));

console.log('\n[2] Edge Functions verify the JWT server-side');
const fnDir = resolve(root, 'supabase/functions');
const tradovateFns = readdirSync(fnDir).filter((d) =>
  d.startsWith('tradovate-') && statSync(join(fnDir, d)).isDirectory(),
);
check('tradovate-* functions exist', tradovateFns.length >= 5, `found ${tradovateFns.length}`);
for (const fn of tradovateFns) {
  const src = read(`supabase/functions/${fn}/index.ts`);
  // tradovate-sync has a service-role path plus the user path; the others must
  // all call requireUser.
  check(`${fn} derives the user from the verified JWT`, src.includes('requireUser'));
  check(
    `${fn} never trusts a body user_id`,
    !/body\.user_?id/.test(src) && !/body\[["']user_?id["']\]/.test(src),
  );
}

console.log('\n[3] Credentials only persist through the encrypted store');
const connect = read('supabase/functions/tradovate-connect/index.ts');
check('connect uses upsertIntegrationWithCredentials', connect.includes('upsertIntegrationWithCredentials'));
check(
  'connect never writes a raw password to the DB',
  !/from\(["']integration_credentials["']\)[\s\S]*password/.test(connect),
);
const crypto = read('supabase/functions/_shared/tradovate/crypto.ts');
check('crypto uses AES-GCM', crypto.includes('AES-GCM'));
check('crypto reads the encryption key from the env', crypto.includes('TRADOVATE_ENCRYPTION_KEY'));

console.log('\n[4] Credential envelope matches the migration');
const migrations = readdirSync(resolve(root, 'supabase/migrations'));
const mig = migrations.find((f) => f.includes('tradovate_integration'));
check('migration present', Boolean(mig));
if (mig) {
  const sql = read(`supabase/migrations/${mig}`);
  for (const col of ['ciphertext', 'iv', 'auth_tag', 'key_version']) {
    check(`migration has integration_credentials.${col}`, sql.includes(col));
  }
  check('fills are unique per integration + tradovate fill id',
    /tradovate_fills[\s\S]*UNIQUE[\s\S]*integration_id[\s\S]*tradovate_fill_id/i.test(sql) ||
    /UNIQUE\s*\(\s*integration_id\s*,\s*tradovate_fill_id/i.test(sql));
  check('RLS is enabled', /ENABLE ROW LEVEL SECURITY/i.test(sql));
}

console.log('\n[5] In-dashboard view owns the empty state and the connect panel');
const trades = read('src/components/TradovateTrades.tsx');
const panel = read('src/components/TradovateConnectPanel.tsx');
check('empty state renders the connect CTA', trades.includes('tradovate.connectCta'));
check('view opens the connect panel', trades.includes('TradovateConnectPanel'));
check('panel posts credentials to the Edge Function',
  panel.includes('functionsUrl("tradovate-connect")'));
check('panel offers demo/live selection', panel.includes('"demo"') && panel.includes('"live"'));
check('panel has a trust notice', panel.includes('connectTradovate.trustNotice'));

console.log('\n[6] The browser never stores or logs the password');
check('password is never written to web storage',
  !/localStorage[\s\S]{0,80}password/i.test(panel) &&
    !/sessionStorage[\s\S]{0,80}password/i.test(panel));
check('password is never console-logged', !/console\.[a-z]+\([^)]*password/i.test(panel));
check('password is cleared from memory after use', /setPassword\(""\)/.test(panel));

console.log('\n[7] Disconnect truly deletes credentials');
const store = read('supabase/functions/_shared/tradovate/credentialStore.ts');
check(
  'disconnect deletes the credential row',
  /disconnectIntegration[\s\S]*from\(["']integration_credentials["']\)[\s\S]*\.delete\(\)/.test(store),
);
check('disconnect revokes the integration', /status:\s*["']revoked["']/.test(store));

console.log('\n[8] App cid/sec are server secrets, not client env');
const appCreds = read('supabase/functions/_shared/tradovate/appCredentials.ts');
const authSvc = read('supabase/functions/_shared/tradovate/authService.ts');
check('app credential resolver reads Edge Function secrets',
  appCreds.includes('TRADOVATE_APP_CID') && appCreds.includes('TRADOVATE_APP_SECRET'));
check('resolver implements client-override then server fallback',
  /clientCid[\s\S]*TRADOVATE_APP_CID[\s\S]*TRADOVATE_APP_SECRET/.test(appCreds));
check('authService resolves cid/sec (not a raw spread)',
  authSvc.includes('resolveAppCredentials(credentials.cid, credentials.sec)'));
check('no client bundle env var named for the app cid/sec',
  !/VITE_TRADOVATE_APP_(CID|SECRET)/.test(panel) &&
    !/VITE_TRADOVATE_APP_(CID|SECRET)/.test(trades));
check('cid/sec is an explicit advanced section in the panel',
  panel.includes('showAdvanced') && panel.includes('connectTradovate.advancedToggle'));

console.log('\n[9] First-run welcome screen is a SOFT gate (never blocks a route)');
const welcomePath = 'src/components/TradovateWelcome.tsx';
check('welcome component exists', has(welcomePath));
if (has(welcomePath)) {
  const welcome = read(welcomePath);
  const dash = read('src/pages/Dashboard.tsx');
  check('welcome offers the skip link', welcome.includes('t("welcome.skip")'));
  check('welcome opens the connect panel', welcome.includes('TradovateConnectPanel'));
  check('welcome is not a fixed full-screen overlay',
    !/fixed inset-0|position:\s*fixed/.test(welcome));
  check('dashboard only shows the welcome on the default view',
    /activeView === 'services' && \([\s\S]{0,120}?tradovate\.enabled && tradovate\.welcomeShow/.test(dash));
  check('dashboard route is still not wrapped in a guard',
    /<Route path="\/dashboard"[\s\S]{0,80}?<Dashboard \/>/.test(read('src/App.tsx')));
  check('skip persists server-side (DB table + RPC)',
    has('supabase/migrations/20261008000000_tradovate_welcome_skip.sql') &&
    read('supabase/migrations/20261008000000_tradovate_welcome_skip.sql')
      .includes('public.tradovate_welcome_state'));
}

console.log('\n[10] Welcome FAILS OPEN (never shows on error, never blocks)');
{
  const hook = read('src/hooks/useTradovateConnection.ts');
  const statusFn = read('supabase/functions/tradovate-status/index.ts');
  const store = read('supabase/functions/_shared/tradovate/credentialStore.ts');
  check('client decision is a pure, testable module', has('src/lib/tradovateWelcome.ts'));
  check('hook uses the pure resolveWelcome decision',
    /const welcome = resolveWelcome\(data\)/.test(hook));
  check('hook hides welcome on non-ok / network error',
    /if \(!res\.ok\)[\s\S]{0,220}setWelcomeShow\(false\)/.test(hook) &&
    /catch \{[\s\S]{0,220}setWelcomeShow\(false\)/.test(hook));
  check('store throws on ANY welcome-state read error (missing table included)',
    /if \(error\) \{\s*throw new CredentialStoreError\("welcome_state_read_failed"/.test(store));
  check('status suppresses welcome when the skip read throws (still 200)',
    /catch \{\s*welcomeReadable = false;\s*skipped = true;\s*\}/.test(statusFn) &&
    /showWelcome = welcomeReadable && !connected && !everConnected && !skipped/.test(statusFn));
}

console.log('\n[11] Connect errors are accurate (never blame the user by default)');
{
  const classifier = read('src/lib/tradovateConnectError.ts');
  const panel = read('src/components/TradovateConnectPanel.tsx');
  check('classifier is a pure, testable module', has('src/lib/tradovateConnectError.ts'));
  check('panel uses the classifier', /classifyConnectError\(/.test(panel));
  check('our 404/5xx maps to service_unavailable',
    /status === 404 \|\|[\s\S]{0,80}status >= 500[\s\S]{0,40}return "service_unavailable"/.test(classifier));
  check('offline is gated on navigator.onLine being false',
    /online === false \? "offline" : "service_unavailable"/.test(classifier));
  check('server auth codes map to distinct UI states',
    /invalid_credentials: "invalid_credentials"/.test(classifier) &&
    /api_disabled: "api_disabled"/.test(classifier) &&
    /rate_limited: "rate_limited"/.test(classifier) &&
    /circuit_open: "circuit_open"/.test(classifier) &&
    /transport: "tradovate_unreachable"/.test(classifier));
  check('the generic "transport" catch is gone from the panel',
    !/setErrorCode\("transport"\)/.test(panel));
  const en = read('src/i18n.ts');
  for (const key of [
    'service_unavailableTitle',
    'service_unavailable',
    'offlineTitle',
    'offline',
    'tradovate_unreachableTitle',
    'tradovate_unreachable',
    'session_expiredTitle',
    'session_expired',
  ]) {
    check(`i18n has connectTradovate.errors.${key}`, new RegExp(`\\b${key}:`).test(en));
  }
}


console.log(
  failures === 0
    ? '\ntradovate contract check passed'
    : `\ntradovate contract check FAILED (${failures})`,
);
process.exit(failures === 0 ? 0 : 1);
