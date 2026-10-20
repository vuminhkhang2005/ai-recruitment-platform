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
  if (user.roles.includes('ROLE_ADMIN')) return '/admin';
  return user.roles.includes('ROLE_RECRUITER') ? '/employer' : '/';
}

const GoogleIcon: React.FC = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2H12z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1l-3.3 2.5C4.8 19.8 8.1 22 12 22z"
    />
    <path
      fill="#4A90E2"
      d="M6.4 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L3.1 7.6C2.4 9 2 10.4 2 12s.4 3 1.1 4.4l3.3-2.5z"
    />
    <path
      fill="#FBBC05"
      d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.7 2 12 2 8.1 2 4.8 4.2 3.1 7.6l3.3 2.5c.8-2.3 3-4.2 5.6-4.2z"
    />
  </svg>
);

const LinkedInIcon: React.FC = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const SocialOAuth2Buttons: React.FC<{
  loading: boolean;
  onSelectProvider: (provider: 'google' | 'linkedin') => void;
  isVi: boolean;
}> = ({ loading, onSelectProvider, isVi }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        disabled={loading}
        onClick={() => onSelectProvider('google')}
        data-testid="oauth2-google-btn"
        className="py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all shadow-soft-xs cursor-pointer active:scale-95 disabled:opacity-60"
      >
        <GoogleIcon />
        <span>Google (Gmail)</span>
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => onSelectProvider('linkedin')}
        data-testid="oauth2-linkedin-btn"
        className="py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all shadow-soft-xs cursor-pointer active:scale-95 disabled:opacity-60"
      >
        <LinkedInIcon />
        <span>LinkedIn</span>
      </button>
    </div>

    <div className="relative flex py-1 items-center">
      <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
      <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
        {isVi ? 'Hoặc tiếp tục với Email' : 'Or continue with Email'}
      </span>
      <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
    </div>
  </div>
);

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
  const { login, loginWithOAuth2, user } = useAuth();
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

  const quickDemoLogin = async (demoEmail: string, demoPass = 'Password@123') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    try {
      const u = await login(demoEmail, demoPass);
      navigate(next ?? homeFor(u), { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth2 = async (provider: 'google' | 'linkedin') => {
    setError(null);
    setLoading(true);
    try {
      const u = await loginWithOAuth2(provider);
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
      <SocialOAuth2Buttons loading={loading} onSelectProvider={handleOAuth2} isVi={isVi} />

      <form onSubmit={submit} className="space-y-4 mt-3">
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

        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isVi ? '⚡ Đăng nhập nhanh Demo (MySQL):' : '⚡ Quick Demo Login (MySQL):'}
            </p>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              Pass: Password@123
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => quickDemoLogin('nguyenvanan.it@gmail.com')}
              className="px-2.5 py-2 rounded-xl text-left border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer"
              data-testid="demo-login-candidate"
              title="nguyenvanan.it@gmail.com / Password@123"
            >
              <div className="text-xs font-bold">{isVi ? 'Ứng viên' : 'Candidate'}</div>
              <div className="text-[10px] opacity-75 truncate">nguyenvanan.it@gmail.com</div>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => quickDemoLogin('recruiter.fpt@fpt.com')}
              className="px-2.5 py-2 rounded-xl text-left border border-teal-200 dark:border-teal-800/70 bg-teal-50/70 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition cursor-pointer"
              data-testid="demo-login-recruiter"
              title="recruiter.fpt@fpt.com / Password@123"
            >
              <div className="text-xs font-bold">{isVi ? 'Nhà tuyển dụng' : 'Recruiter'}</div>
              <div className="text-[10px] opacity-75 truncate">recruiter.fpt@fpt.com</div>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => quickDemoLogin('admin@talentbridge.vn')}
              className="px-2.5 py-2 rounded-xl text-left border border-indigo-200 dark:border-indigo-800/70 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer"
              data-testid="demo-login-admin"
              title="admin@talentbridge.vn / Password@123"
            >
              <div className="text-xs font-bold">{isVi ? 'Quản trị Admin' : 'Admin'}</div>
              <div className="text-[10px] opacity-75 truncate">admin@talentbridge.vn</div>
            </button>
          </div>
        </div>
      </form>
    </AuthShell>
  );
};

export const RegisterPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  usePageTitle(isVi ? 'Đăng ký' : 'Sign Up');
  const { register, loginWithOAuth2, user } = useAuth();
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

  const handleOAuth2 = async (provider: 'google' | 'linkedin') => {
    setError(null);
    setLoading(true);
    try {
      const u = await loginWithOAuth2(provider);
      navigate(next ?? homeFor(u), { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

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
      <SocialOAuth2Buttons loading={loading} onSelectProvider={handleOAuth2} isVi={isVi} />
      <form onSubmit={submit} className="space-y-4 mt-3">
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
