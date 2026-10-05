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
  PUBLISHED: 'bg-green-50 text-green-700',
  PAUSED: 'bg-amber-50 text-amber-700',
  CLOSED: 'bg-slate-100 text-slate-600',
};

const Stat: React.FC<{ label: string; value: number; to?: string }> = ({ label: text, value, to }) => {
  const body = (
    <>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{text}</p>
    </>
  );
  return to ? (
    <Link to={to} className="bg-white border border-slate-200 rounded-lg p-4 hover:border-red-300">
      {body}
    </Link>
  ) : (
    <div className="bg-white border border-slate-200 rounded-lg p-4">{body}</div>
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tin tuyển dụng</h1>
          {me?.companyName && (
            <p className="text-sm text-slate-500 mt-1">
              {me.companyName} ·{' '}
              <Link to={`/companies/${me.companyId}`} className="text-red-600 hover:underline">
                Xem trang công ty
              </Link>
            </p>
          )}
        </div>
        <Link to="/employer/jobs/new" className={btnPrimary}>
          <Plus className="w-4 h-4" /> Đăng tin mới
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm" data-testid="my-jobs">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Vị trí</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Hồ sơ</th>
                  <th className="px-4 py-3 font-medium">Lượt xem</th>
                  <th className="px-4 py-3 font-medium">Hạn nộp</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j) => {
                  const left = daysLeft(j.deadline);
                  const expired = left !== null && left < 0;
                  const c = countsByJob[j.id] ?? { total: 0, fresh: 0 };
                  const busy = busyId === j.id;
                  return (
                    <tr key={j.id} data-testid="my-job-row">
                      <td className="px-4 py-3">
                        <Link to={`/jobs/${j.id}`} className="font-medium text-slate-900 hover:text-red-600">
                          {j.title}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {j.locationCity} · {j.salaryFormatted} · Đăng {formatDate(j.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${expired && j.status === 'PUBLISHED' ? 'bg-slate-100 text-slate-600' : STATUS_STYLE[j.status] ?? ''}`}>
                          {expired && j.status === 'PUBLISHED' ? 'Hết hạn' : label(JOB_STATUS, j.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/employer/applicants?job=${j.id}`} className="text-slate-900 hover:text-red-600">
                          <span className="font-semibold">{c.total}</span>
                          {c.fresh > 0 && <span className="ml-1 text-xs text-red-600">({c.fresh} mới)</span>}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{j.viewsCount}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(j.deadline)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1 whitespace-nowrap">
                          <Link to={`/employer/applicants?job=${j.id}`} className="px-2 py-1 rounded text-xs font-medium text-slate-700 hover:bg-slate-100">
                            Ứng viên
                          </Link>
                          <Link to={`/employer/jobs/${j.id}/edit`} className="px-2 py-1 rounded text-xs font-medium text-slate-700 hover:bg-slate-100">
                            Sửa
                          </Link>
                          {j.status === 'PUBLISHED' && !expired && (
                            <>
                              <button disabled={busy} onClick={() => setStatus(j, 'PAUSED')} className="px-2 py-1 rounded text-xs font-medium text-slate-700 hover:bg-slate-100">
                                Tạm dừng
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => setStatus(j, 'CLOSED', `Đóng tin "${j.title}"? Ứng viên sẽ không thể nộp hồ sơ nữa.`)}
                                className="px-2 py-1 rounded text-xs font-medium text-slate-700 hover:bg-slate-100"
                              >
                                Đóng tin
                              </button>
                            </>
                          )}
                          {(j.status !== 'PUBLISHED' || expired) && (
                            <button
                              disabled={busy}
                              onClick={() => (expired ? toast('Tin đã hết hạn. Hãy sửa tin và gia hạn hạn nộp để mở lại.', 'info') : setStatus(j, 'PUBLISHED'))}
                              className="px-2 py-1 rounded text-xs font-medium text-green-700 hover:bg-green-50"
                            >
                              Mở lại
                            </button>
                          )}
                          <button disabled={busy} onClick={() => remove(j)} className="px-2 py-1 rounded text-xs font-medium text-red-600 hover:bg-red-50">
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
