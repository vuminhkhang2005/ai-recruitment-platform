import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { companyApi, jobApi } from '../lib/api';
import type { Company, Job } from '../lib/types';
import { SearchBar } from '../components/jobs/SearchBar';
import { JobCard } from '../components/jobs/JobCard';
import { CompanyAvatar, ErrorBox, Spinner } from '../components/ui/primitives';
import { useMatchScores } from '../lib/useMatchScores';
import { useMyApplications } from '../context/MyApplicationsContext';
import { usePageTitle } from '../lib/usePageTitle';

const POPULAR_KEYWORDS = ['Java', 'ReactJS', '.NET', 'Python', 'NodeJS', 'Tester', 'DevOps', 'Data'];

export const HomePage: React.FC = () => {
  usePageTitle();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scores = useMatchScores(jobs?.map((j) => j.id) ?? []);
  const { appliedJobIds } = useMyApplications();

  const load = () => {
    setError(null);
    jobApi
      .search({ page: 0, size: 6, sortBy: 'newest' })
      .then((p) => {
        setJobs(p.items);
        setTotal(p.totalElements);
      })
      .catch((e: Error) => setError(e.message));
    companyApi
      .list()
      .then((list) => setCompanies([...list].sort((a, b) => b.openJobsCount - a.openJobsCount).slice(0, 8)))
      .catch(() => setCompanies([]));
  };

  useEffect(load, []);

  const search = (keyword: string, city: string) => {
    const qs = new URLSearchParams();
    if (keyword) qs.set('q', keyword);
    if (city) qs.set('city', city);
    navigate(`/jobs${qs.toString() ? `?${qs}` : ''}`);
  };

  return (
    <>
      <section className="bg-gradient-to-b from-[#121212] to-[#2a1214] text-white">
        <div className="max-w-5xl mx-auto px-4 py-14 sm:py-20">
          <h1 className="text-3xl sm:text-4xl font-bold">
            {total !== null ? `${total} việc làm IT đang tuyển` : 'Việc làm IT đang tuyển'}
          </h1>
          <p className="mt-2 text-slate-300">Tìm việc theo kỹ năng, vị trí và công ty bạn quan tâm.</p>
          <div className="mt-6">
            <SearchBar onSearch={search} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-400">Gợi ý:</span>
            {POPULAR_KEYWORDS.map((k) => (
              <Link
                key={k}
                to={`/jobs?q=${encodeURIComponent(k)}`}
                className="px-3 py-1 rounded-full border border-white/20 text-slate-200 hover:border-white/60"
              >
                {k}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl font-bold text-slate-900">Việc làm mới nhất</h2>
          <Link to="/jobs" className="text-sm font-semibold text-red-600 hover:underline inline-flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {error ? (
          <ErrorBox message={error} onRetry={load} />
        ) : !jobs ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} match={scores[j.id]} applied={appliedJobIds.has(j.id)} />
            ))}
          </div>
        )}
      </section>

      {companies && companies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-14">
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Nhà tuyển dụng hàng đầu</h2>
            <Link to="/companies" className="text-sm font-semibold text-red-600 hover:underline inline-flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {companies.map((c) => (
              <Link
                key={c.id}
                to={`/companies/${c.id}`}
                className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col items-center text-center hover:border-red-300 hover:shadow-sm"
              >
                <CompanyAvatar name={c.name} logoUrl={c.logoUrl} size="lg" />
                <p className="mt-3 font-semibold text-slate-900 line-clamp-1">{c.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{c.city}</p>
                <p className="mt-3 text-sm font-medium text-red-600">{c.openJobsCount} việc làm</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="rounded-xl bg-slate-900 text-white px-6 py-8 sm:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Bạn là nhà tuyển dụng?</h2>
            <p className="text-slate-300 text-sm mt-1">Đăng tin miễn phí, nhận hồ sơ và quản lý ứng viên theo từng vòng.</p>
          </div>
          <Link to="/employers" className="shrink-0 px-5 py-2.5 rounded-md bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100">
            Tìm hiểu thêm
          </Link>
        </div>
      </section>
    </>
  );
};
