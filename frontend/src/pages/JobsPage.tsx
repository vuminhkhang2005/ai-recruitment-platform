import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Flame, Sparkles } from 'lucide-react';
import { ApiError, companyApi, jobApi } from '../lib/api';
import type { Company, Job, Page } from '../lib/types';
import { EXP_LEVELS, JOB_TYPES, getExpLevels, getJobTypes } from '../lib/format';
import { SearchBar } from '../components/jobs/SearchBar';
import { JobCard } from '../components/jobs/JobCard';
import { JobDetailPanel } from '../components/jobs/JobDetailPanel';
import { EmptyState, ErrorBox, Pagination, Spinner } from '../components/ui/primitives';
import { useMatchScores } from '../lib/useMatchScores';
import { useMyApplications } from '../context/MyApplicationsContext';
import { usePageTitle } from '../lib/usePageTitle';
import { useLanguage } from '../i18n/LanguageContext';
import { NotFoundPage } from './NotFoundPage';

const PAGE_SIZE = 12;
const getSalaryOptions = (lang: string) => [
  { value: '', label: lang === 'vi' ? 'Mọi mức lương' : 'All Salary Ranges' },
  { value: '10', label: lang === 'vi' ? 'Từ 10 triệu' : 'From 10M' },
  { value: '20', label: lang === 'vi' ? 'Từ 20 triệu' : 'From 20M' },
  { value: '30', label: lang === 'vi' ? 'Từ 30 triệu' : 'From 30M' },
  { value: '50', label: lang === 'vi' ? 'Từ 50 triệu' : 'From 50M' },
];
const getSorts = (lang: string) => [
  { value: 'newest', label: lang === 'vi' ? 'Mới nhất' : 'Newest' },
  { value: 'salary', label: lang === 'vi' ? 'Lương cao nhất' : 'Highest Salary' },
  { value: 'views', label: lang === 'vi' ? 'Xem nhiều nhất' : 'Most Viewed' },
];

const selectCls =
  'h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-soft-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer';

export const JobsPage: React.FC = () => {
  const { id: routeJobId } = useParams<{ id?: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const q = params.get('q') ?? params.get('keyword') ?? '';
  const city = params.get('city') ?? '';
  const level = params.get('level') ?? '';
  const type = params.get('type') ?? '';
  const salary = params.get('salary') ?? '';
  const sort = (params.get('sort') ?? 'newest') as 'newest' | 'salary' | 'views';
  const page = Math.max(0, Number(params.get('page') ?? '1') - 1);

  const [result, setResult] = useState<Page<Job> | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedJobId, setSelectedJobId] = useState<number | null>(routeJobId ? Number(routeJobId) : null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<{ status: number; message: string } | null>(null);

  const [reload, setReload] = useState(0);

  const activeJobId = routeJobId ? Number(routeJobId) : selectedJobId;

  // Title: If viewing a job, show job title, otherwise show search query
  usePageTitle(
    selectedJob
      ? `${selectedJob.title} - ${selectedJob.companyName}`
      : q
        ? (isVi ? `Việc làm ${q}` : `Jobs for ${q}`)
        : (isVi ? 'Tìm việc làm' : 'Job Search')
  );

  // Match scores for current page items + selected job
  const allJobIds = Array.from(
    new Set([...(result?.items.map((j) => j.id) ?? []), ...(activeJobId ? [activeJobId] : [])])
  );
  const scores = useMatchScores(allJobIds);
  const { appliedJobIds } = useMyApplications();

  // 1. Fetch search list
  useEffect(() => {
    let active = true;
    setLoadingList(true);
    setListError(null);
    jobApi
      .search({
        keyword: q || undefined,
        city: city || undefined,
        expLevel: level || undefined,
        jobType: type || undefined,
        minSalary: salary ? Number(salary) * 1_000_000 : undefined,
        sortBy: sort,
        page,
        size: PAGE_SIZE,
      })
      .then((r) => {
        if (!active) return;
        setResult(r);
      })
      .catch((e: Error) => active && setListError(e.message))
      .finally(() => active && setLoadingList(false));
    return () => {
      active = false;
    };
  }, [q, city, level, type, salary, sort, page, reload]);

  // 2. Default selection when list loads and no route job ID
  useEffect(() => {
    if (!routeJobId && !selectedJobId && result && result.items.length > 0) {
      setSelectedJobId(result.items[0].id);
      setSelectedJob(result.items[0]);
    }
  }, [routeJobId, selectedJobId, result]);

  // 3. Fetch detail for active job ID
  useEffect(() => {
    let active = true;
    if (!activeJobId) {
      setSelectedJob(null);
      setSelectedCompany(null);
      return;
    }

    // If current selectedJob matches activeJobId and already has company, skip full reload
    if (selectedJob && selectedJob.id === activeJobId && selectedCompany && selectedCompany.id === selectedJob.companyId) {
      return;
    }

    setLoadingDetail(true);
    setDetailError(null);

    jobApi
      .get(String(activeJobId))
      .then((j) => {
        if (!active) return;
        setSelectedJob(j);
        companyApi
          .get(j.companyId)
          .then((c) => active && setSelectedCompany(c))
          .catch(() => undefined);
      })
      .catch((e: ApiError) => {
        if (!active) return;
        setDetailError({ status: e.status || 500, message: e.message || 'Lỗi tải chi tiết' });
      })
      .finally(() => active && setLoadingDetail(false));

    return () => {
      active = false;
    };
  }, [activeJobId, reload]);

  // If a nonexistent job was requested directly via URL (/jobs/999999), show 404 page
  if (routeJobId && detailError && (detailError.status === 404 || detailError.status === 400)) {
    return <NotFoundPage message={isVi ? "Tin tuyển dụng không tồn tại hoặc đã bị gỡ." : "This job post does not exist or has been removed."} />;
  }

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');

    if (routeJobId) {
      // If user filters or searches while in a detail route, navigate to /jobs with query params
      navigate(`/jobs?${next.toString()}`);
    } else {
      setParams(next);
      if ('page' in changes) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const hasFilters = !!(level || type || salary || q || city);
  const salaryOptions = getSalaryOptions(language);
  const sorts = getSorts(language);
  const expLevels = getExpLevels(language);
  const jobTypes = getJobTypes(language);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* 1. Sleek, Unified Search & Filter Console Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-soft-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 space-y-3">
          {/* Top Title & Result Badge Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {isVi ? 'Tìm kiếm việc làm' : 'Job Search'}
              </h1>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                {isVi ? 'Khám phá cơ hội nghề nghiệp đa lĩnh vực' : 'Explore opportunities across multiple industries'}
              </span>
            </div>
            {result && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{result.totalElements} {isVi ? 'việc làm' : 'jobs'}</span>
              </span>
            )}
          </div>

          {/* SearchBar */}
          <SearchBar keyword={q} city={city} onSearch={(k, c) => update({ q: k, city: c })} />

          {/* Integrated Filter Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <select aria-label="Cấp bậc" value={level} onChange={(e) => update({ level: e.target.value })} className={selectCls}>
                <option value="">{isVi ? 'Tất cả cấp bậc' : 'All Levels'}</option>
                {Object.entries(expLevels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>

              <select aria-label="Hình thức" value={type} onChange={(e) => update({ type: e.target.value })} className={selectCls}>
                <option value="">{isVi ? 'Tất cả hình thức' : 'All Job Types'}</option>
                {['FULL_TIME', 'HYBRID', 'INTERNSHIP'].map((k) => (
                  <option key={k} value={k}>
                    {jobTypes[k]}
                  </option>
                ))}
              </select>

              <select aria-label="Mức lương" value={salary} onChange={(e) => update({ salary: e.target.value })} className={selectCls}>
                {salaryOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    if (routeJobId) navigate('/jobs');
                    else setParams(new URLSearchParams());
                  }}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  {isVi ? 'Xóa bộ lọc' : 'Clear Filters'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Segmented Filter Tags */}
              <div className="hidden md:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => update({ salary: '30' })}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                    salary === '30'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-soft-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-400'
                  }`}
                >
                  {isVi ? '💰 Lương > 30M' : '💰 Salary > 30M'}
                </button>
                <button
                  type="button"
                  onClick={() => update({ type: 'HYBRID' })}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                    type === 'HYBRID'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-soft-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-400'
                  }`}
                >
                  🏢 Hybrid
                </button>
                <button
                  type="button"
                  onClick={() => update({ level: 'SENIOR' })}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                    level === 'SENIOR'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-soft-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-400'
                  }`}
                >
                  ⭐ Senior
                </button>
              </div>

              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                {isVi ? 'Sắp xếp:' : 'Sort by:'}
                <select
                  value={sort}
                  onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}
                  className={selectCls}
                >
                  {sorts.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Master-Detail Area */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-10">

        {/* Master-Detail Content Grid */}
        <div className="mt-6">
          {listError ? (
            <ErrorBox message={listError} onRetry={() => setReload((r) => r + 1)} />
          ) : loadingList && !result ? (
            <div className="py-20 flex justify-center">
              <Spinner />
            </div>
          ) : result && result.items.length === 0 ? (
            <EmptyState
              title={isVi ? "Không tìm thấy việc làm phù hợp" : "No matching jobs found"}
              description={isVi ? "Thử bỏ bớt bộ lọc hoặc dùng từ khóa khác để khám phá cơ hội mới." : "Try adjusting your filters or search keywords to discover new opportunities."}
              action={
                <button
                  type="button"
                  onClick={() => {
                    if (routeJobId) navigate('/jobs');
                    else setParams(new URLSearchParams());
                  }}
                  className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {isVi ? 'Xem tất cả việc làm' : 'View all jobs'}
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Master Job List (5 cols ~42%) */}
              <div className={`lg:col-span-5 space-y-3 ${routeJobId ? 'hidden lg:block' : 'block'}`}>
                {/* Result count & active query */}
                <div className="flex items-center justify-between px-1">
                  <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white" data-testid="result-count">
                    {result
                      ? (isVi
                          ? `${result.totalElements} việc làm${q ? ` cho "${q}"` : ''}${city ? ` tại ${city}` : ''}`
                          : `${result.totalElements} jobs found${q ? ` for "${q}"` : ''}${city ? ` in ${city}` : ''}`)
                      : (isVi ? 'Đang tìm việc làm…' : 'Searching for jobs...')}
                  </h1>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {isVi ? `Trang ${page + 1}/${result?.totalPages || 1}` : `Page ${page + 1} of ${result?.totalPages || 1}`}
                  </span>
                </div>

                {/* Scrollable Master Job List */}
                <div className="lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto pr-1.5 space-y-3 custom-scrollbar">
                  {result?.items.map((j) => {
                    const isSelected = activeJobId === j.id;
                    return (
                      <JobCard
                        key={j.id}
                        job={j}
                        match={scores[j.id]}
                        applied={appliedJobIds.has(j.id)}
                        selected={isSelected}
                        compact
                        preserveSearch
                        onClick={() => {
                          setSelectedJobId(j.id);
                          setSelectedJob(j);
                        }}
                      />
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {result && result.totalPages > 1 && (
                  <div className="pt-2">
                    <Pagination
                      page={result.page}
                      totalPages={result.totalPages}
                      onChange={(p) => update({ page: String(p + 1) })}
                    />
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Sticky Detail Panel (7 cols ~58%) */}
              <div
                className={`lg:col-span-7 lg:sticky lg:top-20 lg:max-h-[calc(100vh-140px)] flex flex-col ${
                  routeJobId ? 'block' : 'hidden lg:flex'
                }`}
              >
                {/* Mobile Back Button: Only shown on small screens when viewing detail */}
                {routeJobId && (
                  <div className="lg:hidden mb-4">
                    <Link
                      to={`/jobs${location.search}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft-xs"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {isVi ? 'Quay lại danh sách việc làm' : 'Back to job list'}
                    </Link>
                  </div>
                )}

                {/* Detail Panel */}
                {selectedJob ? (
                  <JobDetailPanel
                    job={selectedJob}
                    company={selectedCompany}
                    match={scores[selectedJob.id]}
                    onApplied={() => setReload((r) => r + 1)}
                  />
                ) : loadingDetail ? (
                  <div className="p-20 flex justify-center items-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 min-h-[400px]">
                    <Spinner />
                  </div>
                ) : (
                  <div className="p-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                    {isVi ? 'Chọn một việc làm bên danh sách để xem chi tiết' : 'Select a job from the list to view details'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
