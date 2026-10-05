import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { companyApi } from '../lib/api';
import type { Company, UserSummary } from '../lib/types';
import { ErrorBox, btnPrimary, inputCls } from '../components/ui/primitives';
import { usePageTitle } from '../lib/usePageTitle';

/** Only allow in-app relative redirects. */
function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null;
}

function homeFor(user: UserSummary) {
  return user.roles.includes('ROLE_RECRUITER') ? '/employer' : '/';
}

const AuthShell: React.FC<{ title: string; subtitle?: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4">
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-7 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  </div>
);

export const LoginPage: React.FC = () => {
  usePageTitle('Đăng nhập');
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
      title="Đăng nhập"
      subtitle={
        <>
          Chưa có tài khoản?{' '}
          <Link to={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-red-600 font-medium hover:underline">
            Đăng ký
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} mt-1`} />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Mật khẩu
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
          {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>
    </AuthShell>
  );
};

export const RegisterPage: React.FC = () => {
  usePageTitle('Đăng ký');
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
    if (form.password.length < 6) return setError('Mật khẩu tối thiểu 6 ký tự.');
    if (form.password !== form.confirm) return setError('Mật khẩu nhập lại không khớp.');
    if (isRecruiter && !companyId) return setError('Vui lòng chọn công ty của bạn.');
    if (isRecruiter && companyId === 'new' && !companyName.trim()) return setError('Vui lòng nhập tên công ty.');
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
      className={`flex-1 py-2 text-sm font-semibold rounded-md ${role === r ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
    >
      {text}
    </button>
  );

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle={
        <>
          Đã có tài khoản?{' '}
          <Link to={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-red-600 font-medium hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-5">
        {tab('ROLE_CANDIDATE', 'Tôi tìm việc')}
        {tab('ROLE_RECRUITER', 'Tôi tuyển dụng')}
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
            Họ và tên
          </label>
          <input id="fullName" required value={form.fullName} onChange={set('fullName')} className={`${inputCls} mt-1`} />
        </div>
        <div>
          <label htmlFor="reg-email" className="text-sm font-medium text-slate-700">
            {isRecruiter ? 'Email công việc' : 'Email'}
          </label>
          <input id="reg-email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} className={`${inputCls} mt-1`} />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-slate-700">
            Số điện thoại <span className="font-normal text-slate-400">(không bắt buộc)</span>
          </label>
          <input id="phone" type="tel" value={form.phone} onChange={set('phone')} className={`${inputCls} mt-1`} />
        </div>
        {isRecruiter && (
          <div>
            <label htmlFor="company" className="text-sm font-medium text-slate-700">
              Công ty
            </label>
            <select id="company" value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={`${inputCls} mt-1`}>
              <option value="">-- Chọn công ty --</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="new">Công ty chưa có trong danh sách…</option>
            </select>
            {companyId === 'new' && (
              <>
                <input
                  aria-label="Tên công ty"
                  placeholder="Tên công ty"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={200}
                  className={`${inputCls} mt-2`}
                />
                <p className="mt-1 text-xs text-slate-500">Công ty mới sẽ ở trạng thái chờ xác minh.</p>
              </>
            )}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-password" className="text-sm font-medium text-slate-700">
              Mật khẩu
            </label>
            <input id="reg-password" type="password" required autoComplete="new-password" value={form.password} onChange={set('password')} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label htmlFor="confirm" className="text-sm font-medium text-slate-700">
              Nhập lại mật khẩu
            </label>
            <input id="confirm" type="password" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} className={`${inputCls} mt-1`} />
          </div>
        </div>
        {error && <ErrorBox message={error} />}
        <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-2.5`}>
          {loading ? 'Đang tạo tài khoản…' : isRecruiter ? 'Tạo tài khoản nhà tuyển dụng' : 'Đăng ký'}
        </button>
      </form>
    </AuthShell>
  );
};
