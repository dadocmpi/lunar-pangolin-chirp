// ============================================================================
// kyc-notification — a user submitted identity documents for verification.
//
// Delivery now goes through the single central module (../_shared/email.ts).
// The approve/deny action links are preserved so the owner can act directly
// from the email; their tokens are short-lived and derived from
// KYC_ACTION_SECRET, which is never included in the message.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { notifyOwner } from "../_shared/email.ts";

const SUPABASE_FUNCTIONS_URL =
  "https://ymzdxifedtjwkxkzfwqu.supabase.co/functions/v1";

const KYC_ACTION_SECRET = Deno.env.get("KYC_ACTION_SECRET");

interface KYCNotificationPayload {
  userId: string;
  fullName: string;
  email: string;
  country: string;
  verificationMethod: string;
  documentType: string;
  documentUrl: string;
}

function generateToken(userId: string, action: string): string {
  if (!KYC_ACTION_SECRET) return "";
  return btoa(`${userId}:${action}:${KYC_ACTION_SECRET}`);
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload: KYCNotificationPayload = await req.json();

    if (!payload.userId || !payload.email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const approveUrl = `${SUPABASE_FUNCTIONS_URL}/kyc-action?userId=${
      encodeURIComponent(payload.userId)
    }&action=approve&token=${
      encodeURIComponent(generateToken(payload.userId, "approve"))
    }`;
    const denyUrl = `${SUPABASE_FUNCTIONS_URL}/kyc-action?userId=${
      encodeURIComponent(payload.userId)
    }&action=deny&token=${
      encodeURIComponent(generateToken(payload.userId, "deny"))
    }`;

    const result = await notifyOwner({
      type: "conta",
      subject: `Nova verificação de identidade (KYC) — ${
        payload.fullName || payload.email
      }`,
      replyTo: payload.email,
      data: {
        user_id: payload.userId,
        nome: payload.fullName,
        email: payload.email,
        pais: payload.country,
        metodo: payload.verificationMethod,
        documento: payload.documentType,
        documento_url: payload.documentUrl,
        aprovar: approveUrl || "(KYC_ACTION_SECRET não configurado)",
        recusar: denyUrl || "(KYC_ACTION_SECRET não configurado)",
        origem: "kyc",
      },
      idempotencyKey: `kyc:${payload.userId}:submitted`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        delivered: result.ok,
        emailId: result.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("KYC notification error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notification" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
