import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle';

export const NotFoundPage: React.FC<{ message?: string }> = ({ message }) => {
  usePageTitle('Không tìm thấy trang');
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-black text-slate-200">404</p>
      <h1 className="mt-4 text-xl font-black text-slate-900 dark:text-white">{message ?? 'Không tìm thấy trang bạn yêu cầu.'}</h1>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-soft">
          Về trang chủ
        </Link>
        <Link to="/jobs" className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:text-emerald-600">
          Tìm việc làm
        </Link>
      </div>
    </div>
  );
};
