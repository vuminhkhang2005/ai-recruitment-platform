import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Wand2, 
  Check, 
  Copy, 
  ShieldCheck, 
  CheckCircle2, 
  Briefcase, 
  Zap, 
  Sliders, 
  Eye, 
  ArrowRight,
  TrendingUp,
  Scale
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface GeneratedJdContent {
  description: string;
  requirements: string;
  benefits: string;
}

interface JobDescriptionStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: string;
  initialLevel?: string;
  initialSkills?: string[];
  onApplyJd: (content: GeneratedJdContent) => void;
}

export const JobDescriptionStudioModal: React.FC<JobDescriptionStudioModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'Senior AI Engineer',
  initialLevel = 'Senior',
  initialSkills = ['Python', 'PyTorch', 'FastAPI'],
  onApplyJd
}) => {
  if (!isOpen) return null;

  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [roleTitle, setRoleTitle] = useState(initialRole || 'Senior AI Engineer');
  const [level, setLevel] = useState(initialLevel || 'Senior');
  const [cultureTone, setCultureTone] = useState<'enterprise' | 'startup' | 'rnd'>('rnd');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic JD Generation Output
  const [generatedDesc, setGeneratedDesc] = useState(() => {
    return isVi 
      ? `Chúng tôi đang tìm kiếm một ${roleTitle} (${level}) xuất sắc đồng hành cùng đội ngũ kỹ thuật chủ lực. Tại vị trí này, bạn sẽ trực tiếp tham gia thiết kế, tối ưu hóa và đưa các giải pháp vào hệ thống sản phẩm phục vụ hàng triệu người dùng, dẫn dắt các thử nghiệm công nghệ đột phá.`
      : `We are seeking an exceptional ${roleTitle} (${level}) to join our core engineering organization. In this high-impact role, you will architect, scale, and maintain mission-critical production systems serving millions of daily active users.`;
  });

  const [generatedReqs, setGeneratedReqs] = useState(() => {
    return isVi
      ? `- Tối thiểu 3-5 năm kinh nghiệm thực chiến phát triển với ${initialSkills.slice(0, 3).join(', ')}.\n- Hiểu biết chuyên sâu về kiến trúc Microservices chịu tải cao và tối ưu độ trễ.\n- Tư duy giải quyết vấn đề hướng sản phẩm, thành thạo CI/CD và văn hóa Agile/Scrum.\n- Tinh thần chủ động, khả năng cố vấn kỹ thuật và review code cho các kỹ sư trẻ.`
      : `- 3-5+ years hands-on production experience in ${initialSkills.slice(0, 3).join(', ')}.\n- Deep understanding of distributed high-throughput microservices and latency optimization.\n- Strong product-driven mindset with proven track record in Agile/Scrum and CI/CD.\n- Proactive communicator with leadership capability to mentor junior engineers.`;
  });

  const [generatedBenefits, setGeneratedBenefits] = useState(() => {
    return isVi
      ? `- Thu nhập cạnh tranh hàng đầu thị trường + Thưởng hiệu suất KPI năm từ 2-4 tháng lương.\n- Chế độ làm việc Hybrid linh hoạt (hỗ trợ 2 ngày WFH/tuần) cùng gói thiết bị MacBook Pro cao cấp.\n- Gói bảo hiểm sức khỏe quốc tế cao cấp cho nhân viên và người thân.\n- Ngân sách đào tạo phát triển cá nhân lên tới 30.000.000 VNĐ/năm.`
      : `- Top-tier market remuneration package + 2-4 months performance bonus.\n- Flexible Hybrid work model (2 days WFH/week) + high-end M-series MacBook Pro workstation.\n- Comprehensive international private health insurance for employee and direct family.\n- Annual personal learning & growth stipend up to $1,500.`;
  });

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (isVi) {
        if (cultureTone === 'startup') {
          setGeneratedDesc(`Gia nhập đội ngũ kiến tạo tương lai tại vị trí ${roleTitle}. Với vai trò ${level}, bạn sẽ có toàn quyền quyết định về mặt kỹ thuật, làm chủ kiến trúc sản phẩm từ con số 0 đến quy mô hàng triệu người dùng với tốc độ triển khai vượt trội.`);
          setGeneratedReqs(`- Năng lực học hỏi công nghệ mới cực nhanh và tinh thần "Get Things Done".\n- Kinh nghiệm vững vàng với ${initialSkills.join(', ')} trong môi trường tăng trưởng nóng.\n- Tư duy kiến trúc linh hoạt, sẵn sàng nhận trách nhiệm toàn diện cho hệ thống sản phẩm.\n- Khả năng phối hợp nhịp nhàng cùng Product Manager và Designer.`);
        } else if (cultureTone === 'enterprise') {
          setGeneratedDesc(`Chúng tôi tìm kiếm nhân sự cấp cao đảm nhiệm vị trí ${roleTitle} cho hạ tầng doanh nghiệp đa quốc gia. Bạn sẽ định hình chuẩn mực kỹ thuật, thiết kế giải pháp quy mô lớn và đảm bảo tính sẵn sàng cao 99.99%.`);
          setGeneratedReqs(`- Tối thiểu 5+ năm kinh nghiệm kiến trúc hệ thống cấp doanh nghiệp.\n- Thành thạo ${initialSkills.join(', ')}, hiểu biết sâu sắc về bảo mật và quy chuẩn quốc tế.\n- Kinh nghiệm làm việc trong môi trường đa quốc gia và quy trình quản trị kỹ thuật nghiêm ngặt.`);
        } else {
          setGeneratedDesc(`Trung tâm Nghiên cứu & Phát triển (R&D Lab) đang tuyển chọn ${roleTitle} đầu ngành. Bạn sẽ chủ trì các bài toán nghiên cứu chuyên sâu, tối ưu thuật toán và xây dựng công nghệ thế hệ tiếp theo.`);
          setGeneratedReqs(`- Nền tảng toán học và khoa học máy tính xuất sắc cùng ${initialSkills.join(', ')}.\n- Khả năng đọc hiểu và hiện thực hóa các bài báo khoa học hàng đầu (Top-tier conferences).\n- Thành thạo tối ưu hiệu năng suy luận và phân tích định lượng.`);
        }
      } else {
        setGeneratedDesc(`Join our high-velocity team as ${roleTitle} (${level}). You will have strong architectural ownership, innovating from concept to high-throughput scale.`);
        setGeneratedReqs(`- Proven production track record with ${initialSkills.join(', ')}.\n- Strong architectural intuition, concurrency handling, and system resilience.\n- Passion for mentorship, code craftsmanship, and iterative deployment.`);
      }
    }, 600);
  };

  const handleApply = () => {
    onApplyJd({
      description: generatedDesc,
      requirements: generatedReqs,
      benefits: generatedBenefits
    });
    onClose();
  };

  const handleCopy = () => {
    const fullText = `${generatedDesc}\n\nYêu cầu:\n${generatedReqs}\n\nQuyền lợi:\n${generatedBenefits}`;
    navigator.clipboard?.writeText?.(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      data-testid="job-description-studio-modal"
    >
      <div 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative animate-scale-up custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-soft">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isVi ? 'AI Job Description Studio & Tối Ưu Tuyển Dụng' : 'AI Job Description Studio & Audit'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                  Gemini 2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi ? 'Tự động sinh JD chuẩn quốc tế, kiểm định tính bao hàm và tối ưu SEO' : 'Generate recruiter JDs with readability and inclusivity scoring'}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="btn-close-jd-studio"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          
          {/* Controls Bar: Role & Tone Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isVi ? 'Vị trí & Cấp bậc' : 'Role Title & Level'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    data-testid="input-jd-studio-role"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Middle">Middle</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isVi ? 'Định hướng văn hóa tuyển dụng' : 'Culture & Mission Tone'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    data-testid="tone-rnd"
                    onClick={() => setCultureTone('rnd')}
                    className={`py-1.5 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer truncate ${
                      cultureTone === 'rnd'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🔬 R&D Lab
                  </button>
                  <button
                    type="button"
                    data-testid="tone-startup"
                    onClick={() => setCultureTone('startup')}
                    className={`py-1.5 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer truncate ${
                      cultureTone === 'startup'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🚀 Startup
                  </button>
                  <button
                    type="button"
                    data-testid="tone-enterprise"
                    onClick={() => setCultureTone('enterprise')}
                    className={`py-1.5 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer truncate ${
                      cultureTone === 'enterprise'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🏢 Enterprise
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                {isVi ? 'Kỹ năng áp dụng:' : 'Applied Skills:'} <strong className="text-slate-700 dark:text-slate-200">{initialSkills.join(', ')}</strong>
              </span>

              <button
                type="button"
                data-testid="btn-regenerate-jd"
                disabled={isGenerating}
                onClick={handleRegenerate}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-soft active:scale-95 transition-all"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? (isVi ? 'Đang viết lại...' : 'Writing...') : (isVi ? 'Viết lại bằng AI' : 'Regenerate')}</span>
              </button>
            </div>
          </div>

          {/* AI Quality Audit Score Pill Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">{isVi ? 'Điểm Dễ Đọc (Flesch)' : 'Readability'}</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">98/100</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">{isVi ? 'Tính Bao Hàm (Inclusivity)' : 'Inclusivity'}</span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400">100%</span>
              </div>
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
            </div>

            <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">{isVi ? 'Mức Độ Khớp SEO' : 'SEO Keyword Match'}</span>
                <span className="text-base font-black text-teal-600 dark:text-teal-400">95%</span>
              </div>
              <TrendingUp className="w-5 h-5 text-teal-500" />
            </div>
          </div>

          {/* Generated Sections Review */}
          <div className="space-y-3.5">
            {/* 1. Overview */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                {isVi ? '1. Giới thiệu vai trò & Tầm nhìn (Role Overview)' : '1. Role Overview'}
              </label>
              <textarea
                rows={3}
                data-testid="jd-preview-desc"
                value={generatedDesc}
                onChange={(e) => setGeneratedDesc(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 leading-relaxed font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 2. Requirements */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                {isVi ? '2. Yêu cầu năng lực cốt lõi (Requirements)' : '2. Key Requirements'}
              </label>
              <textarea
                rows={4}
                data-testid="jd-preview-reqs"
                value={generatedReqs}
                onChange={(e) => setGeneratedReqs(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 leading-relaxed font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 3. Benefits */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                {isVi ? '3. Đãi ngộ & Phúc lợi (Benefits)' : '3. Compensation & Perks'}
              </label>
              <textarea
                rows={3}
                data-testid="jd-preview-benefits"
                value={generatedBenefits}
                onChange={(e) => setGeneratedBenefits(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 leading-relaxed font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              data-testid="btn-copy-full-jd"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isVi ? 'Đã sao chép!' : 'Copied!') : (isVi ? 'Sao chép văn bản' : 'Copy All')}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {isVi ? 'Hủy' : 'Cancel'}
              </button>

              <button
                type="button"
                data-testid="btn-apply-ai-jd"
                onClick={handleApply}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl shadow-soft flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>{isVi ? 'Áp Dụng Vào Tin Tuyển Dụng' : 'Apply to Job Post'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
