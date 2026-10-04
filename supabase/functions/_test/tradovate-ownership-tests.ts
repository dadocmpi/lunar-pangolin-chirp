// ============================================================================
// Ownership-scoping tests for the credential store.
//
// Run: deno run -A supabase/functions/_test/tradovate-ownership-tests.ts
//
// The service-role client used inside Edge Functions bypasses RLS, so the
// server code itself must scope every read/write to the authenticated user_id.
// This test drives the real credentialStore functions against a fake Supabase
// client that RECORDS the filters applied, then asserts:
//   * loadCredentials/disconnectIntegration always filter by user_id,
//   * a user asking for someone else's integration is told not_found,
//   * disconnect deletes the credential row (does not just mark a flag).
//
// The fake is a test double for the DB boundary only; the code under test
// (credentialStore.ts) is the real implementation.
// ============================================================================

import {
  CredentialStoreError,
  disconnectIntegration,
  loadCredentials,
} from "../_shared/tradovate/credentialStore.ts";
import { encryptCredentials } from "../_shared/tradovate/crypto.ts";

Deno.env.set("TRADOVATE_ENCRYPTION_KEY", "ownership-test-key");

let passed = 0;
let failed = 0;
async function test(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${name}`);
    console.log(`        ${e instanceof Error ? e.message : e}`);
  }
}
function ok(c: boolean, m: string) {
  if (!c) throw new Error(m);
}
function eq<T>(a: T, b: T, m: string) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(`${m}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  }
}

type Op = [string, ...unknown[]];
interface Recorded {
  table: string;
  ops: Op[];
}

/** Fake supabase client that records filters and resolves via `handler`. */
function fakeAdmin(
  handler: (rec: Recorded) => { data: unknown; error: unknown },
) {
  const recorded: Recorded[] = [];
  function from(table: string) {
    const rec: Recorded = { table, ops: [] };
    recorded.push(rec);
    const builder: Record<string, unknown> = {};
    const chain = (name: string) => (...a: unknown[]) => {
      rec.ops.push([name, ...a]);
      return builder;
    };
    builder.select = chain("select");
    builder.eq = chain("eq");
    builder.neq = chain("neq");
    builder.order = chain("order");
    builder.limit = chain("limit");
    builder.delete = chain("delete");
    builder.update = chain("update");
    builder.upsert = chain("upsert");
    builder.maybeSingle = () => {
      rec.ops.push(["maybeSingle"]);
      return Promise.resolve(handler(rec));
    };
    builder.single = () => {
      rec.ops.push(["single"]);
      return Promise.resolve(handler(rec));
    };
    builder.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) => {
      rec.ops.push(["then"]);
      return Promise.resolve(handler(rec)).then(resolve, reject);
    };
    return builder;
  }
  return { client: { from } as never, recorded };
}

const OWNER = "user-A";
const OTHER = "user-B";
const INTEGRATION = "integ-A";

function filtersOf(rec: Recorded): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const op of rec.ops) {
    if (op[0] === "eq") out[op[1] as string] = op[2];
    if (op[0] === "neq") out[`neq:${op[1]}`] = op[2];
  }
  return out;
}

await test("loadCredentials filters integrations by user_id", async () => {
  const parts = await encryptCredentials({ name: "u", password: "p" }, "ownership-test-key");
  const { client, recorded } = fakeAdmin((rec) => {
    if (rec.table === "integrations") {
      const f = filtersOf(rec);
      // Simulate the DB returning the row only for the real owner.
      if (f.user_id !== OWNER) return { data: null, error: null };
      return {
        data: {
          id: INTEGRATION,
          user_id: OWNER,
          environment: "demo",
          tradovate_account_id: 1,
          tradovate_user_id: 2,
          account_spec: "DEMO1",
          label: null,
          status: "connected",
          last_fill_id: 0,
          token_expires_at: null,
        },
        error: null,
      };
    }
    if (rec.table === "integration_credentials") {
      return {
        data: { ciphertext: parts.ciphertext, iv: parts.iv, auth_tag: parts.authTag, key_version: 1 },
        error: null,
      };
    }
    return { data: null, error: null };
  });

  const { credentials } = await loadCredentials(client, OWNER, INTEGRATION);
  eq(credentials.password, "p", "decrypted for the owner");
  const integRec = recorded.find((r) => r.table === "integrations")!;
  ok(filtersOf(integRec).user_id === OWNER, "integration query scoped by user_id");
});

await test("loadCredentials denies another user's integration", async () => {
  const parts = await encryptCredentials({ name: "u", password: "p" }, "ownership-test-key");
  const { client, recorded } = fakeAdmin((rec) => {
    if (rec.table === "integrations") {
      const f = filtersOf(rec);
      if (f.user_id !== OWNER) return { data: null, error: null };
      return { data: { id: INTEGRATION, user_id: OWNER }, error: null };
    }
    return { data: null, error: null };
  });
  let code = "";
  try {
    await loadCredentials(client, OTHER, INTEGRATION);
  } catch (e) {
    code = e instanceof CredentialStoreError ? e.code : "other";
  }
  eq(code, "integration_not_found", "denied");
  // And the credentials table was never even queried.
  ok(!recorded.some((r) => r.table === "integration_credentials"), "no credential read attempted");
});

await test("disconnectIntegration deletes credentials and scopes by user_id", async () => {
  const { client, recorded } = fakeAdmin((rec) => {
    if (rec.table === "integrations" && rec.ops.some((o) => o[0] === "maybeSingle")) {
      const f = filtersOf(rec);
      if (f.user_id !== OWNER) return { data: null, error: null };
      return { data: { id: INTEGRATION }, error: null };
    }
    return { data: null, error: null };
  });

  await disconnectIntegration(client, OWNER, INTEGRATION);

  const del = recorded.find((r) => r.table === "integration_credentials");
  ok(Boolean(del), "credentials table was targeted");
  ok(del!.ops.some((o) => o[0] === "delete"), "a DELETE was issued (not a soft flag)");
  eq(filtersOf(del!).integration_id, INTEGRATION, "delete scoped to the integration");

  const upd = recorded.find(
    (r) => r.table === "integrations" && r.ops.some((o) => o[0] === "update"),
  );
  ok(Boolean(upd), "integration update issued");
  ok(filtersOf(upd!).user_id === OWNER, "revoke scoped to the user");
});

await test("disconnectIntegration refuses another user's integration", async () => {
  const { client, recorded } = fakeAdmin(() => ({ data: null, error: null }));
  let code = "";
  try {
    await disconnectIntegration(client, OTHER, INTEGRATION);
  } catch (e) {
    code = e instanceof CredentialStoreError ? e.code : "other";
  }
  eq(code, "integration_not_found", "denied");
  ok(!recorded.some((r) => r.table === "integration_credentials"), "no delete attempted");
});

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
