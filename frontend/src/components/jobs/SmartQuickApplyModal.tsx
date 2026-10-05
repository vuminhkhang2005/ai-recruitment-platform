import React, { useState, useMemo } from 'react';
import type { Job } from '../../data/mockData';
import { 
  X, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  FileText, 
  Check, 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  ShieldCheck,
  Zap,
  User,
  Phone,
  Mail,
  Sliders
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CompanyLogo } from '../ui/CompanyLogo';
import { AiMatchBadge } from '../ui/Stickers';

interface SmartQuickApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (job: Job) => void;
}

export const SmartQuickApplyModal: React.FC<SmartQuickApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen || !job) return null;

  const { language } = useLanguage();
  const isVi = language === 'vi';
  const { user, applyJob, isJobApplied } = useAuth();

  const candidateName = user?.name || (isVi ? 'Vũ Minh Khang' : 'Vu Minh Khang');
  const candidateEmail = user?.email || 'khang.candidate@talentbridge.vn';
  const candidatePhone = user?.phone || '+84 987 654 321';
  const candidateScore = user?.atsScore || 94;

  const [selectedResume, setSelectedResume] = useState<string>('primary');
  const [enableAiTailoring, setEnableAiTailoring] = useState<boolean>(true);
  const [expectedSalary, setExpectedSalary] = useState<string>(job.salary.replace('VNĐ', '').trim());
  const [noticePeriod, setNoticePeriod] = useState<'immediate' | '2weeks' | '1month'>('immediate');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(isJobApplied(job.id));

  // Auto-generate 3 tailored bullets matching this job
  const tailoredBullets = useMemo(() => {
    const skills = job.skills.slice(0, 3).join(', ');
    if (isVi) {
      return [
        `Thành thạo chuyên sâu ${skills} với hơn 4 năm kinh nghiệm phát triển hệ thống ổn định và bảo mật cao.`,
        `Từng tối ưu hóa hiệu năng ứng dụng, giảm thời gian phản hồi API tới 35% và duy trì uptime 99.98%.`,
        `Tư duy làm việc linh hoạt, quen thuộc với văn hóa Agile và tinh thần giải quyết vấn đề hướng tới sản phẩm.`
      ];
    } else {
      return [
        `Deep expertise in ${skills} with 4+ years architecting reliable, fault-tolerant production applications.`,
        `Proven track record optimizing API latency by 35% while sustaining 99.98% high availability.`,
        `Strong product-driven mindset with extensive cross-functional Agile/Scrum collaboration experience.`
      ];
    }
  }, [job, isVi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const bulletsText = enableAiTailoring ? `\n\nĐiểm nhấn năng lực phù hợp:\n${tailoredBullets.join('\n')}` : '';
    const note = `[Lương kỳ vọng: ${expectedSalary}] [Nhận việc: ${noticePeriod}]${bulletsText}`;

    await applyJob({ id: job.id, title: job.title, company: job.company }, undefined, note);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      onSuccess(job);
    }, 500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      data-testid="smart-quick-apply-modal"
    >
      <div 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col relative transition-all custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-soft shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isVi ? 'Ứng Tuyển Nhanh Thông Minh (1-Click)' : 'Smart 1-Click Quick Apply'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase">
                  AI Boost
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi ? 'Hồ sơ tuyển dụng được đồng bộ và tối ưu tự động theo JD' : 'Your profile is pre-filled and tailored to the job description'}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="btn-close-smart-apply"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Target Job Mini Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CompanyLogo company={job.company} size="sm" />
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {job.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {job.company} • {job.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <AiMatchBadge score={job.aiMatchScore} />
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200/70 dark:border-emerald-800/60">
                {job.salary}
              </span>
            </div>
          </div>

          {submitted ? (
            /* Already Applied State */
            <div 
              data-testid="smart-apply-submitted-state"
              className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-3 animate-fade-in"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {isVi ? 'Đã Nộp Hồ Sơ Ứng Tuyển!' : 'Application Submitted!'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                {isVi 
                  ? `Hồ sơ chuẩn ATS của ${candidateName} đã được chuyển trực tiếp đến hệ thống nhân sự ${job.company}.`
                  : `Your ATS-verified profile was dispatched directly to ${job.company}'s recruitment team.`}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-soft hover:bg-emerald-700 cursor-pointer transition-all"
              >
                {isVi ? 'Đóng hộp thoại' : 'Close window'}
              </button>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Candidate Info Summary Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isVi ? 'Thông tin ứng viên đã xác thực' : 'Verified Candidate Dossier'}</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    {candidateScore}/100 ATS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-400">Họ tên:</span>
                    <span className="font-bold">{candidateName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-400">Email:</span>
                    <span className="font-bold truncate">{candidateEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-400">Số ĐT:</span>
                    <span className="font-bold">{candidatePhone}</span>
                  </div>
                </div>
              </div>

              {/* CV Version Choice */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isVi ? 'Chọn phiên bản CV đính kèm' : 'Select Attached Resume'}</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid="cv-choice-primary"
                    onClick={() => setSelectedResume('primary')}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      selectedResume === 'primary'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{candidateName.replace(/\s+/g, '_')}_Master_CV.pdf</p>
                      <p className="text-[10px] text-slate-400">{isVi ? 'Bản chính (Chuẩn ATS 94%)' : 'Primary (94% ATS)'}</p>
                    </div>
                    {selectedResume === 'primary' && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    data-testid="cv-choice-tailored"
                    onClick={() => setSelectedResume('tailored')}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      selectedResume === 'tailored'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{candidateName.replace(/\s+/g, '_')}_GenAI_Tech.pdf</p>
                      <p className="text-[10px] text-slate-400">{isVi ? 'Chuyên sâu Công nghệ (96%)' : 'Tech-focused (96%)'}</p>
                    </div>
                    {selectedResume === 'tailored' && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </button>
                </div>
              </div>

              {/* AI Tailoring Toggle & Bullets */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {isVi ? 'Tự động tối ưu 3 điểm nhấn theo JD' : 'Auto-tailor 3 Key Highlights'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    data-testid="checkbox-ai-tailoring"
                    checked={enableAiTailoring}
                    onChange={(e) => setEnableAiTailoring(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer accent-teal-600"
                  />
                </div>

                {enableAiTailoring && (
                  <div className="space-y-1.5 pt-1 text-[11px] text-slate-700 dark:text-slate-300 animate-fade-in">
                    {tailoredBullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-teal-500 font-bold shrink-0">•</span>
                        <span className="leading-snug">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expectations: Salary & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isVi ? 'Mức lương kỳ vọng' : 'Expected Salary'}
                  </label>
                  <input
                    type="text"
                    data-testid="input-quick-apply-salary"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isVi ? 'Thời gian nhận việc' : 'Availability / Notice'}
                  </label>
                  <select
                    value={noticePeriod}
                    data-testid="select-quick-apply-notice"
                    onChange={(e) => setNoticePeriod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="immediate">{isVi ? '⚡ Có thể nhận việc ngay' : '⚡ Immediately'}</option>
                    <option value="2weeks">{isVi ? '2 tuần (Bàn giao)' : '2 Weeks Notice'}</option>
                    <option value="1month">{isVi ? '1 tháng (Chuẩn quy định)' : '1 Month Notice'}</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="btn-submit-smart-quick-apply"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-soft flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? (isVi ? 'Đang gửi hồ sơ...' : 'Submitting...') : (isVi ? 'Gửi Hồ Sơ Ứng Tuyển Ngay' : 'Submit Application Now')}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
