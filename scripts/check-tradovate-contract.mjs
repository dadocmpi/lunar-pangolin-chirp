#!/usr/bin/env node
/**
 * Tradovate contract gate.
 *
 * Static checks that guard the failure modes this integration must not regress:
 *  1. The client and server connect-gate flags agree and both default ON.
 *  2. Every Tradovate Edge Function verifies the JWT server-side and never
 *     trusts a user_id from the request body.
 *  3. Credentials are only ever persisted through the encrypted store.
 *  4. The credential envelope columns stay in sync with the migration.
 *  5. The dashboard route is wrapped in the connect gate.
 *  6. The browser flag module never reads a server-only secret.
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

let failures = 0;
function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${name}`);
  } else {
    failures++;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

console.log('\n[1] Connect-gate flags default ON and stay in sync');
const clientFlag = read('src/lib/tradovateFlag.ts');
const serverFlag = read('supabase/functions/_shared/tradovate/flag.ts');
check(
  'client flag requires an explicit "false" to disable',
  clientFlag.includes('VITE_REQUIRE_TRADOVATE_CONNECTION') &&
    clientFlag.includes('!== "false"'),
);
check(
  'server flag requires an explicit "false" to disable',
  serverFlag.includes('REQUIRE_TRADOVATE_CONNECTION') &&
    serverFlag.includes('!== "false"'),
);
check(
  'client flag does not read a server secret',
  !clientFlag.includes('Deno.env') &&
    !clientFlag.includes('SERVICE_ROLE') &&
    !clientFlag.includes('TRADOVATE_ENCRYPTION_KEY'),
);

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

console.log('\n[5] Dashboard is behind the connect gate');
const app = read('src/App.tsx');
check(
  '/dashboard is wrapped in ProtectedRoute',
  /<Route path="\/dashboard"[\s\S]{0,120}ProtectedRoute/.test(app),
);
check('gate route is registered', app.includes('/connect-tradovate'));

console.log('\n[6] Disconnect truly deletes credentials');
const store = read('supabase/functions/_shared/tradovate/credentialStore.ts');
check(
  'disconnect deletes the credential row',
  /disconnectIntegration[\s\S]*from\(["']integration_credentials["']\)[\s\S]*\.delete\(\)/.test(store),
);
check('disconnect revokes the integration', /status:\s*["']revoked["']/.test(store));

console.log(
  failures === 0
    ? '\ntradovate contract check passed'
    : `\ntradovate contract check FAILED (${failures})`,
);
process.exit(failures === 0 ? 0 : 1);
