import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useSavedJobs } from '../lib/savedJobs';
import { useMyApplications } from '../context/MyApplicationsContext';
import { daysLeft, formatDate, formatSalary } from '../lib/format';
import { CompanyAvatar, EmptyState } from '../components/ui/primitives';
import { usePageTitle } from '../lib/usePageTitle';
import { useLanguage } from '../i18n/LanguageContext';

const CITY_EN: Record<string, string> = {
  'TP. Hồ Chí Minh': 'Ho Chi Minh City',
  'Hà Nội': 'Hanoi',
  'Đà Nẵng': 'Da Nang',
};

export const SavedJobsPage: React.FC = () => {
  const { language } = useLanguage();
  const vi = language !== 'en';
  usePageTitle(vi ? 'Việc đã lưu' : 'Saved jobs');
  const { saved, remove } = useSavedJobs();
  const { appliedJobIds } = useMyApplications();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{vi ? 'Việc đã lưu' : 'Saved jobs'}</h1>
      <p className="text-sm text-slate-500 mt-1">{saved.length}{vi ? ' việc làm' : saved.length === 1 ? ' job' : ' jobs'}</p>
      <div className="mt-5">
        {saved.length === 0 ? (
          <EmptyState
            title={vi ? 'Bạn chưa lưu việc làm nào' : 'You haven’t saved any jobs yet'}
            description={vi ? 'Bấm biểu tượng lưu trên tin tuyển dụng để xem lại sau.' : 'Tap the save icon on a job posting to review it later.'}
            action={
              <Link to="/jobs" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                {vi ? 'Tìm việc làm' : 'Browse jobs'}
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {saved.map((s) => {
              const left = daysLeft(s.deadline);
              const expired = left !== null && left < 0;
              return (
                <li key={s.id} className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 flex gap-4 shadow-soft-xs hover:border-emerald-300 transition-colors" data-testid="saved-job">
                  <CompanyAvatar name={s.companyName} logoUrl={s.companyLogo} />
                  <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${s.id}`} className="font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400">
                      {s.title}
                    </Link>
                    <p className="text-sm text-slate-600">{s.companyName}</p>
                    <p className="mt-2 inline-block px-2.5 py-0.5 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-xs border border-emerald-200/90 dark:border-emerald-800/60">{vi ? s.salaryFormatted : formatSalary(s.salaryFormatted, 'en')}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
                      {s.locationCity && <span>{vi ? s.locationCity : CITY_EN[s.locationCity] ?? s.locationCity}</span>}
                      <span>{vi ? 'Đã lưu ' : 'Saved '}{formatDate(s.savedAt, language)}</span>
                      {expired ? (
                        <span className="text-slate-400">{vi ? 'Đã hết hạn nộp' : 'Applications closed'}</span>
                      ) : (
                        left !== null && <span>{vi ? <>Còn {left} ngày</> : <>{left} {left === 1 ? 'day' : 'days'} left</>}</span>
                      )}
                      {appliedJobIds.has(s.id) && <span className="text-sky-700 dark:text-sky-300 font-bold">{vi ? 'Đã ứng tuyển' : 'Applied'}</span>}
                    </div>
                  </div>
                  <button onClick={() => remove(s.id)} aria-label={vi ? `Bỏ lưu ${s.title}` : `Unsave ${s.title}`} className="self-start p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
