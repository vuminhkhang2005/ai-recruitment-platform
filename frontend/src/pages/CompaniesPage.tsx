import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { companyApi } from '../lib/api';
import type { Company } from '../lib/types';
import { CompanyAvatar, EmptyState, ErrorBox, PageLoader, inputCls } from '../components/ui/primitives';
import { usePageTitle } from '../lib/usePageTitle';

export const CompaniesPage: React.FC = () => {
  usePageTitle('Công ty IT');
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
          <h1 className="text-2xl font-bold text-slate-900">Công ty IT</h1>
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
              <Link key={c.id} to={`/companies/${c.id}`} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-red-300 hover:shadow-sm flex gap-4">
                <CompanyAvatar name={c.name} logoUrl={c.logoUrl} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{[c.industry, c.city].filter(Boolean).join(' · ')}</p>
                  {c.description && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{c.description}</p>}
                  <p className="mt-2 text-sm font-medium text-red-600">{c.openJobsCount ? `${c.openJobsCount} việc làm đang tuyển` : 'Chưa có việc làm đang tuyển'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
