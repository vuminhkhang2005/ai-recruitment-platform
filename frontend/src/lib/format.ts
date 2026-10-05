import type { Stage } from './types';

export const CITIES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'];

export const EXP_LEVELS: Record<string, string> = {
  INTERN: 'Thực tập sinh',
  FRESHER: 'Fresher',
  JUNIOR: 'Junior',
  MIDDLE: 'Middle',
  SENIOR: 'Senior',
  LEAD: 'Lead / Manager',
};

export const JOB_TYPES: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  HYBRID: 'Hybrid',
  REMOTE: 'Làm từ xa',
  INTERNSHIP: 'Thực tập',
  CONTRACT: 'Hợp đồng',
};

export const JOB_STATUS: Record<string, string> = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đang tuyển',
  PAUSED: 'Tạm dừng',
  CLOSED: 'Đã đóng',
};

export const STAGES: Stage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'];

export const STAGE_LABELS: Record<string, string> = {
  APPLIED: 'Đã nộp',
  SCREENING: 'Đang xem xét',
  INTERVIEW: 'Phỏng vấn',
  OFFERED: 'Đã gửi offer',
  HIRED: 'Đã tuyển',
  REJECTED: 'Chưa phù hợp',
  WITHDRAWN: 'Đã rút',
};

export const STAGE_STYLES: Record<string, string> = {
  APPLIED: 'bg-slate-100 text-slate-700',
  SCREENING: 'bg-amber-50 text-amber-700',
  INTERVIEW: 'bg-blue-50 text-blue-700',
  OFFERED: 'bg-violet-50 text-violet-700',
  HIRED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
};

export const WITHDRAWABLE_STAGES: Stage[] = ['APPLIED', 'SCREENING'];

export const label = (map: Record<string, string>, key?: string | null) => (key ? map[key] ?? key : '');

export function formatDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function timeAgo(value?: string | null) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Vừa xong';
  if (min < 60) return `${min} phút trước`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return formatDate(value);
}

/** Days left until a deadline; negative if already passed, null if no deadline. */
export function daysLeft(deadline?: string | null) {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export function formatFileSize(bytes?: number | null) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Splits free text from the backend into bullet lines for display. */
export function toLines(text?: string | null) {
  if (!text) return [];
  return text
    .split(/\r?\n|•/)
    .map((l) => l.replace(/^[-*\s]+/, '').trim())
    .filter(Boolean);
}
