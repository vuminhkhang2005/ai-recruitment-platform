import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Mail, ArrowRight, Globe, Lock, Heart } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface FooterProps {
  onOpenPostJobModal?: () => void;
  onOpenCareerAi?: (tab: 'scanner' | 'roadmap') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPostJobModal, onOpenCareerAi }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-16 pb-12 border-t border-slate-200 dark:border-slate-850 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-slate-800">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-soft">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    TalentBridge
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-[10px] font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                  AI-Powered Recruitment
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              {t.footer.mission}
            </p>
            <div className="flex items-center gap-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.footer.complianceNotice}</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Hotline: <strong className="text-slate-700 dark:text-slate-300">{t.footer.hotline}</strong>
            </p>
          </div>

          {/* Col 3: Dành cho Ứng viên */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t.footer.colCandidateTitle}</h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li><a href="#jobs" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{language === 'vi' ? 'Tìm việc làm công nghệ' : 'Browse Tech Jobs'}</a></li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onOpenCareerAi?.('scanner')} 
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  {language === 'vi' ? 'Phân tích CV chuẩn ATS' : 'ATS Resume Scanner'}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onOpenCareerAi?.('roadmap')} 
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  {language === 'vi' ? 'Bản đồ lộ trình kỹ năng' : 'Skill Gap Roadmap'}
                </button>
              </li>
              <li><a href="#jobs" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{language === 'vi' ? 'Tính điểm AI Matching' : 'Calculate Match Score'}</a></li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onOpenCareerAi?.('scanner')} 
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  {language === 'vi' ? 'Mẫu CV chuyên nghiệp' : 'Resume Templates'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Dành cho Doanh nghiệp */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t.footer.colEmployerTitle}</h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPostJobModal?.()}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  {language === 'vi' ? 'Đăng tin tuyển dụng AI' : 'Post an AI Job'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPostJobModal?.()}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  {language === 'vi' ? 'Hệ thống ATS Kanban' : 'ATS Kanban Pipeline'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPostJobModal?.()}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  {language === 'vi' ? 'Tìm kiếm trong Talent Pool' : 'Talent Pool Search'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPostJobModal?.()}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  {language === 'vi' ? 'AI Sàng lọc & Xếp hạng' : 'AI Resume Screening'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPostJobModal?.()}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  {language === 'vi' ? 'Báo cáo phễu tuyển dụng' : 'Hiring Analytics'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t.footer.colNewsletterTitle}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.footer.newsletterDesc}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={t.footer.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-soft-2xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 ai-gradient-btn rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-soft transition-all"
              >
                <div className="shimmer-sweep" />
                <span>{t.footer.btnSubscribe}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-fade-in flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.footer.subscribedToast}</span>
              </p>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-1">
            <span>{t.footer.copyright}</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">{t.footer.terms}</a>
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">{t.footer.privacy}</a>
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Tiếng Việt (VI)' : 'English (EN)'}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
