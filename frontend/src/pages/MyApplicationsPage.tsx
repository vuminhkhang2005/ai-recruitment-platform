import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { applicationApi } from '../lib/api';
import type { Application } from '../lib/types';
import { STAGE_LABELS, STAGE_STYLES, WITHDRAWABLE_STAGES, formatDate, formatDateTime } from '../lib/format';
import { useMyApplications } from '../context/MyApplicationsContext';
import { useToast } from '../context/ToastContext';
import { CompanyAvatar, EmptyState, ErrorBox, PageLoader } from '../components/ui/primitives';
import { usePageTitle } from '../lib/usePageTitle';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang xử lý' },
  { key: 'INTERVIEW', label: 'Phỏng vấn' },
  { key: 'OFFERED', label: 'Offer' },
  { key: 'closed', label: 'Đã kết thúc' },
];

const ACTIVE = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED'];

export const StageBadge: React.FC<{ stage: string }> = ({ stage }) => (
  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${STAGE_STYLES[stage] ?? 'bg-slate-100 text-slate-700'}`}>{STAGE_LABELS[stage] ?? stage}</span>
);

const ApplicationRow: React.FC<{ app: Application; onWithdrawn: () => void }> = ({ app, onWithdrawn }) => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canWithdraw = WITHDRAWABLE_STAGES.includes(app.currentStage);
  const jobClosed = app.jobStatus !== 'PUBLISHED';

  const withdraw = async () => {
    if (!window.confirm(`Rút hồ sơ ứng tuyển vị trí "${app.jobTitle}"? Bạn có thể ứng tuyển lại sau nếu tin còn mở.`)) return;
    setBusy(true);
    setError(null);
    try {
      await applicationApi.withdraw(app.id);
      toast('Đã rút hồ sơ');
      onWithdrawn();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const timeline = [...(app.history ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <li className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-soft-xs hover:border-emerald-300 transition-colors" data-testid="application-row">
      <div className="p-5 flex gap-4">
        <CompanyAvatar name={app.companyName} logoUrl={app.companyLogo} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link to={`/jobs/${app.jobId}`} className="font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400">
                {app.jobTitle}
              </Link>
              <p className="text-sm text-slate-600">{app.companyName}</p>
            </div>
            <StageBadge stage={app.currentStage} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Nộp ngày {formatDate(app.appliedAt)}</span>
            {app.jobSalary && <span>{app.jobSalary}</span>}
            {app.cvTitle && <span>CV: {app.cvTitle}</span>}
            {jobClosed && <span className="text-slate-400">Tin đã đóng</span>}
          </div>
          {app.currentStage === 'REJECTED' && app.rejectionReason && (
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
              <span className="font-medium">Phản hồi từ nhà tuyển dụng: </span>
              {app.rejectionReason}
            </p>
          )}
          {error && (
            <div className="mt-2">
              <ErrorBox message={error} />
            </div>
          )}
          <div className="mt-3 flex items-center gap-4">
            <button onClick={() => setOpen((o) => !o)} className="text-sm font-bold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 hover:text-emerald-800" aria-expanded={open}>
              Lịch sử hồ sơ {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {canWithdraw && (
              <button onClick={withdraw} disabled={busy} className="text-sm font-bold text-rose-600 dark:text-rose-400 hover:underline disabled:opacity-50">
                {busy ? 'Đang rút…' : 'Rút hồ sơ'}
              </button>
            )}
          </div>
          {open && (
            <ol className="mt-4 border-l-2 border-emerald-200 dark:border-emerald-900 pl-4 space-y-3" data-testid="application-timeline">
              {timeline.length === 0 ? (
                <li className="text-sm text-slate-500">Đã nộp hồ sơ · {formatDateTime(app.appliedAt)}</li>
              ) : (
                timeline.map((h, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                    <p className="text-sm text-slate-800">
                      {h.fromStage ? (
                        <>
                          Chuyển sang <span className="font-semibold">{STAGE_LABELS[h.toStage] ?? h.toStage}</span>
                        </>
                      ) : (
                        'Đã nộp hồ sơ'
                      )}
                    </p>
                    {h.note && h.fromStage && <p className="text-xs text-slate-600">{h.note}</p>}
                    <p className="text-xs text-slate-400">{formatDateTime(h.createdAt)}</p>
                  </li>
                ))
              )}
            </ol>
          )}
        </div>
      </div>
    </li>
  );
};

export const MyApplicationsPage: React.FC = () => {
  usePageTitle('Việc đã ứng tuyển');
  const { applications, loading, refresh } = useMyApplications();
  const [filter, setFilter] = useState('all');
  const [loadedOnce, setLoadedOnce] = useState(false);

  React.useEffect(() => {
    void refresh().then(() => setLoadedOnce(true));
  }, [refresh]);

  const list = useMemo(() => {
    const sorted = [...applications].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    if (filter === 'all') return sorted;
    if (filter === 'active') return sorted.filter((a) => ACTIVE.includes(a.currentStage));
    if (filter === 'closed') return sorted.filter((a) => !ACTIVE.includes(a.currentStage));
    return sorted.filter((a) => a.currentStage === filter);
  }, [applications, filter]);

  if (!loadedOnce && loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Việc đã ứng tuyển</h1>
      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200">
        {FILTERS.map((f) => {
          const count =
            f.key === 'all'
              ? applications.length
              : f.key === 'active'
                ? applications.filter((a) => ACTIVE.includes(a.currentStage)).length
                : f.key === 'closed'
                  ? applications.filter((a) => !ACTIVE.includes(a.currentStage)).length
                  : applications.filter((a) => a.currentStage === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${filter === f.key ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400' : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-emerald-600'}`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>
      <div className="mt-5">
        {list.length === 0 ? (
          <EmptyState
            title={applications.length === 0 ? 'Bạn chưa ứng tuyển công việc nào' : 'Không có hồ sơ ở trạng thái này'}
            action={
              applications.length === 0 ? (
                <Link to="/jobs" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Tìm việc làm
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-3">
            {list.map((a) => (
              <ApplicationRow key={a.id} app={a} onWithdrawn={() => void refresh()} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
