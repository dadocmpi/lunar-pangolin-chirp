// ============================================================================
// Shared Tradovate types.
//
// Everything here is deliberately runtime-agnostic (Deno Edge Functions, Node
// test runners) so the PnL engine and the services can be unit-tested without
// a database or network.
// ============================================================================

export type TradovateEnvironment = "demo" | "live";

/** Credentials the user types into the connect panel. Never logged. */
export interface TradovateCredentials {
  /** Tradovate account username (the `name` field in the auth request). */
  name: string;
  /** Tradovate account password. */
  password: string;
  /**
   * Advanced override: app API key pair supplied by the client. Normally
   * omitted — the app's own cid/sec come from server secrets
   * (TRADOVATE_APP_CID / TRADOVATE_APP_SECRET) via resolveAppCredentials().
   */
  cid?: string;
  sec?: string;
  /** Optional device id so Tradovate can distinguish sessions. */
  deviceId?: string;
  appId?: string;
  appVersion?: string;
}

/** Result of a successful /auth/accesstokenrequest. */
export interface TradovateAuthSuccess {
  ok: true;
  accessToken: string;
  /** ISO-8601 UTC expiry reported by Tradovate. */
  expirationTime: string;
  userId: number;
  name: string;
}

export type TradovateAuthErrorCode =
  | "invalid_credentials"
  | "api_disabled"
  | "rate_limited"
  | "circuit_open"
  | "transport"
  | "unexpected";

export interface TradovateAuthFailure {
  ok: false;
  code: TradovateAuthErrorCode;
  /** Safe, human-readable reason. Never contains the password or token. */
  message: string;
  /** When set, the caller should wait this long before retrying. */
  retryAfterMs?: number;
}

export type TradovateAuthResult = TradovateAuthSuccess | TradovateAuthFailure;

/** A fill normalized to our persistence shape. */
export interface TradovateFill {
  tradovateFillId: number;
  orderId: number | null;
  contractId: number | null;
  accountId: number | null;
  /** ISO-8601 UTC. Tradovate reports UTC; naive strings are treated as UTC. */
  timestamp: string;
  tradeDate: string | null;
  action: "Buy" | "Sell" | null;
  quantity: number;
  price: number;
  active: boolean;
  commission: number;
  /** The untouched provider payload, for audit and re-derivation. */
  raw: Record<string, unknown>;
}

/** Tradovate account as returned by /account/list. */
export interface TradovateAccount {
  id: number;
  name: string;
  userId: number;
  accountType?: string;
  active?: boolean;
  /** True when the account is a simulation (demo) account. */
  simulation?: boolean;
}
