#!/usr/bin/env node
// ============================================================================
// Edge Function smoke test — after `supabase functions deploy`, no function
// may be missing. An undeployed function answers 404 with {"code":"NOT_FOUND"}.
//
// Usage:
//   SUPABASE_URL=https://<ref>.supabase.co node scripts/smoke-edge-functions.mjs
//   node scripts/smoke-edge-functions.mjs https://<ref>.supabase.co
//
// Exit 0 = every function is reachable; 1 = at least one is missing; 2 = no URL.
// No secrets required: we only look for 404 / NOT_FOUND, so an auth 401 or a
// validation 4xx still counts as "deployed".
// ============================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = (
  process.argv[2] ||
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ""
).replace(/\/+$/, "");

if (!base) {
  console.error(
    "No project URL. Set SUPABASE_URL (or pass it as the first argument), e.g.\n" +
      "  SUPABASE_URL=https://<ref>.supabase.co node scripts/smoke-edge-functions.mjs",
  );
  process.exit(2);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fnsDir = path.join(root, "supabase", "functions");
const functions = fs
  .readdirSync(fnsDir)
  .filter((n) => !n.startsWith("_") && fs.statSync(path.join(fnsDir, n)).isDirectory())
  .sort();

console.log(`Smoke testing ${functions.length} Edge Functions at ${base}\n`);

let missing = 0;
for (const fn of functions) {
  const url = `${base}/functions/v1/${fn}`;
  let status = 0;
  let body = "";
  try {
    const res = await fetch(url, { method: "OPTIONS" });
    status = res.status;
    body = await res.text();
  } catch (e) {
    missing++;
    console.error(`  MISS  ${fn}  (request failed: ${e instanceof Error ? e.message : e})`);
    continue;
  }
  const notFound = status === 404 || /"code"\s*:\s*"NOT_FOUND"/.test(body);
  if (notFound) {
    missing++;
    console.error(`  MISS  ${fn}  -> ${status} ${body.slice(0, 120)}`);
  } else {
    console.log(`  OK    ${fn}  -> ${status}`);
  }
}

console.log("");
if (missing > 0) {
  console.error(`SMOKE TEST FAILED: ${missing}/${functions.length} function(s) missing (404/NOT_FOUND).`);
  process.exit(1);
}
console.log(`SMOKE TEST PASSED: all ${functions.length} Edge Functions are deployed.`);
