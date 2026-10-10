import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../lib/usePageTitle';
import { useLanguage } from '../i18n/LanguageContext';

const STEPS_VI = [
  { title: 'Tạo tài khoản', text: 'Đăng ký bằng email công việc và chọn công ty của bạn.' },
  { title: 'Đăng tin tuyển dụng', text: 'Nhập mô tả, yêu cầu, kỹ năng, mức lương và hạn nộp hồ sơ.' },
  { title: 'Nhận và xử lý hồ sơ', text: 'Xem CV, thư giới thiệu và chuyển ứng viên qua từng vòng. Ứng viên được thông báo khi trạng thái thay đổi.' },
];

const STEPS_EN = [
  { title: 'Create an account', text: 'Sign up with your work email and select your company.' },
  { title: 'Post a job', text: 'Add the description, requirements, skills, salary range and application deadline.' },
  { title: 'Review applications', text: 'Read CVs and cover letters, then move candidates through each stage. Candidates are notified whenever their status changes.' },
];

const TEXT = {
  vi: {
    title: 'Dành cho nhà tuyển dụng',
    headline: 'Tuyển dụng nhân sự chất lượng cao trên',
    subtitle: 'Đăng tin, nhận hồ sơ ứng viên và quản lý quy trình tuyển dụng ở một nơi.',
    dashboard: 'Vào trang quản lý',
    register: 'Tạo tài khoản nhà tuyển dụng',
    login: 'Đăng nhập',
  },
  en: {
    title: 'For employers',
    headline: 'Hire top talent on',
    subtitle: 'Post jobs, receive applications and manage your entire hiring pipeline in one place.',
    dashboard: 'Go to dashboard',
    register: 'Create an employer account',
    login: 'Sign in',
  },
};

export const EmployersPage: React.FC = () => {
  const { language } = useLanguage();
  const en = language === 'en';
  const t = TEXT[en ? 'en' : 'vi'];
  const steps = en ? STEPS_EN : STEPS_VI;
  usePageTitle(t.title);
  const { isRecruiter } = useAuth();
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-emerald-500/45 bg-gradient-to-b from-emerald-50/70 via-white/90 to-white/95 dark:from-emerald-950/35 dark:via-slate-900/70 dark:to-slate-900/90 ring-1 ring-emerald-400/25 shadow-[0_15px_45px_-12px_rgba(16,185,129,0.18)] px-6 py-12 sm:px-12 sm:py-16">
          <div className="absolute inset-0 hero-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_top_left,black_40%,transparent_75%)]" />
          <div className="relative max-w-2xl">
            <span className="inline-flex px-3 py-1 rounded-full border border-emerald-300/80 dark:border-emerald-700/70 bg-white/80 dark:bg-slate-900/70 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              {t.title}
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {t.headline}{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">TalentBridge</span>
            </h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg">
              {t.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {isRecruiter ? (
                <Link
                  to="/employer"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-soft"
                >
                  {t.dashboard}
                </Link>
              ) : (
                <>
                  <Link
                    to="/register?role=recruiter"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-soft"
                  >
                    {t.register}
                  </Link>
                  <Link
                    to="/login?next=/employer"
                    className="px-6 py-3 rounded-xl border border-emerald-300/90 dark:border-emerald-700/80 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:border-emerald-400 font-bold text-sm"
                  >
                    {t.login}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 grid gap-5 sm:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs hover:border-emerald-300 transition-colors"
          >
            <span className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center">
              {i + 1}
            </span>
            <h2 className="mt-4 font-black text-slate-900 dark:text-white">{s.title}</h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.text}</p>
          </div>
        ))}
      </section>
    </>
  );
};
