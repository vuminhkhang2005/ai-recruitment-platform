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
    label: 'Kiểm duyệt Công ty & Tin',
    icon: Building2,
    testId: 'admin-tab-moderation',
  },
  {
    to: '/admin/skills',
    label: 'Từ điển Kỹ năng AI',
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
    <div className="mb-6 space-y-4">
      {/* Executive Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white p-5 sm:p-6 shadow-xl border border-indigo-500/20">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TalentBridge Governance & AI Control Center</span>
              <span className="inline-flex items-center gap-1 text-emerald-300 ml-1">
                <Activity className="w-3 h-3 animate-pulse" />
                LIVE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-3xl">
              {subtitle}
            </p>
          </div>

          {rightSlot && <div className="shrink-0">{rightSlot}</div>}
        </div>

        {/* Navigation Sub-bar (Single Symmetrical 5-Column Row on Desktop) */}
        <div className="relative mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                data-testid={tab.testId}
                className={({ isActive }) =>
                  `inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all truncate ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-300/60'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
