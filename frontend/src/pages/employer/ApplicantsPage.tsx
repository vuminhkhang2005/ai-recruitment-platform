import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Mail,
  MapPin,
  Phone,
  Search,
  Calendar,
  Clock,
  Video,
  Building,
  Plus,
  StickyNote,
  MessageSquare,
  FileText,
  Trash2,
  Lock,
  Globe,
  ExternalLink,
  Star,
  CheckCircle2,
  Send,
  Sparkles,
  Users,
  XCircle,
  Eye,
  Edit3,
  CheckSquare,
  Square,
  X,
  ArrowRight,
} from 'lucide-react';
import { applicationApi, jobApi, interviewApi, noteApi, messageApi, teamApi, openCvFile } from '../../lib/api';
import type { Application, Job, Stage, InterviewDto, NoteDto, MessageDto, TeamMember } from '../../lib/types';
import { STAGES, getStageLabels, formatDate, formatDateTime, timeAgo } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { EmptyState, ErrorBox, PageLoader, btnPrimary, btnSecondary, inputCls } from '../../components/ui/primitives';
import { Avatar } from '../../components/layout/Navbar';
import { StageBadge } from '../MyApplicationsPage';
import { usePageTitle } from '../../lib/usePageTitle';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

const NEXT_STEP_VI: Partial<Record<Stage, { stage: Stage; label: string }>> = {
  APPLIED: { stage: 'SCREENING', label: 'Chuyển sang Sàng lọc' },
  SCREENING: { stage: 'INTERVIEW', label: 'Mời phỏng vấn' },
  INTERVIEW: { stage: 'OFFERED', label: 'Gửi đề nghị Offer' },
  OFFERED: { stage: 'HIRED', label: 'Xác nhận trúng tuyển' },
};

const NEXT_STEP_EN: Partial<Record<Stage, { stage: Stage; label: string }>> = {
  APPLIED: { stage: 'SCREENING', label: 'Move to Screening' },
  SCREENING: { stage: 'INTERVIEW', label: 'Invite to Interview' },
  INTERVIEW: { stage: 'OFFERED', label: 'Send Offer' },
  OFFERED: { stage: 'HIRED', label: 'Confirm Hired' },
};

interface EmailTemplateItem {
  id: string;
  targetStage: Stage;
  titleVi: string;
  titleEn: string;
  badgeVi: string;
  badgeEn: string;
  subjectVi: string;
  subjectEn: string;
  bodyVi: string;
  bodyEn: string;
  defaultRejectionReasonVi?: string;
  defaultRejectionReasonEn?: string;
}

const SYSTEM_EMAIL_TEMPLATES: EmailTemplateItem[] = [
  {
    id: 'SCREENING_PASS',
    targetStage: 'SCREENING',
    titleVi: 'Mẫu 1: Vượt qua vòng Sơ loại CV & Chuyển sang Đánh giá Chuyên môn',
    titleEn: 'Template 1: Passed CV Screening & Moving to Technical Review',
    badgeVi: 'Sàng lọc hồ sơ',
    badgeEn: 'Screening',
    subjectVi: '[{{company_name}}] Cập nhật hồ sơ ứng tuyển vị trí {{job_title}} - {{candidate_name}}',
    subjectEn: '[{{company_name}}] Application Update for {{job_title}} - {{candidate_name}}',
    bodyVi: `Chào {{candidate_name}},

Bộ phận Tuyển dụng {{company_name}} xin chúc mừng bạn! Hồ sơ ứng tuyển của bạn cho vị trí {{job_title}} đã vượt qua vòng Sơ loại CV ban đầu với mức độ phù hợp rất tốt.

Hiện tại, hồ sơ của bạn đã được chuyển sang Hội đồng Chuyên môn để đánh giá chi tiết trước khi bước vào vòng Phỏng vấn tiếp theo. Chúng tôi sẽ liên hệ lại với bạn trong vòng 2-3 ngày làm việc tới để thông báo lịch trình cụ thể.

Cảm ơn bạn đã quan tâm và lựa chọn đồng hành cùng {{company_name}}.

Trân trọng,
Đội ngũ Tuyển dụng {{company_name}}`,
    bodyEn: `Dear {{candidate_name}},

Congratulations from the {{company_name}} Talent Acquisition team! Your application for the {{job_title}} role has passed our initial CV screening stage.

Your profile has now been forwarded to our hiring panel for an in-depth technical review prior to the interview round. We will follow up with you within 2-3 business days regarding the next steps.

Thank you for your interest in joining {{company_name}}.

Best regards,
{{company_name}} Recruitment Team`,
  },
  {
    id: 'INTERVIEW_INVITE',
    targetStage: 'INTERVIEW',
    titleVi: 'Mẫu 2: Thư mời tham gia Vòng Phỏng vấn Chuyên môn (Interview)',
    titleEn: 'Template 2: Invitation to Technical / HR Interview Round',
    badgeVi: 'Mời phỏng vấn',
    badgeEn: 'Interview',
    subjectVi: '[{{company_name}}] Thư mời tham gia Vòng Phỏng vấn - Vị trí {{job_title}}',
    subjectEn: '[{{company_name}}] Interview Invitation - {{job_title}}',
    bodyVi: `Chào {{candidate_name}},

Chúc mừng bạn đã xuất sắc vượt qua vòng đánh giá hồ sơ cho vị trí {{job_title}} tại {{company_name}}!

Ấn tượng với kinh nghiệm và kỹ năng chuyên môn của bạn, chúng tôi trân trọng mời bạn tham gia vòng Phỏng vấn tiếp theo cùng đội ngũ chuyên môn của {{company_name}} để trao đổi sâu hơn về định hướng công việc cũng như giải đáp các thắc mắc của bạn.

Vui lòng kiểm tra mục Lịch phỏng vấn trên cổng ứng viên TalentBridge hoặc phản hồi lại tin nhắn này về khung thời gian thuận tiện nhất với bạn trong tuần này.

Trân trọng,
Đội ngũ Tuyển dụng {{company_name}}`,
    bodyEn: `Dear {{candidate_name}},

Congratulations on advancing past the profile review for the {{job_title}} position at {{company_name}}!

Impressed by your background and skills, we would love to invite you to the next Interview round with our hiring team to discuss the role in greater detail.

Please check the Interviews section on your TalentBridge portal or reply to this message with your preferred availability this week.

Best regards,
{{company_name}} Recruitment Team`,
  },
  {
    id: 'INTERVIEW_CODING_TEST',
    targetStage: 'INTERVIEW',
    titleVi: 'Mẫu 3: Thư mời làm Bài kiểm tra Kỹ thuật / Coding Test (Vòng tiếp theo)',
    titleEn: 'Template 3: Invitation to Technical Assessment / Coding Test',
    badgeVi: 'Bài Test kỹ thuật',
    badgeEn: 'Coding Test',
    subjectVi: '[{{company_name}}] Mời tham gia Bài đánh giá Kỹ thuật (Vòng tiếp theo) - Vị trí {{job_title}}',
    subjectEn: '[{{company_name}}] Technical Assessment Invitation - {{job_title}}',
    bodyVi: `Chào {{candidate_name}},

Cảm ơn bạn đã ứng tuyển vị trí {{job_title}} tại {{company_name}}. Sau khi xem xét hồ sơ của bạn, Hội đồng Tuyển dụng trân trọng mời bạn bước vào vòng tiếp theo: Bài đánh giá năng lực thực tế (Technical Assessment).

Thông tin vòng đánh giá:
- Vị trí ứng tuyển: {{job_title}}
- Thời lượng hoàn thành dự kiến: 48 giờ kể từ khi nhận đề
- Hình thức: Thực hiện bài tập thực tế và thảo luận kết quả trong buổi phỏng vấn chuyên môn

Nếu bạn có bất kỳ câu hỏi nào trong quá trình chuẩn bị, đừng ngần ngại nhắn tin trực tiếp cho chúng tôi trên hệ thống. Chúc bạn hoàn thành bài thi thật xuất sắc!

Trân trọng,
Đội ngũ Tuyển dụng {{company_name}}`,
    bodyEn: `Dear {{candidate_name}},

Thank you for applying for the {{job_title}} position at {{company_name}}. Following our review of your profile, our hiring committee is pleased to invite you to the next stage: our Technical Assessment round.

Assessment details:
- Role: {{job_title}}
- Expected completion window: 48 hours
- Format: Practical take-home assignment followed by a technical walkthrough

Please feel free to message us directly on TalentBridge if you have any questions. Best of luck!

Best regards,
{{company_name}} Recruitment Team`,
  },
  {
    id: 'OFFER_LETTER',
    targetStage: 'OFFERED',
    titleVi: 'Mẫu 4: Thư mời Nhận việc Chính thức (Official Offer Letter)',
    titleEn: 'Template 4: Official Job Offer Letter',
    badgeVi: 'Gửi Offer',
    badgeEn: 'Offer Letter',
    subjectVi: '[{{company_name}}] Chúc mừng trúng tuyển & Thư mời nhận việc (Offer Letter) - {{job_title}}',
    subjectEn: '[{{company_name}}] Congratulations & Official Job Offer - {{job_title}}',
    bodyVi: `Chào {{candidate_name}},

Chúc mừng bạn đã xuất sắc vượt qua các vòng phỏng vấn cho vị trí {{job_title}}! Hội đồng Tuyển dụng {{company_name}} đánh giá rất cao năng lực chuyên môn, tư duy giải quyết vấn đề và sự phù hợp văn hóa của bạn.

Chúng tôi trân trọng gửi tới bạn Thư mời nhận việc (Offer Letter) chính thức để chào đón bạn gia nhập đội ngũ {{company_name}}.

Vui lòng đăng nhập vào cổng ứng viên TalentBridge hoặc phản hồi qua hộp thư để xác nhận quyết định nhận việc và ngày bắt đầu (Onboard) dự kiến của bạn.

Trân trọng,
Đội ngũ Tuyển dụng {{company_name}}`,
    bodyEn: `Dear {{candidate_name}},

Congratulations on successfully completing the interview process for the {{job_title}} position! The hiring panel at {{company_name}} was thoroughly impressed by your technical expertise, problem-solving mindset, and cultural alignment.

We are thrilled to extend an official Job Offer to welcome you to the {{company_name}} team.

Please log in to your TalentBridge portal or reply to this message to confirm your acceptance and preferred start date.

Best regards,
{{company_name}} Recruitment Team`,
  },
  {
    id: 'HIRED_WELCOME',
    targetStage: 'HIRED',
    titleVi: 'Mẫu 5: Xác nhận Trúng tuyển & Chào mừng Thành viên mới (Onboarding)',
    titleEn: 'Template 5: Hired Confirmation & Onboarding Welcome',
    badgeVi: 'Trúng tuyển',
    badgeEn: 'Hired / Onboard',
    subjectVi: '[{{company_name}}] Chào mừng {{candidate_name}} chính thức gia nhập đội ngũ {{job_title}}!',
    subjectEn: '[{{company_name}}] Welcome {{candidate_name}} to the {{job_title}} team!',
    bodyVi: `Chào {{candidate_name}},

Chào mừng bạn chính thức trở thành thành viên mới của đại gia đình {{company_name}} ở vị trí {{job_title}}!

Bộ phận Nhân sự đã hoàn tất hồ sơ tiếp nhận của bạn. Các hướng dẫn chi tiết cho ngày làm việc đầu tiên (Onboarding), tài khoản hệ thống và trang thiết bị làm việc đã được chuẩn bị sẵn sàng để đón tiếp bạn.

Chúc bạn có một hành trình sự nghiệp thật rực rỡ và nhiều dấu ấn tại {{company_name}}!

Trân trọng,
Đội ngũ Tuyển dụng {{company_name}}`,
    bodyEn: `Dear {{candidate_name}},

Welcome aboard as the newest member of {{company_name}} in the role of {{job_title}}!

Our HR team has finalized your onboarding preparation. Details for your first day, system credentials, and workstation setup are ready for your arrival.

We wish you an inspiring and rewarding career journey at {{company_name}}!

Best regards,
{{company_name}} Recruitment Team`,
  },
  {
    id: 'REJECT_AFTER_CV',
    targetStage: 'REJECTED',
    titleVi: 'Mẫu 6: Thư cảm ơn & Từ chối lịch sự sau vòng Hồ sơ (CV Screening)',
    titleEn: 'Template 6: Polite Rejection after CV Screening',
    badgeVi: 'Từ chối sau CV',
    badgeEn: 'Reject (CV)',
    defaultRejectionReasonVi: 'Định hướng kinh nghiệm hiện tại chưa sát với yêu cầu ưu tiên của dự án',
    defaultRejectionReasonEn: 'Current experience focus does not closely match immediate project priorities',
    subjectVi: '[{{company_name}}] Thông báo kết quả ứng tuyển vị trí {{job_title}}',
    subjectEn: '[{{company_name}}] Update on your application for {{job_title}}',
    bodyVi: `Chào {{candidate_name}},

Lời đầu tiên, Bộ phận Tuyển dụng {{company_name}} xin chân thành cảm ơn bạn đã dành sự quan tâm và thời gian ứng tuyển vào vị trí {{job_title}}.

Chúng tôi đã xem xét kỹ lưỡng hồ sơ của bạn. Tuy nhiên, ở thời điểm hiện tại, chúng tôi đang ưu tiên các ứng viên có định hướng kinh nghiệm sát hơn với yêu cầu đặc thù của dự án trong giai đoạn này ({{rejection_reason}}). Vì vậy, rất tiếc chúng tôi chưa thể đồng hành cùng bạn ở đợt tuyển dụng lần này.

Hồ sơ của bạn đã được lưu vào Talent Pool của {{company_name}} để chúng tôi chủ động liên hệ ngay khi có vị trí mới phù hợp hơn. Chúc bạn luôn nhiều sức khỏe và gặt hái nhiều thành công trên con đường sự nghiệp!

Trân trọng,
Đội ngũ Tuyển dụng {{company_name}}`,
    bodyEn: `Dear {{candidate_name}},

First of all, thank you for taking the time and effort to apply for the {{job_title}} position at {{company_name}}.

We have carefully reviewed your application. While your background is impressive, we have decided to move forward with candidates whose experience more closely aligns with our specific project needs at this stage ({{rejection_reason}}).

We have saved your profile in {{company_name}}'s Talent Pool and will reach out when a better-matched opportunity opens up. Wishing you continued success in your career!

Best regards,
{{company_name}} Recruitment Team`,
  },
  {
    id: 'REJECT_AFTER_INTERVIEW',
    targetStage: 'REJECTED',
    titleVi: 'Mẫu 7: Thư cảm ơn & Từ chối sau vòng Phỏng vấn — Lưu Talent Pool',
    titleEn: 'Template 7: Polite Rejection after Interview — Keep in Talent Pool',
    badgeVi: 'Từ chối sau PV',
    badgeEn: 'Reject (Interview)',
    defaultRejectionReasonVi: 'Đã lựa chọn ứng viên khác có độ khớp kỹ thuật cao hơn với giai đoạn hiện tại của dự án',
    defaultRejectionReasonEn: 'Selected another candidate whose technical specialization more closely fits current sprint needs',
    subjectVi: '[{{company_name}}] Phản hồi kết quả sau vòng Phỏng vấn - Vị trí {{job_title}}',
    subjectEn: '[{{company_name}}] Post-Interview Update - {{job_title}}',
    bodyVi: `Chào {{candidate_name}},

Cảm ơn bạn đã dành thời gian tham gia buổi phỏng vấn cho vị trí {{job_title}} cùng Hội đồng Tuyển dụng {{company_name}}. Chúng tôi rất trân trọng sự chuẩn bị nghiêm túc và buổi trò chuyện cởi mở của bạn.

Sau khi cân nhắc kỹ lưỡng giữa các ứng viên trong đợt tuyển dụng này, rất tiếc chúng tôi chưa thể lựa chọn đi tiếp cùng bạn ở vị trí {{job_title}} ({{rejection_reason}}).

Chúng tôi rất hy vọng sẽ có cơ hội hợp tác cùng bạn trong các dự án tiếp theo tại {{company_name}}. Chúc bạn luôn giữ vững đam mê và thành công hơn nữa!

Trân trọng,
Đội ngũ Tuyển dụng {{company_name}}`,
    bodyEn: `Dear {{candidate_name}},

Thank you for taking the time to interview for the {{job_title}} role with the {{company_name}} team. We truly appreciated your thoughtful preparation and engaging conversation.

After careful consideration among our finalists, we regret to inform you that we will not be moving forward with your candidacy for this role at this time ({{rejection_reason}}).

We sincerely hope our paths cross again for future opportunities at {{company_name}}, and we wish you all the best in your career ahead!

Best regards,
{{company_name}} Recruitment Team`,
  },
];

const QUICK_REJECTION_REASONS_VI = [
  'Chưa đáp ứng đủ số năm kinh nghiệm thực tế yêu cầu',
  'Kỹ năng chuyên môn chưa khớp với định hướng công nghệ của dự án',
  'Đã tuyển đủ số lượng nhân sự cho vị trí này',
  'Mức lương kỳ vọng vượt quá ngân sách được phê duyệt',
];

const QUICK_REJECTION_REASONS_EN = [
  'Does not yet meet the required years of hands-on experience',
  'Technical stack does not closely match current project architecture',
  'Position has already been filled by another candidate',
  'Salary expectation exceeds the approved budget for this role',
];

function renderPreviewText(
  rawText: string,
  app: Application | undefined,
  stageLabel: string,
  rejectionReason: string,
): string {
  if (!rawText) return '';
  return rawText
    .replace(/\{\{candidate_name\}\}/g, app?.candidateName || 'Nguyễn Văn An')
    .replace(/\{\{candidate_email\}\}/g, app?.candidateEmail || 'candidate@email.com')
    .replace(/\{\{job_title\}\}/g, app?.jobTitle || 'Senior Software Engineer')
    .replace(/\{\{company_name\}\}/g, app?.companyName || 'Công ty Công nghệ')
    .replace(/\{\{stage_name\}\}/g, stageLabel)
    .replace(
      /\{\{rejection_reason\}\}/g,
      rejectionReason.trim() || 'Chưa phù hợp với yêu cầu ưu tiên tại thời điểm hiện tại',
    );
}

interface StageEmailComposerModalProps {
  open: boolean;
  mode: 'ADVANCE' | 'REJECT';
  initialStage?: Stage;
  targets: Application[];
  lang: 'vi' | 'en';
  onClose: () => void;
  onSuccess: (updatedApps: Application[]) => void;
}

const StageEmailComposerModal: React.FC<StageEmailComposerModalProps> = ({
  open,
  mode,
  initialStage,
  targets,
  lang,
  onClose,
  onSuccess,
}) => {
  const isVi = lang === 'vi';
  const toast = useToast();
  const { user } = useAuth();
  const stageLabels = getStageLabels(lang);

  const defaultAdvanceStage = useMemo<Stage>(() => {
    if (mode === 'REJECT') return 'REJECTED';
    if (initialStage && initialStage !== 'REJECTED' && initialStage !== 'APPLIED') {
      return initialStage;
    }
    if (targets.length === 1) {
      const curr = targets[0].currentStage;
      if (curr === 'APPLIED') return 'SCREENING';
      if (curr === 'SCREENING') return 'INTERVIEW';
      if (curr === 'INTERVIEW') return 'OFFERED';
      if (curr === 'OFFERED') return 'HIRED';
    }
    return 'INTERVIEW';
  }, [mode, initialStage, targets]);

  const [targetStage, setTargetStage] = useState<Stage>(defaultAdvanceStage);
  const [composeMode, setComposeMode] = useState<'TEMPLATE' | 'CUSTOM'>('TEMPLATE');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [sendEmail, setSendEmail] = useState<boolean>(true);
  const [sendChatMessage, setSendChatMessage] = useState<boolean>(true);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync when modal opens or mode/targets change
  useEffect(() => {
    if (!open) return;
    setError(null);
    setPreviewIndex(0);
    const nextStage = mode === 'REJECT' ? 'REJECTED' : defaultAdvanceStage;
    setTargetStage(nextStage);
    setComposeMode('TEMPLATE');
    setSendEmail(true);
    setSendChatMessage(true);

    const matchingTemplate =
      SYSTEM_EMAIL_TEMPLATES.find((t) => t.targetStage === nextStage) || SYSTEM_EMAIL_TEMPLATES[0];
    setSelectedTemplateId(matchingTemplate.id);
    setSubject(isVi ? matchingTemplate.subjectVi : matchingTemplate.subjectEn);
    setBody(isVi ? matchingTemplate.bodyVi : matchingTemplate.bodyEn);
    if (nextStage === 'REJECTED') {
      setRejectionReason(
        (isVi ? matchingTemplate.defaultRejectionReasonVi : matchingTemplate.defaultRejectionReasonEn) ||
          (isVi ? QUICK_REJECTION_REASONS_VI[0] : QUICK_REJECTION_REASONS_EN[0]),
      );
    } else {
      setRejectionReason('');
    }
  }, [open, mode, defaultAdvanceStage, isVi]);

  if (!open || targets.length === 0) return null;

  const handleStageSelect = (stage: Stage) => {
    setTargetStage(stage);
    if (composeMode === 'TEMPLATE') {
      const tpl = SYSTEM_EMAIL_TEMPLATES.find((t) => t.targetStage === stage);
      if (tpl) {
        setSelectedTemplateId(tpl.id);
        setSubject(isVi ? tpl.subjectVi : tpl.subjectEn);
        setBody(isVi ? tpl.bodyVi : tpl.bodyEn);
        if (stage === 'REJECTED') {
          setRejectionReason(
            (isVi ? tpl.defaultRejectionReasonVi : tpl.defaultRejectionReasonEn) || rejectionReason,
          );
        }
      }
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tpl = SYSTEM_EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (tpl) {
      setTargetStage(tpl.targetStage);
      setSubject(isVi ? tpl.subjectVi : tpl.subjectEn);
      setBody(isVi ? tpl.bodyVi : tpl.bodyEn);
      if (tpl.targetStage === 'REJECTED') {
        setRejectionReason(
          (isVi ? tpl.defaultRejectionReasonVi : tpl.defaultRejectionReasonEn) || rejectionReason,
        );
      }
    }
  };

  const insertPlaceholder = (token: string) => {
    setComposeMode('CUSTOM');
    setBody((prev) => `${prev}${prev.endsWith(' ') || prev.endsWith('\n') || !prev ? '' : ' '}${token}`);
  };

  const availableTemplates = SYSTEM_EMAIL_TEMPLATES.filter((t) =>
    mode === 'REJECT' ? t.targetStage === 'REJECTED' : t.targetStage !== 'REJECTED',
  );

  const previewTarget = targets[Math.min(previewIndex, targets.length - 1)] || targets[0];
  const stageLabel = stageLabels[targetStage] || targetStage;
  const previewSubject = renderPreviewText(subject, previewTarget, stageLabel, rejectionReason);
  const previewBody = renderPreviewText(body, previewTarget, stageLabel, rejectionReason);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (targetStage === 'REJECTED' && !rejectionReason.trim()) {
      setError(
        isVi
          ? 'Vui lòng nhập hoặc chọn lý do từ chối để phản hồi cho ứng viên.'
          : 'Please enter or select a rejection reason for the candidate.',
      );
      return;
    }

    if (sendEmail && (!subject.trim() || !body.trim())) {
      setError(
        isVi
          ? 'Vui lòng nhập đầy đủ tiêu đề và nội dung email trước khi gửi.'
          : 'Please fill in both email subject and body before sending.',
      );
      return;
    }

    setSubmitting(true);
    try {
      if (targets.length === 1) {
        const single = targets[0];
        const updated = await applicationApi.updateStage(
          single.id,
          targetStage,
          targetStage === 'REJECTED' ? rejectionReason.trim() : undefined,
          {
            note:
              targetStage === 'REJECTED'
                ? rejectionReason.trim()
                : `${isVi ? 'Chuyển sang vòng' : 'Moved to'} ${stageLabel}`,
            sendEmail,
            customEmailSubject: sendEmail ? subject.trim() : undefined,
            customEmailBody: sendEmail ? body.trim() : undefined,
            sendChatMessage,
          },
        );
        onSuccess([updated]);
        toast(
          isVi
            ? `Đã cập nhật ${single.candidateName} sang "${stageLabel}"${sendEmail ? ' và gửi email thành công!' : '.'}`
            : `Updated ${single.candidateName} to "${stageLabel}"${sendEmail ? ' and sent email!' : '.'}`,
        );
      } else {
        const res = await applicationApi.bulkUpdateStage({
          applicationIds: targets.map((t) => t.id),
          currentStage: targetStage,
          rejectionReason: targetStage === 'REJECTED' ? rejectionReason.trim() : undefined,
          note:
            targetStage === 'REJECTED'
              ? rejectionReason.trim()
              : `${isVi ? 'Cập nhật hàng loạt sang vòng' : 'Bulk moved to'} ${stageLabel}`,
          sendEmail,
          customEmailSubject: sendEmail ? subject.trim() : undefined,
          customEmailBody: sendEmail ? body.trim() : undefined,
          sendChatMessage,
        });
        onSuccess(res.updatedApplications);
        toast(
          isVi
            ? `Đã cập nhật ${res.updatedCount}/${res.totalRequested} ứng viên sang "${stageLabel}"${
                sendEmail ? ` và gửi ${res.emailSentCount} email cá nhân hóa!` : '!'
              }`
            : `Updated ${res.updatedCount}/${res.totalRequested} candidates to "${stageLabel}"${
                sendEmail ? ` and sent ${res.emailSentCount} personalized emails!` : '!'
              }`,
        );
      }
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const advanceStages: { stage: Stage; labelVi: string; labelEn: string; descVi: string; descEn: string }[] = [
    {
      stage: 'SCREENING',
      labelVi: 'Vòng Sàng lọc (Screening)',
      labelEn: 'Screening Round',
      descVi: 'Vượt qua sơ loại CV, chuyển đánh giá chuyên môn',
      descEn: 'Passed initial CV check, moving to review',
    },
    {
      stage: 'INTERVIEW',
      labelVi: 'Vòng Phỏng vấn / Test',
      labelEn: 'Interview / Assessment',
      descVi: 'Mời tham gia phỏng vấn hoặc làm bài test kỹ thuật',
      descEn: 'Invite to technical interview or coding test',
    },
    {
      stage: 'OFFERED',
      labelVi: 'Gửi Đề nghị (Offer Letter)',
      labelEn: 'Job Offer Stage',
      descVi: 'Gửi thư mời nhận việc chính thức',
      descEn: 'Extend official offer letter to candidate',
    },
    {
      stage: 'HIRED',
      labelVi: 'Chính thức Trúng tuyển (Hired)',
      labelEn: 'Confirmed Hired',
      descVi: 'Xác nhận nhận việc & chào mừng Onboard',
      descEn: 'Confirm acceptance & welcome onboard',
    },
  ];

  const quickReasons = isVi ? QUICK_REJECTION_REASONS_VI : QUICK_REJECTION_REASONS_EN;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5"
      data-testid="stage-email-modal"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-soft-xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                mode === 'REJECT'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
              }`}
            >
              {mode === 'REJECT' ? <XCircle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {mode === 'REJECT'
                  ? isVi
                    ? 'Từ chối hồ sơ & Gửi Email phản hồi ứng viên'
                    : 'Reject Application & Send Candidate Feedback Email'
                  : isVi
                    ? 'Mời tham gia vòng tiếp theo & Gửi Email thông báo'
                    : 'Invite to Next Round & Send Notification Email'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {targets.length === 1
                  ? isVi
                    ? `Ứng viên: ${targets[0].candidateName} (${targets[0].candidateEmail}) · ${targets[0].jobTitle}`
                    : `Candidate: ${targets[0].candidateName} (${targets[0].candidateEmail}) · ${targets[0].jobTitle}`
                  : isVi
                    ? `Đang chọn gửi hàng loạt cho ${targets.length} ứng viên — Hệ thống tự động cá nhân hóa tên & vị trí cho từng người.`
                    : `Sending bulk email to ${targets.length} candidates — Name & job title are personalized automatically for each recipient.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          {/* Selected Recipients Strip (when multiple candidates selected) */}
          {targets.length > 1 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {isVi
                    ? `Danh sách người nhận (${targets.length} ứng viên)`
                    : `Recipients (${targets.length} candidates)`}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isVi ? 'Nhấn vào tên để xem trước nội dung riêng' : 'Click a candidate to preview their email'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {targets.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPreviewIndex(idx)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all cursor-pointer ${
                      previewIndex === idx
                        ? 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{t.candidateName}</span>
                    <span className="text-[10px] opacity-70">({t.jobTitle})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Target Stage or Rejection Reason */}
          {mode === 'ADVANCE' ? (
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
                {isVi ? '1. Chọn vòng tuyển dụng tiếp theo' : '1. Select Target Hiring Stage'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {advanceStages.map((item) => {
                  const active = targetStage === item.stage;
                  return (
                    <button
                      key={item.stage}
                      type="button"
                      data-testid={`select-stage-${item.stage}`}
                      onClick={() => handleStageSelect(item.stage)}
                      className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        active
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 bg-white dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center justify-between">
                        <span>{isVi ? item.labelVi : item.labelEn}</span>
                        {active && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {isVi ? item.descVi : item.descEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <label htmlFor="modal-reject-reason" className="block font-bold text-slate-800 dark:text-slate-200">
                {isVi
                  ? '1. Lý do từ chối (dùng để lưu lịch sử & chèn vào biến {{rejection_reason}})'
                  : '1. Rejection Reason (saved to history & inserted into {{rejection_reason}})'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickReasons.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRejectionReason(r)}
                    className={`px-2.5 py-1 rounded-xl text-xs border transition-colors cursor-pointer ${
                      rejectionReason === r
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-rose-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input
                id="modal-reject-reason"
                data-testid="modal-reject-reason"
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={
                  isVi
                    ? 'Nhập lý do từ chối cụ thể...'
                    : 'Enter specific rejection reason...'
                }
                className={inputCls}
              />
            </div>
          )}

          {/* Section 2: Choose System Template vs Custom Compose */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                {isVi ? '2. Nội dung Email gửi ứng viên' : '2. Candidate Email Content'}
              </label>
              <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <button
                  type="button"
                  data-testid="mode-system-template"
                  onClick={() => setComposeMode('TEMPLATE')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    composeMode === 'TEMPLATE'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isVi ? 'Văn mẫu hệ thống' : 'System Templates'}
                </button>
                <button
                  type="button"
                  data-testid="mode-custom-compose"
                  onClick={() => setComposeMode('CUSTOM')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    composeMode === 'CUSTOM'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isVi ? 'Tự viết / Chỉnh sửa' : 'Write Custom'}
                </button>
              </div>
            </div>

            {/* Template Selector Cards/Dropdown */}
            {composeMode === 'TEMPLATE' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  {isVi ? 'Chọn văn mẫu chuẩn HR:' : 'Select an HR template:'}
                </label>
                <select
                  data-testid="template-selector"
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className={inputCls}
                >
                  {availableTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {isVi ? tpl.titleVi : tpl.titleEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Variable Insertion Bar */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
                {isVi ? 'Chèn biến tự động:' : 'Insert variable:'}
              </span>
              {[
                { token: '{{candidate_name}}', labelVi: '+ Tên ứng viên', labelEn: '+ Candidate Name' },
                { token: '{{job_title}}', labelVi: '+ Vị trí công việc', labelEn: '+ Job Title' },
                { token: '{{company_name}}', labelVi: '+ Tên công ty', labelEn: '+ Company Name' },
                { token: '{{stage_name}}', labelVi: '+ Tên vòng', labelEn: '+ Stage Name' },
                ...(mode === 'REJECT'
                  ? [{ token: '{{rejection_reason}}', labelVi: '+ Lý do từ chối', labelEn: '+ Rejection Reason' }]
                  : []),
              ].map((v) => (
                <button
                  key={v.token}
                  type="button"
                  onClick={() => insertPlaceholder(v.token)}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-emerald-700 dark:text-emerald-300 hover:border-emerald-400 transition-colors cursor-pointer"
                >
                  {isVi ? v.labelVi : v.labelEn}
                </button>
              ))}
            </div>

            {/* Subject & Body Editor + Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isVi ? 'Tiêu đề Email (Subject)' : 'Email Subject'}
                  </label>
                  <input
                    data-testid="email-subject-input"
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setComposeMode('CUSTOM');
                    }}
                    placeholder={isVi ? 'Nhập tiêu đề email...' : 'Enter email subject...'}
                    className={inputCls}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isVi ? 'Nội dung Email (Body)' : 'Email Body'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setComposeMode('CUSTOM');
                        setSubject('');
                        setBody(
                          isVi
                            ? 'Chào {{candidate_name}},\n\n\n\nTrân trọng,\nĐội ngũ Tuyển dụng {{company_name}}'
                            : 'Dear {{candidate_name}},\n\n\n\nBest regards,\n{{company_name}} Recruitment Team',
                        );
                      }}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      {isVi ? 'Xóa trắng để tự viết mới' : 'Clear to write from scratch'}
                    </button>
                  </div>
                  <textarea
                    data-testid="email-body-textarea"
                    rows={10}
                    value={body}
                    onChange={(e) => {
                      setBody(e.target.value);
                      setComposeMode('CUSTOM');
                    }}
                    placeholder={
                      isVi
                        ? 'Soạn nội dung email gửi ứng viên...'
                        : 'Compose email content for candidate...'
                    }
                    className={`${inputCls} font-sans leading-relaxed`}
                  />
                </div>
              </div>

              {/* Live Rendered Email Preview */}
              <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/70 dark:bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {isVi ? 'Xem trước Email thực tế' : 'Live Email Preview'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPreview((p) => !p)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 lg:hidden"
                  >
                    {showPreview ? (isVi ? 'Ẩn' : 'Hide') : isVi ? 'Hiện' : 'Show'}
                  </button>
                </div>
                {showPreview && (
                  <div className="p-4 space-y-3 flex-1 overflow-y-auto text-xs" data-testid="email-live-preview">
                    <div className="space-y-1 pb-2.5 border-b border-slate-200/80 dark:border-slate-700/70">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="font-semibold w-16 shrink-0">{isVi ? 'Người gửi:' : 'From:'}</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 truncate">
                          {user?.fullName ? `${user.fullName} — ` : ''}
                          {previewTarget?.companyName || (isVi ? 'Phòng Tuyển dụng' : 'Recruitment Team')}
                        </span>
                      </div>
                      {user?.email && (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <span className="font-semibold w-16 shrink-0">{isVi ? 'Reply-To:' : 'Reply-To:'}</span>
                          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate">
                            {user.email}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="font-semibold w-16 shrink-0">{isVi ? 'Người nhận:' : 'To:'}</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {previewTarget?.candidateName} &lt;{previewTarget?.candidateEmail}&gt;
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
                        <span className="font-semibold w-16 shrink-0">{isVi ? 'Tiêu đề:' : 'Subject:'}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{previewSubject}</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 space-y-2.5 shadow-2xs">
                      <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {previewTarget?.companyName || 'TalentBridge'} · {isVi ? 'Bộ phận Tuyển dụng' : 'Recruitment'}
                      </div>
                      <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-200 leading-relaxed">
                        {previewBody}
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>
                          {isVi ? 'Vị trí:' : 'Role:'} <strong>{previewTarget?.jobTitle}</strong>
                        </span>
                        <span>
                          {isVi ? 'Trạng thái mới:' : 'New Stage:'} <strong>{stageLabel}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && <ErrorBox message={error} />}
          </div>

          {/* Sticky Footer: Delivery Options + Action Buttons */}
          <div className="shrink-0 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/95 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  {isVi
                    ? 'Gửi Email tới hộp thư ứng viên'
                    : 'Send Email to candidate inbox'}
                </span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendChatMessage}
                  onChange={(e) => setSendChatMessage(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  {isVi
                    ? 'Gửi kèm vào hộp thư Chat hệ thống'
                    : 'Also post to in-app Chat thread'}
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <button type="button" onClick={onClose} disabled={submitting} className={btnSecondary}>
                {isVi ? 'Hủy bỏ' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                data-testid="confirm-stage-email-submit"
                className={
                  mode === 'REJECT'
                    ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-50'
                    : btnPrimary
                }
              >
                <Send className="w-4 h-4" />
                {submitting
                  ? isVi
                    ? 'Đang xử lý & gửi mail...'
                    : 'Updating & sending...'
                  : mode === 'REJECT'
                    ? isVi
                      ? `Xác nhận Từ chối & Gửi mail (${targets.length})`
                      : `Confirm Reject & Send Email (${targets.length})`
                    : isVi
                      ? `Chuyển sang "${stageLabel}" & Gửi mail (${targets.length})`
                      : `Move to "${stageLabel}" & Send Email (${targets.length})`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const CandidatePanel: React.FC<{
  app: Application;
  onUpdated: (a: Application) => void;
  onOpenComposer: (mode: 'ADVANCE' | 'REJECT', targetStage?: Stage) => void;
}> = ({ app, onUpdated, onOpenComposer }) => {
  const toast = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang: 'vi' | 'en' = language === 'en' ? 'en' : 'vi';
  const isVi = lang === 'vi';
  const stageLabels = getStageLabels(lang);
  const nextStepMap = isVi ? NEXT_STEP_VI : NEXT_STEP_EN;
  const [activeTab, setActiveTab] = useState<'profile' | 'interviews' | 'notes' | 'messages'>('profile');

  // Profile Tab state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Interviews Tab state
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [scheduleData, setScheduleData] = useState({
    roundNumber: 1,
    title: 'Phỏng vấn chuyên môn',
    scheduledStart: '',
    durationMinutes: 45,
    format: 'ONLINE' as 'ONLINE' | 'OFFLINE',
    location: 'https://meet.google.com/demo-interview',
    notesToCandidate: 'Vui lòng chuẩn bị máy tính có camera và micro ổn định.',
    panelistUserIds: [] as number[],
  });
  const [evaluatingInterview, setEvaluatingInterview] = useState<InterviewDto | null>(null);
  const [evaluationData, setEvaluationData] = useState({
    technical: 4,
    communication: 4,
    problemSolving: 4,
    cultureFit: 4,
    recommendation: 'HIRE' as 'STRONG_HIRE' | 'HIRE' | 'NEUTRAL' | 'NO_HIRE' | 'STRONG_NO_HIRE',
    notes: '',
  });

  // Notes Tab state
  const [notes, setNotes] = useState<NoteDto[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePrivate, setNewNotePrivate] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Quick Messages Tab state
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [quickMsg, setQuickMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    setError(null);
    setActiveTab('profile');
    if (window.innerWidth < 1024) panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [app.id]);

  // Load Interviews when tab is active
  useEffect(() => {
    if (activeTab === 'interviews') {
      setLoadingInterviews(true);
      interviewApi
        .listForApplication(app.id)
        .then(setInterviews)
        .catch(() => {})
        .finally(() => setLoadingInterviews(false));

      teamApi
        .members()
        .then(setTeamMembers)
        .catch(() => {});
    }
  }, [activeTab, app.id]);

  // Load Notes when tab is active
  useEffect(() => {
    if (activeTab === 'notes') {
      setLoadingNotes(true);
      noteApi
        .list(app.id)
        .then(setNotes)
        .catch(() => {})
        .finally(() => setLoadingNotes(false));
    }
  }, [activeTab, app.id]);

  // Load Messages when tab is active
  useEffect(() => {
    if (activeTab === 'messages') {
      setLoadingMessages(true);
      messageApi
        .list(app.id)
        .then(setMessages)
        .catch(() => {})
        .finally(() => setLoadingMessages(false));
    }
  }, [activeTab, app.id]);

  const move = async (stage: Stage, rejectionReason?: string) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await applicationApi.updateStage(app.id, stage, rejectionReason);
      onUpdated(updated);
      toast(
        isVi
          ? `${app.candidateName}: ${stageLabels[stage]}. Ứng viên đã được thông báo.`
          : `${app.candidateName}: ${stageLabels[stage]}. Candidate notified.`,
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const viewCv = async () => {
    if (!app.cvId) return;
    try {
      await openCvFile(app.cvId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleData.scheduledStart) {
      toast('Vui lòng chọn thời gian bắt đầu');
      return;
    }

    const startDate = new Date(scheduleData.scheduledStart);
    const endDate = new Date(startDate.getTime() + scheduleData.durationMinutes * 60000);

    setBusy(true);
    try {
      const created = await interviewApi.schedule(app.id, {
        roundNumber: scheduleData.roundNumber,
        title: scheduleData.title,
        scheduledStart: startDate.toISOString(),
        scheduledEnd: endDate.toISOString(),
        format: scheduleData.format,
        location: scheduleData.location,
        notesToCandidate: scheduleData.notesToCandidate,
        panelistUserIds: scheduleData.panelistUserIds,
      });

      setInterviews((prev) => [...prev, created]);
      setShowScheduleModal(false);
      toast('Đã lên lịch phỏng vấn và gửi email đính kèm lịch (.ics) cho ứng viên.');
      if (app.currentStage === 'SCREENING' || app.currentStage === 'APPLIED') {
        move('INTERVIEW');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Lỗi lên lịch phỏng vấn');
    } finally {
      setBusy(false);
    }
  };

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingInterview) return;

    setBusy(true);
    try {
      const scorecard = {
        'Kỹ năng chuyên môn': evaluationData.technical,
        'Giao tiếp & Ứng xử': evaluationData.communication,
        'Giải quyết vấn đề': evaluationData.problemSolving,
        'Phù hợp văn hóa': evaluationData.cultureFit,
      };

      const res = await interviewApi.evaluate(evaluatingInterview.id, {
        scorecard,
        recommendation: evaluationData.recommendation,
        notes: evaluationData.notes,
      });

      setInterviews((prev) =>
        prev.map((i) => (i.id === evaluatingInterview.id ? { ...i, myEvaluation: res } : i)),
      );
      setEvaluatingInterview(null);
      toast('Đã lưu bảng đánh giá phỏng vấn.');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Lỗi gửi đánh giá');
    } finally {
      setBusy(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || submittingNote) return;

    setSubmittingNote(true);
    try {
      const saved = await noteApi.create(app.id, {
        content: newNoteContent.trim(),
        isPrivate: newNotePrivate,
      });
      setNotes((prev) => [saved, ...prev]);
      setNewNoteContent('');
      setNewNotePrivate(false);
      toast('Đã thêm ghi chú nội bộ.');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Lỗi thêm ghi chú');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Bạn chắc chắn muốn xóa ghi chú này?')) return;
    try {
      await noteApi.delete(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast('Đã xóa ghi chú.');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Lỗi xóa ghi chú');
    }
  };

  const handleSendQuickMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMsg.trim() || sendingMsg) return;

    setSendingMsg(true);
    try {
      const saved = await messageApi.send(app.id, quickMsg.trim());
      setMessages((prev) => [...prev, saved]);
      setQuickMsg('');
      toast('Đã gửi tin nhắn.');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Lỗi gửi tin nhắn');
    } finally {
      setSendingMsg(false);
    }
  };

  const next = nextStepMap[app.currentStage];
  const finished = app.currentStage === 'HIRED' || app.currentStage === 'REJECTED';
  const history = [...(app.history ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div
      ref={panelRef}
      className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-soft-xs scroll-mt-24 overflow-hidden"
      data-testid="candidate-panel"
    >
      {/* Candidate Top Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <Avatar name={app.candidateName} size="w-12 h-12" />
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 dark:text-white">{app.candidateName}</h2>
            {app.candidateHeadline && (
              <p className="text-sm text-slate-600 dark:text-slate-300">{app.candidateHeadline}</p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isVi ? 'Ứng tuyển ' : 'Applied for '}
              <Link
                to={`/jobs/${app.jobId}`}
                className="font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {app.jobTitle}
              </Link>{' '}
              · {formatDate(app.appliedAt, lang)}
            </p>
          </div>
          <StageBadge stage={app.currentStage} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
          <a
            href={`mailto:${app.candidateEmail}`}
            className="inline-flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <Mail className="w-4 h-4" /> {app.candidateEmail}
          </a>
          {app.candidatePhone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> {app.candidatePhone}
            </span>
          )}
          {app.candidateCity && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {app.candidateCity}
            </span>
          )}
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-4 pt-2 gap-1 text-xs font-bold">
        <button
          type="button"
          data-testid="tab-profile"
          onClick={() => setActiveTab('profile')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          {isVi ? 'Hồ sơ' : 'Profile'}
        </button>
        <button
          type="button"
          data-testid="tab-interviews"
          onClick={() => setActiveTab('interviews')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'interviews'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          {isVi ? 'Phỏng vấn' : 'Interviews'} {interviews.length > 0 && `(${interviews.length})`}
        </button>
        <button
          type="button"
          data-testid="tab-notes"
          onClick={() => setActiveTab('notes')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'notes'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <StickyNote className="w-3.5 h-3.5" />
          {isVi ? 'Ghi chú' : 'Notes'} {notes.length > 0 && `(${notes.length})`}
        </button>
        <button
          type="button"
          data-testid="tab-messages"
          onClick={() => setActiveTab('messages')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'messages'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {isVi ? 'Tin nhắn' : 'Messages'}
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="p-5 space-y-5 text-sm">
          {/* Interactive Pipeline Stepper */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isVi ? 'Tiến trình tuyển dụng (Nhấn vào vòng để gửi mail & chuyển trạng thái)' : 'Hiring Pipeline (Click stage to compose email & transition)'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED'] as Stage[]).map((st, idx) => {
                const currentIdx = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED'].indexOf(app.currentStage);
                const isCurrent = app.currentStage === st;
                const isPassed = currentIdx > idx;
                return (
                  <button
                    key={st}
                    type="button"
                    disabled={finished || st === 'APPLIED' || isCurrent}
                    onClick={() => onOpenComposer('ADVANCE', st)}
                    className={`px-2 py-1.5 rounded-xl text-[11px] font-bold text-center border transition-all ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-600 text-white shadow-2xs'
                        : isPassed
                          ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:border-emerald-400 cursor-pointer'
                          : finished
                            ? 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-400 cursor-pointer'
                    }`}
                  >
                    {idx + 1}. {stageLabels[st]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {app.cvDownloadable ? (
              <button onClick={viewCv} className={btnSecondary} data-testid="view-cv">
                {isVi ? 'Xem CV' : 'View CV'}
                {app.cvFileName ? ` (${app.cvFileName})` : ''}
              </button>
            ) : (
              <span className="text-xs text-slate-500">
                {isVi ? 'CV mẫu từ dữ liệu demo — không có file đính kèm.' : 'Demo CV record — no file attachment.'}
              </span>
            )}
            {app.matchScore !== null && app.matchScore !== undefined && (
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {isVi ? (
                  <>
                    Khớp <span className="font-semibold">{Math.round(app.matchScore)}%</span> kỹ năng yêu cầu
                  </>
                ) : (
                  <>
                    Matched <span className="font-semibold">{Math.round(app.matchScore)}%</span> of required skills
                  </>
                )}
              </span>
            )}
          </div>

          {app.candidateSkills?.length > 0 && (
            <div>
              <p className="font-medium text-slate-900 dark:text-white mb-1.5">{isVi ? 'Kỹ năng' : 'Skills'}</p>
              <div className="flex flex-wrap gap-1.5">
                {app.candidateSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="font-medium text-slate-900 dark:text-white mb-1.5">{isVi ? 'Thư giới thiệu' : 'Cover Letter'}</p>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line selectable-text">
              {app.coverLetter?.trim() || (
                <span className="text-slate-400">
                  {isVi ? 'Ứng viên không gửi thư giới thiệu.' : 'No cover letter provided.'}
                </span>
              )}
            </p>
          </div>

          {app.currentStage === 'REJECTED' && app.rejectionReason && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-slate-700 dark:text-slate-300">
              <span className="font-medium">{isVi ? 'Lý do từ chối: ' : 'Rejection reason: '}</span>
              {app.rejectionReason}
            </div>
          )}

          <div>
            <p className="font-medium text-slate-900 dark:text-white mb-1.5">{isVi ? 'Lịch sử' : 'History'}</p>
            <ol className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 space-y-2">
              {history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-800 dark:text-slate-200">
                    {h.fromStage ? `${stageLabels[h.fromStage]} → ${stageLabels[h.toStage]}` : isVi ? 'Nộp hồ sơ' : 'Submitted application'}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">{formatDateTime(h.createdAt, lang)}</span>
                  {h.note && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{h.note}</p>}
                </li>
              ))}
            </ol>
          </div>

          {error && <ErrorBox message={error} />}

          {!finished && (
            <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={busy}
                onClick={() => onOpenComposer('ADVANCE', next?.stage)}
                className={btnPrimary}
                data-testid="next-stage"
              >
                <Mail className="w-4 h-4" />
                {isVi
                  ? `Mời vòng tiếp theo (${next ? stageLabels[next.stage] : 'Tiếp tục'}) & Gửi mail`
                  : `Invite Next Round (${next ? stageLabels[next.stage] : 'Advance'}) & Send Email`}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onOpenComposer('REJECT', 'REJECTED')}
                data-testid="reject-stage-btn"
                className={`${btnSecondary} !text-rose-600 dark:!text-rose-400 hover:!border-rose-300`}
              >
                <XCircle className="w-4 h-4" />
                {isVi ? 'Từ chối & Gửi mail phản hồi' : 'Reject & Send Feedback Email'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERVIEWS */}
      {activeTab === 'interviews' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Lịch phỏng vấn ứng viên</h3>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-soft-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Lên lịch phỏng vấn
            </button>
          </div>

          {loadingInterviews ? (
            <p className="text-xs text-slate-400 py-4 text-center">Đang tải lịch phỏng vấn...</p>
          ) : interviews.length === 0 ? (
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="font-medium">Chưa có buổi phỏng vấn nào cho ứng viên này.</p>
              <p className="mt-1 text-slate-400">
                Nhấn "Lên lịch phỏng vấn" để gửi thư mời kèm file lịch (.ics) và phân công người phỏng vấn.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Vòng {item.roundNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.title || 'Phỏng vấn'}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDateTime(item.scheduledStart)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.format === 'ONLINE' ? (
                        <Video className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Building className="w-3.5 h-3.5 text-teal-500" />
                      )}
                      <span>
                        {item.format === 'ONLINE' ? 'Trực tuyến' : 'Trực tiếp'}:{' '}
                        {item.location ? (
                          item.location.startsWith('http') ? (
                            <a
                              href={item.location}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:underline"
                            >
                              {item.location}
                            </a>
                          ) : (
                            item.location
                          )
                        ) : (
                          'Chưa cập nhật'
                        )}
                      </span>
                    </div>
                  </div>

                  {item.panelists && item.panelists.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <p className="text-[11px] font-bold text-slate-500 mb-1">Người phỏng vấn:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.panelists.map((p) => (
                          <span
                            key={p.userId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 text-[11px] border border-slate-200 dark:border-slate-600"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {p.fullName}
                            </span>
                            {p.evaluated && (
                              <span title="Đã đánh giá">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evaluation Actions */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    {item.myEvaluation ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Đã gửi đánh giá (Đề xuất:{' '}
                        {item.myEvaluation.recommendation})
                      </span>
                    ) : (
                      <button
                        onClick={() => setEvaluatingInterview(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300/80 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" /> Đánh giá ứng viên (Scorecard)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Schedule Form Modal */}
          {showScheduleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-soft-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Lên lịch phỏng vấn mới
                </h3>
                <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                        Vòng phỏng vấn
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={scheduleData.roundNumber}
                        onChange={(e) =>
                          setScheduleData({ ...scheduleData, roundNumber: Number(e.target.value) })
                        }
                        className={inputCls}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                        Thời lượng (phút)
                      </label>
                      <input
                        type="number"
                        min={15}
                        step={15}
                        value={scheduleData.durationMinutes}
                        onChange={(e) =>
                          setScheduleData({ ...scheduleData, durationMinutes: Number(e.target.value) })
                        }
                        className={inputCls}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                      Tiêu đề buổi PV
                    </label>
                    <input
                      type="text"
                      value={scheduleData.title}
                      onChange={(e) => setScheduleData({ ...scheduleData, title: e.target.value })}
                      className={inputCls}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                      Thời gian bắt đầu
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleData.scheduledStart}
                      onChange={(e) => setScheduleData({ ...scheduleData, scheduledStart: e.target.value })}
                      className={inputCls}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                        Hình thức
                      </label>
                      <select
                        value={scheduleData.format}
                        onChange={(e) =>
                          setScheduleData({
                            ...scheduleData,
                            format: e.target.value as 'ONLINE' | 'OFFLINE',
                          })
                        }
                        className={inputCls}
                      >
                        <option value="ONLINE">Trực tuyến (Online)</option>
                        <option value="OFFLINE">Trực tiếp (Tại văn phòng)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                        Link họp / Địa chỉ
                      </label>
                      <input
                        type="text"
                        value={scheduleData.location}
                        onChange={(e) => setScheduleData({ ...scheduleData, location: e.target.value })}
                        className={inputCls}
                        placeholder={
                          scheduleData.format === 'ONLINE' ? 'https://meet.google.com/...' : 'Địa chỉ cty'
                        }
                        required
                      />
                    </div>
                  </div>

                  {teamMembers.length > 0 && (
                    <div>
                      <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                        Phân công người phỏng vấn (Panelists)
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-1">
                        {teamMembers.map((m) => {
                          const checked = scheduleData.panelistUserIds.includes(m.userId);
                          return (
                            <label
                              key={m.userId}
                              className="flex items-center gap-2 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...scheduleData.panelistUserIds, m.userId]
                                    : scheduleData.panelistUserIds.filter((id) => id !== m.userId);
                                  setScheduleData({ ...scheduleData, panelistUserIds: next });
                                }}
                              />
                              <span className="text-xs">
                                <strong>{m.fullName}</strong> ({m.jobTitle || m.teamRole})
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                      Ghi chú gửi ứng viên (email)
                    </label>
                    <textarea
                      rows={2}
                      value={scheduleData.notesToCandidate}
                      onChange={(e) =>
                        setScheduleData({ ...scheduleData, notesToCandidate: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className={btnSecondary}
                    >
                      Hủy
                    </button>
                    <button type="submit" disabled={busy} className={btnPrimary}>
                      {busy ? 'Đang lên lịch...' : 'Xác nhận & Gửi thư mời'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Evaluation Form Modal */}
          {evaluatingInterview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-soft-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Đánh giá phỏng vấn — Vòng {evaluatingInterview.roundNumber}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Thang điểm 1 (kém) đến 5 (xuất sắc). Điểm số chỉ hiển thị với Admin & Recruiter phụ trách.
                </p>

                <form onSubmit={handleEvaluationSubmit} className="space-y-3.5 text-xs sm:text-sm">
                  {[
                    { key: 'technical', label: '1. Kỹ năng chuyên môn' },
                    { key: 'communication', label: '2. Giao tiếp & Trình bày' },
                    { key: 'problemSolving', label: '3. Tư duy giải quyết vấn đề' },
                    { key: 'cultureFit', label: '4. Phù hợp văn hóa & Thái độ' },
                  ].map((field) => (
                    <div key={field.key} className="flex items-center justify-between">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{field.label}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() =>
                              setEvaluationData({
                                ...evaluationData,
                                [field.key]: score,
                              })
                            }
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                              (evaluationData as any)[field.key] >= score
                                ? 'bg-amber-400 text-amber-950 font-black'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                      Đề xuất tuyển dụng
                    </label>
                    <select
                      value={evaluationData.recommendation}
                      onChange={(e) =>
                        setEvaluationData({
                          ...evaluationData,
                          recommendation: e.target.value as any,
                        })
                      }
                      className={inputCls}
                    >
                      <option value="STRONG_HIRE">Rất muốn tuyển (Strong Hire)</option>
                      <option value="HIRE">Đồng ý tuyển (Hire)</option>
                      <option value="NEUTRAL">Phân vân / Trung lập (Neutral)</option>
                      <option value="NO_HIRE">Không tuyển (No Hire)</option>
                      <option value="STRONG_NO_HIRE">Kiên quyết từ chối (Strong No Hire)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                      Nhận xét chi tiết
                    </label>
                    <textarea
                      rows={3}
                      value={evaluationData.notes}
                      onChange={(e) =>
                        setEvaluationData({ ...evaluationData, notes: e.target.value })
                      }
                      placeholder="Ưu điểm, nhược điểm, mức lương đề xuất..."
                      className={inputCls}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEvaluatingInterview(null)}
                      className={btnSecondary}
                    >
                      Đóng
                    </button>
                    <button type="submit" disabled={busy} className={btnPrimary}>
                      {busy ? 'Đang lưu...' : 'Gửi bảng đánh giá'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NOTES */}
      {activeTab === 'notes' && (
        <div className="p-5 space-y-4">
          <form onSubmit={handleAddNote} className="space-y-2">
            <textarea
              data-testid="new-note-textarea"
              rows={2}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Thêm ghi chú nội bộ về ứng viên này (chỉ hội đồng tuyển dụng xem được)..."
              className={inputCls}
            />
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNotePrivate}
                  onChange={(e) => setNewNotePrivate(e.target.checked)}
                />
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Chỉ mình tôi và Quản trị viên xem được (Private)</span>
              </label>
              <button
                type="submit"
                disabled={!newNoteContent.trim() || submittingNote}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {submittingNote ? 'Đang lưu...' : 'Thêm ghi chú'}
              </button>
            </div>
          </form>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            {loadingNotes ? (
              <p className="text-xs text-slate-400 text-center py-4">Đang tải ghi chú...</p>
            ) : notes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Chưa có ghi chú nào.</p>
            ) : (
              <div className="space-y-2.5">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{n.authorName}</span>
                        <span className="text-[10px] text-slate-400">({n.authorRole})</span>
                        {n.isPrivate ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <Lock className="w-2.5 h-2.5" /> Riêng tư
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            <Globe className="w-2.5 h-2.5" /> Toàn đội ngũ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{timeAgo(n.createdAt)}</span>
                        {n.mine && (
                          <button
                            onClick={() => handleDeleteNote(n.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                            title="Xóa ghi chú"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: QUICK MESSAGES */}
      {activeTab === 'messages' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Trao đổi nhanh với {app.candidateName}
            </span>
            <Link
              to={`/messages?applicationId=${app.id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Mở trang chat đầy đủ <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
            {loadingMessages ? (
              <p className="text-xs text-slate-400 text-center py-4">Đang tải tin nhắn...</p>
            ) : messages.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Chưa có tin nhắn nào.</p>
            ) : (
              messages.map((m) => {
                const isMe = m.senderUserId === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                      isMe
                        ? 'ml-auto bg-emerald-600 text-white'
                        : 'mr-auto bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="font-bold text-[10px] opacity-75 mb-0.5">
                      {isMe ? 'Bạn' : m.senderName} · {formatDateTime(m.createdAt)}
                    </p>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendQuickMsg} className="flex gap-2">
            <input
              type="text"
              value={quickMsg}
              onChange={(e) => setQuickMsg(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className={`${inputCls} text-xs`}
            />
            <button
              type="submit"
              disabled={!quickMsg.trim() || sendingMsg}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              <Send className="w-3.5 h-3.5" /> Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export const ApplicantsPage: React.FC = () => {
  const { language } = useLanguage();
  const lang: 'vi' | 'en' = language === 'en' ? 'en' : 'vi';
  const isVi = lang === 'vi';
  const stageLabels = getStageLabels(lang);
  usePageTitle(isVi ? 'Ứng viên' : 'Applicants');
  const [params, setParams] = useSearchParams();
  const jobFilter = params.get('job') ?? '';
  const stageFilter = params.get('stage') ?? '';
  const selectedId = params.get('id');
  const [apps, setApps] = useState<Application[] | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Multi-select & Email Composer state
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [composerState, setComposerState] = useState<{
    open: boolean;
    mode: 'ADVANCE' | 'REJECT';
    initialStage?: Stage;
    targets: Application[];
  }>({
    open: false,
    mode: 'ADVANCE',
    targets: [],
  });

  const load = () => {
    setError(null);
    applicationApi
      .forRecruiter()
      .then(setApps)
      .catch((e: Error) => setError(e.message));
  };

  useEffect(() => {
    load();
    jobApi.mine().then(setJobs).catch(() => undefined);
  }, []);

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: 'id' in changes });
  };

  const byJob = useMemo(
    () => (apps ?? []).filter((a) => !jobFilter || String(a.jobId) === jobFilter),
    [apps, jobFilter],
  );
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byJob
      .filter((a) => !stageFilter || a.currentStage === stageFilter)
      .filter(
        (a) =>
          !q ||
          `${a.candidateName} ${a.candidateEmail} ${a.candidateHeadline ?? ''}`
            .toLowerCase()
            .includes(q),
      )
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }, [byJob, stageFilter, query]);

  const eligibleVisible = useMemo(
    () => visible.filter((a) => a.currentStage !== 'HIRED' && a.currentStage !== 'REJECTED'),
    [visible],
  );

  const selectedAppsForBulk = useMemo(
    () => (apps ?? []).filter((a) => checkedIds.includes(a.id) && a.currentStage !== 'HIRED' && a.currentStage !== 'REJECTED'),
    [apps, checkedIds],
  );

  const allEligibleChecked =
    eligibleVisible.length > 0 && eligibleVisible.every((a) => checkedIds.includes(a.id));

  const toggleCheckOne = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleCheckAllEligible = () => {
    if (allEligibleChecked) {
      const eligibleSet = new Set(eligibleVisible.map((a) => a.id));
      setCheckedIds((prev) => prev.filter((id) => !eligibleSet.has(id)));
    } else {
      const merged = new Set([...checkedIds, ...eligibleVisible.map((a) => a.id)]);
      setCheckedIds(Array.from(merged));
    }
  };

  const selected =
    (selectedId
      ? visible.find((a) => String(a.id) === selectedId) ??
        (apps ?? []).find((a) => String(a.id) === selectedId)
      : visible[0]) ?? null;

  if (error)
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ErrorBox message={error} onRetry={load} />
      </div>
    );
  if (!apps) return <PageLoader />;

  const jobOptions = jobs.length
    ? jobs
    : [...new Map(apps.map((a) => [a.jobId, { id: a.jobId, title: a.jobTitle } as Job])).values()];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {isVi ? 'Quản lý Ứng viên & Gửi phản hồi' : 'Applicants & Candidate Outreach'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isVi
              ? 'Chọn một hoặc nhiều ứng viên để mời tham gia vòng tiếp theo hoặc gửi thư từ chối theo văn mẫu / tự soạn.'
              : 'Select one or multiple candidates to invite to the next round or send polite rejection emails using templates or custom text.'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          aria-label={isVi ? 'Lọc theo tin' : 'Filter by job'}
          value={jobFilter}
          onChange={(e) => update({ job: e.target.value, id: '' })}
          className={`${inputCls} w-auto max-w-xs`}
        >
          <option value="">{isVi ? 'Tất cả tin tuyển dụng' : 'All Job Postings'}</option>
          {jobOptions.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isVi ? 'Tìm theo tên, email' : 'Search by name, email'}
            aria-label={isVi ? 'Tìm ứng viên' : 'Search applicants'}
            className={`${inputCls} pl-9 w-64`}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {['', ...STAGES].map((s) => {
          const count = s ? byJob.filter((a) => a.currentStage === s).length : byJob.length;
          return (
            <button
              key={s || 'all'}
              onClick={() => update({ stage: s, id: '' })}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
                stageFilter === s
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                  : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              {s ? stageLabels[s] : isVi ? 'Tất cả' : 'All'} ({count})
            </button>
          );
        })}
      </div>

      {/* Multi-Select Bulk Action Bar */}
      {selectedAppsForBulk.length > 0 && (
        <div
          data-testid="bulk-action-bar"
          className="mt-4 rounded-2xl border border-emerald-500/50 bg-emerald-50/90 dark:bg-emerald-950/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-soft-xs"
        >
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-600 text-white text-xs font-extrabold">
              {selectedAppsForBulk.length}
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {isVi
                  ? `Đã chọn ${selectedAppsForBulk.length} ứng viên đủ điều kiện`
                  : `${selectedAppsForBulk.length} eligible candidates selected`}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                {isVi
                  ? 'Gửi email hàng loạt với tên ứng viên và vị trí tuyển dụng được cá nhân hóa tự động.'
                  : 'Send bulk emails with candidate name and job title personalized automatically.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="bulk-invite-btn"
              onClick={() =>
                setComposerState({
                  open: true,
                  mode: 'ADVANCE',
                  initialStage: 'INTERVIEW',
                  targets: selectedAppsForBulk,
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              {isVi
                ? `Mời vòng tiếp theo & Gửi mail (${selectedAppsForBulk.length})`
                : `Invite Next Round & Email (${selectedAppsForBulk.length})`}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              data-testid="bulk-reject-btn"
              onClick={() =>
                setComposerState({
                  open: true,
                  mode: 'REJECT',
                  initialStage: 'REJECTED',
                  targets: selectedAppsForBulk,
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              {isVi
                ? `Từ chối & Gửi mail (${selectedAppsForBulk.length})`
                : `Reject & Email (${selectedAppsForBulk.length})`}
            </button>
            <button
              type="button"
              data-testid="bulk-clear-btn"
              onClick={() => setCheckedIds([])}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
            >
              {isVi ? 'Bỏ chọn' : 'Clear'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div>
          {visible.length === 0 ? (
            <EmptyState
              title={isVi ? 'Không có ứng viên nào' : 'No applicants found'}
              description={
                apps.length === 0
                  ? isVi
                    ? 'Hồ sơ ứng tuyển vào tin của bạn sẽ xuất hiện ở đây.'
                    : 'Applications submitted to your job postings will appear here.'
                  : isVi
                    ? 'Thử bỏ bớt bộ lọc.'
                    : 'Try clearing some filters.'
              }
            />
          ) : (
            <div className="space-y-2.5">
              {/* Select All Eligible Bar */}
              {eligibleVisible.length > 0 && (
                <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-xs">
                  <button
                    type="button"
                    data-testid="select-all-applicants"
                    onClick={toggleCheckAllEligible}
                    className="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                  >
                    {allEligibleChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {isVi
                        ? `Chọn tất cả ứng viên đang xử lý (${eligibleVisible.length})`
                        : `Select all active applicants (${eligibleVisible.length})`}
                    </span>
                  </button>
                  {selectedAppsForBulk.length > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {isVi ? `Đã chọn ${selectedAppsForBulk.length}` : `${selectedAppsForBulk.length} selected`}
                    </span>
                  )}
                </div>
              )}

              <ul className="space-y-2" data-testid="applicant-list">
                {visible.map((a) => {
                  const isFinal = a.currentStage === 'HIRED' || a.currentStage === 'REJECTED';
                  const isChecked = checkedIds.includes(a.id);
                  return (
                    <li key={a.id}>
                      <div
                        onClick={() => update({ id: String(a.id) })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') update({ id: String(a.id) });
                        }}
                        className={`w-full text-left bg-white dark:bg-slate-900/95 border rounded-2xl p-3.5 flex items-center gap-3 hover:border-emerald-300 transition-colors cursor-pointer ${
                          selected?.id === a.id
                            ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                            : isChecked
                              ? 'border-emerald-400/70 bg-emerald-50/20 dark:bg-emerald-950/10'
                              : 'border-slate-200 dark:border-slate-800'
                        }`}
                        data-testid="applicant-item"
                      >
                        <button
                          type="button"
                          disabled={isFinal}
                          data-testid={`select-applicant-${a.id}`}
                          onClick={(e) => toggleCheckOne(a.id, e)}
                          title={
                            isFinal
                              ? isVi
                                ? 'Hồ sơ đã kết thúc (Đã tuyển / Đã từ chối)'
                                : 'Application finalized (Hired / Rejected)'
                              : isVi
                                ? 'Chọn ứng viên để gửi mail hàng loạt'
                                : 'Select candidate for bulk email'
                          }
                          className={`p-1 rounded-lg transition-colors shrink-0 ${
                            isFinal
                              ? 'opacity-30 cursor-not-allowed text-slate-400'
                              : isChecked
                                ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/60 cursor-pointer'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer'
                          }`}
                        >
                          {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                        <Avatar name={a.candidateName} size="w-10 h-10" />
                        <span className="flex-1 min-w-0">
                          <span className="block font-medium text-slate-900 dark:text-white truncate">
                            {a.candidateName}
                          </span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                            {a.jobTitle} · {timeAgo(a.appliedAt, lang)}
                          </span>
                        </span>
                        <span className="flex flex-col items-end gap-1 shrink-0">
                          <StageBadge stage={a.currentStage} />
                          {a.matchScore !== null && a.matchScore !== undefined && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {isVi ? `Khớp ${Math.round(a.matchScore)}%` : `${Math.round(a.matchScore)}% Match`}
                            </span>
                          )}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        <div className="lg:sticky lg:top-20 h-fit">
          {selected ? (
            <CandidatePanel
              app={selected}
              onUpdated={(u) =>
                setApps((list) => list?.map((x) => (x.id === u.id ? u : x)) ?? null)
              }
              onOpenComposer={(mode, targetStage) =>
                setComposerState({
                  open: true,
                  mode,
                  initialStage: targetStage,
                  targets: [selected],
                })
              }
            />
          ) : (
            <div className="hidden lg:block border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 text-center text-sm text-slate-500 dark:text-slate-400">
              {isVi ? 'Chọn một ứng viên để xem hồ sơ.' : 'Select an applicant to view their profile.'}
            </div>
          )}
        </div>
      </div>

      {/* Stage & Email Composer Modal (Single & Bulk) */}
      <StageEmailComposerModal
        open={composerState.open}
        mode={composerState.mode}
        initialStage={composerState.initialStage}
        targets={composerState.targets}
        lang={lang}
        onClose={() => setComposerState((prev) => ({ ...prev, open: false }))}
        onSuccess={(updatedList) => {
          const updatedMap = new Map(updatedList.map((u) => [u.id, u]));
          setApps((prev) => prev?.map((item) => updatedMap.get(item.id) ?? item) ?? null);
          setCheckedIds((prev) => prev.filter((id) => !updatedMap.has(id)));
        }}
      />
    </div>
  );
};
