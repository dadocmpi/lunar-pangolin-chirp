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
      },
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
  // We need to use the admin API to get the full user record
  const { data: adminUser, error: adminError } = await supabase.auth.admin
    .getUserById(
      user.id,
    );
  if (adminError || !adminUser) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check if the user is an operator (assuming app_metadata.operator === true)
  const adminMeta =
    (adminUser as { app_metadata?: Record<string, unknown> | null })
      ?.app_metadata ?? {};
  const isOperator = adminMeta.operator === true;
  if (!isOperator) {
    return new Response(
      JSON.stringify({ error: "Forbidden: insufficient permissions" }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Parse request body
  let body: { paymentId: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { paymentId } = body;
  if (!paymentId) {
    return new Response(JSON.stringify({ error: "Payment ID is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get the pending payment record to verify it exists and is in confirmed state with activation_pending
  const { data: pendingPayment, error: pendingError } = await supabase
    .from("pending_payments")
    .select(
      "id, user_id, plan_name, amount_cents, currency, method, metadata, status, status_enum",
    )
    .eq("id", paymentId)
    .single();

  if (pendingError || !pendingPayment) {
    return new Response(JSON.stringify({ error: "Payment not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Require BOTH: pending_payments payment state = payment_confirmed AND
  // the linked application row has activation_status = activation_pending.
  // Activation is manual, operator-only, and double-gated.
  const metadata =
    (pendingPayment.metadata as Record<string, unknown> | null) ?? {};
  const applicationId: string | undefined =
    typeof metadata.application_id === "string"
      ? metadata.application_id
      : undefined;
  if (!applicationId) {
    return new Response(
      JSON.stringify({ error: "Payment has no linked application" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const { data: application, error: appFetchError } = await supabase
    .from("applications")
    .select("id, payment_status, activation_status")
    .eq("id", applicationId)
    .single();

  if (appFetchError || !application) {
    return new Response(
      JSON.stringify({ error: "Linked application not found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const paymentConfirmed = pendingPayment.status === "confirmed" ||
    pendingPayment.status === "payment_confirmed" ||
    pendingPayment.status_enum === "confirmed" ||
    pendingPayment.status_enum === "payment_confirmed";
  const appReadyForActivation =
    application.payment_status === "payment_confirmed" &&
    application.activation_status === "activation_pending";

  if (!paymentConfirmed || !appReadyForActivation) {
    return new Response(
      JSON.stringify({
        error:
          "Payment or application is not in the correct state for activation",
        details: {
          pending_payment_status: pendingPayment.status,
          pending_payment_status_enum: pendingPayment.status_enum,
          application_payment_status: application.payment_status,
          application_activation_status: application.activation_status,
        },
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Prepare update data: set activation_status to account_active, record operator ID and timestamp
  const activationTimestamp = new Date().toISOString();
  const updateData: Record<string, unknown> = {
    metadata: {
      ...metadata,
      activation_status: "account_active",
      activated_at: activationTimestamp,
      activated_by: user.id, // operator's user ID
    },
  };

  // Update the pending payment record
  const { error: updateError } = await supabase
    .from("pending_payments")
    .update(updateData)
    .eq("id", paymentId);

  if (updateError) {
    console.error(
      "Failed to update pending payment for activation:",
      updateError,
    );
    return new Response(
      JSON.stringify({ error: "Failed to activate account" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Mirror activation state onto the application row so the dashboard sees it.
  const { error: appUpdateError } = await supabase
    .from("applications")
    .update({
      activation_status: "account_active",
      activated_at: activationTimestamp,
      activated_by: user.id,
      updated_at: activationTimestamp,
    })
    .eq("id", applicationId);

  if (appUpdateError) {
    console.error(
      "Failed to update application activation status:",
      appUpdateError,
    );
    // Activation already happened on the payment; surface the error but do not double-activate.
    return new Response(
      JSON.stringify({
        error:
          "Activated on payment record but failed to update application row",
        details: appUpdateError.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Insert an audit log entry for the activation
  const { error: logError } = await supabase.rpc("log_payment_event", {
    p_payment_table: "pending_payments",
    p_payment_id: paymentId,
    p_operator: "admin",
    p_source: "admin",
    p_event_id:
      `activate-account:${paymentId}:${user.id}:${activationTimestamp}`,
    p_previous_status: "payment_confirmed",
    p_new_status: "account_active",
    p_reason:
      `Account manually activated by operator ${user.id} at ${activationTimestamp}`,
  });

  if (logError) {
    console.error("Failed to log activation event:", logError);
  }

  return new Response(
    JSON.stringify({
      success: true,
      activatedAt: activationTimestamp,
      activatedBy: user.id,
      applicationId,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
