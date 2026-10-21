import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Plus, Sparkles } from 'lucide-react';
import { applicationApi, jobApi, userApi } from '../../lib/api';
import type { Application, Job, UserProfile } from '../../lib/types';
import { getJobStatus, daysLeft, formatDate, formatSalary, label } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { EmptyState, ErrorBox, PageLoader, btnPrimary, btnSecondary } from '../../components/ui/primitives';
import { usePageTitle } from '../../lib/usePageTitle';
import { useLanguage } from '../../i18n/LanguageContext';

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  PAUSED: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  CLOSED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const Stat: React.FC<{ label: string; value: number; to?: string }> = ({ label: text, value, to }) => {
  const body = (
    <>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{text}</p>
    </>
  );
  return to ? (
    <Link to={to} className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-soft-xs hover:border-emerald-400 transition-colors">
      {body}
    </Link>
  ) : (
    <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-5 shadow-soft text-white [&_p]:!text-white">{body}</div>
  );
};

export const EmployerDashboard: React.FC = () => {
  const { language } = useLanguage();
  const lang: 'vi' | 'en' = language === 'en' ? 'en' : 'vi';
  const isVi = lang === 'vi';
  const jobStatusMap = getJobStatus(lang);
  usePageTitle(isVi ? 'Quản lý tin tuyển dụng' : 'Manage Job Postings');
  const toast = useToast();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = () => {
    setError(null);
    Promise.all([jobApi.mine(), applicationApi.forRecruiter()])
      .then(([j, a]) => {
        setJobs(j);
        setApps(a);
      })
      .catch((e: Error) => setError(e.message));
  };

  useEffect(() => {
    userApi.getMe().then(setMe).catch(() => undefined);
    load();
  }, []);

  const countsByJob = useMemo(() => {
    const m: Record<number, { total: number; fresh: number }> = {};
    apps.forEach((a) => {
      m[a.jobId] ??= { total: 0, fresh: 0 };
      m[a.jobId].total++;
      if (a.currentStage === 'APPLIED') m[a.jobId].fresh++;
    });
    return m;
  }, [apps]);

  const setStatus = async (job: Job, status: string, confirmMsg?: string) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusyId(job.id);
    try {
      await jobApi.setStatus(job.id, status);
      toast(
        isVi
          ? `Đã chuyển tin "${job.title}" sang ${label(jobStatusMap, status).toLowerCase()}`
          : `Updated "${job.title}" to ${label(jobStatusMap, status)}`
      );
      load();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (job: Job) => {
    if (
      !window.confirm(
        isVi
          ? `Xóa tin "${job.title}"? Tin sẽ bị gỡ khỏi trang tìm việc.`
          : `Delete "${job.title}"? This posting will be removed from the job board.`
      )
    )
      return;
    setBusyId(job.id);
    try {
      await jobApi.remove(job.id);
      toast(isVi ? 'Đã xóa tin tuyển dụng' : 'Job posting deleted');
      load();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (error)
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ErrorBox message={error} onRetry={load} />
      </div>
    );
  if (!jobs) return <PageLoader />;

  const open = jobs.filter((j) => j.status === 'PUBLISHED' && (daysLeft(j.deadline) ?? 1) >= 0).length;
  const fresh = apps.filter((a) => a.currentStage === 'APPLIED').length;
  const interviewing = apps.filter((a) => a.currentStage === 'INTERVIEW').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {isVi ? 'Tin tuyển dụng' : 'Job Postings'}
          </h1>
          {me?.companyName && (
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {me.companyName} ·{' '}
              <Link to={`/companies/${me.companyId}`} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                {isVi ? 'Xem trang công ty' : 'View Company Page'}
              </Link>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/employer/talent-pool" className={`${btnSecondary} text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800`} data-testid="btn-employer-talent-pool">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> {isVi ? 'Săn ứng viên' : 'Talent Pool'}
          </Link>
          <Link to="/employer/analytics" className={`${btnSecondary} text-xs sm:text-sm font-bold`} data-testid="btn-employer-analytics">
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {isVi ? 'Thống kê tuyển dụng' : 'Analytics'}
          </Link>
          <Link to="/employer/jobs/new" className={btnPrimary}>
            <Plus className="w-4 h-4" /> {isVi ? 'Đăng tin mới' : 'Post a Job'}
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label={isVi ? 'Tin đang tuyển' : 'Active Jobs'} value={open} />
        <Stat label={isVi ? 'Tổng hồ sơ' : 'Total Applications'} value={apps.length} to="/employer/applicants" />
        <Stat label={isVi ? 'Hồ sơ mới chưa xem' : 'New Applications'} value={fresh} to="/employer/applicants?stage=APPLIED" />
        <Stat label={isVi ? 'Đang phỏng vấn' : 'In Interview'} value={interviewing} to="/employer/applicants?stage=INTERVIEW" />
      </div>

      <div className="mt-6">
        {jobs.length === 0 ? (
          <EmptyState
            title={isVi ? 'Bạn chưa đăng tin tuyển dụng nào' : 'You have not posted any jobs yet'}
            action={
              <Link to="/employer/jobs/new" className={btnPrimary}>
                {isVi ? 'Đăng tin đầu tiên' : 'Post Your First Job'}
              </Link>
            }
          />
        ) : (
          <div className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-x-auto shadow-soft-xs">
            <table className="w-full text-sm" data-testid="my-jobs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-left text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 font-black">{isVi ? 'Vị trí' : 'Position'}</th>
                  <th className="px-4 py-3.5 font-black">{isVi ? 'Trạng thái' : 'Status'}</th>
                  <th className="px-4 py-3.5 font-black">{isVi ? 'Hồ sơ' : 'Applicants'}</th>
                  <th className="px-4 py-3.5 font-black">{isVi ? 'Lượt xem' : 'Views'}</th>
                  <th className="px-4 py-3.5 font-black">{isVi ? 'Hạn nộp' : 'Deadline'}</th>
                  <th className="px-4 py-3.5 font-black text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.map((j) => {
                  const left = daysLeft(j.deadline);
                  const expired = left !== null && left < 0;
                  const c = countsByJob[j.id] ?? { total: 0, fresh: 0 };
                  const busy = busyId === j.id;
                  return (
                    <tr key={j.id} data-testid="my-job-row">
                      <td className="px-4 py-3">
                        <Link to={`/jobs/${j.id}`} className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400">
                          {j.title}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {j.locationCity} · {formatSalary(j.salaryFormatted, lang)} · {isVi ? 'Đăng ' : 'Posted '}
                          {formatDate(j.createdAt, lang)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${expired && j.status === 'PUBLISHED' ? 'bg-slate-100 text-slate-600' : STATUS_STYLE[j.status] ?? ''}`}>
                          {expired && j.status === 'PUBLISHED' ? (isVi ? 'Hết hạn' : 'Expired') : label(jobStatusMap, j.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/employer/applicants?job=${j.id}`} className="text-slate-900 dark:text-white hover:text-emerald-600">
                          <span className="font-semibold">{c.total}</span>
                          {c.fresh > 0 && (
                            <span className="ml-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              ({c.fresh} {isVi ? 'mới' : 'new'})
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{j.viewsCount}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(j.deadline, lang)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1 whitespace-nowrap">
                          <Link to={`/employer/applicants?job=${j.id}`} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300">
                            {isVi ? 'Ứng viên' : 'Applicants'}
                          </Link>
                          <Link to={`/employer/jobs/${j.id}/edit`} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300">
                            {isVi ? 'Sửa' : 'Edit'}
                          </Link>
                          {j.status === 'PUBLISHED' && !expired && (
                            <>
                              <button disabled={busy} onClick={() => setStatus(j, 'PAUSED')} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300">
                                {isVi ? 'Tạm dừng' : 'Pause'}
                              </button>
                              <button
                                disabled={busy}
                                onClick={() =>
                                  setStatus(
                                    j,
                                    'CLOSED',
                                    isVi
                                      ? `Đóng tin "${j.title}"? Ứng viên sẽ không thể nộp hồ sơ nữa.`
                                      : `Close "${j.title}"? Candidates will no longer be able to apply.`
                                  )
                                }
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
                              >
                                {isVi ? 'Đóng tin' : 'Close'}
                              </button>
                            </>
                          )}
                          {(j.status !== 'PUBLISHED' || expired) && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                expired
                                  ? toast(
                                      isVi
                                        ? 'Tin đã hết hạn. Hãy sửa tin và gia hạn hạn nộp để mở lại.'
                                        : 'Job has expired. Please edit and extend the deadline to reopen.',
                                      'info'
                                    )
                                  : setStatus(j, 'PUBLISHED')
                              }
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                            >
                              {isVi ? 'Mở lại' : 'Reopen'}
                            </button>
                          )}
                          <button disabled={busy} onClick={() => remove(j)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                            {isVi ? 'Xóa' : 'Delete'}
                          </button>
                        </div>
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
  );
};
