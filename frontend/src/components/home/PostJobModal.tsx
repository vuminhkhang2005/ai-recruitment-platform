import React, { useState } from 'react';
import { 
  X, 
  Briefcase, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  DollarSign, 
  MapPin, 
  Building2, 
  Tag, 
  Layers, 
  Clock, 
  Send,
  Zap,
  Gift
} from 'lucide-react';
import type { Job } from '../../data/mockData';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { createJobApi } from '../../services/api';
import { CompanyLogo } from '../ui/CompanyLogo';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (newJob: Job) => void;
}

const TEMPLATES = [
  {
    labelVi: '🤖 Senior AI/ML Engineer',
    labelEn: '🤖 Senior AI/ML Engineer',
    title: 'Senior AI / Deep Learning Engineer (LLM & GenAI)',
    company: 'FPT Software AI Lab',
    companyLogoId: 'fpt',
    category: 'Tech' as const,
    level: 'Senior' as const,
    type: 'Hybrid' as const,
    salaryVi: '55 - 85 Triệu VNĐ',
    salaryEn: '55 - 85 Million VND',
    locationVi: 'Hà Nội & Remote',
    locationEn: 'Hanoi & Remote',
    bonusVi: 'Thưởng gia nhập $2,000',
    bonusEn: 'Sign-on Bonus $2,000',
    skills: ['Python', 'PyTorch', 'LLM / RAG', 'vLLM', 'LangChain', 'FastAPI'],
    descriptionVi: 'Chủ trì nghiên cứu, tinh chỉnh và triển khai các giải pháp AI Tạo sinh (Generative AI) và RAG quy mô lớn cho khách hàng Fortune 500.',
    descriptionEn: 'Lead research, fine-tuning, and production scaling of Generative AI and enterprise RAG solutions for global Fortune 500 enterprises.',
    requirementsVi: [
      'Tối thiểu 4 năm kinh nghiệm thực chiến phát triển và tối ưu mô hình Machine Learning/Deep Learning',
      'Thành thạo PyTorch, Hugging Face Transformers và triển khai suy luận với vLLM hoặc TensorRT-LLM',
      'Có kinh nghiệm xây dựng Vector Database (Qdrant, Milvus) và Semantic Retrieval'
    ],
    requirementsEn: [
      'Minimum 4 years hands-on production experience training and fine-tuning ML/DL architectures',
      'Proficiency in PyTorch, Hugging Face Transformers, and inference acceleration via vLLM or TensorRT',
      'Demonstrated expertise in Vector Databases (Qdrant, Milvus) and semantic retrieval pipelines'
    ],
    benefitsVi: [
      'Mức đãi ngộ cạnh tranh hàng đầu thị trường + Thưởng dự án quốc tế hàng quý',
      'Cơ hội Onsite ngắn hạn và dài hạn tại Mỹ, Nhật Bản và Singapore',
      'Gói bảo hiểm sức khỏe quốc tế cao cấp cho cá nhân và gia đình'
    ],
    benefitsEn: [
      'Top-tier market compensation package with quarterly international project delivery bonuses',
      'Global onsite rotation opportunities in the United States, Japan, and Singapore',
      'Comprehensive premium international health insurance for employee and direct family'
    ]
  },
  {
    labelVi: '💻 Senior Fullstack (React & Go)',
    labelEn: '💻 Senior Fullstack (React & Go)',
    title: 'Senior Fullstack Engineer (React 19 & Golang Microservices)',
    company: 'VNG Corporation',
    companyLogoId: 'vng',
    category: 'Tech' as const,
    level: 'Senior' as const,
    type: 'Hybrid' as const,
    salaryVi: '40 - 65 Triệu VNĐ',
    salaryEn: '40 - 65 Million VND',
    locationVi: 'TP. Hồ Chí Minh (Campus Q7)',
    locationEn: 'HCMC (Campus D7)',
    bonusVi: 'Thưởng tháng 13-15',
    bonusEn: '13-15th Month Bonus',
    skills: ['React', 'TypeScript', 'Golang', 'Redis', 'Docker', 'Kafka'],
    descriptionVi: 'Phát triển các phân hệ dịch vụ số chịu tải cao phục vụ hơn 20 triệu người dùng, thiết kế API chuẩn RESTful/gRPC và giao diện hiện đại.',
    descriptionEn: 'Architect high-throughput digital microservices serving over 20 million users, designing secure RESTful/gRPC APIs and sleek modern frontends.',
    requirementsVi: [
      '3-5 năm kinh nghiệm lập trình Fullstack với Golang & React/TypeScript',
      'Kinh nghiệm thực chiến thiết kế hệ thống Microservices chịu tải concurrency lớn',
      'Tư duy Clean Code, TDD và hiểu biết sâu sắc về SQL Optimization'
    ],
    requirementsEn: [
      '3-5 years fullstack engineering experience with Golang & React/TypeScript',
      'Proven production experience architecting high-concurrency microservices',
      'Strong commitment to Clean Architecture, TDD, and database query optimization'
    ],
    benefitsVi: [
      'Lương tháng 13 đảm bảo + Thưởng KPI năm từ 2-4 tháng lương',
      'Làm việc tại VNG Campus 5 sao với bể bơi, phòng gym và ăn trưa buffet miễn phí',
      'Chính sách làm việc linh hoạt Hybrid 2 ngày Remote/tuần'
    ],
    benefitsEn: [
      'Guaranteed 13th month salary plus annual performance bonuses of 2-4 months',
      'Modern 5-star VNG Campus with gym, Olympic pool, and complimentary meals',
      'Flexible hybrid working policy with 2 remote days per week'
    ]
  },
  {
    labelVi: '☁️ Lead Cloud Solutions Architect',
    labelEn: '☁️ Lead Cloud Solutions Architect',
    title: 'Principal Cloud Solutions Architect (AWS & Multi-Cloud)',
    company: 'Techcombank Digital',
    companyLogoId: 'techcombank',
    category: 'Finance' as const,
    level: 'Lead' as const,
    type: 'Full-time' as const,
    salaryVi: '50 - 80 Triệu VNĐ',
    salaryEn: '50 - 80 Million VND',
    locationVi: 'Hà Nội (Tháp Techcombank)',
    locationEn: 'Hanoi (TCB Tower)',
    bonusVi: 'Thưởng cổ tức năm',
    bonusEn: 'Annual Dividend',
    skills: ['AWS Cloud', 'Kubernetes', 'Terraform', 'System Design', 'Zero Trust'],
    descriptionVi: 'Chủ trì định hình kiến trúc đám mây 100% Cloud-First cho hệ sinh thái ngân hàng số hàng đầu Việt Nam, xây dựng nền tảng an toàn chuẩn Zero Trust.',
    descriptionEn: 'Lead the 100% Cloud-First architecture roadmap for Vietnam’s premier digital banking ecosystem, establishing resilient Zero-Trust cloud governance.',
    requirementsVi: [
      'Tối thiểu 6 năm kinh nghiệm thiết kế kiến trúc đám mây và hệ thống phân tán cấp doanh nghiệp',
      'Có chứng chỉ AWS Solutions Architect Professional hoặc Google Cloud Fellow',
      'Năng lực lãnh đạo kỹ thuật và định hướng chiến lược kiến trúc đa vùng'
    ],
    requirementsEn: [
      '6+ years designing enterprise-scale cloud architectures and distributed banking backbones',
      'AWS Solutions Architect Professional or Google Cloud Fellow credentials',
      'Demonstrated technical leadership mentoring senior engineers and cross-functional teams'
    ],
    benefitsVi: [
      'Gói thu nhập hấp dẫn thuộc top 1% ngành ngân hàng tài chính tại Việt Nam',
      'Làm việc tại tòa nhà biểu tượng Techcombank Tower chuẩn LEED Platinum',
      'Chương trình đào tạo chuyên sâu quốc tế cùng chuyên gia AWS & Databricks'
    ],
    benefitsEn: [
      'Top 1% executive remuneration package in the Southeast Asian financial technology sector',
      'Prime office at the iconic LEED Platinum certified Techcombank Tower',
      'Exclusive international technical executive certifications sponsored by AWS and Databricks'
    ]
  }
];

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onJobCreated
}) => {
  if (!isOpen) return null;

  const { language } = useLanguage();
  const { user } = useAuth();
  const isVi = language === 'vi';

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user?.company || (isVi ? 'Doanh nghiệp Công nghệ' : 'Tech Corporation'));
  const [companyLogoId, setCompanyLogoId] = useState('fpt');
  const [category, setCategory] = useState<'Tech' | 'Finance' | 'Design' | 'Marketing' | 'Product' | 'HR'>('Tech');
  const [level, setLevel] = useState<'Junior' | 'Middle' | 'Senior' | 'Lead'>('Senior');
  const [type, setType] = useState<'Full-time' | 'Remote' | 'Hybrid'>('Hybrid');
  const [salary, setSalary] = useState(isVi ? '35 - 55 Triệu VNĐ' : '35 - 55 Million VND');
  const [location, setLocation] = useState(isVi ? 'TP. Hồ Chí Minh & Remote' : 'Ho Chi Minh City & Remote');
  const [bonus, setBonus] = useState(isVi ? 'Thưởng gia nhập $1,000' : 'Sign-on Bonus $1,000');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiDraftActive, setAiDraftActive] = useState(false);

  // Apply a quick 1-click template
  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setCompany(tmpl.company);
    setCompanyLogoId(tmpl.companyLogoId);
    setCategory(tmpl.category);
    setLevel(tmpl.level);
    setType(tmpl.type);
    setSalary(isVi ? tmpl.salaryVi : tmpl.salaryEn);
    setLocation(isVi ? tmpl.locationVi : tmpl.locationEn);
    setBonus(isVi ? tmpl.bonusVi : tmpl.bonusEn);
    setSkills(tmpl.skills);
    setDescription(isVi ? tmpl.descriptionVi : tmpl.descriptionEn);
    setRequirements((isVi ? tmpl.requirementsVi : tmpl.requirementsEn).join('\n'));
    setBenefits((isVi ? tmpl.benefitsVi : tmpl.benefitsEn).join('\n'));
    setAiDraftActive(true);
    setTimeout(() => setAiDraftActive(false), 1500);
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    const requirementsList = requirements
      .split('\n')
      .map((r) => r.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);

    const benefitsList = benefits
      .split('\n')
      .map((b) => b.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);

    // Parse salary numbers if possible
    let minSal: number | undefined = undefined;
    let maxSal: number | undefined = undefined;
    const salaryMatch = salary.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (salaryMatch) {
      minSal = parseInt(salaryMatch[1], 10) * 1000000;
      maxSal = parseInt(salaryMatch[2], 10) * 1000000;
    }

    const fallbackJob: Job = {
      id: `job-${Date.now()}`,
      title: title.trim(),
      company: company.trim() || (user?.company || 'TalentBridge Partner Enterprise'),
      companyLogoId,
      location: location.trim(),
      locationEn: location.trim()
        .replace('Hà Nội', 'Hanoi')
        .replace('TP. Hồ Chí Minh', 'Ho Chi Minh City')
        .replace('TP. HCM', 'HCMC')
        .replace('Đà Nẵng', 'Da Nang'),
      type,
      level,
      category,
      salary: salary.trim(),
      salaryEn: salary.trim()
        .replace('Triệu VNĐ', 'Million VND')
        .replace('Triệu', 'Million'),
      aiMatchScore: 98,
      matchReasons: [
        'Kỹ năng công nghệ khớp 100% với yêu cầu dự án mới của nhà tuyển dụng',
        'Kinh nghiệm thực chiến và thâm niên đáp ứng xuất sắc tiêu chuẩn tuyển mộ'
      ],
      matchReasonsEn: [
        'Candidate skills match 100% with newly defined project requirements',
        'Seniority and hands-on track record exceed the hiring benchmark'
      ],
      skills: skills.length > 0 ? skills : ['Technology', 'Engineering'],
      postedTime: 'Vừa đăng',
      postedTimeEn: 'Just now',
      urgent: true,
      hot: true,
      bonus: bonus.trim() || undefined,
      bonusEn: bonus.trim() ? bonus.trim().replace('Thưởng gia nhập', 'Sign-on Bonus').replace('Thưởng', 'Bonus') : undefined,
      applicantsCount: 0,
      daysLeft: 14,
      description: description.trim() || (isVi ? 'Tham gia phát triển hệ thống công nghệ chủ chốt cùng đội ngũ kỹ sư hàng đầu.' : 'Join key engineering initiatives alongside world-class technical teams.'),
      descriptionEn: description.trim() || 'Join key engineering initiatives alongside world-class technical teams.',
      requirements: requirementsList.length > 0 ? requirementsList : [
        isVi ? 'Có kinh nghiệm thực chiến với các công nghệ cốt lõi' : 'Hands-on production experience in core technologies',
        isVi ? 'Kỹ năng giải quyết bài toán phức tạp và tư duy hệ thống' : 'Strong problem-solving mindset and system thinking'
      ],
      requirementsEn: requirementsList.length > 0 ? requirementsList : [
        'Hands-on production experience in core technologies',
        'Strong problem-solving mindset and system thinking'
      ],
      benefits: benefitsList.length > 0 ? benefitsList : [
        isVi ? 'Mức lương cạnh tranh + Thưởng hiệu suất hàng quý' : 'Competitive compensation + quarterly performance bonuses',
        isVi ? 'Chế độ bảo hiểm sức khỏe cao cấp cho nhân viên và gia đình' : 'Comprehensive premium healthcare plan for employee and family'
      ],
      benefitsEn: benefitsList.length > 0 ? benefitsList : [
        'Competitive compensation + quarterly performance bonuses',
        'Comprehensive premium healthcare plan for employee and family'
      ]
    };

    try {
      const backendJob = await createJobApi({
        title: title.trim(),
        description: description.trim() || (isVi ? 'Tham gia phát triển hệ thống công nghệ chủ chốt cùng đội ngũ kỹ sư hàng đầu.' : 'Join key engineering initiatives alongside world-class technical teams.'),
        requirements: requirementsList.join('\n') || 'Yêu cầu kỹ năng chuyên môn phù hợp.',
        benefits: benefitsList.join('\n') || 'Chế độ đãi ngộ cạnh tranh.',
        jobType: type === 'Remote' ? 'REMOTE' : type === 'Hybrid' ? 'HYBRID' : 'FULL_TIME',
        expLevel: level.toUpperCase(),
        minSalary: minSal,
        maxSalary: maxSal,
        locationCity: location.trim() || 'TP. Hồ Chí Minh',
        locationAddress: location.trim(),
        skills: skills.length > 0 ? skills : ['Technology', 'Engineering']
      });

      if (backendJob) {
        onJobCreated(backendJob);
      } else {
        onJobCreated(fallbackJob);
      }
    } catch (err) {
      console.warn('[TalentBridge] Backend job creation fallback:', err);
      onJobCreated(fallbackJob);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-soft-2xl border border-slate-200 dark:border-slate-800 relative transition-colors duration-300 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-soft shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isVi ? 'Đăng tin tuyển dụng mới' : 'Post a New Job Opening'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {isVi ? 'Nhà tuyển dụng' : 'Employer / Recruiter'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi ? 'Tạo tin tuyển dụng chuyên nghiệp, tích hợp phân tích JD chuẩn ATS và gợi ý AI' : 'Create an ATS-optimized job posting with AI matching assistance'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* ⚡ 1-Click AI Assistant Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isVi ? 'Trợ lý AI: Tự động điền nhanh mẫu JD chuẩn hóa' : 'AI Assistant: 1-Click Production JD Templates'}</span>
              </div>
              {aiDraftActive && (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-emerald-300 animate-pulse">
                  {isVi ? '✓ Đã điền mẫu thành công!' : '✓ Template applied!'}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {isVi ? 'Bấm 1 chạm để áp dụng cấu trúc JD chuẩn của các tập đoàn công nghệ lớn:' : 'Click to instantly populate battle-tested JD structures from top tech enterprises:'}
            </p>

            <div className="flex flex-wrap gap-2 pt-0.5">
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-600 transition-all cursor-pointer shadow-soft-xs active:scale-95"
                >
                  {isVi ? tmpl.labelVi : tmpl.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Form Grid 1: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Job Title */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>{isVi ? 'Tiêu đề vị trí tuyển dụng *' : 'Job Title *'}</span>
                <span className="text-[10px] text-slate-400 font-normal">{isVi ? 'VD: Senior Fullstack Engineer' : 'e.g. Senior Fullstack Engineer'}</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isVi ? 'Nhập tiêu đề công việc...' : 'Enter job position title...'}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                {isVi ? 'Tên công ty / Doanh nghiệp *' : 'Company Name *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={isVi ? 'Tên doanh nghiệp...' : 'Company name...'}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Company Logo Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                {isVi ? 'Logo công ty' : 'Company Logo Badge'}
              </label>
              <select
                value={companyLogoId}
                onChange={(e) => setCompanyLogoId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                <option value="fpt">FPT Software</option>
                <option value="vng">VNG Corporation</option>
                <option value="vinai">VinAI Innovation Lab</option>
                <option value="momo">MoMo Fintech</option>
                <option value="shopee">Shopee Tech</option>
                <option value="viettel">Viettel Telecom</option>
                <option value="techcombank">Techcombank</option>
                <option value="grab">Grab Vietnam</option>
                <option value="onemount">One Mount Group</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                {isVi ? 'Nhóm ngành nghề' : 'Job Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                <option value="Tech">{isVi ? 'Công nghệ thông tin (Tech)' : 'Information Technology (Tech)'}</option>
                <option value="Finance">{isVi ? 'Tài chính - Ngân hàng (Finance)' : 'Finance & Banking'}</option>
                <option value="Design">{isVi ? 'Thiết kế UI/UX (Design)' : 'UI/UX Design'}</option>
                <option value="Marketing">{isVi ? 'Marketing & Truyền thông' : 'Marketing & Communications'}</option>
                <option value="Product">{isVi ? 'Quản trị sản phẩm (Product)' : 'Product Management'}</option>
                <option value="HR">{isVi ? 'Nhân sự & Tuyển dụng (HR)' : 'Human Resources (HR)'}</option>
              </select>
            </div>

            {/* Seniority Level */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                {isVi ? 'Cấp bậc (Seniority)' : 'Seniority Level'}
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                <option value="Junior">Junior (1-2 {isVi ? 'năm' : 'years'})</option>
                <option value="Middle">Middle (2-4 {isVi ? 'năm' : 'years'})</option>
                <option value="Senior">Senior (4+ {isVi ? 'năm' : 'years'})</option>
                <option value="Lead">Lead / Architect / Principal</option>
              </select>
            </div>

            {/* Work Model */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                {isVi ? 'Hình thức làm việc' : 'Work Model'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Hybrid', 'Full-time', 'Remote'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setType(mode)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      type === mode
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-soft-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                {isVi ? 'Mức lương dự kiến *' : 'Salary Range *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder={isVi ? 'VD: 35 - 55 Triệu VNĐ' : 'e.g. 35 - 55 Million VND'}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                {isVi ? 'Địa điểm làm việc *' : 'Work Location *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={isVi ? 'VD: Hà Nội & Remote' : 'e.g. Hanoi & Remote'}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Bonus / Special Perk */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                {isVi ? 'Thưởng gia nhập / Phúc lợi nổi bật' : 'Sign-on Bonus / Highlight Perk'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  placeholder={isVi ? 'VD: Thưởng gia nhập $1,500' : 'e.g. Sign-on Bonus $1,500'}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <Gift className="w-4 h-4 text-amber-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Skills Required Tags */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>{isVi ? 'Kỹ năng cốt lõi (Skills Tags)' : 'Core Skills Tags'}</span>
              <span className="text-[10px] text-slate-400 font-normal">{isVi ? 'Gõ tên kỹ năng rồi bấm Enter hoặc nút +' : 'Type skill and press Enter or +'}</span>
            </label>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder={isVi ? 'Thêm kỹ năng: Docker, Kubernetes, Next.js...' : 'Add skill tag: Docker, Kubernetes, Next.js...'}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
                />
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-800 dark:text-slate-200 rounded-xl font-bold cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300/70 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold text-xs"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200">
              {isVi ? 'Mô tả công việc (Job Description) *' : 'Job Description *'}
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isVi ? 'Mô tả mục tiêu, trách nhiệm chính và công nghệ áp dụng...' : 'Describe key responsibilities, mission goals and architecture...'}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium leading-relaxed"
            />
          </div>

          {/* Requirements (One per line) */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>{isVi ? 'Yêu cầu ứng viên (Mỗi dòng 1 tiêu chí)' : 'Candidate Requirements (One per line)'}</span>
              <span className="text-[10px] text-slate-400 font-normal">{isVi ? 'Gợi ý: Số năm KN, công nghệ' : 'Tip: Experience years, tech stack'}</span>
            </label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder={isVi ? '- 3+ năm kinh nghiệm...\n- Thành thạo công nghệ...\n- Kỹ năng làm việc nhóm...' : '- 3+ years hands-on experience...\n- Proficiency in modern stack...\n- Strong team collaboration...'}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium leading-relaxed font-mono"
            />
          </div>

          {/* Benefits (One per line) */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>{isVi ? 'Quyền lợi & Đãi ngộ (Mỗi dòng 1 mục)' : 'Compensation & Benefits (One per line)'}</span>
              <span className="text-[10px] text-slate-400 font-normal">{isVi ? 'Gợi ý: Lương tháng 13, bảo hiểm' : 'Tip: 13th month, healthcare'}</span>
            </label>
            <textarea
              rows={3}
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder={isVi ? '- Thưởng tháng 13 + thưởng KPI...\n- Bảo hiểm sức khỏe quốc tế...\n- Hỗ trợ thiết bị MacBook M3...' : '- 13th month salary + KPI bonus...\n- Premium international health insurance...\n- Top-spec MacBook Pro M3 provided...'}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium leading-relaxed font-mono"
            />
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 py-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isVi ? 'Hủy bỏ' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-soft flex items-center gap-2 cursor-pointer disabled:opacity-50 overflow-hidden relative"
            >
              <div className="shimmer-sweep" />
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>{isVi ? 'Đang xuất bản...' : 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Đăng tin tuyển dụng ngay' : 'Publish Job Listing'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
