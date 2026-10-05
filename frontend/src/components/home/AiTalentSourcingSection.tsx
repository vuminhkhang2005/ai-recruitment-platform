import React, { useState, useMemo } from 'react';
import type { Candidate } from './EmployerSection';
import { 
  Sparkles, 
  Search, 
  Compass, 
  ExternalLink, 
  Mail, 
  Plus, 
  Check, 
  Send, 
  Copy, 
  X, 
  ChevronRight, 
  SlidersHorizontal, 
  UserCheck, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Building, 
  MapPin, 
  Award, 
  Star,
  CheckCircle2,
  Code2
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface SourcedTalent {
  id: string;
  name: string;
  role: string;
  currentCompany: string;
  location: string;
  yearsOfExp: number;
  matchScore: number;
  atsScore: number;
  githubStars: number;
  openSourceProject: string;
  switchReadiness: 'High' | 'Medium';
  skills: string[];
  summaryVi: string;
  summaryEn: string;
  estimatedSalaryVi: string;
  estimatedSalaryEn: string;
}

const SOURCED_TALENTS: SourcedTalent[] = [
  {
    id: 'talent-1',
    name: 'Đặng Minh Trí',
    role: 'Staff Infrastructure & Distributed Systems Engineer',
    currentCompany: 'ex-Grab / Shopee Platform',
    location: 'TP. Hồ Chí Minh & Remote',
    yearsOfExp: 7,
    matchScore: 97,
    atsScore: 98,
    githubStars: 1420,
    openSourceProject: 'fast-event-bus (Rust high-throughput broker)',
    switchReadiness: 'High',
    skills: ['Rust', 'Go', 'Kubernetes', 'eBPF', 'Kafka', 'Distributed Systems'],
    summaryVi: 'Chuyên gia hạ tầng phân tán xử lý tải hàng triệu QPS. Tác giả thư viện event streaming đạt 1.4k sao trên GitHub, từng dẫn dắt migration sang Microservices cho 40+ kỹ sư.',
    summaryEn: 'Distributed systems infrastructure architect handling millions of QPS. Creator of fast-event-bus (1.4k GitHub stars). Led microservice migrations for 40+ engineers.',
    estimatedSalaryVi: '70 - 90 Triệu VNĐ / tháng',
    estimatedSalaryEn: '$2,800 - $3,600 / month'
  },
  {
    id: 'talent-2',
    name: 'Elena Rostova (Phạm Thu Hà)',
    role: 'Senior AI & LLM Systems Engineer',
    currentCompany: 'ex-VinAI Research',
    location: 'Hà Nội & Hybrid',
    yearsOfExp: 5,
    matchScore: 95,
    atsScore: 96,
    githubStars: 890,
    openSourceProject: 'vllm-quant-optimizer (4-bit inference acceleration)',
    switchReadiness: 'High',
    skills: ['PyTorch', 'vLLM', 'CUDA C++', 'TensorRT-LLM', 'Model Quantization', 'Python'],
    summaryVi: 'Kỹ sư chuyên sâu về tối ưu suy luận mô hình ngôn ngữ lớn (LLM Inference Optimization). Giảm 65% latency phục vụ mô hình Llama-3 trên GPU clusters.',
    summaryEn: 'LLM inference acceleration specialist. Reduced Llama-3 serving latency by 65% across multi-GPU distributed clusters.',
    estimatedSalaryVi: '60 - 80 Triệu VNĐ / tháng',
    estimatedSalaryEn: '$2,400 - $3,200 / month'
  },
  {
    id: 'talent-3',
    name: 'Nguyễn Quốc Hùng',
    role: 'Lead Frontend & Performance Architect',
    currentCompany: 'ex-VNG Games',
    location: 'TP. Hồ Chí Minh',
    yearsOfExp: 6,
    matchScore: 94,
    atsScore: 95,
    githubStars: 620,
    openSourceProject: 'micro-fe-runtime (Isolated dynamic module federation)',
    switchReadiness: 'Medium',
    skills: ['React 19', 'TypeScript', 'WebAssembly', 'Micro-frontends', 'Next.js', 'Vite'],
    summaryVi: 'Kiến trúc sư Frontend chuyên tối ưu Web Vitals và thiết kế nền tảng Micro-frontend cho các web apps có hơn 5 triệu người dùng hoạt động hàng ngày.',
    summaryEn: 'Frontend architect specializing in Web Vitals optimization and Micro-frontend architectures serving 5M+ daily active users.',
    estimatedSalaryVi: '50 - 68 Triệu VNĐ / tháng',
    estimatedSalaryEn: '$2,000 - $2,700 / month'
  },
  {
    id: 'talent-4',
    name: 'Trần Bích Ngọc',
    role: 'Senior SRE & Cloud Native Security Engineer',
    currentCompany: 'ex-MoMo Fintech',
    location: 'TP. Hồ Chí Minh & Remote',
    yearsOfExp: 6,
    matchScore: 93,
    atsScore: 94,
    githubStars: 410,
    openSourceProject: 'k8s-zero-trust-mesh (Automated mutual TLS injector)',
    switchReadiness: 'High',
    skills: ['Kubernetes', 'Terraform', 'Istio', 'AWS', 'Zero-Trust', 'Golang'],
    summaryVi: 'Chuyên gia bảo mật Cloud Native và độ tin cậy hệ thống tài chính (Fintech PCI-DSS). Thiết kế quy trình CI/CD GitOps tự động hóa 100%.',
    summaryEn: 'Cloud Native security & reliability specialist for PCI-DSS financial pipelines. Engineered 100% automated GitOps workflows.',
    estimatedSalaryVi: '55 - 75 Triệu VNĐ / tháng',
    estimatedSalaryEn: '$2,200 - $3,000 / month'
  }
];

interface AiTalentSourcingSectionProps {
  onImportCandidate: (candidate: Candidate) => void;
  onShowToast: (msg: string) => void;
}

export const AiTalentSourcingSection: React.FC<AiTalentSourcingSectionProps> = ({
  onImportCandidate,
  onShowToast
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<'all' | 'infrastructure' | 'ai' | 'frontend'>('all');
  const [readinessFilter, setReadinessFilter] = useState<'all' | 'High'>('all');
  
  // Imported candidates set
  const [importedIds, setImportedIds] = useState<string[]>([]);

  // Outreach Email Generator Drawer
  const [selectedTalentForOutreach, setSelectedTalentForOutreach] = useState<SourcedTalent | null>(null);
  const [outreachTone, setOutreachTone] = useState<'technical' | 'visionary' | 'casual'>('technical');
  const [isCopiedEmail, setIsCopiedEmail] = useState(false);

  // Filtered list
  const filteredTalents = useMemo(() => {
    return SOURCED_TALENTS.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDomain = domainFilter === 'all' ? true :
        domainFilter === 'infrastructure' ? t.skills.includes('Rust') || t.skills.includes('Kubernetes') :
        domainFilter === 'ai' ? t.skills.includes('PyTorch') || t.skills.includes('CUDA C++') :
        t.skills.includes('React 19') || t.skills.includes('TypeScript');

      const matchReadiness = readinessFilter === 'all' ? true : t.switchReadiness === 'High';

      return matchSearch && matchDomain && matchReadiness;
    });
  }, [searchQuery, domainFilter, readinessFilter]);

  const handleImportToPipeline = (talent: SourcedTalent) => {
    const newCand: Candidate = {
      id: `imported-${talent.id}-${Date.now()}`,
      name: talent.name,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      role: talent.role,
      prevCompany: talent.currentCompany,
      score: talent.matchScore,
      atsScore: talent.atsScore,
      experienceVi: `${talent.yearsOfExp} năm kinh nghiệm thực chiến`,
      experienceEn: `${talent.yearsOfExp} years hands-on experience`,
      salaryVi: talent.estimatedSalaryVi,
      salaryEn: talent.estimatedSalaryEn,
      skills: talent.skills,
      appliedTimeVi: 'Được AI Sourcing tiếp cận',
      appliedTimeEn: 'Sourced by AI Headhunter',
      aiVerdictVi: `Ứng viên nguồn mở xuất sắc: ${talent.openSourceProject}. Điểm kỹ thuật thuộc nhóm Top 2% thị trường.`,
      aiVerdictEn: `Outstanding open-source talent: ${talent.openSourceProject}. Technical capability in top 2% market percentile.`,
      breakdown: {
        tech: 98,
        exp: 95,
        edu: 90,
        soft: 92
      }
    };

    onImportCandidate(newCand);
    setImportedIds(prev => [...prev, talent.id]);
    onShowToast(isVi ? `Đã nhập ứng viên ${talent.name} vào phễu tuyển dụng ATS!` : `Imported ${talent.name} into active ATS pipeline!`);
  };

  const generatedEmailText = useMemo(() => {
    if (!selectedTalentForOutreach) return '';
    const t = selectedTalentForOutreach;
    if (outreachTone === 'technical') {
      return isVi
        ? `Chào ${t.name},\n\nMình theo dõi dự án mã nguồn mở "${t.openSourceProject}" của bạn trên GitHub và thực sự rất ấn tượng với cách bạn tối ưu độ trễ và concurrency.\n\nBên mình đang tìm kiếm ${t.role} dẫn dắt các bài toán quy mô hàng triệu người dùng tại Tech Lab. Với nền tảng của bạn tại ${t.currentCompany}, mình tin bạn sẽ tìm thấy thử thách kỹ thuật xứng tầm cùng chế độ đãi ngộ ${t.estimatedSalaryVi}.\n\nMình rất mong có 15 phút trò chuyện cà phê công nghệ cùng bạn trong tuần này!\n\nThân mến,\nTrưởng nhóm Kỹ thuật.`
        : `Hi ${t.name},\n\nI came across your open-source project "${t.openSourceProject}" on GitHub and was thoroughly impressed by your concurrency architecture and latency optimizations.\n\nOur team is looking for a ${t.role} to lead distributed architecture challenges serving millions of users. Given your background at ${t.currentCompany}, this would be an exceptional growth opportunity with compensation around ${t.estimatedSalaryEn}.\n\nWould you be open for a brief 15-minute technical chat this week?\n\nBest regards,\nEngineering Team Lead.`;
    } else if (outreachTone === 'visionary') {
      return isVi
        ? `Chào ${t.name},\n\nĐội ngũ chúng mình đang kiến tạo nền tảng công nghệ thế hệ mới và nhận thấy phong cách giải quyết bài toán của bạn qua dự án ${t.openSourceProject} hoàn toàn phù hợp với DNA của đội ngũ.\n\nChúng mình muốn mời bạn đồng hành ở vai trò ${t.role} với toàn quyền quyết định kiến trúc kỹ thuật. Hãy cùng chúng mình định hình tương lai công nghệ nhé!`
        : `Hi ${t.name},\n\nWe are building the next-generation AI infrastructure and your work on ${t.openSourceProject} perfectly resonates with our high-autonomy engineering culture. We would love to discuss a pivotal ${t.role} opportunity where you have end-to-end architectural ownership!`;
    } else {
      return isVi
        ? `Chào ${t.name}, mình thấy profile ấn tượng của bạn với các dự án ${t.skills.slice(0, 3).join(', ')}. Đội ngũ bên mình đang có bài toán rất thú vị về scale hệ thống và rất muốn kết nối cùng bạn!`
        : `Hey ${t.name}, love your background with ${t.skills.slice(0, 3).join(', ')}. We have exciting scaling challenges and would love to connect over coffee!`;
    }
  }, [selectedTalentForOutreach, outreachTone, isVi]);

  const handleCopyOutreachEmail = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedEmailText);
      }
    } catch {
      // Fallback or ignore in headless browser test environments
    }
    setIsCopiedEmail(true);
    setTimeout(() => setIsCopiedEmail(false), 2000);
    onShowToast(isVi ? 'Đã sao chép email tiếp cận cá nhân hóa!' : 'Copied personalized outreach email!');
  };

  return (
    <div data-testid="ai-talent-sourcing-section" className="space-y-6">
      
      {/* Sourcing Hub Hero & Search Engine Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black">
              <Compass className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>{isVi ? 'AI PASSIVE TALENT HEADHUNTER' : 'AI TALENT SOURCING RADAR'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isVi ? 'Săn Nhân Tài Bị Động & Kỹ Sư Mã Nguồn Mở' : 'Passive Talent Sourcing & Open Source Headhunter'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isVi 
                ? 'Tìm kiếm kỹ sư tài năng thông qua đóng góp GitHub, kiến trúc mã nguồn và đánh giá sẵn sàng chuyển việc bằng AI.' 
                : 'Discover high-impact engineers verified through GitHub repositories and predictive talent readiness.'}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>{isVi ? 'Quét 12,000+ GitHub & Tech Profiles' : '12,000+ Verified Tech Profiles'}</span>
          </div>
        </div>

        {/* Search Input & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Query input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              data-testid="input-sourcing-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isVi ? 'Tìm theo kỹ năng, tên, repo GitHub (VD: Rust, PyTorch, Kafka)...' : 'Search by skill, repo, keyword (e.g. Rust, PyTorch, vLLM)...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Domain Filter */}
          <div className="md:col-span-3">
            <select
              value={domainFilter}
              data-testid="select-sourcing-domain"
              onChange={(e) => setDomainFilter(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">{isVi ? 'Tất cả chuyên môn' : 'All Domains'}</option>
              <option value="infrastructure">{isVi ? 'Hạ tầng & Phân tán (Rust, K8s)' : 'Infrastructure & Distributed'}</option>
              <option value="ai">{isVi ? 'AI & LLM Systems (PyTorch, CUDA)' : 'AI & LLM Architecture'}</option>
              <option value="frontend">{isVi ? 'Frontend & WebAssembly (React 19)' : 'Frontend & WebAssembly'}</option>
            </select>
          </div>

          {/* Readiness Filter */}
          <div className="md:col-span-3">
            <select
              value={readinessFilter}
              data-testid="select-sourcing-readiness"
              onChange={(e) => setReadinessFilter(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">{isVi ? 'Mọi mức độ sẵn sàng' : 'All Readiness Levels'}</option>
              <option value="High">{isVi ? '⚡ Đang tích cực quan tâm (High)' : '⚡ Actively Open (High)'}</option>
            </select>
          </div>
        </div>

      </div>

      {/* Sourced Talent Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTalents.map((talent) => {
          const isImported = importedIds.includes(talent.id);

          return (
            <div
              key={talent.id}
              data-testid={`talent-card-${talent.id}`}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {talent.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {talent.matchScore}% Match
                      </span>
                      {talent.switchReadiness === 'High' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 fill-current" />
                          <span>{isVi ? 'Sẵn sàng chuyển' : 'Open'}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {talent.role}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{talent.currentCompany}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{talent.location}</span>
                      </span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">
                      {isVi ? talent.estimatedSalaryVi : talent.estimatedSalaryEn}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {talent.yearsOfExp} {isVi ? 'năm K/nghiệm' : 'yrs exp'}
                    </span>
                  </div>
                </div>

                {/* Open Source Highlight Box */}
                <div className="p-3 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{talent.openSourceProject}</span>
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold text-[10px]">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{talent.githubStars} stars</span>
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
                    {isVi ? talent.summaryVi : talent.summaryEn}
                  </p>
                </div>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {talent.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px] border border-slate-200/80 dark:border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  data-testid={`btn-outreach-email-${talent.id}`}
                  onClick={() => setSelectedTalentForOutreach(talent)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{isVi ? 'Viết Email Tiếp Cận AI' : 'AI Cold Outreach'}</span>
                </button>

                <button
                  type="button"
                  data-testid={`btn-import-talent-${talent.id}`}
                  disabled={isImported}
                  onClick={() => handleImportToPipeline(talent)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isImported
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft active:scale-95'
                  }`}
                >
                  {isImported ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isVi ? 'Đã Nhập Vào ATS' : 'Imported'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Nhập Vào Pipeline' : 'Import to ATS'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* AI Cold Outreach Generator Drawer / Modal */}
      {selectedTalentForOutreach && (
        <div 
          data-testid="outreach-email-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-soft-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isVi ? `Email Tiếp Cận Cá Nhân Hóa: ${selectedTalentForOutreach.name}` : `Personalized Outreach: ${selectedTalentForOutreach.name}`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isVi ? 'Tự động cá nhân hóa dựa trên dự án GitHub và kinh nghiệm' : 'Personalized based on open source repos and tech stack'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTalentForOutreach(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">{isVi ? 'Định hướng văn phong email' : 'Email Tone & Persona'}</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['technical', 'visionary', 'casual'] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    data-testid={`btn-tone-${tone}`}
                    onClick={() => setOutreachTone(tone)}
                    className={`py-2 px-3 rounded-xl font-bold transition-all capitalize cursor-pointer ${
                      outreachTone === tone
                        ? 'bg-indigo-600 text-white shadow-soft-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {tone === 'technical' ? (isVi ? '🔬 Kỹ thuật & Đồng cấp' : 'Technical') :
                     tone === 'visionary' ? (isVi ? '🚀 Tầm nhìn & Tự chủ' : 'Visionary') :
                     (isVi ? '☕ Thân mật & Kết nối' : 'Casual')}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Generated Email Body */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Nội dung thư tiếp cận (Generated by Gemini 2.0):</span>
              <p className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {generatedEmailText}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setSelectedTalentForOutreach(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>

              <button
                type="button"
                data-testid="btn-copy-outreach-email"
                onClick={handleCopyOutreachEmail}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition-all cursor-pointer"
              >
                {isCopiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedEmail ? (isVi ? 'Đã sao chép email!' : 'Copied!') : (isVi ? 'Sao chép văn bản' : 'Copy Email Text')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
