import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ApplicationCardProps {
  application: any;
  onActivate: (applicationId: string) => void;
  onReject: (applicationId: string, reason: string) => void;
}

const ApplicationCard = ({ application, onActivate, onReject }: ApplicationCardProps) => {
  const { t } = useTranslation();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activating, setActivating] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleActivate = async () => {
    setActivating(true);
    try {
      await onActivate(application.id);
    } finally {
      setActivating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      // In a real app, we would show a validation error
      return;
    }
    setRejecting(true);
    try {
      await onReject(application.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } finally {
      setRejecting(false);
    }
  };

  // Format the application data for display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'activation_pending':
        return { text: t('operator.status.activation_pending'), color: 'text-yellow-400' };
      case 'account_active':
        return { text: t('operator.status.account_active'), color: 'text-green-400' };
      case 'rejected':
        return { text: t('operator.status.rejected'), color: 'text-red-400' };
      case 'manual_review':
        return { text: t('operator.status.manual_review'), color: 'text-blue-400' };
      default:
        return { text: status, color: 'text-slate-400' };
    }
  };

  const { text: statusText, color: statusColor } = getStatusBadge(application.activation_status);

  return (
    <div className="bg-[#080B12] border border-white/10 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-bold text-xl uppercase tracking-tight">
            {application.full_name}
          </h2>
          <p className="text-[10px] text-slate-400 mt-1">
            {application.email}
          </p>
        </div>
        <div className="text-right">
          <span className={`${statusColor} font-bold text-[10px] uppercase tracking-wider`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {t('operator.plan')}
          </p>
          <p className="text-[10px] text-slate-400">
            {application.plan_key.charAt(0).toUpperCase() + application.plan_key.slice(1)}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {t('operator.amount')}
          </p>
          <p className="text-[10px] font-bold text-[#C5A059]">
            €{((application.plan_key === 'starter' ? 80.04 :
                application.plan_key === 'professional' ? 120.52 :
                application.plan_key === 'business' ? 431.48 :
                application.plan_key === 'enterprise' ? 852.84 : 0)).toFixed(2)}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {t('operator.country')}
          </p>
          <p className="text-[10px] text-slate-400">
            {application.country}
          </p>
        </div>

        {application.customer_note && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t('operator.customer_note')}
            </p>
            <p className="text-[10px] text-slate-400 italic max-w-[300px]">
              {application.customer_note}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-between">
          <Button
            onClick={handleActivate}
            disabled={activating}
            className="w-full md:w-[48%]"
          >
            {activating ? t('operator.activating') : t('operator.activate_account')}
          </Button>
          <Button
            onClick={() => setShowRejectModal(true)}
            disabled={rejecting}
            className="w-full md:w-[48%] ml-4"
          >
            {rejecting ? t('operator.rejecting') : t('operator.reject_or_request_info')}
          </Button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#080B12] border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4">
              {t('operator.reject_application')}
            </h2>
            <p className="text-[10px] text-slate-400 mb-4">
              {t('operator.reject_reason_prompt')}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-white placeholder-slate-400 h-24"
              placeholder={t('operator.reject_reason_placeholder)}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={() => setShowRejectModal(false)}
                className="w-[48%]"
              >
                {t('operator.cancel')}
              </Button>
              <Button
                onClick={handleReject}
                disabled={rejecting}
                className="w-[48%] ml-2"
              >
                {rejecting ? t('operator.rejecting') : t('operator.reject')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;