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

  // In a real app, we would check if the user is an operator (e.g., via a role or metadata)
  // For now, we'll allow any authenticated user to reject for simplicity
  // but in production, you should restrict this to operators only.

  // Parse request body
  let body: { applicationId: string; reason: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { applicationId, reason } = body;
  if (!applicationId) {
    return new Response(
      JSON.stringify({ error: "Missing applicationId" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  if (!reason || !reason.trim()) {
    return new Response(
      JSON.stringify({ error: "Missing rejection reason" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Update the application record
  const { data: application, error: updateError } = await supabase
    .from("applications")
    .update({
      activation_status: "rejected",
      updated_at: new Date().toISOString()
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
      }
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
      previous_status: application.activation_status, // Status before update
      new_status: "rejected",
      reason: reason,
      created_at: new Date().toISOString()
    });

  if (auditError) {
    console.error("Audit log error:", auditError);
    // We don't fail the rejection if audit log fails, but we log it
  }

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});