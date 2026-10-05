import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  FileCheck, 
  TrendingUp, 
  CheckCircle2, 
  Compass, 
  ShieldCheck,
  ChevronRight,
  Zap,
  Target,
  Calculator,
  Scale,
  Code2
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { AiCvScannerDemo } from '../home/AiCvScannerDemo';
import { CareerRoadmapPreview } from '../home/CareerRoadmapPreview';
import { SalaryCalculatorSection } from './SalaryCalculatorSection';
import { OfferNegotiationStudio } from './OfferNegotiationStudio';
import { TechAssessmentSandbox } from './TechAssessmentSandbox';

interface CareerAiHubProps {
  initialTab?: 'scanner' | 'roadmap' | 'salary' | 'negotiation' | 'coding';
  onBackToHome: () => void;
  onFindMatchingJobs?: () => void;
}

export const CareerAiHub: React.FC<CareerAiHubProps> = ({
  initialTab = 'scanner',
  onBackToHome,
  onFindMatchingJobs
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [activeTab, setActiveTab] = useState<'scanner' | 'roadmap' | 'salary' | 'negotiation' | 'coding'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Navigation Row: Back Button & Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs transition-all cursor-pointer group hover:shadow-soft active:scale-98"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-emerald-600 dark:text-emerald-400" />
              <span>{isVi ? 'Quay lại trang chủ' : 'Back to Home'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
              <span>{isVi ? 'Trang chủ' : 'Home'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-600 dark:text-slate-300 font-bold">
                {isVi ? 'Trợ lý AI Sự nghiệp' : 'AI Career Suite'}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {activeTab === 'scanner' 
                  ? (isVi ? 'Quét CV chuẩn ATS' : 'ATS CV Scanner') 
                  : activeTab === 'roadmap'
                  ? (isVi ? 'Lộ trình Kỹ năng' : 'Skill Roadmap')
                  : activeTab === 'salary'
                  ? (isVi ? 'Định Giá Lương Tech' : 'Tech Salary Estimator')
                  : activeTab === 'negotiation'
                  ? (isVi ? 'Đàm Phán Lương & Offer' : 'Offer & Negotiation')
                  : (isVi ? 'Thử Thách Code & Thuật Toán' : 'AI Coding Sandbox')}
              </span>
            </div>
          </div>

          {/* Quick status pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shadow-soft-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isVi ? 'Hệ thống AI Đang hoạt động 100%' : 'AI Model Online & Ready'}</span>
          </div>
        </div>

        {/* Hub Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 overflow-hidden shadow-soft-xl border border-slate-800">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isVi ? 'BỘ CÔNG CỤ TRÍ TUỆ SỰ NGHIỆP CÁ NHÂN HÓA' : 'PERSONALIZED CAREER INTELLIGENCE'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              {isVi ? (
                <>
                  Trung Tâm <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Trí Tuệ Sự Nghiệp AI</span>
                </>
              ) : (
                <>
                  AI Career <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Intelligence Hub</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {isVi
                ? 'Không gian làm việc chuyên biệt dành cho ứng viên: Kiểm định CV theo tiêu chuẩn các tập đoàn đa quốc gia và vạch lộ trình thăng tiến chinh phục nấc thang thu nhập mới.'
                : 'A dedicated workspace for high-growth candidates: Audit your resume against top tier ATS parsers and engineer a step-by-step roadmap to your target compensation.'}
            </p>

            {/* Quick highlight metrics */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isVi ? '94%+ Tỷ lệ vượt bộ lọc ATS' : '94%+ ATS Pass Rate'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-teal-400" />
                <span>{isVi ? 'Phân tích từ khóa JD tức thì' : 'Instant JD Keyword Audit'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>{isVi ? 'Dự phóng thu nhập tới +65%' : '+65% Career Salary Growth'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Segmented Tab Controller */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
            
            {/* Tab 1: AI CV Scanner */}
            <button
              type="button"
              data-testid="tab-cv-scanner"
              onClick={() => setActiveTab('scanner')}
              className={`p-4 rounded-xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/70 text-slate-900 dark:text-white shadow-soft-xs'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                activeTab === 'scanner'
                  ? 'bg-emerald-600 text-white shadow-soft-xs scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight">
                    {isVi ? 'Phân Tích CV Chuẩn ATS' : 'AI Resume ATS Scanner'}
                  </span>
                  {activeTab === 'scanner' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {isVi ? 'Bóc tách từ khóa, chấm điểm độ khớp JD' : 'Audit keywords and score JD match rates'}
                </p>
              </div>
            </button>

            {/* Tab 2: Skill Gap Roadmap */}
            <button
              type="button"
              data-testid="tab-career-roadmap"
              onClick={() => setActiveTab('roadmap')}
              className={`p-4 rounded-xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                activeTab === 'roadmap'
                  ? 'bg-teal-50 dark:bg-teal-950/70 border border-teal-300 dark:border-teal-700/70 text-slate-900 dark:text-white shadow-soft-xs'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                activeTab === 'roadmap'
                  ? 'bg-teal-600 text-white shadow-soft-xs scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight">
                    {isVi ? 'Bản Đồ Lộ Trình Kỹ Năng' : 'Skill Gap & Roadmap'}
                  </span>
                  {activeTab === 'roadmap' && (
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {isVi ? 'Xác định khoảng cách năng lực & mốc học tập' : 'Identify competency gaps & learning tracks'}
                </p>
              </div>
            </button>

            {/* Tab 3: Tech Salary Estimator & Compensation Benchmark */}
            <button
              type="button"
              data-testid="tab-salary-calculator"
              onClick={() => setActiveTab('salary')}
              className={`p-4 rounded-xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                activeTab === 'salary'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/70 text-slate-900 dark:text-white shadow-soft-xs'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                activeTab === 'salary'
                  ? 'bg-emerald-600 text-white shadow-soft-xs scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight">
                    {isVi ? 'Định Giá Lương Tech' : 'Tech Salary Estimator'}
                  </span>
                  {activeTab === 'salary' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {isVi ? 'Bộ tính Gross / Net & xếp hạng thị trường' : 'Gross / Net calculator & market percentile'}
                </p>
              </div>
            </button>

            {/* Tab 4: AI Offer Negotiation & Package Evaluator */}
            <button
              type="button"
              data-testid="tab-offer-negotiation"
              onClick={() => setActiveTab('negotiation')}
              className={`p-4 rounded-xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                activeTab === 'negotiation'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-300 dark:border-indigo-700/70 text-slate-900 dark:text-white shadow-soft-xs'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                activeTab === 'negotiation'
                  ? 'bg-indigo-600 text-white shadow-soft-xs scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight">
                    {isVi ? 'So Sánh & Đàm Phán Offer' : 'Offer & Negotiation'}
                  </span>
                  {activeTab === 'negotiation' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {isVi ? 'Tính Total Comp (TC) & sinh kịch bản' : 'Total Comp (TC) & counter-offer scripts'}
                </p>
              </div>
            </button>

            {/* Tab 5: AI Coding Assessment & Algorithm Sandbox */}
            <button
              type="button"
              data-testid="tab-coding-sandbox"
              onClick={() => setActiveTab('coding')}
              className={`p-4 rounded-xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                activeTab === 'coding'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/70 text-slate-900 dark:text-white shadow-soft-xs'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                activeTab === 'coding'
                  ? 'bg-emerald-600 text-white shadow-soft-xs scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight">
                    {isVi ? 'Thử Thách Code AI' : 'AI Coding Sandbox'}
                  </span>
                  {activeTab === 'coding' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {isVi ? 'Luyện thuật toán, AI review O(N)' : 'Solve problems & live AI complexity review'}
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* Tab Content Display */}
        <div className="transition-all duration-300">
          {activeTab === 'scanner' ? (
            <div className="animate-fade-in">
              <AiCvScannerDemo onFindMatchingJobs={onFindMatchingJobs} />
            </div>
          ) : activeTab === 'roadmap' ? (
            <div className="animate-fade-in">
              <CareerRoadmapPreview />
            </div>
          ) : activeTab === 'salary' ? (
            <div className="animate-fade-in">
              <SalaryCalculatorSection onFindMatchingJobs={onFindMatchingJobs} />
            </div>
          ) : activeTab === 'negotiation' ? (
            <div className="animate-fade-in">
              <OfferNegotiationStudio onFindMatchingJobs={onFindMatchingJobs} />
            </div>
          ) : (
            <div className="animate-fade-in">
              <TechAssessmentSandbox />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
