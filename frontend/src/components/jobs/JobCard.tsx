import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, MapPin, Briefcase, Clock } from 'lucide-react';
import type { Job, MatchScore } from '../../lib/types';
import { EXP_LEVELS, JOB_TYPES, daysLeft, label } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import { useSavedJobs } from '../../lib/savedJobs';
import { useToast } from '../../context/ToastContext';
import { CompanyAvatar, Tag } from '../ui/primitives';

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
      className={`inline-flex items-center gap-1.5 text-sm ${saved ? 'text-red-600' : 'text-slate-400 hover:text-red-600'} ${className}`}
    >
      {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
      {withLabel && <span className="font-medium">{saved ? 'Đã lưu' : 'Lưu tin'}</span>}
    </button>
  );
};

export const MatchBadge: React.FC<{ match?: MatchScore }> = ({ match }) => {
  if (!match || match.score === null || match.score === undefined) return null;
  const color = match.score >= 70 ? 'text-green-700 bg-green-50' : match.score >= 40 ? 'text-amber-700 bg-amber-50' : 'text-slate-600 bg-slate-100';
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded ${color}`}
      title={`Khớp ${match.matchedSkills.length} kỹ năng với hồ sơ của bạn`}
    >
      Khớp {match.score}% kỹ năng
    </span>
  );
};

export const JobCard: React.FC<{ job: Job; match?: MatchScore; applied?: boolean }> = ({ job, match, applied }) => {
  const left = daysLeft(job.deadline);
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-red-300 hover:shadow-sm transition"
      data-testid="job-card"
    >
      <div className="flex gap-4">
        <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">{job.title}</h3>
              <p className="text-sm text-slate-600 mt-0.5 truncate">{job.companyName}</p>
            </div>
            <SaveJobButton job={job} className="shrink-0 mt-0.5" />
          </div>
          <p className="mt-2 text-sm font-semibold text-green-700">{job.salaryFormatted}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            {job.locationCity && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.locationCity}
              </span>
            )}
            {job.expLevel && (
              <span className="inline-flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {label(EXP_LEVELS, job.expLevel)}
                {job.jobType && job.jobType !== 'FULL_TIME' ? ` · ${label(JOB_TYPES, job.jobType)}` : ''}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {job.postedTimeAgo}
            </span>
          </div>
          {job.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.skills.slice(0, 5).map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 empty:hidden">
            {applied && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">Đã ứng tuyển</span>}
            <MatchBadge match={match} />
            {left !== null && left >= 0 && left <= 7 && (
              <span className="text-xs font-medium text-red-600">Còn {left} ngày để ứng tuyển</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
