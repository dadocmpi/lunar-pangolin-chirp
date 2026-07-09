// Send Email Edge Function
// Generic email sender using Resend API
// Can be used for various email notifications across the platform

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Email templates for different notification types
export const emailTemplates = {
  confirmSignup: (name: string, confirmLink: string) => ({
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
    text: `Confirm Your Signup — Braxel Markets\n\nDear ${name},\n\nThank you for registering with Braxel Markets.\n\nTo activate your account, click the link below:\n${confirmLink}\n\nThis link will expire in 24 hours.\n\nIf you did not create an account, please ignore this email.\n\nBest regards,\nBraxel Markets Team`
  }),

  welcome: (name: string, email: string) => ({
    subject: "Welcome to Braxel Markets",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:#0a0e27;padding:40px;text-align:center}
    .header h1{color:#D4AF37;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0}
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
    <div class="title">Welcome, ${escapeHtml(name)}!</div>
    <p class="text">Thank you for joining Braxel Markets. Your account has been successfully created with the email: <strong>${escapeHtml(email)}</strong></p>
    <p class="text">To access your institutional trading dashboard and complete your KYC verification, click below:</p>
    <p style="text-align:center;margin:30px 0">
      <a href="#" class="btn">Access Dashboard</a>
    </p>
    <p class="text">If you have any questions, our institutional support team is available 24/7.</p>
    <p class="text">Best regards,<br/>Braxel Markets Team</p>
  </div>
  <div class="footer">© 2026 Braxel Markets — Institutional Trading Infrastructure</div>
</div>
</body>
</html>`,
    text: `Welcome to Braxel Markets!\n\nDear ${name},\n\nThank you for joining Braxel Markets. Your account has been created with email: ${email}\n\nAccess your dashboard to complete KYC verification and start trading.\n\nBest regards,\nBraxel Markets Team`
  }),

  kycApproved: (name: string) => ({
    subject: "KYC Verification Approved — Braxel Markets",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:#0a0e27;padding:40px;text-align:center}
    .header h1{color:#D4AF37;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0}
    .success{padding:20px;background:#d4edda;border-left:4px solid #28a745;margin:20px 0}
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
      <strong>✓ KYC Verification Approved</strong>
      <p style="margin:10px 0 0;font-size:14px">Your identity has been successfully verified.</p>
    </div>
    <div class="title">Congratulations, ${escapeHtml(name)}!</div>
    <p class="text">Your account is now fully verified and you have access to all platform features including algorithmic trading infrastructure deployment.</p>
    <p class="text">You can now select an investment plan and start your institutional trading journey.</p>
    <p style="text-align:center;margin:30px 0">
      <a href="#" class="btn">Choose Investment Plan</a>
    </p>
    <p class="text">Best regards,<br/>Braxel Markets Team</p>
  </div>
  <div class="footer">© 2026 Braxel Markets — Institutional Trading Infrastructure</div>
</div>
</body>
</html>`,
    text: `KYC Verification Approved — Braxel Markets\n\nDear ${name},\n\nYour identity has been successfully verified!\n\nYour account is now fully verified and you have access to all platform features.\n\nBest regards,\nBraxel Markets Team`
  }),

  kycRejected: (name: string, reason?: string) => ({
    subject: "KYC Verification Rejected — Action Required",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:#0a0e27;padding:40px;text-align:center}
    .header h1{color:#D4AF37;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0}
    .alert{padding:20px;background:#f8d7da;border-left:4px solid #dc3545;margin:20px 0}
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
    <div class="alert">
      <strong>✗ KYC Verification Rejected</strong>
      <p style="margin:10px 0 0;font-size:14px">Your submitted documents could not be verified.</p>
      ${reason ? `<p style="margin:10px 0 0;font-size:14px"><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : ''}
    </div>
    <div class="title">Action Required, ${escapeHtml(name)}</div>
    <p class="text">Your identity verification was not successful. To access the platform, please resubmit your documents with valid identification.</p>
    <p class="text">Accepted documents include:</p>
    <ul style="font-size:14px;color:#555;margin-bottom:20px">
      <li>Passport</li>
      <li>National ID Card</li>
      <li>Driver's License</li>
    </ul>
    <p style="text-align:center;margin:30px 0">
      <a href="#" class="btn">Resubmit Documents</a>
    </p>
    <p class="text">If you have questions, contact our support team.</p>
    <p class="text">Best regards,<br/>Braxel Markets Team</p>
  </div>
  <div class="footer">© 2026 Braxel Markets — Institutional Trading Infrastructure</div>
</div>
</body>
</html>`,
    text: `KYC Verification Rejected — Action Required\n\nDear ${name},\n\nYour identity verification was not successful.\n\n${reason ? `Reason: ${reason}\n\n` : ''}Please resubmit your documents with valid identification.\n\nAccepted documents: Passport, National ID Card, Driver's License.\n\nBest regards,\nBraxel Markets Team`
  }),

  paymentConfirmed: (name: string, plan: string, amount: string) => ({
    subject: "Payment Confirmed — Braxel Markets",
    html: `<!DOCTYPE html>
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
      <p style="margin:10px 0 0;font-size:14px">Your infrastructure deployment is now active.</p>
    </div>
    <div class="title">Congratulations, ${escapeHtml(name)}!</div>
    <p class="text">Your payment has been successfully processed and your ${escapeHtml(plan)} infrastructure is now being deployed.</p>
    <div class="details">
      <p style="margin:5px 0;font-size:14px"><strong>Plan:</strong> ${escapeHtml(plan)}</p>
      <p style="margin:5px 0;font-size:14px"><strong>Amount:</strong> ${escapeHtml(amount)}</p>
      <p style="margin:5px 0;font-size:14px"><strong>Status:</strong> Deployment in Progress</p>
    </div>
    <p class="text">Your algorithmic infrastructure will be fully operational within the next few minutes. You will receive a notification once deployment is complete.</p>
    <p style="text-align:center;margin:30px 0">
      <a href="#" class="btn">Access Dashboard</a>
    </p>
    <p class="text">Best regards,<br/>Braxel Markets Team</p>
  </div>
  <div class="footer">© 2026 Braxel Markets — Institutional Trading Infrastructure</div>
</div>
</body>
</html>`,
    text: `Payment Confirmed — Braxel Markets\n\nDear ${name},\n\nYour payment has been successfully processed!\n\nPlan: ${plan}\nAmount: ${amount}\nStatus: Deployment in Progress\n\nYour infrastructure will be operational within minutes.\n\nBest regards,\nBraxel Markets Team`
  }),

  withdrawalProcessed: (name: string, amount: string, method: string) => ({
    subject: "Withdrawal Processed — Braxel Markets",
    html: `<!DOCTYPE html>
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
      <strong>✓ Withdrawal Processed</strong>
      <p style="margin:10px 0 0;font-size:14px">Your funds have been transferred.</p>
    </div>
    <div class="title">Withdrawal Complete, ${escapeHtml(name)}</div>
    <p class="text">Your withdrawal request has been successfully processed.</p>
    <div class="details">
      <p style="margin:5px 0;font-size:14px"><strong>Amount:</strong> ${escapeHtml(amount)}</p>
      <p style="margin:5px 0;font-size:14px"><strong>Method:</strong> ${escapeHtml(method)}</p>
      <p style="margin:5px 0;font-size:14px"><strong>Status:</strong> Completed</p>
    </div>
    <p class="text">The funds should arrive in your account within 1-3 business days depending on your bank or wallet provider.</p>
    <p class="text">Best regards,<br/>Braxel Markets Team</p>
  </div>
  <div class="footer">© 2026 Braxel Markets — Institutional Trading Infrastructure</div>
</div>
</body>
</html>`,
    text: `Withdrawal Processed — Braxel Markets\n\nDear ${name},\n\nYour withdrawal has been successfully processed.\n\nAmount: ${amount}\nMethod: ${method}\nStatus: Completed\n\nFunds should arrive within 1-3 business days.\n\nBest regards,\nBraxel Markets Team`
  }),

  passwordReset: (name: string, resetLink: string) => ({
    subject: "Password Reset — Braxel Markets",
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
      <strong>⚠️ Password Reset Request</strong>
      <p style="margin:10px 0 0;font-size:14px">You requested a password reset for your account.</p>
    </div>
    <div class="title">Hello, ${escapeHtml(name)}</div>
    <p class="text">Click the button below to reset your password. This link will expire in 1 hour.</p>
    <p style="text-align:center;margin:30px 0">
      <a href="${resetLink}" class="btn">Reset Password</a>
    </p>
    <p class="text" style="font-size:12px;color:#888">Or copy this link: <span class="link">${resetLink}</span></p>
    <p class="text">If you didn't request this, please ignore this email or contact support immediately.</p>
    <p class="text">Best regards,<br/>Braxel Markets Team</p>
  </div>
  <div class="footer">© 2026 Braxel Markets — Institutional Trading Infrastructure</div>
</div>
</body>
</html>`,
    text: `Password Reset — Braxel Markets\n\nDear ${name},\n\nYou requested a password reset. Click the link below:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, ignore this email.\n\nBest regards,\nBraxel Markets Team`
  })
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }

  try {
    const payload: EmailPayload = await req.json()

    if (!payload.to || !payload.subject || !payload.html) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, html' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY")

    if (!resendApiKey) {
      console.log("SEND EMAIL (Resend not configured):", {
        to: payload.to,
        subject: payload.subject
      })
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Logged — configure RESEND_API_KEY to send emails",
        mock: true
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const fromEmail = payload.from || "Braxel Markets <noreply@braxelmarkets.com>"

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Resend error:", err)
      throw new Error(`Resend API failed: ${res.statusText}`)
    }

    const result = await res.json()
    
    console.log("Email sent successfully:", {
      to: payload.to,
      subject: payload.subject,
      emailId: result.id
    })

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: result.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("Send email error:", error)
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
