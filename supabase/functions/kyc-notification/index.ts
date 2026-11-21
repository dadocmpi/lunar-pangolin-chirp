// ============================================================================
import { corsHeadersFor } from "../_shared/cors.ts";
// kyc-notification — RETIRED (HTTP 410).
//
// This was an UNAUTHENTICATED email relay: any caller that could reach it
// could make our verified sending domain email the owner arbitrary content,
// including an arbitrary `documentUrl` link (phishing / social engineering).
// It also built approve/deny tokens as
// `btoa("<userId>:<action>:<secret>")`, which is reversible — anyone who saw
// the link could decode KYC_ACTION_SECRET and forge a decision for any user.
//
// The KYC submission flow now notifies the owner directly from `kyc-submit`
// through `_shared/email.ts`. Owner decisions use the signed, expiring tokens
// in `_shared/kyc/actionToken.ts` (verified by `kyc-action`).
//
// Do not re-enable without a verified caller identity and signed tokens.
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
        "KYC submission notifications are sent by kyc-submit. This endpoint is retired.",
    }),
    {
      status: 410,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
