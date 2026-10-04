// ============================================================================
// tradovate-connect — bind a Tradovate account to the authenticated user.
//
// POST { environment, name, password, cid, sec, accountId?, label? }
//
// The user is taken from the verified JWT, never from the body. Credentials
// are encrypted (AES-256-GCM) and stored server-side; the response never
// echoes the password or the access token.
//
// Responses map to the connect-gate UI states:
//   200 { ok: true,  status: "connected", accounts: [...] }
//   401 unauthorized
//   422 { ok: false, code: "invalid_credentials" | "api_disabled" | ... }
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  corsHeaders,
  json,
  requireUser,
  UnauthorizedError,
} from "../_shared/tradovate/auth.ts";
import { authenticate } from "../_shared/tradovate/authService.ts";
import { accountList } from "../_shared/tradovate/restService.ts";
import { createDefaultLimiter } from "../_shared/tradovate/rateLimiter.ts";
import {
  CredentialStoreError,
  upsertIntegrationWithCredentials,
} from "../_shared/tradovate/credentialStore.ts";
import type { TradovateEnvironment } from "../_shared/tradovate/types.ts";

function isEnvironment(v: unknown): v is TradovateEnvironment {
  return v === "demo" || v === "live";
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
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const environment = body.environment;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  // Advanced override only. Normally absent: the app's own cid/sec come from
  // server secrets (TRADOVATE_APP_CID / TRADOVATE_APP_SECRET).
  const cid = typeof body.cid === "string" && body.cid.trim() ? body.cid.trim() : undefined;
  const sec = typeof body.sec === "string" && body.sec.trim() ? body.sec.trim() : undefined;
  const label = typeof body.label === "string" ? body.label.slice(0, 80) : undefined;
  const requestedAccountId = body.accountId === undefined || body.accountId === null
    ? null
    : Number(body.accountId);

  if (!isEnvironment(environment)) {
    return json({ ok: false, code: "invalid_environment" }, 422);
  }
  if (!name || !password) {
    return json({ ok: false, code: "missing_credentials" }, 422);
  }

  const limiter = createDefaultLimiter();

  // 1. Authenticate against the chosen environment.
  const auth = await authenticate({
    credentials: { name, password, cid, sec },
    environment,
    limiter,
  });
  if (!auth.ok) {
    // Never persist rejected credentials.
    return json({ ok: false, code: auth.code, message: auth.message }, 422);
  }

  // 2. Discover accounts so the user can pick when they have several.
  let accounts: Array<{ id: number; name: string; simulation?: boolean }> = [];
  try {
    const list = await accountList({
      environment,
      accessToken: auth.accessToken,
      limiter,
    });
    accounts = list.map((a) => ({
      id: a.id,
      name: a.name,
      simulation: a.simulation,
    }));
  } catch {
    return json({
      ok: false,
      code: "api_disabled",
      message: "Could not list accounts; API access may not be enabled",
    }, 422);
  }

  if (accounts.length === 0) {
    return json({
      ok: false,
      code: "api_disabled",
      message: "No Tradovate accounts are visible to this login",
    }, 422);
  }

  // 3. Pick the requested account, or require a choice when ambiguous.
  const chosen = requestedAccountId !== null
    ? accounts.find((a) => a.id === requestedAccountId)
    : accounts.length === 1
    ? accounts[0]
    : null;

  if (!chosen) {
    return json({
      ok: false,
      code: "account_selection_required",
      accounts,
    }, 200);
  }

  // 4. Persist encrypted credentials, bound to the verified user.
  try {
    const integrationId = await upsertIntegrationWithCredentials(ctx.admin, {
      userId: ctx.user.id,
      environment,
      tradovateAccountId: chosen.id,
      tradovateUserId: auth.userId,
      accountSpec: chosen.name,
      label: label ?? chosen.name,
      credentials: { name, password, cid, sec },
      status: "connected",
    });
    return json({
      ok: true,
      status: "connected",
      integrationId,
      accounts,
      accountId: chosen.id,
    });
  } catch (e) {
    if (e instanceof CredentialStoreError) {
      return json({ ok: false, code: e.code, message: e.message }, 500);
    }
    return json({ ok: false, code: "unexpected" }, 500);
  }
});
