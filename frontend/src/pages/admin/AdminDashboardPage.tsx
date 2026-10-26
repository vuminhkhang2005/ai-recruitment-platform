import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck2,
  FileSearch,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import type { PlatformOverview } from '../../lib/types';
import { CompanyAvatar, ErrorBox, PageLoader, btnSecondary } from '../../components/ui/primitives';
import { usePageTitle } from '../../lib/usePageTitle';
import { AdminHeader } from './AdminHeader';
import { useLanguage } from '../../i18n/LanguageContext';

const STAGE_LABEL_VI: Record<string, string> = {
  APPLIED: 'Mới ứng tuyển',
  SCREENING: 'Sơ loại CV',
  INTERVIEW: 'Phỏng vấn',
  OFFERED: 'Gửi đề nghị (Offer)',
  HIRED: 'Đã tuyển (Hired)',
  REJECTED: 'Từ chối',
};

const CATEGORY_LABEL_VI: Record<string, string> = {
  PROGRAMMING_LANGUAGE: 'Ngôn ngữ',
  FRAMEWORK: 'Framework',
  DATABASE: 'Cơ sở dữ liệu',
  CLOUD_DEVOPS: 'Cloud & DevOps',
  TESTING: 'Kiểm thử',
  METHODOLOGY: 'Phương pháp',
  SOFT_SKILL: 'Kỹ năng mềm',
  OTHER: 'Khác',
};

const CATEGORY_LABEL_EN: Record<string, string> = {
  PROGRAMMING_LANGUAGE: 'Language',
  FRAMEWORK: 'Framework',
  DATABASE: 'Database',
  CLOUD_DEVOPS: 'Cloud & DevOps',
  TESTING: 'Testing',
  METHODOLOGY: 'Methodology',
  SOFT_SKILL: 'Soft Skill',
  OTHER: 'Other',
};

export const AdminDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  usePageTitle(isVi ? 'Quản trị Hệ thống & AI Telemetry' : 'System Administration & AI Telemetry');
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getOverview();
      setData(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  if (loading && !data) return <PageLoader />;
  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ErrorBox
          message={error ?? (isVi ? 'Không thể tải dữ liệu tổng quan hệ thống' : 'Failed to load platform overview')}
          onRetry={loadOverview}
        />
      </div>
    );
  }

  const activeUserPct = data.totalUsers > 0 ? Math.round((data.activeUsers / data.totalUsers) * 100) : 100;
  const verifiedCompPct = data.totalCompanies > 0 ? Math.round((data.verifiedCompanies / data.totalCompanies) * 100) : 100;
  const publishedJobPct = data.totalJobs > 0 ? Math.round((data.publishedJobs / data.totalJobs) * 100) : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8" data-testid="admin-dashboard-page">
      <AdminHeader
        title={isVi ? 'Bảng điều khiển Quản trị Hệ thống & AI Engine' : 'System Governance & AI Engine Dashboard'}
        subtitle={
          isVi
            ? 'Giám sát toàn diện chỉ số vận hành toàn sàn (Users, Companies, Jobs, Applications, Skills) và hiệu năng thuật toán AI Matching thời gian thực.'
            : 'Real-time operational telemetry across Users, Companies, Jobs, Applications, Skills, and the AI Matching Engine.'
        }
        rightSlot={
          <>
            <Link
              to="/admin/audit-logs"
              className={`${btnSecondary} text-xs font-bold`}
            >
              <FileSearch className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isVi ? 'Nhật ký Audit' : 'Audit Trail'}</span>
            </Link>
            <button
              type="button"
              onClick={loadOverview}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-soft-xs transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{isVi ? 'Làm mới dữ liệu' : 'Refresh Data'}</span>
            </button>
          </>
        }
      />

      {/* Quick Governance Action Queue Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/moderation"
          className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/60 shadow-soft-xs transition-all"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVi ? 'Thẩm định Pháp lý' : 'Enterprise Verification'}
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate mt-0.5">
                {data.pendingCompanies > 0
                  ? isVi
                    ? `${data.pendingCompanies} doanh nghiệp chờ duyệt`
                    : `${data.pendingCompanies} companies pending review`
                  : isVi
                  ? `${data.verifiedCompanies}/${data.totalCompanies} doanh nghiệp đã xác minh`
                  : `${data.verifiedCompanies}/${data.totalCompanies} companies verified`}
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </Link>

        <Link
          to="/admin/moderation"
          className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/60 shadow-soft-xs transition-all"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVi ? 'Kiểm duyệt Tin đăng' : 'Job Board Moderation'}
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate mt-0.5">
                {data.pendingOrDraftJobs > 0
                  ? isVi
                    ? `${data.pendingOrDraftJobs} tin chờ duyệt / bản nháp`
                    : `${data.pendingOrDraftJobs} postings pending / draft`
                  : isVi
                  ? `${data.publishedJobs} việc làm đang hiển thị`
                  : `${data.publishedJobs} active job postings live`}
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </Link>

        <Link
          to="/admin/users"
          className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/60 shadow-soft-xs transition-all"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVi ? 'Bảo mật & Phân quyền RBAC' : 'RBAC & Account Security'}
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate mt-0.5">
                {data.suspendedOrBannedUsers > 0
                  ? isVi
                    ? `${data.suspendedOrBannedUsers} tài khoản đang bị hạn chế`
                    : `${data.suspendedOrBannedUsers} restricted accounts`
                  : isVi
                  ? `${data.activeUsers} tài khoản hoạt động bình thường`
                  : `All ${data.activeUsers} accounts in good standing`}
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </Link>
      </div>

      {/* 1. Six Harmonious Executive KPI Cards (Balanced 3x2 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Users KPI */}
        <Link
          to="/admin/users"
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/60 rounded-3xl p-5 shadow-soft-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Tài khoản Người dùng' : 'Total Platform Users'}
            </span>
            <span className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white" data-testid="kpi-total-users">
              {data.totalUsers}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
              {activeUserPct}% {isVi ? 'hoạt động' : 'active'}
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeUserPct}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              <strong className="text-slate-800 dark:text-slate-200">{data.totalCandidates}</strong> {isVi ? 'Ứng viên' : 'Candidates'}
            </span>
            <span>
              <strong className="text-slate-800 dark:text-slate-200">{data.totalRecruiters}</strong> {isVi ? 'Nhà tuyển dụng' : 'Recruiters'}
            </span>
          </div>
        </Link>

        {/* Companies KPI */}
        <Link
          to="/admin/moderation"
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/60 rounded-3xl p-5 shadow-soft-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Doanh nghiệp Đối tác' : 'Partner Enterprises'}
            </span>
            <span className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white" data-testid="kpi-total-companies">
              {data.totalCompanies}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300">
              {data.verifiedCompanies} {isVi ? 'đã xác minh' : 'verified'}
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${verifiedCompPct}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {verifiedCompPct}% {isVi ? 'đạt chuẩn pháp lý' : 'verified rate'}
            </span>
            <span className={data.pendingCompanies > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
              {data.pendingCompanies} {isVi ? 'chờ thẩm định' : 'pending'}
            </span>
          </div>
        </Link>

        {/* Jobs KPI */}
        <Link
          to="/admin/moderation"
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/60 rounded-3xl p-5 shadow-soft-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Tin Tuyển dụng' : 'Job Postings'}
            </span>
            <span className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white" data-testid="kpi-total-jobs">
              {data.totalJobs}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300">
              {data.publishedJobs} {isVi ? 'đang mở' : 'live'}
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${publishedJobPct}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              <strong className="text-slate-800 dark:text-slate-200">{data.publishedJobs}</strong> {isVi ? 'đang hiển thị' : 'published'}
            </span>
            <span>
              <strong className="text-slate-800 dark:text-slate-200">{data.pendingOrDraftJobs}</strong> {isVi ? 'chờ duyệt / nháp' : 'draft / pending'}
            </span>
          </div>
        </Link>

        {/* Applications KPI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-soft-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Hồ sơ Ứng tuyển & Phỏng vấn' : 'Applications & Interviews'}
            </span>
            <span className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white" data-testid="kpi-total-applications">
              {data.totalApplications}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300">
              Hire Rate: {data.overallHireRate}%
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(15, data.overallHireRate * 3))}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              <strong className="text-slate-800 dark:text-slate-200">{data.totalInterviews}</strong> {isVi ? 'lịch phỏng vấn' : 'interviews scheduled'}
            </span>
            <span>6 {isVi ? 'giai đoạn ATS' : 'ATS stages'}</span>
          </div>
        </div>

        {/* Skills KPI */}
        <Link
          to="/admin/skills"
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/60 rounded-3xl p-5 shadow-soft-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Từ điển Kỹ năng Chuẩn AI' : 'Master Skill Taxonomy'}
            </span>
            <span className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white" data-testid="kpi-total-skills">
              {data.totalSkills}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
              8 {isVi ? 'nhóm công nghệ' : 'tech domains'}
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full w-full" />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Đồng bộ với AI Resume Parser' : 'Synced with AI Resume Parser'}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
              {isVi ? 'Quản lý →' : 'Manage →'}
            </span>
          </div>
        </Link>

        {/* Avg AI Match Score KPI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-soft-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Điểm Khớp AI Trung bình' : 'Avg Platform AI Match'}
            </span>
            <span className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400" data-testid="kpi-avg-match-score">
              {data.averagePlatformMatchScore}%
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
              {data.aiMetrics.highMatchCount} {isVi ? 'hồ sơ ≥75%' : 'profiles ≥75%'}
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              style={{ width: `${Math.min(100, data.averagePlatformMatchScore)}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{data.aiMetrics.totalScoredApplications} {isVi ? 'lượt chấm ATS' : 'ATS evaluations'}</span>
            <span>{data.aiMetrics.averageLatencyMs} ms latency</span>
          </div>
        </div>
      </div>

      {/* 2. AI Engine Health & Telemetry Panel (UC-ADM-06) */}
      <div
        className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-soft-xs relative overflow-hidden"
        data-testid="ai-telemetry-panel"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {isVi ? 'Giám sát Trạng thái AI Matching & ATS Intelligence' : 'AI Matching Engine & ATS Telemetry'}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                  OPERATIONAL ({data.aiMetrics.uptimePercentage}%)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isVi ? 'Mô hình đang kích hoạt: ' : 'Active Architecture: '}
                <span className="font-bold text-slate-800 dark:text-slate-200">{data.aiMetrics.activeModelName}</span>
                {' · '}
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  PyTorch Cross-Attention Transformer + Skill Ontology
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/skills"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 transition"
            >
              <span>{isVi ? 'Cấu hình Từ điển Kỹ năng AI' : 'Configure AI Skill Taxonomy'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 p-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isVi ? 'Độ trễ suy luận trung bình' : 'Average Inference Latency'}
            </span>
            <div className="mt-1.5 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {data.aiMetrics.averageLatencyMs} ms
            </div>
            <span className="text-[11px] text-slate-400">Real-time CV-to-JD Scoring</span>
          </div>

          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 p-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isVi ? 'Tổng lượt chấm điểm ATS' : 'Total ATS Evaluations'}
            </span>
            <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
              {data.aiMetrics.totalScoredApplications}
            </div>
            <span className="text-[11px] text-slate-400">
              {isVi ? 'Đơn ứng tuyển đã phân tích' : 'Scored candidate applications'}
            </span>
          </div>

          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 p-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isVi ? 'Ứng viên Độ khớp Cao (≥75%)' : 'High-Match Candidates (≥75%)'}
            </span>
            <div className="mt-1.5 text-2xl font-black text-teal-600 dark:text-teal-400">
              {data.aiMetrics.highMatchCount}
            </div>
            <span className="text-[11px] text-slate-400">
              {isVi ? 'Khớp kỹ năng cốt lõi & thâm niên' : 'Strong core skill & seniority fit'}
            </span>
          </div>

          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 p-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isVi ? 'Kho Ứng viên Mở (Talent Pool)' : 'Open Talent Pool'}
            </span>
            <div className="mt-1.5 text-2xl font-black text-amber-600 dark:text-amber-400">
              {data.aiMetrics.openToWorkCandidates}
            </div>
            <span className="text-[11px] text-slate-400">
              {isVi ? 'Sẵn sàng nhận lời mời săn đầu người' : 'Ready for direct recruiter invites'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Platform Recruitment Funnel & Top Partner Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Funnel */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isVi ? 'Phễu Chuyển đổi Ứng tuyển Toàn sàn' : 'Platform Recruitment Funnel'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isVi
                    ? `Phân bổ ${data.totalApplications} hồ sơ ứng tuyển theo 6 giai đoạn ATS`
                    : `Distribution of ${data.totalApplications} applications across 6 ATS stages`}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                Hire Rate: {data.overallHireRate}%
              </span>
            </div>

            <div className="space-y-4">
              {data.applicationsByStage.map((st) => {
                const barColor =
                  st.stage === 'HIRED'
                    ? 'bg-emerald-500'
                    : st.stage === 'OFFERED'
                    ? 'bg-teal-500'
                    : st.stage === 'INTERVIEW'
                    ? 'bg-cyan-500'
                    : st.stage === 'SCREENING'
                    ? 'bg-sky-500'
                    : st.stage === 'REJECTED'
                    ? 'bg-rose-400'
                    : 'bg-emerald-600';
                const stageDisplay = isVi ? STAGE_LABEL_VI[st.stage] ?? st.label : st.label;
                return (
                  <div key={st.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <span>{stageDisplay}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {st.stage}
                        </span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {st.count} {isVi ? 'hồ sơ' : 'apps'}{' '}
                        <span className="text-xs font-normal text-slate-400">({st.percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${Math.max(st.percentage, st.count > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {isVi ? 'Tổng lịch phỏng vấn đã tạo:' : 'Total interviews scheduled:'}{' '}
              <strong className="text-slate-900 dark:text-white">{data.totalInterviews}</strong>
            </span>
            <span>
              {isVi ? 'Điểm khớp ATS trung bình:' : 'Average ATS Match:'}{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">{data.averagePlatformMatchScore}%</strong>
            </span>
          </div>
        </div>

        {/* Top Companies Leaderboard */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isVi ? 'Top Doanh nghiệp Tuyển dụng Sôi động' : 'Top Hiring Partner Enterprises'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isVi
                    ? 'Xếp hạng theo số lượng tin đăng và lưu lượng ứng viên nộp đơn'
                    : 'Ranked by active job postings and candidate application volume'}
                </p>
              </div>
              <Link
                to="/admin/moderation"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{isVi ? 'Kiểm duyệt' : 'Moderate'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.topCompanies.map((comp, idx) => (
                <div key={comp.companyId} className="py-3 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-black text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <CompanyAvatar name={comp.companyName} logoUrl={comp.logoUrl} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/companies/${comp.companyId}`}
                          className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 truncate transition-colors"
                        >
                          {comp.companyName}
                        </Link>
                        {comp.verificationStatus === 'VERIFIED' ? (
                          <span title="Verified">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          </span>
                        ) : comp.verificationStatus === 'PENDING' ? (
                          <span title="Pending">
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          </span>
                        ) : (
                          <span title="Rejected">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {comp.industry || 'Software & IT Services'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-right">
                    <div className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700">
                      <span className="text-xs font-black text-slate-900 dark:text-white">{comp.jobCount}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1">Jobs</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60">
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                        {comp.applicationCount}
                      </span>
                      <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 ml-1">
                        {isVi ? 'Đơn' : 'Apps'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {isVi ? 'Đã xác minh pháp lý:' : 'Verified partner enterprises:'}{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {data.verifiedCompanies}/{data.totalCompanies}
              </strong>
            </span>
            <Link to="/companies" className="font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600">
              {isVi ? 'Xem danh bạ công ty →' : 'View public directory →'}
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Top In-Demand Skills Supply vs Demand Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{isVi ? 'Ma trận Cung - Cầu Kỹ năng Công nghệ Toàn sàn' : 'Platform Tech Skill Supply vs. Demand Matrix'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isVi
                ? 'So sánh nhu cầu tuyển dụng (Job Skills) và nguồn cung ứng viên (Candidate Skills)'
                : 'Comparing employer job demand (Job Skills) against candidate talent supply (Candidate Skills)'}
            </p>
          </div>
          <Link
            to="/admin/skills"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <span>{isVi ? `Quản lý toàn bộ ${data.totalSkills} kỹ năng` : `Manage all ${data.totalSkills} skills`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.topSkills.map((sk) => {
            const totalVolume = Math.max(1, sk.jobCount + sk.candidateCount);
            const demandPct = Math.round((sk.jobCount / totalVolume) * 100);
            const categoryText = isVi
              ? CATEGORY_LABEL_VI[sk.category] ?? sk.category
              : CATEGORY_LABEL_EN[sk.category] ?? sk.category;
            return (
              <div
                key={sk.skillId}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-400/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {sk.skillName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 shrink-0">
                    {categoryText}
                  </span>
                </div>

                {/* Supply vs Demand visual ratio bar */}
                <div className="mt-3 w-full h-1.5 rounded-full bg-sky-200 dark:bg-sky-900/60 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${demandPct}%` }}
                    title={`Demand: ${sk.jobCount} Jobs`}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isVi ? 'Cầu:' : 'Demand:'}{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">{sk.jobCount} Jobs</strong>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {isVi ? 'Cung:' : 'Supply:'}{' '}
                    <strong className="text-sky-600 dark:text-sky-400">
                      {sk.candidateCount} {isVi ? 'Hồ sơ' : 'Profiles'}
                    </strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
