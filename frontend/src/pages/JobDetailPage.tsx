import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Briefcase, CalendarClock, CheckCircle2, Clock, ExternalLink, MapPin, Send, Sparkles, Users } from 'lucide-react';
import { ApiError, companyApi, jobApi } from '../lib/api';
import type { Company, Job } from '../lib/types';
import { EXP_LEVELS, JOB_TYPES, daysLeft, formatDate, label, toLines } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { useMyApplications } from '../context/MyApplicationsContext';
import { useMatchScores } from '../lib/useMatchScores';
import { usePageTitle } from '../lib/usePageTitle';
import { CompanyAvatar, ErrorBox, PageLoader, Tag, cardCls } from '../components/ui/primitives';
import { JobCard, SaveJobButton } from '../components/jobs/JobCard';
import { ApplyModal } from '../components/jobs/ApplyModal';
import { NotFoundPage } from './NotFoundPage';

const Section: React.FC<{ title: string; text: string | null }> = ({ title, text }) => {
  const lines = toLines(text);
  if (!lines.length) return null;
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="flex items-center gap-2.5 text-lg font-black text-slate-900 dark:text-white mb-3">
        <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
        {title}
      </h2>
      {lines.length === 1 ? (
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 selectable-text">{lines[0]}</p>
      ) : (
        <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 selectable-text">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const ctaBase = 'inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold w-full sm:w-auto transition-all';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isCandidate, isRecruiter } = useAuth();
  const { appliedJobIds, applications } = useMyApplications();
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [related, setRelated] = useState<Job[]>([]);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const scores = useMatchScores(job ? [job.id] : []);
  const match = job ? scores[job.id] : undefined;

  usePageTitle(job ? `${job.title} - ${job.companyName}` : 'Chi tiết việc làm');

  useEffect(() => {
    let active = true;
    setJob(null);
    setError(null);
    jobApi
      .get(id!)
      .then((j) => {
        if (!active) return;
        setJob(j);
        companyApi.get(j.companyId).then((c) => active && setCompany(c)).catch(() => undefined);
        companyApi
          .jobs(j.companyId)
          .then((list) => active && setRelated(list.filter((x) => x.id !== j.id).slice(0, 3)))
          .catch(() => undefined);
      })
      .catch((e: ApiError) => active && setError({ status: e.status, message: e.message }));
    return () => {
      active = false;
    };
  }, [id]);

  if (error?.status === 404 || error?.status === 400) return <NotFoundPage message="Tin tuyển dụng không tồn tại hoặc đã bị gỡ." />;
  if (error)
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <ErrorBox message={error.message} />
      </div>
    );
  if (!job) return <PageLoader />;

  const left = daysLeft(job.deadline);
  const isOpen = job.status === 'PUBLISHED' && (left === null || left >= 0);
  const applied = appliedJobIds.has(job.id);
  const myApp = applications.find((a) => a.jobId === job.id);

  const onApplyClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setApplyOpen(true);
  };

  let applyButton: React.ReactNode = null;
  if (!isRecruiter) {
    if (!isOpen) {
      applyButton = (
        <button disabled className={`${ctaBase} bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed`}>
          Đã ngừng nhận hồ sơ
        </button>
      );
    } else if (applied) {
      applyButton = (
        <Link
          to="/applications"
          className={`${ctaBase} bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 hover:border-sky-400`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Đã ứng tuyển · Xem trạng thái
        </Link>
      );
    } else {
      applyButton = (
        <button
          onClick={onApplyClick}
          className={`${ctaBase} bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-soft active:scale-[0.98]`}
          data-testid="apply-button"
        >
          <Send className="w-4 h-4" />
          Ứng tuyển
        </button>
      );
    }
  }

  const metaItem = 'flex items-start gap-2.5';
  const metaIcon = 'w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <div className={`${cardCls} relative overflow-hidden p-6 sm:p-8`}>
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <div className="flex items-start gap-4">
            <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">{job.title}</h1>
              <Link
                to={`/companies/${job.companyId}`}
                className="mt-1.5 inline-flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {job.companyName}
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-sm border border-emerald-200/90 dark:border-emerald-800/60">
                  {job.salaryFormatted}
                </span>
                {job.urgent && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-xs font-extrabold">
                    Tuyển gấp
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
            {applyButton}
            {isCandidate || !isAuthenticated ? (
              <SaveJobButton
                job={job}
                withLabel
                className="px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl justify-center hover:border-emerald-400"
              />
            ) : null}
          </div>
          {applied && myApp && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Bạn đã nộp hồ sơ ngày {formatDate(myApp.appliedAt)}.</p>
          )}

          <dl className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid gap-4 sm:grid-cols-2 text-sm text-slate-700 dark:text-slate-300">
            <div className={metaItem}>
              <span className={metaIcon}>
                <MapPin className="w-4 h-4" />
              </span>
              <span className="pt-1.5">
                {job.locationAddress ? `${job.locationAddress}, ` : ''}
                {job.locationCity}
              </span>
            </div>
            <div className={metaItem}>
              <span className={metaIcon}>
                <Briefcase className="w-4 h-4" />
              </span>
              <span className="pt-1.5">
                {label(EXP_LEVELS, job.expLevel)} · {label(JOB_TYPES, job.jobType)}
              </span>
            </div>
            <div className={metaItem}>
              <span className={metaIcon}>
                <Clock className="w-4 h-4" />
              </span>
              <span className="pt-1.5">Đăng {job.postedTimeAgo.toLowerCase()}</span>
            </div>
            {job.deadline && (
              <div className={metaItem}>
                <span className={metaIcon}>
                  <CalendarClock className="w-4 h-4" />
                </span>
                <span className={`pt-1.5 ${isOpen && left !== null && left <= 7 ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}`}>
                  Hạn nộp {formatDate(job.deadline)}
                  {isOpen && left !== null ? ` (còn ${left} ngày)` : ''}
                </span>
              </div>
            )}
            <div className={metaItem}>
              <span className={metaIcon}>
                <Users className="w-4 h-4" />
              </span>
              <span className="pt-1.5">{job.applicationsCount} người đã ứng tuyển</span>
            </div>
          </dl>

          {job.skills.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">Kỹ năng</p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <Tag key={s} to={`/jobs?q=${encodeURIComponent(s)}`}>
                    {s}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>

        {match && match.score !== null && (
          <div
            className="mt-5 rounded-3xl p-6 border border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900"
            data-testid="match-panel"
          >
            <p className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Hồ sơ của bạn khớp {match.score}% kỹ năng yêu cầu
            </p>
            <div className="mt-3 h-2 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${match.score}%` }} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Tính từ danh sách kỹ năng trong hồ sơ của bạn so với kỹ năng của tin tuyển dụng.
            </p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-emerald-200/70 dark:border-emerald-900/60 p-3">
                <p className="text-emerald-700 dark:text-emerald-400 font-bold mb-1">Bạn đã có</p>
                <p className="text-slate-700 dark:text-slate-300">{match.matchedSkills.length ? match.matchedSkills.join(', ') : '—'}</p>
              </div>
              <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/70 dark:border-amber-900/60 p-3">
                <p className="text-amber-700 dark:text-amber-400 font-bold mb-1">Còn thiếu</p>
                <p className="text-slate-700 dark:text-slate-300">{match.missingSkills.length ? match.missingSkills.join(', ') : '—'}</p>
              </div>
            </div>
            <Link to="/profile#skills" className="mt-4 inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              Cập nhật kỹ năng →
            </Link>
          </div>
        )}

        <div className={`${cardCls} mt-5 p-6 sm:p-8 job-description-content`}>
          <Section title="Mô tả công việc" text={job.description} />
          <Section title="Yêu cầu" text={job.requirements} />
          <Section title="Quyền lợi" text={job.benefits} />
        </div>
      </div>

      <aside className="space-y-5">
        <div className={`${cardCls} p-6`}>
          <div className="flex items-center gap-3">
            <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="md" />
            <div className="min-w-0">
              <Link
                to={`/companies/${job.companyId}`}
                className="font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {job.companyName}
              </Link>
              {company?.industry && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{company.industry}</p>}
            </div>
          </div>
          {company && (
            <dl className="mt-5 space-y-2.5 text-sm">
              {company.companySize && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500 dark:text-slate-400">Quy mô</dt>
                  <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">{company.companySize} nhân viên</dd>
                </div>
              )}
              {company.city && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500 dark:text-slate-400">Địa điểm</dt>
                  <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">{company.city}</dd>
                </div>
              )}
              {company.website && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500 dark:text-slate-400">Website</dt>
                  <dd className="text-right min-w-0">
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 break-all"
                    >
                      {company.website.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          )}
          <Link
            to={`/companies/${job.companyId}`}
            className="mt-5 block text-center text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl py-2.5 hover:border-emerald-400 transition-colors"
          >
            Xem công ty
          </Link>
        </div>

        {related.length > 0 && (
          <div>
            <p className="font-black text-slate-900 dark:text-white mb-3">Việc làm khác tại {job.companyName}</p>
            <div className="space-y-4">
              {related.map((j) => (
                <JobCard key={j.id} job={j} applied={appliedJobIds.has(j.id)} />
              ))}
            </div>
          </div>
        )}
      </aside>

      {applyOpen && <ApplyModal job={job} onClose={() => setApplyOpen(false)} onApplied={() => setApplyOpen(false)} />}
    </div>
  );
};
