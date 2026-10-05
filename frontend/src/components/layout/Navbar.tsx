import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const PUBLIC_LINKS: NavItem[] = [
  { to: '/jobs', label: 'Việc làm' },
  { to: '/companies', label: 'Công ty' },
  { to: '/tools', label: 'Công cụ' },
];

const RECRUITER_LINKS: NavItem[] = [
  { to: '/employer', label: 'Tin tuyển dụng', end: true },
  { to: '/employer/applicants', label: 'Ứng viên' },
  { to: '/employer/jobs/new', label: 'Đăng tin' },
];

export const Logo: React.FC<{ to?: string }> = ({ to = '/' }) => (
  <Link to={to} className="flex items-center gap-2 shrink-0" aria-label="TalentBridge - Trang chủ">
    <span className="w-8 h-8 rounded-md bg-red-600 text-white font-black flex items-center justify-center">T</span>
    <span className="text-white font-bold text-lg tracking-tight">TalentBridge</span>
  </Link>
);

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white'}`;

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isRecruiter, logout } = useAuth();
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

  const links = isRecruiter ? RECRUITER_LINKS : PUBLIC_LINKS;
  const accountLinks: NavItem[] = isRecruiter
    ? [
        { to: '/profile', label: 'Tài khoản' },
        { to: '/employer', label: 'Quản lý tin tuyển dụng' },
      ]
    : [
        { to: '/profile', label: 'Hồ sơ & CV' },
        { to: '/applications', label: 'Việc đã ứng tuyển' },
        { to: '/saved-jobs', label: 'Việc đã lưu' },
      ];

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  const loginHref = `/login?next=${encodeURIComponent(location.pathname + location.search)}`;

  return (
    <header className="sticky top-0 z-40 bg-[#121212] border-b border-black">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">
        <Logo to={isRecruiter ? '/employer' : '/'} />

        <nav className="hidden md:flex items-center gap-1" aria-label="Điều hướng chính">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link to="/employers" className="hidden lg:inline px-3 py-2 text-sm text-slate-300 hover:text-white">
                Nhà tuyển dụng
              </Link>
              <Link to={loginHref} className="hidden sm:inline px-3 py-2 text-sm font-medium text-white hover:underline">
                Đăng nhập
              </Link>
              <Link to="/register" className="hidden sm:inline px-4 py-2 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700">
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              <NotificationBell />
              <div className="relative hidden md:block" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/10"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  data-testid="account-menu"
                >
                  <Avatar name={user!.fullName} url={user!.avatarUrl} />
                  <span className="text-sm text-white max-w-[140px] truncate">{user!.fullName}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                {menuOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user!.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user!.email}</p>
                    </div>
                    {accountLinks.map((l) => (
                      <Link key={l.to} to={l.to} role="menuitem" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        {l.label}
                      </Link>
                    ))}
                    <button onClick={onLogout} role="menuitem" className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-t border-slate-100">
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <button
            className="md:hidden p-2 text-slate-200"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#121212] px-4 py-3 space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `block ${linkCls({ isActive })}`}>
              {l.label}
            </NavLink>
          ))}
          <div className="border-t border-white/10 my-2" />
          {isAuthenticated ? (
            <>
              {accountLinks.map((l) => (
                <Link key={l.to} to={l.to} className="block px-3 py-2 text-sm text-slate-300">
                  {l.label}
                </Link>
              ))}
              <button onClick={onLogout} className="block w-full text-left px-3 py-2 text-sm text-slate-300">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to={loginHref} className="block px-3 py-2 text-sm text-white">
                Đăng nhập
              </Link>
              <Link to="/register" className="block px-3 py-2 text-sm text-white">
                Đăng ký
              </Link>
              <Link to="/employers" className="block px-3 py-2 text-sm text-slate-300">
                Nhà tuyển dụng
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export const Avatar: React.FC<{ name: string; url?: string | null; size?: string }> = ({ name, url, size = 'w-8 h-8' }) => {
  const [broken, setBroken] = useState(false);
  if (url && !broken) {
    return <img src={url} alt="" className={`${size} rounded-full object-cover bg-slate-700`} onError={() => setBroken(true)} />;
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return <span className={`${size} rounded-full bg-slate-600 text-white text-xs font-semibold flex items-center justify-center`}>{initials}</span>;
};
