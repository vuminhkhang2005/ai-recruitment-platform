import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Send,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
import type { Company, Job, MatchScore } from '../../lib/types';
import { EXP_LEVELS, JOB_TYPES, daysLeft, formatDate, formatSalary, getExpLevels, getJobTypes, label, timeAgo, toLines } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import { useMyApplications } from '../../context/MyApplicationsContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { CompanyAvatar, Tag, cardCls } from '../ui/primitives';
import { SaveJobButton } from './JobCard';
import { ApplyModal } from './ApplyModal';

export const Section: React.FC<{ title: string; text: string | null }> = ({ title, text }) => {
  const lines = toLines(text);
  if (!lines.length) return null;
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white mb-2.5">
        <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
        {title}
      </h2>
      {lines.length === 1 ? (
        <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 selectable-text">{lines[0]}</p>
      ) : (
        <ul className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 selectable-text">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const ctaBase = 'inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold w-full sm:w-auto transition-all cursor-pointer';

export interface JobDetailPanelProps {
  job: Job;
  company: Company | null;
  match?: MatchScore;
  onApplied?: () => void;
  standalone?: boolean;
}

export const JobDetailPanel: React.FC<JobDetailPanelProps> = ({
  job,
  company,
  match,
  onApplied,
  standalone = false,
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isCandidate, isRecruiter } = useAuth();
  const { appliedJobIds, applications } = useMyApplications();
  const [applyOpen, setApplyOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const left = daysLeft(job.deadline);
  const isOpen = job.status === 'PUBLISHED' && (left === null || left >= 0);
  const applied = appliedJobIds.has(job.id);
  const myApp = applications.find((a) => a.jobId === job.id);
  const expLevels = getExpLevels(language);
  const jobTypes = getJobTypes(language);
  const salaryDisplay = formatSalary(job.salaryFormatted, language);
  const postedText = timeAgo(job.createdAt, language) || job.postedTimeAgo;

  const onApplyClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    setApplyOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.origin + `/jobs/${job.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let applyButton: React.ReactNode = null;
  if (!isRecruiter) {
    if (!isOpen) {
      applyButton = (
        <button disabled className={`${ctaBase} bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed`}>
          {language === 'vi' ? 'Đã ngừng nhận hồ sơ' : 'Applications Closed'}
        </button>
      );
    } else if (applied) {
      applyButton = (
        <Link
          to="/applications"
          className={`${ctaBase} bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 hover:border-sky-400`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {language === 'vi' ? 'Đã ứng tuyển · Xem trạng thái' : 'Applied · View Status'}
        </Link>
      );
    } else {
      applyButton = (
        <button
          onClick={onApplyClick}
          className={`${ctaBase} bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-soft active:scale-[0.98]`}
          data-testid="apply-button"
        >
          <Send className="w-3.5 h-3.5" />
          {language === 'vi' ? 'Ứng tuyển ngay' : 'Apply Now'}
        </button>
      );
    }
  }

  const metaItem = 'flex items-start gap-2';
  const metaIcon = 'w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5';

  return (
    <div className={`flex flex-col bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-sm overflow-hidden ${standalone ? '' : 'h-full'}`}>
      {/* Sticky Header inside panel */}
      <div className="relative p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 shrink-0">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="md" />
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-snug">
                {job.title}
              </h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <Link
                  to={`/companies/${job.companyId}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span className="truncate">{job.companyName}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                </Link>
                {company?.industry && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{company.industry}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              title={language === 'vi' ? 'Sao chép liên kết việc làm' : 'Share job link'}
              aria-label={language === 'vi' ? 'Chia sẻ việc làm' : 'Share job'}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer relative"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied && (
                <span className="absolute -bottom-7 right-0 text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow-soft-sm whitespace-nowrap z-20 animate-fade-in">
                  {language === 'vi' ? 'Đã chép link!' : 'Copied link!'}
                </span>
              )}
            </button>
            <SaveJobButton
              job={job}
              className="p-1.5 sm:p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-400"
            />
          </div>
        </div>

        {/* Salary & Highlights Row */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-black text-xs border border-emerald-300/80 dark:border-emerald-800/80">
            {salaryDisplay}
          </span>
          {job.urgent && (
            <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-[11px] font-extrabold">
              {language === 'vi' ? 'Tuyển gấp' : 'Urgent'}
            </span>
          )}
          {job.jobType && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
              {label(jobTypes, job.jobType)}
            </span>
          )}
          {job.expLevel && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
              {label(expLevels, job.expLevel)}
            </span>
          )}
        </div>

        {/* CTAs row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {applyButton}
          {isCandidate || !isAuthenticated ? (
            <SaveJobButton
              job={job}
              withLabel
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl justify-center hover:border-emerald-400 text-xs font-bold"
            />
          ) : null}
        </div>
        {applied && myApp && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {language === 'vi'
              ? `Bạn đã nộp hồ sơ ngày ${formatDate(myApp.appliedAt, 'vi')}.`
              : `You applied for this job on ${formatDate(myApp.appliedAt, 'en')}.`}
          </p>
        )}
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
        {/* Quick Meta Grid */}
        <dl className="grid gap-2 sm:grid-cols-2 text-xs text-slate-700 dark:text-slate-300 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <div className={metaItem}>
            <span className={metaIcon}>
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <span className="pt-0.5">
              {job.locationAddress ? `${job.locationAddress}, ` : ''}
              {job.locationCity}
            </span>
          </div>
          <div className={metaItem}>
            <span className={metaIcon}>
              <Briefcase className="w-3.5 h-3.5" />
            </span>
            <span className="pt-0.5">
              {label(expLevels, job.expLevel)} · {label(jobTypes, job.jobType)}
            </span>
          </div>
          <div className={metaItem}>
            <span className={metaIcon}>
              <Clock className="w-3.5 h-3.5" />
            </span>
            <span className="pt-0.5">
              {language === 'vi' ? `Đăng ${postedText.toLowerCase()}` : `Posted ${postedText}`}
            </span>
          </div>
          {job.deadline && (
            <div className={metaItem}>
              <span className={metaIcon}>
                <CalendarClock className="w-3.5 h-3.5" />
              </span>
              <span className={`pt-0.5 ${isOpen && left !== null && left <= 7 ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}`}>
                {language === 'vi' ? `Hạn nộp ${formatDate(job.deadline, 'vi')}` : `Deadline: ${formatDate(job.deadline, 'en')}`}
                {isOpen && left !== null ? (language === 'vi' ? ` (còn ${left} ngày)` : ` (${left}d left)`) : ''}
              </span>
            </div>
          )}
          <div className={`${metaItem} sm:col-span-2`}>
            <span className={metaIcon}>
              <Users className="w-3.5 h-3.5" />
            </span>
            <span className="pt-0.5">
              {job.applicationsCount} {language === 'vi' ? 'người đã ứng tuyển cho vị trí này' : 'applicant(s) for this position'}
            </span>
          </div>
        </dl>

        {/* AI Match Panel */}
        {match && match.score !== null && (
          <div
            className="rounded-2xl p-4 border border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 shadow-soft-xs"
            data-testid="match-panel"
          >
            <p className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              {language === 'vi'
                ? `Hồ sơ của bạn khớp ${match.score}% kỹ năng yêu cầu`
                : `Your profile matches ${match.score}% of required skills`}
            </p>
            <div className="mt-2.5 h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${match.score}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              {language === 'vi'
                ? 'Tính từ danh sách kỹ năng trong hồ sơ của bạn so với kỹ năng của tin tuyển dụng.'
                : 'Calculated by comparing skills from your profile against this job opening.'}
            </p>
            <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-emerald-200/70 dark:border-emerald-900/60 p-2.5">
                <p className="text-emerald-700 dark:text-emerald-400 font-bold mb-0.5">
                  {language === 'vi' ? 'Bạn đã có' : 'Matched Skills'}
                </p>
                <p className="text-slate-700 dark:text-slate-300">{match.matchedSkills.length ? match.matchedSkills.join(', ') : '—'}</p>
              </div>
              <div className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/70 dark:border-amber-900/60 p-2.5">
                <p className="text-amber-700 dark:text-amber-400 font-bold mb-0.5">
                  {language === 'vi' ? 'Còn thiếu' : 'Missing Skills'}
                </p>
                <p className="text-slate-700 dark:text-slate-300">{match.missingSkills.length ? match.missingSkills.join(', ') : '—'}</p>
              </div>
            </div>
            <Link to="/profile#skills" className="mt-2.5 inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              {language === 'vi' ? 'Cập nhật kỹ năng →' : 'Update your skills →'}
            </Link>
          </div>
        )}

        {/* Structured Job Description Content */}
        <div className={`${cardCls} p-4 sm:p-5 job-description-content`}>
          <Section title={language === 'vi' ? 'Mô tả công việc' : 'Job Description'} text={job.description} />
          <Section title={language === 'vi' ? 'Yêu cầu' : 'Requirements'} text={job.requirements} />
          <Section title={language === 'vi' ? 'Quyền lợi' : 'Benefits & Perks'} text={job.benefits} />
        </div>

        {/* Required Skills Tags */}
        {job.skills.length > 0 && (
          <div className={`${cardCls} p-4`}>
            <h2 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white mb-2.5">
              <span className="w-1.5 h-3.5 rounded-full bg-emerald-500" />
              {language === 'vi' ? 'Kỹ năng chuyên môn' : 'Required Skills'}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((s) => (
                <Tag key={s} to={`/jobs?q=${encodeURIComponent(s)}`}>
                  {s}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Company Overview Card */}
        <div className={`${cardCls} p-4`}>
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
            <dl className="mt-4 space-y-2 text-xs sm:text-sm">
              {company.companySize && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500 dark:text-slate-400">{language === 'vi' ? 'Quy mô' : 'Company Size'}</dt>
                  <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                    {company.companySize} {language === 'vi' ? 'nhân viên' : 'employees'}
                  </dd>
                </div>
              )}
              {company.city && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500 dark:text-slate-400">{language === 'vi' ? 'Địa điểm' : 'Location'}</dt>
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
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              to={`/companies/${job.companyId}`}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              {language === 'vi' ? 'Xem trang công ty & cơ hội khác →' : 'View Company Profile & Open Roles →'}
            </Link>
          </div>
        </div>

        {/* Bottom Apply Banner */}
        {!applied && isOpen && !isRecruiter && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'vi' ? 'Sẵn sàng ứng tuyển cho vị trí này?' : 'Ready to apply for this position?'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'vi'
                  ? 'Hồ sơ của bạn sẽ được gửi trực tiếp tới nhà tuyển dụng.'
                  : 'Your profile and application will be submitted directly to the employer.'}
              </p>
            </div>
            <button
              onClick={onApplyClick}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft transition-all shrink-0 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {language === 'vi' ? 'Ứng tuyển ngay' : 'Apply Now'}
            </button>
          </div>
        )}
      </div>

      {applyOpen && (
        <ApplyModal
          job={job}
          onClose={() => setApplyOpen(false)}
          onApplied={() => {
            setApplyOpen(false);
            onApplied?.();
          }}
        />
      )}
    </div>
  );
};
