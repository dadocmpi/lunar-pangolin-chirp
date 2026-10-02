// ============================================================================
// Sample events for the owner-notification test endpoint.
//
// Split out from email-test/index.ts so the samples can be run and asserted
// without pulling in the HTTP server dependency.
// ============================================================================

import { type EventType, notifyOwner, TYPE_PREFIXES } from "./email.ts";

export interface SampleEvent {
  type: EventType;
  subject: string;
  replyTo?: string;
  idempotencyKey?: string;
  data: Record<string, unknown>;
}

/** One representative sample per event type. */
export function buildSamples(now = new Date().toISOString()): SampleEvent[] {
  return [
    {
      type: "novo_cliente",
      subject: "Novo cadastro de cliente",
      replyTo: "cliente.exemplo@example.com",
      idempotencyKey: `test-novo_cliente-${now}`,
      data: {
        nome: "Cliente Exemplo",
        email: "cliente.exemplo@example.com",
        origem: "register",
        email_confirmado: "não",
        data_registro: now,
      },
    },
    {
      type: "novo_lead",
      subject: "Formulário de contato enviado",
      replyTo: "lead.exemplo@example.com",
      idempotencyKey: `test-novo_lead-${now}`,
      data: {
        nome: "Lead Exemplo",
        email: "lead.exemplo@example.com",
        assunto: "Dúvida sobre planos",
        mensagem: "Gostaria de mais informações.",
        origem: "contact_form",
        data_envio: now,
      },
    },
    {
      type: "compra",
      subject: "Pedido criado",
      replyTo: "comprador.exemplo@example.com",
      idempotencyKey: `test-compra-${now}`,
      data: {
        plano: "Professional",
        valor: "USD 350.00",
        metodo: "crypto",
        id_pagamento: "PAY-TEST-0001",
        origem: "pricing",
      },
    },
    {
      type: "pagamento",
      subject: "Pagamento confirmado",
      replyTo: "comprador.exemplo@example.com",
      idempotencyKey: `test-pagamento-${now}`,
      data: {
        plano: "Professional",
        valor: "USD 350.00",
        metodo: "stripe",
        status: "confirmed",
        id_pagamento: "PAY-TEST-0002",
      },
    },
    {
      type: "conta",
      subject: "Redefinição de senha solicitada",
      replyTo: "cliente.exemplo@example.com",
      idempotencyKey: `test-conta-${now}`,
      data: {
        email: "cliente.exemplo@example.com",
        evento: "password_reset_requested",
        origem: "dashboard",
      },
    },
    {
      type: "erro",
      subject: "Falha ao processar webhook do Stripe",
      idempotencyKey: `test-erro-${now}`,
      data: {
        servico: "stripe-webhook",
        tipo_evento: "checkout.session.completed",
        mensagem: "Falha ao atualizar application",
        status_http: 500,
      },
    },
    {
      type: "webhook",
      subject: "Webhook recebido de serviço externo",
      idempotencyKey: `test-webhook-${now}`,
      data: {
        servico: "stripe",
        tipo_evento: "invoice.paid",
        id_evento: "evt_test_0001",
        recebido_em: now,
      },
    },
    {
      type: "suporte",
      subject: "Mensagem do formulário de suporte",
      replyTo: "visitante.exemplo@example.com",
      idempotencyKey: `test-suporte-${now}`,
      data: {
        nome: "Visitante Exemplo",
        email: "visitante.exemplo@example.com",
        assunto: "Dúvida institucional",
        mensagem: "Preciso de informações sobre alocação.",
        idioma: "pt",
        origem: "support_form",
      },
    },
  ];
}

export interface SampleResult {
  type: EventType;
  subject: string;
  expectedPrefix: string;
  ok: boolean;
  skipped?: string;
  error?: string;
}

/** Run all samples through the central module. */
export async function runSamples(
  samples: SampleEvent[] = buildSamples(),
): Promise<SampleResult[]> {
  const results: SampleResult[] = [];
  for (const sample of samples) {
    const result = await notifyOwner({
      type: sample.type,
      subject: sample.subject,
      data: sample.data,
      replyTo: sample.replyTo ?? null,
      idempotencyKey: sample.idempotencyKey ?? null,
    });
    results.push({
      type: sample.type,
      subject: sample.subject,
      expectedPrefix: TYPE_PREFIXES[sample.type],
      ok: result.ok,
      skipped: result.skipped,
      error: result.error,
    });
  }
  return results;
}
