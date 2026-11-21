// ============================================================================
// onboardingConfig — client view of the public onboarding configuration.
//
// The flag, the firms, the plan catalog and the disclosure version come from
// the public `onboarding-config` Edge Function. Nothing here is a secret and
// nothing here decides authorization: the server re-checks every request.
// FAIL-CLOSED: a broken response yields the empty config (flow off).
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import { functionsUrl, isSupabaseConfigured } from "@/integrations/supabase/client";

export interface OnboardingFirm {
  id: string;
  name: string;
}

export interface OnboardingPlan {
  id: string;
  name: string;
  priceCents: number;
  managedCapitalUsd: number;
}

export interface OnboardingClientConfig {
  enabled: boolean;
  executionEnabled: boolean;
  firms: OnboardingFirm[];
  plans: OnboardingPlan[];
  disclosuresVersion: string;
}

export const EMPTY_ONBOARDING_CONFIG: OnboardingClientConfig = {
  enabled: false,
  executionEnabled: false,
  firms: [],
  plans: [],
  disclosuresVersion: "",
};

function cleanString(value: unknown, max = 120): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : 0;
}

export function resolveOnboardingConfig(data: unknown): OnboardingClientConfig {
  if (!data || typeof data !== "object") return EMPTY_ONBOARDING_CONFIG;
  const d = data as Record<string, unknown>;

  const firms: OnboardingFirm[] = [];
  if (Array.isArray(d.firms)) {
    for (const raw of d.firms) {
      if (!raw || typeof raw !== "object") continue;
      const f = raw as Record<string, unknown>;
      const id = cleanString(f.id, 40);
      const name = cleanString(f.name, 80);
      if (id && name) firms.push({ id, name });
    }
  }

  const plans: OnboardingPlan[] = [];
  if (Array.isArray(d.plans)) {
    for (const raw of d.plans) {
      if (!raw || typeof raw !== "object") continue;
      const p = raw as Record<string, unknown>;
      const id = cleanString(p.id, 40);
      if (!id) continue;
      plans.push({
        id,
        name: cleanString(p.name, 80) || id,
        priceCents: cleanNumber(p.priceCents),
        managedCapitalUsd: cleanNumber(p.managedCapitalUsd),
      });
    }
  }

  return {
    enabled: d.enabled === true && firms.length > 0,
    executionEnabled: d.executionEnabled === true,
    firms,
    plans,
    disclosuresVersion: cleanString(d.disclosuresVersion, 60),
  };
}

export interface UseOnboardingConfig {
  config: OnboardingClientConfig;
  loading: boolean;
  reload: () => Promise<void>;
}

export function useOnboardingConfig(): UseOnboardingConfig {
  const [config, setConfig] = useState<OnboardingClientConfig>(EMPTY_ONBOARDING_CONFIG);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setConfig(EMPTY_ONBOARDING_CONFIG);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(functionsUrl("onboarding-config"), { method: "GET" });
      if (!res.ok) {
        setConfig(EMPTY_ONBOARDING_CONFIG);
        return;
      }
      setConfig(resolveOnboardingConfig(await res.json()));
    } catch {
      setConfig(EMPTY_ONBOARDING_CONFIG);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { config, loading, reload };
}
