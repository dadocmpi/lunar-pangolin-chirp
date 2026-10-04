// ============================================================================
// Unit tests: AI KYC decision + orchestration + provider.
//
// No network, no DB, no secrets. Proves the fail-closed contract:
//   * only a clean, high-confidence pass auto-approves
//   * a name mismatch / expiry / age / unreadable / uncertainty -> human review
//   * malformed or contradictory model output -> human review
//   * provider missing / down / empty -> human review (never approve)
//   * a model that claims "approved" while a check failed cannot bypass review
// Run: deno run -A supabase/functions/_test/ai-kyc-tests.ts
// ============================================================================

import {
  AI_RESPONSE_SCHEMA,
  decideFromAiOutput,
  normalizeAiOutput,
} from "../_shared/kyc/aiDecision.ts";
import { runAiCheck } from "../_shared/kyc/aiKyc.ts";
import {
  AI_PROVIDER_DATA_FLOW,
  AI_PROVIDER_REGISTRY,
  buildKycPrompt,
  createAiProviderFromEnv,
  createGeminiProvider,
  extractGeminiJson,
  registerAiProvider,
  type AiImage,
  type AiProvider,
} from "../_shared/kyc/aiProvider.ts";

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}`);
  }
}

// A complete, all-pass, high-confidence model response.
function allPass(overrides: Record<string, unknown> = {}) {
  const c = (pass = true, confidence = 0.95, reason = "ok") => ({ pass, confidence, reason });
  return {
    decision: "approved",
    confidence: 0.95,
    reason: "all checks passed",
    checks: {
      name_match: c(),
      not_expired: c(),
      age_18: c(),
      document_type: c(),
      readable: c(),
    },
    ...overrides,
  };
}

const IMG: AiImage = { mime: "image/jpeg", base64: "AAAA" };
const NOW = "2026-10-04T12:00:00.000Z";

const providerReturning = (raw: unknown): AiProvider => ({
  name: "stub",
  analyze: () => Promise.resolve(raw),
});

console.log("[1] Clean high-confidence approval is the ONLY auto-approve path");
check("all-pass 0.95 -> approved", decideFromAiOutput(allPass()).decision === "approved");

console.log("\n[2] Failed checks route to a human (never silently approved)");
{
  // Contradictory: decision says approved but name_match failed.
  const r = decideFromAiOutput(allPass({
    checks: { ...allPass().checks, name_match: { pass: false, confidence: 0.9, reason: "different surname" } },
  }));
  check("name mismatch + claim approved -> manual_review", r.decision === "manual_review");
}
{
  const r = decideFromAiOutput(allPass({
    checks: { ...allPass().checks, not_expired: { pass: false, confidence: 0.99, reason: "expired 2024" } },
  }));
  check("expired doc -> manual_review", r.decision === "manual_review");
}
{
  const r = decideFromAiOutput(allPass({
    checks: { ...allPass().checks, age_18: { pass: false, confidence: 0.99, reason: "born 2010" } },
  }));
  check("underage -> manual_review", r.decision === "manual_review");
}
{
  const r = decideFromAiOutput(allPass({
    checks: { ...allPass().checks, readable: { pass: false, confidence: 0.6, reason: "blurry" } },
  }));
  check("unreadable doc -> manual_review", r.decision === "manual_review");
}

console.log("\n[3] Uncertainty / low confidence routes to a human");
check("explicit manual_review honored", decideFromAiOutput({ ...allPass(), decision: "manual_review" }).decision === "manual_review");
{
  const r = decideFromAiOutput(allPass({ confidence: 0.5 }));
  check("approval at 0.5 overall -> manual_review", r.decision === "manual_review");
}
{
  const checks = { ...allPass().checks, readable: { pass: true, confidence: 0.4, reason: "partly legible" } };
  const r = decideFromAiOutput(allPass({ checks }));
  check("one check below floor -> manual_review", r.decision === "manual_review");
}
{
  const r = decideFromAiOutput(allPass({ confidence: 1.7 }));
  check("out-of-range confidence -> malformed manual_review", r.malformed === true && r.decision === "manual_review");
}

console.log("\n[4] Explicit rejection needs a failed check at confidence");
{
  const checks = { ...allPass().checks, name_match: { pass: false, confidence: 0.95, reason: "mismatch" } };
  const r = decideFromAiOutput({ decision: "rejected", confidence: 0.95, reason: "mismatch", checks });
  check("confident rejection with failed check -> rejected", r.decision === "rejected");
}
{
  const r = decideFromAiOutput({ decision: "rejected", confidence: 0.3, reason: "guess", checks: allPass().checks });
  check("low-confidence rejection -> manual_review", r.decision === "manual_review");
}

console.log("\n[5] Malformed / missing / extra output fails closed");
check("null -> manual_review", decideFromAiOutput(null).decision === "manual_review");
check("string -> manual_review", decideFromAiOutput("approved").decision === "manual_review");
check("array -> manual_review", normalizeAiOutput([allPass()]).malformed === true);
check("missing checks -> malformed", normalizeAiOutput({ decision: "approved", confidence: 0.9, reason: "" }).malformed === true);
check("missing one check -> malformed", normalizeAiOutput(allPass({
  checks: { name_match: { pass: true, confidence: 0.9, reason: "" } },
})).malformed === true);
check("check with non-boolean pass -> malformed", normalizeAiOutput(allPass({
  checks: { ...allPass().checks, age_18: { pass: "yes", confidence: 0.9, reason: "" } },
})).malformed === true);
check("unknown decision enum -> malformed", normalizeAiOutput(allPass({ decision: "maybe" })).malformed === true);

console.log("\n[6] Forced manual review (high-value withdrawal)");
{
  const r = decideFromAiOutput(allPass(), { forceManualReview: true });
  check("forced -> manual_review even on a clean pass", r.decision === "manual_review");
}

console.log("\n[7] Orchestration: provider failures never approve");
{
  const r = await runAiCheck(null, { front: IMG, nowIso: NOW });
  check("no provider -> manual_review", r.decision === "manual_review");
  check("no provider -> providerUnavailable", r.providerUnavailable === true);
}
{
  const r = await runAiCheck(providerReturning(null), { front: IMG, nowIso: NOW });
  check("empty response -> manual_review", r.decision === "manual_review");
}
{
  const throwing: AiProvider = { name: "stub", analyze: () => Promise.reject(new Error("network down")) };
  const r = await runAiCheck(throwing, { front: IMG, nowIso: NOW });
  check("throwing provider -> manual_review", r.decision === "manual_review");
  check("throwing provider records the provider name", r.provider === "stub");
}
{
  const r = await runAiCheck(providerReturning(allPass()), { front: IMG, nowIso: NOW });
  check("clean provider response -> approved", r.decision === "approved");
  check("not flagged unavailable", r.providerUnavailable === false);
}
{
  // Bypass attempt: a compromised/buggy provider returns an already-approved
  // object while a check failed. The decision layer must override it.
  const r = await runAiCheck(
    providerReturning(allPass({ checks: { ...allPass().checks, name_match: { pass: false, confidence: 0.99, reason: "x" } } })),
    { front: IMG, nowIso: NOW },
  );
  check("provider cannot bypass a failed check", r.decision === "manual_review");
}

console.log("\n[8] Prompt + schema contract");
{
  const prompt = buildKycPrompt({ front: IMG, nowIso: NOW, declaredName: "Ana Silva" });
  check("prompt includes the declared name", prompt.includes("Ana Silva"));
  check("prompt warns against trusting authenticity", prompt.includes("NOT an authenticity"));
  const schemaKeys = Object.keys(AI_RESPONSE_SCHEMA.schema.properties.checks.properties);
  check("schema declares all five checks", schemaKeys.length === 5);
}

console.log("\n[9] Gemini response parsing (no network)");
check("extract from a normal candidate", extractGeminiJson({
  candidates: [{ content: { parts: [{ text: JSON.stringify(allPass()) }] } }],
}) !== null);
check("extract tolerates ```json fences", extractGeminiJson({
  candidates: [{ content: { parts: [{ text: "```json\n" + JSON.stringify(allPass()) + "\n```" }] } }],
}) !== null);
check("extract returns null with no candidates", extractGeminiJson({}) === null);
check("extract returns null on non-json text", extractGeminiJson({
  candidates: [{ content: { parts: [{ text: "I cannot help." }] } }],
}) === null);

console.log("\n[10] Gemini provider transport");
{
  let seenUrl = "";
  let seenKey = "";
  const fakeFetch = (url: string | URL | Request, init?: RequestInit) => {
    seenUrl = String(url);
    const headers = new Headers(init?.headers);
    seenKey = headers.get("x-goog-api-key") ?? "";
    return Promise.resolve(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(allPass()) }] } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
  };
  const p = createGeminiProvider({ apiKey: "secret-key", fetchImpl: fakeFetch as typeof fetch });
  const out = await p.analyze({ front: IMG, nowIso: NOW });
  check("provider parses a 2xx body", out !== null);
  check("api key travels in a header, NOT the URL", seenKey === "secret-key" && !seenUrl.includes("secret-key"));
}
{
  const failing = () => Promise.resolve(new Response("nope", { status: 429 }));
  const p = createGeminiProvider({ apiKey: "k", fetchImpl: failing as unknown as typeof fetch });
  let threw = false;
  try { await p.analyze({ front: IMG, nowIso: NOW }); } catch (e) {
    threw = true;
    check("http error message carries no key", !(e as Error).message.includes("k"));
  }
  check("non-2xx throws (caller fails closed)", threw);
}
check("no key configured -> null provider", createAiProviderFromEnv({}) === null);
check("key configured -> provider", createAiProviderFromEnv({ KYC_AI_API_KEY: "x" })?.name === "gemini");

console.log("\n[11] Provider is swappable behind one registry");
{
  // A caller that only knows createAiProviderFromEnv can be pointed at a new
  // vendor by name, without changing kyc-submit.
  const original = AI_PROVIDER_REGISTRY.gemini;
  registerAiProvider("acme", () => ({
    name: "acme",
    analyze: () => Promise.resolve(allPass()),
  }));
  const swapped = createAiProviderFromEnv({ KYC_AI_API_KEY: "k", KYC_AI_PROVIDER: "acme" });
  check("registry returns the requested provider", swapped?.name === "acme");
  check("default remains gemini", createAiProviderFromEnv({ KYC_AI_API_KEY: "k" })?.name === "gemini");
  check("unknown provider -> null (fails closed)", createAiProviderFromEnv({ KYC_AI_API_KEY: "k", KYC_AI_PROVIDER: "nope" }) === null);
  check("no key -> null even with a known provider", createAiProviderFromEnv({ KYC_AI_PROVIDER: "acme" }) === null);
  delete AI_PROVIDER_REGISTRY.acme;
  AI_PROVIDER_REGISTRY.gemini = original;
}

console.log("\n[12] Provider data-flow contract is declared");
check("documents what is sent", AI_PROVIDER_DATA_FLOW.sent.includes("front image"));
check("documents the key is never logged", AI_PROVIDER_DATA_FLOW.neverLogged.includes("api key"));
check("documents raw output is never logged", AI_PROVIDER_DATA_FLOW.neverLogged.includes("raw model output"));
check("documents tokens are not sent", AI_PROVIDER_DATA_FLOW.notSent.includes("tradovate tokens"));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) Deno.exit(1);
