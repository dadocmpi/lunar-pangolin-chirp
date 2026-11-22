// ============================================================================
// application-ensure — create-or-reuse the application for a checkout plan.
//
// The browser only sends a plan KEY and the billing fields the customer just
// reviewed. This function scopes everything to the JWT user, re-derives the
// canonical plan from the server table, and reuses an open application for the
// same plan instead of inserting a second one.
//
// It is called from /checkout right before a payment is created, never on page
// load, so abandoned visits do not create rows. It does not confirm a payment
// and never grants access.
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";
import { getPlan } from "../_shared/plans.ts";
import { isReusableApplicationStatus } from "../_shared/checkout/logic.ts";
import {
  sanitizeBilling,
  type BillingInput,
} from "../_shared/profile/billing.ts";
import { isKnownCountryCode } from "../_shared/profile/countries.ts";
import { boundedString, readJsonBody } from "../_shared/http.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import { notifyOwnerInBackground, EMAIL_PATTERN } from "../_shared/email.ts";

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

interface EnsureBody {
  planKey?: unknown;
  billing?: BillingInput;
  termsAccepted?: unknown;
  privacyAccepted?: unknown;
  customerNote?: unknown;
}

interface ApplicationCandidate {
  id: string;
  payment_status: string | null;
  activation_status: string | null;
  terms_accepted_at: string | null;
  privacy_accepted_at: string | null;
}

function respond(
  body: unknown,
  status: number,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  const cors = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }
  if (req.method !== "POST") {
    return respond({ error: "method_not_allowed" }, 405, cors);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    return respond({ error: "server_misconfigured" }, 500, cors);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return respond({ error: "unauthorized" }, 401, cors);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(authHeader.substring(7));
  if (userError || !user) {
    return respond({ error: "unauthorized" }, 401, cors);
  }

  const ip = clientIp(req);
  if (limiter.hit(`ip:${ip}`) || limiter.hit(`user:${user.id}`)) {
    return respond({ error: "rate_limited" }, 429, cors);
  }

  const parsed = await readJsonBody<EnsureBody>(req, 32 * 1024);
  if (!parsed.ok) {
    return respond(
      { error: parsed.error },
      parsed.error === "payload_too_large" ? 413 : 400,
      cors,
    );
  }
  const body = parsed.value;

  // The client may only name a known plan. Amount, currency and interval are
  // never read from the body.
  const plan = (() => {
    try {
      return getPlan(body.planKey);
    } catch {
      return null;
    }
  })();
  if (!plan) return respond({ error: "invalid_plan" }, 400, cors);

  if (body.termsAccepted !== true) {
    return respond({ error: "terms_required" }, 400, cors);
  }
  if (body.privacyAccepted !== true) {
    return respond({ error: "privacy_required" }, 400, cors);
  }

  const billing = sanitizeBilling(body.billing);
  if (!billing.name) return respond({ error: "missing_name" }, 400, cors);
  if (!EMAIL_PATTERN.test(billing.email)) {
    return respond({ error: "invalid_email" }, 400, cors);
  }
  if (!isKnownCountryCode(billing.country)) {
    return respond({ error: "invalid_country" }, 400, cors);
  }

  if (typeof body.customerNote === "string" && body.customerNote.trim().length > 500) {
    return respond({ error: "note_too_long" }, 400, cors);
  }
  const note = boundedString(body.customerNote, 500) ?? "";
  const now = new Date().toISOString();

  // Reuse an open application for the same plan (pending or failed payment,
  // not yet activated). This makes a retry idempotent instead of creating a
  // second legal/application record.
  const { data: latest, error: selectError } = await supabase
    .from("applications")
    .select("id, payment_status, activation_status, terms_accepted_at, privacy_accepted_at")
    .eq("user_id", user.id)
    .eq("plan_key", plan.id)
    .in("activation_status", ["pending", "manual_review"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (selectError) {
    console.error("application-ensure select failed:", selectError.code);
    return respond({ error: "db_error" }, 500, cors);
  }

  // Only the latest application is a reuse candidate: a newer confirmed or
  // refunded record must never resurrect an older pending one.
  const candidate = latest as ApplicationCandidate | null;
  const reusable = candidate && isReusableApplicationStatus(candidate.payment_status)
    ? candidate
    : null;

  if (reusable) {
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        full_name: billing.name,
        email: billing.email,
        residential_address_line1: billing.line1 || null,
        residential_address_line2: billing.line2 || null,
        city: billing.city || null,
        region: billing.state || null,
        postal_code: billing.postalCode || null,
        country: billing.country,
        phone: billing.phone || null,
        customer_note: note || undefined,
        terms_accepted_at: reusable.terms_accepted_at ?? now,
        privacy_accepted_at: reusable.privacy_accepted_at ?? now,
        updated_at: now,
      })
      .eq("id", reusable.id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("application-ensure update failed:", updateError.code);
      return respond({ error: "db_error" }, 500, cors);
    }
    return respond(
      { application_id: reusable.id, plan_key: plan.id, reused: true },
      200,
      cors,
    );
  }

  const { data: inserted, error: insertError } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      plan_key: plan.id,
      full_name: billing.name,
      email: billing.email,
      residential_address_line1: billing.line1 || null,
      residential_address_line2: billing.line2 || null,
      city: billing.city || null,
      region: billing.state || null,
      postal_code: billing.postalCode || null,
      country: billing.country,
      phone: billing.phone || null,
      terms_accepted_at: now,
      terms_version: "1.0",
      privacy_accepted_at: now,
      privacy_version: "1.0",
      customer_note: note || null,
      metadata: { source: "checkout" },
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("application-ensure insert failed:", insertError?.code);
    return respond({ error: "db_error" }, 500, cors);
  }

  notifyOwnerInBackground({
    type: "novo_lead",
    subject: `Nova pré-inscrição — plano ${plan.name}`,
    replyTo: billing.email,
    data: {
      nome: billing.name,
      email: billing.email,
      telefone: billing.phone,
      pais: billing.country,
      cidade: billing.city,
      plano: plan.name,
      application_id: inserted.id,
      nota_cliente: note,
      origem: "checkout",
    },
    idempotencyKey: `application-ensure:${inserted.id}`,
  });

  return respond(
    { application_id: inserted.id, plan_key: plan.id, reused: false },
    200,
    cors,
  );
});
