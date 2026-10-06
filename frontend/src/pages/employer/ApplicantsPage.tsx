import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, MapPin, Phone, Search } from 'lucide-react';
import { applicationApi, jobApi, openCvFile } from '../../lib/api';
import type { Application, Job, Stage } from '../../lib/types';
import { STAGES, STAGE_LABELS, formatDate, formatDateTime, timeAgo } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { EmptyState, ErrorBox, PageLoader, btnPrimary, btnSecondary, inputCls } from '../../components/ui/primitives';
import { Avatar } from '../../components/layout/Navbar';
import { StageBadge } from '../MyApplicationsPage';
import { usePageTitle } from '../../lib/usePageTitle';

const NEXT_STEP: Partial<Record<Stage, { stage: Stage; label: string }>> = {
  APPLIED: { stage: 'SCREENING', label: 'Chuyển sang xem xét' },
  SCREENING: { stage: 'INTERVIEW', label: 'Mời phỏng vấn' },
  INTERVIEW: { stage: 'OFFERED', label: 'Gửi offer' },
  OFFERED: { stage: 'HIRED', label: 'Xác nhận đã tuyển' },
};

const CandidatePanel: React.FC<{ app: Application; onUpdated: (a: Application) => void }> = ({ app, onUpdated }) => {
  const toast = useToast();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRejecting(false);
    setReason('');
    setError(null);
    if (window.innerWidth < 1024) panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [app.id]);

  const move = async (stage: Stage, rejectionReason?: string) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await applicationApi.updateStage(app.id, stage, rejectionReason);
      onUpdated(updated);
      setRejecting(false);
      toast(`${app.candidateName}: ${STAGE_LABELS[stage]}. Ứng viên đã được thông báo.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const viewCv = async () => {
    if (!app.cvId) return;
    try {
      await openCvFile(app.cvId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const next = NEXT_STEP[app.currentStage];
  const finished = app.currentStage === 'HIRED' || app.currentStage === 'REJECTED';
  const history = [...(app.history ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div ref={panelRef} className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-soft-xs scroll-mt-24 overflow-hidden" data-testid="candidate-panel">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <Avatar name={app.candidateName} size="w-12 h-12" />
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900">{app.candidateName}</h2>
            {app.candidateHeadline && <p className="text-sm text-slate-600">{app.candidateHeadline}</p>}
            <p className="text-xs text-slate-500 mt-1">
              Ứng tuyển <Link to={`/jobs/${app.jobId}`} className="font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600">{app.jobTitle}</Link> · {formatDate(app.appliedAt)}
            </p>
          </div>
          <StageBadge stage={app.currentStage} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          <a href={`mailto:${app.candidateEmail}`} className="inline-flex items-center gap-1.5 hover:text-emerald-600">
            <Mail className="w-4 h-4" /> {app.candidateEmail}
          </a>
          {app.candidatePhone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> {app.candidatePhone}
            </span>
          )}
          {app.candidateCity && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {app.candidateCity}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          {app.cvDownloadable ? (
            <button onClick={viewCv} className={btnSecondary} data-testid="view-cv">
              Xem CV{app.cvFileName ? ` (${app.cvFileName})` : ''}
            </button>
          ) : (
            <span className="text-xs text-slate-500">CV mẫu từ dữ liệu demo — không có file đính kèm.</span>
          )}
          {app.matchScore !== null && app.matchScore !== undefined && (
            <span className="text-xs text-slate-600">
              Khớp <span className="font-semibold">{Math.round(app.matchScore)}%</span> kỹ năng yêu cầu
            </span>
          )}
        </div>

        {app.candidateSkills?.length > 0 && (
          <div>
            <p className="font-medium text-slate-900 mb-1.5">Kỹ năng</p>
            <div className="flex flex-wrap gap-1.5">
              {app.candidateSkills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full border border-slate-200 text-xs text-slate-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="font-medium text-slate-900 mb-1.5">Thư giới thiệu</p>
          <p className="text-slate-700 whitespace-pre-line selectable-text">{app.coverLetter?.trim() || <span className="text-slate-400">Ứng viên không gửi thư giới thiệu.</span>}</p>
        </div>

        {app.currentStage === 'REJECTED' && app.rejectionReason && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-slate-700 dark:text-slate-300">
            <span className="font-medium">Lý do từ chối: </span>
            {app.rejectionReason}
          </div>
        )}

        <div>
          <p className="font-medium text-slate-900 mb-1.5">Lịch sử</p>
          <ol className="border-l-2 border-slate-200 pl-4 space-y-2">
            {history.map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-slate-800">{h.fromStage ? `${STAGE_LABELS[h.fromStage]} → ${STAGE_LABELS[h.toStage]}` : 'Nộp hồ sơ'}</span>
                <span className="text-xs text-slate-400 ml-2">{formatDateTime(h.createdAt)}</span>
              </li>
            ))}
          </ol>
        </div>

        {error && <ErrorBox message={error} />}

        {!finished && !rejecting && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {next && (
              <button disabled={busy} onClick={() => move(next.stage)} className={btnPrimary} data-testid="next-stage">
                {next.label}
              </button>
            )}
            <button disabled={busy} onClick={() => setRejecting(true)} className={`${btnSecondary} !text-rose-600 dark:!text-rose-400 hover:!border-rose-300`}>
              Từ chối
            </button>
          </div>
        )}
        {rejecting && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label htmlFor="reject-reason" className="font-medium text-slate-900">
              Lý do (ứng viên sẽ nhìn thấy)
            </label>
            <textarea
              id="reject-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Hồ sơ chưa phù hợp với yêu cầu về kinh nghiệm của vị trí."
              className={inputCls}
            />
            <div className="flex gap-2">
              <button disabled={busy || !reason.trim()} onClick={() => move('REJECTED', reason.trim())} className={`${btnPrimary}`}>
                Xác nhận từ chối
              </button>
              <button disabled={busy} onClick={() => setRejecting(false)} className={btnSecondary}>
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ApplicantsPage: React.FC = () => {
  usePageTitle('Ứng viên');
  const [params, setParams] = useSearchParams();
  const jobFilter = params.get('job') ?? '';
  const stageFilter = params.get('stage') ?? '';
  const selectedId = params.get('id');
  const [apps, setApps] = useState<Application[] | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    applicationApi
      .forRecruiter()
      .then(setApps)
      .catch((e: Error) => setError(e.message));
  };

  useEffect(() => {
    load();
    jobApi.mine().then(setJobs).catch(() => undefined);
  }, []);

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: 'id' in changes });
  };

  const byJob = useMemo(() => (apps ?? []).filter((a) => !jobFilter || String(a.jobId) === jobFilter), [apps, jobFilter]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byJob
      .filter((a) => !stageFilter || a.currentStage === stageFilter)
      .filter((a) => !q || `${a.candidateName} ${a.candidateEmail} ${a.candidateHeadline ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }, [byJob, stageFilter, query]);

  const selected = visible.find((a) => String(a.id) === selectedId) ?? (apps ?? []).find((a) => String(a.id) === selectedId) ?? null;

  if (error)
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ErrorBox message={error} onRetry={load} />
      </div>
    );
  if (!apps) return <PageLoader />;

  const jobOptions = jobs.length ? jobs : [...new Map(apps.map((a) => [a.jobId, { id: a.jobId, title: a.jobTitle } as Job])).values()];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Ứng viên</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select aria-label="Lọc theo tin" value={jobFilter} onChange={(e) => update({ job: e.target.value, id: '' })} className={`${inputCls} w-auto max-w-xs`}>
          <option value="">Tất cả tin tuyển dụng</option>
          {jobOptions.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên, email" aria-label="Tìm ứng viên" className={`${inputCls} pl-9 w-64`} />
        </div>
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200">
        {['', ...STAGES].map((s) => {
          const count = s ? byJob.filter((a) => a.currentStage === s).length : byJob.length;
          return (
            <button
              key={s || 'all'}
              onClick={() => update({ stage: s, id: '' })}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${stageFilter === s ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400' : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-emerald-600'}`}
            >
              {s ? STAGE_LABELS[s] : 'Tất cả'} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          {visible.length === 0 ? (
            <EmptyState title="Không có ứng viên nào" description={apps.length === 0 ? 'Hồ sơ ứng tuyển vào tin của bạn sẽ xuất hiện ở đây.' : 'Thử bỏ bớt bộ lọc.'} />
          ) : (
            <ul className="space-y-2" data-testid="applicant-list">
              {visible.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => update({ id: String(a.id) })}
                    className={`w-full text-left bg-white dark:bg-slate-900/95 border rounded-2xl p-3.5 flex items-center gap-3 hover:border-emerald-300 transition-colors ${selected?.id === a.id ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800'}`}
                    data-testid="applicant-item"
                  >
                    <Avatar name={a.candidateName} size="w-10 h-10" />
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-slate-900 truncate">{a.candidateName}</span>
                      <span className="block text-xs text-slate-500 truncate">
                        {a.jobTitle} · {timeAgo(a.appliedAt)}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1 shrink-0">
                      <StageBadge stage={a.currentStage} />
                      {a.matchScore !== null && a.matchScore !== undefined && <span className="text-[11px] text-slate-500">Khớp {Math.round(a.matchScore)}%</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="lg:sticky lg:top-20 h-fit">
          {selected ? (
            <CandidatePanel app={selected} onUpdated={(u) => setApps((list) => list?.map((x) => (x.id === u.id ? u : x)) ?? null)} />
          ) : (
            <div className="hidden lg:block border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 text-center text-sm text-slate-500 dark:text-slate-400">Chọn một ứng viên để xem hồ sơ.</div>
          )}
        </div>
      </div>
    </div>
  );
};
