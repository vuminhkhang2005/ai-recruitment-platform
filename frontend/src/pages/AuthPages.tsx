import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { companyApi } from '../lib/api';
import type { Company, UserSummary } from '../lib/types';
import { ErrorBox, btnPrimary, inputCls } from '../components/ui/primitives';
import { usePageTitle } from '../lib/usePageTitle';
import { useLanguage } from '../i18n/LanguageContext';

/** Only allow in-app relative redirects. */
function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null;
}

function homeFor(user: UserSummary) {
  return user.roles.includes('ROLE_RECRUITER') ? '/employer' : '/';
}

const AuthShell: React.FC<{ title: string; subtitle?: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="relative min-h-[calc(100vh-5rem)] py-12 px-4 overflow-hidden">
    <div className="absolute inset-0 hero-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
    <div className="relative max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-7 sm:p-8 shadow-[0_15px_45px_-12px_rgba(16,185,129,0.18)]">
      <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-soft">
        <Briefcase className="w-6 h-6" />
      </span>
      <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  </div>
);

export const LoginPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  usePageTitle(isVi ? 'Đăng nhập' : 'Sign In');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(next ?? homeFor(user), { replace: true });
  }, [user, next, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const u = await login(email, password);
      navigate(next ?? homeFor(u), { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={isVi ? "Đăng nhập" : "Sign In"}
      subtitle={
        <>
          {isVi ? 'Chưa có tài khoản? ' : "Don't have an account? "}
          <Link to={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            {isVi ? 'Đăng ký' : 'Sign Up'}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} mt-1`} />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {isVi ? 'Mật khẩu' : 'Password'}
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputCls} mt-1`}
          />
        </div>
        {error && <ErrorBox message={error} />}
        <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-2.5`}>
          {loading ? (isVi ? 'Đang đăng nhập…' : 'Signing In...') : (isVi ? 'Đăng nhập' : 'Sign In')}
        </button>
      </form>
    </AuthShell>
  );
};

export const RegisterPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  usePageTitle(isVi ? 'Đăng ký' : 'Sign Up');
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [role, setRole] = useState<'ROLE_CANDIDATE' | 'ROLE_RECRUITER'>(params.get('role') === 'recruiter' ? 'ROLE_RECRUITER' : 'ROLE_CANDIDATE');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '', phone: '' });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string>('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isRecruiter = role === 'ROLE_RECRUITER';

  useEffect(() => {
    if (user) navigate(next ?? homeFor(user), { replace: true });
  }, [user, next, navigate]);

  useEffect(() => {
    if (isRecruiter && companies.length === 0) {
      companyApi
        .list()
        .then((l) => setCompanies([...l].sort((a, b) => a.name.localeCompare(b.name))))
        .catch(() => undefined);
    }
  }, [isRecruiter, companies.length]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) return setError(isVi ? 'Mật khẩu tối thiểu 6 ký tự.' : 'Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError(isVi ? 'Mật khẩu nhập lại không khớp.' : 'Passwords do not match.');
    if (isRecruiter && !companyId) return setError(isVi ? 'Vui lòng chọn công ty của bạn.' : 'Please select your company.');
    if (isRecruiter && companyId === 'new' && !companyName.trim()) return setError(isVi ? 'Vui lòng nhập tên công ty.' : 'Please enter company name.');
    setLoading(true);
    try {
      const u = await register({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        role,
        companyId: isRecruiter && companyId !== 'new' ? Number(companyId) : undefined,
        companyName: isRecruiter && companyId === 'new' ? companyName.trim() : undefined,
      });
      navigate(next ?? (u.roles.includes('ROLE_RECRUITER') ? '/employer' : '/profile'), { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const tab = (r: typeof role, text: string) => (
    <button
      type="button"
      onClick={() => setRole(r)}
      aria-pressed={role === r}
      className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
        role === r ? 'bg-emerald-600 text-white shadow-soft-xs' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'
      }`}
    >
      {text}
    </button>
  );

  return (
    <AuthShell
      title={isVi ? "Tạo tài khoản" : "Create Account"}
      subtitle={
        <>
          {isVi ? 'Đã có tài khoản? ' : 'Already have an account? '}
          <Link to={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            {isVi ? 'Đăng nhập' : 'Sign In'}
          </Link>
        </>
      }
    >
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 mb-5">
        {tab('ROLE_CANDIDATE', isVi ? 'Tôi tìm việc' : 'Job Seeker')}
        {tab('ROLE_RECRUITER', isVi ? 'Tôi tuyển dụng' : 'Employer')}
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {isVi ? 'Họ và tên' : 'Full Name'}
          </label>
          <input id="fullName" required value={form.fullName} onChange={set('fullName')} className={`${inputCls} mt-1`} />
        </div>
        <div>
          <label htmlFor="reg-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {isRecruiter ? (isVi ? 'Email công việc' : 'Work Email') : 'Email'}
          </label>
          <input id="reg-email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} className={`${inputCls} mt-1`} />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {isVi ? 'Số điện thoại ' : 'Phone Number '}
            <span className="font-normal text-slate-400">({isVi ? 'không bắt buộc' : 'optional'})</span>
          </label>
          <input id="phone" type="tel" value={form.phone} onChange={set('phone')} className={`${inputCls} mt-1`} />
        </div>
        {isRecruiter && (
          <div>
            <label htmlFor="company" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isVi ? 'Công ty' : 'Company'}
            </label>
            <select id="company" value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={`${inputCls} mt-1`}>
              <option value="">{isVi ? '-- Chọn công ty --' : '-- Select company --'}</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="new">{isVi ? 'Công ty chưa có trong danh sách…' : 'Company not listed...'}</option>
            </select>
            {companyId === 'new' && (
              <>
                <input
                  aria-label={isVi ? "Tên công ty" : "Company Name"}
                  placeholder={isVi ? "Tên công ty" : "Company Name"}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={200}
                  className={`${inputCls} mt-2`}
                />
                <p className="mt-1 text-xs text-slate-500">{isVi ? 'Công ty mới sẽ ở trạng thái chờ xác minh.' : 'New company will be in pending verification status.'}</p>
              </>
            )}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isVi ? 'Mật khẩu' : 'Password'}
            </label>
            <input id="reg-password" type="password" required autoComplete="new-password" value={form.password} onChange={set('password')} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label htmlFor="confirm" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isVi ? 'Nhập lại mật khẩu' : 'Confirm Password'}
            </label>
            <input id="confirm" type="password" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} className={`${inputCls} mt-1`} />
          </div>
        </div>
        {error && <ErrorBox message={error} />}
        <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-2.5`}>
          {loading ? (isVi ? 'Đang tạo tài khoản…' : 'Creating Account...') : isRecruiter ? (isVi ? 'Tạo tài khoản nhà tuyển dụng' : 'Register Employer Account') : (isVi ? 'Đăng ký' : 'Sign Up')}
        </button>
      </form>
    </AuthShell>
  );
};
