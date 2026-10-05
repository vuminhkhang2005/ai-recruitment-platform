import React, { useState, useMemo } from 'react';
import type { Candidate } from './EmployerSection';
import { 
  Sparkles, 
  Search, 
  Check, 
  Send, 
  FileSpreadsheet, 
  CheckSquare, 
  Square, 
  ChevronRight, 
  User, 
  SlidersHorizontal,
  Mail,
  Calendar,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Cpu,
  GraduationCap,
  Briefcase,
  HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface CandidateMatrixSectionProps {
  candidates: Record<string, Candidate[]>;
  activePipelineId: string;
  onAdvanceToInterview: (candidateIds: string[]) => void;
  onSelectCandidate: (candidate: Candidate) => void;
  onShowToast: (msg: string) => void;
}

export const CandidateMatrixSection: React.FC<CandidateMatrixSectionProps> = ({
  candidates,
  activePipelineId,
  onAdvanceToInterview,
  onSelectCandidate,
  onShowToast
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'new' | 'screened' | 'interview' | 'offer'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'tech' | 'ats'>('score');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [interviewDate, setInterviewDate] = useState('2026-10-10');
  const [interviewFormat, setInterviewFormat] = useState<'google_meet' | 'office'>('google_meet');

  // Flatten all candidates with their current stage
  const allCandidatesWithStage = useMemo(() => {
    const list: Array<Candidate & { stage: 'new' | 'screened' | 'interview' | 'offer' }> = [];
    (['new', 'screened', 'interview', 'offer'] as const).forEach(stage => {
      (candidates[stage] || []).forEach(cand => {
        list.push({ ...cand, stage });
      });
    });
    return list;
  }, [candidates]);

  // Filtered & Sorted candidates
  const filteredCandidates = useMemo(() => {
    let result = allCandidatesWithStage.filter(cand => {
      if (stageFilter !== 'all' && cand.stage !== stageFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = cand.name.toLowerCase().includes(q);
      const matchRole = cand.role.toLowerCase().includes(q);
      const matchCompany = cand.prevCompany.toLowerCase().includes(q);
      const matchSkills = cand.skills.some(s => s.toLowerCase().includes(q));
      return matchName || matchRole || matchCompany || matchSkills;
    });

    result.sort((a, b) => {
      if (sortBy === 'tech') return b.breakdown.tech - a.breakdown.tech;
      if (sortBy === 'ats') return b.atsScore - a.atsScore;
      return b.score - a.score;
    });

    return result;
  }, [allCandidatesWithStage, stageFilter, searchQuery, sortBy]);

  // Bulk selection helpers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map(c => c.id));
    }
  };

  const handleSelectTopTier = () => {
    const topTierIds = filteredCandidates.filter(c => c.score >= 95).map(c => c.id);
    setSelectedIds(topTierIds);
    onShowToast(
      isVi 
        ? `✨ Đã chọn nhanh ${topTierIds.length} ứng viên Top Tier (Điểm AI ≥ 95%)!` 
        : `✨ Selected ${topTierIds.length} Top-Tier candidates (AI Score ≥ 95%)!`
    );
  };

  // Bulk actions
  const handleBulkAdvance = () => {
    if (selectedIds.length === 0) return;
    onAdvanceToInterview(selectedIds);
    setSelectedIds([]);
  };

  const handleBulkExportCsv = () => {
    const header = ['ID', 'Ho Ten', 'Vi Tri', 'Cong Ty Cu', 'Diem AI', 'Diem ATS', 'Ky Nang Chuyen Mon', 'Giai Doan'];
    const rows = filteredCandidates
      .filter(c => selectedIds.length === 0 || selectedIds.includes(c.id))
      .map(c => [
        c.id,
        `"${c.name}"`,
        `"${c.role}"`,
        `"${c.prevCompany}"`,
        c.score,
        c.atsScore,
        `"${c.skills.join(', ')}"`,
        c.stage
      ]);

    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `talentbridge_matrix_${activePipelineId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast(
      isVi 
        ? `📊 Đã xuất dữ liệu ma trận đánh giá (${rows.length} ứng viên) thành công!` 
        : `📊 Exported evaluation matrix (${rows.length} candidates) successfully!`
    );
  };

  const handleSendBatchInvites = () => {
    setIsSendingInvites(true);
    setTimeout(() => {
      setIsSendingInvites(false);
      setIsInviteModalOpen(false);
      onShowToast(
        isVi 
          ? `🎉 Đã gửi tự động ${selectedIds.length} thư mời phỏng vấn kỹ thuật qua email!` 
          : `🎉 Dispatched ${selectedIds.length} tech interview invitations via email!`
      );
      setSelectedIds([]);
    }, 1000);
  };

  const stageBadgeMap: Record<string, { labelVi: string; labelEn: string; color: string }> = {
    new: { labelVi: 'Mới nộp', labelEn: 'New', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    screened: { labelVi: 'Đã lọc AI', labelEn: 'Screened', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
    interview: { labelVi: 'Phỏng vấn', labelEn: 'Interview', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
    offer: { labelVi: 'Đã Offer', labelEn: 'Offered', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800' }
  };

  return (
    <div className="space-y-5 animate-fade-in" data-testid="candidate-matrix-section">
      
      {/* 1. Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            data-testid="input-matrix-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isVi ? 'Tìm theo tên, kỹ năng, công ty cũ...' : 'Search by name, skills, previous company...'}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar text-xs">
          <button
            type="button"
            data-testid="filter-stage-all"
            onClick={() => setStageFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              stageFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-soft-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isVi ? 'Tất cả' : 'All'} ({allCandidatesWithStage.length})
          </button>
          <button
            type="button"
            data-testid="filter-stage-new"
            onClick={() => setStageFilter('new')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              stageFilter === 'new'
                ? 'bg-emerald-600 text-white shadow-soft-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isVi ? 'Mới' : 'New'} ({(candidates.new || []).length})
          </button>
          <button
            type="button"
            data-testid="filter-stage-screened"
            onClick={() => setStageFilter('screened')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              stageFilter === 'screened'
                ? 'bg-teal-600 text-white shadow-soft-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isVi ? 'Đã lọc' : 'Screened'} ({(candidates.screened || []).length})
          </button>
          <button
            type="button"
            data-testid="filter-stage-interview"
            onClick={() => setStageFilter('interview')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              stageFilter === 'interview'
                ? 'bg-indigo-600 text-white shadow-soft-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isVi ? 'Phỏng vấn' : 'Interview'} ({(candidates.interview || []).length})
          </button>
        </div>

        {/* Sort Select & Quick Pick */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              data-testid="select-matrix-sort"
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="score">{isVi ? 'Điểm AI Match (Cao → Thấp)' : 'AI Match (High → Low)'}</option>
              <option value="tech">{isVi ? 'Điểm Kỹ thuật (Cao → Thấp)' : 'Tech Score (High → Low)'}</option>
              <option value="ats">{isVi ? 'Điểm chuẩn ATS (Cao → Thấp)' : 'ATS Score (High → Low)'}</option>
            </select>
          </div>

          <button
            type="button"
            data-testid="btn-select-top-tier"
            onClick={handleSelectTopTier}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>{isVi ? 'Chọn Top Tier (≥95%)' : 'Pick Top Tier (≥95%)'}</span>
          </button>
        </div>

      </div>

      {/* 2. Floating Bulk Action Bar (Visible when >= 1 candidate selected) */}
      {selectedIds.length > 0 && (
        <div 
          data-testid="bulk-action-bar"
          className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white shadow-soft-xl border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 animate-slide-up"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200">
              {isVi ? `Đã chọn ${selectedIds.length} ứng viên xuất sắc` : `Selected ${selectedIds.length} candidates`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="btn-bulk-advance-interview"
              onClick={handleBulkAdvance}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-soft cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isVi ? '⚡ Chuyển Phỏng Vấn' : '⚡ Advance to Interview'}</span>
            </button>

            <button
              type="button"
              data-testid="btn-bulk-invite-email"
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-soft cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{isVi ? '✉️ Gửi Thư Mời Lịch' : '✉️ Send Batch Invites'}</span>
            </button>

            <button
              type="button"
              data-testid="btn-bulk-export-csv"
              onClick={handleBulkExportCsv}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
              <span>{isVi ? 'Xuất File CSV' : 'Export CSV'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={isVi ? 'Bỏ chọn' : 'Deselect all'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Scoring Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" data-testid="candidate-matrix-table">
            <thead className="bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3.5 sm:p-4 w-10 text-center">
                  <button
                    type="button"
                    data-testid="btn-select-all"
                    onClick={handleSelectAll}
                    className="p-1 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                  >
                    {selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3.5 sm:p-4">{isVi ? 'Ứng viên' : 'Candidate'}</th>
                <th className="p-3.5 sm:p-4">{isVi ? 'Giai đoạn' : 'Stage'}</th>
                <th className="p-3.5 sm:p-4 text-center">{isVi ? 'AI Match' : 'AI Match'}</th>
                <th className="p-3.5 sm:p-4 min-w-[200px]">{isVi ? 'Khung Năng Lực 4 Chiều (Breakdown)' : '4-Dimension Matrix'}</th>
                <th className="p-3.5 sm:p-4">{isVi ? 'Kỹ năng chính' : 'Key Skills'}</th>
                <th className="p-3.5 sm:p-4 text-right">{isVi ? 'Kỳ vọng lương' : 'Expected Salary'}</th>
                <th className="p-3.5 sm:p-4 text-center">{isVi ? 'Hành động' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold">{isVi ? 'Không tìm thấy ứng viên phù hợp' : 'No matching candidates found'}</p>
                    <p className="text-[11px] mt-1">{isVi ? 'Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc' : 'Try adjusting your search query or filter'}</p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => {
                  const isSelected = selectedIds.includes(cand.id);
                  const stageInfo = stageBadgeMap[cand.stage] || stageBadgeMap.new;

                  return (
                    <tr 
                      key={cand.id}
                      data-testid={`matrix-row-${cand.id}`}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 sm:p-4 text-center">
                        <input
                          type="checkbox"
                          data-testid={`candidate-checkbox-${cand.id}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelect(cand.id)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                      </td>

                      {/* Candidate Dossier Info */}
                      <td className="p-3.5 sm:p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={cand.avatar}
                            alt={cand.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-soft-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white truncate">
                              {cand.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {cand.role} • <span className="font-semibold text-emerald-600 dark:text-emerald-400">{cand.prevCompany}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Stage Badge */}
                      <td className="p-3.5 sm:p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${stageInfo.color}`}>
                          {isVi ? stageInfo.labelVi : stageInfo.labelEn}
                        </span>
                      </td>

                      {/* AI Match Score Badge */}
                      <td className="p-3.5 sm:p-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                            cand.score >= 95 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : cand.score >= 90
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                          }`}>
                            {cand.score}%
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                            ATS {cand.atsScore}
                          </span>
                        </div>
                      </td>

                      {/* 4-Dimension Breakdown Matrix */}
                      <td className="p-3.5 sm:p-4">
                        <div className="space-y-1.5 w-full max-w-[240px]">
                          {/* Tech */}
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <Cpu className="w-2.5 h-2.5 text-emerald-500" />
                              <span>Tech</span>
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{cand.breakdown.tech}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${cand.breakdown.tech}%` }} />
                          </div>

                          {/* Experience */}
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <Briefcase className="w-2.5 h-2.5 text-blue-500" />
                              <span>{isVi ? 'K/Nghiệm' : 'Exp'}</span>
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{cand.breakdown.exp}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${cand.breakdown.exp}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Key Skills */}
                      <td className="p-3.5 sm:p-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {cand.skills.slice(0, 3).map((skill, idx) => (
                            <span 
                              key={idx}
                              className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {cand.skills.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold self-center">
                              +{cand.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Expected Salary */}
                      <td className="p-3.5 sm:p-4 text-right">
                        <span className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {isVi ? cand.salaryVi : cand.salaryEn}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {isVi ? cand.experienceVi : cand.experienceEn}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 sm:p-4 text-center">
                        <button
                          type="button"
                          data-testid={`btn-view-dossier-${cand.id}`}
                          onClick={() => onSelectCandidate(cand)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <span>{isVi ? 'Hồ sơ' : 'Dossier'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Batch Interview Invitation Dispatch Modal */}
      {isInviteModalOpen && (
        <div 
          data-testid="batch-invite-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
        >
          <div 
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {isVi ? 'Gửi Thư Mời Phỏng Vấn Kỹ Thuật Đồng Loạt' : 'Dispatch Batch Interview Invites'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isVi ? `Gửi tới ${selectedIds.length} ứng viên đã chọn` : `Sending to ${selectedIds.length} selected candidates`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="btn-close-batch-invite"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {isVi ? 'Ngày phỏng vấn dự kiến' : 'Proposed Interview Date'}
                </label>
                <input
                  type="date"
                  value={interviewDate}
                  data-testid="input-invite-date"
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {isVi ? 'Hình thức phỏng vấn' : 'Interview Format'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInterviewFormat('google_meet')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      interviewFormat === 'google_meet'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Google Meet (Online)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterviewFormat('office')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      interviewFormat === 'office'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Trực tiếp tại VP (On-site)
                  </button>
                </div>
              </div>

              {/* Email Content Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                  {isVi ? 'Bản xem trước thư mời tự động:' : 'Automated Email Preview:'}
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-[11px]">
                  {isVi 
                    ? `Chào bạn, Hội đồng tuyển dụng trân trọng mời bạn tham dự buổi Phỏng Vấn Kỹ Thuật (Chuyên sâu hệ thống) vào ngày ${interviewDate} qua ${interviewFormat === 'google_meet' ? 'Google Meet' : 'Văn phòng Công ty'}. Lịch chi tiết đã được đồng bộ vào Google Calendar của bạn.` 
                    : `Dear candidate, You are cordially invited to our Tech Deep-Dive Interview on ${interviewDate} via ${interviewFormat === 'google_meet' ? 'Google Meet' : 'Our Office'}. Calendar invites with personalized slots have been dispatched.`}
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="button"
                  data-testid="btn-confirm-send-invites"
                  disabled={isSendingInvites}
                  onClick={handleSendBatchInvites}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-soft flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSendingInvites 
                      ? (isVi ? 'Đang gửi thư mời...' : 'Dispatching...') 
                      : (isVi ? `Xác nhận gửi (${selectedIds.length})` : `Confirm & Send (${selectedIds.length})`)}
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
