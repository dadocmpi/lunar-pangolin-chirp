// ============================================================================
// tradovate-dashboard — LIVE account state for the terminal.
//
// GET  -> { ok, connected, accounts: [...], account: {...}, snapshot: {...},
//           lastSyncedAt, cached, warnings, integrations: [...] }
//
// This is the endpoint the dashboard calls on load. It returns:
//   * the accounts the user has linked (for the account selector),
//   * a LIVE balance / positions / working-orders snapshot for the selected
//     account, read from Tradovate and cached for a short TTL,
//   * `lastSyncedAt` so the UI can show a "last synced" indicator.
//
// Caching: Tradovate explicitly warns against calling
// /cashBalance/getCashBalanceSnapshot repeatedly. The snapshot is cached in
// tradovate_account_snapshots for TRADOVATE_SNAPSHOT_TTL_SECONDS (default 20);
// ?fresh=1 forces a live read (the manual refresh button).
//
// Failure policy: a provider failure returns 200 with `snapshot: null` and a
// `warnings` list — the reconstructed trades from tradovate-data still render,
// and the live panel shows an explicit "not available" state. Nothing here
// invents a value.
//
// The user id comes from the verified JWT; a body/query user id is ignored.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  corsHeaders,
  json,
  requireUser,
  UnauthorizedError,
} from "../_shared/tradovate/auth.ts";
import {
  listIntegrations,
  readSnapshot,
  writeSnapshot,
} from "../_shared/tradovate/credentialStore.ts";
import { fetchAccountSnapshot, loadSnapshotInputs } from "../_shared/tradovate/snapshot.ts";
import { createDefaultLimiter } from "../_shared/tradovate/rateLimiter.ts";
import { featureDisabledBody, isTradovateEnabled } from "../_shared/features.ts";

const DEFAULT_TTL_SECONDS = 20;

function ttlMs(): number {
  const raw = Number(Deno.env.get("TRADOVATE_SNAPSHOT_TTL_SECONDS") ?? DEFAULT_TTL_SECONDS);
  const seconds = Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_TTL_SECONDS;
  return seconds * 1000;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

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

  const integrations = await listIntegrations(ctx.admin, ctx.user.id);
  if (integrations.length === 0) {
    return json({
      ok: true,
      connected: false,
      accounts: [],
      account: null,
      snapshot: null,
      cached: false,
      warnings: [],
      lastSyncedAt: null,
      integrations: [],
    });
  }

  const url = new URL(req.url);
  const requestedIntegration = url.searchParams.get("integrationId");
  const fresh = url.searchParams.get("fresh") === "1";

  const selected = requestedIntegration
    ? integrations.find((i) => i.id === requestedIntegration) ?? null
    : integrations[0];
  if (!selected) return json({ error: "integration_not_found" }, 404);

  const accounts = integrations.map((i) => ({
    integrationId: i.id,
    accountId: i.tradovate_account_id,
    accountSpec: i.account_spec,
    label: i.label,
    environment: i.environment,
    status: i.status,
  }));

  const base = {
    ok: true,
    connected: true,
    accounts,
    account: accounts.find((a) => a.integrationId === selected.id) ?? accounts[0],
    lastSyncedAt: null as string | null,
    integrations: accounts,
  };

  // Serve a fresh-enough cached snapshot without touching Tradovate.
  try {
    const cached = await readSnapshot(ctx.admin, selected.id);
    if (cached && !fresh) {
      const age = Date.now() - Date.parse(cached.fetched_at);
      if (Number.isFinite(age) && age >= 0 && age < ttlMs()) {
        return json({
          ...base,
          snapshot: cached.payload,
          cached: true,
          warnings: cached.warnings,
          lastSyncedAt: cached.fetched_at,
        });
      }
    }
  } catch {
    // Table missing or read error: fall through and fetch live.
  }

  // Live read. A provider failure must not 500 the dashboard.
  try {
    const { integration, credentials } = await loadSnapshotInputs(
      ctx.admin,
      ctx.user.id,
      selected.id,
    );
    const snapshot = await fetchAccountSnapshot({
      admin: ctx.admin,
      userId: ctx.user.id,
      integrationId: selected.id,
      integration,
      credentials,
      limiter: createDefaultLimiter(),
    });
    try {
      await writeSnapshot(ctx.admin, selected.id, snapshot, snapshot.warnings);
    } catch {
      // A cache write failure is non-fatal; the live data is still returned.
    }
    return json({
      ...base,
      snapshot,
      cached: false,
      warnings: snapshot.warnings,
      lastSyncedAt: snapshot.fetchedAt,
    });
  } catch {
    // Could not even load credentials / reach the provider.
    return json({
      ...base,
      snapshot: null,
      cached: false,
      warnings: ["unavailable"],
    });
  }
});
