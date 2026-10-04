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
import { notifyOwnerInBackground } from "../_shared/email.ts";

const BUCKET = "kyc-documents";

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
  const { error: insertError } = await admin.from("kyc_submissions").insert({
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
  });
  if (insertError) return json({ error: "insert_failed" }, 500);

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
      revisar: `kyc-action?userId=${user.id}`,
      origem: "kyc-submit",
    },
    idempotencyKey: `kyc-submit:${user.id}:${now}`,
  });

  return json({ ok: true, status: "submitted" }, 201);
});
