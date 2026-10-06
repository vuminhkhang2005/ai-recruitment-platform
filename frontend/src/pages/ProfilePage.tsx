import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, Building2, CalendarCheck, FileCheck2, FileText, Gauge, Mail, MapPin, Star, Trash2, Upload, X } from 'lucide-react';
import { candidateApi, openCvFile, userApi } from '../lib/api';
import type { CvItem, SkillItem, UserProfile } from '../lib/types';
import { CITIES, formatDate, formatFileSize } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useMyApplications } from '../context/MyApplicationsContext';
import { useSavedJobs } from '../lib/savedJobs';
import { ErrorBox, PageLoader, Spinner, btnPrimary, btnSecondary, inputCls } from '../components/ui/primitives';
import { validateCvFile } from '../components/jobs/ApplyModal';
import { Avatar } from '../components/layout/Navbar';
import { usePageTitle } from '../lib/usePageTitle';

const Card: React.FC<{ id?: string; title: string; description?: string; children: React.ReactNode }> = ({ id, title, description, children }) => (
  <section id={id} className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-soft-xs scroll-mt-24">
    <h2 className="flex items-center gap-2.5 text-lg font-black text-slate-900 dark:text-white">
      <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
      {title}
    </h2>
    {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

const Field: React.FC<{ label: string; htmlFor: string; children: React.ReactNode; hint?: string }> = ({ label, htmlFor, children, hint }) => (
  <div>
    <label htmlFor={htmlFor} className="text-sm font-bold text-slate-700 dark:text-slate-200">
      {label}
    </label>
    <div className="mt-1.5">{children}</div>
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
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 sm:mt-7">
              <input type="checkbox" checked={form.isOpenToWork} onChange={(e) => setForm((f) => ({ ...f, isOpenToWork: e.target.checked }))} className="accent-emerald-600 w-4 h-4" />
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
            <li key={s.name} className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-xl border border-emerald-200/90 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-sm">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">{s.name}</span>
              <span className="text-xs text-slate-500">
                {s.yearsExperience ?? 0} năm{s.proficiency ? ` · ${PROFICIENCY[s.proficiency] ?? s.proficiency}` : ''}
              </span>
              <button onClick={() => remove(s.name)} aria-label={`Xóa ${s.name}`} className="p-0.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="mt-4 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[180px]">
          <label htmlFor="skill-name" className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Kỹ năng
          </label>
          <input id="skill-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Java, ReactJS, Docker" className={`${inputCls} mt-1`} />
        </div>
        <div className="w-24">
          <label htmlFor="skill-years" className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Số năm
          </label>
          <input id="skill-years" type="number" min={0} max={40} value={years} onChange={(e) => setYears(e.target.value)} className={`${inputCls} mt-1`} />
        </div>
        <div className="w-36">
          <label htmlFor="skill-level" className="text-xs font-bold text-slate-600 dark:text-slate-300">
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
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden" data-testid="cv-list">
          {cvs.map((cv) => (
            <li key={cv.id} className="flex flex-wrap items-center gap-3 p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-[160px]">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {cv.title || cv.fileName}
                  {cv.isDefault && <span className="ml-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">Mặc định</span>}
                </p>
                <p className="text-xs text-slate-500">
                  {cv.fileName}
                  {cv.fileSizeBytes ? ` · ${formatFileSize(cv.fileSizeBytes)}` : ''} · {formatDate(cv.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {cv.downloadable ? (
                  <button onClick={() => view(cv)} className="px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50">
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
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1"
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
                  className="p-1.5 text-slate-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
  const { applications } = useMyApplications();
  const { saved } = useSavedJobs();
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

  const interviews = applications.filter((a) => ['INTERVIEW', 'OFFERED', 'HIRED'].includes(a.currentStage)).length;
  const completenessFields = [profile.fullName, profile.phone, profile.headline, profile.city, profile.bio, profile.avatarUrl, profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl];
  const completeness = Math.round((completenessFields.filter(Boolean).length / completenessFields.length) * 100);
  const stats = isCandidate
    ? [
        { icon: FileCheck2, value: applications.length, label: 'Việc đã ứng tuyển', sub: 'Theo dõi trạng thái', to: '/applications', tone: 'bg-emerald-600 text-white' },
        { icon: CalendarCheck, value: interviews, label: 'Vào vòng phỏng vấn', sub: 'Phỏng vấn / offer / nhận việc', to: '/applications', tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300' },
        { icon: Bookmark, value: saved.length, label: 'Việc đã lưu', sub: 'Xem lại sau', to: '/saved-jobs', tone: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300' },
        { icon: Gauge, value: `${completeness}%`, label: 'Độ hoàn thiện hồ sơ', sub: 'Thông tin cá nhân & liên kết', to: '#info', tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-soft-sm">
        <div className="relative h-32 sm:h-44 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:14px_14px]" />
          {isCandidate && profile.isOpenToWork && (
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/40 backdrop-blur text-white text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              Đang tìm việc
            </span>
          )}
        </div>
        <div className="px-5 sm:px-8 pb-6">
          <div className="relative flex flex-col sm:flex-row sm:items-start gap-4 -mt-12 sm:-mt-14">
            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-[1.4rem] shadow-soft w-fit shrink-0">
              <Avatar name={profile.fullName} url={profile.avatarUrl} size="w-24 h-24 sm:w-28 sm:h-28 text-2xl rounded-2xl" />
            </div>
            <div className="min-w-0 flex-1 sm:pt-[4.25rem]">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{profile.fullName}</h1>
              {(profile.headline || profile.jobTitle) && (
                <p className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">{isCandidate ? profile.headline : profile.jobTitle}</p>
              )}
              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                {profile.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.city}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 min-w-0">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </span>
                {!isCandidate && profile.companyName && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {profile.companyName}
                  </span>
                )}
              </p>
            </div>
            {isCandidate && (
              <Link
                to="/applications"
                className="sm:self-end sm:mb-1 shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-soft-xs transition-colors"
              >
                Việc đã ứng tuyển →
              </Link>
            )}
          </div>

          {stats.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map((s) => (
                <Link
                  key={s.label}
                  to={s.to}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 flex items-center gap-3 transition-colors"
                >
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-black ${s.tone}`}>
                    <s.icon className="w-5 h-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-black text-slate-900 dark:text-white leading-tight">{s.value}</span>
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{s.label}</span>
                    <span className="block text-[11px] text-slate-400 truncate">{s.sub}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
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
