// ============================================================================
// Server-side authentication for Tradovate handlers.
//
// Every handler derives the user from the Supabase JWT. A user_id sent in the
// request body/query is NEVER trusted: we always read auth.uid() from the
// verified token and scope every query to that id.
//
// Returns a service-role client for writes (RLS-bypassing) plus the verified
// user. The service-role key never leaves the server.
// ============================================================================

import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface AuthedContext {
  user: { id: string; email?: string | null };
  /** Service-role client; bypasses RLS. Use only with an explicit user scope. */
  admin: SupabaseClient;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("unauthorized");
    this.name = "UnauthorizedError";
  }
}

/** Verify the Bearer JWT and return the verified user + service-role client. */
export async function requireUser(req: Request): Promise<AuthedContext> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) throw new UnauthorizedError();
  const token = auth.slice("Bearer ".length);

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: auth } } },
  );
  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data?.user) throw new UnauthorizedError();

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  return { user: { id: data.user.id, email: data.user.email }, admin };
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
