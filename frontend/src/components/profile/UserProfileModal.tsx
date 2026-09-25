import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  LogOut, 
  ArrowLeftRight,
  Plus,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSavedJobs: () => void;
  onOpenAppliedJobs: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenSavedJobs,
  onOpenAppliedJobs
}) => {
  if (!isOpen) return null;

  const { user, logout, switchRole, savedJobIds, appliedJobs, updateProfile } = useAuth();
  const { language } = useLanguage();
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);

  if (!user) return null;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    if (user.skills && !user.skills.includes(newSkillInput.trim())) {
      updateProfile({ skills: [...user.skills, newSkillInput.trim()] });
    }
    setNewSkillInput('');
    setShowAddSkill(false);
  };

  const isVi = language === 'vi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-soft-2xl border border-slate-200 dark:border-slate-800 relative transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover Banner */}
        <div className="h-28 sm:h-32 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 relative p-4 rounded-t-3xl overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-black/25 backdrop-blur-sm rounded-xl text-white text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>{isVi ? 'Tài khoản đã xác thực' : 'Verified Account'}</span>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer backdrop-blur-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info Section */}
        <div className="px-5 sm:px-8 pb-8 pt-0 relative">
          {/* Avatar & Main Info Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-6 pt-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="relative -mt-14 sm:-mt-16 shrink-0">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-soft-xl bg-slate-100 dark:bg-slate-800"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" title="Online" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {user.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {user.role === 'candidate' ? (isVi ? 'Ứng viên PRO' : 'Candidate PRO') : (isVi ? 'Nhà tuyển dụng' : 'Recruiter')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {user.title} {user.company ? `@ ${user.company}` : ''}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {user.location}
                  </span>
                  <span>•</span>
                  <span>{user.experienceYears}+ {isVi ? 'năm kinh nghiệm' : 'years exp'}</span>
                </div>
              </div>
            </div>

            {/* Role switch button */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => switchRole()}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title={isVi ? 'Đổi sang vai trò đối ứng' : 'Switch between Candidate and Recruiter'}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-500" />
                <span>{user.role === 'candidate' ? (isVi ? 'Chuyển sang Tuyển dụng' : 'Switch to Recruiter') : (isVi ? 'Chuyển sang Ứng viên' : 'Switch to Candidate')}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 my-6">
            {user.role === 'candidate' ? (
              <>
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xl sm:text-2xl font-black">{user.atsScore || 94}/100</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{isVi ? 'Điểm ATS CV' : 'ATS Score'}</p>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">{isVi ? 'Top 5% Ứng viên' : 'Top 5% Candidate'}</p>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSavedJobs();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center transition-all cursor-pointer group"
                >
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block group-hover:text-emerald-500 transition-colors">
                    {savedJobIds.length}
                  </span>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{isVi ? 'Việc đã lưu' : 'Saved Jobs'}</p>
                  <p className="text-[9px] text-slate-400">{isVi ? 'Xem danh sách →' : 'View list →'}</p>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAppliedJobs();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center transition-all cursor-pointer group"
                >
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block group-hover:text-teal-500 transition-colors">
                    {appliedJobs.length}
                  </span>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{isVi ? 'Đã ứng tuyển' : 'Applied Jobs'}</p>
                  <p className="text-[9px] text-slate-400">{isVi ? 'Xem tiến độ →' : 'Track progress →'}</p>
                </button>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-center">
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block">3</span>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{isVi ? 'Tin tuyển dụng' : 'Active Jobs'}</p>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">{isVi ? 'Đang nhận CV' : 'Accepting CV'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">26</span>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{isVi ? 'Ứng viên Pipeline' : 'Pipeline CV'}</p>
                  <p className="text-[9px] text-slate-400">{isVi ? 'Sàng lọc tự động' : 'Auto Filter'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">98%</span>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{isVi ? 'Tỷ lệ phản hồi' : 'Response Rate'}</p>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">{isVi ? 'Top Nhà tuyển dụng' : 'Top Recruiter'}</p>
                </div>
              </>
            )}
          </div>

          {/* About / Bio */}
          {user.bio && (
            <div className="mb-6 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {isVi ? 'Giới thiệu bản thân' : 'About / Bio'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                {user.bio}
              </p>
            </div>
          )}

          {/* Contact Details */}
          <div className="mb-6 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {isVi ? 'Thông tin liên hệ' : 'Contact Details'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-200 font-medium truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-200 font-medium truncate">{user.phone || '+84 912 345 678'}</span>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {isVi ? 'Kỹ năng chuyên môn đã xác thực' : 'Verified Core Competencies'}
              </h4>
              <button
                type="button"
                onClick={() => setShowAddSkill(!showAddSkill)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isVi ? 'Thêm kỹ năng' : 'Add Skill'}</span>
              </button>
            </div>

            {showAddSkill && (
              <form onSubmit={handleAddSkill} className="flex gap-2 animate-fade-in">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder={isVi ? 'VD: GraphQL, Kubernetes, Rust...' : 'e.g. GraphQL, Kubernetes, Rust...'}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  {isVi ? 'Thêm' : 'Add'}
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-1.5">
              {user.skills && user.skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center gap-1.5 shadow-soft-xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isVi ? 'Đăng xuất tài khoản' : 'Sign Out'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-soft"
            >
              {isVi ? 'Đóng cửa sổ' : 'Close'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};