import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send,
  MessageSquare,
  Search,
  Check,
  CheckCheck,
  Briefcase,
  Building2,
  ExternalLink,
  ChevronLeft,
  Clock,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Smile,
  Zap,
  PanelRightClose,
  PanelRightOpen,
  Calendar,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useRealtime } from '../realtime/RealtimeContext';
import { messageApi, applicationApi } from '../lib/api';
import type { MessageDto, ReadReceiptDto, ThreadSummary } from '../lib/types';
import { formatDate, formatDateTime, timeAgo } from '../lib/format';
import { Avatar } from '../components/layout/Navbar';

type ThreadFilter = 'all' | 'unread' | 'interview';

const STAGE_META: Record<
  string,
  { vi: string; en: string; cls: string; step: number }
> = {
  APPLIED: {
    vi: 'Đã nộp',
    en: 'Applied',
    cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    step: 1,
  },
  SCREENING: {
    vi: 'Sơ loại',
    en: 'Screening',
    cls: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    step: 2,
  },
  INTERVIEW: {
    vi: 'Phỏng vấn',
    en: 'Interview',
    cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    step: 3,
  },
  OFFERED: {
    vi: 'Offer',
    en: 'Offered',
    cls: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    step: 4,
  },
  HIRED: {
    vi: 'Đã tuyển',
    en: 'Hired',
    cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    step: 5,
  },
  REJECTED: {
    vi: 'Từ chối',
    en: 'Rejected',
    cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    step: 0,
  },
};

const PIPELINE_STEPS = [
  { key: 'APPLIED', vi: 'Đã nộp hồ sơ', en: 'Applied' },
  { key: 'SCREENING', vi: 'Sơ loại CV', en: 'Screening' },
  { key: 'INTERVIEW', vi: 'Phỏng vấn', en: 'Interview' },
  { key: 'OFFERED', vi: 'Đề nghị (Offer)', en: 'Offer' },
  { key: 'HIRED', vi: 'Tuyển dụng', en: 'Hired' },
];

const QUICK_EMOJIS = ['👍', '🎉', '😊', '🙏', '🤝', '📅', '✅', '🔥', '💼', '⭐'];

/** Renders Company logos with object-contain on white background so SVG logos (FPT, VNG) never crop. */
const CounterpartAvatar: React.FC<{
  name: string;
  url?: string | null;
  isCompany?: boolean;
  size?: string;
}> = ({ name, url, isCompany = false, size = 'w-10 h-10' }) => {
  const [broken, setBroken] = useState(false);
  if (url && !broken && isCompany) {
    return (
      <div
        className={`${size} rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 p-1.5 flex items-center justify-center shrink-0 shadow-2xs`}
      >
        <img
          src={url}
          alt={name}
          className="w-full h-full object-contain"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }
  return <Avatar name={name} url={url} size={size} />;
};

function formatClockTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDayLabel(iso: string, lang: 'vi' | 'en'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (d.toDateString() === todayStr) {
    return lang === 'vi' ? 'Hôm nay' : 'Today';
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return lang === 'vi' ? 'Hôm qua' : 'Yesterday';
  }
  return d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function isGroupedWithPrev(prev: MessageDto | undefined, curr: MessageDto): boolean {
  if (!prev) return false;
  if (prev.senderUserId !== curr.senderUserId) return false;
  if (!isSameDay(prev.createdAt, curr.createdAt)) return false;
  const diffMs = Math.abs(new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime());
  return diffMs <= 5 * 60 * 1000;
}

function renderMessageContentWithLinks(text: string, isMe: boolean): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, idx) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noreferrer"
          className={`underline font-semibold inline-flex items-center gap-0.5 break-all ${
            isMe
              ? 'text-white hover:text-emerald-100'
              : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
          }`}
        >
          {part}
          <ExternalLink className="w-3 h-3 shrink-0 inline" />
        </a>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export const MessagesPage: React.FC = () => {
  const { user, isRecruiter } = useAuth();
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const mySide: 'CANDIDATE' | 'COMPANY' = isRecruiter ? 'COMPANY' : 'CANDIDATE';
  const { subscribeToThread, subscribeToUserMessages, connected } = useRealtime();
  const [searchParams, setSearchParams] = useSearchParams();

  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(() => {
    const raw = searchParams.get('applicationId');
    return raw ? Number(raw) : null;
  });

  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ThreadFilter>('all');
  const [showContextDrawer, setShowContextDrawer] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplatePopover, setShowTemplatePopover] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickTemplates = useMemo(() => {
    if (isRecruiter) {
      return isVi
        ? [
            {
              label: '👋 Xác nhận đã nhận CV',
              text: 'Chào bạn, bộ phận Tuyển dụng (HR) đã nhận được CV ứng tuyển của bạn và đang tiến hành đánh giá hồ sơ. Chúng tôi sẽ phản hồi kết quả sớm nhất nhé!',
            },
            {
              label: '📅 Mời tham gia phỏng vấn',
              text: 'Chào bạn, hồ sơ của bạn rất phù hợp với vị trí đang tuyển. Bạn có thể sắp xếp tham gia buổi phỏng vấn trực tuyến qua Google Meet trong tuần này không?',
            },
            {
              label: '📋 Xin thêm Portfolio / GitHub',
              text: 'Chào bạn, hội đồng chuyên môn muốn xem thêm một số dự án thực tế hoặc link GitHub/Portfolio của bạn. Bạn gửi giúp HR qua khung chat này nhé!',
            },
            {
              label: '🎉 Thông báo vượt vòng PV',
              text: 'Chúc mừng bạn đã có buổi phỏng vấn rất ấn tượng! Bộ phận HR đang hoàn thiện thư mời nhận việc (Offer Letter) và sẽ gửi tới bạn trong hôm nay.',
            },
          ]
        : [
            {
              label: '👋 Acknowledge CV',
              text: 'Hi there! Our Recruiting team has received your application and is reviewing your profile. We will follow up with next steps shortly!',
            },
            {
              label: '📅 Invite to Interview',
              text: 'Hello! Your profile is a strong match for this role. Would you be available for a 45-minute online interview via Google Meet this week?',
            },
            {
              label: '📋 Request Portfolio / GitHub',
              text: 'Could you share a link to your latest GitHub repositories or portfolio projects for our technical panel to review?',
            },
            {
              label: '🎉 Offer Follow-up',
              text: 'Congratulations on passing the interview round! Our HR team is preparing your formal Offer Letter and will share it shortly.',
            },
          ];
    }
    return isVi
      ? [
          {
            label: '👋 Chào HR & giới thiệu bản thân',
            text: 'Em chào anh/chị bộ phận Tuyển dụng ạ! Em vừa nộp hồ sơ ứng tuyển vị trí này và rất mong có cơ hội được trao đổi thêm cùng quý công ty ạ.',
          },
          {
            label: '📅 Xác nhận tham gia phỏng vấn',
            text: 'Dạ em đã nhận được thư mời phỏng vấn và xin xác nhận sẽ tham gia đúng giờ ạ. Em cảm ơn anh/chị HR!',
          },
          {
            label: '❓ Hỏi về quy trình phỏng vấn',
            text: 'Anh/chị HR cho em hỏi vị trí này gồm mấy vòng phỏng vấn và nội dung trọng tâm của vòng tiếp theo là gì ạ?',
          },
          {
            label: '📄 Gửi thêm Portfolio / Dự án',
            text: 'Em xin gửi thêm thông tin các dự án thực tế và mã nguồn GitHub của em để hội đồng tuyển dụng tham khảo thêm ạ.',
          },
        ]
      : [
          {
            label: '👋 Say Hello to HR',
            text: 'Hello Hiring Team! I recently applied for this position and would love to discuss how my skills align with your team.',
          },
          {
            label: '📅 Confirm Interview',
            text: 'Thank you for the interview invitation! I confirm my attendance at the scheduled time.',
          },
          {
            label: '❓ Ask About Process',
            text: 'Could you share more details about the interview stages and what to prepare for the upcoming round?',
          },
          {
            label: '📄 Share Portfolio',
            text: 'I would like to share additional links to my recent projects and portfolio for the hiring team to review.',
          },
        ];
  }, [isRecruiter, isVi]);

  const sortThreads = useCallback((list: ThreadSummary[]): ThreadSummary[] => {
    return [...list].sort((a, b) => {
      if (a.lastMessageAt && b.lastMessageAt) {
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      }
      if (a.lastMessageAt && !b.lastMessageAt) return -1;
      if (!a.lastMessageAt && b.lastMessageAt) return 1;
      const appA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
      const appB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
      return appB - appA;
    });
  }, []);

  const activeThread = useMemo<ThreadSummary | null>(() => {
    if (!selectedAppId) return null;
    const found = threads.find((t) => t.applicationId === selectedAppId);
    if (found) return found;
    return {
      applicationId: selectedAppId,
      jobId: 0,
      jobTitle: isVi ? 'Hồ sơ tuyển dụng' : 'Application',
      companyName: isVi ? 'Nhà tuyển dụng' : 'Employer',
      companyLogo: null,
      candidateUserId: null,
      candidateName: isVi ? 'Ứng viên' : 'Candidate',
      currentStage: 'APPLIED',
      lastMessage: null,
      lastSenderSide: null,
      lastMessageAt: null,
      unreadCount: 0,
    };
  }, [threads, selectedAppId, isVi]);

  const loadThreads = useCallback(async () => {
    try {
      const data = await messageApi.threads();
      const urlAppId = searchParams.get('applicationId');
      if (urlAppId) {
        const id = Number(urlAppId);
        setSelectedAppId(id);
        if (!data.some((t) => t.applicationId === id)) {
          try {
            const app = await applicationApi.get(id);
            const extraThread: ThreadSummary = {
              applicationId: app.id,
              jobId: app.jobId,
              jobTitle: app.jobTitle,
              jobLocation: app.jobLocation,
              companyId: null,
              companyName: app.companyName,
              companyLogo: app.companyLogo,
              candidateUserId: null,
              candidateName: app.candidateName,
              candidateHeadline: app.candidateHeadline,
              candidateEmail: app.candidateEmail,
              candidatePhone: app.candidatePhone,
              candidateCity: app.candidateCity,
              currentStage: app.currentStage,
              appliedAt: app.appliedAt,
              lastMessage: null,
              lastSenderSide: null,
              lastMessageAt: null,
              unreadCount: 0,
              totalMessages: 0,
            };
            setThreads(sortThreads([extraThread, ...data]));
            return;
          } catch {
            // fallback handled by activeThread memo
          }
        }
      } else if (!selectedAppId && data.length > 0) {
        setSelectedAppId(data[0].applicationId);
      }
      setThreads(sortThreads(data));
    } catch (err) {
      console.error('Failed to load threads', err);
    } finally {
      setLoadingThreads(false);
    }
  }, [searchParams, selectedAppId, sortThreads]);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    const raw = searchParams.get('applicationId');
    if (raw) {
      setSelectedAppId(Number(raw));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedAppId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoadingMessages(true);
    messageApi
      .list(selectedAppId)
      .then((msgs) => {
        if (cancelled) return;
        setMessages(msgs);
        messageApi
          .markRead(selectedAppId)
          .then(() => {
            window.dispatchEvent(new Event('messages-unread-changed'));
          })
          .catch(() => {});
        setThreads((prev) =>
          prev.map((t) => (t.applicationId === selectedAppId ? { ...t, unreadCount: 0 } : t))
        );
      })
      .catch((err) => {
        console.error('Failed to load messages', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedAppId]);

  const handleIncomingRealtimeMessage = useCallback(
    (newMsg: MessageDto) => {
      const isCurrentThread = newMsg.applicationId === selectedAppId;
      const isFromMe = newMsg.senderUserId === user?.id;

      if (isCurrentThread) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          const withoutMatchingOptimistic = prev.filter(
            (m) => !(m.optimistic && m.senderUserId === newMsg.senderUserId && m.content === newMsg.content)
          );
          return [...withoutMatchingOptimistic, newMsg];
        });

        if (!isFromMe && selectedAppId) {
          messageApi
            .markRead(selectedAppId)
            .then(() => window.dispatchEvent(new Event('messages-unread-changed')))
            .catch(() => {});
        }
      }

      setThreads((prev) => {
        const exists = prev.some((t) => t.applicationId === newMsg.applicationId);
        if (!exists) {
          loadThreads();
          return prev;
        }
        const updated = prev.map((t) => {
          if (t.applicationId === newMsg.applicationId) {
            return {
              ...t,
              lastMessage: newMsg.content,
              lastSenderSide: newMsg.senderSide,
              lastSenderName: newMsg.senderName,
              lastMessageAt: newMsg.createdAt,
              lastMessageReadAt: newMsg.readAt,
              totalMessages: (t.totalMessages ?? 0) + 1,
              unreadCount: isCurrentThread || isFromMe ? 0 : t.unreadCount + 1,
            };
          }
          return t;
        });
        return sortThreads(updated);
      });
    },
    [selectedAppId, user?.id, loadThreads, sortThreads]
  );

  const handleRealtimeReadReceipt = useCallback(
    (receipt: ReadReceiptDto) => {
      if (receipt.applicationId === selectedAppId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderSide !== receipt.readerSide && !m.readAt
              ? { ...m, readAt: receipt.readAt }
              : m
          )
        );
      }
      setThreads((prev) =>
        prev.map((t) =>
          t.applicationId === receipt.applicationId
            ? {
                ...t,
                lastMessageReadAt:
                  t.lastSenderSide && t.lastSenderSide !== receipt.readerSide
                    ? receipt.readAt
                    : t.lastMessageReadAt,
              }
            : t
        )
      );
    },
    [selectedAppId]
  );

  useEffect(() => {
    if (!selectedAppId) return;
    return subscribeToThread(selectedAppId, handleIncomingRealtimeMessage, handleRealtimeReadReceipt);
  }, [selectedAppId, subscribeToThread, handleIncomingRealtimeMessage, handleRealtimeReadReceipt]);

  useEffect(() => {
    return subscribeToUserMessages(handleIncomingRealtimeMessage, handleRealtimeReadReceipt);
  }, [subscribeToUserMessages, handleIncomingRealtimeMessage, handleRealtimeReadReceipt]);

  // Scroll only the message stream container (never the outer window!)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length, selectedAppId]);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  };

  const handleSelectThread = (appId: number) => {
    setSelectedAppId(appId);
    setSearchParams({ applicationId: String(appId) });
    setShowEmojiPicker(false);
    setShowTemplatePopover(false);
  };

  const sendTextMessage = async (rawText: string) => {
    const text = rawText.trim();
    if (!selectedAppId || !text || sending) return;

    const tempId = -Date.now();
    const optimisticMsg: MessageDto = {
      id: tempId,
      applicationId: selectedAppId,
      senderUserId: user?.id ?? 0,
      senderName: user?.fullName ?? (isVi ? 'Bạn' : 'You'),
      senderAvatar: user?.avatarUrl ?? null,
      senderSide: mySide,
      content: text,
      createdAt: new Date().toISOString(),
      readAt: null,
      optimistic: true,
    };

    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setShowEmojiPicker(false);
    setShowTemplatePopover(false);
    setMessages((prev) => [...prev, optimisticMsg]);
    setSending(true);

    try {
      const saved = await messageApi.send(selectedAppId, text);
      setMessages((prev) => {
        const replaced = prev.map((m) => (m.id === tempId ? saved : m));
        const seen = new Set<number>();
        return replaced.filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
      });

      setThreads((prev) => {
        const updated = prev.map((t) =>
          t.applicationId === selectedAppId
            ? {
                ...t,
                lastMessage: saved.content,
                lastSenderSide: saved.senderSide,
                lastSenderName: saved.senderName,
                lastMessageAt: saved.createdAt,
                lastMessageReadAt: null,
                totalMessages: (t.totalMessages ?? 0) + 1,
              }
            : t
        );
        return sortThreads(updated);
      });

      textareaRef.current?.focus();
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setContent(text);
      alert(err?.message || (isVi ? 'Lỗi gửi tin nhắn' : 'Failed to send message'));
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await sendTextMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const totalUnreadThreads = useMemo(
    () => threads.filter((t) => t.unreadCount > 0).length,
    [threads]
  );

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      if (activeFilter === 'unread' && t.unreadCount === 0) return false;
      if (
        activeFilter === 'interview' &&
        !['INTERVIEW', 'OFFERED', 'HIRED'].includes(t.currentStage)
      ) {
        return false;
      }

      if (!filterQuery.trim()) return true;
      const q = filterQuery.toLowerCase();
      return (
        (t.jobTitle && t.jobTitle.toLowerCase().includes(q)) ||
        (t.companyName && t.companyName.toLowerCase().includes(q)) ||
        (t.candidateName && t.candidateName.toLowerCase().includes(q)) ||
        (t.candidateHeadline && t.candidateHeadline.toLowerCase().includes(q)) ||
        (t.lastMessage && t.lastMessage.toLowerCase().includes(q))
      );
    });
  }, [threads, activeFilter, filterQuery]);

  const lastMyMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderUserId === user?.id) {
        return messages[i].id;
      }
    }
    return null;
  }, [messages, user?.id]);

  const activeStageMeta = activeThread
    ? STAGE_META[activeThread.currentStage] ?? STAGE_META.APPLIED
    : STAGE_META.APPLIED;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 h-[calc(100vh-4.25rem)] flex flex-col">
      {/* Main Unified Messenger Card (Full-Height, Zero Outer Page Scroll) */}
      <div className="flex-1 flex bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-soft-sm overflow-hidden min-h-0">
        {/* COLUMN 1: Left Conversation Inbox Sidebar */}
        <div
          className={`w-full md:w-[310px] lg:w-[330px] shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-white dark:bg-slate-900 ${
            selectedAppId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Sidebar Header + Search + Symmetrical 3-Tab Filter */}
          <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-2xs">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <div>
                  <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                    {isVi ? 'Tin nhắn Tuyển dụng' : 'Messages'}
                    {totalUnreadThreads > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-emerald-600 text-white">
                        {totalUnreadThreads}
                      </span>
                    )}
                  </h1>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/70 text-[11px]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                  {connected ? 'Live' : '...'}
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                data-testid="thread-search-input"
                placeholder={
                  isVi
                    ? 'Tìm công ty, ứng viên, vị trí...'
                    : 'Search company, candidate, role...'
                }
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            {/* Symmetrical 3-Tab Segmented Control (No Scrollbar!) */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl">
              {(
                [
                  { id: 'all', vi: `Tất cả (${threads.length})`, en: `All (${threads.length})` },
                  {
                    id: 'unread',
                    vi: `Chưa đọc${totalUnreadThreads ? ` (${totalUnreadThreads})` : ''}`,
                    en: `Unread${totalUnreadThreads ? ` (${totalUnreadThreads})` : ''}`,
                  },
                  { id: 'interview', vi: 'Phỏng vấn', en: 'Interview' },
                ] as { id: ThreadFilter; vi: string; en: string }[]
              ).map((tab) => {
                const active = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    data-testid={`thread-filter-${tab.id}`}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer truncate ${
                      active
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isVi ? tab.vi : tab.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {loadingThreads ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {isVi ? 'Đang tải danh sách hội thoại...' : 'Loading conversations...'}
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-500" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isVi ? 'Không có cuộc trò chuyện phù hợp' : 'No matching conversations'}
                </p>
                <p className="text-[11px] mt-1 text-slate-500">
                  {isVi
                    ? 'Chuyển bộ lọc sang "Tất cả" để xem toàn bộ kênh trao đổi.'
                    : 'Switch filter to "All" to view all threads.'}
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.applicationId === selectedAppId;
                const counterpartName = isRecruiter
                  ? thread.candidateName || (isVi ? 'Ứng viên' : 'Candidate')
                  : thread.companyName || (isVi ? 'Nhà tuyển dụng' : 'Employer');
                const counterpartAvatar = isRecruiter
                  ? thread.candidateAvatar ?? null
                  : thread.companyLogo ?? null;
                const stageInfo = STAGE_META[thread.currentStage] ?? STAGE_META.APPLIED;
                const isLastFromMe = thread.lastSenderSide === mySide;
                const hasUnread = thread.unreadCount > 0;

                return (
                  <button
                    key={thread.applicationId}
                    type="button"
                    data-testid={`thread-item-${thread.applicationId}`}
                    onClick={() => handleSelectThread(thread.applicationId)}
                    className={`w-full text-left p-3 flex items-start gap-3 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-emerald-600 dark:border-emerald-500'
                        : hasUnread
                        ? 'bg-emerald-50/25 dark:bg-emerald-950/15 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <CounterpartAvatar
                        name={counterpartName}
                        url={counterpartAvatar}
                        isCompany={!isRecruiter}
                        size="w-11 h-11"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs truncate ${
                            hasUnread
                              ? 'font-black text-slate-950 dark:text-white'
                              : 'font-bold text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {counterpartName}
                        </p>
                        <span
                          className={`text-[10px] whitespace-nowrap shrink-0 ${
                            hasUnread
                              ? 'font-bold text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {thread.lastMessageAt
                            ? timeAgo(thread.lastMessageAt, language)
                            : thread.appliedAt
                            ? timeAgo(thread.appliedAt, language)
                            : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1.5 mt-0.5">
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                          {thread.jobTitle}
                        </p>
                        <span
                          className={`shrink-0 text-[9px] px-1.5 py-0.2 rounded border font-bold uppercase ${stageInfo.cls}`}
                        >
                          {isVi ? stageInfo.vi : stageInfo.en}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-1.5">
                        {thread.lastMessage ? (
                          <p
                            className={`text-xs truncate flex items-center gap-1 ${
                              hasUnread
                                ? 'font-bold text-slate-900 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {isLastFromMe && (
                              <span className="shrink-0 inline-flex items-center">
                                {thread.lastMessageReadAt ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </span>
                            )}
                            <span className="truncate">
                              {isLastFromMe ? (isVi ? 'Bạn: ' : 'You: ') : ''}
                              {thread.lastMessage}
                            </span>
                          </p>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                            <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                            {isVi ? 'Bắt đầu cuộc trò chuyện' : 'Start conversation'}
                          </span>
                        )}

                        {hasUnread && (
                          <span className="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: Center Active Conversation Stream */}
        <div
          className={`flex-1 flex flex-col h-full min-w-0 ${
            !selectedAppId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeThread ? (
            <>
              {/* Conversation Header */}
              <div className="h-16 px-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedAppId(null)}
                    className="md:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <CounterpartAvatar
                      name={
                        isRecruiter
                          ? activeThread.candidateName || 'Candidate'
                          : activeThread.companyName || 'Employer'
                      }
                      url={
                        isRecruiter
                          ? activeThread.candidateAvatar ?? null
                          : activeThread.companyLogo ?? null
                      }
                      isCompany={!isRecruiter}
                      size="w-10 h-10"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {isRecruiter
                          ? activeThread.candidateName || (isVi ? 'Ứng viên' : 'Candidate')
                          : activeThread.companyName || (isVi ? 'Nhà tuyển dụng' : 'Employer')}
                      </p>
                      <span
                        className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${activeStageMeta.cls}`}
                      >
                        {isVi ? activeStageMeta.vi : activeStageMeta.en}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                      {activeThread.jobTitle}
                    </p>
                  </div>
                </div>

                {/* Header Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={isRecruiter ? `/employer/applicants` : `/jobs/${activeThread.jobId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors whitespace-nowrap"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">
                      {isRecruiter
                        ? isVi
                          ? 'Hồ sơ ATS'
                          : 'ATS View'
                        : isVi
                        ? 'Xem việc làm'
                        : 'View Job'}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowContextDrawer((v) => !v)}
                    title={isVi ? 'Đóng/mở thông tin hồ sơ' : 'Toggle application dossier'}
                    className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer whitespace-nowrap ${
                      showContextDrawer
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {showContextDrawer ? (
                      <PanelRightClose className="w-4 h-4" />
                    ) : (
                      <PanelRightOpen className="w-4 h-4" />
                    )}
                    <span>{isVi ? 'Thông tin' : 'Info'}</span>
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-5 py-4 bg-slate-50/50 dark:bg-slate-950/30"
              >
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">
                    {isVi ? 'Đang tải lịch sử trò chuyện...' : 'Loading conversation history...'}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 max-w-lg mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-2xs">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {isVi
                        ? `Bắt đầu cuộc trò chuyện với ${
                            isRecruiter ? activeThread.candidateName : activeThread.companyName
                          }`
                        : `Start chatting with ${
                            isRecruiter ? activeThread.candidateName : activeThread.companyName
                          }`}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                      {isVi
                        ? 'Chọn nhanh một mẫu câu gợi ý bên dưới hoặc nhập tin nhắn trực tiếp:'
                        : 'Choose a quick conversation starter below or type your message:'}
                    </p>

                    {/* Clean 2x2 Grid of Quick Starters (Zero Horizontal Scrollbar!) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      {quickTemplates.map((tpl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setContent(tpl.text);
                            setTimeout(() => {
                              adjustTextareaHeight();
                              textareaRef.current?.focus();
                            }, 10);
                          }}
                          className="p-2.5 rounded-xl text-left text-xs font-bold bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/90 dark:border-slate-700 hover:border-emerald-300 transition cursor-pointer shadow-2xs flex items-center gap-2"
                        >
                          <span className="truncate">{tpl.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((msg, idx) => {
                      const prev = idx > 0 ? messages[idx - 1] : undefined;
                      const next = idx < messages.length - 1 ? messages[idx + 1] : undefined;
                      const showDateDivider = !prev || !isSameDay(prev.createdAt, msg.createdAt);
                      const groupedWithPrev = isGroupedWithPrev(prev, msg);
                      const groupedWithNext = next ? isGroupedWithPrev(msg, next) : false;
                      const isMe = msg.senderUserId === user?.id;
                      const isLastMyMessage = isMe && msg.id === lastMyMessageId;

                      return (
                        <React.Fragment key={msg.id}>
                          {showDateDivider && (
                            <div className="flex items-center justify-center my-4">
                              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {formatDayLabel(msg.createdAt, language)}
                              </span>
                            </div>
                          )}

                          <div
                            className={`flex items-end gap-2.5 ${
                              isMe ? 'justify-end' : 'justify-start'
                            } ${groupedWithPrev ? 'mt-1' : 'mt-3.5'}`}
                          >
                            {!isMe && (
                              <div className="w-7 shrink-0">
                                {!groupedWithNext ? (
                                  <Avatar
                                    name={msg.senderName || 'U'}
                                    url={msg.senderAvatar ?? null}
                                    size="w-7 h-7 text-[10px]"
                                  />
                                ) : null}
                              </div>
                            )}

                            <div
                              className={`flex flex-col max-w-[78%] sm:max-w-[70%] ${
                                isMe ? 'items-end' : 'items-start'
                              }`}
                            >
                              {!groupedWithPrev && (
                                <div
                                  className={`flex items-center gap-1.5 mb-1 px-1 ${
                                    isMe ? 'flex-row-reverse' : 'flex-row'
                                  }`}
                                >
                                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                    {isMe ? (isVi ? 'Bạn' : 'You') : msg.senderName}
                                  </span>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                      msg.senderSide === 'COMPANY'
                                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                                        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                    }`}
                                  >
                                    {msg.senderSide === 'COMPANY'
                                      ? isVi
                                        ? 'Nhà tuyển dụng'
                                        : 'Hiring Team'
                                      : isVi
                                      ? 'Ứng viên'
                                      : 'Candidate'}
                                  </span>
                                </div>
                              )}

                              <div
                                title={formatDateTime(msg.createdAt, language)}
                                className={`px-3.5 py-2.5 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-2xs transition-opacity ${
                                  msg.optimistic ? 'opacity-75' : 'opacity-100'
                                } ${
                                  isMe
                                    ? `bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl ${
                                        groupedWithPrev ? 'rounded-tr-md' : 'rounded-tr-sm'
                                      } ${groupedWithNext ? 'rounded-br-md' : ''}`
                                    : `bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl ${
                                        groupedWithPrev ? 'rounded-tl-md' : 'rounded-tl-sm'
                                      } ${groupedWithNext ? 'rounded-bl-md' : ''}`
                                }`}
                              >
                                <div>{renderMessageContentWithLinks(msg.content, isMe)}</div>
                                <div
                                  className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                                    isMe ? 'text-emerald-100/90' : 'text-slate-400'
                                  }`}
                                >
                                  <span>{formatClockTime(msg.createdAt)}</span>
                                </div>
                              </div>

                              {isLastMyMessage && (
                                <div className="flex items-center gap-1 mt-1 px-1 text-[11px] font-semibold">
                                  {msg.optimistic ? (
                                    <span className="text-slate-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3 animate-spin" />
                                      {isVi ? 'Đang gửi...' : 'Sending...'}
                                    </span>
                                  ) : msg.readAt ? (
                                    <span
                                      className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                                      data-testid="message-status-read"
                                    >
                                      <CheckCheck className="w-3.5 h-3.5" />
                                      {isVi
                                        ? `Đã xem lúc ${formatClockTime(msg.readAt)}`
                                        : `Seen at ${formatClockTime(msg.readAt)}`}
                                    </span>
                                  ) : (
                                    <span
                                      className="text-slate-400 dark:text-slate-500 flex items-center gap-1"
                                      data-testid="message-status-sent"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      {isVi ? 'Đã gửi' : 'Sent'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Composer Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0 relative"
              >
                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-3 z-20 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl flex items-center gap-1">
                    {QUICK_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          setContent((prev) => prev + em);
                          setShowEmojiPicker(false);
                          textareaRef.current?.focus();
                        }}
                        className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-base flex items-center justify-center transition cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Reply Templates Popover (Clean Floating Menu — Zero Horizontal Scrollbar!) */}
                {showTemplatePopover && (
                  <div className="absolute bottom-16 left-12 z-20 w-80 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl space-y-1">
                    <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      {isVi ? 'Mẫu câu trả lời nhanh' : 'Quick Reply Templates'}
                    </div>
                    {quickTemplates.map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setContent(tpl.text);
                          setShowTemplatePopover(false);
                          setTimeout(() => {
                            adjustTextareaHeight();
                            textareaRef.current?.focus();
                          }, 10);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 transition cursor-pointer"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker((v) => !v);
                    setShowTemplatePopover(false);
                  }}
                  title={isVi ? 'Biểu tượng cảm xúc' : 'Insert emoji'}
                  className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowTemplatePopover((v) => !v);
                    setShowEmojiPicker(false);
                  }}
                  title={isVi ? 'Mẫu câu trả lời nhanh' : 'Quick reply templates'}
                  className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                    showTemplatePopover
                      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50'
                      : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                </button>

                <div className="flex-1 min-w-0">
                  <textarea
                    ref={textareaRef}
                    data-testid="message-input"
                    rows={1}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      adjustTextareaHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isVi
                        ? 'Nhập tin nhắn... (Nhấn Enter để gửi)'
                        : 'Write a message... (Press Enter to send)'
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none overflow-hidden max-h-28 leading-normal"
                  />
                </div>

                <button
                  type="submit"
                  data-testid="send-message-btn"
                  disabled={!content.trim() || sending}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{isVi ? 'Gửi' : 'Send'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30 text-emerald-500" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                {isVi
                  ? 'Chọn một cuộc trò chuyện ở danh sách bên trái'
                  : 'Select a conversation from the left inbox'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {isVi
                  ? 'Mọi hồ sơ ứng tuyển đều được tạo kênh trao đổi trực tiếp giữa Ứng viên và Nhà tuyển dụng.'
                  : 'Every job application automatically opens a direct communication thread between Candidate and Hiring Team.'}
              </p>
            </div>
          )}
        </div>

        {/* COLUMN 3: Right Context Drawer (Recruitment Dossier) */}
        {activeThread && showContextDrawer && (
          <aside className="hidden lg:flex w-[280px] xl:w-[300px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/50 flex-col h-full overflow-y-auto p-3.5 space-y-2.5">
            {/* Counterpart Summary Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 text-center shadow-2xs">
              <div className="inline-flex relative">
                <CounterpartAvatar
                  name={
                    isRecruiter
                      ? activeThread.candidateName || 'Candidate'
                      : activeThread.companyName || 'Employer'
                  }
                  url={
                    isRecruiter
                      ? activeThread.candidateAvatar ?? null
                      : activeThread.companyLogo ?? null
                  }
                  isCompany={!isRecruiter}
                  size="w-12 h-12 text-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              <h3 className="mt-2 text-sm font-black text-slate-900 dark:text-white leading-tight">
                {isRecruiter ? activeThread.candidateName : activeThread.companyName}
              </h3>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {isRecruiter
                  ? activeThread.candidateHeadline ||
                    (isVi ? 'Ứng viên Công nghệ thông tin' : 'IT Candidate')
                  : isVi
                  ? 'Đội ngũ Tuyển dụng & Nhân sự'
                  : 'Verified Employer & HR Team'}
              </p>

              {isRecruiter && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-left space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  {activeThread.candidateEmail && (
                    <a
                      href={`mailto:${activeThread.candidateEmail}`}
                      className="flex items-center gap-1.5 hover:text-emerald-600 truncate"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{activeThread.candidateEmail}</span>
                    </a>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    {activeThread.candidatePhone && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{activeThread.candidatePhone}</span>
                      </div>
                    )}
                    {activeThread.candidateCity && (
                      <div className="flex items-center gap-1 shrink-0 text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{activeThread.candidateCity}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Recruitment Pipeline Progress */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isVi ? 'Tiến độ Tuyển dụng' : 'Pipeline Stage'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${activeStageMeta.cls}`}
                >
                  {isVi ? activeStageMeta.vi : activeStageMeta.en}
                </span>
              </div>

              {activeThread.currentStage === 'REJECTED' ? (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {isVi
                    ? 'Hồ sơ hiện ở trạng thái dừng quy trình tuyển dụng.'
                    : 'This application is currently marked as not selected.'}
                </div>
              ) : (
                <div className="space-y-1.5 pt-0.5">
                  {PIPELINE_STEPS.map((st, idx) => {
                    const currentStepNum = activeStageMeta.step;
                    const stepNum = idx + 1;
                    const done = stepNum <= currentStepNum;
                    const isCurrent = stepNum === currentStepNum;
                    return (
                      <div key={st.key} className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            done
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {done ? <CheckCircle2 className="w-3 h-3" /> : stepNum}
                        </div>
                        <span
                          className={
                            isCurrent
                              ? 'font-black text-emerald-700 dark:text-emerald-400'
                              : done
                              ? 'font-semibold text-slate-700 dark:text-slate-200'
                              : 'text-slate-400'
                          }
                        >
                          {isVi ? st.vi : st.en}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Job Context Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                {isVi ? 'Vị trí Ứng tuyển' : 'Target Position'}
              </div>

              <div>
                <Link
                  to={`/jobs/${activeThread.jobId}`}
                  className="text-xs font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 leading-snug block truncate"
                >
                  {activeThread.jobTitle}
                </Link>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{activeThread.companyName}</span>
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                {activeThread.jobLocation && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{activeThread.jobLocation}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  {activeThread.appliedAt && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {isVi ? 'Nộp: ' : 'Applied: '}
                        {formatDate(activeThread.appliedAt, language)}
                      </span>
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">
                    #{activeThread.applicationId}
                  </span>
                </div>
              </div>

              <div className="pt-0.5 flex flex-col">
                {isRecruiter ? (
                  <Link
                    to="/employer/applicants"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center transition"
                  >
                    {isVi ? 'Đánh giá & Chuyển vòng CV' : 'Review & Move Stage'}
                  </Link>
                ) : (
                  <Link
                    to={`/jobs/${activeThread.jobId}`}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center transition"
                  >
                    {isVi ? 'Xem chi tiết Tin tuyển dụng' : 'View Job Posting'}
                  </Link>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
