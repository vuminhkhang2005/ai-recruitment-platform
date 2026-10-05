import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useSavedJobs } from '../lib/savedJobs';
import { useMyApplications } from '../context/MyApplicationsContext';
import { daysLeft, formatDate } from '../lib/format';
import { CompanyAvatar, EmptyState } from '../components/ui/primitives';
import { usePageTitle } from '../lib/usePageTitle';

export const SavedJobsPage: React.FC = () => {
  usePageTitle('Việc đã lưu');
  const { saved, remove } = useSavedJobs();
  const { appliedJobIds } = useMyApplications();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Việc đã lưu</h1>
      <p className="text-sm text-slate-500 mt-1">{saved.length} việc làm</p>
      <div className="mt-5">
        {saved.length === 0 ? (
          <EmptyState
            title="Bạn chưa lưu việc làm nào"
            description="Bấm biểu tượng lưu trên tin tuyển dụng để xem lại sau."
            action={
              <Link to="/jobs" className="text-sm font-semibold text-red-600 hover:underline">
                Tìm việc làm
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {saved.map((s) => {
              const left = daysLeft(s.deadline);
              const expired = left !== null && left < 0;
              return (
                <li key={s.id} className="bg-white border border-slate-200 rounded-lg p-4 flex gap-4" data-testid="saved-job">
                  <CompanyAvatar name={s.companyName} logoUrl={s.companyLogo} />
                  <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${s.id}`} className="font-semibold text-slate-900 hover:text-red-600">
                      {s.title}
                    </Link>
                    <p className="text-sm text-slate-600">{s.companyName}</p>
                    <p className="mt-1 text-sm font-semibold text-green-700">{s.salaryFormatted}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
                      {s.locationCity && <span>{s.locationCity}</span>}
                      <span>Đã lưu {formatDate(s.savedAt)}</span>
                      {expired ? <span className="text-slate-400">Đã hết hạn nộp</span> : left !== null && <span>Còn {left} ngày</span>}
                      {appliedJobIds.has(s.id) && <span className="text-blue-700 font-medium">Đã ứng tuyển</span>}
                    </div>
                  </div>
                  <button onClick={() => remove(s.id)} aria-label={`Bỏ lưu ${s.title}`} className="self-start p-2 text-slate-400 hover:text-red-600 rounded hover:bg-red-50">
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
