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

  // Parse request body
  let body: {
    paymentId: string;
    userId: string;
    plan: string;
    amount: number;
    currency: string;
    method: string;
    confirmationTimestamp: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { paymentId, userId, plan, amount, currency, method, confirmationTimestamp } = body;

  // Prepare email content
  const subject = `New Payment Confirmation - Payment ID: ${paymentId}`;
  const text = `
A new payment has been confirmed and is awaiting manual account activation.

Payment Details:
- Payment ID: ${paymentId}
- User ID: ${userId}
- Plan: ${plan}
- Amount: ${amount} ${currency}
- Method: ${method}
- Confirmation Timestamp: ${confirmationTimestamp}

Please review the customer data and activate the account via the operator dashboard.
  `.trim();

  const html = `
<h2>New Payment Confirmation</h2>
<p>A new payment has been confirmed and is awaiting manual account activation.</p>
<h3>Payment Details:</h3>
<ul>
  <li><strong>Payment ID:</strong> ${paymentId}</li>
  <li><strong>User ID:</strong> ${userId}</li>
  <li><strong>Plan:</strong> ${plan}</li>
  <li><strong>Amount:</strong> ${amount} ${currency}</li>
  <li><strong>Method:</strong> ${method}</li>
  <li><strong>Confirmation Timestamp:</strong> ${confirmationTimestamp}</li>
</ul>
<p>Please review the customer data and activate the account via the operator dashboard.</p>
  `.trim();

  // Call the send-email function
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