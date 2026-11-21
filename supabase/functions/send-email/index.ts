// ============================================================================
import { corsHeadersFor } from "../_shared/cors.ts";
// send-email — RETIRED (HTTP 410).
//
// This was an unauthenticated, generic owner-email relay: any caller could
// send an arbitrary subject/body to the owner's inbox from our verified
// sending domain. Nothing in the SPA or in another Edge Function calls it —
// the contact form uses `support-message`, and every other notification goes
// through `_shared/email.ts` / `_shared/userEmail.ts`.
//
// Retired the same way as confirm-signup. Do not re-enable without a verified
// caller identity, a fixed template and server-side validation.
// ============================================================================

Deno.serve((req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({
      error: "endpoint_retired",
      message:
        "Use support-message for the contact form or notify-owner for owner notifications. This endpoint is retired.",
    }),
    {
      status: 410,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
