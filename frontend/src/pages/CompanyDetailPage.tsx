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
import { useLanguage } from '../i18n/LanguageContext';
import { NotFoundPage } from './NotFoundPage';

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const scores = useMatchScores(jobs?.map((j) => j.id) ?? []);
  const { appliedJobIds } = useMyApplications();
  usePageTitle(company?.name ?? (isVi ? 'Công ty' : 'Company'));

  useEffect(() => {
    setCompany(null);
    setJobs(null);
    setError(null);
    companyApi.get(id!).then(setCompany).catch(setError);
    companyApi.jobs(id!).then(setJobs).catch(() => setJobs([]));
  }, [id]);

  if (error && (error.status === 404 || error.status === 400)) {
    return <NotFoundPage message={isVi ? "Công ty không tồn tại." : "Company not found."} />;
  }
  if (error)
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <ErrorBox message={error.message} />
      </div>
    );
  if (!company) return <PageLoader />;

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-soft-sm">
          <div className="relative h-28 sm:h-36 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
            <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:14px_14px]" />
          </div>
          <div className="relative px-5 sm:px-8 pb-6 flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-[1.4rem] shadow-soft w-fit shrink-0">
              <CompanyAvatar name={company.name} logoUrl={company.logoUrl} size="xl" />
            </div>
            <div className="min-w-0 sm:pb-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{company.name}</h1>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {company.city && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    {company.city}
                  </span>
                )}
                {company.industry && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    {company.industry}
                  </span>
                )}
                {company.companySize && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-500" />
                    {company.companySize} {isVi ? 'nhân viên' : 'employees'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 order-2 lg:order-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-5">
            {jobs
              ? (isVi ? `${jobs.length} việc làm đang tuyển` : `${jobs.length} open jobs hiring`)
              : (isVi ? 'Việc làm đang tuyển' : 'Open jobs')}
          </h2>
          {!jobs ? (
            <PageLoader />
          ) : jobs.length === 0 ? (
            <EmptyState title={isVi ? "Công ty hiện chưa có tin tuyển dụng nào đang mở." : "No open job listings for this company at the moment."} />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} match={scores[j.id]} applied={appliedJobIds.has(j.id)} />
              ))}
            </div>
          )}
        </div>

        <aside className="order-1 lg:order-2 bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 h-fit shadow-soft-xs">
          <h2 className="flex items-center gap-2.5 font-black text-slate-900 dark:text-white">
            <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
            {isVi ? 'Giới thiệu công ty' : 'About Company'}
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed selectable-text">
            {company.description || (isVi ? 'Công ty chưa cập nhật phần giới thiệu.' : 'No company introduction provided yet.')}
          </p>
          {company.address && (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-800 dark:text-slate-200">{isVi ? 'Địa chỉ: ' : 'Address: '}</span>
              {company.address}
              {company.city ? `, ${company.city}` : ''}
            </p>
          )}
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              {company.website.replace(/^https?:\/\//, '')} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </aside>
      </div>
    </>
  );
};
