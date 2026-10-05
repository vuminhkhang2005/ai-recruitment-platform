import React, { useState, useMemo } from 'react';
import type { Job } from '../../data/mockData';
import { 
  Radio, 
  Sparkles, 
  Bell, 
  Sliders, 
  Plus, 
  Check, 
  Trash2, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
  Wand2
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CompanyLogo } from '../ui/CompanyLogo';
import { AiMatchBadge } from '../ui/Stickers';
import { CoverLetterStudioModal } from '../jobs/CoverLetterStudioModal';

export interface JobRadarAlert {
  id: string;
  name: string;
  keyword: string;
  minSalaryM: number;
  workMode: 'All' | 'Remote' | 'Hybrid' | 'Onsite';
  minMatchScore: number;
  frequency: 'realtime' | 'daily' | 'weekly';
  isActive: boolean;
  matchedCount: number;
  lastScannedAt: string;
}

const DEFAULT_RADARS: JobRadarAlert[] = [
  {
    id: 'radar-1',
    name: 'High-Comp AI & GenAI Roles',
    keyword: 'AI',
    minSalaryM: 55,
    workMode: 'All',
    minMatchScore: 90,
    frequency: 'realtime',
    isActive: true,
    matchedCount: 5,
    lastScannedAt: '5 phút trước'
  },
  {
    id: 'radar-2',
    name: 'Global Remote Senior Fullstack',
    keyword: 'Fullstack',
    minSalaryM: 45,
    workMode: 'Remote',
    minMatchScore: 88,
    frequency: 'daily',
    isActive: true,
    matchedCount: 4,
    lastScannedAt: '1 giờ trước'
  }
];

interface AiJobRadarSectionProps {
  jobs: Job[];
  onQuickApply: (job: Job) => void;
}

export const AiJobRadarSection: React.FC<AiJobRadarSectionProps> = ({
  jobs,
  onQuickApply
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const { user, isJobApplied } = useAuth();

  const [radars, setRadars] = useState<JobRadarAlert[]>(() => {
    try {
      const saved = localStorage.getItem('talentbridge_user_radars');
      return saved ? JSON.parse(saved) : DEFAULT_RADARS;
    } catch {
      return DEFAULT_RADARS;
    }
  });

  const [selectedRadarId, setSelectedRadarId] = useState<string>(radars[0]?.id || 'radar-1');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [studioTargetJob, setStudioTargetJob] = useState<Job | null>(null);

  // New Radar Form State
  const [newRadarName, setNewRadarName] = useState('');
  const [newRadarKeyword, setNewRadarKeyword] = useState('');
  const [newRadarMinSalary, setNewRadarMinSalary] = useState<number>(40);
  const [newRadarWorkMode, setNewRadarWorkMode] = useState<'All' | 'Remote' | 'Hybrid' | 'Onsite'>('All');
  const [newRadarMinMatch, setNewRadarMinMatch] = useState<number>(90);
  const [newRadarFrequency, setNewRadarFrequency] = useState<'realtime' | 'daily' | 'weekly'>('realtime');

  // Active Radar
  const activeRadar = useMemo(() => {
    return radars.find(r => r.id === selectedRadarId) || radars[0];
  }, [radars, selectedRadarId]);

  // Compute live matching jobs for the active radar
  const matchedJobs = useMemo(() => {
    if (!activeRadar) return [];

    return jobs.filter((job) => {
      // Keyword match
      if (activeRadar.keyword) {
        const q = activeRadar.keyword.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesSkills = job.skills.some(s => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSkills) return false;
      }

      // Min match score
      if (job.aiMatchScore < activeRadar.minMatchScore) {
        return false;
      }

      // Work mode
      if (activeRadar.workMode !== 'All') {
        if (!job.type.toLowerCase().includes(activeRadar.workMode.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [activeRadar, jobs]);

  const saveRadars = (updated: JobRadarAlert[]) => {
    setRadars(updated);
    try {
      localStorage.setItem('talentbridge_user_radars', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save radars to storage:', e);
    }
  };

  const handleToggleRadar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = radars.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
    saveRadars(updated);
  };

  const handleDeleteRadar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = radars.filter(r => r.id !== id);
    saveRadars(updated);
    if (selectedRadarId === id && updated.length > 0) {
      setSelectedRadarId(updated[0].id);
    }
  };

  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const updated = radars.map(r => 
        r.id === selectedRadarId 
          ? { ...r, lastScannedAt: isVi ? 'Vừa xong' : 'Just now', matchedCount: matchedJobs.length } 
          : r
      );
      saveRadars(updated);
    }, 700);
  };

  const handleCreateRadar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRadarName.trim()) return;

    const newRadar: JobRadarAlert = {
      id: 'radar-' + Date.now(),
      name: newRadarName.trim(),
      keyword: newRadarKeyword.trim() || 'Software',
      minSalaryM: newRadarMinSalary,
      workMode: newRadarWorkMode,
      minMatchScore: newRadarMinMatch,
      frequency: newRadarFrequency,
      isActive: true,
      matchedCount: 0,
      lastScannedAt: isVi ? 'Vừa tạo' : 'Just now'
    };

    const updated = [newRadar, ...radars];
    saveRadars(updated);
    setSelectedRadarId(newRadar.id);
    setShowCreateModal(false);

    // Reset fields
    setNewRadarName('');
    setNewRadarKeyword('');
    setNewRadarMinSalary(40);
  };

  return (
    <div className="space-y-6" data-testid="ai-job-radar-container">
      
      {/* 1. Radar Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-soft-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-teal-300">
              <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>{isVi ? 'RADAR VIỆC LÀM AI 24/7' : '24/7 AI CAREER RADAR'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isVi ? 'Hệ Thống Tự Động Quét & Báo Động Việc Làm' : 'Automated Job Radar & Alert Engine'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isVi
                ? 'Không bỏ lỡ cơ hội việc làm mơ ước: AI tự động lọc qua hàng ngàn tin tuyển dụng mới mỗi giờ và kích hoạt thông báo khi phát hiện JD thỏa mãn chính xác mức lương và độ khớp.'
                : 'Never miss top-tier opportunities: AI continuously monitors newly posted jobs and alerts you the instant a role matches your salary threshold and skill stack.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              data-testid="btn-open-create-radar"
              onClick={() => setShowCreateModal(true)}
              className="py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-soft flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isVi ? 'Tạo Radar Mới' : 'Create New Radar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Radar Layout: Left Radar Trackers vs Right Live Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Configured Trackers List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isVi ? 'Danh sách Radar đã bật' : 'Active Radar Channels'}</span>
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {radars.length} {isVi ? 'kênh theo dõi' : 'channels'}
            </span>
          </div>

          <div className="space-y-3">
            {radars.map((radar) => {
              const isSelected = selectedRadarId === radar.id;
              return (
                <div
                  key={radar.id}
                  data-testid={`radar-channel-${radar.id}`}
                  onClick={() => setSelectedRadarId(radar.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 shadow-soft-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          radar.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`} />
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                          {radar.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span>Từ khóa: <strong className="text-slate-700 dark:text-slate-300">{radar.keyword}</strong></span>
                        <span>•</span>
                        <span>Lương: <strong className="text-emerald-600 dark:text-emerald-400">&gt;={radar.minSalaryM}M</strong></span>
                        <span>•</span>
                        <span>Độ khớp: <strong className="text-teal-600 dark:text-teal-400">&gt;={radar.minMatchScore}%</strong></span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        data-testid={`btn-toggle-radar-${radar.id}`}
                        onClick={(e) => handleToggleRadar(radar.id, e)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                          radar.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {radar.isActive ? (isVi ? 'BẬT' : 'ON') : (isVi ? 'TẮT' : 'OFF')}
                      </button>

                      {radars.length > 1 && (
                        <button
                          type="button"
                          data-testid={`btn-delete-radar-${radar.id}`}
                          onClick={(e) => handleDeleteRadar(radar.id, e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{isVi ? 'Lần quét gần nhất:' : 'Last scan:'} {radar.lastScannedAt}</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      {isVi ? 'Phát hiện:' : 'Detected:'} {matchedJobs.length} {isVi ? 'việc làm' : 'jobs'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Radar Scanned Matches Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs">
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                {isVi ? 'Kết quả Radar quét thời gian thực' : 'Real-time Radar Feed'}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {activeRadar ? activeRadar.name : 'Radar Feed'} • {matchedJobs.length} {isVi ? 'việc làm phù hợp' : 'matching roles'}
              </p>
            </div>

            <button
              type="button"
              data-testid="btn-radar-manual-scan"
              onClick={handleManualScan}
              disabled={isScanning}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-500 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? (isVi ? 'Đang quét...' : 'Scanning...') : (isVi ? 'Quét ngay' : 'Scan Now')}</span>
            </button>
          </div>

          {/* Job List Feed */}
          {matchedJobs.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isVi ? 'Chưa phát hiện tin tuyển dụng mới thỏa mãn toàn bộ tiêu chí khắt khe này.' : 'No new listings matched all stringent criteria.'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isVi ? 'Hãy thử hạ ngưỡng độ khớp AI xuống 85% hoặc mở rộng từ khóa.' : 'Try lowering the AI match threshold to 85% or broadening your keyword.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {matchedJobs.slice(0, 4).map((job) => {
                const applied = isJobApplied(job.id);
                return (
                  <div
                    key={job.id}
                    data-testid={`radar-job-card-${job.id}`}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft-xs hover:border-teal-500/60 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CompanyLogo company={job.company} size="sm" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                            {job.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{job.company}</span>
                            <span>•</span>
                            <span>{job.location}</span>
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

                    {/* Skill chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        data-testid={`btn-radar-cover-letter-${job.id}`}
                        onClick={() => setStudioTargetJob(job)}
                        className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>{isVi ? 'Tạo thư AI' : 'Draft Letter'}</span>
                      </button>

                      <button
                        type="button"
                        data-testid={`btn-radar-apply-${job.id}`}
                        onClick={() => onQuickApply(job)}
                        disabled={applied}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          applied
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft active:scale-95'
                        }`}
                      >
                        {applied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{applied ? (isVi ? 'Đã nộp' : 'Applied') : (isVi ? 'Ứng tuyển nhanh' : 'Quick Apply')}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* 3. Modal: Create New Radar Alert */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
          data-testid="modal-create-radar"
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-soft">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isVi ? 'Thiết lập Radar Việc Làm AI' : 'Create AI Job Radar'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isVi ? 'AI sẽ tự động dò tìm và báo động khi xuất hiện JD phù hợp' : 'AI will trigger alerts whenever matching jobs appear'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="btn-close-create-radar"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRadar} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isVi ? 'Tên kênh Radar' : 'Radar Channel Name'}
                </label>
                <input
                  type="text"
                  required
                  data-testid="input-radar-name"
                  placeholder={isVi ? 'VD: Golang Cloud Architect HCM' : 'e.g. Golang Cloud Architect'}
                  value={newRadarName}
                  onChange={(e) => setNewRadarName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isVi ? 'Từ khóa công nghệ / Chức danh' : 'Tech Keywords / Role'}
                </label>
                <input
                  type="text"
                  required
                  data-testid="input-radar-keyword"
                  placeholder={isVi ? 'VD: Kubernetes, Golang, AI, React' : 'e.g. Kubernetes, Golang, AI, React'}
                  value={newRadarKeyword}
                  onChange={(e) => setNewRadarKeyword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isVi ? 'Lương tối thiểu' : 'Min Salary (VND)'}
                  </label>
                  <select
                    value={newRadarMinSalary}
                    data-testid="select-radar-salary"
                    onChange={(e) => setNewRadarMinSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value={25}>25 Triệu+</option>
                    <option value={40}>40 Triệu+</option>
                    <option value={55}>55 Triệu+</option>
                    <option value={75}>75 Triệu+ (Top Tier)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isVi ? 'Độ khớp AI tối thiểu' : 'Min AI Match'}
                  </label>
                  <select
                    value={newRadarMinMatch}
                    data-testid="select-radar-match"
                    onChange={(e) => setNewRadarMinMatch(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value={85}>&gt;= 85% Match</option>
                    <option value={90}>&gt;= 90% Match</option>
                    <option value={94}>&gt;= 94% (Rất cao)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isVi ? 'Tần suất thông báo' : 'Notification Frequency'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'realtime', labelVi: 'Tức thì (Push)', labelEn: 'Realtime' },
                    { id: 'daily', labelVi: 'Hàng ngày', labelEn: 'Daily' },
                    { id: 'weekly', labelVi: 'Hàng tuần', labelEn: 'Weekly' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      data-testid={`frequency-${item.id}`}
                      onClick={() => setNewRadarFrequency(item.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                        newRadarFrequency === item.id
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isVi ? item.labelVi : item.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  data-testid="btn-submit-create-radar"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-soft cursor-pointer transition-all active:scale-95"
                >
                  {isVi ? 'Kích hoạt Radar ngay' : 'Activate Radar'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 4. Cover Letter Studio Sub-Modal */}
      <CoverLetterStudioModal
        job={studioTargetJob}
        isOpen={!!studioTargetJob}
        onClose={() => setStudioTargetJob(null)}
        onApplicationSubmitted={(job) => {
          onQuickApply(job);
        }}
      />

    </div>
  );
};
