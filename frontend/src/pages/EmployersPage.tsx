import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../lib/usePageTitle';
import { useLanguage } from '../i18n/LanguageContext';

const STEPS_VI = [
  { title: 'Tạo tài khoản & Xác minh Doanh nghiệp', text: 'Đăng ký bằng email công việc, liên kết hồ sơ pháp lý công ty (Mã số thuế) để nhận huy hiệu Doanh nghiệp Đã xác minh.' },
  { title: 'Đăng tin & Chuẩn hóa Kỹ năng AI', text: 'Thiết lập mô tả công việc, trọng số kỹ năng bắt buộc, số năm kinh nghiệm tối thiểu và mức đãi ngộ minh bạch.' },
  { title: 'Sàng lọc ATS & Phỏng vấn Hội đồng', text: 'Hệ thống tự động xếp hạng ứng viên theo điểm khớp AI, hỗ trợ chủ động săn nhân tài (Talent Pool) và chấm điểm phỏng vấn đa vòng.' },
];

const STEPS_EN = [
  { title: 'Create Account & Verify Company', text: 'Sign up with your corporate email and link your company tax profile to earn the Verified Enterprise badge.' },
  { title: 'Post Jobs & Configure AI Skills', text: 'Define job descriptions, required skill weights, minimum experience years, and transparent salary bands.' },
  { title: 'ATS Screening & Panel Interviews', text: 'Automatically rank applicants by AI match score, proactively source from the Talent Pool, and evaluate multi-round interviews.' },
];

const SUITE_FEATURES_VI = [
  {
    icon: Sparkles,
    title: 'Săn nhân tài chủ động (AI Talent Pool)',
    desc: 'Tìm kiếm kho ứng viên đang bật chế độ Open-to-Work, tự động tính điểm khớp với từng vị trí tuyển dụng và gửi lời mời ứng tuyển 1-click.',
    to: '/employer/talent-pool',
    cta: 'Khám phá Talent Pool',
  },
  {
    icon: BarChart3,
    title: 'Phân tích Phễu tuyển dụng & Chất lượng ATS',
    desc: 'Đo lường tỷ lệ chuyển đổi qua 6 giai đoạn (Applied -> Screening -> Interview -> Offered -> Hired) và phân bổ chất lượng hồ sơ.',
    to: '/employer/analytics',
    cta: 'Xem Báo cáo Analytics',
  },
  {
    icon: Calendar,
    title: 'Quản lý Lịch phỏng vấn & Chấm điểm Scorecard',
    desc: 'Thiết lập lịch phỏng vấn Online/Offline, phân công hội đồng phỏng vấn (Panelists) và tổng hợp phiếu đánhgia đa tiêu chí.',
    to: '/employer/interviews',
    cta: 'Quản lý Lịch phỏng vấn',
  },
  {
    icon: ShieldCheck,
    title: 'Phân quyền Đội ngũ Tuyển dụng (Hiring Team)',
    desc: 'Mời đồng nghiệp tham gia với vai trò Company Admin, Recruiter hoặc Interviewer kèm kiểm soát quyền truy cập chặt chẽ.',
    to: '/employer/team',
    cta: 'Cấu hình Đội ngũ HR',
  },
];

const SUITE_FEATURES_EN = [
  {
    icon: Sparkles,
    title: 'Proactive AI Talent Pool Sourcing',
    desc: 'Search Open-to-Work candidates, compute real-time ATS match scores against your open roles, and send 1-click job invitations.',
    to: '/employer/talent-pool',
    cta: 'Explore Talent Pool',
  },
  {
    icon: BarChart3,
    title: 'Recruitment Funnel & ATS Quality Analytics',
    desc: 'Track conversion rates across all 6 pipeline stages and monitor applicant match score distributions in real time.',
    to: '/employer/analytics',
    cta: 'View Analytics Suite',
  },
  {
    icon: Calendar,
    title: 'Interview Scheduling & Panel Scorecards',
    desc: 'Schedule Online/Offline interview rounds, assign panelists, and collect structured multi-criteria candidate evaluations.',
    to: '/employer/interviews',
    cta: 'Manage Interviews',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Hiring Team Collaboration',
    desc: 'Invite colleagues as Company Admin, Recruiter, or Interviewer with granular role-based access control.',
    to: '/employer/team',
    cta: 'Manage Hiring Team',
  },
];

const TEXT = {
  vi: {
    title: 'Dành cho nhà tuyển dụng',
    headline: 'Tuyển dụng nhân sự chất lượng cao trên',
    subtitle: 'Giải pháp ATS thế hệ mới tích hợp AI Matching, chủ động săn nhân tài (Talent Pool) và quản trị đội ngũ tuyển dụng chuyên nghiệp.',
    dashboard: 'Vào Bảng điều khiển HR',
    register: 'Tạo tài khoản nhà tuyển dụng',
    login: 'Đăng nhập Nhà tuyển dụng',
    suiteHeading: 'Bộ công cụ Tuyển dụng Doanh nghiệp Toàn diện',
    suiteSub: 'Tối ưu hóa toàn bộ vòng đời tuyển dụng từ lúc tìm kiếm nguồn ứng viên đến khi phát hành Offer.',
  },
  en: {
    title: 'For employers',
    headline: 'Hire top talent faster on',
    subtitle: 'Next-generation ATS powered by AI skill matching, proactive Talent Pool sourcing, and collaborative hiring team workflows.',
    dashboard: 'Go to Employer Dashboard',
    register: 'Create an employer account',
    login: 'Employer Sign In',
    suiteHeading: 'Enterprise Recruitment & AI Sourcing Suite',
    suiteSub: 'Streamline your entire hiring lifecycle from proactive candidate sourcing to final offer.',
  },
};

export const EmployersPage: React.FC = () => {
  const { language } = useLanguage();
  const en = language === 'en';
  const t = TEXT[en ? 'en' : 'vi'];
  const steps = en ? STEPS_EN : STEPS_VI;
  const features = en ? SUITE_FEATURES_EN : SUITE_FEATURES_VI;
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{t.suiteHeading}</h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-500 dark:text-slate-400">{t.suiteSub}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs flex flex-col justify-between gap-4 hover:border-emerald-400/60 transition"
              >
                <div>
                  <span className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
                <div>
                  <Link
                    to={isRecruiter ? f.to : `/login?next=${encodeURIComponent(f.to)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>{f.cta} &rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};
