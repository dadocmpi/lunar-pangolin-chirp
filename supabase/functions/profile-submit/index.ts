// ============================================================================
// profile-submit — save the customer's contact + billing details.
//
// Security contract:
//   * The user id comes from the verified JWT, never from the body.
//   * Every field is re-validated server-side (the browser is never trusted).
//   * Only the caller's own profiles row is written, scoped by user id.
//   * profile_completed is set true only after a fully valid payload.
//   * NO password and NO card data is accepted or stored here.
//
// Used by step 2 of the signup, the "My profile" editor, and the checkout
// "update my profile with these details" option.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireUser, UnauthorizedError } from "../_shared/tradovate/auth.ts";
import { toProfileRow, validateProfile } from "../_shared/profile/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let ctx;
  try {
    ctx = await requireUser(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    body = typeof parsed === "object" && parsed !== null
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const result = validateProfile(body);
  if (!result.ok) {
    // Return the per-field error codes so the form can highlight each field.
    return json({ error: "invalid_profile", fields: result.errors }, 400);
  }

  // Terms / privacy acceptance was captured by the step-1 checkbox. The
  // timestamp is recorded with the server clock (never the client's) and only
  // the first acceptance is kept, so a later profile edit cannot move it.
  const acceptedTerms = body.acceptedTerms === true;
  const acceptedPrivacy = body.acceptedPrivacy === true;

  const { data: existing } = await ctx.admin
    .from("profiles")
    .select("terms_accepted_at, privacy_accepted_at")
    .eq("id", ctx.user.id)
    .maybeSingle();

  const now = new Date().toISOString();
  const row: Record<string, unknown> = toProfileRow(result.value, ctx.user.id);
  if (acceptedTerms && !existing?.terms_accepted_at) row.terms_accepted_at = now;
  if (acceptedPrivacy && !existing?.privacy_accepted_at) row.privacy_accepted_at = now;

  const { error: writeError } = await ctx.admin
    .from("profiles")
    .upsert(row, { onConflict: "id" });

  if (writeError) {
    console.error("[profile-submit] write failed:", writeError.message);
    return json({ error: "write_failed" }, 500);
  }

  return json({ ok: true, profile_completed: true });
});
