import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, ExternalLink, KeyRound, ShieldCheck, UserPlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi, companyApi, type OAuth2LoginPayload } from '../lib/api';
import type { Company, UserSummary } from '../lib/types';
import { ErrorBox, btnPrimary, inputCls } from '../components/ui/primitives';
import { usePageTitle } from '../lib/usePageTitle';
import { useLanguage } from '../i18n/LanguageContext';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string; error_description?: string }) => void;
          }) => { requestAccessToken: (overrideConfig?: { prompt?: string }) => void };
        };
      };
    };
  }
}

const LS_GOOGLE_CLIENT_ID = 'tb_oauth2_google_client_id';
const LS_LINKEDIN_CLIENT_ID = 'tb_oauth2_linkedin_client_id';

/** Dynamically load Google Identity Services (GIS) script from accounts.google.com */
function loadGoogleGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Không thể tải Google Identity Services SDK')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Không thể kết nối tới accounts.google.com/gsi/client'));
    document.head.appendChild(script);
  });
}

/** Only allow in-app relative redirects. */
function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null;
}

function homeFor(user: UserSummary) {
  if (user.roles.includes('ROLE_ADMIN')) return '/admin';
  return user.roles.includes('ROLE_RECRUITER') ? '/employer' : '/';
}

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 shrink-0' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 shrink-0' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

interface OAuth2PresetAccount {
  email: string;
  fullName: string;
  role: 'ROLE_CANDIDATE' | 'ROLE_RECRUITER';
  badge: string;
  avatarBg: string;
}

const GOOGLE_PRESET_ACCOUNTS: OAuth2PresetAccount[] = [
  {
    email: 'vuminhkhang2005@gmail.com',
    fullName: 'Vũ Minh Khang',
    role: 'ROLE_CANDIDATE',
    badge: 'Ứng viên · Gmail cá nhân',
    avatarBg: '0D9488',
  },
  {
    email: 'nguyenvanan.it@gmail.com',
    fullName: 'Nguyễn Văn An',
    role: 'ROLE_CANDIDATE',
    badge: 'Ứng viên · Senior Backend',
    avatarBg: '059669',
  },
  {
    email: 'recruiter.fpt@fpt.com',
    fullName: 'Lê Thu Hà (FPT Software)',
    role: 'ROLE_RECRUITER',
    badge: 'Nhà tuyển dụng · Google Workspace',
    avatarBg: '0284C7',
  },
];

const LINKEDIN_PRESET_ACCOUNTS: OAuth2PresetAccount[] = [
  {
    email: 'khang.linkedin@talentbridge.vn',
    fullName: 'Vũ Minh Khang (LinkedIn)',
    role: 'ROLE_CANDIDATE',
    badge: 'Ứng viên · LinkedIn Verified Profile',
    avatarBg: '0A66C2',
  },
  {
    email: 'tranminhtuan.ai@gmail.com',
    fullName: 'Trần Minh Tuấn',
    role: 'ROLE_CANDIDATE',
    badge: 'Ứng viên · AI Engineer @ LinkedIn',
    avatarBg: '1D4ED8',
  },
  {
    email: 'recruiter.vng@vng.com.vn',
    fullName: 'Phạm Hoàng Nam (VNG Corp)',
    role: 'ROLE_RECRUITER',
    badge: 'Nhà tuyển dụng · LinkedIn Talent Solutions',
    avatarBg: '0369A1',
  },
];

interface OAuth2ModalProps {
  provider: 'google' | 'linkedin' | null;
  onClose: () => void;
  onAuthenticate: (provider: 'google' | 'linkedin', payload: OAuth2LoginPayload) => Promise<void>;
  defaultRole?: 'ROLE_CANDIDATE' | 'ROLE_RECRUITER';
  isVi: boolean;
}

const OAuth2GatewayModal: React.FC<OAuth2ModalProps> = ({
  provider,
  onClose,
  onAuthenticate,
  defaultRole = 'ROLE_CANDIDATE',
  isVi,
}) => {
  const [tab, setTab] = useState<'chooser' | 'real-token' | 'client-id'>('chooser');
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<'ROLE_CANDIDATE' | 'ROLE_RECRUITER'>(defaultRole);
  const [realToken, setRealToken] = useState('');
  const [clientIdInput, setClientIdInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider) return;
    setModalError(null);
    setUseCustomAccount(false);
    setCustomRole(defaultRole);
    const envClientId =
      provider === 'google'
        ? (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || localStorage.getItem(LS_GOOGLE_CLIENT_ID) || ''
        : (import.meta.env.VITE_LINKEDIN_CLIENT_ID as string | undefined) || localStorage.getItem(LS_LINKEDIN_CLIENT_ID) || '';
    setClientIdInput(envClientId);

    authApi
      .oauth2Config()
      .then((cfg) => {
        if (provider === 'google' && cfg.googleConfigured && !envClientId) {
          setClientIdInput(cfg.googleClientId);
        }
        if (provider === 'linkedin' && cfg.linkedinConfigured && !envClientId) {
          setClientIdInput(cfg.linkedinClientId);
        }
      })
      .catch(() => undefined);
  }, [provider, defaultRole]);

  if (!provider) return null;

  const isGoogle = provider === 'google';
  const presets = isGoogle ? GOOGLE_PRESET_ACCOUNTS : LINKEDIN_PRESET_ACCOUNTS;

  const handleSelectPreset = async (acc: OAuth2PresetAccount) => {
    setModalError(null);
    setSubmitting(true);
    try {
      await onAuthenticate(provider, {
        email: acc.email,
        fullName: acc.fullName,
        role: acc.role,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.fullName)}&background=${acc.avatarBg}&color=fff`,
        token: `oauth2_sandbox_${provider}_${Date.now()}`,
      });
      onClose();
    } catch (err) {
      setModalError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customName.trim()) {
      setModalError(isVi ? 'Vui lòng nhập đầy đủ Email và Họ tên.' : 'Please enter both Email and Full Name.');
      return;
    }
    setModalError(null);
    setSubmitting(true);
    try {
      await onAuthenticate(provider, {
        email: customEmail.trim().toLowerCase(),
        fullName: customName.trim(),
        role: customRole,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(customName.trim())}&background=${isGoogle ? '0D9488' : '0A66C2'}&color=fff`,
        token: `oauth2_sandbox_${provider}_${Date.now()}`,
      });
      onClose();
    } catch (err) {
      setModalError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRealTokenVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realToken.trim()) {
      setModalError(isVi ? 'Vui lòng dán OAuth2 Access Token hoặc ID Token thật.' : 'Please paste a real OAuth2 Access Token or ID Token.');
      return;
    }
    setModalError(null);
    setSubmitting(true);
    try {
      // Sends raw token WITHOUT oauth2_sandbox_ prefix so Backend verifies directly with googleapis.com / api.linkedin.com
      await onAuthenticate(provider, {
        token: realToken.trim(),
        role: customRole,
      });
      onClose();
    } catch (err) {
      setModalError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLaunchRealPopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = clientIdInput.trim();
    if (!trimmedId) {
      setModalError(
        isGoogle
          ? 'Vui lòng nhập Google Client ID (ví dụ: 123456-abc.apps.googleusercontent.com)'
          : 'Vui lòng nhập LinkedIn Client ID'
      );
      return;
    }
    setModalError(null);
    if (isGoogle) {
      localStorage.setItem(LS_GOOGLE_CLIENT_ID, trimmedId);
      setSubmitting(true);
      try {
        await loadGoogleGsiScript();
        const tokenClient = window.google?.accounts?.oauth2?.initTokenClient({
          client_id: trimmedId,
          scope: 'openid email profile',
          callback: async (resp) => {
            if (resp.error || !resp.access_token) {
              setModalError(resp.error_description || resp.error || 'Đã hủy hoặc lỗi xác thực từ Google.');
              setSubmitting(false);
              return;
            }
            try {
              await onAuthenticate('google', {
                token: resp.access_token,
                role: customRole,
              });
              onClose();
            } catch (err) {
              setModalError((err as Error).message);
            } finally {
              setSubmitting(false);
            }
          },
        });
        if (!tokenClient) {
          throw new Error('Không thể khởi tạo Google OAuth2 Token Client.');
        }
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        setModalError((err as Error).message);
        setSubmitting(false);
      }
    } else {
      localStorage.setItem(LS_LINKEDIN_CLIENT_ID, trimmedId);
      const redirectUri = `${window.location.origin}/login`;
      const authUrl =
        `https://www.linkedin.com/oauth/v2/authorization?response_type=code` +
        `&client_id=${encodeURIComponent(trimmedId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent('openid profile email')}` +
        `&state=linkedin_oauth2`;
      window.location.href = authUrl;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      data-testid="oauth2-modal"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top OAuth2 Provider Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isGoogle ? <GoogleIcon className="w-5 h-5" /> : <LinkedInIcon className="w-5 h-5" />}
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isGoogle
                  ? isVi
                    ? 'Đăng nhập bằng Google (OAuth 2.0)'
                    : 'Sign in with Google (OAuth 2.0)'
                  : isVi
                    ? 'Đăng nhập bằng LinkedIn (OpenID Connect)'
                    : 'Sign in with LinkedIn (OpenID Connect)'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isVi ? 'Tiếp tục tới nền tảng tuyển dụng TalentBridge' : 'Continue to TalentBridge Recruitment Platform'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-6 pt-3 bg-slate-50/50 dark:bg-slate-900 border-b border-slate-200/70 dark:border-slate-800 flex gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab('chooser');
              setModalError(null);
            }}
            data-testid="oauth2-tab-chooser"
            className={`px-3 py-2 border-b-2 transition cursor-pointer ${
              tab === 'chooser'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isVi ? '1. Chọn tài khoản' : '1. Choose Account'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('real-token');
              setModalError(null);
            }}
            data-testid="oauth2-tab-realtoken"
            className={`px-3 py-2 border-b-2 transition cursor-pointer flex items-center gap-1 ${
              tab === 'real-token'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isVi ? '2. Xác thực Token thật' : '2. Real Token Verify'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('client-id');
              setModalError(null);
            }}
            data-testid="oauth2-tab-clientid"
            className={`px-3 py-2 border-b-2 transition cursor-pointer flex items-center gap-1 ${
              tab === 'client-id'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isVi ? '3. Popup OAuth2 thật' : '3. Real OAuth2 Popup'}</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {modalError && <ErrorBox message={modalError} />}

          {/* TAB 1: Interactive Account Chooser */}
          {tab === 'chooser' && (
            <div className="space-y-3">
              {!useCustomAccount ? (
                <>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {isVi
                      ? `Chọn tài khoản ${isGoogle ? 'Google (Gmail)' : 'LinkedIn'} để đăng nhập hoặc tự động tạo hồ sơ mới trong MySQL:`
                      : `Choose a ${isGoogle ? 'Google (Gmail)' : 'LinkedIn'} account to sign in or auto-provision in MySQL:`}
                  </p>
                  <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    {presets.map((acc, idx) => (
                      <button
                        key={acc.email}
                        type="button"
                        disabled={submitting}
                        onClick={() => handleSelectPreset(acc)}
                        data-testid={`oauth2-account-${idx}`}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-emerald-50/60 dark:hover:bg-slate-800/80 transition text-left cursor-pointer disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            style={{ backgroundColor: `#${acc.avatarBg}` }}
                            className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-black shadow-sm"
                          >
                            {acc.fullName
                              .split(' ')
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((w) => w[0]?.toUpperCase())
                              .join('')}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{acc.fullName}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{acc.email}</div>
                          </div>
                        </div>
                        <span className="ml-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                          {acc.badge}
                        </span>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setUseCustomAccount(true)}
                      data-testid="oauth2-use-another-account"
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition text-left cursor-pointer text-emerald-600 dark:text-emerald-400 font-bold text-xs"
                    >
                      <span className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
                        <UserPlus className="w-4 h-4" />
                      </span>
                      <span>
                        {isVi
                          ? `Sử dụng tài khoản ${isGoogle ? 'Gmail' : 'LinkedIn'} khác của bạn…`
                          : `Use another ${isGoogle ? 'Gmail' : 'LinkedIn'} account…`}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleCustomSubmit} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isVi
                        ? `Nhập tài khoản ${isGoogle ? 'Google (Gmail)' : 'LinkedIn'} của bạn`
                        : `Enter your ${isGoogle ? 'Google (Gmail)' : 'LinkedIn'} account`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseCustomAccount(false)}
                      className="text-xs text-emerald-600 hover:underline font-semibold cursor-pointer"
                    >
                      {isVi ? '← Quay lại danh sách' : '← Back to list'}
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {isGoogle ? 'Địa chỉ Gmail / Google Workspace' : 'Email LinkedIn'}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={isGoogle ? 'tenban@gmail.com' : 'tenban@company.com'}
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      data-testid="oauth2-custom-email"
                      className={`${inputCls} mt-1`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {isVi ? 'Họ và tên hiển thị' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Vũ Minh Khang"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      data-testid="oauth2-custom-name"
                      className={`${inputCls} mt-1`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {isVi ? 'Vai trò khi tạo tài khoản' : 'Account Role'}
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setCustomRole('ROLE_CANDIDATE')}
                        className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          customRole === 'ROLE_CANDIDATE'
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isVi ? 'Ứng viên tìm việc' : 'Candidate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomRole('ROLE_RECRUITER')}
                        className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          customRole === 'ROLE_RECRUITER'
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isVi ? 'Nhà tuyển dụng' : 'Recruiter'}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    data-testid="oauth2-custom-submit"
                    className={`${btnPrimary} w-full py-2.5`}
                  >
                    {submitting
                      ? isVi
                        ? 'Đang xác thực OAuth2…'
                        : 'Authenticating…'
                      : isVi
                        ? `Tiếp tục với ${isGoogle ? 'Google' : 'LinkedIn'}`
                        : `Continue with ${isGoogle ? 'Google' : 'LinkedIn'}`}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: Real Token Verification with googleapis.com / api.linkedin.com */}
          {tab === 'real-token' && (
            <form onSubmit={handleRealTokenVerify} className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                <div className="font-bold text-emerald-800 dark:text-emerald-300">
                  {isGoogle
                    ? 'Xác thực trực tiếp với máy chủ https://www.googleapis.com/oauth2/v3/userinfo'
                    : 'Xác thực trực tiếp với máy chủ https://api.linkedin.com/v2/userinfo'}
                </div>
                <p className="text-[11px] leading-relaxed">
                  {isGoogle
                    ? 'Dán Google Access Token (ya29...) hoặc ID Token (eyJ...) thật của bạn. Backend Spring Boot sẽ gọi thẳng sang máy chủ Google để xác minh chữ ký và lấy Gmail thật.'
                    : 'Dán LinkedIn OAuth2 Access Token (quyền openid profile email). Backend Spring Boot sẽ gọi thẳng sang api.linkedin.com/v2/userinfo để xác thực.'}
                </p>
                {isGoogle && (
                  <a
                    href="https://developers.google.com/oauthplayground/#step1&apisSelect=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%2Copenid&url=https%3A%2F%2F&content_type=application%2Fjson&http_method=GET&useDefaultOauthCred=unchecked"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-0.5"
                  >
                    <span>Lấy Access Token Gmail thật trong 5 giây tại Google OAuth2 Playground</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {isGoogle ? 'Google Access Token (ya29...) hoặc ID Token (eyJ...)' : 'LinkedIn Access Token (AQV...)'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={realToken}
                  onChange={(e) => setRealToken(e.target.value)}
                  placeholder={isGoogle ? 'ya29.a0AeDClZ... hoặc eyJhbGciOiJSUzI1NiIs...' : 'AQV...'}
                  data-testid="oauth2-real-token-input"
                  className={`${inputCls} mt-1 font-mono text-xs`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                data-testid="oauth2-real-token-submit"
                className={`${btnPrimary} w-full py-2.5`}
              >
                {submitting
                  ? 'Đang xác minh với máy chủ ' + (isGoogle ? 'Google…' : 'LinkedIn…')
                  : 'Xác minh Token thật & Đăng nhập'}
              </button>
            </form>
          )}

          {/* TAB 3: Real OAuth2 Popup via Client ID */}
          {tab === 'client-id' && (
            <form onSubmit={handleLaunchRealPopup} className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  {isGoogle
                    ? 'Mở cửa sổ đăng nhập Google thật (accounts.google.com)'
                    : 'Chuyển hướng tới trang uỷ quyền LinkedIn thật (linkedin.com/oauth/v2)'}
                </div>
                <p className="text-[11px]">
                  {isGoogle
                    ? 'Nhập OAuth 2.0 Web Client ID từ Google Cloud Console (Authorized JavaScript origins: http://localhost:5173) để bật cửa sổ chọn Gmail thật của Google.'
                    : 'Nhập Client ID từ LinkedIn Developer Portal (Authorized redirect URL: http://localhost:5173/login).'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {isGoogle ? 'Google OAuth2 Client ID' : 'LinkedIn OAuth2 Client ID'}
                </label>
                <input
                  type="text"
                  required
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder={isGoogle ? '1234567890-abcdef.apps.googleusercontent.com' : '86abcdef123456'}
                  data-testid="oauth2-client-id-input"
                  className={`${inputCls} mt-1 font-mono text-xs`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                data-testid="oauth2-launch-popup-btn"
                className={`${btnPrimary} w-full py-2.5`}
              >
                {submitting
                  ? 'Đang mở cửa sổ xác thực…'
                  : isGoogle
                    ? 'Lưu Client ID & Mở Popup Google (accounts.google.com)'
                    : 'Lưu Client ID & Mở trang uỷ quyền LinkedIn'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const [oauthModalProvider, setOauthModalProvider] = useState<'google' | 'linkedin' | null>(null);

  useEffect(() => {
    if (user) navigate(next ?? homeFor(user), { replace: true });
  }, [user, next, navigate]);

  // Handle OAuth2 Authorization Code redirect callback (?code=...&state=linkedin_oauth2 or google_oauth2)
  useEffect(() => {
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) return;
    const provider = state.includes('linkedin') ? 'linkedin' : 'google';
    setLoading(true);
    loginWithOAuth2(provider, {
      authCode: code,
      redirectUri: `${window.location.origin}/login`,
    })
      .then((u) => navigate(next ?? homeFor(u), { replace: true }))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [params, loginWithOAuth2, navigate, next]);

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

  const handleOAuth2Authenticate = async (provider: 'google' | 'linkedin', payload: OAuth2LoginPayload) => {
    const u = await loginWithOAuth2(provider, payload);
    navigate(next ?? homeFor(u), { replace: true });
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
      <SocialOAuth2Buttons
        loading={loading}
        onSelectProvider={(p) => setOauthModalProvider(p)}
        isVi={isVi}
      />

      <OAuth2GatewayModal
        provider={oauthModalProvider}
        onClose={() => setOauthModalProvider(null)}
        onAuthenticate={handleOAuth2Authenticate}
        isVi={isVi}
      />

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
  const [oauthModalProvider, setOauthModalProvider] = useState<'google' | 'linkedin' | null>(null);
  const isRecruiter = role === 'ROLE_RECRUITER';

  const handleOAuth2Authenticate = async (provider: 'google' | 'linkedin', payload: OAuth2LoginPayload) => {
    const u = await loginWithOAuth2(provider, payload);
    navigate(next ?? homeFor(u), { replace: true });
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
      <SocialOAuth2Buttons
        loading={loading}
        onSelectProvider={(p) => setOauthModalProvider(p)}
        isVi={isVi}
      />
      <OAuth2GatewayModal
        provider={oauthModalProvider}
        onClose={() => setOauthModalProvider(null)}
        onAuthenticate={handleOAuth2Authenticate}
        defaultRole={role}
        isVi={isVi}
      />
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
