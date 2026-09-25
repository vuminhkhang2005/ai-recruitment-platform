import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { CategoryGrid } from './components/home/CategoryGrid';
import { FeaturedJobs } from './components/home/FeaturedJobs';
import { TopCompanies } from './components/home/TopCompanies';
import { AiFeaturesShowcase } from './components/home/AiFeaturesShowcase';
import { CareerAiHub } from './components/career/CareerAiHub';
import { TestimonialsSection } from './components/home/TestimonialsSection';
import { JobDetailModal } from './components/home/JobDetailModal';
import { AuthModal } from './components/home/AuthModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { ProfilePage } from './components/profile/ProfilePage';
import { JobsPage } from './components/jobs/JobsPage';
import { SavedJobsModal } from './components/profile/SavedJobsModal';
import { AppliedJobsModal } from './components/profile/AppliedJobsModal';
import { PostJobModal } from './components/home/PostJobModal';
import { MOCK_JOBS, type Job } from './data/mockData';
import { CheckCircle2, Sparkles, X, Database } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';
import { useAuth } from './context/AuthContext';
import { 
  fetchJobsFromApi, 
  submitQuickApplyToApi, 
  checkBackendHealth 
} from './services/api';

export function App() {
  const { t, language } = useLanguage();
  const { applyJob } = useAuth();

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input, textarea, [contenteditable="true"], .selectable-text')) {
        return;
      }
      e.preventDefault();
    };

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#profile') {
        setCurrentView('profile');
      } else if (hash === '#jobs' || hash === '#search') {
        setCurrentView('jobs');
      } else if (hash === '#career-ai' || hash === '#scanner') {
        setCurrentView('career-ai');
        setCareerAiTab('scanner');
      } else if (hash === '#roadmap') {
        setCurrentView('career-ai');
        setCareerAiTab('roadmap');
      } else if (!hash || hash === '#home') {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    document.addEventListener('selectstart', handleSelectStart);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  const [currentView, setCurrentView] = useState<'home' | 'jobs' | 'profile' | 'career-ai'>(() => {
    try {
      if (typeof window !== 'undefined') {
        if (window.location.hash === '#profile') return 'profile';
        if (window.location.hash === '#jobs' || window.location.hash === '#search') return 'jobs';
        if (window.location.hash === '#career-ai' || window.location.hash === '#scanner' || window.location.hash === '#roadmap') return 'career-ai';
        const saved = localStorage.getItem('app_current_view');
        if (saved === 'profile' || saved === 'career-ai' || saved === 'jobs') return saved as any;
      }
    } catch (e) {
      console.error(e);
    }
    return 'home';
  });

  const [careerAiTab, setCareerAiTab] = useState<'scanner' | 'roadmap'>(() => {
    try {
      if (typeof window !== 'undefined') {
        if (window.location.hash === '#roadmap') return 'roadmap';
      }
    } catch (e) {
      console.error(e);
    }
    return 'scanner';
  });

  const handleNavigate = (view: 'home' | 'jobs' | 'profile' | 'career-ai', tab?: 'scanner' | 'roadmap') => {
    setCurrentView(view);
    if (tab) {
      setCareerAiTab(tab);
    }
    try {
      localStorage.setItem('app_current_view', view);
      if (view === 'profile') {
        window.location.hash = 'profile';
      } else if (view === 'jobs') {
        window.location.hash = 'jobs';
      } else if (view === 'career-ai') {
        window.location.hash = tab || 'career-ai';
      } else {
        if (window.location.hash === '#profile' || window.location.hash === '#jobs' || window.location.hash.startsWith('#career') || window.location.hash === '#scanner' || window.location.hash === '#roadmap') {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    } catch (e) {
      console.error(e);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleOpenCareerAi = (tab: 'scanner' | 'roadmap' = 'scanner') => {
    handleNavigate('career-ai', tab);
  };

  const [jobsList, setJobsList] = useState<Job[]>(() => {
    try {
      const saved = localStorage.getItem('app_jobs_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return MOCK_JOBS;
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isSavedJobsModalOpen, setIsSavedJobsModalOpen] = useState<boolean>(false);
  const [isAppliedJobsModalOpen, setIsAppliedJobsModalOpen] = useState<boolean>(false);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<{ keyword: string; location: string; category: string }>({
    keyword: '',
    location: 'All',
    category: 'All'
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [backendTotalJobs, setBackendTotalJobs] = useState<number>(0);

  // Initialize and synchronize with Spring Boot RESTful API (MySQL)
  useEffect(() => {
    let active = true;

    async function syncBackendData() {
      try {
        const isOnline = await checkBackendHealth();
        if (!active) return;
        setBackendStatus(isOnline ? 'online' : 'offline');

        if (isOnline) {
          const result = await fetchJobsFromApi({ size: 50 });
          if (!active) return;
          if (result && result.jobs.length > 0) {
            setJobsList(result.jobs);
            setBackendTotalJobs(result.totalElements);
            console.log(`[TalentBridge] Successfully loaded ${result.jobs.length} live jobs from Spring Boot MySQL backend!`);
          }
        }
      } catch (err) {
        console.warn('[TalentBridge] Could not sync with backend, staying on fallback dataset:', err);
        if (active) setBackendStatus('offline');
      }
    }

    syncBackendData();
    return () => {
      active = false;
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleJobCreated = (newJob: Job) => {
    setJobsList((prev) => {
      const updated = [newJob, ...prev];
      try {
        localStorage.setItem('app_jobs_list', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    setIsPostJobModalOpen(false);
    showToast(
      language === 'vi'
        ? `🎉 Tuyệt vời! Tin tuyển dụng "${newJob.title}" đã được đăng thành công!`
        : `🎉 Great! Job listing "${newJob.title}" posted successfully!`
    );
    setTimeout(() => {
      const jobsEl = document.getElementById('jobs');
      if (jobsEl) jobsEl.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  // Filter jobs based on search parameters
  const filteredJobs = useMemo(() => {
    return jobsList.filter((job) => {
      // Keyword match
      if (searchFilter.keyword.trim()) {
        const query = searchFilter.keyword.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesSkills = job.skills.some((s) => s.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCompany && !matchesSkills) return false;
      }

      // Location match
      if (searchFilter.location !== 'All') {
        if (!job.location.toLowerCase().includes(searchFilter.location.toLowerCase())) {
          return false;
        }
      }

      // Category match
      if (searchFilter.category !== 'All') {
        if (job.category.toLowerCase() !== searchFilter.category.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [jobsList, searchFilter]);

  const handleSearch = (keyword: string, location: string, category: string) => {
    setSearchFilter({ keyword, location, category });
    handleNavigate('jobs');
    showToast(
      language === 'vi' 
        ? `Đang tìm kiếm cơ hội việc làm "${keyword || 'Tất cả'}"...`
        : `Searching for positions matching "${keyword || 'All'}"...`
    );
  };

  const handleSelectCategory = (categoryId: string) => {
    const catMap: Record<string, string> = {
      tech: 'Tech',
      finance: 'Finance',
      marketing: 'Marketing',
      design: 'Design',
      hr: 'HR'
    };
    const targetCat = catMap[categoryId] || 'All';
    setSearchFilter({ keyword: '', location: 'All', category: targetCat });
    handleNavigate('jobs');
    showToast(
      language === 'vi'
        ? `Đang hiển thị việc làm ngành: ${categoryId.toUpperCase()}`
        : `Filtering by category: ${categoryId.toUpperCase()}`
    );
  };

  const handleOpenCvScanner = () => {
    handleOpenCareerAi('scanner');
  };

  const handleFindMatchingJobsFromCv = () => {
    handleNavigate('jobs');
    showToast(
      language === 'vi'
        ? 'AI đã tự động xếp hạng các việc làm theo mức độ tương thích cao nhất!'
        : 'AI has automatically ranked jobs by highest compatibility score!'
    );
  };

  const handleQuickApply = async (job: Job) => {
    applyJob({ id: job.id, title: job.title, company: job.company });

    const result = await submitQuickApplyToApi({
      jobId: job.id,
      candidateProfileId: 1,
      fullName: 'Vũ Minh Khang',
      email: '23110238@student.hcmute.edu.vn',
      phone: '0901234567',
      resumeUrl: 'https://s3.ap-southeast-1.amazonaws.com/talentbridge/cvs/resume_vuminhkhang.pdf',
      coverLetter: `Ứng tuyển nhanh vào vị trí ${job.title} tại ${job.company}`
    });

    if (result.success) {
      showToast(
        language === 'vi'
          ? `🎉 ${result.message || `Ứng tuyển thành công vào vị trí ${job.title} tại ${job.company}!`}`
          : `🎉 Quick application submitted for ${job.title} at ${job.company}!`
      );
    } else {
      showToast(`⚠️ ${result.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300">
      
      {/* Live Backend Connection Indicator (Clickable to open Swagger UI) */}
      <a 
        href="http://localhost:8080/swagger-ui/index.html" 
        target="_blank" 
        rel="noreferrer"
        title="Bấm để mở tài liệu API Swagger UI"
        className="fixed bottom-4 left-4 z-40 hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border shadow-soft-sm bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-soft-md transition-all cursor-pointer group"
      >
        <span className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : backendStatus === 'checking' ? 'bg-amber-500 animate-spin' : 'bg-slate-400'}`}></span>
        <span>
          {backendStatus === 'online' 
            ? `Backend API: Online (${backendTotalJobs || jobsList.length} jobs in MySQL)` 
            : backendStatus === 'checking' 
            ? 'Đang kiểm tra kết nối Backend...' 
            : 'Backend: Offline (Dùng Fallback Dataset)'}
        </span>
        <span className="text-[10px] text-slate-400 group-hover:text-emerald-500 transition-colors">↗ Swagger UI</span>
      </a>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-soft-2xl border border-slate-700 animate-slide-up">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium">{toastMessage}</p>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 p-1 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Navigation (Matching Figma) */}
      <Navbar 
        currentView={currentView}
        careerAiTab={careerAiTab}
        onNavigate={handleNavigate}
        onOpenCareerAi={handleOpenCareerAi}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCvScanner={handleOpenCvScanner}
        onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
        onThemeToggled={(newTheme) => {
          showToast(
            newTheme === 'dark'
              ? (language === 'vi' ? 'Đã kích hoạt Giao diện Tối (Dark Mode) 🌙' : 'Dark Mode enabled 🌙')
              : (language === 'vi' ? 'Đã kích hoạt Giao diện Sáng (Light Mode) ☀️' : 'Light Mode enabled ☀️')
          );
        }}
        onOpenProfileModal={() => handleNavigate('profile')}
        onOpenSavedJobsModal={() => setIsSavedJobsModalOpen(true)}
        onOpenAppliedJobsModal={() => setIsAppliedJobsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'profile' ? (
          <ProfilePage 
            onBackToHome={() => handleNavigate('home')}
            onSelectJob={(jobId) => {
              const target = jobsList.find(j => j.id === jobId);
              if (target) setSelectedJob(target);
            }}
          />
        ) : currentView === 'career-ai' ? (
          <CareerAiHub
            initialTab={careerAiTab}
            onBackToHome={() => handleNavigate('home')}
            onFindMatchingJobs={() => {
              handleNavigate('jobs');
              setTimeout(() => {
                handleFindMatchingJobsFromCv();
              }, 250);
            }}
          />
        ) : currentView === 'jobs' ? (
          <JobsPage 
            jobs={jobsList}
            initialKeyword={searchFilter.keyword}
            initialLocation={searchFilter.location}
            initialCategory={searchFilter.category}
            onBackToHome={() => handleNavigate('home')}
            onQuickApply={handleQuickApply}
            onSaveToggled={(isSaved, title) => {
              showToast(
                isSaved
                  ? (language === 'vi' ? `Đã lưu "${title}" vào danh sách yêu thích! ❤️` : `Saved "${title}" to your favorites! ❤️`)
                  : (language === 'vi' ? `Đã bỏ lưu "${title}".` : `Removed "${title}" from favorites.`)
              );
            }}
          />
        ) : (
          <>
            {/* 1. Hero Section: Direct search by Title, Location, Category + Trending Tags (Figma 1:1) */}
            <HeroSection 
              onSearch={handleSearch} 
              onOpenCvScanner={handleOpenCvScanner} 
            />

            {/* 2. Top Job Categories (Figma 1:1) */}
            <CategoryGrid 
              onSelectCategory={handleSelectCategory} 
            />

            {/* 3. Hot Jobs & Best AI Matches (Figma 1:1 - Suggested Job Grid) */}
            <FeaturedJobs 
              jobs={jobsList} 
              onSelectJob={(job) => setSelectedJob(job)} 
              onQuickApply={handleQuickApply} 
              onSaveToggled={(isSaved, title) => {
                showToast(
                  isSaved
                    ? (language === 'vi' ? `Đã lưu "${title}" vào danh sách yêu thích! ❤️` : `Saved "${title}" to your favorites! ❤️`)
                    : (language === 'vi' ? `Đã bỏ lưu "${title}".` : `Removed "${title}" from favorites.`)
                );
              }}
              onNavigateToJobs={() => handleNavigate('jobs')}
            />

            {/* 4. Top Hiring Companies (Figma 1:1) */}
            <TopCompanies 
              onSelectCompany={(companyName) => {
                setSearchFilter((prev) => ({ ...prev, keyword: companyName }));
                handleNavigate('jobs');
                showToast(
                  language === 'vi'
                    ? `Đang lọc các vị trí tại ${companyName}`
                    : `Filtering jobs at ${companyName}`
                );
              }}
            />

            {/* 5. AI Career Intelligence Suite Showcase (Unified CV Scanner & Skill Gap Roadmap) */}
            <AiFeaturesShowcase 
              onOpenScanner={() => handleOpenCareerAi('scanner')}
              onOpenRoadmap={() => handleOpenCareerAi('roadmap')}
            />

            {/* 6. Social Proof & Candidate Testimonials */}
            <TestimonialsSection />
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer 
        onOpenPostJobModal={() => setIsPostJobModalOpen(true)} 
        onOpenCareerAi={handleOpenCareerAi}
      />

      {/* Interactive Modals */}
      <JobDetailModal 
        job={selectedJob} 
        onClose={() => setSelectedJob(null)} 
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultRole="candidate" 
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenSavedJobs={() => setIsSavedJobsModalOpen(true)}
        onOpenAppliedJobs={() => setIsAppliedJobsModalOpen(true)}
      />

      <SavedJobsModal
        isOpen={isSavedJobsModalOpen}
        onClose={() => setIsSavedJobsModalOpen(false)}
        onSelectJob={(job) => setSelectedJob(job)}
        onQuickApply={handleQuickApply}
      />

      <AppliedJobsModal
        isOpen={isAppliedJobsModalOpen}
        onClose={() => setIsAppliedJobsModalOpen(false)}
      />

      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onJobCreated={handleJobCreated}
      />

    </div>
  );
}

export default App;
