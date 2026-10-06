import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobApi } from '../lib/api';
import type { Job, Page } from '../lib/types';
import { EXP_LEVELS, JOB_TYPES } from '../lib/format';
import { SearchBar } from '../components/jobs/SearchBar';
import { JobCard } from '../components/jobs/JobCard';
import { EmptyState, ErrorBox, Pagination, Spinner } from '../components/ui/primitives';
import { useMatchScores } from '../lib/useMatchScores';
import { useMyApplications } from '../context/MyApplicationsContext';
import { usePageTitle } from '../lib/usePageTitle';

const PAGE_SIZE = 12;
const SALARY_OPTIONS = [
  { value: '', label: 'Mọi mức lương' },
  { value: '10', label: 'Từ 10 triệu' },
  { value: '20', label: 'Từ 20 triệu' },
  { value: '30', label: 'Từ 30 triệu' },
  { value: '50', label: 'Từ 50 triệu' },
];
const SORTS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'salary', label: 'Lương cao nhất' },
  { value: 'views', label: 'Xem nhiều nhất' },
];

const selectCls =
  'h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-soft-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';

export const JobsPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const city = params.get('city') ?? '';
  const level = params.get('level') ?? '';
  const type = params.get('type') ?? '';
  const salary = params.get('salary') ?? '';
  const sort = (params.get('sort') ?? 'newest') as 'newest' | 'salary' | 'views';
  const page = Math.max(0, Number(params.get('page') ?? '1') - 1);

  usePageTitle(q ? `Việc làm ${q}` : 'Tìm việc làm');

  const [result, setResult] = useState<Page<Job> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const scores = useMatchScores(result?.items.map((j) => j.id) ?? []);
  const { appliedJobIds } = useMyApplications();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
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
      .then((r) => active && setResult(r))
      .catch((e: Error) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [q, city, level, type, salary, sort, page, reload]);

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
    if ('page' in changes) window.scrollTo({ top: 0 });
  };

  const hasFilters = !!(level || type || salary);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-slate-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="absolute inset-0 hero-grid-pattern pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Tìm việc</span>
          <p className="mt-1 mb-5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Cơ hội việc làm dành cho bạn</p>
          <SearchBar keyword={q} city={city} onSearch={(k, c) => update({ q: k, city: c })} />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Cấp bậc" value={level} onChange={(e) => update({ level: e.target.value })} className={selectCls}>
            <option value="">Tất cả cấp bậc</option>
            {Object.entries(EXP_LEVELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select aria-label="Hình thức" value={type} onChange={(e) => update({ type: e.target.value })} className={selectCls}>
            <option value="">Tất cả hình thức</option>
            {['FULL_TIME', 'HYBRID', 'INTERNSHIP'].map((k) => (
              <option key={k} value={k}>
                {JOB_TYPES[k]}
              </option>
            ))}
          </select>
          <select aria-label="Mức lương" value={salary} onChange={(e) => update({ salary: e.target.value })} className={selectCls}>
            {SALARY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={() => update({ level: '', type: '', salary: '' })}
              className="text-sm text-emerald-600 dark:text-emerald-400 font-bold px-2 hover:underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-black text-slate-900 dark:text-white" data-testid="result-count">
            {result ? `${result.totalElements} việc làm${q ? ` cho "${q}"` : ''}${city ? ` tại ${city}` : ''}` : 'Đang tìm việc làm…'}
          </h1>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Sắp xếp
            <select value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })} className={selectCls}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5">
          {error ? (
            <ErrorBox message={error} onRetry={() => setReload((r) => r + 1)} />
          ) : loading && !result ? (
            <div className="py-16 flex justify-center">
              <Spinner />
            </div>
          ) : result && result.items.length === 0 ? (
            <EmptyState
              title="Không tìm thấy việc làm phù hợp"
              description="Thử bỏ bớt bộ lọc hoặc dùng từ khóa khác."
              action={
                <button onClick={() => setParams(new URLSearchParams())} className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Xem tất cả việc làm
                </button>
              }
            />
          ) : (
            <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
              {result?.items.map((j) => (
                <JobCard key={j.id} job={j} match={scores[j.id]} applied={appliedJobIds.has(j.id)} />
              ))}
            </div>
          )}
          {result && <Pagination page={result.page} totalPages={result.totalPages} onChange={(p) => update({ page: String(p + 1) })} />}
        </div>
      </div>
    </>
  );
};
