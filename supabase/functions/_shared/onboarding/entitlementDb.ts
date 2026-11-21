// ============================================================================
// Server-side entitlement loader.
//
// Reads only the target user's own payment/service rows with the service-role
// client and delegates the decision to the pure resolver. Every caller passes
// the id derived from a verified JWT (customer) or from the row being reviewed
// (operator), never a value from the request body.
// ============================================================================

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { resolveEntitlement, type Entitlement } from "./entitlement.ts";

export interface EntitlementLoad {
  entitlement: Entitlement;
  error: "lookup_failed" | null;
}

export async function loadEntitlement(
  admin: SupabaseClient,
  userId: string,
): Promise<EntitlementLoad> {
  const { data: payments, error } = await admin
    .from("pending_payments")
    .select("id, plan_id, amount_cents, currency, status, status_enum, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) {
    return { entitlement: resolveEntitlement([], []), error: "lookup_failed" };
  }

  const { data: services } = await admin
    .from("services")
    .select("plan_id, activated, status")
    .eq("user_id", userId);

  return {
    entitlement: resolveEntitlement(payments ?? [], services ?? []),
    error: null,
  };
}
