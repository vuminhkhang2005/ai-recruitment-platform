import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, MapPin, Users, Building2 } from 'lucide-react';
import { ApiError, companyApi } from '../lib/api';
import type { Company, Job } from '../lib/types';
import { CompanyAvatar, EmptyState, ErrorBox, PageLoader } from '../components/ui/primitives';
import { JobCard } from '../components/jobs/JobCard';
import { useMatchScores } from '../lib/useMatchScores';
import { useMyApplications } from '../context/MyApplicationsContext';
import { usePageTitle } from '../lib/usePageTitle';
import { NotFoundPage } from './NotFoundPage';

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const scores = useMatchScores(jobs?.map((j) => j.id) ?? []);
  const { appliedJobIds } = useMyApplications();
  usePageTitle(company?.name ?? 'Công ty');

  useEffect(() => {
    setCompany(null);
    setJobs(null);
    setError(null);
    companyApi.get(id!).then(setCompany).catch(setError);
    companyApi.jobs(id!).then(setJobs).catch(() => setJobs([]));
  }, [id]);

  if (error && (error.status === 404 || error.status === 400)) return <NotFoundPage message="Công ty không tồn tại." />;
  if (error)
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <ErrorBox message={error.message} />
      </div>
    );
  if (!company) return <PageLoader />;

  return (
    <>
      <section className="bg-gradient-to-b from-[#121212] to-[#2a1214] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row sm:items-center gap-5">
          <CompanyAvatar name={company.name} logoUrl={company.logoUrl} size="xl" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{company.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-300">
              {company.city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {company.city}
                </span>
              )}
              {company.industry && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {company.industry}
                </span>
              )}
              {company.companySize && (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {company.companySize} nhân viên
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 order-2 lg:order-1">
          <h2 className="text-xl font-bold text-slate-900 mb-4">{jobs ? `${jobs.length} việc làm đang tuyển` : 'Việc làm đang tuyển'}</h2>
          {!jobs ? (
            <PageLoader />
          ) : jobs.length === 0 ? (
            <EmptyState title="Công ty hiện chưa có tin tuyển dụng nào đang mở." />
          ) : (
            <div className="space-y-3">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} match={scores[j.id]} applied={appliedJobIds.has(j.id)} />
              ))}
            </div>
          )}
        </div>

        <aside className="order-1 lg:order-2 bg-white border border-slate-200 rounded-lg p-5 h-fit">
          <h2 className="font-bold text-slate-900">Giới thiệu công ty</h2>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed selectable-text">{company.description || 'Công ty chưa cập nhật phần giới thiệu.'}</p>
          {company.address && (
            <p className="mt-4 text-sm text-slate-600">
              <span className="font-medium text-slate-800">Địa chỉ: </span>
              {company.address}
              {company.city ? `, ${company.city}` : ''}
            </p>
          )}
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-red-600 hover:underline">
              {company.website.replace(/^https?:\/\//, '')} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </aside>
      </div>
    </>
  );
};
