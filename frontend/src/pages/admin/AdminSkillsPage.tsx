import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Edit3,
  Plus,
  Power,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import type { AdminSkill, SaveSkillInput } from '../../lib/types';
import { ErrorBox, PageLoader, inputCls } from '../../components/ui/primitives';
import { usePageTitle } from '../../lib/usePageTitle';
import { AdminHeader } from './AdminHeader';

const SKILL_CATEGORIES = [
  { code: 'PROGRAMMING_LANGUAGE', label: 'Ngôn ngữ lập trình (PROGRAMMING_LANGUAGE)' },
  { code: 'FRAMEWORK', label: 'Framework / Library (FRAMEWORK)' },
  { code: 'DATABASE', label: 'Cơ sở dữ liệu (DATABASE)' },
  { code: 'CLOUD_DEVOPS', label: 'Cloud & DevOps (CLOUD_DEVOPS)' },
  { code: 'TESTING', label: 'Kiểm thử phần mềm (TESTING)' },
  { code: 'METHODOLOGY', label: 'Phương pháp luận (METHODOLOGY)' },
  { code: 'SOFT_SKILL', label: 'Kỹ năng mềm (SOFT_SKILL)' },
  { code: 'OTHER', label: 'Khác (OTHER)' },
];

export const AdminSkillsPage: React.FC = () => {
  usePageTitle('Từ điển Kỹ năng Chuẩn (Master Skill Taxonomy)');
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

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
        showToast(`Đã cập nhật kỹ năng "${updated.name}" thành công`);
      } else {
        const created = await adminApi.createSkill(form);
        setSkills((prev) => [created, ...prev]);
        showToast(`Đã thêm kỹ năng mới "${created.name}" vào từ điển chuẩn AI`);
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
        `Đã ${toggled.isActive ? 'kích hoạt' : 'tạm ẩn'} kỹ năng "${toggled.name}"`
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" data-testid="admin-skills-page">
      <AdminHeader
        title="Quản lý Từ điển Kỹ năng Chuẩn - Master Skill Taxonomy (UC-ADM-05)"
        subtitle="Chuẩn hóa danh mục kỹ năng phục vụ thuật toán bóc tách CV (AI Resume Parser) và chấm điểm độ khớp ATS (Job-Candidate Matching)."
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreateModal}
              data-testid="btn-open-create-skill"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black shadow-lg shadow-emerald-500/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Kỹ năng mới</span>
            </button>
            <button
              type="button"
              onClick={loadSkills}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-bold border border-white/20 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {toast && (
        <div
          className="mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-4 py-3 text-sm font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-soft-xs"
          data-testid="admin-skill-toast"
        >
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6">
          <ErrorBox message={error} />
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-soft-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadSkills();
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-3"
        >
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kỹ năng theo tên, slug hoặc mô tả (VD: Java, React, Kubernetes)..."
              className={`${inputCls} pl-10`}
              data-testid="admin-skill-search-input"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={inputCls}
              data-testid="admin-skill-category-filter"
            >
              <option value="ALL">Tất cả 8 nhóm kỹ năng ({skills.length})</option>
              {SKILL_CATEGORIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition cursor-pointer"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <PageLoader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((sk) => (
            <div
              key={sk.id}
              data-testid={`admin-skill-card-${sk.id}`}
              className={`rounded-3xl border p-5 transition flex flex-col justify-between gap-4 ${
                sk.isActive
                  ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-soft-xs'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {sk.name}
                      </h3>
                      <span className="text-xs font-mono text-slate-400">/{sk.slug}</span>
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                      {sk.category}
                    </span>
                  </div>

                  {sk.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Inactive
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {sk.description || `Kỹ năng chuẩn thuộc phân nhóm ${sk.category} trong hệ thống AI Matching.`}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Jobs: <strong className="text-emerald-600 dark:text-emerald-400">{sk.jobCount}</strong>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    UV: <strong className="text-indigo-600 dark:text-indigo-400">{sk.candidateCount}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(sk)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                    title="Chỉnh sửa kỹ năng"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSkill(sk)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition cursor-pointer"
                    title={sk.isActive ? 'Tạm ẩn kỹ năng' : 'Kích hoạt kỹ năng'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Skill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingSkill ? `Chỉnh sửa kỹ năng: ${editingSkill.name}` : 'Thêm Kỹ năng mới vào Từ điển AI'}
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
                  Tên kỹ năng chuẩn *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: LangChain, Vector Database, Terraform..."
                  className={`${inputCls} mt-1`}
                  data-testid="input-skill-name"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Danh mục phân loại *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`${inputCls} mt-1`}
                  data-testid="select-skill-category"
                >
                  {SKILL_CATEGORIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Mô tả kỹ năng
                </label>
                <textarea
                  rows={3}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả ngắn gọn ứng dụng của kỹ năng trong tuyển dụng..."
                  className={`${inputCls} mt-1`}
                  data-testid="input-skill-description"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  data-testid="btn-submit-skill"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                >
                  {saving ? 'Đang lưu...' : editingSkill ? 'Lưu thay đổi' : 'Tạo kỹ năng mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
