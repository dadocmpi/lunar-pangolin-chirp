import { createClient } from '@supabase/supabase-js';

// Read from environment variables. In local development, set VITE_SUPABASE_URL
// and VITE_SUPABASE_ANON_KEY in .env.local. In CI/production, set them in
// GitHub Actions Secrets or Vercel environment variables.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. ' +
    'Copy .env.example to .env.local and fill in the values.'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'braxel-auth-session',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
});
