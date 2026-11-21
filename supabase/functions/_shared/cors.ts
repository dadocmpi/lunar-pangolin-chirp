// ============================================================================
// CORS for the Edge Function surface.
//
// Default posture is unchanged (`*`) because every endpoint authenticates with
// a bearer token, never a cookie, so a cross-origin page cannot read a
// response without already holding the caller's token.
//
// Setting ALLOWED_ORIGINS (comma-separated, Edge Function secret) turns this
// into a strict allowlist: only those origins receive an
// `Access-Control-Allow-Origin` header. A disallowed origin gets no header at
// all, so the browser blocks the response. Example:
//
//   ALLOWED_ORIGINS=https://braxelmarkets.vercel.app,https://www.braxelmarkets.com
//
// Keep it unset for local development and Vercel preview deployments.
// ============================================================================

const ALLOW_HEADERS = "authorization, x-client-info, apikey, content-type";

export function parseAllowedOrigins(raw: string | null | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Resolve the ACAO value for a request.
 *
 * - No allowlist configured -> "*" (backwards compatible).
 * - Allowlist configured and the request Origin is listed -> echo that Origin.
 * - Otherwise -> null, meaning "send no ACAO header" (browser blocks the read).
 *
 * A request without an Origin header (server-to-server) is never granted an
 * allowlisted origin.
 */
export function resolveCorsOrigin(
  requestOrigin: string | null,
  allowed: string[],
): string | null {
  if (allowed.length === 0) return "*";
  if (!requestOrigin) return null;
  return allowed.includes(requestOrigin) ? requestOrigin : null;
}

function envAllowedOrigins(): string[] {
  const env = typeof Deno !== "undefined" ? Deno.env.get("ALLOWED_ORIGINS") : undefined;
  return parseAllowedOrigins(env);
}

/** Headers for a JSON response / preflight. Always includes `Vary: Origin`. */
export function corsHeadersFor(
  req: Request,
  methods = "GET, POST, OPTIONS",
): Record<string, string> {
  const origin = resolveCorsOrigin(
    req.headers.get("origin"),
    envAllowedOrigins(),
  );
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": ALLOW_HEADERS,
    "Access-Control-Allow-Methods": methods,
    Vary: "Origin",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

/** Preflight response for an OPTIONS request. */
export function corsPreflight(
  req: Request,
  methods = "GET, POST, OPTIONS",
): Response {
  return new Response(null, { status: 204, headers: corsHeadersFor(req, methods) });
}
