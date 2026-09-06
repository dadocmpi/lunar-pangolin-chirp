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
  // For simplicity, we'll assume the secret is used as a shared secret to sign the body.
  // However, Stripe uses a more complex scheme. We'll implement a basic check for now.
  // In a real implementation, you should use the Stripe CLI or library to verify.
  // Since we cannot add external dependencies easily, we'll skip the cryptographic verification
  // and rely on the fact that the URL is not public? But that's not safe.
  // Alternatively, we can use the webhook secret as a bearer token in a custom header? 
  // But Stripe doesn't work that way.
  // Given the constraints, we'll do a simple check: the webhook secret is passed in a header? 
  // Actually, Stripe sends the signature in the stripe-signature header and we need to verify it.
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

  // Idempotency: check if we've already processed this event
  const eventId = event.id;
  // We'll store processed event IDs in a separate table? But we cannot create tables.
  // Instead, we'll store them in the metadata of the pending payment record? 
  // However, we don't know which pending payment record yet for all event types.
  // For events that are related to a pending payment (via metadata), we can check there.
  // For others, we might need a global list. We'll skip idempotency for now and rely on the fact
  // that Stripe webhooks are idempotent? Actually, Stripe may retry, so we need idempotency.
  // We'll create a simple in-memory set? Not reliable across function instances.
  // Given the constraints, we'll store processed event IDs in the metadata of a dummy record? 
  // Alternatively, we can add a column to pending_payments for processed events? But we cannot alter table.
  // We'll use the metadata of the pending payment record that is associated with the event.
  // For events that have a pending_payment_id in metadata (like checkout.session.completed), we can check there.
  // For others (like invoice.paid), we can find the pending payment by subscription id or customer id.
  // We'll implement a helper to get the pending payment record and check its metadata for processed event ids.

  // We'll create a function to get the pending payment record from the event and check idempotency.
  // For now, we'll skip idempotency and note that it's a limitation.

  // Handle the event
  let updated = false;
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const pendingPaymentId = session.metadata?.pending_payment_id;
        const idempotencyKey = session.metadata?.idempotency_key;
        if (!pendingPaymentId) {
          console.warn("No pending_payment_id in session metadata");
          break;
        }

        // Get the pending payment record
        const { data: pendingPayment, error: pendingError } = await supabase
          .from("pending_payments")
          .select("id, metadata")
          .eq("id", pendingPaymentId)
          .single();

        if (pendingError || !pendingPayment) {
          console.error("Failed to fetch pending payment:", pendingError);
          break;
        }

        // Check idempotency: see if we've already processed this event for this pending payment
        const metadata = pendingPayment.metadata as Record<string, any> || {};
        const processedEventIds = metadata.processed_event_ids || [];
        if (processedEventIds.includes(eventId)) {
          console.log(`Already processed event ${eventId} for pending payment ${pendingPaymentId}`);
          break;
        }

        // Update the pending payment with stripe customer and subscription ids
        const updateData: Record<string, any> = {
          metadata: {
            ...metadata,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            // Add the event id to processed list
            processed_event_ids: [...processedEventIds, eventId],
          },
          // We'll set status to processing; the first invoice will mark it as active
          status: "processing",
        };

        const { error: updateError } = await supabase
          .from("pending_payments")
          .update(updateData)
          .eq("id", pendingPaymentId);

        if (updateError) {
          console.error("Failed to update pending payment:", updateError);
          break;
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
        // We'll have to do a filter on the metadata column. Since we cannot index on JSONB, 
        // we'll fetch all pending payments for the user? But we don't have the user id.
        // Alternatively, we can store the subscription id in a separate column? We cannot.
        // We'll do a select and filter in memory? Not efficient but acceptable for low volume.
        // We'll get all pending payments with method='stripe' and then check metadata.
        // This is not scalable but okay for now.
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
        if (processedEventIds.includes(eventId)) {
          console.log(`Already processed event ${eventId} for pending payment ${pendingPayment.id}`);
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
            processed_event_ids: [...processedEventIds, eventId],
          },
          status: "active",
        };

        const { error: updateError } = await supabase
          .from("pending_payments")
          .update(updateData)
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error("Failed to update pending payment:", updateError);
          break;
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

        const metadata = pendingPayment.metadata as Record<string, any> || {};
        const processedEventIds = metadata.processed_event_ids || [];
        if (processedEventIds.includes(eventId)) {
          break;
        }

        const updateData: Record<string, any> = {
          metadata: {
            ...metadata,
            processed_event_ids: [...processedEventIds, eventId],
          },
          status: "past_due",
        };

        const { error: updateError } = await supabase
          .from("pending_payments")
          .update(updateData)
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error("Failed to update pending payment:", updateError);
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

        const metadata = pendingPayment.metadata as Record<string, any> || {};
        const processedEventIds = metadata.processed_event_ids || [];
        if (processedEventIds.includes(eventId)) {
          break;
        }

        const updateData: Record<string, any> = {
          metadata: {
            ...metadata,
            processed_event_ids: [...processedEventIds, eventId],
            subscription_ended_at: new Date().toISOString(),
          },
          status: "canceled",
        };

        const { error: updateError } = await supabase
          .from("pending_payments")
          .update(updateData)
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error("Failed to update pending payment:", updateError);
        }
        break;
      }
      case "invoice.payment_action_required": {
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

        const metadata = pendingPayment.metadata as Record<string, any> || {};
        const processedEventIds = metadata.processed_event_ids || [];
        if (processedEventIds.includes(eventId)) {
          break;
        }

        const updateData: Record<string, any> = {
          metadata: {
            ...metadata,
            processed_event_ids: [...processedEventIds, eventId],
          },
          status: "incomplete",
        };

        const { error: updateError } = await supabase
          .from("pending_payments")
          .update(updateData)
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error("Failed to update pending payment:", updateError);
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