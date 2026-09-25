import React, { useState, useMemo } from 'react';
import type { Job } from '../../data/mockData';
import { MOCK_COMPANIES } from '../../data/mockData';
import { 
  X, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Clock, 
  Send,
  Award,
  FileText,
  Bookmark,
  Share2,
  Check,
  Star,
  Gift,
  ShieldCheck,
  Laptop,
  Users,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CompanyLogo } from '../ui/CompanyLogo';
import { HotSticker, UrgentSticker, BonusSticker, WorkModeSticker, AiMatchBadge } from '../ui/Stickers';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose }) => {
  if (!job) return null;

  const { t, language } = useLanguage();
  const { user, applyJob, savedJobIds, toggleSaveJob } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'benefits' | 'company'>('overview');
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isSaved = savedJobIds.includes(job.id);
  const candidateName = user?.name || (language === 'vi' ? 'Nguyễn Văn An' : 'Nguyen Van An');
  const candidateAtsScore = user?.atsScore || 94;

  // Match corresponding company data from MOCK_COMPANIES
  const companyInfo = useMemo(() => {
    return MOCK_COMPANIES.find(
      (c) => 
        c.id === job.companyLogoId || 
        c.name.toLowerCase().includes(job.company.toLowerCase()) || 
        job.company.toLowerCase().includes(c.name.toLowerCase())
    );
  }, [job]);

  // Skill match analysis
  const matchedSkills = job.skills.slice(0, 3);
  const suggestedSkills = job.skills.slice(3);

  const handleToggleSave = () => {
    toggleSaveJob(job.id);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleGenerateCoverLetter = () => {
    setGeneratingLetter(true);
    setTimeout(() => {
      setCoverLetter(
        language === 'vi' 
          ? `Kính gửi Bộ phận Tuyển dụng ${job.company},\n\nTôi viết thư này để bày tỏ sự quan tâm sâu sắc đối với vị trí ${job.title}. Với hơn 3 năm kinh nghiệm thực chiến về các công nghệ ${job.skills.slice(0, 3).join(', ')}, tôi tin rằng năng lực chuyên môn và tư duy giải quyết vấn đề của mình sẽ đóng góp trực tiếp vào mục tiêu tăng trưởng của công ty.\n\nĐiểm mạnh của tôi là khả năng tối ưu hiệu năng ứng dụng, kiến trúc mã nguồn sạch có kiểm thử tự động, và phối hợp ăn ý trong mô hình Agile/Scrum. Tôi rất ấn tượng với sứ mệnh công nghệ tại ${job.company} và mong muốn được cống hiến năng lực của mình cho các dự án quan trọng sắp tới.\n\nRất mong có cơ hội trao đổi chi tiết hơn trong buổi phỏng vấn.\n\nTrân trọng,\n${candidateName}`
          : `Dear Hiring Team at ${job.company},\n\nI am writing to express my strong interest in the ${job.title} position. With over 3 years of hands-on experience in ${job.skills.slice(0, 3).join(', ')}, I am confident that my technical expertise and problem-solving mindset will directly support your team's growth goals.\n\nMy strengths lie in high-performance application engineering, clean code architecture with automated testing, and cross-functional Agile collaboration. I am deeply impressed by ${job.company}'s technology vision and would be thrilled to contribute to your upcoming initiatives.\n\nI look forward to discussing this opportunity with you in an interview.\n\nSincerely,\n${candidateName}`
      );
      setGeneratingLetter(false);
    }, 700);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    applyJob({ id: job.id, title: job.title, company: job.company });
    setApplied(true);
  };

  const getLocalizedDescription = (job: Job) => {
    if (language === 'vi') return job.description;
    return job.descriptionEn || job.description;
  };

  const getLocalizedRequirements = (job: Job) => {
    if (language === 'vi') return job.requirements;
    return job.requirementsEn && job.requirementsEn.length > 0 ? job.requirementsEn : job.requirements;
  };

  const getLocalizedBenefits = (job: Job) => {
    if (language === 'vi') return job.benefits;
    return job.benefitsEn && job.benefitsEn.length > 0 ? job.benefitsEn : job.benefits;
  };

  const getLocalizedMatchReasons = (job: Job) => {
    if (language === 'vi') return job.matchReasons;
    return job.matchReasonsEn && job.matchReasonsEn.length > 0 ? job.matchReasonsEn : job.matchReasons;
  };

  const formatSalary = (job: Job) => {
    if (language === 'vi') return job.salary;
    return job.salaryEn || job.salary.replace('Triệu VNĐ', 'Million VND');
  };

  const formatLocation = (job: Job) => {
    if (language === 'vi') return job.location;
    return job.locationEn || job.location;
  };

  const formatType = (type: string) => {
    if (language === 'vi') {
      if (type === 'Remote') return 'Từ xa (Remote 100%)';
      if (type === 'Hybrid') return 'Linh hoạt (Hybrid)';
      return 'Toàn thời gian (Full-time)';
    }
    return type;
  };

  const formatLevel = (level: string) => {
    if (language === 'vi') {
      if (level === 'Lead') return 'Trưởng nhóm (Lead)';
      if (level === 'Senior') return 'Chuyên gia / Cao cấp (Senior)';
      if (level === 'Middle') return 'Chuyên viên (Middle)';
      return 'Mới đi làm (Junior)';
    }
    return level;
  };

  const formatBonus = (job: Job) => {
    if (!job.bonus) return undefined;
    if (language === 'vi') return job.bonus;
    return job.bonusEn || job.bonus;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 relative flex flex-col transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ========================================================================= */}
        {/* MODAL HEADER & BRANDED COVER BANNER                                      */}
        {/* ========================================================================= */}
        <div className="relative bg-gradient-to-r from-emerald-600/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800/90 p-5 sm:p-6 shrink-0">
          
          {/* Ambient inner glow */}
          <div className="absolute top-0 right-0 w-80 h-32 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Top Row: Company Logo + Top Actions (Share, Bookmark, Close) */}
          <div className="flex items-start justify-between gap-4">
            
            <div className="flex items-center gap-3.5 min-w-0">
              <CompanyLogo company={job.companyLogoId || job.company} size="lg" className="shadow-soft-sm rounded-2xl" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{job.company}</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                  {companyInfo?.verified && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                      {language === 'vi' ? 'Đã xác thực' : 'Verified'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {formatLocation(job)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {language === 'vi' ? `Đăng ${job.postedTime}` : `Posted ${job.postedTimeEn || job.postedTime}`}
                  </span>
                </p>
              </div>
            </div>

            {/* Header Right Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                title={language === 'vi' ? 'Sao chép liên kết việc làm' : 'Copy job link'}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer relative"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                {copiedLink && (
                  <span className="absolute -bottom-7 right-0 text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow-soft-sm whitespace-nowrap animate-fade-in">
                    {language === 'vi' ? 'Đã sao chép!' : 'Link copied!'}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleToggleSave}
                title={isSaved ? (language === 'vi' ? 'Bỏ lưu' : 'Unsave') : (language === 'vi' ? 'Lưu tin tuyển dụng' : 'Save job')}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isSaved
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600 dark:fill-emerald-400' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label={t.jobModal.close}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Job Title & Badges Row */}
          <div className="mt-3.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {job.hot && <HotSticker label="HOT JOB" />}
              {job.urgent && <UrgentSticker label={language === 'vi' ? 'Tuyển gấp' : 'Urgent'} />}
              {job.bonus && <BonusSticker amount={formatBonus(job)} />}
              {job.daysLeft && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
                  <Clock className="w-3 h-3" />
                  <span>{language === 'vi' ? `Hạn nộp: Còn ${job.daysLeft} ngày` : `Deadline: ${job.daysLeft}d left`}</span>
                </span>
              )}
            </div>
          </div>

          {/* Key Job Metrics Bar (HUD Quick-Stats) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4">
            
            {/* Metric 1: Salary */}
            <div className="p-3 bg-white/95 dark:bg-slate-800/90 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-soft-xs">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                {t.jobModal.salary}
              </span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm sm:text-base leading-tight block mt-0.5">
                {formatSalary(job)}
              </strong>
            </div>

            {/* Metric 2: Work Type */}
            <div className="p-3 bg-white/95 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft-xs">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                {t.jobModal.type}
              </span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm leading-tight block mt-0.5">
                {formatType(job.type)}
              </strong>
            </div>

            {/* Metric 3: Experience Level */}
            <div className="p-3 bg-white/95 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft-xs">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                {t.jobModal.level}
              </span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm leading-tight block mt-0.5">
                {formatLevel(job.level)}
              </strong>
            </div>

            {/* Metric 4: AI Match Score */}
            <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/60 dark:to-teal-950/60 rounded-2xl border border-emerald-300/80 dark:border-emerald-700/60 shadow-soft-xs">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                {t.jobModal.matchScore}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm sm:text-base leading-tight">
                  {job.aiMatchScore}%
                </strong>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300">
                  TOP FIT
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* MODAL TABS NAVIGATION                                                     */}
        {/* ========================================================================= */}
        <div className="px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-6 overflow-x-auto no-scrollbar shrink-0">
          {[
            { key: 'overview', label: language === 'vi' ? '📌 Mô tả công việc' : '📌 Job Overview' },
            { key: 'requirements', label: language === 'vi' ? '🎯 Yêu cầu ứng viên' : '🎯 Requirements' },
            { key: 'benefits', label: language === 'vi' ? '🎁 Quyền lợi & Đãi ngộ' : '🎁 Benefits & Perks' },
            { key: 'company', label: language === 'vi' ? '🏢 Về công ty' : '🏢 About Employer' }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY (Scrollable Content Area)                                      */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1">

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW & JOB DESCRIPTION                                         */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* AI Compatibility Intelligence Widget */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-cyan-50/50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/90 dark:border-emerald-800/70 shadow-soft-xs space-y-3">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-emerald-900 dark:text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.jobModal.whyAiMatch}</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/80 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                    {language === 'vi' ? `Khớp lệnh ${job.aiMatchScore}% với CV của bạn` : `${job.aiMatchScore}% match with your CV`}
                  </span>
                </div>

                {/* Match bullet points */}
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {getLocalizedMatchReasons(job).map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{reason}</span>
                    </li>
                  ))}
                </ul>

                {/* Skill Matrix Breakdown */}
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'vi' ? 'Kỹ năng bạn đã có (Trùng khớp 100%):' : 'Matched Skills (You have):'}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {suggestedSkills.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5 flex items-center gap-1">
                        <Star className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                        <span>{language === 'vi' ? 'Kỹ năng mở rộng đề xuất:' : 'Complementary Skills:'}</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-200/60 dark:border-blue-800/60">
                            + {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t.jobModal.jobDesc}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal selectable-text">
                  {getLocalizedDescription(job)}
                </p>
              </div>

              {/* Responsibilities list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {language === 'vi' ? 'TRÁCH NHIỆM CHÍNH TRONG CÔNG VIỆC' : 'KEY RESPONSIBILITIES'}
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  {[
                    language === 'vi' ? 'Tham gia trực tiếp vào việc thiết kế, xây dựng và vận hành các module sản phẩm cốt lõi.' : 'Lead the architecture, development, and maintenance of mission-critical product modules.',
                    language === 'vi' ? 'Phối hợp chặt chẽ với Product Manager, Designer và QA để đảm bảo tiến độ release và chất lượng sản phẩm.' : 'Collaborate cross-functionally with Product Managers, Designers, and QA to ensure timely delivery.',
                    language === 'vi' ? 'Nghiên cứu áp dụng các công nghệ hiện đại (AI/ML, Microservices, Cloud Native) vào hệ thống thực tế.' : 'Explore and adopt modern engineering paradigms (AI/ML, Microservices, Cloud Native) in production.',
                    language === 'vi' ? 'Tham gia code review, mentoring cho các thành viên mới và nâng cao tiêu chuẩn kỹ thuật đội ngũ.' : 'Conduct code reviews, mentor fellow teammates, and foster continuous engineering excellence.'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Core Skills Chips */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t.jobModal.coreSkills}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200/70 dark:border-slate-700/70"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: REQUIREMENTS                                                       */}
          {/* ========================================================================= */}
          {activeTab === 'requirements' && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t.jobModal.requirements}
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 selectable-text">
                  {getLocalizedRequirements(job).map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desirable Qualifications */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {language === 'vi' ? 'ĐIỂM CỘNG ƯU TIÊN (NICE-TO-HAVE)' : 'DESIRABLE QUALIFICATIONS'}
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  {[
                    language === 'vi' ? 'Có kinh nghiệm xây dựng hệ thống chịu tải cao và xử lý dữ liệu lớn (Big Data/Real-time streaming).' : 'Proven experience architecting high-load, high-concurrency real-time streaming systems.',
                    language === 'vi' ? 'Khả năng giao tiếp và đọc hiểu tài liệu kỹ thuật tiếng Anh lưu loát.' : 'Proficiency in technical English for seamless collaboration with global distributed teams.',
                    language === 'vi' ? 'Từng đóng góp cho các dự án mã nguồn mở hoặc có chứng chỉ chuyên môn quốc tế (AWS, Google Cloud, CKA).' : 'Open-source contributions or recognized professional cloud certifications (AWS, GCP, CKA).'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: BENEFITS & PERKS                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'benefits' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t.jobModal.benefits}
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 selectable-text">
                  {getLocalizedBenefits(job).map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Standard Enterprise Perks Grid */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {language === 'vi' ? 'CHÍNH SÁCH ĐÃI NGỘ CHUẨN QUỐC TẾ' : 'GLOBAL EMPLOYEE PERKS'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { icon: DollarSign, title: language === 'vi' ? 'Thưởng 13-15 Tháng' : '13-15th Month Bonus', desc: language === 'vi' ? 'Xét tăng lương 2 lần/năm' : 'Biannual performance reviews' },
                    { icon: Laptop, title: language === 'vi' ? 'MacBook M3 Max' : 'Top Gear MacBook M3', desc: language === 'vi' ? 'Màn hình 4K & thiết bị cao cấp' : '4K displays & ergonomic gear' },
                    { icon: ShieldCheck, title: language === 'vi' ? 'Bảo Hiểm VIP Toàn Diện' : 'VIP Health Insurance', desc: language === 'vi' ? 'Bảo hiểm cho bản thân & gia đình' : 'Comprehensive family cover' },
                    { icon: Award, title: language === 'vi' ? 'Tài Trợ Đào Tạo' : 'Learning Budget', desc: language === 'vi' ? '$1,000/năm cho khóa học & cert' : '$1,000/yr course & cert stipend' },
                    { icon: Gift, title: language === 'vi' ? 'Du Lịch Hàng Năm' : 'Annual Retreats', desc: language === 'vi' ? 'Nghỉ dưỡng 5 sao & team building' : '5-star resorts & team outings' },
                    { icon: Clock, title: language === 'vi' ? 'Giờ Giấc Linh Hoạt' : 'Flexible Hours', desc: language === 'vi' ? 'Hybrid / Remote chủ động' : 'Autonomous hybrid scheduling' }
                  ].map((perk, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 shrink-0">
                        <perk.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{perk.title}</strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{perk.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ABOUT EMPLOYER                                                     */}
          {/* ========================================================================= */}
          {activeTab === 'company' && (
            <div className="space-y-6 animate-fade-in">
              {/* Campus Photo & Company Header */}
              {companyInfo?.coverImage && (
                <div className="relative h-44 rounded-2xl overflow-hidden shadow-soft-xs border border-slate-200/80 dark:border-slate-700/80">
                  <img
                    src={companyInfo.coverImage}
                    alt={companyInfo.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-4">
                    <div>
                      <h4 className="text-lg font-black text-white">{companyInfo.name}</h4>
                      <p className="text-xs text-slate-200 line-clamp-1">{language === 'vi' ? companyInfo.tagline : (companyInfo.taglineEn || companyInfo.tagline)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Company Meta Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                    {language === 'vi' ? 'Đánh giá môi trường' : 'Employee Rating'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-amber-500 font-black text-sm">★ {companyInfo?.rating || '4.9'}</span>
                    <span className="text-[11px] text-slate-400">({companyInfo?.reviewCount || 420}+)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                    {language === 'vi' ? 'Việc làm đang mở' : 'Open Positions'}
                  </span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm mt-0.5 block">
                    {companyInfo?.openJobsCount || 36}+ {language === 'vi' ? 'vị trí' : 'jobs'}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                    {language === 'vi' ? 'Lĩnh vực' : 'Industry'}
                  </span>
                  <strong className="text-slate-800 dark:text-slate-200 font-bold text-xs mt-0.5 block truncate">
                    {companyInfo?.industry || 'Công nghệ thông tin'}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                    {language === 'vi' ? 'Trụ sở chính' : 'Headquarters'}
                  </span>
                  <strong className="text-slate-800 dark:text-slate-200 font-bold text-xs mt-0.5 block truncate">
                    {formatLocation(job)}
                  </strong>
                </div>
              </div>

              {/* Company Tags & Badges */}
              {companyInfo?.badges && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {language === 'vi' ? 'DANH HIỆU & CHỨNG NHẬN DOANH NGHIỆP' : 'EMPLOYER RECOGNITION'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {companyInfo.badges.map((b, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-xl border border-blue-200/60 dark:border-blue-800/60">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* APPLICATION FORM OR SUCCESS SCREEN                                        */}
          {/* ========================================================================= */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            {applied ? (
              /* Success Celebration State */
              <div className="p-6 sm:p-8 bg-emerald-50/80 dark:bg-emerald-950/50 rounded-2xl sm:rounded-3xl border border-emerald-200 dark:border-emerald-800/80 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-soft-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {t.jobModal.appliedSuccess}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-lg mx-auto leading-relaxed">
                    {language === 'vi' 
                      ? `Hồ sơ "${user?.name || 'Nguyễn Văn An'}" cùng thư giới thiệu đã được gửi trực tiếp đến hệ thống nhân sự của ${job.company}. Nhà tuyển dụng sẽ phản hồi trong vòng 2-3 ngày làm việc.`
                      : `Your application and AI-crafted cover letter have been dispatched to ${job.company}'s HR department. You will receive an update within 2-3 business days.`
                    }
                  </p>
                </div>

                {/* 4-Step Application Tracker */}
                <div className="max-w-md mx-auto pt-2 grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-emerald-200/70 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 font-bold">
                    <span>✓ {language === 'vi' ? 'Đã nộp' : 'Submitted'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 animate-pulse">
                    <span>{language === 'vi' ? 'AI Sơ tuyển' : 'AI Screening'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-medium">
                    <span>{language === 'vi' ? 'Phỏng vấn' : 'Interview'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-medium">
                    <span>{language === 'vi' ? 'Offer' : 'Offer'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-soft active:scale-95 transition-all"
                  >
                    {language === 'vi' ? 'Đóng và Xem việc làm khác' : 'Close & Explore more jobs'}
                  </button>
                </div>
              </div>
            ) : (
              /* Application Form */
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.jobModal.applicationFormTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'vi' ? 'Hồ sơ tuyển dụng chuẩn ATS sẽ được đính kèm cùng thư giới thiệu.' : 'Your verified ATS resume will be attached automatically.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingLetter}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{generatingLetter ? t.jobModal.btnGenerating : t.jobModal.btnGenerateLetter}</span>
                  </button>
                </div>

                {/* Attached Resume Box */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs flex items-center justify-between shadow-soft-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-xs sm:max-w-md">
                        {user ? `${user.name.replace(/\s+/g, '_')}_Senior_Resume.pdf` : 'Nguyen_Van_An_Senior_Resume.pdf'} (420 KB)
                      </strong>
                      <span className="text-[10px] text-slate-400">
                        {language === 'vi' ? 'Đã tối ưu hóa chuẩn hệ thống quét tuyển dụng tự động' : 'Optimized for Applicant Tracking Systems'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/90 px-2.5 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/80 shrink-0">
                    {candidateAtsScore}/100 ATS
                  </span>
                </div>

                {/* AI Cover Letter Textarea */}
                <div className="space-y-1.5">
                  <textarea
                    rows={4}
                    placeholder={language === 'vi' ? "Nhập thư giới thiệu hoặc nhấn 'Tự động soạn bằng AI' ở trên..." : "Write a cover letter or click 'Generate with AI' above..."}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium leading-relaxed"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                  >
                    {t.jobModal.close}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl text-xs font-black text-white shadow-soft flex items-center gap-2 cursor-pointer active:scale-95 overflow-hidden relative group"
                  >
                    <div className="shimmer-sweep" />
                    <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    <span>{t.jobModal.btnSubmitApplication}</span>
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
