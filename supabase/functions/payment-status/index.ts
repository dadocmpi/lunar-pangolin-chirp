import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { makeServiceClient, readPaymentForUser } from "../_shared/payments.ts";
import { PaymentError } from "../_shared/payments.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Read-only payment status endpoint. The front end polls this to learn the
 * true server-side status. It NEVER mutates state.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new PaymentError("unauthorized");
    const token = auth.replace("Bearer ", "");

    const admin = makeServiceClient();
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) throw new PaymentError("unauthorized");

    const url = new URL(req.url);
    let paymentId = url.searchParams.get("paymentId");
    if (!paymentId && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      paymentId = (body as any)?.paymentId;
    }
    if (!paymentId) throw new PaymentError("payment_id_required");

    const p = await readPaymentForUser(admin, paymentId, userData.user.id);

    return new Response(
      JSON.stringify({
        ok: true,
        mode: "test",
        payment: {
          id: p.id,
          status: p.status,
          planId: p.plan_id,
          amountCents: p.amount_cents,
          currency: p.currency,
          network: p.network,
          method: p.method,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    if (err instanceof PaymentError) {
      return new Response(JSON.stringify({ error: err.code }), {
        status: err.code === "unauthorized" ? 401 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});