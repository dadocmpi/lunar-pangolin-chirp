// ============================================================================
// send-email — legacy generic sender, now a thin adapter over the single
// central module (../_shared/email.ts).
//
// Kept for backward compatibility: the contact form posts here. The `to`
// field is intentionally ignored — every owner notification goes to EMAIL_TO.
// The caller's `html` is not used; the central module renders a consistent,
// sanitized template so no unescaped HTML from a caller can be injected.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { notifyOwner } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Map a legacy subject line onto one of the canonical event types. */
function inferType(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes("contact") || s.includes("lead")) return "novo_lead";
  if (s.includes("payment") || s.includes("refund")) return "pagamento";
  if (s.includes("registration") || s.includes("signup")) return "novo_cliente";
  if (s.includes("error") || s.includes("failed")) return "erro";
  return "webhook";
}

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
    subject?: string;
    text?: string;
    replyTo?: string;
    data?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const subject = typeof body.subject === "string" && body.subject.trim()
    ? body.subject.trim()
    : "Notificação";

  const result = await notifyOwner({
    type: inferType(subject),
    subject,
    replyTo: typeof body.replyTo === "string" ? body.replyTo : null,
    data: body.data ?? (body.text ? { mensagem: body.text } : {}),
  });

  // Always answer 200 so a caller's user action never fails because email did.
  return new Response(
    JSON.stringify({
      success: true,
      delivered: result.ok,
      reason: result.skipped,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
