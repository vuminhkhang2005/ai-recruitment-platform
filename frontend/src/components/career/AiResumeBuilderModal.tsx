import React from 'react';
import { X } from 'lucide-react';
import { AiResumeBuilderSection } from './AiResumeBuilderSection';
import { useLanguage } from '../../i18n/LanguageContext';

export interface AiResumeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFindMatchingJobs?: () => void;
  onShowToast?: (msg: string) => void;
}

export const AiResumeBuilderModal: React.FC<AiResumeBuilderModalProps> = ({
  isOpen,
  onClose,
  onFindMatchingJobs,
  onShowToast
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  if (!isOpen) return null;

  return (
    <div
      data-testid="ai-resume-builder-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative bg-slate-50 dark:bg-slate-950 rounded-3xl max-w-6xl w-full p-4 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft-2xl max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md z-20">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {isVi ? 'Không Gian Soạn Thảo & Tối Ưu Hóa CV Bằng Trí Tuệ Nhân Tạo' : 'AI Resume Engineering & Live Tailoring Studio'}
          </div>

          <button
            type="button"
            data-testid="btn-close-resume-builder-modal"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 shadow-soft-xs hover:shadow-soft transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Builder Content */}
        <AiResumeBuilderSection
          onFindMatchingJobs={onFindMatchingJobs}
          onShowToast={onShowToast}
        />

      </div>
    </div>
  );
};
