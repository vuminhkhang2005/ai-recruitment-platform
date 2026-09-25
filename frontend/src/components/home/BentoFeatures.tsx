import React from 'react';
import { 
  Sparkles, 
  GitCompare, 
  FileCheck, 
  TrendingUp, 
  Kanban, 
  Bot, 
  ShieldCheck, 
  Zap, 
  ArrowRight 
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const BentoFeatures: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="features" className="scroll-mt-24 py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold tracking-wide shadow-soft-xs">
            <Zap className="w-3.5 h-3.5 text-brand-600" />
            <span>{t.bento.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.bento.headline}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {t.bento.subtitle}
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
          
          {/* Bento Card 1: Semantic 2-Way Matching (Col Span 7) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-8 text-white shadow-soft-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-ai-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

            <div className="space-y-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-ai-400 group-hover:scale-110 transition-transform">
                <GitCompare className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-ai-400 tracking-wider uppercase block">
                {t.bento.card1Badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                {t.bento.card1Title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                {t.bento.card1Desc}
              </p>
            </div>

            {/* Visual Micro Widget Inside Card */}
            <div className="mt-8 pt-6 border-t border-white/10 z-10 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition-colors">
                <div className="text-xs text-slate-400">{t.bento.card1Metric1Label}</div>
                <div className="text-lg font-extrabold text-ai-400">1,536 Dims</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition-colors">
                <div className="text-xs text-slate-400">{t.bento.card1Metric2Label}</div>
                <div className="text-lg font-extrabold text-accent-400">&lt; 150ms</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition-colors">
                <div className="text-xs text-slate-400">{t.bento.card1Metric3Label}</div>
                <div className="text-lg font-extrabold text-brand-300">Explainable AI</div>
              </div>
            </div>

          </div>

          {/* Bento Card 2: AI CV Parsing & ATS Scoring (Col Span 5) */}
          <div className="lg:col-span-5 bg-slate-50 rounded-3xl p-8 border border-slate-200/90 shadow-soft-lg flex flex-col justify-between hover:border-brand-400 hover:shadow-soft-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 group-hover:scale-110 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-brand-600 tracking-wider uppercase block">
                {t.bento.card2Badge}
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                {t.bento.card2Title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.bento.card2Desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-brand-700">
              <span>{t.bento.card2Compliance}</span>
              <ShieldCheck className="w-4 h-4 text-accent-600" />
            </div>
          </div>

          {/* Bento Card 3: Skill Gap Roadmap (Col Span 6) */}
          <div className="lg:col-span-6 bg-slate-50 rounded-3xl p-8 border border-slate-200/90 shadow-soft-lg flex flex-col justify-between hover:border-accent-400 hover:shadow-soft-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-50 border border-accent-200 flex items-center justify-center text-accent-700 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-accent-700 tracking-wider uppercase block">
                {t.bento.card3Badge}
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                {t.bento.card3Title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.bento.card3Desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{t.bento.card3Metric}</span>
              <a href="#roadmap" className="text-xs font-bold text-accent-700 hover:text-accent-800 flex items-center gap-1 group/link">
                <span>{t.bento.card3Cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Bento Card 4: ATS Kanban cho Nhà tuyển dụng (Col Span 6) */}
          <div className="lg:col-span-6 bg-slate-50 rounded-3xl p-8 border border-slate-200/90 shadow-soft-lg flex flex-col justify-between hover:border-ai-400 hover:shadow-soft-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-ai-50 border border-ai-200 flex items-center justify-center text-ai-700 group-hover:scale-110 transition-transform">
                <Kanban className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-ai-700 tracking-wider uppercase block">
                {t.bento.card4Badge}
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                {t.bento.card4Title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.bento.card4Desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{t.bento.card4Integration}</span>
              <a href="#for-employers" className="text-xs font-bold text-ai-700 hover:text-ai-800 flex items-center gap-1 group/link">
                <span>{t.bento.card4Cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
