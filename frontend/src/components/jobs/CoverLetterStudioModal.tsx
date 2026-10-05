import React, { useState, useEffect, useMemo } from 'react';
import type { Job } from '../../data/mockData';
import { 
  X, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Wand2, 
  Building2, 
  Briefcase, 
  CheckCircle2, 
  FileText,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
  Star
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CompanyLogo } from '../ui/CompanyLogo';

interface CoverLetterStudioModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApplicationSubmitted?: (job: Job) => void;
}

type LetterTone = 'professional' | 'passionate' | 'technical' | 'concise';

interface FocusPillar {
  id: string;
  nameVi: string;
  nameEn: string;
}

const FOCUS_PILLARS: FocusPillar[] = [
  { id: 'distributed', nameVi: 'Hệ thống phân tán & Chịu tải cao', nameEn: 'Distributed High-Scale Architecture' },
  { id: 'leadership', nameVi: 'Kỹ năng dẫn dắt & Mentoring nhóm', nameEn: 'Leadership & Engineering Mentorship' },
  { id: 'genai', nameVi: 'Ứng dụng GenAI, LLM & RAG thực tiễn', nameEn: 'Practical GenAI & LLM / RAG Integration' },
  { id: 'business', nameVi: 'Tác động kinh doanh & Tối ưu chi phí', nameEn: 'Business Impact & Cost Optimization' }
];

export const CoverLetterStudioModal: React.FC<CoverLetterStudioModalProps> = ({
  job,
  isOpen,
  onClose,
  onApplicationSubmitted
}) => {
  if (!isOpen || !job) return null;

  const { language } = useLanguage();
  const isVi = language === 'vi';
  const { user, applyJob } = useAuth();

  const candidateName = user?.name || (isVi ? 'Nguyễn Văn An' : 'Nguyen Van An');
  const candidateTitle = user?.title || 'Senior Software Engineer';

  const [tone, setTone] = useState<LetterTone>('professional');
  const [selectedPillars, setSelectedPillars] = useState<string[]>(['distributed', 'genai']);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');

  // Generate tailored content based on Tone, Pillars, Candidate and Job
  const generateLetterContent = (currentTone: LetterTone, pillars: string[]) => {
    const topSkills = job.skills.slice(0, 3).join(', ');
    const company = job.company;
    const title = job.title;

    let intro = '';
    let body = '';
    let conclusion = '';

    if (isVi) {
      if (currentTone === 'professional') {
        intro = `Kính gửi Ban Giám đốc Kỹ thuật & Bộ phận Tuyển dụng ${company},\n\nTôi viết thư này để chính thức bày tỏ sự quan tâm sâu sắc đối với vị trí ${title} tại ${company}. Với hơn 4 năm kinh nghiệm thực chiến trong việc thiết kế kiến trúc phần mềm, phát triển các giải pháp số hóa quy mô lớn và ứng dụng các công nghệ chủ chốt bao gồm ${topSkills}, tôi tin tưởng năng lực chuyên môn của mình sẽ tạo ra giá trị thiết thực và đồng hành cùng sự phát triển bền vững của quý công ty.`;
      } else if (currentTone === 'passionate') {
        intro = `Kính gửi Đội ngũ Tuyển dụng tràn đầy nhiệt huyết tại ${company},\n\nTôi đã theo dõi hành trình kiến tạo những sản phẩm công nghệ đột phá của ${company} trong suốt thời gian qua và vô cùng hào hứng khi ứng tuyển vào vị trí ${title}. Là một kỹ sư luôn đam mê giải quyết những bài toán thách thức bằng ${topSkills}, tôi khát khao được đem năng lượng và tư duy đổi mới sáng tạo để cùng ${company} chinh phục những cột mốc bứt phá mới.`;
      } else if (currentTone === 'technical') {
        intro = `Kính gửi Hiring Manager & Hội đồng Kỹ thuật ${company},\n\nTôi xin gửi hồ sơ ứng tuyển vị trí ${title}. Xuất phát điểm từ nền tảng vững chắc về khoa học máy tính và tư duy tối ưu hóa hiệu năng hệ thống chuyên sâu với ${topSkills}, tôi tự tin đáp ứng trọn vẹn và vượt mức các tiêu chuẩn kỹ thuật khắt khe mà ${company} đang tìm kiếm cho dự án trọng điểm này.`;
      } else {
        intro = `Kính gửi Bộ phận Tuyển dụng ${company},\n\nTôi xin ứng tuyển vị trí ${title}. Với năng lực vững vàng về ${topSkills} và kinh nghiệm triển khai thành công nhiều dự án thực tế, tôi xin tóm tắt những đóng góp then chốt mà tôi có thể mang lại cho ${company}:`;
      }

      // Pillar specific bullet points
      const bullets: string[] = [];
      if (pillars.includes('distributed')) {
        bullets.push(`• Kiến trúc phân tán & Độ tin cậy: Từng trực tiếp thiết kế hệ thống Microservices xử lý hơn 15,000+ RPM, duy trì SLA 99.98% và giảm thời gian phản hồi (latency) trung bình tới 35%.`);
      }
      if (pillars.includes('leadership')) {
        bullets.push(`• Dẫn dắt & Phát triển đội ngũ: Có kinh nghiệm điều phối sprint, chuẩn hóa quy trình CI/CD, hướng dẫn (mentoring) 4+ kỹ sư trẻ và xây dựng văn hóa code review chuẩn mực.`);
      }
      if (pillars.includes('genai')) {
        bullets.push(`• Đón đầu công nghệ GenAI: Chủ động ứng dụng các mô hình ngôn ngữ lớn (LLM), kỹ thuật RAG và Vector Database để tự động hóa các tác vụ phức tạp, nâng cao 40% hiệu suất vận hành.`);
      }
      if (pillars.includes('business')) {
        bullets.push(`• Tối ưu chi phí & Tác động doanh thu: Phân tích và tái cấu trúc hạ tầng đám mây giúp tiết kiệm 28% chi phí hàng tháng, đồng thời bảo đảm trải nghiệm người dùng mượt mà nhất.`);
      }

      if (bullets.length > 0) {
        body = `\n\nNhững kết quả nổi bật gắn liền với năng lực thực thi của tôi:\n${bullets.join('\n')}\n\n`;
      } else {
        body = `\n\nTrong suốt quá trình làm việc, tôi luôn đặt tính kỷ luật kỹ thuật, khả năng đọc hiểu nghiệp vụ sâu sắc và việc viết code sạch có kiểm thử tự động lên hàng đầu, giúp giảm thiểu tối đa lỗi phát sinh trên môi trường production.\n\n`;
      }

      conclusion = `Tôi rất mong muốn có cơ hội được tham gia buổi phỏng vấn chuyên sâu cùng quý công ty để trao đổi rõ hơn về cách tôi có thể hỗ trợ đội ngũ ${company} hiện thực hóa các mục tiêu kỹ thuật sắp tới.\n\nXin chân thành cảm ơn quý công ty đã dành thời gian xem xét hồ sơ!\n\nTrân trọng,\n${candidateName}\n${candidateTitle}`;

    } else {
      // English version
      if (currentTone === 'professional') {
        intro = `Dear Engineering Leadership & Hiring Team at ${company},\n\nI am writing to express my earnest enthusiasm for the ${title} position at ${company}. With over 4 years of hands-on experience architecting scalable software solutions and deep expertise in ${topSkills}, I am eager to leverage my technical domain expertise to advance your strategic objectives.`;
      } else if (currentTone === 'passionate') {
        intro = `Dear Talent Acquisition Team at ${company},\n\nHaving closely followed ${company}'s trailblazing milestones in the tech industry, I am energized to submit my application for the ${title} role. As an engineer passionate about shipping impactful products using ${topSkills}, I would love to contribute my creativity to your fast-growing engineering teams.`;
      } else if (currentTone === 'technical') {
        intro = `Dear Hiring Manager & Technical Evaluation Board at ${company},\n\nPlease accept this cover letter for the ${title} opening. With a rigorous foundation in distributed computing, automated quality assurance, and deep mastery across ${topSkills}, I am confident in my capacity to fulfill and exceed your technical benchmarks.`;
      } else {
        intro = `Dear Hiring Team at ${company},\n\nI am applying for the ${title} opportunity. Bringing proven technical competence in ${topSkills}, here is a concise breakdown of how I can add immediate value to ${company}:`;
      }

      const bullets: string[] = [];
      if (pillars.includes('distributed')) {
        bullets.push(`• Scalable Architecture: Designed high-throughput microservices handling 15,000+ RPM while maintaining 99.98% uptime and reducing P99 latency by 35%.`);
      }
      if (pillars.includes('leadership')) {
        bullets.push(`• Mentorship & Delivery: Orchestrated cross-functional Agile sprints, standardized automated CI/CD pipelines, and mentored 4+ junior engineers.`);
      }
      if (pillars.includes('genai')) {
        bullets.push(`• GenAI & Innovation: Integrated modern LLM pipelines, RAG retrieval frameworks, and vector search systems to boost operational team productivity by 40%.`);
      }
      if (pillars.includes('business')) {
        bullets.push(`• Cloud Cost Optimization: Re-architected cloud infrastructure, yielding a 28% monthly infrastructure cost reduction without sacrificing responsiveness.`);
      }

      if (bullets.length > 0) {
        body = `\n\nKey highlights from my professional track record:\n${bullets.join('\n')}\n\n`;
      } else {
        body = `\n\nThroughout my career, I have maintained high coding standards, comprehensive test coverage, and strict deployment rigor to ensure rock-solid production stability.\n\n`;
      }

      conclusion = `I look forward to discussing how my experience aligns with the technological vision at ${company}. Thank you very much for your time and consideration.\n\nWarm regards,\n${candidateName}\n${candidateTitle}`;
    }

    return intro + body + conclusion;
  };

  // Initialize or re-generate content
  useEffect(() => {
    setIsGenerating(true);
    const timer = setTimeout(() => {
      const generated = generateLetterContent(tone, selectedPillars);
      setContent(generated);
      setIsGenerating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [tone, selectedPillars, language, job.id]);

  // Word count & reading time
  const metrics = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(0.5, Math.round((words / 180) * 10) / 10);
    return { words, readTimeMinutes };
  }, [content]);

  const togglePillar = (id: string) => {
    setSelectedPillars(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCopy = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).catch(() => {});
      }
    } catch (e) {
      console.warn('Clipboard write fallback:', e);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `Cover_Letter_${candidateName.replace(/\s+/g, '_')}_${job.company.replace(/\s+/g, '_')}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleDirectApply = async () => {
    await applyJob({ id: job.id, title: job.title, company: job.company });
    setApplied(true);
    if (onApplicationSubmitted) {
      onApplicationSubmitted(job);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      data-testid="cover-letter-studio-modal"
    >
      <div 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-soft shrink-0">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isVi ? 'AI Cover Letter Studio' : 'AI Cover Letter Studio'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase">
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi ? 'Cá nhân hóa thư ứng tuyển đắt giá theo đúng JD của' : 'Tailor a high-impact cover letter for'}{' '}
                <strong className="text-slate-800 dark:text-slate-200">{job.company}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="btn-close-cover-letter-studio"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Target Job Quick Preview Strip */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CompanyLogo company={job.company} size="sm" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{job.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{job.company} • {job.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200/80 dark:border-emerald-800/60">
                {job.salary}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-black border border-teal-200/80 dark:border-teal-800/60">
                96% Match
              </span>
            </div>
          </div>

          {/* Controls Cluster: Tone & Focus Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Left: Tone Selection (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isVi ? '1. Giọng văn thư (Tone of Voice)' : '1. Tone of Voice'}</span>
              </label>

              <div className="space-y-1.5">
                {[
                  { id: 'professional', labelVi: 'Chuyên nghiệp & Tự tin (Enterprise)', labelEn: 'Professional & Confident' },
                  { id: 'passionate', labelVi: 'Nhiệt huyết & Đột phá (Startup)', labelEn: 'Passionate & High-Energy' },
                  { id: 'technical', labelVi: 'Kỹ thuật sâu & STAR Metrics', labelEn: 'Technical & STAR Metrics' },
                  { id: 'concise', labelVi: 'Ngắn gọn & Trực diện (C-Level)', labelEn: 'Concise & Direct' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`tone-option-${item.id}`}
                    onClick={() => setTone(item.id as LetterTone)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      tone === item.id
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 shadow-soft-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span>{isVi ? item.labelVi : item.labelEn}</span>
                    {tone === item.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Key Focus Pillars (7 cols) */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isVi ? '2. Điểm nhấn thế mạnh cần làm nổi bật' : '2. Key Focus Highlights'}</span>
                </label>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {selectedPillars.length}/4 {isVi ? 'đã chọn' : 'selected'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FOCUS_PILLARS.map((pillar) => {
                  const isChecked = selectedPillars.includes(pillar.id);
                  return (
                    <button
                      key={pillar.id}
                      type="button"
                      data-testid={`pillar-option-${pillar.id}`}
                      onClick={() => togglePillar(pillar.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span className="line-clamp-1 leading-snug">{isVi ? pillar.nameVi : pillar.nameEn}</span>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                        isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Generated Letter Live Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {isVi ? 'Nội dung thư hoàn chỉnh (Có thể chỉnh sửa trực tiếp)' : 'Generated Letter (Directly Editable)'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                <span data-testid="cover-letter-word-count">{metrics.words} {isVi ? 'từ' : 'words'}</span>
                <span>•</span>
                <span>~{metrics.readTimeMinutes} {isVi ? 'phút đọc' : 'min read'}</span>
              </div>
            </div>

            <div className="relative">
              {isGenerating && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs rounded-2xl flex items-center justify-center z-10 animate-fade-in">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-soft">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>{isVi ? 'AI đang cá nhân hóa thư ứng tuyển...' : 'AI synthesizing tailored letter...'}</span>
                  </div>
                </div>
              )}

              <textarea
                data-testid="textarea-cover-letter-content"
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm font-normal text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed custom-scrollbar transition-all"
              />
            </div>
          </div>

          {/* Application Submission State or Actions Bar */}
          {applied ? (
            <div 
              data-testid="cover-letter-applied-success"
              className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center space-y-2 animate-fade-in"
            >
              <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-sm font-black">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>{isVi ? 'Ứng tuyển thành công kèm Thư giới thiệu AI!' : 'Applied successfully with AI Cover Letter!'}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {isVi 
                  ? `Hồ sơ "${candidateName}" cùng thư giới thiệu đã được gửi trực tiếp đến hệ thống tuyển dụng của ${job.company}.`
                  : `Your profile and cover letter have been transmitted to ${job.company}'s HR system.`}
              </p>
            </div>
          ) : null}

        </div>

        {/* Footer Actions Row */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="btn-copy-cover-letter"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? (isVi ? 'Đã chép!' : 'Copied!') : (isVi ? 'Sao chép' : 'Copy')}</span>
            </button>

            <button
              type="button"
              data-testid="btn-download-cover-letter"
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5 text-slate-400" />}
              <span>{downloaded ? (isVi ? 'Đã tải!' : 'Downloaded!') : (isVi ? 'Tải TXT' : 'Download TXT')}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
            >
              {isVi ? 'Đóng' : 'Close'}
            </button>

            {!applied && (
              <button
                type="button"
                data-testid="btn-submit-application-with-letter"
                onClick={handleDirectApply}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-soft flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isVi ? 'Nộp hồ sơ kèm thư này ngay' : 'Apply Now with this Letter'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
