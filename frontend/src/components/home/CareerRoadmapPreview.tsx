import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ArrowRight, 
  Layers,
  ChevronRight,
  GraduationCap,
  Target,
  Zap,
  Calendar,
  Download,
  X,
  Award,
  Check,
  Loader2,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MOCK_CAREER_ROADMAPS } from '../../data/mockData';

export const CareerRoadmapPreview: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [selectedRoadmapIdx, setSelectedRoadmapIdx] = useState(0);
  const currentRoadmap = MOCK_CAREER_ROADMAPS[selectedRoadmapIdx] || MOCK_CAREER_ROADMAPS[0];

  // Custom AI Roadmap Generator modal states
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [targetCareerLevel, setTargetCareerLevel] = useState<'senior_fullstack' | 'ai_engineer' | 'tech_lead' | 'devops_cloud'>('senior_fullstack');
  const [weeklyHours, setWeeklyHours] = useState<number>(8);
  const [isSynthesizingPlan, setIsSynthesizingPlan] = useState<boolean>(false);
  const [generatedCustomPlan, setGeneratedCustomPlan] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGenerateCustomPlan = () => {
    setIsSynthesizingPlan(true);
    setGeneratedCustomPlan(null);

    setTimeout(() => {
      setIsSynthesizingPlan(false);
      const isVi = language === 'vi';
      const plans = {
        senior_fullstack: {
          roleTitle: isVi ? 'Senior Fullstack Software Architect' : 'Senior Fullstack Software Architect',
          timelineWeeks: Math.round(120 / weeklyHours),
          currentIncome: '30 - 40 Triệu/tháng ($1,300 - $1,700)',
          projectedIncome: '65 - 85 Triệu/tháng ($2,800 - $3,600)',
          growthPercent: '+115%',
          phases: [
            {
              phase: 'Giai đoạn 1 (Tuần 1 - 4)',
              phaseEn: 'Phase 1 (Weeks 1 - 4)',
              focus: isVi ? 'Củng cố Core Frontend & Tối ưu hiệu năng React 19' : 'Core Frontend & React 19 Optimization',
              topics: ['React 19 Server Components', 'Fiber Reconciliation & Profiling', 'Web Vitals & Bundle Splitting']
            },
            {
              phase: 'Giai đoạn 2 (Tuần 5 - 9)',
              phaseEn: 'Phase 2 (Weeks 5 - 9)',
              focus: isVi ? 'Kiến trúc Microservices chịu tải cao (Golang/Spring Boot & Kafka)' : 'High-Throughput Microservices (Go/Spring & Kafka)',
              topics: ['Event-Driven Architecture', 'Distributed Caching với Redis Cluster', 'Database Sharding & Query Optimization']
            },
            {
              phase: 'Giai đoạn 3 (Tuần 10 - 14)',
              phaseEn: 'Phase 3 (Weeks 10 - 14)',
              focus: isVi ? 'System Design, CI/CD Cloud & Luyện phỏng vấn cấp Lead' : 'System Design, Cloud DevOps & Lead Interview Prep',
              topics: ['High Availability 99.99%', 'Docker & Kubernetes Orchestration', 'STAR Interview Leadership Simulator']
            }
          ]
        },
        ai_engineer: {
          roleTitle: isVi ? 'Senior AI / Generative AI Engineer' : 'Senior Generative AI Engineer',
          timelineWeeks: Math.round(140 / weeklyHours),
          currentIncome: '32 - 42 Triệu/tháng ($1,400 - $1,800)',
          projectedIncome: '75 - 95 Triệu/tháng ($3,200 - $4,100)',
          growthPercent: '+135%',
          phases: [
            {
              phase: 'Giai đoạn 1 (Tuần 1 - 4)',
              phaseEn: 'Phase 1 (Weeks 1 - 4)',
              focus: isVi ? 'Nền tảng Deep Learning & PyTorch nâng cao' : 'Deep Learning Fundamentals & Advanced PyTorch',
              topics: ['Transformer Architecture from Scratch', 'Tensor Optimizations', 'FastAPI Microservices for AI Serving']
            },
            {
              phase: 'Giai đoạn 2 (Tuần 5 - 10)',
              phaseEn: 'Phase 2 (Weeks 5 - 10)',
              focus: isVi ? 'RAG Nâng cao, Vector Databases & Fine-tuning LLMs' : 'Advanced RAG, Vector DBs & LLM Fine-Tuning',
              topics: ['Hybrid Vector Search (Qdrant/Milvus)', 'LoRA / QLoRA Fine-tuning', 'LangChain & LlamaIndex Production Pipelines']
            },
            {
              phase: 'Giai đoạn 3 (Tuần 11 - 16)',
              phaseEn: 'Phase 3 (Weeks 11 - 16)',
              focus: isVi ? 'Tối ưu suy luận Inference (vLLM/TensorRT) & AI Agentic Workflows' : 'Inference Optimization (vLLM) & Agentic Workflows',
              topics: ['vLLM & PagedAttention Deployment', 'Multi-Agent Orchestration', 'Cost & Latency Benchmarking']
            }
          ]
        },
        tech_lead: {
          roleTitle: isVi ? 'Engineering Manager / Technical Lead' : 'Technical Lead / Engineering Manager',
          timelineWeeks: Math.round(110 / weeklyHours),
          currentIncome: '45 - 55 Triệu/tháng ($1,900 - $2,300)',
          projectedIncome: '80 - 110 Triệu/tháng ($3,400 - $4,700)',
          growthPercent: '+85%',
          phases: [
            {
              phase: 'Giai đoạn 1 (Tuần 1 - 4)',
              phaseEn: 'Phase 1 (Weeks 1 - 4)',
              focus: isVi ? 'Chiến lược Kiến trúc Công nghệ & Quản trị Nợ Kỹ Thuật' : 'Tech Architecture Strategy & Technical Debt Governance',
              topics: ['RFC/ADR Architectural Decision Records', 'Team Code Review Culture', 'Engineering Metrics (DORA)']
            },
            {
              phase: 'Giai đoạn 2 (Tuần 5 - 9)',
              phaseEn: 'Phase 2 (Weeks 5 - 9)',
              focus: isVi ? 'Kỹ năng Quản trị Đội ngũ, 1-on-1s & Mentorship' : 'People Management, 1-on-1s & Engineering Mentorship',
              topics: ['Conflict Resolution & Alignment', 'OKR Alignment with Business KPIs', 'Hiring & Technical Interview Standards']
            },
            {
              phase: 'Giai đoạn 3 (Tuần 10 - 13)',
              phaseEn: 'Phase 3 (Weeks 10 - 13)',
              focus: isVi ? 'Lãnh đạo Chuyển đổi Số & Thuyết trình Ban Giám Đốc' : 'Digital Transformation & Executive Stakeholder Pitching',
              topics: ['Executive Communication', 'Cost Budgeting & Cloud Governance', 'Cross-functional Roadmap Delivery']
            }
          ]
        },
        devops_cloud: {
          roleTitle: isVi ? 'Staff Cloud DevOps / Platform Engineer' : 'Staff Cloud Platform & DevOps Engineer',
          timelineWeeks: Math.round(130 / weeklyHours),
          currentIncome: '35 - 45 Triệu/tháng ($1,500 - $1,900)',
          projectedIncome: '70 - 90 Triệu/tháng ($3,000 - $3,850)',
          growthPercent: '+105%',
          phases: [
            {
              phase: 'Giai đoạn 1 (Tuần 1 - 4)',
              phaseEn: 'Phase 1 (Weeks 1 - 4)',
              focus: isVi ? 'Hạ tầng Đám mây dạng Mã nguồn (Terraform & AWS)' : 'Infrastructure as Code (Terraform & AWS/GCP)',
              topics: ['Modular Terraform Architecture', 'Multi-Account AWS Strategy', 'Zero-Trust IAM Policies']
            },
            {
              phase: 'Giai đoạn 2 (Tuần 5 - 9)',
              phaseEn: 'Phase 2 (Weeks 5 - 9)',
              focus: isVi ? 'Chuyên sâu Kubernetes, Helm & GitOps (ArgoCD)' : 'Advanced Kubernetes, Helm & GitOps (ArgoCD)',
              topics: ['Multi-Cluster K8s Management', 'Canary & Blue/Green Deployments', 'Custom Resource Definitions (CRDs)']
            },
            {
              phase: 'Giai đoạn 3 (Tuần 10 - 15)',
              phaseEn: 'Phase 3 (Weeks 10 - 15)',
              focus: isVi ? 'Quan sát Hệ thống Toàn diện (Observability & Chaos Eng)' : 'Full-Stack Observability & Chaos Engineering',
              topics: ['Prometheus, Grafana & OpenTelemetry', 'Chaos Mesh & Resiliency Testing', 'FinOps Cloud Cost Optimization']
            }
          ]
        }
      };

      setGeneratedCustomPlan(plans[targetCareerLevel]);
      showToast(isVi ? '🎉 Đã xây dựng thành công lộ trình thăng tiến cá nhân hóa từ AI!' : '🎉 AI personalized career roadmap synthesized successfully!');
    }, 600);
  };

  const tracks = [
    { title: t.roadmap.track1Title, duration: t.roadmap.track1Duration, match: '95%' },
    { title: t.roadmap.track2Title, duration: t.roadmap.track2Duration, match: '92%' },
    { title: t.roadmap.track3Title, duration: t.roadmap.track3Duration, match: '88%' }
  ];

  return (
    <section id="roadmap" className="scroll-mt-24 py-20 sm:py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold tracking-wide shadow-soft-xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.roadmap.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.roadmap.headline}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.roadmap.subtitle}
          </p>
        </div>

        {/* Interactive Track Selector (Clean 1-row layout) */}
        <div className="flex flex-wrap lg:flex-nowrap justify-center items-center gap-2.5 sm:gap-3 max-w-5xl mx-auto">
          {tracks.map((track, i) => (
            <button
              key={track.title}
              type="button"
              onClick={() => setSelectedRoadmapIdx(i)}
              className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs font-bold border transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95 whitespace-nowrap shrink-0 ${
                selectedRoadmapIdx === i
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-500 shadow-soft-md scale-[1.02]'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{track.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedRoadmapIdx === i ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {track.duration}
              </span>
            </button>
          ))}
        </div>

        {/* Roadmap Display Card */}
        <div className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-soft-xl dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] max-w-5xl mx-auto">
          
          {/* Header Info with Salary Trajectory */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-8 border-b border-slate-200/90 dark:border-slate-800 gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.roadmap.targetTitle.replace(/:+$/, '')}:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                  {isEn ? '+65% Income Growth' : '+65% Thu nhập'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {isEn && (currentRoadmap as any).targetRoleEn ? (currentRoadmap as any).targetRoleEn : currentRoadmap.targetRole}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Expected compensation: $2,800 - $3,800/mo • Market demand: Very High 🔥' : 'Mức lương dự kiến: 65 - 90 Triệu/tháng ($2,800 - $3,800) • Nhu cầu tuyển dụng: Rất cao 🔥'}
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft-xs">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.roadmap.readinessLabel.replace(/:+$/, '')}:</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{currentRoadmap.matchCurrent}% → {currentRoadmap.matchTarget}%</div>
                <div className="w-28 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1.5 ml-auto">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${currentRoadmap.matchTarget}%` }} />
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-soft-xs shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Stepper Timeline with Glowing Connecting Line */}
          <div className="py-8 space-y-6">
            {currentRoadmap.milestones.map((m, idx) => (
              <div key={m.step} className="flex items-start gap-4 sm:gap-6 group">
                
                {/* Step Indicator Column with gradient track */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black shadow-soft-sm transition-all duration-300 group-hover:scale-110 ${
                    m.status === 'completed'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                      : m.status === 'in-progress'
                      ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/80 shadow-[0_0_15px_rgba(6,182,212,0.35)] animate-pulse-subtle'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                  }`}>
                    {m.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-white" /> : `0${m.step}`}
                  </div>
                  {idx < currentRoadmap.milestones.length - 1 && (
                    <div className="w-0.5 h-16 bg-gradient-to-b from-emerald-500 via-teal-400 to-slate-200 dark:to-slate-800 my-1 group-hover:scale-y-105 transition-transform" />
                  )}
                </div>

                {/* Milestone Details */}
                <div className="flex-1 bg-white dark:bg-slate-800/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft-sm space-y-3.5 hover:border-emerald-400 dark:hover:border-emerald-500/60 hover:shadow-soft-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                        {isEn && (m as any).titleEn ? (m as any).titleEn : m.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                          : m.status === 'in-progress'
                          ? 'bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                        {m.status === 'completed' ? (isEn ? 'Completed' : 'Đã hoàn thành') : m.status === 'in-progress' ? (isEn ? 'In Progress' : 'Đang thực hiện') : (isEn ? 'Next Up' : 'Mục tiêu tới')}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {isEn ? ((m as any).estimatedHoursEn || m.estimatedHours.replace(/Giờ/gi, 'Hours')) : m.estimatedHours}
                    </span>
                  </div>

                  {/* Skills tags in this step */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.roadmap.skillsGoalLabel.replace(/:+$/, '')}:</span>
                    {m.skills.map((skill) => (
                      <span
                        key={skill}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                          m.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                            : m.status === 'in-progress'
                            ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Roadmap Bottom Action */}
          <div className="pt-6 border-t border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              {t.roadmap.disclaimer}
            </p>
            <button
              type="button"
              data-testid="open-roadmap-generator-btn"
              onClick={() => {
                setIsGeneratorModalOpen(true);
                if (!generatedCustomPlan) {
                  handleGenerateCustomPlan();
                }
              }}
              className="ai-gradient-btn px-6 py-3 rounded-xl text-xs font-bold shadow-soft flex items-center gap-2 cursor-pointer shrink-0 overflow-hidden relative active:scale-95 group"
            >
              <div className="shimmer-sweep" />
              <Sparkles className="w-4 h-4 text-emerald-200 group-hover:scale-125 transition-transform" />
              <span>{t.roadmap.btnCreateRoadmap}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white text-xs font-bold shadow-soft-xl border border-slate-700/80 backdrop-blur-md animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Custom AI Career Roadmap & Skill Gap Planner Modal */}
      {isGeneratorModalOpen && (
        <div 
          data-testid="roadmap-generator-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-soft-xs">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{language === 'vi' ? 'Thiết Kế Lộ Trình Thăng Tiến AI (Gemini 2.0)' : 'AI Personalized Career Roadmap Planner'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Personalized
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'vi' 
                      ? 'Lập kế hoạch từng giai đoạn học tập, bù đắp lỗ hổng kỹ năng và lộ trình nhảy vọt thu nhập.' 
                      : 'Stage-by-stage learning trajectory to bridge competency gaps and maximize market compensation.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                data-testid="close-roadmap-modal-btn"
                onClick={() => setIsGeneratorModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title={language === 'vi' ? 'Đóng' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Parameters Selector Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    {language === 'vi' ? '1. Chọn Mục tiêu Thăng tiến & Vai trò Hướng tới:' : '1. Select Target Career Horizon & Destination Role:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'senior_fullstack', labelVi: '💻 Senior Fullstack', labelEn: '💻 Senior Fullstack' },
                      { id: 'ai_engineer', labelVi: '🤖 Generative AI Eng', labelEn: '🤖 Generative AI Eng' },
                      { id: 'tech_lead', labelVi: '👑 Technical Lead', labelEn: '👑 Technical Lead' },
                      { id: 'devops_cloud', labelVi: '☁️ Cloud Platform Lead', labelEn: '☁️ Cloud Platform Lead' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setTargetCareerLevel(opt.id as any);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                          targetCareerLevel === opt.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-soft-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                        }`}
                      >
                        {language === 'vi' ? opt.labelVi : opt.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {language === 'vi' ? '2. Thời gian đầu tư mỗi tuần:' : '2. Weekly Dedicated Time:'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[6, 8, 12, 16].map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => setWeeklyHours(hrs)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            weeklyHours === hrs
                              ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {hrs}h/{language === 'vi' ? 'tuần' : 'wk'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    data-testid="generate-roadmap-btn"
                    disabled={isSynthesizingPlan}
                    onClick={handleGenerateCustomPlan}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-60"
                  >
                    {isSynthesizingPlan ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{language === 'vi' ? 'Đang tổng hợp...' : 'Synthesizing...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{language === 'vi' ? 'Tái tạo lộ trình AI' : 'Generate AI Plan'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Plan Content */}
              {generatedCustomPlan && (
                <div data-testid="generated-roadmap-plan" className="space-y-5 animate-fade-in">
                  
                  {/* Trajectory Header Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                          Target Destination
                        </span>
                        <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                          {generatedCustomPlan.growthPercent} {language === 'vi' ? 'Tăng trưởng thu nhập' : 'Income Upside'}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        {generatedCustomPlan.roleTitle}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'vi' 
                          ? `Thời gian hoàn thành ước tính: ${generatedCustomPlan.timelineWeeks} tuần (${weeklyHours}h/tuần).` 
                          : `Estimated completion timeline: ${generatedCustomPlan.timelineWeeks} weeks (${weeklyHours}h/wk).`}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/90 dark:bg-slate-800/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-soft-xs shrink-0">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">{language === 'vi' ? 'Hiện tại' : 'Current'}</span>
                        <strong className="text-xs text-slate-600 dark:text-slate-300 font-bold">{generatedCustomPlan.currentIncome}</strong>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 block">{language === 'vi' ? 'Mục tiêu sau khóa' : 'Projected'}</span>
                        <strong className="text-xs text-emerald-600 dark:text-emerald-400 font-black">{generatedCustomPlan.projectedIncome}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 3 Step Trajectory Cards */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{language === 'vi' ? '3 Giai đoạn Bứt phá Năng lực & Dự án Thực chiến' : '3 Execution Phases & Milestone Projects'}</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {generatedCustomPlan.phases.map((ph: any, i: number) => (
                        <div 
                          key={i} 
                          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 inline-block">
                              {language === 'vi' ? ph.phase : ph.phaseEn}
                            </span>
                            <h6 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                              {ph.focus}
                            </h6>
                          </div>

                          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                            {ph.topics.map((t: string, j: number) => (
                              <div key={j} className="flex items-start gap-1">
                                <span className="text-emerald-500 font-bold">•</span>
                                <span>{t}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="save-custom-roadmap-btn"
                  onClick={() => showToast(language === 'vi' ? '💾 Đã lưu lộ trình thăng tiến vào mục Hồ sơ cá nhân!' : '💾 Saved career roadmap to your profile!')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-soft cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Lưu vào Hồ sơ' : 'Save to Profile'}</span>
                </button>

                <button
                  type="button"
                  data-testid="export-roadmap-pdf-btn"
                  onClick={() => showToast(language === 'vi' ? '📄 Đã tải xuống file kế hoạch lộ trình (PDF)!' : '📄 Downloaded career roadmap plan (PDF)!')}
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Xuất PDF' : 'Export PDF'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsGeneratorModalOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
