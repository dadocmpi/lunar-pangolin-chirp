// Card Checkout Edge Function
// Processes card payments and sends email notifications via Resend

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

async function sendUserPaymentEmail(
  userEmail: string,
  fullName: string,
  planName: string,
  amount: string,
  accountId: string,
  paymentMethod: string,
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.log("CARD PAYMENT CONFIRMATION (Resend not configured):", {
      to: userEmail,
      planName,
      amount,
    });
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:#0a0e27;padding:40px;text-align:center}
    .header h1{color:#D4AF37;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0}
    .success{padding:20px;background:#d4edda;border-left:4px solid #28a745;margin:20px 0}
    .details{padding:20px;background:#f9f9f9;border-radius:4px;margin:20px 0}
    .body{padding:40px}
    .title{font-size:20px;font-weight:bold;color:#222;margin-bottom:20px}
    .text{font-size:15px;color:#555;line-height:1.7;margin-bottom:20px}
    .btn{display:inline-block;padding:16px 40px;background:#D4AF37;color:#000;text-decoration:none;font-weight:bold;text-transform:uppercase;letter-spacing:1px;border-radius:3px}
    .footer{padding:20px 40px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Braxel Markets</h1>
  </div>
  <div class="body">
    <div class="success">
      <strong>✓ Payment Confirmed</strong>
      <p style="margin:10px 0 0;font-size:14px">Your card payment has been successfully processed.</p>
    </div>
    <div class="title">Welcome, ${escapeHtml(fullName || "User")}!</div>
    <p class="text">Your payment has been confirmed and your trading account is now active. Here are your account details:</p>
    <div class="details">
      <p style="margin:5px 0;font-size:14px"><strong>Account ID:</strong> ${
    escapeHtml(accountId)
  }</p>
      <p style="margin:5px 0;font-size:14px"><strong>Plan:</strong> ${
    escapeHtml(planName)
  }</p>
      <p style="margin:5px 0;font-size:14px"><strong>Amount Paid:</strong> ${
    escapeHtml(amount)
  }</p>
      <p style="margin:5px 0;font-size:14px"><strong>Payment Method:</strong> ${
    escapeHtml(paymentMethod)
  }</p>
      <p style="margin:5px 0;font-size:14px"><strong>Status:</strong> Active</p>
    </div>
    <p class="text">Your infrastructure deployment is in progress. Within the next few minutes, your algorithmic trading system will be operational.</p>
    <p style="text-align:center;margin:30px 0">
      <a href="#" class="btn">Access Your Dashboard</a>
    </p>
    <p class="text">If you have any questions, our institutional support team is available 24/7.</p>
    <p class="text">Best regards,<br/>Braxel Markets Team</p>
  </div>
  <div class="footer">© 2026 Braxel Markets — Institutional Trading Infrastructure</div>
</div>
</body>
</html>`;

  const text = `Payment Confirmed — Braxel Markets

Dear ${fullName || "User"},

Your card payment has been successfully processed!

Account Details:
- Account ID: ${accountId}
- Plan: ${planName}
- Amount Paid: ${amount}
- Payment Method: ${paymentMethod}
- Status: Active

Your infrastructure deployment is in progress. Within the next few minutes, your algorithmic trading system will be operational.

Access your dashboard to monitor your account.

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
        subject: `Payment Confirmed — ${planName}`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend payment confirmation error:", err);
    } else {
      const result = await res.json();
      console.log("Card payment confirmation email sent:", {
        to: userEmail,
        emailId: result.id,
      });
    }
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
  }
}

async function sendCompanyNotificationEmail(
  userEmail: string,
  fullName: string,
  planName: string,
  amount: string,
  accountId: string,
  cardLast4?: string,
  country?: string,
  phone?: string,
) {
  // Owner notification routed through the single central module. Only the
  // last 4 digits of the card are included — never the full number.
  await notifyOwner({
    type: "compra",
    subject: `Nova compra por cartão — ${planName}`,
    replyTo: userEmail,
    data: {
      cliente: fullName || "N/A",
      email: userEmail,
      plano: planName,
      valor: amount,
      account_id: accountId,
      cartao_final: cardLast4 ? `**** ${cardLast4}` : null,
      pais: country,
      telefone: phone,
      status: "completed",
      metodo: "card",
      origem: "card-checkout",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error(
        "[card-checkout] Unauthorized: Missing Authorization header",
      );
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: { user }, error: authError } = await supabaseClient.auth
      .getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      console.error("[card-checkout] Unauthorized: Invalid token", authError);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const {
      planName,
      accountSize,
      cardLast4,
      cardName,
      amount,
      country,
      phone,
    } = await req.json();

    // Create service/account
    const accountId = `ACC-${Math.floor(100000 + Math.random() * 900000)}`;
    const balance = parseFloat(accountSize.replace(/[^0-9.]/g, ""));

    const { error: dbError } = await supabaseClient
      .from("services")
      .insert([{
        user_id: user.id,
        plan_name: planName,
        account_id: accountId,
        status: "Active",
        balance: balance,
      }]);

    if (dbError) {
      console.error("[card-checkout] Database Error:", dbError);
      throw dbError;
    }

    // Send confirmation email to user
    await sendUserPaymentEmail(
      user.email || "",
      profile?.full_name || cardName || "",
      planName,
      amount,
      accountId,
      `Card **** ${cardLast4}`,
    );

    // Send notification to company
    await sendCompanyNotificationEmail(
      user.email || "",
      profile?.full_name || cardName || "",
      planName,
      amount,
      accountId,
      cardLast4,
      country,
      phone,
    );

    console.log(
      `[card-checkout] SUCCESS: Payment processed for user ${user.id}`,
    );
    return new Response(JSON.stringify({ status: "success", accountId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("[card-checkout] Critical Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
