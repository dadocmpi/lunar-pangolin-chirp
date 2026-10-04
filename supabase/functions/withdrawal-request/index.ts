// ============================================================================
// withdrawal-request — the server-side KYC gate.
//
// This is the endpoint that MUST refuse a withdrawal unless KYC is approved.
// The decision is read server-side for the JWT-authenticated user
// (kyc_status_for_user RPC). A `kycStatus` or `userId` in the request body is
// ignored on purpose. Deployed with verify_jwt = true (see supabase/config.toml).
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  handleWithdrawalRequest,
  manualReviewThresholdCentsFromEnv,
} from "../_shared/kyc/gate.ts";
import { createGateDb } from "../_shared/kyc/supabaseGateDb.ts";
import { notifyOwnerInBackground } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json({ error: "server_misconfigured" }, 500);

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return json({ error: "unauthorized" }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  // Body carries only the request details. Any userId/kycStatus is ignored.
  const amountCents = Number(payload.amountCents ?? 0);
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const db = createGateDb(admin as unknown as Parameters<typeof createGateDb>[0]);

  const result = await handleWithdrawalRequest(
    db,
    user.id ?? null,
    {
      userId: user.id, // informational only; the gate uses the JWT user id
      accountId: typeof payload.accountId === "string" ? payload.accountId : undefined,
      amountCents: Number.isFinite(amountCents) ? Math.round(amountCents) : 0,
      currency: typeof payload.currency === "string" ? payload.currency : "USD",
      method: typeof payload.method === "string" ? payload.method : undefined,
      destination: typeof payload.destination === "string" ? payload.destination : undefined,
      network: typeof payload.network === "string" ? payload.network : undefined,
    },
    {
      manualReviewThresholdCents: manualReviewThresholdCentsFromEnv({
        KYC_MANUAL_REVIEW_THRESHOLD_CENTS: Deno.env.get("KYC_MANUAL_REVIEW_THRESHOLD_CENTS") ?? undefined,
      }),
    },
  );

  if (result.status === 201) {
    notifyOwnerInBackground({
      type: "pagamento",
      subject: `${result.body.manualReview ? "[Revisao] " : ""}Solicitacao de saque — ${amountCents / 100}`,
      replyTo: user.email ?? undefined,
      data: {
        user_id: user.id,
        email: user.email,
        valor_centavos: amountCents,
        metodo: payload.method ?? "N/A",
        conta: payload.accountId ?? "N/A",
        kyc_status: result.body.kycStatus,
        revisao_manual: result.body.manualReview === true,
        origem: "withdrawal-request",
      },
      idempotencyKey: `withdrawal:${user.id}:${Date.now()}`,
    });
  }

  return json(result.body, result.status);
});
