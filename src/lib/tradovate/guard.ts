// ============================================================================
// Connect-gate routing logic (pure, unit-tested).
//
// Kept free of React/DOM so the same decision can be asserted in Deno tests and
// reused by the router guard and the login redirect.
// ============================================================================

export interface GateState {
  /** The status lookup is still in flight. */
  loading: boolean;
  /** REQUIRE_TRADOVATE_CONNECTION (default ON). */
  required: boolean;
  /** The user has at least one non-revoked connection. */
  connected: boolean;
}

export const CONNECT_GATE_PATH = "/connect-tradovate";
export const DASHBOARD_PATH = "/dashboard";

/**
 * True when the dashboard must not render for this state. While loading we
 * block as well, so a direct URL never flashes dashboard content before the
 * connection check resolves.
 */
export function shouldBlockDashboard(state: GateState): boolean {
  if (!state.required) return false;
  if (state.loading) return true;
  return !state.connected;
}

/** Where to send a user immediately after a successful Braxel login. */
export function postLoginPath(
  state: GateState,
  from?: string | null,
): string {
  if (state.required && !state.connected) return CONNECT_GATE_PATH;
  return from || DASHBOARD_PATH;
}

/**
 * Where the gate screen should redirect once satisfied. A returning user with
 * a valid connection skips straight to the dashboard.
 */
export function postGatePath(state: GateState, from?: string | null): string {
  if (shouldBlockDashboard(state)) return CONNECT_GATE_PATH;
  return from || DASHBOARD_PATH;
}
