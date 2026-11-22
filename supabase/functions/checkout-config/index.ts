// ============================================================================
// checkout-config — what the configured payment providers can accept right now.
//
// Returns only availability data: which methods are usable, the supported
// currency set and the crypto networks that have a configured destination.
// No secret value, no wallet address, no bank detail and no user data is ever
// returned — the browser learns the destination only from the checkout call
// that actually creates the payment instruction.
//
// JWT required: only a signed-in customer opens the checkout.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireUser, UnauthorizedError } from "../_shared/tradovate/auth.ts";
import { checkoutConfigFromEnv, denoEnvReader } from "../_shared/checkout/config.ts";
import { isPaymentsEnabled, isTestPaymentMode } from "../_shared/payments-flag.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  const json = (body: Record<string, unknown>, status = 200): Response =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  if (limiter.hit(`ip:${clientIp(req)}`)) return json({ error: "rate_limited" }, 429);

  try {
    const ctx = await requireUser(req);
    if (limiter.hit(`user:${ctx.user.id}`)) return json({ error: "rate_limited" }, 429);
  } catch (err) {
    if (err instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }

  // When payments are off the checkout renders the fail-closed notice before
  // it ever asks for this config; report the canonical off state anyway.
  if (!isPaymentsEnabled()) {
    return json({ ok: true, enabled: false, config: null });
  }

  const config = checkoutConfigFromEnv(denoEnvReader, isTestPaymentMode());
  return json({ ok: true, enabled: true, config });
});
