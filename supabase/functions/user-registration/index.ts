// ============================================================================
// user-registration — new-user notification for the owner.
//
// Rewritten to use the single central module (../_shared/email.ts).
//
// SECURITY: the previous version emailed the user's password in plain text.
// That has been removed. Passwords must never leave the auth provider. The
// central module also redacts any field whose key looks sensitive, so even an
// accidental `password` in the payload is masked.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { notifyOwner } from "../_shared/email.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const {
      userId,
      email,
      fullName,
      phone,
      country,
      registeredAt,
      emailConfirmed,
    } = await req.json();

    // Note: no `password` field is accepted or forwarded.
    const result = await notifyOwner({
      type: "novo_cliente",
      subject: `Novo cadastro de cliente — ${fullName || email || "sem nome"}`,
      replyTo: typeof email === "string" ? email : null,
      data: {
        user_id: userId,
        nome: fullName,
        email,
        telefone: phone,
        pais: country,
        data_registro: registeredAt ?? new Date().toISOString(),
        email_confirmado: emailConfirmed,
        origem: "user-registration",
      },
      idempotencyKey: userId ? `user-registration:${userId}` : null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        delivered: result.ok,
        emailId: result.id,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[user-registration] Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process registration notification" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
