import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";
import { notifyOwnerInBackground } from "../_shared/email.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import { verifyStripeSignature } from "../_shared/stripe/signature.ts";
import {
  applySubscriptionStatus,
  confirmFromCheckoutSession,
  confirmFromInvoicePaid,
  markInvoicePaymentFailed,
  type ConfirmationResult,
} from "../_shared/stripe/confirmation.ts";
import type {
  StripeCheckoutSessionLike,
  StripeInvoiceLike,
  StripeSubscriptionLike,
} from "../_shared/stripe/verification.ts";

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get environment variables
  const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeWebhookSecret) {
    notifyOwnerInBackground({
      type: "erro",
      subject: "Webhook Stripe rejeitado — segredo não configurado",
      data: {
        servico: "stripe-webhook",
        mensagem: "STRIPE_WEBHOOK_SECRET ausente",
        status_http: 503,
        origem: "stripe-webhook",
      },
      idempotencyKey: `stripe-webhook:no-secret:${new Date().toISOString().slice(0, 13)}`,
    });
    return new Response(
      JSON.stringify({ error: "Webhook secret not configured" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Required for the server-side evidence lookups (Checkout Session line
  // items, Subscription items, Customer identity). Without it no event can be
  // verified, so fail closed with a retryable status.
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    notifyOwnerInBackground({
      type: "erro",
      subject: "Webhook Stripe rejeitado — chave secreta não configurada",
      data: {
        servico: "stripe-webhook",
        mensagem: "STRIPE_SECRET_KEY ausente",
        status_http: 503,
        origem: "stripe-webhook",
      },
      idempotencyKey: `stripe-webhook:no-key:${
        new Date().toISOString().slice(0, 13)
      }`,
    });
    return new Response(
      JSON.stringify({ error: "Stripe secret key not configured" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Get the request body and signature. The raw body must be preserved for
  // HMAC verification; parsing it first would change the signed bytes.
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(
      JSON.stringify({ error: "No stripe-signature header" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const rawBody = await req.text();
  const signatureResult = await verifyStripeSignature(
    rawBody,
    signature,
    stripeWebhookSecret,
  );

  if (!signatureResult.ok) {
    const reason = signatureResult.reason ?? "invalid_signature";
    notifyOwnerInBackground({
      type: "erro",
      subject: "Assinatura de webhook Stripe inválida",
      data: {
        servico: "stripe-webhook",
        mensagem: reason,
        status_http: 400,
        origem: "stripe-webhook",
      },
      idempotencyKey: `stripe-webhook:bad-signature:${reason}:${
        Math.floor(Date.now() / 60000)
      }`,
    });
    return new Response(
      JSON.stringify({
        error: reason === "timestamp_outside_tolerance"
          ? "Timestamp outside tolerance"
          : "Invalid signature",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Parse the event
  interface StripeCharge {
    id?: unknown;
    payment_intent?: unknown;
    amount_refunded?: unknown;
  }
  interface StripeDispute {
    id?: unknown;
    charge?: unknown;
    reason?: unknown;
    amount?: unknown;
    status?: unknown;
  }
  interface StripeEvent {
    id: string;
    type: string;
    data: { object: unknown };
  }
  interface PendingPaymentRow {
    id: string;
    user_id?: string | null;
    metadata: Record<string, unknown> | null;
    status_enum?: string | null;
  }
  // Safe accessor: metadata and metadata.application_id may be absent. Never
  // pass an unchecked value to a query filter — a missing id would otherwise
  // become an invalid `id=eq.undefined` update.
  const getApplicationId = (
    metadata: Record<string, unknown> | null | undefined,
  ): string | null => {
    const value = metadata?.application_id;
    return typeof value === "string" && value.length > 0 ? value : null;
  };
  let event: StripeEvent;
  try {
    const parsed = JSON.parse(rawBody) as StripeEvent;
    if (
      typeof parsed?.id !== "string" || typeof parsed?.type !== "string" ||
      !parsed?.data?.object
    ) {
      throw new Error("Malformed Stripe event");
    }
    event = parsed;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const notifyOperatorOfConfirmedPayment = async (args: {
    paymentId: string;
    applicationId: string | null;
    amount: number | null;
    currency: string | null;
  }): Promise<void> => {
    if (!args.applicationId) return;
    const { data: application } = await supabase
      .from("applications")
      .select("id, user_id, plan_key, full_name, email, country")
      .eq("id", args.applicationId)
      .maybeSingle();
    if (!application) return;

    try {
      await fetch(`${supabaseUrl}/functions/v1/operator-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          paymentId: args.paymentId,
          applicationId: args.applicationId,
          userId: application.user_id,
          customerName: application.full_name ?? null,
          customerEmail: application.email ?? null,
          customerCountry: application.country ?? null,
          plan: application.plan_key ?? null,
          amount: args.amount,
          currency: args.currency ?? "usd",
          method: "stripe",
          confirmationTimestamp: new Date().toISOString(),
        }),
      });
    } catch (notifyErr) {
      console.error("Operator notification dispatch failed:", notifyErr);
    }
  };

  const handleConfirmationResult = (
    result: ConfirmationResult,
    label: string,
  ): void => {
    if (result.status === "retryable_error") {
      throw new Error(`${label}_retryable:${result.reason ?? "unknown"}`);
    }
    if (result.status === "not_verified") {
      console.error(`${label}: verification failed`, {
        payment_id: result.paymentId,
        reason: result.reason,
      });
      notifyOwnerInBackground({
        type: "erro",
        subject: `Verificação de pagamento Stripe falhou (${label})`,
        data: {
          servico: "stripe-webhook",
          evento: label,
          payment_id: result.paymentId ?? null,
          motivo: result.reason ?? "unknown",
          origem: "stripe-webhook",
        },
        idempotencyKey: `stripe-verify-failed:${
          result.paymentId ?? "unknown"
        }:${result.reason ?? "unknown"}`,
      });
      return;
    }
    if (result.status === "not_found") {
      console.warn(`${label}: payment not found`, { reason: result.reason });
    }
  };

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as StripeCheckoutSessionLike;
        const result = await confirmFromCheckoutSession(
          supabase,
          stripeSecretKey,
          session,
          event.id,
        );
        handleConfirmationResult(result, "checkout.session.completed");
        if (result.status === "confirmed" && result.paymentId) {
          await notifyOperatorOfConfirmedPayment({
            paymentId: result.paymentId,
            applicationId: result.applicationId ?? null,
            amount: typeof session.amount_total === "number"
              ? session.amount_total
              : null,
            currency: typeof session.currency === "string"
              ? session.currency
              : null,
          });
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as StripeInvoiceLike;
        const result = await confirmFromInvoicePaid(
          supabase,
          stripeSecretKey,
          invoice,
          event.id,
        );
        handleConfirmationResult(result, "invoice.paid");
        if (result.status === "confirmed" && result.paymentId) {
          await notifyOperatorOfConfirmedPayment({
            paymentId: result.paymentId,
            applicationId: result.applicationId ?? null,
            amount: typeof invoice.amount_paid === "number"
              ? invoice.amount_paid
              : null,
            currency: typeof invoice.currency === "string"
              ? invoice.currency
              : null,
          });
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as StripeInvoiceLike;
        const result = await markInvoicePaymentFailed(
          supabase,
          stripeSecretKey,
          invoice,
          event.id,
        );
        handleConfirmationResult(result, "invoice.payment_failed");
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as StripeSubscriptionLike;
        const result = await applySubscriptionStatus(
          supabase,
          subscription,
          event.id,
        );
        handleConfirmationResult(result, "customer.subscription.updated");
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as StripeSubscriptionLike;
        const result = await applySubscriptionStatus(
          supabase,
          { ...subscription, status: subscription.status ?? "canceled" },
          event.id,
        );
        handleConfirmationResult(result, "customer.subscription.deleted");
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as StripeCharge;
        const chargeId = charge?.id ?? null;
        const paymentIntentId = typeof charge?.payment_intent === "string"
          ? charge.payment_intent
          : (charge?.payment_intent as { id?: unknown } | null)?.id ?? null;
        if (!chargeId && !paymentIntentId) {
          break;
        }

        // Locate the pending payment by stored charge or payment_intent id in metadata.
        const { data: pendingPayments, error: listError } = await supabase
          .from("pending_payments")
          .select("id, user_id, metadata, status_enum")
          .eq("method", "stripe");

        if (listError || !pendingPayments) {
          console.error("charge.refunded: list failed", listError);
          break;
        }

        const pendingPayment = (pendingPayments as PendingPaymentRow[]).find(
          (pp) => {
            const meta = pp.metadata ?? {};
            return (
              meta.stripe_charge_id === chargeId ||
              meta.stripe_latest_payment_intent === paymentIntentId
            );
          },
        );

        if (!pendingPayment) {
          console.warn(
            `charge.refunded: no pending payment for charge ${chargeId} / pi ${paymentIntentId}`,
          );
          break;
        }

        // Idempotency by Stripe event id.
        const metadata =
          (pendingPayment.metadata as Record<string, unknown> | null) ?? {};
        const processedEventIds: string[] =
          (metadata.processed_event_ids as string[]) || [];
        if (processedEventIds.includes(event.id)) {
          break;
        }

        // Update the pending payment: mark refunded, store charge id, NEVER auto-activate.
        const { error: updateError } = await supabase
          .from("pending_payments")
          .update({
            status: "refunded",
            status_enum: "refunded",
            metadata: {
              ...metadata,
              stripe_charge_id: chargeId,
              refunded_at: new Date().toISOString(),
              refund_amount: typeof charge?.amount_refunded === "number"
                ? charge.amount_refunded
                : null,
              processed_event_ids: [...processedEventIds, event.id],
            },
          })
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error(
            "charge.refunded: pending payment update failed",
            updateError,
          );
          break;
        }

        // Update the application: payment_status -> refunded, activation stays manual.
        const refundApplicationId = getApplicationId(metadata);
        if (!refundApplicationId) {
          console.error(
            "charge.refunded: pending payment has no application_id; skipping application update",
          );
        } else {
          const { error: appError } = await supabase
            .from("applications")
            .update({
              payment_status: "refunded",
              updated_at: new Date().toISOString(),
            })
            .eq("id", refundApplicationId);

          if (appError) {
            console.error(
              "charge.refunded: application update failed",
              appError,
            );
          }
        }

        // Audit log (no auto-activation).
        await supabase.from("payment_audit_log").insert({
          payment_table: "pending_payments",
          payment_id: pendingPayment.id,
          user_id: pendingPayment.user_id,
          actor: "system",
          source: "stripe",
          event_id: event.id,
          previous_status: pendingPayment.status_enum ?? null,
          new_status: "refunded",
          reason: "Charge refunded via Stripe charge.refunded",
          created_at: new Date().toISOString(),
        });

        notifyOwnerInBackground({
          type: "pagamento",
          subject: "Reembolso processado (Stripe)",
          data: {
            payment_id: pendingPayment.id,
            application_id: getApplicationId(metadata),
            valor_reembolsado: typeof charge?.amount_refunded === "number"
              ? (charge.amount_refunded / 100).toFixed(2)
              : null,
            status: "refunded",
            metodo: "stripe",
            stripe_event_id: event.id,
            origem: "stripe-webhook",
          },
          idempotencyKey: `stripe:${event.id}:charge.refunded`,
        });

        break;
      }
      case "charge.dispute.created": {
        const dispute = event.data.object as StripeDispute;
        const chargeId = typeof dispute?.charge === "string"
          ? dispute.charge
          : (dispute?.charge as { id?: unknown } | null)?.id ?? null;
        if (!chargeId) {
          break;
        }

        const { data: pendingPayments, error: listError } = await supabase
          .from("pending_payments")
          .select("id, user_id, metadata, status_enum")
          .eq("method", "stripe");

        if (listError || !pendingPayments) {
          console.error("charge.dispute.created: list failed", listError);
          break;
        }

        const pendingPayment = (pendingPayments as PendingPaymentRow[]).find(
          (pp) => {
            const meta = pp.metadata ?? {};
            return meta.stripe_charge_id === chargeId;
          },
        );

        if (!pendingPayment) {
          console.warn(
            `charge.dispute.created: no pending payment for charge ${chargeId}`,
          );
          break;
        }

        const metadata =
          (pendingPayment.metadata as Record<string, unknown> | null) ?? {};
        const processedEventIds: string[] =
          (metadata.processed_event_ids as string[]) || [];
        if (processedEventIds.includes(event.id)) {
          break;
        }

        // Mark disputed; never auto-activate, never auto-delete.
        const { error: updateError } = await supabase
          .from("pending_payments")
          .update({
            status: "disputed",
            status_enum: "disputed",
            metadata: {
              ...metadata,
              dispute_id: dispute.id,
              dispute_reason: dispute.reason ?? null,
              dispute_amount: typeof dispute.amount === "number"
                ? dispute.amount
                : null,
              dispute_status: dispute.status ?? "needs_response",
              disputed_at: new Date().toISOString(),
              processed_event_ids: [...processedEventIds, event.id],
            },
          })
          .eq("id", pendingPayment.id);

        if (updateError) {
          console.error(
            "charge.dispute.created: pending payment update failed",
            updateError,
          );
          break;
        }

        const disputeApplicationId = getApplicationId(metadata);
        if (!disputeApplicationId) {
          console.error(
            "charge.dispute.created: pending payment has no application_id; skipping application update",
          );
        } else {
          const { error: appError } = await supabase
            .from("applications")
            .update({
              payment_status: "disputed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", disputeApplicationId);

          if (appError) {
            console.error(
              "charge.dispute.created: application update failed",
              appError,
            );
          }
        }

        await supabase.from("payment_audit_log").insert({
          payment_table: "pending_payments",
          payment_id: pendingPayment.id,
          user_id: pendingPayment.user_id,
          actor: "system",
          source: "stripe",
          event_id: event.id,
          previous_status: pendingPayment.status_enum ?? null,
          new_status: "disputed",
          reason: `Dispute created via Stripe charge.dispute.created (${
            dispute.reason ?? "unknown"
          })`,
          created_at: new Date().toISOString(),
        });

        notifyOwnerInBackground({
          type: "erro",
          subject: "Disputa/chargeback aberto (Stripe)",
          data: {
            payment_id: pendingPayment.id,
            application_id: getApplicationId(metadata),
            motivo_disputa: dispute.reason ?? null,
            valor_disputa: typeof dispute.amount === "number"
              ? (dispute.amount / 100).toFixed(2)
              : null,
            status: "disputed",
            metodo: "stripe",
            stripe_event_id: event.id,
            origem: "stripe-webhook",
          },
          idempotencyKey: `stripe:${event.id}:charge.dispute.created`,
        });

        break;
      }
      default:
        // Surface every other Stripe event to the owner as a generic webhook.
        notifyOwnerInBackground({
          type: "webhook",
          subject: `Webhook Stripe: ${event.type}`,
          data: {
            servico: "stripe",
            tipo_evento: event.type,
            id_evento: event.id,
            origem: "stripe-webhook",
          },
          idempotencyKey: `stripe:${event.id}`,
        });
        break;
    }
  } catch (err) {
    console.error("Error processing webhook event:", err);
    notifyOwnerInBackground({
      type: "erro",
      subject: "Erro crítico ao processar webhook do Stripe",
      data: {
        servico: "stripe-webhook",
        mensagem: err instanceof Error ? err.message : String(err),
        status_http: 500,
        origem: "stripe-webhook",
      },
    });
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
