// ============================================================================
// tradovate-sync — scheduled incremental poller.
//
// Invoked two ways:
//   1. by pg_cron / an external scheduler with a service-role bearer token,
//      to sync every due integration (no user JWT),
//   2. by the authenticated user to force-refresh their own integration.
//
// The long-lived WebSocket path is intentionally absent: Edge Functions have a
// hard wall-clock limit, so we poll incrementally and let Supabase Realtime
// push trade/fill changes to the browser instead.
//
// NOT YET VERIFIED against the live Tradovate service.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, json, requireUser, UnauthorizedError } from "../_shared/tradovate/auth.ts";
import { syncIntegration } from "../_shared/tradovate/sync.ts";

const MAX_INTEGRATIONS_PER_RUN = 25;

/** True when the caller presented the service-role key. */
function isServiceRole(req: Request): boolean {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return Boolean(serviceKey) && token === serviceKey;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // ----- Path 1: scheduled fan-out over all due integrations --------------
  if (isServiceRole(req)) {
    const { data, error } = await admin
      .from("integrations")
      .select("id, user_id, last_synced_at")
      .neq("status", "revoked")
      .order("last_synced_at", { ascending: true, nullsFirst: true })
      .limit(MAX_INTEGRATIONS_PER_RUN);
    if (error) return json({ error: "list_failed" }, 500);

    const results = [];
    for (const row of data ?? []) {
      results.push(
        await syncIntegration({
          admin,
          userId: row.user_id as string,
          integrationId: row.id as string,
        }),
      );
    }
    return json({ ok: true, mode: "scheduled", count: results.length, results });
  }

  // ----- Path 2: authenticated user force-refresh -------------------------
  let ctx;
  try {
    ctx = await requireUser(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }
  const requested = typeof body.integrationId === "string" ? body.integrationId : null;

  const { data: owned } = await admin
    .from("integrations")
    .select("id")
    .eq("user_id", ctx.user.id)
    .neq("status", "revoked");
  const ids = (owned ?? []).map((r) => r.id as string);
  const targets = requested ? ids.filter((id) => id === requested) : ids;
  if (targets.length === 0) return json({ error: "integration_not_found" }, 404);

  const results = [];
  for (const id of targets) {
    results.push(
      await syncIntegration({
        admin,
        userId: ctx.user.id,
        integrationId: id,
      }),
    );
  }
  return json({ ok: true, mode: "user", count: results.length, results });
});
