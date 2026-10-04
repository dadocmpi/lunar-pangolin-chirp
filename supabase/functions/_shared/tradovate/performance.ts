// ============================================================================
// Trading performance statistics (isomorphic, pure).
//
// Computes the terminal's performance view models from the REAL reconstructed
// trades only. There is no sample data, no default curve and no invented
// figure: an account with no closed trades yields `hasData: false` and every
// metric is null/zero, which the UI renders as an explicit empty state.
//
// Runs unchanged in the browser (src/lib/tradovate/performance.ts re-exports
// it) and inside the sync Edge Function, so the numbers shown and the numbers
// persisted can never disagree.
//
// All date bucketing is UTC (trades are stored in UTC); the UI localizes for
// display. Week starts on Monday (ISO-8601).
// ============================================================================

export interface ClosedTradeLike {
  root_symbol: string;
  symbol?: string | null;
  side: "long" | "short";
  quantity: number;
  entry_price: number;
  exit_price?: number | null;
  opened_at: string;
  closed_at?: string | null;
  realized_pnl?: number | null;
  commission?: number | null;
  net_pnl: number;
  status: "open" | "closed";
}

export interface EquityPoint {
  /** ISO timestamp of the close. */
  t: string;
  /** Cumulative realized net PnL up to and including this close. */
  value: number;
}

export interface CalendarDay {
  /** UTC calendar day, YYYY-MM-DD. */
  date: string;
  /** Realized net PnL for that day (USD). */
  pnl: number;
  /** Number of closed trades that day. */
  trades: number;
}

export interface PeriodRealized {
  day: number;
  week: number;
  month: number;
  allTime: number;
}

export interface PerformanceStats {
  /** True only when at least one closed trade exists. */
  hasData: boolean;
  closedTrades: number;
  openTrades: number;
  wins: number;
  losses: number;
  breakEven: number;
  /** wins / closed, 0..1, or null when there are no closed trades. */
  winRate: number | null;
  /** gross profit / gross loss, or null when there is no loss. */
  profitFactor: number | null;
  avgWin: number | null;
  avgLoss: number | null;
  /** Largest single winning trade (USD) or null. */
  bestTrade: number | null;
  /** Largest single losing trade (USD, negative) or null. */
  worstTrade: number | null;
  /** Deepest peak-to-trough drop of the cumulative curve (USD <= 0) or null. */
  maxDrawdown: number | null;
  /** Sum of realized net PnL across closed trades (USD). */
  totalNet: number;
  grossProfit: number;
  grossLoss: number;
  totalCommission: number;
  /** Cumulative realized net PnL over time (USD), oldest first. */
  equityCurve: EquityPoint[];
  /** Per-UTC-day realized net PnL, oldest first. */
  calendar: CalendarDay[];
  /** Realized net PnL bucketed to the current UTC day / ISO week / month. */
  realized: PeriodRealized;
}

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? 0));
  return Number.isFinite(n) ? n : 0;
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function utcDay(iso: string): string | null {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Date(t).toISOString().slice(0, 10);
}

/** ISO-8601 week key (YYYY-Www) for a UTC instant. */
export function isoWeekKey(iso: string): string | null {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const d = new Date(t);
  // Shift to Thursday of the current week to get the ISO week-year.
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (target.getUTCDay() + 6) % 7; // Mon=0 .. Sun=6
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const fdayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fdayNum + 3);
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function closedSorted(trades: ClosedTradeLike[]): ClosedTradeLike[] {
  return trades
    .filter((t) => t.status === "closed" && Boolean(t.closed_at))
    .slice()
    .sort((a, b) => Date.parse(a.closed_at as string) - Date.parse(b.closed_at as string));
}

/**
 * Compute every performance figure from real closed trades.
 * `now` is injectable so day/week/month bucketing is deterministic in tests.
 */
export function computePerformance(
  trades: ClosedTradeLike[],
  now: Date = new Date(),
): PerformanceStats {
  const closed = closedSorted(trades);
  const openTrades = trades.filter((t) => t.status === "open").length;

  if (closed.length === 0) {
    return {
      hasData: false,
      closedTrades: 0,
      openTrades,
      wins: 0,
      losses: 0,
      breakEven: 0,
      winRate: null,
      profitFactor: null,
      avgWin: null,
      avgLoss: null,
      bestTrade: null,
      worstTrade: null,
      maxDrawdown: null,
      totalNet: 0,
      grossProfit: 0,
      grossLoss: 0,
      totalCommission: 0,
      equityCurve: [],
      calendar: [],
      realized: { day: 0, week: 0, month: 0, allTime: 0 },
    };
  }

  let wins = 0;
  let losses = 0;
  let breakEven = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let commission = 0;
  let best: number | null = null;
  let worst: number | null = null;
  let cumulative = 0;
  let peak = 0;
  let maxDrawdown = 0;
  const equityCurve: EquityPoint[] = [];
  const byDay = new Map<string, CalendarDay>();

  const nowDay = utcDay(now.toISOString());
  const nowWeek = isoWeekKey(now.toISOString());
  const nowMonth = nowDay ? nowDay.slice(0, 7) : null;
  const realized: PeriodRealized = { day: 0, week: 0, month: 0, allTime: 0 };

  for (const t of closed) {
    const pnl = num(t.net_pnl);
    cumulative += pnl;
    peak = Math.max(peak, cumulative);
    maxDrawdown = Math.min(maxDrawdown, cumulative - peak);

    if (pnl > 0) {
      wins++;
      grossProfit += pnl;
    } else if (pnl < 0) {
      losses++;
      grossLoss += pnl;
    } else {
      breakEven++;
    }
    best = best === null ? pnl : Math.max(best, pnl);
    worst = worst === null ? pnl : Math.min(worst, pnl);
    commission += num(t.commission);

    equityCurve.push({ t: t.closed_at as string, value: round2(cumulative) });

    const day = utcDay(t.closed_at as string);
    if (day) {
      const cur = byDay.get(day) ?? { date: day, pnl: 0, trades: 0 };
      cur.pnl = round2(cur.pnl + pnl);
      cur.trades += 1;
      byDay.set(day, cur);
    }

    realized.allTime = round2(realized.allTime + pnl);
    if (day && nowDay && day === nowDay) realized.day = round2(realized.day + pnl);
    if (nowMonth && day && day.slice(0, 7) === nowMonth) {
      realized.month = round2(realized.month + pnl);
    }
    const week = isoWeekKey(t.closed_at as string);
    if (nowWeek && week === nowWeek) realized.week = round2(realized.week + pnl);
  }

  const decided = wins + losses;
  return {
    hasData: true,
    closedTrades: closed.length,
    openTrades,
    wins,
    losses,
    breakEven,
    winRate: decided === 0 ? null : round4(wins / decided),
    profitFactor: grossLoss === 0 ? null : round4(grossProfit / Math.abs(grossLoss)),
    avgWin: wins === 0 ? null : round2(grossProfit / wins),
    avgLoss: losses === 0 ? null : round2(grossLoss / losses),
    bestTrade: best === null ? null : round2(best),
    worstTrade: worst === null ? null : round2(worst),
    maxDrawdown: round2(maxDrawdown),
    totalNet: round2(cumulative),
    grossProfit: round2(grossProfit),
    grossLoss: round2(grossLoss),
    totalCommission: round2(commission),
    equityCurve,
    calendar: [...byDay.values()].sort((a, b) => (a.date < b.date ? -1 : 1)),
    realized,
  };
}

function round4(n: number): number {
  return Math.round((n + Number.EPSILON) * 10000) / 10000;
}
