import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Video, MapPin, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { interviewApi } from '../../lib/api';
import type { InterviewDto } from '../../lib/types';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatDateTime } from '../../lib/format';

export const InterviewsAgendaPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewApi
      .upcoming()
      .then(setInterviews)
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Calendar className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          {isVi ? 'Lịch phỏng vấn sắp tới' : 'Upcoming Interviews'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          {isVi
            ? 'Theo dõi danh sách các buổi phỏng vấn được phân công cho bạn hoặc trong công ty'
            : 'Track upcoming interview rounds assigned to you or across your company'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
            {isVi ? 'Chưa có lịch phỏng vấn sắp tới' : 'No upcoming interviews'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isVi
              ? 'Khi ứng viên bước vào vòng phỏng vấn và được lên lịch, thông tin sẽ hiển thị tại đây.'
              : 'Scheduled rounds will appear here when candidates advance to interview.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/50 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {isVi ? `Vòng ${item.roundNumber}` : `Round ${item.roundNumber}`}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.format === 'ONLINE'
                      ? isVi ? 'Phỏng vấn Trực tuyến' : 'Online Interview'
                      : isVi ? 'Phỏng vấn Trực tiếp' : 'In-person Interview'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-5 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>{formatDateTime(item.scheduledStart, language)}</span>
                  </div>

                  {item.location && (
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      {item.format === 'ONLINE' ? <Video className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-rose-500" />}
                      <span className="truncate max-w-xs">{item.location}</span>
                    </div>
                  )}

                  {item.panelists && item.panelists.length > 0 && (
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{item.panelists.map((p) => p.fullName).join(', ')}</span>
                    </div>
                  )}
                </div>

                {item.notesToCandidate && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    "{item.notesToCandidate}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <Link
                  to={`/employer/applicants?appId=${item.applicationId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                >
                  <span>{isVi ? 'Xem hồ sơ & Chấm điểm' : 'View Profile & Scorecard'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
