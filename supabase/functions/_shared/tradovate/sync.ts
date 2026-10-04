// ============================================================================
// Idempotent incremental sync.
//
// Edge Functions cannot hold a long-lived WebSocket (hard wall-clock limit),
// so the live data path is scheduled incremental polling:
//
//   1. ensure a valid token (renewed ahead of expiry),
//   2. /fill/list since the persisted last_fill_id cursor,
//   3. upsert fills with ON CONFLICT (integration_id, tradovate_fill_id)
//      DO NOTHING — replays and overlaps are harmless,
//   4. advance the cursor to the highest id seen,
//   5. rebuild trades for the integration from its fills (the PnL engine is
//      pure, so a rebuild is deterministic and idempotent).
//
// The whole run is safe to execute twice: fills are idempotent and trades are
// upserted on a deterministic dedupe_key. A soft lock column
// (integrations.sync_locked_at) keeps two cron invocations from racing.
//
// Live UI updates are delivered by Supabase Realtime on trades/tradovate_fills,
// not by a server-push socket.
//
// NOT YET VERIFIED against the live Tradovate service.
// ============================================================================

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { authenticate, ensureToken } from "./authService.ts";
import { loadCredentials, type IntegrationRow } from "./credentialStore.ts";
import { createDefaultLimiter, TradovateRateLimiter } from "./rateLimiter.ts";
import { contractItem, fillList } from "./restService.ts";
import {
  type ContractInfo,
  type PnlFill,
  reconstructTrades,
  rootFromSymbol,
} from "./pnl.ts";
import type { TradovateCredentials, TradovateEnvironment } from "./types.ts";

export interface SyncResult {
  integrationId: string;
  status: string;
  newFills: number;
  totalFills: number;
  trades: number;
  nextSinceId: number;
  truncated: boolean;
  pages: number;
  errorCode?: string;
}

export interface SyncOptions {
  admin: SupabaseClient;
  userId: string;
  integrationId: string;
  limiter?: TradovateRateLimiter;
  fetchImpl?: typeof fetch;
  now?: () => number;
  /** Skip the soft lock (used by tests / manual runs). */
  skipLock?: boolean;
}

const LOCK_TTL_MS = 5 * 60 * 1000;

/**
 * Run one incremental sync for a single integration owned by `userId`.
 * Returns a structured result; never throws for provider failures.
 */
export async function syncIntegration(opts: SyncOptions): Promise<SyncResult> {
  const { admin, userId, integrationId } = opts;
  const limiter = opts.limiter ?? createDefaultLimiter();
  const now = opts.now ?? (() => Date.now());
  const base: SyncResult = {
    integrationId,
    status: "error",
    newFills: 0,
    totalFills: 0,
    trades: 0,
    nextSinceId: 0,
    truncated: false,
    pages: 0,
  };

  // Acquire the soft lock.
  if (!opts.skipLock) {
    const { data: cur } = await admin
      .from("integrations")
      .select("sync_locked_at")
      .eq("id", integrationId)
      .eq("user_id", userId)
      .maybeSingle();
    const lockedAt = cur?.sync_locked_at ? Date.parse(cur.sync_locked_at) : 0;
    if (lockedAt && now() - lockedAt < LOCK_TTL_MS) {
      return { ...base, status: "locked" };
    }
    await admin
      .from("integrations")
      .update({ sync_locked_at: new Date(now()).toISOString() })
      .eq("id", integrationId)
      .eq("user_id", userId);
  }

  try {
    let integration: IntegrationRow;
    let credentials: TradovateCredentials;
    try {
      ({ integration, credentials } = await loadCredentials(
        admin,
        userId,
        integrationId,
      ));
    } catch (e) {
      return {
        ...base,
        status: "error",
        errorCode: e instanceof Error ? e.name : "credential_error",
      };
    }

    const env = integration.environment as TradovateEnvironment;

    // 1. Token — renew if needed. token_expires_at is advisory; we always ask
    //    the auth service which applies the renewal margin.
    const auth = await ensureToken({
      credentials,
      environment: env,
      limiter,
      fetchImpl: opts.fetchImpl,
      now,
    });
    if (!auth.ok) {
      await markStatus(admin, integrationId, statusForAuthError(auth.code), auth.code, auth.message);
      return { ...base, status: statusForAuthError(auth.code), errorCode: auth.code };
    }
    const accessToken = auth.accessToken;

    // 2. Incremental fills.
    const sinceId = integration.last_fill_id ?? 0;
    const list = await fillList({
      environment: env,
      accessToken,
      limiter,
      fetchImpl: opts.fetchImpl,
      sinceId,
    });

    // 3. Idempotent persistence.
    let newFills = 0;
    if (list.fills.length > 0) {
      const rows = list.fills.map((f) => ({
        integration_id: integrationId,
        tradovate_fill_id: f.tradovateFillId,
        order_id: f.orderId,
        contract_id: f.contractId,
        account_id: f.accountId,
        fill_timestamp: f.timestamp,
        trade_date: f.tradeDate,
        action: f.action,
        quantity: f.quantity,
        price: f.price,
        active: f.active,
        commission: f.commission,
        raw: f.raw,
      }));
      const { data: inserted, error } = await admin
        .from("tradovate_fills")
        .upsert(rows, {
          onConflict: "integration_id,tradovate_fill_id",
          ignoreDuplicates: true,
        })
        .select("id");
      if (error) {
        await markStatus(admin, integrationId, "error", "fill_upsert_failed", error.message);
        return { ...base, status: "error", errorCode: "fill_upsert_failed" };
      }
      newFills = (inserted ?? []).length;
    }

    // 4. Advance the cursor.
    if (list.nextSinceId > sinceId) {
      await admin
        .from("integrations")
        .update({ last_fill_id: list.nextSinceId, last_synced_at: new Date(now()).toISOString() })
        .eq("id", integrationId)
        .eq("user_id", userId);
    }

    // 5. Rebuild trades from the full fill set (deterministic, idempotent).
    //    Contracts are resolved up front because the PnL resolver is sync.
    const allFills = await readAllFills(admin, integrationId);
    const resolver = makeContractResolver(env, accessToken, limiter, opts.fetchImpl);
    const contractIds = [
      ...new Set(
        allFills
          .map((f) => f.contractId)
          .filter((id): id is number => id !== null),
      ),
    ];
    await resolver.ensure(contractIds);
    const trades = reconstructTrades(allFills, {
      resolveContract: resolver.resolve,
      commissionPerContract: 0,
    });
    await replaceTrades(admin, integrationId, trades);

    await markStatus(admin, integrationId, "connected", null, null);
    return {
      ...base,
      status: "connected",
      newFills,
      totalFills: allFills.length,
      trades: trades.length,
      nextSinceId: list.nextSinceId,
      truncated: list.truncated,
      pages: list.pages,
    };
  } finally {
    if (!opts.skipLock) {
      await admin
        .from("integrations")
        .update({ sync_locked_at: null })
        .eq("id", integrationId)
        .eq("user_id", userId);
    }
  }
}

function statusForAuthError(code: string): string {
  switch (code) {
    case "invalid_credentials":
      return "invalid_credentials";
    case "api_disabled":
      return "api_disabled";
    case "rate_limited":
    case "circuit_open":
    case "transport":
    case "unexpected":
    default:
      return "error";
  }
}

async function markStatus(
  admin: SupabaseClient,
  integrationId: string,
  status: string,
  errorCode: string | null,
  errorMessage: string | null,
): Promise<void> {
  await admin
    .from("integrations")
    .update({
      status,
      last_error_code: errorCode,
      // Message is already redacted by the services; cap length defensively.
      last_error_message: errorMessage ? errorMessage.slice(0, 300) : null,
      last_verified_at: new Date().toISOString(),
    })
    .eq("id", integrationId);
}

async function readAllFills(
  admin: SupabaseClient,
  integrationId: string,
): Promise<PnlFill[]> {
  const { data, error } = await admin
    .from("tradovate_fills")
    .select(
      "tradovate_fill_id, contract_id, account_id, fill_timestamp, action, quantity, price, commission, active",
    )
    .eq("integration_id", integrationId)
    .order("tradovate_fill_id", { ascending: true });
  if (error || !data) return [];
  return data.map((r) => ({
    id: Number(r.tradovate_fill_id),
    contractId: r.contract_id === null ? null : Number(r.contract_id),
    accountId: r.account_id === null ? null : Number(r.account_id),
    timestamp: String(r.fill_timestamp),
    action: r.action === "Buy" || r.action === "Sell" ? r.action : null,
    quantity: Number(r.quantity),
    price: Number(r.price),
    commission: Number(r.commission ?? 0),
    active: r.active !== false,
  }));
}

async function replaceTrades(
  admin: SupabaseClient,
  integrationId: string,
  trades: ReturnType<typeof reconstructTrades>,
): Promise<void> {
  // Trades are fully derivable from fills, so replacing the set is safe and
  // idempotent. Realtime emits the diff to the owning client.
  await admin.from("trades").delete().eq("integration_id", integrationId);
  if (trades.length === 0) return;
  const rows = trades.map((t) => ({
    integration_id: integrationId,
    account_id: t.accountId,
    root_symbol: t.root,
    symbol: t.symbol ?? null,
    side: t.side,
    quantity: t.quantity,
    entry_price: t.entryPrice,
    exit_price: t.exitPrice,
    opened_at: t.openedAt,
    closed_at: t.closedAt,
    realized_pnl: t.realizedPnl,
    commission: t.commission,
    net_pnl: t.netPnl,
    status: t.status,
    method: "fifo",
    fill_ids: t.fillIds,
    dedupe_key: t.dedupeKey,
  }));
  await admin
    .from("trades")
    .upsert(rows, { onConflict: "integration_id,dedupe_key" });
}

/** Lazily resolve contract ids to roots/symbols, cached per sync run. */
function makeContractResolver(
  env: TradovateEnvironment,
  accessToken: string,
  limiter: TradovateRateLimiter,
  fetchImpl?: typeof fetch,
) {
  const cache = new Map<number, ContractInfo>();
  return {
    async prime(): Promise<void> {
      // no-op; resolution is lazy
    },
    resolve(contractId: number | null): ContractInfo | null {
      if (contractId === null) return null;
      return cache.get(contractId) ?? null;
    },
    async ensure(contractIds: number[]): Promise<void> {
      for (const id of contractIds) {
        if (cache.has(id)) continue;
        try {
          const item = await contractItem({
            environment: env,
            accessToken,
            limiter,
            fetchImpl,
            contractId: id,
          });
          if (item) {
            const root = rootFromSymbol(item.name || item.symbol || "");
            cache.set(id, { root, symbol: item.symbol ?? item.name });
          }
        } catch {
          // Leave unresolved; the engine falls back to "UNKNOWN"/default pv.
        }
      }
    },
  };
}

/** Test seam: pure merge used to prove fill idempotency without a DB. */
export function mergeFills(existing: PnlFill[], incoming: PnlFill[]): PnlFill[] {
  const byId = new Map<number, PnlFill>();
  for (const f of existing) byId.set(f.id, f);
  for (const f of incoming) byId.set(f.id, f); // incoming wins on conflict
  return [...byId.values()].sort((a, b) => a.id - b.id);
}
