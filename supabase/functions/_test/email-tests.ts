// ============================================================================
// Owner-notification test harness.
//
// Unit-tests the pure logic in _shared/email.ts (sanitization, redaction,
// escaping, prefixes) and then fires one sample of every event type through
// notifyOwner. With RESEND_API_KEY unset the sends are logged instead of
// delivered, so this runs offline.
//
//   deno run -A supabase/functions/_test/email-tests.ts
// ============================================================================

import {
  escapeHtml,
  isSensitiveKey,
  notifyOwner,
  sanitizeData,
  TYPE_PREFIXES,
} from "../_shared/email.ts";
import { buildSamples, runSamples } from "../_shared/email-samples.ts";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`  PASS  ${name}`);
      passed++;
    })
    .catch((e) => {
      console.error(`  FAIL  ${name}`);
      console.error(e);
      failed++;
    });
}

function ok(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// ---------------------------------------------------------------------------
console.log("\n[1] Redaction and sanitization");
// ---------------------------------------------------------------------------

await test("redacts password / token / card fields by key", () => {
  const out = sanitizeData({
    name: "Ana",
    password: "hunter2",
    api_key: "re_123",
    cvv: "123",
    card_number: "4111111111111111",
    authorization: "Bearer x",
  });
  ok(out.name === "Ana", "name should pass through");
  for (
    const k of ["password", "api_key", "cvv", "card_number", "authorization"]
  ) {
    ok(out[k] === "«redacted»", `${k} should be redacted, got ${out[k]}`);
  }
});

await test("redacts card-like numbers in free-text values", () => {
  const out = sanitizeData({ note: "my card is 4111 1111 1111 1111 ok" });
  ok(out.note === "«redacted»", "card-like value should be redacted");
});

await test("flattens one level of nested data", () => {
  const out = sanitizeData({ metadata: { plan: "pro", password: "x" } });
  ok(out["metadata.plan"] === "pro", "nested scalar flattened");
  ok(out["metadata.password"] === "«redacted»", "nested secret redacted");
});

await test("redacts Portuguese-sensitive keys (senha, cartao, chave)", () => {
  const out = sanitizeData({
    senha: "hunter2",
    cartao: "4111 1111 1111 1111",
    chave_api: "re_123",
    codigo_2fa: "123456",
  });
  for (const k of ["senha", "cartao", "chave_api", "codigo_2fa"]) {
    ok(out[k] === "«redacted»", `${k} should be redacted, got ${out[k]}`);
  }
});

await test("isSensitiveKey matches expected keys", () => {
  ok(isSensitiveKey("password"), "password");
  ok(isSensitiveKey("senha"), "senha");
  ok(isSensitiveKey("CARD_NUMBER"), "card_number case-insensitive");
  ok(!isSensitiveKey("email"), "email is not sensitive");
});

// ---------------------------------------------------------------------------
console.log("\n[2] HTML escaping / injection guard");
// ---------------------------------------------------------------------------

await test("escapes HTML metacharacters", () => {
  const out = escapeHtml(`<img src=x onerror="alert(1)">&'`);
  ok(!out.includes("<"), "no raw <");
  ok(out.includes("&lt;img"), "escaped <");
  ok(out.includes("&amp;"), "escaped &");
  ok(out.includes("&quot;"), "escaped quote");
  ok(out.includes("&#39;"), "escaped apostrophe");
});

await test("escaped payload cannot break out of a value cell", () => {
  const out = escapeHtml("</td></tr><script>alert(1)</script>");
  ok(!out.includes("<script>"), "script tag must be escaped");
});

// ---------------------------------------------------------------------------
console.log("\n[3] Subject prefixes per type");
// ---------------------------------------------------------------------------

await test("every event type has the required prefix", () => {
  const expected: Record<string, string> = {
    novo_cliente: "[Novo Cliente]",
    novo_lead: "[Lead]",
    compra: "[Compra]",
    pagamento: "[Pagamento]",
    conta: "[Conta]",
    erro: "[Erro]",
    webhook: "[Webhook]",
  };
  for (const [type, prefix] of Object.entries(expected)) {
    ok(
      TYPE_PREFIXES[type as keyof typeof TYPE_PREFIXES] === prefix,
      `prefix for ${type}`,
    );
  }
});

// ---------------------------------------------------------------------------
console.log("\n[4] Robustness — never throws when unconfigured");
// ---------------------------------------------------------------------------

await test("notifyOwner returns not_configured without a key", async () => {
  const prior = Deno.env.get("RESEND_API_KEY");
  Deno.env.delete("RESEND_API_KEY");
  try {
    const res = await notifyOwner({
      type: "erro",
      subject: "probe",
      data: { a: 1 },
    });
    ok(res.ok === false, "should not report delivered");
    ok(res.skipped === "not_configured", `skipped=${res.skipped}`);
  } finally {
    if (prior) Deno.env.set("RESEND_API_KEY", prior);
  }
});

await test("duplicate idempotency key is suppressed on second call", async () => {
  const prior = Deno.env.get("RESEND_API_KEY");
  Deno.env.delete("RESEND_API_KEY");
  const key = `dup-test-${Date.now()}`;
  try {
    const first = await notifyOwner({
      type: "webhook",
      subject: "first",
      idempotencyKey: key,
    });
    const second = await notifyOwner({
      type: "webhook",
      subject: "second",
      idempotencyKey: key,
    });
    // Without a key configured both are "not_configured"; the duplicate check
    // runs first, so the second must be flagged as duplicate.
    ok(first.skipped === "not_configured", "first is not_configured");
    ok(second.skipped === "duplicate", `second skipped=${second.skipped}`);
  } finally {
    if (prior) Deno.env.set("RESEND_API_KEY", prior);
  }
});

// ---------------------------------------------------------------------------
console.log("\n[5] One sample email per event type");
// ---------------------------------------------------------------------------

await test("buildSamples covers every event type", () => {
  const samples = buildSamples();
  const types = new Set(samples.map((s) => s.type));
  const expected = Object.keys(TYPE_PREFIXES).length;
  ok(samples.length === expected, `expected ${expected} samples, got ${samples.length}`);
  for (const t of Object.keys(TYPE_PREFIXES)) {
    ok(types.has(t as keyof typeof TYPE_PREFIXES), `missing sample for ${t}`);
  }
});

await test("runSamples never throws and reports each type", async () => {
  const prior = Deno.env.get("RESEND_API_KEY");
  Deno.env.delete("RESEND_API_KEY");
  try {
    const results = await runSamples();
    const expected = Object.keys(TYPE_PREFIXES).length;
    ok(results.length === expected, `expected ${expected} results, got ${results.length}`);
    for (const r of results) {
      ok(
        r.ok === true || r.skipped === "not_configured",
        `unexpected failure for ${r.type}: ${r.error ?? r.skipped}`,
      );
    }
  } finally {
    if (prior) Deno.env.set("RESEND_API_KEY", prior);
  }
});

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) Deno.exit(1);
