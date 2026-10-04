// ============================================================================
// Tradovate REST service.
//
// Read-only endpoints used by the incremental sync worker:
//   POST {host}/account/list        -> accounts visible to the token
//   POST {host}/fill/list           -> fills, incremental by sinceId
//   POST {host}/contract/item       -> contract metadata (symbol resolution)
//
// All calls accept an injected limiter + fetch so they are unit-testable with
// no network. Nothing here logs the token.
//
// NOT YET VERIFIED against the live service.
// ============================================================================

import { TradovateHttpError, requestJson } from "./http.ts";
import {
  createDefaultLimiter,
  TradovateRateLimiter,
} from "./rateLimiter.ts";
import type {
  TradovateAccount,
  TradovateCashBalance,
  TradovateEnvironment,
  TradovateFill,
  TradovateOrder,
  TradovateOrderVersion,
  TradovatePosition,
} from "./types.ts";
import { hostFor } from "./authService.ts";
import { rootFromSymbol } from "./pnl.ts";

export const DEFAULT_FILL_PAGE_LIMIT = 500;
export const MAX_FILL_PAGES = 40;

export interface RestOptions {
  environment: TradovateEnvironment;
  accessToken: string;
  limiter?: TradovateRateLimiter;
  fetchImpl?: typeof fetch;
}

function authHeaders(accessToken: string): Record<string, string> {
  // The token is used as a header only; it is never logged.
  return { Authorization: `Bearer ${accessToken}` };
}

/** POST /account/list */
export async function accountList(
  opts: RestOptions,
): Promise<TradovateAccount[]> {
  const limiter = opts.limiter ?? createDefaultLimiter();
  const data = await requestJson<unknown>({
    url: `${hostFor(opts.environment)}/account/list`,
    limiter,
    fetchImpl: opts.fetchImpl,
    headers: authHeaders(opts.accessToken),
    body: {},
  });
  if (!Array.isArray(data)) return [];
  return data.map(normalizeAccount).filter((a): a is TradovateAccount => !!a);
}

function normalizeAccount(raw: unknown): TradovateAccount | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const id = Number(rec.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    name: String(rec.name ?? ""),
    userId: Number(rec.userId ?? 0),
    accountType: rec.accountType ? String(rec.accountType) : undefined,
    active: rec.active === undefined ? undefined : rec.active === true,
    simulation: rec.simulation === undefined ? undefined : rec.simulation === true,
  };
}

/** Normalize one raw /fill/list row into our persistence shape. */
export function normalizeFill(raw: unknown): TradovateFill | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const id = Number(rec.id);
  const qty = Number(rec.qty ?? rec.quantity);
  const price = Number(rec.price);
  if (!Number.isFinite(id) || !Number.isFinite(qty) || !Number.isFinite(price)) {
    return null;
  }
  const actionRaw = String(rec.action ?? "");
  const action = actionRaw === "Buy" || actionRaw === "Sell" ? actionRaw : null;
  return {
    tradovateFillId: id,
    orderId: finiteOrNull(rec.orderId),
    contractId: finiteOrNull(rec.contractId),
    accountId: finiteOrNull(rec.accountId),
    timestamp: normalizeTimestamp(rec.timestamp),
    tradeDate: typeof rec.tradeDate === "string" ? rec.tradeDate : null,
    action,
    quantity: Math.abs(qty),
    price,
    active: rec.active === undefined ? true : rec.active === true,
    commission: Number(rec.commission ?? 0) || 0,
    raw: rec,
  };
}

function finiteOrNull(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Normalize a Tradovate timestamp to ISO-8601 UTC.
 * Naive strings (no timezone designator) are treated as UTC, which is what
 * Tradovate reports; this avoids a silent local-timezone shift.
 */
export function normalizeTimestamp(value: unknown): string {
  const s = String(value ?? "");
  if (!s) return new Date(0).toISOString();
  const hasTz = /(Z|[+-]\d{2}:?\d{2})$/.test(s);
  const parsed = Date.parse(hasTz ? s : `${s}Z`);
  if (!Number.isFinite(parsed)) return new Date(0).toISOString();
  return new Date(parsed).toISOString();
}

export interface FillListResult {
  fills: TradovateFill[];
  /** Highest fill id seen; the caller persists this as the sync cursor. */
  nextSinceId: number;
  pages: number;
  truncated: boolean;
}

/**
 * POST /fill/list, incremental by sinceId, paginated.
 *
 * Tradovate returns fills with id greater than `sinceId`, oldest first, capped
 * at `limit`. We keep requesting pages until a page comes back short/empty or
 * the page budget is hit, so a long outage drains in a few worker runs.
 * Duplicate ids across pages are collapsed defensively.
 *
 * When `accountId` is set, only that account's fills are requested and any
 * account-less row is dropped, so a multi-account login never mixes accounts.
 */
export async function fillList(
  opts: RestOptions & {
    sinceId?: number;
    limit?: number;
    maxPages?: number;
    accountId?: number;
  },
): Promise<FillListResult> {
  const limiter = opts.limiter ?? createDefaultLimiter();
  const limit = opts.limit ?? DEFAULT_FILL_PAGE_LIMIT;
  const maxPages = opts.maxPages ?? MAX_FILL_PAGES;
  const url = `${hostFor(opts.environment)}/fill/list`;
  const accountId = opts.accountId && Number.isFinite(opts.accountId) ? opts.accountId : undefined;

  let sinceId = opts.sinceId ?? 0;
  let pages = 0;
  let truncated = false;
  const byId = new Map<number, TradovateFill>();

  while (pages < maxPages) {
    const data = await requestJson<unknown>({
      url,
      limiter,
      fetchImpl: opts.fetchImpl,
      headers: authHeaders(opts.accessToken),
      body: accountId === undefined ? { sinceId, limit } : { sinceId, limit, accountId },
    });
    pages += 1;
    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) break;

    let maxId = sinceId;
    for (const row of rows) {
      const fill = normalizeFill(row);
      if (!fill) continue;
      // Defense in depth: if the provider ignores the accountId filter, never
      // persist another account's fills into this integration.
      if (accountId !== undefined && fill.accountId !== null && fill.accountId !== accountId) {
        continue;
      }
      if (!byId.has(fill.tradovateFillId)) {
        byId.set(fill.tradovateFillId, fill);
      }
      if (fill.tradovateFillId > maxId) maxId = fill.tradovateFillId;
    }

    if (maxId <= sinceId) break; // no forward progress; avoid an infinite loop
    sinceId = maxId;
    if (rows.length < limit) break;
    if (pages >= maxPages) truncated = true;
  }

  const fills = [...byId.values()].sort(
    (a, b) => a.tradovateFillId - b.tradovateFillId,
  );
  return { fills, nextSinceId: sinceId, pages, truncated };
}

/** POST /contract/item — resolve a contract id to its symbol/root. */
export async function contractItem(
  opts: RestOptions & { contractId: number },
): Promise<{ id: number; name: string; symbol?: string } | null> {
  const limiter = opts.limiter ?? createDefaultLimiter();
  const data = await requestJson<Record<string, unknown> | null>({
    url: `${hostFor(opts.environment)}/contract/item`,
    limiter,
    fetchImpl: opts.fetchImpl,
    headers: authHeaders(opts.accessToken),
    body: { id: opts.contractId },
  });
  if (!data || typeof data !== "object") return null;
  return {
    id: Number(data.id ?? opts.contractId),
    name: String(data.name ?? ""),
    symbol: data.symbol ? String(data.symbol) : undefined,
  };
}

/** POST /position/list — open positions visible to the token. */
export async function positionList(
  opts: RestOptions,
): Promise<TradovatePosition[]> {
  const limiter = opts.limiter ?? createDefaultLimiter();
  const data = await requestJson<unknown>({
    url: `${hostFor(opts.environment)}/position/list`,
    limiter,
    fetchImpl: opts.fetchImpl,
    headers: authHeaders(opts.accessToken),
    body: {},
  });
  if (!Array.isArray(data)) return [];
  return data.map(normalizePosition).filter((p): p is TradovatePosition => !!p);
}

export function normalizePosition(raw: unknown): TradovatePosition | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const accountId = Number(rec.accountId);
  if (!Number.isFinite(accountId)) return null;
  return {
    id: finiteOrNull(rec.id),
    accountId,
    contractId: finiteOrNull(rec.contractId),
    timestamp: typeof rec.timestamp === "string" ? rec.timestamp : null,
    netPos: Number(rec.netPos ?? 0) || 0,
    netPrice: finiteOrNull(rec.netPrice),
    bought: Number(rec.bought ?? 0) || 0,
    boughtValue: Number(rec.boughtValue ?? 0) || 0,
    sold: Number(rec.sold ?? 0) || 0,
    soldValue: Number(rec.soldValue ?? 0) || 0,
    prevPos: Number(rec.prevPos ?? 0) || 0,
    prevPrice: finiteOrNull(rec.prevPrice),
    raw: rec,
  };
}

/** POST /order/list — orders for the current session (identity + status). */
export async function orderList(opts: RestOptions): Promise<TradovateOrder[]> {
  const limiter = opts.limiter ?? createDefaultLimiter();
  const data = await requestJson<unknown>({
    url: `${hostFor(opts.environment)}/order/list`,
    limiter,
    fetchImpl: opts.fetchImpl,
    headers: authHeaders(opts.accessToken),
    body: {},
  });
  if (!Array.isArray(data)) return [];
  return data.map(normalizeOrder).filter((o): o is TradovateOrder => !!o);
}

export function normalizeOrder(raw: unknown): TradovateOrder | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const id = Number(rec.id);
  const accountId = Number(rec.accountId);
  if (!Number.isFinite(id) || !Number.isFinite(accountId)) return null;
  const actionRaw = String(rec.action ?? "");
  return {
    id,
    accountId,
    contractId: finiteOrNull(rec.contractId),
    timestamp: typeof rec.timestamp === "string" ? rec.timestamp : null,
    action: actionRaw === "Buy" || actionRaw === "Sell" ? actionRaw : null,
    ordStatus: String(rec.ordStatus ?? "Unknown"),
    raw: rec,
  };
}

/** POST /orderVersion/list — the priced revision of each order. */
export async function orderVersionList(
  opts: RestOptions,
): Promise<TradovateOrderVersion[]> {
  const limiter = opts.limiter ?? createDefaultLimiter();
  const data = await requestJson<unknown>({
    url: `${hostFor(opts.environment)}/orderVersion/list`,
    limiter,
    fetchImpl: opts.fetchImpl,
    headers: authHeaders(opts.accessToken),
    body: {},
  });
  if (!Array.isArray(data)) return [];
  return data
    .map(normalizeOrderVersion)
    .filter((o): o is TradovateOrderVersion => !!o);
}

export function normalizeOrderVersion(raw: unknown): TradovateOrderVersion | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const orderId = Number(rec.orderId);
  if (!Number.isFinite(orderId)) return null;
  return {
    id: finiteOrNull(rec.id),
    orderId,
    orderQty: finiteOrNull(rec.orderQty),
    orderType: rec.orderType ? String(rec.orderType) : null,
    price: finiteOrNull(rec.price),
    stopPrice: finiteOrNull(rec.stopPrice),
    limitIfTouchedPrice: finiteOrNull(rec.limitIfTouchedPrice),
    timeInForce: rec.timeInForce ? String(rec.timeInForce) : null,
    text: typeof rec.text === "string" ? rec.text : null,
    raw: rec,
  };
}

/** POST /cashBalance/getCashBalanceSnapshot — account balance snapshot. */
export async function cashBalanceSnapshot(
  opts: RestOptions & { accountId: number },
): Promise<TradovateCashBalance | null> {
  const limiter = opts.limiter ?? createDefaultLimiter();
  const data = await requestJson<Record<string, unknown> | null>({
    url: `${hostFor(opts.environment)}/cashBalance/getCashBalanceSnapshot`,
    limiter,
    fetchImpl: opts.fetchImpl,
    headers: authHeaders(opts.accessToken),
    body: { accountId: opts.accountId },
  });
  if (!data || typeof data !== "object") return null;
  const errorText = typeof data.errorText === "string" ? data.errorText : "";
  if (errorText) return null;
  return {
    accountId: opts.accountId,
    totalCashValue: finiteOrNull(data.totalCashValue),
    totalPnL: finiteOrNull(data.totalPnL),
    netLiq: finiteOrNull(data.netLiq),
    openPnL: finiteOrNull(data.openPnL),
    realizedPnL: finiteOrNull(data.realizedPnL),
    weekRealizedPnL: finiteOrNull(data.weekRealizedPnL),
    initialMargin: finiteOrNull(data.initialMargin),
    maintenanceMargin: finiteOrNull(data.maintenanceMargin),
    fullInitialMargin: finiteOrNull(data.fullInitialMargin),
    autoLiqLevel: finiteOrNull(data.autoLiqLevel),
    cashUSD: finiteOrNull(data.cashUSD),
    currencyCashAvailWithdrawalUSD: finiteOrNull(data.currencyCashAvailWithdrawalUSD),
    raw: data,
  };
}

/**
 * Resolve contract ids to symbols, cached for the lifetime of the call.
 * `resolve()` is synchronous and returns null until `ensure()` has fetched the
 * contract, so the pure PnL/stat engines keep their synchronous contract.
 */
export function makeCachedContractResolver(opts: RestOptions) {
  const cache = new Map<number, { root: string; symbol: string }>();
  return {
    resolve(contractId: number | null) {
      if (contractId === null) return null;
      return cache.get(contractId) ?? null;
    },
    async ensure(contractIds: number[]): Promise<void> {
      for (const id of contractIds) {
        if (cache.has(id)) continue;
        try {
          const item = await contractItem({ ...opts, contractId: id });
          if (item) {
            const name = item.symbol || item.name || "";
            cache.set(id, { root: rootFromSymbol(name), symbol: name });
          }
        } catch {
          // Unresolved contracts stay null; the UI shows the raw contract id.
        }
      }
    },
  };
}

export { TradovateHttpError };
