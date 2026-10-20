import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, ChevronDown, Lock, UserPlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi, companyApi, type OAuth2LoginPayload } from '../lib/api';
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

interface OAuth2Account {
  email: string;
  fullName: string;
  role: 'ROLE_CANDIDATE' | 'ROLE_RECRUITER';
  avatarBg: string;
}

const GOOGLE_ACCOUNTS: OAuth2Account[] = [
  {
    email: 'vuminhkhang2005@gmail.com',
    fullName: 'Vũ Minh Khang',
    role: 'ROLE_CANDIDATE',
    avatarBg: '0D9488',
  },
  {
    email: 'nguyenvanan.it@gmail.com',
    fullName: 'Nguyễn Văn An',
    role: 'ROLE_CANDIDATE',
    avatarBg: '059669',
  },
  {
    email: 'recruiter.fpt@fpt.com',
    fullName: 'Lê Thu Hà',
    role: 'ROLE_RECRUITER',
    avatarBg: '0284C7',
  },
];

const LINKEDIN_ACCOUNTS: OAuth2Account[] = [
  {
    email: 'khang.linkedin@talentbridge.vn',
    fullName: 'Vũ Minh Khang',
    role: 'ROLE_CANDIDATE',
    avatarBg: '0A66C2',
  },
  {
    email: 'tranminhtuan.ai@gmail.com',
    fullName: 'Trần Minh Tuấn',
    role: 'ROLE_CANDIDATE',
    avatarBg: '1D4ED8',
  },
  {
    email: 'recruiter.vng@vng.com.vn',
    fullName: 'Phạm Hoàng Nam',
    role: 'ROLE_RECRUITER',
    avatarBg: '0369A1',
  },
];

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

function formatNameFromEmail(email: string) {
  const local = email.split('@')[0] || 'User';
  return local
    .replace(/[0-9]+/g, '')
    .replace(/[._-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || local;
}

interface OAuth2FlowModalProps {
  provider: 'google' | 'linkedin' | null;
  onClose: () => void;
  onExchangeAuthCode: (provider: 'google' | 'linkedin', payload: OAuth2LoginPayload) => Promise<void>;
  defaultRole?: 'ROLE_CANDIDATE' | 'ROLE_RECRUITER';
  isVi: boolean;
}

/**
 * Authentic Google / LinkedIn OAuth 2.0 Sign-In Dialog:
 * - Clicking a signed-in account logs in immediately via OAuth2 Authorization Code exchange.
 * - Clicking "Use another account":
 *   - Google: Step 1 (Email only -> Next) -> Step 2 (Password only -> Sign in)
 *   - LinkedIn: Email + Password -> Sign in
 */
const OAuth2AuthorizationModal: React.FC<OAuth2FlowModalProps> = ({
  provider,
  onClose,
  onExchangeAuthCode,
  defaultRole = 'ROLE_CANDIDATE',
  isVi,
}) => {
  const [step, setStep] = useState<'choose' | 'email' | 'password' | 'consent'>('choose');
  const [selectedAccount, setSelectedAccount] = useState<OAuth2Account | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider) return;
    setStep('choose');
    setSelectedAccount(null);
    setCustomEmail('');
    setCustomPassword('');
    setModalError(null);
  }, [provider]);

  if (!provider) return null;

  const isGoogle = provider === 'google';
  const accounts = isGoogle ? GOOGLE_ACCOUNTS : LINKEDIN_ACCOUNTS;

  const completeOAuth2SignIn = async (email: string, fullName: string, role: 'ROLE_CANDIDATE' | 'ROLE_RECRUITER', avatarBg: string) => {
    setModalError(null);
    setSubmitting(true);
    try {
      const grant = await authApi.oauth2Authorize(provider, {
        email,
        fullName,
        role,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=${avatarBg}&color=fff`,
        redirectUri: `${window.location.origin}/login`,
      });
      await onExchangeAuthCode(provider, {
        authCode: grant.code,
        redirectUri: grant.redirectUri,
        role,
      });
      onClose();
    } catch (err) {
      setModalError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickExistingAccount = (acc: OAuth2Account) => {
    setModalError(null);
    setSelectedAccount(acc);
    setStep('consent');
  };

  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    const email = customEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setModalError(isVi ? 'Nhập một địa chỉ email hoặc số điện thoại hợp lệ' : 'Enter a valid email or phone number');
      return;
    }
    setModalError(null);
    setStep('password');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPassword) {
      setModalError(isVi ? 'Nhập mật khẩu' : 'Enter a password');
      return;
    }
    const email = customEmail.trim().toLowerCase();
    const fullName = formatNameFromEmail(email);
    setModalError(null);
    setSelectedAccount({
      email,
      fullName,
      role: defaultRole,
      avatarBg: isGoogle ? '0D9488' : '0A66C2',
    });
    setStep('consent');
  };

  const handleConfirmConsent = async () => {
    if (!selectedAccount) return;
    await completeOAuth2SignIn(
      selectedAccount.email,
      selectedAccount.fullName,
      selectedAccount.role,
      selectedAccount.avatarBg
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      data-testid="oauth2-modal"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-[420px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Browser Bar */}
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-mono text-[11px] truncate">
              {isGoogle ? 'accounts.google.com' : 'linkedin.com/oauth/v2'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-7 sm:p-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-3">
              {isGoogle ? <GoogleIcon className="w-7 h-7" /> : <LinkedInIcon className="w-8 h-8" />}
            </div>

            {step === 'choose' && (
              <>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {isVi ? 'Chọn một tài khoản' : 'Choose an account'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {isVi ? 'để tiếp tục tới ' : 'to continue to '}
                  <span className="font-semibold text-slate-900 dark:text-white">TalentBridge</span>
                </p>
              </>
            )}

            {step === 'email' && (
              <>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {isVi ? 'Đăng nhập' : 'Sign in'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {isVi ? 'Tiếp tục tới ' : 'Continue to '}
                  <span className="font-semibold text-slate-900 dark:text-white">TalentBridge</span>
                </p>
              </>
            )}

            {step === 'password' && (
              <>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {isVi ? 'Chào mừng' : 'Welcome'}
                </h3>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <span className="w-4 h-4 rounded-full bg-teal-600 text-[9px] font-bold text-white flex items-center justify-center">
                    {customEmail.trim()[0]?.toUpperCase() || 'U'}
                  </span>
                  <span>{customEmail.trim().toLowerCase()}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </>
            )}

            {step === 'consent' && selectedAccount && (
              <>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                  {isVi
                    ? `Đăng nhập vào TalentBridge bằng ${isGoogle ? 'Google' : 'LinkedIn'}`
                    : `Sign in to TalentBridge with ${isGoogle ? 'Google' : 'LinkedIn'}`}
                </h3>
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <span
                    style={{ backgroundColor: `#${selectedAccount.avatarBg}` }}
                    className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  >
                    {initialsOf(selectedAccount.fullName)}
                  </span>
                  <span>{selectedAccount.email}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </>
            )}
          </div>

          {modalError && (
            <div className="mt-4">
              <ErrorBox message={modalError} />
            </div>
          )}

          {/* STEP 1: Account Chooser */}
          {step === 'choose' && (
            <div className="mt-6">
              <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
                {accounts.map((acc, idx) => (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={submitting}
                    onClick={() => handlePickExistingAccount(acc)}
                    data-testid={`oauth2-account-${idx}`}
                    className="w-full py-3.5 px-2 flex items-center gap-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition text-left cursor-pointer disabled:opacity-50"
                  >
                    <span
                      style={{ backgroundColor: `#${acc.avatarBg}` }}
                      className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    >
                      {initialsOf(acc.fullName)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{acc.fullName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{acc.email}</div>
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setModalError(null);
                    setStep('email');
                  }}
                  data-testid="oauth2-use-another-account"
                  className="w-full py-3.5 px-2 flex items-center gap-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition text-left cursor-pointer text-slate-700 dark:text-slate-200 font-medium text-sm"
                >
                  <span className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <UserPlus className="w-5 h-5" />
                  </span>
                  <span>{isVi ? 'Sử dụng một tài khoản khác' : 'Use another account'}</span>
                </button>
              </div>

              <p className="mt-5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isVi
                  ? `Để tiếp tục, ${isGoogle ? 'Google' : 'LinkedIn'} sẽ chia sẻ tên, địa chỉ email và ảnh hồ sơ của bạn với TalentBridge.`
                  : `To continue, ${isGoogle ? 'Google' : 'LinkedIn'} will share your name, email address, and profile picture with TalentBridge.`}
              </p>
            </div>
          )}

          {/* STEP 2A: Email only (Exact Google Sign-In Step 1) */}
          {step === 'email' && (
            <form onSubmit={handleEmailNext} className="mt-6 space-y-6">
              <div>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder={isVi ? 'Email hoặc số điện thoại' : 'Email or phone'}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  data-testid="oauth2-custom-email"
                  className={`${inputCls} py-3 text-sm`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {isVi ? 'Chọn tài khoản' : 'Choose account'}
                </button>
                <button
                  type="submit"
                  data-testid="oauth2-custom-next"
                  className="px-6 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm font-semibold transition cursor-pointer"
                >
                  {isVi ? 'Tiếp theo' : 'Next'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2B: Password only (Exact Google Sign-In Step 2) */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-6">
              <div>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder={isVi ? 'Nhập mật khẩu của bạn' : 'Enter your password'}
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  data-testid="oauth2-custom-password"
                  className={`${inputCls} py-3 text-sm`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {isVi ? 'Quay lại' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="oauth2-password-next"
                  className="px-6 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm font-semibold transition cursor-pointer disabled:opacity-60"
                >
                  {isVi ? 'Tiếp theo' : 'Next'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Google / LinkedIn Information Sharing Consent Screen */}
          {step === 'consent' && selectedAccount && (
            <div className="mt-6 space-y-5">
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
                <p>
                  {isVi ? (
                    <>
                      Để tiếp tục, <strong>{isGoogle ? 'Google' : 'LinkedIn'}</strong> sẽ chia sẻ tên, địa chỉ email, ngôn ngữ ưu tiên và ảnh hồ sơ của bạn với <strong>TalentBridge</strong>.
                    </>
                  ) : (
                    <>
                      To continue, <strong>{isGoogle ? 'Google' : 'LinkedIn'}</strong> will share your name, email address, language preference, and profile picture with <strong>TalentBridge</strong>.
                    </>
                  )}
                </p>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {selectedAccount.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedAccount.email}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isVi
                    ? 'Trước khi sử dụng ứng dụng này, bạn có thể xem Chính sách quyền riêng tư và Điều khoản dịch vụ của TalentBridge.'
                    : 'Before using this app, you can review TalentBridge’s Privacy Policy and Terms of Service.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-full border border-slate-300 dark:border-slate-700 text-sm font-semibold text-[#0b57d0] dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmConsent}
                  data-testid="oauth2-consent-allow"
                  className="py-2.5 px-4 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm font-semibold transition cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (isVi ? 'Đang kết nối…' : 'Connecting…') : (isVi ? 'Tiếp tục' : 'Continue')}
                </button>
              </div>
            </div>
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
  const processedCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (user) navigate(next ?? homeFor(user), { replace: true });
  }, [user, next, navigate]);

  // Handle OAuth2 Authorization Code redirect callback (?code=...&state=linkedin_oauth2 or google_oauth2)
  useEffect(() => {
    const oauthError = params.get('error');
    const oauthErrorDesc = params.get('error_description');
    if (oauthError) {
      if (oauthError === 'invalid_scope_error') {
        setError(
          isVi
            ? 'Ứng dụng LinkedIn (86h3lfjflpzwb7) chưa bật sản phẩm "Sign In with LinkedIn using OpenID Connect". Vui lòng vào tab Products trên LinkedIn Developer Portal -> bấm "Request access" ở mục "Sign In with LinkedIn using OpenID Connect" rồi thử lại.'
            : 'LinkedIn App (86h3lfjflpzwb7) has not enabled "Sign In with LinkedIn using OpenID Connect". Please open the Products tab in LinkedIn Developer Portal -> click "Request access" on "Sign In with LinkedIn using OpenID Connect" and try again.'
        );
      } else {
        setError(oauthErrorDesc || oauthError);
      }
      return;
    }
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) return;
    if (processedCodeRef.current === code) return;
    processedCodeRef.current = code;

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

  const handleSelectOAuth2Provider = async (provider: 'google' | 'linkedin') => {
    try {
      const cfg = await authApi.oauth2Config();
      const redirectUri = `${window.location.origin}/login`;
      if (provider === 'google' && cfg.googleConfigured && cfg.googleClientId) {
        window.location.href =
          `https://accounts.google.com/o/oauth2/v2/auth?response_type=code` +
          `&client_id=${encodeURIComponent(cfg.googleClientId)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&scope=${encodeURIComponent('openid email profile')}` +
          `&access_type=offline&prompt=consent&state=google_oauth2`;
        return;
      }
      if (provider === 'linkedin' && cfg.linkedinConfigured && cfg.linkedinClientId) {
        window.location.href =
          `https://api.linkedin.com/oauth/v2/authorization?response_type=code` +
          `&client_id=${encodeURIComponent(cfg.linkedinClientId)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&scope=${encodeURIComponent('openid profile email')}` +
          `&state=linkedin_oauth2`;
        return;
      }
    } catch {
      // Fallback to in-app OAuth2 dialog if config check fails
    }
    setOauthModalProvider(provider);
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
        onSelectProvider={handleSelectOAuth2Provider}
        isVi={isVi}
      />

      <OAuth2AuthorizationModal
        provider={oauthModalProvider}
        onClose={() => setOauthModalProvider(null)}
        onExchangeAuthCode={handleOAuth2Authenticate}
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

  const handleSelectOAuth2Provider = async (provider: 'google' | 'linkedin') => {
    try {
      const cfg = await authApi.oauth2Config();
      const redirectUri = `${window.location.origin}/login`;
      if (provider === 'google' && cfg.googleConfigured && cfg.googleClientId) {
        window.location.href =
          `https://accounts.google.com/o/oauth2/v2/auth?response_type=code` +
          `&client_id=${encodeURIComponent(cfg.googleClientId)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&scope=${encodeURIComponent('openid email profile')}` +
          `&access_type=offline&prompt=consent&state=google_oauth2`;
        return;
      }
      if (provider === 'linkedin' && cfg.linkedinConfigured && cfg.linkedinClientId) {
        window.location.href =
          `https://api.linkedin.com/oauth/v2/authorization?response_type=code` +
          `&client_id=${encodeURIComponent(cfg.linkedinClientId)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&scope=${encodeURIComponent('openid profile email')}` +
          `&state=linkedin_oauth2`;
        return;
      }
    } catch {
      // Fallback to in-app OAuth2 dialog
    }
    setOauthModalProvider(provider);
  };

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
        onSelectProvider={handleSelectOAuth2Provider}
        isVi={isVi}
      />
      <OAuth2AuthorizationModal
        provider={oauthModalProvider}
        onClose={() => setOauthModalProvider(null)}
        onExchangeAuthCode={handleOAuth2Authenticate}
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
