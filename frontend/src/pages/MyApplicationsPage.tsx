import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Calendar, MessageSquare, Video, Building, ExternalLink } from 'lucide-react';
import { applicationApi, interviewApi } from '../lib/api';
import type { Application, InterviewDto } from '../lib/types';
import { getStageLabels, STAGE_STYLES, WITHDRAWABLE_STAGES, formatDate, formatDateTime, formatSalary } from '../lib/format';
import { useMyApplications } from '../context/MyApplicationsContext';
import { useToast } from '../context/ToastContext';
import { CompanyAvatar, EmptyState, ErrorBox, PageLoader } from '../components/ui/primitives';
import { usePageTitle } from '../lib/usePageTitle';
import { useLanguage } from '../i18n/LanguageContext';

const ACTIVE = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED'];

export const StageBadge: React.FC<{ stage: string }> = ({ stage }) => {
  const { language } = useLanguage();
  const stageLabels = getStageLabels(language === 'en' ? 'en' : 'vi');
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${STAGE_STYLES[stage] ?? 'bg-slate-100 text-slate-700'}`}>
      {stageLabels[stage] ?? stage}
    </span>
  );
};

export const ApplicationProgressTracker: React.FC<{ stage: string }> = ({ stage }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const candidateStages = isVi
    ? [
        { key: 'APPLIED', label: '1. Nộp hồ sơ' },
        { key: 'SCREENING', label: '2. Sàng lọc' },
        { key: 'INTERVIEW', label: '3. Phỏng vấn' },
        { key: 'OFFERED', label: '4. Offer' },
        { key: 'HIRED', label: '5. Đã tuyển' },
      ]
    : [
        { key: 'APPLIED', label: '1. Applied' },
        { key: 'SCREENING', label: '2. Screening' },
        { key: 'INTERVIEW', label: '3. Interview' },
        { key: 'OFFERED', label: '4. Offer' },
        { key: 'HIRED', label: '5. Hired' },
      ];
  const isRejected = stage === 'REJECTED';
  const isWithdrawn = stage === 'WITHDRAWN';
  const currentIndex = candidateStages.findIndex((s) => s.key === stage);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800" aria-label={isVi ? 'Tiến độ hồ sơ' : 'Application progress'}>
      <div className="relative">
        {/* Track Line */}
        <div className="absolute top-3 left-3 right-3 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isRejected ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
            style={{
              width: isWithdrawn
                ? '0%'
                : isRejected
                  ? `${Math.max(10, (activeIndex / (candidateStages.length - 1)) * 100)}%`
                  : `${(activeIndex / (candidateStages.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Nodes */}
        <div className="relative flex justify-between items-start">
          {candidateStages.map((s, idx) => {
            const isCompleted = !isRejected && !isWithdrawn && idx < activeIndex;
            const isCurrent = !isRejected && !isWithdrawn && idx === activeIndex;
            return (
              <div key={s.key} className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/30'
                        : isRejected && idx === activeIndex
                          ? 'bg-rose-500 text-white ring-4 ring-rose-400/30'
                          : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : isRejected && idx === activeIndex ? '✕' : idx + 1}
                </div>
                <span
                  className={`mt-1.5 text-[10px] font-bold whitespace-nowrap ${
                    isCurrent
                      ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                      : isCompleted
                        ? 'text-slate-700 dark:text-slate-300'
                        : isRejected && idx === activeIndex
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ApplicationRow: React.FC<{ app: Application; onWithdrawn: () => void }> = ({ app, onWithdrawn }) => {
  const toast = useToast();
  const { language } = useLanguage();
  const lang: 'vi' | 'en' = language === 'en' ? 'en' : 'vi';
  const isVi = lang === 'vi';
  const stageLabels = getStageLabels(lang);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const canWithdraw = WITHDRAWABLE_STAGES.includes(app.currentStage);
  const jobClosed = app.jobStatus !== 'PUBLISHED';

  useEffect(() => {
    if (app.currentStage === 'INTERVIEW') {
      interviewApi
        .listForApplication(app.id)
        .then(setInterviews)
        .catch(() => {});
    }
  }, [app.id, app.currentStage]);

  const withdraw = async () => {
    if (
      !window.confirm(
        isVi
          ? `Rút hồ sơ ứng tuyển vị trí "${app.jobTitle}"? Bạn có thể ứng tuyển lại sau nếu tin còn mở.`
          : `Withdraw your application for "${app.jobTitle}"? You can re-apply later if the position remains open.`
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      await applicationApi.withdraw(app.id);
      toast(isVi ? 'Đã rút hồ sơ' : 'Application withdrawn');
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
            <span>{isVi ? `Nộp ngày ${formatDate(app.appliedAt, 'vi')}` : `Applied on ${formatDate(app.appliedAt, 'en')}`}</span>
            {app.jobSalary && <span>{formatSalary(app.jobSalary, lang)}</span>}
            {app.cvTitle && <span>CV: {app.cvTitle}</span>}
            {jobClosed && <span className="text-slate-400">{isVi ? 'Tin đã đóng' : 'Position closed'}</span>}
          </div>
          <ApplicationProgressTracker stage={app.currentStage} />
          {interviews.length > 0 && (
            <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  {isVi
                    ? `Lịch phỏng vấn: Vòng ${interviews[0].roundNumber} (${interviews[0].title || 'Phỏng vấn'})`
                    : `Interview Schedule: Round ${interviews[0].roundNumber} (${interviews[0].title || 'Interview'})`}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 uppercase">
                  {interviews[0].status}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <strong>{isVi ? 'Thời gian:' : 'Time:'}</strong> {formatDateTime(interviews[0].scheduledStart, lang)}
                </span>
                <span className="flex items-center gap-1">
                  {interviews[0].format === 'ONLINE' ? (
                    <Video className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Building className="w-3.5 h-3.5 text-teal-600" />
                  )}
                  <strong>{interviews[0].format === 'ONLINE' ? (isVi ? 'Trực tuyến' : 'Online') : isVi ? 'Trực tiếp' : 'In-person'}:</strong>{' '}
                  {interviews[0].location ? (
                    interviews[0].location.startsWith('http') ? (
                      <a
                        href={interviews[0].location}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        {isVi ? 'Vào phòng họp' : 'Join meeting'} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      interviews[0].location
                    )
                  ) : isVi ? (
                    'Sẽ thông báo qua email'
                  ) : (
                    'To be sent via email'
                  )}
                </span>
              </div>
              {interviews[0].notesToCandidate && (
                <p className="text-slate-600 dark:text-slate-400 italic">
                  "{interviews[0].notesToCandidate}"
                </p>
              )}
            </div>
          )}
          {app.currentStage === 'REJECTED' && app.rejectionReason && (
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
              <span className="font-medium">{isVi ? 'Phản hồi từ nhà tuyển dụng: ' : 'Employer feedback: '}</span>
              {app.rejectionReason}
            </p>
          )}
          {error && (
            <div className="mt-2">
              <ErrorBox message={error} />
            </div>
          )}
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            <Link
              to={`/messages?applicationId=${app.id}`}
              className="text-sm font-bold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 hover:text-emerald-800"
            >
              <MessageSquare className="w-4 h-4" /> {isVi ? 'Nhắn tin với NTD' : 'Message Employer'}
            </Link>
            <button onClick={() => setOpen((o) => !o)} className="text-sm font-bold text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 hover:text-emerald-700" aria-expanded={open}>
              {isVi ? 'Lịch sử hồ sơ' : 'Application History'} {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {canWithdraw && (
              <button onClick={withdraw} disabled={busy} className="text-sm font-bold text-rose-600 dark:text-rose-400 hover:underline disabled:opacity-50">
                {busy ? (isVi ? 'Đang rút…' : 'Withdrawing…') : isVi ? 'Rút hồ sơ' : 'Withdraw'}
              </button>
            )}
          </div>
          {open && (
            <ol className="mt-4 border-l-2 border-emerald-200 dark:border-emerald-900 pl-4 space-y-3" data-testid="application-timeline">
              {timeline.length === 0 ? (
                <li className="text-sm text-slate-500">
                  {isVi ? 'Đã nộp hồ sơ' : 'Application submitted'} · {formatDateTime(app.appliedAt, lang)}
                </li>
              ) : (
                timeline.map((h, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      {h.fromStage ? (
                        <>
                          {isVi ? 'Chuyển sang ' : 'Moved to '}
                          <span className="font-semibold">{stageLabels[h.toStage] ?? h.toStage}</span>
                        </>
                      ) : isVi ? (
                        'Đã nộp hồ sơ'
                      ) : (
                        'Application submitted'
                      )}
                    </p>
                    {h.note && h.fromStage && <p className="text-xs text-slate-600 dark:text-slate-400">{h.note}</p>}
                    <p className="text-xs text-slate-400">{formatDateTime(h.createdAt, lang)}</p>
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
  const { language } = useLanguage();
  const isVi = language === 'vi';
  usePageTitle(isVi ? 'Việc đã ứng tuyển' : 'My Applications');
  const { applications, loading, refresh } = useMyApplications();
  const [filter, setFilter] = useState('all');
  const [loadedOnce, setLoadedOnce] = useState(false);

  const filters = isVi
    ? [
        { key: 'all', label: 'Tất cả' },
        { key: 'active', label: 'Đang xử lý' },
        { key: 'INTERVIEW', label: 'Phỏng vấn' },
        { key: 'OFFERED', label: 'Offer' },
        { key: 'closed', label: 'Đã kết thúc' },
      ]
    : [
        { key: 'all', label: 'All' },
        { key: 'active', label: 'In Progress' },
        { key: 'INTERVIEW', label: 'Interview' },
        { key: 'OFFERED', label: 'Offer' },
        { key: 'closed', label: 'Closed' },
      ];

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
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
        {isVi ? 'Việc đã ứng tuyển' : 'My Applications'}
      </h1>
      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {filters.map((f) => {
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
            title={
              applications.length === 0
                ? isVi
                  ? 'Bạn chưa ứng tuyển công việc nào'
                  : 'You have not applied to any jobs yet'
                : isVi
                  ? 'Không có hồ sơ ở trạng thái này'
                  : 'No applications in this status'
            }
            action={
              applications.length === 0 ? (
                <Link to="/jobs" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  {isVi ? 'Tìm việc làm' : 'Browse Jobs'}
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
