// ============================================================================
// Tradovate environment policy (server-side).
//
// The connect panel only ever offers DEMO right now, but the UI is not a
// boundary: a crafted request could still ask for "live". The server therefore
// decides which environments are allowed, from the Edge Function secret
// TRADOVATE_ALLOWED_ENVIRONMENTS (a comma-separated list).
//
//   unset / empty      -> ["demo"]            (live disabled by default)
//   "demo"             -> ["demo"]
//   "demo,live"        -> ["demo", "live"]    (re-enable live, no code change)
//
// Anything that is not an explicitly allowed environment is rejected. This is
// the same "fail closed" posture as the payments flag: the server is the
// security boundary, the UI only decides what renders.
// ============================================================================

import type { TradovateEnvironment } from "./types.ts";

export const KNOWN_ENVIRONMENTS: readonly TradovateEnvironment[] = ["demo", "live"];
export const DEFAULT_ALLOWED_ENVIRONMENTS: readonly TradovateEnvironment[] = ["demo"];

export type TradovateEnvReader = (key: string) => string | undefined;

/**
 * Parse the allow-list. Unknown tokens are ignored (never silently widened to a
 * real environment); an empty/unset value falls back to demo-only.
 */
export function parseAllowedEnvironments(raw: string | undefined): TradovateEnvironment[] {
  const tokens = (raw ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .filter((t): t is TradovateEnvironment =>
      (KNOWN_ENVIRONMENTS as readonly string[]).includes(t)
    );
  const unique = [...new Set(tokens)];
  return unique.length > 0 ? unique : [...DEFAULT_ALLOWED_ENVIRONMENTS];
}

/** The environments allowed for this deployment. */
export function allowedEnvironments(
  env: TradovateEnvReader = (k) => Deno.env.get(k),
): TradovateEnvironment[] {
  return parseAllowedEnvironments(env("TRADOVATE_ALLOWED_ENVIRONMENTS"));
}

/**
 * Decide whether a request's environment may proceed. `requested` is raw input,
 * so it is validated first (a malformed value is `invalid_environment`, not an
 * accidental pass) and only then checked against the allow-list.
 */
export type EnvironmentDecision =
  | { ok: true; environment: TradovateEnvironment; allowed: TradovateEnvironment[] }
  | {
    ok: false;
    code: "invalid_environment" | "environment_not_allowed";
    message: string;
    allowed: TradovateEnvironment[];
  };

export function resolveRequestedEnvironment(
  requested: unknown,
  env: TradovateEnvReader = (k) => Deno.env.get(k),
): EnvironmentDecision {
  const allowed = allowedEnvironments(env);
  if (requested !== "demo" && requested !== "live") {
    return {
      ok: false,
      code: "invalid_environment",
      message: "Choose a supported environment.",
      allowed,
    };
  }
  if (!allowed.includes(requested)) {
    return {
      ok: false,
      code: "environment_not_allowed",
      message: `The ${requested} environment is not enabled for this deployment.`,
      allowed,
    };
  }
  return { ok: true, environment: requested, allowed };
}
