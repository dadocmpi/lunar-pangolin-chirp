// ============================================================================
// Execution kill switch.
//
// This phase ships NO execution capability: no order placement, no order
// modification, no liquidation, no payout/withdrawal/ACH/wire/money transfer.
// The switch exists so a future, separately reviewed execution contract has a
// server-side boundary from day one.
//
// The default is OFF — unlike the other feature switches, which default ON.
// Only the exact string "true" enables it, so a missing secret, a typo or an
// empty value all keep execution disabled. There is no client-side equivalent:
// the server is the only authority, and the public config reports the value
// purely for display.
// ============================================================================

export interface ExecutionEnv {
  EXECUTION_ENABLED?: string;
}

/** Execution is enabled ONLY for the exact string "true". Default OFF. */
export function isExecutionEnabled(value: string | undefined): boolean {
  return value === "true";
}

export function executionEnabledFromEnv(): boolean {
  return isExecutionEnabled(Deno.env.get("EXECUTION_ENABLED") ?? undefined);
}

export class ExecutionDisabledError extends Error {
  constructor() {
    super("execution_disabled");
    this.name = "ExecutionDisabledError";
  }
}

/** Throws unless execution is explicitly enabled. Call before any execution. */
export function assertExecutionEnabled(value: string | undefined): void {
  if (!isExecutionEnabled(value)) throw new ExecutionDisabledError();
}

/** Canonical fail-closed body for a disabled execution capability. */
export function executionDisabledBody(): Record<string, unknown> {
  return {
    ok: false,
    error: "execution_disabled",
    feature: "execution",
    message: "Execution is disabled by its runtime switch.",
  };
}
