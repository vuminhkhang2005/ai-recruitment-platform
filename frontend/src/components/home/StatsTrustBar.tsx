import React from 'react';
import { Award, Zap, Building, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const StatsTrustBar: React.FC = () => {
  const { t } = useLanguage();

  const statsData = [
    { value: '98.5%', label: t.stats.stat1Label, sub: t.stats.stat1Desc },
    { value: '1,200+', label: t.stats.stat2Label, sub: t.stats.stat2Desc },
    { value: '450+', label: t.stats.stat3Label, sub: t.stats.stat3Desc },
    { value: '< 150ms', label: t.stats.stat4Label, sub: t.stats.stat4Desc }
  ];

  const icons = [
    <Award className="w-5 h-5 text-brand-600" />,
    <Users className="w-5 h-5 text-ai-600" />,
    <Building className="w-5 h-5 text-accent-600" />,
    <Zap className="w-5 h-5 text-amber-500" />
  ];

  const partners = [
    'VinAI Innovation',
    'VNG Corporation',
    'FPT Software',
    'MoMo Fintech',
    'Viettel High Tech',
    'VNPT IT',
    'One Mount Group',
    'Tiki Engineering'
  ];

  return (
    <section className="py-12 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {statsData.map((stat, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:border-brand-300 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-soft-sm group-hover:scale-110 transition-transform">
                  {icons[idx]}
                </div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {stat.value}
                </span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">{stat.label}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Partner Logos Bar */}
        <div className="pt-2 text-center space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {t.stats.partnersTitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 opacity-80 hover:opacity-100 transition-opacity duration-300">
            {partners.map((partner) => (
              <div 
                key={partner} 
                className="px-4 py-2 rounded-xl bg-slate-100/60 border border-slate-200/50 text-xs font-bold text-slate-700 tracking-tight hover:text-brand-700 hover:bg-brand-50 hover:border-brand-200 transition-all duration-200 cursor-default hover:shadow-soft-xs hover:-translate-y-0.5"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
