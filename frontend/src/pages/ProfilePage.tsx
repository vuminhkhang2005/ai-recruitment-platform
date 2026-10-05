import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Star, Trash2, Upload, X } from 'lucide-react';
import { candidateApi, openCvFile, userApi } from '../lib/api';
import type { CvItem, SkillItem, UserProfile } from '../lib/types';
import { CITIES, formatDate, formatFileSize } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ErrorBox, PageLoader, Spinner, btnPrimary, btnSecondary, inputCls } from '../components/ui/primitives';
import { validateCvFile } from '../components/jobs/ApplyModal';
import { Avatar } from '../components/layout/Navbar';
import { usePageTitle } from '../lib/usePageTitle';

const Card: React.FC<{ id?: string; title: string; description?: string; children: React.ReactNode }> = ({ id, title, description, children }) => (
  <section id={id} className="bg-white border border-slate-200 rounded-lg p-6 scroll-mt-20">
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

const Field: React.FC<{ label: string; htmlFor: string; children: React.ReactNode; hint?: string }> = ({ label, htmlFor, children, hint }) => (
  <div>
    <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
      {label}
    </label>
    <div className="mt-1">{children}</div>
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

// ------------------------------------------------------------------ profile info

const ProfileForm: React.FC<{ profile: UserProfile; onSaved: (p: UserProfile) => void; candidate: boolean }> = ({ profile, onSaved, candidate }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    fullName: profile.fullName ?? '',
    phone: profile.phone ?? '',
    headline: profile.headline ?? '',
    jobTitle: profile.jobTitle ?? '',
    city: profile.city ?? '',
    bio: profile.bio ?? '',
    linkedinUrl: profile.linkedinUrl ?? '',
    githubUrl: profile.githubUrl ?? '',
    portfolioUrl: profile.portfolioUrl ?? '',
    expectedSalaryMin: profile.expectedSalaryMin ? String(profile.expectedSalaryMin / 1_000_000) : '',
    expectedSalaryMax: profile.expectedSalaryMax ? String(profile.expectedSalaryMax / 1_000_000) : '',
    isOpenToWork: profile.isOpenToWork ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.fullName.trim()) return setError('Họ tên không được để trống.');
    const min = form.expectedSalaryMin ? Number(form.expectedSalaryMin) : null;
    const max = form.expectedSalaryMax ? Number(form.expectedSalaryMax) : null;
    if (min !== null && max !== null && min > max) return setError('Mức lương mong muốn tối thiểu phải nhỏ hơn tối đa.');
    setSaving(true);
    try {
      const updated = await userApi.updateMe(
        candidate
          ? {
              fullName: form.fullName.trim(),
              phone: form.phone.trim(),
              headline: form.headline.trim(),
              city: form.city,
              bio: form.bio.trim(),
              linkedinUrl: form.linkedinUrl.trim(),
              githubUrl: form.githubUrl.trim(),
              portfolioUrl: form.portfolioUrl.trim(),
              expectedSalaryMin: min !== null ? min * 1_000_000 : null,
              expectedSalaryMax: max !== null ? max * 1_000_000 : null,
              isOpenToWork: form.isOpenToWork,
            }
          : { fullName: form.fullName.trim(), phone: form.phone.trim(), jobTitle: form.jobTitle.trim() },
      );
      onSaved(updated);
      toast('Đã lưu thông tin');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Họ và tên" htmlFor="p-name">
          <input id="p-name" value={form.fullName} onChange={set('fullName')} className={inputCls} />
        </Field>
        <Field label="Số điện thoại" htmlFor="p-phone">
          <input id="p-phone" value={form.phone} onChange={set('phone')} className={inputCls} />
        </Field>
        {candidate ? (
          <>
            <Field label="Vị trí / chức danh" htmlFor="p-headline">
              <input id="p-headline" value={form.headline} onChange={set('headline')} placeholder="VD: Backend Developer (Java)" className={inputCls} />
            </Field>
            <Field label="Thành phố" htmlFor="p-city">
              <select id="p-city" value={form.city} onChange={set('city')} className={inputCls}>
                <option value="">-- Chọn --</option>
                {[...new Set([...CITIES, ...(form.city ? [form.city] : [])])].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </>
        ) : (
          <Field label="Chức vụ" htmlFor="p-jobtitle">
            <input id="p-jobtitle" value={form.jobTitle} onChange={set('jobTitle')} className={inputCls} />
          </Field>
        )}
      </div>

      {candidate && (
        <>
          <Field label="Giới thiệu bản thân" htmlFor="p-bio">
            <textarea id="p-bio" rows={4} value={form.bio} onChange={set('bio')} className={inputCls} />
          </Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="LinkedIn" htmlFor="p-li">
              <input id="p-li" value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/…" className={inputCls} />
            </Field>
            <Field label="GitHub" htmlFor="p-gh">
              <input id="p-gh" value={form.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/…" className={inputCls} />
            </Field>
            <Field label="Portfolio" htmlFor="p-pf">
              <input id="p-pf" value={form.portfolioUrl} onChange={set('portfolioUrl')} className={inputCls} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Lương mong muốn (triệu VND)" htmlFor="p-smin">
              <div className="flex items-center gap-2">
                <input id="p-smin" type="number" min={0} value={form.expectedSalaryMin} onChange={set('expectedSalaryMin')} placeholder="Từ" className={inputCls} />
                <span className="text-slate-400">–</span>
                <input aria-label="Lương tối đa" type="number" min={0} value={form.expectedSalaryMax} onChange={set('expectedSalaryMax')} placeholder="Đến" className={inputCls} />
              </div>
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-700 sm:mt-7">
              <input type="checkbox" checked={form.isOpenToWork} onChange={(e) => setForm((f) => ({ ...f, isOpenToWork: e.target.checked }))} className="accent-red-600 w-4 h-4" />
              Tôi đang tìm việc
            </label>
          </div>
        </>
      )}

      {error && <ErrorBox message={error} />}
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? 'Đang lưu…' : 'Lưu thông tin'}
        </button>
      </div>
    </form>
  );
};

// ------------------------------------------------------------------ skills

const PROFICIENCY: Record<string, string> = { BEGINNER: 'Cơ bản', INTERMEDIATE: 'Khá', ADVANCED: 'Thành thạo', EXPERT: 'Chuyên gia' };

const SkillsEditor: React.FC = () => {
  const toast = useToast();
  const [skills, setSkills] = useState<SkillItem[] | null>(null);
  const [name, setName] = useState('');
  const [years, setYears] = useState('1');
  const [level, setLevel] = useState('INTERMEDIATE');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    candidateApi
      .getSkills()
      .then(setSkills)
      .catch((e: Error) => {
        setSkills([]);
        setError(e.message);
      });
  }, []);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n || !skills) return;
    if (skills.some((s) => s.name.toLowerCase() === n.toLowerCase())) {
      setError(`Kỹ năng "${n}" đã có trong danh sách.`);
      return;
    }
    setError(null);
    setSkills([...skills, { name: n, yearsExperience: Number(years) || 0, proficiency: level }]);
    setName('');
    setDirty(true);
  };

  const remove = (n: string) => {
    setSkills((list) => list?.filter((s) => s.name !== n) ?? null);
    setDirty(true);
  };

  const save = async () => {
    if (!skills) return;
    setSaving(true);
    setError(null);
    try {
      setSkills(await candidateApi.saveSkills(skills));
      setDirty(false);
      toast('Đã lưu kỹ năng. Mức độ phù hợp với các tin tuyển dụng đã được cập nhật.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!skills) return <Spinner />;

  return (
    <div>
      {skills.length === 0 ? (
        <p className="text-sm text-slate-500">Chưa có kỹ năng nào. Thêm kỹ năng để xem mức độ phù hợp với từng tin tuyển dụng.</p>
      ) : (
        <ul className="flex flex-wrap gap-2" data-testid="skill-list">
          {skills.map((s) => (
            <li key={s.name} className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-full border border-slate-300 bg-slate-50 text-sm">
              <span className="font-medium text-slate-800">{s.name}</span>
              <span className="text-xs text-slate-500">
                {s.yearsExperience ?? 0} năm{s.proficiency ? ` · ${PROFICIENCY[s.proficiency] ?? s.proficiency}` : ''}
              </span>
              <button onClick={() => remove(s.name)} aria-label={`Xóa ${s.name}`} className="p-0.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50">
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="mt-4 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[180px]">
          <label htmlFor="skill-name" className="text-xs font-medium text-slate-600">
            Kỹ năng
          </label>
          <input id="skill-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Java, ReactJS, Docker" className={`${inputCls} mt-1`} />
        </div>
        <div className="w-24">
          <label htmlFor="skill-years" className="text-xs font-medium text-slate-600">
            Số năm
          </label>
          <input id="skill-years" type="number" min={0} max={40} value={years} onChange={(e) => setYears(e.target.value)} className={`${inputCls} mt-1`} />
        </div>
        <div className="w-36">
          <label htmlFor="skill-level" className="text-xs font-medium text-slate-600">
            Mức độ
          </label>
          <select id="skill-level" value={level} onChange={(e) => setLevel(e.target.value)} className={`${inputCls} mt-1`}>
            {Object.entries(PROFICIENCY).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={btnSecondary}>
          Thêm
        </button>
      </form>

      {error && (
        <div className="mt-3">
          <ErrorBox message={error} />
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <button onClick={save} disabled={!dirty || saving} className={btnPrimary}>
          {saving ? 'Đang lưu…' : 'Lưu kỹ năng'}
        </button>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ CVs

const CvManager: React.FC = () => {
  const toast = useToast();
  const [cvs, setCvs] = useState<CvItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    candidateApi
      .listCvs()
      .then(setCvs)
      .catch((e: Error) => {
        setCvs([]);
        setError(e.message);
      });

  useEffect(() => {
    void load();
  }, []);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await load();
      toast(success);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onFile = (f?: File) => {
    if (fileRef.current) fileRef.current.value = '';
    if (!f) return;
    const msg = validateCvFile(f);
    if (msg) return setError(msg);
    void run(() => candidateApi.uploadCv(f), `Đã tải lên ${f.name}`);
  };

  const view = async (cv: CvItem) => {
    try {
      await openCvFile(cv.id);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      {!cvs ? (
        <Spinner />
      ) : cvs.length === 0 ? (
        <p className="text-sm text-slate-500">Bạn chưa có CV nào. Tải CV lên để có thể ứng tuyển.</p>
      ) : (
        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-md" data-testid="cv-list">
          {cvs.map((cv) => (
            <li key={cv.id} className="flex flex-wrap items-center gap-3 p-3">
              <FileText className="w-8 h-8 text-red-500 shrink-0" />
              <div className="flex-1 min-w-[160px]">
                <p className="text-sm font-medium text-slate-900">
                  {cv.title || cv.fileName}
                  {cv.isDefault && <span className="ml-2 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-700">Mặc định</span>}
                </p>
                <p className="text-xs text-slate-500">
                  {cv.fileName}
                  {cv.fileSizeBytes ? ` · ${formatFileSize(cv.fileSizeBytes)}` : ''} · {formatDate(cv.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {cv.downloadable ? (
                  <button onClick={() => view(cv)} className="px-2.5 py-1.5 text-xs font-medium text-slate-700 rounded hover:bg-slate-100">
                    Xem
                  </button>
                ) : (
                  <span className="px-2.5 py-1.5 text-xs text-slate-400" title="CV mẫu từ dữ liệu demo, không có file thật">
                    Không có file
                  </span>
                )}
                {!cv.isDefault && (
                  <button
                    onClick={() => run(() => candidateApi.setDefaultCv(cv.id), 'Đã đặt CV mặc định')}
                    disabled={busy}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 rounded hover:bg-slate-100 inline-flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5" /> Đặt mặc định
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm(`Xóa CV "${cv.title || cv.fileName}"?`)) void run(() => candidateApi.deleteCv(cv.id), 'Đã xóa CV');
                  }}
                  disabled={busy}
                  aria-label={`Xóa CV ${cv.title || cv.fileName}`}
                  className="p-1.5 text-slate-400 rounded hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <div className="mt-3">
          <ErrorBox message={error} />
        </div>
      )}
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">PDF, DOC, DOCX · tối đa 5MB</p>
        <button onClick={() => fileRef.current?.click()} disabled={busy} className={btnSecondary}>
          <Upload className="w-4 h-4" /> {busy ? 'Đang xử lý…' : 'Tải CV lên'}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" data-testid="cv-upload-input" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ page

export const ProfilePage: React.FC = () => {
  const { isCandidate } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  usePageTitle(isCandidate ? 'Hồ sơ & CV' : 'Tài khoản');

  useEffect(() => {
    userApi.getMe().then(setProfile).catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    if (profile && location.hash) document.querySelector(location.hash)?.scrollIntoView();
  }, [profile, location.hash]);

  if (error)
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <ErrorBox message={error} />
      </div>
    );
  if (!profile) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={profile.fullName} url={profile.avatarUrl} size="w-16 h-16" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
          <p className="text-sm text-slate-500">
            {profile.email}
            {!isCandidate && profile.companyName ? ` · ${profile.companyName}` : ''}
          </p>
        </div>
        {isCandidate && (
          <Link to="/applications" className="ml-auto text-sm font-medium text-red-600 hover:underline">
            Việc đã ứng tuyển →
          </Link>
        )}
      </div>

      {isCandidate && (
        <Card id="cv" title="CV của tôi" description="CV mặc định sẽ được chọn sẵn khi bạn ứng tuyển.">
          <CvManager />
        </Card>
      )}
      {isCandidate && (
        <Card id="skills" title="Kỹ năng" description="Dùng để tính mức độ phù hợp giữa hồ sơ của bạn và kỹ năng yêu cầu của từng tin tuyển dụng.">
          <SkillsEditor />
        </Card>
      )}
      <Card id="info" title="Thông tin cá nhân">
        <ProfileForm profile={profile} onSaved={setProfile} candidate={isCandidate} />
      </Card>
    </div>
  );
};
