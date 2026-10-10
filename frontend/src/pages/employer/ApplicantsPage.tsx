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
} from 'lucide-react';
import { applicationApi, jobApi, interviewApi, noteApi, messageApi, teamApi, openCvFile } from '../../lib/api';
import type { Application, Job, Stage, InterviewDto, NoteDto, MessageDto, TeamMember } from '../../lib/types';
import { STAGES, STAGE_LABELS, formatDate, formatDateTime, timeAgo } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { EmptyState, ErrorBox, PageLoader, btnPrimary, btnSecondary, inputCls } from '../../components/ui/primitives';
import { Avatar } from '../../components/layout/Navbar';
import { StageBadge } from '../MyApplicationsPage';
import { usePageTitle } from '../../lib/usePageTitle';
import { useAuth } from '../../context/AuthContext';

const NEXT_STEP: Partial<Record<Stage, { stage: Stage; label: string }>> = {
  APPLIED: { stage: 'SCREENING', label: 'Chuyển sang xem xét' },
  SCREENING: { stage: 'INTERVIEW', label: 'Mời phỏng vấn' },
  INTERVIEW: { stage: 'OFFERED', label: 'Gửi offer' },
  OFFERED: { stage: 'HIRED', label: 'Xác nhận đã tuyển' },
};

const CandidatePanel: React.FC<{ app: Application; onUpdated: (a: Application) => void }> = ({ app, onUpdated }) => {
  const toast = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'interviews' | 'notes' | 'messages'>('profile');

  // Profile Tab state
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
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
    setRejecting(false);
    setReason('');
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
      setRejecting(false);
      toast(`${app.candidateName}: ${STAGE_LABELS[stage]}. Ứng viên đã được thông báo.`);
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
      // Auto-move stage to INTERVIEW if in SCREENING
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
        prev.map((i) => (i.id === evaluatingInterview.id ? { ...i, myEvaluation: res } : i))
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

  const next = NEXT_STEP[app.currentStage];
  const finished = app.currentStage === 'HIRED' || app.currentStage === 'REJECTED';
  const history = [...(app.history ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
              Ứng tuyển{' '}
              <Link
                to={`/jobs/${app.jobId}`}
                className="font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {app.jobTitle}
              </Link>{' '}
              · {formatDate(app.appliedAt)}
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
          Hồ sơ
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
          Phỏng vấn {interviews.length > 0 && `(${interviews.length})`}
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
          Ghi chú {notes.length > 0 && `(${notes.length})`}
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
          Tin nhắn
        </button>
      </div>

      {/* TAB 1: PROFILE (Exact existing layout & testids preserved) */}
      {activeTab === 'profile' && (
        <div className="p-5 space-y-5 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            {app.cvDownloadable ? (
              <button onClick={viewCv} className={btnSecondary} data-testid="view-cv">
                Xem CV{app.cvFileName ? ` (${app.cvFileName})` : ''}
              </button>
            ) : (
              <span className="text-xs text-slate-500">CV mẫu từ dữ liệu demo — không có file đính kèm.</span>
            )}
            {app.matchScore !== null && app.matchScore !== undefined && (
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Khớp <span className="font-semibold">{Math.round(app.matchScore)}%</span> kỹ năng yêu cầu
              </span>
            )}
          </div>

          {app.candidateSkills?.length > 0 && (
            <div>
              <p className="font-medium text-slate-900 dark:text-white mb-1.5">Kỹ năng</p>
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
            <p className="font-medium text-slate-900 dark:text-white mb-1.5">Thư giới thiệu</p>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line selectable-text">
              {app.coverLetter?.trim() || <span className="text-slate-400">Ứng viên không gửi thư giới thiệu.</span>}
            </p>
          </div>

          {app.currentStage === 'REJECTED' && app.rejectionReason && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-slate-700 dark:text-slate-300">
              <span className="font-medium">Lý do từ chối: </span>
              {app.rejectionReason}
            </div>
          )}

          <div>
            <p className="font-medium text-slate-900 dark:text-white mb-1.5">Lịch sử</p>
            <ol className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 space-y-2">
              {history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-800 dark:text-slate-200">
                    {h.fromStage ? `${STAGE_LABELS[h.fromStage]} → ${STAGE_LABELS[h.toStage]}` : 'Nộp hồ sơ'}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">{formatDateTime(h.createdAt)}</span>
                </li>
              ))}
            </ol>
          </div>

          {error && <ErrorBox message={error} />}

          {!finished && !rejecting && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {next && (
                <button
                  disabled={busy}
                  onClick={() => move(next.stage)}
                  className={btnPrimary}
                  data-testid="next-stage"
                >
                  {next.label}
                </button>
              )}
              <button
                disabled={busy}
                onClick={() => setRejecting(true)}
                className={`${btnSecondary} !text-rose-600 dark:!text-rose-400 hover:!border-rose-300`}
              >
                Từ chối
              </button>
            </div>
          )}
          {rejecting && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label htmlFor="reject-reason" className="font-medium text-slate-900 dark:text-white">
                Lý do (ứng viên sẽ nhìn thấy)
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Hồ sơ chưa phù hợp với yêu cầu về kinh nghiệm của vị trí."
                className={inputCls}
              />
              <div className="flex gap-2">
                <button
                  disabled={busy || !reason.trim()}
                  onClick={() => move('REJECTED', reason.trim())}
                  className={`${btnPrimary}`}
                >
                  Xác nhận từ chối
                </button>
                <button disabled={busy} onClick={() => setRejecting(false)} className={btnSecondary}>
                  Hủy
                </button>
              </div>
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
  usePageTitle('Ứng viên');
  const [params, setParams] = useSearchParams();
  const jobFilter = params.get('job') ?? '';
  const stageFilter = params.get('stage') ?? '';
  const selectedId = params.get('id');
  const [apps, setApps] = useState<Application[] | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    [apps, jobFilter]
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
            .includes(q)
      )
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }, [byJob, stageFilter, query]);

  const selected =
    visible.find((a) => String(a.id) === selectedId) ??
    (apps ?? []).find((a) => String(a.id) === selectedId) ??
    null;

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
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
        Ứng viên
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          aria-label="Lọc theo tin"
          value={jobFilter}
          onChange={(e) => update({ job: e.target.value, id: '' })}
          className={`${inputCls} w-auto max-w-xs`}
        >
          <option value="">Tất cả tin tuyển dụng</option>
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
            placeholder="Tìm theo tên, email"
            aria-label="Tìm ứng viên"
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
              {s ? STAGE_LABELS[s] : 'Tất cả'} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          {visible.length === 0 ? (
            <EmptyState
              title="Không có ứng viên nào"
              description={
                apps.length === 0
                  ? 'Hồ sơ ứng tuyển vào tin của bạn sẽ xuất hiện ở đây.'
                  : 'Thử bỏ bớt bộ lọc.'
              }
            />
          ) : (
            <ul className="space-y-2" data-testid="applicant-list">
              {visible.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => update({ id: String(a.id) })}
                    className={`w-full text-left bg-white dark:bg-slate-900/95 border rounded-2xl p-3.5 flex items-center gap-3 hover:border-emerald-300 transition-colors ${
                      selected?.id === a.id
                        ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                    data-testid="applicant-item"
                  >
                    <Avatar name={a.candidateName} size="w-10 h-10" />
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-slate-900 dark:text-white truncate">
                        {a.candidateName}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                        {a.jobTitle} · {timeAgo(a.appliedAt)}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1 shrink-0">
                      <StageBadge stage={a.currentStage} />
                      {a.matchScore !== null && a.matchScore !== undefined && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Khớp {Math.round(a.matchScore)}%
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="lg:sticky lg:top-20 h-fit">
          {selected ? (
            <CandidatePanel
              app={selected}
              onUpdated={(u) =>
                setApps((list) => list?.map((x) => (x.id === u.id ? u : x)) ?? null)
              }
            />
          ) : (
            <div className="hidden lg:block border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Chọn một ứng viên để xem hồ sơ.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
