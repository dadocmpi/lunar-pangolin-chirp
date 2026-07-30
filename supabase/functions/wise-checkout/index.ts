// Wise Checkout Edge Function
// Processes Wise bank transfer confirmations and sends email notifications via Resend

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const COMPANY_EMAIL = "marketsbraxel@ouvidor.net";

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

async function sendUserWisePendingEmail(userEmail: string, fullName: string, planName: string, amount: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.log("WISE PAYMENT PENDING (Resend not configured):", { to: userEmail, planName, amount });
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
    .pending{padding:20px;background:#fff3cd;border-left:4px solid #ffc107;margin:20px 0}
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
    <div class="pending">
      <strong>⏳ Transfer Pending Verification</strong>
      <p style="margin:10px 0 0;font-size:14px">Your Wise bank transfer request has been received and is pending verification.</p>
    </div>
    <div class="title">Hello, ${escapeHtml(fullName || "User")}!</div>
    <p class="text">We have received your bank transfer confirmation. Our team will verify the transfer and activate your account within 1-3 business days.</p>
    <div class="details">
      <p style="margin:5px 0;font-size:14px"><strong>Plan:</strong> ${escapeHtml(planName)}</p>
      <p style="margin:5px 0;font-size:14px"><strong>Amount:</strong> ${escapeHtml(amount)}</p>
      <p style="margin:5px 0;font-size:14px"><strong>Payment Method:</strong> Wise Bank Transfer</p>
      <p style="margin:5px 0;font-size:14px"><strong>Status:</strong> Pending Verification</p>
    </div>
    <p class="text">You will receive an email confirmation once your payment is verified and your account is activated.</p>
    <p class="text">If you have any questions, our institutional support team is available 24/7.</p>
    <p class="text">Best regards,<br/>Braxel Markets Team</p>
  </div>
  <div class="footer">© 2026 Braxel Markets — Institutional Trading Infrastructure</div>
</div>
</body>
</html>`;

  const text = `Bank Transfer Pending — Braxel Markets

Dear ${fullName || "User"},

We have received your bank transfer confirmation. Our team will verify the transfer and activate your account within 1-3 business days.

Details:
- Plan: ${planName}
- Amount: ${amount}
- Payment Method: Wise Bank Transfer
- Status: Pending Verification

You will receive an email confirmation once your payment is verified.

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
        subject: `Bank Transfer Pending — ${planName}`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend wise pending email error:", err);
    } else {
      const result = await res.json();
      console.log("Wise pending email sent:", { to: userEmail, emailId: result.id });
    }
  } catch (error) {
    console.error("Error sending wise pending email:", error);
  }
}

async function sendCompanyWiseRequestEmail(
  userEmail: string, 
  fullName: string, 
  planName: string, 
  amount: string, 
  paymentId: string
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.log("NEW WISE PAYMENT REQUEST (Resend not configured):", {
      to: COMPANY_EMAIL,
      userEmail,
      planName,
      amount
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
    .header{background:#0a0e27;padding:32px;text-align:center}
    .header h1{color:#D4AF37;font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px}
    .header p{color:#aaa;font-size:12px;margin:0}
    .body{padding:32px}
    .alert{padding:20px;background:#fff3cd;border-left:4px solid #ffc107;margin:20px 0}
    .field{margin-bottom:12px;padding:14px;background:#f9f9f9;border-left:4px solid #D4AF37}
    .label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px}
    .value{font-size:15px;font-weight:700;color:#222}
    .footer{padding:20px 32px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Braxel Markets</h1>
    <p>New Wise Bank Transfer — ACTION REQUIRED</p>
  </div>
  <div class="body">
    <div class="alert">
      <strong>🏦 NEW WISE BANK TRANSFER REQUEST</strong>
      <p style="margin:10px 0 0;font-size:14px">A user has confirmed a bank transfer via Wise. You must verify the transfer in your Wise account and manually activate the account.</p>
    </div>
    <div class="field"><div class="label">Payment ID</div><div class="value">${escapeHtml(paymentId)}</div></div>
    <div class="field"><div class="label">User Email</div><div class="value">${escapeHtml(userEmail)}</div></div>
    <div class="field"><div class="label">User Name</div><div class="value">${escapeHtml(fullName || "N/A")}</div></div>
    <div class="field"><div class="label">Plan</div><div class="value">${escapeHtml(planName)}</div></div>
    <div class="field"><div class="label">Amount</div><div class="value">${escapeHtml(amount)}</div></div>
    <div class="field"><div class="label">Payment Method</div><div class="value">Wise Bank Transfer</div></div>
    <div class="field"><div class="label">Status</div><div class="value" style="color:#ffc107">PENDING — VERIFICATION REQUIRED</div></div>
    <div class="field"><div class="label">Timestamp</div><div class="value">${new Date().toUTCString()}</div></div>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
    <p style="font-size:13px;color:#666"><strong>⚠️ Action Required:</strong></p>
    <ol style="font-size:12px;color:#666;margin:12px 0;padding-left:20px">
      <li>Log into your Wise account to verify the incoming transfer</li>
      <li>Check that the amount matches the plan price</li>
      <li>Once confirmed, create the service account in the database</li>
      <li>Send confirmation email to the user</li>
    </ol>
  </div>
  <div class="footer">Automated notification — Braxel Markets Payment System</div>
</div>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Braxel Markets <payments@braxelmarkets.com>",
        to: COMPANY_EMAIL,
        subject: `🏦 NEW: Wise Transfer — ${amount} — ${planName} — ${userEmail}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend company wise notification error:", err);
    } else {
      const result = await res.json();
      console.log("Company wise request notification sent:", { emailId: result.id });
    }
  } catch (error) {
    console.error("Error sending company wise notification:", error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("[wise-checkout] Unauthorized: Missing Authorization header")
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      console.error("[wise-checkout] Unauthorized: Invalid token", authError)
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const { planName, accountSize, amount, paymentMethod } = await req.json()

    // Create a pending payment record
    const paymentId = `WISE-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const balance = parseFloat(accountSize.replace(/[^0-9.]/g, ''))

    // Store pending payment for manual verification
    const { error: dbError } = await supabaseClient
      .from('pending_payments')
      .insert([{
        user_id: user.id,
        payment_id: paymentId,
        plan_name: planName,
        network: 'WISE',
        amount_usd: amount,
        user_address: 'N/A',
        status: 'pending',
        created_at: new Date().toISOString()
      }])

    if (dbError) {
      console.error("[wise-checkout] Database Error:", dbError)
      throw dbError
    }

    // Send pending confirmation email to user
    await sendUserWisePendingEmail(
      user.email || '',
      profile?.full_name || '',
      planName,
      amount
    );

    // Send notification to company for manual verification
    await sendCompanyWiseRequestEmail(
      user.email || '',
      profile?.full_name || '',
      planName,
      amount,
      paymentId
    );

    console.log(`[wise-checkout] SUCCESS: Wise payment pending for user ${user.id}, Payment ID: ${paymentId}`)
    return new Response(JSON.stringify({ 
      status: 'pending', 
      paymentId,
      message: 'Transfer confirmation received. Your account will be activated after verification (1-3 business days).'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error: any) {
    console.error("[wise-checkout] Critical Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
