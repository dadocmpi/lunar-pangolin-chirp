import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';

/**
 * Resolve the current Supabase session once on mount. Returns `loading: true`
 * until the check settles so callers can block navigation instead of racing it.
 *
 * When Supabase is not configured the public site still renders: we settle
 * without a session (fail closed for authenticated actions) rather than
 * throwing from the lazy client.
 */
export function useSupabaseSession(): { session: boolean; loading: boolean } {
  const [session, setSession] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setSession(false);
      setLoading(false);
      return;
    }

    let active = true;
    const check = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (active) setSession(Boolean(data.session));
      } catch {
        if (active) setSession(false);
      } finally {
        if (active) setLoading(false);
      }
    };
    check();

    return () => {
      active = false;
    };
  }, []);

  return { session, loading };
}