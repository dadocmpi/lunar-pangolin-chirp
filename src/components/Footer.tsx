"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Logo oficial do X (antigo Twitter)
const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-slate-400 pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3.5 group">
              <img 
                src="/logo-white.svg" 
                alt="Braxel Markets" 
                className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="flex flex-col leading-none">
                <span className="text-[18px] font-black text-white tracking-tighter font-sans">
                  BRAXEL
                </span>
                <span className="text-[#D4AF37] text-[8px] font-bold tracking-[0.3em]">MARKETS</span>
              </div>
            </Link>
            <p className="text-slate-500 text-[10px] leading-relaxed uppercase tracking-wider font-bold">
              {t('footer.desc')}
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:marketsbraxel@ouvidor.net" 
                aria-label="Email"
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
              >
                <Mail size={16} />
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
              >
                <XIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-8">{t('footer.platform')}</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
              <li><Link to="/pricing" className="hover:text-[#D4AF37] transition-colors">{t('nav.pricing')}</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#D4AF37] transition-colors">{t('nav.howItWorks')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-8">{t('footer.company')}</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
              <li><Link to="/about" className="hover:text-[#D4AF37] transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-[#D4AF37] transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to="/terms" className="hover:text-[#D4AF37] transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-8">{t('footer.support')}</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <Mail className="text-[#D4AF37] shrink-0" size={16} />
                <a href="mailto:marketsbraxel@ouvidor.net" className="text-[10px] font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-colors">marketsbraxel@ouvidor.net</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Company Address */}
        <div className="mb-12 py-8 border-t border-white/5">
          <div className="flex items-start gap-4">
            <MapPin className="text-[#D4AF37] shrink-0 mt-1" size={16} />
            <div>
              <h5 className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{t('footer.address')}</h5>
              <p className="text-slate-500 text-[11px] leading-relaxed">{t('footer.addressValue')}</p>
            </div>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="mb-10 p-6 border border-yellow-900/30 bg-yellow-950/10 rounded-sm">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={16} />
            <div>
              <h5 className="text-yellow-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-3">{t('footer.riskTitle')}</h5>
              <p className="text-slate-500 text-[11px] leading-relaxed">{t('footer.riskText')}</p>
            </div>
          </div>
        </div>

        <hr className="border-white/5 mb-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
          <p>© {currentYear} Braxel Markets. {t('footer.rights')}</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
            <Link to="/disclaimer" className="hover:text-white transition-colors">{t('footer.disclaimer')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;