import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

/** Official brand marks shipped in /public/logos, used when the API has no logo URL for a company. */
const BRAND_LOGOS: { match: string[]; src: string; bg?: string; pad?: string }[] = [
  { match: ['vng'], src: '/logos/vng.svg' },
  { match: ['fpt'], src: '/logos/fpt.svg' },
  { match: ['vinai', 'vingroup', 'vinfast'], src: '/logos/vinai.svg' },
  { match: ['viettel'], src: '/logos/viettel.svg' },
  { match: ['momo'], src: '/logos/momo.png', bg: 'bg-[#A50064]', pad: 'p-0' },
  { match: ['shopee'], src: '/logos/shopee.svg' },
  { match: ['techcombank', 'tcb'], src: '/logos/techcombank-icon.png' },
  { match: ['grab'], src: '/logos/grab.svg' },
  { match: ['onemount', 'one mount', 'vinid'], src: '/logos/onemount.svg', bg: 'bg-[#0A0F1D]', pad: 'p-0' },
];

/** Company logo in the original TalentBridge style, with a dark initials tile as fallback. */
export const CompanyAvatar: React.FC<{ name: string; logoUrl?: string | null; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({
  name,
  logoUrl,
  size = 'md',
}) => {
  const [broken, setBroken] = useState(false);
  const box = { sm: 'w-10 h-10 text-xs', md: 'w-14 h-14 text-sm', lg: 'w-20 h-20 text-lg', xl: 'w-28 h-28 text-2xl' }[size];
  const lower = name.toLowerCase();
  const brand = BRAND_LOGOS.find((b) => b.match.some((m) => lower.includes(m)));
  const src = logoUrl && !broken ? logoUrl : brand?.src;
  if (src && !(broken && !brand)) {
    const bg = brand?.bg ?? 'bg-[#fff]';
    const pad = brand?.pad ?? 'p-1.5';
    return (
      <div
        className={`${box} ${bg} ${pad} shrink-0 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-soft-xs flex items-center justify-center overflow-hidden select-none`}
      >
        <img
          src={src}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain pointer-events-none"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }
  const initials = name
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`${box} shrink-0 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-black border border-slate-700 shadow-soft-xs flex items-center justify-center`}
    >
      {initials}
    </div>
  );
};

export const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Loader2 className={`w-5 h-5 animate-spin text-emerald-500 ${className}`} />
);

export const PageLoader: React.FC = () => (
  <div className="py-24 flex justify-center">
    <Spinner className="w-7 h-7" />
  </div>
);

export const EmptyState: React.FC<{ title: string; description?: string; action?: React.ReactNode }> = ({
  title,
  description,
  action,
}) => (
  <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-900/60">
    <p className="font-black text-slate-800 dark:text-slate-100">{title}</p>
    {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const ErrorBox: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div role="alert" className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
    <span>{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="font-bold underline shrink-0">
        Thử lại
      </button>
    )}
  </div>
);

export const Pagination: React.FC<{ page: number; totalPages: number; onChange: (p: number) => void }> = ({
  page,
  totalPages,
  onChange,
}) => {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  for (let i = start; i < Math.min(totalPages, start + 5); i++) pages.push(i);
  const btn = 'w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center border transition-colors';
  const idle =
    'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600';
  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="Phân trang">
      <button className={`${btn} ${idle} disabled:opacity-40`} disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Trang trước">
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`${btn} ${p === page ? 'bg-emerald-600 border-emerald-600 text-white shadow-soft-xs' : idle}`}
          aria-current={p === page ? 'page' : undefined}
        >
          {p + 1}
        </button>
      ))}
      <button
        className={`${btn} ${idle} disabled:opacity-40`}
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export const Tag: React.FC<{ children: React.ReactNode; to?: string }> = ({ children, to }) => {
  const cls =
    'inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-transparent';
  return to ? (
    <Link to={to} className={`${cls} hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300`}>
      {children}
    </Link>
  ) : (
    <span className={cls}>{children}</span>
  );
};

export const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({
  title,
  onClose,
  children,
  wide,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
    onMouseDown={onClose}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft-xl my-8`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="font-black text-slate-900 dark:text-white">{title}</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white text-xl leading-none"
          aria-label="Đóng"
        >
          ×
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export const cardCls =
  'bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-soft-xs';
export const inputCls =
  'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-soft-xs hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-60';
