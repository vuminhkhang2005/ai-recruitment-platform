import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { notificationApi } from '../../lib/api';
import type { NotificationItem } from '../../lib/types';
import { timeAgo } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

const POLL_MS = 60_000;

export const NotificationBell: React.FC = () => {
  const { user, isRecruiter } = useAuth();
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = () =>
      notificationApi
        .unreadCount()
        .then((r) => active && setCount(r.count))
        .catch(() => undefined);
    void load();
    const t = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        setItems(await notificationApi.list(15));
      } catch {
        setItems([]);
      }
    }
  };

  const openItem = async (n: NotificationItem) => {
    if (!n.isRead) {
      await notificationApi.markRead(n.id).catch(() => undefined);
      setCount((c) => Math.max(0, c - 1));
      setItems((list) => list?.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)) ?? null);
    }
    setOpen(false);
    if (n.referenceType === 'APPLICATION') navigate(isRecruiter ? '/employer/applicants' : '/applications');
  };

  const markAll = async () => {
    await notificationApi.markAllRead().catch(() => undefined);
    setCount(0);
    setItems((list) => list?.map((x) => ({ ...x, isRead: true })) ?? null);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label={isVi ? `Thông báo${count ? ` (${count} chưa đọc)` : ''}` : `Notifications${count ? ` (${count} unread)` : ''}`}
        data-testid="notification-bell"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-soft-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider">{isVi ? 'Thông báo' : 'Notifications'}</span>
            {count > 0 && (
              <button onClick={markAll} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                {isVi ? 'Đánh dấu đã đọc tất cả' : 'Mark all as read'}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items === null ? (
              <p className="p-4 text-sm text-slate-500">{isVi ? 'Đang tải…' : 'Loading...'}</p>
            ) : items.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 text-center">{isVi ? 'Chưa có thông báo nào.' : 'No notifications yet.'}</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openItem(n)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                    n.isRead ? '' : 'bg-emerald-50/60 dark:bg-emerald-950/30'
                  }`}
                >
                  <div className="flex gap-2.5">
                    {!n.isRead && <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug">{n.title}</p>
                      {n.content && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{n.content}</p>}
                      <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.createdAt, language)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <Link
            to={isRecruiter ? '/employer/applicants' : '/applications'}
            onClick={() => setOpen(false)}
            className="block text-center text-sm font-bold text-emerald-600 dark:text-emerald-400 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          >
            {isRecruiter ? (isVi ? 'Xem tất cả ứng viên' : 'View all applicants') : (isVi ? 'Xem việc đã ứng tuyển' : 'View my applications')}
          </Link>
        </div>
      )}
    </div>
  );
};
