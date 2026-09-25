import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp,
  Building2,
  X,
  Flame,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CompanyLogo } from '../ui/CompanyLogo';

interface HeroSectionProps {
  onSearch: (keyword: string, location: string, level: string) => void;
  onOpenCvScanner: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const { t, language } = useLanguage();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('All');
  const [category, setCategory] = useState('All');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword, location, category);
  };

  const trendingTags = language === 'vi' 
    ? [
        { label: 'ReactJS', hot: true },
        { label: 'Product Manager', hot: false },
        { label: 'Data Analyst', hot: false },
        { label: 'Kinh doanh', hot: false },
        { label: 'Thực tập sinh', hot: false },
        { label: 'Golang', hot: false },
        { label: 'AI Engineer', hot: true }
      ]
    : [
        { label: 'ReactJS', hot: true },
        { label: 'Product Manager', hot: false },
        { label: 'Data Analyst', hot: false },
        { label: 'Sales & BD', hot: false },
        { label: 'Internship', hot: false },
        { label: 'Golang', hot: false },
        { label: 'AI Engineer', hot: true }
      ];

  return (
    <section className="relative pt-4 pb-6 sm:pt-6 sm:pb-8 md:pt-7 md:pb-10 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* 1. Ambient Background Lighting, Precision Mesh & Geometric Orbit Rays */}
      <div className="absolute inset-0 hero-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_80%_60%_at_50%_35%,#000_50%,transparent_100%)] opacity-95 dark:opacity-55 -z-10" />
      
      {/* Radiant Multi-Stop Aurora Glows */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-emerald-400/25 via-teal-300/20 to-cyan-400/25 dark:from-emerald-500/20 dark:via-teal-400/15 dark:to-cyan-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-8 -left-16 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-400/15 via-teal-300/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle" />
      <div className="absolute top-10 -right-16 w-[400px] h-[400px] bg-gradient-to-bl from-emerald-400/15 via-teal-300/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle" />
      
      {/* Precision Geometric Orbit Arcs */}
      <div className="absolute top-44 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1080px] h-[500px] pointer-events-none -z-10 opacity-45 dark:opacity-30 hidden md:block">
        <svg className="w-full h-full" viewBox="0 0 1120 540" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="560" cy="270" rx="530" ry="220" stroke="url(#orbit-grad-1)" strokeWidth="1" strokeDasharray="6 8" />
          <ellipse cx="560" cy="270" rx="390" ry="160" stroke="url(#orbit-grad-2)" strokeWidth="1.2" />
          <ellipse cx="560" cy="270" rx="250" ry="100" stroke="url(#orbit-grad-1)" strokeWidth="0.8" strokeDasharray="4 6" />
          <circle cx="210" cy="190" r="3.5" fill="#10B981" filter="drop-shadow(0 0 6px #10B981)" />
          <circle cx="910" cy="350" r="3.5" fill="#06B6D4" filter="drop-shadow(0 0 6px #06B6D4)" />
          <circle cx="770" cy="170" r="2.5" fill="#10B981" />
          <circle cx="360" cy="370" r="2.5" fill="#3B82F6" />
          <defs>
            <linearGradient id="orbit-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="orbit-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Modern Green Stage Frame - Sang trọng, to đẹp, tỉ lệ hài hòa chuẩn thiết kế quốc tế */}
        <div className="relative rounded-2xl sm:rounded-3xl md:rounded-[2rem] border-2 border-emerald-500/45 dark:border-emerald-500/40 bg-gradient-to-b from-emerald-50/70 via-white/90 to-white/95 dark:from-emerald-950/35 dark:via-slate-900/70 dark:to-slate-900/90 py-6 px-4 sm:py-7 sm:px-6 md:py-8 md:px-8 shadow-[0_15px_45px_-12px_rgba(16,185,129,0.18)] dark:shadow-[0_20px_55px_-15px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden text-center ring-1 ring-emerald-400/25">
          
          {/* Inner subtle grid & top ambient emerald glow */}
          <div className="absolute inset-0 hero-grid-pattern pointer-events-none opacity-60 dark:opacity-40" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[550px] h-[180px] bg-gradient-to-b from-emerald-400/25 via-teal-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Top Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 border border-emerald-300/80 dark:border-emerald-500/40 shadow-soft-sm text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-3 sm:mb-3.5 backdrop-blur-md hover:border-emerald-400 dark:hover:border-emerald-400 transition-all hover:scale-[1.02] cursor-default shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>{language === 'vi' ? 'NỀN TẢNG TUYỂN DỤNG THÔNG MINH 2026' : 'NEXT-GEN AI RECRUITMENT 2026'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">{language === 'vi' ? 'Kết nối việc làm tức thì' : 'Instant Job Matching'}</span>
          </div>

          {/* Main Headline - To, Đậm, Ấn Tượng */}
          <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-[3.25rem] font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-3 sm:mb-3.5 max-w-5xl mx-auto shrink-0">
            {language === 'vi' ? (
              <>
                Tìm kiếm <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">công việc mơ ước</span> cùng AI
              </>
            ) : (
              <>
                Find Your <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">Dream Career</span> with AI
              </>
            )}
          </h1>

          {/* Subtitle - Thoáng đãng, thanh lịch */}
          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-3.5 sm:mb-4 font-normal shrink-0">
            {t.hero.subtitle}
          </p>

          {/* Candidate Social Proof Stack */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 shrink-0">
            <div className="flex -space-x-2 overflow-hidden p-0.5 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-soft-xs">
              <img className="inline-block h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Ứng viên" />
              <img className="inline-block h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Ứng viên" />
              <img className="inline-block h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" alt="Ứng viên" />
              <img className="inline-block h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="Ứng viên" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{language === 'vi' ? '3,420+ ứng viên đã kết nối việc làm tuần này' : '3,420+ candidates matched this week'}</span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="text-amber-500 font-semibold">★ 4.9/5</span>
                <span>{language === 'vi' ? 'điểm hài lòng từ 12,000+ đánh giá xác thực' : 'candidate satisfaction from 12,000+ verified reviews'}</span>
              </div>
            </div>
          </div>

          {/* Floating Glassmorphic AI Command Console Search Bar with Iridescent Glow */}
          <div className="p-[2px] rounded-2xl md:rounded-3xl bg-gradient-to-r from-emerald-500/40 via-teal-400/30 to-cyan-500/40 shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 w-full max-w-4xl mx-auto shrink-0">
            <form 
              onSubmit={handleSearchSubmit}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 sm:p-2.5 rounded-[calc(1rem-2px)] md:rounded-[calc(1.5rem-2px)] flex flex-col md:flex-row items-center gap-2 transition-all duration-300"
            >
              {/* Field 1: Job Title / Keyword with Quick Clear */}
              <div className="flex-1 w-full flex items-center px-3.5 py-2.5 sm:py-3 bg-slate-50/80 dark:bg-slate-800/60 md:bg-transparent dark:md:bg-transparent rounded-xl border md:border-none border-slate-200/80 dark:border-slate-700/80 group/input">
                <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2.5 shrink-0 transition-transform group-focus-within/input:scale-110" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t.hero.inputTitle}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-xs sm:placeholder:text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => setKeyword('')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="hidden md:block w-px h-7 bg-slate-200/90 dark:bg-slate-800" />

              {/* Field 2: Location */}
              <div className="w-full md:w-56 flex items-center px-3.5 py-2.5 sm:py-3 bg-slate-50/80 dark:bg-slate-800/60 md:bg-transparent dark:md:bg-transparent rounded-xl border md:border-none border-slate-200/80 dark:border-slate-700/80">
                <MapPin className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 mr-2 shrink-0" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  aria-label={language === 'vi' ? 'Chọn địa điểm làm việc' : 'Select work location'}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="All" className="dark:bg-slate-900">{language === 'vi' ? 'Tất cả' : 'All'}</option>
                  <option value="Hà Nội" className="dark:bg-slate-900">{language === 'vi' ? 'Hà Nội' : 'Hanoi'}</option>
                  <option value="TP. Hồ Chí Minh" className="dark:bg-slate-900">{language === 'vi' ? 'TP. Hồ Chí Minh' : 'Ho Chi Minh City'}</option>
                  <option value="Đà Nẵng" className="dark:bg-slate-900">{language === 'vi' ? 'Đà Nẵng' : 'Da Nang'}</option>
                  <option value="Remote" className="dark:bg-slate-900">{language === 'vi' ? 'Remote (Từ xa)' : 'Remote'}</option>
                </select>
              </div>

              <div className="hidden md:block w-px h-7 bg-slate-200/90 dark:bg-slate-800" />

              {/* Field 3: Job Category */}
              <div className="w-full md:w-52 flex items-center px-3.5 py-2.5 sm:py-3 bg-slate-50/80 dark:bg-slate-800/60 md:bg-transparent dark:md:bg-transparent rounded-xl border md:border-none border-slate-200/80 dark:border-slate-700/80">
                <Briefcase className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 mr-2 shrink-0" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label={language === 'vi' ? 'Chọn ngành nghề tuyển dụng' : 'Select job category'}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="All" className="dark:bg-slate-900">{t.hero.inputCategory}</option>
                  <option value="Tech" className="dark:bg-slate-900">{language === 'vi' ? 'Công nghệ thông tin' : 'IT & Software'}</option>
                  <option value="Marketing" className="dark:bg-slate-900">{language === 'vi' ? 'Marketing & Sales' : 'Marketing & Sales'}</option>
                  <option value="Design" className="dark:bg-slate-900">{language === 'vi' ? 'Thiết kế UI/UX' : 'UI/UX Design'}</option>
                  <option value="Finance" className="dark:bg-slate-900">{language === 'vi' ? 'Tài chính - Ngân hàng' : 'Finance & Banking'}</option>
                  <option value="Product" className="dark:bg-slate-900">{language === 'vi' ? 'Quản trị Sản phẩm' : 'Product Management'}</option>
                </select>
              </div>

              {/* Search Button with Shimmer */}
              <button
                type="submit"
                className="w-full md:w-auto px-7 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white rounded-xl md:rounded-2xl text-sm md:text-base font-bold tracking-wide transition-all shadow-soft flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group shrink-0"
              >
                <div className="shimmer-sweep" />
                <span>{t.hero.btnFindJob}</span>
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Trending Tags Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3.5 sm:mt-4 w-full max-w-5xl mx-auto shrink-0">
            <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1 shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {t.hero.trending}
            </span>
            {trendingTags.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => {
                  setKeyword(tag.label);
                  onSearch(tag.label, location, category);
                }}
                className="px-3 py-1 bg-white/90 dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-500/60 rounded-full text-xs font-medium transition-all shadow-soft-xs hover:-translate-y-0.5 cursor-pointer flex items-center gap-1 shrink-0"
              >
                {tag.hot && <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />}
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Real Brand Logos Bar with Edge Fade Masks */}
        <div className="mt-4 pt-2 sm:mt-5 sm:pt-3">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4 sm:mb-5 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-slate-300 dark:bg-slate-700" />
            <span>{language === 'vi' ? 'Được tin dùng bởi 3,800+ doanh nghiệp công nghệ hàng đầu' : 'Trusted by 3,800+ top tech employers & enterprises'}</span>
            <span className="w-6 h-px bg-slate-300 dark:bg-slate-700" />
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 w-full max-w-6xl mx-auto py-2">
            {[
              { id: 'vinai', name: 'VinAI' },
              { id: 'vng', name: 'VNG' },
              { id: 'fpt', name: 'FPT' },
              { id: 'viettel', name: 'Viettel' },
              { id: 'momo', name: 'MoMo' },
              { id: 'shopee', name: 'Shopee' },
              { id: 'techcombank', name: 'Techcombank' },
              { id: 'grab', name: 'Grab' },
            ].map((brand) => (
              <button 
                key={brand.id} 
                type="button"
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-500/60 group/brand cursor-pointer hover:-translate-y-0.5 hover:shadow-soft-sm transition-all shrink-0"
                onClick={() => {
                  onSearch(brand.name, 'All', 'All');
                }}
                title={`Xem việc làm tại ${brand.name}`}
              >
                <CompanyLogo company={brand.id} size="sm" className="shadow-none border-0" />
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover/brand:text-emerald-600 dark:group-hover/brand:text-emerald-400 transition-colors">
                  {brand.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Value Prop Trust Metrics - Dàn trải đều bằng đúng chiều rộng Khung Xanh (max-w-6xl) */}
        <div className="mt-5 sm:mt-6 w-full max-w-6xl mx-auto pt-4 sm:pt-5 border-t border-slate-200/70 dark:border-slate-800/80">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Stat 1: 10,000+ Openings */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-400/80 dark:hover:border-emerald-500/70 hover:bg-white dark:hover:bg-slate-900/95 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3.5 text-left group cursor-default">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-soft-xs group-hover:scale-110 group-hover:rotate-2 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                  10,000+
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {language === 'vi' ? 'Việc làm tuyển gấp' : 'Active Openings'}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {language === 'vi' ? 'Cập nhật hàng giờ' : 'Updated hourly'}
                </div>
              </div>
            </div>

            {/* Stat 2: 3,800+ Top Companies */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-400/80 dark:hover:border-teal-500/70 hover:bg-white dark:hover:bg-slate-900/95 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3.5 text-left group cursor-default">
              <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-soft-xs group-hover:scale-110 group-hover:-rotate-2 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                  3,800+
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {language === 'vi' ? 'Doanh nghiệp uy tín' : 'Top Companies'}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {language === 'vi' ? 'Xác thực 100%' : 'Verified recruiters'}
                </div>
              </div>
            </div>

            {/* Stat 3: 96.4% AI Match Precision */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-400/80 dark:hover:border-cyan-500/70 hover:bg-white dark:hover:bg-slate-900/95 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3.5 text-left group cursor-default">
              <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200/80 dark:border-cyan-800/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-soft-xs group-hover:scale-110 group-hover:rotate-2 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                  96.4%
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {language === 'vi' ? 'Chuẩn xác AI Match' : 'AI Match Precision'}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {language === 'vi' ? 'Đo lường năng lực' : 'Deep competence'}
                </div>
              </div>
            </div>

            {/* Stat 4: 100% Data Privacy */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-400/80 dark:hover:border-emerald-500/70 hover:bg-white dark:hover:bg-slate-900/95 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3.5 text-left group cursor-default">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-soft-xs group-hover:scale-110 group-hover:-rotate-2 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                  100%
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {language === 'vi' ? 'Bảo mật thông tin' : 'Data Privacy'}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {language === 'vi' ? 'Tiêu chuẩn bảo vệ' : 'Strict standard'}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
