import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  PauseCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import type { AdminCompany, AdminJob } from '../../lib/types';
import { ErrorBox, PageLoader, inputCls } from '../../components/ui/primitives';
import { usePageTitle } from '../../lib/usePageTitle';
import { AdminHeader } from './AdminHeader';
import { useLanguage } from '../../i18n/LanguageContext';

export const AdminModerationPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  usePageTitle(isVi ? 'Kiểm duyệt Doanh nghiệp & Tin tuyển dụng' : 'Company Verification & Job Moderation');
  const [activeTab, setActiveTab] = useState<'companies' | 'jobs'>('companies');
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Filters
  const [companyKeyword, setCompanyKeyword] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [jobKeyword, setJobKeyword] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('ALL');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [compList, jobList] = await Promise.all([
        adminApi.getCompanies({
          keyword: companyKeyword.trim() || undefined,
          verificationStatus: verificationFilter !== 'ALL' ? verificationFilter : undefined,
        }),
        adminApi.getJobs({
          keyword: jobKeyword.trim() || undefined,
          status: jobStatusFilter !== 'ALL' ? jobStatusFilter : undefined,
        }),
      ]);
      setCompanies(compList);
      setJobs(jobList);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationFilter, jobStatusFilter]);

  const handleVerifyCompany = async (comp: AdminCompany, nextStatus: string) => {
    try {
      const updated = await adminApi.verifyCompany(
        comp.id,
        nextStatus,
        `Xác minh doanh nghiệp (${nextStatus}) bởi Quản trị viên hệ thống`
      );
      setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showToast(`Đã cập nhật trạng thái xác minh "${comp.name}" sang ${nextStatus}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleModerateJob = async (job: AdminJob, nextStatus: string) => {
    try {
      const updated = await adminApi.moderateJob(
        job.id,
        nextStatus,
        `Kiểm duyệt tin đăng (${nextStatus}) bởi Quản trị viên hệ thống`
      );
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      showToast(`Đã chuyển trạng thái tin "${job.title}" sang ${nextStatus}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" data-testid="admin-moderation-page">
      <AdminHeader
        title={isVi ? 'Trung tâm Kiểm duyệt Doanh nghiệp & Tin tuyển dụng' : 'Company Verification & Job Moderation Center'}
        subtitle={
          isVi
            ? 'Thẩm định hồ sơ pháp lý doanh nghiệp đối tác (Tax Code, Website) và kiểm duyệt chất lượng tin đăng tuyển dụng trên toàn hệ thống.'
            : 'Verify partner company legal profiles (Tax Code, Website) and moderate job postings across the platform.'
        }
        rightSlot={
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-bold border border-white/20 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isVi ? 'Đồng bộ dữ liệu' : 'Sync Data'}</span>
          </button>
        }
      />

      {toast && (
        <div
          className="mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-4 py-3 text-sm font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-soft-xs"
          data-testid="admin-moderation-toast"
        >
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6">
          <ErrorBox message={error} />
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('companies')}
          data-testid="moderation-subtab-companies"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition cursor-pointer ${
            activeTab === 'companies'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>
            {isVi ? `Xác minh Doanh nghiệp (${companies.length})` : `Company Verification (${companies.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          data-testid="moderation-subtab-jobs"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{isVi ? `Kiểm duyệt Tin tuyển dụng (${jobs.length})` : `Job Moderation (${jobs.length})`}</span>
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : activeTab === 'companies' ? (
        /* ================= TAB 1: COMPANIES VERIFICATION ================= */
        <div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-soft-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadData();
              }}
              className="grid grid-cols-1 md:grid-cols-12 gap-3"
            >
              <div className="md:col-span-7 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companyKeyword}
                  onChange={(e) => setCompanyKeyword(e.target.value)}
                  placeholder={isVi ? 'Tìm doanh nghiệp theo tên, mã số thuế, ngành nghề hoặc thành phố...' : 'Search companies by name, tax code, industry, or city...'}
                  className={`${inputCls} pl-10`}
                />
              </div>
              <div className="md:col-span-3">
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className={inputCls}
                  data-testid="company-verification-filter"
                >
                  <option value="ALL">{isVi ? 'Tất cả trạng thái xác minh' : 'All Verification Statuses'}</option>
                  <option value="VERIFIED">{isVi ? 'VERIFIED (Đã xác minh)' : 'VERIFIED'}</option>
                  <option value="PENDING">{isVi ? 'PENDING (Chờ thẩm định)' : 'PENDING'}</option>
                  <option value="REJECTED">{isVi ? 'REJECTED (Từ chối)' : 'REJECTED'}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition cursor-pointer"
                >
                  {isVi ? 'Lọc danh sách' : 'Filter'}
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((comp) => (
              <div
                key={comp.id}
                data-testid={`admin-company-card-${comp.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-soft-xs flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {comp.name}
                        </h3>
                        <Link
                          to={`/companies/${comp.slug}`}
                          className="text-slate-400 hover:text-emerald-600"
                          title={isVi ? 'Xem trang công ty' : 'View company page'}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {comp.industry || 'Software & IT Services'} · {isVi ? 'Quy mô ' : 'Size '}
                        {comp.companySize || '100-500'} · {comp.city || 'Vietnam'}
                      </p>
                    </div>

                    {comp.verificationStatus === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        VERIFIED
                      </span>
                    ) : comp.verificationStatus === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        PENDING
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        REJECTED
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3">
                    <div>
                      <span className="text-slate-400 block">{isVi ? 'Mã số thuế' : 'Tax Code'}</span>
                      <strong className="text-slate-800 dark:text-slate-200">{comp.taxCode || '0101248141'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{isVi ? 'Tin tuyển dụng' : 'Job Postings'}</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">{comp.jobCount} Jobs</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Recruiters</span>
                      <strong className="text-indigo-600 dark:text-indigo-400">{comp.recruiterCount} HR</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {comp.verificationStatus !== 'VERIFIED' && (
                    <button
                      type="button"
                      onClick={() => handleVerifyCompany(comp, 'VERIFIED')}
                      data-testid={`btn-verify-company-${comp.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Xác minh (VERIFIED)' : 'Verify (VERIFIED)'}</span>
                    </button>
                  )}
                  {comp.verificationStatus !== 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleVerifyCompany(comp, 'PENDING')}
                      data-testid={`btn-pending-company-${comp.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Chuyển Chờ duyệt' : 'Set Pending'}</span>
                    </button>
                  )}
                  {comp.verificationStatus !== 'REJECTED' && (
                    <button
                      type="button"
                      onClick={() => handleVerifyCompany(comp, 'REJECTED')}
                      data-testid={`btn-reject-company-${comp.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Từ chối' : 'Reject'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ================= TAB 2: JOBS MODERATION ================= */
        <div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-soft-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadData();
              }}
              className="grid grid-cols-1 md:grid-cols-12 gap-3"
            >
              <div className="md:col-span-7 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={jobKeyword}
                  onChange={(e) => setJobKeyword(e.target.value)}
                  placeholder={isVi ? 'Tìm tin tuyển dụng theo tiêu đề, công ty hoặc địa điểm...' : 'Search jobs by title, company, or location...'}
                  className={`${inputCls} pl-10`}
                />
              </div>
              <div className="md:col-span-3">
                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                  className={inputCls}
                  data-testid="job-moderation-status-filter"
                >
                  <option value="ALL">{isVi ? 'Mọi trạng thái tin đăng' : 'All Job Statuses'}</option>
                  <option value="PUBLISHED">{isVi ? 'PUBLISHED (Đang hiển thị)' : 'PUBLISHED'}</option>
                  <option value="PENDING_APPROVAL">{isVi ? 'PENDING_APPROVAL (Chờ duyệt)' : 'PENDING_APPROVAL'}</option>
                  <option value="PAUSED">{isVi ? 'PAUSED (Tạm dừng)' : 'PAUSED'}</option>
                  <option value="CLOSED">{isVi ? 'CLOSED (Đã đóng)' : 'CLOSED'}</option>
                  <option value="DRAFT">{isVi ? 'DRAFT (Bản nháp)' : 'DRAFT'}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition cursor-pointer"
                >
                  {isVi ? 'Lọc tin đăng' : 'Filter'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4">{isVi ? 'Tin tuyển dụng' : 'Job Posting'}</th>
                    <th className="py-3.5 px-4">{isVi ? 'Doanh nghiệp' : 'Company'}</th>
                    <th className="py-3.5 px-4">{isVi ? 'Thống kê' : 'Metrics'}</th>
                    <th className="py-3.5 px-4">{isVi ? 'Trạng thái' : 'Status'}</th>
                    <th className="py-3.5 px-4 text-right">{isVi ? 'Kiểm duyệt' : 'Moderate'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      data-testid={`admin-job-row-${job.id}`}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{job.title}</span>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-slate-400 hover:text-emerald-600"
                            title={isVi ? 'Xem chi tiết việc làm' : 'View job details'}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          #{job.id} · {job.locationCity} · {job.jobType} · {job.expLevel}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {job.companyName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        <div>
                          {job.viewsCount ?? 0} {isVi ? 'lượt xem' : 'views'}
                        </div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {job.applicationsCount ?? 0} {isVi ? 'đơn ứng tuyển' : 'applications'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            job.status === 'PUBLISHED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                              : job.status === 'PAUSED' || job.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {job.status !== 'PUBLISHED' && (
                            <button
                              type="button"
                              onClick={() => handleModerateJob(job, 'PUBLISHED')}
                              data-testid={`btn-publish-job-${job.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isVi ? 'Duyệt đăng' : 'Publish'}</span>
                            </button>
                          )}
                          {job.status === 'PUBLISHED' && (
                            <button
                              type="button"
                              onClick={() => handleModerateJob(job, 'PAUSED')}
                              data-testid={`btn-pause-job-${job.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition cursor-pointer"
                            >
                              <PauseCircle className="w-3.5 h-3.5" />
                              <span>{isVi ? 'Tạm dừng' : 'Pause'}</span>
                            </button>
                          )}
                          {job.status !== 'CLOSED' && (
                            <button
                              type="button"
                              onClick={() => handleModerateJob(job, 'CLOSED')}
                              data-testid={`btn-close-job-${job.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{isVi ? 'Đóng tin' : 'Close'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
