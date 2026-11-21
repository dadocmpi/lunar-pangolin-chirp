import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { notifyOwnerInBackground } from "../_shared/email.ts";
import {
  ForbiddenError,
  requireOperator,
  UnauthorizedError,
} from "../_shared/activation/operator.ts";
import { boundedString, readJsonBody } from "../_shared/http.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip = clientIp(req);
  if (limiter.hit(`ip:${ip}`)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // OPERATOR ONLY. Rejecting an application is a privileged state change; a
  // plain authenticated user must not be able to reject anyone's application.
  // requireOperator reads app_metadata.operator from the admin API (not the
  // token body) and requires it to be exactly `true`.
  let ctx;
  try {
    ctx = await requireOperator(req);
  } catch (err) {
    const status = err instanceof ForbiddenError ? 403 : 401;
    if (!(err instanceof ForbiddenError) && !(err instanceof UnauthorizedError)) {
      console.error("[application-reject] auth error", { name: (err as Error)?.name });
    }
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabase = ctx.admin;
  const user = ctx.user;

  const parsed = await readJsonBody<{ applicationId?: string; reason?: string }>(req);
  if (!parsed.ok) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: parsed.error === "payload_too_large" ? 413 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const applicationId = boundedString(parsed.value.applicationId, 64);
  const reason = boundedString(parsed.value.reason, 500);
  if (!applicationId) {
    return new Response(JSON.stringify({ error: "Missing applicationId" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!reason) {
    return new Response(JSON.stringify({ error: "Missing rejection reason" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Read the current row first so the audit log records the real previous
  // status (reading it after the UPDATE always returned "rejected").
  const { data: existing, error: readError } = await supabase
    .from("applications")
    .select("id, activation_status")
    .eq("id", applicationId)
    .maybeSingle();

  if (readError) {
    console.error("[application-reject] read failed", { code: readError.code });
    return new Response(JSON.stringify({ error: "lookup_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!existing) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const previousStatus = existing.activation_status;

  // Update the application record
  const { data: application, error: updateError } = await supabase
    .from("applications")
    .update({
      activation_status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .select()
    .single();

  if (updateError || !application) {
    console.error("Application rejection error:", updateError);
    return new Response(
      JSON.stringify({ error: "Failed to reject application" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Create an audit log entry for the rejection
  const { error: auditError } = await supabase
    .from("payment_audit_log")
    .insert({
      payment_table: "applications",
      payment_id: applicationId,
      user_id: user.id,
      actor: "operator",
      source: "admin",
      event_id: crypto.randomUUID(),
      previous_status: previousStatus,
      new_status: "rejected",
      reason: reason,
      created_at: new Date().toISOString(),
    });

  if (auditError) {
    console.error("Audit log error:", auditError);
    // We don't fail the rejection if audit log fails, but we log it
  }

  notifyOwnerInBackground({
    type: "conta",
    subject: "Aplicação rejeitada",
    data: {
      application_id: applicationId,
      motivo: reason,
      rejeitado_por: user.id,
      origem: "operator",
    },
    idempotencyKey: `application-reject:${applicationId}`,
  });

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
