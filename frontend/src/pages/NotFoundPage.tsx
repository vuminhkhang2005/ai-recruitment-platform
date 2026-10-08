import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle';
import { useLanguage } from '../i18n/LanguageContext';

export const NotFoundPage: React.FC<{ message?: string }> = ({ message }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  usePageTitle(isVi ? 'Không tìm thấy trang' : 'Page Not Found');
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-black text-slate-200">404</p>
      <h1 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
        {message ?? (isVi ? 'Không tìm thấy trang bạn yêu cầu.' : 'The requested page could not be found.')}
      </h1>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-soft">
          {isVi ? 'Về trang chủ' : 'Back to Home'}
        </Link>
        <Link to="/jobs" className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:text-emerald-600">
          {isVi ? 'Tìm việc làm' : 'Browse Jobs'}
        </Link>
      </div>
    </div>
  );
};
