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
          status_enum: "confirmed", // Set payment status to confirmed
          metadata: {
            ...metadata,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
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
        const { data: application, error: appError } = await supabase
          .from("applications")
          .update({
            payment_status: "confirmed",
            activation_status: "activation_pending",
            updated_at: new Date().toISOString()
          })
          .eq("id", applicationId)
          .select()
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
            new_status: "confirmed",
            reason: "Payment confirmed via Stripe checkout.session.completed",
            created_at: new Date().toISOString()
          });

        if (auditError) {
          console.error("Audit log error:", auditError);
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
        const updateData: Record<string, any> = {
          metadata: {
            ...metadata,
            stripe_latest_invoice_id: invoice.id,
            stripe_latest_payment_intent: invoice.payment_intent,
            current_period_end: periodEnd,
            processed_event_ids: [...processedEventIds, event.id],
          },
          // We don't change the status_enum here; it remains "confirmed" from the checkout.session.completed event
          // We'll update the application's payment_status to "confirmed" (it should already be)
        };

        const { error: updateError } = await supabase
          .from("pending_payments")
          .update(updateData)
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error("Failed to update pending payment:", updateError);
          break;
        }

        // Update the application record's payment_status to confirmed (should already be, but we'll set it)
        const { data: application, error: appError } = await supabase
          .from("applications")
          .update({
            payment_status: "confirmed",
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
            previous_status: null,
            new_status: "confirmed",
            reason: "Invoice paid via Stripe",
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

        // Determine the new status based on subscription status
        let newStatus: string = "confirmed"; // Default to confirmed
        switch (subscription.status) {
          case "active":
            newStatus = "confirmed";
            break;
          case "past_due":
            newStatus = "past_due";
            break;
          case "canceled":
            newStatus = "canceled";
            break;
          case "incomplete":
            newStatus = "incomplete";
            break;
          case "incomplete_expired":
            newStatus = "incomplete_expired";
            break;
          case "trialing":
            newStatus = "trialing";
            break;
          case "paused":
            newStatus = "paused";
            break;
          default:
            newStatus = "confirmed";
        }

        const updateData: Record<string, any> = {
          status_enum: newStatus,
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

        // Update the application record's payment_status
        const { data: application, error: appError } = await supabase
          .from("applications")
          .update({
            payment_status: newStatus,
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
        // We'll find the pending payment by the charge id in metadata? 
        // We don't store charge id. We'll skip for now.
        break;
      }
      case "charge.dispute.created": {
        const dispute = event.data.object;
        // We'll find the pending payment by the charge id in metadata? 
        // We don't store charge id. We'll skip for now.
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