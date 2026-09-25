import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface CtaBannerProps {
  onOpenAuth: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onOpenAuth }) => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-8 sm:p-14 text-white shadow-soft-2xl border border-slate-800 overflow-hidden text-center space-y-8">
          
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-ai-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-ai-300">
            <Zap className="w-3.5 h-3.5 text-ai-400" />
            <span>{t.cta.badge}</span>
          </div>

          {/* Headline */}
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {t.cta.headline}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {t.cta.subtitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-8 py-3.5 ai-gradient-btn rounded-xl font-bold text-sm shadow-ai-glow flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden active:scale-95 group"
            >
              <div className="shimmer-sweep" />
              <Sparkles className="w-4 h-4 text-ai-200" />
              <span>{t.cta.btnCandidate}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#for-employers"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-sm transition-all cursor-pointer inline-flex items-center justify-center active:scale-95"
            >
              {t.cta.btnEmployer}
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-400" />
              {t.cta.securityBadge}
            </span>
            <span>•</span>
            <span>{t.cta.noCardBadge}</span>
            <span>•</span>
            <span>{t.cta.cancelBadge}</span>
          </div>

        </div>

      </div>
    </section>
  );
};
