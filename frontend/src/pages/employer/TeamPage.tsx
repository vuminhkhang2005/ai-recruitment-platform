import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  MoreVertical,
  RotateCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  X,
} from 'lucide-react';
import { teamApi } from '../../lib/api';
import type { TeamOverview, TeamMember, TeamInvitation } from '../../lib/types';
import { useLanguage } from '../../i18n/LanguageContext';

export const TeamPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteTitle, setInviteTitle] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'RECRUITER' | 'INTERVIEWER'>('RECRUITER');
  const [inviting, setInviting] = useState(false);

  // Edit member modal
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<string>('RECRUITER');
  const [editTitle, setEditTitle] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamApi.overview();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : isVi ? 'Không thể tải thông tin đội ngũ' : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [isVi]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      setInviting(true);
      setError(null);
      await teamApi.invite({
        email: inviteEmail.trim(),
        fullName: inviteName.trim() || undefined,
        jobTitle: inviteTitle.trim() || undefined,
        teamRole: inviteRole,
      });
      setSuccess(isVi ? 'Đã gửi lời mời tham gia thành công!' : 'Invitation sent successfully!');
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteName('');
      setInviteTitle('');
      fetchOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : isVi ? 'Gửi lời mời thất bại' : 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (inv: TeamInvitation) => {
    try {
      setError(null);
      await teamApi.resendInvitation(inv.id);
      setSuccess(isVi ? `Đã gửi lại lời mời đến ${inv.email}` : `Resent invitation to ${inv.email}`);
      fetchOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resend failed');
    }
  };

  const handleRevoke = async (inv: TeamInvitation) => {
    if (!window.confirm(isVi ? `Thu hồi lời mời của ${inv.email}?` : `Revoke invitation for ${inv.email}?`)) return;
    try {
      setError(null);
      await teamApi.revokeInvitation(inv.id);
      setSuccess(isVi ? 'Đã thu hồi lời mời' : 'Invitation revoked');
      fetchOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revoke failed');
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      setSavingEdit(true);
      setError(null);
      await teamApi.updateMember(editingMember.recruiterProfileId, {
        teamRole: editRole,
        jobTitle: editTitle.trim() || undefined,
      });
      setSuccess(isVi ? 'Đã cập nhật thông tin thành viên' : 'Member updated successfully');
      setEditingMember(null);
      fetchOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleDeactivate = async (member: TeamMember) => {
    const isSuspended = member.status === 'SUSPENDED';
    const actionText = isSuspended
      ? isVi ? 'Kích hoạt lại tài khoản này?' : 'Reactivate this account?'
      : isVi ? 'Vô hiệu hoá tài khoản thành viên này?' : 'Deactivate this member account?';
    if (!window.confirm(actionText)) return;

    try {
      setError(null);
      if (isSuspended) {
        await teamApi.reactivateMember(member.recruiterProfileId);
        setSuccess(isVi ? 'Đã kích hoạt lại tài khoản' : 'Account reactivated');
      } else {
        await teamApi.deactivateMember(member.recruiterProfileId);
        setSuccess(isVi ? 'Đã vô hiệu hoá tài khoản' : 'Account deactivated');
      }
      fetchOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const roleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
          <ShieldAlert className="w-3 h-3" />
          {isVi ? 'Quản trị viên' : 'Admin'}
        </span>
      );
    }
    if (role === 'INTERVIEWER') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
          <Shield className="w-3 h-3" />
          {isVi ? 'Người phỏng vấn' : 'Interviewer'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
        <ShieldCheck className="w-3 h-3" />
        {isVi ? 'Chuyên viên tuyển dụng' : 'Recruiter'}
      </span>
    );
  };

  const isAdmin = overview?.myRole === 'ADMIN';

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            {isVi ? 'Đội ngũ tuyển dụng' : 'Hiring Team'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            {isVi
              ? `Quản lý thành viên và phân quyền trong doanh nghiệp ${overview?.companyName || ''}`
              : `Manage team members and permissions at ${overview?.companyName || ''}`}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isVi ? 'Mời thành viên mới' : 'Invite Member'}</span>
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Members list */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {isVi ? 'Thành viên hiện tại' : 'Active Members'} ({overview?.members.length || 0})
          </h2>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {overview?.members.map((m) => (
            <div
              key={m.recruiterProfileId}
              data-testid="team-member-row"
              className={`p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:bg-slate-50/50 dark:hover:bg-slate-700/30 ${
                m.status === 'SUSPENDED' ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-base">
                  {m.fullName ? m.fullName.charAt(0).toUpperCase() : m.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {m.fullName || m.email}
                    </span>
                    {m.me && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {isVi ? 'Bạn' : 'You'}
                      </span>
                    )}
                    {roleBadge(m.teamRole)}
                    {m.status === 'SUSPENDED' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                        {isVi ? 'Đã vô hiệu hoá' : 'Suspended'}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap gap-x-4">
                    <span>{m.email}</span>
                    {m.jobTitle && <span className="text-slate-600 dark:text-slate-300">{m.jobTitle}</span>}
                  </div>
                </div>
              </div>

              {isAdmin && !m.me && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setEditingMember(m);
                      setEditRole(m.teamRole);
                      setEditTitle(m.jobTitle || '');
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                  >
                    {isVi ? 'Chỉnh sửa' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleToggleDeactivate(m)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                      m.status === 'SUSPENDED'
                        ? 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        : 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                    }`}
                  >
                    {m.status === 'SUSPENDED'
                      ? isVi ? 'Kích hoạt lại' : 'Reactivate'
                      : isVi ? 'Vô hiệu hoá' : 'Deactivate'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending invitations */}
      {isAdmin && overview?.pendingInvitations && overview.pendingInvitations.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{isVi ? 'Lời mời đang chờ kích hoạt' : 'Pending Invitations'} ({overview.pendingInvitations.length})</span>
            </h2>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {overview.pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{inv.email}</span>
                    {roleBadge(inv.teamRole)}
                    {inv.expired && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {isVi ? 'Đã hết hạn' : 'Expired'}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {inv.fullName && <span className="mr-3">{inv.fullName}</span>}
                    {inv.jobTitle && <span className="mr-3 text-slate-600 dark:text-slate-300">{inv.jobTitle}</span>}
                    {inv.invitedByName && (
                      <span>{isVi ? `Được mời bởi ${inv.invitedByName}` : `Invited by ${inv.invitedByName}`}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleResend(inv)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Gửi lại' : 'Resend'}</span>
                  </button>
                  <button
                    onClick={() => handleRevoke(inv)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Thu hồi' : 'Revoke'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {isVi ? 'Mời đồng nghiệp vào đội ngũ' : 'Invite Team Member'}
              </h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Email công việc' : 'Work Email'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Họ và tên' : 'Full Name'}
                </label>
                <input
                  id="invite-fullname"
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder={isVi ? 'Nguyễn Văn B' : 'Jane Doe'}
                  className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Chức danh công việc' : 'Job Title'}
                </label>
                <input
                  id="invite-title"
                  type="text"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  placeholder={isVi ? 'Engineering Manager / Lead' : 'Engineering Lead'}
                  className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Phân quyền vai trò' : 'Assigned Role'} <span className="text-red-500">*</span>
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="RECRUITER">
                    {isVi ? 'Chuyên viên tuyển dụng (Đăng tin, duyệt hồ sơ, nhắn tin)' : 'Recruiter (Post jobs, manage candidates)'}
                  </option>
                  <option value="INTERVIEWER">
                    {isVi ? 'Người phỏng vấn (Chỉ xem hồ sơ được phân công, chấm điểm)' : 'Interviewer (Review assigned panel, submit scorecards)'}
                  </option>
                  <option value="ADMIN">
                    {isVi ? 'Quản trị viên công ty (Toàn quyền quản lý đội ngũ & công ty)' : 'Admin (Full enterprise permissions)'}
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {inviting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isVi ? 'Gửi thư mời' : 'Send Invite'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isVi ? 'Cập nhật thành viên' : 'Edit Member'}
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Họ tên & Email' : 'Name & Email'}
                </label>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {editingMember.fullName || editingMember.email} ({editingMember.email})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Chức danh' : 'Job Title'}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Vai trò phân quyền' : 'Role'}
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="ADMIN">{isVi ? 'Quản trị viên công ty' : 'Company Admin'}</option>
                  <option value="RECRUITER">{isVi ? 'Chuyên viên tuyển dụng' : 'Recruiter'}</option>
                  <option value="INTERVIEWER">{isVi ? 'Người phỏng vấn' : 'Interviewer'}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {savingEdit ? (isVi ? 'Đang lưu...' : 'Saving...') : isVi ? 'Lưu thay đổi' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
