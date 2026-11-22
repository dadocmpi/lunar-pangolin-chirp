import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  isPaymentsEnabled,
  isTestPaymentMode,
} from "../_shared/payments-flag.ts";
import { readJsonBody } from "../_shared/http.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import {
  canonicalPaymentStatus,
  deriveLifecycle,
  isProcessingLifecycle,
  nextActionKey,
  type LifecycleState,
  type PlanActivationStatus,
} from "../_shared/activation/lifecycle.ts";

/**
 * Payment Status — READ-ONLY endpoint.
 *
 * Returns the customer's payment and activation state. It never mutates a row
 * and never decides confirmation: the canonical status is whatever the server
 * wrote after a verified webhook / reconciliation / operator review.
 *
 * Query:  ?paymentId=<id>   (optional)
 * Body:   { paymentId?: string }
 *
 * With no paymentId the latest payment for the JWT user is returned, which is
 * what the dashboard payment card uses.
 *
 * Gate contract:
 *  - TEST_PAYMENT_MODE must be "true" OR PAYMENTS_ENABLED must be "true".
 *    If neither is set, returns 200 with mode="disabled" and a placeholder.
 *  - Every read is scoped to the JWT user; a foreign id yields 404.
 */
const limiter = createRateLimiter({ windowMs: 60_000, max: 120 });

interface PaymentRow {
  id: string;
  status?: string | null;
  status_enum?: string | null;
  plan_id?: string | null;
  plan_name?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
  network?: string | null;
  method?: string | null;
  user_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  confirmed_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface ActivationRow {
  id: string;
  status: PlanActivationStatus;
  account_id: string;
  plan_key: string;
  plan_name: string;
  activated_at: string | null;
  suspended_at: string | null;
  suspended_reason: string | null;
  disconnected_at: string | null;
  disconnected_reason: string | null;
  activation_email_sent_at: string | null;
  updated_at: string | null;
}

function isoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : value;
}

function referenceFor(payment: PaymentRow): string {
  const meta = payment.metadata ?? {};
  const ref = meta.reference;
  return typeof ref === "string" && ref.trim() ? ref.trim() : payment.id;
}

function expiresAtFor(payment: PaymentRow): string | null {
  const meta = payment.metadata ?? {};
  return isoOrNull(meta.expires_at) ?? isoOrNull(meta.expiresAt);
}

function placeholderResponse(mode: string, reason: string): Record<string, unknown> {
  // Never fabricate a payment row. With no payment (or with the feature
  // disabled) the customer sees the honest empty state.
  return {
    ok: true,
    mode,
    reason,
    lifecycle: "pending" satisfies LifecycleState,
    next_action: "complete_payment",
    processing: false,
    activation: null,
    payment: null,
  };
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (limiter.hit(`ip:${clientIp(req)}`)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ---------------------------------------------------------------------
  // Gate — refuse to read when neither test nor production is enabled.
  // ---------------------------------------------------------------------
  const testMode = isTestPaymentMode();
  if (!isPaymentsEnabled()) {
    return new Response(
      JSON.stringify(
        placeholderResponse(
          "disabled",
          "neither TEST_PAYMENT_MODE nor PAYMENTS_ENABLED is set",
        ),
      ),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // ---------------------------------------------------------------------
  // Auth — must be a Supabase user JWT.
  // ---------------------------------------------------------------------
  const auth = req.headers.get("Authorization");
  if (!auth) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = auth.replace("Bearer ", "");

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: auth } } },
  );
  const { data: userData, error: authErr } = await userClient.auth.getUser(token);
  if (authErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const user = userData.user;

  // ---------------------------------------------------------------------
  // Parse paymentId from query string or JSON body. It is optional: the
  // dashboard card asks for the latest payment.
  // ---------------------------------------------------------------------
  const url = new URL(req.url);
  let paymentId = url.searchParams.get("paymentId");
  if (!paymentId && req.method === "POST") {
    const body = await readJsonBody<{ paymentId?: string }>(req);
    if (body.ok && typeof body.value.paymentId === "string") {
      paymentId = body.value.paymentId;
    }
  }
  if (paymentId !== null && paymentId !== undefined && !paymentId.trim()) {
    return new Response(JSON.stringify({ error: "payment_id_required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ---------------------------------------------------------------------
  // Read with the service role, scoped to the JWT user in the where clause.
  // ---------------------------------------------------------------------
  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  let query = admin
    .from("pending_payments")
    .select(
      "id, status, status_enum, plan_id, plan_name, amount_cents, currency, network, method, user_id, created_at, updated_at, confirmed_at, metadata",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);
  if (paymentId) query = query.eq("id", paymentId);

  const { data, error } = await query.maybeSingle();
  if (error) {
    // Generic message: a database error can name tables and columns.
    console.error("[payment-status] read failed", { code: error.code });
    return new Response(JSON.stringify({ error: "db_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!data) {
    if (paymentId) {
      return new Response(JSON.stringify({ error: "payment_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // No payment yet: a valid empty state, never a fabricated row.
    return new Response(
      JSON.stringify({ ...placeholderResponse(testMode ? "test" : "production", "no_payment"), payment: null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const payment = data as PaymentRow;
  const rawStatus = String(payment.status_enum ?? payment.status ?? "pending");
  const canonical = canonicalPaymentStatus(rawStatus);

  const { data: activationData, error: activationError } = await admin
    .from("plan_activations")
    .select(
      "id, status, account_id, plan_key, plan_name, activated_at, suspended_at, suspended_reason, disconnected_at, disconnected_reason, activation_email_sent_at, updated_at",
    )
    .eq("payment_id", payment.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (activationError) {
    console.error("[payment-status] activation read failed", {
      code: activationError.code,
    });
  }
  const activation = (activationData as ActivationRow | null) ?? null;

  const lifecycle = deriveLifecycle(rawStatus, activation?.status ?? null);

  return new Response(
    JSON.stringify({
      ok: true,
      mode: testMode ? "test" : "production",
      lifecycle,
      next_action: nextActionKey(lifecycle),
      processing: isProcessingLifecycle(lifecycle),
      activation,
      payment: {
        id: payment.id,
        status: canonical,
        status_raw: rawStatus,
        plan_id: payment.plan_id ?? null,
        plan_name: payment.plan_name ?? null,
        amount_cents: payment.amount_cents ?? 0,
        currency: payment.currency ?? "USD",
        network: payment.network ?? null,
        method: payment.method ?? null,
        reference: referenceFor(payment),
        expires_at: expiresAtFor(payment),
        is_test: payment.metadata?.is_test === true,
        created_at: payment.created_at ?? null,
        updated_at: payment.updated_at ?? null,
        confirmed_at: payment.confirmed_at ?? null,
      },
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
