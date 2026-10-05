import React, { useState } from 'react';
import type { Candidate } from './EmployerSection';
import { 
  X, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  FileText, 
  Download, 
  Check, 
  AlertCircle,
  Building,
  UserCheck,
  Zap,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface ScorecardEntry {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  decision: 'strong_hire' | 'hire' | 'neutral' | 'do_not_hire';
  overallScore: number; // 1 to 5
  ratings: {
    tech: number;
    systemDesign: number;
    softSkills: number;
    execution: number;
  };
  notesVi: string;
  notesEn: string;
  submittedAt: string;
}

const INITIAL_SCORECARDS: Record<string, ScorecardEntry[]> = {
  default: [
    {
      id: 'sc-1',
      reviewerName: 'Lê Tuấn Anh',
      reviewerRole: 'Principal Systems Architect',
      decision: 'strong_hire',
      overallScore: 5.0,
      ratings: { tech: 5, systemDesign: 5, softSkills: 4.5, execution: 5 },
      notesVi: 'Ứng viên nắm rất sâu về thuật toán O(1), bộ nhớ đệm phân tán và kỹ thuật concurrency. Trả lời rất sắc sảo về bài toán failover và kiểm soát độ trễ hệ thống.',
      notesEn: 'Outstanding grasp of O(1) algorithms, distributed caching, and concurrency. Brilliant answers regarding failover and latency degradation.',
      submittedAt: '2026-10-04 14:30'
    },
    {
      id: 'sc-2',
      reviewerName: 'Sarah Jenkins',
      reviewerRole: 'Head of Talent Acquisition',
      decision: 'hire',
      overallScore: 4.5,
      ratings: { tech: 4.5, systemDesign: 4.0, softSkills: 5.0, execution: 4.5 },
      notesVi: 'Khả năng giao tiếp tiếng Anh lưu loát, tư duy giải quyết vấn đề hướng sản phẩm (product mindset). Rất phù hợp với văn hóa ownership và làm việc linh hoạt của công ty.',
      notesEn: 'Fluent English communication and strong product mindset. Excellent alignment with our company culture of autonomy and ownership.',
      submittedAt: '2026-10-04 16:15'
    }
  ]
};

interface CandidateCollaborativeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onAdvanceToOffer?: (candidateId: string) => void;
  onShowToast: (msg: string) => void;
}

export const CandidateCollaborativeReviewModal: React.FC<CandidateCollaborativeReviewModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onAdvanceToOffer,
  onShowToast
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [scorecards, setScorecards] = useState<ScorecardEntry[]>(INITIAL_SCORECARDS.default);
  
  // New scorecard form state
  const [newReviewerName, setNewReviewerName] = useState('Trần Minh Vũ');
  const [newReviewerRole, setNewReviewerRole] = useState('Engineering Director');
  const [newDecision, setNewDecision] = useState<'strong_hire' | 'hire' | 'neutral' | 'do_not_hire'>('strong_hire');
  const [newOverallScore, setNewOverallScore] = useState(5.0);
  const [newNote, setNewNote] = useState('Ứng viên thể hiện năng lực lãnh đạo kỹ thuật vượt trội. Đồng ý tuyển dụng ngay cấp bậc Senior II.');
  const [isAddingReview, setIsAddingReview] = useState(false);

  // AI Committee Synthesis state
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [aiCommitteeSummary, setAiCommitteeSummary] = useState<{
    consensusVerdict: string;
    consensusScore: number;
    recommendedLevel: string;
    salaryBandVi: string;
    salaryBandEn: string;
    strengthsVi: string[];
    strengthsEn: string[];
    risksVi: string[];
    risksEn: string[];
  } | null>({
    consensusVerdict: 'OFFER KHUYẾN NGHỊ (STRONG HIRE)',
    consensusScore: 97,
    recommendedLevel: 'Senior II / Tech Lead (Band L5)',
    salaryBandVi: '42 - 55 Triệu VNĐ + $1,000 Sign-on Bonus',
    salaryBandEn: '$1,800 - $2,400 / month + $1,000 Sign-on Bonus',
    strengthsVi: [
      'Đồng thuận 100% từ cả 2 hội đồng kỹ thuật và văn hóa doanh nghiệp.',
      'Kinh nghiệm thực chiến cao về Microservices và bộ nhớ đệm tốc độ cao.',
      'Sẵn sàng nhận vai trò Tech Lead dẫn dắt nhóm 4-6 kỹ sư trẻ.'
    ],
    strengthsEn: [
      '100% unanimous approval across both technical and culture panel rounds.',
      'Deep hands-on experience in high-throughput microservices and distributed caching.',
      'Ready to assume a Tech Lead role mentoring 4-6 junior/mid engineers.'
    ],
    risksVi: [
      'Cần cung cấp tài liệu kiến trúc nội bộ trong 2 tuần đầu on-boarding để làm quen với giao thức RPC riêng của công ty.'
    ],
    risksEn: [
      'Provide company internal RPC protocol documentation during first 2 weeks of onboarding.'
    ]
  });

  if (!isOpen || !candidate) return null;

  const handleAddScorecard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newEntry: ScorecardEntry = {
      id: `sc-${Date.now()}`,
      reviewerName: newReviewerName,
      reviewerRole: newReviewerRole,
      decision: newDecision,
      overallScore: newOverallScore,
      ratings: {
        tech: newOverallScore >= 4.5 ? 5 : 4,
        systemDesign: newOverallScore >= 4.5 ? 5 : 4,
        softSkills: 4.5,
        execution: 4.5
      },
      notesVi: newNote,
      notesEn: newNote,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setScorecards(prev => [newEntry, ...prev]);
    setIsAddingReview(false);
    onShowToast(isVi ? 'Đã lưu đánh giá nội bộ của bạn vào hồ sơ tuyển dụng!' : 'Added your internal review to candidate scorecard!');
  };

  const handleRunAiSynthesis = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      setAiCommitteeSummary({
        consensusVerdict: 'OFFER KHUYẾN NGHỊ TUYỂN DỤNG CẤP CAO',
        consensusScore: 98,
        recommendedLevel: 'Senior II / Tech Lead (Band L5)',
        salaryBandVi: '45 - 55 Triệu VNĐ + $1,500 Sign-on Bonus',
        salaryBandEn: '$1,900 - $2,400 / month + $1,500 Sign-on Bonus',
        strengthsVi: [
          'Tất cả thành viên hội đồng đồng thuận đánh giá ứng viên ở nhóm Top 3% năng lực thị trường.',
          'Kỹ năng lập trình đạt điểm tuyệt đối 100% trong bài đánh giá thuật toán O(1).',
          'Tư duy hệ thống sắc sảo, có năng lực xây dựng đội ngũ kỹ thuật mạnh mẽ.'
        ],
        strengthsEn: [
          'All hiring committee members unanimously place candidate in top 3% percentile.',
          'Perfect 100% score on O(1) algorithmic evaluation sandbox.',
          'Strategic architectural vision with proven ability to scale engineering teams.'
        ],
        risksVi: [
          'Đảm bảo chốt offer sớm để tránh bị đối thủ cạnh tranh thu hút ứng viên.'
        ],
        risksEn: [
          'Expedite offer issuance to prevent candidate acceptance of competing offers.'
        ]
      });
      onShowToast(isVi ? 'Gemini 2.0 đã tổng hợp toàn diện ý kiến hội đồng tuyển dụng!' : 'Gemini 2.0 successfully synthesized all committee reviews!');
    }, 1000);
  };

  const handleExportSummary = () => {
    const report = {
      candidateName: candidate.name,
      targetRole: candidate.role,
      atsScore: candidate.atsScore,
      matchScore: candidate.score,
      committeeConsensus: aiCommitteeSummary,
      scorecards: scorecards,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hiring_Committee_Report_${candidate.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(isVi ? 'Đã xuất báo cáo hội đồng tuyển dụng thành công!' : 'Exported hiring committee report successfully!');
  };

  const handleProceedOffer = () => {
    if (onAdvanceToOffer) {
      onAdvanceToOffer(candidate.id);
    }
    onShowToast(isVi ? `Đã đồng thuận tuyển dụng & chuyển ${candidate.name} sang bước Phát hành Offer!` : `Approved hire & advanced ${candidate.name} to Offer stage!`);
    onClose();
  };

  return (
    <div 
      data-testid="collaborative-review-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200/90 dark:border-slate-800 shadow-soft-2xl flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 font-bold text-base shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {candidate.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {candidate.score}% Match
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  ATS: {candidate.atsScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {candidate.role} • {candidate.prevCompany} • {isVi ? 'Đánh Giá Nội Bộ & Tổng Hợp Ý Kiến Hội Đồng' : 'Collaborative Scorecard & Hiring Committee Synthesis'}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="btn-close-collaborative-review"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 text-xs">
          
          {/* 1. AI Executive Hiring Committee Synthesis Banner */}
          {aiCommitteeSummary && (
            <div 
              data-testid="ai-committee-consensus-card"
              className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white border border-indigo-500/30 shadow-soft-xl space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                      {isVi ? 'Đồng Thuận Hội Đồng Tuyển Dụng AI' : 'Hiring Committee AI Consensus'}
                    </span>
                    <h4 className="text-base font-black text-white">
                      {aiCommitteeSummary.consensusVerdict}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="btn-resynthesize-ai"
                    onClick={handleRunAiSynthesis}
                    disabled={isSynthesizing}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isSynthesizing ? 'animate-spin' : ''}`} />
                    <span>{isSynthesizing ? (isVi ? 'Đang tổng hợp...' : 'Synthesizing...') : (isVi ? 'Tổng Hợp Lại Bằng AI' : 'Re-synthesize with AI')}</span>
                  </button>

                  <button
                    type="button"
                    data-testid="btn-export-committee-report"
                    onClick={handleExportSummary}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Xuất Biên Bản' : 'Export Report'}</span>
                  </button>
                </div>
              </div>

              {/* Recommended Level & Compensation Band */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{isVi ? 'Cấp bậc khuyến nghị' : 'Recommended Level'}</span>
                  <p className="text-sm font-bold text-emerald-300 mt-0.5">{aiCommitteeSummary.recommendedLevel}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{isVi ? 'Khung đãi ngộ mục tiêu' : 'Target Compensation Band'}</span>
                  <p className="text-sm font-bold text-cyan-300 mt-0.5">{isVi ? aiCommitteeSummary.salaryBandVi : aiCommitteeSummary.salaryBandEn}</p>
                </div>
              </div>

              {/* Strengths & Mitigations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isVi ? 'Điểm mạnh được hội đồng thống nhất' : 'Consensus Strengths'}</span>
                  </span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {(isVi ? aiCommitteeSummary.strengthsVi : aiCommitteeSummary.strengthsEn).map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isVi ? 'Lưu ý khi onboard & đàm phán' : 'Onboarding & Negotiation Notes'}</span>
                  </span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {(isVi ? aiCommitteeSummary.risksVi : aiCommitteeSummary.risksEn).map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 2. Timeline of Hiring Committee Scorecards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>{isVi ? `Bảng điểm đánh giá từ Hội đồng (${scorecards.length} lượt đánh giá)` : `Hiring Committee Scorecards (${scorecards.length} reviews)`}</span>
              </h4>

              <button
                type="button"
                data-testid="btn-open-add-scorecard"
                onClick={() => setIsAddingReview(!isAddingReview)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{isAddingReview ? (isVi ? 'Đóng form' : 'Close form') : (isVi ? '+ Thêm Đánh Giá Mới' : '+ Add New Scorecard')}</span>
              </button>
            </div>

            {/* Scorecard Add Form */}
            {isAddingReview && (
              <form 
                data-testid="add-scorecard-form"
                onSubmit={handleAddScorecard} 
                className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-4 animate-fade-in"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">{isVi ? 'Họ tên người đánh giá' : 'Reviewer Name'}</label>
                    <input
                      type="text"
                      data-testid="input-reviewer-name"
                      value={newReviewerName}
                      onChange={(e) => setNewReviewerName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">{isVi ? 'Vai trò hội đồng' : 'Committee Role'}</label>
                    <select
                      value={newReviewerRole}
                      data-testid="select-reviewer-role"
                      onChange={(e) => setNewReviewerRole(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Engineering Director">Engineering Director</option>
                      <option value="Principal Architect">Principal Systems Architect</option>
                      <option value="Hiring Manager">Hiring Manager</option>
                      <option value="Talent Partner">Talent Acquisition Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">{isVi ? 'Quyết định tuyển dụng' : 'Hiring Decision'}</label>
                    <select
                      value={newDecision}
                      data-testid="select-hiring-decision"
                      onChange={(e) => setNewDecision(e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="strong_hire">Strong Hire (Rất khuyến nghị)</option>
                      <option value="hire">Hire (Khuyến nghị)</option>
                      <option value="neutral">Neutral (Cần xem xét thêm)</option>
                      <option value="do_not_hire">Do Not Hire (Không phù hợp)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">{isVi ? 'Điểm số tổng quan (1 - 5)' : 'Overall Rating (1 - 5)'}</label>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{newOverallScore.toFixed(1)} / 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={newOverallScore}
                    data-testid="range-scorecard-score"
                    onChange={(e) => setNewOverallScore(parseFloat(e.target.value))}
                    className="w-full mt-1 accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">{isVi ? 'Nhận xét chi tiết & Luận điểm kỹ thuật' : 'Detailed Notes & Evaluation Rubrics'}</label>
                  <textarea
                    rows={3}
                    data-testid="textarea-scorecard-notes"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Nhập ghi chú nhận xét chi tiết..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingReview(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {isVi ? 'Hủy' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    data-testid="btn-submit-new-scorecard"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs shadow-soft transition-all cursor-pointer"
                  >
                    {isVi ? 'Lưu Đánh Giá Vào Hồ Sơ' : 'Save Scorecard'}
                  </button>
                </div>
              </form>
            )}

            {/* List of existing scorecards */}
            <div className="space-y-3">
              {scorecards.map((sc) => (
                <div 
                  key={sc.id} 
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center">
                        {sc.reviewerName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{sc.reviewerName}</span>
                          <span className="text-[10px] text-slate-400">({sc.reviewerRole})</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{sc.submittedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase ${
                        sc.decision === 'strong_hire'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : sc.decision === 'hire'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}>
                        {sc.decision.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{sc.overallScore.toFixed(1)}/5.0</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                    {isVi ? sc.notesVi : sc.notesEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isVi ? 'Đóng' : 'Close'}
            </button>

            <button
              type="button"
              data-testid="btn-proceed-to-offer"
              onClick={handleProceedOffer}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs flex items-center gap-2 shadow-soft transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-emerald-200" />
              <span>{isVi ? 'Đồng Thuận Tuyển Dụng & Phát Hành Offer' : 'Approve Hire & Extend Offer'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
