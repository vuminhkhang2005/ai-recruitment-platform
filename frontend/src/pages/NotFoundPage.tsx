import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle';

export const NotFoundPage: React.FC<{ message?: string }> = ({ message }) => {
  usePageTitle('Không tìm thấy trang');
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-black text-slate-200">404</p>
      <h1 className="mt-4 text-xl font-bold text-slate-900">{message ?? 'Không tìm thấy trang bạn yêu cầu.'}</h1>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/" className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
          Về trang chủ
        </Link>
        <Link to="/jobs" className="px-4 py-2 rounded-md border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Tìm việc làm
        </Link>
      </div>
    </div>
  );
};
