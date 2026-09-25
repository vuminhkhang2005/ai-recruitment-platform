import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Building2, 
  LayoutGrid,
  FileCheck2, 
  Sparkles, 
  Bell, 
  Menu, 
  X, 
  User, 
  CheckCircle2, 
  PlusCircle, 
  Sun, 
  Moon,
  Bookmark,
  ChevronDown,
  LogOut,
  ArrowLeftRight,
  Upload
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentView?: 'home' | 'jobs' | 'profile' | 'career-ai';
  careerAiTab?: 'scanner' | 'roadmap';
  onNavigate?: (view: 'home' | 'jobs' | 'profile' | 'career-ai', tab?: 'scanner' | 'roadmap') => void;
  currentRole?: 'candidate' | 'recruiter';
  onRoleChange?: (role: 'candidate' | 'recruiter') => void;
  onOpenAuthModal?: () => void;
  onOpenCvScanner?: () => void;
  onOpenCareerAi?: (tab: 'scanner' | 'roadmap') => void;
  onOpenPostJobModal?: () => void;
  onThemeToggled?: (newTheme: 'light' | 'dark') => void;
  onOpenProfileModal?: () => void;
  onOpenSavedJobsModal?: () => void;
  onOpenAppliedJobsModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView = 'home',
  careerAiTab,
  onNavigate,
  currentRole, 
  onRoleChange, 
  onOpenAuthModal,
  onOpenCvScanner,
  onOpenCareerAi,
  onOpenPostJobModal,
  onThemeToggled,
  onOpenProfileModal,
  onOpenSavedJobsModal,
  onOpenAppliedJobsModal
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, savedJobIds, appliedJobs, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'categories' | 'jobs' | 'companies' | null>(null);

  useEffect(() => {
    if (currentView !== 'home') return;

    const sections: Array<{ id: string; key: 'categories' | 'jobs' | 'companies' }> = [
      { id: 'categories', key: 'categories' },
      { id: 'jobs', key: 'jobs' },
      { id: 'companies', key: 'companies' }
    ];

    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveSection(null);
        return;
      }
      const scrollPosition = window.scrollY + 250;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const el = document.getElementById(section.id);
        if (el && scrollPosition >= el.offsetTop - 80) {
          setActiveSection(section.key);
          return;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const handleNavClick = (sectionId: 'categories' | 'jobs' | 'companies') => {
    setActiveSection(sectionId);
    if (currentView !== 'home') {
      onNavigate?.('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCareerAiClick = (tab: 'scanner' | 'roadmap') => {
    setActiveSection(null);
    if (onOpenCareerAi) {
      onOpenCareerAi(tab);
    } else {
      onNavigate?.('career-ai', tab);
    }
  };

  const notifications = [
    { 
      id: 1, 
      title: language === 'vi' ? 'VNG vừa đăng tuyển Senior Fullstack (94% match)' : 'VNG posted Senior Fullstack role (94% match)', 
      time: language === 'vi' ? '15 phút trước' : '15 mins ago' 
    },
    { 
      id: 2, 
      title: language === 'vi' ? 'Hồ sơ CV của bạn đã đạt 94/100 chuẩn ATS quốc tế' : 'Your CV reached 94/100 global ATS score', 
      time: language === 'vi' ? '1 giờ trước' : '1 hour ago' 
    },
    { 
      id: 3, 
      title: language === 'vi' ? 'Đã có 5 nhà tuyển dụng xem hồ sơ của bạn' : '5 recruiters viewed your profile today', 
      time: language === 'vi' ? 'Hôm qua' : 'Yesterday' 
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/90 transition-colors duration-300 shadow-soft-sm">
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-4 xl:px-6 2xl:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* 1. Sleek Brand Logo */}
          <div className="flex items-center space-x-2 shrink-0">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center space-x-2 group cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-300 shrink-0">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg xl:text-xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                    TalentBridge
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-[9px] font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase hidden 2xl:block truncate max-w-[170px]">
                  {t.nav.brandSubtitle}
                </span>
              </div>
            </a>
          </div>

          {/* 2. Center Nav Links (Clean modern typography, perfectly fitted across all screens) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink-0">
            <button 
              type="button"
              onClick={() => handleNavClick('categories')}
              className={`px-1.5 xl:px-2.5 py-1.5 text-xs xl:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'home' && activeSection === 'categories'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/50 shadow-soft-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <span>{language === 'vi' ? 'Ngành nghề' : 'Categories'}</span>
            </button>
            <button 
              type="button"
              onClick={() => onNavigate?.('jobs')}
              className={`px-1.5 xl:px-2.5 py-1.5 text-xs xl:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'jobs'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/50 shadow-soft-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <span>{language === 'vi' ? 'Tìm việc' : t.nav.findJobs}</span>
            </button>
            <button 
              type="button"
              onClick={() => handleNavClick('companies')}
              className={`px-1.5 xl:px-2.5 py-1.5 text-xs xl:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'home' && activeSection === 'companies'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/50 shadow-soft-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <span>{language === 'vi' ? 'Công ty' : t.nav.topCompanies}</span>
            </button>
            <button 
              type="button"
              onClick={() => handleCareerAiClick('scanner')}
              className={`px-1.5 xl:px-2.5 py-1.5 text-xs xl:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'career-ai' && careerAiTab === 'scanner'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/50 shadow-soft-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <span>{language === 'vi' ? 'Quét CV AI' : 'CV Scanner'}</span>
            </button>
            <button 
              type="button"
              onClick={() => handleCareerAiClick('roadmap')}
              className={`px-1.5 xl:px-2.5 py-1.5 text-xs xl:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'career-ai' && careerAiTab === 'roadmap'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/50 shadow-soft-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <span>{language === 'vi' ? 'Lộ trình' : 'Roadmap'}</span>
            </button>
          </nav>

          {/* 3. Right Action Cluster */}
          <div className="hidden lg:flex items-center space-x-1.5 xl:space-x-2 shrink-0">
            
            {/* Light / Dark Mode Segmented Switcher */}
            <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex items-center border border-slate-200/80 dark:border-slate-700 shadow-soft-xs">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') {
                    toggleTheme();
                    onThemeToggled?.('light');
                  }
                }}
                className={`p-1 xl:p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  theme === 'light'
                    ? 'bg-white text-amber-500 shadow-soft-xs ring-1 ring-slate-200/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Giao diện Sáng (Light Mode)"
                aria-label="Light mode"
              >
                <Sun className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') {
                    toggleTheme();
                    onThemeToggled?.('dark');
                  }
                }}
                className={`p-1 xl:p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-indigo-300 shadow-soft-xs ring-1 ring-slate-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Giao diện Tối (Dark Mode)"
                aria-label="Dark mode"
              >
                <Moon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </button>
            </div>

            {/* Language Switcher Pill (Clean VI | EN) */}
            <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex items-center border border-slate-200/80 dark:border-slate-700 shadow-soft-xs">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'vi'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-soft-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Tiếng Việt (VI)"
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-soft-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="English (EN)"
              >
                EN
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen(!notificationOpen);
                  setUserDropdownOpen(false);
                }}
                className="relative p-1.5 xl:p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                aria-label={t.nav.notificationsTitle}
              >
                <Bell className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              </button>

              {/* Notification Popover */}
              {notificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-soft-xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t.nav.notificationsTitle}</h4>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">3 mới</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    {notifications.map((item) => (
                      <div key={item.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">{item.title}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button 
                      type="button" 
                      onClick={() => setNotificationOpen(false)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      {t.nav.markAllRead}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Jobs Pill (when authenticated) - Shown on ultra-wide screens, also always in dropdown & profile */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={onOpenSavedJobsModal}
                className="hidden 2xl:flex p-1.5 xl:px-2.5 xl:py-1.5 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer items-center gap-1.5 shadow-soft-xs"
                title={language === 'vi' ? 'Xem việc làm đã lưu' : 'View Saved Jobs'}
              >
                <Bookmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600/30" />
                <span>{language === 'vi' ? 'Đã lưu' : 'Saved'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {savedJobIds.length}
                </span>
              </button>
            )}

            {/* Authenticated User Pill & Dropdown OR Guest Login Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotificationOpen(false);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 xl:pr-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700 transition-all cursor-pointer shadow-soft-xs active:scale-98 shrink-0"
                >
                  <div className="relative shrink-0">
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg object-cover ring-1 ring-emerald-500/60"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white dark:ring-slate-900" />
                  </div>
                  <div className="text-left hidden 2xl:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[120px] truncate leading-tight">
                      {user.name}
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block leading-none">
                      {user.role === 'candidate' ? (language === 'vi' ? 'Ứng viên' : 'Candidate') : (language === 'vi' ? 'Tuyển dụng' : 'Recruiter')}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-soft-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Header */}
                    <div className="px-4 py-2.5 flex items-center gap-3">
                      <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-xl object-cover ring-1 ring-emerald-500/50" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-0.5 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {user.role === 'candidate' ? (language === 'vi' ? 'Ứng viên PRO' : 'Candidate PRO') : (language === 'vi' ? 'Nhà tuyển dụng' : 'Recruiter')}
                        </span>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate?.('profile');
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-emerald-500" />
                        <span>{language === 'vi' ? 'Hồ sơ của tôi' : 'My Profile'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenSavedJobsModal?.();
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bookmark className="w-4 h-4 text-teal-500" />
                          <span>{language === 'vi' ? 'Việc làm đã lưu' : 'Saved Jobs'}</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                          {savedJobIds.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAppliedJobsModal?.();
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileCheck2 className="w-4 h-4 text-indigo-500" />
                          <span>{language === 'vi' ? 'Lịch sử ứng tuyển' : 'Applied Jobs'}</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                          {appliedJobs.length}
                        </span>
                      </button>

                    </div>

                    {/* Sign out */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{language === 'vi' ? 'Đăng xuất' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login Button with prominent color & icon */
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-2.5 xl:px-3 py-1.5 xl:py-2 text-xs font-bold rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300/90 dark:border-emerald-700/80 shadow-soft-xs flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all cursor-pointer hover:border-emerald-400"
              >
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.nav.login}</span>
              </button>
            )}

            {/* Post a Job Button */}
            <button
              type="button"
              onClick={onOpenPostJobModal}
              className="relative overflow-hidden group px-3 xl:px-3.5 py-1.5 xl:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-soft flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
              title={language === 'vi' ? 'Đăng tin tuyển dụng mới với AI' : 'Post a Job Opening with AI'}
            >
              <div className="shimmer-sweep" />
              <PlusCircle className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
              <span className="hidden 2xl:inline">{language === 'vi' ? 'Đăng tin tuyển dụng' : 'Post a Job'}</span>
              <span className="2xl:hidden">{language === 'vi' ? 'Đăng tin' : 'Post Job'}</span>
            </button>

          </div>

          {/* Mobile / Tablet Right Controls: Dark mode toggle & Menu button */}
          <div className="flex lg:hidden items-center space-x-1.5">
            <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex items-center border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') {
                    toggleTheme();
                    onThemeToggled?.('light');
                  }
                }}
                className={`p-1 rounded-lg text-xs transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-amber-500 shadow-soft-xs'
                    : 'text-slate-400'
                }`}
                aria-label="Light mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') {
                    toggleTheme();
                    onThemeToggled?.('dark');
                  }
                }}
                className={`p-1 rounded-lg text-xs transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-indigo-300 shadow-soft-xs'
                    : 'text-slate-400'
                }`}
                aria-label="Dark mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {language === 'vi' ? 'VI' : 'EN'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 rounded-lg cursor-pointer"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile / Tablet Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-soft-xl">
          {isAuthenticated && user && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-xl object-cover ring-1 ring-emerald-500" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">{user.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfileModal?.();
                }}
                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shrink-0"
              >
                {language === 'vi' ? 'Hồ sơ' : 'Profile'}
              </button>
            </div>
          )}

          <div className="flex flex-col space-y-1.5">
            <button 
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('categories');
              }}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${
                currentView === 'home' && activeSection === 'categories'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{language === 'vi' ? 'Ngành nghề' : 'Categories'}</span>
            </button>
            <button 
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate?.('jobs');
              }}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${
                currentView === 'jobs'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{language === 'vi' ? 'Tìm việc' : t.nav.findJobs}</span>
            </button>
            <button 
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('companies');
              }}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${
                currentView === 'home' && activeSection === 'companies'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{language === 'vi' ? 'Công ty' : t.nav.topCompanies}</span>
            </button>
            <button 
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleCareerAiClick('scanner');
              }}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${
                currentView === 'career-ai' && careerAiTab === 'scanner'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{language === 'vi' ? 'Quét CV AI' : 'CV Scanner'}</span>
            </button>
            <button 
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleCareerAiClick('roadmap');
              }}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${
                currentView === 'career-ai' && careerAiTab === 'roadmap'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{language === 'vi' ? 'Lộ trình' : 'Roadmap'}</span>
            </button>

            {isAuthenticated && (
              <>
                <button 
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSavedJobsModal?.();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-teal-500" />
                    <span>{language === 'vi' ? 'Việc làm đã lưu' : 'Saved Jobs'}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    {savedJobIds.length}
                  </span>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAppliedJobsModal?.();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-indigo-500" />
                    <span>{language === 'vi' ? 'Lịch sử ứng tuyển' : 'Applied Jobs'}</span>
                  </div>
                  <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">
                    {appliedJobs.length}
                  </span>
                </button>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 px-4 text-center text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-center gap-2 transition-all shadow-soft-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'vi' ? 'Đăng xuất' : 'Sign Out'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal?.();
                }}
                className="w-full py-2.5 px-4 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300/90 dark:border-emerald-700/80 rounded-xl flex items-center justify-center gap-2 transition-all shadow-soft-xs"
              >
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.nav.login}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPostJobModal?.();
              }}
              className="w-full py-2.5 px-4 text-center text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl flex items-center justify-center gap-2 transition-all shadow-soft active:scale-[0.99] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-100" />
              <span>{language === 'vi' ? 'Đăng tin tuyển dụng mới' : 'Post a New Job'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
