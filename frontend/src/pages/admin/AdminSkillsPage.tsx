import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Edit3,
  Layers,
  Plus,
  Power,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import type { AdminSkill, SaveSkillInput } from '../../lib/types';
import { EmptyState, ErrorBox, PageLoader, inputCls } from '../../components/ui/primitives';
import { usePageTitle } from '../../lib/usePageTitle';
import { AdminHeader } from './AdminHeader';
import { useLanguage } from '../../i18n/LanguageContext';

const SKILL_CATEGORIES = [
  {
    code: 'PROGRAMMING_LANGUAGE',
    shortVi: 'Ngôn ngữ lập trình',
    shortEn: 'Programming Language',
    labelVi: 'Ngôn ngữ lập trình (PROGRAMMING_LANGUAGE)',
    labelEn: 'Programming Language (PROGRAMMING_LANGUAGE)',
  },
  {
    code: 'FRAMEWORK',
    shortVi: 'Framework / Library',
    shortEn: 'Framework / Library',
    labelVi: 'Framework / Library (FRAMEWORK)',
    labelEn: 'Framework / Library (FRAMEWORK)',
  },
  {
    code: 'DATABASE',
    shortVi: 'Cơ sở dữ liệu',
    shortEn: 'Database',
    labelVi: 'Cơ sở dữ liệu (DATABASE)',
    labelEn: 'Database (DATABASE)',
  },
  {
    code: 'CLOUD_DEVOPS',
    shortVi: 'Cloud & DevOps',
    shortEn: 'Cloud & DevOps',
    labelVi: 'Cloud & DevOps (CLOUD_DEVOPS)',
    labelEn: 'Cloud & DevOps (CLOUD_DEVOPS)',
  },
  {
    code: 'TESTING',
    shortVi: 'Kiểm thử phần mềm',
    shortEn: 'Software Testing',
    labelVi: 'Kiểm thử phần mềm (TESTING)',
    labelEn: 'Software Testing (TESTING)',
  },
  {
    code: 'METHODOLOGY',
    shortVi: 'Phương pháp luận',
    shortEn: 'Methodology',
    labelVi: 'Phương pháp luận (METHODOLOGY)',
    labelEn: 'Methodology (METHODOLOGY)',
  },
  {
    code: 'SOFT_SKILL',
    shortVi: 'Kỹ năng mềm',
    shortEn: 'Soft Skill',
    labelVi: 'Kỹ năng mềm (SOFT_SKILL)',
    labelEn: 'Soft Skill (SOFT_SKILL)',
  },
  {
    code: 'OTHER',
    shortVi: 'Chuyên môn khác',
    shortEn: 'Domain & Other',
    labelVi: 'Khác (OTHER)',
    labelEn: 'Other (OTHER)',
  },
];

export const AdminSkillsPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  usePageTitle(isVi ? 'Từ điển Kỹ năng Chuẩn (Master Skill Taxonomy)' : 'Master AI Skill Taxonomy');
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Filters & Sorting
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'DEMAND' | 'SUPPLY'>('NAME');

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<AdminSkill | null>(null);
  const [form, setForm] = useState<SaveSkillInput>({
    name: '',
    category: 'FRAMEWORK',
    description: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const loadSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getSkills({
        keyword: keyword.trim() || undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      });
      setSkills(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  const filteredAndSortedSkills = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return skills
      .filter((s) => {
        if (activeStatusFilter === 'ACTIVE' && !s.isActive) return false;
        if (activeStatusFilter === 'INACTIVE' && s.isActive) return false;
        if (!q) return true;
        return (
          s.name?.toLowerCase().includes(q) ||
          s.slug?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'DEMAND') return b.jobCount - a.jobCount || a.name.localeCompare(b.name);
        if (sortBy === 'SUPPLY') return b.candidateCount - a.candidateCount || a.name.localeCompare(b.name);
        return a.name.localeCompare(b.name);
      });
  }, [skills, keyword, activeStatusFilter, sortBy]);

  const stats = useMemo(() => {
    const total = skills.length;
    const active = skills.filter((s) => s.isActive).length;
    const totalJobLinks = skills.reduce((sum, s) => sum + (s.jobCount || 0), 0);
    const totalCandidateLinks = skills.reduce((sum, s) => sum + (s.candidateCount || 0), 0);
    return { total, active, totalJobLinks, totalCandidateLinks };
  }, [skills]);

  const openCreateModal = () => {
    setEditingSkill(null);
    setForm({
      name: '',
      category: 'FRAMEWORK',
      description: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (sk: AdminSkill) => {
    setEditingSkill(sk);
    setForm({
      name: sk.name,
      category: sk.category,
      description: sk.description || '',
      isActive: sk.isActive,
    });
    setModalOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editingSkill) {
        const updated = await adminApi.updateSkill(editingSkill.id, form);
        setSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        showToast(
          isVi
            ? `Đã cập nhật kỹ năng "${updated.name}" thành công`
            : `Updated skill "${updated.name}" successfully`
        );
      } else {
        const created = await adminApi.createSkill(form);
        setSkills((prev) => [created, ...prev]);
        showToast(
          isVi
            ? `Đã thêm kỹ năng mới "${created.name}" vào từ điển chuẩn AI`
            : `Added new skill "${created.name}" to the AI Skill Taxonomy`
        );
      }
      setModalOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSkill = async (sk: AdminSkill) => {
    try {
      const toggled = await adminApi.toggleSkill(sk.id);
      setSkills((prev) => prev.map((s) => (s.id === toggled.id ? toggled : s)));
      showToast(
        isVi
          ? `Đã ${toggled.isActive ? 'kích hoạt' : 'tạm ẩn'} kỹ năng "${toggled.name}"`
          : `${toggled.isActive ? 'Activated' : 'Deactivated'} skill "${toggled.name}"`
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const getCategoryDisplay = (catCode: string) => {
    const found = SKILL_CATEGORIES.find((c) => c.code === catCode);
    if (!found) return catCode;
    return isVi ? found.shortVi : found.shortEn;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6" data-testid="admin-skills-page">
      <AdminHeader
        title={isVi ? 'Quản lý Từ điển Kỹ năng Chuẩn AI (Skill Taxonomy)' : 'Master AI Skill Taxonomy Management'}
        subtitle={
          isVi
            ? 'Chuẩn hóa danh mục kỹ năng phục vụ thuật toán bóc tách CV (AI Resume Parser) và chấm điểm độ khớp ATS (Job-Candidate Matching).'
            : 'Standardize the skill ontology powering AI Resume Parsing and ATS Job-Candidate Matching.'
        }
        rightSlot={
          <>
            <button
              type="button"
              onClick={openCreateModal}
              data-testid="btn-open-create-skill"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black shadow-soft-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isVi ? 'Thêm Kỹ năng mới' : 'Add New Skill'}</span>
            </button>
            <button
              type="button"
              onClick={loadSkills}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title={isVi ? 'Làm mới' : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </>
        }
      />

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-soft-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Tổng Kỹ năng Chuẩn' : 'Canonical Skills'}</span>
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Phân bổ trong 8 nhóm công nghệ' : 'Across 8 technical categories'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-soft-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Đang kích hoạt AI' : 'Active in AI Engine'}</span>
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Dùng cho bóc tách CV & ATS' : 'Enabled for CV parsing & ATS'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-soft-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Tổng Cầu (Job Skills)' : 'Job Demand Links'}</span>
            <Briefcase className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.totalJobLinks}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Lượt gắn kỹ năng vào JD' : 'Skill requirements across jobs'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-soft-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isVi ? 'Tổng Cung (Hồ sơ UV)' : 'Candidate Supply Links'}</span>
            <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.totalCandidateLinks}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? 'Lượt ứng viên sở hữu kỹ năng' : 'Verified candidate skill tags'}
          </p>
        </div>
      </div>

      {toast && (
        <div
          className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-4 py-3 text-sm font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-soft-xs"
          data-testid="admin-skill-toast"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </div>
          <button type="button" onClick={() => setToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <ErrorBox message={error} onRetry={loadSkills} />}

      {/* Search, Category Filter & Sort Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-soft-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadSkills();
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-3"
        >
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={
                isVi
                  ? 'Tìm kỹ năng theo tên, slug hoặc mô tả (VD: Java, React, Kubernetes)...'
                  : 'Search skills by name, slug, or description (e.g. Java, React, Kubernetes)...'
              }
              className={`${inputCls} pl-10 pr-8`}
              data-testid="admin-skill-search-input"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={inputCls}
              data-testid="admin-skill-category-filter"
            >
              <option value="ALL">
                {isVi ? `Tất cả 8 nhóm kỹ năng (${skills.length})` : `All 8 Skill Categories (${skills.length})`}
              </option>
              {SKILL_CATEGORIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {isVi ? c.labelVi : c.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'NAME' | 'DEMAND' | 'SUPPLY')}
              className={inputCls}
            >
              <option value="NAME">{isVi ? 'Sắp xếp: Tên A-Z' : 'Sort: Name A-Z'}</option>
              <option value="DEMAND">{isVi ? 'Sắp xếp: Cầu cao nhất' : 'Sort: Highest Demand'}</option>
              <option value="SUPPLY">{isVi ? 'Sắp xếp: Cung cao nhất' : 'Sort: Highest Supply'}</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition cursor-pointer shadow-soft-xs"
            >
              {isVi ? 'Tìm kiếm' : 'Search'}
            </button>
          </div>
        </form>

        {/* Quick Category Pills & Active Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-soft-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
              }`}
            >
              {isVi ? 'Tất cả' : 'All'}
            </button>
            {SKILL_CATEGORIES.map((cat) => (
              <button
                key={cat.code}
                type="button"
                onClick={() => setCategoryFilter(cat.code)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  categoryFilter === cat.code
                    ? 'bg-emerald-600 text-white shadow-soft-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
                }`}
              >
                {isVi ? cat.shortVi : cat.shortEn}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setActiveStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  activeStatusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-soft-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {st === 'ALL'
                  ? isVi
                    ? 'Tất cả'
                    : 'All'
                  : st === 'ACTIVE'
                  ? 'Active'
                  : 'Inactive'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <PageLoader />
      ) : filteredAndSortedSkills.length === 0 ? (
        <EmptyState
          title={isVi ? 'Không tìm thấy kỹ năng nào phù hợp' : 'No matching skills found'}
          description={
            isVi
              ? 'Thử đổi từ khóa tìm kiếm, danh mục hoặc nhấn Thêm Kỹ năng mới.'
              : 'Try changing your search query, category filter, or add a new skill.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedSkills.map((sk) => {
            const totalVol = Math.max(1, sk.jobCount + sk.candidateCount);
            const demandPct = Math.round((sk.jobCount / totalVol) * 100);
            return (
              <div
                key={sk.id}
                data-testid={`admin-skill-card-${sk.id}`}
                className={`rounded-3xl border p-5 transition-all flex flex-col justify-between gap-4 ${
                  sk.isActive
                    ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/70 shadow-soft-xs'
                    : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                          {sk.name}
                        </h3>
                        <span className="text-xs font-mono text-slate-400 truncate">/{sk.slug}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                        <Layers className="w-3 h-3" />
                        {getCategoryDisplay(sk.category)}
                      </span>
                    </div>

                    {sk.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        Inactive
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {sk.description ||
                      `Standardized ${getCategoryDisplay(sk.category)} skill in the TalentBridge AI Matching taxonomy.`}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="w-full h-1.5 rounded-full bg-sky-200 dark:bg-sky-900/50 overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${demandPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {isVi ? 'Cầu:' : 'Jobs:'}{' '}
                        <strong className="text-emerald-600 dark:text-emerald-400">{sk.jobCount}</strong>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {isVi ? 'Cung:' : 'Cand.:'}{' '}
                        <strong className="text-sky-600 dark:text-sky-400">{sk.candidateCount}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(sk)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                        title={isVi ? 'Chỉnh sửa kỹ năng' : 'Edit skill'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isVi ? 'Sửa' : 'Edit'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSkill(sk)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition cursor-pointer"
                        title={
                          sk.isActive
                            ? isVi
                              ? 'Tạm ẩn kỹ năng'
                              : 'Deactivate skill'
                            : isVi
                            ? 'Kích hoạt kỹ năng'
                            : 'Activate skill'
                        }
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Skill Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={() => setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingSkill
                    ? isVi
                      ? `Chỉnh sửa kỹ năng: ${editingSkill.name}`
                      : `Edit Skill: ${editingSkill.name}`
                    : isVi
                    ? 'Thêm Kỹ năng mới vào Từ điển AI'
                    : 'Add New Skill to AI Taxonomy'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {isVi ? 'Tên kỹ năng chuẩn *' : 'Canonical Skill Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. LangChain, Vector Database, Terraform..."
                  className={`${inputCls} mt-1`}
                  data-testid="input-skill-name"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {isVi ? 'Danh mục phân loại *' : 'Category *'}
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`${inputCls} mt-1`}
                  data-testid="select-skill-category"
                >
                  {SKILL_CATEGORIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {isVi ? c.labelVi : c.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {isVi ? 'Mô tả kỹ năng' : 'Skill Description'}
                </label>
                <textarea
                  rows={3}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={
                    isVi
                      ? 'Mô tả ngắn gọn ứng dụng của kỹ năng trong tuyển dụng...'
                      : 'Briefly describe how this skill is used in technical roles...'
                  }
                  className={`${inputCls} mt-1`}
                  data-testid="input-skill-description"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  data-testid="btn-submit-skill"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-soft-xs"
                >
                  {saving
                    ? isVi
                      ? 'Đang lưu...'
                      : 'Saving...'
                    : editingSkill
                    ? isVi
                      ? 'Lưu thay đổi'
                      : 'Save Changes'
                    : isVi
                    ? 'Tạo kỹ năng mới'
                    : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
