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

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Authenticate user (operator)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = authHeader.substring(7);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Operator-only check: app_metadata.operator must be true.
  const { data: adminUser, error: adminError } = await supabase.auth.admin.getUserById(
    user.id
  );
  if (adminError || !adminUser) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const isOperator = adminUser.app_metadata?.operator === true;
  if (!isOperator) {
    return new Response(JSON.stringify({ error: "Forbidden: insufficient permissions" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse request body
  let body: { applicationId: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { applicationId } = body;
  if (!applicationId) {
    return new Response(
      JSON.stringify({ error: "Missing applicationId" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Dual-gate: require payment_status = payment_confirmed AND activation_status = activation_pending.
  const { data: application, error: fetchError } = await supabase
    .from("applications")
    .select("id, payment_status, activation_status")
    .eq("id", applicationId)
    .single();

  if (fetchError || !application) {
    return new Response(JSON.stringify({ error: "Application not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (
    application.payment_status !== "payment_confirmed" ||
    application.activation_status !== "activation_pending"
  ) {
    return new Response(
      JSON.stringify({
        error: "Application is not in the correct state for activation",
        details: {
          payment_status: application.payment_status,
          activation_status: application.activation_status,
        },
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Update the application record
  const { data: updatedApplication, error: updateError } = await supabase
    .from("applications")
    .update({
      activation_status: "account_active",
      activated_by: user.id,
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", applicationId)
    .select()
    .single();

  if (updateError || !updatedApplication) {
    console.error("Application activation error:", updateError);
    return new Response(
      JSON.stringify({ error: "Failed to activate application" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Create an audit log entry for the activation
  const { error: auditError } = await supabase
    .from("payment_audit_log")
    .insert({
      payment_table: "applications",
      payment_id: applicationId,
      user_id: user.id,
      actor: "operator",
      source: "admin",
      event_id: `application-activate:${applicationId}:${user.id}:${new Date().toISOString()}`,
      previous_status: application.activation_status,
      new_status: "account_active",
      reason: `Application manually activated by operator ${user.id}`,
      created_at: new Date().toISOString(),
    });

  if (auditError) {
    console.error("Audit log error:", auditError);
    // We don't fail the activation if audit log fails, but we log it
  }

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});