import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Globe,
  MapPin,
  PauseCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi, exportApi } from '../../lib/api';
import type { AdminCompany, AdminJob } from '../../lib/types';
import { CompanyAvatar, EmptyState, ErrorBox, PageLoader, inputCls } from '../../components/ui/primitives';
import { ExportMenu } from '../../components/ui/ExportMenu';
import { formatSalary, getExpLevels, getJobTypes, label, toLines } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';
import { AdminHeader } from './AdminHeader';
import { useLanguage } from '../../i18n/LanguageContext';

export const AdminModerationPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const lang: 'vi' | 'en' = language === 'en' ? 'en' : 'vi';
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

  // Dossier / Preview Modals
  const [inspectingCompany, setInspectingCompany] = useState<AdminCompany | null>(null);
  const [companyNote, setCompanyNote] = useState('');
  const [inspectingJob, setInspectingJob] = useState<AdminJob | null>(null);
  const [jobReason, setJobReason] = useState('');
  const [busyAction, setBusyAction] = useState(false);

  const jobTypesMap = getJobTypes(lang);
  const expLevelsMap = getExpLevels(lang);

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

  // Client-side instant search filtering
  const filteredCompanies = useMemo(() => {
    const q = companyKeyword.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.taxCode?.toLowerCase().includes(q)
    );
  }, [companies, companyKeyword]);

  const filteredJobs = useMemo(() => {
    const q = jobKeyword.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(q) ||
        j.companyName?.toLowerCase().includes(q) ||
        j.locationCity?.toLowerCase().includes(q)
    );
  }, [jobs, jobKeyword]);

  const stats = useMemo(() => {
    const verifiedComps = companies.filter((c) => c.verificationStatus === 'VERIFIED').length;
    const pendingComps = companies.filter((c) => c.verificationStatus === 'PENDING').length;
    const publishedJobs = jobs.filter((j) => j.status === 'PUBLISHED').length;
    const nonPublishedJobs = jobs.filter((j) => j.status !== 'PUBLISHED').length;
    return { verifiedComps, pendingComps, publishedJobs, nonPublishedJobs };
  }, [companies, jobs]);

  const handleVerifyCompany = async (comp: AdminCompany, nextStatus: string, customNote?: string) => {
    setBusyAction(true);
    setError(null);
    const noteText =
      customNote?.trim() ||
      (isVi
        ? `Xác minh doanh nghiệp (${nextStatus}) bởi Quản trị viên hệ thống`
        : `Enterprise verification updated to ${nextStatus} by System Administrator`);
    try {
      const updated = await adminApi.verifyCompany(comp.id, nextStatus, noteText);
      setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (inspectingCompany?.id === updated.id) {
        setInspectingCompany(null);
      }
      showToast(
        isVi
          ? `Đã cập nhật trạng thái xác minh "${comp.name}" sang ${nextStatus}`
          : `Updated verification status for "${comp.name}" to ${nextStatus}`
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyAction(false);
    }
  };

  const handleModerateJob = async (job: AdminJob, nextStatus: string, customReason?: string) => {
    setBusyAction(true);
    setError(null);
    const reasonText =
      customReason?.trim() ||
      (isVi
        ? `Kiểm duyệt tin đăng (${nextStatus}) bởi Quản trị viên hệ thống`
        : `Job posting moderated to ${nextStatus} by System Administrator`);
    try {
      const updated = await adminApi.moderateJob(job.id, nextStatus, reasonText);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      if (inspectingJob?.id === updated.id) {
        setInspectingJob(null);
      }
      showToast(
        isVi
          ? `Đã chuyển trạng thái tin "${job.title}" sang ${nextStatus}`
          : `Updated job posting "${job.title}" status to ${nextStatus}`
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyAction(false);
    }
  };

  const formatJobSalaryRange = (j: AdminJob) => {
    if (!j.minSalary && !j.maxSalary) return formatSalary(null, lang);
    const minM = j.minSalary ? Math.round(j.minSalary / 1_000_000) : null;
    const maxM = j.maxSalary ? Math.round(j.maxSalary / 1_000_000) : null;
    if (minM && maxM) return isVi ? `${minM} - ${maxM} triệu` : `${minM} - ${maxM}M VND`;
    if (minM) return isVi ? `Từ ${minM} triệu` : `From ${minM}M VND`;
    if (maxM) return isVi ? `Tới ${maxM} triệu` : `Up to ${maxM}M VND`;
    return formatSalary(null, lang);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6" data-testid="admin-moderation-page">
      <AdminHeader
        title={isVi ? 'Trung tâm Kiểm duyệt Doanh nghiệp & Tin tuyển dụng' : 'Company Verification & Job Moderation Center'}
        subtitle={
          isVi
            ? 'Thẩm định hồ sơ pháp lý doanh nghiệp đối tác (Tax Code, Website) và kiểm duyệt chất lượng tin đăng tuyển dụng trên toàn hệ thống.'
            : 'Verify partner company legal profiles (Tax Code, Website) and moderate job postings across the platform.'
        }
        rightSlot={
          <div className="flex items-center gap-2">
            <ExportMenu
              testId={`export-admin-${activeTab}`}
              onExportCsv={(l) =>
                activeTab === 'companies'
                  ? exportApi.adminCompanies(l, {
                      keyword: companyKeyword.trim() || undefined,
                      verificationStatus: verificationFilter !== 'ALL' ? verificationFilter : undefined,
                    })
                  : exportApi.adminJobs(l, {
                      keyword: jobKeyword.trim() || undefined,
                      status: jobStatusFilter !== 'ALL' ? jobStatusFilter : undefined,
                    })
              }
            />
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-soft-xs transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{isVi ? 'Đồng bộ dữ liệu' : 'Sync Data'}</span>
            </button>
          </div>
        }
      />

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab('companies');
            setVerificationFilter('VERIFIED');
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'companies' && verificationFilter === 'VERIFIED'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Doanh nghiệp Đã xác minh' : 'Verified Enterprises'}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.verifiedComps}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? `Trên tổng số ${companies.length} công ty` : `Out of ${companies.length} total companies`}
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('companies');
            setVerificationFilter(verificationFilter === 'PENDING' ? 'ALL' : 'PENDING');
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'companies' && verificationFilter === 'PENDING'
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Công ty Chờ thẩm định' : 'Pending Verification'}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{stats.pendingComps}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Hồ sơ pháp lý cần duyệt' : 'Awaiting legal review'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('jobs');
            setJobStatusFilter('PUBLISHED');
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'jobs' && jobStatusFilter === 'PUBLISHED'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Tin Tuyển dụng Đang mở' : 'Published Live Jobs'}</span>
            <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.publishedJobs}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Đang nhận hồ sơ ứng viên' : 'Actively accepting applications'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('jobs');
            setJobStatusFilter(jobStatusFilter === 'PAUSED' ? 'ALL' : 'PAUSED');
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'jobs' && jobStatusFilter !== 'ALL' && jobStatusFilter !== 'PUBLISHED'
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Tin Tạm dừng / Đóng / Chờ' : 'Paused / Closed / Draft'}</span>
            <PauseCircle className="w-4 h-4 text-slate-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.nonPublishedJobs}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Tin không hiển thị công khai' : 'Non-public job postings'}
          </p>
        </button>
      </div>

      {toast && (
        <div
          className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-4 py-3 text-sm font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-soft-xs"
          data-testid="admin-moderation-toast"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </div>
          <button type="button" onClick={() => setToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <ErrorBox message={error} onRetry={loadData} />}

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('companies')}
          data-testid="moderation-subtab-companies"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition cursor-pointer ${
            activeTab === 'companies'
              ? 'bg-emerald-600 text-white shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>
            {isVi
              ? `Xác minh Doanh nghiệp (${filteredCompanies.length})`
              : `Company Verification (${filteredCompanies.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          data-testid="moderation-subtab-jobs"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-emerald-600 text-white shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>
            {isVi ? `Kiểm duyệt Tin tuyển dụng (${filteredJobs.length})` : `Job Moderation (${filteredJobs.length})`}
          </span>
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : activeTab === 'companies' ? (
        /* ================= TAB 1: COMPANIES VERIFICATION ================= */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-soft-xs space-y-4">
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
                  placeholder={
                    isVi
                      ? 'Tìm doanh nghiệp theo tên, mã số thuế, ngành nghề hoặc thành phố...'
                      : 'Search companies by name, tax code, industry, or city...'
                  }
                  className={`${inputCls} pl-10 pr-8`}
                />
                {companyKeyword && (
                  <button
                    type="button"
                    onClick={() => setCompanyKeyword('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
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
                  className="w-full h-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition cursor-pointer shadow-soft-xs"
                >
                  {isVi ? 'Lọc danh sách' : 'Filter'}
                </button>
              </div>
            </form>

            {/* Quick Verification Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              {[
                { code: 'ALL', label: isVi ? 'Tất cả doanh nghiệp' : 'All Companies' },
                { code: 'VERIFIED', label: isVi ? 'Đã xác minh (VERIFIED)' : 'Verified' },
                { code: 'PENDING', label: isVi ? 'Chờ thẩm định (PENDING)' : 'Pending Review' },
                { code: 'REJECTED', label: isVi ? 'Đã từ chối (REJECTED)' : 'Rejected' },
              ].map((pill) => (
                <button
                  key={pill.code}
                  type="button"
                  onClick={() => setVerificationFilter(pill.code)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    verificationFilter === pill.code
                      ? 'bg-emerald-600 text-white shadow-soft-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {filteredCompanies.length === 0 ? (
            <EmptyState
              title={isVi ? 'Không tìm thấy doanh nghiệp phù hợp' : 'No matching companies found'}
              description={
                isVi
                  ? 'Thử đổi từ khóa tìm kiếm hoặc chọn trạng thái xác minh khác.'
                  : 'Try changing your search keyword or verification status filter.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompanies.map((comp) => (
                <div
                  key={comp.id}
                  data-testid={`admin-company-card-${comp.id}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/70 rounded-3xl p-5 shadow-soft-xs flex flex-col justify-between gap-4 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <CompanyAvatar name={comp.name} logoUrl={comp.logoUrl} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/companies/${comp.id}`}
                              className="text-base font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 truncate transition-colors"
                            >
                              {comp.name}
                            </Link>
                            <Link
                              to={`/companies/${comp.id}`}
                              className="text-slate-400 hover:text-emerald-600 shrink-0"
                              title={isVi ? 'Xem trang công ty' : 'View public company profile'}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                            {comp.industry || 'Software & IT Services'}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {comp.city || 'Vietnam'}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              {comp.companySize || '100-500'}
                            </span>
                            {comp.website && (
                              <a
                                href={comp.website}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline"
                              >
                                <Globe className="w-3 h-3" />
                                <span>Website</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {comp.verificationStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          VERIFIED
                        </span>
                      ) : comp.verificationStatus === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          PENDING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          REJECTED
                        </span>
                      )}
                    </div>

                    {comp.description && (
                      <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {comp.description}
                      </p>
                    )}

                    <div className="mt-3.5 grid grid-cols-3 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[11px]">{isVi ? 'Mã số thuế' : 'Tax Code'}</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-mono">
                          {comp.taxCode || '0101248141'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">{isVi ? 'Tin tuyển dụng' : 'Job Postings'}</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">{comp.jobCount} Jobs</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Recruiters</span>
                        <strong className="text-teal-600 dark:text-teal-400">{comp.recruiterCount} HR</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setInspectingCompany(comp);
                        setCompanyNote('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Hồ sơ pháp lý' : 'Inspect Dossier'}</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {comp.verificationStatus !== 'VERIFIED' && (
                        <button
                          type="button"
                          disabled={busyAction}
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
                          disabled={busyAction}
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
                          disabled={busyAction}
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
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= TAB 2: JOBS MODERATION ================= */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-soft-xs space-y-4">
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
                  placeholder={
                    isVi
                      ? 'Tìm tin tuyển dụng theo tiêu đề, công ty hoặc địa điểm...'
                      : 'Search jobs by title, company, or location...'
                  }
                  className={`${inputCls} pl-10 pr-8`}
                />
                {jobKeyword && (
                  <button
                    type="button"
                    onClick={() => setJobKeyword('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
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
                  className="w-full h-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition cursor-pointer shadow-soft-xs"
                >
                  {isVi ? 'Lọc tin đăng' : 'Filter'}
                </button>
              </div>
            </form>

            {/* Quick Job Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              {[
                { code: 'ALL', label: isVi ? 'Tất cả tin đăng' : 'All Postings' },
                { code: 'PUBLISHED', label: isVi ? 'Đang hiển thị (PUBLISHED)' : 'Published' },
                { code: 'PENDING_APPROVAL', label: isVi ? 'Chờ duyệt (PENDING)' : 'Pending Approval' },
                { code: 'PAUSED', label: isVi ? 'Tạm dừng (PAUSED)' : 'Paused' },
                { code: 'CLOSED', label: isVi ? 'Đã đóng (CLOSED)' : 'Closed' },
              ].map((pill) => (
                <button
                  key={pill.code}
                  type="button"
                  onClick={() => setJobStatusFilter(pill.code)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    jobStatusFilter === pill.code
                      ? 'bg-emerald-600 text-white shadow-soft-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <EmptyState
              title={isVi ? 'Không tìm thấy tin tuyển dụng phù hợp' : 'No matching job postings found'}
              description={
                isVi
                  ? 'Thử thay đổi từ khóa hoặc chọn trạng thái tin tuyển dụng khác.'
                  : 'Try changing your search keyword or job status filter.'
              }
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-4">{isVi ? 'Tin tuyển dụng & Mức lương' : 'Job Posting & Compensation'}</th>
                      <th className="py-3.5 px-4">{isVi ? 'Doanh nghiệp' : 'Company'}</th>
                      <th className="py-3.5 px-4">{isVi ? 'Thống kê' : 'Engagement'}</th>
                      <th className="py-3.5 px-4">{isVi ? 'Trạng thái' : 'Status'}</th>
                      <th className="py-3.5 px-4 text-right">{isVi ? 'Thao tác Kiểm duyệt' : 'Moderation Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {filteredJobs.map((job) => (
                      <tr
                        key={job.id}
                        data-testid={`admin-job-row-${job.id}`}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setInspectingJob(job);
                                setJobReason('');
                              }}
                              className="hover:text-emerald-600 dark:hover:text-emerald-400 text-left cursor-pointer"
                            >
                              {job.title}
                            </button>
                            <Link
                              to={`/jobs/${job.id}`}
                              className="text-slate-400 hover:text-emerald-600 shrink-0"
                              title={isVi ? 'Xem chi tiết việc làm' : 'View job details'}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono text-slate-400">#{job.id}</span>
                            <span>·</span>
                            <span>{job.locationCity}</span>
                            <span>·</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                              {label(jobTypesMap, job.jobType)}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                              {label(expLevelsMap, job.expLevel)}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                              {formatJobSalaryRange(job)}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <CompanyAvatar name={job.companyName} logoUrl={job.companyLogo} size="sm" />
                            <Link
                              to={job.companyId ? `/companies/${job.companyId}` : '/companies'}
                              className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600"
                            >
                              {job.companyName}
                            </Link>
                          </div>
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
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                              job.status === 'PUBLISHED'
                                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : job.status === 'PAUSED' || job.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setInspectingJob(job);
                                setJobReason('');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 transition cursor-pointer"
                              title={isVi ? 'Xem nội dung JD & ghi chú kiểm duyệt' : 'Preview JD & moderation notes'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{isVi ? 'Xem JD' : 'Preview'}</span>
                            </button>

                            {job.status !== 'PUBLISHED' && (
                              <button
                                type="button"
                                disabled={busyAction}
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
                                disabled={busyAction}
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
                                disabled={busyAction}
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
          )}
        </div>
      )}

      {/* Company Legal Verification Dossier Modal */}
      {inspectingCompany && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onMouseDown={() => setInspectingCompany(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl my-8"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <CompanyAvatar name={inspectingCompany.name} logoUrl={inspectingCompany.logoUrl} size="md" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {inspectingCompany.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {inspectingCompany.industry || 'Software & IT Services'} · {inspectingCompany.city || 'Vietnam'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingCompany(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">{isVi ? 'Mã số thuế' : 'Tax Code'}</span>
                  <strong className="text-slate-900 dark:text-white font-mono">
                    {inspectingCompany.taxCode || '0101248141'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{isVi ? 'Quy mô' : 'Company Size'}</span>
                  <strong className="text-slate-900 dark:text-white">
                    {inspectingCompany.companySize || '100-500'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{isVi ? 'Tin đăng' : 'Open Jobs'}</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">{inspectingCompany.jobCount} Jobs</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{isVi ? 'Trạng thái' : 'Status'}</span>
                  <strong className="text-slate-900 dark:text-white">{inspectingCompany.verificationStatus}</strong>
                </div>
              </div>

              {inspectingCompany.address && (
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">
                    {isVi ? 'Địa chỉ trụ sở: ' : 'Headquarters Address: '}
                  </strong>
                  {inspectingCompany.address}
                </div>
              )}

              {inspectingCompany.description && (
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {inspectingCompany.description}
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                  {isVi ? 'Ghi chú thẩm định pháp lý (Gửi tới HR & lưu Audit)' : 'Verification Audit Note (Sent to HR & logged)'}
                </label>
                <input
                  type="text"
                  value={companyNote}
                  onChange={(e) => setCompanyNote(e.target.value)}
                  placeholder={
                    isVi
                      ? 'VD: Đã đối chiếu Mã số thuế và giấy phép kinh doanh hợp lệ...'
                      : 'e.g. Verified enterprise tax code and official domain ownership...'
                  }
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                to={`/companies/${inspectingCompany.id}`}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>{isVi ? 'Mở trang công ty công khai' : 'Open public company page'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => handleVerifyCompany(inspectingCompany, 'VERIFIED', companyNote)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  {isVi ? 'Xác minh (VERIFIED)' : 'Approve (VERIFIED)'}
                </button>
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => handleVerifyCompany(inspectingCompany, 'PENDING', companyNote)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-pointer"
                >
                  {isVi ? 'Chờ duyệt (PENDING)' : 'Set Pending'}
                </button>
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => handleVerifyCompany(inspectingCompany, 'REJECTED', companyNote)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 cursor-pointer"
                >
                  {isVi ? 'Từ chối (REJECTED)' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Moderation Content Preview Modal */}
      {inspectingJob && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onMouseDown={() => setInspectingJob(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl my-8 max-h-[90vh] flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3.5">
                <CompanyAvatar name={inspectingJob.companyName} logoUrl={inspectingJob.companyLogo} size="md" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {inspectingJob.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {inspectingJob.companyName} · {inspectingJob.locationCity} · {formatJobSalaryRange(inspectingJob)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingJob(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-4 overflow-y-auto pr-1 flex-1">
              {inspectingJob.description && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                    {isVi ? 'Mô tả công việc' : 'Job Description'}
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                    {toLines(inspectingJob.description).map((line, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {inspectingJob.requirements && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                    {isVi ? 'Yêu cầu ứng viên' : 'Candidate Requirements'}
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                    {toLines(inspectingJob.requirements).map((line, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {inspectingJob.benefits && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                    {isVi ? 'Chế độ đãi ngộ' : 'Compensation & Benefits'}
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                    {toLines(inspectingJob.benefits).map((line, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                  {isVi ? 'Ghi chú kiểm duyệt tin đăng (Gửi thông báo tới HR)' : 'Moderation Audit Reason (Sent to Recruiter)'}
                </label>
                <input
                  type="text"
                  value={jobReason}
                  onChange={(e) => setJobReason(e.target.value)}
                  placeholder={
                    isVi
                      ? 'VD: Nội dung JD rõ ràng, minh bạch mức lương và yêu cầu kỹ năng...'
                      : 'e.g. Job description meets platform quality and salary transparency standards...'
                  }
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <Link
                to={`/jobs/${inspectingJob.id}`}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>{isVi ? 'Mở trang tin tuyển dụng' : 'Open public job posting'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => handleModerateJob(inspectingJob, 'PUBLISHED', jobReason)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  {isVi ? 'Duyệt đăng (PUBLISHED)' : 'Publish (PUBLISHED)'}
                </button>
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => handleModerateJob(inspectingJob, 'PAUSED', jobReason)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-pointer"
                >
                  {isVi ? 'Tạm dừng (PAUSED)' : 'Pause'}
                </button>
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => handleModerateJob(inspectingJob, 'CLOSED', jobReason)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 cursor-pointer"
                >
                  {isVi ? 'Đóng tin (CLOSED)' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
