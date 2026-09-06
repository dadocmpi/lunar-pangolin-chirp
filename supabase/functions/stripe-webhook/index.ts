import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

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

  // Get environment variables
  const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeWebhookSecret) {
    return new Response(
      JSON.stringify({ error: "Webhook secret not configured" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Get the request body and signature
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "No stripe-signature header" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();

  // Verify the signature (we'll do a basic verification; in production, use the stripe library)
  // We'll implement a basic verification using the secret as the key for HMAC SHA256.
  // We'll use the crypto.subtle API.

  // We'll verify the signature by reconstructing the signed payload.
  // The signature header looks like: t=1678964545,v1=abcdef123456,v0=abcdef123456
  // We'll extract the timestamp and the v1 signature.
  const [t, v1] = signature.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  if (!t || !v1) {
    return new Response(JSON.stringify({ error: "Invalid signature format" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check timestamp tolerance (5 minutes)
  const timestamp = parseInt(t, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(timestamp - now) > 60 * 5) {
    return new Response(JSON.stringify({ error: "Timestamp outside tolerance" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // The signed payload is `${timestamp}.${rawBody}`
  const signedPayload = `${t}.${rawBody}`;

  // We'll use the webhook secret as the key for HMAC SHA256
  const keyBuffer = new TextEncoder().encode(stripeWebhookSecret);
  const dataBuffer = new TextEncoder().encode(signedPayload);

  // Import the key and verify
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBuffer = hexToUint8Array(v1);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      dataBuffer
    );

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("Signature verification failed:", err);
    return new Response(JSON.stringify({ error: "Signature verification error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse the event
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Idempotency: we'll check if we've already processed this event by looking at the metadata of the pending payment
  // We'll store processed event IDs in the metadata of the pending payment record.
  // We'll do this for events that are related to a pending payment (via metadata).

  // Handle the event
  let updated = false;
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const pendingPaymentId = session.metadata?.pending_payment_id;
        const applicationId = session.metadata?.application_id;
        const idempotencyKey = session.metadata?.idempotency_key;
        if (!pendingPaymentId || !applicationId) {
          console.warn("No pending_payment_id or application_id in session metadata");
          break;
        }

        // Get the pending payment record
        const { data: pendingPayment, error: pendingError } = await supabase
          .from("pending_payments")
          .select("id, metadata, status_enum")
          .eq("id", pendingPaymentId)
          .single();

        if (pendingError || !pendingPayment) {
          console.error("Failed to fetch pending payment:", pendingError);
          break;
        }

        // Check idempotency: see if we've already processed this event for this pending payment
        const metadata = pendingPayment.metadata as Record<string, any> || {};
        const processedEventIds = metadata.processed_event_ids || [];
        if (processedEventIds.includes(event.id)) {
          console.log(`Already processed event ${event.id} for pending payment ${pendingPaymentId}`);
          break;
        }

        // Update the pending payment with stripe customer and subscription ids
        const updateData: Record<string, any> = {
          status_enum: "confirmed", // canonical
          metadata: {
            ...metadata,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            last_applied_status: "confirmed",
            // Add the event id to processed list
            processed_event_ids: [...processedEventIds, event.id],
          },
        };

        const { error: updateError } = await supabase
          .from("pending_payments")
          .update(updateData)
          .eq("id", pendingPaymentId);

        if (updateError) {
          console.error("Failed to update pending payment:", updateError);
          break;
        }

        // Update the application record
        // payment_status uses "payment_confirmed" per spec; activation is NEVER automatic.
        const { data: application, error: appError } = await supabase
          .from("applications")
          .update({
            payment_status: "payment_confirmed",
            activation_status: "activation_pending",
            updated_at: new Date().toISOString()
          })
          .eq("id", applicationId)
          .select("id, user_id, plan_key, full_name, email, country")
          .single();

        if (appError || !application) {
          console.error("Failed to update application:", appError);
          // We don't break here because the pending payment update succeeded, but we should log the error
          console.error("Application update failed, but pending payment was updated.");
        }

        // Create an audit log entry for the payment confirmation
        const { error: auditError } = await supabase
          .from("payment_audit_log")
          .insert({
            payment_table: "pending_payments",
            payment_id: pendingPaymentId,
            user_id: pendingPayment.user_id,
            actor: "system",
            source: "stripe",
            event_id: event.id,
            previous_status: null, // We don't have the previous status easily; we'll set to null
            new_status: "payment_confirmed",
            reason: "Payment confirmed via Stripe checkout.session.completed",
            created_at: new Date().toISOString()
          });

        if (auditError) {
          console.error("Audit log error:", auditError);
        }

        // Notify the operator with a secure dashboard link. Fire-and-forget; never blocks the webhook.
        // We pass the canonical USD amount and only the minimum PII required for operator action.
        try {
          await fetch(`${supabaseUrl}/functions/v1/operator-notification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              paymentId: pendingPaymentId,
              applicationId,
              userId: pendingPayment.user_id,
              customerName: application?.full_name ?? null,
              customerEmail: application?.email ?? null,
              customerCountry: application?.country ?? null,
              plan: application?.plan_key ?? null,
              amount: typeof session.amount_total === "number" ? session.amount_total : null,
              currency: session.currency ?? "usd",
              method: "stripe",
              confirmationTimestamp: new Date().toISOString(),
            }),
          });
        } catch (notifyErr) {
          console.error("Operator notification dispatch failed:", notifyErr);
        }

        updated = true;
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) {
          console.warn("No subscription in invoice");
          break;
        }

        // Find the pending payment by stripe_subscription_id in metadata
        const { data: pendingPayments, error: listError } = await supabase
          .from("pending_payments")
          .select("id, metadata")
          .eq("method", "stripe");

        if (listError || !pendingPayments) {
          console.error("Failed to list pending payments:", listError);
          break;
        }

        const pendingPayment = pendingPayments.find((pp: any) => {
          const meta = pp.metadata as Record<string, any> || {};
          return meta.stripe_subscription_id === subscriptionId;
        });

        if (!pendingPayment) {
          console.warn(`No pending payment found for subscription ${subscriptionId}`);
          break;
        }

        // Check idempotency
        const metadata = pendingPayment.metadata as Record<string, any> || {};
        const processedEventIds = metadata.processed_event_ids || [];
        if (processedEventIds.includes(event.id)) {
          console.log(`Already processed event ${event.id} for pending payment ${pendingPayment.id}`);
          break;
        }

        // Update the pending payment to active and update period end
        const periodEnd = new Date(invoice.period_end * 1000).toISOString();
        // Extract charge_id from the payment_intent to support charge.refunded / charge.dispute lookups.
        const paymentIntentId = typeof invoice.payment_intent === "string"
          ? invoice.payment_intent
          : (invoice.payment_intent as any)?.id ?? null;
        const updateData: Record<string, any> = {
          metadata: {
            ...metadata,
            stripe_latest_invoice_id: invoice.id,
            stripe_latest_payment_intent: paymentIntentId,
            current_period_end: periodEnd,
            processed_event_ids: [...processedEventIds, event.id],
          },
          // We don't change the status_enum here; it remains "payment_confirmed" from checkout.session.completed
        };

        const { error: updateError } = await supabase
          .from("pending_payments")
          .update(updateData)
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error("Failed to update pending payment:", updateError);
          break;
        }

        // Update the application record's payment_status to payment_confirmed (idempotent)
        const { data: application, error: appError } = await supabase
          .from("applications")
          .update({
            payment_status: "payment_confirmed",
            updated_at: new Date().toISOString()
          })
          .eq("id", pendingPayment.metadata.application_id)
          .select()
          .single();

        if (appError || !application) {
          console.error("Failed to update application payment status:", appError);
        }

        // Create an audit log entry for the invoice paid
        const { error: auditError } = await supabase
          .from("payment_audit_log")
          .insert({
            payment_table: "pending_payments",
            payment_id: pendingPayment.id,
            user_id: pendingPayment.user_id,
            actor: "system",
            source: "stripe",
            event_id: event.id,
            previous_status: "payment_confirmed",
            new_status: "payment_confirmed",
            reason: "Invoice paid via Stripe (recurring)",
            created_at: new Date().toISOString()
          });

        if (auditError) {
          console.error("Audit log error:", auditError);
        }

        updated = true;
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) {
          break;
        }

        const { data: pendingPayments, error: listError } = await supabase
          .from("pending_payments")
          .select("id, metadata")
          .eq("method", "stripe");

        if (listError || !pendingPayments) {
          break;
        }

        const pendingPayment = pendingPayments.find((pp: any) => {
          const meta = pp.metadata as Record<string, any> || {};
          return meta.stripe_subscription_id === subscriptionId;
        });

        if (!pendingPayment) {
          break;
        }

        // Check idempotency
        const metadata = pendingPayment.metadata as Record<string, any> || {};
        const processedEventIds = metadata.processed_event_ids || [];
        if (processedEventIds.includes(event.id)) {
          break;
        }

        const updateData: Record<string, any> = {
          metadata: {
            ...metadata,
            processed_event_ids: [...processedEventIds, event.id],
          },
          status_enum: "past_due", // Update payment status to past_due
        };

        const { error: updateError } = await supabase
          .from("pending_payments")
          .update(updateData)
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error("Failed to update pending payment:", updateError);
        }

        // Update the application record's payment_status to past_due
        const { data: application, error: appError } = await supabase
          .from("applications")
          .update({
            payment_status: "past_due",
            updated_at: new Date().toISOString()
          })
          .eq("id", pendingPayment.metadata.application_id)
          .select()
          .single();

        if (appError || !application) {
          console.error("Failed to update application payment status:", appError);
        }

        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        if (!subscriptionId) {
          break;
        }

        const { data: pendingPayments, error: listError } = await supabase
          .from("pending_payments")
          .select("id, metadata")
          .eq("method", "stripe");

        if (listError || !pendingPayments) {
          break;
        }

        const pendingPayment = pendingPayments.find((pp: any) => {
          const meta = pp.metadata as Record<string, any> || {};
          return meta.stripe_subscription_id === subscriptionId;
        });

        if (!pendingPayment) {
          break;
        }

        // Check idempotency
        const metadata = pendingPayment.metadata as Record<string, any> || {};
        const processedEventIds = metadata.processed_event_ids || [];
        if (processedEventIds.includes(event.id)) {
          break;
        }

        // Determine the new status based on subscription status.
        // pending_payments.status_enum uses canonical values only.
        // applications.payment_status uses "payment_confirmed" per spec when active.
        let canonicalStatus: string = "confirmed";
        let appStatus: string = "payment_confirmed";
        switch (subscription.status) {
          case "active":
            canonicalStatus = "confirmed";
            appStatus = "payment_confirmed";
            break;
          case "past_due":
            canonicalStatus = "past_due";
            appStatus = "past_due";
            break;
          case "canceled":
            canonicalStatus = "canceled";
            appStatus = "canceled";
            break;
          case "incomplete":
            canonicalStatus = "incomplete";
            appStatus = "incomplete";
            break;
          case "incomplete_expired":
            canonicalStatus = "incomplete_expired";
            appStatus = "incomplete_expired";
            break;
          case "trialing":
            canonicalStatus = "trialing";
            appStatus = "trialing";
            break;
          case "paused":
            canonicalStatus = "paused";
            appStatus = "paused";
            break;
          default:
            canonicalStatus = "confirmed";
            appStatus = "payment_confirmed";
        }

        const updateData: Record<string, any> = {
          status_enum: canonicalStatus,
          metadata: {
            ...(pendingPayment.metadata as Record<string, any> || {}),
            last_applied_status: canonicalStatus,
            processed_event_ids: [...(pendingPayment.metadata.processed_event_ids || []), event.id],
          },
        };

        const { error: updateError } = await supabase
          .from("pending_payments")
          .update(updateData)
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error("Failed to update pending payment:", updateError);
        }

        // Update the application record's payment_status
        const { data: application, error: appError } = await supabase
          .from("applications")
          .update({
            payment_status: appStatus,
            updated_at: new Date().toISOString()
          })
          .eq("id", pendingPayment.metadata.application_id)
          .select()
          .single();

        if (appError || !application) {
          console.error("Failed to update application payment status:", appError);
        }

        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        if (!subscriptionId) {
          break;
        }

        const { data: pendingPayments, error: listError } = await supabase
          .from("pending_payments")
          .select("id, metadata")
          .eq("method", "stripe");

        if (listError || !pendingPayments) {
          break;
        }

        const pendingPayment = pendingPayments.find((pp: any) => {
          const meta = pp.metadata as Record<string, any> || {};
          return meta.stripe_subscription_id === subscriptionId;
        });

        if (!pendingPayment) {
          break;
        }

        // Check idempotency
        const metadata = pendingPayment.metadata as Record<string, any> || {};
        const processedEventIds = metadata.processed_event_ids || [];
        if (processedEventIds.includes(event.id)) {
          break;
        }

        const updateData: Record<string, any> = {
          status_enum: "canceled",
          metadata: {
            ...(pendingPayment.metadata as Record<string, any> || {}),
            processed_event_ids: [...(pendingPayment.metadata.processed_event_ids || []), event.id],
          },
        };

        const { error: updateError } = await supabase
          .from("pending_payments")
          .update(updateData)
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error("Failed to update pending payment:", updateError);
        }

        // Update the application record's payment_status to canceled
        const { data: application, error: appError } = await supabase
          .from("applications")
          .update({
            payment_status: "canceled",
            updated_at: new Date().toISOString()
          })
          .eq("id", pendingPayment.metadata.application_id)
          .select()
          .single();

        if (appError || !application) {
          console.error("Failed to update application payment status:", appError);
        }

        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const chargeId = charge?.id ?? null;
        const paymentIntentId = typeof charge?.payment_intent === "string"
          ? charge.payment_intent
          : (charge?.payment_intent as any)?.id ?? null;
        if (!chargeId && !paymentIntentId) {
          break;
        }

        // Locate the pending payment by stored charge or payment_intent id in metadata.
        const { data: pendingPayments, error: listError } = await supabase
          .from("pending_payments")
          .select("id, user_id, metadata, status_enum")
          .eq("method", "stripe");

        if (listError || !pendingPayments) {
          console.error("charge.refunded: list failed", listError);
          break;
        }

        const pendingPayment = pendingPayments.find((pp: any) => {
          const meta = (pp.metadata as Record<string, any>) || {};
          return (
            meta.stripe_charge_id === chargeId ||
            meta.stripe_latest_payment_intent === paymentIntentId
          );
        });

        if (!pendingPayment) {
          console.warn(`charge.refunded: no pending payment for charge ${chargeId} / pi ${paymentIntentId}`);
          break;
        }

        // Idempotency by Stripe event id.
        const metadata = (pendingPayment.metadata as Record<string, any>) || {};
        const processedEventIds: string[] = metadata.processed_event_ids || [];
        if (processedEventIds.includes(event.id)) {
          break;
        }

        // Update the pending payment: mark refunded, store charge id, NEVER auto-activate.
        const { error: updateError } = await supabase
          .from("pending_payments")
          .update({
            status_enum: "refunded",
            metadata: {
              ...metadata,
              stripe_charge_id: chargeId,
              refunded_at: new Date().toISOString(),
              refund_amount: typeof charge?.amount_refunded === "number" ? charge.amount_refunded : null,
              processed_event_ids: [...processedEventIds, event.id],
            },
          })
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error("charge.refunded: pending payment update failed", updateError);
          break;
        }

        // Update the application: payment_status -> refunded, activation stays manual.
        const { error: appError } = await supabase
          .from("applications")
          .update({
            payment_status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("id", metadata.application_id);

        if (appError) {
          console.error("charge.refunded: application update failed", appError);
        }

        // Audit log (no auto-activation).
        await supabase.from("payment_audit_log").insert({
          payment_table: "pending_payments",
          payment_id: pendingPayment.id,
          user_id: pendingPayment.user_id,
          actor: "system",
          source: "stripe",
          event_id: event.id,
          previous_status: metadata.last_applied_status ?? "payment_confirmed",
          new_status: "refunded",
          reason: "Charge refunded via Stripe charge.refunded",
          created_at: new Date().toISOString(),
        });

        break;
      }
      case "charge.dispute.created": {
        const dispute = event.data.object;
        const chargeId = typeof dispute?.charge === "string" ? dispute.charge : (dispute?.charge as any)?.id ?? null;
        if (!chargeId) {
          break;
        }

        const { data: pendingPayments, error: listError } = await supabase
          .from("pending_payments")
          .select("id, user_id, metadata, status_enum")
          .eq("method", "stripe");

        if (listError || !pendingPayments) {
          console.error("charge.dispute.created: list failed", listError);
          break;
        }

        const pendingPayment = pendingPayments.find((pp: any) => {
          const meta = (pp.metadata as Record<string, any>) || {};
          return meta.stripe_charge_id === chargeId;
        });

        if (!pendingPayment) {
          console.warn(`charge.dispute.created: no pending payment for charge ${chargeId}`);
          break;
        }

        const metadata = (pendingPayment.metadata as Record<string, any>) || {};
        const processedEventIds: string[] = metadata.processed_event_ids || [];
        if (processedEventIds.includes(event.id)) {
          break;
        }

        // Mark disputed; never auto-activate, never auto-delete.
        const { error: updateError } = await supabase
          .from("pending_payments")
          .update({
            status_enum: "disputed",
            metadata: {
              ...metadata,
              dispute_id: dispute.id,
              dispute_reason: dispute.reason ?? null,
              dispute_amount: typeof dispute.amount === "number" ? dispute.amount : null,
              dispute_status: dispute.status ?? "needs_response",
              disputed_at: new Date().toISOString(),
              processed_event_ids: [...processedEventIds, event.id],
            },
          })
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error("charge.dispute.created: pending payment update failed", updateError);
          break;
        }

        const { error: appError } = await supabase
          .from("applications")
          .update({
            payment_status: "disputed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", metadata.application_id);

        if (appError) {
          console.error("charge.dispute.created: application update failed", appError);
        }

        await supabase.from("payment_audit_log").insert({
          payment_table: "pending_payments",
          payment_id: pendingPayment.id,
          user_id: pendingPayment.user_id,
          actor: "system",
          source: "stripe",
          event_id: event.id,
          previous_status: metadata.last_applied_status ?? "payment_confirmed",
          new_status: "disputed",
          reason: `Dispute created via Stripe charge.dispute.created (${dispute.reason ?? "unknown"})`,
          created_at: new Date().toISOString(),
        });

        break;
      }
      default:
        // Ignore other events
        break;
    }
  } catch (err) {
    console.error("Error processing webhook event:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

// Helper function to convert hex string to Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}