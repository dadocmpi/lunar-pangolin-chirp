// Withdrawal Notification Edge Function
// Sends email confirmation when user requests a withdrawal

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { notifyOwner } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};


function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

async function sendUserWithdrawalEmail(
  userEmail: string,
  fullName: string,
  amount: string,
  method: string,
  iban?: string,
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.log("WITHDRAWAL EMAIL (Resend not configured):", {
      to: userEmail,
      amount,
      method,
    });
    return;
  }

  const maskedIban = iban ? `****${iban.slice(-4)}` : "N/A";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:#0a0e27;padding:40px;text-align:center}
    .header h1{color:#D4AF37;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0}
    .pending{padding:20px;background:#fff3cd;border-left:4px solid #ffc107;margin:20px 0}
    .details{padding:20px;background:#f9f9f9;border-radius:4px;margin:20px 0}
    .body{padding:40px}
    .title{font-size:20px;font-weight:bold;color:#222;margin-bottom:20px}
    .text{font-size:15px;color:#555;line-height:1.7;margin-bottom:20px}
    .footer{padding:20px 40px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Braxel Markets</h1>
  </div>
  <div class="body">
    <div class="pending">
      <strong>⏳ Withdrawal Request Received</strong>
      <p style="margin:10px 0 0;font-size:14px">Your withdrawal request has been received and is being processed.</p>
    </div>
    <div class="title">Withdrawal Request, ${
    escapeHtml(fullName || "User")
  }</div>
    <p class="text">We have received your withdrawal request. Here are the details:</p>
    <div class="details">
      <p style="margin:5px 0;font-size:14px"><strong>Amount:</strong> ${
    escapeHtml(amount)
  }</p>
      <p style="margin:5px 0;font-size:14px"><strong>Method:</strong> ${
    escapeHtml(method)
  }</p>
      ${
    iban
      ? `<p style="margin:5px 0;font-size:14px"><strong>Destination:</strong> ${
        escapeHtml(maskedIban)
      }</p>`
      : ""
  }
      <p style="margin:5px 0;font-size:14px"><strong>Status:</strong> Processing</p>
    </div>
    <p class="text">Your withdrawal will be processed within 1-3 business days. You will receive another email once the transfer is complete.</p>
    <p class="text">If you have any questions, please contact our support team.</p>
    <p class="text">Best regards,<br/>Braxel Markets Team</p>
  </div>
  <div class="footer">© 2026 Braxel Markets — Institutional Trading Infrastructure</div>
</div>
</body>
</html>`;

  const text = `Withdrawal Request Received — Braxel Markets

Dear ${fullName || "User"},

We have received your withdrawal request. Here are the details:

Amount: ${amount}
Method: ${method}
${iban ? `Destination: ${maskedIban}` : ""}
Status: Processing

Your withdrawal will be processed within 1-3 business days. You will receive another email once the transfer is complete.

Best regards,
Braxel Markets Team`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Braxel Markets <noreply@braxelmarkets.com>",
        to: userEmail,
        subject: `Withdrawal Request Received — ${amount}`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend withdrawal email error:", err);
    } else {
      const result = await res.json();
      console.log("Withdrawal confirmation email sent:", {
        to: userEmail,
        emailId: result.id,
      });
    }
  } catch (error) {
    console.error("Error sending withdrawal email:", error);
  }
}

async function sendCompanyNotificationEmail(
  amount: string,
  userEmail: string,
  fullName: string,
  method: string,
  iban?: string,
) {
  // Owner notification routed through the single central module. The IBAN is
  // masked (last 4 only) and never sent in full.
  const maskedIban = iban ? `****${iban.slice(-4)}` : "N/A";
  await notifyOwner({
    type: "pagamento",
    subject: `Solicitação de saque — ${amount}`,
    replyTo: userEmail,
    data: {
      cliente: fullName || "N/A",
      email: userEmail,
      valor: amount,
      metodo: method || "Bank Transfer",
      destino: maskedIban,
      status: "processing",
      origem: "withdrawal-notification",
    },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Extract Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error(
        "[withdrawal-notification] Unauthorized: Missing Authorization header",
      );
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Initialize Supabase client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    // 3. Verify the JWT and get user data
    const { data: { user }, error: authError } = await supabaseClient.auth
      .getUser();

    if (authError || !user) {
      console.error(
        "[withdrawal-notification] Unauthorized: Invalid or expired token",
        authError,
      );
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Get user profile for full name
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // 5. Parse request body
    const { accountId, amount, method, iban } = await req.json();

    // 6. Verify account ownership in the database
    const { data: service, error: serviceError } = await supabaseClient
      .from("services")
      .select("id")
      .eq("account_id", accountId)
      .eq("user_id", user.id)
      .single();

    if (serviceError || !service) {
      console.warn(
        `[withdrawal-notification] Security Alert: User ${user.id} attempted to withdraw from unauthorized account ${accountId}`,
      );
      return new Response(
        JSON.stringify({ error: "Forbidden: Account ownership not verified" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 7. Send confirmation email to user
    await sendUserWithdrawalEmail(
      user.email || "",
      profile?.full_name || "",
      amount,
      method || "Bank Transfer",
      iban,
    );

    // 8. Send notification to company
    await sendCompanyNotificationEmail(
      amount,
      user.email || "",
      profile?.full_name || "",
      method || "Bank Transfer",
      iban,
    );

    // Success response
    return new Response(
      JSON.stringify({
        message: "Withdrawal request received. Confirmation email sent.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("[withdrawal-notification] Critical Error", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
