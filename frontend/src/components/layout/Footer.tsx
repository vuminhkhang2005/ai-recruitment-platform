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
        { to: '/jobs', label: language === 'vi' ? 'Tìm việc làm' : 'Find Jobs' },
        { to: '/companies', label: language === 'vi' ? 'Danh sách công ty' : 'Companies' },
        { to: '/tools', label: language === 'vi' ? 'Công cụ nghề nghiệp' : 'Career Tools' },
        { to: '/profile', label: language === 'vi' ? 'Hồ sơ & CV' : 'Profile & CV' },
      ],
    },
    {
      title: language === 'vi' ? 'Nhà tuyển dụng' : 'Employers',
      links: [
        { to: '/employers', label: language === 'vi' ? 'Giới thiệu dịch vụ' : 'Services Overview' },
        { to: '/register?role=recruiter', label: language === 'vi' ? 'Tạo tài khoản nhà tuyển dụng' : 'Employer Registration' },
        { to: '/employer/jobs/new', label: language === 'vi' ? 'Đăng tin tuyển dụng' : 'Post a Job' },
      ],
    },
  ];

  return (
    <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-16 pb-10 border-t border-slate-200 dark:border-slate-800 mt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 text-sm max-w-sm leading-relaxed">
            {language === 'vi'
              ? 'Nền tảng tuyển dụng việc làm tại Việt Nam. Đồ án môn học — dữ liệu công ty và tin tuyển dụng là dữ liệu mẫu.'
              : 'Multi-industry career and recruitment platform in Vietnam. Academic project — company and job data are samples.'}
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
        <span>© {new Date().getFullYear()} TalentBridge. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <LanguageSwitch />
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {language === 'vi' ? 'Kết nối nhân tài và doanh nghiệp đa lĩnh vực' : 'Connecting Multi-Industry Talent & Businesses'}
          </span>
        </div>
      </div>
    </footer>
  );
};

