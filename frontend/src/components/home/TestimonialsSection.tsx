import React from 'react';
import { MOCK_TESTIMONIALS } from '../../data/mockData';
import { Star, CheckCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CompanyLogo } from '../ui/CompanyLogo';

export const TestimonialsSection: React.FC = () => {
  const { t, language } = useLanguage();

  const quotes = [t.testimonials.quote1, t.testimonials.quote2, t.testimonials.quote3];
  const companyLogoIds = ['vng', 'fpt', 'grab'];

  const outcomeTags = [
    { vi: '🚀 Đạt Offer $3,200/tháng', en: '🚀 Landed $3,200/mo Offer' },
    { vi: '⚡ Tuyển đủ 5 Senior trong 10 ngày', en: '⚡ Hired 5 Seniors in 10 days' },
    { vi: '🎯 Tăng 45% tỷ lệ phỏng vấn', en: '🎯 +45% Interview Callbacks' }
  ];

  return (
    <section id="testimonials" className="scroll-mt-24 py-10 sm:py-12 md:py-14 bg-slate-50/60 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60 shadow-soft-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.testimonials.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.testimonials.headline}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {t.testimonials.subtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {MOCK_TESTIMONIALS.map((item, idx) => (
            <div
              key={item.name}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-7 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400/80 dark:hover:border-emerald-500/60 shadow-soft-sm hover:shadow-soft-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden"
            >
              {/* Top ambient highlight on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-4">
                {/* 5-Star Rating + Company Logo Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-200" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-soft-2xs">
                    <CompanyLogo company={companyLogoIds[idx] || 'vng'} size="xs" />
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {companyLogoIds[idx] === 'vng' ? 'VNG' : companyLogoIds[idx] === 'fpt' ? 'FPT' : 'GRAB'}
                    </span>
                  </div>
                </div>

                {/* Outcome Highlight Tag */}
                <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  {language === 'vi' ? outcomeTags[idx].vi : outcomeTags[idx].en}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                  "{quotes[idx] || (language === 'vi' ? item.content : (item.contentEn || item.content))}"
                </p>
              </div>

              {/* Author Row */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-emerald-500/60 shadow-soft-sm transition-all"
                  />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                      <span>{item.name}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {language === 'vi' ? item.role : (item.roleEn || item.role)}
                    </p>
                  </div>
                </div>
                <span className="inline-block text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                  {language === 'vi' ? item.badge : (item.badgeEn || (item.badge === 'Ứng viên thành công' ? 'Successful Candidate' : 'Verified Employer'))}
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
