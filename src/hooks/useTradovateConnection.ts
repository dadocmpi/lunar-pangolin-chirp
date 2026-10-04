// ============================================================================
// useTradovateConnection — connection state for the gate.
//
// Calls the tradovate-status Edge Function with the user's JWT. The server
// derives the user id from the token; the client never sends a user id.
// Fails closed: any error leaves `connected` false so the gate holds.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

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
  error: string | null;
  refresh: () => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    // Fail closed when Supabase is not configured.
    if (!isSupabaseConfigured()) {
      setConnected(false);
      setIntegrations([]);
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
        setError(res.status === 401 ? "unauthorized" : "status_failed");
        return;
      }
      const data = await res.json();
      const list: TradovateIntegration[] = Array.isArray(data.integrations)
        ? data.integrations
        : [];
      setIntegrations(list);
      // A connection exists as soon as an integration is present; its health
      // is surfaced by `status` (connected / expired / api_disabled / ...).
      setConnected(list.length > 0);
    } catch {
      setConnected(false);
      setIntegrations([]);
      setError("status_failed");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loading,
    connected,
    integrations,
    error,
    refresh,
  };
}
