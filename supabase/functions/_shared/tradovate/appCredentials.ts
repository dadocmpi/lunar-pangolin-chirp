// ============================================================================
// App-level Tradovate API credentials (cid/sec).
//
// How Tradovate's accessTokenRequest actually works for third-party tools:
//   POST {host}/auth/accesstokenrequest
//   { name, password, appId, appVersion, deviceId, cid, sec }
//
// `name`/`password` are the END USER's Tradovate login. `cid`/`sec` identify
// the SOFTWARE (the API key Tradovate issues to an app), so a normal customer
// only ever types username + password. `cid`/`sec` belong to the operator, not
// the customer.
//
// Tradovate's own docs show the request with `cid`/`sec` (their sample passes
// both), and the API-key flow (API Access add-on) is the documented way for a
// third-party app to authenticate. We therefore default to the operator's
// app-level cid/sec from Supabase Edge Function secrets and only fall back to a
// client-supplied pair when the operator has not configured one (an advanced
// setup path for shops that hand out per-app keys). A client-supplied pair
// always wins, so a user whose app is separate from ours is never blocked.
// ============================================================================

export interface AppCredentials {
  cid: string | undefined;
  sec: string | undefined;
  appId: string;
  appVersion: string;
  /** Which set is in effect, for logs/support (never includes the values). */
  source: "server" | "client" | "none";
}

/**
 * Resolve the cid/sec for a token request. Precedence:
 *   1. client-supplied cid/sec (advanced / per-app override)
 *   2. server secrets TRADOVATE_APP_CID / TRADOVATE_APP_SECRET
 *   3. none (fail — let the API decide whether it needs credentials)
 */
export function resolveAppCredentials(
  clientCid: string | undefined,
  clientSec: string | undefined,
  env: (k: string) => string | undefined = (k) => Deno.env.get(k),
): AppCredentials {
  const cid = clientCid?.trim() || env("TRADOVATE_APP_CID")?.trim() || undefined;
  const sec = clientSec?.trim() || env("TRADOVATE_APP_SECRET")?.trim() || undefined;
  const source: AppCredentials["source"] = clientCid || clientSec
    ? "client"
    : cid || sec
    ? "server"
    : "none";
  return {
    cid,
    sec,
    appId: env("TRADOVATE_APP_ID")?.trim() || "Braxel",
    appVersion: env("TRADOVATE_APP_VERSION")?.trim() || "1.3.0",
    source,
  };
}
