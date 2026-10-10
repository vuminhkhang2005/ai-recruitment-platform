import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, CheckCircle2, AlertCircle, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { teamApi } from '../lib/api';
import type { InvitationPreview } from '../lib/types';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const AcceptInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { setUserSession } = useAuth();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    teamApi
      .previewInvitation(token)
      .then((data) => {
        setPreview(data);
        if (data.fullName) setFullName(data.fullName);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : isVi ? 'Lời mời không hợp lệ hoặc đã hết hạn' : 'Invalid or expired invitation');
      })
      .finally(() => setLoading(false));
  }, [token, isVi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!fullName.trim()) {
      setError(isVi ? 'Vui lòng nhập họ và tên' : 'Please enter your full name');
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError(isVi ? 'Mật khẩu cần tối thiểu 8 ký tự, gồm cả chữ và số' : 'Password must be at least 8 characters with both letters and numbers');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await teamApi.acceptInvitation(token, {
        fullName: fullName.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      setUserSession(res);
      navigate('/employer');
    } catch (err) {
      setError(err instanceof Error ? err.message : isVi ? 'Không thể kích hoạt tài khoản' : 'Failed to activate account');
    } finally {
      setSubmitting(false);
    }
  };

  const roleName = (role?: string) => {
    if (role === 'ADMIN') return isVi ? 'Quản trị viên tuyển dụng' : 'Hiring Administrator';
    if (role === 'INTERVIEWER') return isVi ? 'Người phỏng vấn' : 'Interviewer';
    return isVi ? 'Chuyên viên tuyển dụng' : 'Recruiter';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error && !preview) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {isVi ? 'Không thể mở lời mời' : 'Unable to open invitation'}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            {isVi ? 'Quay lại Đăng nhập' : 'Back to Login'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white text-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {isVi ? 'Gia nhập Đội ngũ Tuyển dụng' : 'Join the Hiring Team'}
          </h1>
          <p className="text-emerald-100 text-sm">
            {preview?.companyName || 'TalentBridge Enterprise'}
          </p>
        </div>

        <div className="p-8">
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Email công việc:' : 'Work Email:'}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{preview?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Vai trò phân công:' : 'Assigned Role:'}</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                {roleName(preview?.teamRole)}
              </span>
            </div>
            {preview?.invitedByName && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Người mời:' : 'Invited by:'}</span>
                <span className="text-slate-700 dark:text-slate-300">{preview.invitedByName}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Họ và tên' : 'Full Name'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="accept-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isVi ? 'Nguyễn Văn A' : 'John Doe'}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Thiết lập mật khẩu' : 'Create Password'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="accept-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isVi ? 'Tối thiểu 8 ký tự gồm chữ & số' : 'Min 8 chars with letters & numbers'}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Số điện thoại (tùy chọn)' : 'Phone Number (optional)'}
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isVi ? 'Kích hoạt tài khoản & Tham gia' : 'Activate Account & Join'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{isVi ? 'Bảo mật bởi hệ thống TalentBridge Enterprise ATS' : 'Secured by TalentBridge Enterprise ATS'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
