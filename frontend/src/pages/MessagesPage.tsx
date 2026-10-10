import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send,
  MessageSquare,
  Search,
  CheckCheck,
  Briefcase,
  User as UserIcon,
  Building2,
  ExternalLink,
  ChevronLeft,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useRealtime } from '../realtime/RealtimeContext';
import { messageApi, applicationApi } from '../lib/api';
import type { MessageDto, ThreadSummary } from '../lib/types';
import { formatDateTime, timeAgo } from '../lib/format';
import { Avatar } from '../components/layout/Navbar';

export const MessagesPage: React.FC = () => {
  const { user, isRecruiter } = useAuth();
  const { language } = useLanguage();
  const { subscribeToThread, connected } = useRealtime();
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeThread = useMemo<ThreadSummary | null>(() => {
    if (!selectedAppId) return null;
    const found = threads.find((t) => t.applicationId === selectedAppId);
    if (found) return found;
    return {
      applicationId: selectedAppId,
      jobId: 0,
      jobTitle: language === 'vi' ? 'Hồ sơ tuyển dụng' : 'Application',
      companyName: language === 'vi' ? 'Nhà tuyển dụng' : 'Employer',
      companyLogo: null,
      candidateUserId: null,
      candidateName: language === 'vi' ? 'Ứng viên' : 'Candidate',
      currentStage: 'INTERVIEW',
      lastMessage: null,
      lastSenderSide: null,
      lastMessageAt: null,
      unreadCount: 0,
    };
  }, [threads, selectedAppId, language]);

  // Load thread list
  const loadThreads = async () => {
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
              companyName: app.companyName,
              companyLogo: app.companyLogo,
              candidateUserId: null,
              candidateName: app.candidateName,
              currentStage: app.currentStage,
              lastMessage: null,
              lastSenderSide: null,
              lastMessageAt: null,
              unreadCount: 0,
            };
            setThreads([extraThread, ...data]);
            return;
          } catch {
            // fallback handled by activeThread memo
          }
        }
      } else if (!selectedAppId && data.length > 0) {
        setSelectedAppId(data[0].applicationId);
      }
      setThreads(data);
    } catch (err) {
      console.error('Failed to load threads', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  // Update selectedAppId when URL query changes
  useEffect(() => {
    const raw = searchParams.get('applicationId');
    if (raw) {
      setSelectedAppId(Number(raw));
    }
  }, [searchParams]);

  // Load messages when selectedAppId changes
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
        // Mark as read
        messageApi.markRead(selectedAppId).catch(() => {});
        // Decrement unread on the thread locally
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

  // Subscribe to live messages for the active thread
  useEffect(() => {
    if (!selectedAppId) return;

    const unsubscribe = subscribeToThread(selectedAppId, (newMsg: MessageDto) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // Update thread list preview
      setThreads((prev) =>
        prev.map((t) => {
          if (t.applicationId === newMsg.applicationId) {
            return {
              ...t,
              lastMessage: newMsg.content,
              lastSenderSide: newMsg.senderSide,
              lastMessageAt: newMsg.createdAt,
            };
          }
          return t;
        })
      );

      // If counterpart sent it and thread is open, mark as read
      if (newMsg.senderUserId !== user?.id) {
        messageApi.markRead(selectedAppId).catch(() => {});
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedAppId, subscribeToThread, user?.id]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectThread = (appId: number) => {
    setSelectedAppId(appId);
    setSearchParams({ applicationId: String(appId) });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedAppId || !content.trim() || sending) return;

    const text = content.trim();
    setSending(true);
    try {
      const saved = await messageApi.send(selectedAppId, text);
      setContent('');
      setMessages((prev) => (prev.some((m) => m.id === saved.id) ? prev : [...prev, saved]));

      // Update threads list
      setThreads((prev) => {
        const found = prev.some((t) => t.applicationId === selectedAppId);
        if (found) {
          return prev.map((t) =>
            t.applicationId === selectedAppId
              ? {
                  ...t,
                  lastMessage: saved.content,
                  lastSenderSide: saved.senderSide,
                  lastMessageAt: saved.createdAt,
                }
              : t
          );
        }
        loadThreads();
        return prev;
      });

      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || (language === 'vi' ? 'Lỗi gửi tin nhắn' : 'Failed to send message'));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredThreads = useMemo(() => {
    if (!filterQuery.trim()) return threads;
    const q = filterQuery.toLowerCase();
    return threads.filter(
      (t) =>
        (t.jobTitle && t.jobTitle.toLowerCase().includes(q)) ||
        (t.companyName && t.companyName.toLowerCase().includes(q)) ||
        (t.candidateName && t.candidateName.toLowerCase().includes(q))
    );
  }, [threads, filterQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-80px)] min-h-[600px] flex flex-col">
      {/* Header banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {language === 'vi' ? 'Tin nhắn tuyển dụng' : 'Recruitment Messages'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'vi'
              ? 'Trao đổi trực tiếp giữa ứng viên và hội đồng tuyển dụng theo từng vị trí ứng tuyển'
              : 'Direct communication between candidate and hiring team per application'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {connected
              ? language === 'vi'
                ? 'Đã kết nối trực tiếp'
                : 'Live Connected'
              : language === 'vi'
              ? 'Đang kết nối lại...'
              : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex-1 mt-4 grid grid-cols-1 md:grid-cols-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft-sm overflow-hidden">
        {/* Left sidebar: Thread list */}
        <div
          className={`md:col-span-4 lg:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 ${
            selectedAppId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Thread search */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={
                  language === 'vi'
                    ? 'Tìm theo vị trí, ứng viên, công ty...'
                    : 'Search jobs, candidates, companies...'
                }
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {loadingThreads ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {language === 'vi' ? 'Đang tải hội thoại...' : 'Loading conversations...'}
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">
                  {language === 'vi' ? 'Không có cuộc trò chuyện nào' : 'No conversations found'}
                </p>
                <p className="text-[11px] mt-1 text-slate-500">
                  {language === 'vi'
                    ? 'Tin nhắn sẽ xuất hiện khi ứng viên hoặc nhà tuyển dụng bắt đầu liên hệ.'
                    : 'Conversations appear when a candidate or recruiter initiates contact.'}
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.applicationId === selectedAppId;
                const counterpartName = isRecruiter
                  ? thread.candidateName || (language === 'vi' ? 'Ứng viên' : 'Candidate')
                  : thread.companyName || (language === 'vi' ? 'Nhà tuyển dụng' : 'Employer');

                return (
                  <button
                    key={thread.applicationId}
                    onClick={() => handleSelectThread(thread.applicationId)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-emerald-600 dark:border-emerald-500'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      <Avatar
                        name={counterpartName}
                        url={!isRecruiter ? thread.companyLogo : null}
                        size="w-10 h-10"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {counterpartName}
                        </p>
                        {thread.lastMessageAt && (
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {timeAgo(thread.lastMessageAt, language)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                        {thread.jobTitle}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                        {thread.lastMessage || (
                          <span className="italic opacity-60">
                            {language === 'vi' ? 'Bắt đầu cuộc trò chuyện...' : 'Start conversation...'}
                          </span>
                        )}
                      </p>
                    </div>
                    {thread.unreadCount > 0 && (
                      <span className="shrink-0 ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-soft-xs">
                        {thread.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right content: Active conversation */}
        <div
          className={`md:col-span-8 lg:col-span-8 flex flex-col h-full ${
            !selectedAppId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeThread ? (
            <>
              {/* Active Header */}
              <div className="p-3.5 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-900/40 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSelectedAppId(null)}
                    className="md:hidden p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <Avatar
                    name={
                      isRecruiter
                        ? activeThread.candidateName || 'Candidate'
                        : activeThread.companyName || 'Employer'
                    }
                    url={!isRecruiter ? activeThread.companyLogo : null}
                    size="w-9 h-9"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {isRecruiter
                        ? activeThread.candidateName || (language === 'vi' ? 'Ứng viên' : 'Candidate')
                        : activeThread.companyName || (language === 'vi' ? 'Nhà tuyển dụng' : 'Employer')}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                        {activeThread.jobTitle}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                        {activeThread.currentStage}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={isRecruiter ? `/employer/applicants` : `/jobs/${activeThread.jobId}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {isRecruiter
                        ? language === 'vi'
                          ? 'Xem hồ sơ'
                          : 'View Applicant'
                        : language === 'vi'
                        ? 'Chi tiết tin'
                        : 'Job details'}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Message history */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/20 dark:bg-slate-950/20">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">
                    {language === 'vi' ? 'Đang tải tin nhắn...' : 'Loading messages...'}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-6">
                    <Sparkles className="w-8 h-8 text-emerald-500 mb-2 opacity-50" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'vi'
                        ? 'Chưa có tin nhắn trong hội thoại này'
                        : 'No messages in this conversation yet'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                      {language === 'vi'
                        ? 'Gửi lời chào hoặc thông báo nhanh đến ứng viên/nhà tuyển dụng để bắt đầu thảo luận.'
                        : 'Say hello or ask questions to get the conversation started.'}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderUserId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 max-w-[85%] ${
                          isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        <div className="shrink-0 mt-1">
                          <Avatar name={msg.senderName || 'U'} size="w-7 h-7 text-[10px]" />
                        </div>
                        <div>
                          <div
                            className={`flex items-center gap-1.5 mb-1 ${
                              isMe ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {isMe
                                ? language === 'vi'
                                  ? 'Bạn'
                                  : 'You'
                                : msg.senderName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDateTime(msg.createdAt, language)}
                            </span>
                          </div>

                          <div
                            className={`p-3 rounded-2xl text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-soft-xs ${
                              isMe
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
                            }`}
                          >
                            {msg.content}
                          </div>

                          {isMe && msg.readAt && (
                            <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                              <CheckCheck className="w-3 h-3" />
                              <span>{language === 'vi' ? 'Đã xem' : 'Read'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-end gap-2 shrink-0"
              >
                <div className="flex-1 min-w-0">
                  <textarea
                    ref={textareaRef}
                    data-testid="message-input"
                    rows={1}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      language === 'vi'
                        ? 'Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)'
                        : 'Type a message... (Enter to send, Shift+Enter for newline)'
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none max-h-32"
                  />
                </div>
                <button
                  type="submit"
                  data-testid="send-message-btn"
                  disabled={!content.trim() || sending}
                  className="p-2 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {sending
                      ? language === 'vi'
                        ? 'Đang gửi...'
                        : 'Sending...'
                      : language === 'vi'
                      ? 'Gửi'
                      : 'Send'}
                  </span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30 text-emerald-500" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                {language === 'vi'
                  ? 'Chọn một cuộc trò chuyện để bắt đầu'
                  : 'Select a conversation to start chatting'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {language === 'vi'
                  ? 'Bạn có thể nhắn tin trực tiếp với ứng viên hoặc nhà tuyển dụng để trao đổi về lịch phỏng vấn và công việc.'
                  : 'Communicate directly with candidates or recruiters regarding interview schedules and roles.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
