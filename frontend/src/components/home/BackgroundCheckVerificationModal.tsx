import React, { useState } from 'react';
import type { Candidate } from './EmployerSection';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  GraduationCap,
  FileCheck,
  UserCheck,
  Star,
  Send,
  Download,
  Mail,
  Award,
  Sparkles,
  ExternalLink,
  Plus,
  Lock,
  User
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface ReferenceItem {
  id: string;
  name: string;
  role: string;
  company: string;
  relation: string;
  rating: number;
  quoteVi: string;
  quoteEn: string;
  status: 'Verified' | 'Pending';
  verifiedDate: string;
}

export interface BackgroundCheckVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onApproveClearance?: (candidateId: string) => void;
  onShowToast: (message: string) => void;
}

export const BackgroundCheckVerificationModal: React.FC<BackgroundCheckVerificationModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onApproveClearance,
  onShowToast
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Dynamic references state
  const [references, setReferences] = useState<ReferenceItem[]>([
    {
      id: 'ref-1',
      name: 'Trần Quang Huy',
      role: 'Head of Engineering',
      company: 'ex-Grab Platform',
      relation: 'Trực tiếp quản lý (Former Direct Manager)',
      rating: 5,
      quoteVi: 'Ứng viên có năng lực kiến trúc hệ thống vượt trội, tinh thần trách nhiệm cao độ và luôn chủ động tháo gỡ điểm nghẽn cho cả đội ngũ trong các đợt phát hành lớn.',
      quoteEn: 'Exceptional architectural prowess and outstanding ownership. Consistently unblocked the team during critical platform milestones.',
      status: 'Verified',
      verifiedDate: '02/10/2026'
    },
    {
      id: 'ref-2',
      name: 'Phạm Thu Trang',
      role: 'Staff Product Manager',
      company: 'Shopee Labs',
      relation: 'Đồng nghiệp phối hợp dự án (Cross-functional Peer)',
      rating: 4.9,
      quoteVi: 'Giao tiếp rất mạch lạc, biết cách cân bằng tối ưu giữa tiến độ kinh doanh và chất lượng mã nguồn. Một đồng nghiệp kỹ thuật lý tưởng.',
      quoteEn: 'Crystal-clear communication and great empathy balancing business velocity with high engineering standards.',
      status: 'Verified',
      verifiedDate: '04/10/2026'
    }
  ]);

  // Request new reference state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRefName, setNewRefName] = useState('');
  const [newRefEmail, setNewRefEmail] = useState('');
  const [newRefRole, setNewRefRole] = useState('');
  const [newRefRelation, setNewRefRelation] = useState('Quản lý trực tiếp (Manager)');

  // Approved state
  const [isApproved, setIsApproved] = useState(false);

  if (!isOpen || !candidate) return null;

  const handleSendReferenceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefName || !newRefEmail) {
      onShowToast(isVi ? 'Vui lòng điền đầy đủ tên và email người tham chiếu!' : 'Please enter referee name and email!');
      return;
    }

    const newRef: ReferenceItem = {
      id: `ref-${Date.now()}`,
      name: newRefName,
      role: newRefRole || 'Senior Engineer Lead',
      company: candidate.prevCompany || 'Previous Company',
      relation: newRefRelation,
      rating: 5,
      quoteVi: 'Vừa nhận yêu cầu xác minh qua email TalentBridge. Đang hoàn thiện bản khảo sát năng lực chuyên môn.',
      quoteEn: 'Verification survey sent via TalentBridge automated outreach. Assessment in progress.',
      status: 'Pending',
      verifiedDate: 'Hôm nay (Today)'
    };

    setReferences(prev => [newRef, ...prev]);
    setShowRequestForm(false);
    setNewRefName('');
    setNewRefEmail('');
    setNewRefRole('');
    onShowToast(isVi ? `Đã gửi link khảo sát xác minh tham chiếu tới ${newRefEmail}!` : `Sent verification survey link to ${newRefEmail}!`);
  };

  const handleApprove = () => {
    setIsApproved(true);
    if (onApproveClearance) {
      onApproveClearance(candidate.id);
    }
    onShowToast(isVi ? `Đã phê duyệt hồ sơ lý lịch hợp chuẩn cho ứng viên ${candidate.name}!` : `Approved pre-employment clearance for ${candidate.name}!`);
  };

  const handleExportCertificate = () => {
    onShowToast(isVi ? `Đang tạo và tải Giấy Chứng Nhận Thẩm Tra Lý Lịch (Certificate) cho ${candidate.name}...` : `Exporting Verified Pre-Employment Certificate for ${candidate.name}...`);
    setTimeout(() => {
      onShowToast(isVi ? 'Xuất chứng nhận thẩm định thành công (Verified PDF)!' : 'Clearance certificate downloaded successfully!');
    }, 1000);
  };

  return (
    <div
      data-testid="background-check-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header Modal Bar */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-soft-xs shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase">
                  ENTERPRISE BACKGROUND CLEARANCE
                </span>
                <span className="text-xs text-slate-400 font-bold">•</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {isVi ? 'Bảo mật chuẩn ISO 27001' : 'ISO 27001 Certified'}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {isVi ? 'Thẩm Tra Lý Lịch & Tham Chiếu Tuyển Dụng' : 'Pre-Employment Background & Reference Audit'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            data-testid="btn-close-background-check-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Spotlight Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-soft-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {candidate.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {candidate.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {candidate.prevCompany} • {isVi ? candidate.experienceVi : candidate.experienceEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                {isVi ? 'Chỉ số Tin cậy & Hợp chuẩn' : 'Trust & Compliance'}
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                98.6% VERIFIED
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-soft-xs">
              ✓
            </div>
          </div>
        </div>

        {/* 3 Core Verification Audit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Identity & eKYC */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {isVi ? '1. Định danh eKYC' : '1. Identity & AML'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                PASSED
              </span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-medium">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isVi ? 'CCCD gắn chip đối chiếu hợp lệ' : 'Biometric ID verified'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isVi ? 'Không nằm trong danh sách cấm AML' : 'Sanction & AML lists clear'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isVi ? 'Lý lịch tư pháp số 2: Trong sạch' : 'Criminal check: Clean'}</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Academic Verification */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {isVi ? '2. Bằng cấp học vấn' : '2. Education Audit'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                VERIFIED
              </span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-medium">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isVi ? 'ĐH Bách Khoa TP.HCM' : 'Hochiminh Univ of Tech'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isVi ? 'Bằng Kỹ sư CNTT chính quy' : 'B.S. in Computer Science'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isVi ? 'Số hiệu văn bằng đối chiếu hợp lệ' : 'Diploma Registry confirmed'}</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Employment History */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-500" />
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {isVi ? '3. Lịch sử công tác' : '3. Past Employment'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                CONFIRMED
              </span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-medium">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{candidate.prevCompany} (2021 - 2024)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isVi ? 'Đã hoàn tất bàn giao & bảo mật NDA' : 'Clean exit & NDA compliant'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isVi ? 'Được đề xuất tái tuyển dụng (Re-hire)' : 'Eligible for re-hire'}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Section: Professional Reference Checks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{isVi ? 'Đánh Giá Tham Chiếu Chuyên Môn (Referee Testimonials)' : 'Verified Professional References'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isVi ? 'Nhận xét từ cấp quản lý và cộng sự cấp cao của ứng viên tại các công ty trước.' : 'Direct testimonials verified via corporate emails.'}
              </p>
            </div>

            <button
              type="button"
              data-testid="btn-toggle-request-reference-form"
              onClick={() => setShowRequestForm(prev => !prev)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isVi ? '+ Gửi Yêu Cầu Tham Chiếu Mới' : '+ Request Reference'}</span>
            </button>
          </div>

          {/* New Reference Request Form */}
          {showRequestForm && (
            <form
              data-testid="form-request-reference"
              onSubmit={handleSendReferenceRequest}
              className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-fade-in"
            >
              <span className="text-xs font-black text-indigo-900 dark:text-indigo-300">
                {isVi ? 'Gửi bảng khảo sát năng lực tham chiếu tự động bằng AI:' : 'Send Automated AI Reference Check Survey:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <input
                  type="text"
                  data-testid="input-ref-name"
                  placeholder={isVi ? 'Họ tên người tham chiếu...' : 'Referee full name...'}
                  value={newRefName}
                  onChange={e => setNewRefName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
                <input
                  type="email"
                  data-testid="input-ref-email"
                  placeholder={isVi ? 'Email công việc (@company.com)...' : 'Work email (@company.com)...'}
                  value={newRefEmail}
                  onChange={e => setNewRefEmail(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
                <input
                  type="text"
                  data-testid="input-ref-role"
                  placeholder={isVi ? 'Chức danh (VD: Engineering Lead)...' : 'Role (e.g. Director)...'}
                  value={newRefRole}
                  onChange={e => setNewRefRole(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200/60 cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  data-testid="btn-submit-reference-request"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-soft cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Gửi thư mời khảo sát' : 'Send Survey'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Reference Cards */}
          <div className="space-y-3">
            {references.map(ref => (
              <div
                key={ref.id}
                data-testid={`reference-card-${ref.id}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300">
                      {ref.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {ref.name} <span className="font-normal text-slate-400">({ref.relation})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {ref.role} • <span className="text-emerald-600 font-bold">{ref.company}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-lg text-amber-700 dark:text-amber-300 font-black text-xs">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{ref.rating}/5</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      ref.status === 'Verified'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {ref.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{isVi ? ref.quoteVi : ref.quoteEn}"
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isVi ? 'Đã mã hóa dữ liệu & tuân thủ Nghị định 13/2023/NĐ-CP' : 'Encrypted & GDPR/PDPA Compliant'}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              data-testid="btn-export-clearance-certificate"
              onClick={handleExportCertificate}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isVi ? 'Xuất Chứng Nhận (PDF)' : 'Export Certificate'}</span>
            </button>

            <button
              type="button"
              data-testid="btn-approve-background-check"
              disabled={isApproved}
              onClick={handleApprove}
              className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-soft transition-all cursor-pointer active:scale-95 ${
                isApproved
                  ? 'bg-emerald-700 text-white cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproved ? (isVi ? '✓ Đã Phê Duyệt Hợp Chuẩn' : '✓ Cleared & Approved') : (isVi ? 'Phê Duyệt Onboarding' : 'Approve for Onboarding')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
