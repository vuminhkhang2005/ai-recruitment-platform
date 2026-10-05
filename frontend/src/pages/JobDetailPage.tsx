import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Briefcase, CalendarClock, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import { ApiError, companyApi, jobApi } from '../lib/api';
import type { Company, Job } from '../lib/types';
import { EXP_LEVELS, JOB_TYPES, daysLeft, formatDate, label, toLines } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { useMyApplications } from '../context/MyApplicationsContext';
import { useMatchScores } from '../lib/useMatchScores';
import { usePageTitle } from '../lib/usePageTitle';
import { CompanyAvatar, ErrorBox, PageLoader, Tag, btnPrimary } from '../components/ui/primitives';
import { JobCard, SaveJobButton } from '../components/jobs/JobCard';
import { ApplyModal } from '../components/jobs/ApplyModal';
import { NotFoundPage } from './NotFoundPage';

const Section: React.FC<{ title: string; text: string | null }> = ({ title, text }) => {
  const lines = toLines(text);
  if (!lines.length) return null;
  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
      {lines.length === 1 ? (
        <p className="text-sm leading-relaxed text-slate-700 selectable-text">{lines[0]}</p>
      ) : (
        <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-slate-700 selectable-text">
          {lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      )}
    </section>
  );
};

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
        <button disabled className={`${btnPrimary} w-full sm:w-auto bg-slate-400 hover:bg-slate-400`}>
          Đã ngừng nhận hồ sơ
        </button>
      );
    } else if (applied) {
      applyButton = (
        <Link to="/applications" className={`${btnPrimary} w-full sm:w-auto bg-blue-600 hover:bg-blue-700`}>
          Đã ứng tuyển · Xem trạng thái
        </Link>
      );
    } else {
      applyButton = (
        <button onClick={onApplyClick} className={`${btnPrimary} w-full sm:w-auto px-10 py-2.5`} data-testid="apply-button">
          Ứng tuyển
        </button>
      );
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
          <Link to={`/companies/${job.companyId}`} className="mt-1 inline-block text-slate-600 hover:text-red-600">
            {job.companyName}
          </Link>
          <p className="mt-3 text-lg font-semibold text-green-700">{job.salaryFormatted}</p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            {applyButton}
            {isCandidate || !isAuthenticated ? (
              <SaveJobButton job={job} withLabel className="px-4 py-2 border border-slate-300 rounded-md justify-center" />
            ) : null}
          </div>
          {applied && myApp && (
            <p className="mt-2 text-xs text-slate-500">Bạn đã nộp hồ sơ ngày {formatDate(myApp.appliedAt)}.</p>
          )}

          <dl className="mt-6 pt-5 border-t border-slate-100 grid gap-3 sm:grid-cols-2 text-sm text-slate-700">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
              <span>
                {job.locationAddress ? `${job.locationAddress}, ` : ''}
                {job.locationCity}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              {label(EXP_LEVELS, job.expLevel)} · {label(JOB_TYPES, job.jobType)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Đăng {job.postedTimeAgo.toLowerCase()}
            </div>
            {job.deadline && (
              <div className={`flex items-center gap-2 ${isOpen && left !== null && left <= 7 ? 'text-red-600 font-medium' : ''}`}>
                <CalendarClock className="w-4 h-4 text-slate-400" />
                Hạn nộp {formatDate(job.deadline)}
                {isOpen && left !== null ? ` (còn ${left} ngày)` : ''}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              {job.applicationsCount} người đã ứng tuyển
            </div>
          </dl>

          {job.skills.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-900 mb-2">Kỹ năng</p>
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
          <div className="mt-4 bg-white border border-slate-200 rounded-lg p-5" data-testid="match-panel">
            <p className="font-semibold text-slate-900">
              Hồ sơ của bạn khớp {match.score}% kỹ năng yêu cầu
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Tính từ danh sách kỹ năng trong hồ sơ của bạn so với kỹ năng của tin tuyển dụng.</p>
            <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-green-700 font-medium mb-1">Bạn đã có</p>
                <p className="text-slate-700">{match.matchedSkills.length ? match.matchedSkills.join(', ') : '—'}</p>
              </div>
              <div>
                <p className="text-amber-700 font-medium mb-1">Còn thiếu</p>
                <p className="text-slate-700">{match.missingSkills.length ? match.missingSkills.join(', ') : '—'}</p>
              </div>
            </div>
            <Link to="/profile#skills" className="mt-3 inline-block text-xs font-medium text-red-600 hover:underline">
              Cập nhật kỹ năng
            </Link>
          </div>
        )}

        <div className="mt-4 bg-white border border-slate-200 rounded-lg p-6 job-description-content">
          <Section title="Mô tả công việc" text={job.description} />
          <Section title="Yêu cầu" text={job.requirements} />
          <Section title="Quyền lợi" text={job.benefits} />
        </div>
      </div>

      <aside className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center gap-3">
            <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="lg" />
            <div className="min-w-0">
              <Link to={`/companies/${job.companyId}`} className="font-semibold text-slate-900 hover:text-red-600">
                {job.companyName}
              </Link>
              {company?.industry && <p className="text-xs text-slate-500 mt-0.5">{company.industry}</p>}
            </div>
          </div>
          {company && (
            <dl className="mt-4 space-y-2 text-sm">
              {company.companySize && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Quy mô</dt>
                  <dd className="text-slate-800 text-right">{company.companySize} nhân viên</dd>
                </div>
              )}
              {company.city && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Địa điểm</dt>
                  <dd className="text-slate-800 text-right">{company.city}</dd>
                </div>
              )}
              {company.website && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Website</dt>
                  <dd className="text-right">
                    <a href={company.website} target="_blank" rel="noreferrer" className="text-red-600 hover:underline inline-flex items-center gap-1">
                      {company.website.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          )}
          <Link to={`/companies/${job.companyId}`} className="mt-4 block text-center text-sm font-semibold text-red-600 border border-red-200 rounded-md py-2 hover:bg-red-50">
            Xem công ty
          </Link>
        </div>

        {related.length > 0 && (
          <div>
            <p className="font-semibold text-slate-900 mb-2">Việc làm khác tại {job.companyName}</p>
            <div className="space-y-3">
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
