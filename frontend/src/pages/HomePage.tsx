import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Building2, MapPin, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react';
import { companyApi, jobApi } from '../lib/api';
import type { Company, Job } from '../lib/types';
import { SearchBar } from '../components/jobs/SearchBar';
import { JobCard } from '../components/jobs/JobCard';
import { CompanyAvatar, ErrorBox, Spinner } from '../components/ui/primitives';
import { useMatchScores } from '../lib/useMatchScores';
import { useMyApplications } from '../context/MyApplicationsContext';
import { usePageTitle } from '../lib/usePageTitle';

const POPULAR_KEYWORDS = ['Java', 'ReactJS', '.NET', 'Python', 'NodeJS', 'Tester', 'DevOps', 'Data'];

const SectionHeader: React.FC<{ eyebrow: string; title: string; to: string }> = ({ eyebrow, title, to }) => (
  <div className="flex items-end justify-between gap-4 mb-8">
    <div>
      <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{eyebrow}</span>
      <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
    </div>
    <Link
      to={to}
      className="shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400 transition-colors"
    >
      Xem tất cả <ArrowRight className="w-4 h-4" />
    </Link>
  </div>
);

export const HomePage: React.FC = () => {
  usePageTitle();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [allCompanies, setAllCompanies] = useState<Company[] | null>(null);
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
      .then((list) => setAllCompanies(list))
      .catch(() => setAllCompanies([]));
  };

  useEffect(load, []);

  const search = (keyword: string, city: string) => {
    const qs = new URLSearchParams();
    if (keyword) qs.set('q', keyword);
    if (city) qs.set('city', city);
    navigate(`/jobs${qs.toString() ? `?${qs}` : ''}`);
  };

  const companies = allCompanies ? [...allCompanies].sort((a, b) => b.openJobsCount - a.openJobsCount).slice(0, 8) : null;
  const hiringCompanies = allCompanies?.filter((c) => c.openJobsCount > 0).length ?? null;
  const cities = allCompanies ? new Set(allCompanies.map((c) => c.city).filter(Boolean)).size : null;

  const stats = [
    { icon: Briefcase, value: total, label: 'Việc làm đang tuyển', sub: 'Cập nhật theo thời gian thực' },
    { icon: Building2, value: hiringCompanies, label: 'Công ty đang tuyển', sub: 'Hồ sơ doanh nghiệp xác thực' },
    { icon: MapPin, value: cities, label: 'Thành phố', sub: 'Trên khắp Việt Nam' },
    { icon: ShieldCheck, value: '100%', label: 'Miễn phí cho ứng viên', sub: 'Ứng tuyển không giới hạn' },
  ];

  return (
    <>
      <section className="bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-14">
          <div className="relative overflow-hidden rounded-[2rem] border-2 border-emerald-500/45 bg-gradient-to-b from-emerald-50/70 via-white/90 to-white/95 dark:from-emerald-950/35 dark:via-slate-900/70 dark:to-slate-900/90 ring-1 ring-emerald-400/25 shadow-[0_15px_45px_-12px_rgba(16,185,129,0.18)] px-5 py-10 sm:px-12 sm:py-14">
            <div className="absolute inset-0 hero-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-72 rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="relative max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-300/80 dark:border-emerald-700/70 bg-white/80 dark:bg-slate-900/70 text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-300 shadow-soft-xs">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span data-testid="home-job-count">
                  {total !== null ? `${total} việc làm IT đang tuyển` : 'Việc làm IT đang tuyển'}
                </span>
              </span>

              <h1 className="mt-5 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Tìm kiếm{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">công việc IT mơ ước</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
                Kết nối ứng viên tài năng với nhà tuyển dụng hàng đầu — tìm việc theo kỹ năng, địa điểm và công ty bạn quan tâm.
              </p>

              <div className="mt-8 text-left">
                <SearchBar onSearch={search} />
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Gợi ý xu hướng:
                </span>
                {POPULAR_KEYWORDS.map((k) => (
                  <Link
                    key={k}
                    to={`/jobs?q=${encodeURIComponent(k)}`}
                    className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-medium hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors"
                  >
                    {k}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {companies && companies.length > 0 && (
            <div className="mt-10">
              <p className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="hidden sm:block w-8 h-px bg-slate-300 dark:bg-slate-700" />
                Các doanh nghiệp đang tuyển dụng trên TalentBridge
                <span className="hidden sm:block w-8 h-px bg-slate-300 dark:bg-slate-700" />
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                {companies.map((c) => (
                  <Link
                    key={c.id}
                    to={`/companies/${c.id}`}
                    className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 hover:shadow-soft-sm transition-all"
                  >
                    <CompanyAvatar name={c.name} logoUrl={c.logoUrl} size="sm" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 max-w-[140px] truncate">{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 pt-10 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 hover:border-emerald-300 transition-colors"
              >
                <span className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">{s.value ?? '—'}</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.label}</p>
                  <p className="text-[11px] text-slate-400">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/70 dark:border-slate-800/70 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader eyebrow="Mới cập nhật" title="Việc làm mới nhất" to="/jobs" />
          {error ? (
            <ErrorBox message={error} onRetry={load} />
          ) : !jobs ? (
            <div className="py-12 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} match={scores[j.id]} applied={appliedJobIds.has(j.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {companies && companies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <SectionHeader eyebrow="Top công ty" title="Nhà tuyển dụng hàng đầu" to="/companies" />
          <div className="grid gap-5 grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {companies.map((c) => (
              <Link
                key={c.id}
                to={`/companies/${c.id}`}
                className="group bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center hover:border-emerald-400 hover:shadow-[0_12px_35px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1 transition-all duration-300"
              >
                <CompanyAvatar name={c.name} logoUrl={c.logoUrl} size="lg" />
                <p className="mt-4 font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {c.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {c.city}
                </p>
                <span className="mt-4 px-3 py-1 rounded-lg text-xs font-black bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800/60">
                  {c.openJobsCount} việc làm
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-6 py-10 sm:px-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_15px_45px_-12px_rgba(16,185,129,0.35)]">
          <div className="absolute inset-0 opacity-20 hero-grid-pattern pointer-events-none" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-100">
              <Users className="w-4 h-4" />
              Dành cho nhà tuyển dụng
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black">Bạn là nhà tuyển dụng?</h2>
            <p className="text-emerald-50/90 text-sm sm:text-base mt-1">Đăng tin miễn phí, nhận hồ sơ và quản lý ứng viên theo từng vòng.</p>
          </div>
          <Link
            to="/employers"
            className="relative shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-emerald-700 font-black text-sm hover:bg-emerald-50 shadow-soft transition-colors"
          >
            Tìm hiểu thêm <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
};
