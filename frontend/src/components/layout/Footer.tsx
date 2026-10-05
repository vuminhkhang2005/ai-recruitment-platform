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
  <footer className="bg-[#121212] text-slate-400 mt-16">
    <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <div className="lg:col-span-2">
        <Logo />
        <p className="mt-3 text-sm max-w-sm">Nền tảng tuyển dụng việc làm IT tại Việt Nam. Đồ án môn học — dữ liệu công ty và tin tuyển dụng là dữ liệu mẫu.</p>
      </div>
      {COLUMNS.map((c) => (
        <div key={c.title}>
          <p className="text-white font-semibold text-sm mb-3">{c.title}</p>
          <ul className="space-y-2 text-sm">
            {c.links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-white/10 py-4 text-center text-xs">© {new Date().getFullYear()} TalentBridge</div>
  </footer>
);
