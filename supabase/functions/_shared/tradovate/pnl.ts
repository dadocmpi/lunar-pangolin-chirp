// ============================================================================
// Isomorphic PnL engine.
//
// Pure TypeScript with no Deno/Node/DOM APIs: the same file runs inside the
// sync Edge Function and in the browser (src/lib/tradovate/pnl.ts re-exports
// it). That guarantees the dashboard and the persisted trades agree.
//
// Responsibilities:
//   * FIFO and weighted-average matching of fills into round-trip trades.
//   * partial closes, position flips (a closing fill larger than the open
//     position leaves a residual position in the opposite direction).
//   * per-contract point value, including micros (MNQ, MES, MGC, MCL, ...).
//   * per-account commission attribution.
//   * duplicate and out-of-order fill tolerance.
//   * contract rollover: matching is keyed by (account, contract), so a new
//     contract month never nets against the expiring one.
//   * timezone safety: ordering and dates are UTC; naive timestamps are UTC.
//
// NOT YET VERIFIED against real Tradovate fill data.
// ============================================================================

export type FillAction = "Buy" | "Sell";
export type MatchMethod = "fifo" | "weighted_average";

export interface PnlFill {
  /** tradovateFillId — unique per integration. */
  id: number;
  contractId: number | null;
  accountId: number | null;
  /** ISO-8601 UTC. */
  timestamp: string;
  action: FillAction | null;
  /** Absolute quantity (always positive). */
  quantity: number;
  price: number;
  /** Total commission reported for this fill, if any. */
  commission?: number;
  /** Inactive/voided fills are ignored. */
  active?: boolean;
}

export interface ContractInfo {
  root: string;
  symbol?: string;
  /** USD per 1.00 of price movement, per contract. */
  pointValue?: number;
}

export interface PnlEngineOptions {
  resolveContract: (contractId: number | null) => ContractInfo | null;
  method?: MatchMethod;
  /** Fallback commission per contract when a fill carries none. */
  commissionPerContract?: number | ((accountId: number | null) => number);
  defaultPointValue?: number;
}

export interface ReconstructedTrade {
  dedupeKey: string;
  root: string;
  symbol?: string;
  accountId: number | null;
  side: "long" | "short";
  quantity: number;
  entryPrice: number;
  exitPrice: number | null;
  openedAt: string;
  closedAt: string | null;
  realizedPnl: number;
  commission: number;
  netPnl: number;
  status: "open" | "closed";
  fillIds: number[];
}

/**
 * Point value (USD per 1.00 price move) per contract root. Micros are one
 * tenth of their full-size sibling for the equity-index products, and the
 * metals/energy micros follow the exchange's own ratios.
 */
export const POINT_VALUES: Record<string, number> = {
  ES: 50,
  MES: 5,
  NQ: 20,
  MNQ: 2,
  YM: 5,
  MYM: 0.5,
  RTY: 50,
  M2K: 5,
  GC: 100,
  MGC: 10,
  SI: 5000,
  SIL: 1000,
  HG: 25000,
  CL: 1000,
  MCL: 100,
  NG: 10000,
  MNG: 1000,
  ZB: 1000,
  ZN: 1000,
  ZF: 1000,
  ZT: 1000,
  "6E": 125000,
  "6B": 62500,
  "6J": 12500000,
  ZC: 50,
  ZS: 50,
  ZW: 50,
};

/** Resolve a point value for a root, with a configurable fallback. */
export function pointValueFor(root: string, fallback = 1): number {
  const key = (root ?? "").toUpperCase();
  return POINT_VALUES[key] ?? fallback;
}

/**
 * Best-effort root extraction from a Tradovate contract symbol such as
 * "NQZ5", "MNQH6", "MESZ5": strips the trailing month code + year.
 */
export function rootFromSymbol(symbol: string): string {
  const s = (symbol ?? "").toUpperCase();
  const m = s.match(/^([A-Z0-9]{1,4}?)([FGHJKMNQUVXZ])(\d{1,2})$/);
  return m ? m[1] : s;
}

/** UTC date (YYYY-MM-DD) from an ISO timestamp; null when unparseable. */
export function utcDate(iso: string): string | null {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Date(t).toISOString().slice(0, 10);
}

interface OpenLot {
  qty: number;
  price: number;
  commissionPerUnit: number;
}

interface PositionState {
  side: "long" | "short";
  lots: OpenLot[];
  avgEntry: number;
  avgCommissionPerUnit: number;
}

interface WorkingTrade {
  root: string;
  symbol?: string;
  accountId: number | null;
  side: "long" | "short";
  quantity: number;
  entryPrice: number;
  exitPrice: number | null;
  openedAt: string;
  closedAt: string | null;
  realizedPnl: number;
  commission: number;
  fillIds: number[];
  closedQty: number;
}

function commissionFor(fill: PnlFill, opts: PnlEngineOptions): number {
  if (fill.commission && fill.commission > 0) return fill.commission;
  const cpc = opts.commissionPerContract;
  if (typeof cpc === "function") return cpc(fill.accountId) * fill.quantity;
  if (typeof cpc === "number") return cpc * fill.quantity;
  return 0;
}

/**
 * Reconstruct round-trip trades from a set of fills.
 *
 * Fills are de-duplicated by id (last occurrence wins), inactive/voided fills
 * dropped, then sorted by (timestamp, id) so out-of-order input still yields
 * the same result.
 */
export function reconstructTrades(
  fills: PnlFill[],
  opts: PnlEngineOptions,
): ReconstructedTrade[] {
  const method = opts.method ?? "fifo";
  const defaultPv = opts.defaultPointValue ?? 1;

  const byId = new Map<number, PnlFill>();
  for (const f of fills) {
    if (!f || !Number.isFinite(f.id)) continue;
    if (f.active === false) continue;
    if (f.action !== "Buy" && f.action !== "Sell") continue;
    if (!(f.quantity > 0)) continue;
    byId.set(f.id, f);
  }
  const ordered = [...byId.values()].sort((a, b) => {
    const ta = Date.parse(a.timestamp);
    const tb = Date.parse(b.timestamp);
    const na = Number.isFinite(ta) ? ta : 0;
    const nb = Number.isFinite(tb) ? tb : 0;
    return na - nb || a.id - b.id;
  });

  const positions = new Map<string, PositionState>();
  const working = new Map<string, WorkingTrade>();
  const out: ReconstructedTrade[] = [];

  for (const fill of ordered) {
    const contract = opts.resolveContract(fill.contractId);
    const root = contract?.root ?? "UNKNOWN";
    const symbol = contract?.symbol;
    const pv = contract?.pointValue ?? pointValueFor(root, defaultPv);
    const key = `${fill.accountId ?? "na"}:${fill.contractId ?? root}`;
    const dir: "long" | "short" = fill.action === "Buy" ? "long" : "short";
    const fillCommPerUnit = commissionFor(fill, opts) / fill.quantity;

    let pos = positions.get(key);
    if (!pos || pos.side === dir) {
      if (!pos) {
        pos = { side: dir, lots: [], avgEntry: 0, avgCommissionPerUnit: 0 };
        positions.set(key, pos);
      }
      pos.lots.push({
        qty: fill.quantity,
        price: fill.price,
        commissionPerUnit: fillCommPerUnit,
      });
      updateWeighted(pos);

      let trade = working.get(key);
      if (!trade) {
        trade = newWorkingTrade(fill, root, symbol, dir);
        working.set(key, trade);
      }
      trade.fillIds.push(fill.id);
      trade.quantity += fill.quantity;
      trade.entryPrice = pos.avgEntry;
      continue;
    }

    // Opposite side: close against the open position.
    let remaining = fill.quantity;
    let realized = 0;
    let commission = 0;
    // PnL sign follows the OPEN position's side, not the closing fill's
    // direction: a Sell closing a long is still (exit - entry) * qty * pv.
    const sign = pos.side === "long" ? 1 : -1;

    if (method === "weighted_average") {
      const openQty = pos.lots.reduce((s, l) => s + l.qty, 0);
      const qty = Math.min(remaining, openQty);
      realized += sign * (fill.price - pos.avgEntry) * qty * pv;
      commission += (pos.avgCommissionPerUnit + fillCommPerUnit) * qty;
      remaining -= qty;
      scaleLots(pos, qty);
    } else {
      for (const lot of pos.lots) {
        if (remaining <= 0) break;
        const qty = Math.min(remaining, lot.qty);
        if (qty <= 0) continue;
        realized += sign * (fill.price - lot.price) * qty * pv;
        commission += (lot.commissionPerUnit + fillCommPerUnit) * qty;
        lot.qty -= qty;
        remaining -= qty;
      }
      pos.lots = pos.lots.filter((l) => l.qty > 0);
    }

    const closedQty = fill.quantity - remaining;
    const trade = working.get(key);
    if (trade && closedQty > 0) {
      trade.fillIds.push(fill.id);
      trade.closedQty += closedQty;
      trade.realizedPnl += realized;
      trade.commission += commission;
      trade.exitPrice = fill.price;
      trade.closedAt = fill.timestamp;
      // Emit as soon as it is fully closed, before any residual flip replaces
      // the per-key working trade.
      if (trade.closedQty >= trade.quantity) {
        out.push(toReconstructedTrade(trade, true));
        working.delete(key);
      }
    }

    if (remaining > 0) {
      // Flip: residual opens a new position on the opposite side.
      pos.side = dir;
      pos.lots = [{
        qty: remaining,
        price: fill.price,
        commissionPerUnit: fillCommPerUnit,
      }];
      updateWeighted(pos);
      const flip = newWorkingTrade(fill, root, symbol, dir);
      flip.fillIds.push(fill.id);
      flip.quantity = remaining;
      working.set(key, flip);
    } else if (pos.lots.length === 0) {
      positions.delete(key);
    } else {
      updateWeighted(pos);
    }
  }

  for (const w of working.values()) {
    out.push(toReconstructedTrade(w, false));
  }
  return out.sort((a, b) => Date.parse(a.openedAt) - Date.parse(b.openedAt));
}

function newWorkingTrade(
  fill: PnlFill,
  root: string,
  symbol: string | undefined,
  side: "long" | "short",
): WorkingTrade {
  return {
    root,
    symbol,
    accountId: fill.accountId,
    side,
    quantity: 0,
    entryPrice: fill.price,
    exitPrice: null,
    openedAt: fill.timestamp,
    closedAt: null,
    realizedPnl: 0,
    commission: 0,
    fillIds: [],
    closedQty: 0,
  };
}

function updateWeighted(pos: PositionState): void {
  const qty = pos.lots.reduce((s, l) => s + l.qty, 0);
  if (qty === 0) {
    pos.avgEntry = 0;
    pos.avgCommissionPerUnit = 0;
    return;
  }
  pos.avgEntry = pos.lots.reduce((s, l) => s + l.price * l.qty, 0) / qty;
  pos.avgCommissionPerUnit =
    pos.lots.reduce((s, l) => s + l.commissionPerUnit * l.qty, 0) / qty;
}

function scaleLots(pos: PositionState, qty: number): void {
  let remaining = qty;
  for (const lot of pos.lots) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, lot.qty);
    lot.qty -= take;
    remaining -= take;
  }
  pos.lots = pos.lots.filter((l) => l.qty > 0);
  updateWeighted(pos);
}

function toReconstructedTrade(
  w: WorkingTrade,
  closed: boolean,
): ReconstructedTrade {
  const fillIds = [...w.fillIds].sort((a, b) => a - b);
  const dedupeKey = [
    w.accountId ?? "na",
    w.root,
    w.side,
    fillIds.join("."),
  ].join(":");
  const realizedPnl = round2(w.realizedPnl);
  const commission = round2(w.commission);
  return {
    dedupeKey,
    root: w.root,
    symbol: w.symbol,
    accountId: w.accountId,
    side: w.side,
    quantity: w.quantity,
    entryPrice: round8(w.entryPrice),
    exitPrice: closed && w.exitPrice !== null ? round8(w.exitPrice) : null,
    openedAt: w.openedAt,
    closedAt: closed ? w.closedAt : null,
    realizedPnl,
    commission,
    netPnl: round2(realizedPnl - commission),
    status: closed ? "closed" : "open",
    fillIds,
  };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function round8(n: number): number {
  return Math.round((n + Number.EPSILON) * 1e8) / 1e8;
}
