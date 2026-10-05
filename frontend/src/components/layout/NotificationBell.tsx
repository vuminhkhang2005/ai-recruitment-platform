import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { notificationApi } from '../../lib/api';
import type { NotificationItem } from '../../lib/types';
import { timeAgo } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';

const POLL_MS = 60_000;

export const NotificationBell: React.FC = () => {
  const { user, isRecruiter } = useAuth();
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
        className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
        aria-label={`Thông báo${count ? ` (${count} chưa đọc)` : ''}`}
        data-testid="notification-bell"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-semibold">Thông báo</span>
            {count > 0 && (
              <button onClick={markAll} className="text-xs font-medium text-red-600 hover:underline">
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items === null ? (
              <p className="p-4 text-sm text-slate-500">Đang tải…</p>
            ) : items.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 text-center">Chưa có thông báo nào.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openItem(n)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 ${n.isRead ? '' : 'bg-red-50/40'}`}
                >
                  <div className="flex gap-2">
                    {!n.isRead && <span className="mt-1.5 w-2 h-2 rounded-full bg-red-600 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug">{n.title}</p>
                      {n.content && <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.content}</p>}
                      <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <Link
            to={isRecruiter ? '/employer/applicants' : '/applications'}
            onClick={() => setOpen(false)}
            className="block text-center text-sm font-medium text-slate-700 py-2.5 hover:bg-slate-50"
          >
            {isRecruiter ? 'Xem tất cả ứng viên' : 'Xem việc đã ứng tuyển'}
          </Link>
        </div>
      )}
    </div>
  );
};
