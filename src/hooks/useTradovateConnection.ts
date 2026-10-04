// ============================================================================
// useTradovateConnection — connection state for the gate.
//
// Calls the tradovate-status Edge Function with the user's JWT. The server
// derives the user id from the token; the client never sends a user id.
// Fails closed: any error leaves `connected` false so the gate holds.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { resolveWelcome } from "@/lib/tradovateWelcome";

export interface TradovateIntegration {
  id: string;
  environment: "demo" | "live";
  accountId: number;
  accountSpec: string | null;
  label: string | null;
  status: string;
  lastFillId: number;
  tokenExpiresAt: string | null;
}

export interface TradovateConnectionState {
  loading: boolean;
  connected: boolean;
  integrations: TradovateIntegration[];
  /** False when the server says the feature is switched off (TRADOVATE_ENABLED). */
  enabled: boolean;
  /**
   * True when the first-run welcome screen should replace the dashboard
   * content: feature on, no connection, and the user has not skipped. Strict
   * `=== true`, so a status response without a `welcome` block (older deploy,
   * mocked test) falls back to the normal dashboard — never blocks.
   */
  welcomeShow: boolean;
  /** True once the user has chosen "Skip for now" (persisted server-side). */
  welcomeSkipped: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** Persist "Skip for now" server-side and hide the welcome screen. */
  skipWelcome: () => Promise<void>;
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useTradovateConnection(enabled = true): TradovateConnectionState {
  const [loading, setLoading] = useState(enabled);
  const [connected, setConnected] = useState(false);
  const [integrations, setIntegrations] = useState<TradovateIntegration[]>([]);
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [welcomeShow, setWelcomeShow] = useState(false);
  const [welcomeSkipped, setWelcomeSkipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Apply a tradovate-status payload to local state. */
  const applyStatus = useCallback((data: Record<string, unknown>) => {
    // The server can switch the whole feature off at runtime
    // (TRADOVATE_ENABLED=false) without a frontend redeploy.
    if (data.enabled === false) {
      setFeatureEnabled(false);
      setIntegrations([]);
      setConnected(false);
      setWelcomeShow(false);
      setWelcomeSkipped(false);
      return;
    }
    setFeatureEnabled(true);
    const list: TradovateIntegration[] = Array.isArray(data.integrations)
      ? (data.integrations as TradovateIntegration[])
      : [];
    setIntegrations(list);
    // A connection exists as soon as an integration is present; its health
    // is surfaced by `status` (connected / expired / api_disabled / ...).
    setConnected(list.length > 0);
    // Fail open: anything short of an explicit welcome.show === true (with no
    // connection and the feature on) resolves to the normal dashboard.
    const welcome = resolveWelcome(data);
    setWelcomeShow(welcome.show);
    setWelcomeSkipped(welcome.skipped);
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    // Fail closed when Supabase is not configured: no welcome screen, the
    // dashboard renders normally.
    if (!isSupabaseConfigured()) {
      setConnected(false);
      setIntegrations([]);
      setWelcomeShow(false);
      setWelcomeSkipped(false);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(functionsUrl("tradovate-status"), {
        method: "GET",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
      });
      if (!res.ok) {
        setConnected(false);
        setIntegrations([]);
        setWelcomeShow(false);
        setError(res.status === 401 ? "unauthorized" : "status_failed");
        return;
      }
      applyStatus(await res.json());
    } catch {
      setConnected(false);
      setIntegrations([]);
      setWelcomeShow(false);
      setError("status_failed");
    } finally {
      setLoading(false);
    }
  }, [enabled, applyStatus]);

  /**
   * Persist "Skip for now" server-side (per user, across sessions/devices) and
   * hide the welcome screen. Optimistic: the local flag flips immediately so
   * the dashboard is never blocked by a slow request; a failure just leaves the
   * screen to reappear on the next status read (never a hard block).
   */
  const skipWelcome = useCallback(async () => {
    setWelcomeShow(false);
    setWelcomeSkipped(true);
    if (!enabled || !isSupabaseConfigured()) return;
    try {
      const res = await fetch(functionsUrl("tradovate-status"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({ action: "skip" }),
      });
      if (res.ok) applyStatus(await res.json());
    } catch {
      // Keep the optimistic hide; the server choice is retried on next load.
    }
  }, [enabled, applyStatus]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loading,
    connected,
    integrations,
    enabled: featureEnabled,
    welcomeShow,
    welcomeSkipped,
    error,
    refresh,
    skipWelcome,
  };
}
