import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import type { PlatformOverview } from '../../lib/types';
import { ErrorBox, PageLoader } from '../../components/ui/primitives';
import { usePageTitle } from '../../lib/usePageTitle';
import { AdminHeader } from './AdminHeader';
import { useLanguage } from '../../i18n/LanguageContext';

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

  if (loading) return <PageLoader />;
  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ErrorBox message={error ?? (isVi ? 'Không thể tải dữ liệu tổng quan hệ thống' : 'Failed to load platform overview')} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" data-testid="admin-dashboard-page">
      <AdminHeader
        title={isVi ? 'Bảng điều khiển Quản trị Hệ thống & AI Engine' : 'System Governance & AI Engine Dashboard'}
        subtitle={
          isVi
            ? 'Giám sát toàn diện chỉ số vận hành toàn sàn (Users, Companies, Jobs, Applications, Skills) và hiệu năng thuật toán AI Matching thời gian thực.'
            : 'Real-time operational telemetry across Users, Companies, Jobs, Applications, Skills, and the AI Matching Engine.'
        }
        rightSlot={
          <button
            type="button"
            onClick={loadOverview}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-bold border border-white/20 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isVi ? 'Làm mới dữ liệu' : 'Refresh Data'}</span>
          </button>
        }
      />

      {/* 1. Six Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-soft-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Người dùng' : 'Users'}
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white" data-testid="kpi-total-users">
            {data.totalUsers}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {data.activeUsers} {isVi ? 'hoạt động' : 'active'}
            </span>
            {' · '}
            {data.totalCandidates} {isVi ? 'UV' : 'Cand.'} / {data.totalRecruiters} {isVi ? 'NTD' : 'Rec.'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-soft-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Doanh nghiệp' : 'Companies'}
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white" data-testid="kpi-total-companies">
            {data.totalCompanies}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {data.verifiedCompanies} {isVi ? 'đã xác minh' : 'verified'}
            </span>
            {' · '}
            <span className="text-amber-600 dark:text-amber-400">
              {data.pendingCompanies} {isVi ? 'chờ duyệt' : 'pending'}
            </span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-soft-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Tin tuyển dụng' : 'Job Postings'}
            </span>
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white" data-testid="kpi-total-jobs">
            {data.totalJobs}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-teal-600 dark:text-teal-400">
              {data.publishedJobs} {isVi ? 'đang mở' : 'open'}
            </span>
            {' · '}
            {data.pendingOrDraftJobs} {isVi ? 'chờ/nháp' : 'draft'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-soft-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Đơn ứng tuyển' : 'Applications'}
            </span>
            <span className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white" data-testid="kpi-total-applications">
            {data.totalApplications}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-cyan-600 dark:text-cyan-400">
              {data.totalInterviews} {isVi ? 'lịch phỏng vấn' : 'interviews'}
            </span>
            {' · '}
            Hire: {data.overallHireRate}%
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-soft-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Từ điển Kỹ năng' : 'Skill Taxonomy'}
            </span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white" data-testid="kpi-total-skills">
            {data.totalSkills}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isVi ? 'Chuẩn hóa 8 nhóm công nghệ' : 'Standardized across 8 domains'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-soft-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Điểm khớp AI TB' : 'Avg AI Match'}
            </span>
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-600 dark:text-emerald-400" data-testid="kpi-avg-match-score">
            {data.averagePlatformMatchScore}%
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {data.aiMetrics.highMatchCount} {isVi ? 'hồ sơ đạt' : 'profiles'} &ge; 75%
          </p>
        </div>
      </div>

      {/* 2. AI Engine Health & Telemetry Panel (UC-ADM-06) */}
      <div
        className="mb-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 border border-emerald-500/30 shadow-lg"
        data-testid="ai-telemetry-panel"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {isVi ? 'Giám sát Trạng thái AI Matching & ATS Intelligence' : 'AI Matching Engine & ATS Telemetry'}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  OPERATIONAL ({data.aiMetrics.uptimePercentage}%)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isVi ? 'Mô hình đang kích hoạt: ' : 'Active Model: '}
                <span className="font-bold text-emerald-300">{data.aiMetrics.activeModelName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/skills"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition"
            >
              <span>{isVi ? 'Cấu hình Từ điển Kỹ năng AI' : 'Configure AI Skill Taxonomy'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <span className="text-xs text-slate-300">{isVi ? 'Độ trễ suy luận trung bình' : 'Average Inference Latency'}</span>
            <div className="mt-1 text-2xl font-black text-emerald-400">
              {data.aiMetrics.averageLatencyMs} ms
            </div>
            <span className="text-[11px] text-slate-400">Real-time CV-to-JD Scoring</span>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <span className="text-xs text-slate-300">{isVi ? 'Tổng lượt chấm điểm ATS' : 'Total ATS Evaluations'}</span>
            <div className="mt-1 text-2xl font-black text-white">
              {data.aiMetrics.totalScoredApplications}
            </div>
            <span className="text-[11px] text-slate-400">{isVi ? 'Đơn ứng tuyển đã phân tích' : 'Scored applications'}</span>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <span className="text-xs text-slate-300">{isVi ? 'Ứng viên Độ khớp Cao (≥75%)' : 'High-Match Candidates (≥75%)'}</span>
            <div className="mt-1 text-2xl font-black text-cyan-300">
              {data.aiMetrics.highMatchCount}
            </div>
            <span className="text-[11px] text-slate-400">{isVi ? 'Khớp kỹ năng cốt lõi & năm KN' : 'Strong core skill & seniority fit'}</span>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <span className="text-xs text-slate-300">{isVi ? 'Kho Ứng viên Mở (Talent Pool)' : 'Open Talent Pool'}</span>
            <div className="mt-1 text-2xl font-black text-amber-300">
              {data.aiMetrics.openToWorkCandidates}
            </div>
            <span className="text-[11px] text-slate-400">{isVi ? 'Sẵn sàng nhận lời mời săn đầu người' : 'Ready for direct recruiter invites'}</span>
          </div>
        </div>
      </div>

      {/* 3. Platform Recruitment Funnel & Top Partner Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Funnel */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs">
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
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
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
                  ? 'bg-indigo-500'
                  : st.stage === 'REJECTED'
                  ? 'bg-rose-500'
                  : 'bg-blue-500';
              return (
                <div key={st.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {st.label}{' '}
                      <span className="text-xs font-normal text-slate-400">({st.stage})</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {st.count} {isVi ? 'hồ sơ' : 'apps'} ({st.percentage}%)
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

        {/* Top Companies Leaderboard */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
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
              <div key={comp.companyId} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {comp.companyName}
                      </p>
                      {comp.verificationStatus === 'VERIFIED' ? (
                        <span title="Verified"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /></span>
                      ) : comp.verificationStatus === 'PENDING' ? (
                        <span title="Pending"><Clock className="w-4 h-4 text-amber-500 shrink-0" /></span>
                      ) : (
                        <span title="Rejected"><ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" /></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {comp.industry || 'Software & IT Services'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
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
      </div>

      {/* 4. Top In-Demand Skills Supply vs Demand Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
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
          {data.topSkills.map((sk) => (
            <div
              key={sk.skillId}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {sk.skillName}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300">
                  {sk.category}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {isVi ? 'Cầu:' : 'Demand:'}{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">{sk.jobCount} Jobs</strong>
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {isVi ? 'Cung:' : 'Supply:'}{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {sk.candidateCount} {isVi ? 'Hồ sơ' : 'Profiles'}
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
