import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'candidate' | 'recruiter';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultRole = 'candidate' }) => {
  if (!isOpen) return null;

  const { t, language } = useLanguage();
  const { login, loginDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'candidate' | 'recruiter'>(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<string>('');

  const isVi = language === 'vi';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    setSuccessUser(email.split('@')[0] || (role === 'candidate' ? 'Nguyễn Văn An' : 'Lê Thu Trang'));
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  const handleDemoCandidate = () => {
    loginDemo('candidate');
    setSuccessUser('Nguyễn Văn An');
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  const handleDemoRecruiter = () => {
    loginDemo('recruiter');
    setSuccessUser('Lê Thu Trang');
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-soft-2xl border border-slate-200 dark:border-slate-800 relative space-y-5 transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 text-center">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-soft">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {mode === 'login' ? t.authModal.loginTitle : t.authModal.registerTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.authModal.welcomeSubtitle}
          </p>
        </div>

        {/* 1-Click Demo Accounts Banner */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isVi ? '⚡ Đăng nhập Demo 1-Click' : '⚡ 1-Click Demo Sign-in'}</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{isVi ? 'Không cần mật khẩu' : 'Instant access'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleDemoCandidate}
              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/70 border border-emerald-300/80 dark:border-emerald-700/80 rounded-xl text-left transition-all cursor-pointer shadow-soft-xs active:scale-95 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">👨‍💻</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                    Nguyễn Văn An
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {isVi ? 'Ứng viên (ATS 94)' : 'Candidate (ATS 94)'}
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleDemoRecruiter}
              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/70 border border-emerald-300/80 dark:border-emerald-700/80 rounded-xl text-left transition-all cursor-pointer shadow-soft-xs active:scale-95 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">💼</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                    Lê Thu Trang
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {isVi ? 'Tuyển dụng @ FPT' : 'Recruiter @ FPT'}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Role Selector Pill */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('candidate')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              role === 'candidate' 
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-soft-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t.authModal.candidateRole}</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('recruiter')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              role === 'recruiter' 
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-soft-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{t.authModal.recruiterRole}</span>
          </button>
        </div>

        {/* Social Auth Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleDemoCandidate}
            className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
          >
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={handleDemoCandidate}
            className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
          >
            <span>LinkedIn</span>
          </button>
        </div>

        <div className="relative flex py-0.5 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium uppercase">{t.authModal.orEmail}</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.authModal.emailLabel}</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.authModal.passwordLabel}</label>
              {mode === 'login' && (
                <a href="#" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                  {t.authModal.forgotPassword}
                </a>
              )}
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          {success ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isVi ? `Đăng nhập thành công! Chào mừng ${successUser}` : `Welcome back, ${successUser}!`}</span>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-soft flex items-center justify-center gap-2 cursor-pointer transition-all relative overflow-hidden group"
              >
                <div className="shimmer-sweep" />
                <span>{mode === 'login' ? t.authModal.btnLogin : t.authModal.btnRegister}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </form>

        {/* Toggle Mode Footer */}
        <div className="text-center pt-1 text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login' ? (
            <p>
              {t.authModal.noAccountPrompt}{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer ml-1"
              >
                {t.authModal.registerNow}
              </button>
            </p>
          ) : (
            <p>
              {t.authModal.haveAccountPrompt}{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer ml-1"
              >
                {t.authModal.loginNow}
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};