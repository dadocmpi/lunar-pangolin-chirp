// ============================================================================
// tradovate-status — connection state for the authenticated user.
//
// GET  -> { enabled, connected, integrations: [...], welcome: { show, skipped } }
// POST -> { action: "skip" } records the first-run "Skip for now" choice.
//
// The user id comes from the verified JWT; the client cannot ask about another
// user. `welcome.show` drives the SOFT first-run screen: it is true only when
// the feature is on, there is no connection, and the user has not skipped. It
// never blocks a route — the dashboard always renders.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  corsHeaders,
  json,
  requireUser,
  UnauthorizedError,
} from "../_shared/tradovate/auth.ts";
import {
  hasAnyIntegration,
  hasSkippedWelcome,
  listIntegrations,
  markWelcomeSkipped,
} from "../_shared/tradovate/credentialStore.ts";
import { isTradovateEnabled } from "../_shared/features.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  // When the runtime switch is off, report it so the client hides the welcome
  // screen and the card. 200 (not 503) so the dashboard keeps working.
  if (!isTradovateEnabled()) {
    return json({
      enabled: false,
      connected: false,
      integrations: [],
      welcome: { show: false, skipped: false },
    });
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
    const connected = integrations.length > 0;
    // A revoked row means the user was already welcomed (and has since
    // disconnected): never re-show the first-run screen for them.
    const everConnected = await hasAnyIntegration(ctx.admin, ctx.user.id);

    // FAIL-OPEN: read the skip state in isolation. A missing welcome-state
    // table (migration not applied) and any transient read error both throw
    // here. In either case the welcome state cannot be confirmed, so the
    // first-run screen is suppressed and the client gets the NORMAL dashboard.
    // We still return 200 with the real connection state so trades keep working.
    let skipped = false;
    let welcomeReadable = true;
    try {
      skipped = await hasSkippedWelcome(ctx.admin, ctx.user.id);
    } catch {
      welcomeReadable = false;
      skipped = true;
    }
    const showWelcome = welcomeReadable && !connected && !everConnected && !skipped;

    if (req.method === "POST") {
      let body: Record<string, unknown> = {};
      try {
        body = await req.json();
      } catch {
        // An empty body is treated as a plain status read below.
      }
      if (body.action === "skip") {
        await markWelcomeSkipped(ctx.admin, ctx.user.id);
        return json({
          ok: true,
          enabled: true,
          connected,
          integrations: serialize(integrations),
          welcome: { show: false, skipped: true },
        });
      }
    }

    return json({
      enabled: true,
      connected,
      integrations: serialize(integrations),
      welcome: { show: showWelcome, skipped },
    });
  } catch {
    return json({ error: "status_failed" }, 500);
  }
});

function serialize(integrations: Awaited<ReturnType<typeof listIntegrations>>) {
  return integrations.map((i) => ({
    id: i.id,
    environment: i.environment,
    accountId: i.tradovate_account_id,
    accountSpec: i.account_spec,
    label: i.label,
    status: i.status,
    lastFillId: i.last_fill_id,
    tokenExpiresAt: i.token_expires_at,
  }));
}
