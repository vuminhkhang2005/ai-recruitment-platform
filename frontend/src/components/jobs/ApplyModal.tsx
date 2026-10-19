import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2, Cpu, FileText, Sparkles, Upload, Zap } from 'lucide-react';
import { aiApi, applicationApi, candidateApi } from '../../lib/api';
import type { AtsMatchAnalysis, CvItem, Job } from '../../lib/types';
import { formatDate, formatFileSize, formatSalary } from '../../lib/format';
import { ErrorBox, Modal, Spinner, btnPrimary, btnSecondary, inputCls } from '../ui/primitives';
import { useToast } from '../../context/ToastContext';
import { useMyApplications } from '../../context/MyApplicationsContext';
import { useLanguage } from '../../i18n/LanguageContext';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = '.pdf,.doc,.docx';

export function validateCvFile(file: File, lang: 'vi' | 'en' = 'vi'): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !['pdf', 'doc', 'docx'].includes(ext)) return lang === 'en' ? 'Only PDF, DOC or DOCX files are accepted.' : 'Chỉ nhận file PDF, DOC hoặc DOCX.';
  if (file.size > MAX_BYTES) return lang === 'en' ? 'CV files must be 5MB or smaller.' : 'File CV tối đa 5MB.';
  return null;
}

const TEXT = {
  vi: {
    errNoFile: 'Vui lòng chọn file CV để tải lên.',
    toastApplied: (title: string) => `Đã nộp hồ sơ vào vị trí ${title}`,
    modalTitle: (title: string) => `Ứng tuyển: ${title}`,
    cvLegend: 'CV ứng tuyển',
    uploaded: ' · Tải lên ',
    isDefault: ' · Mặc định',
    uploadNew: 'Tải CV mới từ máy (PDF, DOC, DOCX, tối đa 5MB)',
    chooseFile: 'Chọn file',
    coverLetter: 'Thư giới thiệu ',
    optional: '(không bắt buộc)',
    coverPlaceholder: 'Giới thiệu ngắn gọn về bản thân và lý do bạn phù hợp với vị trí này.',
    manageCvs: 'Quản lý CV',
    cancel: 'Hủy',
    submitting: 'Đang nộp…',
    submit: 'Nộp hồ sơ',
    generateAiCover: '✨ Sinh thư bằng AI',
    generating: 'Đang tạo thư...',
    toneLabel: 'Giọng điệu:',
    toneProfessional: 'Chuyên nghiệp',
    toneConfident: 'Tự tin',
    toneEnthusiastic: 'Nhiệt huyết',
    toneConcise: 'Ngắn gọn',
    atsScoreTitle: 'Độ phù hợp hồ sơ ATS:',
  },
  en: {
    errNoFile: 'Please choose a CV file to upload.',
    toastApplied: (title: string) => `Application submitted for ${title}`,
    modalTitle: (title: string) => `Apply: ${title}`,
    cvLegend: 'CV to submit',
    uploaded: ' · Uploaded ',
    isDefault: ' · Default',
    uploadNew: 'Upload a new CV from your device (PDF, DOC, DOCX, max 5MB)',
    chooseFile: 'Choose file',
    coverLetter: 'Cover letter ',
    optional: '(optional)',
    coverPlaceholder: 'Briefly introduce yourself and explain why you are a great fit for this role.',
    manageCvs: 'Manage CVs',
    cancel: 'Cancel',
    submitting: 'Submitting…',
    submit: 'Submit application',
    generateAiCover: '✨ Generate with AI',
    generating: 'Generating letter...',
    toneLabel: 'Tone:',
    toneProfessional: 'Professional',
    toneConfident: 'Confident',
    toneEnthusiastic: 'Enthusiastic',
    toneConcise: 'Concise',
    atsScoreTitle: 'ATS Profile Match:',
  },
};

export const ApplyModal: React.FC<{ job: Job; onClose: () => void; onApplied: () => void }> = ({ job, onClose, onApplied }) => {
  const toast = useToast();
  const { refresh } = useMyApplications();
  const { language } = useLanguage();
  const lang: 'vi' | 'en' = language === 'en' ? 'en' : 'vi';
  const t = TEXT[lang];
  const [cvs, setCvs] = useState<CvItem[] | null>(null);
  const [selected, setSelected] = useState<number | 'new' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [tone, setTone] = useState<'PROFESSIONAL' | 'CONFIDENT' | 'ENTHUSIASTIC' | 'CONCISE'>('PROFESSIONAL');
  const [generatingCover, setGeneratingCover] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState<AtsMatchAnalysis | null>(null);
  const [highlightedSkills, setHighlightedSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    candidateApi
      .listCvs()
      .then((list) => {
        setCvs(list);
        const def = list.find((c) => c.isDefault) ?? list[0];
        setSelected(def ? def.id : 'new');
      })
      .catch((e: Error) => {
        setCvs([]);
        setSelected('new');
        setError(e.message);
      });

    // Load ATS Match Analysis
    aiApi
      .matchAnalysis(job.id)
      .then(setAtsAnalysis)
      .catch(() => {});
  }, [job.id]);

  const handleGenerateCover = async () => {
    setGeneratingCover(true);
    setError(null);
    try {
      const res = await aiApi.generateCoverLetter(job.id, tone);
      setCoverLetter(res.coverLetter);
      setHighlightedSkills(res.highlightedSkills);
      toast(lang === 'en' ? 'AI Cover Letter generated!' : 'Đã tạo thư giới thiệu bằng AI thành công!');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGeneratingCover(false);
    }
  };

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    const msg = validateCvFile(f, lang);
    if (msg) {
      setError(msg);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
    setSelected('new');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (selected === 'new' && !file) {
      setError(t.errNoFile);
      return;
    }
    setSubmitting(true);
    try {
      let cvId = typeof selected === 'number' ? selected : null;
      if (selected === 'new' && file) {
        const uploaded = await candidateApi.uploadCv(file);
        cvId = uploaded.id;
      }
      await applicationApi.apply(job.id, cvId, coverLetter.trim());
      await refresh();
      toast(t.toastApplied(job.title));
      onApplied();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={t.modalTitle(job.title)} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {job.companyName} · {lang === 'en' ? formatSalary(job.salaryFormatted, 'en') : job.salaryFormatted}
        </p>

        <fieldset>
          <legend className="text-sm font-black text-slate-900 dark:text-white mb-2">{t.cvLegend}</legend>
          {cvs === null ? (
            <Spinner />
          ) : (
            <div className="space-y-2">
              {cvs.map((cv) => (
                <label
                  key={cv.id}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${selected === cv.id ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'}`}
                >
                  <input type="radio" name="cv" checked={selected === cv.id} onChange={() => setSelected(cv.id)} className="accent-emerald-600" />
                  <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-slate-900 truncate">{cv.title || cv.fileName}</span>
                    <span className="block text-xs text-slate-500">
                      {cv.fileName} {cv.fileSizeBytes ? `· ${formatFileSize(cv.fileSizeBytes)}` : ''}{t.uploaded}{formatDate(cv.createdAt, lang)}
                      {cv.isDefault ? t.isDefault : ''}
                    </span>
                  </span>
                </label>
              ))}
              <label
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${selected === 'new' ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'}`}
              >
                <input type="radio" name="cv" checked={selected === 'new'} onChange={() => setSelected('new')} className="accent-emerald-600" />
                <Upload className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="flex-1 text-sm">
                  {file ? (
                    <>
                      <span className="font-medium text-slate-900">{file.name}</span>
                      <span className="text-slate-500"> · {formatFileSize(file.size)}</span>
                    </>
                  ) : (
                    <span className="text-slate-700">{t.uploadNew}</span>
                  )}
                </span>
                <button type="button" onClick={() => fileRef.current?.click()} className={btnSecondary}>
                  {t.chooseFile}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  data-testid="apply-cv-file"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
              </label>
            </div>
          )}
        </fieldset>

        {atsAnalysis && (
          <div className="p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/80 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                {atsAnalysis.matchScore}%
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  {t.atsScoreTitle} <span className="uppercase text-indigo-700 dark:text-indigo-400 font-black">{atsAnalysis.matchRating}</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {lang === 'en'
                    ? `${atsAnalysis.matchedSkills.length} matched skills · ${atsAnalysis.missingSkills.length} missing`
                    : `${atsAnalysis.matchedSkills.length} kỹ năng khớp · ${atsAnalysis.missingSkills.length} kỹ năng còn thiếu`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {atsAnalysis.matchedSkills.slice(0, 3).map((sk) => (
                <span key={sk.name} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  ✓ {sk.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label htmlFor="cover" className="text-sm font-black text-slate-900 dark:text-white">
              {t.coverLetter}<span className="font-normal text-slate-500">{t.optional}</span>
            </label>
            <div className="flex items-center gap-1.5">
              <select
                aria-label={t.toneLabel}
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="PROFESSIONAL">{t.toneProfessional}</option>
                <option value="CONFIDENT">{t.toneConfident}</option>
                <option value="ENTHUSIASTIC">{t.toneEnthusiastic}</option>
                <option value="CONCISE">{t.toneConcise}</option>
              </select>
              <button
                type="button"
                onClick={handleGenerateCover}
                disabled={generatingCover}
                data-testid="btn-generate-ai-cover"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generatingCover ? 'animate-spin' : ''}`} />
                {generatingCover ? t.generating : t.generateAiCover}
              </button>
            </div>
          </div>
          {highlightedSkills.length > 0 && (
            <div className="mb-2 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-xs text-purple-800 dark:text-purple-300 flex items-center gap-1.5 flex-wrap">
              <span className="font-bold">{lang === 'en' ? 'Highlighted in letter:' : 'Đã nhấn mạnh trong thư:'}</span>
              {highlightedSkills.map((s) => (
                <span key={s} className="px-1.5 py-0.5 rounded bg-white dark:bg-purple-900/60 font-semibold border border-purple-200 dark:border-purple-800">
                  {s}
                </span>
              ))}
            </div>
          )}
          <textarea
            id="cover"
            rows={5}
            maxLength={2000}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder={t.coverPlaceholder}
            className={`${inputCls} mt-1`}
          />
          <p className="text-xs text-slate-400 text-right">{coverLetter.length}/2000</p>
        </div>

        {error && <ErrorBox message={error} />}

        <div className="flex items-center justify-between gap-3">
          <Link to="/profile" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            {t.manageCvs}
          </Link>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btnSecondary}>
              {t.cancel}
            </button>
            <button type="submit" disabled={submitting || cvs === null} className={btnPrimary}>
              {submitting ? t.submitting : t.submit}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
