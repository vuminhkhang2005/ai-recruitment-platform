import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Layers,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { analyticsApi } from '../../lib/api';
import type { RecruitmentAnalytics, TopJobMetric } from '../../lib/types';
import { usePageTitle } from '../../lib/usePageTitle';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState, ErrorBox, PageLoader, btnPrimary, btnSecondary } from '../../components/ui/primitives';

export const EmployerAnalyticsPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  usePageTitle(isEn ? 'Recruitment Analytics & Funnel' : 'Thống kê & Phễu Tuyển dụng');

  const [data, setData] = useState<RecruitmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = () => {
    setLoading(true);
    setError(null);
    analyticsApi
      .getAnalytics()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" data-testid="employer-analytics-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-soft">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {isEn ? 'Recruitment Analytics & Funnel' : 'Thống kê Tuyển dụng & Phễu Tuyển'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {data ? `${data.companyName} · ` : ''}
                {isEn
                  ? 'Real-time performance metrics, applicant funnel, and ATS quality breakdown'
                  : 'Chỉ số hiệu quả tuyển dụng, phễu ứng tuyển 5 giai đoạn và phân bổ chất lượng ATS'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className={`${btnSecondary} text-xs font-bold`}
            title={isEn ? 'Refresh data' : 'Làm mới dữ liệu'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {isEn ? 'Refresh' : 'Làm mới'}
          </button>
          <Link to="/employer" className={`${btnSecondary} text-xs font-bold`}>
            {isEn ? 'Manage Jobs' : 'Quản lý tin'}
          </Link>
          <Link to="/employer/post-job" className={`${btnPrimary} text-xs font-bold`}>
            <Plus className="w-4 h-4" />
            {isEn ? 'Post Job' : 'Đăng tin mới'}
          </Link>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {data && (
        <>
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isEn ? 'Total Applications' : 'Tổng Đơn Ứng Tuyển'}
                </span>
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white" data-testid="kpi-total-apps">
                {data.kpis.totalApplications}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.kpis.activeJobs}</span> {isEn ? 'active job openings' : 'tin đang mở nhận hồ sơ'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isEn ? 'Hire Conversion Rate' : 'Tỷ Lệ Tuyển Thành Công'}
                </span>
                <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white" data-testid="kpi-hire-rate">
                {data.funnel.hireRate}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {data.funnel.hiredCount} {isEn ? 'candidates hired from funnel' : 'ứng viên đã được tiếp nhận'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isEn ? 'Avg Review Turnaround' : 'Thời Gian Duyệt Hồ Sơ'}
                </span>
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {data.kpis.avgDaysToReview} <span className="text-base font-normal text-slate-500">{isEn ? 'days' : 'ngày'}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isEn ? `Avg time to hire: ${data.kpis.avgDaysToHire} days` : `Thời gian đến khi nhận việc: ${data.kpis.avgDaysToHire} ngày`}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isEn ? 'Interview Rate' : 'Tỷ Lệ Phỏng Vấn'}
                </span>
                <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {data.funnel.interviewRate}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {data.funnel.interviewCount} {isEn ? 'interviews scheduled' : 'lượt ứng viên phỏng vấn'}
              </p>
            </div>
          </div>

          {/* 5-Stage Hiring Funnel Visual */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {isEn ? '5-Stage Hiring Funnel' : 'Phễu Tuyển Dụng 5 Giai Đoạn'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn
                    ? 'Track progression and stage drop-offs from application to final offer'
                    : 'Theo dõi tiến trình và tỷ lệ chuyển đổi qua từng vòng từ nộp hồ sơ đến nhận việc'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> {isEn ? 'Progression' : 'Chuyển tiếp'}
                </span>
              </div>
            </div>

            {/* Visual Funnel Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3" data-testid="funnel-container">
              {/* Stage 1: Applied */}
              <div className="relative p-4 rounded-2xl bg-gradient-to-b from-blue-50/70 to-blue-100/30 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 text-xs font-black uppercase mb-1">
                    <span>1. {isEn ? 'Applied' : 'Ứng tuyển'}</span>
                    <span>100%</span>
                  </div>
                  <p className="text-2xl font-black text-blue-950 dark:text-white">{data.funnel.appliedCount}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-600 dark:text-blue-400">
                  {isEn ? 'Total applicants' : 'Hồ sơ đã nộp'}
                </div>
              </div>

              {/* Stage 2: Screening */}
              <div className="relative p-4 rounded-2xl bg-gradient-to-b from-sky-50/70 to-sky-100/30 dark:from-sky-950/40 dark:to-slate-900 border border-sky-200/80 dark:border-sky-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-sky-700 dark:text-sky-300 text-xs font-black uppercase mb-1">
                    <span>2. {isEn ? 'Screening' : 'Sơ loại'}</span>
                    <span>{data.funnel.screeningRate}%</span>
                  </div>
                  <p className="text-2xl font-black text-sky-950 dark:text-white">{data.funnel.screeningCount}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-sky-200/60 dark:border-sky-900/40 text-[11px] text-sky-600 dark:text-sky-400">
                  {isEn ? 'Passed initial review' : 'Qua vòng lọc CV'}
                </div>
              </div>

              {/* Stage 3: Interview */}
              <div className="relative p-4 rounded-2xl bg-gradient-to-b from-purple-50/70 to-purple-100/30 dark:from-purple-950/40 dark:to-slate-900 border border-purple-200/80 dark:border-purple-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-purple-700 dark:text-purple-300 text-xs font-black uppercase mb-1">
                    <span>3. {isEn ? 'Interview' : 'Phỏng vấn'}</span>
                    <span>{data.funnel.interviewRate}%</span>
                  </div>
                  <p className="text-2xl font-black text-purple-950 dark:text-white">{data.funnel.interviewCount}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200/60 dark:border-purple-900/40 text-[11px] text-purple-600 dark:text-purple-400">
                  {isEn ? 'Engaged in interview' : 'Tham gia phỏng vấn'}
                </div>
              </div>

              {/* Stage 4: Offered */}
              <div className="relative p-4 rounded-2xl bg-gradient-to-b from-amber-50/70 to-amber-100/30 dark:from-amber-950/40 dark:to-slate-900 border border-amber-200/80 dark:border-amber-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 text-xs font-black uppercase mb-1">
                    <span>4. {isEn ? 'Offered' : 'Đề nghị'}</span>
                    <span>{data.funnel.offerRate}%</span>
                  </div>
                  <p className="text-2xl font-black text-amber-950 dark:text-white">{data.funnel.offeredCount}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-600 dark:text-amber-400">
                  {isEn ? 'Received job offer' : 'Nhận offer công việc'}
                </div>
              </div>

              {/* Stage 5: Hired */}
              <div className="relative p-4 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-emerald-100/40 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-300 dark:border-emerald-800/80 flex flex-col justify-between shadow-soft-xs">
                <div>
                  <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase mb-1">
                    <span>5. {isEn ? 'Hired' : 'Tuyển dụng'}</span>
                    <span>{data.funnel.hireRate}%</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-950 dark:text-white">{data.funnel.hiredCount}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isEn ? 'Onboarded' : 'Tiếp nhận thành công'}
                </div>
              </div>
            </div>

            {/* Funnel Dropoff Stepper Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{isEn ? 'Funnel Conversion Progress' : 'Tiến trình chuyển đổi phễu'}</span>
                <span>{data.funnel.hireRate}% {isEn ? 'end-to-end efficiency' : 'hiệu suất trọn gói'}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${Math.max(10, data.funnel.hireRate)}%` }} className="bg-emerald-500 h-full rounded-full transition-all duration-500" />
                <div style={{ width: `${Math.max(5, data.funnel.offerRate - data.funnel.hireRate)}%` }} className="bg-amber-400 h-full opacity-80" />
                <div style={{ width: `${Math.max(10, data.funnel.interviewRate - data.funnel.offerRate)}%` }} className="bg-purple-400 h-full opacity-70" />
                <div style={{ width: `${Math.max(15, data.funnel.screeningRate - data.funnel.interviewRate)}%` }} className="bg-sky-400 h-full opacity-60" />
              </div>
            </div>
          </div>

          {/* Quality Distribution & Top Jobs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ATS Match Quality Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-5">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  {isEn ? 'Applicant Quality Distribution' : 'Phân Bổ Chất Lượng ATS'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn
                    ? 'Breakdown of applicants by automated ATS skill match score'
                    : 'Độ khớp kỹ năng tự động của ứng viên theo hồ sơ CV'}
                </p>
              </div>

              <div className="space-y-4">
                {/* High Match */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      {isEn ? 'High Match (≥ 75%)' : 'Rất phù hợp (≥ 75%)'}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {data.quality.highMatchCount} ({data.quality.highMatchPct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${data.quality.highMatchPct}%` }}
                    />
                  </div>
                </div>

                {/* Medium Match */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      {isEn ? 'Medium Match (50% - 74%)' : 'Tiềm năng (50% - 74%)'}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {data.quality.mediumMatchCount} ({data.quality.mediumMatchPct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${data.quality.mediumMatchPct}%` }}
                    />
                  </div>
                </div>

                {/* Low Match */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      {isEn ? 'Skill Gap (< 50%)' : 'Cần bổ sung (< 50%)'}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {data.quality.lowMatchCount} ({data.quality.lowMatchPct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${data.quality.lowMatchPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white mb-1">
                  {isEn ? '💡 AI Recommendation' : '💡 Đề xuất tối ưu từ AI'}
                </p>
                <p className="leading-relaxed">
                  {data.quality.highMatchPct >= 40
                    ? isEn
                      ? 'High-quality applicant pool detected! Prioritize interviews for top candidates with score ≥ 75% to reduce hiring turnaround.'
                      : 'Nguồn ứng viên chất lượng cao! Hãy ưu tiên đặt lịch phỏng vấn cho ứng viên có điểm số ≥ 75% để rút ngắn thời gian tuyển dụng.'
                    : isEn
                      ? 'Consider refining skill keywords in your job descriptions to attract more matched talent profiles.'
                      : 'Nên cập nhật thêm từ khóa kỹ năng cốt lõi trong tin tuyển dụng để thu hút đúng đối tượng ứng viên mục tiêu.'}
                </p>
              </div>
            </div>

            {/* Top Performing Jobs Table */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {isEn ? 'Top Job Openings by Volume' : 'Hiệu Quả Theo Từng Tin Tuyển Dụng'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isEn ? 'Applicant flow and hiring rate per position' : 'Lượng hồ sơ và tỷ lệ chuyển đổi cho từng vị trí'}
                  </p>
                </div>
              </div>

              {data.topJobs.length === 0 ? (
                <EmptyState
                  title={isEn ? 'No jobs found' : 'Chưa có tin tuyển dụng nào'}
                  description={isEn ? 'Post your first job opening to see recruitment metrics.' : 'Hãy đăng tin tuyển dụng đầu tiên để xem thống kê.'}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="pb-3 font-bold">{isEn ? 'Position' : 'Vị trí tuyển dụng'}</th>
                        <th className="pb-3 font-bold text-center">{isEn ? 'Applications' : 'Hồ sơ'}</th>
                        <th className="pb-3 font-bold text-center">{isEn ? 'Interviews' : 'Phỏng vấn'}</th>
                        <th className="pb-3 font-bold text-center">{isEn ? 'Hired' : 'Tiếp nhận'}</th>
                        <th className="pb-3 font-bold text-right">{isEn ? 'Hire Rate' : 'Tỷ lệ tuyển'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.topJobs.map((tj: TopJobMetric) => {
                        const hireRate =
                          tj.applicationsCount > 0
                            ? Math.round((tj.hiredCount / tj.applicationsCount) * 100)
                            : 0;
                        return (
                          <tr key={tj.jobId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3">
                              <Link
                                to={`/jobs/${tj.jobId}`}
                                className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5"
                              >
                                <span>{tj.jobTitle}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </Link>
                            </td>
                            <td className="py-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                              {tj.applicationsCount}
                            </td>
                            <td className="py-3 text-center font-semibold text-purple-700 dark:text-purple-400">
                              {tj.interviewCount}
                            </td>
                            <td className="py-3 text-center font-bold text-emerald-700 dark:text-emerald-400">
                              {tj.hiredCount}
                            </td>
                            <td className="py-3 text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                {hireRate}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default EmployerAnalyticsPage;
