// ============================================================================
// Live account snapshot (balance / positions / working orders).
//
// The reconstructed `trades` table answers "what happened". This module answers
// "what is true right now": the provider's own cash-balance snapshot, open
// positions and current-session orders. Both are needed for a real terminal.
//
// Provider notes that shape the code:
//   * /order/list returns identity + lifecycle status only. Quantity and price
//     live on /orderVersion/list, keyed by orderId; the two are joined here.
//   * /position/list returns signed `netPos` (long/short) and `netPrice`.
//   * /cashBalance/getCashBalanceSnapshot is expensive; the caller caches the
//     result (tradovate_account_snapshots) and only calls it when stale.
//
// Failure policy: a sub-read failure (e.g. orders unavailable) does NOT fail
// the whole snapshot. It is recorded in `warnings`, the field is omitted, and
// the UI shows an explicit "not available" state — never a fake value.
//
// NOT YET VERIFIED against the live Tradovate service.
// ============================================================================

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { ensureToken } from "./authService.ts";
import {
  loadCredentials,
  storeSessionToken,
  type IntegrationRow,
} from "./credentialStore.ts";
import {
  cashBalanceSnapshot,
  makeCachedContractResolver,
  orderList,
  orderVersionList,
  positionList,
} from "./restService.ts";
import { createDefaultLimiter, TradovateRateLimiter } from "./rateLimiter.ts";
import type {
  TradovateCredentials,
  TradovateEnvironment,
} from "./types.ts";

export interface SnapshotBalance {
  totalCashValue: number | null;
  totalPnL: number | null;
  netLiq: number | null;
  openPnL: number | null;
  realizedPnL: number | null;
  weekRealizedPnL: number | null;
  initialMargin: number | null;
  maintenanceMargin: number | null;
  fullInitialMargin: number | null;
  autoLiqLevel: number | null;
  cashUSD: number | null;
  currencyCashAvailWithdrawalUSD: number | null;
}

export interface SnapshotPosition {
  contractId: number | null;
  symbol: string | null;
  root: string | null;
  side: "long" | "short";
  quantity: number;
  avgPrice: number | null;
}

export interface SnapshotOrder {
  orderId: number;
  contractId: number | null;
  symbol: string | null;
  root: string | null;
  action: "Buy" | "Sell" | null;
  orderType: string | null;
  quantity: number | null;
  price: number | null;
  stopPrice: number | null;
  timeInForce: string | null;
  ordStatus: string;
  /** True for statuses that still rest on the book. */
  isWorking: boolean;
  timestamp: string | null;
}

export interface AccountSnapshot {
  integrationId: string;
  accountId: number;
  accountSpec: string | null;
  environment: TradovateEnvironment;
  balance: SnapshotBalance | null;
  positions: SnapshotPosition[];
  orders: SnapshotOrder[];
  fetchedAt: string;
  /** Names of the sub-reads that failed on this attempt, e.g. ["orders"]. */
  warnings: string[];
}

/** Statuses that mean the order is still live on the exchange. */
const WORKING_STATUSES = new Set([
  "Working",
  "PendingNew",
  "PendingCancel",
  "PendingReplace",
  "Suspended",
]);

export interface SnapshotOptions {
  admin: SupabaseClient;
  userId: string;
  integrationId: string;
  integration: IntegrationRow;
  credentials: TradovateCredentials;
  limiter?: TradovateRateLimiter;
  fetchImpl?: typeof fetch;
  now?: () => number;
}

/**
 * Fetch a fresh snapshot from the provider. Never throws for provider
 * failures — every sub-read is guarded and reported in `warnings`.
 */
export async function fetchAccountSnapshot(
  opts: SnapshotOptions,
): Promise<AccountSnapshot> {
  const limiter = opts.limiter ?? createDefaultLimiter();
  const now = opts.now ?? (() => Date.now());
  const env = opts.integration.environment as TradovateEnvironment;
  const accountId = Number(opts.integration.tradovate_account_id);
  const base: AccountSnapshot = {
    integrationId: opts.integrationId,
    accountId,
    accountSpec: opts.integration.account_spec,
    environment: env,
    balance: null,
    positions: [],
    orders: [],
    fetchedAt: new Date(now()).toISOString(),
    warnings: [],
  };

  const auth = await ensureToken({
    credentials: opts.credentials,
    environment: env,
    limiter,
    fetchImpl: opts.fetchImpl,
    now,
    stored: opts.credentials.accessToken
      ? {
        accessToken: opts.credentials.accessToken,
        expirationTime: opts.credentials.accessTokenExpiresAt ?? "",
      }
      : null,
  });
  if (!auth.ok) {
    return { ...base, warnings: ["auth"] };
  }
  const accessToken = auth.accessToken;
  // Persist a freshly minted token for the next poll/sync (best-effort).
  if (!opts.credentials.accessToken || opts.credentials.accessToken !== accessToken) {
    await storeSessionToken(opts.admin, opts.userId, opts.integrationId, {
      accessToken,
      expirationTime: auth.expirationTime,
    });
  }
  const rest = { environment: env, accessToken, limiter, fetchImpl: opts.fetchImpl };
  const resolver = makeCachedContractResolver(rest);

  // Balance (single, required read).
  let balance: SnapshotBalance | null = null;
  try {
    const snap = await cashBalanceSnapshot({ ...rest, accountId });
    if (snap) {
      balance = {
        totalCashValue: snap.totalCashValue,
        totalPnL: snap.totalPnL,
        netLiq: snap.netLiq,
        openPnL: snap.openPnL,
        realizedPnL: snap.realizedPnL,
        weekRealizedPnL: snap.weekRealizedPnL,
        initialMargin: snap.initialMargin,
        maintenanceMargin: snap.maintenanceMargin,
        fullInitialMargin: snap.fullInitialMargin,
        autoLiqLevel: snap.autoLiqLevel,
        cashUSD: snap.cashUSD,
        currencyCashAvailWithdrawalUSD: snap.currencyCashAvailWithdrawalUSD,
      };
    } else {
      base.warnings.push("balance");
    }
  } catch {
    base.warnings.push("balance");
  }

  // Positions (scoped to the connected account).
  const positions: SnapshotPosition[] = [];
  try {
    const rows = (await positionList(rest)).filter(
      (p) => p.accountId === accountId && p.netPos !== 0,
    );
    await resolver.ensure(
      rows.map((p) => p.contractId).filter((id): id is number => id !== null),
    );
    for (const p of rows) {
      const info = resolver.resolve(p.contractId);
      positions.push({
        contractId: p.contractId,
        symbol: info?.symbol ?? null,
        root: info?.root ?? null,
        side: p.netPos > 0 ? "long" : "short",
        quantity: Math.abs(p.netPos),
        avgPrice: p.netPrice,
      });
    }
  } catch {
    base.warnings.push("positions");
  }

  // Orders + their priced revisions, scoped to the connected account.
  const orders: SnapshotOrder[] = [];
  try {
    const [orderRows, versionRows] = await Promise.all([
      orderList(rest),
      orderVersionList(rest).catch(() => []),
    ]);
    const versionByOrder = new Map<number, (typeof versionRows)[number]>();
    for (const v of versionRows) versionByOrder.set(v.orderId, v);
    const scoped = orderRows.filter((o) => o.accountId === accountId);
    await resolver.ensure(
      scoped.map((o) => o.contractId).filter((id): id is number => id !== null),
    );
    for (const o of scoped) {
      const info = resolver.resolve(o.contractId);
      const v = versionByOrder.get(o.id);
      orders.push({
        orderId: o.id,
        contractId: o.contractId,
        symbol: info?.symbol ?? null,
        root: info?.root ?? null,
        action: o.action,
        orderType: v?.orderType ?? null,
        quantity: v?.orderQty ?? null,
        price: v?.price ?? null,
        stopPrice: v?.stopPrice ?? null,
        timeInForce: v?.timeInForce ?? null,
        ordStatus: o.ordStatus,
        isWorking: WORKING_STATUSES.has(o.ordStatus),
        timestamp: o.timestamp,
      });
    }
  } catch {
    base.warnings.push("orders");
  }

  return { ...base, balance, positions, orders };
}

/** Load the credentials for an integration the user owns. */
export async function loadSnapshotInputs(
  admin: SupabaseClient,
  userId: string,
  integrationId: string,
): Promise<{ integration: IntegrationRow; credentials: TradovateCredentials }> {
  return loadCredentials(admin, userId, integrationId);
}
