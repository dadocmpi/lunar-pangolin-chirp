// ============================================================================
// useTradovateTerminal — one hook that loads everything the terminal shows.
//
// Two server calls, both scoped to the verified user:
//   * tradovate-dashboard -> live balance / positions / working orders
//     (cached server-side for a short TTL; `refresh()` forces ?fresh=1)
//   * tradovate-data      -> reconstructed trades + fills + server-computed
//     performance statistics, scoped to the selected account
//
// Nothing is invented: a failed call surfaces as an error state, and an empty
// account surfaces as empty arrays. The hook never fabricates a figure.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type { PerformanceStats } from "@/lib/tradovate/performance";

export interface TerminalAccount {
  integrationId: string;
  accountId: number;
  accountSpec: string | null;
  label: string | null;
  environment: "demo" | "live";
  status: string;
}

export interface TerminalBalance {
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

export interface TerminalPosition {
  contractId: number | null;
  symbol: string | null;
  root: string | null;
  side: "long" | "short";
  quantity: number;
  avgPrice: number | null;
}

export interface TerminalOrder {
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
  isWorking: boolean;
  timestamp: string | null;
}

export interface TerminalSnapshot {
  balance: TerminalBalance | null;
  positions: TerminalPosition[];
  orders: TerminalOrder[];
  fetchedAt: string;
  warnings: string[];
}

export interface TerminalTrade {
  id: string;
  account_id: number | null;
  root_symbol: string;
  symbol: string | null;
  side: "long" | "short";
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  opened_at: string;
  closed_at: string | null;
  realized_pnl: number;
  commission: number;
  net_pnl: number;
  status: "open" | "closed";
}

export interface TerminalSummary {
  netPnl: number;
  grossPnl: number;
  commission: number;
  openTrades: number;
  closedTrades: number;
  byAccount: Array<{ accountId: number | null; netPnl: number; trades: number }>;
}

export interface TerminalState {
  loading: boolean;
  /** True once the first successful load has completed. */
  loaded: boolean;
  connected: boolean;
  enabled: boolean;
  accounts: TerminalAccount[];
  selected: TerminalAccount | null;
  select: (integrationId: string) => void;
  snapshot: TerminalSnapshot | null;
  trades: TerminalTrade[];
  summary: TerminalSummary | null;
  performance: PerformanceStats | null;
  lastSyncedAt: string | null;
  /** True when the last snapshot came from the server cache. */
  cached: boolean;
  error: "data_failed" | "status_failed" | null;
  refresh: (fresh?: boolean) => Promise<void>;
}

const EMPTY_SUMMARY: TerminalSummary = {
  netPnl: 0,
  grossPnl: 0,
  commission: 0,
  openTrades: 0,
  closedTrades: 0,
  byAccount: [],
};

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useTradovateTerminal(): TerminalState {
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [accounts, setAccounts] = useState<TerminalAccount[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<TerminalSnapshot | null>(null);
  const [trades, setTrades] = useState<TerminalTrade[]>([]);
  const [summary, setSummary] = useState<TerminalSummary | null>(null);
  const [performance, setPerformance] = useState<PerformanceStats | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState<"data_failed" | "status_failed" | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async (integrationId: string | null, fresh: boolean) => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      setConnected(false);
      setEnabled(true);
      return;
    }
    setError(null);
    const headers = { "Content-Type": "application/json", ...(await authHeader()) };

    // 1. Live account snapshot.
    const params = new URLSearchParams();
    if (integrationId) params.set("integrationId", integrationId);
    if (fresh) params.set("fresh", "1");
    const dashRes = await fetch(
      functionsUrl(`tradovate-dashboard${params.toString() ? `?${params}` : ""}`),
      { method: "GET", headers },
    ).catch(() => null);

    if (!dashRes) {
      if (mounted.current) {
        setError("status_failed");
        setLoading(false);
      }
      return;
    }
    if (dashRes.status === 503) {
      // Feature switched off at runtime.
      if (mounted.current) {
        setEnabled(false);
        setConnected(false);
        setLoading(false);
      }
      return;
    }
    if (!dashRes.ok) {
      if (mounted.current) {
        setError(dashRes.status === 401 ? "status_failed" : "data_failed");
        setLoading(false);
      }
      return;
    }

    const dash = await dashRes.json().catch(() => ({}));
    if (mounted.current) {
      setEnabled(true);
      const list: TerminalAccount[] = Array.isArray(dash.accounts) ? dash.accounts : [];
      setAccounts(list);
      setConnected(Boolean(dash.connected) && list.length > 0);
      const activeId = typeof dash?.account?.integrationId === "string"
        ? dash.account.integrationId
        : integrationId ?? list[0]?.integrationId ?? null;
      setSelectedId(activeId);
      setSnapshot((dash.snapshot as TerminalSnapshot | null) ?? null);
      setCached(Boolean(dash.cached));
      setLastSyncedAt(typeof dash.lastSyncedAt === "string" ? dash.lastSyncedAt : null);
    }

    // 2. Reconstructed trades + performance for the selected account.
    try {
      const accountId = dash?.account?.accountId;
      const dataParams = accountId !== undefined && accountId !== null
        ? `?accountId=${encodeURIComponent(String(accountId))}`
        : "";
      const dataRes = await fetch(functionsUrl(`tradovate-data${dataParams}`), {
        method: "GET",
        headers,
      });
      if (dataRes.ok) {
        const data = await dataRes.json();
        if (mounted.current) {
          setTrades(Array.isArray(data.trades) ? data.trades : []);
          setSummary((data.summary as TerminalSummary) ?? EMPTY_SUMMARY);
          setPerformance((data.performance as PerformanceStats) ?? null);
        }
      } else if (mounted.current) {
        setTrades([]);
        setSummary(EMPTY_SUMMARY);
        setPerformance(null);
      }
    } catch {
      if (mounted.current) {
        setTrades([]);
        setSummary(EMPTY_SUMMARY);
        setPerformance(null);
      }
    }

    if (mounted.current) {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  const refresh = useCallback(
    async (fresh = true) => {
      await load(selectedId, fresh);
    },
    [load, selectedId],
  );

  const select = useCallback(
    (integrationId: string) => {
      setSelectedId(integrationId);
      setLoading(true);
      load(integrationId, false);
    },
    [load],
  );

  // Initial load.
  useEffect(() => {
    load(null, false);
  }, [load]);

  // Realtime: refresh when the background poller writes new trades/fills.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const channel = supabase
      .channel("tradovate-terminal")
      .on("postgres_changes", { event: "*", schema: "public", table: "trades" }, () => {
        load(selectedId, false);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tradovate_fills" }, () => {
        load(selectedId, false);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, selectedId]);

  // Fallback poll: refreshes the LIVE panel from the server cache (never a
  // direct Tradovate call) so the terminal stays current when Realtime is not
  // available. Interval is configurable; 0 disables it.
  useEffect(() => {
    const configured = Number(import.meta.env.VITE_TERMINAL_POLL_MS ?? 30000);
    const ms = Number.isFinite(configured) && configured >= 0 ? configured : 30000;
    if (ms === 0) return;
    const id = window.setInterval(() => {
      load(selectedId, false);
    }, ms);
    return () => window.clearInterval(id);
  }, [load, selectedId]);

  return {
    loading,
    loaded,
    connected,
    enabled,
    accounts,
    selected: accounts.find((a) => a.integrationId === selectedId) ?? accounts[0] ?? null,
    select,
    snapshot,
    trades,
    summary,
    performance,
    lastSyncedAt,
    cached,
    error,
    refresh,
  };
}
