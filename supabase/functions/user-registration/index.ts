// User Registration Notification Edge Function
// Sends email notification to company when a new user registers

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const COMPANY_EMAIL = "marketsbraxel@ouvidor.net";

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { userId, email, fullName, phone, country } = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("NEW USER REGISTRATION (Resend not configured):", {
        to: COMPANY_EMAIL,
        email,
        fullName
      });
      return new Response(JSON.stringify({ success: true, message: "Logged" }), {
        headers: { "Content-Type": "application/json" }
      });
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
    .alert{padding:20px;background:#cce5ff;border-left:4px solid #007bff;margin:20px 0}
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
    <p>New User Registration</p>
  </div>
  <div class="body">
    <div class="alert">
      <strong>👤 NEW USER REGISTERED</strong>
      <p style="margin:10px 0 0;font-size:14px">A new user has created an account on the platform.</p>
    </div>
    <div class="field"><div class="label">User ID</div><div class="value">${escapeHtml(userId || 'N/A')}</div></div>
    <div class="field"><div class="label">Email</div><div class="value">${escapeHtml(email || 'N/A')}</div></div>
    <div class="field"><div class="label">Full Name</div><div class="value">${escapeHtml(fullName || 'N/A')}</div></div>
    ${phone ? `<div class="field"><div class="label">Phone</div><div class="value">${escapeHtml(phone)}</div></div>` : ''}
    ${country ? `<div class="field"><div class="label">Country</div><div class="value">${escapeHtml(country)}</div></div>` : ''}
    <div class="field"><div class="label">Status</div><div class="value" style="color:#ffc107">AWAITING EMAIL VERIFICATION</div></div>
    <div class="field"><div class="label">Registered At</div><div class="value">${new Date().toUTCString()}</div></div>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
    <p style="font-size:12px;color:#888">This user has not yet completed KYC verification or made a purchase.</p>
  </div>
  <div class="footer">Automated notification — Braxel Markets Registration System</div>
</div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Braxel Markets <noreply@braxelmarkets.com>",
        to: COMPANY_EMAIL,
        subject: `👤 NEW REGISTRATION — ${email}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend registration notification error:", err);
      return new Response(JSON.stringify({ error: 'Failed to send notification' }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const result = await res.json();
    console.log("Registration notification sent:", { email, emailId: result.id });

    return new Response(JSON.stringify({ success: true, emailId: result.id }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[user-registration] Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process registration notification" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
})
