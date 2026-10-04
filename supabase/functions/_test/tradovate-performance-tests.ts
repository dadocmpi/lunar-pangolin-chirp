// ============================================================================
// Performance engine unit tests (no network, no DB).
//
// Run: deno run -A supabase/functions/_test/tradovate-performance-tests.ts
//
// Covers: the empty state (no fabricated figures), win/loss accounting,
// profit factor, average win/loss, best/worst, max drawdown on a real equity
// curve, UTC day/week/month bucketing, commission totals and the calendar.
// ============================================================================

import {
  computePerformance,
  type ClosedTradeLike,
} from "../_shared/tradovate/performance.ts";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    console.error(`  FAIL  ${name}`);
    console.error(`        ${e instanceof Error ? e.message : String(e)}`);
  }
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function trade(over: Partial<ClosedTradeLike>): ClosedTradeLike {
  return {
    root_symbol: "ES",
    symbol: "ESZ6",
    side: "long",
    quantity: 1,
    entry_price: 5000,
    exit_price: 5010,
    opened_at: "2026-06-01T14:00:00Z",
    closed_at: "2026-06-01T15:00:00Z",
    realized_pnl: 50,
    commission: 4.5,
    net_pnl: 45.5,
    status: "closed",
    ...over,
  };
}

console.log("\n[1] Empty account never invents a figure");
{
  const s = computePerformance([]);
  test("hasData is false", () => assert(s.hasData === false, "hasData"));
  test("totalNet is 0", () => assert(s.totalNet === 0, "totalNet"));
  test("winRate is null", () => assert(s.winRate === null, "winRate"));
  test("profitFactor is null", () => assert(s.profitFactor === null, "profitFactor"));
  test("maxDrawdown is null", () => assert(s.maxDrawdown === null, "maxDrawdown"));
  test("equityCurve is empty", () => assert(s.equityCurve.length === 0, "curve"));
  test("calendar is empty", () => assert(s.calendar.length === 0, "calendar"));
}

console.log("\n[2] Real accounting over a mixed sequence");
{
  const trades: ClosedTradeLike[] = [
    trade({ net_pnl: 100, closed_at: "2026-06-01T15:00:00Z" }),
    trade({ net_pnl: -40, closed_at: "2026-06-02T15:00:00Z" }),
    trade({ net_pnl: 60, closed_at: "2026-06-03T15:00:00Z" }),
    trade({ net_pnl: -20, closed_at: "2026-06-04T15:00:00Z" }),
    trade({ net_pnl: 0, closed_at: "2026-06-05T15:00:00Z" }),
  ];
  const s = computePerformance(trades, new Date("2026-06-06T00:00:00Z"));
  test("closedTrades counts all closed", () => assert(s.closedTrades === 5, "closed"));
  test("wins = 2", () => assert(s.wins === 2, `wins=${s.wins}`));
  test("losses = 2", () => assert(s.losses === 2, `losses=${s.losses}`));
  test("breakEven = 1", () => assert(s.breakEven === 1, `be=${s.breakEven}`));
  test("totalNet = 100", () => assert(s.totalNet === 100, `net=${s.totalNet}`));
  test("winRate = 2/4 = 0.5", () => assert(s.winRate === 0.5, `wr=${s.winRate}`));
  test("profitFactor = 160/60", () =>
    assert(Math.abs((s.profitFactor ?? 0) - 2.6667) < 0.001, `pf=${s.profitFactor}`));
  test("avgWin = 80", () => assert(s.avgWin === 80, `avgWin=${s.avgWin}`));
  test("avgLoss = -30", () => assert(s.avgLoss === -30, `avgLoss=${s.avgLoss}`));
  test("bestTrade = 100", () => assert(s.bestTrade === 100, `best=${s.bestTrade}`));
  test("worstTrade = -40", () => assert(s.worstTrade === -40, `worst=${s.worstTrade}`));
}

console.log("\n[3] Max drawdown is the deepest peak-to-trough drop");
{
  // Cumulative: 100, 60, 120, 100 -> deepest drop 100 -> 60 = -40.
  const trades: ClosedTradeLike[] = [
    trade({ net_pnl: 100, closed_at: "2026-06-01T15:00:00Z" }),
    trade({ net_pnl: -40, closed_at: "2026-06-02T15:00:00Z" }),
    trade({ net_pnl: 60, closed_at: "2026-06-03T15:00:00Z" }),
    trade({ net_pnl: -20, closed_at: "2026-06-04T15:00:00Z" }),
  ];
  const s = computePerformance(trades);
  test("maxDrawdown = -40", () => assert(s.maxDrawdown === -40, `dd=${s.maxDrawdown}`));
  test("equity curve is cumulative", () => {
    assert(s.equityCurve.length === 4, "len");
    assert(s.equityCurve[0].value === 100, "p0");
    assert(s.equityCurve[3].value === 100, "p3");
  });
}

console.log("\n[4] Day / ISO-week / month bucketing is UTC");
{
  // now = Wed 2026-06-10. Trade on the same day, same ISO week, same month,
  // and one in the previous month.
  const trades: ClosedTradeLike[] = [
    trade({ net_pnl: 30, closed_at: "2026-06-10T09:00:00Z" }),
    trade({ net_pnl: 20, closed_at: "2026-06-08T09:00:00Z" }), // Mon, same week
    trade({ net_pnl: 10, closed_at: "2026-05-20T09:00:00Z" }), // prev month
  ];
  const s = computePerformance(trades, new Date("2026-06-10T20:00:00Z"));
  test("day = 30", () => assert(s.realized.day === 30, `day=${s.realized.day}`));
  test("week = 50", () => assert(s.realized.week === 50, `week=${s.realized.week}`));
  test("month = 50", () => assert(s.realized.month === 50, `month=${s.realized.month}`));
  test("allTime = 60", () => assert(s.realized.allTime === 60, `all=${s.realized.allTime}`));
}

console.log("\n[5] Calendar groups by UTC day; commission sums");
{
  const trades: ClosedTradeLike[] = [
    trade({ net_pnl: 25, commission: 5, closed_at: "2026-06-01T10:00:00Z" }),
    trade({ net_pnl: -5, commission: 5, closed_at: "2026-06-01T18:00:00Z" }),
    trade({ net_pnl: 40, commission: 5, closed_at: "2026-06-02T10:00:00Z" }),
  ];
  const s = computePerformance(trades);
  test("calendar has 2 days", () => assert(s.calendar.length === 2, `len=${s.calendar.length}`));
  test("day 1 nets 20 across 2 trades", () => {
    const d = s.calendar.find((c) => c.date === "2026-06-01");
    assert(!!d && d.pnl === 20 && d.trades === 2, JSON.stringify(d));
  });
  test("totalCommission = 15", () => assert(s.totalCommission === 15, `c=${s.totalCommission}`));
}

console.log("\n[6] Open trades are excluded from stats but counted separately");
{
  const trades: ClosedTradeLike[] = [
    trade({ net_pnl: 50 }),
    trade({ net_pnl: 0, status: "open", closed_at: null, exit_price: null }),
  ];
  const s = computePerformance(trades);
  test("closedTrades = 1", () => assert(s.closedTrades === 1, "closed"));
  test("openTrades = 1", () => assert(s.openTrades === 1, `open=${s.openTrades}`));
  test("totalNet only counts closed", () => assert(s.totalNet === 50, `net=${s.totalNet}`));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) Deno.exit(1);
