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
  Check,
  UploadCloud,
  FileCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
  X,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  PlayCircle,
  Loader2,
  ThumbsUp,
  TrendingUp,
  RefreshCw,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { MOCK_JOBS, type Job } from '../../data/mockData';
import { AiJobRadarSection } from './AiJobRadarSection';
import { SkillAssessmentSection } from './SkillAssessmentSection';
import { AiVoiceInterviewModal } from '../interview/AiVoiceInterviewModal';

export interface InterviewQuestion {
  id: string;
  category: 'Technical' | 'System Architecture' | 'Behavioral (STAR)' | 'Culture Fit';
  categoryLabelVi: string;
  categoryLabelEn: string;
  question: string;
  hint: string;
  sampleAnswer: string;
}

export interface InterviewEvaluation {
  score: number;
  starBreakdown: {
    situation: number;
    task: number;
    action: number;
    result: number;
  };
  strengths: string[];
  improvements: string[];
  recommendation: string;
}

export interface CvDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  isPrimary: boolean;
  atsScore: number;
  tags: string[];
  summary: string;
  skillsExtracted: string[];
}

const INITIAL_CVS: CvDocument[] = [
  {
    id: 'cv-1',
    name: 'Vu_Minh_Khang_Senior_Fullstack_2026.pdf',
    size: '428 KB',
    uploadedAt: '02/10/2026',
    isPrimary: true,
    atsScore: 96,
    tags: ['Fullstack', 'React & Spring Boot', 'ATS 96%'],
    summary: 'Hồ sơ chuyên môn tối ưu cho các vị trí Senior Fullstack / Tech Lead với 4+ năm kinh nghiệm React, TypeScript, Spring Boot, Microservices và tối ưu chịu tải cao.',
    skillsExtracted: ['React', 'TypeScript', 'Java', 'Spring Boot', 'MySQL', 'Docker', 'AWS', 'Redis', 'Kafka']
  },
  {
    id: 'cv-2',
    name: 'Vu_Minh_Khang_AI_Specialized_Resume.pdf',
    size: '392 KB',
    uploadedAt: '28/09/2026',
    isPrimary: false,
    atsScore: 98,
    tags: ['AI & GenAI', 'Python & LLM', 'ATS 98%'],
    summary: 'Hồ sơ chuyên biệt định hướng Kỹ sư AI / Deep Learning với các dự án RAG, Fine-tuning mô hình ngôn ngữ lớn (LLM), LangChain và Computer Vision.',
    skillsExtracted: ['Python', 'PyTorch', 'TensorFlow', 'LLM', 'LangChain', 'RAG', 'Vector DB', 'FastAPI', 'HuggingFace']
  },
  {
    id: 'cv-3',
    name: 'Vu_Minh_Khang_Cloud_DevOps_Resume.docx',
    size: '315 KB',
    uploadedAt: '15/09/2026',
    isPrimary: false,
    atsScore: 93,
    tags: ['DevOps', 'Kubernetes & AWS', 'ATS 93%'],
    summary: 'Hồ sơ chuyên môn về hạ tầng đám mây Cloud DevOps, thiết lập CI/CD pipeline tự động hóa, Kubernetes cluster và quan sát hệ thống (Observability).',
    skillsExtracted: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD GitHub Actions', 'Prometheus', 'Grafana', 'Linux']
  }
];

const generateMockQuestionsForRole = (roleTitle: string, company: string, isVi: boolean): InterviewQuestion[] => {
  return [
    {
      id: 'q1',
      category: 'Technical',
      categoryLabelVi: 'Kỹ thuật chuyên sâu & Hiệu năng',
      categoryLabelEn: 'Technical & Performance Optimization',
      question: isVi 
        ? `Với vai trò ${roleTitle} tại ${company}, bạn sẽ tối ưu hóa kiến trúc ứng dụng như thế nào khi gặp tình huống tải cao (High Concurrency > 10,000 req/s), đồng thời kiểm soát độ trễ P99 dưới 150ms?`
        : `As a ${roleTitle} at ${company}, how would you architect and optimize your application under heavy load (>10,000 req/s) while keeping P99 latency below 150ms?`,
      hint: isVi 
        ? 'Tập trung vào: Multi-level Caching (Redis/In-memory), Connection Pooling, Asynchronous Processing (Message Queue), Database Indexing & Query Sharding.'
        : 'Focus on: Multi-level caching (Redis/In-memory), Connection Pooling, Asynchronous processing (Message queues), and DB Indexing & Partitioning.',
      sampleAnswer: isVi
        ? `[Tình huống - S]: Tại hệ thống microservice xử lý thanh toán và đơn hàng với lưu lượng 15,000 req/s.\n[Nhiệm vụ - T]: Cần giảm P99 latency từ 850ms xuống dưới 150ms và loại bỏ hiện tượng tắc nghẽn DB pool.\n[Hành động - A]: Tôi áp dụng chiến lược Caching 2 lớp: L1 In-Memory (Caffeine) với TTL ngắn cho hot data, L2 Redis Cluster hỗ trợ phân tải. Thiết lập Asynchronous worker qua Apache Kafka để xử lý ghi nhận phụ, và bổ sung Composite Indexes trên các bảng giao dịch lớn.\n[Kết quả - R]: P99 latency giảm còn 112ms, throughput tăng gấp 3.2 lần, CPU utilization trên database giảm 42%.`
        : `[Situation]: In a high-traffic microservices cluster serving 15,000 req/s during peak campaigns.\n[Task]: Needed to reduce P99 response latency from 850ms to sub-150ms and eliminate database connection pool starvation.\n[Action]: Implemented 2-tier caching with L1 in-memory Caffeine cache and L2 Redis cluster with Redis pipeline. Offloaded heavy analytical logging to Kafka consumers asynchronously, and optimized database indexing strategy.\n[Result]: P99 latency dropped to 112ms, throughput scaled 3.2x, and DB CPU load dropped by 42%.`
    },
    {
      id: 'q2',
      category: 'System Architecture',
      categoryLabelVi: 'Kiến trúc phân tán & Phục hồi lỗi',
      categoryLabelEn: 'Distributed Architecture & Fault Tolerance',
      question: isVi
        ? `Trong hệ thống của ${company}, nếu một third-party service hoặc downstream microservice phản hồi chậm hoặc sập hoàn toàn, bạn thiết kế cơ chế phòng vệ nào để ngăn chặn Cascade Failure?`
        : `In ${company}'s ecosystem, if a downstream dependency or third-party service times out or crashes, what fault-tolerance patterns do you implement to prevent cascade failure?`,
      hint: isVi
        ? 'Đề cập đến Circuit Breaker (Resilience4j / Istio), Fallback Graceful Degradation, Rate Limiting & Backpressure, Retry with Exponential Backoff + Jitter.'
        : 'Discuss Circuit Breaker patterns, Fallback graceful degradation, Rate Limiting & Backpressure, and Exponential Backoff with Jitter.',
      sampleAnswer: isVi
        ? `[Tình huống - S]: Cổng thanh toán bên thứ ba gặp sự cố gián đoạn chập chờn, khiến các thread pool của gateway bị cạn kiệt.\n[Nhiệm vụ - T]: Bảo vệ tính khả dụng 99.99% của core application và tránh crash toàn bộ hệ thống.\n[Hành động - A]: Tôi tích hợp Circuit Breaker với ngưỡng lỗi 30% để ngắt mạch nhanh (fast-fail), kích hoạt Fallback Cache phục vụ dữ liệu đã đọc, đồng thời áp dụng Exponential Backoff with Jitter và Dead Letter Queue (DLQ) cho các tác vụ cần retry.\n[Kết quả - R]: Hệ thống duy trì uptime 99.98% xuyên suốt thời gian đối tác gặp sự cố, không xảy ra cascade failure.`
        : `[Situation]: A third-party credit verification partner experienced severe intermittent degradation, exhausting gateway worker pools.\n[Task]: Prevent cascade system-wide outages and ensure 99.99% critical API uptime.\n[Action]: Configured Circuit Breakers with a 30% failure rate threshold for fast-failing, activated read-only cached fallbacks, and enqueued async transactions with exponential backoff and Dead Letter Queue (DLQ).\n[Result]: Maintained 99.98% platform uptime throughout the incident with zero cascading failures.`
    },
    {
      id: 'q3',
      category: 'Behavioral (STAR)',
      categoryLabelVi: 'Hành vi STAR & Kỹ năng làm việc nhóm',
      categoryLabelEn: 'Behavioral STAR & Collaboration',
      question: isVi
        ? `Hãy kể về một lần bạn và Tech Lead hoặc Product Owner có sự bất đồng quan điểm lớn về kiến trúc kỹ thuật hoặc ưu tiên trả nợ công nghệ (Technical Debt). Bạn đã giải quyết thế nào để đạt được tiếng nói chung?`
        : `Describe a situation where you had a strong technical disagreement with a Tech Lead or Product Owner regarding technical debt vs feature deadlines. How did you resolve it?`,
      hint: isVi
        ? 'Áp dụng mô hình STAR: Trình bày khách quan bằng số liệu, rủi ro cụ thể, đề xuất giải pháp dung hòa (Phase-by-phase rollout) thay vì phản đối suông.'
        : 'Use the STAR format: Back arguments with data, highlight business risks, propose balanced trade-offs rather than blunt opposition.',
      sampleAnswer: isVi
        ? `[Tình huống - S]: Đội ngũ cần ra mắt tính năng đặt đơn mới trong 2 tuần, nhưng codebase module thanh toán đang có nợ kỹ thuật lớn gây rủi ro thất thoát dữ liệu.\n[Nhiệm vụ - T]: Tôi cần thuyết phục Product Owner chấp nhận dành 3 ngày để refactor module mà không làm vỡ release milestone quan trọng.\n[Hành động - A]: Tôi chuẩn bị báo cáo phân tích rủi ro định lượng, chứng minh rằng nợ kỹ thuật này đã gây ra 5 hotfixes trong tháng trước. Tôi đề xuất giải pháp chia nhỏ (Strangler Pattern): refactor 60% phần core song song viết unit test tự động, phần UI vẫn giữ tiến độ.\n[Kết quả - R]: PO đồng thuận; bản release mới ra mắt đúng hạn với 0 lỗi phát sinh và giảm 80% thời gian bảo trì ở các sprint sau.`
        : `[Situation]: Product demanded a new checkout feature within 2 weeks, but the legacy order module carried severe technical debt risking transaction drops.\n[Task]: I needed to persuade the Product Owner to allocate 3 days for refactoring without compromising release delivery.\n[Action]: I compiled empirical defect metrics showing 5 critical hotfixes in the previous month. I proposed a phased Strangler Pattern: refactor core transactional paths alongside automated tests while keeping the frontend delivery cadence.\n[Result]: The PO agreed; we delivered on schedule with zero production bugs and reduced ongoing sprint maintenance overhead by 80%.`
    }
  ];
};

interface ProfilePageProps {
  onBackToHome: () => void;
  onSelectJob?: (jobId: string) => void;
  onRequestLogin?: () => void;
  allJobs?: Job[];
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBackToHome, onRequestLogin, allJobs }) => {
  const { user, logout, switchRole, savedJobIds, toggleSaveJob, appliedJobs, applyJob, updateProfile } = useAuth();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'skills' | 'applications' | 'saved' | 'radar' | 'settings'>('overview');
  
  // Local edit states
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user?.bio || '');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showAddSkillForm, setShowAddSkillForm] = useState(false);
  const [jobSeekingStatus, setJobSeekingStatus] = useState<'active' | 'open' | 'closed'>('active');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Merge live DB jobs with mock jobs pool so any bookmarked job is always resolvable
  const jobsPool = React.useMemo(() => {
    const list = allJobs && allJobs.length > 0 ? allJobs : [];
    const missingMocks = MOCK_JOBS.filter((mj) => !list.some((aj) => aj.id === mj.id));
    return [...list, ...missingMocks];
  }, [allJobs]);
  const savedJobsList = jobsPool.filter(job => savedJobIds.includes(job.id));

  // Multi-version CV state
  const [cvList, setCvList] = useState<CvDocument[]>(() => {
    try {
      const saved = localStorage.getItem('talentbridge_user_cvs');
      return saved ? JSON.parse(saved) : INITIAL_CVS;
    } catch {
      return INITIAL_CVS;
    }
  });
  const [previewingCv, setPreviewingCv] = useState<CvDocument | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [previewTab, setPreviewTab] = useState<'document' | 'parsed'>('document');
  const [isUploadingCv, setIsUploadingCv] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // AI Mock Interview Simulator states
  const [interviewPrepApp, setInterviewPrepApp] = useState<{ id: string; jobTitle: string; company: string } | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<InterviewEvaluation | null>(null);
  const [isVoiceInterviewActive, setIsVoiceInterviewActive] = useState<boolean>(false);

  const handleOpenInterviewPrep = (app: { id: string; jobTitle: string; company: string }) => {
    const qList = generateMockQuestionsForRole(app.jobTitle, app.company, isVi);
    setInterviewPrepApp(app);
    setInterviewQuestions(qList);
    setActiveQuestionIdx(0);
    setEvaluationResult(null);
  };

  const handleInsertSampleAnswer = () => {
    const currentQ = interviewQuestions[activeQuestionIdx];
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: currentQ.sampleAnswer
    }));
    showToast(isVi ? 'Đã điền câu trả lời mẫu chuẩn STAR từ AI!' : 'Loaded sample STAR model answer!');
  };

  const handleEvaluateAnswer = () => {
    const currentQ = interviewQuestions[activeQuestionIdx];
    const currentAns = userAnswers[currentQ?.id || ''] || '';
    if (!currentAns.trim()) {
      showToast(isVi ? 'Vui lòng nhập hoặc dán câu trả lời trước khi đánh giá!' : 'Please enter an answer before evaluating!');
      return;
    }

    setIsEvaluatingAnswer(true);
    setEvaluationResult(null);

    setTimeout(() => {
      setIsEvaluatingAnswer(false);
      const isLongEnough = currentAns.length > 80;
      const baseScore = isLongEnough ? Math.floor(Math.random() * 6 + 92) : Math.floor(Math.random() * 8 + 78);
      
      const evalData: InterviewEvaluation = {
        score: baseScore,
        starBreakdown: {
          situation: Math.min(100, baseScore + (isLongEnough ? 3 : -5)),
          task: Math.min(100, baseScore + (isLongEnough ? 2 : 2)),
          action: Math.min(100, baseScore + (isLongEnough ? 4 : -2)),
          result: Math.min(100, baseScore + (isLongEnough ? 1 : -4))
        },
        strengths: isVi ? [
          'Trình bày cấu trúc mạch lạc, nêu rõ bối cảnh kỹ thuật và quy mô lưu lượng.',
          'Các giải pháp đưa ra mang tính ứng dụng thực chiến cao, có số liệu minh chứng.',
          'Thể hiện tư duy phòng vệ hệ thống (Defensive Architecture) và kỹ năng giao tiếp chuyên nghiệp.'
        ] : [
          'Structured response clearly highlighting technical context and throughput scale.',
          'Pragmatic solutions supported by concrete metrics and architectural patterns.',
          'Exhibits solid defensive system thinking and professional team communication.'
        ],
        improvements: isVi ? [
          'Có thể bổ sung thêm giải pháp giám sát (Prometheus/Grafana Alerts) để cảnh báo sớm.',
          'Chi tiết hơn về chi phí tài nguyên (Cost Optimization) khi mở rộng phân tán.'
        ] : [
          'Consider detailing monitoring alarms (e.g. Prometheus/Grafana) for early breach detection.',
          'Elaborate further on cloud infrastructure cost implications when scaling horizontally.'
        ],
        recommendation: isVi
          ? '🌟 Đạt tiêu chuẩn phỏng vấn Senior/Lead. Câu trả lời thể hiện năng lực chuyên sâu và độ tin cậy kỹ thuật cao.'
          : '🌟 Passed Senior/Lead interview benchmark. Exhibits deep competency and reliable technical leadership.'
      };

      setEvaluationResult(evalData);
      showToast(isVi ? 'Đã hoàn tất đánh giá AI với mô hình STAR!' : 'AI Evaluation completed with STAR rubric!');
    }, 600);
  };

  React.useEffect(() => {
    try {
      localStorage.setItem('talentbridge_user_cvs', JSON.stringify(cvList));
    } catch {
      // Ignore storage errors
    }
  }, [cvList]);

  const handleSetPrimaryCv = (cvId: string) => {
    setCvList((prev) =>
      prev.map((c) => ({
        ...c,
        isPrimary: c.id === cvId
      }))
    );
    const target = cvList.find((c) => c.id === cvId);
    showToast(isVi ? `Đã đặt "${target?.name}" làm CV mặc định khi ứng tuyển nhanh!` : `Set "${target?.name}" as default 1-Click application resume!`);
  };

  const handleDeleteCv = (cvId: string) => {
    const target = cvList.find((c) => c.id === cvId);
    if (target?.isPrimary) {
      showToast(isVi ? 'Không thể gỡ CV mặc định. Vui lòng chọn CV khác làm mặc định trước.' : 'Cannot delete default CV. Please designate another primary resume first.');
      return;
    }
    setCvList((prev) => prev.filter((c) => c.id !== cvId));
    showToast(isVi ? `Đã gỡ phiên bản CV "${target?.name}".` : `Removed CV version "${target?.name}".`);
  };

  const handleSimulateUploadCv = (fileObj?: File) => {
    const fileName = fileObj ? fileObj.name : `Vu_Minh_Khang_Resume_v${cvList.length + 1}.pdf`;
    setIsUploadingCv(true);
    setUploadProgress(20);

    const timer1 = setTimeout(() => setUploadProgress(60), 300);
    const timer2 = setTimeout(() => setUploadProgress(95), 650);
    const timer3 = setTimeout(() => {
      setUploadProgress(100);
      setIsUploadingCv(false);

      const newCv: CvDocument = {
        id: `cv-${Date.now()}`,
        name: fileName,
        size: `${Math.floor(Math.random() * 100 + 340)} KB`,
        uploadedAt: new Date().toLocaleDateString('vi-VN'),
        isPrimary: false,
        atsScore: Math.floor(Math.random() * 5 + 94),
        tags: ['New Version', 'ATS Checked'],
        summary: 'Tài liệu CV mới được tải lên và phân tích tự động qua hệ thống trích xuất ATS AI TalentBridge.',
        skillsExtracted: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'System Design']
      };

      setCvList((prev) => [newCv, ...prev]);
      showToast(isVi ? `🎉 Đã tải lên và bóc tách thành công CV "${fileName}"!` : `🎉 Successfully uploaded and parsed "${fileName}"!`);
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Guests must sign in explicitly — never auto-login into a real account
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-soft-xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isVi ? 'Vui lòng đăng nhập' : 'Please sign in'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isVi
              ? 'Bạn cần đăng nhập để xem và quản lý hồ sơ cá nhân, việc đã lưu và lịch sử ứng tuyển.'
              : 'Sign in to view and manage your profile, saved jobs and application history.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <button
              type="button"
              onClick={onRequestLogin}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-soft cursor-pointer transition-all active:scale-95"
            >
              {isVi ? 'Đăng nhập' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-all"
            >
              {isVi ? 'Về trang chủ' : 'Back to home'}
            </button>
          </div>
        </div>
      </div>
    );
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
            { id: 'radar', labelVi: 'Radar Việc Làm AI', labelEn: 'AI Job Radar', icon: Radio },
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
                data-testid={`tab-profile-${tab.id}`}
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

                {/* CV Documents & Versions Management */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-500" />
                        <span>{isVi ? 'Quản lý phiên bản CV & Hồ sơ ATS' : 'CV Versions & ATS Documents'}</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isVi ? 'Quản lý nhiều phiên bản CV chuyên biệt cho từng vị trí và xem trước trực quan.' : 'Manage tailored resumes for specific roles and preview documents directly.'}
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-soft cursor-pointer transition-all self-start sm:self-auto shrink-0">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{isUploadingCv ? (isVi ? `Đang tải lên... ${uploadProgress}%` : `Uploading... ${uploadProgress}%`) : (isVi ? 'Tải lên CV mới' : 'Upload New CV')}</span>
                      <input 
                        type="file" 
                        accept=".pdf,.docx,.doc" 
                        className="hidden" 
                        disabled={isUploadingCv}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleSimulateUploadCv(file);
                          e.target.value = '';
                        }} 
                      />
                    </label>
                  </div>

                  {/* Upload Progress Bar if active */}
                  {isUploadingCv && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>{isVi ? 'Đang bóc tách kỹ năng & chấm điểm ATS...' : 'Parsing skills & computing ATS match...'}</span>
                        </span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-emerald-200/60 dark:bg-emerald-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* CV Cards List */}
                  <div className="space-y-3">
                    {cvList.map((cv) => (
                      <div 
                        key={cv.id}
                        className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                          cv.isPrimary 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-500/20' 
                            : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {cv.name}
                            </span>
                            {cv.isPrimary && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white shadow-soft-2xs">
                                {isVi ? 'Mặc định (1-Click)' : 'Primary'}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              ATS: {cv.atsScore}/100
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {cv.summary}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                            <span>{cv.size}</span>
                            <span>•</span>
                            <span>{isVi ? `Cập nhật: ${cv.uploadedAt}` : `Updated: ${cv.uploadedAt}`}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewingCv(cv);
                              setPreviewZoom(100);
                              setPreviewTab('document');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-soft-2xs"
                            title={isVi ? 'Xem trước tài liệu' : 'Preview document'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isVi ? 'Xem trước' : 'Preview'}</span>
                          </button>

                          {!cv.isPrimary ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryCv(cv.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 font-bold text-xs transition-colors cursor-pointer"
                              title={isVi ? 'Đặt làm CV mặc định' : 'Set as primary'}
                            >
                              {isVi ? 'Chọn chính' : 'Set Primary'}
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => {
                              showToast(isVi ? `Đang tải xuống tệp ${cv.name}...` : `Downloading ${cv.name}...`);
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={isVi ? 'Tải tệp' : 'Download'}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {!cv.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCv(cv.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title={isVi ? 'Xóa phiên bản này' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
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

                {/* Interactive AI Skill Assessment & Certification Section */}
                <SkillAssessmentSection
                  onBadgeEarned={(badgeTitle, score) => {
                    updateProfile({ atsScore: Math.max(user.atsScore || 90, score) });
                  }}
                  onShowToast={showToast}
                />

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

                          <div className="flex flex-wrap items-center gap-2.5">
                            <button
                              type="button"
                              data-testid="open-interview-prep-btn"
                              onClick={() => handleOpenInterviewPrep({ id: app.id, jobTitle: app.jobTitle, company: app.company })}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-soft-xs"
                              title={isVi ? 'Mở phòng luyện phỏng vấn AI cho vị trí này' : 'Practice AI interview for this role'}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                              <span>{isVi ? 'Luyện phỏng vấn AI' : 'AI Interview Prep'}</span>
                            </button>

                            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
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

            {/* TAB: AI JOB RADAR */}
            {activeTab === 'radar' && (
              <div className="space-y-6 animate-fade-in">
                <AiJobRadarSection
                  jobs={jobsPool}
                  onQuickApply={(job) => {
                    applyJob({ id: job.id, title: job.title, company: job.company });
                    showToast(
                      isVi
                        ? `🎉 Ứng tuyển thành công qua Radar AI vào vị trí ${job.title} tại ${job.company}!`
                        : `🎉 Quick application submitted via AI Radar for ${job.title} at ${job.company}!`
                    );
                  }}
                />
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

      {/* Live In-Browser CV Document Previewer Modal */}
      {previewingCv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div 
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-4xl shadow-soft-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative my-auto animate-scale-up transition-colors max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                      {previewingCv.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                      ATS: {previewingCv.atsScore}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {previewingCv.size} • {isVi ? `Định dạng chuẩn ATS • Cập nhật: ${previewingCv.uploadedAt}` : `ATS Standard Format • Updated: ${previewingCv.uploadedAt}`}
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button 
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.max(75, z - 10))}
                    className="p-1.5 hover:text-emerald-600 transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-[10px]">{previewZoom}%</span>
                  <button 
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.min(150, z + 10))}
                    className="p-1.5 hover:text-emerald-600 transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    showToast(isVi ? `Đang xuất tệp ${previewingCv.name}...` : `Exporting ${previewingCv.name}...`);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-soft transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isVi ? 'Tải PDF' : 'Download'}</span>
                </button>

                <button
                  type="button"
                  aria-label="Close CV preview"
                  onClick={() => setPreviewingCv(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-tab Switcher (Visual Sheet vs Extracted ATS Data) */}
            <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewTab('document')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'document'
                    ? 'bg-emerald-600 text-white shadow-soft-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isVi ? 'Văn bản trực quan (A4 Sheet)' : 'Visual Document (A4)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('parsed')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'parsed'
                    ? 'bg-emerald-600 text-white shadow-soft-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isVi ? 'Bóc tách từ khóa ATS & Kỹ năng' : 'Parsed ATS Entities'}</span>
              </button>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-950/70 flex justify-center">
              {previewTab === 'document' ? (
                <div 
                  className="w-full max-w-[760px] bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-soft-xl border border-slate-200 space-y-6 transition-transform duration-200 origin-top font-sans"
                  style={{ transform: `scale(${previewZoom / 100})` }}
                >
                  {/* Sheet Header */}
                  <div className="border-b border-slate-200 pb-5 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                          {user.name}
                        </h2>
                        <p className="text-sm font-bold text-emerald-700 mt-0.5">
                          {user.title}
                        </p>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                        <p>{user.email}</p>
                        <p>{user.phone}</p>
                        <p>{user.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                      {isVi ? 'Tóm tắt Chuyên môn' : 'Professional Summary'}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {previewingCv.summary}
                    </p>
                  </div>

                  {/* Core Technical Competencies */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                      {isVi ? 'Kỹ năng Chuyên sâu (Core Skills)' : 'Core Technical Skills'}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {previewingCv.skillsExtracted.map((sk) => (
                        <span key={sk} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                      {isVi ? 'Kinh nghiệm Làm việc Thực chiến' : 'Work Experience'}
                    </h3>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-slate-900 font-bold">Senior Fullstack Software Engineer • VNG Corporation</strong>
                        <span className="text-slate-500 text-[11px]">2024 - {isVi ? 'Hiện tại' : 'Present'}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Chịu trách nhiệm kiến trúc dịch vụ chịu tải cao, phát triển vi dịch vụ Spring Boot 3 và giao diện tương tác React 18 / Next.js. Tối ưu hóa truy vấn Redis cache giúp giảm latency 40%.
                      </p>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-slate-900 font-bold">Fullstack Software Engineer • FPT Software</strong>
                        <span className="text-slate-500 text-[11px]">2022 - 2024</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Phát triển nền tảng tài chính điện tử, tích hợp cổng thanh toán và triển khai container hóa qua Docker, Kubernetes trên hạ tầng AWS ECS.
                      </p>
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-1.5 pt-1">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                      {isVi ? 'Học vấn & Bằng cấp' : 'Education & Credentials'}
                    </h3>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">Kỹ sư Công nghệ Thông tin • HCMUTE</span>
                      <span className="text-slate-500 text-[11px]">GPA: 3.6/4.0 • Xuất sắc</span>
                    </div>
                  </div>

                </div>
              ) : (
                /* Tab 2: Parsed ATS Data */
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <div>
                      <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block">{isVi ? 'Điểm chuẩn hóa ATS Score' : 'ATS Benchmark Score'}</span>
                      <strong className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{previewingCv.atsScore}/100</strong>
                    </div>
                    <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold">
                      {isVi ? 'Tương thích xuất sắc' : 'Excellent Match'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      {isVi ? 'Thực thể Kỹ năng bóc tách từ NLP' : 'NLP Extracted Skill Entities'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {previewingCv.skillsExtracted.map((sk) => (
                        <span key={sk} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{sk}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-900 dark:text-white block font-bold">
                      {isVi ? 'Khuyến nghị cải thiện cấu trúc ATS:' : 'ATS Recommendations:'}
                    </strong>
                    <p>• Phông chữ tiêu chuẩn sans-serif đạt tỷ lệ nhận diện OCR 100%.</p>
                    <p>• Các tiêu đề phân cấp H1/H2 rõ ràng, không sử dụng bảng lồng nhau gây nhiễu ATS parser.</p>
                    <p>• Từ khóa công nghệ bao phủ 96% tập kỹ năng yêu cầu trong cơ sở dữ liệu việc làm.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              {!previewingCv.isPrimary ? (
                <button
                  type="button"
                  onClick={() => {
                    handleSetPrimaryCv(previewingCv.id);
                    setPreviewingCv(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-soft cursor-pointer transition-all active:scale-95"
                >
                  {isVi ? 'Đặt làm CV mặc định' : 'Set as Primary'}
                </button>
              ) : (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isVi ? 'Đây là CV mặc định của bạn' : 'This is your primary resume'}</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => setPreviewingCv(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Mock Interview Prep Simulator Modal */}
      {interviewPrepApp && (
        <div 
          data-testid="interview-prep-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-soft-xs">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {isVi ? 'Phòng Luyện Phỏng Vấn AI (Gemini 2.0)' : 'AI Mock Interview Simulator'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      STAR Rubric
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {interviewPrepApp.jobTitle} • {interviewPrepApp.company}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="btn-launch-voice-interview"
                  onClick={() => setIsVoiceInterviewActive(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition-all cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isVi ? '🎙️ Phỏng Vấn Giọng Nói (Voice AI)' : '🎙️ Voice AI Simulator'}</span>
                </button>

                <button
                  type="button"
                  data-testid="interview-close-btn"
                  onClick={() => setInterviewPrepApp(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  title={isVi ? 'Đóng' : 'Close'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Question Selector Tabs */}
            <div className="px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 overflow-x-auto">
              {interviewQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  data-testid="interview-question-tab"
                  onClick={() => {
                    setActiveQuestionIdx(idx);
                    setEvaluationResult(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    activeQuestionIdx === idx
                      ? 'bg-emerald-600 text-white shadow-soft-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{isVi ? `Câu hỏi ${idx + 1}` : `Question ${idx + 1}`}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    activeQuestionIdx === idx
                      ? 'bg-emerald-700/60 text-emerald-100'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {q.category}
                  </span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {interviewQuestions[activeQuestionIdx] && (
                <>
                  {/* Active Question Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isVi ? interviewQuestions[activeQuestionIdx].categoryLabelVi : interviewQuestions[activeQuestionIdx].categoryLabelEn}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {isVi ? 'Độ khó: Nâng cao (Senior/Lead)' : 'Difficulty: Advanced (Senior/Lead)'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                      {interviewQuestions[activeQuestionIdx].question}
                    </h4>

                    {/* Hint / Guidance */}
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs">
                      <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                      <p className="leading-relaxed font-medium">
                        <strong>{isVi ? 'Gợi ý cấu trúc trả lời:' : 'Structure Hint:'}</strong> {interviewQuestions[activeQuestionIdx].hint}
                      </p>
                    </div>
                  </div>

                  {/* Candidate Answer Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isVi ? 'Câu trả lời của bạn (Mô hình STAR: Situation - Task - Action - Result)' : 'Your Response (STAR Model: Situation - Task - Action - Result)'}</span>
                      </label>

                      <button
                        type="button"
                        data-testid="interview-sample-answer-btn"
                        onClick={handleInsertSampleAnswer}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
                        title={isVi ? 'Điền câu trả lời mẫu chuẩn STAR từ chuyên gia' : 'Load expert sample answer'}
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{isVi ? 'Dán câu trả lời mẫu STAR' : 'Fill Sample Answer'}</span>
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      data-testid="interview-answer-input"
                      value={userAnswers[interviewQuestions[activeQuestionIdx].id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUserAnswers((prev) => ({
                          ...prev,
                          [interviewQuestions[activeQuestionIdx].id]: val
                        }));
                      }}
                      placeholder={isVi 
                        ? 'Nhập câu trả lời của bạn theo mô hình STAR: [Tình huống] -> [Nhiệm vụ] -> [Hành động giải quyết] -> [Kết quả định lượng]...' 
                        : 'Enter your answer following STAR: [Situation] -> [Task] -> [Action] -> [Quantified Result]...'}
                      className="w-full p-3.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium leading-relaxed resize-y"
                    />
                  </div>

                  {/* Action Evaluate Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-[11px] text-slate-400">
                      {isVi 
                        ? 'Hệ thống AI sẽ chấm điểm dựa trên tiêu chí STAR, kiến trúc kỹ thuật và tư duy giải quyết vấn đề.' 
                        : 'AI will benchmark against STAR criteria, technical depth, and problem-solving methodology.'}
                    </div>

                    <button
                      type="button"
                      data-testid="interview-evaluate-btn"
                      disabled={isEvaluatingAnswer}
                      onClick={handleEvaluateAnswer}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-soft flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-60"
                    >
                      {isEvaluatingAnswer ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isVi ? 'Đang chấm điểm STAR...' : 'Evaluating with AI...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{isVi ? 'Chấm điểm bằng AI' : 'Evaluate with AI'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Evaluation Result Display */}
                  {evaluationResult && (
                    <div 
                      data-testid="interview-evaluation-result"
                      className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/80 space-y-4 animate-fade-in"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60 dark:border-emerald-800/60">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-soft-xs">
                            {evaluationResult.score}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                              {isVi ? 'Điểm đánh giá STAR Tổng thể' : 'Overall STAR Benchmark'}
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                              {evaluationResult.recommendation}
                            </p>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 self-start sm:self-center">
                          {isVi ? 'Đạt chuẩn tuyển dụng' : 'Meets Hiring Standard'}
                        </span>
                      </div>

                      {/* STAR 4 Pillars Progress Bars */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            <span>S - Situation</span>
                            <span className="text-emerald-600">{evaluationResult.starBreakdown.situation}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${evaluationResult.starBreakdown.situation}%` }} />
                          </div>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            <span>T - Task</span>
                            <span className="text-teal-600">{evaluationResult.starBreakdown.task}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${evaluationResult.starBreakdown.task}%` }} />
                          </div>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            <span>A - Action</span>
                            <span className="text-indigo-600">{evaluationResult.starBreakdown.action}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${evaluationResult.starBreakdown.action}%` }} />
                          </div>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            <span>R - Result</span>
                            <span className="text-amber-600">{evaluationResult.starBreakdown.result}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${evaluationResult.starBreakdown.result}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Strengths & Improvements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                        <div className="space-y-2">
                          <strong className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>{isVi ? 'Điểm mạnh nổi bật:' : 'Key Strengths:'}</span>
                          </strong>
                          <ul className="space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                            {evaluationResult.strengths.map((str, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-500">•</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <strong className="text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <span>{isVi ? 'Gợi ý nâng cao để đạt điểm tuyệt đối:' : 'Suggestions for Perfection:'}</span>
                          </strong>
                          <ul className="space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                            {evaluationResult.improvements.map((imp, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-amber-500">•</span>
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeQuestionIdx === 0}
                  onClick={() => {
                    setActiveQuestionIdx((prev) => Math.max(0, prev - 1));
                    setEvaluationResult(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer transition-all"
                >
                  {isVi ? '← Câu trước' : '← Previous'}
                </button>

                <button
                  type="button"
                  disabled={activeQuestionIdx === interviewQuestions.length - 1}
                  onClick={() => {
                    setActiveQuestionIdx((prev) => Math.min(interviewQuestions.length - 1, prev + 1));
                    setEvaluationResult(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer transition-all"
                >
                  {isVi ? 'Câu tiếp theo →' : 'Next →'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setInterviewPrepApp(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {isVi ? 'Đóng phòng phỏng vấn' : 'Close Room'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AI Voice & Audio Real-Time Mock Interview Modal */}
      <AiVoiceInterviewModal
        isOpen={isVoiceInterviewActive}
        onClose={() => setIsVoiceInterviewActive(false)}
        jobTitle={interviewPrepApp?.jobTitle}
        company={interviewPrepApp?.company}
      />

    </div>
  );
};

export default ProfilePage;
