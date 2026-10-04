#!/usr/bin/env python3
"""Replace the Dashboard settings KYC tab with a non-duplicating info panel.

The settings KYC tab used to embed a second, divergent upload flow (a different
bucket path and a getPublicUrl call). Verification is now owned solely by the
withdrawal flow (`WithdrawalKycGate` -> the authenticated `kyc-submit` Edge
Function -> private bucket). This tab explains the requirement and links to it.
"""
import io

PATH = "src/pages/Dashboard.tsx"

NEW = '''                {settingsTab === 'kyc' && (
                  <div className="space-y-8">
                    {/* KYC status banner. Verification is only required to
                        request a withdrawal; the terminal never blocks on it. */}
                    <div className={cn(
                      "p-6 flex items-center gap-4 border",
                      kycStatus === 'approved' ? "bg-emerald-500/10 border-emerald-500/20" :
                      kycStatus === 'submitted' ? "bg-yellow-500/10 border-yellow-500/20" :
                      kycStatus === 'rejected' ? "bg-red-500/10 border-red-500/20" :
                      "bg-[#D4AF37]/10 border-[#D4AF37]/20"
                    )}>
                      {kycStatus === 'approved' && <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />}
                      {kycStatus === 'submitted' && <Clock size={24} className="text-yellow-500 shrink-0" />}
                      {kycStatus === 'rejected' && <XCircle size={24} className="text-red-500 shrink-0" />}
                      {kycStatus === 'pending' && <AlertTriangle size={24} className="text-[#D4AF37] shrink-0" />}
                      <div>
                        <p className={cn("text-[11px] font-bold uppercase tracking-widest",
                          kycStatus === 'approved' ? 'text-emerald-500' :
                          kycStatus === 'submitted' ? 'text-yellow-500' :
                          kycStatus === 'rejected' ? 'text-red-500' : 'text-[#D4AF37]'
                        )}>
                          {kycStatus === 'approved' ? t('dashboard.kyc.approved') :
                           kycStatus === 'submitted' ? t('dashboard.kyc.underReview') :
                           kycStatus === 'rejected' ? t('dashboard.kyc.rejected') :
                           t('dashboard.kyc.optionalTitle')}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {kycStatus === 'approved' ? t('dashboard.kyc.descApproved') :
                           kycStatus === 'submitted' ? t('dashboard.kyc.descSubmitted') :
                           kycStatus === 'rejected' ? t('dashboard.kyc.descRejected') :
                           t('dashboard.kycBannerHint')}
                        </p>
                      </div>
                    </div>

                    {/* One verification flow: the withdrawal gate. This tab
                        explains it and links there instead of duplicating it. */}
                    <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                        {t('dashboard.kyc.tabInfoTitle')}
                      </h3>
                      <p className="text-[12px] text-slate-400 leading-relaxed">
                        {t('dashboard.kyc.tabInfoBody')}
                      </p>

                      <div className="bg-white/[0.02] border border-white/5 p-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">
                          {t('dashboard.kyc.progressTitle')}
                        </h4>
                        <div className="space-y-4">
                          {[
                            { step: t('dashboard.kyc.stepEmailVerification'), status: user?.email_confirmed_at ? 'approved' : 'pending' },
                            { step: t('dashboard.kyc.stepIdentityDocument'), status: kycStatus === 'approved' ? 'approved' : kycStatus === 'submitted' ? 'submitted' : 'pending' },
                            { step: t('dashboard.kyc.stepComplianceReview'), status: kycStatus === 'approved' ? 'approved' : kycStatus === 'submitted' ? 'submitted' : 'pending' },
                            { step: t('dashboard.kyc.stepAccountActivation'), status: kycStatus === 'approved' ? 'approved' : 'pending' },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5">
                              {item.status === 'approved' && <CheckCircle2 size={16} className="text-emerald-500" />}
                              {item.status === 'submitted' && <Clock size={16} className="text-yellow-500" />}
                              {item.status === 'pending' && <Clock size={16} className="text-slate-500" />}
                              <span className="text-[11px] font-bold uppercase tracking-widest">{item.step}</span>
                              <span className={cn("ms-auto text-[9px] font-bold uppercase tracking-widest",
                                item.status === 'approved' ? 'text-emerald-500' :
                                item.status === 'submitted' ? 'text-yellow-500' :
                                'text-slate-500'
                              )}>
                                {item.status === 'submitted' ? t('dashboard.kyc.statusInProgress') : item.status === 'approved' ? t('dashboard.kyc.statusComplete') : t('dashboard.kyc.statusPending')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {kycStatus !== 'approved' && (
                        <Button
                          onClick={() => setActiveView('withdraw')}
                          className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
                        >
                          <FileText size={16} className="me-2" />
                          {t('dashboard.kyc.goToWithdrawal')}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
'''


def main():
    with io.open(PATH, encoding="utf-8") as f:
        lines = f.readlines()

    # 1-indexed inclusive range of the settings KYC block.
    start, end = 962, 1228
    assert "settingsTab === 'kyc'" in lines[start - 1], lines[start - 1]
    assert lines[end - 1].strip() == ")}", repr(lines[end - 1])

    new_lines = [l + "\n" for l in NEW.split("\n")]
    out = lines[: start - 1] + new_lines + lines[end:]
    with io.open(PATH, "w", encoding="utf-8") as f:
        f.writelines(out)
    print("replaced settings KYC tab (lines %d-%d)" % (start, end))


if __name__ == "__main__":
    main()
