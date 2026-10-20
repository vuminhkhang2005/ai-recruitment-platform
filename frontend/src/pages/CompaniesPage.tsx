import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Users, Briefcase, BadgeCheck } from 'lucide-react';
import { companyApi } from '../lib/api';
import type { Company } from '../lib/types';
import { CompanyAvatar, EmptyState, ErrorBox, PageLoader, inputCls, resolveCompanyBanner } from '../components/ui/primitives';
import { usePageTitle } from '../lib/usePageTitle';
import { useLanguage } from '../i18n/LanguageContext';

export const CompaniesPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  usePageTitle(isVi ? 'Danh sách công ty' : 'Companies Directory');
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    companyApi
      .list()
      .then((list) => setCompanies([...list].sort((a, b) => b.openJobsCount - a.openJobsCount)))
      .catch((e: Error) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!companies) return [];
    return q ? companies.filter((c) => `${c.name} ${c.industry ?? ''} ${c.city ?? ''}`.toLowerCase().includes(q)) : companies;
  }, [companies, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {isVi ? 'Doanh nghiệp nổi bật' : 'Featured Employers'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {companies ? (isVi ? `${companies.length} công ty` : `${companies.length} companies`) : ''}
          </p>
        </div>
        <div className="relative sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isVi ? 'Tìm công ty' : 'Search companies...'}
            aria-label="Tìm công ty"
            className={`${inputCls} pl-9`}
          />
        </div>
      </div>

      <div className="mt-6">
        {error ? (
          <ErrorBox message={error} />
        ) : !companies ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <EmptyState title={isVi ? 'Không tìm thấy công ty' : 'No companies found'} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const bannerSrc = resolveCompanyBanner(c.name, c.bannerUrl);
              return (
                <Link
                  key={c.id}
                  to={`/companies/${c.id}`}
                  className="group relative bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl hover:border-emerald-400 hover:shadow-[0_14px_35px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="relative">
                    <div className="h-36 relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
                      {bannerSrc ? (
                        <img
                          src={bannerSrc}
                          alt={`${c.name} cover`}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:14px_14px]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />
                      {c.industry && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/10">
                          {c.industry}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-7 left-5 rounded-2xl ring-4 ring-white dark:ring-slate-900 shadow-soft-md">
                      <CompanyAvatar name={c.name} logoUrl={c.logoUrl} size="md" />
                    </div>
                  </div>

                  <div className="px-5 pt-10 pb-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-black text-lg text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {c.name}
                      </p>
                      {c.verificationStatus === 'VERIFIED' && (
                        <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {c.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          {c.city}
                        </span>
                      )}
                      {c.companySize && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-500" />
                          {c.companySize} {isVi ? 'nhân viên' : 'employees'}
                        </span>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 flex-1">
                        {c.description}
                      </p>
                    )}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-xs border border-emerald-200/90 dark:border-emerald-800/60">
                        <Briefcase className="w-3.5 h-3.5" />
                        {c.openJobsCount
                          ? isVi
                            ? `${c.openJobsCount} việc làm đang tuyển`
                            : `${c.openJobsCount} open jobs`
                          : isVi
                          ? 'Chưa có việc làm đang tuyển'
                          : 'No active jobs'}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                        {isVi ? 'Xem chi tiết →' : 'View details →'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
