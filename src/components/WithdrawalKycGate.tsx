import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase, functionsUrl } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { showError, showSuccess } from '@/utils/toast';

export type KycStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

interface WithdrawalKycGateProps {
  status: KycStatus;
  reviewReason?: string | null;
  onApproved: () => void;
}

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * The step shown before the withdrawal form when the user's KYC is not
 * approved. Explains why, lets the user upload an ID document (front required,
 * back optional) and a selfie, and shows the current status. Documents go
 * through the authenticated `kyc-submit` Edge Function into a private bucket.
 */
const WithdrawalKycGate: React.FC<WithdrawalKycGateProps> = ({
  status,
  reviewReason,
  onApproved,
}) => {
  const { t } = useTranslation();
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statusColor =
    status === 'approved'
      ? 'text-emerald-500'
      : status === 'submitted'
      ? 'text-yellow-500'
      : status === 'rejected'
      ? 'text-red-500'
      : 'text-[#D4AF37]';

  const statusLabel =
    status === 'approved'
      ? t('withdrawal.statusApproved')
      : status === 'submitted'
      ? t('withdrawal.statusSubmitted')
      : status === 'rejected'
      ? t('withdrawal.statusRejected')
      : t('withdrawal.statusPending');

  const StatusIcon =
    status === 'approved'
      ? CheckCircle2
      : status === 'submitted'
      ? Clock
      : status === 'rejected'
      ? XCircle
      : AlertTriangle;

  const validate = (file: File | null): boolean => {
    if (!file) return true;
    if (file.size > MAX_BYTES) {
      showError(t('withdrawal.fileTooLarge'));
      return false;
    }
    return true;
  };

  const pick = (setter: (f: File | null) => void) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0] ?? null;
    if (validate(file)) setter(file);
  };

  const handleSubmit = async () => {
    if (!front) {
      showError(t('withdrawal.frontRequired'));
      return;
    }
    if (!fullName.trim()) {
      showError(t('withdrawal.fullNameRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError(t('withdrawal.uploadError'));
        return;
      }
      const form = new FormData();
      form.append('country', 'unknown');
      form.append('method', 'document_upload');
      form.append('documentType', 'government_id');
      form.append('fullName', fullName.trim());
      form.append('front', front);
      if (back) form.append('back', back);
      if (selfie) form.append('selfie', selfie);

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(functionsUrl('kyc-submit'), {
        method: 'POST',
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
        body: form,
      });
      if (!res.ok) {
        showError(t('withdrawal.uploadError'));
        return;
      }
      showSuccess(t('withdrawal.documentsSubmitted'));
      // Submitted: the gate now shows the "under review" state on refetch.
      window.setTimeout(() => window.location.reload(), 700);
    } catch {
      showError(t('withdrawal.uploadError'));
    } finally {
      setSubmitting(false);
    }
  };

  const fileBox = (
    file: File | null,
    setter: (f: File | null) => void,
    label: string,
    hint: string,
    accept: string,
  ) => (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <label
        className={cn(
          'block border-2 border-dashed p-6 text-center cursor-pointer transition-all',
          file
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-white/10 hover:border-[#D4AF37]/30',
        )}
      >
        <input type="file" accept={accept} className="hidden" onChange={pick(setter)} />
        {file ? (
          <div className="space-y-1">
            <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest break-all">
              {file.name}
            </p>
            <p className="text-[9px] text-slate-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <Upload size={24} className="mx-auto text-slate-600" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {t('withdrawal.chooseFile')}
            </p>
            <p className="text-[9px] text-slate-600">{hint}</p>
          </div>
        )}
      </label>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">
          {t('dashboard.liquidity')}
        </span>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
          {t('withdrawal.gateTitle')}
        </h2>
      </div>

      {/* Status banner */}
      <div
        className={cn(
          'p-6 flex items-start gap-4 border',
          status === 'approved'
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : status === 'submitted'
            ? 'bg-yellow-500/10 border-yellow-500/20'
            : status === 'rejected'
            ? 'bg-red-500/10 border-red-500/20'
            : 'bg-[#D4AF37]/10 border-[#D4AF37]/20',
        )}
      >
        <StatusIcon size={24} className={cn('shrink-0 mt-0.5', statusColor)} />
        <div className="flex-1">
          <p className={cn('text-[11px] font-bold uppercase tracking-widest', statusColor)}>
            {t('withdrawal.kycStatusLabel')}: {statusLabel}
          </p>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            {status === 'rejected' ? t('withdrawal.gateRejectedDesc') : t('withdrawal.gateWhy')}
          </p>
          {status === 'rejected' && reviewReason && (
            <p className="text-[11px] text-red-400 mt-2">
              <span className="font-bold uppercase tracking-widest">
                {t('withdrawal.rejectedReason')}:
              </span>{' '}
              {reviewReason}
            </p>
          )}
        </div>
      </div>

      {status === 'approved' ? (
        <Button
          onClick={onApproved}
          className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
        >
          <ShieldCheck size={16} className="mr-2" />
          {t('withdrawal.continueToForm')}
        </Button>
      ) : status === 'submitted' ? (
        <div className="bg-[#1A1A1A] border border-white/10 p-8 text-center">
          <Clock size={32} className="mx-auto text-yellow-500 mb-4" />
          <p className="text-[11px] text-slate-400">{t('withdrawal.gateUnderReview')}</p>
        </div>
      ) : (
        <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white flex items-center gap-3">
            <FileText size={16} className="text-[#D4AF37]" />
            {status === 'rejected' ? t('withdrawal.resubmit') : t('withdrawal.submitDocs')}
          </h3>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t('withdrawal.fullNameLabel')}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('withdrawal.fullNamePlaceholder')}
              autoComplete="name"
              className="w-full bg-black/40 border border-white/10 px-4 py-3 text-[12px] text-white placeholder:text-slate-600 focus:border-[#D4AF37]/50 focus:outline-none"
            />
            <p className="text-[9px] text-slate-500">{t('withdrawal.fullNameHint')}</p>
          </div>

          {fileBox(

            front,
            setFront,
            t('withdrawal.uploadFront'),
            t('withdrawal.fileHint'),
            'image/*,.pdf',
          )}
          {fileBox(
            back,
            setBack,
            t('withdrawal.uploadBack'),
            t('withdrawal.optional'),
            'image/*,.pdf',
          )}
          {fileBox(
            selfie,
            setSelfie,
            t('withdrawal.uploadSelfie'),
            t('withdrawal.selfieHint'),
            'image/*',
          )}

          <Button
            onClick={handleSubmit}
            disabled={submitting || !front || !fullName.trim()}
            className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              <Upload size={16} className="mr-2" />
            )}
            {t('withdrawal.submitDocs')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WithdrawalKycGate;
