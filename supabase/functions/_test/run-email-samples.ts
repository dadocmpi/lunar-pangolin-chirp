// ============================================================================
// CLI runner for the owner-notification samples.
//
//   deno run -A supabase/functions/_test/run-email-samples.ts
//
// With RESEND_API_KEY / EMAIL_TO unset the sends are logged instead of
// delivered, so this is safe to run offline. Set both to actually deliver a
// sample of every event type to the owner inbox.
// ============================================================================

import { buildSamples, runSamples } from "../_shared/email-samples.ts";

const configured = Boolean(Deno.env.get("RESEND_API_KEY"));
const recipient = Deno.env.get("EMAIL_TO") ?? "(EMAIL_TO not set)";

console.log(
  `\nBraxel Markets — owner email test\n` +
    `RESEND_API_KEY: ${
      configured ? "configured" : "MISSING (sends are logged only)"
    }\n` +
    `EMAIL_TO: ${recipient}\n` +
    `types: ${buildSamples().length}\n`,
);

const results = await runSamples();
for (const r of results) {
  const status = r.ok
    ? "SENT   "
    : r.skipped === "not_configured"
    ? "LOGGED "
    : "FAILED ";
  console.log(
    `${status} ${r.expectedPrefix} ${r.subject}` +
      (r.error ? ` (${r.error})` : ""),
  );
}

const sent = results.filter((r) => r.ok).length;
const logged = results.filter((r) => r.skipped === "not_configured").length;
const failed = results.filter((r) => !r.ok && r.skipped !== "not_configured")
  .length;
console.log(
  `\n${results.length} types — sent: ${sent}, logged: ${logged}, failed: ${failed}\n`,
);
if (failed > 0) Deno.exit(1);
