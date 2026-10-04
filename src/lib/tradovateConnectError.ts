// ============================================================================
// tradovateConnectError — pure classifier for the Tradovate connect panel.
//
// The panel used to show ONE generic message ("Could not reach Tradovate. Check
// your connection and try again.") for every failure. That is wrong when OUR
// Edge Function is the thing that is unreachable (404 / not deployed / 5xx /
// timeout): the user's internet is fine and Tradovate is fine.
//
// This module separates the real cases:
//   1. service_unavailable   our service (network failure, 404, 5xx, timeout)
//   2. offline               navigator.onLine === false (only then blame the net)
//   3. invalid_credentials   Tradovate rejected the username/password
//   4. tradovate_unreachable Tradovate itself is unreachable
//   5. rate_limited          Tradovate rate limit (p-ticket)
//   6. circuit_open          Tradovate asked for a captcha (p-captcha)
//   7. api_disabled          account without API access
//
// Pure and dependency-free so it can be unit-tested from Node and Deno.
// ============================================================================

export type ConnectErrorCode =
  | "service_unavailable"
  | "offline"
  | "invalid_credentials"
  | "tradovate_unreachable"
  | "rate_limited"
  | "circuit_open"
  | "api_disabled"
  | "session_expired"
  | "unexpected"
  | "missing_credentials"
  | "invalid_environment"
  | "encryption_not_configured";

export interface ConnectErrorInput {
  /** fetch() itself threw (network failure, DNS, CORS, timeout/abort). */
  networkError?: boolean;
  /** HTTP status returned by OUR Edge Function, when a response arrived. */
  status?: number | null;
  /** `code` from our Edge Function JSON body, when present. */
  serverCode?: string | null;
  /** navigator.onLine at the moment of failure. */
  online?: boolean;
}

/** Server auth codes that describe Tradovate, not our service. */
const SERVER_CODE_MAP: Record<string, ConnectErrorCode> = {
  invalid_credentials: "invalid_credentials",
  api_disabled: "api_disabled",
  rate_limited: "rate_limited",
  circuit_open: "circuit_open",
  transport: "tradovate_unreachable",
  encryption_not_configured: "encryption_not_configured",
  missing_credentials: "missing_credentials",
  invalid_environment: "invalid_environment",
};

/**
 * Decide which accurate message the user should see. Our own service being
 * unreachable is NEVER reported as a Tradovate or user-network problem.
 */
export function classifyConnectError(input: ConnectErrorInput): ConnectErrorCode {
  const { networkError, status, serverCode, online } = input;

  // The request never produced an HTTP response: either we are genuinely
  // offline, or our Edge Function could not be reached.
  if (networkError) {
    return online === false ? "offline" : "service_unavailable";
  }

  // A response arrived from our Edge Function. A 404/5xx means our function is
  // missing or broken — not a credential or Tradovate problem.
  if (status === 404 || (typeof status === "number" && status >= 500)) {
    return "service_unavailable";
  }
  // Our function rejected the Braxel session (not Tradovate).
  if (status === 401 || status === 403) {
    return "session_expired";
  }

  if (serverCode && SERVER_CODE_MAP[serverCode]) {
    return SERVER_CODE_MAP[serverCode];
  }

  return "unexpected";
}
