import React from 'react';
import { Sparkles, Zap, Flame, Gift, ShieldCheck, Users, Clock, Home, Building2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

// 1. 🔥 Hot Job Sticker (Animated warm glow)
export const HotSticker: React.FC<{ label?: string; size?: 'sm' | 'md' }> = ({ 
  label = 'HOT', 
  size = 'sm' 
}) => {
  return (
    <span className={`inline-flex items-center gap-1 font-black rounded-full shadow-soft-xs ${
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
    } bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 text-white tracking-wide uppercase animate-pulse-subtle`}>
      <Flame className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
    </span>
  );
};

// 2. ⚡ Urgent Hiring Sticker (Amber Lightning)
export const UrgentSticker: React.FC<{ label?: string; size?: 'sm' | 'md' }> = ({ 
  label, 
  size = 'sm' 
}) => {
  const { language } = useLanguage();
  const displayLabel = label || (language === 'vi' ? 'Tuyển gấp' : 'Urgent');
  return (
    <span className={`inline-flex items-center gap-1 font-extrabold rounded-full ${
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
    } bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/80 shadow-soft-xs`}>
      <Zap className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-600 dark:text-amber-400 fill-amber-500`} />
      <span>{displayLabel}</span>
    </span>
  );
};

// 3. 🎁 Signing Bonus Sticker
export const BonusSticker: React.FC<{ amount?: string }> = ({ amount }) => {
  const { language } = useLanguage();
  const defaultAmount = language === 'vi' ? 'Thưởng $1,000' : '$1,000 Bonus';
  return (
    <span className="inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-soft-xs">
      <Gift className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
      <span>{amount || defaultAmount}</span>
    </span>
  );
};

// 4. 🏠 Remote / Hybrid Work Sticker
export const WorkModeSticker: React.FC<{ mode: 'Remote' | 'Hybrid' | 'Full-time' }> = ({ mode }) => {
  const isRemote = mode === 'Remote';
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
      isRemote 
        ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }`}>
      {isRemote ? <Home className="w-3 h-3 text-purple-600 dark:text-purple-400" /> : <Building2 className="w-3 h-3 text-slate-500" />}
      <span>{mode}</span>
    </span>
  );
};

// 5. 🎯 AI Match Score Badge (Visual Match Ring)
export const AiMatchBadge: React.FC<{ score: number; compact?: boolean }> = ({ score, compact = false }) => {
  const getColors = () => {
    if (score >= 95) return 'from-emerald-600 to-teal-500 text-white';
    if (score >= 90) return 'from-teal-600 to-cyan-500 text-white';
    return 'from-blue-600 to-indigo-500 text-white';
  };

  return (
    <span className={`inline-flex items-center gap-1 font-black rounded-xl bg-gradient-to-r ${getColors()} shadow-soft-xs ${
      compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
    }`}>
      <Sparkles className="w-3 h-3 animate-pulse" />
      <span>{compact ? `${score}% AI` : `AI Match ${score}%`}</span>
    </span>
  );
};

// 6. 👥 Live Applicant Counter Pill
export const ApplicantCounter: React.FC<{ count: number; text?: string }> = ({ count, text }) => {
  const { language } = useLanguage();
  const defaultText = language === 'vi' ? `${count} người đã ứng tuyển` : `${count} applicants applied`;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      <Users className="w-3 h-3 text-slate-400 dark:text-slate-500" />
      <span>{text || defaultText}</span>
    </span>
  );
};

// 7. 🛡️ Verified Employer Seal
export const VerifiedEmployerSeal: React.FC<{ text?: string }> = ({ text }) => {
  const { language } = useLanguage();
  const displayText = text || (language === 'vi' ? 'Doanh nghiệp xác thực' : 'Verified Employer');
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/60">
      <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
      <span>{displayText}</span>
    </span>
  );
};
