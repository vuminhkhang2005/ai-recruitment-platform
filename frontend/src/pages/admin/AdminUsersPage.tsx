import React, { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  KeyRound,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { adminApi, exportApi } from '../../lib/api';
import type { AdminUser } from '../../lib/types';
import { EmptyState, ErrorBox, PageLoader, inputCls } from '../../components/ui/primitives';
import { ExportMenu } from '../../components/ui/ExportMenu';
import { Avatar } from '../../components/layout/Navbar';
import { usePageTitle } from '../../lib/usePageTitle';
import { useAuth } from '../../context/AuthContext';
import { AdminHeader } from './AdminHeader';
import { useLanguage } from '../../i18n/LanguageContext';

export const AdminUsersPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  usePageTitle(isVi ? 'Quản lý Người dùng & Phân quyền RBAC' : 'User Management & RBAC');
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const allRoles = [
    {
      code: 'ROLE_CANDIDATE',
      label: isVi ? 'Ứng viên (ROLE_CANDIDATE)' : 'Candidate (ROLE_CANDIDATE)',
      desc: isVi
        ? 'Tìm kiếm việc làm, tạo CV AI, ứng tuyển và theo dõi lịch phỏng vấn.'
        : 'Browse jobs, build AI resumes, submit applications, and track interviews.',
    },
    {
      code: 'ROLE_RECRUITER',
      label: isVi ? 'Nhà tuyển dụng (ROLE_RECRUITER)' : 'Recruiter (ROLE_RECRUITER)',
      desc: isVi
        ? 'Đăng tin tuyển dụng, quản lý Kanban ATS, đặt lịch phỏng vấn và săn nhân tài.'
        : 'Post jobs, manage ATS Kanban pipelines, schedule interviews, and source talent.',
    },
    {
      code: 'ROLE_HIRING_MANAGER',
      label: isVi ? 'Quản lý tuyển dụng (ROLE_HIRING_MANAGER)' : 'Hiring Manager (ROLE_HIRING_MANAGER)',
      desc: isVi
        ? 'Thẩm định hồ sơ chuyên môn, chấm điểm phỏng vấn (Scorecard) và phê duyệt tuyển dụng.'
        : 'Evaluate technical candidates, submit interview scorecards, and approve hires.',
    },
    {
      code: 'ROLE_ADMIN',
      label: isVi ? 'Quản trị viên (ROLE_ADMIN)' : 'Administrator (ROLE_ADMIN)',
      desc: isVi
        ? 'Toàn quyền quản trị hệ thống, phân quyền RBAC, kiểm duyệt doanh nghiệp và truy vết Audit.'
        : 'Full system governance, RBAC permissions, company verification, and audit trail access.',
    },
  ];

  // Filters
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Role modal state
  const [editingRoleUser, setEditingRoleUser] = useState<AdminUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [savingAction, setSavingAction] = useState(false);

  // User Dossier & Status Governance modal state
  const [inspectingUser, setInspectingUser] = useState<AdminUser | null>(null);
  const [statusTarget, setStatusTarget] = useState<string>('ACTIVE');
  const [statusReason, setStatusReason] = useState<string>('');

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers({
        keyword: keyword.trim() || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setUsers(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  // Client-side instant filtering on keyword while typing
  const filteredUsers = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.companyName?.toLowerCase().includes(q) ||
        u.candidateHeadline?.toLowerCase().includes(q)
    );
  }, [users, keyword]);

  // Summary metrics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'ACTIVE').length;
    const restricted = users.filter((u) => u.status === 'SUSPENDED' || u.status === 'BANNED').length;
    const candidates = users.filter((u) => u.roles.includes('ROLE_CANDIDATE')).length;
    const recruiters = users.filter(
      (u) => u.roles.includes('ROLE_RECRUITER') || u.roles.includes('ROLE_HIRING_MANAGER')
    ).length;
    const admins = users.filter((u) => u.roles.includes('ROLE_ADMIN')).length;
    return { total, active, restricted, candidates, recruiters, admins };
  }, [users]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleStatusChange = async (target: AdminUser, nextStatus: string, customReason?: string) => {
    setSavingAction(true);
    setError(null);
    const reasonText =
      customReason?.trim() ||
      (isVi
        ? `Cập nhật trạng thái sang ${nextStatus} bởi Quản trị viên`
        : `Account status updated to ${nextStatus} by System Administrator`);
    try {
      const updated = await adminApi.updateUserStatus(target.id, nextStatus, reasonText);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      if (inspectingUser?.id === updated.id) {
        setInspectingUser(updated);
      }
      showToast(
        isVi
          ? `Đã chuyển trạng thái tài khoản "${target.fullName}" sang ${nextStatus}`
          : `Updated account status for "${target.fullName}" to ${nextStatus}`
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingAction(false);
    }
  };

  const openInspectModal = (u: AdminUser) => {
    setInspectingUser(u);
    setStatusTarget(u.status);
    setStatusReason('');
  };

  const openRoleModal = (u: AdminUser) => {
    setEditingRoleUser(u);
    setSelectedRoles([...u.roles]);
  };

  const toggleRoleInModal = (roleCode: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleCode) ? prev.filter((r) => r !== roleCode) : [...prev, roleCode]
    );
  };

  const saveRoles = async () => {
    if (!editingRoleUser || selectedRoles.length === 0) return;
    setSavingAction(true);
    setError(null);
    try {
      const updated = await adminApi.updateUserRoles(editingRoleUser.id, selectedRoles);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      if (inspectingUser?.id === updated.id) {
        setInspectingUser(updated);
      }
      showToast(
        isVi
          ? `Đã cập nhật quyền RBAC cho "${editingRoleUser.fullName}"`
          : `Updated RBAC permissions for "${editingRoleUser.fullName}"`
      );
      setEditingRoleUser(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingAction(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ACTIVE
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800">
            <Lock className="w-3.5 h-3.5" />
            SUSPENDED
          </span>
        );
      case 'BANNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800">
            <Ban className="w-3.5 h-3.5" />
            BANNED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const roleBadge = (role: string) => {
    const color =
      role === 'ROLE_ADMIN'
        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800'
        : role === 'ROLE_RECRUITER' || role === 'ROLE_HIRING_MANAGER'
        ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700';
    return (
      <span
        key={role}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${color}`}
      >
        <Shield className="w-3 h-3" />
        {role.replace('ROLE_', '')}
      </span>
    );
  };

  const presetReasons = isVi
    ? [
        'Tài khoản đã xác minh hợp lệ',
        'Vi phạm quy chuẩn cộng đồng tuyển dụng',
        'Phát hiện hành vi spam tin nhắn / hồ sơ',
        'Yêu cầu tạm khóa bảo mật từ chủ tài khoản',
      ]
    : [
        'Account verified and in good standing',
        'Violation of platform recruitment guidelines',
        'Suspicious or spam activity detected',
        'Security hold requested by account owner',
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6" data-testid="admin-users-page">
      <AdminHeader
        title={isVi ? 'Quản lý Tài khoản Người dùng & Phân quyền RBAC' : 'User Account Management & RBAC Permissions'}
        subtitle={
          isVi
            ? 'Tra cứu, lọc theo vai trò/trạng thái, khóa hoặc mở khóa tài khoản vi phạm và cấp phát quyền RBAC thời gian thực.'
            : 'Search, filter by role/status, suspend or reactivate accounts, and assign real-time RBAC permissions.'
        }
        rightSlot={
          <div className="flex items-center gap-2">
            <ExportMenu
              testId="export-admin-users"
              onExportCsv={(l) =>
                exportApi.adminUsers(l, {
                  keyword: keyword.trim() || undefined,
                  role: roleFilter !== 'ALL' ? roleFilter : undefined,
                  status: statusFilter !== 'ALL' ? statusFilter : undefined,
                })
              }
            />
            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-soft-xs transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>
                {isVi ? 'Tải lại' : 'Refresh'} ({filteredUsers.length})
              </span>
            </button>
          </div>
        }
      />

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setRoleFilter('ALL');
            setStatusFilter('ALL');
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'ALL' && statusFilter === 'ALL'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Tổng Tài khoản' : 'Total Accounts'}</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {stats.admins} {isVi ? 'Quản trị viên' : 'System Admins'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Đang hoạt động' : 'Active Accounts'}</span>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Đã xác thực & hoạt động' : 'Verified & operational'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setRoleFilter(roleFilter === 'ROLE_RECRUITER' ? 'ALL' : 'ROLE_RECRUITER')}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'ROLE_RECRUITER'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Ứng viên / Nhà tuyển dụng' : 'Candidates / Recruiters'}</span>
            <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {stats.candidates} <span className="text-sm font-normal text-slate-400">/</span> {stats.recruiters}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Phân bổ vai trò chính' : 'Primary role distribution'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'SUSPENDED' ? 'ALL' : 'SUSPENDED')}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'SUSPENDED' || statusFilter === 'BANNED'
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 shadow-soft-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Tạm khóa / Cấm' : 'Suspended / Banned'}</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{stats.restricted}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Tài khoản bị hạn chế quyền' : 'Restricted access accounts'}
          </p>
        </button>
      </div>

      {toast && (
        <div
          className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-4 py-3 text-sm font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-soft-xs"
          data-testid="admin-user-toast"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="text-emerald-600 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <ErrorBox message={error} onRetry={loadUsers} />}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-soft-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadUsers();
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-3"
        >
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={
                isVi
                  ? 'Tìm nhanh theo họ tên, email, SĐT hoặc công ty...'
                  : 'Search by name, email, phone, or company...'
              }
              className={`${inputCls} pl-10 pr-8`}
              data-testid="admin-user-search-input"
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

          <div className="md:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={inputCls}
              data-testid="admin-user-role-filter"
            >
              <option value="ALL">{isVi ? 'Tất cả vai trò (RBAC)' : 'All Roles (RBAC)'}</option>
              <option value="ROLE_CANDIDATE">{isVi ? 'Ứng viên (CANDIDATE)' : 'Candidate (CANDIDATE)'}</option>
              <option value="ROLE_RECRUITER">{isVi ? 'Nhà tuyển dụng (RECRUITER)' : 'Recruiter (RECRUITER)'}</option>
              <option value="ROLE_HIRING_MANAGER">Hiring Manager</option>
              <option value="ROLE_ADMIN">{isVi ? 'Quản trị viên (ADMIN)' : 'Administrator (ADMIN)'}</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputCls}
              data-testid="admin-user-status-filter"
            >
              <option value="ALL">{isVi ? 'Mọi trạng thái' : 'All Statuses'}</option>
              <option value="ACTIVE">{isVi ? 'ACTIVE (Hoạt động)' : 'ACTIVE'}</option>
              <option value="SUSPENDED">{isVi ? 'SUSPENDED (Tạm khóa)' : 'SUSPENDED'}</option>
              <option value="BANNED">{isVi ? 'BANNED (Cấm vĩnh viễn)' : 'BANNED'}</option>
              <option value="PENDING_VERIFY">PENDING_VERIFY</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition cursor-pointer shadow-soft-xs"
              data-testid="admin-user-search-btn"
            >
              {isVi ? 'Tìm kiếm' : 'Search'}
            </button>
          </div>
        </form>

        {/* Quick Role Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { code: 'ALL', label: isVi ? 'Tất cả' : 'All Roles' },
              { code: 'ROLE_CANDIDATE', label: isVi ? 'Ứng viên' : 'Candidates' },
              { code: 'ROLE_RECRUITER', label: isVi ? 'Nhà tuyển dụng' : 'Recruiters' },
              { code: 'ROLE_HIRING_MANAGER', label: 'Hiring Manager' },
              { code: 'ROLE_ADMIN', label: 'Admin' },
            ].map((pill) => {
              const active = roleFilter === pill.code;
              return (
                <button
                  key={pill.code}
                  type="button"
                  onClick={() => setRoleFilter(pill.code)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-soft-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isVi
              ? `Hiển thị ${filteredUsers.length} / ${users.length} tài khoản`
              : `Showing ${filteredUsers.length} of ${users.length} accounts`}
          </span>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <PageLoader />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title={isVi ? 'Không tìm thấy tài khoản phù hợp' : 'No matching user accounts found'}
          description={
            isVi
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc vai trò / trạng thái.'
              : 'Try adjusting your search query or role/status filters.'
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">{isVi ? 'Tài khoản Người dùng' : 'User Account'}</th>
                  <th className="py-3.5 px-4">{isVi ? 'Đơn vị / Chức danh' : 'Organization / Headline'}</th>
                  <th className="py-3.5 px-4">{isVi ? 'Vai trò (RBAC)' : 'Roles (RBAC)'}</th>
                  <th className="py-3.5 px-4">{isVi ? 'Trạng thái' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{isVi ? 'Thao tác Quản trị' : 'Governance Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredUsers.map((u) => {
                  const isSelf = currentAdmin?.id === u.id;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                      data-testid={`admin-user-row-${u.id}`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.fullName || 'U'} url={u.avatarUrl} size="w-10 h-10" />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openInspectModal(u)}
                                className="hover:text-emerald-600 dark:hover:text-emerald-400 truncate cursor-pointer text-left"
                              >
                                {u.fullName}
                              </button>
                              <span className="text-xs font-mono text-slate-400">#{u.id}</span>
                              {u.isEmailVerified && (
                                <span title={isVi ? 'Email đã xác thực' : 'Verified Email'}>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                </span>
                              )}
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  {isVi ? 'Bạn' : 'You'}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.companyName ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50/70 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg border border-teal-200/60 dark:border-teal-800/60">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{u.companyName}</span>
                          </div>
                        ) : u.candidateHeadline ? (
                          <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                            {u.candidateHeadline}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            {isVi ? 'Quản trị viên hệ thống' : 'System Administrator'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">{u.roles.map(roleBadge)}</div>
                      </td>

                      <td className="py-3.5 px-4">{statusBadge(u.status)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openInspectModal(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition cursor-pointer"
                            title={isVi ? 'Xem chi tiết & quản lý trạng thái' : 'Inspect user dossier & status'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isVi ? 'Chi tiết' : 'Inspect'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openRoleModal(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200/70 dark:border-emerald-800 transition cursor-pointer"
                            data-testid={`btn-edit-roles-${u.id}`}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{isVi ? 'Phân quyền' : 'Permissions'}</span>
                          </button>

                          {!isSelf && (
                            <>
                              {u.status === 'ACTIVE' ? (
                                <button
                                  type="button"
                                  disabled={savingAction}
                                  onClick={() => handleStatusChange(u, 'SUSPENDED')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200/70 dark:border-amber-800 transition cursor-pointer"
                                  data-testid={`btn-suspend-user-${u.id}`}
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>{isVi ? 'Tạm khóa' : 'Suspend'}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={savingAction}
                                  onClick={() => handleStatusChange(u, 'ACTIVE')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                                  data-testid={`btn-activate-user-${u.id}`}
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>{isVi ? 'Mở khóa' : 'Activate'}</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Dossier & Account Status Governance Modal */}
      {inspectingUser && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onMouseDown={() => setInspectingUser(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl my-8"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Avatar name={inspectingUser.fullName || 'U'} url={inspectingUser.avatarUrl} size="w-12 h-12" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {inspectingUser.fullName}
                    </h3>
                    {statusBadge(inspectingUser.status)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    ID #{inspectingUser.id} · UUID: {inspectingUser.uuid}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-xs">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-400 block">{isVi ? 'Địa chỉ Email' : 'Email Address'}</span>
                    <strong className="text-slate-900 dark:text-white truncate block">{inspectingUser.email}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">{isVi ? 'Số điện thoại' : 'Phone Number'}</span>
                    <strong className="text-slate-900 dark:text-white">{inspectingUser.phone || '—'}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-400 block">{isVi ? 'Đơn vị / Chức danh' : 'Organization / Title'}</span>
                    <strong className="text-slate-900 dark:text-white truncate block">
                      {inspectingUser.companyName || inspectingUser.candidateHeadline || 'System Administration'}
                    </strong>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">{isVi ? 'Ngày tham gia' : 'Registered Date'}</span>
                    <strong className="text-slate-900 dark:text-white">
                      {inspectingUser.createdAt
                        ? new Date(inspectingUser.createdAt).toLocaleDateString(isVi ? 'vi-VN' : 'en-US')
                        : '—'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Roles summary */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    {isVi ? 'Vai trò RBAC hiện tại' : 'Assigned RBAC Roles'}
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">{inspectingUser.roles.map(roleBadge)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectingUser;
                    setInspectingUser(null);
                    openRoleModal(target);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                >
                  {isVi ? 'Đổi phân quyền' : 'Edit Roles'}
                </button>
              </div>

              {/* Status Governance Controls (Only for non-self accounts) */}
              {currentAdmin?.id !== inspectingUser.id && (
                <div className="pt-2 space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                    {isVi ? 'Cập nhật Trạng thái Tài khoản & Ghi chú Audit' : 'Update Account Status & Audit Reason'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'ACTIVE', label: isVi ? 'ACTIVE (Hoạt động)' : 'ACTIVE', icon: CheckCircle2 },
                      { code: 'SUSPENDED', label: isVi ? 'SUSPENDED (Tạm khóa)' : 'SUSPENDED', icon: Lock },
                      { code: 'BANNED', label: isVi ? 'BANNED (Cấm vĩnh viễn)' : 'BANNED', icon: Ban },
                    ].map((st) => {
                      const Icon = st.icon;
                      const selected = statusTarget === st.code;
                      return (
                        <button
                          key={st.code}
                          type="button"
                          onClick={() => setStatusTarget(st.code)}
                          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            selected
                              ? st.code === 'ACTIVE'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : st.code === 'SUSPENDED'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{st.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder={
                        isVi
                          ? 'Nhập lý do thay đổi trạng thái (lưu vào Audit Log & gửi thông báo)...'
                          : 'Enter reason for status change (recorded in Audit Trail & notification)...'
                      }
                      className={inputCls}
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {presetReasons.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setStatusReason(r)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 transition cursor-pointer"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>
              {currentAdmin?.id !== inspectingUser.id && (
                <button
                  type="button"
                  disabled={savingAction}
                  onClick={() => handleStatusChange(inspectingUser, statusTarget, statusReason)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 cursor-pointer"
                >
                  {savingAction
                    ? isVi
                      ? 'Đang cập nhật...'
                      : 'Updating...'
                    : isVi
                    ? `Áp dụng trạng thái ${statusTarget}`
                    : `Apply ${statusTarget} Status`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit RBAC Roles Modal */}
      {editingRoleUser && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={() => setEditingRoleUser(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {isVi ? 'Cấu hình Quyền RBAC' : 'Configure RBAC Permissions'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editingRoleUser.fullName} ({editingRoleUser.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoleUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-2.5">
              {allRoles.map((r) => {
                const checked = selectedRoles.includes(r.code);
                return (
                  <label
                    key={r.code}
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                      checked
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-bold block text-slate-900 dark:text-white">
                        {r.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                        {r.desc}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRoleInModal(r.code)}
                      className="w-4 h-4 mt-1 accent-emerald-600 shrink-0"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingRoleUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {isVi ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={savingAction || selectedRoles.length === 0}
                onClick={saveRoles}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 cursor-pointer shadow-soft-xs"
                data-testid="btn-save-user-roles"
              >
                {savingAction
                  ? isVi
                    ? 'Đang lưu...'
                    : 'Saving...'
                  : isVi
                  ? 'Lưu phân quyền RBAC'
                  : 'Save RBAC Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
