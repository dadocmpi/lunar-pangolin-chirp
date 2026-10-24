// ============================================================================
// Operator authorization for activation-review.
//
// Reuses the SAME mechanism as the existing operator-action / application-activate
// functions: a user is an operator when their Supabase app_metadata.operator
// is exactly `true`. That flag can only be set with the service role, so a
// user cannot promote themselves. The check is server-side; the client is
// never trusted to declare its role.
//
// `isOperatorMeta` is pure and unit-tested. `requireOperator` performs the
// auth read through the service-role admin API.
// ============================================================================

import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface OperatorContext {
  user: { id: string; email?: string | null };
  /** Service-role client; bypasses RLS. Always scope queries explicitly. */
  admin: SupabaseClient;
}

export class UnauthorizedError extends Error {
  constructor(message = "unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** True only when app_metadata.operator === true. Anything else is not an operator. */
export function isOperatorMeta(meta: unknown): boolean {
  if (!meta || typeof meta !== "object") return false;
  return (meta as Record<string, unknown>).operator === true;
}

/** Verify the Bearer JWT and require app_metadata.operator === true. */
export async function requireOperator(req: Request): Promise<OperatorContext> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) throw new UnauthorizedError();
  const token = auth.slice("Bearer ".length);

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: auth } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data?.user) throw new UnauthorizedError();

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Read the authoritative app_metadata from the admin API rather than the
  // token body, so a stale token cannot carry an outdated operator flag.
  const { data: adminUser, error: adminError } = await admin.auth.admin
    .getUserById(data.user.id);
  if (adminError || !adminUser) throw new ForbiddenError();

  if (!isOperatorMeta(adminUser.app_metadata)) throw new ForbiddenError();

  return { user: { id: data.user.id, email: data.user.email }, admin };
}
