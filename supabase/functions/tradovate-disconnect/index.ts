// ============================================================================
// tradovate-disconnect — permanently delete stored credentials.
//
// POST { integrationId }
//
// Deletes the encrypted credential row and marks the integration revoked, so
// the connect gate re-triggers on the next login. Scoped to the verified user.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  corsHeaders,
  json,
  requireUser,
  UnauthorizedError,
} from "../_shared/tradovate/auth.ts";
import {
  CredentialStoreError,
  disconnectIntegration,
} from "../_shared/tradovate/credentialStore.ts";

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
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const integrationId = typeof body.integrationId === "string" ? body.integrationId : "";
  if (!integrationId) return json({ error: "integration_id_required" }, 400);

  try {
    await disconnectIntegration(ctx.admin, ctx.user.id, integrationId);
    return json({ ok: true, status: "revoked" });
  } catch (e) {
    if (e instanceof CredentialStoreError && e.code === "integration_not_found") {
      return json({ error: "integration_not_found" }, 404);
    }
    return json({ error: "disconnect_failed" }, 500);
  }
});
