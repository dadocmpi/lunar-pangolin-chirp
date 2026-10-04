// ============================================================================
// Tradovate auth service.
//
// Exchanges username/password + app cid/sec for a short-lived Bearer token at
//   POST {host}/auth/accesstokenrequest
// and renews it ahead of expiry with a safety margin.
//
// Endpoints (documented, NOT YET VERIFIED against the live service):
//   demo: https://demo.tradovateapi.com/v1
//   live: https://live.tradovateapi.com/v1
//
// SECURITY: this module never logs the password, cid, sec or the returned
// access token. Failures are reduced to a safe code + message.
// ============================================================================

import { TradovateHttpError, requestJson } from "./http.ts";
import {
  CircuitOpenError,
  createDefaultLimiter,
  TradovateRateLimiter,
} from "./rateLimiter.ts";
import type {
  TradovateAuthResult,
  TradovateCredentials,
  TradovateEnvironment,
} from "./types.ts";

export const TRADOVATE_HOSTS: Record<TradovateEnvironment, string> = {
  demo: "https://demo.tradovateapi.com/v1",
  live: "https://live.tradovateapi.com/v1",
};

/** Renew this many ms before the reported expiry. */
export const TOKEN_RENEW_MARGIN_MS = 5 * 60 * 1000;

export function hostFor(env: TradovateEnvironment): string {
  return TRADOVATE_HOSTS[env];
}

/** True when a token is absent/expired or inside the renewal margin. */
export function needsRenewal(
  expirationTime: string | null | undefined,
  nowMs: number = Date.now(),
  marginMs: number = TOKEN_RENEW_MARGIN_MS,
): boolean {
  if (!expirationTime) return true;
  const expiry = Date.parse(expirationTime);
  if (!Number.isFinite(expiry)) return true;
  return expiry - nowMs <= marginMs;
}

export interface AuthenticateOptions {
  credentials: TradovateCredentials;
  environment: TradovateEnvironment;
  limiter?: TradovateRateLimiter;
  fetchImpl?: typeof fetch;
  now?: () => number;
  marginMs?: number;
}

/**
 * Request a fresh access token. Never throws for expected failures — returns
 * a discriminated TradovateAuthResult so callers can map it to a UI state.
 */
export async function authenticate(
  opts: AuthenticateOptions,
): Promise<TradovateAuthResult> {
  const limiter = opts.limiter ?? createDefaultLimiter();
  const { credentials, environment } = opts;
  const url = `${hostFor(environment)}/auth/accesstokenrequest`;

  const body: Record<string, unknown> = {
    name: credentials.name,
    password: credentials.password,
  };
  if (credentials.cid) body.cid = credentials.cid;
  if (credentials.sec) body.sec = credentials.sec;
  if (credentials.deviceId) body.deviceId = credentials.deviceId;
  if (credentials.appId) body.appId = credentials.appId;
  if (credentials.appVersion) body.appVersion = credentials.appVersion;

  try {
    const data = await requestJson<Record<string, unknown>>({
      url,
      limiter,
      fetchImpl: opts.fetchImpl,
      body,
    });

    const accessToken = typeof data?.accessToken === "string"
      ? data.accessToken
      : null;
    if (!accessToken) {
      return {
        ok: false,
        code: "unexpected",
        message: "Tradovate returned no access token",
      };
    }
    return {
      ok: true,
      accessToken,
      expirationTime: String(data.expirationTime ?? ""),
      userId: Number(data.userId ?? 0),
      name: String(data.name ?? credentials.name),
    };
  } catch (err) {
    return classifyAuthError(err);
  }
}

/** Map a transport failure to a safe, UI-consumable auth result. */
export function classifyAuthError(err: unknown): TradovateAuthResult {
  if (err instanceof CircuitOpenError) {
    return {
      ok: false,
      code: "circuit_open",
      message: "Tradovate asked for a captcha; retry in about an hour",
      retryAfterMs: err.retryAfterMs,
    };
  }
  if (err instanceof TradovateHttpError) {
    const text = extractErrorText(err.body);
    if (err.status === 401) {
      return {
        ok: false,
        code: "invalid_credentials",
        message: text ?? "Tradovate rejected the username or password",
      };
    }
    if (err.status === 403 || /api access|not enabled|entitlement/i.test(text ?? "")) {
      return {
        ok: false,
        code: "api_disabled",
        message: text ?? "API access is not enabled for this account",
      };
    }
    if (err.status === 429) {
      return {
        ok: false,
        code: "rate_limited",
        message: "Tradovate rate limit reached",
      };
    }
    return {
      ok: false,
      code: "unexpected",
      message: text ?? `Tradovate returned HTTP ${err.status}`,
    };
  }
  return {
    ok: false,
    code: "transport",
    message: "Could not reach Tradovate",
  };
}

/** Extract a provider error string without leaking secrets. */
export function extractErrorText(body: unknown): string | null {
  if (!body) return null;
  if (typeof body === "string") return body.slice(0, 200);
  if (typeof body === "object") {
    const rec = body as Record<string, unknown>;
    for (const key of ["errorText", "error", "message", "detail"]) {
      const v = rec[key];
      if (typeof v === "string" && v) return v.slice(0, 200);
    }
  }
  return null;
}

/**
 * Ensure a usable token: reuse a still-fresh one, otherwise authenticate.
 * `stored` is the previously cached token/expiry (may be null).
 */
export async function ensureToken(
  opts: AuthenticateOptions & {
    stored?: { accessToken: string; expirationTime: string } | null;
  },
): Promise<TradovateAuthResult> {
  const now = opts.now ?? (() => Date.now());
  if (
    opts.stored?.accessToken &&
    !needsRenewal(opts.stored.expirationTime, now(), opts.marginMs)
  ) {
    return {
      ok: true,
      accessToken: opts.stored.accessToken,
      expirationTime: opts.stored.expirationTime,
      userId: 0,
      name: opts.credentials.name,
    };
  }
  return authenticate(opts);
}
