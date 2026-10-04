// ============================================================================
// Supabase-backed GateDb implementation.
//
// Reads KYC status for a user through the SECURITY DEFINER RPC
// `kyc_status_for_user(uuid)`, called with the *authenticated* user id the
// Edge Function obtained from the JWT — never with a body-supplied id.
// ============================================================================

import type { GateDb } from "./gate.ts";

type SupabaseLike = {
  rpc(
    fn: string,
    args: Record<string, unknown>,
  ): Promise<{ data: unknown; error: { message: string } | null }>;
  from(table: string): {
    insert(row: Record<string, unknown>): Promise<{ error: { message: string } | null }>;
  };
};

export function createGateDb(admin: SupabaseLike): GateDb {
  return {
    async readKycStatus(userId: string): Promise<unknown> {
      const { data, error } = await admin.rpc("kyc_status_for_user", {
        p_user_id: userId,
      });
      if (error) throw new Error(`kyc_status_for_user failed: ${error.message}`);
      return data;
    },
    async insertWithdrawal(row: Record<string, unknown>) {
      const { error } = await admin.from("withdrawal_requests").insert(row);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
  };
}
