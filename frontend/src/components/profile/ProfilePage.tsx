import React, { useState } from 'react';
import { 
  ArrowLeft,
  MapPin, 
  Mail, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Share2, 
  Eye, 
  ShieldCheck, 
  ChevronRight, 
  Bookmark, 
  Clock, 
  Settings, 
  UserCheck, 
  FileText, 
  ArrowLeftRight,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Calendar,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { MOCK_JOBS } from '../../data/mockData';

interface ProfilePageProps {
  onBackToHome: () => void;
  onSelectJob?: (jobId: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBackToHome }) => {
  const { user, loginDemo, logout, switchRole, savedJobIds, toggleSaveJob, appliedJobs, applyJob, updateProfile } = useAuth();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // If user is guest, automatically initialize with demo candidate so they immediately see a rich profile
  React.useEffect(() => {
    if (!user) {
      loginDemo('candidate');
    }
  }, [user, loginDemo]);

  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'skills' | 'applications' | 'saved' | 'settings'>('overview');
  
  // Local edit states
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user?.bio || '');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showAddSkillForm, setShowAddSkillForm] = useState(false);
  const [jobSeekingStatus, setJobSeekingStatus] = useState<'active' | 'open' | 'closed'>('active');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!user) {
    return null;
  }

  const handleSaveBio = () => {
    updateProfile({ bio: bioInput });
    setIsEditingBio(false);
    showToast(isVi ? 'Đã cập nhật phần giới thiệu bản thân!' : 'Updated your bio successfully!');
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (user.skills && !user.skills.includes(trimmed)) {
      updateProfile({ skills: [...user.skills, trimmed] });
      showToast(isVi ? `Đã thêm kỹ năng "${trimmed}"!` : `Added skill "${trimmed}"!`);
    }
    setNewSkillInput('');
    setShowAddSkillForm(false);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (user.skills) {
      updateProfile({ skills: user.skills.filter(s => s !== skillToRemove) });
      showToast(isVi ? `Đã gỡ kỹ năng "${skillToRemove}"` : `Removed skill "${skillToRemove}"`);
    }
  };

  const handleDownloadCv = () => {
    showToast(isVi ? 'Đang xuất hồ sơ CV định dạng chuẩn ATS (PDF)...' : 'Exporting ATS-compliant CV (PDF)...');
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    showToast(isVi ? 'Đã sao chép liên kết hồ sơ của bạn vào bộ nhớ tạm!' : 'Profile link copied to clipboard!');
  };

  // Get saved jobs list from mock data
  const savedJobsList = MOCK_JOBS.filter(job => savedJobIds.includes(job.id));

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 sm:py-10 transition-colors duration-300">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-soft-2xl border border-slate-700 animate-slide-up text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumb / Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{isVi ? 'Quay lại trang chủ' : 'Back to Home'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              {isVi ? 'Chế độ xem:' : 'View Mode:'}
            </span>
            <button
              type="button"
              onClick={() => {
                switchRole();
                showToast(isVi ? 'Đã đổi vai trò hiển thị hồ sơ!' : 'Switched profile display role!');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs transition-all cursor-pointer active:scale-95"
              title={isVi ? 'Đổi qua lại giữa Ứng viên và Tuyển dụng' : 'Switch role'}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-500" />
              <span>{user.role === 'candidate' ? (isVi ? 'Đổi sang Tuyển dụng' : 'Switch to Recruiter') : (isVi ? 'Đổi sang Ứng viên' : 'Switch to Candidate')}</span>
            </button>
          </div>
        </div>

        {/* 1. Profile Hero Card / Header Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-md overflow-hidden relative transition-colors duration-300">
          
          {/* Cover Banner */}
          <div className="h-36 sm:h-48 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="px-3 py-1 bg-black/30 backdrop-blur-md rounded-full text-white text-[11px] font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>{isVi ? 'Hồ sơ đã xác minh danh tính' : 'Verified Candidate Profile'}</span>
              </span>
            </div>

            {/* Quick Share / Export Buttons */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareProfile}
                className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-colors cursor-pointer"
                title={isVi ? 'Chia sẻ hồ sơ' : 'Share profile'}
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDownloadCv}
                className="px-3 py-2 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs shadow-soft transition-all cursor-pointer flex items-center gap-1.5"
                title={isVi ? 'Tải CV PDF' : 'Download CV PDF'}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isVi ? 'Tải CV PDF' : 'Download CV'}</span>
              </button>
            </div>
          </div>

          {/* Profile Meta Details */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 pt-2 border-b border-slate-100 dark:border-slate-800">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                {/* Large Avatar */}
                <div className="relative -mt-16 sm:-mt-20 shrink-0">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-soft-xl bg-slate-100 dark:bg-slate-800"
                  />
                  <span className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-emerald-500 rounded-full ring-3 ring-white dark:ring-slate-900" title="Online" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {user.name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {user.role === 'candidate' ? (isVi ? 'Ứng viên PRO' : 'Candidate PRO') : (isVi ? 'Nhà tuyển dụng' : 'Recruiter')}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {user.title} {user.company ? `@ ${user.company}` : ''}
                  </p>

                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {user.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {user.experienceYears}+ {isVi ? 'năm kinh nghiệm' : 'years exp'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-emerald-500" />
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Action Pill */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Job Seeking Status Chip */}
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setJobSeekingStatus('active');
                      showToast(isVi ? 'Đã chuyển trạng thái: Đang tìm việc ngay' : 'Status: Actively job seeking');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      jobSeekingStatus === 'active'
                        ? 'bg-emerald-600 text-white shadow-soft'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    🟢 {isVi ? 'Đang tìm việc' : 'Actively Seeking'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setJobSeekingStatus('open');
                      showToast(isVi ? 'Đã chuyển trạng thái: Mở với cơ hội tốt' : 'Status: Open to offers');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      jobSeekingStatus === 'open'
                        ? 'bg-emerald-600 text-white shadow-soft'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    🟡 {isVi ? 'Cân nhắc cơ hội' : 'Open to offers'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditingBio(true);
                    setActiveTab('overview');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-soft transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Chỉnh sửa hồ sơ' : 'Edit Profile'}</span>
                </button>
              </div>

            </div>

            {/* Profile Strength & ATS Score Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
              
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-soft">
                  {user.atsScore || 94}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{isVi ? 'Điểm ATS Chuẩn Hóa' : 'ATS Benchmark Score'}</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{isVi ? 'Top 5% Ứng viên toàn quốc' : 'Top 5% Candidate nationwide'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm shrink-0">
                  92%
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{isVi ? 'Độ hoàn thiện hồ sơ' : 'Profile Strength'}</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{isVi ? 'Rất tốt • Đủ điều kiện AI Match' : 'Strong • Ready for AI matching'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-sm shrink-0">
                  {appliedJobs.length}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{isVi ? 'Vị trí đã ứng tuyển' : 'Applied Jobs'}</span>
                  <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">{isVi ? 'Đang theo dõi tiến độ' : 'Track live pipeline'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm shrink-0">
                  18
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{isVi ? 'Lượt xem hồ sơ' : 'Recruiter Views'}</span>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{isVi ? '+35% trong tuần qua' : '+35% this week'}</p>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 2. Main Tabbed Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200/90 dark:border-slate-800">
          {[
            { id: 'overview', labelVi: 'Tổng quan', labelEn: 'Overview', icon: FileText },
            { id: 'experience', labelVi: 'Kinh nghiệm & Học vấn', labelEn: 'Experience & Edu', icon: Briefcase },
            { id: 'skills', labelVi: 'Kỹ năng & AI Đánh giá', labelEn: 'Skills & AI Radar', icon: Cpu },
            { id: 'applications', labelVi: `Đã ứng tuyển (${appliedJobs.length})`, labelEn: `Applications (${appliedJobs.length})`, icon: UserCheck },
            { id: 'saved', labelVi: `Việc đã lưu (${savedJobsList.length})`, labelEn: `Saved Jobs (${savedJobsList.length})`, icon: Bookmark },
            { id: 'settings', labelVi: 'Cài đặt tài khoản', labelEn: 'Account Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-soft'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{isVi ? tab.labelVi : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Tab Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main 2-Column Content Area */}
          <div className="lg:col-span-2 space-y-6">

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* About / Bio Section */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span>{isVi ? 'Giới thiệu bản thân' : 'About / Professional Bio'}</span>
                    </h3>
                    {!isEditingBio ? (
                      <button
                        type="button"
                        onClick={() => {
                          setBioInput(user.bio || '');
                          setIsEditingBio(true);
                        }}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isVi ? 'Chỉnh sửa' : 'Edit'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingBio(false)}
                          className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {isVi ? 'Hủy' : 'Cancel'}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveBio}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-soft cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isVi ? 'Lưu' : 'Save'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditingBio ? (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {user.bio || (isVi ? 'Chưa có thông tin giới thiệu. Nhấn "Chỉnh sửa" để cập nhật.' : 'No bio provided yet.')}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={bioInput}
                        onChange={(e) => setBioInput(e.target.value)}
                        rows={4}
                        className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                        placeholder={isVi ? 'Nhập tóm tắt quá trình kinh nghiệm, thế mạnh công nghệ và mục tiêu nghề nghiệp...' : 'Enter your bio summary...'}
                      />
                    </div>
                  )}
                </div>

                {/* Job Preferences Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    <span>{isVi ? 'Kỳ vọng công việc mong muốn' : 'Job Preferences & Target Roles'}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <span className="text-slate-400 font-medium">{isVi ? 'Mức lương mong muốn' : 'Target Salary'}</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">$2,500 - $3,500 / {isVi ? 'tháng' : 'mo'}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">{isVi ? 'Có thể thương lượng thêm ESOP' : 'Open to negotiable equity'}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <span className="text-slate-400 font-medium">{isVi ? 'Hình thức làm việc' : 'Work Mode'}</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Hybrid / Remote</p>
                      <span className="text-[10px] text-indigo-600 font-semibold">{isVi ? 'Ưu tiên làm từ xa 2-3 ngày/tuần' : 'Prefers 2-3 days remote'}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <span className="text-slate-400 font-medium">{isVi ? 'Địa điểm ưu tiên' : 'Preferred Locations'}</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">TP. Hồ Chí Minh • Hà Nội</p>
                      <span className="text-[10px] text-slate-500">{isVi ? 'Sẵn sàng công tác ngắn hạn' : 'Willing to travel occasionally'}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <span className="text-slate-400 font-medium">{isVi ? 'Cấp bậc mục tiêu' : 'Target Level'}</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Senior • Lead Fullstack</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">{isVi ? '4+ năm kinh nghiệm thực chiến' : '4+ years hands-on'}</span>
                    </div>
                  </div>
                </div>

                {/* AI Profile Optimization Advice */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 border border-emerald-200/90 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isVi ? 'Khuyến nghị nâng cấp hồ sơ từ AI TalentBridge' : 'AI Resume Optimization Guidance'}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {isVi
                      ? '🎯 Hồ sơ của bạn đạt độ tương thích 94% với các vị trí Senior Fullstack tại VNG và VinAI. Nếu bổ sung thêm số liệu định lượng về lượng người dùng (MAU) và khả năng tối ưu hóa truy vấn SQL/Redis vào phần dự án, tỷ lệ nhận lời mời phỏng vấn trực tiếp sẽ đạt 99%.'
                      : '🎯 Your profile achieves 94% ATS compatibility for Senior Fullstack positions. Adding quantifiable metrics on high-throughput workloads and Redis caching will boost interview invitation probability to 99%.'}
                  </p>
                </div>

              </div>
            )}

            {/* TAB 2: EXPERIENCE & EDUCATION */}
            {activeTab === 'experience' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Work Experience Timeline */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-500" />
                      <span>{isVi ? 'Kinh nghiệm làm việc' : 'Work Experience Timeline'}</span>
                    </h3>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      4+ {isVi ? 'Năm kinh nghiệm' : 'Years Experience'}
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    
                    {/* Role 1 */}
                    <div className="relative space-y-2">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Senior Fullstack Software Engineer
                        </h4>
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md self-start sm:self-auto">
                          2024 - {isVi ? 'Hiện tại' : 'Present'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        VNG Corporation • TP. Hồ Chí Minh
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {isVi
                          ? 'Chủ trì kiến trúc micro-frontend cho hệ thống ZaloPay Mini Apps, phục vụ hơn 15 triệu người dùng hoạt động mỗi tháng. Tối ưu bundle size giảm 42%, giảm thời gian load trang từ 2.4s xuống dưới 0.8s.'
                          : 'Led micro-frontend architecture for ZaloPay Mini Apps serving 15M+ active users. Reduced bundle size by 42% and client load latency from 2.4s down to 0.8s.'}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['React 19', 'TypeScript', 'Next.js', 'Go', 'Docker', 'PostgreSQL', 'Redis'].map(s => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Role 2 */}
                    <div className="relative space-y-2 pt-4">
                      <div className="absolute -left-6 top-5 w-3.5 h-3.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Fullstack Software Engineer
                        </h4>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md self-start sm:self-auto">
                          2022 - 2024 (2 {isVi ? 'năm' : 'yrs'})
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        FPT Software • TP. Hồ Chí Minh
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {isVi
                          ? 'Phát triển các cổng thanh toán và quản trị portal khách hàng quốc tế cho thị trường Nhật Bản và Singapore. Xây dựng pipeline CI/CD tự động hóa trên AWS.'
                          : 'Engineered international enterprise portals and fintech integrations for Japan and Singapore clients. Implemented automated CI/CD pipelines on AWS.'}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['Node.js', 'React', 'AWS S3', 'Lambda', 'Docker', 'TailwindCSS'].map(s => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Education & Certifications */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-6">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                    <span>{isVi ? 'Học vấn & Chứng chỉ quốc tế' : 'Education & Certifications'}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{isVi ? 'Đại học Bách Khoa TP.HCM' : 'HCMUT - Bach Khoa University'}</h5>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{isVi ? 'Kỹ sư Kỹ thuật Phần mềm' : 'Bachelor of Software Engineering'}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">2018 - 2022 • GPA 3.65/4.0 ({isVi ? 'Hạng Xuất Sắc' : 'High Distinction'})</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">AWS Solutions Architect</h5>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Amazon Web Services (SAA-C03)</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{isVi ? 'Có giá trị đến 2027 • Chứng chỉ xác minh' : 'Valid thru 2027 • Verified ID'}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-500" />
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Google Cloud Developer</h5>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Google Cloud Professional</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{isVi ? 'Hoàn thành 2024 • Chứng chỉ số' : 'Completed 2024 • Digital Credential'}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-teal-500" />
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">CKA (Kubernetes Administrator)</h5>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Cloud Native Computing Foundation</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{isVi ? 'Xác thực cấu hình cụm k8s' : 'Certified cluster operations'}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: SKILLS & AI RADAR */}
            {activeTab === 'skills' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Core Competencies AI Radar Bars */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-500" />
                      <span>{isVi ? 'Phân bổ năng lực cốt lõi (AI Radar)' : 'Core Competency AI Analysis'}</span>
                    </h3>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Gemini 2.0 Parser
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                        <span>Frontend Architecture (React 19, TypeScript, Next.js)</span>
                        <span className="text-emerald-600">98%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                        <span>Backend & Microservices (Go, Node.js, REST & gRPC)</span>
                        <span className="text-teal-600">95%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: '95%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                        <span>Cloud & DevOps (Docker, Kubernetes, AWS, CI/CD)</span>
                        <span className="text-indigo-600">92%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                        <span>Database & High Throughput Caching (PostgreSQL, Redis, Kafka)</span>
                        <span className="text-amber-600">90%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '90%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Tag Management */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-emerald-500" />
                      <span>{isVi ? 'Danh sách kỹ năng đã trích xuất & xác thực' : 'Verified Skills Matrix'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddSkillForm(!showAddSkillForm)}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Thêm kỹ năng mới' : 'Add New Skill'}</span>
                    </button>
                  </div>

                  {showAddSkillForm && (
                    <form onSubmit={handleAddSkill} className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-fade-in">
                      <input 
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        placeholder={isVi ? 'VD: GraphQL, Rust, PyTorch, LangChain...' : 'e.g. GraphQL, Rust, PyTorch...'}
                        className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-soft cursor-pointer transition-all"
                      >
                        {isVi ? 'Thêm' : 'Add'}
                      </button>
                    </form>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {user.skills && user.skills.map((skill) => (
                      <span 
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 hover:border-emerald-500/60 transition-colors group"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="opacity-40 hover:opacity-100 hover:text-rose-500 transition-opacity p-0.5 cursor-pointer"
                          title={isVi ? 'Xóa kỹ năng' : 'Remove skill'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: APPLICATIONS TRACKER */}
            {activeTab === 'applications' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      <span>{isVi ? 'Theo dõi tiến độ hồ sơ ứng tuyển' : 'Live Applications Pipeline'}</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-500">
                      {appliedJobs.length} {isVi ? 'vị trí' : 'jobs'}
                    </span>
                  </div>

                  {appliedJobs.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                      <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-500">{isVi ? 'Bạn chưa ứng tuyển vị trí nào.' : 'No active applications.'}</p>
                      <button
                        type="button"
                        onClick={onBackToHome}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-soft cursor-pointer"
                      >
                        {isVi ? 'Khám phá việc làm ngay' : 'Browse Jobs Now'}
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {appliedJobs.map((app) => (
                        <div key={app.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {app.jobTitle}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {app.company} • {isVi ? 'Nộp ngày' : 'Applied on'} {app.appliedAt}
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                              app.status === 'ai_passed'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            }`}>
                              {isVi ? app.statusTextVi : app.statusTextEn}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: SAVED JOBS */}
            {activeTab === 'saved' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-emerald-500" />
                      <span>{isVi ? 'Danh sách công việc đã lưu yêu thích' : 'Saved Opportunities'}</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-500">
                      {savedJobsList.length} {isVi ? 'việc làm' : 'saved'}
                    </span>
                  </div>

                  {savedJobsList.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                      <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-500">{isVi ? 'Chưa có việc làm nào được lưu.' : 'No saved jobs.'}</p>
                      <button
                        type="button"
                        onClick={onBackToHome}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-soft cursor-pointer"
                      >
                        {isVi ? 'Khám phá việc làm' : 'Explore Jobs'}
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {savedJobsList.map((job) => (
                        <div key={job.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors">
                              {job.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {job.company} • {job.location} • <span className="font-bold text-emerald-600">{job.salary}</span>
                            </p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {job.skills.slice(0, 3).map(s => (
                                <span key={s} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px]">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => {
                                applyJob({ id: job.id, title: job.title, company: job.company });
                                showToast(isVi ? `Đã ứng tuyển vào ${job.title}!` : `Applied for ${job.title}!`);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-soft cursor-pointer transition-all"
                            >
                              {isVi ? 'Ứng tuyển ngay' : 'Apply Now'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                toggleSaveJob(job.id);
                                showToast(isVi ? `Đã bỏ lưu ${job.title}` : `Removed ${job.title}`);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title={isVi ? 'Bỏ lưu' : 'Unsave'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-6">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-500" />
                    <span>{isVi ? 'Cài đặt tài khoản & Quyền riêng tư' : 'Account & Privacy Settings'}</span>
                  </h3>

                  <div className="space-y-4 text-xs">
                    
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{isVi ? 'Thông báo việc làm phù hợp qua Email' : 'Email Job Alerts'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{isVi ? 'Nhận thông báo khi có việc làm mới khớp trên 90% AI' : 'Get instant alerts when 90%+ matching jobs appear'}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{isVi ? 'Cho phép Nhà tuyển dụng tìm thấy hồ sơ' : 'Recruiter Discovery'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{isVi ? 'Hồ sơ của bạn hiển thị trên bảng ATS tìm kiếm của nhà tuyển dụng' : 'Allow verified talent acquisition to view candidate dossier'}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{isVi ? 'Bảo vệ dữ liệu & Ẩn thông tin liên hệ' : 'Privacy Protection'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{isVi ? 'Chỉ chia sẻ số điện thoại khi bạn đồng ý lịch phỏng vấn' : 'Reveal contact info only upon confirmed interview'}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer" />
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          onBackToHome();
                        }}
                        className="px-4 py-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900/60 cursor-pointer transition-colors"
                      >
                        {isVi ? 'Đăng xuất tài khoản' : 'Sign Out'}
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar: Contact & Verification Badges */}
          <div className="space-y-6">
            
            {/* Direct Contact Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-4">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isVi ? 'Thông tin liên hệ' : 'Contact Information'}</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-medium block">Email:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold truncate block">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-medium block">{isVi ? 'Điện thoại:' : 'Phone:'}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold truncate block">{user.phone || '+84 912 345 678'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-medium block">{isVi ? 'Khu vực:' : 'Location:'}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold truncate block">{user.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI ATS Quick Scan Banner */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white p-6 rounded-3xl shadow-soft-md space-y-3 relative overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold">
                {isVi ? 'Bạn vừa cập nhật CV mới?' : 'Updated your resume?'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isVi ? 'Sử dụng AI CV Scanner để tự động tính lại điểm ATS và bóc tách từ khóa mới vào hồ sơ.' : 'Use our neural parser to rescan and auto-populate your latest competencies.'}
              </p>
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-soft cursor-pointer transition-all active:scale-95"
              >
                {isVi ? 'Quét lại CV với AI' : 'Rescan CV with AI'}
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
