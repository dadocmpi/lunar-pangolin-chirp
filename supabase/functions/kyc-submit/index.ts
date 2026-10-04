// ============================================================================
// kyc-submit — authenticated user submits identity documents.
//
// The user id is taken from the verified JWT, never from the body. Documents
// go into the PRIVATE bucket 'kyc-documents' at '<user_id>/<uuid>.<ext>';
// only the object path is stored, never a public URL. No token, password or
// document bytes are logged.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  buildObjectPath,
  type KycDocumentKind,
  validateKycFile,
} from "../_shared/kyc/limits.ts";
import { runAiCheck } from "../_shared/kyc/aiKyc.ts";
import {
  createAiProviderFromEnv,
  type AiImage,
} from "../_shared/kyc/aiProvider.ts";
import { notifyOwnerInBackground } from "../_shared/email.ts";
import { isAiKycEnabled } from "../_shared/features.ts";

const BUCKET = "kyc-documents";
/** Largest document we will send to the vision model (base64 inflates ~33%). */
const AI_MAX_BYTES = 6 * 1024 * 1024;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json({ error: "server_misconfigured" }, 500);

  // 1. Authenticate: the user id comes from the JWT only.
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return json({ error: "unauthorized" }, 401);

  // 2. Parse the multipart form.
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "invalid_form" }, 400);
  }

  const country = String(form.get("country") ?? "").slice(0, 60);
  const method = String(form.get("method") ?? "").slice(0, 60);
  const documentType = String(form.get("documentType") ?? "").slice(0, 60);
  if (!country || !method || !documentType) {
    return json({ error: "missing_fields" }, 400);
  }

  const files: Array<[KycDocumentKind, File | null]> = [
    ["front", form.get("front") instanceof File ? form.get("front") as File : null],
    ["back", form.get("back") instanceof File ? form.get("back") as File : null],
    ["selfie", form.get("selfie") instanceof File ? form.get("selfie") as File : null],
  ];

  const present = files.filter(([, f]) => f !== null);
  if (present.length === 0 || !files[0][1]) {
    // The front of the ID is always required.
    return json({ error: "missing_front_document" }, 400);
  }
  for (const [, f] of present) {
    const v = validateKycFile(f ? { name: f.name, type: f.type, size: f.size } : null);
    if (!v.ok) return json({ error: "invalid_document", detail: v.error }, 400);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const paths: Partial<Record<KycDocumentKind, string>> = {};
  for (const [kind, file] of present) {
    if (!file) continue;
    const objectPath = buildObjectPath(user.id, kind, file.name, crypto.randomUUID());
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(objectPath, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadError) return json({ error: "upload_failed" }, 500);
    paths[kind] = objectPath;
  }

  // 3. Persist the submission bound to the authenticated user.
  const now = new Date().toISOString();
  const { data: inserted, error: insertError } = await admin
    .from("kyc_submissions")
    .insert({
      user_id: user.id,
      status: "submitted",
      country,
      method,
      document_type: documentType,
      document_front_path: paths.front ?? null,
      document_back_path: paths.back ?? null,
      selfie_path: paths.selfie ?? null,
      submitted_at: now,
      updated_at: now,
    })
    .select("id")
    .single();
  if (insertError || !inserted) return json({ error: "insert_failed" }, 500);

  // 4. AI consistency check. Fails closed: if no provider is configured or the
  //    model is unsure, the submission stays "submitted" for a human. A clean
  //    high-confidence pass may auto-approve. The decision is always audited.
  const provider = isAiKycEnabled()
    ? createAiProviderFromEnv({
        KYC_AI_API_KEY: Deno.env.get("KYC_AI_API_KEY"),
        KYC_AI_MODEL: Deno.env.get("KYC_AI_MODEL"),
        KYC_AI_PROVIDER: Deno.env.get("KYC_AI_PROVIDER"),
      })
    : null;
  const declaredName = String(form.get("fullName") ?? "").slice(0, 120);
  const aiImages = await buildAiImages(present);
  const aiResult = aiImages
    ? await runAiCheck(provider, { ...aiImages, declaredName, nowIso: now })
    : ({
        decision: "manual_review",
        confidence: 0,
        checks: {},
        reason: "no_image_for_ai",
        malformed: true,
        provider: provider?.name ?? "none",
        providerUnavailable: true,
      } as const);

  await admin.from("kyc_ai_checks").insert({
    submission_id: inserted.id,
    user_id: user.id,
    provider: aiResult.provider,
    model: Deno.env.get("KYC_AI_MODEL") ?? null,
    decision: aiResult.decision,
    confidence: aiResult.confidence,
    checks: aiResult.checks,
    raw_output: null, // never store the raw document-derived model text
    reason: aiResult.reason,
    malformed: aiResult.malformed,
    provider_unavailable: aiResult.providerUnavailable,
  });

  if (aiResult.decision === "approved") {
    await admin
      .from("kyc_submissions")
      .update({ status: "approved", reviewed_by: "ai", reviewed_at: now, updated_at: now })
      .eq("id", inserted.id)
      .eq("user_id", user.id);
  }

  // Owner notification for review. Includes object paths (not public URLs);
  // a reviewer mints short-lived signed URLs server-side.
  notifyOwnerInBackground({
    type: "conta",
    subject: "Nova verificacao de identidade (KYC)",
    replyTo: user.email ?? undefined,
    data: {
      user_id: user.id,
      email: user.email,
      pais: country,
      metodo: method,
      documento: documentType,
      arquivos: Object.values(paths).join(", "),
      ai_decision: aiResult.decision,
      ai_confidence: aiResult.confidence,
      ai_reason: aiResult.reason,
      revisar: `kyc-action?userId=${user.id}`,
      origem: "kyc-submit",
    },
    idempotencyKey: `kyc-submit:${user.id}:${now}`,
  });

  return json(
    { ok: true, status: aiResult.decision === "approved" ? "approved" : "submitted", aiDecision: aiResult.decision },
    201,
  );
});

/**
 * Convert the uploaded files into base64 images for the vision model. Only
 * image mime types are sent (a PDF is not a supported inline image); anything
 * too large is skipped, which routes the submission to manual review. Returns
 * null when no front image can be sent.
 */
async function buildAiImages(
  files: Array<[KycDocumentKind, File | null]>,
): Promise<{ front: AiImage; back?: AiImage; selfie?: AiImage } | null> {
  const toImage = async (file: File | null): Promise<AiImage | null> => {
    if (!file) return null;
    const mime = (file.type || "").toLowerCase();
    if (!mime.startsWith("image/") || file.size > AI_MAX_BYTES) return null;
    const bytes = new Uint8Array(await file.arrayBuffer());
    return { mime, base64: base64FromBytes(bytes) };
  };
  const map = new Map<KycDocumentKind, AiImage | null>();
  for (const [kind, file] of files) map.set(kind, await toImage(file));
  const front = map.get("front");
  if (!front) return null;
  return {
    front,
    back: map.get("back") ?? undefined,
    selfie: map.get("selfie") ?? undefined,
  };
}

function base64FromBytes(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
