// ============================================================================
// operator-notification — "payment confirmed, activation required".
//
// Public contract preserved for stripe-webhook, but delivery now goes through
// the single central module (../_shared/email.ts) instead of the legacy
// send-email function. Owner address comes from EMAIL_TO.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { notifyOwner } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: {
    paymentId?: string;
    applicationId?: string | null;
    userId?: string;
    plan?: string | null;
    amount?: number | null;
    currency?: string | null;
    method?: string | null;
    confirmationTimestamp?: string;
    customerName?: string | null;
    customerEmail?: string | null;
    customerCountry?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // The operator dashboard is a route on the public site, not on the Supabase
  // host. Build an absolute link from SITE_URL (the canonical public origin)
  // when configured; otherwise fall back to the relative path so the email
  // never points at *.supabase.co.
  const siteBase = (Deno.env.get("SITE_URL") ?? "").replace(/\/+$/, "");
  const dashboardPath = body.applicationId
    ? `/operator-dashboard?applicationId=${encodeURIComponent(body.applicationId)}`
    : "/operator-dashboard";
  const dashboardUrl = siteBase ? `${siteBase}${dashboardPath}` : dashboardPath;

  // Deliberately omits the full residential address — that stays in the
  // operator dashboard only.
  const result = await notifyOwner({
    type: "pagamento",
    subject: `Pagamento confirmado — ativação necessária (${
      body.plan ?? "plano desconhecido"
    })`,
    replyTo: body.customerEmail ?? null,
    data: {
      payment_id: body.paymentId ?? null,
      application_id: body.applicationId ?? null,
      plano: body.plan ?? null,
      valor: body.amount != null
        ? `${(body.amount / 100).toFixed(2)} ${
          (body.currency ?? "usd").toUpperCase()
        }`
        : null,
      metodo: body.method ?? null,
      cliente: body.customerName ?? null,
      email: body.customerEmail ?? null,
      pais: body.customerCountry ?? null,
      confirmado_em: body.confirmationTimestamp ?? new Date().toISOString(),
      dashboard: dashboardUrl,
      origem: "operator-notification",
    },
    idempotencyKey: body.paymentId
      ? `operator-notification:${body.paymentId}`
      : null,
  });

  return new Response(
    JSON.stringify({ success: true, delivered: result.ok, emailId: result.id }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
