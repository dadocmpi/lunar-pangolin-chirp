// ============================================================================
// tradovate-data — read-only trades + fills + aggregate PnL for the user.
//
// GET -> {
//   trades: [...], fills: [...],
//   summary: { netPnl, grossPnl, commission, openTrades, closedTrades, byAccount }
// }
//
// Scoped to the verified user; the client cannot request another user's data.
// The rows themselves are also protected by RLS, so this is defense in depth.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  corsHeaders,
  json,
  requireUser,
  UnauthorizedError,
} from "../_shared/tradovate/auth.ts";
import { listIntegrations } from "../_shared/tradovate/credentialStore.ts";
import { computePerformance } from "../_shared/tradovate/performance.ts";
import { featureDisabledBody, isTradovateEnabled } from "../_shared/features.ts";

interface TradeRow {
  id: string;
  integration_id: string;
  account_id: number | null;
  root_symbol: string;
  symbol: string | null;
  side: string;
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  opened_at: string;
  closed_at: string | null;
  realized_pnl: number;
  commission: number;
  net_pnl: number;
  status: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

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
  const ids = integrations.map((i) => i.id);
  if (ids.length === 0) {
    return json({
      trades: [],
      fills: [],
      summary: {
        netPnl: 0,
        grossPnl: 0,
        commission: 0,
        openTrades: 0,
        closedTrades: 0,
        byAccount: [],
      },
      performance: computePerformance([]),
    });
  }

  // Optional account scope: ?accountId=<n> narrows to one Tradovate account.
  // A crafted id for another user's account simply matches nothing.
  const url = new URL(req.url);
  const requestedAccount = url.searchParams.get("accountId");
  const accountFilter = requestedAccount && Number.isFinite(Number(requestedAccount))
    ? Number(requestedAccount)
    : null;

  let query = ctx.admin
    .from("trades")
    .select(
      "id, integration_id, account_id, root_symbol, symbol, side, quantity, entry_price, exit_price, opened_at, closed_at, realized_pnl, commission, net_pnl, status",
    )
    .in("integration_id", ids);
  if (accountFilter !== null) query = query.eq("account_id", accountFilter);
  const { data: trades, error } = await query
    .order("opened_at", { ascending: false })
    .limit(2000);
  if (error) return json({ error: "trades_failed" }, 500);

  let fillsQuery = ctx.admin
    .from("tradovate_fills")
    .select(
      "tradovate_fill_id, integration_id, account_id, contract_id, fill_timestamp, action, quantity, price, commission, active",
    )
    .in("integration_id", ids);
  if (accountFilter !== null) fillsQuery = fillsQuery.eq("account_id", accountFilter);
  const { data: fills } = await fillsQuery
    .order("fill_timestamp", { ascending: false })
    .limit(5000);

  const rows = (trades ?? []) as TradeRow[];
  const closed = rows.filter((t) => t.status === "closed");
  const byAccountMap = new Map<number | null, { accountId: number | null; netPnl: number; trades: number }>();
  for (const t of rows) {
    const key = t.account_id ?? null;
    const entry = byAccountMap.get(key) ?? { accountId: key, netPnl: 0, trades: 0 };
    entry.netPnl += Number(t.net_pnl ?? 0);
    entry.trades += 1;
    byAccountMap.set(key, entry);
  }

  const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
  return json({
    trades: rows,
    fills: fills ?? [],
    summary: {
      netPnl: round2(rows.reduce((s, t) => s + Number(t.net_pnl ?? 0), 0)),
      grossPnl: round2(rows.reduce((s, t) => s + Number(t.realized_pnl ?? 0), 0)),
      commission: round2(rows.reduce((s, t) => s + Number(t.commission ?? 0), 0)),
      openTrades: rows.length - closed.length,
      closedTrades: closed.length,
      byAccount: [...byAccountMap.values()].map((a) => ({ ...a, netPnl: round2(a.netPnl) })),
    },
    // Real performance stats computed from the same closed trades the client
    // renders, so the numbers shown and the numbers aggregated can't diverge.
    performance: computePerformance(rows.map((t) => ({
      root_symbol: t.root_symbol,
      symbol: t.symbol,
      side: t.side as "long" | "short",
      quantity: Number(t.quantity),
      entry_price: Number(t.entry_price),
      exit_price: t.exit_price === null ? null : Number(t.exit_price),
      opened_at: t.opened_at,
      closed_at: t.closed_at,
      realized_pnl: Number(t.realized_pnl ?? 0),
      commission: Number(t.commission ?? 0),
      net_pnl: Number(t.net_pnl ?? 0),
      status: t.status as "open" | "closed",
    }))),
  });
});
