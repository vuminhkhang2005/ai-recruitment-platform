import React, { useEffect, useState } from 'react';
import {
  Ban,
  CheckCircle2,
  KeyRound,
  Lock,
  RefreshCw,
  Search,
  Shield,
  Unlock,
  Users,
  X,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import type { AdminUser } from '../../lib/types';
import { ErrorBox, PageLoader, inputCls } from '../../components/ui/primitives';
import { usePageTitle } from '../../lib/usePageTitle';
import { useAuth } from '../../context/AuthContext';
import { AdminHeader } from './AdminHeader';

const ALL_ROLES = [
  { code: 'ROLE_CANDIDATE', label: 'Ứng viên (ROLE_CANDIDATE)' },
  { code: 'ROLE_RECRUITER', label: 'Nhà tuyển dụng (ROLE_RECRUITER)' },
  { code: 'ROLE_HIRING_MANAGER', label: 'Quản lý tuyển dụng (ROLE_HIRING_MANAGER)' },
  { code: 'ROLE_ADMIN', label: 'Quản trị viên (ROLE_ADMIN)' },
];

export const AdminUsersPage: React.FC = () => {
  usePageTitle('Quản lý Người dùng & Phân quyền RBAC');
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Role modal state
  const [editingRoleUser, setEditingRoleUser] = useState<AdminUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [savingAction, setSavingAction] = useState(false);

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleStatusChange = async (target: AdminUser, nextStatus: string) => {
    setSavingAction(true);
    setError(null);
    try {
      const updated = await adminApi.updateUserStatus(
        target.id,
        nextStatus,
        `Cập nhật trạng thái sang ${nextStatus} bởi Quản trị viên`
      );
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(`Đã chuyển trạng thái tài khoản "${target.fullName}" sang ${nextStatus}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingAction(false);
    }
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
      showToast(`Đã cập nhật quyền RBAC cho "${editingRoleUser.fullName}"`);
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
        ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300/60 dark:border-purple-800'
        : role === 'ROLE_RECRUITER' || role === 'ROLE_HIRING_MANAGER'
        ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-800'
        : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" data-testid="admin-users-page">
      <AdminHeader
        title="Quản lý Tài khoản Người dùng & Phân quyền RBAC"
        subtitle="Tra cứu, lọc theo vai trò/trạng thái, khóa hoặc mở khóa tài khoản vi phạm và cấp phát quyền RBAC thời gian thực."
        rightSlot={
          <button
            type="button"
            onClick={loadUsers}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-bold border border-white/20 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tải lại ({users.length})</span>
          </button>
        }
      />

      {toast && (
        <div
          className="mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-4 py-3 text-sm font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-soft-xs"
          data-testid="admin-user-toast"
        >
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="text-emerald-600 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6">
          <ErrorBox message={error} />
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-soft-xs">
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
              placeholder="Tìm theo họ tên, email hoặc số điện thoại..."
              className={`${inputCls} pl-10`}
              data-testid="admin-user-search-input"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={inputCls}
              data-testid="admin-user-role-filter"
            >
              <option value="ALL">Tất cả vai trò (RBAC)</option>
              <option value="ROLE_CANDIDATE">Ứng viên (CANDIDATE)</option>
              <option value="ROLE_RECRUITER">Nhà tuyển dụng (RECRUITER)</option>
              <option value="ROLE_HIRING_MANAGER">Hiring Manager</option>
              <option value="ROLE_ADMIN">Quản trị viên (ADMIN)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputCls}
              data-testid="admin-user-status-filter"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="ACTIVE">ACTIVE (Hoạt động)</option>
              <option value="SUSPENDED">SUSPENDED (Tạm khóa)</option>
              <option value="BANNED">BANNED (Cấm vĩnh viễn)</option>
              <option value="PENDING_VERIFY">PENDING_VERIFY</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition cursor-pointer"
              data-testid="admin-user-search-btn"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      {loading ? (
        <PageLoader />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">ID / Tài khoản</th>
                  <th className="py-3.5 px-4">Đơn vị / Chức danh</th>
                  <th className="py-3.5 px-4">Vai trò (RBAC)</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác Quản trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {users.map((u) => {
                  const isSelf = currentAdmin?.id === u.id;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                      data-testid={`admin-user-row-${u.id}`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              <span className="text-xs font-normal text-slate-400">#{u.id}</span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.companyName ? (
                          <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                            Doanh nghiệp: {u.companyName}
                          </span>
                        ) : u.candidateHeadline ? (
                          <span className="text-xs text-slate-600 dark:text-slate-300">
                            {u.candidateHeadline}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Quản trị hệ thống</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">{u.roles.map(roleBadge)}</div>
                      </td>

                      <td className="py-3.5 px-4">{statusBadge(u.status)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openRoleModal(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200/70 dark:border-indigo-800 transition cursor-pointer"
                            data-testid={`btn-edit-roles-${u.id}`}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Phân quyền</span>
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
                                  <span>Tạm khóa</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={savingAction}
                                  onClick={() => handleStatusChange(u, 'ACTIVE')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200/70 dark:border-emerald-800 transition cursor-pointer"
                                  data-testid={`btn-activate-user-${u.id}`}
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Mở khóa</span>
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

      {/* Edit RBAC Roles Modal */}
      {editingRoleUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Cấu hình Quyền RBAC
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoleUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tài khoản: <strong className="text-slate-900 dark:text-white">{editingRoleUser.fullName}</strong> ({editingRoleUser.email})
              </p>

              <div className="mt-4 space-y-2.5">
                {ALL_ROLES.map((r) => {
                  const checked = selectedRoles.includes(r.code);
                  return (
                    <label
                      key={r.code}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                        checked
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-bold">{r.label}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRoleInModal(r.code)}
                        className="w-4 h-4 accent-indigo-600"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingRoleUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={savingAction || selectedRoles.length === 0}
                onClick={saveRoles}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 cursor-pointer"
                data-testid="btn-save-user-roles"
              >
                {savingAction ? 'Đang lưu...' : 'Lưu phân quyền RBAC'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
