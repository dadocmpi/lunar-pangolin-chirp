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

  // Authenticate the operator (the user making the request)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabaseToken = authHeader.substring(7);

  // Create a Supabase client with the service role to bypass RLS for admin operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Get the user from the token to check if they are an operator
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(supabaseToken);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fetch the user's app_metadata to check for operator flag
  const { data: adminUser, error: adminError } = await supabase.auth.admin.getUserById(
    user.id
  );
  if (adminError || !adminUser) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check if the user is an operator (assuming app_metadata.operator === true)
  const isOperator = adminUser.app_metadata?.operator === true;
  if (!isOperator) {
    return new Response(JSON.stringify({ error: "Forbidden: insufficient permissions" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse request body
  let body: { paymentId: string; action: "reject" | "request_info"; message?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { paymentId, action, message } = body;
  if (!paymentId || !action) {
    return new Response(JSON.stringify({ error: "Payment ID and action are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get the pending payment record to verify it exists and is in confirmed state with activation_pending
  const { data: pendingPayment, error: pendingError } = await supabase
    .from("pending_payments")
    .select("id, user_id, plan_name, amount_cents, currency, method, metadata, status")
    .eq("id", paymentId)
    .single();

  if (pendingError || !pendingPayment) {
    return new Response(JSON.stringify({ error: "Payment not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check that the payment is confirmed and activation is pending
  const metadata = pendingPayment.metadata as Record<string, any> || {};
  if (
    pendingPayment.status !== "confirmed" ||
    metadata.activation_status !== "activation_pending"
  ) {
    return new Response(
      JSON.stringify({
        error: "Payment is not in the correct state for this action",
        details: {
          status: pendingPayment.status,
          activation_status: metadata.activation_status,
        },
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Prepare update data based on action
  const activationTimestamp = new Date().toISOString();
  let newActivationStatus: string;
  let logReason: string;

  if (action === "reject") {
    newActivationStatus = "rejected";
    logReason = `Payment rejected by operator ${user.id} at ${activationTimestamp}`;
    if (message) {
      logReason += ` with message: ${message}`;
    }
  } else if (action === "request_info") {
    newActivationStatus = "info_requested";
    logReason = `More information requested by operator ${user.id} at ${activationTimestamp}`;
    if (message) {
      logReason += ` with message: ${message}`;
    }
  } else {
    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const updateData: Record<string, any> = {
    metadata: {
      ...metadata,
      activation_status: newActivationStatus,
      processed_at: activationTimestamp,
      processed_by: user.id,
      ...(message && { operator_message: message }),
    },
  };

  // Update the pending payment record
  const { error: updateError } = await supabase
    .from("pending_payments")
    .update(updateData)
    .eq("id", paymentId);

  if (updateError) {
    console.error("Failed to update pending payment for operator action:", updateError);
    return new Response(JSON.stringify({ error: "Failed to process operator action" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Insert an audit log entry for the action
  const { error: logError } = await supabase.rpc("log_payment_event", {
    p_payment_table: "pending_payments",
    p_payment_id: paymentId,
    p_operator: "admin", // Using admin as the actor type
    p_source: "admin",
    p_event_id: `operator-action:${action}:${paymentId}:${user.id}`,
    p_previous_status: "confirmed",
    p_new_status: "confirmed", // Payment status doesn't change
    p_reason: logReason,
  });

  if (logError) {
    console.error("Failed to log operator action:", logError);
    // We don't fail the action because the payment update succeeded
  }

  return new Response(JSON.stringify({ success: true, processedAt: activationTimestamp }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});