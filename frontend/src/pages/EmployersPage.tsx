import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../lib/usePageTitle';

const STEPS = [
  { title: 'Tạo tài khoản', text: 'Đăng ký bằng email công việc và chọn công ty của bạn.' },
  { title: 'Đăng tin tuyển dụng', text: 'Nhập mô tả, yêu cầu, kỹ năng, mức lương và hạn nộp hồ sơ.' },
  { title: 'Nhận và xử lý hồ sơ', text: 'Xem CV, thư giới thiệu và chuyển ứng viên qua từng vòng. Ứng viên được thông báo khi trạng thái thay đổi.' },
];

export const EmployersPage: React.FC = () => {
  usePageTitle('Dành cho nhà tuyển dụng');
  const { isRecruiter } = useAuth();
  return (
    <>
      <section className="bg-gradient-to-b from-[#121212] to-[#2a1214] text-white">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h1 className="text-3xl sm:text-4xl font-bold max-w-2xl">Tuyển dụng nhân sự IT trên TalentBridge</h1>
          <p className="mt-3 text-slate-300 max-w-xl">Đăng tin, nhận hồ sơ ứng viên và quản lý quy trình tuyển dụng ở một nơi.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {isRecruiter ? (
              <Link to="/employer" className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 font-semibold text-sm">
                Vào trang quản lý
              </Link>
            ) : (
              <>
                <Link to="/register?role=recruiter" className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 font-semibold text-sm">
                  Tạo tài khoản nhà tuyển dụng
                </Link>
                <Link to="/login?next=/employer" className="px-5 py-2.5 rounded-md border border-white/30 hover:border-white font-semibold text-sm">
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 mt-12 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="bg-white border border-slate-200 rounded-lg p-5">
            <span className="w-8 h-8 rounded-full bg-red-50 text-red-600 font-bold flex items-center justify-center">{i + 1}</span>
            <h2 className="mt-3 font-semibold text-slate-900">{s.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{s.text}</p>
          </div>
        ))}
      </section>
    </>
  );
};
