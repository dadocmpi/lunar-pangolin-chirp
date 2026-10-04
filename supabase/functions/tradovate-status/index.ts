// ============================================================================
// tradovate-status — connection state for the authenticated user.
//
// GET  -> { required, connected, integrations: [...] }
//
// Used by the connect gate to decide whether to auto-skip. The user id comes
// from the verified JWT; the client cannot ask about another user.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  corsHeaders,
  json,
  requireUser,
  UnauthorizedError,
} from "../_shared/tradovate/auth.ts";
import { listIntegrations } from "../_shared/tradovate/credentialStore.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  let ctx;
  try {
    ctx = await requireUser(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }

  try {
    const integrations = await listIntegrations(ctx.admin, ctx.user.id);
    return json({
      connected: integrations.length > 0,
      integrations: integrations.map((i) => ({
        id: i.id,
        environment: i.environment,
        accountId: i.tradovate_account_id,
        accountSpec: i.account_spec,
        label: i.label,
        status: i.status,
        lastFillId: i.last_fill_id,
        tokenExpiresAt: i.token_expires_at,
      })),
    });
  } catch {
    return json({ error: "status_failed" }, 500);
  }
});
