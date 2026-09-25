import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Sparkles, 
  Kanban, 
  Users, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  ArrowRight, 
  Search, 
  Plus, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  MapPin, 
  ExternalLink, 
  X, 
  ChevronRight, 
  Award, 
  Briefcase, 
  ShieldCheck, 
  RefreshCw,
  Phone,
  Mail,
  Send,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  role: string;
  prevCompany: string;
  score: number;
  atsScore: number;
  experienceVi: string;
  experienceEn: string;
  salaryVi: string;
  salaryEn: string;
  skills: string[];
  appliedTimeVi: string;
  appliedTimeEn: string;
  interviewTimeVi?: string;
  interviewTimeEn?: string;
  offerDetailVi?: string;
  offerDetailEn?: string;
  aiVerdictVi: string;
  aiVerdictEn: string;
  breakdown: {
    tech: number;
    exp: number;
    edu: number;
    soft: number;
  };
}

interface Column {
  id: 'new' | 'screened' | 'interview' | 'offer';
  titleVi: string;
  titleEn: string;
  badgeColor: string;
}

const COLUMNS: Column[] = [
  { id: 'new', titleVi: 'Ứng tuyển mới', titleEn: 'New Applied', badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' },
  { id: 'screened', titleVi: 'Đã qua sàng lọc AI', titleEn: 'AI Screened', badgeColor: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300' },
  { id: 'interview', titleVi: 'Phỏng vấn kỹ thuật', titleEn: 'Tech Interview', badgeColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300' },
  { id: 'offer', titleVi: 'Đã gửi Offer', titleEn: 'Offer Extended', badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' }
];

const PIPELINES = [
  { id: 'ai', titleVi: '🤖 Senior AI/ML Engineer', titleEn: '🤖 Senior AI/ML Engineer', count: 26 },
  { id: 'fullstack', titleVi: '💻 Lead Fullstack (React & Go)', titleEn: '💻 Lead Fullstack (React & Go)', count: 19 },
  { id: 'devops', titleVi: '☁️ Cloud & DevOps Lead', titleEn: '☁️ Cloud & DevOps Lead', count: 11 },
  { id: 'design', titleVi: '🎨 Senior Product Designer', titleEn: '🎨 Senior Product Designer', count: 8 }
];

const INITIAL_CANDIDATES: Record<string, Record<string, Candidate[]>> = {
  ai: {
    new: [
      {
        id: 'cand-ai-1',
        name: 'Hoàng Long',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        role: 'Senior AI / Deep Learning Engineer',
        prevCompany: 'ex-VinAI Lab',
        score: 98,
        atsScore: 97,
        experienceVi: '4.5 năm kinh nghiệm',
        experienceEn: '4.5 years exp',
        salaryVi: '65 - 85 Triệu/tháng',
        salaryEn: '$2,800 - $3,500/mo',
        skills: ['PyTorch', 'LLMs / RAG', 'vLLM', 'LangChain', 'FastAPI'],
        appliedTimeVi: '15 phút trước',
        appliedTimeEn: '15m ago',
        aiVerdictVi: 'Kinh nghiệm thực chiến huấn luyện & tinh chỉnh LLM mã nguồn mở vượt trội. Phù hợp 98% khung năng lực JD.',
        aiVerdictEn: 'Extensive hands-on production experience training & fine-tuning open-source LLMs. 98% match with JD.',
        breakdown: { tech: 98, exp: 96, edu: 94, soft: 90 }
      },
      {
        id: 'cand-ai-2',
        name: 'Minh Phương',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        role: 'Machine Learning Research Engineer',
        prevCompany: 'ex-FPT AI Residency',
        score: 92,
        atsScore: 93,
        experienceVi: '3 năm kinh nghiệm',
        experienceEn: '3 years exp',
        salaryVi: '50 - 65 Triệu/tháng',
        salaryEn: '$2,200 - $2,700/mo',
        skills: ['Python', 'Transformers', 'TensorRT', 'VectorDB', 'Docker'],
        appliedTimeVi: '1 giờ trước',
        appliedTimeEn: '1h ago',
        aiVerdictVi: 'Nền tảng toán học & thuật toán Deep Learning vững chắc, đã có 2 bài báo công bố tại hội nghị quốc tế.',
        aiVerdictEn: 'Strong mathematical & Deep Learning algorithmic foundations with 2 peer-reviewed workshop publications.',
        breakdown: { tech: 94, exp: 88, edu: 96, soft: 89 }
      },
      {
        id: 'cand-ai-3',
        name: 'Trần Quốc Huy',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        role: 'AI System & MLOps Specialist',
        prevCompany: 'ex-MoMo Fintech',
        score: 90,
        atsScore: 91,
        experienceVi: '3.5 năm kinh nghiệm',
        experienceEn: '3.5 years exp',
        salaryVi: '55 - 70 Triệu/tháng',
        salaryEn: '$2,300 - $2,900/mo',
        skills: ['Kubeflow', 'MLflow', 'Triton', 'AWS SageMaker', 'Go'],
        appliedTimeVi: '3 giờ trước',
        appliedTimeEn: '3h ago',
        aiVerdictVi: 'Chuyên gia thiết lập hệ thống suy luận phục vụ hàng triệu request/ngày với độ trễ dưới 45ms.',
        aiVerdictEn: 'Specialist in scaling high-throughput inference serving millions of requests/day with sub-45ms latency.',
        breakdown: { tech: 92, exp: 90, edu: 88, soft: 88 }
      }
    ],
    screened: [
      {
        id: 'cand-ai-4',
        name: 'Lê Bảo Anh',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        role: 'Senior Generative AI Architect',
        prevCompany: 'ex-VNG Corporation',
        score: 96,
        atsScore: 98,
        experienceVi: '5 năm kinh nghiệm',
        experienceEn: '5 years exp',
        salaryVi: '70 - 90 Triệu/tháng',
        salaryEn: '$3,000 - $3,800/mo',
        skills: ['LLM Orchestration', 'Qdrant', 'LoRA', 'PyTorch', 'Microservices'],
        appliedTimeVi: 'Hôm qua',
        appliedTimeEn: 'Yesterday',
        aiVerdictVi: 'Đã hoàn thành xuất sắc bài kiểm tra kiến trúc GenAI tự động, thời gian hoàn thành nhanh hơn 95% thí sinh.',
        aiVerdictEn: 'Achieved top 5% score on automated GenAI architectural assessment with flawless design answers.',
        breakdown: { tech: 97, exp: 96, edu: 95, soft: 92 }
      },
      {
        id: 'cand-ai-5',
        name: 'Đặng Thanh Tùng',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
        role: 'Computer Vision & Multimodal Lead',
        prevCompany: 'ex-VinAI Lab',
        score: 94,
        atsScore: 92,
        experienceVi: '4 năm kinh nghiệm',
        experienceEn: '4 years exp',
        salaryVi: '60 - 75 Triệu/tháng',
        salaryEn: '$2,500 - $3,200/mo',
        skills: ['Vision Transformers', 'CLIP', 'TensorRT', 'C++', 'Python'],
        appliedTimeVi: '2 ngày trước',
        appliedTimeEn: '2 days ago',
        aiVerdictVi: 'Kinh nghiệm triển khai mô hình đa phương thức (Multimodal) trên thiết bị biên Edge computing.',
        aiVerdictEn: 'Extensive background optimizing Vision & Multimodal transformer pipelines on edge accelerators.',
        breakdown: { tech: 95, exp: 93, edu: 93, soft: 90 }
      },
      {
        id: 'cand-ai-6',
        name: 'Vũ Hà My',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        role: 'NLP & AI Product Engineer',
        prevCompany: 'HUST Alum • IELTS 8.0',
        score: 93,
        atsScore: 95,
        experienceVi: '3.5 năm kinh nghiệm',
        experienceEn: '3.5 years exp',
        salaryVi: '55 - 70 Triệu/tháng',
        salaryEn: '$2,300 - $3,000/mo',
        skills: ['HuggingFace', 'vLLM', 'Semantic Search', 'FastAPI', 'Redis'],
        appliedTimeVi: '3 ngày trước',
        appliedTimeEn: '3 days ago',
        aiVerdictVi: 'Khả năng kết nối giữa mô hình thuật toán và sản phẩm thương mại rất tốt, tiếng Anh chuyên ngành trôi chảy.',
        aiVerdictEn: 'Exceptional bridge between AI modeling and product features, fluent in bilingual tech communication.',
        breakdown: { tech: 93, exp: 91, edu: 96, soft: 95 }
      }
    ],
    interview: [
      {
        id: 'cand-ai-7',
        name: 'Nguyễn Thanh Hằng',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        role: 'AI Infrastructure & Model Optimization Lead',
        prevCompany: 'ex-Shopee Tech',
        score: 95,
        atsScore: 96,
        experienceVi: '4.5 năm kinh nghiệm',
        experienceEn: '4.5 years exp',
        salaryVi: '68 - 85 Triệu/tháng',
        salaryEn: '$2,900 - $3,600/mo',
        skills: ['DeepSpeed', 'Megatron', 'CUDA', 'Distributed Training', 'PyTorch'],
        appliedTimeVi: '4 ngày trước',
        appliedTimeEn: '4 days ago',
        interviewTimeVi: 'Hôm nay 14:30 • Google Meet',
        interviewTimeEn: 'Today 14:30 • Google Meet',
        aiVerdictVi: 'Đã pass vòng phỏng vấn sơ bộ và Coding test thuật toán với 100/100 điểm.',
        aiVerdictEn: 'Cleared technical screening and live algorithmic assessment with 100/100 benchmark score.',
        breakdown: { tech: 97, exp: 95, edu: 92, soft: 94 }
      },
      {
        id: 'cand-ai-8',
        name: 'Phạm Quang Khải',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
        role: 'Senior RAG System Specialist',
        prevCompany: 'ex-One Mount Group',
        score: 93,
        atsScore: 94,
        experienceVi: '4 năm kinh nghiệm',
        experienceEn: '4 years exp',
        salaryVi: '60 - 75 Triệu/tháng',
        salaryEn: '$2,500 - $3,200/mo',
        skills: ['Hybrid Search', 'Milvus', 'LangGraph', 'Python', 'Docker'],
        appliedTimeVi: '5 ngày trước',
        appliedTimeEn: '5 days ago',
        interviewTimeVi: 'Ngày mai 10:00 • Trực tiếp tại Văn phòng',
        interviewTimeEn: 'Tomorrow 10:00 • Onsite HQ Interview',
        aiVerdictVi: 'Thành thạo tối ưu hóa hệ thống truy vấn ngữ nghĩa cho tài liệu tài chính phức tạp.',
        aiVerdictEn: 'Proven expertise in hybrid semantic retrieval for enterprise financial knowledge graphs.',
        breakdown: { tech: 94, exp: 93, edu: 91, soft: 92 }
      }
    ],
    offer: [
      {
        id: 'cand-ai-9',
        name: 'Đỗ Tuấn Kiệt',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
        role: 'Principal AI Architect',
        prevCompany: 'ex-Grab Vietnam & Singapore',
        score: 98,
        atsScore: 99,
        experienceVi: '6.5 năm kinh nghiệm',
        experienceEn: '6.5 years exp',
        salaryVi: '85 - 110 Triệu/tháng',
        salaryEn: '$3,700 - $4,800/mo',
        skills: ['LLM Finetuning', 'Distributed Systems', 'Go', 'PyTorch', 'AWS'],
        appliedTimeVi: '1 tuần trước',
        appliedTimeEn: '1 week ago',
        offerDetailVi: 'Offer: $4,200/tháng + Thưởng ký $2,000 • Chờ phản hồi (còn 2 ngày)',
        offerDetailEn: 'Offer: $4,200/mo + $2k Sign-on • Awaiting signature (2 days left)',
        aiVerdictVi: 'Ứng viên ngôi sao: Đạt điểm đánh giá cao nhất trong quý, pass tuyệt đối cả 3 vòng phỏng vấn kỹ thuật.',
        aiVerdictEn: 'Star candidate: Highest interview rubric scores this quarter across all 3 technical rounds.',
        breakdown: { tech: 99, exp: 98, edu: 96, soft: 97 }
      },
      {
        id: 'cand-ai-10',
        name: 'Nguyễn Mai Chi',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
        role: 'Senior Applied AI Researcher',
        prevCompany: 'ex-VinAI • Stanford Online Alum',
        score: 96,
        atsScore: 97,
        experienceVi: '4.5 năm kinh nghiệm',
        experienceEn: '4.5 years exp',
        salaryVi: '75 - 95 Triệu/tháng',
        salaryEn: '$3,200 - $4,100/mo',
        skills: ['Agentic AI', 'Multi-Agent', 'Python', 'FastAPI', 'LangChain'],
        appliedTimeVi: '1 tuần trước',
        appliedTimeEn: '1 week ago',
        offerDetailVi: 'Offer: $3,600/tháng + ESOP • Đã chấp thuận 🎉 (Bắt đầu 01/10)',
        offerDetailEn: 'Offer: $3,600/mo + ESOP • Accepted 🎉 (Start Date: Oct 1)',
        aiVerdictVi: 'Đã hoàn tất thủ tục offer thành công, sẵn sàng gia nhập team R&D.',
        aiVerdictEn: 'Candidate officially accepted the offer package, scheduled for onboarding.',
        breakdown: { tech: 96, exp: 95, edu: 98, soft: 96 }
      }
    ]
  },
  fullstack: {
    new: [
      {
        id: 'cand-fs-1',
        name: 'Trần Văn Mạnh',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        role: 'Lead Fullstack Developer (React & Go)',
        prevCompany: 'ex-VNG Games',
        score: 95,
        atsScore: 96,
        experienceVi: '5 năm kinh nghiệm',
        experienceEn: '5 years exp',
        salaryVi: '60 - 75 Triệu/tháng',
        salaryEn: '$2,500 - $3,200/mo',
        skills: ['React', 'Next.js', 'Golang', 'PostgreSQL', 'Docker'],
        appliedTimeVi: '30 phút trước',
        appliedTimeEn: '30m ago',
        aiVerdictVi: 'Kinh nghiệm phát triển microservices chịu tải cao, thành thạo tối ưu hiệu năng frontend.',
        aiVerdictEn: 'Proven experience architecting high-throughput Go microservices and React performance.',
        breakdown: { tech: 96, exp: 94, edu: 92, soft: 92 }
      },
      {
        id: 'cand-fs-2',
        name: 'Ngô Thu Thảo',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        role: 'Senior Fullstack Engineer',
        prevCompany: 'ex-Techcombank Tech Hub',
        score: 92,
        atsScore: 93,
        experienceVi: '4 năm kinh nghiệm',
        experienceEn: '4 years exp',
        salaryVi: '50 - 65 Triệu/tháng',
        salaryEn: '$2,100 - $2,800/mo',
        skills: ['TypeScript', 'React', 'Node.js', 'Kafka', 'Redis'],
        appliedTimeVi: '2 giờ trước',
        appliedTimeEn: '2h ago',
        aiVerdictVi: 'Chuyên gia xây dựng luồng thanh toán và xác thực bảo mật chuẩn ngân hàng số.',
        aiVerdictEn: 'Strong enterprise banking fintech background in secure authentication and payments.',
        breakdown: { tech: 93, exp: 91, edu: 93, soft: 90 }
      }
    ],
    screened: [
      {
        id: 'cand-fs-3',
        name: 'Đặng Tuấn Anh',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        role: 'Senior Fullstack Architect',
        prevCompany: 'ex-Shopee Vietnam',
        score: 96,
        atsScore: 97,
        experienceVi: '5.5 năm kinh nghiệm',
        experienceEn: '5.5 years exp',
        salaryVi: '68 - 85 Triệu/tháng',
        salaryEn: '$2,900 - $3,600/mo',
        skills: ['React 19', 'Go', 'GraphQL', 'Kubernetes', 'AWS'],
        appliedTimeVi: 'Hôm qua',
        appliedTimeEn: 'Yesterday',
        aiVerdictVi: 'Kiến trúc sư hệ thống giàu kinh nghiệm, đạt 98% điểm thử thách System Design.',
        aiVerdictEn: 'Exceptional system architect, scored 98% on distributed system design challenge.',
        breakdown: { tech: 98, exp: 97, edu: 94, soft: 94 }
      }
    ],
    interview: [
      {
        id: 'cand-fs-4',
        name: 'Lê Minh Quân',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
        role: 'Lead Frontend / Fullstack',
        prevCompany: 'ex-Grab',
        score: 94,
        atsScore: 95,
        experienceVi: '4.5 năm kinh nghiệm',
        experienceEn: '4.5 years exp',
        salaryVi: '60 - 75 Triệu/tháng',
        salaryEn: '$2,500 - $3,200/mo',
        skills: ['Next.js', 'React Query', 'Go', 'Docker', 'Tailwind'],
        appliedTimeVi: '2 ngày trước',
        appliedTimeEn: '2 days ago',
        interviewTimeVi: 'Hôm nay 16:00 • Google Meet',
        interviewTimeEn: 'Today 16:00 • Google Meet',
        aiVerdictVi: 'Kỹ năng giải quyết bài toán giao diện phức tạp và state management xuất sắc.',
        aiVerdictEn: 'Outstanding problem-solving in complex client state management and caching.',
        breakdown: { tech: 95, exp: 93, edu: 92, soft: 93 }
      }
    ],
    offer: [
      {
        id: 'cand-fs-5',
        name: 'Vũ Quốc Trung',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
        role: 'Staff Fullstack Engineer',
        prevCompany: 'ex-Tiki Core Engineering',
        score: 97,
        atsScore: 98,
        experienceVi: '6 năm kinh nghiệm',
        experienceEn: '6 years exp',
        salaryVi: '75 - 95 Triệu/tháng',
        salaryEn: '$3,200 - $4,000/mo',
        skills: ['Go', 'TypeScript', 'PostgreSQL', 'Micro-frontends', 'Kafka'],
        appliedTimeVi: '5 ngày trước',
        appliedTimeEn: '5 days ago',
        offerDetailVi: 'Offer: 85 Triệu/tháng • Đã ký chấp thuận 🎉',
        offerDetailEn: 'Offer: $3,600/mo • Accepted 🎉',
        aiVerdictVi: 'Đã hoàn tất đàm phán và chốt offer với mức đãi ngộ top 5% thị trường.',
        aiVerdictEn: 'Successfully negotiated top-tier market offer package.',
        breakdown: { tech: 98, exp: 97, edu: 95, soft: 96 }
      }
    ]
  },
  devops: {
    new: [
      {
        id: 'cand-do-1',
        name: 'Bùi Đức Anh',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        role: 'Cloud Solutions & DevOps Architect',
        prevCompany: 'ex-FPT Software Cloud Lab',
        score: 96,
        atsScore: 97,
        experienceVi: '5.5 năm kinh nghiệm',
        experienceEn: '5.5 years exp',
        salaryVi: '65 - 85 Triệu/tháng',
        salaryEn: '$2,800 - $3,600/mo',
        skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Helm'],
        appliedTimeVi: '45 phút trước',
        appliedTimeEn: '45m ago',
        aiVerdictVi: 'Sở hữu 3 chứng chỉ AWS Solution Architect & CKA Kubernetes Administrator.',
        aiVerdictEn: 'Triple certified in AWS Solutions Architecture and CKA Kubernetes Administration.',
        breakdown: { tech: 98, exp: 96, edu: 94, soft: 92 }
      }
    ],
    screened: [
      {
        id: 'cand-do-2',
        name: 'Nguyễn Thành Nam',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        role: 'Site Reliability Engineering (SRE) Lead',
        prevCompany: 'ex-VNG Cloud',
        score: 94,
        atsScore: 95,
        experienceVi: '4.5 năm kinh nghiệm',
        experienceEn: '4.5 years exp',
        salaryVi: '60 - 75 Triệu/tháng',
        salaryEn: '$2,500 - $3,200/mo',
        skills: ['Prometheus', 'Grafana', 'Golang', 'Linux Kernel', 'Ansible'],
        appliedTimeVi: 'Hôm qua',
        appliedTimeEn: 'Yesterday',
        aiVerdictVi: 'Kinh nghiệm duy trì hệ thống đạt 99.99% uptime cho hơn 20 triệu người dùng.',
        aiVerdictEn: 'Maintained 99.99% multi-region uptime for 20M+ active users.',
        breakdown: { tech: 95, exp: 94, edu: 92, soft: 91 }
      }
    ],
    interview: [
      {
        id: 'cand-do-3',
        name: 'Phan Minh Hoàng',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
        role: 'Lead Cloud Security & DevOps',
        prevCompany: 'ex-Techcombank',
        score: 95,
        atsScore: 96,
        experienceVi: '5 năm kinh nghiệm',
        experienceEn: '5 years exp',
        salaryVi: '65 - 80 Triệu/tháng',
        salaryEn: '$2,700 - $3,400/mo',
        skills: ['Vault', 'CIS Benchmarks', 'Terraform', 'GCP', 'Docker'],
        appliedTimeVi: '2 ngày trước',
        appliedTimeEn: '2 days ago',
        interviewTimeVi: 'Mai 14:00 • Google Meet',
        interviewTimeEn: 'Tomorrow 14:00 • Google Meet',
        aiVerdictVi: 'Chuyên gia DevSecOps với kinh nghiệm thực thi tiêu chuẩn bảo mật PCI-DSS.',
        aiVerdictEn: 'DevSecOps specialist with deep compliance audit experience for PCI-DSS.',
        breakdown: { tech: 96, exp: 95, edu: 93, soft: 94 }
      }
    ],
    offer: [
      {
        id: 'cand-do-4',
        name: 'Trần Gia Bảo',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
        role: 'Principal Cloud Infrastructure Engineer',
        prevCompany: 'ex-Grab Singapore',
        score: 97,
        atsScore: 98,
        experienceVi: '6.5 năm kinh nghiệm',
        experienceEn: '6.5 years exp',
        salaryVi: '80 - 100 Triệu/tháng',
        salaryEn: '$3,400 - $4,300/mo',
        skills: ['Multi-Cloud', 'K8s Operators', 'Go', 'Service Mesh', 'Cost Optimization'],
        appliedTimeVi: '4 ngày trước',
        appliedTimeEn: '4 days ago',
        offerDetailVi: 'Offer: $4,000/tháng • Đã ký chấp thuận 🎉',
        offerDetailEn: 'Offer: $4,000/mo • Signed 🎉',
        aiVerdictVi: 'Pass vòng phỏng vấn VP Engineering với đánh giá xuất sắc nhất đợt tuyển.',
        aiVerdictEn: 'Cleared final VP interview with highest technical commendation.',
        breakdown: { tech: 98, exp: 97, edu: 95, soft: 95 }
      }
    ]
  },
  design: {
    new: [
      {
        id: 'cand-ds-1',
        name: 'Nguyễn Thảo Linh',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        role: 'Senior UI/UX Product Designer',
        prevCompany: 'ex-MoMo Design Studio',
        score: 96,
        atsScore: 97,
        experienceVi: '4.5 năm kinh nghiệm',
        experienceEn: '4.5 years exp',
        salaryVi: '45 - 60 Triệu/tháng',
        salaryEn: '$1,900 - $2,500/mo',
        skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Design Tokens'],
        appliedTimeVi: '20 phút trước',
        appliedTimeEn: '20m ago',
        aiVerdictVi: 'Portfolio dự án fintech đạt giải thưởng thiết kế UX quốc tế Red Dot.',
        aiVerdictEn: 'Award-winning fintech portfolio with exceptional micro-interaction mastery.',
        breakdown: { tech: 97, exp: 95, edu: 94, soft: 96 }
      }
    ],
    screened: [
      {
        id: 'cand-ds-2',
        name: 'Trịnh Bảo Trâm',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        role: 'Lead Design System Architect',
        prevCompany: 'ex-VNG Corp',
        score: 95,
        atsScore: 96,
        experienceVi: '5 năm kinh nghiệm',
        experienceEn: '5 years exp',
        salaryVi: '55 - 70 Triệu/tháng',
        salaryEn: '$2,300 - $3,000/mo',
        skills: ['Design Systems', 'Figma Variants', 'Accessibility (WCAG)', 'Storybook'],
        appliedTimeVi: 'Hôm qua',
        appliedTimeEn: 'Yesterday',
        aiVerdictVi: 'Từng chủ trì xây dựng Design System đồng bộ cho 15+ sản phẩm ứng dụng di động.',
        aiVerdictEn: 'Built multi-brand cross-platform Design Systems serving 15+ mobile products.',
        breakdown: { tech: 96, exp: 95, edu: 93, soft: 95 }
      }
    ],
    interview: [
      {
        id: 'cand-ds-3',
        name: 'Lê Hoàng Nam',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        role: 'Principal Product Designer',
        prevCompany: 'ex-Shopee Southeast Asia',
        score: 97,
        atsScore: 98,
        experienceVi: '6 năm kinh nghiệm',
        experienceEn: '6 years exp',
        salaryVi: '65 - 80 Triệu/tháng',
        salaryEn: '$2,700 - $3,500/mo',
        skills: ['Product Strategy', 'Figma', 'UX Data Analytics', 'A/B Testing'],
        appliedTimeVi: '3 ngày trước',
        appliedTimeEn: '3 days ago',
        interviewTimeVi: 'Hôm nay 15:30 • Google Meet',
        interviewTimeEn: 'Today 15:30 • Google Meet',
        aiVerdictVi: 'Khả năng kết hợp tư duy kinh doanh và trải nghiệm người dùng rất cao.',
        aiVerdictEn: 'Exceptional blend of data-driven UX experimentation and product strategy.',
        breakdown: { tech: 98, exp: 97, edu: 95, soft: 97 }
      }
    ],
    offer: [
      {
        id: 'cand-ds-4',
        name: 'Phạm Quỳnh Nga',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
        role: 'Head of Product Design',
        prevCompany: 'ex-One Mount',
        score: 98,
        atsScore: 99,
        experienceVi: '7 năm kinh nghiệm',
        experienceEn: '7 years exp',
        salaryVi: '75 - 95 Triệu/tháng',
        salaryEn: '$3,200 - $4,000/mo',
        skills: ['Design Leadership', 'Design Ops', 'User Journey', 'Mentorship'],
        appliedTimeVi: '1 tuần trước',
        appliedTimeEn: '1 week ago',
        offerDetailVi: 'Offer: $3,800/tháng • Đã ký chấp thuận 🎉',
        offerDetailEn: 'Offer: $3,800/mo • Signed 🎉',
        aiVerdictVi: 'Pass tuyệt đối cả 3 vòng phỏng vấn cùng CPO và CEO.',
        aiVerdictEn: 'Unanimous pass from executive panel across all evaluation criteria.',
        breakdown: { tech: 99, exp: 98, edu: 96, soft: 98 }
      }
    ]
  }
};

export const EmployerSection: React.FC = () => {
  const { t, language } = useLanguage();
  const isVi = language === 'vi';

  const [activePipeline, setActivePipeline] = useState<string>('ai');
  const [candidatesState, setCandidatesState] = useState(INITIAL_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isRescanning, setIsRescanning] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentPipelineData = candidatesState[activePipeline] || candidatesState.ai;

  // Rescan simulation
  const handleRescan = () => {
    setIsRescanning(true);
    setTimeout(() => {
      setIsRescanning(false);
      showToast(
        isVi 
          ? '🎉 AI đã quét lại toàn bộ hồ sơ: Phát hiện 3 ứng viên xuất sắc đạt trên 95% độ tương thích!'
          : '🎉 AI rescanned all applicants: Found 3 top-tier candidates matching > 95% requirements!'
      );
    }, 900);
  };

  // Move candidate to next stage
  const handleMoveCandidate = (candidateId: string, currentColumn: 'new' | 'screened' | 'interview' | 'offer') => {
    const stageOrder: ('new' | 'screened' | 'interview' | 'offer')[] = ['new', 'screened', 'interview', 'offer'];
    const currentIdx = stageOrder.indexOf(currentColumn);
    if (currentIdx >= stageOrder.length - 1) {
      showToast(isVi ? 'Ứng viên đã ở giai đoạn Offer hoàn tất!' : 'Candidate is already at final Offer stage!');
      return;
    }

    const nextStage = stageOrder[currentIdx + 1];
    setCandidatesState((prev) => {
      const pipelineCandidates = { ...prev[activePipeline] };
      const cand = pipelineCandidates[currentColumn].find((c) => c.id === candidateId);
      if (!cand) return prev;

      const updatedFrom = pipelineCandidates[currentColumn].filter((c) => c.id !== candidateId);
      const updatedTo = [cand, ...pipelineCandidates[nextStage]];

      return {
        ...prev,
        [activePipeline]: {
          ...pipelineCandidates,
          [currentColumn]: updatedFrom,
          [nextStage]: updatedTo
        }
      };
    });

    const nextStageTitle = isVi ? COLUMNS.find(c => c.id === nextStage)?.titleVi : COLUMNS.find(c => c.id === nextStage)?.titleEn;
    showToast(
      isVi 
        ? `Đã chuyển ứng viên sang cột: ${nextStageTitle}!`
        : `Moved candidate to: ${nextStageTitle}!`
    );
  };

  // Filter candidates per column
  const filteredColumns = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result: Record<string, Candidate[]> = {};

    COLUMNS.forEach((col) => {
      const list = currentPipelineData[col.id] || [];
      result[col.id] = list.filter((cand) => {
        if (minScoreFilter > 0 && cand.score < minScoreFilter) return false;
        if (!q) return true;
        const matchesName = cand.name.toLowerCase().includes(q);
        const matchesRole = cand.role.toLowerCase().includes(q);
        const matchesSkills = cand.skills.some((s) => s.toLowerCase().includes(q));
        const matchesCompany = cand.prevCompany.toLowerCase().includes(q);
        return matchesName || matchesRole || matchesSkills || matchesCompany;
      });
    });

    return result;
  }, [currentPipelineData, searchQuery, minScoreFilter]);

  const totalCandidatesCount = Object.values(currentPipelineData).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <section id="for-employers" className="scroll-mt-24 py-20 sm:py-24 bg-slate-50/80 dark:bg-slate-900/95 text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300 border-t border-slate-200/80 dark:border-slate-800">
      
      {/* Toast inside section */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-soft-2xl border border-slate-700 animate-slide-up">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold">{toastMessage}</p>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 p-1 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-slate-800 border border-emerald-200/80 dark:border-slate-700 text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-400 shadow-soft-xs">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.employer.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {t.employer.headline}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              {t.employer.subtitle}
            </p>
          </div>

          {/* Quick Metrics Pill */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0 bg-white dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-soft-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-sm">
              96%
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {isVi ? 'Độ chính xác Matching' : 'AI Match Precision'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isVi ? 'Tiết kiệm 70% thời gian lọc CV' : '70% screening time saved'}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Key Enterprise Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs hover:shadow-soft-md hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300 space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isVi ? 'Thời gian tuyển dụng' : 'Time-to-Hire'}
              </span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">12 {isVi ? 'Ngày' : 'Days'}</span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded-md">-42% vs TT</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {isVi ? 'Trung bình ngành: 21 ngày' : 'Industry average: 21 days'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs hover:shadow-soft-md hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isVi ? 'Tỷ lệ ứng viên đạt yêu cầu' : 'Qualified Rate'}
              </span>
              <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">96.8%</span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded-md">+18%</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {isVi ? 'Sàng lọc qua 3 tầng thuật toán' : 'Filtered via 3-layer neural parser'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs hover:shadow-soft-md hover:-translate-y-1 hover:border-teal-300 dark:hover:border-teal-500/50 transition-all duration-300 space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isVi ? 'Hồ sơ đã xử lý tự động' : 'Screened Profiles'}
              </span>
              <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">1,420+</span>
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/70 px-1.5 py-0.5 rounded-md">24/7 AI</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {isVi ? 'Tự động bóc tách kỹ năng & ATS' : 'Automated entity & skills extraction'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs hover:shadow-soft-md hover:-translate-y-1 hover:border-amber-300 dark:hover:border-amber-500/50 transition-all duration-300 space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isVi ? 'Tiết kiệm chi phí' : 'Recruiting Savings'}
              </span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">65%</span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 px-1.5 py-0.5 rounded-md">ROI 4.8x</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {isVi ? 'So với thuê headhunt truyền thống' : 'Compared to traditional headhunters'}
            </p>
          </div>
        </div>

        {/* ⚡ Enterprise Kanban Board Container */}
        <div className="bg-white dark:bg-slate-950/90 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-soft-xl dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] space-y-6 transition-colors duration-300">
          
          {/* 1. Pipeline Switcher Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 mr-1">
                {isVi ? 'Vị trí tuyển dụng:' : 'Job Pipeline:'}
              </span>
              {PIPELINES.map((pipe) => (
                <button
                  key={pipe.id}
                  type="button"
                  onClick={() => setActivePipeline(pipe.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2.5 ${
                    activePipeline === pipe.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-soft-md shadow-emerald-500/20 scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <span>{isVi ? pipe.titleVi : pipe.titleEn}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activePipeline === pipe.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {pipe.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
              <button 
                type="button"
                onClick={handleRescan}
                disabled={isRescanning}
                className="ai-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-soft cursor-pointer active:scale-95 transition-transform overflow-hidden relative text-white"
                title={isVi ? 'Quét lại toàn bộ ứng viên theo tiêu chí JD mới' : 'Rescan all candidates against latest JD criteria'}
              >
                <div className="shimmer-sweep" />
                <RefreshCw className={`w-3.5 h-3.5 ${isRescanning ? 'animate-spin' : ''}`} />
                <span>{isRescanning ? (isVi ? 'Đang phân tích...' : 'Scanning...') : t.employer.btnRescanAll}</span>
              </button>
            </div>
          </div>

          {/* 2. Interactive Search & Quick Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isVi ? 'Tìm ứng viên theo tên, kỹ năng (PyTorch, Go)...' : 'Search by candidate name, skill...'}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-soft-2xs">
                <button
                  type="button"
                  onClick={() => setMinScoreFilter(0)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    minScoreFilter === 0
                      ? 'bg-slate-100 dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isVi ? 'Tất cả' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setMinScoreFilter(95)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    minScoreFilter === 95
                      ? 'bg-slate-100 dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span>&gt; 95% Match</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.employer.autoFilterStatus}</span>
              </div>
            </div>
          </div>

          {/* 3. 4-Column Full Kanban Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {COLUMNS.map((col) => {
              const candidates = filteredColumns[col.id] || [];
              const dotColor = 
                col.id === 'new' ? 'bg-emerald-500' :
                col.id === 'screened' ? 'bg-teal-500' :
                col.id === 'interview' ? 'bg-indigo-500' : 'bg-amber-500';

              return (
                <div 
                  key={col.id} 
                  className="bg-slate-50/90 dark:bg-slate-900/80 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800/80 flex flex-col space-y-3 min-h-[460px] transition-colors"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        {isVi ? col.titleVi : col.titleEn}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full shadow-soft-2xs ${col.badgeColor}`}>
                      {candidates.length}
                    </span>
                  </div>

                  {/* Candidates Cards List */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {candidates.length === 0 ? (
                      <div className="h-40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                        <Users className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-1" />
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {isVi ? 'Chưa có hồ sơ phù hợp bộ lọc' : 'No candidates match filters'}
                        </p>
                      </div>
                    ) : (
                      candidates.map((cand) => (
                        <div 
                          key={cand.id}
                          onClick={() => setSelectedCandidate(cand)}
                          className="bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 space-y-3 transition-all duration-200 cursor-pointer hover:border-emerald-500/70 dark:hover:border-emerald-500 hover:shadow-soft-md hover:-translate-y-0.5 group relative"
                        >
                          {/* Top: Avatar, Name, Company Badge, Score */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative shrink-0">
                                <img 
                                  src={cand.avatar} 
                                  alt={cand.name}
                                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-emerald-500/80 transition-all"
                                />
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors truncate">
                                  {cand.name}
                                </h5>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate block">
                                  {cand.prevCompany}
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0">
                              {cand.score}% Match
                            </span>
                          </div>

                          {/* Role & Experience */}
                          <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                            {cand.role}
                          </div>

                          {/* Skills Tags */}
                          <div className="flex flex-wrap gap-1">
                            {cand.skills.slice(0, 3).map((skill) => (
                              <span 
                                key={skill} 
                                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-semibold rounded-md"
                              >
                                {skill}
                              </span>
                            ))}
                            {cand.skills.length > 3 && (
                              <span className="px-1 py-0.5 text-[9px] font-bold text-slate-400">
                                +{cand.skills.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Column Contextual Detail */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                            {col.id === 'new' && (
                              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>ATS: {cand.atsScore}/100</span>
                              </span>
                            )}

                            {col.id === 'screened' && (
                              <span className="flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400">
                                <Sparkles className="w-3 h-3" />
                                <span>AI Verified 100%</span>
                              </span>
                            )}

                            {col.id === 'interview' && (
                              <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                                <Calendar className="w-3 h-3 shrink-0" />
                                <span className="truncate">{isVi ? cand.interviewTimeVi : cand.interviewTimeEn}</span>
                              </span>
                            )}

                            {col.id === 'offer' && (
                              <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 truncate">
                                <Award className="w-3 h-3 shrink-0" />
                                <span className="truncate">{isVi ? cand.offerDetailVi : cand.offerDetailEn}</span>
                              </span>
                            )}

                            {/* Move Forward Action Button */}
                            {col.id !== 'offer' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveCandidate(cand.id, col.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-all px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-lg cursor-pointer ml-auto flex items-center gap-1 text-[10px] font-bold shadow-soft-2xs"
                                title={isVi ? 'Chuyển sang giai đoạn tiếp theo' : 'Move to next stage'}
                              >
                                <span>{isVi ? 'Chuyển' : 'Move'}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* 3 Key Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 space-y-3 hover:border-emerald-300 dark:hover:border-emerald-500/50 shadow-soft-xs hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center font-bold group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-soft-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">{t.employer.feature1Title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.employer.feature1Desc}
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 space-y-3 hover:border-indigo-300 dark:hover:border-indigo-500/50 shadow-soft-xs hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center font-bold group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-soft-2xs">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">{t.employer.feature2Title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.employer.feature2Desc}
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 space-y-3 hover:border-teal-300 dark:hover:border-teal-500/50 shadow-soft-xs hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center font-bold group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-soft-2xs">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">{t.employer.feature3Title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.employer.feature3Desc}
            </p>
          </div>
        </div>

      </div>

      {/* 4. Candidate Dossier Quick-View Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div 
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-2xl shadow-soft-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative my-auto animate-scale-up transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedCandidate.avatar} 
                  alt={selectedCandidate.name} 
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/60"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {selectedCandidate.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {selectedCandidate.score}% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedCandidate.role} • {selectedCandidate.prevCompany}
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 text-xs overflow-y-auto max-h-[75vh]">
              
              {/* AI Evaluation Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isVi ? 'Đánh giá chuyên sâu từ AI' : 'AI In-Depth Candidate Evaluation'}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {isVi ? selectedCandidate.aiVerdictVi : selectedCandidate.aiVerdictEn}
                </p>
              </div>

              {/* Score Breakdown Bars */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  {isVi ? 'Phân bổ năng lực kỹ thuật' : 'Competency Breakdown'}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
                      <span>{isVi ? 'Kỹ năng công nghệ' : 'Tech Stack'}</span>
                      <span className="font-bold text-emerald-600">{selectedCandidate.breakdown.tech}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedCandidate.breakdown.tech}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
                      <span>{isVi ? 'Kinh nghiệm thực chiến' : 'Hands-on Exp'}</span>
                      <span className="font-bold text-teal-600">{selectedCandidate.breakdown.exp}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${selectedCandidate.breakdown.exp}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
                      <span>{isVi ? 'Học vấn & Chứng chỉ' : 'Education & Certs'}</span>
                      <span className="font-bold text-indigo-600">{selectedCandidate.breakdown.edu}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedCandidate.breakdown.edu}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
                      <span>{isVi ? 'Giao tiếp & Văn hóa' : 'Culture & Soft skills'}</span>
                      <span className="font-bold text-amber-600">{selectedCandidate.breakdown.soft}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${selectedCandidate.breakdown.soft}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  {isVi ? 'Kỹ năng trích xuất từ CV' : 'Extracted Candidate Skills'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    showToast(isVi ? `Đã gửi lời mời phỏng vấn Google Meet tới ${selectedCandidate.name}!` : `Sent Google Meet interview invitation to ${selectedCandidate.name}!`);
                    setSelectedCandidate(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-soft cursor-pointer transition-all active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Lên lịch phỏng vấn' : 'Schedule Interview'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast(isVi ? `Đã gửi văn bản Offer điện tử cho ${selectedCandidate.name}!` : `Dispatched official offer letter to ${selectedCandidate.name}!`);
                    setSelectedCandidate(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-soft cursor-pointer transition-all active:scale-95"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Phát hành Offer' : 'Extend Offer'}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
};
