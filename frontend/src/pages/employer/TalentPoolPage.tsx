import React, { useEffect, useState } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  Send,
  CheckCircle2,
  Filter,
  RefreshCw,
  User,
  Award,
  ChevronRight,
  X,
  Mail,
  Zap,
} from 'lucide-react';
import { talentPoolApi, jobApi } from '../../lib/api';
import type { TalentPoolCandidate, Job } from '../../lib/types';
import { usePageTitle } from '../../lib/usePageTitle';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState, ErrorBox, PageLoader, btnPrimary, btnSecondary } from '../../components/ui/primitives';

export const TalentPoolPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  usePageTitle(isEn ? 'Talent Pool & Candidate Sourcing' : 'Săn Ứng Viên & Talent Pool AI');

  const [candidates, setCandidates] = useState<TalentPoolCandidate[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('All');
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(undefined);

  // Invitation Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitingCandidate, setInvitingCandidate] = useState<TalentPoolCandidate | null>(null);
  const [inviteJobId, setInviteJobId] = useState<number | undefined>(undefined);
  const [customMessage, setCustomMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [invitedCandidateIds, setInvitedCandidateIds] = useState<Set<number>>(new Set());

  // Load recruiter's jobs for matching dropdown
  useEffect(() => {
    jobApi
      .mine()
      .then((jobs) => {
        setMyJobs(jobs);
        if (jobs.length > 0 && !selectedJobId) {
          // Default to first active job to showcase instant matching score
          setSelectedJobId(jobs[0].id);
        }
      })
      .catch(() => {
        // Non-blocking if fails
      });
  }, []);

  const fetchCandidates = () => {
    setLoading(true);
    setError(null);
    talentPoolApi
      .search({
        keyword: keyword.trim() || undefined,
        city: city !== 'All' ? city : undefined,
        jobId: selectedJobId,
      })
      .then((res) => {
        setCandidates(res);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCandidates();
  }, [city, selectedJobId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  const openInviteModal = (candidate: TalentPoolCandidate) => {
    setInvitingCandidate(candidate);
    const targetJob = selectedJobId || (myJobs.length > 0 ? myJobs[0].id : undefined);
    setInviteJobId(targetJob);
    const jobTitle = myJobs.find((j) => j.id === targetJob)?.title || 'vị trí tại công ty';
    setCustomMessage(
      `Chào ${candidate.fullName},\n\nChúng tôi rất ấn tượng với hồ sơ và kỹ năng chuyên môn của bạn. Công ty chúng tôi hiện đang tìm kiếm nhân sự cho vị trí "${jobTitle}" và tin rằng bạn rất phù hợp.\n\nTrân trọng mời bạn tham khảo và nộp hồ sơ ứng tuyển!`
    );
    setInviteSuccessMsg(null);
    setInviteModalOpen(true);
  };

  const handleSendInvite = async () => {
    if (!invitingCandidate || !inviteJobId) return;
    setSendingInvite(true);
    setInviteSuccessMsg(null);
    try {
      const res = await talentPoolApi.invite({
        candidateUserId: invitingCandidate.userId,
        jobId: inviteJobId,
        customMessage,
      });
      setInviteSuccessMsg(res.message || 'Đã gửi lời mời ứng tuyển thành công!');
      setInvitedCandidateIds((prev) => new Set(prev).add(invitingCandidate.userId));
      setTimeout(() => {
        setInviteModalOpen(false);
        setInviteSuccessMsg(null);
      }, 1600);
    } catch (e: any) {
      setError(e.message || 'Không thể gửi lời mời ứng tuyển');
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" data-testid="talent-pool-page">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-soft">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                {isEn ? 'Talent Pool & AI Sourcing' : 'Săn Ứng Viên & Talent Pool AI'}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Proactive Recruiting
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn
                  ? 'Discover ready-to-work candidates with AI-powered skill matching against your job openings.'
                  : 'Chủ động tiếp cận nhân tài đang mở tìm việc, tự động đối sánh kỹ năng và mức độ phù hợp qua AI.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCandidates}
            className={`${btnSecondary} text-xs py-2 px-3 flex items-center gap-1.5`}
            title={isEn ? 'Refresh candidate pool' : 'Làm mới danh sách'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {isEn ? 'Refresh' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={isEn ? 'Search by skill (Java, React, AWS, Docker)...' : 'Tìm theo kỹ năng (Java, React, AWS, DevOps)...'}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Location Selector */}
          <div className="md:col-span-3 relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white truncate"
            >
              <option value="All">{isEn ? 'All Locations' : 'Tất cả địa điểm'}</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
            </select>
          </div>

          {/* Job Target Selector for ATS Matching */}
          <div className="md:col-span-4 relative">
            <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
            <select
              value={selectedJobId ?? ''}
              onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full pl-9 pr-8 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white font-medium truncate"
            >
              <option value="">{isEn ? '-- Select job to match ATS --' : '-- Chọn tin đối sánh ATS --'}</option>
              {myJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  🎯 {job.title}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Search */}
          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full h-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </form>

        {selectedJobId && (
          <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 px-3 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
            <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              {isEn
                ? 'AI is ranking candidates based on keyword & skill match against:'
                : 'AI đang xếp hạng ứng viên theo độ tương thích kỹ năng với tin tuyển dụng:'}{' '}
              <strong className="font-semibold underline">
                {myJobs.find((j) => j.id === selectedJobId)?.title}
              </strong>
            </span>
          </div>
        )}
      </div>

      {error && <ErrorBox message={error} />}

      {/* Candidate Grid */}
      {loading ? (
        <PageLoader />
      ) : candidates.length === 0 ? (
        <EmptyState
          title={isEn ? 'No candidates found' : 'Không tìm thấy ứng viên phù hợp'}
          description={
            isEn
              ? 'Try adjusting your keyword filter or select another target job.'
              : 'Thử tìm kiếm với từ khóa kỹ năng khác hoặc đổi địa điểm lọc.'
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              {isEn
                ? `Showing ${candidates.length} candidates ready to work`
                : `Tìm thấy ${candidates.length} ứng viên đang sẵn sàng nhận việc`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((cand) => {
              const isInvited = invitedCandidateIds.has(cand.userId);
              const score = cand.matchScore ?? 0;
              const ratingColor =
                score >= 80
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : score >= 60
                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 border-sky-200 dark:border-sky-800'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800';

              return (
                <div
                  key={cand.candidateProfileId}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                          {cand.avatarUrl ? (
                            <img
                              src={cand.avatarUrl}
                              alt={cand.fullName}
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            cand.fullName.slice(0, 1).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {cand.fullName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {cand.headline || (isEn ? 'Software Professional' : 'Kỹ sư phần mềm')}
                          </p>
                        </div>
                      </div>

                      {/* Open to Work Badge */}
                      <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {isEn ? 'Open' : 'Đang tìm việc'}
                      </span>
                    </div>

                    {/* Match Score Badge (if available) */}
                    {cand.matchScore !== undefined && cand.matchScore !== null && (
                      <div
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium ${ratingColor}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{cand.matchRating || (score >= 80 ? 'XUẤT SẮC' : 'PHÙ HỢP')}</span>
                        </div>
                        <span className="font-bold text-sm">{score}% Match</span>
                      </div>
                    )}

                    {/* Location & Contact info */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cand.city || 'Việt Nam'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[140px]">{cand.email}</span>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    {cand.bio && (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic leading-relaxed">
                          "{cand.bio}"
                        </p>
                      </div>
                    )}

                    {/* Skills list */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {isEn ? 'Key Skills' : 'Kỹ năng nổi bật'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cand.skills && cand.skills.length > 0 ? (
                          cand.skills.slice(0, 6).map((sk) => {
                            const isMatched =
                              cand.matchedSkills &&
                              cand.matchedSkills.some(
                                (m) => m.toLowerCase() === sk.name.toLowerCase()
                              );
                            return (
                              <span
                                key={sk.name}
                                className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium ${
                                  isMatched
                                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 font-semibold'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {sk.name}
                                {sk.yearsExperience ? ` · ${sk.yearsExperience}n` : ''}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            {isEn ? 'No skills specified' : 'Chưa cập nhật kỹ năng'}
                          </span>
                        )}
                        {cand.skills && cand.skills.length > 6 && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400">
                            +{cand.skills.length - 6}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {cand.skills?.length || 0} {isEn ? 'skills' : 'kỹ năng'}
                    </span>
                    <button
                      onClick={() => openInviteModal(cand)}
                      disabled={isInvited}
                      className={`text-xs font-semibold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${
                        isInvited
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isInvited ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {isEn ? 'Invited' : 'Đã gửi lời mời'}
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          {isEn ? 'Invite Candidate' : 'Mời ứng tuyển'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invitation Modal */}
      {inviteModalOpen && invitingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  {isEn ? 'Invite Candidate to Apply' : 'Mời ứng viên nộp hồ sơ'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isEn
                    ? `Sending personal invitation to ${invitingCandidate.fullName}`
                    : `Gửi thông báo & lời mời trực tiếp tới ${invitingCandidate.fullName}`}
                </p>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Job Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? 'Target Job Position' : 'Vị trí công việc mời ứng tuyển'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={inviteJobId ?? ''}
                onChange={(e) => {
                  const newJobId = Number(e.target.value);
                  setInviteJobId(newJobId);
                  const jTitle = myJobs.find((j) => j.id === newJobId)?.title || 'vị trí tại công ty';
                  setCustomMessage(
                    `Chào ${invitingCandidate.fullName},\n\nChúng tôi rất ấn tượng với hồ sơ và kỹ năng chuyên môn của bạn. Công ty chúng tôi hiện đang tìm kiếm nhân sự cho vị trí "${jTitle}" và tin rằng bạn rất phù hợp.\n\nTrân trọng mời bạn tham khảo và nộp hồ sơ ứng tuyển!`
                  );
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
              >
                {myJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} {j.locationCity ? `(${j.locationCity})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Invitation Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? 'Invitation Message' : 'Nội dung thư mời cá nhân hóa'}
              </label>
              <textarea
                rows={5}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white resize-none"
              />
            </div>

            {inviteSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{inviteSuccessMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className={`${btnSecondary} text-xs py-2 px-4`}
              >
                {isEn ? 'Cancel' : 'Hủy'}
              </button>
              <button
                type="button"
                onClick={handleSendInvite}
                disabled={sendingInvite || !inviteJobId || !!inviteSuccessMsg}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {sendingInvite ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {isEn ? 'Sending...' : 'Đang gửi...'}
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    {isEn ? 'Send Invitation' : 'Gửi lời mời'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
