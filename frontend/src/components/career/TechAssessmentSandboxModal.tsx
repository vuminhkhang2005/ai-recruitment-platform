import React from 'react';
import { X, Code2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { TechAssessmentSandbox } from './TechAssessmentSandbox';

interface TechAssessmentSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  company?: string;
}

export const TechAssessmentSandboxModal: React.FC<TechAssessmentSandboxModalProps> = ({
  isOpen,
  onClose,
  jobTitle = 'Senior Fullstack Engineer',
  company = 'Công nghệ cao'
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  if (!isOpen) return null;

  return (
    <div 
      data-testid="tech-assessment-sandbox-modal" 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl max-w-6xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-soft-2xl flex flex-col my-auto">
        
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isVi ? 'Phòng Đánh Giá Năng Lực Thuật Toán Trực Tiếp' : 'Live Technical Assessment Sandbox'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  AI GEMINI 2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi ? `Đánh giá kỹ thuật cho vị trí: ${jobTitle} tại ${company}` : `Technical assessment for ${jobTitle} at ${company}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="btn-close-sandbox-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex-1">
          <TechAssessmentSandbox
            initialProblemId="lru-cache"
            candidateRole={jobTitle}
            onAssessmentCompleted={(score) => {
              console.log(`Assessment completed with score: ${score}`);
            }}
          />
        </div>

      </div>
    </div>
  );
};
