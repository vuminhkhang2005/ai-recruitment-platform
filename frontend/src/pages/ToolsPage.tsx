import React from 'react';
import { NavLink, Navigate, useNavigate, useParams } from 'react-router-dom';
import { SalaryCalculatorSection } from '../components/career/SalaryCalculatorSection';
import { OfferNegotiationStudio } from '../components/career/OfferNegotiationStudio';
import { TechAssessmentSandbox } from '../components/career/TechAssessmentSandbox';
import { AiResumeBuilderSection } from '../components/career/AiResumeBuilderSection';
import { CareerRoadmapPreview } from '../components/home/CareerRoadmapPreview';
import { usePageTitle } from '../lib/usePageTitle';
import { useLanguage } from '../i18n/LanguageContext';

const getTools = (lang: string) => [
  { slug: 'salary', label: lang === 'vi' ? 'Tính lương Gross / Net' : 'Gross / Net Salary', description: lang === 'vi' ? 'Quy đổi lương Gross sang Net theo bảo hiểm và thuế TNCN hiện hành.' : 'Convert Gross to Net salary based on current insurance and personal income tax.' },
  { slug: 'offer', label: lang === 'vi' ? 'So sánh offer' : 'Offer Comparison', description: lang === 'vi' ? 'Đặt các offer cạnh nhau để so sánh tổng thu nhập và phúc lợi.' : 'Compare compensation packages and benefits side-by-side.' },
  { slug: 'cv-builder', label: lang === 'vi' ? 'Tạo CV' : 'CV Builder', description: lang === 'vi' ? 'Soạn CV theo mẫu và xuất ra file.' : 'Create professional resumes and export to file.' },
  { slug: 'coding', label: lang === 'vi' ? 'Luyện code' : 'Code Practice', description: lang === 'vi' ? 'Bài tập thuật toán để ôn phỏng vấn kỹ thuật.' : 'Practice coding challenges for technical interviews.' },
  { slug: 'roadmap', label: lang === 'vi' ? 'Lộ trình kỹ năng' : 'Skill Roadmaps', description: lang === 'vi' ? 'Lộ trình học tham khảo cho các vị trí phổ biến.' : 'Skill roadmaps and career progression for popular roles.' },
] as const;

export const ToolsPage: React.FC = () => {
  const { tool } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const tools = getTools(language);
  const current = tools.find((t) => t.slug === tool);
  usePageTitle(current ? current.label : (isVi ? 'Công cụ' : 'Tools'));

  if (!current) return <Navigate to="/tools/salary" replace />;

  const goJobs = () => navigate('/jobs');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
        {isVi ? 'Công cụ nghề nghiệp' : 'Career Tools'}
      </h1>
      <nav className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200" aria-label="Công cụ">
        {tools.map((t) => (
          <NavLink
            key={t.slug}
            to={`/tools/${t.slug}`}
            className={({ isActive }) =>
              `px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${isActive ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400' : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-emerald-600'}`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <p className="mt-4 text-sm text-slate-500">{current.description}</p>
      <div className="mt-4">
        {current.slug === 'salary' && <SalaryCalculatorSection onFindMatchingJobs={goJobs} />}
        {current.slug === 'offer' && <OfferNegotiationStudio onFindMatchingJobs={goJobs} />}
        {current.slug === 'cv-builder' && <AiResumeBuilderSection onFindMatchingJobs={goJobs} />}
        {current.slug === 'coding' && <TechAssessmentSandbox />}
        {current.slug === 'roadmap' && <CareerRoadmapPreview />}
      </div>
    </div>
  );
};
