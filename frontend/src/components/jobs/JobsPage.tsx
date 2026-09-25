import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Job } from '../../data/mockData';
import { MOCK_COMPANIES } from '../../data/mockData';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Bookmark, 
  CheckCircle2, 
  Send, 
  Search, 
  X, 
  RotateCcw, 
  SearchX, 
  Share2, 
  Check, 
  Award, 
  FileText, 
  ChevronRight, 
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CompanyLogo } from '../ui/CompanyLogo';
import { HotSticker, UrgentSticker, BonusSticker, WorkModeSticker, AiMatchBadge, ApplicantCounter } from '../ui/Stickers';

interface JobsPageProps {
  jobs: Job[];
  initialKeyword?: string;
  initialLocation?: string;
  initialCategory?: string;
  onBackToHome: () => void;
  onQuickApply: (job: Job) => void;
  onSaveToggled?: (saved: boolean, jobTitle: string) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({ 
  jobs, 
  initialKeyword = '',
  initialLocation = 'All',
  initialCategory = 'All',
  onBackToHome,
  onQuickApply,
  onSaveToggled
}) => {
  const { t, language } = useLanguage();
  const { user, applyJob, savedJobIds, toggleSaveJob } = useAuth();

  // Search & Filter state initialized with props
  const [searchQuery, setSearchQuery] = useState(initialKeyword);
  const [filterLocation, setFilterLocation] = useState(initialLocation);
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterSalary, setFilterSalary] = useState('All');
  const [filterCategory, setFilterCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'aiMatch' | 'newest' | 'salary'>('aiMatch');
  const [activeTab, setActiveTab] = useState<'all' | 'high-salary' | 'urgent' | 'remote'>('all');

  // Master-Detail selection state
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Detail panel active sub-tab
  const [detailTab, setDetailTab] = useState<'overview' | 'requirements' | 'benefits' | 'company'>('overview');
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAiMatchDetails, setShowAiMatchDetails] = useState(false);

  // Mobile view state (list vs detail)
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const detailScrollRef = useRef<HTMLDivElement>(null);
  const applicationFormRef = useRef<HTMLDivElement>(null);

  // Ensure user always starts at the top of the search page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Synchronize when initial props change
  useEffect(() => {
    if (initialKeyword) setSearchQuery(initialKeyword);
    if (initialLocation) setFilterLocation(initialLocation);
    if (initialCategory) setFilterCategory(initialCategory);
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [initialKeyword, initialLocation, initialCategory]);

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

  // Compute filtered & sorted jobs
  const filteredAndSortedJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      // 1. Text Search across Title, Company, Skills
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = job.title.toLowerCase().includes(query) || (query.includes('react') && job.title.toLowerCase().includes('react'));
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesSkills = job.skills.some((s) => {
          const sLower = s.toLowerCase();
          return sLower.includes(query) || query.includes(sLower);
        });
        if (!matchesTitle && !matchesCompany && !matchesSkills) return false;
      }

      // 2. Category Filter
      if (filterCategory !== 'All') {
        if (job.category.toLowerCase() !== filterCategory.toLowerCase()) {
          return false;
        }
      }

      // 3. Location Filter
      if (filterLocation !== 'All') {
        if (filterLocation === 'Remote') {
          if (job.type !== 'Remote' && !job.location.toLowerCase().includes('remote')) {
            return false;
          }
        } else {
          if (!job.location.toLowerCase().includes(filterLocation.toLowerCase())) {
            return false;
          }
        }
      }

      // 4. Level Filter
      if (filterLevel !== 'All') {
        if (job.level !== filterLevel) return false;
      }

      // 5. Salary Range Filter
      if (filterSalary !== 'All') {
        const maxSalary = extractMaxSalary(job.salary);
        if (filterSalary === '15-30') {
          if (maxSalary < 15 || maxSalary > 30) return false;
        } else if (filterSalary === '30-50') {
          if (maxSalary < 30 || maxSalary > 50) return false;
        } else if (filterSalary === '50+') {
          if (maxSalary < 50) return false;
        }
      }

      // 6. Segmented Tab Filter
      if (activeTab === 'high-salary') {
        const maxSal = extractMaxSalary(job.salary);
        if (maxSal < 35 && !job.salary.includes('50') && !job.salary.includes('70')) return false;
      } else if (activeTab === 'urgent') {
        if (!job.urgent) return false;
      } else if (activeTab === 'remote') {
        if (job.type !== 'Remote' && !job.location.toLowerCase().includes('remote')) return false;
      }

      return true;
    });

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'aiMatch') {
        return b.aiMatchScore - a.aiMatchScore;
      }
      if (sortBy === 'salary') {
        return extractMaxSalary(b.salary) - extractMaxSalary(a.salary);
      }
      if (sortBy === 'newest') {
        const getHours = (str: string) => {
          if (str.includes('giờ') || str.includes('hour')) return 1;
          if (str.includes('ngày') || str.includes('day')) {
            const num = parseInt(str, 10) || 1;
            return num * 24;
          }
          return 999;
        };
        return getHours(a.postedTime) - getHours(b.postedTime);
      }
      return 0;
    });
  }, [jobs, searchQuery, filterCategory, filterLocation, filterLevel, filterSalary, activeTab, sortBy]);

  // Current selected job: fallback to first item if current selection not in filtered list
  const currentSelectedJob = useMemo(() => {
    if (filteredAndSortedJobs.length === 0) return null;
    const found = filteredAndSortedJobs.find((j) => j.id === selectedJobId);
    return found || filteredAndSortedJobs[0];
  }, [filteredAndSortedJobs, selectedJobId]);

  // Company information for the selected job
  const companyInfo = useMemo(() => {
    if (!currentSelectedJob) return null;
    return MOCK_COMPANIES.find(
      (c) => 
        c.id === currentSelectedJob.companyLogoId || 
        c.name.toLowerCase().includes(currentSelectedJob.company.toLowerCase()) || 
        currentSelectedJob.company.toLowerCase().includes(c.name.toLowerCase())
    );
  }, [currentSelectedJob]);

  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    filterLocation !== 'All' || 
    filterLevel !== 'All' || 
    filterSalary !== 'All' || 
    filterCategory !== 'All' ||
    activeTab !== 'all';

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setFilterLocation('All');
    setFilterLevel('All');
    setFilterSalary('All');
    setFilterCategory('All');
    setActiveTab('all');
    setSortBy('aiMatch');
  };

  const handleSelectJobCard = (job: Job) => {
    setSelectedJobId(job.id);
    setMobileShowDetail(true);
    if (detailScrollRef.current) {
      detailScrollRef.current.scrollTop = 0;
    }
  };

  const handleToggleSaveJob = (job: Job, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isNowSaved = toggleSaveJob(job.id);
    onSaveToggled?.(isNowSaved, job.title);
  };

  const handleCopyLink = () => {
    if (!currentSelectedJob) return;
    navigator.clipboard?.writeText(window.location.origin + '#job-' + currentSelectedJob.id);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const candidateName = user?.name || (language === 'vi' ? 'Nguyễn Văn An' : 'Nguyen Van An');
  const candidateAtsScore = user?.atsScore || 94;

  const handleGenerateCoverLetter = () => {
    if (!currentSelectedJob) return;
    setGeneratingLetter(true);
    setTimeout(() => {
      setCoverLetter(
        language === 'vi' 
          ? `Kính gửi Bộ phận Tuyển dụng ${currentSelectedJob.company},\n\nTôi viết thư này để bày tỏ sự quan tâm sâu sắc đối với vị trí ${currentSelectedJob.title}. Với hơn 3 năm kinh nghiệm thực chiến về các công nghệ ${currentSelectedJob.skills.slice(0, 3).join(', ')}, tôi tin rằng năng lực chuyên môn và tư duy giải quyết vấn đề của mình sẽ đóng góp trực tiếp vào mục tiêu tăng trưởng của công ty.\n\nĐiểm mạnh của tôi là khả năng tối ưu hiệu năng ứng dụng, kiến trúc mã nguồn sạch có kiểm thử tự động, và phối hợp ăn ý trong mô hình Agile/Scrum. Tôi rất ấn tượng với môi trường sáng tạo tại ${currentSelectedJob.company} và mong muốn được cống hiến năng lực của mình cho các dự án sắp tới.\n\nRất mong có cơ hội trao đổi chi tiết hơn trong buổi phỏng vấn.\n\nTrân trọng,\n${candidateName}`
          : `Dear Hiring Team at ${currentSelectedJob.company},\n\nI am writing to express my strong interest in the ${currentSelectedJob.title} position. With over 3 years of hands-on experience in ${currentSelectedJob.skills.slice(0, 3).join(', ')}, I am confident that my technical expertise and problem-solving mindset will directly support your team's growth goals.\n\nMy strengths lie in high-performance application engineering, clean code architecture with automated testing, and cross-functional Agile collaboration. I look forward to discussing this opportunity with you in an interview.\n\nSincerely,\n${candidateName}`
      );
      setGeneratingLetter(false);
    }, 700);
  };

  const handleApplyCurrentJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedJob) return;
    applyJob({ id: currentSelectedJob.id, title: currentSelectedJob.title, company: currentSelectedJob.company });
    setAppliedJobs((prev) => ({ ...prev, [currentSelectedJob.id]: true }));
    onQuickApply?.(currentSelectedJob);
  };

  const scrollToApplyForm = () => {
    if (applicationFormRef.current) {
      applicationFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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

  const formatType = (type: string) => {
    if (language === 'vi') {
      if (type === 'Remote') return 'Từ xa (Remote)';
      if (type === 'Hybrid') return 'Linh hoạt (Hybrid)';
      return 'Toàn thời gian';
    }
    return type;
  };

  const formatLevel = (level: string) => {
    if (language === 'vi') {
      if (level === 'Lead') return 'Trưởng nhóm (Lead)';
      if (level === 'Senior') return 'Chuyên gia (Senior)';
      if (level === 'Middle') return 'Chuyên viên (Middle)';
      return 'Mới đi làm (Junior)';
    }
    return level;
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

  const isCurrentJobApplied = currentSelectedJob ? Boolean(appliedJobs[currentSelectedJob.id]) : false;
  const isCurrentJobSaved = currentSelectedJob ? savedJobIds.includes(currentSelectedJob.id) : false;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* 1. Page Header & Breadcrumb Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-soft-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Breadcrumb & Navigation Back */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={onBackToHome}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 font-bold flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Trang chủ' : 'Home'}</span>
              </button>
              <span>/</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {language === 'vi' ? 'Tìm kiếm việc làm' : 'Job Search'}
              </span>
            </div>

            {/* Total Results Count */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{language === 'vi' ? `Tìm thấy ${filteredAndSortedJobs.length} việc làm` : `${filteredAndSortedJobs.length} jobs found`}</span>
              </span>
            </div>

          </div>

          <div className="mt-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'vi' ? 'Tìm kiếm việc làm & Cơ hội công nghệ AI' : 'Explore AI Tech Careers & Job Opportunities'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'vi' 
                ? 'Tìm kiếm theo từ khóa, kỹ năng công nghệ, địa điểm và mức lương với độ khớp AI cao nhất.'
                : 'Search by title, tech stack, location and compensation with real-time AI matching.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Search & Filter Console Bar */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-soft-sm space-y-4">
          
          {/* Row 1: Search Input + Select Filters + Sort (12-column grid) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Input (Takes 4 cols) */}
            <div className="md:col-span-4 relative flex items-center">
              <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'vi' ? 'Tìm theo chức danh, công ty, kỹ năng (React, Golang...)' : 'Search by title, company, skill (React, Golang...)'}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter: Location (2 cols) */}
            <div className="md:col-span-2 relative">
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                aria-label="Lọc theo địa điểm"
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer transition-all appearance-none pr-8"
              >
                <option value="All">{language === 'vi' ? '📍 Tất cả địa điểm' : '📍 All Locations'}</option>
                <option value="Hà Nội">{language === 'vi' ? 'Hà Nội' : 'Hanoi'}</option>
                <option value="TP. Hồ Chí Minh">{language === 'vi' ? 'TP. Hồ Chí Minh' : 'Ho Chi Minh'}</option>
                <option value="Đà Nẵng">{language === 'vi' ? 'Đà Nẵng' : 'Da Nang'}</option>
                <option value="Remote">{language === 'vi' ? 'Từ xa (Remote)' : 'Remote'}</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>

            {/* Filter: Level (2 cols) */}
            <div className="md:col-span-2 relative">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                aria-label="Lọc theo cấp bậc"
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer transition-all appearance-none pr-8"
              >
                <option value="All">{language === 'vi' ? '💼 Tất cả cấp bậc' : '💼 All Levels'}</option>
                <option value="Junior">Junior (1-2 năm)</option>
                <option value="Middle">Middle (2-4 năm)</option>
                <option value="Senior">Senior (4-7 năm)</option>
                <option value="Lead">Lead (Trưởng nhóm)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>

            {/* Filter: Salary Range (2 cols) */}
            <div className="md:col-span-2 relative">
              <select
                value={filterSalary}
                onChange={(e) => setFilterSalary(e.target.value)}
                aria-label="Lọc theo mức lương"
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer transition-all appearance-none pr-8"
              >
                <option value="All">{language === 'vi' ? '💵 Mọi mức lương' : '💵 All Salaries'}</option>
                <option value="15-30">15 - 30 Triệu</option>
                <option value="30-50">30 - 50 Triệu</option>
                <option value="50+">&gt; 50 Triệu (VIP)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>

            {/* Sort Dropdown (2 cols) */}
            <div className="md:col-span-2 relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sắp xếp kết quả"
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer transition-all appearance-none pr-7"
              >
                <option value="aiMatch">🎯 {language === 'vi' ? 'Khớp AI' : 'Top Match'}</option>
                <option value="salary">💰 {language === 'vi' ? 'Lương cao' : 'High Salary'}</option>
                <option value="newest">⏱️ {language === 'vi' ? 'Mới đăng' : 'Newest'}</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>

          </div>

          {/* Row 2: Segmented Control Tabs + Reset Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            
            <div className="p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
              {filterTabs.map((tab) => {
                const count = jobs.filter((job) => {
                  if (tab.key === 'high-salary') {
                    const maxSal = extractMaxSalary(job.salary);
                    return maxSal >= 35 || job.salary.includes('50') || job.salary.includes('70');
                  }
                  if (tab.key === 'urgent') return job.urgent === true;
                  if (tab.key === 'remote') return job.type === 'Remote' || job.location.toLowerCase().includes('remote');
                  return true;
                }).length;

                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-soft-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Đặt lại bộ lọc' : 'Reset filters'}</span>
              </button>
            )}

          </div>

          {/* Row 3: Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800/80 text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-medium">
                {language === 'vi' ? 'Đang áp dụng:' : 'Active filters:'}
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <span>"{searchQuery}"</span>
                  <button type="button" onClick={() => setSearchQuery('')} className="hover:text-emerald-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filterCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <span>Ngành: {filterCategory}</span>
                  <button type="button" onClick={() => setFilterCategory('All')} className="hover:text-slate-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filterLocation !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <span>{filterLocation}</span>
                  <button type="button" onClick={() => setFilterLocation('All')} className="hover:text-slate-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filterLevel !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <span>{filterLevel}</span>
                  <button type="button" onClick={() => setFilterLevel('All')} className="hover:text-slate-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filterSalary !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <span>{filterSalary === '50+' ? '> 50M' : `${filterSalary}M`}</span>
                  <button type="button" onClick={() => setFilterSalary('All')} className="hover:text-slate-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeTab !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <span>{filterTabs.find(t => t.key === activeTab)?.label}</span>
                  <button type="button" onClick={() => setActiveTab('all')} className="hover:text-slate-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

        </div>

        {/* 3. Master-Detail 2-Column Split Screen */}
        {filteredAndSortedJobs.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white dark:bg-slate-900/90 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-4 max-w-xl mx-auto shadow-soft-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-soft-sm">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {language === 'vi' ? 'Không tìm thấy việc làm phù hợp' : 'No matching jobs found'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {language === 'vi' 
                ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc địa điểm, cấp bậc để tiếp cận nhiều cơ hội việc làm hơn.' 
                : 'Try adjusting your search query or clearing some filters to explore more career opportunities.'}
            </p>
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-soft transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Xóa bộ lọc để xem tất cả việc làm' : 'Reset filters to view all jobs'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Scrollable Job List (5 cols on lg) */}
            <div className={`lg:col-span-5 space-y-3 max-h-[820px] overflow-y-auto pr-1.5 custom-scrollbar ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
              
              {filteredAndSortedJobs.map((job) => {
                const isSelected = currentSelectedJob?.id === job.id;
                const isSaved = savedJobIds.includes(job.id);
                const isApplied = Boolean(appliedJobs[job.id]);

                return (
                  <div
                    key={job.id}
                    onClick={() => handleSelectJobCard(job)}
                    className={`group relative rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-2 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-[0_6px_20px_-4px_rgba(16,185,129,0.22)] scale-[1.01]'
                        : 'border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/95 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-soft-xs hover:-translate-y-0.5'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-2.5 bottom-2.5 w-1.5 bg-emerald-500 rounded-r-full" />
                    )}

                    <div>
                      {/* Top Row: Logo + Meta + AI Match + Bookmark */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CompanyLogo company={job.companyLogoId || job.company} size="sm" className="shadow-soft-xs rounded-xl shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              <span className="truncate">{job.company}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
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
                          <AiMatchBadge score={job.aiMatchScore} compact />
                          <button
                            type="button"
                            onClick={(e) => handleToggleSaveJob(job, e)}
                            aria-label={isSaved ? (language === 'vi' ? 'Bỏ lưu' : 'Unsave job') : (language === 'vi' ? 'Lưu công việc' : 'Save job')}
                            className={`p-1.5 rounded-xl transition-all cursor-pointer shrink-0 active:scale-90 ${
                              isSaved 
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80' 
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-600 dark:fill-emerald-400' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Badges */}
                      {(job.hot || job.urgent || job.bonus || isApplied) && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          {job.hot && <HotSticker label="HOT" size="sm" />}
                          {job.urgent && <UrgentSticker label={language === 'vi' ? 'Tuyển gấp' : 'Urgent'} size="sm" />}
                          {job.bonus && <BonusSticker amount={formatBonus(job)} />}
                          {isApplied && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 border border-blue-200 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                              ✓ {language === 'vi' ? 'Đã ứng tuyển' : 'Applied'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Job Title */}
                      <h3 className={`text-sm sm:text-base font-bold transition-colors line-clamp-1 mb-1.5 ${
                        isSelected 
                          ? 'text-emerald-700 dark:text-emerald-300' 
                          : 'text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                      }`}>
                        {job.title}
                      </h3>

                      {/* Salary & Meta */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <div className="inline-block px-2 py-0.5 bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-200/90 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-lg">
                          {formatSalary(job)}
                        </div>
                        <WorkModeSticker mode={job.type} />
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold border border-slate-200/60 dark:border-slate-700/60">
                          {job.level}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="line-clamp-1">{formatLocation(job)}</span>
                      </div>

                      {/* Skills Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[11px] font-medium rounded-md border border-slate-200/60 dark:border-slate-700/60"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[11px] rounded-md">
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Bottom Meta */}
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <ApplicantCounter count={job.applicantsCount || 20} />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 text-xs">
                        <span>{language === 'vi' ? 'Xem chi tiết' : 'View details'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </div>
                );
              })}

            </div>

            {/* RIGHT COLUMN: Sticky Detail & Application Panel (7 cols on lg) */}
            {currentSelectedJob && (
              <div className={`lg:col-span-7 sticky top-24 max-h-[820px] overflow-hidden flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft-md ${mobileShowDetail ? 'block' : 'hidden lg:flex'}`}>
                
                {/* Mobile Back Button */}
                <div className="lg:hidden p-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMobileShowDetail(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Quay lại danh sách việc làm' : 'Back to jobs list'}</span>
                  </button>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentSelectedJob.company}
                  </span>
                </div>

                {/* Ultra-Compact Sticky Header (~75-85px) */}
                <div className="bg-gradient-to-r from-emerald-600/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
                  
                  {/* Row 1: Logo + Title & Company Info + Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <CompanyLogo 
                        company={currentSelectedJob.companyLogoId || currentSelectedJob.company} 
                        size="md" 
                        className="shadow-soft-xs rounded-xl shrink-0" 
                      />
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight line-clamp-2 sm:line-clamp-1">
                          {currentSelectedJob.title}
                        </h2>

                        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                            {currentSelectedJob.company}
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {formatLocation(currentSelectedJob)}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                          <span className="flex items-center gap-1 text-[11px] hidden sm:inline-flex">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            {language === 'vi' ? `Đăng ${currentSelectedJob.postedTime}` : `Posted ${currentSelectedJob.postedTimeEn || currentSelectedJob.postedTime}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        title={language === 'vi' ? 'Sao chép liên kết việc làm' : 'Copy job link'}
                        className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 transition-all cursor-pointer relative"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                        {copiedLink && (
                          <span className="absolute -bottom-7 right-0 text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow-soft-sm whitespace-nowrap animate-fade-in z-20">
                            {language === 'vi' ? 'Đã sao chép!' : 'Link copied!'}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleSaveJob(currentSelectedJob)}
                        title={isCurrentJobSaved ? (language === 'vi' ? 'Bỏ lưu' : 'Unsave') : (language === 'vi' ? 'Lưu việc làm' : 'Save job')}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                          isCurrentJobSaved
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 border-slate-200/70 dark:border-slate-700/70'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isCurrentJobSaved ? 'fill-emerald-600 dark:fill-emerald-400' : ''}`} />
                      </button>

                      {/* Primary Apply CTA Button */}
                      <button
                        type="button"
                        onClick={scrollToApplyForm}
                        className="ml-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-soft flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] relative overflow-hidden group shrink-0"
                      >
                        <div className="shimmer-sweep" />
                        <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        <span>{isCurrentJobApplied ? (language === 'vi' ? 'Đã Ứng Tuyển' : 'Applied') : t.hotJobs.applyNow}</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Chips Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-xs border border-emerald-300/80 dark:border-emerald-800/80">
                        {formatSalary(currentSelectedJob)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200/70 dark:border-slate-700/70">
                        {formatType(currentSelectedJob.type)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200/70 dark:border-slate-700/70">
                        {formatLevel(currentSelectedJob.level)}
                      </span>
                      {currentSelectedJob.hot && <HotSticker label="HOT" size="sm" />}
                      {currentSelectedJob.urgent && <UrgentSticker label={language === 'vi' ? 'Tuyển gấp' : 'Urgent'} size="sm" />}
                      {currentSelectedJob.bonus && <BonusSticker amount={formatBonus(currentSelectedJob)} />}
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/70 dark:border-emerald-800/70">
                        <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{currentSelectedJob.aiMatchScore}% AI Match</span>
                      </span>
                      {currentSelectedJob.daysLeft && (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{language === 'vi' ? `Còn ${currentSelectedJob.daysLeft} ngày` : `${currentSelectedJob.daysLeft}d left`}</span>
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Sub-Tabs Bar */}
                <div className="px-4 sm:px-5 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 overflow-x-auto no-scrollbar shrink-0">
                  {[
                    { key: 'overview', label: language === 'vi' ? '📌 Mô tả công việc' : '📌 Job Overview' },
                    { key: 'requirements', label: language === 'vi' ? '🎯 Yêu cầu ứng viên' : '🎯 Requirements' },
                    { key: 'benefits', label: language === 'vi' ? '🎁 Quyền lợi & Đãi ngộ' : '🎁 Benefits & Perks' },
                    { key: 'company', label: language === 'vi' ? '🏢 Về công ty' : '🏢 About Employer' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setDetailTab(tab.key as any)}
                      className={`py-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                        detailTab === tab.key
                          ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Detail Scrollable Body */}
                <div ref={detailScrollRef} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                  
                  {/* TAB 1: OVERVIEW */}
                  {detailTab === 'overview' && (
                    <div className="space-y-4 animate-fade-in">
                      
                      {/* Compact AI Match Insights Widget */}
                      <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-emerald-50/40 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/90 dark:border-emerald-800/70 shadow-soft-xs text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1 rounded-lg bg-emerald-600 text-white shrink-0">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                                  {language === 'vi' 
                                    ? `Độ tương thích hồ sơ ${currentSelectedJob.aiMatchScore}% (TOP FIT)` 
                                    : `${currentSelectedJob.aiMatchScore}% Profile Compatibility`}
                                </span>
                                <span className="text-slate-400 hidden md:inline">•</span>
                                <span className="text-slate-600 dark:text-slate-300 truncate hidden md:inline text-[11px]">
                                  {getLocalizedMatchReasons(currentSelectedJob)[0]}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowAiMatchDetails(!showAiMatchDetails)}
                            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 underline shrink-0 cursor-pointer ml-2"
                          >
                            {showAiMatchDetails 
                              ? (language === 'vi' ? 'Thu gọn ▲' : 'Collapse ▲') 
                              : (language === 'vi' ? 'Xem phân tích AI ▼' : 'AI analysis ▼')}
                          </button>
                        </div>

                        {showAiMatchDetails && (
                          <div className="mt-2.5 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/60 space-y-2 animate-fade-in">
                            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-xs">
                              {getLocalizedMatchReasons(currentSelectedJob).map((reason, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="leading-relaxed">{reason}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="flex flex-wrap items-center gap-1.5 pt-1.5 text-xs">
                              <span className="text-slate-500 font-semibold">{language === 'vi' ? 'Kỹ năng ăn khớp:' : 'Matched Skills:'}</span>
                              {currentSelectedJob.skills.slice(0, 4).map((s) => (
                                <span key={s} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 rounded text-[11px] font-medium border border-emerald-200/60 dark:border-emerald-800/60">
                                  ✓ {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Job Description Text */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {t.jobModal.jobDesc}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal selectable-text">
                          {getLocalizedDescription(currentSelectedJob)}
                        </p>
                      </div>

                      {/* Responsibilities list */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {language === 'vi' ? 'TRÁCH NHIỆM CHÍNH TRONG CÔNG VIỆC' : 'KEY RESPONSIBILITIES'}
                        </h4>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                          {[
                            language === 'vi' ? 'Tham gia trực tiếp vào việc thiết kế, xây dựng và vận hành các module sản phẩm cốt lõi.' : 'Lead the architecture, development, and maintenance of mission-critical product modules.',
                            language === 'vi' ? 'Phối hợp chặt chẽ với Product Manager, Designer và QA để đảm bảo tiến độ release và chất lượng sản phẩm.' : 'Collaborate cross-functionally with Product Managers, Designers, and QA to ensure timely delivery.',
                            language === 'vi' ? 'Nghiên cứu áp dụng các công nghệ hiện đại (AI/ML, Microservices, Cloud Native) vào hệ thống thực tế.' : 'Explore and adopt modern engineering paradigms (AI/ML, Microservices, Cloud Native) in production.',
                            language === 'vi' ? 'Tham gia code review, mentoring cho các thành viên mới và nâng cao tiêu chuẩn kỹ thuật đội ngũ.' : 'Conduct code reviews, mentor fellow teammates, and foster continuous engineering excellence.'
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Core Skills Chips */}
                      <div className="space-y-1.5 pt-1">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {t.jobModal.coreSkills}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {currentSelectedJob.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200/70 dark:border-slate-700/70"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: REQUIREMENTS */}
                  {detailTab === 'requirements' && (
                    <div className="space-y-5 animate-fade-in">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {t.jobModal.requirements}
                        </h4>
                        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 selectable-text">
                          {getLocalizedRequirements(currentSelectedJob).map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

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
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: BENEFITS */}
                  {detailTab === 'benefits' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {t.jobModal.benefits}
                        </h4>
                        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 selectable-text">
                          {getLocalizedBenefits(currentSelectedJob).map((b, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: COMPANY */}
                  {detailTab === 'company' && (
                    <div className="space-y-6 animate-fade-in">
                      {companyInfo?.coverImage && (
                        <div className="relative h-40 rounded-2xl overflow-hidden shadow-soft-xs border border-slate-200/80 dark:border-slate-700/80">
                          <img
                            src={companyInfo.coverImage}
                            alt={companyInfo.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-4">
                            <div>
                              <h4 className="text-base font-black text-white">{companyInfo.name}</h4>
                              <p className="text-xs text-slate-200 line-clamp-1">{language === 'vi' ? companyInfo.tagline : (companyInfo.taglineEn || companyInfo.tagline)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
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
                      </div>
                    </div>
                  )}

                  {/* Application Form */}
                  <div ref={applicationFormRef} className="pt-5 border-t border-slate-200 dark:border-slate-800">
                    {isCurrentJobApplied ? (
                      <div className="p-5 bg-emerald-50/80 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 text-center space-y-2.5 animate-fade-in">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {t.jobModal.appliedSuccess}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-md mx-auto">
                            {language === 'vi' 
                              ? `Hồ sơ của bạn đã được chuyển thẳng tới bộ phận nhân sự của ${currentSelectedJob.company}.`
                              : `Your application has been dispatched to ${currentSelectedJob.company}'s hiring team.`
                            }
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCurrentJob} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {t.jobModal.applicationFormTitle}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                              {language === 'vi' ? 'Hồ sơ ATS và thư giới thiệu sẽ gửi tới nhà tuyển dụng.' : 'Your ATS resume will be submitted to the hiring team.'}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleGenerateCoverLetter}
                            disabled={generatingLetter}
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{generatingLetter ? t.jobModal.btnGenerating : t.jobModal.btnGenerateLetter}</span>
                          </button>
                        </div>

                        {/* Resume preview */}
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs text-[11px]">
                              {user ? `${user.name.replace(/\s+/g, '_')}_Senior_Resume.pdf` : 'Nguyen_Van_An_Senior_Resume.pdf'}
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/90 px-1.5 py-0.2 rounded">
                            {candidateAtsScore}/100 ATS
                          </span>
                        </div>

                        <textarea
                          rows={2}
                          placeholder={language === 'vi' ? "Nhập thư giới thiệu hoặc nhấn 'Tự động soạn bằng AI' ở trên..." : "Write a cover letter or click 'Generate with AI'..."}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                        />

                        <div className="flex items-center justify-end">
                          <button
                            type="submit"
                            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-soft flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{t.jobModal.btnSubmitApplication}</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
