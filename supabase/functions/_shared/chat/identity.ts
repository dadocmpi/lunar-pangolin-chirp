// ============================================================================
// Optional caller identity for the public support chatbot.
//
// The chatbot is available to visitors (password recovery, email confirmation)
// as well as signed-in customers, so a JWT is OPTIONAL. When a bearer token is
// present it is verified against Supabase Auth and the user id is used only as
// a rate-limit key. A user id in the request body is never read.
//
// No service-role client, no database, no writes. A failed/absent token simply
// falls back to IP-based limiting; it never grants access to anything.
// ============================================================================

import { clientIp } from "../rateLimit.ts";

export interface ChatIdentity {
  /** Verified Supabase user id, or null for a guest. */
  userId: string | null;
  ip: string;
  authenticated: boolean;
}

export interface IdentityOptions {
  fetchImpl?: typeof fetch;
  env?: { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string };
}

function readEnv(opts: IdentityOptions) {
  if (opts.env) return opts.env;
  return {
    SUPABASE_URL: Deno.env.get("SUPABASE_URL") ?? undefined,
    SUPABASE_ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY") ?? undefined,
  };
}

export async function resolveChatIdentity(
  req: Request,
  opts: IdentityOptions = {},
): Promise<ChatIdentity> {
  const ip = clientIp(req);
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = readEnv(opts);

  // The anon key is not a user identity.
  if (!token || !SUPABASE_URL || (SUPABASE_ANON_KEY && token === SUPABASE_ANON_KEY)) {
    return { userId: null, ip, authenticated: false };
  }

  const doFetch = opts.fetchImpl ?? fetch;
  try {
    const res = await doFetch(`${SUPABASE_URL.replace(/\/+$/, "")}/auth/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY ?? "",
      },
    });
    if (!res.ok) return { userId: null, ip, authenticated: false };
    const data = await res.json();
    const id = typeof (data as { id?: unknown })?.id === "string"
      ? (data as { id: string }).id
      : null;
    return { userId: id, ip, authenticated: Boolean(id) };
  } catch {
    return { userId: null, ip, authenticated: false };
  }
}

/** Rate-limit key: verified user first, otherwise the client address. */
export function rateLimitKey(identity: ChatIdentity): string {
  return identity.userId ? `user:${identity.userId}` : `ip:${identity.ip}`;
}
