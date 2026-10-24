// ============================================================================
// activationConfig — client-side view of the account-activation configuration.
//
// The affiliate links, the signals plan name/price and the ACTIVATION_FLOW_ENABLED
// switch live in Supabase Edge Function secrets and are served by the public
// `activation-config` function. Nothing here is hard-coded and no secret is
// involved: the response only carries marketing data.
//
// The pure resolver is unit-testable; the hook fetches it once per mount.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import { functionsUrl, isSupabaseConfigured } from "@/integrations/supabase/client";

export interface ActivationFirm {
  id: string;
  name: string;
  url: string;
}

export interface ActivationPlanConfig {
  name: string;
  priceCents: number;
  currency: string;
}

export interface ActivationConfig {
  enabled: boolean;
  firms: ActivationFirm[];
  plan: ActivationPlanConfig;
  /** Share link for OUR TradersPost strategy. Null when unconfigured. */
  tradersPostShareUrl: string | null;
  /** True when the pilot is full: show the waitlist instead of the form. */
  waitlistEnabled: boolean;
}

/** Safe default: flow off, no firms. The UI shows nothing until confirmed. */
export const EMPTY_ACTIVATION_CONFIG: ActivationConfig = {
  enabled: false,
  firms: [],
  plan: { name: "", priceCents: 0, currency: "USD" },
  tradersPostShareUrl: null,
  waitlistEnabled: false,
};

/** Only an http(s) URL is trusted for a rendered affiliate link. */
function safeUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return value;
  } catch {
    return null;
  }
}

/**
 * Normalise a raw activation-config payload. FAIL-CLOSED: a missing/odd payload
 * yields the empty config (flow off), so a broken response never offers a firm
 * or a price that the server would not accept.
 */
export function resolveActivationConfig(data: unknown): ActivationConfig {
  if (!data || typeof data !== "object") return EMPTY_ACTIVATION_CONFIG;
  const d = data as Record<string, unknown>;
  const firms: ActivationFirm[] = [];
  if (Array.isArray(d.firms)) {
    for (const raw of d.firms) {
      if (!raw || typeof raw !== "object") continue;
      const f = raw as Record<string, unknown>;
      const id = typeof f.id === "string" ? f.id : "";
      const name = typeof f.name === "string" ? f.name : "";
      const url = safeUrl(f.url);
      if (id && name && url) firms.push({ id, name, url });
    }
  }
  const planRaw = (d.plan && typeof d.plan === "object") ? d.plan as Record<string, unknown> : {};
  const priceCents = Number.isFinite(Number(planRaw.priceCents))
    ? Math.max(0, Math.trunc(Number(planRaw.priceCents)))
    : 0;

  const tp = (d.tradersPost && typeof d.tradersPost === "object")
    ? d.tradersPost as Record<string, unknown>
    : {};
  const waitlist = (d.waitlist && typeof d.waitlist === "object")
    ? d.waitlist as Record<string, unknown>
    : {};

  return {
    enabled: d.enabled === true && firms.length > 0,
    firms,
    plan: {
      name: typeof planRaw.name === "string" ? planRaw.name : "",
      priceCents,
      currency: typeof planRaw.currency === "string" ? planRaw.currency : "USD",
    },
    tradersPostShareUrl: safeUrl(tp.shareUrl),
    // Fail-open on a malformed payload: an absent waitlist flag never blocks
    // the form (the server re-checks capacity on submit anyway).
    waitlistEnabled: waitlist.enabled === true,
  };
}

export interface UseActivationConfig {
  config: ActivationConfig;
  loading: boolean;
  reload: () => Promise<void>;
}

export function useActivationConfig(): UseActivationConfig {
  const [config, setConfig] = useState<ActivationConfig>(EMPTY_ACTIVATION_CONFIG);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    // Without Supabase the flow cannot be confirmed; stay fail-closed.
    if (!isSupabaseConfigured()) {
      setConfig(EMPTY_ACTIVATION_CONFIG);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(functionsUrl("activation-config"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        setConfig(EMPTY_ACTIVATION_CONFIG);
        return;
      }
      setConfig(resolveActivationConfig(await res.json()));
    } catch {
      setConfig(EMPTY_ACTIVATION_CONFIG);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { config, loading, reload };
}
