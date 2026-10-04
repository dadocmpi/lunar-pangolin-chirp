// ============================================================================
// dashboardData — pure resolvers that turn REAL rows into dashboard view models.
//
// The dashboard used to render invented figures (+12.4% profit, -2.1% drawdown,
// a $-axis growth chart, demo trades). Those numbers were identical for every
// user regardless of their account. This module is the single place that
// decides what the performance view shows, so "no data" can never silently
// become a made-up number.
//
// Rule: if the user has no closed trades, the summary reports `hasData: false`
// and every figure is zero/null. The UI then renders the localized
// "No performance data yet" empty state. Nothing here invents a value.
//
// Kept dependency-free and pure so it can be unit-tested from Deno and Node.
// ============================================================================

export interface ServiceLike {
  balance?: string | number | null;
  status?: string | null;
}

export interface TradeLike {
  root_symbol: string;
  symbol?: string | null;
  side: "long" | "short";
  quantity: number;
  entry_price: number;
  exit_price?: number | null;
  opened_at: string;
  closed_at?: string | null;
  net_pnl: number;
  status: "open" | "closed";
}

export interface WithdrawalLike {
  id: string;
  amount_cents: number;
  currency?: string | null;
  method?: string | null;
  status: string;
  created_at: string;
}

export interface PerformancePoint {
  name: string;
  value: number;
}

export interface MonthlyReturn {
  month: string;
  value: number;
}

export interface PerformanceSummary {
  /** True only when there is at least one closed trade to compute from. */
  hasData: boolean;
  /** Sum of realized net PnL across closed trades (USD). */
  totalProfit: number;
  /** Deepest peak-to-trough drop of the cumulative PnL curve (negative USD), or null. */
  maxDrawdown: number | null;
  /** Realized PnL per calendar month of the close date (USD), oldest first. */
  monthlyReturns: MonthlyReturn[];
  /** Cumulative realized PnL over time (USD), for the growth chart. */
  growthSeries: PerformancePoint[];
  /** Sum of the balances actually returned by the services rows. */
  totalBalance: number;
}

export interface TransactionView {
  id: string;
  type: "withdrawal";
  amount: number;
  status: string;
  date: string;
}

export interface AuditRow {
  id: string;
  asset: string;
  side: "long" | "short";
  entry: number;
  exit: number | null;
  netPnl: number;
  time: string;
  status: "open" | "closed";
}

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? 0));
  return Number.isFinite(n) ? n : 0;
};

/** Short, locale-neutral month label derived from an ISO timestamp. */
function monthKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function closedTradesSorted(trades: TradeLike[]): TradeLike[] {
  return trades
    .filter((tr) => tr.status === "closed" && Boolean(tr.closed_at))
    .slice()
    .sort((a, b) => Date.parse(a.closed_at as string) - Date.parse(b.closed_at as string));
}

/**
 * Build the performance summary from the user's real services + closed trades.
 * With no closed trades the result is an explicit empty state, never a guess.
 */
export function resolvePerformanceSummary(input: {
  services: ServiceLike[];
  trades: TradeLike[];
}): PerformanceSummary {
  const { services, trades } = input;
  const totalBalance = services.reduce((acc, s) => acc + num(s.balance), 0);
  const closed = closedTradesSorted(trades);

  if (closed.length === 0) {
    return {
      hasData: false,
      totalProfit: 0,
      maxDrawdown: null,
      monthlyReturns: [],
      growthSeries: [],
      totalBalance,
    };
  }

  let cumulative = 0;
  let peak = 0;
  let maxDrawdown = 0;
  const growthSeries: PerformancePoint[] = [];
  const byMonth = new Map<string, number>();

  for (const tr of closed) {
    const pnl = num(tr.net_pnl);
    cumulative += pnl;
    peak = Math.max(peak, cumulative);
    maxDrawdown = Math.min(maxDrawdown, cumulative - peak);

    const key = monthKey(tr.closed_at as string);
    if (key) byMonth.set(key, (byMonth.get(key) ?? 0) + pnl);

    growthSeries.push({ name: key || String(growthSeries.length + 1), value: round2(cumulative) });
  }

  const monthlyReturns: MonthlyReturn[] = [...byMonth.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .slice(-6)
    .map(([month, value]) => ({ month, value: round2(value) }));

  return {
    hasData: true,
    totalProfit: round2(cumulative),
    maxDrawdown: round2(maxDrawdown),
    monthlyReturns,
    growthSeries,
    totalBalance,
  };
}

/** Real withdrawal rows -> transaction history view models. */
export function resolveTransactions(rows: WithdrawalLike[]): TransactionView[] {
  return rows
    .slice()
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .map((r) => ({
      id: r.id,
      type: "withdrawal" as const,
      amount: num(r.amount_cents) / 100,
      status: r.status,
      date: r.created_at,
    }));
}

/** Real trade rows -> audit-log rows. Profit is the realized net PnL in USD. */
export function resolveAuditLog(trades: TradeLike[]): AuditRow[] {
  return trades
    .slice()
    .sort((a, b) => Date.parse(b.opened_at) - Date.parse(a.opened_at))
    .map((tr, i) => ({
      id: `${tr.root_symbol}-${tr.opened_at}-${i}`,
      asset: tr.symbol || tr.root_symbol,
      side: tr.side,
      entry: num(tr.entry_price),
      exit: tr.exit_price === null || tr.exit_price === undefined ? null : num(tr.exit_price),
      netPnl: num(tr.net_pnl),
      time: tr.opened_at,
      status: tr.status,
    }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
