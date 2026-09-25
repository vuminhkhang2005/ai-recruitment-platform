import React, { useState } from 'react';
import { 
  Sparkles, 
  FileCheck, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  ShieldCheck,
  UploadCloud
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface AiFeaturesShowcaseProps {
  onOpenScanner: () => void;
  onOpenRoadmap: () => void;
}

export const AiFeaturesShowcase: React.FC<AiFeaturesShowcaseProps> = ({
  onOpenScanner,
  onOpenRoadmap
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onOpenScanner();
  };

  return (
    <section id="ai-features" className="py-4 sm:py-6 md:py-7 bg-slate-50/70 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/90 relative overflow-hidden transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/10 dark:cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-3.5 sm:space-y-4">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-bold tracking-wide shadow-soft-xs">
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{isVi ? 'BỘ ĐÔI TRỢ LÝ AI SỰ NGHIỆP' : 'AI CAREER COPILOT SUITE'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isVi ? (
              <>
                Tối Ưu CV & Vạch Rõ <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">Lộ Trình Sự Nghiệp</span>
              </>
            ) : (
              <>
                Supercharge Your CV & <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">Career Blueprint</span>
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {isVi 
              ? 'Chấm điểm CV chuẩn ATS trong 5 giây và vạch rõ lộ trình thăng tiến cá nhân hóa theo từng mốc kỹ năng.'
              : 'Audit your resume against global ATS benchmarks in 5 seconds and map your next promotion step-by-step.'}
          </p>
        </div>

        {/* 2 Feature Showcase Hero Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-5 items-stretch">
          
          {/* Card 1: AI CV Scanner Teaser & Dropzone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative bg-white dark:bg-slate-950/90 rounded-2xl border p-4 sm:p-5 flex flex-col justify-between hover:shadow-[0_15px_35px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 transition-all duration-300 ${
              isDragging
                ? 'border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/30'
                : 'border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-400/80 dark:hover:border-emerald-500/70'
            }`}
          >
            <div className="space-y-3">
              
              {/* Header Badge & Icon */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-soft-xs shrink-0 group-hover:scale-105 transition-transform">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug truncate">
                      {isVi ? 'AI CV Scanner & Chuẩn ATS' : 'AI CV Scanner & ATS Audit'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {isVi ? 'Phân tích từ khóa JD & định dạng chuẩn' : 'Keyword match & ATS formatting audit'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-500/20">
                    <Zap className="w-3 h-3 text-emerald-500" />
                    <span>5.2s</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300/60 dark:border-emerald-800/60 whitespace-nowrap">
                    {isVi ? 'CHUẨN ATS' : 'ATS READY'}
                  </span>
                </div>
              </div>

              {/* Visual Preview Snapshot Mini Box */}
              <div className="bg-slate-50 dark:bg-slate-900/90 rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-soft-xs shrink-0">
                    94<span className="text-[9px] opacity-80">%</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {isVi ? 'Hồ sơ Xuất sắc' : 'ATS Score: 94/100'}
                    </h4>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {isVi ? 'Top 5% Benchmark toàn ngành' : 'Top 5% Industry Benchmark'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 whitespace-nowrap">
                    {isVi ? 'Từ khóa: 95%' : 'Keywords: 95%'}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/50 whitespace-nowrap">
                    {isVi ? 'STAR: 88%' : 'STAR: 88%'}
                  </span>
                </div>
              </div>

              {/* Highlights row */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium pt-0.5">
                <div className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{isVi ? 'Bóc tách 100% kỹ năng & JD' : 'Extracts 100% hard & soft skills'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{isVi ? 'Bảo mật 100% (PDF, DOCX)' : 'Strict Data Privacy (PDF, DOCX)'}</span>
                </div>
              </div>
            </div>

            {/* CTA Button Row */}
            <div className="pt-3.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenScanner}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold ai-gradient-btn flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg active:scale-98 cursor-pointer transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isVi ? 'Scan CV ngay' : 'Scan Your CV Now'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  onClick={onOpenScanner}
                  className="py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 border border-slate-200/80 dark:border-slate-700 cursor-pointer active:scale-98 transition-all whitespace-nowrap"
                  title={isVi ? 'Trải nghiệm ngay với hồ sơ mẫu' : 'Try with demo CV profile'}
                >
                  <span>{isVi ? 'CV Mẫu' : 'Demo CV'}</span>
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] text-center text-slate-400 dark:text-slate-500">
                {isVi ? '💡 Kéo thả file CV vào đây hoặc bấm nút để quét ngay' : '💡 Drag & drop CV here or click to scan'}
              </p>
            </div>
          </div>

          {/* Card 2: Career Roadmap Teaser */}
          <div className="group relative bg-white dark:bg-slate-950/90 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 sm:p-5 flex flex-col justify-between hover:border-teal-400/80 dark:hover:border-teal-500/70 hover:shadow-[0_15px_35px_-10px_rgba(20,184,166,0.2)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="space-y-3">
              
              {/* Header Badge & Icon */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-soft-xs shrink-0 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug truncate">
                      {isVi ? 'Lộ Trình Kỹ Năng & Thăng Tiến' : 'Skill Gap & Career Roadmap'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {isVi ? 'Vạch rõ kỹ năng còn thiếu & mốc phát triển' : 'Highlight skill gaps & career milestones'}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold border border-teal-300/60 dark:border-teal-800/60 shrink-0 whitespace-nowrap pt-0.5">
                  {isVi ? '+65% THU NHẬP' : '+65% SALARY'}
                </span>
              </div>

              {/* Visual Preview Snapshot Mini Box */}
              <div className="bg-slate-50 dark:bg-slate-900/90 rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {isVi ? 'MỤC TIÊU CHUYỂN ĐỔI' : 'CAREER TRANSITION'}
                  </span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                    Junior Frontend → Senior Fullstack
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block">
                    65% → 95%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isVi ? 'Độ sẵn sàng' : 'Readiness'}
                  </span>
                </div>
              </div>

              {/* Highlights row */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium pt-0.5">
                <div className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate">{isVi ? 'Dự báo: 65 - 90 Triệu/tháng' : 'Projection: $2.8k - $3.8k/mo'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Zap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate">{isVi ? '3 Lộ trình chuẩn hóa' : '3 In-demand tracks'}</span>
                </div>
              </div>
            </div>

            {/* CTA Button Row */}
            <div className="pt-3.5 space-y-1.5">
              <button
                type="button"
                onClick={onOpenRoadmap}
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg active:scale-98 cursor-pointer transition-all"
              >
                <span>{isVi ? 'Khám phá lộ trình ngay' : 'Explore Career Roadmap'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="text-[10px] sm:text-[11px] text-center text-slate-400 dark:text-slate-500">
                {isVi ? '⚡ Gợi ý khóa học & kết nối nhà tuyển dụng' : '⚡ Course guidance & employer matching'}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

