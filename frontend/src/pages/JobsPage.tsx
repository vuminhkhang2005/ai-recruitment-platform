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

const PAGE_SIZE = 10;
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
  'h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/30';

export const JobsPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const city = params.get('city') ?? '';
  const level = params.get('level') ?? '';
  const type = params.get('type') ?? '';
  const salary = params.get('salary') ?? '';
  const sort = (params.get('sort') ?? 'newest') as 'newest' | 'salary' | 'views';
  const page = Math.max(0, Number(params.get('page') ?? '1') - 1);

  usePageTitle(q ? `Việc làm ${q}` : 'Việc làm IT');

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
      <section className="bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <SearchBar keyword={q} city={city} onSearch={(k, c) => update({ q: k, city: c })} />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mt-6">
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
            <button onClick={() => update({ level: '', type: '', salary: '' })} className="text-sm text-red-600 font-medium px-2 hover:underline">
              Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-slate-900" data-testid="result-count">
            {result ? `${result.totalElements} việc làm${q ? ` cho "${q}"` : ''}${city ? ` tại ${city}` : ''}` : 'Đang tìm việc làm…'}
          </h1>
          <label className="flex items-center gap-2 text-sm text-slate-600">
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

        <div className="mt-4">
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
                <button onClick={() => setParams(new URLSearchParams())} className="text-sm font-semibold text-red-600 hover:underline">
                  Xem tất cả việc làm
                </button>
              }
            />
          ) : (
            <div className={`grid gap-3 lg:grid-cols-2 ${loading ? 'opacity-60' : ''}`}>
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
