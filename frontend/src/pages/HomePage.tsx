import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BellRing,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
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
import { useLanguage } from '../i18n/LanguageContext';

const POPULAR_KEYWORDS_VI = ['Kinh doanh', 'Marketing', 'Java', 'ReactJS', '.NET', 'Kế toán', 'Data', 'Nhân sự'];
const POPULAR_KEYWORDS_EN = ['Business', 'Marketing', 'Java', 'ReactJS', '.NET', 'Accounting', 'Data', 'Human Resources'];

/** Categories shown in the "Top ngành nghề" grid. */
const getSpecialties = (lang: string) => [
  { keyword: 'Developer', label: lang === 'vi' ? 'Công nghệ thông tin' : 'Information Technology', icon: Layout, tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
  { keyword: 'Kinh doanh', label: lang === 'vi' ? 'Kinh doanh & Bán hàng' : 'Sales & Business', icon: TrendingUp, tint: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400' },
  { keyword: 'Marketing', label: lang === 'vi' ? 'Marketing & Truyền thông' : 'Marketing & Media', icon: Send, tint: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' },
  { keyword: 'Tài chính', label: lang === 'vi' ? 'Tài chính - Ngân hàng' : 'Finance & Banking', icon: Building2, tint: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400' },
  { keyword: 'Thiết kế', label: lang === 'vi' ? 'Thiết kế & Sáng tạo' : 'Design & Creative', icon: Sparkles, tint: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' },
  { keyword: 'Nhân sự', label: lang === 'vi' ? 'Nhân sự & Hành chính' : 'HR & Administration', icon: Users, tint: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400' },
];

type TabKey = 'all' | 'salary' | 'urgent' | 'remote';
const getTabs = (lang: string): { key: TabKey; label: string; to: string }[] => [
  { key: 'all', label: lang === 'vi' ? 'Tất cả việc làm' : 'All Jobs', to: '/jobs' },
  { key: 'salary', label: lang === 'vi' ? 'Lương cao (≥ 30 triệu)' : 'High Salary (≥ 30M)', to: '/jobs?sort=salary' },
  { key: 'urgent', label: lang === 'vi' ? 'Tuyển gấp' : 'Urgent Hiring', to: '/jobs' },
  { key: 'remote', label: lang === 'vi' ? 'Remote / Hybrid' : 'Remote / Hybrid', to: '/jobs?type=REMOTE' },
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

const getPipelineStages = (lang: string) => [
  {
    step: 1,
    name: lang === 'vi' ? 'Ứng tuyển' : 'Applied',
    short: lang === 'vi' ? 'Ứng tuyển' : 'Applied',
    icon: Send,
    badge: lang === 'vi' ? 'Tiếp nhận hồ sơ' : 'Profile Intake',
    sla: lang === 'vi' ? '< 15 phút' : '< 15 mins',
    title: lang === 'vi' ? 'Tiếp nhận hồ sơ & Đồng bộ dữ liệu ứng viên' : 'Candidate Intake & Profile Synchronization',
    desc: lang === 'vi'
      ? 'Tự động tiếp nhận CV từ mọi kênh tuyển dụng, trích xuất thông tin liên hệ và gửi email xác nhận tức thì cho ứng viên.'
      : 'Automatically capture CVs from all recruitment channels, extract contact details, and send instant confirmation emails.',
    highlight: lang === 'vi' ? 'Tự động gửi email xác nhận ứng tuyển' : 'Instant automated confirmation email',
  },
  {
    step: 2,
    name: lang === 'vi' ? 'Sàng lọc' : 'Screening',
    short: lang === 'vi' ? 'Sàng lọc' : 'Screening',
    icon: Search,
    badge: lang === 'vi' ? 'Đánh giá năng lực' : 'Skill Assessment',
    sla: lang === 'vi' ? '< 24 giờ' : '< 24 hours',
    title: lang === 'vi' ? 'Sàng lọc hồ sơ & So khớp kỹ năng công việc' : 'Resume Screening & Skill Matching',
    desc: lang === 'vi'
      ? 'Hệ thống tự động phân tích độ tương thích giữa kinh nghiệm thực tế, kỹ năng chuyên môn của ứng viên với mô tả công việc (JD).'
      : 'Intelligent parsing matches candidate experience and technical skills directly against the job requirements.',
    highlight: lang === 'vi' ? 'Chấm điểm độ khớp kỹ năng chính xác' : 'Accurate skill matching score',
  },
  {
    step: 3,
    name: lang === 'vi' ? 'Phỏng vấn' : 'Interview',
    short: lang === 'vi' ? 'Phỏng vấn' : 'Interview',
    icon: Calendar,
    badge: lang === 'vi' ? 'Lên lịch & Đánh giá' : 'Schedule & Evaluate',
    sla: lang === 'vi' ? '2 - 3 ngày' : '2 - 3 days',
    title: lang === 'vi' ? 'Xếp lịch phỏng vấn & Đánh giá năng lực chuyên sâu' : 'Interview Scheduling & Deep Evaluation',
    desc: lang === 'vi'
      ? 'Gửi thư mời phỏng vấn tự động kèm link họp video, đồng bộ lịch Google/Outlook và cung cấp biểu mẫu chấm điểm năng lực tiêu chuẩn.'
      : 'Send interview invites with video call links, sync Google/Outlook calendars, and utilize standardized scoring scorecards.',
    highlight: lang === 'vi' ? 'Tự động đồng bộ lịch & gửi thông báo nhắc hẹn' : 'Automated calendar sync & reminders',
  },
  {
    step: 4,
    name: lang === 'vi' ? 'Offer' : 'Offer',
    short: lang === 'vi' ? 'Gửi Offer' : 'Send Offer',
    icon: Award,
    badge: lang === 'vi' ? 'Thỏa thuận đãi ngộ' : 'Offer Terms',
    sla: lang === 'vi' ? '1 - 2 ngày' : '1 - 2 days',
    title: lang === 'vi' ? 'Đề xuất đãi ngộ & Phát hành thư mời nhận việc' : 'Compensation Proposal & Offer Letter Issuance',
    desc: lang === 'vi'
      ? 'Phát hành Offer Letter kỹ thuật số chuyên nghiệp, cấu hình chi tiết mức lương, phụ cấp, phúc lợi và hạn phản hồi trực tuyến.'
      : 'Issue professional digital offer letters, configure salary, benefits, allowances, and set response deadlines.',
    highlight: lang === 'vi' ? 'Hỗ trợ ký số & xác nhận nhận việc online' : 'Digital signing & online acceptance',
  },
  {
    step: 5,
    name: lang === 'vi' ? 'Đã tuyển' : 'Hired',
    short: lang === 'vi' ? 'Đã tuyển' : 'Hired',
    icon: CheckCircle2,
    badge: lang === 'vi' ? 'Tuyển thành công' : 'Placement Success',
    sla: lang === 'vi' ? 'Hoàn tất' : 'Completed',
    title: lang === 'vi' ? 'Tuyển dụng thành công & Kích hoạt Onboarding' : 'Successful Placement & Onboarding Activation',
    desc: lang === 'vi'
      ? 'Chào đón nhân sự mới chính thức gia nhập tổ chức, kích hoạt lộ trình hội nhập tự động và đồng bộ hồ sơ nhân sự nhanh chóng.'
      : 'Welcome new employees to the organization, trigger automated onboarding workflows, and sync HR profiles.',
    highlight: lang === 'vi' ? 'Kích hoạt lộ trình Onboarding tự động' : 'Automated onboarding workflow activation',
  },
];

const RecruitmentProgressTracker: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const pipelineStages = getPipelineStages(language);
  const [activeStageIndex, setActiveStageIndex] = useState(1);
  const activeStage = pipelineStages[activeStageIndex];

  return (
    <div
      className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/60 dark:from-slate-900/90 dark:via-slate-950/80 dark:to-slate-950 p-5 sm:p-7 shadow-sm"
      data-testid="recruitment-progress-tracker"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            {isVi ? 'Quy trình tuyển dụng' : 'Recruitment Workflow'}
          </p>
        </div>
        <span className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {isVi ? 'Bảng điều khiển nhà tuyển dụng' : 'Employer Recruitment Suite'}
        </span>
      </div>

      {/* Progress Stepper Line */}
      <div className="mt-7">
        <div className="relative">
          {/* Connecting track base line */}
          <div className="absolute top-5 left-5 right-5 h-1.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(activeStageIndex / (pipelineStages.length - 1)) * 100}%` }}
            />
          </div>

          {/* 5 Milestone Buttons */}
          <div className="relative flex justify-between items-start">
            {pipelineStages.map((s, idx) => {
              const isCompleted = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex;
              const Icon = s.icon;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActiveStageIndex(idx)}
                  className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
                  aria-label={isVi ? `Bước ${s.step}: ${s.name}` : `Step ${s.step}: ${s.name}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 relative z-10 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 group-hover:bg-emerald-600'
                        : isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/40 shadow-lg shadow-emerald-500/30 scale-110'
                          : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:border-emerald-400 group-hover:text-emerald-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-[11px] sm:text-xs font-bold transition-colors ${
                        isCurrent
                          ? 'text-emerald-600 dark:text-emerald-400 font-black'
                          : isCompleted
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {s.step}. {s.short}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage Detail Card */}
        <div className="mt-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm transition-all duration-300">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                0{activeStage.step}
              </span>
              <div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                  {isVi ? `Giai đoạn ${activeStage.step} / 5` : `Stage ${activeStage.step} of 5`}
                </p>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {activeStage.name}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Clock className="w-3 h-3 text-emerald-500" />
                SLA: <strong className="text-emerald-600 dark:text-emerald-400">{activeStage.sla}</strong>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                {activeStage.badge}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {activeStage.title}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {activeStage.desc}
            </p>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {activeStage.highlight}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveStageIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeStageIndex === 0}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label={isVi ? "Giai đoạn trước" : "Previous stage"}
              >
                {isVi ? '← Trước' : '← Previous'}
              </button>
              <button
                type="button"
                onClick={() => setActiveStageIndex((prev) => Math.min(pipelineStages.length - 1, prev + 1))}
                disabled={activeStageIndex === pipelineStages.length - 1}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label={isVi ? "Giai đoạn kế tiếp" : "Next stage"}
              >
                {isVi ? 'Sau →' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { icon: Briefcase, label: isVi ? 'Tin tuyển dụng' : 'Job Openings', sub: isVi ? 'Quản lý tin' : 'Manage postings', to: '/employers' },
          { icon: Users, label: isVi ? 'Ứng viên' : 'Candidates', sub: isVi ? 'Theo dõi pipeline' : 'Pipeline tracking', to: '/employers' },
          { icon: BellRing, label: isVi ? 'Thông báo' : 'Notifications', sub: isVi ? 'Nhắc lịch & SLA' : 'Reminders & SLAs', to: '/employers' },
        ].map((t) => (
          <Link
            key={t.label}
            to={t.to}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-center hover:border-emerald-500/60 hover:shadow-sm hover:-translate-y-0.5 transition-all group block"
          >
            <t.icon className="w-5 h-5 mx-auto text-emerald-500 group-hover:scale-110 transition-transform" />
            <p className="mt-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {t.label}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">
              {t.sub}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const HomePage: React.FC = () => {
  usePageTitle();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const specialties = useMemo(() => getSpecialties(language), [language]);
  const tabs = useMemo(() => getTabs(language), [language]);
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
      specialties.map((s) =>
        jobApi
          .search({ keyword: s.keyword, page: 0, size: 1 })
          .then((p) => [s.keyword, p.totalElements] as const)
          .catch(() => [s.keyword, -1] as const),
      ),
    ).then((entries) => setSpecialtyCounts(Object.fromEntries(entries)));
  };

  useEffect(load, [specialties]);

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
    { icon: Briefcase, value: total, label: isVi ? 'Việc làm đang tuyển' : 'Active Jobs', sub: isVi ? 'Cập nhật theo thời gian thực' : 'Real-time updates' },
    { icon: Building2, value: hiring?.length ?? null, label: isVi ? 'Công ty đang tuyển' : 'Hiring Companies', sub: isVi ? 'Hồ sơ doanh nghiệp xác thực' : 'Verified enterprise profiles' },
    { icon: MapPin, value: cities, label: isVi ? 'Thành phố' : 'Cities Covered', sub: isVi ? 'Trên khắp Việt Nam' : 'Across Vietnam' },
    { icon: ShieldCheck, value: '100%', label: isVi ? 'Miễn phí cho ứng viên' : 'Free for Candidates', sub: isVi ? 'Ứng tuyển không giới hạn' : 'Unlimited applications' },
  ];

  const activeTab = tabs.find((t) => t.key === tab) || tabs[0];
  const popularKeywords = isVi ? POPULAR_KEYWORDS_VI : POPULAR_KEYWORDS_EN;

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
                    {total !== null
                      ? (isVi ? `${total} việc làm đang tuyển` : `${total} open jobs hiring`)
                      : (isVi ? 'Việc làm đang tuyển' : 'Open jobs hiring')}
                  </span>
                </span>
                <span className="hidden sm:inline text-slate-500 dark:text-slate-400 font-medium">
                  {isVi ? 'Ứng tuyển nhanh — theo dõi từng vòng' : 'Fast applications — real-time tracking'}
                </span>
              </span>

              <h1 className="mt-5 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                {isVi ? 'Tìm kiếm ' : 'Find Your '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  {isVi ? 'công việc mơ ước' : 'Dream Career'}
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
                {isVi
                  ? 'Kết nối ứng viên tài năng với nhà tuyển dụng hàng đầu — tìm việc theo ngành nghề, kỹ năng, địa điểm và công ty bạn quan tâm.'
                  : 'Connecting top talent with leading employers — discover jobs by industry, skill, location, and company.'}
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
                      {isVi ? `${hiring.length} doanh nghiệp đang tuyển dụng` : `${hiring.length} companies hiring now`}
                    </p>
                    {totalApplications !== null && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isVi ? `${totalApplications} lượt ứng tuyển qua TalentBridge` : `${totalApplications} applications via TalentBridge`}
                      </p>
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
                  {isVi ? 'Gợi ý xu hướng:' : 'Trending searches:'}
                </span>
                {popularKeywords.map((k) => (
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
                {isVi ? 'Các doanh nghiệp đang tuyển dụng trên TalentBridge' : 'Leading employers hiring on TalentBridge'}
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
            eyebrow={<Eyebrow icon={Flame}>{isVi ? 'Ngành nghề nổi bật' : 'Featured Fields'}</Eyebrow>}
            title={isVi ? 'Top ngành nghề nổi bật' : 'Top Career Categories'}
            subtitle={isVi ? 'Khám phá các cơ hội nghề nghiệp đang có nhu cầu tuyển dụng lớn nhất trên TalentBridge.' : 'Explore career opportunities with the highest hiring demand on TalentBridge.'}
            action={<SeeAll to="/jobs">{isVi ? 'Xem tất cả việc làm' : 'View all jobs'}</SeeAll>}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((s) => {
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
                    {count === undefined ? '…' : count > 0 ? (isVi ? `${count} việc làm` : `${count} jobs`) : (isVi ? 'Xem việc làm' : 'Explore jobs')}
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
            eyebrow={<Eyebrow icon={Flame}>{isVi ? 'Cơ hội tuyển dụng hàng đầu' : 'Top Opportunities'}</Eyebrow>}
            title={isVi ? 'Việc làm nổi bật' : 'Featured Jobs'}
            subtitle={isVi ? 'Tin tuyển dụng mới nhất từ các doanh nghiệp hàng đầu — lọc nhanh theo mức lương, độ gấp và hình thức làm việc.' : 'Latest job openings from top employers — filter by salary, urgency, and work arrangement.'}
            action={
              <div className="flex flex-wrap gap-2" role="tablist" aria-label={isVi ? "Lọc việc làm nổi bật" : "Filter featured jobs"}>
                {tabs.map((t) => (
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
            <EmptyState
              title={isVi ? "Chưa có việc làm phù hợp" : "No matching jobs"}
              description={isVi ? "Hiện chưa có tin tuyển dụng nào thuộc nhóm này. Hãy thử bộ lọc khác." : "No job openings found in this category. Try another filter."}
            />
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
              {tab === 'all'
                ? (isVi ? `Xem tất cả ${total ?? ''} việc làm` : `View all ${total ?? ''} jobs`)
                : (isVi ? 'Xem thêm việc làm' : 'View more jobs')}
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
              eyebrow={<Eyebrow icon={Building2} tone="sky">{isVi ? 'Doanh nghiệp công nghệ hàng đầu' : 'Featured Employers'}</Eyebrow>}
              title={isVi ? 'Top công ty đang tuyển' : 'Top Hiring Companies'}
              subtitle={isVi ? 'Tìm hiểu môi trường làm việc, quy mô và các vị trí đang mở của từng doanh nghiệp.' : 'Discover company work cultures, team sizes, and active job openings.'}
              action={<SeeAll to="/companies">{isVi ? `Xem tất cả ${allCompanies?.length ?? ''} công ty` : `View all ${allCompanies?.length ?? ''} companies`}</SeeAll>}
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
                          alt={`${c.name} banner`}
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
                      {c.description || (isVi ? 'Doanh nghiệp đang tuyển dụng trên TalentBridge.' : 'Leading employer hiring on TalentBridge.')}
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
                          {c.companySize} {isVi ? 'nhân viên' : 'employees'}
                        </span>
                      )}
                    </div>
                    <span className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-300 group-hover:text-emerald-700 dark:group-hover:bg-emerald-950/60 dark:group-hover:text-emerald-300 transition-colors">
                      <Briefcase className="w-4 h-4" />
                      {c.openJobsCount} {isVi ? 'việc làm đang mở' : 'open positions'}
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
                  {isVi ? 'Hồ sơ & CV' : 'Resume & Profile'}
                </span>
                <h2 className="mt-4 text-2xl sm:text-3xl font-black text-white leading-tight">
                  {isVi ? 'Tải CV một lần — ứng tuyển mọi việc làm chỉ với một cú nhấp' : 'Upload CV once — apply to any job with a single click'}
                </h2>
                <p className="mt-3 text-slate-300 text-sm sm:text-base">
                  {isVi
                    ? 'Lưu nhiều phiên bản CV, chọn CV mặc định và theo dõi trạng thái từng hồ sơ: sàng lọc, phỏng vấn, offer — giống cách các nền tảng tuyển dụng lớn vận hành.'
                    : 'Manage multiple CV versions, select your default resume, and track application stages: screening, interview, offer in real time.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    {isVi ? 'PDF, DOC, DOCX · tối đa 5MB' : 'PDF, DOC, DOCX · up to 5MB'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {isVi ? 'CV chỉ được gửi khi bạn ứng tuyển' : 'CV is only shared when you apply'}
                  </span>
                </div>
              </div>
              <div className="relative flex flex-wrap gap-3 shrink-0">
                <Link
                  to={user ? '/profile' : '/register'}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)] transition-colors"
                >
                  <UploadCloud className="w-5 h-5" />
                  {user ? (isVi ? 'Tải CV lên ngay' : 'Upload CV Now') : (isVi ? 'Tạo hồ sơ miễn phí' : 'Create Free Profile')}
                </Link>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-600 bg-slate-800/60 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
                >
                  {isVi ? 'Khám phá việc làm' : 'Explore Jobs'}
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
            eyebrow={<Eyebrow icon={Workflow}>{isVi ? 'Dành cho ứng viên' : 'For Candidates'}</Eyebrow>}
            title={isVi ? 'Tìm việc trên TalentBridge như thế nào?' : 'How job searching works on TalentBridge'}
            subtitle={isVi ? 'Bốn bước đơn giản từ lúc tạo hồ sơ đến khi nhận offer.' : 'Four simple steps from creating your profile to receiving an offer.'}
          />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
              {[
                { icon: UserPlus, title: isVi ? 'Tạo hồ sơ & tải CV' : 'Create profile & upload CV', text: isVi ? 'Điền thông tin, kỹ năng và tải lên các phiên bản CV của bạn.' : 'Fill in background, skills, and upload your resume versions.' },
                { icon: Search, title: isVi ? 'Tìm & lưu việc phù hợp' : 'Find & save matched jobs', text: isVi ? 'Lọc theo kỹ năng, mức lương, cấp bậc, địa điểm; lưu tin để xem sau.' : 'Filter by skills, salary, experience level, location; bookmark for later.' },
                { icon: MousePointerClick, title: isVi ? 'Ứng tuyển một chạm' : 'One-click application', text: isVi ? 'Chọn CV, thêm thư giới thiệu và gửi hồ sơ trực tiếp tới nhà tuyển dụng.' : 'Pick CV, add a cover letter, and submit directly to employers.' },
                { icon: BellRing, title: isVi ? 'Theo dõi từng vòng' : 'Track every round', text: isVi ? 'Nhận thông báo khi hồ sơ được chuyển vòng, mời phỏng vấn hoặc có kết quả.' : 'Receive updates when your application moves to screening, interview, or offer.' },
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
                <p className="mt-5 text-xs font-black uppercase tracking-wider text-emerald-100">{isVi ? 'Công cụ nghề nghiệp' : 'Career Tools'}</p>
                <h3 className="mt-1 text-2xl font-black leading-tight">{isVi ? 'Tính lương Gross ⇄ Net' : 'Gross ⇄ Net Salary Calculator'}</h3>
                <p className="mt-2 text-sm text-emerald-50/90">
                  {isVi
                    ? 'Quy đổi lương theo quy định BHXH, BHYT, BHTN và thuế TNCN hiện hành — biết chính xác số tiền thực nhận trước khi deal lương.'
                    : 'Calculate net take-home pay based on current social insurance, health insurance, and personal income tax rules in Vietnam.'}
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-emerald-50">
                  {[
                    isVi ? 'Giảm trừ gia cảnh & người phụ thuộc' : 'Personal & dependent tax relief',
                    isVi ? 'Mức đóng theo vùng lương tối thiểu' : 'Regional minimum wage compliance',
                    isVi ? 'Bảng chi tiết từng khoản khấu trừ' : 'Itemized deductions breakdown',
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <span className="relative mt-6 inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-white text-emerald-700 font-black text-sm group-hover:bg-emerald-50 transition-colors">
                {isVi ? 'Dùng thử ngay' : 'Try Calculator'}
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
            <Eyebrow icon={Users}>{isVi ? 'Dành cho nhà tuyển dụng' : 'For Employers'}</Eyebrow>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {isVi ? 'Tuyển đúng người, ' : 'Hire the right talent, '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                {isVi ? 'nhanh hơn' : 'faster'}
              </span>
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              {isVi
                ? 'Đăng tin miễn phí, nhận hồ sơ trực tiếp và quản lý ứng viên theo từng vòng tuyển dụng ngay trên một bảng điều khiển.'
                : 'Post jobs for free, receive direct applications, and manage candidates across recruitment stages in one unified dashboard.'}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Send, text: isVi ? 'Đăng, tạm dừng, đóng tin tuyển dụng bất cứ lúc nào' : 'Publish, pause, or close job postings at any time' },
                { icon: Workflow, text: isVi ? 'Chuyển vòng ứng viên: Sàng lọc → Phỏng vấn → Offer → Tuyển' : 'Progress candidates: Screening → Interview → Offer → Hired' },
                { icon: FileText, text: isVi ? 'Xem CV, thông tin liên hệ và lịch sử từng hồ sơ' : 'Review CVs, contact details, and applicant histories' },
                { icon: BellRing, text: isVi ? 'Ứng viên được thông báo tự động khi bạn cập nhật trạng thái' : 'Candidates receive automated notifications when status updates' },
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
                {isVi ? 'Đăng tin tuyển dụng' : 'Post a Job Opening'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/employers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:border-emerald-400 transition-colors"
              >
                {isVi ? 'Tìm hiểu thêm' : 'Learn More'}
              </Link>
            </div>
          </div>

          {/* Interactive Recruitment Progress Tracker */}
          <RecruitmentProgressTracker />
        </div>
      </section>
    </>
  );
};
