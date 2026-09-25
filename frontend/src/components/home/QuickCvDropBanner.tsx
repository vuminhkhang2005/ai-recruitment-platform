import React, { useState } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  FileCheck,
  ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface QuickCvDropBannerProps {
  onOpenCvScanner: () => void;
}

export const QuickCvDropBanner: React.FC<QuickCvDropBannerProps> = ({ onOpenCvScanner }) => {
  const { t, language } = useLanguage();
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
    onOpenCvScanner();
  };

  return (
    <section className="py-10 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dropzone Container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-12 transition-all duration-300 border-2 ${
            isDragging
              ? 'bg-emerald-950 border-emerald-400 scale-[1.01] shadow-[0_20px_50px_rgba(16,185,129,0.3)]'
              : 'bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/90 border-slate-800 shadow-soft-2xl'
          }`}
        >
          {/* Ambient Background Lighting */}
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Left Info */}
            <div className="flex-1 text-center lg:text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black shadow-soft-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>AI CV PARSER & INSTANT MATCH</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-emerald-200/80 font-medium">⚡ 5.2s {language === 'vi' ? 'phân tích' : 'speed'}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                {t.quickCv.title}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {t.quickCv.subtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  PDF, DOCX ≤ 10MB
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'vi' ? 'Bảo mật chuẩn Nghị định 13/2023' : 'Strict Data Privacy'}
                </span>
              </div>
            </div>

            {/* Right Action Buttons with Interactive Drag Cue */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenCvScanner}
                className="w-full sm:w-auto px-7 py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-[0_10px_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2.5 cursor-pointer group relative overflow-hidden"
              >
                <div className="shimmer-sweep" />
                <UploadCloud className="w-5 h-5 text-slate-950 group-hover:-translate-y-1 transition-transform" />
                <span>{t.quickCv.btnUpload}</span>
              </button>

              <button
                type="button"
                onClick={onOpenCvScanner}
                className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-2xl text-sm transition-all border border-white/15 flex items-center justify-center gap-2 cursor-pointer hover:border-white/30"
              >
                <span>{t.quickCv.btnDemo}</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
