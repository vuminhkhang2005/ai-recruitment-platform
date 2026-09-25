import React from 'react';
import { 
  Building2, 
  Star, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase 
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MOCK_COMPANIES, type TopCompany } from '../../data/mockData';
import { CompanyLogo } from '../ui/CompanyLogo';

interface TopCompaniesProps {
  onSelectCompany?: (companyName: string) => void;
}

export const TopCompanies: React.FC<TopCompaniesProps> = ({ onSelectCompany }) => {
  const { t, language } = useLanguage();

  return (
    <section id="companies" className="scroll-mt-24 py-10 sm:py-12 md:py-14 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{language === 'vi' ? 'DOANH NGHIỆP CÔNG NGHỆ HÀNG ĐẦU' : 'TOP TECH EMPLOYERS'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.topCompanies.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
              {t.topCompanies.subtitle}
            </p>
          </div>

          <a
            href="#jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            <span>{language === 'vi' ? 'Xem tất cả 3,800+ công ty' : 'View all 3,800+ companies'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Companies Grid: 3 Columns for optimal readability & photo display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_COMPANIES.map((company) => (
            <div
              key={company.id}
              className="group relative bg-white dark:bg-slate-900/95 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-[0_14px_35px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Cover Banner Area with Independent Overflow Control */}
              <div className="relative">
                {/* Real Campus Photo Container */}
                <div className="h-36 relative overflow-hidden rounded-t-2xl sm:rounded-t-3xl bg-slate-900">
                  <img
                    src={company.coverImage}
                    alt={`${company.name} Campus`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                  
                  {/* Industry Tag */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-soft-xs border border-white/10 z-10">
                    {company.industry}
                  </span>
                </div>

                {/* Floating Real Vector Company Logo - Placed OUTSIDE the overflow-hidden photo with z-30 (Top Layer) */}
                <div className="absolute -bottom-6 left-5 z-30 pointer-events-none">
                  <CompanyLogo 
                    company={company.logoId} 
                    size="lg" 
                    className="ring-4 ring-white dark:ring-slate-900 shadow-soft-xl rounded-2xl bg-white dark:bg-slate-800" 
                  />
                </div>
              </div>

              {/* Company Info (pt-9 ensures ample clearance for the floating logo) */}
              <div className="pt-9 px-5 pb-5 flex-1 flex flex-col justify-between space-y-4 rounded-b-2xl">
                <div>
                  
                  {/* Name & Verification Seal */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {company.name}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                  </div>

                  {/* Company Tagline */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {language === 'vi' ? company.tagline : (company.taglineEn || company.tagline)}
                  </p>

                  {/* Badges */}
                  {((language === 'vi' ? company.badges : (company.badgesEn || company.badges)) || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(language === 'vi' ? (company.badges || []) : (company.badgesEn || company.badges || [])).slice(0, 2).map((badge, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-md"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Rating Stars & Location */}
                  <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{company.rating}</span>
                      <span className="text-slate-400 dark:text-slate-500 font-normal">({company.reviewCount} {language === 'vi' ? 'đánh giá' : 'reviews'})</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {language === 'vi' ? company.location.split('&')[0].trim() : (company.locationEn || company.location).split('&')[0].trim()}
                    </span>
                  </div>

                  {/* Key Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {company.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Open Jobs Button */}
                <a
                  href="#jobs"
                  onClick={() => onSelectCompany?.(company.name)}
                  className="w-full py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-soft-2xs group-hover:border-emerald-400"
                >
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{company.openJobsCount}+ {t.topCompanies.openJobs}</span>
                </a>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
