import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { companyApi } from '../lib/api';
import type { Company } from '../lib/types';
import { CompanyAvatar, EmptyState, ErrorBox, PageLoader, inputCls } from '../components/ui/primitives';
import { usePageTitle } from '../lib/usePageTitle';

export const CompaniesPage: React.FC = () => {
  usePageTitle('Danh sách công ty');
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
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Doanh nghiệp nổi bật</h1>
          <p className="text-sm text-slate-500 mt-1">{companies ? `${companies.length} công ty` : ''}</p>
        </div>
        <div className="relative sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm công ty" aria-label="Tìm công ty" className={`${inputCls} pl-9`} />
        </div>
      </div>

      <div className="mt-6">
        {error ? (
          <ErrorBox message={error} />
        ) : !companies ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <EmptyState title="Không tìm thấy công ty" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Link key={c.id} to={`/companies/${c.id}`} className="group bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 hover:border-emerald-400 hover:shadow-[0_12px_35px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1 transition-all duration-300 flex gap-4">
                <CompanyAvatar name={c.name} logoUrl={c.logoUrl} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{c.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{[c.industry, c.city].filter(Boolean).join(' · ')}</p>
                  {c.description && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{c.description}</p>}
                  <p className="mt-3 inline-block px-2.5 py-0.5 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-xs border border-emerald-200/90 dark:border-emerald-800/60">{c.openJobsCount ? `${c.openJobsCount} việc làm đang tuyển` : 'Chưa có việc làm đang tuyển'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
