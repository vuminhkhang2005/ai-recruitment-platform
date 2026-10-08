import type { Stage } from './types';

export const CITIES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'];

export const EXP_LEVELS_VI: Record<string, string> = {
  INTERN: 'Thực tập sinh',
  FRESHER: 'Fresher',
  JUNIOR: 'Junior',
  MIDDLE: 'Middle',
  SENIOR: 'Senior',
  LEAD: 'Lead / Manager',
};

export const EXP_LEVELS_EN: Record<string, string> = {
  INTERN: 'Intern',
  FRESHER: 'Fresher',
  JUNIOR: 'Junior',
  MIDDLE: 'Middle',
  SENIOR: 'Senior',
  LEAD: 'Lead / Manager',
};

export const EXP_LEVELS = EXP_LEVELS_VI;

export const JOB_TYPES_VI: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  HYBRID: 'Hybrid',
  REMOTE: 'Làm từ xa',
  INTERNSHIP: 'Thực tập',
  CONTRACT: 'Hợp đồng',
};

export const JOB_TYPES_EN: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
};

export const JOB_TYPES = JOB_TYPES_VI;

export const JOB_STATUS_VI: Record<string, string> = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đang tuyển',
  PAUSED: 'Tạm dừng',
  CLOSED: 'Đã đóng',
};

export const JOB_STATUS_EN: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Hiring',
  PAUSED: 'Paused',
  CLOSED: 'Closed',
};

export const JOB_STATUS = JOB_STATUS_VI;

export const STAGES: Stage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'];

export const STAGE_LABELS_VI: Record<string, string> = {
  APPLIED: 'Đã nộp',
  SCREENING: 'Đang xem xét',
  INTERVIEW: 'Phỏng vấn',
  OFFERED: 'Đã gửi offer',
  HIRED: 'Đã tuyển',
  REJECTED: 'Chưa phù hợp',
  WITHDRAWN: 'Đã rút',
};

export const STAGE_LABELS_EN: Record<string, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFERED: 'Offer Sent',
  HIRED: 'Hired',
  REJECTED: 'Not Suitable',
  WITHDRAWN: 'Withdrawn',
};

export const STAGE_LABELS = STAGE_LABELS_VI;

export const STAGE_STYLES: Record<string, string> = {
  APPLIED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  SCREENING: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  INTERVIEW: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  OFFERED: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  HIRED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  REJECTED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
};

export const WITHDRAWABLE_STAGES: Stage[] = ['APPLIED', 'SCREENING'];

export const getExpLevels = (lang: 'vi' | 'en' = 'vi') => (lang === 'en' ? EXP_LEVELS_EN : EXP_LEVELS_VI);
export const getJobTypes = (lang: 'vi' | 'en' = 'vi') => (lang === 'en' ? JOB_TYPES_EN : JOB_TYPES_VI);
export const getStageLabels = (lang: 'vi' | 'en' = 'vi') => (lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_VI);

export const label = (map: Record<string, string>, key?: string | null) => (key ? map[key] ?? key : '');

export function formatDate(value?: string | null, lang: 'vi' | 'en' = 'vi') {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(value?: string | null, lang: 'vi' | 'en' = 'vi') {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function timeAgo(value?: string | null, lang: 'vi' | 'en' = 'vi') {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.floor(diff / 60000);
  if (lang === 'en') {
    if (min < 1) return 'Just now';
    if (min < 60) return `${min}m ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return formatDate(value, 'en');
  }
  if (min < 1) return 'Vừa xong';
  if (min < 60) return `${min} phút trước`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return formatDate(value, 'vi');
}

export function formatSalary(value?: string | null, lang: 'vi' | 'en' = 'vi') {
  if (!value) return '';
  if (lang === 'en') {
    return value
      .replace(/triệu/gi, 'M VND')
      .replace(/Thoả thuận|Thỏa thuận/gi, 'Negotiable')
      .replace(/Cạnh tranh/gi, 'Competitive');
  }
  return value;
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
