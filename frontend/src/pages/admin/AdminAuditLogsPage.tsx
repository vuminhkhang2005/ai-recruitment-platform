import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  FileSearch,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import type { AuditLogEntry, EmailLogEntry } from '../../lib/types';
import { EmptyState, ErrorBox, PageLoader, inputCls } from '../../components/ui/primitives';
import { Avatar } from '../../components/layout/Navbar';
import { usePageTitle } from '../../lib/usePageTitle';
import { AdminHeader } from './AdminHeader';
import { useLanguage } from '../../i18n/LanguageContext';

function tryParseJson(raw?: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function formatPrettyJson(raw?: string | null): string {
  if (!raw) return '—';
  const parsed = tryParseJson(raw);
  if (!parsed) return raw;
  return JSON.stringify(parsed, null, 2);
}

export const AdminAuditLogsPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  usePageTitle(isVi ? 'Nhật ký Hệ thống Audit Trail & Email Logs' : 'System Audit Trail & Email Logs');
  const [activeTab, setActiveTab] = useState<'audit' | 'email'>('audit');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [actionQuickFilter, setActionQuickFilter] = useState('ALL');
  const [emailStatusFilter, setEmailStatusFilter] = useState('ALL');
  const [emailKeyword, setEmailKeyword] = useState('');

  // Inspector Modals
  const [inspectingAudit, setInspectingAudit] = useState<AuditLogEntry | null>(null);
  const [inspectingEmail, setInspectingEmail] = useState<EmailLogEntry | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const [audits, emails] = await Promise.all([
        adminApi.getAuditLogs({
          keyword: keyword.trim() || undefined,
          entityName: entityFilter !== 'ALL' ? entityFilter : undefined,
          limit: 100,
        }),
        adminApi.getEmailLogs({
          status: emailStatusFilter !== 'ALL' ? emailStatusFilter : undefined,
          limit: 100,
        }),
      ]);
      setAuditLogs(audits);
      setEmailLogs(emails);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityFilter, emailStatusFilter]);

  const filteredAuditLogs = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return auditLogs.filter((l) => {
      if (actionQuickFilter !== 'ALL' && !l.action?.toUpperCase().includes(actionQuickFilter)) {
        return false;
      }
      if (!q) return true;
      return (
        l.action?.toLowerCase().includes(q) ||
        l.actorName?.toLowerCase().includes(q) ||
        l.actorEmail?.toLowerCase().includes(q) ||
        l.entityName?.toLowerCase().includes(q) ||
        l.entityId?.toLowerCase().includes(q) ||
        l.newValues?.toLowerCase().includes(q)
      );
    });
  }, [auditLogs, keyword, actionQuickFilter]);

  const filteredEmailLogs = useMemo(() => {
    const q = emailKeyword.trim().toLowerCase();
    if (!q) return emailLogs;
    return emailLogs.filter(
      (e) =>
        e.toEmail?.toLowerCase().includes(q) ||
        e.subject?.toLowerCase().includes(q) ||
        e.template?.toLowerCase().includes(q)
    );
  }, [emailLogs, emailKeyword]);

  const stats = useMemo(() => {
    const totalAudits = auditLogs.length;
    const securityEvents = auditLogs.filter(
      (l) => l.entityName === 'users' || l.action?.includes('USER') || l.action?.includes('ROLE')
    ).length;
    const moderationEvents = auditLogs.filter(
      (l) => l.entityName === 'companies' || l.entityName === 'jobs'
    ).length;
    const sentEmails = emailLogs.filter((e) => e.status === 'SENT').length;
    return { totalAudits, securityEvents, moderationEvents, sentEmails };
  }, [auditLogs, emailLogs]);

  const exportAuditCsv = () => {
    const headers = ['ID', 'Timestamp', 'IP', 'ActorName', 'ActorEmail', 'Action', 'Entity', 'EntityID', 'OldValues', 'NewValues'];
    const rows = filteredAuditLogs.map((l) => [
      l.id,
      l.createdAt,
      l.ipAddress,
      `"${(l.actorName || '').replace(/"/g, '""')}"`,
      l.actorEmail,
      l.action,
      l.entityName,
      l.entityId,
      `"${(l.oldValues || '').replace(/"/g, '""')}"`,
      `"${(l.newValues || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talentbridge-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderDiffSummary = (log: AuditLogEntry) => {
    const oldObj = tryParseJson(log.oldValues);
    const newObj = tryParseJson(log.newValues);
    if (oldObj || newObj) {
      const keys = Array.from(new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]));
      return (
        <div className="flex flex-wrap items-center gap-1.5">
          {keys.slice(0, 3).map((k) => {
            const oldVal = oldObj && k in oldObj ? JSON.stringify(oldObj[k]).replace(/^"|"$/g, '') : undefined;
            const newVal = newObj && k in newObj ? JSON.stringify(newObj[k]).replace(/^"|"$/g, '') : undefined;
            return (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 font-mono"
              >
                <span className="font-bold text-slate-600 dark:text-slate-300">{k}:</span>
                {oldVal !== undefined && (
                  <>
                    <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold max-w-[120px] truncate">
                      {oldVal}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  </>
                )}
                {newVal !== undefined && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold max-w-[160px] truncate">
                    {newVal}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-0.5 max-w-md">
        {log.oldValues && (
          <div className="text-[11px] font-mono text-rose-600 dark:text-rose-400 truncate">- {log.oldValues}</div>
        )}
        {log.newValues && (
          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">+ {log.newValues}</div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6" data-testid="admin-audit-logs-page">
      <AdminHeader
        title={isVi ? 'Nhật ký Truy vết Hệ thống (Audit Trail) & Email Giao dịch' : 'System Audit Trail & Transactional Email Logs'}
        subtitle={
          isVi
            ? 'Giám sát minh bạch mọi thao tác quản trị, thay đổi dữ liệu nhạy cảm (JSON Old/New Values), địa chỉ IP và lịch sử gửi email tự động.'
            : 'Transparently monitor administrative actions, sensitive data changes (JSON Old/New Values), IP addresses, and automated email delivery.'
        }
        rightSlot={
          <>
            <button
              type="button"
              onClick={exportAuditCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isVi ? 'Xuất CSV' : 'Export CSV'}</span>
            </button>
            <button
              type="button"
              onClick={loadLogs}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-soft-xs transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{isVi ? 'Làm mới nhật ký' : 'Refresh Logs'}</span>
            </button>
          </>
        }
      />

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab('audit');
            setEntityFilter('ALL');
            setActionQuickFilter('ALL');
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'audit' && entityFilter === 'ALL'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Tổng Sự kiện Audit' : 'Total Audit Events'}</span>
            <FileSearch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.totalAudits}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Lưu trữ bất biến (Immutable)' : 'Immutable security log'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('audit');
            setEntityFilter('users');
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'audit' && entityFilter === 'users'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Bảo mật & RBAC' : 'RBAC & Security Events'}</span>
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.securityEvents}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Thay đổi quyền & trạng thái' : 'Role & account status changes'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('audit');
            setEntityFilter('companies');
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'audit' && (entityFilter === 'companies' || entityFilter === 'jobs')
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Thao tác Kiểm duyệt' : 'Moderation Actions'}</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.moderationEvents}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Xác minh công ty & duyệt tin' : 'Company & job verifications'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('email')}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'email'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Email Giao dịch Đã gửi' : 'Transactional Emails'}</span>
            <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.sentEmails}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? `Tổng ${emailLogs.length} bản ghi email` : `${emailLogs.length} total email logs`}
          </p>
        </button>
      </div>

      {error && <ErrorBox message={error} onRetry={loadLogs} />}

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          data-testid="subtab-audit-logs"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-emerald-600 text-white shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>
            {isVi
              ? `Nhật ký Thao tác Hệ thống (${filteredAuditLogs.length})`
              : `System Audit Logs (${filteredAuditLogs.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('email')}
          data-testid="subtab-email-logs"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition cursor-pointer ${
            activeTab === 'email'
              ? 'bg-emerald-600 text-white shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>
            {isVi
              ? `Nhật ký Email Giao dịch (${filteredEmailLogs.length})`
              : `Transactional Email Logs (${filteredEmailLogs.length})`}
          </span>
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : activeTab === 'audit' ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-soft-xs space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadLogs();
              }}
              className="grid grid-cols-1 md:grid-cols-12 gap-3"
            >
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={
                    isVi
                      ? 'Tìm theo hành động, người thực hiện, email hoặc nội dung JSON...'
                      : 'Search by action, actor name, email, or JSON payload...'
                  }
                  className={`${inputCls} pl-10 pr-8`}
                  data-testid="audit-search-input"
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => setKeyword('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="md:col-span-4">
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className={inputCls}
                  data-testid="audit-entity-filter"
                >
                  <option value="ALL">{isVi ? 'Mọi phân hệ dữ liệu (All Entities)' : 'All Data Entities'}</option>
                  <option value="users">{isVi ? 'users (Tài khoản & RBAC)' : 'users (Accounts & RBAC)'}</option>
                  <option value="companies">{isVi ? 'companies (Doanh nghiệp)' : 'companies (Enterprises)'}</option>
                  <option value="jobs">{isVi ? 'jobs (Tin tuyển dụng)' : 'jobs (Job Postings)'}</option>
                  <option value="skills">{isVi ? 'skills (Từ điển Kỹ năng)' : 'skills (Skill Taxonomy)'}</option>
                  <option value="job_applications">{isVi ? 'job_applications (Đơn ứng tuyển)' : 'job_applications (Applications)'}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition cursor-pointer shadow-soft-xs"
                >
                  {isVi ? 'Truy vết' : 'Search'}
                </button>
              </div>
            </form>

            {/* Quick Action Type Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              {[
                { code: 'ALL', label: isVi ? 'Mọi sự kiện' : 'All Events' },
                { code: 'USER_STATUS', label: isVi ? 'Trạng thái User' : 'User Status' },
                { code: 'USER_ROLES', label: isVi ? 'Phân quyền RBAC' : 'RBAC Roles' },
                { code: 'COMPANY', label: isVi ? 'Xác minh Công ty' : 'Company Verification' },
                { code: 'JOB', label: isVi ? 'Kiểm duyệt Job' : 'Job Moderation' },
                { code: 'SKILL', label: isVi ? 'Từ điển Kỹ năng' : 'Skill Taxonomy' },
              ].map((pill) => (
                <button
                  key={pill.code}
                  type="button"
                  onClick={() => setActionQuickFilter(pill.code)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    actionQuickFilter === pill.code
                      ? 'bg-emerald-600 text-white shadow-soft-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {filteredAuditLogs.length === 0 ? (
            <EmptyState
              title={isVi ? 'Không tìm thấy bản ghi Audit phù hợp' : 'No matching audit log entries'}
              description={
                isVi
                  ? 'Thử đổi bộ lọc phân hệ hoặc từ khóa tìm kiếm.'
                  : 'Try changing the entity filter or search keyword.'
              }
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-4">{isVi ? 'Thời gian / IP' : 'Timestamp / IP'}</th>
                      <th className="py-3.5 px-4">{isVi ? 'Người thực hiện' : 'Actor'}</th>
                      <th className="py-3.5 px-4">{isVi ? 'Sự kiện (Action)' : 'Action'}</th>
                      <th className="py-3.5 px-4">{isVi ? 'Đối tượng' : 'Target Entity'}</th>
                      <th className="py-3.5 px-4">{isVi ? 'Dữ liệu thay đổi (Old → New)' : 'Changed Payload (Old → New)'}</th>
                      <th className="py-3.5 px-4 text-right">{isVi ? 'Chi tiết' : 'Inspect'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                    {filteredAuditLogs.map((log) => (
                      <tr
                        key={log.id}
                        data-testid={`audit-log-row-${log.id}`}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {log.createdAt
                              ? new Date(log.createdAt).toLocaleString(isVi ? 'vi-VN' : 'en-US')
                              : isVi
                              ? 'Vừa xong'
                              : 'Just now'}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            IP: {log.ipAddress || '127.0.0.1'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={log.actorName || 'S'} size="w-8 h-8" />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate">{log.actorName}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{log.actorEmail}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300">
                            {log.entityName} #{log.entityId}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-sm">{renderDiffSummary(log)}</td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setInspectingAudit(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 transition cursor-pointer shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5 shrink-0" />
                            <span>JSON</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= TAB 2: EMAIL LOGS ================= */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={emailKeyword}
                onChange={(e) => setEmailKeyword(e.target.value)}
                placeholder={isVi ? 'Tìm theo email người nhận hoặc tiêu đề...' : 'Search by recipient email or subject...'}
                className={`${inputCls} pl-10`}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVi ? 'Trạng thái:' : 'Status:'}
              </span>
              <select
                value={emailStatusFilter}
                onChange={(e) => setEmailStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">{isVi ? 'Mọi trạng thái' : 'All Statuses'}</option>
                <option value="SENT">SENT</option>
                <option value="DISABLED">DISABLED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">{isVi ? 'Thời gian' : 'Timestamp'}</th>
                  <th className="py-3.5 px-4">{isVi ? 'Người nhận' : 'Recipient'}</th>
                  <th className="py-3.5 px-4">{isVi ? 'Tiêu đề Email' : 'Subject'}</th>
                  <th className="py-3.5 px-4">Template / Ref</th>
                  <th className="py-3.5 px-4">{isVi ? 'Trạng thái' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{isVi ? 'Chi tiết' : 'Inspect'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {filteredEmailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      {isVi
                        ? 'Không có bản ghi email giao dịch nào khớp bộ lọc.'
                        : 'No transactional email records match your filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredEmailLogs.map((em) => (
                    <tr key={em.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                        {em.createdAt ? new Date(em.createdAt).toLocaleString(isVi ? 'vi-VN' : 'en-US') : ''}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{em.toEmail}</td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200">{em.subject}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs text-teal-600 dark:text-teal-400 block">{em.template}</span>
                        {em.referenceType && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {em.referenceType} #{em.referenceId}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {em.status === 'SENT' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            SENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <XCircle className="w-3 h-3" />
                            {em.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setInspectingEmail(em)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Event JSON Diff Inspector Modal */}
      {inspectingAudit && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={() => setInspectingAudit(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {isVi ? 'Chi tiết Sự kiện Audit' : 'Audit Event Inspector'} #{inspectingAudit.id}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {inspectingAudit.action} · {inspectingAudit.entityName} #{inspectingAudit.entityId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingAudit(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-slate-400 block">{isVi ? 'Người thực hiện' : 'Actor'}</span>
                  <strong className="text-slate-900 dark:text-white">{inspectingAudit.actorName}</strong>
                  <span className="block text-[11px] text-slate-500">{inspectingAudit.actorEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isVi ? 'Thời gian' : 'Timestamp'}</span>
                  <strong className="text-slate-900 dark:text-white">
                    {inspectingAudit.createdAt
                      ? new Date(inspectingAudit.createdAt).toLocaleString(isVi ? 'vi-VN' : 'en-US')
                      : '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{isVi ? 'Địa chỉ IP' : 'IP Address'}</span>
                  <strong className="text-slate-900 dark:text-white font-mono">
                    {inspectingAudit.ipAddress || '127.0.0.1'}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-3.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-2">
                    {isVi ? 'Giá trị cũ (Old JSON)' : 'Previous State (Old JSON)'}
                  </span>
                  <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all">
                    {formatPrettyJson(inspectingAudit.oldValues)}
                  </pre>
                </div>

                <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">
                    {isVi ? 'Giá trị mới (New JSON)' : 'Updated State (New JSON)'}
                  </span>
                  <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all">
                    {formatPrettyJson(inspectingAudit.newValues)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setInspectingAudit(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Log Inspector Modal */}
      {inspectingEmail && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={() => setInspectingEmail(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isVi ? 'Chi tiết Email Giao dịch' : 'Transactional Email Details'} #{inspectingEmail.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingEmail(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <div>
                  <span className="text-slate-400 text-xs block">{isVi ? 'Người nhận (To):' : 'Recipient (To):'}</span>
                  <strong className="text-slate-900 dark:text-white">{inspectingEmail.toEmail}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">{isVi ? 'Tiêu đề (Subject):' : 'Subject:'}</span>
                  <strong className="text-slate-900 dark:text-white">{inspectingEmail.subject}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 text-xs block">Template:</span>
                    <span className="font-mono text-teal-600 dark:text-teal-400">{inspectingEmail.template}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">{isVi ? 'Tham chiếu:' : 'Reference:'}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {inspectingEmail.referenceType || 'SYSTEM'} #{inspectingEmail.referenceId ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setInspectingEmail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
