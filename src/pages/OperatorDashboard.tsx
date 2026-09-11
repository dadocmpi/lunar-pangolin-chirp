import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import ApplicationCard from '@/components/ApplicationCard';
import { ShieldAlert, Loader2 } from 'lucide-react';

const OperatorDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationsRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string | null; role?: string | null } | null>(null);

interface ApplicationsRow {
  id: string;
  user_id: string;
  plan_key: string;
  full_name: string;
  email: string;
  country: string;
  customer_note?: string | null;
  activation_status?: string;
  risk_level?: "low" | "medium" | "high" | null;
}

  useEffect(() => {
    const checkUserAndLoad = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      // In a real app, we would check if the user is an operator (e.g., via a role or metadata)
      // For now, we'll allow any authenticated user to access this page for simplicity
      // but in production, you should restrict this to operators only.
      if (!authUser) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return;
      }

      // Fetch pending activation applications
      const { data: apps, error: appsError } = await supabase
        .from("applications")
        .select("*", { count: 'exact' })
        .eq("activation_status", "activation_pending")
        .order('created_at', { ascending: false });

      if (appsError) {
        setError(appsError.message);
        setLoading(false);
        return;
      }

      setApplications(apps || []);
      setLoading(false);
    };

    checkUserAndLoad();
  }, []);

  const handleActivate = async (applicationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Unauthorized');
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/application-activate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ applicationId }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      // Refresh the list
      const { data: apps, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .eq("activation_status", "activation_pending")
        .order('created_at', { ascending: false });

      if (!appsError) {
        setApplications(apps || []);
      }
    } catch (err: unknown) {
      console.error('Activation error:', err);
      // Show error toast or update state
      setError(err instanceof Error ? err.message : t('operator.errors.activation_failed'));
    }
  };

  const handleReject = async (applicationId: string, reason: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Unauthorized');
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/application-reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ applicationId, reason }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      // Refresh the list
      const { data: apps, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .eq("activation_status", "activation_pending")
        .order('created_at', { ascending: false });

      if (!appsError) {
        setApplications(apps || []);
      }
    } catch (err: unknown) {
      console.error('Rejection error:', err);
      setError(err instanceof Error ? err.message : t('operator.errors.rejection_failed'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <div className="p-6 bg-red-500/20 border border-red-500/30 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 pt-[140px] pb-20">
        <div className="mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            {t('operator.title')} <span className="text-[#C5A059]">{t('operator.subtitle')}</span>
          </h1>
          <p className="mt-2 text-[10px] text-slate-400">
            {t('operator.description')}
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[10px] text-slate-400">
              {t('operator.no_pending_applications')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onActivate={handleActivate}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OperatorDashboard;