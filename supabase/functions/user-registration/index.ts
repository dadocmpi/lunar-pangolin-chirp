// ============================================================================
import { corsHeadersFor } from "../_shared/cors.ts";
// user-registration — RETIRED (HTTP 410).
//
// This was an unauthenticated endpoint that emailed the owner a "new customer"
// notification with caller-supplied name, email, phone and country. Anyone
// could use it to spam the owner's inbox or to plant false customer records.
// Nothing calls it: the SPA sends `novo_cliente` through `notify-owner`, which
// validates and rate-limits the payload.
//
// Do not re-enable without deriving the payload from a verified identity.
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
        "New-customer notifications go through notify-owner. This endpoint is retired.",
    }),
    {
      status: 410,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
