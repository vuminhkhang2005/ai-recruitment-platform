import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Language, type Translations } from './translations';
import { Sparkles } from 'lucide-react';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  toggleLanguage: () => void;
  isLanguageLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return saved === 'en' ? 'en' : 'vi';
  });

  const [isLanguageLoading, setIsLanguageLoading] = useState(false);
  const [targetLang, setTargetLang] = useState<Language | null>(null);

  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    
    // 1. Activate loading state & set target
    setIsLanguageLoading(true);
    setTargetLang(lang);

    // 2. Immediately scroll to top of page as requested: "(nhảy về đầu trang)"
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 3. Save language preference to localStorage and document root
    localStorage.setItem('app_lang', lang);
    document.documentElement.lang = lang;

    // 4. Brief smooth loading transition before page reload: "(sẽ load và tải lại trang chứ không nhảy liền)"
    setTimeout(() => {
      window.location.reload();
    }, 450);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'en'
      ? 'TalentBridge — AI-Powered Career & Recruitment Platform'
      : 'AI-TalentBridge — Nền tảng Tuyển dụng & Định hướng Nghề nghiệp AI';
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    toggleLanguage,
    isLanguageLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}

      {/* Elegant Full-screen Language Switcher Loader */}
      {isLanguageLoading && (
        <div className="fixed inset-0 z-[9999] bg-white/85 dark:bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-soft-2xl flex flex-col items-center gap-4 text-center max-w-xs mx-4 transform animate-scale-up">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-soft animate-pulse">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="absolute -inset-1.5 rounded-3xl border-2 border-emerald-500/40 border-t-emerald-600 animate-spin pointer-events-none" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {targetLang === 'vi' ? 'Đang chuyển sang Tiếng Việt...' : 'Switching to English...'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{targetLang === 'vi' ? 'Đang tải lại trang...' : 'Reloading page...'}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
