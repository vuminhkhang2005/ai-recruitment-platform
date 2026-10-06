import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, CheckCircle2, ChevronRight, Clock, Flame, MapPin, Send, Sparkles, Users } from 'lucide-react';
import type { Job, MatchScore } from '../../lib/types';
import { EXP_LEVELS, JOB_TYPES, daysLeft, label } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import { useSavedJobs } from '../../lib/savedJobs';
import { useToast } from '../../context/ToastContext';
import { CompanyAvatar } from '../ui/primitives';

export const SaveJobButton: React.FC<{ job: Job; className?: string; withLabel?: boolean }> = ({ job, className = '', withLabel }) => {
  const { isAuthenticated, isCandidate } = useAuth();
  const { isSaved, toggle } = useSavedJobs();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const saved = isSaved(job.id);

  if (isAuthenticated && !isCandidate) return null;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    const nowSaved = toggle(job);
    toast(nowSaved ? 'Đã lưu việc làm' : 'Đã bỏ lưu việc làm', 'info');
  };

  return (
    <button
      onClick={onClick}
      aria-label={saved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center gap-1.5 text-sm rounded-xl transition-colors ${
        withLabel ? '' : 'p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
      } ${saved ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'} ${className}`}
    >
      {saved ? <BookmarkCheck className="w-5 h-5 fill-emerald-600/20" /> : <Bookmark className="w-5 h-5" />}
      {withLabel && <span className="font-bold">{saved ? 'Đã lưu' : 'Lưu tin'}</span>}
    </button>
  );
};

export const MatchBadge: React.FC<{ match?: MatchScore }> = ({ match }) => {
  if (!match || match.score === null || match.score === undefined) return null;
  const color =
    match.score >= 70
      ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-500 border-transparent'
      : match.score >= 40
        ? 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800/60'
        : 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700';
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-lg border ${color}`}
      title={`Khớp ${match.matchedSkills.length} kỹ năng với hồ sơ của bạn`}
    >
      <Sparkles className="w-3 h-3" />
      Khớp {match.score}% kỹ năng
    </span>
  );
};

export interface JobCardProps {
  job: Job;
  match?: MatchScore;
  applied?: boolean;
  selected?: boolean;
  compact?: boolean;
  preserveSearch?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  match,
  applied,
  selected = false,
  compact = false,
  preserveSearch = false,
  onClick,
}) => {
  const location = useLocation();
  const left = daysLeft(job.deadline);
  const chip = 'px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300';
  const targetTo = preserveSearch ? `/jobs/${job.id}${location.search}` : `/jobs/${job.id}`;
  if (compact) {
    return (
      <Link
        to={targetTo}
        onClick={onClick}
        className={`group flex flex-col relative transition-all duration-200 cursor-pointer p-3 sm:p-3.5 rounded-2xl ${
          selected
            ? 'border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-[0_6px_20px_-4px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/20'
            : 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 hover:border-emerald-400 dark:hover:border-emerald-500/60 hover:shadow-soft-xs hover:-translate-y-0.5'
        }`}
        data-testid="job-card"
        data-testid-id={`job-card-${job.id}`}
      >
        {selected && <div className="absolute left-0 top-2.5 bottom-2.5 w-1.5 bg-emerald-500 rounded-r-full" />}
        <div className="flex items-start gap-2.5">
          <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                <span className="truncate">{job.companyName}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              </p>
              <SaveJobButton job={job} className="shrink-0 -mt-1 -mr-1" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mt-0.5">
              {job.title}
            </h3>

            {/* Salary + Location row */}
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/70 dark:border-emerald-800/60">
                {job.salaryFormatted}
              </span>
              {job.locationCity && (
                <span className="text-slate-500 dark:text-slate-400 truncate flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {job.locationCity}
                </span>
              )}
              {job.jobType && (
                <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">
                  • {label(JOB_TYPES, job.jobType)}
                </span>
              )}
            </div>

            {/* Skills pills */}
            {job.skills.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {job.skills.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                  >
                    {s}
                  </span>
                ))}
                {job.skills.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{job.skills.length - 3}</span>
                )}
              </div>
            )}

            {/* Badges / Match score footer */}
            <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 truncate">
                {job.urgent && (
                  <span className="text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-0.5">
                    <Flame className="w-3 h-3" /> Tuyển gấp
                  </span>
                )}
                {applied && <span className="text-sky-600 font-bold">Đã nộp</span>}
                <MatchBadge match={match} />
                <span>{job.postedTimeAgo}</span>
                {left !== null && left >= 0 && (
                  <span className="text-amber-600 dark:text-amber-400 font-bold">• Còn {left} ngày</span>
                )}
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 shrink-0 text-[11px]">
                Chi tiết <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={targetTo}
      onClick={onClick}
      className={`group flex flex-col relative transition-all duration-200 cursor-pointer p-6 rounded-3xl ${
        selected
          ? 'border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-[0_6px_20px_-4px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/20'
          : 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 hover:border-emerald-400 dark:hover:border-emerald-500/60 hover:shadow-[0_12px_35px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-0.5'
      }`}
      data-testid="job-card"
      data-testid-id={`job-card-${job.id}`}
    >
      {selected && <div className="absolute left-0 top-2.5 bottom-2.5 w-1.5 bg-emerald-500 rounded-r-full" />}
      <div className="flex items-start gap-2.5">
        <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size={compact ? 'sm' : 'sm'} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
            <span className="truncate">{job.companyName}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {job.postedTimeAgo}
            </span>
            {left !== null && left >= 0 && <span className="font-bold text-amber-600 dark:text-amber-400">Còn {left} ngày</span>}
          </p>
        </div>
        <SaveJobButton job={job} className="shrink-0 -mt-1 -mr-1" />
      </div>

      <div className={`${compact ? 'mt-2' : 'mt-3'} flex flex-wrap items-center gap-1.5 empty:hidden`}>
        {job.urgent && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-[11px] font-extrabold">
            <Flame className="w-3 h-3" />
            Tuyển gấp
          </span>
        )}
        {applied && (
          <span className="px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/60 text-[11px] font-extrabold">
            Đã ứng tuyển
          </span>
        )}
        <MatchBadge match={match} />
      </div>

      <h3
        className={`${
          compact ? 'mt-1.5 text-sm sm:text-base font-bold line-clamp-1' : 'mt-3 text-lg font-black line-clamp-2'
        } text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors`}
      >
        {job.title}
      </h3>

      <div className={`${compact ? 'mt-2' : 'mt-3'} flex flex-wrap items-center gap-1.5`}>
        <span
          className={`${
            compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'
          } rounded-lg bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black border border-emerald-200/90 dark:border-emerald-800/60`}
        >
          {job.salaryFormatted}
        </span>
        {job.jobType && <span className={compact ? 'px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300' : chip}>{label(JOB_TYPES, job.jobType)}</span>}
        {job.expLevel && <span className={compact ? 'px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300' : chip}>{label(EXP_LEVELS, job.expLevel)}</span>}
      </div>

      {job.locationCity && (
        <p className={`${compact ? 'mt-1.5 text-xs' : 'mt-3 text-sm'} flex items-center gap-1.5 text-slate-500 dark:text-slate-400`}>
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{job.locationCity}</span>
        </p>
      )}

      {job.skills.length > 0 && (
        <div className={`${compact ? 'mt-2 gap-1' : 'mt-3 gap-1.5'} flex flex-wrap`}>
          {job.skills.slice(0, compact ? 3 : 3).map((s) => (
            <span
              key={s}
              className={`${
                compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
              } rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300`}
            >
              {s}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className={`${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-1.5 py-1 text-xs'} text-slate-400`}>
              +{job.skills.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-3">
        <div className={`${compact ? 'pt-2' : 'pt-4'} border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2`}>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 min-w-0">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{job.applicationsCount} ứng tuyển</span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            {!compact && !applied && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-bold shadow-soft-xs transition-colors">
                <Send className="w-3 h-3" />
                Ứng tuyển
              </span>
            )}
            <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              Chi tiết
              <ChevronRight className="w-3 h-3" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
};
