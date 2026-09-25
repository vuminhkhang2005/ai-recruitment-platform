import React, { useState, useMemo } from 'react';
import type { Job } from '../../data/mockData';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Flame, 
  ArrowRight, 
  Bookmark, 
  CheckCircle2, 
  Send, 
  Search, 
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CompanyLogo } from '../ui/CompanyLogo';
import { HotSticker, UrgentSticker, BonusSticker, WorkModeSticker, AiMatchBadge, ApplicantCounter } from '../ui/Stickers';

interface FeaturedJobsProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onQuickApply: (job: Job) => void;
  onSaveToggled?: (saved: boolean, jobTitle: string) => void;
  onNavigateToJobs?: () => void;
}

export const FeaturedJobs: React.FC<FeaturedJobsProps> = ({ 
  jobs, 
  onSelectJob, 
  onQuickApply,
  onSaveToggled,
  onNavigateToJobs
}) => {
  const { t, language } = useLanguage();
  const { savedJobIds, toggleSaveJob } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'high-salary' | 'urgent' | 'remote'>('all');

  const filterTabs = [
    { key: 'all', label: t.hotJobs.tabAll },
    { key: 'high-salary', label: t.hotJobs.tabHighSalary },
    { key: 'urgent', label: t.hotJobs.tabUrgent },
    { key: 'remote', label: t.hotJobs.tabRemote }
  ];

  const extractMaxSalary = (salaryStr: string): number => {
    const matches = salaryStr.match(/\d+/g);
    if (!matches || matches.length === 0) return 0;
    return Math.max(...matches.map(Number));
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (activeTab === 'high-salary') {
        const maxSal = extractMaxSalary(job.salary);
        return maxSal >= 35 || job.salary.includes('50') || job.salary.includes('70');
      }
      if (activeTab === 'urgent') return job.urgent === true;
      if (activeTab === 'remote') return job.type === 'Remote' || job.location.toLowerCase().includes('remote');
      return true;
    });
  }, [jobs, activeTab]);

  // Display top 6 suggested jobs on Homepage
  const displayedJobs = useMemo(() => {
    return filteredJobs.slice(0, 6);
  }, [filteredJobs]);

  const handleToggleSave = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowSaved = toggleSaveJob(job.id);
    onSaveToggled?.(isNowSaved, job.title);
  };

  const formatPostedTime = (job: Job) => {
    if (language === 'vi') return job.postedTime;
    if (job.postedTimeEn) return job.postedTimeEn;
    return job.postedTime
      .replace('ngày trước', 'days ago')
      .replace('1 days ago', '1 day ago')
      .replace('giờ trước', 'hours ago')
      .replace('1 hours ago', '1 hour ago')
      .replace('Vừa đăng', 'Just now');
  };

  const formatBonus = (job: Job) => {
    if (!job.bonus) return undefined;
    if (language === 'vi') return job.bonus;
    if (job.bonusEn) return job.bonusEn;
    return job.bonus
      .replace('Thưởng quý cao', 'High Quarterly Bonus')
      .replace('Thưởng tháng 13-15', '13-15th Month Bonus')
      .replace('Cơ hội Onsite Mỹ/Nhật', 'US/Japan Onsite')
      .replace('Thưởng ký HĐ $1,000', 'Sign-on Bonus $1,000')
      .replace('Cổ phiếu RSU', 'RSU Stock Options')
      .replace('Thưởng gia nhập $1,500', 'Sign-on Bonus $1,500')
      .replace('Thưởng cổ tức năm', 'Annual Dividend')
      .replace('Phụ cấp quốc phòng', 'Defense Allowance');
  };

  const formatSalary = (job: Job) => {
    if (language === 'vi') return job.salary;
    if (job.salaryEn) return job.salaryEn;
    return job.salary.replace('Triệu VNĐ', 'Million VND');
  };

  const formatLocation = (job: Job) => {
    if (language === 'vi') return job.location;
    if (job.locationEn) return job.locationEn;
    return job.location
      .replace('Hà Nội', 'Hanoi')
      .replace('TP. Hồ Chí Minh', 'Ho Chi Minh City')
      .replace('TP. HCM', 'HCMC')
      .replace('Đà Nẵng', 'Da Nang');
  };

  return (
    <section id="featured-jobs" className="scroll-mt-28 py-12 sm:py-16 md:py-20 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
              <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'vi' ? 'GỢI Ý VIỆC LÀM PHÙ HỢP NHẤT' : 'RECOMMENDED JOBS FOR YOU'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.hotJobs.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
              {language === 'vi' 
                ? 'Các vị trí tuyển dụng công nghệ chất lượng cao được AI cá nhân hóa và đề xuất riêng cho bạn.'
                : 'Curated high-growth tech positions personalized for you by our AI matchmaking engine.'}
            </p>
          </div>

          {/* Quick Segmented Filter Tabs */}
          <div className="p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 flex items-center gap-1 overflow-x-auto shadow-soft-xs self-start lg:self-end">
            {filterTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-soft-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Job Cards Grid (Homepage Suggested Jobs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayedJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);

            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="group relative bg-white dark:bg-slate-900/95 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-[0_12px_35px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Top Row: Company Logo + Meta + AI Match Badge + Bookmark */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CompanyLogo company={job.companyLogoId || job.company} size="md" className="shadow-soft-xs rounded-2xl shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <span className="truncate">{job.company}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatPostedTime(job)}
                          </span>
                          {job.daysLeft && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-amber-600 dark:text-amber-400 font-bold">
                                {language === 'vi' ? `Còn ${job.daysLeft} ngày` : `${job.daysLeft}d left`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <AiMatchBadge score={job.aiMatchScore} />
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(job, e)}
                        aria-label={isSaved ? (language === 'vi' ? 'Bỏ lưu' : 'Unsave') : (language === 'vi' ? 'Lưu việc' : 'Save')}
                        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                          isSaved 
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80' 
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600 dark:fill-emerald-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    {job.hot && <HotSticker label="HOT" size="sm" />}
                    {job.urgent && <UrgentSticker label={language === 'vi' ? 'Tuyển gấp' : 'Urgent'} size="sm" />}
                    {job.bonus && <BonusSticker amount={formatBonus(job)} />}
                  </div>

                  {/* Job Title */}
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug mb-2.5">
                    {job.title}
                  </h3>

                  {/* Salary & Meta Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-xs border border-emerald-200/90 dark:border-emerald-800/80">
                      {formatSalary(job)}
                    </span>
                    <WorkModeSticker mode={job.type} />
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold border border-slate-200/60 dark:border-slate-700/60">
                      {job.level}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="line-clamp-1">{formatLocation(job)}</span>
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md border border-slate-200/60 dark:border-slate-700/60"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-xs rounded-md">
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Applicants + Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <ApplicantCounter count={job.applicantsCount || 20} />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickApply(job);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-soft-xs flex items-center gap-1 cursor-pointer text-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>{language === 'vi' ? 'Ứng tuyển' : 'Apply'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectJob(job)}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-0.5 text-xs"
                    >
                      <span>{language === 'vi' ? 'Chi tiết' : 'Details'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Explore All Jobs Navigation Button (Chuyển sang trang tìm kiếm nâng cao) */}
        <div className="text-center pt-3">
          <button
            type="button"
            onClick={onNavigateToJobs}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-emerald-500/40 hover:border-emerald-500 text-slate-900 dark:text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-soft-sm hover:shadow-soft hover:-translate-y-0.5 cursor-pointer group"
          >
            <span>{language === 'vi' ? 'Khám phá tất cả 10,000+ việc làm trên Trang Tìm kiếm Nâng cao' : 'Explore all 10,000+ jobs on Advanced Search Page'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
