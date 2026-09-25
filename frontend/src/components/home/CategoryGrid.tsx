import React from 'react';
import { 
  Code2, 
  TrendingUp, 
  Megaphone, 
  Palette, 
  Users, 
  Briefcase,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MOCK_CATEGORIES, type JobCategory } from '../../data/mockData';

interface CategoryGridProps {
  onSelectCategory: (categoryId: string) => void;
  selectedCategory?: string;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ 
  onSelectCategory,
  selectedCategory 
}) => {
  const { t, language } = useLanguage();

  const getCategoryTheme = (iconName: JobCategory['iconName']) => {
    switch (iconName) {
      case 'code':
        return {
          gradient: 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-emerald-500/25',
          growth: language === 'vi' ? '+28% tuyển dụng' : '+28% growth',
          salary: '$1,500 - $3,500',
          accentBorder: 'group-hover:border-emerald-400 dark:group-hover:border-emerald-500'
        };
      case 'finance':
        return {
          gradient: 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-blue-500/25',
          growth: language === 'vi' ? '+18% tuyển dụng' : '+18% growth',
          salary: '$1,200 - $2,800',
          accentBorder: 'group-hover:border-blue-400 dark:group-hover:border-blue-500'
        };
      case 'marketing':
        return {
          gradient: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/25',
          growth: language === 'vi' ? '+22% tuyển dụng' : '+22% growth',
          salary: '$900 - $2,200',
          accentBorder: 'group-hover:border-amber-400 dark:group-hover:border-amber-500'
        };
      case 'design':
        return {
          gradient: 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-purple-500/25',
          growth: language === 'vi' ? '+15% tuyển dụng' : '+15% growth',
          salary: '$1,000 - $2,500',
          accentBorder: 'group-hover:border-purple-400 dark:group-hover:border-purple-500'
        };
      case 'hr':
        return {
          gradient: 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-rose-500/25',
          growth: language === 'vi' ? '+12% tuyển dụng' : '+12% growth',
          salary: '$800 - $1,800',
          accentBorder: 'group-hover:border-rose-400 dark:group-hover:border-rose-500'
        };
      default:
        return {
          gradient: 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-emerald-500/25',
          growth: language === 'vi' ? '+10% tuyển dụng' : '+10% growth',
          salary: '$1,000 - $2,000',
          accentBorder: 'group-hover:border-emerald-400 dark:group-hover:border-emerald-500'
        };
    }
  };

  const getCategoryIcon = (iconName: JobCategory['iconName']) => {
    switch (iconName) {
      case 'code':
        return <Code2 className="w-6 h-6 sm:w-7 sm:h-7" />;
      case 'finance':
        return <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />;
      case 'marketing':
        return <Megaphone className="w-6 h-6 sm:w-7 sm:h-7" />;
      case 'design':
        return <Palette className="w-6 h-6 sm:w-7 sm:h-7" />;
      case 'hr':
        return <Users className="w-6 h-6 sm:w-7 sm:h-7" />;
      default:
        return <Briefcase className="w-6 h-6 sm:w-7 sm:h-7" />;
    }
  };

  return (
    <section id="categories" className="relative py-8 sm:py-10 md:py-12 bg-slate-50/50 dark:bg-slate-950/70 border-y border-slate-100 dark:border-slate-800/80 scroll-mt-20 transition-colors duration-300 overflow-hidden">
      
      {/* Ambient background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-emerald-400/5 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 sm:mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'vi' ? 'THỊ TRƯỜNG LAO ĐỘNG NĂNG ĐỘNG' : 'DYNAMIC TALENT MARKET'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.categories.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
              {t.categories.subtitle}
            </p>
          </div>
          <a
            href="#jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group"
          >
            <span>{language === 'vi' ? 'Xem tất cả ngành nghề' : 'View all categories'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-5">
          {MOCK_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const theme = getCategoryTheme(cat.iconName);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.id);
                }}
                className={`group relative p-5 rounded-2xl sm:rounded-3xl border text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-between ${
                  isSelected
                    ? 'border-emerald-500 dark:border-emerald-400 bg-white dark:bg-slate-900 shadow-soft-xl ring-2 ring-emerald-400/40 -translate-y-1'
                    : `border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/80 ${theme.accentBorder} hover:shadow-soft-xl hover:-translate-y-1.5`
                }`}
              >
                {/* Hot Tag */}
                {cat.trending && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 text-[10px] font-black rounded-full flex items-center gap-0.5 border border-rose-200/60 dark:border-rose-800/60 shadow-soft-xs">
                    <Sparkles className="w-2.5 h-2.5 text-rose-500" />
                    Hot
                  </span>
                )}

                {/* Vibrant Gradient Icon Hub */}
                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3.5 transition-transform duration-300 group-hover:scale-110 shadow-soft-sm ${theme.gradient}`}>
                  {getCategoryIcon(cat.iconName)}
                </div>

                {/* Name */}
                <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight mb-1">
                  {language === 'vi' ? cat.nameVi : cat.nameEn}
                </h3>

                {/* Count & Growth & Salary */}
                <div className="space-y-1 w-full mt-1">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {cat.count.toLocaleString()} {t.categories.jobCountSuffix}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                    <span>{theme.growth}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{theme.salary}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};

