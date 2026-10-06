import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { applicationApi, jobApi, userApi } from '../../lib/api';
import type { Application, Job, UserProfile } from '../../lib/types';
import { JOB_STATUS, daysLeft, formatDate, label } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { EmptyState, ErrorBox, PageLoader, btnPrimary } from '../../components/ui/primitives';
import { usePageTitle } from '../../lib/usePageTitle';

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
  usePageTitle('Quản lý tin tuyển dụng');
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
      toast(`Đã chuyển tin "${job.title}" sang ${label(JOB_STATUS, status).toLowerCase()}`);
      load();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (job: Job) => {
    if (!window.confirm(`Xóa tin "${job.title}"? Tin sẽ bị gỡ khỏi trang tìm việc.`)) return;
    setBusyId(job.id);
    try {
      await jobApi.remove(job.id);
      toast('Đã xóa tin tuyển dụng');
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
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Tin tuyển dụng</h1>
          {me?.companyName && (
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {me.companyName} ·{' '}
              <Link to={`/companies/${me.companyId}`} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                Xem trang công ty
              </Link>
            </p>
          )}
        </div>
        <Link to="/employer/jobs/new" className={btnPrimary}>
          <Plus className="w-4 h-4" /> Đăng tin mới
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Tin đang tuyển" value={open} />
        <Stat label="Tổng hồ sơ" value={apps.length} to="/employer/applicants" />
        <Stat label="Hồ sơ mới chưa xem" value={fresh} to="/employer/applicants?stage=APPLIED" />
        <Stat label="Đang phỏng vấn" value={interviewing} to="/employer/applicants?stage=INTERVIEW" />
      </div>

      <div className="mt-6">
        {jobs.length === 0 ? (
          <EmptyState
            title="Bạn chưa đăng tin tuyển dụng nào"
            action={
              <Link to="/employer/jobs/new" className={btnPrimary}>
                Đăng tin đầu tiên
              </Link>
            }
          />
        ) : (
          <div className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-x-auto shadow-soft-xs">
            <table className="w-full text-sm" data-testid="my-jobs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-left text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 font-black">Vị trí</th>
                  <th className="px-4 py-3.5 font-black">Trạng thái</th>
                  <th className="px-4 py-3.5 font-black">Hồ sơ</th>
                  <th className="px-4 py-3.5 font-black">Lượt xem</th>
                  <th className="px-4 py-3.5 font-black">Hạn nộp</th>
                  <th className="px-4 py-3.5 font-black text-right">Thao tác</th>
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
                          {j.locationCity} · {j.salaryFormatted} · Đăng {formatDate(j.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${expired && j.status === 'PUBLISHED' ? 'bg-slate-100 text-slate-600' : STATUS_STYLE[j.status] ?? ''}`}>
                          {expired && j.status === 'PUBLISHED' ? 'Hết hạn' : label(JOB_STATUS, j.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/employer/applicants?job=${j.id}`} className="text-slate-900 dark:text-white hover:text-emerald-600">
                          <span className="font-semibold">{c.total}</span>
                          {c.fresh > 0 && <span className="ml-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">({c.fresh} mới)</span>}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{j.viewsCount}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(j.deadline)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1 whitespace-nowrap">
                          <Link to={`/employer/applicants?job=${j.id}`} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300">
                            Ứng viên
                          </Link>
                          <Link to={`/employer/jobs/${j.id}/edit`} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300">
                            Sửa
                          </Link>
                          {j.status === 'PUBLISHED' && !expired && (
                            <>
                              <button disabled={busy} onClick={() => setStatus(j, 'PAUSED')} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300">
                                Tạm dừng
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => setStatus(j, 'CLOSED', `Đóng tin "${j.title}"? Ứng viên sẽ không thể nộp hồ sơ nữa.`)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
                              >
                                Đóng tin
                              </button>
                            </>
                          )}
                          {(j.status !== 'PUBLISHED' || expired) && (
                            <button
                              disabled={busy}
                              onClick={() => (expired ? toast('Tin đã hết hạn. Hãy sửa tin và gia hạn hạn nộp để mở lại.', 'info') : setStatus(j, 'PUBLISHED'))}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                            >
                              Mở lại
                            </button>
                          )}
                          <button disabled={busy} onClick={() => remove(j)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                            Xóa
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
