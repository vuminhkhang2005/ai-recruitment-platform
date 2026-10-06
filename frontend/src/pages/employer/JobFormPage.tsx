import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { jobApi } from '../../lib/api';
import type { Job, JobInput } from '../../lib/types';
import { CITIES, EXP_LEVELS, JOB_TYPES } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { ErrorBox, PageLoader, btnPrimary, btnSecondary, inputCls } from '../../components/ui/primitives';
import { usePageTitle } from '../../lib/usePageTitle';
import { NotFoundPage } from '../NotFoundPage';

interface FormState {
  title: string;
  jobType: string;
  expLevel: string;
  locationCity: string;
  locationAddress: string;
  negotiable: boolean;
  minSalary: string;
  maxSalary: string;
  deadline: string;
  skills: string[];
  description: string;
  requirements: string;
  benefits: string;
}

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');
const defaultDeadline = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

function fromJob(job: Job): FormState {
  return {
    title: job.title,
    jobType: job.jobType ?? 'FULL_TIME',
    expLevel: job.expLevel ?? 'MIDDLE',
    locationCity: job.locationCity ?? CITIES[0],
    locationAddress: job.locationAddress ?? '',
    negotiable: job.salaryFormatted === 'Thỏa thuận',
    minSalary: job.minSalary ? String(Math.round(job.minSalary / 1_000_000)) : '',
    maxSalary: job.maxSalary ? String(Math.round(job.maxSalary / 1_000_000)) : '',
    deadline: toDateInput(job.deadline),
    skills: job.skills,
    description: job.description ?? '',
    requirements: job.requirements ?? '',
    benefits: job.benefits ?? '',
  };
}

const EMPTY: FormState = {
  title: '',
  jobType: 'FULL_TIME',
  expLevel: 'MIDDLE',
  locationCity: CITIES[0],
  locationAddress: '',
  negotiable: false,
  minSalary: '',
  maxSalary: '',
  deadline: defaultDeadline(),
  skills: [],
  description: '',
  requirements: '',
  benefits: '',
};

const Label: React.FC<{ htmlFor: string; children: React.ReactNode; required?: boolean }> = ({ htmlFor, children, required }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
    {children}
    {required && <span className="text-rose-500"> *</span>}
  </label>
);

export const JobFormPage: React.FC = () => {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  usePageTitle(editing ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng');
  const [form, setForm] = useState<FormState | null>(editing ? null : EMPTY);
  const [notFound, setNotFound] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    // Load from the recruiter's own jobs (does not count as a public view).
    jobApi
      .mine()
      .then((list) => {
        const job = list.find((j) => String(j.id) === id);
        if (job) setForm(fromJob(job));
        else setNotFound(true);
      })
      .catch((e: Error) => setError(e.message));
  }, [editing, id]);

  if (notFound) return <NotFoundPage message="Không tìm thấy tin tuyển dụng của bạn." />;
  if (!form) return error ? <div className="max-w-3xl mx-auto px-4 py-10"><ErrorBox message={error} /></div> : <PageLoader />;

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => (f ? { ...f, [k]: e.target.value } : f));

  const addSkill = () => {
    const parts = skillInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    setForm((f) => {
      if (!f) return f;
      const next = [...f.skills];
      parts.forEach((p) => {
        if (!next.some((s) => s.toLowerCase() === p.toLowerCase())) next.push(p);
      });
      return { ...f, skills: next };
    });
    setSkillInput('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const f = form;
    if (!f.title.trim()) return setError('Vui lòng nhập tên vị trí.');
    if (!f.description.trim()) return setError('Vui lòng nhập mô tả công việc.');
    if (!f.requirements.trim()) return setError('Vui lòng nhập yêu cầu ứng viên.');
    if (f.skills.length === 0) return setError('Thêm ít nhất một kỹ năng để ứng viên tìm thấy tin của bạn.');
    const min = f.minSalary ? Number(f.minSalary) : null;
    const max = f.maxSalary ? Number(f.maxSalary) : null;
    if (!f.negotiable && min === null && max === null) return setError('Nhập mức lương hoặc chọn "Thỏa thuận".');
    if (!f.negotiable && min !== null && max !== null && min > max) return setError('Lương tối thiểu không được lớn hơn lương tối đa.');
    if (!f.deadline) return setError('Vui lòng chọn hạn nộp hồ sơ.');
    if (new Date(`${f.deadline}T23:59:59`) < new Date()) return setError('Hạn nộp hồ sơ phải ở tương lai.');

    const payload: JobInput = {
      title: f.title.trim(),
      jobType: f.jobType,
      expLevel: f.expLevel,
      locationCity: f.locationCity,
      locationAddress: f.locationAddress.trim(),
      isSalaryNegotiable: f.negotiable,
      minSalary: f.negotiable ? null : min !== null ? min * 1_000_000 : null,
      maxSalary: f.negotiable ? null : max !== null ? max * 1_000_000 : null,
      currency: 'VND',
      deadline: `${f.deadline}T23:59:59`,
      skills: f.skills,
      description: f.description.trim(),
      requirements: f.requirements.trim(),
      benefits: f.benefits.trim(),
    };

    setSaving(true);
    try {
      if (editing) {
        await jobApi.update(Number(id), payload);
        toast('Đã cập nhật tin tuyển dụng');
      } else {
        const created = await jobApi.create(payload);
        toast(`Đã đăng tin "${created.title}"`);
      }
      navigate('/employer');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/employer" className="text-sm text-slate-500 hover:text-slate-800">
        ← Tin tuyển dụng
      </Link>
      <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{editing ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng'}</h1>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <section className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-soft-xs">
          <h2 className="font-black text-slate-900 dark:text-white">Thông tin chung</h2>
          <div>
            <Label htmlFor="title" required>
              Tên vị trí
            </Label>
            <input id="title" value={form.title} onChange={set('title')} maxLength={200} placeholder="VD: Senior Java Developer" className={`${inputCls} mt-1`} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expLevel">Cấp bậc</Label>
              <select id="expLevel" value={form.expLevel} onChange={set('expLevel')} className={`${inputCls} mt-1`}>
                {Object.entries(EXP_LEVELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="jobType">Hình thức</Label>
              <select id="jobType" value={form.jobType} onChange={set('jobType')} className={`${inputCls} mt-1`}>
                {['FULL_TIME', 'HYBRID', 'INTERNSHIP'].map((k) => (
                  <option key={k} value={k}>
                    {JOB_TYPES[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="city">Thành phố</Label>
              <select id="city" value={form.locationCity} onChange={set('locationCity')} className={`${inputCls} mt-1`}>
                {[...new Set([...CITIES, form.locationCity])].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="address">Địa chỉ làm việc</Label>
              <input id="address" value={form.locationAddress} onChange={set('locationAddress')} placeholder="Tòa nhà, đường, quận" className={`${inputCls} mt-1`} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minSalary">Mức lương (triệu VND / tháng)</Label>
              <div className="mt-1 flex items-center gap-2">
                <input id="minSalary" type="number" min={0} disabled={form.negotiable} value={form.minSalary} onChange={set('minSalary')} placeholder="Từ" className={inputCls} />
                <span className="text-slate-400">–</span>
                <input aria-label="Lương tối đa" type="number" min={0} disabled={form.negotiable} value={form.maxSalary} onChange={set('maxSalary')} placeholder="Đến" className={inputCls} />
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={form.negotiable} onChange={(e) => setForm({ ...form, negotiable: e.target.checked })} className="accent-emerald-600" />
                Thỏa thuận
              </label>
            </div>
            <div>
              <Label htmlFor="deadline" required>
                Hạn nộp hồ sơ
              </Label>
              <input id="deadline" type="date" value={form.deadline} onChange={set('deadline')} className={`${inputCls} mt-1`} />
            </div>
          </div>
          <div>
            <Label htmlFor="skill-input" required>
              Kỹ năng
            </Label>
            <div className="mt-1 flex gap-2">
              <input
                id="skill-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="VD: Java, Spring Boot (Enter để thêm)"
                className={inputCls}
              />
              <button type="button" onClick={addSkill} className={btnSecondary}>
                Thêm
              </button>
            </div>
            {form.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5" data-testid="job-skills">
                {form.skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full border border-slate-300 bg-slate-50 text-sm">
                    {s}
                    <button type="button" aria-label={`Xóa kỹ năng ${s}`} onClick={() => setForm({ ...form, skills: form.skills.filter((x) => x !== s) })} className="p-0.5 text-slate-400 hover:text-rose-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-soft-xs">
          <h2 className="font-black text-slate-900 dark:text-white">Nội dung tin</h2>
          <p className="text-xs text-slate-500 -mt-2">Mỗi ý một dòng sẽ được hiển thị thành danh sách gạch đầu dòng.</p>
          <div>
            <Label htmlFor="description" required>
              Mô tả công việc
            </Label>
            <textarea id="description" rows={6} value={form.description} onChange={set('description')} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <Label htmlFor="requirements" required>
              Yêu cầu ứng viên
            </Label>
            <textarea id="requirements" rows={6} value={form.requirements} onChange={set('requirements')} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <Label htmlFor="benefits">Quyền lợi</Label>
            <textarea id="benefits" rows={4} value={form.benefits} onChange={set('benefits')} className={`${inputCls} mt-1`} />
          </div>
        </section>

        {error && <ErrorBox message={error} />}
        <div className="flex justify-end gap-2">
          <Link to="/employer" className={btnSecondary}>
            Hủy
          </Link>
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Đăng tin'}
          </button>
        </div>
      </form>
    </div>
  );
};
