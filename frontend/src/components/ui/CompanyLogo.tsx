import React from 'react';

export type CompanyId = 
  | 'vng' 
  | 'fpt' 
  | 'vinai' 
  | 'viettel' 
  | 'momo' 
  | 'shopee' 
  | 'techcombank' 
  | 'grab' 
  | 'onemount';

interface CompanyLogoProps {
  company: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ 
  company, 
  className = '', 
  size = 'md' 
}) => {
  const normalized = company.toLowerCase();

  // Enhanced, prominent sizing
  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }[size];

  // Helper for official brand logo image
  const renderLogoImg = (src: string, alt: string, bgClass = 'bg-white dark:bg-slate-800', padClass = 'p-1.5') => (
    <div className={`${sizeClasses} ${className} ${bgClass} rounded-xl ${padClass} border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-center shadow-soft-xs shrink-0 select-none overflow-hidden`}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-contain pointer-events-none" 
        loading="lazy"
      />
    </div>
  );

  // 1. VNG Corporation (Official VNG vector wordmark)
  if (normalized.includes('vng')) {
    return renderLogoImg('/logos/vng.svg', 'VNG Corporation', 'bg-white dark:bg-slate-800', 'p-1');
  }

  // 2. FPT Software (Official 3-color ellipse FPT logo)
  if (normalized.includes('fpt')) {
    return renderLogoImg('/logos/fpt.svg', 'FPT Software', 'bg-white dark:bg-slate-800', 'p-1');
  }

  // 3. VinAI / Vingroup (Official VinAI vector emblem)
  if (normalized.includes('vinai') || normalized.includes('vingroup') || normalized.includes('vinfast')) {
    return renderLogoImg('/logos/vinai.svg', 'VinAI Innovation Lab', 'bg-white dark:bg-slate-800', 'p-1');
  }

  // 4. Viettel (Official Viettel 2021 logo)
  if (normalized.includes('viettel')) {
    return renderLogoImg('/logos/viettel.svg', 'Viettel Group', 'bg-white dark:bg-slate-800', 'p-1');
  }

  // 5. MoMo (100% Authentic official MoMo app icon)
  if (normalized.includes('momo')) {
    return renderLogoImg('/logos/momo.png', 'MoMo Fintech', 'bg-[#A50064]', 'p-0');
  }

  // 6. Shopee (Official Shopee orange bag vector logo)
  if (normalized.includes('shopee')) {
    return renderLogoImg('/logos/shopee.svg', 'Shopee', 'bg-white dark:bg-slate-800', 'p-1');
  }

  // 7. Techcombank (Official Techcombank red double-diamond emblem)
  if (normalized.includes('techcombank') || normalized.includes('tcb')) {
    return renderLogoImg('/logos/techcombank-icon.png', 'Techcombank', 'bg-white dark:bg-slate-800', 'p-1');
  }

  // 8. Grab Vietnam (Official Grab green ribbon vector logo)
  if (normalized.includes('grab')) {
    return renderLogoImg('/logos/grab.svg', 'Grab', 'bg-white dark:bg-slate-800', 'p-1');
  }

  // 9. One Mount Group (100% Official One Mount loop emblem directly from onemount.com)
  if (normalized.includes('onemount') || normalized.includes('one mount') || normalized.includes('vinid')) {
    return renderLogoImg('/logos/onemount.svg', 'One Mount Group', 'bg-[#0A0F1D]', 'p-0');
  }

  // Default fallback
  const initials = company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`${sizeClasses} ${className} rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-black text-sm flex items-center justify-center border border-slate-700 shadow-soft-xs shrink-0`}>
      {initials}
    </div>
  );
};
