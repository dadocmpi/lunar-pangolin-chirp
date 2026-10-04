// ============================================================================
// First-run welcome decision (pure, no React/env deps so it is unit-testable).
//
// The dashboard shows the Tradovate welcome screen ONLY when the server
// confirms it: TRADOVATE_ENABLED is not "false", the user is not connected and
// has neither skipped nor ever connected. Everything else — including a failed
// status call, an unexpected payload, or a missing `welcome` block — resolves
// to "no welcome screen" so the app fails open to the NORMAL dashboard.
// ============================================================================

export interface WelcomeResolution {
  show: boolean;
  skipped: boolean;
}

const HIDDEN: WelcomeResolution = { show: false, skipped: false };

/**
 * Resolve the welcome state from a tradovate-status payload.
 *
 * FAIL-OPEN: `null`/`undefined`/non-object input (request failed, empty body)
 * and any malformed payload return `{ show: false }`. `show` additionally
 * requires the server flag `enabled !== false`, no integration in the payload,
 * and `welcome.show === true` (strict, so an older deploy without a `welcome`
 * block never shows the screen).
 */
export function resolveWelcome(data: unknown): WelcomeResolution {
  if (!data || typeof data !== "object") return HIDDEN;
  const d = data as Record<string, unknown>;

  // TRADOVATE_ENABLED=false: never show the welcome screen.
  if (d.enabled === false) return HIDDEN;

  const integrations = Array.isArray(d.integrations) ? d.integrations : [];
  if (integrations.length > 0) return HIDDEN;

  const welcome = d.welcome;
  if (!welcome || typeof welcome !== "object") return HIDDEN;
  const w = welcome as { show?: unknown; skipped?: unknown };

  const skipped = w.skipped === true;
  // The server computes `show` from enabled && !connected && !everConnected &&
  // !skipped; require the strict boolean so a broken response hides the screen.
  return { show: w.show === true, skipped };
}
