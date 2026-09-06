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

  // Authenticate user
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

  // Parse request body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Extract and validate required fields
  const {
    full_name,
    email,
    residential_address_line1,
    residential_address_line2,
    city,
    region,
    postal_code,
    country,
    phone,
    terms_accepted,
    privacy_accepted,
    customer_note,
    plan_key,
    // We'll also accept plan_name and plan_price_eur for reference, but we won't use them to determine the plan
    plan_name,
    plan_price_eur,
  } = body;

  // Basic validation (the form should have validated, but we double-check)
  if (!full_name || !email || !country) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Simple email validation
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ error: "Invalid email format" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Check that terms and privacy are accepted
  if (!terms_accepted || !privacy_accepted) {
    return new Response(
      JSON.stringify({ error: "Terms and privacy must be accepted" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Limit customer note length
  const note = customer_note || "";
  if (note.length > 500) {
    return new Response(
      JSON.stringify({ error: "Customer note too long" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Insert the application record
  const { data: application, error: insertError } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      plan_key,
      full_name,
      email,
      residential_address_line1,
      residential_address_line2,
      city,
      region,
      postal_code,
      country,
      phone,
      terms_accepted_at: new Date().toISOString(),
      terms_version: "1.0", // In a real app, this would be dynamic
      privacy_accepted_at: new Date().toISOString(),
      privacy_version: "1.0", // In a real app, this would be dynamic
      customer_note: note,
      // payment_status and activation_status will be set by default (pending)
    })
    .select("id")
    .single();

  if (insertError || !application) {
    console.error("Application insert error:", insertError);
    return new Response(
      JSON.stringify({ error: "Failed to submit application" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({ application_id: application.id }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});