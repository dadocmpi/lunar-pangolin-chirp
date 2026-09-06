import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
  const operatorEmail = Deno.env.get("OPERATOR_EMAIL");
  if (!operatorEmail) {
    return new Response(
      JSON.stringify({ error: "Operator email not configured" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Parse request body — accepts both old and new field shapes for backward compatibility.
  let body: {
    paymentId: string;
    userId: string;
    plan: string;
    amount: number;
    currency: string;
    method: string;
    confirmationTimestamp: string;
    applicationId?: string | null;
    customerName?: string | null;
    customerEmail?: string | null;
    customerCountry?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const {
    paymentId,
    userId,
    plan,
    amount,
    currency,
    method,
    confirmationTimestamp,
    applicationId,
    customerName,
    customerEmail,
    customerCountry,
  } = body;

  // Resolve Supabase URL once. We need it for both the dashboard link and the send-email call.
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
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

  // Build a secure dashboard link — applicationId is internal-only, not guessable.
  const dashboardUrl = applicationId
    ? `${supabaseUrl}/operator-dashboard?applicationId=${applicationId}`
    : `${supabaseUrl}/operator-dashboard`;

  // Prepare email content — deliberately omits full residential address from the email body.
  const subject = `Payment Confirmed — Activation Required (${plan ?? "unknown plan"})`;
  const text = `
A new payment has been confirmed and is awaiting manual account activation.

Activation Required:
${dashboardUrl}

Payment Details:
- Payment ID: ${paymentId}
- Plan: ${plan ?? "unknown"}
- Amount: ${amount != null ? `${(amount / 100).toFixed(2)} ${(currency ?? "usd").toUpperCase()}` : "unknown"}
- Method: ${method ?? "unknown"}
- Confirmation Timestamp: ${confirmationTimestamp}

Customer Details:
- Name: ${customerName ?? "unknown"}
- Email: ${customerEmail ?? "unknown"}
- Country: ${customerCountry ?? "unknown"}

Please review the application and activate the account via the operator dashboard.
  `.trim();

  const html = `
<h2>Payment Confirmed — Activation Required</h2>
<p>A new payment has been confirmed and is awaiting <strong>manual account activation</strong>.</p>

<p><a href="${dashboardUrl}" style="background:#D4AF37;color:#000;padding:10px 20px;text-decoration:none;font-weight:bold;">Open Operator Dashboard</a></p>

<h3>Payment Details</h3>
<ul>
  <li><strong>Payment ID:</strong> ${paymentId}</li>
  <li><strong>Plan:</strong> ${plan ?? "unknown"}</li>
  <li><strong>Amount:</strong> ${amount != null ? `${(amount / 100).toFixed(2)} ${(currency ?? "usd").toUpperCase()}` : "unknown"}</li>
  <li><strong>Method:</strong> ${method ?? "unknown"}</li>
  <li><strong>Confirmed at:</strong> ${confirmationTimestamp}</li>
</ul>

<h3>Customer Details</h3>
<ul>
  <li><strong>Name:</strong> ${customerName ?? "unknown"}</li>
  <li><strong>Email:</strong> ${customerEmail ?? "unknown"}</li>
  <li><strong>Country:</strong> ${customerCountry ?? "unknown"}</li>
</ul>

<p style="color:#888;font-size:12px;">Note: Full residential address is available in the secure operator dashboard only.</p>
  `.trim();

  // Call the send-email function (supabaseUrl and supabaseServiceKey already resolved above)
  const emailPayload = {
    to: operatorEmail,
    subject,
    text,
    html,
  };

  try {
    const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailRes.ok) {
      const errorText = await emailRes.text();
      console.error("Send-email function error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send notification" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailResult = await emailRes.json();
    return new Response(JSON.stringify({ success: true, emailId: emailResult.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to call send-email function:", err);
    return new Response(JSON.stringify({ error: "Failed to send notification" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});