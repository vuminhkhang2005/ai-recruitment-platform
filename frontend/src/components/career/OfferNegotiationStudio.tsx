import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  Scale, 
  Copy, 
  Check, 
  Download, 
  Building2, 
  Gift, 
  Award, 
  ShieldCheck, 
  HelpCircle, 
  Zap, 
  ArrowRight,
  FileText,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface OfferPackage {
  company: string;
  monthlyBase: number; // VNĐ
  monthsPerYear: number; // e.g. 13 or 14
  annualBonus: number; // KPI bonus in VNĐ
  annualRsu: number; // Equity / Stock in VNĐ
  annualBenefits: number; // Health, allowances in VNĐ
}

export const OfferNegotiationStudio: React.FC<{ onFindMatchingJobs?: () => void }> = ({ onFindMatchingJobs }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Current package vs Target Offer package
  const [currentOffer, setCurrentOffer] = useState<OfferPackage>({
    company: isVi ? 'Công ty hiện tại' : 'Current Company',
    monthlyBase: 42000000,
    monthsPerYear: 13,
    annualBonus: 40000000,
    annualRsu: 0,
    annualBenefits: 25000000
  });

  const [newOffer, setNewOffer] = useState<OfferPackage>({
    company: 'VNG Corporation',
    monthlyBase: 62000000,
    monthsPerYear: 13,
    annualBonus: 90000000,
    annualRsu: 80000000,
    annualBenefits: 45000000
  });

  const [counterTargetPercent, setCounterTargetPercent] = useState<number>(12); // +12% counter-offer
  const [negotiationTone, setNegotiationTone] = useState<'value' | 'competitive' | 'benefits'>('value');
  const [copied, setCopied] = useState(false);

  // Computations
  const currentTC = useMemo(() => {
    const annualBase = currentOffer.monthlyBase * currentOffer.monthsPerYear;
    return annualBase + currentOffer.annualBonus + currentOffer.annualRsu + currentOffer.annualBenefits;
  }, [currentOffer]);

  const newTC = useMemo(() => {
    const annualBase = newOffer.monthlyBase * newOffer.monthsPerYear;
    return annualBase + newOffer.annualBonus + newOffer.annualRsu + newOffer.annualBenefits;
  }, [newOffer]);

  const tcDiff = newTC - currentTC;
  const tcPercentIncrease = currentTC > 0 ? Math.round((tcDiff / currentTC) * 100) : 0;

  // Counter proposal calculation
  const proposedBase = Math.round(newOffer.monthlyBase * (1 + counterTargetPercent / 100));
  const proposedTC = Math.round(newTC + (proposedBase - newOffer.monthlyBase) * newOffer.monthsPerYear);

  // Formatter
  const formatVnd = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + ' Tỷ VNĐ';
    }
    return (num / 1000000).toFixed(0) + ' Triệu VNĐ';
  };

  // AI Generated Counter-Offer Email Script
  const counterScript = useMemo(() => {
    if (isVi) {
      if (negotiationTone === 'value') {
        return `Kính gửi Ban Tuyển dụng & Tech Lead ${newOffer.company},

Trước hết, tôi xin chân thành cảm ơn Quý công ty đã đánh giá cao năng lực và gửi cho tôi thư mời làm việc (Job Offer). Tôi thực sự ấn tượng với định hướng phát triển sản phẩm cũng như văn hóa kỹ thuật cởi mở tại ${newOffer.company}.

Sau khi tìm hiểu kỹ lưỡng về yêu cầu trách nhiệm cũng như dựa trên năng lực chuyên môn và mức đóng góp tôi có thể tạo ra ngay trong quý đầu tiên, tôi xin phép được đề xuất mức lương cơ bản là ${formatVnd(proposedBase)}/tháng (tương đương ${formatVnd(proposedTC)}/năm tổng đãi ngộ).

Với kinh nghiệm xây dựng hệ thống chịu tải cao và kinh nghiệm dẫn dắt các dự án quy mô lớn, tôi tự tin sẽ giúp đội ngũ rút ngắn 30% thời gian triển khai tính năng và đảm bảo chất lượng hệ thống ở mức cao nhất.

Nếu mức điều chỉnh trên được đồng thuận, tôi sẵn sàng xác nhận nhận việc ngay và hoàn tất thủ tục bàn giao để gia nhập đội ngũ sớm nhất.

Rất mong nhận được phản hồi từ Quý công ty.
Trân trọng,
Vũ Minh Khang`;
      } else if (negotiationTone === 'competitive') {
        return `Kính gửi Ban Tuyển dụng ${newOffer.company},

Tôi xin chân thành cảm ơn Quý công ty đã gửi lời mời gia nhập đội ngũ. ${newOffer.company} luôn là một trong những lựa chọn hàng đầu trong định hướng sự nghiệp của tôi.

Hiện tại, tôi cũng đang nhận được một lời mời làm việc từ một tập đoàn công nghệ lớn khác với gói đãi ngộ ở mức ${formatVnd(proposedTC)}/năm. Tuy nhiên, tôi đánh giá cao môi trường kỹ thuật và các bài toán thách thức tại ${newOffer.company} hơn.

Để có thể an tâm đưa ra quyết định gắn bó lâu dài cùng công ty, tôi hy vọng có thể trao đổi thêm để nâng mức lương cơ bản lên ${formatVnd(proposedBase)}/tháng.

Rất hy vọng chúng ta có thể thống nhất được con số phù hợp cho cả hai bên.
Trân trọng,
Vũ Minh Khang`;
      } else {
        return `Kính gửi Ban Tuyển dụng ${newOffer.company},

Tôi xin cảm ơn Quý công ty đã gửi thư mời làm việc. Tôi đánh giá rất cao sự chuyên nghiệp và minh bạch trong suốt quy trình phỏng vấn vừa qua.

Về mức lương cơ bản ${formatVnd(newOffer.monthlyBase)}/tháng, tôi hoàn toàn tôn trọng khung ngân sách hiện tại của công ty. Tuy nhiên, để tạo điều kiện làm việc tối ưu và gắn kết lâu dài, tôi xin phép đề xuất bổ sung thêm quyền lợi:
1. Hỗ trợ chế độ Hybrid linh hoạt (2 ngày làm việc từ xa/tuần).
2. Hỗ trợ khoản Sign-on Bonus một lần trị giá ${formatVnd(proposedBase - newOffer.monthlyBase * 2)} hoặc nâng số ngày phép năm lên 16 ngày.

Tôi rất mong sớm có cơ hội được đồng hành và cống hiến cho sự phát triển của ${newOffer.company}.
Trân trọng,
Vũ Minh Khang`;
      }
    } else {
      return `Dear ${newOffer.company} Hiring Team,

Thank you very much for extending the offer. I am genuinely excited about the product vision and the high-impact engineering culture at ${newOffer.company}.

Based on my specialized background in scaling high-throughput architectures and the market benchmark for this role, I would like to propose a monthly base salary of ${formatVnd(proposedBase)} (Total Compensation of ${formatVnd(proposedTC)}/year).

At this rate, I am confident in delivering immediate value to the engineering roadmap and would be thrilled to sign the offer promptly.

Thank you for your consideration, and I look forward to your thoughts.
Warm regards,
Vu Minh Khang`;
    }
  }, [isVi, negotiationTone, newOffer, proposedBase, proposedTC]);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(counterScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([counterScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Counter_Offer_${newOffer.company.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 animate-fade-in" data-testid="offer-negotiation-studio">
      
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-800/60 text-white shadow-soft-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>{isVi ? 'So Sánh Offer & Tính Tổng Thu Nhập (Total Compensation)' : 'Offer Comparison & Total Compensation Calculator'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {isVi ? 'Đánh Giá Gói Đãi Ngộ Toàn Diện & Kịch Bản Đàm Phán' : 'Comprehensive Total Compensation & Smart Counter-Offers'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isVi 
                ? 'Tính toán chính xác Tổng thu nhập năm (TC = Lương cứng + Thưởng KPI + Cổ phần RSU + Quyền lợi), so sánh mức tăng trưởng thu nhập thực tế và gợi ý kịch bản trao đổi chuyên nghiệp.' 
                : 'Calculate your true Total Compensation (TC = Base + Bonus + Equity + Perks), evaluate income growth, and generate tailored counter-offer negotiation scripts.'}
            </p>
          </div>

          {/* Quick TC Delta Card */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-right shrink-0 min-w-[220px]">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              {isVi ? 'Tăng trưởng đãi ngộ' : 'Income Uplift'}
            </span>
            <div className="flex items-baseline justify-end gap-1.5 mt-1">
              <span className="text-3xl font-black text-emerald-400">+{tcPercentIncrease}%</span>
              <span className="text-xs font-bold text-slate-200">({formatVnd(tcDiff)}/năm)</span>
            </div>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black">
              {isVi ? '🔥 Top 12% Thị trường Tech' : '🔥 Top 12% in Market'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Offer Package Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column A: Current Package */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                A
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isVi ? 'Thu Nhập Hiện Tại' : 'Current Compensation'}
                </h3>
                <p className="text-[11px] text-slate-400">{currentOffer.company}</p>
              </div>
            </div>
            <span className="text-xs font-black text-slate-600 dark:text-slate-300">
              {formatVnd(currentTC)}/năm
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                {isVi ? 'Tên công ty / Vị trí hiện tại' : 'Company / Current Role'}
              </label>
              <input
                type="text"
                data-testid="input-current-company"
                value={currentOffer.company}
                onChange={(e) => setCurrentOffer({ ...currentOffer, company: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {isVi ? 'Lương cứng/tháng (VNĐ)' : 'Base Monthly (VNĐ)'}
                </label>
                <input
                  type="number"
                  data-testid="input-current-base"
                  step="1000000"
                  value={currentOffer.monthlyBase}
                  onChange={(e) => setCurrentOffer({ ...currentOffer, monthlyBase: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {isVi ? 'Số tháng lương/năm' : 'Months / Year'}
                </label>
                <select
                  value={currentOffer.monthsPerYear}
                  onChange={(e) => setCurrentOffer({ ...currentOffer, monthsPerYear: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value={12}>12 tháng (Chuẩn)</option>
                  <option value={13}>13 tháng (Tháng 13)</option>
                  <option value={14}>14 tháng</option>
                  <option value={15}>15 tháng</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {isVi ? 'Thưởng KPI/năm (VNĐ)' : 'Annual Bonus (VNĐ)'}
                </label>
                <input
                  type="number"
                  step="5000000"
                  value={currentOffer.annualBonus}
                  onChange={(e) => setCurrentOffer({ ...currentOffer, annualBonus: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {isVi ? 'Phúc lợi/năm (Bảo hiểm, phụ cấp)' : 'Annual Perks & Benefits'}
                </label>
                <input
                  type="number"
                  step="5000000"
                  value={currentOffer.annualBenefits}
                  onChange={(e) => setCurrentOffer({ ...currentOffer, annualBenefits: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Column B: New Job Offer */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-emerald-500/50 shadow-soft-sm space-y-4 relative">
          <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
            {isVi ? 'Offer Mới Đang Cân Nhắc' : 'Target Offer'}
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                B
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {newOffer.company}
                </h3>
                <p className="text-[11px] text-emerald-600 font-semibold">{isVi ? 'Gói đãi ngộ đầy đủ' : 'Full Package'}</p>
              </div>
            </div>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {formatVnd(newTC)}/năm
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                {isVi ? 'Tên công ty tuyển dụng' : 'Hiring Company'}
              </label>
              <input
                type="text"
                data-testid="input-new-company"
                value={newOffer.company}
                onChange={(e) => setNewOffer({ ...newOffer, company: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {isVi ? 'Lương cứng/tháng (VNĐ)' : 'Base Monthly (VNĐ)'}
                </label>
                <input
                  type="number"
                  data-testid="input-new-base"
                  step="1000000"
                  value={newOffer.monthlyBase}
                  onChange={(e) => setNewOffer({ ...newOffer, monthlyBase: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 font-black focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {isVi ? 'Số tháng lương/năm' : 'Months / Year'}
                </label>
                <select
                  value={newOffer.monthsPerYear}
                  onChange={(e) => setNewOffer({ ...newOffer, monthsPerYear: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value={12}>12 tháng (Chuẩn)</option>
                  <option value={13}>13 tháng (Tháng 13)</option>
                  <option value={14}>14 tháng</option>
                  <option value={15}>15 tháng</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {isVi ? 'Thưởng KPI' : 'Bonus'}
                </label>
                <input
                  type="number"
                  step="5000000"
                  value={newOffer.annualBonus}
                  onChange={(e) => setNewOffer({ ...newOffer, annualBonus: Number(e.target.value) })}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {isVi ? 'RSU / Cổ phần' : 'RSU / Stock'}
                </label>
                <input
                  type="number"
                  step="10000000"
                  value={newOffer.annualRsu}
                  onChange={(e) => setNewOffer({ ...newOffer, annualRsu: Number(e.target.value) })}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {isVi ? 'Phúc lợi & Bảo hiểm' : 'Perks & Health'}
                </label>
                <input
                  type="number"
                  step="5000000"
                  value={newOffer.annualBenefits}
                  onChange={(e) => setNewOffer({ ...newOffer, annualBenefits: Number(e.target.value) })}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Counter-Offer Negotiation Script */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isVi ? 'Kịch Bản Đàm Phán Lương (Mẫu gợi ý)' : 'Strategic Counter-Offer Script'}
              </h3>
              <p className="text-xs text-slate-500">
                {isVi ? 'Lập luận thuyết phục dựa trên đóng góp chuyên môn và định vị thị trường' : 'Persuasive reasoning anchored on business value and compensation benchmarks'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="btn-copy-counter-script"
              onClick={handleCopyScript}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isVi ? 'Đã sao chép!' : 'Copied!') : (isVi ? 'Sao chép thư' : 'Copy Script')}</span>
            </button>

            <button
              type="button"
              data-testid="btn-download-counter-script"
              onClick={handleDownloadTxt}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{isVi ? 'Tải file TXT' : 'Download TXT'}</span>
            </button>
          </div>
        </div>

        {/* Tone and Target Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
          
          {/* Tone Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {isVi ? 'Chiến lược đàm phán chính:' : 'Negotiation Strategy / Tone:'}
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                data-testid="tone-btn-value"
                onClick={() => setNegotiationTone('value')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  negotiationTone === 'value'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-soft-2xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                {isVi ? '💡 Giá trị cao' : '💡 Value-driven'}
              </button>

              <button
                type="button"
                data-testid="tone-btn-competitive"
                onClick={() => setNegotiationTone('competitive')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  negotiationTone === 'competitive'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-soft-2xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                {isVi ? '⚔️ Cạnh tranh' : '⚔️ Competing'}
              </button>

              <button
                type="button"
                data-testid="tone-btn-benefits"
                onClick={() => setNegotiationTone('benefits')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  negotiationTone === 'benefits'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-soft-2xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                {isVi ? '🏖️ Phúc lợi/WFH' : '🏖️ WFH & Perks'}
              </button>
            </div>
          </div>

          {/* Counter Target % */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>{isVi ? 'Mức đề xuất tăng thêm (Counter Target):' : 'Counter Target Uplift:'}</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-black">
                +{counterTargetPercent}% ({formatVnd(proposedBase)}/tháng)
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={counterTargetPercent}
              onChange={(e) => setCounterTargetPercent(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>+5% (An toàn)</span>
              <span>+12% (Khuyến nghị chuẩn)</span>
              <span>+25% (Đột phá)</span>
            </div>
          </div>

        </div>

        {/* Live Script Preview Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {isVi ? 'Nội dung thư điện tử phản hồi sẵn sàng gửi:' : 'Ready-to-Send Email Script:'}
          </label>
          <div 
            data-testid="counter-script-preview"
            className="p-5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800 whitespace-pre-wrap selection:bg-emerald-500 selection:text-white"
          >
            {counterScript}
          </div>
        </div>

        {/* 4 Golden Rules Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Chờ văn bản chính thức</span>
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Chỉ bắt đầu đàm phán khi đã có Written Offer chính thức từ HR.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 space-y-1">
            <span className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span>Nhìn vào Total Comp (TC)</span>
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Đừng chỉ nhìn lương cơ bản, tính cả thưởng, RSU và chính sách bảo hiểm.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-1">
            <span className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Gắn với Giá trị tạo ra</span>
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Chứng minh mức lương đề xuất sẽ mang lại ROI vượt trội cho công ty.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-1">
            <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Thái độ xây dựng</span>
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Thể hiện sự hào hứng muốn gia nhập và tinh thần hợp tác tích cực.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
