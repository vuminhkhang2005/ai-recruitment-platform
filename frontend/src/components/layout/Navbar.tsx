import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  FileCheck2,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  PlusCircle,
  Search,
  ShieldCheck,
  Sun,
  User,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { messageApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { NotificationBell } from './NotificationBell';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

const PUBLIC_LINKS: NavItem[] = [
  { to: '/jobs', label: 'Việc làm', icon: Search },
  { to: '/companies', label: 'Công ty', icon: Building2 },
  { to: '/tools', label: 'Công cụ', icon: Wrench },
];

const RECRUITER_LINKS: NavItem[] = [
  { to: '/employer', label: 'Tin tuyển dụng', icon: LayoutGrid, end: true },
  { to: '/employer/applicants', label: 'Ứng viên', icon: Users },
  { to: '/employer/jobs/new', label: 'Đăng tin', icon: PlusCircle },
];

/** Original TalentBridge brand mark: gradient tile + wordmark + live dot. */
export const Logo: React.FC<{ to?: string }> = ({ to = '/' }) => (
  <Link to={to} className="flex items-center gap-2 shrink-0 group" aria-label="TalentBridge - Trang chủ">
    <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-300 shrink-0">
      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
    </span>
    <span className="flex items-center gap-1.5">
      <span className="text-base sm:text-lg xl:text-xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
        TalentBridge
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
    </span>
  </Link>
);

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
    isActive
      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/50 shadow-soft-xs'
      : 'text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
  }`;

const ThemeSwitch: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const btn = 'p-1.5 rounded-lg transition-all flex items-center justify-center';
  return (
    <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex items-center border border-slate-200/80 dark:border-slate-700 shadow-soft-xs">
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`${btn} ${theme === 'light' ? 'bg-white text-amber-500 shadow-soft-xs ring-1 ring-slate-200/80' : 'text-slate-400 hover:text-slate-200'}`}
        title="Giao diện sáng"
        aria-label="Giao diện sáng"
        aria-pressed={theme === 'light'}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`${btn} ${theme === 'dark' ? 'bg-slate-700 text-indigo-300 shadow-soft-xs ring-1 ring-slate-600' : 'text-slate-500 hover:text-slate-800'}`}
        title="Giao diện tối"
        aria-label="Giao diện tối"
        aria-pressed={theme === 'dark'}
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
};

export const LanguageSwitch: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();
  return (
    <div
      className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex items-center border border-slate-200/80 dark:border-slate-700 shadow-soft-xs"
      data-testid="language-switcher"
      aria-label="Chuyển đổi ngôn ngữ / Switch Language"
    >
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
          language === 'vi'
            ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-soft-xs ring-1 ring-slate-200/80 dark:ring-slate-600'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
        title="Tiếng Việt (VI)"
        aria-label="Tiếng Việt"
        aria-pressed={language === 'vi'}
      >
        <span className="text-xs">🇻🇳</span>
        {!compact && <span className="text-[11px] font-extrabold tracking-wide">VI</span>}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
          language === 'en'
            ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-soft-xs ring-1 ring-slate-200/80 dark:ring-slate-600'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
        title="English (EN)"
        aria-label="English"
        aria-pressed={language === 'en'}
      >
        <span className="text-xs">🇬🇧</span>
        {!compact && <span className="text-[11px] font-extrabold tracking-wide">EN</span>}
      </button>
    </div>
  );
};

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isRecruiter, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    const fetchUnread = () => {
      messageApi
        .unreadCount()
        .then((res) => {
          if (active) setUnreadMsgCount(res.unreadCount);
        })
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const links: NavItem[] = isRecruiter
    ? [
        { to: '/employer', label: language === 'vi' ? 'Tin tuyển dụng' : 'Jobs', icon: LayoutGrid, end: true },
        { to: '/employer/applicants', label: language === 'vi' ? 'Ứng viên' : 'Applicants', icon: Users },
        { to: '/employer/interviews', label: language === 'vi' ? 'Lịch PV' : 'Interviews', icon: Calendar },
        { to: '/employer/team', label: language === 'vi' ? 'Đội ngũ' : 'Team', icon: ShieldCheck },
        { to: '/employer/jobs/new', label: language === 'vi' ? 'Đăng tin' : 'Post Job', icon: PlusCircle },
      ]
    : [
        { to: '/jobs', label: language === 'vi' ? 'Việc làm' : 'Jobs', icon: Search },
        { to: '/companies', label: language === 'vi' ? 'Công ty' : 'Companies', icon: Building2 },
        { to: '/tools', label: language === 'vi' ? 'Công cụ' : 'Tools', icon: Wrench },
      ];

  const accountLinks: NavItem[] = isRecruiter
    ? [
        { to: '/profile', label: language === 'vi' ? 'Tài khoản' : 'Account', icon: User },
        { to: '/employer/company', label: language === 'vi' ? 'Hồ sơ công ty' : 'Company Profile', icon: Building2 },
        { to: '/employer', label: language === 'vi' ? 'Quản lý tin tuyển dụng' : 'Manage Jobs', icon: LayoutGrid },
        { to: '/employer/team', label: language === 'vi' ? 'Đội ngũ tuyển dụng' : 'Hiring Team', icon: ShieldCheck },
        { to: '/employer/interviews', label: language === 'vi' ? 'Lịch phỏng vấn' : 'Interviews', icon: Calendar },
        { to: '/messages', label: language === 'vi' ? 'Tin nhắn' : 'Messages', icon: MessageSquare },
      ]
    : [
        { to: '/profile', label: language === 'vi' ? 'Hồ sơ & CV' : 'Profile & CV', icon: User },
        { to: '/applications', label: language === 'vi' ? 'Việc đã ứng tuyển' : 'My Applications', icon: FileCheck2 },
        { to: '/saved-jobs', label: language === 'vi' ? 'Việc đã lưu' : 'Saved Jobs', icon: Bookmark },
        { to: '/messages', label: language === 'vi' ? 'Tin nhắn' : 'Messages', icon: MessageSquare },
      ];

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  const loginHref = `/login?next=${encodeURIComponent(location.pathname + location.search)}`;
  const roleLabel = isRecruiter
    ? (language === 'vi' ? 'Nhà tuyển dụng' : 'Recruiter')
    : (language === 'vi' ? 'Ứng viên' : 'Candidate');

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/90 transition-colors duration-300 shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center gap-4 lg:gap-8">
        <Logo to={isRecruiter ? '/employer' : '/'} />

        <nav className="hidden md:flex items-center gap-1" aria-label="Điều hướng chính">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>
              <l.icon className="w-4 h-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitch />
          <div className="hidden sm:block">
            <ThemeSwitch />
          </div>
          {!isAuthenticated ? (
            <>
              <Link
                to={loginHref}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300/90 dark:border-emerald-700/80 hover:border-emerald-400 shadow-soft-xs transition-all"
              >
                <User className="w-4 h-4" />
                {language === 'vi' ? 'Đăng nhập' : 'Sign In'}
              </Link>
              <Link
                to="/register"
                className="hidden xl:inline-flex px-3 py-2 text-sm font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {language === 'vi' ? 'Đăng ký' : 'Sign Up'}
              </Link>
              <Link
                to="/employers"
                className="hidden lg:inline-flex relative overflow-hidden items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-soft transition-all whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 text-emerald-100" />
                {language === 'vi' ? 'Nhà tuyển dụng' : 'Employers'}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/messages"
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={language === 'vi' ? 'Tin nhắn' : 'Messages'}
                title={language === 'vi' ? 'Tin nhắn' : 'Messages'}
                data-testid="navbar-messages"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadMsgCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-soft-xs">
                    {unreadMsgCount > 99 ? '99+' : unreadMsgCount}
                  </span>
                )}
              </Link>
              <NotificationBell />
              <div className="relative hidden md:block" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700 transition-all shadow-soft-xs"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  data-testid="account-menu"
                >
                  <span className="relative shrink-0">
                    <Avatar name={user!.fullName} url={user!.avatarUrl} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white dark:ring-slate-900" />
                  </span>
                  <span className="text-left hidden lg:block">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[140px] truncate leading-tight">
                      {user!.fullName}
                    </span>
                    <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">{roleLabel}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-soft-xl border border-slate-200 dark:border-slate-800 py-2 z-50 divide-y divide-slate-100 dark:divide-slate-800"
                  >
                    <div className="px-4 py-2.5 flex items-center gap-3">
                      <Avatar name={user!.fullName} url={user!.avatarUrl} size="w-10 h-10" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user!.fullName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user!.email}</p>
                        <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                    <div className="py-1">
                      {accountLinks.map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          role="menuitem"
                          className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors"
                        >
                          <l.icon className="w-4 h-4 text-emerald-500" />
                          {l.label}
                        </Link>
                      ))}
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={onLogout}
                        role="menuitem"
                        className="w-full px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {language === 'vi' ? 'Đăng xuất' : 'Sign Out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          <button
            className="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 rounded-xl"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-3 shadow-soft-xl">
          {isAuthenticated && user && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <Avatar name={user.fullName} url={user.avatarUrl} size="w-10 h-10" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.fullName}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{roleLabel}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={(s) => `flex ${linkCls(s)}`}>
                <l.icon className="w-4 h-4" />
                {l.label}
              </NavLink>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
            {isAuthenticated ? (
              <>
                {accountLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="flex items-center gap-2 px-2.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <l.icon className="w-4 h-4 text-emerald-500" />
                    {l.label}
                  </Link>
                ))}
                <button
                  onClick={onLogout}
                  className="w-full mt-2 py-2.5 px-4 text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {language === 'vi' ? 'Đăng xuất' : 'Sign Out'}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={loginHref}
                  className="py-2.5 text-center text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300/90 dark:border-emerald-700/80 rounded-xl"
                >
                  {language === 'vi' ? 'Đăng nhập' : 'Sign In'}
                </Link>
                <Link
                  to="/register"
                  className="py-2.5 text-center text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl"
                >
                  {language === 'vi' ? 'Đăng ký' : 'Sign Up'}
                </Link>
                <Link
                  to="/employers"
                  className="col-span-2 py-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                >
                  {language === 'vi' ? 'Dành cho nhà tuyển dụng' : 'For Employers'}
                </Link>
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {language === 'vi' ? 'Ngôn ngữ & Giao diện' : 'Language & Theme'}
            </span>
            <div className="flex items-center gap-2">
              <LanguageSwitch />
              <ThemeSwitch />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export const Avatar: React.FC<{ name: string; url?: string | null; size?: string }> = ({ name, url, size = 'w-8 h-8' }) => {
  const [broken, setBroken] = useState(false);
  if (url && !broken) {
    return (
      <img
        src={url}
        alt=""
        className={`${size} rounded-lg object-cover bg-slate-200 dark:bg-slate-700 ring-1 ring-emerald-500/60`}
        onError={() => setBroken(true)}
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span
      className={`${size} ${size.includes('text-') ? '' : 'text-xs'} rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center ring-1 ring-emerald-500/60 shrink-0`}
    >
      {initials}
    </span>
  );
};
