import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from environment variables. In local development, set VITE_SUPABASE_URL
// and VITE_SUPABASE_ANON_KEY in .env.local. In CI/production, set them in
// GitHub Actions Secrets or Vercel environment variables.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Public pages (home, pricing, licensing, etc.) must render even when Supabase
// vars are absent. Throw only when the client is actually used by a feature that
// needs it (auth, dashboard, payments) — the accessor explodes where it matters.
export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const assertConfigured = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. ' +
      'Copy .env.example to .env.localand fill in the values.'
    );
  }
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

let client: SupabaseClient | null = null;
const getClient = () => {
  if (!client) {
    assertConfigured();
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'braxel-auth-session',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      }
    });
  }
  return client;
};

// Lazy proxy: modules that import { supabase } at module scope no longer crash
// page loading when env vars are unset; the first actual use throws the original error.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const real = getClient();
    const value = real[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(real) : value;
  },
}) as SupabaseClient;;
