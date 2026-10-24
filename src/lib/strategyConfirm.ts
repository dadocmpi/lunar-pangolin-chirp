// ============================================================================
// strategyConfirm — the customer records that they subscribed to OUR
// TradersPost strategy in their own account.
//
// This is a self-declaration: the customer types their firm login only inside
// TradersPost, never here. The call carries NO credential and no user id (the
// server derives the user from the JWT). The server stamps the confirmation
// date, which the operator can then see.
// ============================================================================

import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

export interface StrategyConfirmResult {
  ok: boolean;
  error?: string;
  confirmedAt?: string;
  alreadyConfirmed?: boolean;
}

export async function confirmStrategySubscription(): Promise<StrategyConfirmResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "not_configured" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { ok: false, error: "unauthorized" };

  let res: Response;
  try {
    res = await fetch(functionsUrl("activation-strategy-confirm"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({}),
    });
  } catch {
    return { ok: false, error: "network" };
  }

  const json = await res.json().catch(() => ({})) as Record<string, unknown>;
  if (!res.ok || json?.ok !== true) {
    return { ok: false, error: typeof json?.error === "string" ? json.error : "unknown" };
  }
  return {
    ok: true,
    confirmedAt: typeof json.confirmedAt === "string" ? json.confirmedAt : undefined,
    alreadyConfirmed: json.alreadyConfirmed === true,
  };
}
