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
  TradovateEnvironment,
  TradovateFill,
} from "./types.ts";
import { hostFor } from "./authService.ts";

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
 */
export async function fillList(
  opts: RestOptions & {
    sinceId?: number;
    limit?: number;
    maxPages?: number;
  },
): Promise<FillListResult> {
  const limiter = opts.limiter ?? createDefaultLimiter();
  const limit = opts.limit ?? DEFAULT_FILL_PAGE_LIMIT;
  const maxPages = opts.maxPages ?? MAX_FILL_PAGES;
  const url = `${hostFor(opts.environment)}/fill/list`;

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
      body: { sinceId, limit },
    });
    pages += 1;
    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) break;

    let maxId = sinceId;
    for (const row of rows) {
      const fill = normalizeFill(row);
      if (!fill) continue;
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

export { TradovateHttpError };
