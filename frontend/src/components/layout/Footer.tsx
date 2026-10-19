import React from 'react';
import { Link } from 'react-router-dom';
import { Logo, LanguageSwitch } from './Navbar';
import { useLanguage } from '../../i18n/LanguageContext';

export const Footer: React.FC = () => {
  const { language } = useLanguage();

  const columns = [
    {
      title: language === 'vi' ? 'Ứng viên' : 'Candidates',
      links: [
        { to: '/jobs', label: language === 'vi' ? 'Tìm việc làm & Gợi ý AI' : 'Find Jobs & AI Matches' },
        { to: '/companies', label: language === 'vi' ? 'Danh sách doanh nghiệp' : 'Partner Companies' },
        { to: '/tools/ai-resume-parser', label: language === 'vi' ? 'Bóc tách CV bằng AI' : 'AI Resume Parser' },
        { to: '/tools', label: language === 'vi' ? 'Công cụ tính lương & lộ trình' : 'Salary & Career Tools' },
        { to: '/profile', label: language === 'vi' ? 'Hồ sơ năng lực & CV' : 'Profile & CV' },
      ],
    },
    {
      title: language === 'vi' ? 'Nhà tuyển dụng' : 'Employers',
      links: [
        { to: '/employers', label: language === 'vi' ? 'Giải pháp tuyển dụng AI' : 'AI Hiring Solutions' },
        { to: '/register?role=recruiter', label: language === 'vi' ? 'Đăng ký tài khoản HR' : 'Employer Registration' },
        { to: '/employer/jobs/new', label: language === 'vi' ? 'Đăng tin tuyển dụng' : 'Post a Job' },
        { to: '/employer/talent-pool', label: language === 'vi' ? 'Săn ứng viên (Talent Pool)' : 'Talent Pool Sourcing' },
        { to: '/employer/analytics', label: language === 'vi' ? 'Thống kê & Phễu ATS' : 'Recruitment Analytics' },
      ],
    },
    {
      title: language === 'vi' ? 'Quản trị & Hệ thống AI' : 'Governance & AI Engine',
      links: [
        { to: '/admin', label: language === 'vi' ? 'Bảng điều khiển Admin & AI' : 'Admin & AI Telemetry' },
        { to: '/admin/users', label: language === 'vi' ? 'Quản lý Người dùng & RBAC' : 'User & RBAC Governance' },
        { to: '/admin/moderation', label: language === 'vi' ? 'Kiểm duyệt Công ty & Việc làm' : 'Company & Job Moderation' },
        { to: '/admin/skills', label: language === 'vi' ? 'Từ điển Kỹ năng Chuẩn AI' : 'Master Skill Taxonomy' },
        { to: '/admin/audit-logs', label: language === 'vi' ? 'Nhật ký Truy vết (Audit Trail)' : 'System Audit Logs' },
      ],
    },
  ];

  return (
    <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-16 pb-10 border-t border-slate-200 dark:border-slate-800 mt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 text-sm max-w-sm leading-relaxed">
            {language === 'vi'
              ? 'Nền tảng tuyển dụng và định hướng nghề nghiệp thông minh tích hợp thuật toán AI Matching, phân tích độ khớp ATS thời gian thực và hệ thống quản trị nhân tài toàn diện.'
              : 'Intelligent career and recruitment platform powered by real-time AI skill matching, ATS gap analysis, and end-to-end talent governance.'}
          </p>
        </div>
        {columns.map((c) => (
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <span>© {new Date().getFullYear()} TalentBridge AI Recruitment Platform. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <LanguageSwitch />
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {language === 'vi' ? 'Kết nối nhân tài và doanh nghiệp bằng trí tuệ nhân tạo' : 'Connecting Talent & Enterprises with AI Intelligence'}
          </span>
        </div>
      </div>
    </footer>
  );
};
