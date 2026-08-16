// Crypto Confirmation Edge Function
// Called by admin when crypto payment is verified on blockchain
// Creates service account and sends confirmation email to user

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const COMPANY_EMAIL = "marketsbraxel@ouvidor.net";

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

async function sendUserCryptoConfirmedEmail(
  userEmail: string, 
  fullName: string, 
  planName: string, 
  amount: string, 
  accountId: string,
  network: string
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.log("CRYPTO PAYMENT CONFIRMED (Resend not configured):", { to: userEmail, planName, amount });
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
      <strong>✓ Payment Confirmed!</strong>
      <p style="margin:10px 0 0;font-size:14px">Your crypto payment has been verified on the blockchain. Your account is now active!</p>
    </div>
    <div class="title">Welcome, ${escapeHtml(fullName || "User")}!</div>
    <p class="text">Great news! Your crypto payment has been confirmed on the ${escapeHtml(network)}. Your trading account is now fully active. Here are your account details:</p>
    <div class="details">
      <p style="margin:5px 0;font-size:14px"><strong>Account ID:</strong> ${escapeHtml(accountId)}</p>
      <p style="margin:5px 0;font-size:14px"><strong>Plan:</strong> ${escapeHtml(planName)}</p>
      <p style="margin:5px 0;font-size:14px"><strong>Amount Paid:</strong> ${escapeHtml(amount)} USD</p>
      <p style="margin:5px 0;font-size:14px"><strong>Network:</strong> ${escapeHtml(network)}</p>
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

Great news! Your crypto payment has been confirmed on the ${network}. Your trading account is now fully active!

Account Details:
- Account ID: ${accountId}
- Plan: ${planName}
- Amount Paid: ${amount} USD
- Network: ${network}
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
        subject: `✓ Payment Confirmed — ${planName}`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend crypto confirmation email error:", err);
    } else {
      const result = await res.json();
      console.log("Crypto confirmation email sent:", { to: userEmail, emailId: result.id });
    }
  } catch (error) {
    console.error("Error sending crypto confirmation email:", error);
  }
}

serve(async (req) => {
  try {
    const { paymentId, txHash, adminSecret } = await req.json();

    // Simple admin verification (in production, use proper auth)
    const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET") || "braxel-admin-2026";
    if (adminSecret !== ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending payment
    const { data: pendingPayment, error: fetchError } = await supabaseClient
      .from('pending_payments')
      .select('*')
      .eq('payment_id', paymentId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !pendingPayment) {
      return new Response(JSON.stringify({ error: 'Payment not found or already processed' }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', pendingPayment.user_id)
      .single();

    // Create service account
    const accountId = `ACC-${Math.floor(100000 + Math.random() * 900000)}`
    const { error: serviceError } = await supabaseClient
      .from('services')
      .insert([{
        user_id: pendingPayment.user_id,
        plan_name: pendingPayment.plan_name,
        account_id: accountId,
        status: 'Active',
        balance: parseFloat(pendingPayment.amount_usd)
      }]);

    if (serviceError) {
      console.error("[crypto-confirmation] Service creation error:", serviceError);
      throw serviceError;
    }

    // Update pending payment status
    await supabaseClient
      .from('pending_payments')
      .update({ 
        status: 'confirmed', 
        confirmed_at: new Date().toISOString(),
        tx_hash: txHash,
        account_id: accountId
      })
      .eq('payment_id', paymentId);

    // Send confirmation email to user
    await sendUserCryptoConfirmedEmail(
      profile?.email || '',
      profile?.full_name || '',
      pendingPayment.plan_name,
      pendingPayment.amount_usd,
      accountId,
      pendingPayment.network
    );

    console.log(`[crypto-confirmation] SUCCESS: Payment ${paymentId} confirmed, account ${accountId} created`);
    return new Response(JSON.stringify({ 
      success: true, 
      accountId,
      message: 'Payment confirmed and user notified'
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("[crypto-confirmation] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
})
