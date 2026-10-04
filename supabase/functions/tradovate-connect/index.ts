// ============================================================================
// tradovate-connect — bind a Tradovate account to the authenticated user.
//
// POST { environment, name, password, cid, sec, accountId?, label? }
//
// The user is taken from the verified JWT, never from the body. Credentials
// are encrypted (AES-256-GCM) and stored server-side; the response never
// echoes the password or the access token.
//
// Environment policy is enforced on the SERVER (see _shared/tradovate/
// environment.ts): only the environments in TRADOVATE_ALLOWED_ENVIRONMENTS are
// accepted, defaulting to demo-only. A crafted request for "live" is rejected
// even when the UI never offers it.
//
// Account selection: after a successful login the accounts that belong to the
// Tradovate user are listed. With exactly one account the connection completes
// with no extra click; with several the client is asked to choose (the first
// ACTIVE account is the preselect the UI shows). The client never types an id.
//
// Responses map to the connect-panel UI states:
//   200 { ok: true,  status: "connected", accounts: [...], accountId }
//   200 { ok: false, code: "account_selection_required", accounts: [...] }
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
import type { TradovateAccount } from "../_shared/tradovate/types.ts";
import { resolveRequestedEnvironment } from "../_shared/tradovate/environment.ts";
import { selectAccount } from "../_shared/tradovate/accountSelection.ts";
import { featureDisabledBody, isTradovateEnabled } from "../_shared/features.ts";

/** Serialize an account for the client (no secrets, no raw payload). */
function accountPayload(a: TradovateAccount) {
  return { id: a.id, name: a.name, simulation: a.simulation, active: a.active };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // Runtime kill switch: TRADOVATE_ENABLED="false" disables the feature with
  // no redeploy. Fails closed before any credential is touched.
  if (!isTradovateEnabled()) {
    return json(featureDisabledBody("tradovate"), 503);
  }

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

  const requestedEnvironment = body.environment;
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

  // Server-side environment policy: demo-only by default. A crafted "live"
  // request is rejected here even though the UI no longer offers it.
  const envDecision = resolveRequestedEnvironment(requestedEnvironment);
  if (!envDecision.ok) {
    return json({
      ok: false,
      code: envDecision.code,
      message: envDecision.message,
      allowedEnvironments: envDecision.allowed,
    }, 422);
  }
  const environment = envDecision.environment;
  if (!name || !password) {
    return json({ ok: false, code: "missing_credentials" }, 422);
  }

  const limiter = createDefaultLimiter();

  // 1. Authenticate against the allowed environment with the Tradovate login.
  const auth = await authenticate({
    credentials: { name, password, cid, sec },
    environment,
    limiter,
  });
  if (!auth.ok) {
    // Never persist rejected credentials.
    return json({ ok: false, code: auth.code, message: auth.message }, 422);
  }

  // 2. Discover the accounts that belong to this Tradovate user. The user is
  //    never asked to type an account id.
  let accounts: TradovateAccount[] = [];
  try {
    accounts = await accountList({
      environment,
      accessToken: auth.accessToken,
      limiter,
    });
  } catch {
    // Our call to Tradovate failed — not the user's fault and not a bad login.
    return json({
      ok: false,
      code: "accounts_unavailable",
      message: "Could not read your Tradovate accounts right now. Try again shortly.",
    }, 502);
  }

  if (accounts.length === 0) {
    return json({
      ok: false,
      code: "no_accounts",
      message: "This Tradovate login has no accounts. Contact Tradovate support.",
    }, 422);
  }

  // 3. Select the account. Explicit request wins (validated); otherwise the
  //    single account auto-completes, and multiple accounts require a choice.
  const selection = selectAccount(accounts, requestedAccountId);
  switch (selection.kind) {
    case "no_accounts":
      return json({ ok: false, code: "no_accounts" }, 422);
    case "invalid_account":
      return json({ ok: false, code: "invalid_account" }, 422);
    case "not_available":
      return json({
        ok: false,
        code: "account_not_available",
        message: "That account is not available for this login.",
        accounts: accounts.map(accountPayload),
      }, 422);
    case "no_active":
      return json({
        ok: false,
        code: "no_active_account",
        message: "None of your Tradovate accounts are active. Contact Tradovate support.",
      }, 422);
    case "required":
      return json({
        ok: false,
        code: "account_selection_required",
        accounts: accounts.map(accountPayload),
        preselectAccountId: selection.preselectAccountId,
      }, 200);
    case "chosen":
      break;
  }
  const chosen = selection.account;

  // 4. Persist encrypted credentials, bound to the verified user and to the
  //    selected account (fills/PnL/commission stay scoped to it).
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
      accounts: accounts.map(accountPayload),
      accountId: chosen.id,
    });
  } catch (e) {
    if (e instanceof CredentialStoreError) {
      return json({ ok: false, code: e.code, message: e.message }, 500);
    }
    return json({ ok: false, code: "unexpected" }, 500);
  }
});
