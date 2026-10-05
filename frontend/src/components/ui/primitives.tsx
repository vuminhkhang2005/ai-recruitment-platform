import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const PALETTE = ['bg-sky-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-600', 'bg-rose-600', 'bg-teal-600', 'bg-indigo-600'];

/** Company logo with a deterministic initials fallback when no logo (or a broken one) is available. */
export const CompanyAvatar: React.FC<{ name: string; logoUrl?: string | null; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({
  name,
  logoUrl,
  size = 'md',
}) => {
  const [broken, setBroken] = useState(false);
  const box = { sm: 'w-10 h-10 text-xs', md: 'w-14 h-14 text-sm', lg: 'w-20 h-20 text-lg', xl: 'w-28 h-28 text-2xl' }[size];
  if (logoUrl && !broken) {
    return (
      <div className={`${box} shrink-0 rounded-lg border border-slate-200 bg-white p-1.5 flex items-center justify-center overflow-hidden`}>
        <img src={logoUrl} alt={name} className="max-w-full max-h-full object-contain" onError={() => setBroken(true)} />
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
  const color = PALETTE[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
  return (
    <div className={`${box} ${color} shrink-0 rounded-lg text-white font-bold flex items-center justify-center`}>{initials}</div>
  );
};

export const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Loader2 className={`w-5 h-5 animate-spin text-slate-400 ${className}`} />
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
  <div className="text-center py-16 px-6 border border-dashed border-slate-300 rounded-xl bg-white">
    <p className="font-semibold text-slate-800">{title}</p>
    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorBox: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-4">
    <span>{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="font-semibold underline shrink-0">
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
  const btn = 'w-9 h-9 rounded-md text-sm font-medium flex items-center justify-center border';
  return (
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Phân trang">
      <button
        className={`${btn} border-slate-200 bg-white disabled:opacity-40`}
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`${btn} ${p === page ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'}`}
          aria-current={p === page ? 'page' : undefined}
        >
          {p + 1}
        </button>
      ))}
      <button
        className={`${btn} border-slate-200 bg-white disabled:opacity-40`}
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
  const cls = 'inline-flex items-center px-2.5 py-1 rounded-full border border-slate-200 bg-white text-xs text-slate-700';
  return to ? (
    <Link to={to} className={`${cls} hover:border-slate-400`}>
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
  <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto" onMouseDown={onClose}>
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} bg-white rounded-xl shadow-xl my-8`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none" aria-label="Đóng">
          ×
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export const inputCls =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500';
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed';
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60';
