// Confirm Signup Edge Function
// Sends a custom confirmation email after user registration

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

const confirmSignupEmail = (name: string, confirmLink: string) => ({
  subject: "Confirm Your Signup — Braxel Markets",
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:#0a0e27;padding:40px;text-align:center}
    .header h1{color:#D4AF37;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0}
    .alert{padding:20px;background:#fff3cd;border-left:4px solid #ffc107;margin:20px 0}
    .body{padding:40px}
    .title{font-size:20px;font-weight:bold;color:#222;margin-bottom:20px}
    .text{font-size:15px;color:#555;line-height:1.7;margin-bottom:20px}
    .btn{display:inline-block;padding:16px 40px;background:#D4AF37;color:#000;text-decoration:none;font-weight:bold;text-transform:uppercase;letter-spacing:1px;border-radius:3px}
    .link{font-family:monospace;background:#f9f9f9;padding:10px;word-break:break-all;font-size:12px;border-radius:4px}
    .footer{padding:20px 40px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Braxel Markets</h1>
  </div>
  <div class="body">
    <div class="alert">
      <strong>⚠️ Confirm Your Email</strong>
      <p style="margin:10px 0 0;font-size:14px">Please verify your email address to complete your registration.</p>
    </div>
    <div class="title">Hello, ${escapeHtml(name)}</div>
    <p class="text">Thank you for registering with Braxel Markets. To activate your account and access our institutional trading platform, please click the button below to confirm your email address.</p>
    <p style="text-align:center;margin:30px 0">
      <a href="${confirmLink}" class="btn">Confirm Your Email</a>
    </p>
    <p class="text" style="font-size:12px;color:#888">Or copy and paste this link into your browser:<br/><span class="link">${confirmLink}</span></p>
    <p class="text">This link will expire in 24 hours for security purposes.</p>
    <p class="text">If you did not create an account with Braxel Markets, please ignore this email.</p>
    <p class="text">Best regards,<br/>Braxel Markets Team</p>
  </div>
  <div class="footer">© 2026 Braxel Markets — Institutional Trading Infrastructure</div>
</div>
</body>
</html>`,
  text:
    `Confirm Your Signup — Braxel Markets\n\nDear ${name},\n\nThank you for registering with Braxel Markets.\n\nTo activate your account, click the link below:\n${confirmLink}\n\nThis link will expire in 24 hours.\n\nIf you did not create an account, please ignore this email.\n\nBest regards,\nBraxel Markets Team`,
});

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

  try {
    const { userId, email, name, confirmationUrl } = await req.json();

    if (!userId || !email || !confirmationUrl) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: userId, email, confirmationUrl",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.log("CONFIRM SIGNUP EMAIL (Resend not configured):", {
        to: email,
        subject: "Confirm Your Signup — Braxel Markets",
        confirmationUrl,
      });
      return new Response(
        JSON.stringify({
          success: true,
          message: "Logged — configure RESEND_API_KEY to send emails",
          mock: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const emailContent = confirmSignupEmail(name || "User", confirmationUrl);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Braxel Markets <noreply@braxelmarkets.com>",
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      throw new Error(`Resend API failed: ${res.statusText}`);
    }

    const result = await res.json();

    console.log("Confirmation email sent successfully:", {
      to: email,
      emailId: result.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        emailId: result.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Confirm signup email error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send confirmation email" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
