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

interface AdminNavTab {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  testId: string;
}

const ADMIN_TABS: AdminNavTab[] = [
  {
    to: '/admin',
    label: 'Tổng quan & AI Engine',
    icon: LayoutDashboard,
    end: true,
    testId: 'admin-tab-overview',
  },
  {
    to: '/admin/users',
    label: 'Người dùng & RBAC',
    icon: Users,
    testId: 'admin-tab-users',
  },
  {
    to: '/admin/moderation',
    label: 'Kiểm duyệt Công ty & Việc làm',
    icon: Building2,
    testId: 'admin-tab-moderation',
  },
  {
    to: '/admin/skills',
    label: 'Từ điển Kỹ năng (Taxonomy)',
    icon: BookOpen,
    testId: 'admin-tab-skills',
  },
  {
    to: '/admin/audit-logs',
    label: 'Nhật ký Audit & Email',
    icon: FileSearch,
    testId: 'admin-tab-audit',
  },
];

export const AdminHeader: React.FC<{
  title: string;
  subtitle: string;
  rightSlot?: React.ReactNode;
}> = ({ title, subtitle, rightSlot }) => {
  return (
    <div className="mb-8 space-y-5">
      {/* Executive Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TalentBridge Governance & AI Control Center</span>
              <span className="inline-flex items-center gap-1 text-emerald-300 ml-1">
                <Activity className="w-3 h-3 animate-pulse" />
                LIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-300 max-w-3xl">
              {subtitle}
            </p>
          </div>

          {rightSlot && <div className="shrink-0">{rightSlot}</div>}
        </div>

        {/* Navigation Sub-bar */}
        <div className="relative mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                data-testid={tab.testId}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-300/60'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
