import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Navbar';

const COLUMNS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: 'Ứng viên',
    links: [
      { to: '/jobs', label: 'Tìm việc làm' },
      { to: '/companies', label: 'Danh sách công ty' },
      { to: '/tools', label: 'Công cụ nghề nghiệp' },
      { to: '/profile', label: 'Hồ sơ & CV' },
    ],
  },
  {
    title: 'Nhà tuyển dụng',
    links: [
      { to: '/employers', label: 'Giới thiệu dịch vụ' },
      { to: '/register?role=recruiter', label: 'Tạo tài khoản nhà tuyển dụng' },
      { to: '/employer/jobs/new', label: 'Đăng tin tuyển dụng' },
    ],
  },
];

export const Footer: React.FC = () => (
  <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-16 pb-10 border-t border-slate-200 dark:border-slate-800 mt-16 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      <div className="lg:col-span-2">
        <Logo />
        <p className="mt-4 text-sm max-w-sm leading-relaxed">
          Nền tảng tuyển dụng việc làm tại Việt Nam. Đồ án môn học — dữ liệu công ty và tin tuyển dụng là dữ liệu mẫu.
        </p>
      </div>
      {COLUMNS.map((c) => (
        <div key={c.title}>
          <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4">{c.title}</p>
          <ul className="space-y-2.5 text-sm">
            {c.links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row gap-2 justify-between">
      <span>© {new Date().getFullYear()} TalentBridge. All rights reserved.</span>
      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Kết nối nhân tài và doanh nghiệp Việt Nam</span>
    </div>
  </footer>
);
