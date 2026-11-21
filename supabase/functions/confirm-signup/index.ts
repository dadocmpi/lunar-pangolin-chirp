// ============================================================================
// confirm-signup — RETIRED (HTTP 410).
//
// Supabase Auth already sends the signup confirmation email when signUp() is
// called with `emailRedirectTo`; this endpoint duplicated it. It was also
// unsafe by construction:
//   * It accepted `email`, `userId` and `confirmationUrl` from the request
//     body, so any caller that could reach it could use our verified sending
//     domain to email an arbitrary address a link to an arbitrary URL
//     (phishing / open relay).
//   * It authenticated nothing: the browser called it right after signUp(),
//     before a session exists, so the JWT gate rejected the call and the
//     email was never sent anyway.
//
// Retired the same way as card-checkout / paypal-checkout: the route stays
// deployed but refuses every request. Do not re-enable without deriving the
// recipient from a verified identity and routing through _shared/userEmail.ts.
// ============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({
      error: "endpoint_retired",
      message:
        "Signup confirmation email is sent by Supabase Auth. This endpoint is retired.",
    }),
    {
      status: 410,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
