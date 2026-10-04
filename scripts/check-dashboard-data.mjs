#!/usr/bin/env node
/**
 * Dashboard data gate — "no invented numbers".
 *
 * Two things are checked:
 *  1. STATIC: the real dashboard surfaces (Dashboard.tsx, terminal/PerformancePanel.tsx)
 *     contain no hardcoded performance figure (+12.4% / -2.1% / -4.2% /
 *     $25,000 / hardcoded monthly-return arrays / hardcoded chart series), and
 *     the terminal renders an explicit empty state instead of a demo curve.
 *  2. BEHAVIOUR: for a REAL user (no closed trades) the pure resolvers return
 *     an explicit empty state — never a made-up figure — and for a user WITH
 *     trades they return the real, computed values.
 *
 * Exits non-zero on any violation. Read-only.
 *
 * Usage: node scripts/check-dashboard-data.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  resolvePerformanceSummary,
  resolveTransactions,
  resolveAuditLog,
} from '../src/lib/dashboardData.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

let failures = 0;
function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${name}`);
  } else {
    failures++;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

console.log('\n[1] No hardcoded performance figure in the real dashboard');
const dashboard = read('src/pages/Dashboard.tsx');
const chart = read('src/components/terminal/PerformancePanel.tsx');

const invented = [
  ['+12.4%', /\+12\.4%/],
  ['-2.1%', /-2\.1%/],
  ['-4.2%', /-4\.2%/],
  ['$25,000.00', /\$25,000\.00/],
  ['+3,240 / 3240 profit literal', /convertPrice\(3240\)/],
  ['monthly returns array', /\[2\.1,\s*1\.8,\s*-0\.4,\s*3\.2,\s*2\.8,\s*1\.9\]/],
  ['mockTransactions', /mockTransactions/],
  ['mockAuditLog', /mockAuditLog/],
  ['mockSecurityLog', /mockSecurityLog/],
];
for (const [label, re] of invented) {
  check(`Dashboard.tsx has no ${label}`, !re.test(dashboard));
}
check('PerformancePanel.tsx has no +12.4% badge', !/\+12\.4%/.test(chart));
check('PerformancePanel.tsx takes a `stats` prop', /stats:\s*PerformanceStats/.test(chart));
check('PerformancePanel.tsx has a no-data empty state',
  chart.includes('terminal.performanceEmpty'));
check('PerformancePanel has no hardcoded sample series',
  !/SAMPLE|Jan.*value:\s*2000/.test(chart));

console.log('\n[2] A real user with no trades gets an explicit empty state');
const empty = resolvePerformanceSummary({ services: [{ balance: 0 }], trades: [] });
check('hasData is false', empty.hasData === false);
check('totalProfit is 0 (not a fake percentage)', empty.totalProfit === 0);
check('maxDrawdown is null', empty.maxDrawdown === null);
check('growthSeries is empty (no chart)', Array.isArray(empty.growthSeries) && empty.growthSeries.length === 0);
check('monthlyReturns is empty', empty.monthlyReturns.length === 0);
check('balance is the real (zero) sum', empty.totalBalance === 0);

console.log('\n[3] A real user with trades gets the REAL computed values');
const trades = [
  { root_symbol: 'ES', symbol: 'ESZ5', side: 'long', quantity: 2, entry_price: 5000, exit_price: 5010, opened_at: '2026-05-02T14:00:00Z', closed_at: '2026-05-02T14:30:00Z', net_pnl: 100, status: 'closed' },
  { root_symbol: 'ES', symbol: 'ESZ5', side: 'short', quantity: 1, entry_price: 5020, exit_price: 5030, opened_at: '2026-06-10T14:00:00Z', closed_at: '2026-06-10T14:20:00Z', net_pnl: -60, status: 'closed' },
  { root_symbol: 'NQ', symbol: 'NQZ5', side: 'long', quantity: 1, entry_price: 18000, exit_price: null, opened_at: '2026-06-11T14:00:00Z', closed_at: null, net_pnl: 0, status: 'open' },
];
const real = resolvePerformanceSummary({ services: [{ balance: 1000 }], trades });
check('hasData is true', real.hasData === true);
check('totalProfit = 100 + (-60) = 40', real.totalProfit === 40);
check('maxDrawdown = -60 (peak 100 -> trough 40)', real.maxDrawdown === -60);
check('growthSeries has one point per closed trade', real.growthSeries.length === 2);
check('growthSeries is cumulative realized PnL', real.growthSeries[0].value === 100 && real.growthSeries[1].value === 40);
check('monthlyReturns groups by close month', real.monthlyReturns.length === 2);
check('balance is the real sum', real.totalBalance === 1000);

console.log('\n[4] Lists never invent rows');
check('no withdrawals -> no transactions', resolveTransactions([]).length === 0);
check('no trades -> no audit rows', resolveAuditLog([]).length === 0);
const tx = resolveTransactions([{ id: 'w1', amount_cents: 5000, currency: 'USD', method: 'crypto', status: 'pending', created_at: '2026-06-10T00:00:00Z' }]);
check('a real withdrawal renders its real amount', tx.length === 1 && tx[0].amount === 50);
const audit = resolveAuditLog(trades);
check('audit log renders real trades only', audit.length === 3);

console.log(
  failures === 0
    ? '\ndashboard data check passed'
    : `\ndashboard data check FAILED (${failures})`,
);
process.exit(failures === 0 ? 0 : 1);
