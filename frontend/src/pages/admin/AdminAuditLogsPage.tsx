import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  FileSearch,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import type { AuditLogEntry, EmailLogEntry } from '../../lib/types';
import { ErrorBox, PageLoader, inputCls } from '../../components/ui/primitives';
import { usePageTitle } from '../../lib/usePageTitle';
import { AdminHeader } from './AdminHeader';

export const AdminAuditLogsPage: React.FC = () => {
  usePageTitle('Nhật ký Hệ thống Audit Trail & Email Logs');
  const [activeTab, setActiveTab] = useState<'audit' | 'email'>('audit');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [emailStatusFilter, setEmailStatusFilter] = useState('ALL');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" data-testid="admin-audit-logs-page">
      <AdminHeader
        title="Nhật ký Truy vết Hệ thống (Audit Trail) & Email Giao dịch (FR-38)"
        subtitle="Giám sát minh bạch mọi thao tác quản trị, thay đổi dữ liệu nhạy cảm (JSON Old/New Values), địa chỉ IP và lịch sử gửi email tự động."
        rightSlot={
          <button
            type="button"
            onClick={loadLogs}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-bold border border-white/20 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới nhật ký</span>
          </button>
        }
      />

      {error && (
        <div className="mb-6">
          <ErrorBox message={error} />
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          data-testid="subtab-audit-logs"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>Nhật ký Thao tác Hệ thống ({auditLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('email')}
          data-testid="subtab-email-logs"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition cursor-pointer ${
            activeTab === 'email'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Nhật ký Email Giao dịch ({emailLogs.length})</span>
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : activeTab === 'audit' ? (
        <div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-soft-xs">
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
                  placeholder="Tìm theo hành động, người thực hiện, email hoặc nội dung JSON..."
                  className={`${inputCls} pl-10`}
                  data-testid="audit-search-input"
                />
              </div>

              <div className="md:col-span-4">
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className={inputCls}
                  data-testid="audit-entity-filter"
                >
                  <option value="ALL">Mọi phân hệ dữ liệu (All Entities)</option>
                  <option value="users">users (Tài khoản & RBAC)</option>
                  <option value="companies">companies (Doanh nghiệp)</option>
                  <option value="jobs">jobs (Tin tuyển dụng)</option>
                  <option value="skills">skills (Từ điển Kỹ năng)</option>
                  <option value="job_applications">job_applications (Đơn ứng tuyển)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition cursor-pointer"
                >
                  Truy vết
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4">Thời gian / IP</th>
                    <th className="py-3.5 px-4">Người thực hiện</th>
                    <th className="py-3.5 px-4">Sự kiện (Action)</th>
                    <th className="py-3.5 px-4">Đối tượng</th>
                    <th className="py-3.5 px-4">Dữ liệu thay đổi (Old &rarr; New JSON)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      data-testid={`audit-log-row-${log.id}`}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          IP: {log.ipAddress || '127.0.0.1'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{log.actorName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{log.actorEmail}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                        {log.entityName} #{log.entityId}
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        {log.oldValues && (
                          <div className="text-[11px] font-mono text-rose-600 dark:text-rose-400 truncate">
                            - {log.oldValues}
                          </div>
                        )}
                        {log.newValues && (
                          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                            + {log.newValues}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ================= TAB 2: EMAIL LOGS ================= */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lịch sử gửi Email Giao dịch (Transactional Emails)
            </span>
            <select
              value={emailStatusFilter}
              onChange={(e) => setEmailStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="SENT">SENT</option>
              <option value="DISABLED">DISABLED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Người nhận</th>
                  <th className="py-3.5 px-4">Tiêu đề Email</th>
                  <th className="py-3.5 px-4">Template</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {emailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Chưa có bản ghi email giao dịch nào trong phiên hiện tại.
                    </td>
                  </tr>
                ) : (
                  emailLogs.map((em) => (
                    <tr key={em.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                        {em.createdAt ? new Date(em.createdAt).toLocaleString('vi-VN') : ''}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {em.toEmail}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                        {em.subject}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                        {em.template}
                      </td>
                      <td className="py-3.5 px-4">
                        {em.status === 'SENT' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            SENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                            <XCircle className="w-3 h-3" />
                            {em.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
