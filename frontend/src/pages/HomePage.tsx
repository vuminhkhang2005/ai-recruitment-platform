import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Briefcase,
  Building2,
  Calculator,
  CheckCircle2,
  Cloud,
  Database,
  FileText,
  Flame,
  Layout,
  MapPin,
  MousePointerClick,
  Search,
  Send,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UploadCloud,
  UserPlus,
  Users,
  Workflow,
} from 'lucide-react';
import { companyApi, jobApi } from '../lib/api';
import type { Company, Job } from '../lib/types';
import { SearchBar } from '../components/jobs/SearchBar';
import { JobCard } from '../components/jobs/JobCard';
import { CompanyAvatar, EmptyState, ErrorBox, Spinner } from '../components/ui/primitives';
import { useMatchScores } from '../lib/useMatchScores';
import { useMyApplications } from '../context/MyApplicationsContext';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../lib/usePageTitle';

const POPULAR_KEYWORDS = ['Kinh doanh', 'Marketing', 'Java', 'ReactJS', '.NET', 'Kế toán', 'Data', 'Nhân sự'];

/** Categories shown in the "Top ngành nghề" grid. */
const SPECIALTIES = [
  { keyword: 'Developer', label: 'Công nghệ thông tin', icon: Layout, tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
  { keyword: 'Kinh doanh', label: 'Kinh doanh & Bán hàng', icon: TrendingUp, tint: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400' },
  { keyword: 'Marketing', label: 'Marketing & Truyền thông', icon: Send, tint: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' },
  { keyword: 'Tài chính', label: 'Tài chính - Ngân hàng', icon: Building2, tint: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400' },
  { keyword: 'Thiết kế', label: 'Thiết kế & Sáng tạo', icon: Sparkles, tint: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' },
  { keyword: 'Nhân sự', label: 'Nhân sự & Hành chính', icon: Users, tint: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400' },
];

type TabKey = 'all' | 'salary' | 'urgent' | 'remote';
const TABS: { key: TabKey; label: string; to: string }[] = [
  { key: 'all', label: 'Tất cả việc làm', to: '/jobs' },
  { key: 'salary', label: 'Lương cao (≥ 30 triệu)', to: '/jobs?sort=salary' },
  { key: 'urgent', label: 'Tuyển gấp', to: '/jobs' },
  { key: 'remote', label: 'Remote / Hybrid', to: '/jobs?type=REMOTE' },
];

const filterJobs = (jobs: Job[], tab: TabKey) => {
  switch (tab) {
    case 'salary':
      return jobs
        .filter((j) => (j.maxSalary ?? j.minSalary ?? 0) >= 30_000_000)
        .sort((a, b) => (b.maxSalary ?? 0) - (a.maxSalary ?? 0));
    case 'urgent':
      return jobs.filter((j) => j.urgent);
    case 'remote':
      return jobs.filter((j) => j.jobType === 'REMOTE' || j.jobType === 'HYBRID');
    default:
      return jobs;
  }
};

const Eyebrow: React.FC<{ icon: React.ElementType; children: React.ReactNode; tone?: 'emerald' | 'sky' | 'amber' }> = ({
  icon: Icon,
  children,
  tone = 'emerald',
}) => {
  const tones = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
    sky: 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60',
    amber: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wide ${tones[tone]}`}>
      <Icon className="w-3.5 h-3.5" />
      {children}
    </span>
  );
};

const SectionHeading: React.FC<{
  eyebrow: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ eyebrow, title, subtitle, action }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
    <div className="max-w-2xl">
      {eyebrow}
      <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const SeeAll: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link
    to={to}
    className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
  >
    {children}
    <ArrowRight className="w-4 h-4" />
  </Link>
);

export const HomePage: React.FC = () => {
  usePageTitle();
  const navigate = useNavigate();
  const { user, isRecruiter } = useAuth();
  const [allJobs, setAllJobs] = useState<Job[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [allCompanies, setAllCompanies] = useState<Company[] | null>(null);
  const [specialtyCounts, setSpecialtyCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('all');
  const { appliedJobIds } = useMyApplications();

  const load = () => {
    setError(null);
    jobApi
      .search({ page: 0, size: 100, sortBy: 'newest' })
      .then((p) => {
        setAllJobs(p.items);
        setTotal(p.totalElements);
      })
      .catch((e: Error) => setError(e.message));
    companyApi
      .list()
      .then((list) => setAllCompanies(list))
      .catch(() => setAllCompanies([]));
    Promise.all(
      SPECIALTIES.map((s) =>
        jobApi
          .search({ keyword: s.keyword, page: 0, size: 1 })
          .then((p) => [s.keyword, p.totalElements] as const)
          .catch(() => [s.keyword, -1] as const),
      ),
    ).then((entries) => setSpecialtyCounts(Object.fromEntries(entries)));
  };

  useEffect(load, []);

  const visibleJobs = useMemo(() => (allJobs ? filterJobs(allJobs, tab).slice(0, 6) : null), [allJobs, tab]);
  const scores = useMatchScores(visibleJobs?.map((j) => j.id) ?? []);

  const search = (keyword: string, city: string) => {
    const qs = new URLSearchParams();
    if (keyword) qs.set('q', keyword);
    if (city) qs.set('city', city);
    navigate(`/jobs${qs.toString() ? `?${qs}` : ''}`);
  };

  const ranked = allCompanies ? [...allCompanies].sort((a, b) => b.openJobsCount - a.openJobsCount) : null;
  const hiring = ranked?.filter((c) => c.openJobsCount > 0) ?? null;
  const topCompanies = ranked?.slice(0, 6) ?? null;
  const cities = allCompanies ? new Set(allCompanies.map((c) => c.city).filter(Boolean)).size : null;
  const totalApplications = allJobs?.reduce((sum, j) => sum + (j.applicationsCount ?? 0), 0) ?? null;
  const topSpecialties = Object.entries(specialtyCounts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k);

  const stats = [
    { icon: Briefcase, value: total, label: 'Việc làm đang tuyển', sub: 'Cập nhật theo thời gian thực' },
    { icon: Building2, value: hiring?.length ?? null, label: 'Công ty đang tuyển', sub: 'Hồ sơ doanh nghiệp xác thực' },
    { icon: MapPin, value: cities, label: 'Thành phố', sub: 'Trên khắp Việt Nam' },
    { icon: ShieldCheck, value: '100%', label: 'Miễn phí cho ứng viên', sub: 'Ứng tuyển không giới hạn' },
  ];

  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-14">
          <div className="relative overflow-hidden rounded-[2rem] border-2 border-emerald-500/45 bg-gradient-to-b from-emerald-50/70 via-white/90 to-white/95 dark:from-emerald-950/35 dark:via-slate-900/70 dark:to-slate-900/90 ring-1 ring-emerald-400/25 shadow-[0_15px_45px_-12px_rgba(16,185,129,0.18)] px-5 py-10 sm:px-12 sm:py-14">
            <div className="absolute inset-0 hero-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-72 rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="relative max-w-4xl mx-auto text-center">
              <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-1.5 rounded-full border border-emerald-300/80 dark:border-emerald-700/70 bg-white/80 dark:bg-slate-900/70 text-xs sm:text-sm shadow-soft-xs">
                <span className="inline-flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span data-testid="home-job-count">
                    {total !== null ? `${total} việc làm đang tuyển` : 'Việc làm đang tuyển'}
                  </span>
                </span>
                <span className="hidden sm:inline text-slate-500 dark:text-slate-400 font-medium">Ứng tuyển nhanh — theo dõi từng vòng</span>
              </span>

              <h1 className="mt-5 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Tìm kiếm{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">công việc mơ ước</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
                Kết nối ứng viên tài năng với nhà tuyển dụng hàng đầu — tìm việc theo ngành nghề, kỹ năng, địa điểm và công ty bạn quan tâm.
              </p>

              {hiring && hiring.length > 0 && (
                <div className="mt-5 flex items-center justify-center gap-3">
                  <div className="flex gap-1.5">
                    {hiring.slice(0, 4).map((c) => (
                      <CompanyAvatar key={c.id} name={c.name} logoUrl={c.logoUrl} size="sm" />
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {hiring.length} doanh nghiệp đang tuyển dụng
                    </p>
                    {totalApplications !== null && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{totalApplications} lượt ứng tuyển qua TalentBridge</p>
                    )}
                  </div>
                </div>
              )}

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

          {hiring && hiring.length > 0 && (
            <div className="mt-10">
              <p className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="hidden sm:block w-8 h-px bg-slate-300 dark:bg-slate-700" />
                Các doanh nghiệp đang tuyển dụng trên TalentBridge
                <span className="hidden sm:block w-8 h-px bg-slate-300 dark:bg-slate-700" />
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                {hiring.map((c) => (
                  <Link
                    key={c.id}
                    to={`/companies/${c.id}`}
                    className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 hover:shadow-soft-sm transition-all"
                  >
                    <CompanyAvatar name={c.name} logoUrl={c.logoUrl} size="sm" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 max-w-[160px] truncate">{c.name}</span>
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

      {/* ============ TOP CATEGORIES ============ */}
      <section className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 py-14 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow={<Eyebrow icon={Flame}>Ngành nghề nổi bật</Eyebrow>}
            title="Top ngành nghề nổi bật"
            subtitle="Khám phá các cơ hội nghề nghiệp đang có nhu cầu tuyển dụng lớn nhất trên TalentBridge."
            action={<SeeAll to="/jobs">Xem tất cả việc làm</SeeAll>}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SPECIALTIES.map((s) => {
              const count = specialtyCounts[s.keyword];
              return (
                <Link
                  key={s.keyword}
                  to={`/jobs?q=${encodeURIComponent(s.keyword)}`}
                  className="group relative p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 flex flex-col items-center text-center hover:border-emerald-400 hover:shadow-[0_12px_35px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1 transition-all duration-300"
                >
                  {topSpecialties.includes(s.keyword) && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                      <Flame className="w-3 h-3" />
                      Hot
                    </span>
                  )}
                  <span className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.tint} group-hover:scale-110 transition-transform`}>
                    <s.icon className="w-6 h-6" />
                  </span>
                  <p className="mt-4 font-black text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {s.label}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {count === undefined ? '…' : count > 0 ? `${count} việc làm` : 'Xem việc làm'}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FEATURED JOBS ============ */}
      <section className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/70 dark:border-slate-800/70 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow={<Eyebrow icon={Flame}>Cơ hội tuyển dụng hàng đầu</Eyebrow>}
            title="Việc làm nổi bật"
            subtitle="Tin tuyển dụng mới nhất từ các doanh nghiệp hàng đầu — lọc nhanh theo mức lương, độ gấp và hình thức làm việc."
            action={
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lọc việc làm nổi bật">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      tab === t.key
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-soft-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            }
          />
          {error ? (
            <ErrorBox message={error} onRetry={load} />
          ) : !visibleJobs ? (
            <div className="py-12 flex justify-center">
              <Spinner />
            </div>
          ) : visibleJobs.length === 0 ? (
            <EmptyState title="Chưa có việc làm phù hợp" description="Hiện chưa có tin tuyển dụng nào thuộc nhóm này. Hãy thử bộ lọc khác." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleJobs.map((j) => (
                <JobCard key={j.id} job={j} match={scores[j.id]} applied={appliedJobIds.has(j.id)} />
              ))}
            </div>
          )}
          <div className="mt-10 flex justify-center">
            <Link
              to={activeTab.to}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-black text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/60 shadow-soft-xs transition-colors"
            >
              {tab === 'all' ? `Xem tất cả ${total ?? ''} việc làm` : 'Xem thêm việc làm'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ TOP COMPANIES ============ */}
      {topCompanies && topCompanies.length > 0 && (
        <section className="bg-white dark:bg-slate-950 py-16 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading
              eyebrow={<Eyebrow icon={Building2} tone="sky">Doanh nghiệp công nghệ hàng đầu</Eyebrow>}
              title="Top công ty đang tuyển"
              subtitle="Tìm hiểu môi trường làm việc, quy mô và các vị trí đang mở của từng doanh nghiệp."
              action={<SeeAll to="/companies">Xem tất cả {allCompanies?.length ?? ''} công ty</SeeAll>}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topCompanies.map((c) => (
                <Link
                  key={c.id}
                  to={`/companies/${c.id}`}
                  className="group relative bg-white dark:bg-slate-900/95 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-[0_14px_35px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                >
                  <div className="relative">
                    <div className="h-36 relative overflow-hidden rounded-t-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
                      {c.bannerUrl ? (
                        <img
                          src={c.bannerUrl}
                          alt={`${c.name} văn phòng`}
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
                    <p className="flex items-center gap-1.5 font-black text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      <span className="truncate">{c.name}</span>
                      {c.verificationStatus === 'VERIFIED' && <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </p>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">
                      {c.description || 'Doanh nghiệp đang tuyển dụng trên TalentBridge.'}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {c.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {c.city}
                        </span>
                      )}
                      {c.companySize && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {c.companySize} nhân viên
                        </span>
                      )}
                    </div>
                    <span className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-300 group-hover:text-emerald-700 dark:group-hover:bg-emerald-950/60 dark:group-hover:text-emerald-300 transition-colors">
                      <Briefcase className="w-4 h-4" />
                      {c.openJobsCount} việc làm đang mở
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ CV BANNER ============ */}
      {!isRecruiter && (
        <section className="bg-white dark:bg-slate-950 pb-16 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 px-6 py-10 sm:px-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
              <div className="relative max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-black uppercase tracking-wide">
                  <FileText className="w-3.5 h-3.5" />
                  Hồ sơ & CV
                </span>
                <h2 className="mt-4 text-2xl sm:text-3xl font-black text-white leading-tight">
                  Tải CV một lần — ứng tuyển mọi việc làm chỉ với một cú nhấp
                </h2>
                <p className="mt-3 text-slate-300 text-sm sm:text-base">
                  Lưu nhiều phiên bản CV, chọn CV mặc định và theo dõi trạng thái từng hồ sơ: sàng lọc, phỏng vấn, offer — giống cách các nền tảng tuyển dụng lớn vận hành.
                </p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    PDF, DOC, DOCX · tối đa 5MB
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    CV chỉ được gửi khi bạn ứng tuyển
                  </span>
                </div>
              </div>
              <div className="relative flex flex-wrap gap-3 shrink-0">
                <Link
                  to={user ? '/profile' : '/register'}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)] transition-colors"
                >
                  <UploadCloud className="w-5 h-5" />
                  {user ? 'Tải CV lên ngay' : 'Tạo hồ sơ miễn phí'}
                </Link>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-600 bg-slate-800/60 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
                >
                  Khám phá việc làm
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ HOW IT WORKS + TOOLS ============ */}
      <section className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/70 dark:border-slate-800/70 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow={<Eyebrow icon={Workflow}>Dành cho ứng viên</Eyebrow>}
            title="Tìm việc trên TalentBridge như thế nào?"
            subtitle="Bốn bước đơn giản từ lúc tạo hồ sơ đến khi nhận offer."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
              {[
                { icon: UserPlus, title: 'Tạo hồ sơ & tải CV', text: 'Điền thông tin, kỹ năng và tải lên các phiên bản CV của bạn.' },
                { icon: Search, title: 'Tìm & lưu việc phù hợp', text: 'Lọc theo kỹ năng, mức lương, cấp bậc, địa điểm; lưu tin để xem sau.' },
                { icon: MousePointerClick, title: 'Ứng tuyển một chạm', text: 'Chọn CV, thêm thư giới thiệu và gửi hồ sơ trực tiếp tới nhà tuyển dụng.' },
                { icon: BellRing, title: 'Theo dõi từng vòng', text: 'Nhận thông báo khi hồ sơ được chuyển vòng, mời phỏng vấn hoặc có kết quả.' },
              ].map((step, i) => (
                <div
                  key={step.title}
                  className="relative p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 hover:border-emerald-300 transition-colors"
                >
                  <span className="absolute top-5 right-6 text-4xl font-black text-slate-100 dark:text-slate-800 select-none">0{i + 1}</span>
                  <span className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-[0_8px_20px_-8px_rgba(16,185,129,0.6)]">
                    <step.icon className="w-5 h-5" />
                  </span>
                  <p className="relative mt-4 font-black text-slate-900 dark:text-white">{step.title}</p>
                  <p className="relative mt-1 text-sm text-slate-500 dark:text-slate-400">{step.text}</p>
                </div>
              ))}
            </div>

            <Link
              to="/tools"
              className="group relative overflow-hidden p-7 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white flex flex-col justify-between shadow-[0_15px_45px_-12px_rgba(16,185,129,0.35)]"
            >
              <div className="absolute inset-0 opacity-20 hero-grid-pattern pointer-events-none" />
              <div className="relative">
                <span className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
                  <Calculator className="w-6 h-6" />
                </span>
                <p className="mt-5 text-xs font-black uppercase tracking-wider text-emerald-100">Công cụ nghề nghiệp</p>
                <h3 className="mt-1 text-2xl font-black leading-tight">Tính lương Gross ⇄ Net</h3>
                <p className="mt-2 text-sm text-emerald-50/90">
                  Quy đổi lương theo quy định BHXH, BHYT, BHTN và thuế TNCN hiện hành — biết chính xác số tiền thực nhận trước khi deal lương.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-emerald-50">
                  {['Giảm trừ gia cảnh & người phụ thuộc', 'Mức đóng theo vùng lương tối thiểu', 'Bảng chi tiết từng khoản khấu trừ'].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <span className="relative mt-6 inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-white text-emerald-700 font-black text-sm group-hover:bg-emerald-50 transition-colors">
                Dùng thử ngay
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ EMPLOYER SECTION ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 grid lg:grid-cols-2 gap-10 p-6 sm:p-10 lg:p-12 shadow-soft-sm">
          <div className="absolute -left-24 -bottom-24 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <Eyebrow icon={Users}>Dành cho nhà tuyển dụng</Eyebrow>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Tuyển đúng người,{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">nhanh hơn</span>
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Đăng tin miễn phí, nhận hồ sơ trực tiếp và quản lý ứng viên theo từng vòng tuyển dụng ngay trên một bảng điều khiển.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Send, text: 'Đăng, tạm dừng, đóng tin tuyển dụng bất cứ lúc nào' },
                { icon: Workflow, text: 'Chuyển vòng ứng viên: Sàng lọc → Phỏng vấn → Offer → Tuyển' },
                { icon: FileText, text: 'Xem CV, thông tin liên hệ và lịch sử từng hồ sơ' },
                { icon: BellRing, text: 'Ứng viên được thông báo tự động khi bạn cập nhật trạng thái' },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4" />
                  </span>
                  <span className="pt-1.5">{f.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/employers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-[0_10px_30px_-10px_rgba(16,185,129,0.6)] transition-colors"
              >
                Đăng tin tuyển dụng
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/employers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:border-emerald-400 transition-colors"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>

          {/* Illustration of the hiring pipeline (stage names only, no fabricated numbers). */}
          <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-5 sm:p-6" aria-hidden="true">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-slate-900 dark:text-white">Quy trình tuyển dụng</p>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Bảng điều khiển nhà tuyển dụng</span>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: 'Ứng tuyển', w: 'w-full', c: 'from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500' },
                { label: 'Sàng lọc', w: 'w-4/5', c: 'from-sky-300 to-sky-500' },
                { label: 'Phỏng vấn', w: 'w-3/5', c: 'from-violet-300 to-violet-500' },
                { label: 'Offer', w: 'w-2/5', c: 'from-amber-300 to-amber-500' },
                { label: 'Đã tuyển', w: 'w-1/4', c: 'from-emerald-400 to-teal-500' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300">{s.label}</span>
                  <div className="flex-1 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className={`h-full ${s.w} rounded-xl bg-gradient-to-r ${s.c}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: Briefcase, label: 'Tin tuyển dụng' },
                { icon: Users, label: 'Ứng viên' },
                { icon: BellRing, label: 'Thông báo' },
              ].map((t) => (
                <div key={t.label} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <t.icon className="w-5 h-5 mx-auto text-emerald-500" />
                  <p className="mt-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">{t.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
