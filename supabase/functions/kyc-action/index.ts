// KYC Action Edge Function
// Handles approve/deny clicks from the email notification
// URL: /functions/v1/kyc-action?userId=...&action=approve|deny&token=...

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://ymzdxifedtjwkxkzfwqu.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const KYC_ACTION_SECRET = Deno.env.get("KYC_ACTION_SECRET") || "braxel-kyc-2026-secure";

function verifyToken(userId: string, action: string, token: string): boolean {
  const expected = btoa(`${userId}:${action}:${KYC_ACTION_SECRET}`);
  return token === expected;
}

function htmlPage(title: string, message: string, color: string, emoji: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} — Braxel Markets</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; min-height: 100vh;
      display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #1a1a1a; border: 1px solid #333; max-width: 480px; width: 100%;
      padding: 48px 40px; text-align: center; }
    .emoji { font-size: 56px; margin-bottom: 24px; display: block; }
    h1 { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;
      color: ${color}; margin-bottom: 12px; }
    p { font-size: 14px; color: #aaa; line-height: 1.6; }
    .badge { display: inline-block; margin-top: 24px; padding: 8px 20px; background: ${color}22;
      border: 1px solid ${color}44; color: ${color}; font-size: 11px; font-weight: bold;
      text-transform: uppercase; letter-spacing: 2px; }
    .brand { margin-top: 32px; font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 3px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="emoji">${emoji}</span>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="badge">Braxel Markets — KYC System</div>
    <div class="brand">© 2026 Braxel Markets</div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const action = url.searchParams.get("action");
    const token = url.searchParams.get("token");

    if (!userId || !action || !token) {
      return new Response(
        htmlPage("Invalid Request", "Missing required parameters.", "#ef4444", "⚠️"),
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    if (action !== "approve" && action !== "deny") {
      return new Response(
        htmlPage("Invalid Action", "The action must be 'approve' or 'deny'.", "#ef4444", "⚠️"),
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    if (!verifyToken(userId, action, token)) {
      return new Response(
        htmlPage("Invalid Token", "This link is invalid or has already been used.", "#ef4444", "🔒"),
        { status: 403, headers: { "Content-Type": "text/html" } }
      );
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not set");
      return new Response(
        htmlPage("Server Error", "Server configuration error. Please contact support.", "#ef4444", "⚙️"),
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }

    // Use admin client to update profile
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const newStatus = action === "approve" ? "approved" : "rejected";

    const { error } = await adminClient
      .from("profiles")
      .update({ kyc_status: newStatus, kyc_reviewed_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("DB update error:", error);
      return new Response(
        htmlPage("Database Error", `Failed to update user status: ${error.message}`, "#ef4444", "❌"),
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }

    if (action === "approve") {
      return new Response(
        htmlPage(
          "Verification Approved",
          "The user's identity has been successfully verified. Their account is now fully activated and they will be notified automatically.",
          "#22c55e",
          "✅"
        ),
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    } else {
      return new Response(
        htmlPage(
          "Verification Denied",
          "The user's verification has been rejected. They will be notified to resubmit their documents with valid identification.",
          "#ef4444",
          "❌"
        ),
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      htmlPage("Server Error", "An unexpected error occurred. Please try again.", "#ef4444", "⚙️"),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
});
