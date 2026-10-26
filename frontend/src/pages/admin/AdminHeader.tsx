import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Building2,
  FileSearch,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface AdminNavTab {
  to: string;
  labelVi: string;
  labelEn: string;
  icon: React.ElementType;
  end?: boolean;
  testId: string;
}

const ADMIN_TABS: AdminNavTab[] = [
  {
    to: '/admin',
    labelVi: 'Tổng quan & AI Engine',
    labelEn: 'Overview & AI Engine',
    icon: LayoutDashboard,
    end: true,
    testId: 'admin-tab-overview',
  },
  {
    to: '/admin/users',
    labelVi: 'Người dùng & RBAC',
    labelEn: 'Users & RBAC',
    icon: Users,
    testId: 'admin-tab-users',
  },
  {
    to: '/admin/moderation',
    labelVi: 'Kiểm duyệt Công ty & Tin',
    labelEn: 'Company & Job Moderation',
    icon: Building2,
    testId: 'admin-tab-moderation',
  },
  {
    to: '/admin/skills',
    labelVi: 'Từ điển Kỹ năng AI',
    labelEn: 'AI Skill Taxonomy',
    icon: BookOpen,
    testId: 'admin-tab-skills',
  },
  {
    to: '/admin/audit-logs',
    labelVi: 'Nhật ký Audit & Email',
    labelEn: 'Audit & Email Logs',
    icon: FileSearch,
    testId: 'admin-tab-audit',
  },
];

export const AdminHeader: React.FC<{
  title: string;
  subtitle: string;
  rightSlot?: React.ReactNode;
}> = ({ title, subtitle, rightSlot }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800/75 border border-slate-200/75 dark:border-slate-700/60 p-5 sm:p-6 shadow-soft-xs">
        {/* Subtle ambient accent */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/5 dark:bg-emerald-400/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-teal-500/5 dark:bg-teal-400/5 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/12 border border-emerald-500/20 dark:border-emerald-400/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-700/60 border border-slate-200/70 dark:border-slate-600/60 text-slate-600 dark:text-slate-300 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                <span>{isVi ? 'Trung tâm Quản trị & Điều hành AI' : 'Governance & AI Control Center'}</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300">
                  <Activity className="w-3 h-3" />
                  LIVE
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                {title}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          {rightSlot && <div className="shrink-0 flex items-center gap-2">{rightSlot}</div>}
        </div>

        {/* Harmonious Segmented Sub-navigation */}
        <div className="relative mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 bg-slate-100/70 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                data-testid={tab.testId}
                className={({ isActive }) =>
                  `inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all truncate ${
                    isActive
                      ? 'bg-white dark:bg-slate-700/90 text-emerald-700 dark:text-emerald-300 shadow-soft-xs ring-1 ring-slate-200/80 dark:ring-slate-600/70 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{isVi ? tab.labelVi : tab.labelEn}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
