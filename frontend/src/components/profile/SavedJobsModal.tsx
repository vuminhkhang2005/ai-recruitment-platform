import React from 'react';
import { 
  X, 
  Bookmark, 
  Trash2, 
  Send, 
  MapPin, 
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { MOCK_JOBS, type Job } from '../../data/mockData';
import { CompanyLogo } from '../ui/CompanyLogo';

interface SavedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectJob: (job: Job) => void;
  onQuickApply: (job: Job) => void;
}

export const SavedJobsModal: React.FC<SavedJobsModalProps> = ({
  isOpen,
  onClose,
  onSelectJob,
  onQuickApply
}) => {
  if (!isOpen) return null;

  const { savedJobIds, toggleSaveJob } = useAuth();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const bookmarkedJobs = MOCK_JOBS.filter((job) => savedJobIds.includes(job.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-soft-2xl border border-slate-200 dark:border-slate-800 relative transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isVi ? 'Việc làm đã lưu' : 'Saved Jobs'}</span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full">
                  {bookmarkedJobs.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi ? 'Danh sách các cơ hội nghề nghiệp bạn đã đánh dấu quan tâm' : 'Curated opportunities you have bookmarked for later'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {bookmarkedJobs.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Bookmark className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {isVi ? 'Bạn chưa lưu công việc nào' : 'No saved jobs yet'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isVi 
                  ? 'Bấm biểu tượng Bookmark trên các thẻ việc làm hot để lưu lại và ứng tuyển khi sẵn sàng.' 
                  : 'Click the Bookmark icon on any job card to save it for later review and application.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const jobsEl = document.getElementById('jobs');
                  if (jobsEl) jobsEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-soft cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isVi ? 'Khám phá việc làm hot' : 'Explore hot jobs'}</span>
              </button>
            </div>
          ) : (
            bookmarkedJobs.map((job) => (
              <div 
                key={job.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <CompanyLogo 
                    company={job.company} 
                    className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-slate-900 p-1.5 border border-slate-200/80 dark:border-slate-700 shrink-0" 
                  />
                  <div className="space-y-1">
                    <h4 
                      onClick={() => {
                        onClose();
                        onSelectJob(job);
                      }}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      {job.title}
                    </h4>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {job.company} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isVi ? job.salary : (job.salaryEn || job.salary.replace('Triệu VNĐ', 'Million VND'))}</span>
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {isVi ? job.location : (job.locationEn || job.location)}
                      </span>
                      <span>•</span>
                      <span>{isVi ? (job.type === 'Remote' ? 'Từ xa' : job.type === 'Hybrid' ? 'Linh hoạt' : 'Toàn thời gian') : job.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => toggleSaveJob(job.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title={isVi ? 'Bỏ lưu' : 'Remove bookmark'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectJob(job);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    {isVi ? 'Chi tiết' : 'Details'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onQuickApply(job);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-soft flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isVi ? 'Ứng tuyển' : 'Apply'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-soft"
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};