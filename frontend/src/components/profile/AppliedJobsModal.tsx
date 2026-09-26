import React, { useEffect } from 'react';
import { 
  X, 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { CompanyLogo } from '../ui/CompanyLogo';

interface AppliedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppliedJobsModal: React.FC<AppliedJobsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const { appliedJobs, refreshApplications } = useAuth();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useEffect(() => {
    if (isOpen) {
      refreshApplications();
    }
  }, [isOpen, refreshApplications]);

  const getStatusBadge = (status: string, textVi: string, textEn: string) => {
    if (status === 'ai_passed') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-soft-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{isVi ? textVi : textEn}</span>
        </span>
      );
    }
    if (status === 'interview') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 flex items-center gap-1.5 shadow-soft-xs">
          <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{isVi ? textVi : textEn}</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shadow-soft-xs">
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span>{isVi ? textVi : textEn}</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-soft-2xl border border-slate-200 dark:border-slate-800 relative transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isVi ? 'Lịch sử ứng tuyển & Tiến độ' : 'Application History & Pipeline'}</span>
                <span className="text-xs bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-extrabold px-2.5 py-0.5 rounded-full">
                  {appliedJobs.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi ? 'Theo dõi thời gian thực quá trình duyệt CV và phản hồi từ nhà tuyển dụng' : 'Real-time tracking of your CV screening and recruiter responses'}
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

        {/* Content List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {appliedJobs.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <FileCheck2 className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {isVi ? 'Bạn chưa nộp hồ sơ vào vị trí nào' : 'No applications submitted yet'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isVi 
                  ? 'Chọn các công việc phù hợp với điểm ATS của bạn và nhấn Ứng tuyển nhanh để bắt đầu.' 
                  : 'Select jobs matching your ATS score and click Quick Apply to submit your profile.'}
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
                <span>{isVi ? 'Khám phá việc làm' : 'Browse jobs'}</span>
              </button>
            </div>
          ) : (
            appliedJobs.map((app) => (
              <div 
                key={app.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <CompanyLogo 
                      company={app.company} 
                      className="w-11 h-11 rounded-xl object-contain bg-white dark:bg-slate-900 p-1 border border-slate-200/80 dark:border-slate-700 shrink-0" 
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {app.jobTitle}
                      </h4>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {app.company}
                      </p>
                    </div>
                  </div>

                  <div>
                    {getStatusBadge(app.status, app.statusTextVi, app.statusTextEn)}
                  </div>
                </div>

                {/* Progress bar / Timeline */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isVi ? `Nộp ngày: ${app.appliedAt}` : `Applied on: ${app.appliedAt}`}</span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {isVi ? 'Đã gửi tới Nhà tuyển dụng' : 'Delivered to Hiring Team'}
                  </span>
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