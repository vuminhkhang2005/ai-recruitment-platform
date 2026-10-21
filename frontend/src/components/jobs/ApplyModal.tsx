import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  FileCheck2,
  FileText,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Upload,
} from 'lucide-react';
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
    errNoFileForAi: 'Vui lòng chọn file CV từ máy trước để AI có thể đọc và đối chiếu với JD.',
    toastApplied: (title: string) => `Đã nộp hồ sơ vào vị trí ${title}`,
    modalTitle: (title: string) => `Ứng tuyển: ${title}`,
    cvLegend: '1. Chọn CV ứng tuyển',
    uploaded: ' · Tải lên ',
    isDefault: ' · Mặc định',
    uploadNew: 'Tải CV mới từ máy (PDF, DOC, DOCX, tối đa 5MB)',
    chooseFile: 'Chọn file',
    aiConsentTitle: 'Cho phép dùng AI phân tích mức độ phù hợp giữa CV và JD',
    aiConsentDesc:
      'Hệ thống AI sẽ lấy nội dung CV bạn chọn ở trên để đối chiếu trực tiếp với Bản mô tả công việc (JD) của nhà tuyển dụng và trả về báo cáo chi tiết cho bạn.',
    aiAnalyzing: 'AI đang đọc nội dung CV và đối chiếu từng tiêu chí với JD...',
    aiReanalyze: 'Phân tích lại',
    coverLetter: 'Thư giới thiệu ',
    optional: '(không bắt buộc)',
    coverPlaceholder: 'Giới thiệu ngắn gọn về bản thân và lý do bạn phù hợp với vị trí này.',
    manageCvs: 'Quản lý CV',
    cancel: 'Hủy',
    submitting: 'Đang nộp…',
    submit: 'Nộp hồ sơ ứng tuyển',
    generateAiCover: '✨ Sinh thư bằng AI',
    generating: 'Đang tạo thư...',
    toneLabel: 'Giọng điệu:',
    toneProfessional: 'Chuyên nghiệp',
    toneConfident: 'Tự tin',
    toneEnthusiastic: 'Nhiệt huyết',
    toneConcise: 'Ngắn gọn',
  },
  en: {
    errNoFile: 'Please choose a CV file to upload.',
    errNoFileForAi: 'Please choose a CV file from your device first so AI can compare it with the JD.',
    toastApplied: (title: string) => `Application submitted for ${title}`,
    modalTitle: (title: string) => `Apply: ${title}`,
    cvLegend: '1. Select CV to submit',
    uploaded: ' · Uploaded ',
    isDefault: ' · Default',
    uploadNew: 'Upload a new CV from your device (PDF, DOC, DOCX, max 5MB)',
    chooseFile: 'Choose file',
    aiConsentTitle: 'Allow AI to analyze compatibility between my selected CV and this JD',
    aiConsentDesc:
      'AI will extract your selected CV content, compare it directly against this Job Description (JD), and return a detailed matching report.',
    aiAnalyzing: 'AI is reading your CV and comparing it with the JD...',
    aiReanalyze: 'Re-analyze',
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
  },
};

export const ApplyModal: React.FC<{
  job: Job;
  onClose: () => void;
  onApplied: () => void;
  defaultEnableAi?: boolean;
}> = ({ job, onClose, onApplied, defaultEnableAi = false }) => {
  const toast = useToast();
  const { refresh } = useMyApplications();
  const { language } = useLanguage();
  const lang: 'vi' | 'en' = language === 'en' ? 'en' : 'vi';
  const t = TEXT[lang];
  const [cvs, setCvs] = useState<CvItem[] | null>(null);
  const [selected, setSelected] = useState<number | 'new' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [allowAiMatch, setAllowAiMatch] = useState<boolean>(defaultEnableAi);
  const [analyzingAi, setAnalyzingAi] = useState<boolean>(false);
  const [atsAnalysis, setAtsAnalysis] = useState<AtsMatchAnalysis | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [tone, setTone] = useState<'PROFESSIONAL' | 'CONFIDENT' | 'ENTHUSIASTIC' | 'CONCISE'>('PROFESSIONAL');
  const [generatingCover, setGeneratingCover] = useState(false);
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
  }, [job.id]);

  const runCvJdAnalysis = async (cvChoice: number | 'new' | null, uploadedFile: File | null) => {
    if (cvChoice === 'new' && !uploadedFile) {
      setAtsAnalysis(null);
      return;
    }
    setAnalyzingAi(true);
    setError(null);
    try {
      const cvIdParam = typeof cvChoice === 'number' ? cvChoice : null;
      const fileParam = cvChoice === 'new' ? uploadedFile : null;
      const res = await aiApi.matchAnalysis(job.id, cvIdParam, fileParam);
      setAtsAnalysis(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAnalyzingAi(false);
    }
  };

  // Trigger CV vs JD analysis ONLY when user opts in (`allowAiMatch === true`) and a valid CV is selected
  useEffect(() => {
    if (!allowAiMatch || selected === null) {
      if (!allowAiMatch) setAtsAnalysis(null);
      return;
    }
    if (selected === 'new' && !file) {
      setAtsAnalysis(null);
      return;
    }
    runCvJdAnalysis(selected, file);
  }, [allowAiMatch, selected, file, job.id]);

  const handleToggleAiMatch = (checked: boolean) => {
    setAllowAiMatch(checked);
    if (checked && selected === 'new' && !file) {
      setError(t.errNoFileForAi);
    } else {
      setError(null);
    }
  };

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
      await applicationApi.apply(job.id, cvId, coverLetter.trim(), {
        allowAiMatching: allowAiMatch,
        aiMatchScore: allowAiMatch && atsAnalysis ? atsAnalysis.matchScore : null,
      });
      await refresh();
      toast(t.toastApplied(job.title));
      onApplied();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCvLabel =
    selected === 'new'
      ? file
        ? file.name
        : lang === 'en'
        ? 'New uploaded CV'
        : 'CV tải lên mới'
      : cvs?.find((c) => c.id === selected)?.title ||
        cvs?.find((c) => c.id === selected)?.fileName ||
        'CV';

  return (
    <Modal title={t.modalTitle(job.title)} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {job.companyName} · {lang === 'en' ? formatSalary(job.salaryFormatted, 'en') : job.salaryFormatted}
        </p>

        {/* STEP 1: SELECT CV */}
        <fieldset>
          <legend className="text-sm font-black text-slate-900 dark:text-white mb-2">{t.cvLegend}</legend>
          {cvs === null ? (
            <Spinner />
          ) : (
            <div className="space-y-2">
              {cvs.map((cv) => (
                <label
                  key={cv.id}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                    selected === cv.id
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="cv"
                    checked={selected === cv.id}
                    onChange={() => setSelected(cv.id)}
                    className="accent-emerald-600"
                  />
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white truncate">
                      {cv.title || cv.fileName}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {cv.fileName} {cv.fileSizeBytes ? `· ${formatFileSize(cv.fileSizeBytes)}` : ''}
                      {t.uploaded}
                      {formatDate(cv.createdAt, lang)}
                      {cv.isDefault ? t.isDefault : ''}
                    </span>
                  </span>
                </label>
              ))}
              <label
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                  selected === 'new'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                }`}
              >
                <input
                  type="radio"
                  name="cv"
                  checked={selected === 'new'}
                  onChange={() => setSelected('new')}
                  className="accent-emerald-600"
                />
                <Upload className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="flex-1 text-sm">
                  {file ? (
                    <>
                      <span className="font-bold text-slate-900 dark:text-white">{file.name}</span>
                      <span className="text-slate-500"> · {formatFileSize(file.size)}</span>
                    </>
                  ) : (
                    <span className="text-slate-700 dark:text-slate-300">{t.uploadNew}</span>
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

        {/* STEP 2: TOPCV-STYLE OPT-IN AI CV vs JD MATCHING */}
        <div className="rounded-2xl border border-emerald-200/90 dark:border-emerald-800/70 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 p-4 transition-all">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowAiMatch}
              onChange={(e) => handleToggleAiMatch(e.target.checked)}
              data-testid="toggle-ai-cv-jd-match"
              className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  {t.aiConsentTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                  AI CV ↔ JD
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t.aiConsentDesc}</p>
            </div>
          </label>

          {/* If checked but user chose 'new' without picking a file yet */}
          {allowAiMatch && selected === 'new' && !file && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{t.errNoFileForAi}</span>
            </div>
          )}

          {/* Loading state while AI compares CV & JD */}
          {allowAiMatch && analyzingAi && (
            <div
              className="mt-4 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-3"
              data-testid="ai-cv-jd-loading"
            >
              <Spinner />
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{t.aiAnalyzing}</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  📄 {selectedCvLabel} ↔ 💼 {job.title}
                </p>
              </div>
            </div>
          )}

          {/* Detailed CV vs JD Analysis Report returned to the user */}
          {allowAiMatch && !analyzingAi && atsAnalysis && (
            <div
              className="mt-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/90 dark:border-emerald-800/70 p-4 space-y-4 shadow-soft-xs"
              data-testid="ai-cv-jd-report"
            >
              {/* Source comparison banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                    CV: {atsAnalysis.analyzedCvName || selectedCvLabel}
                  </span>
                  <span className="text-slate-400 font-black">↔</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-300">
                    JD: {job.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => runCvJdAnalysis(selected, file)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  {t.aiReanalyze}
                </button>
              </div>

              {/* Overall Score + 3 Pillar Sub-scores */}
              <div className="grid sm:grid-cols-[auto_1fr] gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-md shrink-0 ${
                      atsAnalysis.matchScore >= 80
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        : atsAnalysis.matchScore >= 60
                        ? 'bg-gradient-to-br from-teal-500 to-cyan-600'
                        : 'bg-gradient-to-br from-amber-500 to-orange-600'
                    }`}
                  >
                    <span className="text-xl leading-none">{atsAnalysis.matchScore}%</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-90 mt-0.5">Match</span>
                  </div>
                  <div className="sm:hidden">
                    <p className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">
                      {atsAnalysis.matchRating}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{atsAnalysis.summaryComment}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="hidden sm:flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{atsAnalysis.summaryComment}</p>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                      {atsAnalysis.matchRating}
                    </span>
                  </div>

                  {/* 3 Sub-score progress bars */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      {
                        label: lang === 'en' ? 'Skills vs JD' : 'Kỹ năng chuyên môn',
                        val: atsAnalysis.skillMatchScore ?? atsAnalysis.matchScore,
                      },
                      {
                        label: lang === 'en' ? 'Experience & Level' : 'Kinh nghiệm & Cấp bậc',
                        val: atsAnalysis.experienceMatchScore ?? atsAnalysis.matchScore,
                      },
                      {
                        label: lang === 'en' ? 'JD Keywords' : 'Từ khóa trong JD',
                        val: atsAnalysis.keywordMatchScore ?? atsAnalysis.matchScore,
                      },
                    ].map((bar) => (
                      <div
                        key={bar.label}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-600 dark:text-slate-400 truncate">{bar.label}</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{bar.val}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            style={{ width: `${bar.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Direct CV <-> JD Criteria Comparison Table */}
              {atsAnalysis.jdCriteriaComparison && atsAnalysis.jdCriteriaComparison.length > 0 && (
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-2 font-black text-slate-700 dark:text-slate-300">
                    <div className="col-span-3">{lang === 'en' ? 'Criterion' : 'Tiêu chí đối chiếu'}</div>
                    <div className="col-span-4">{lang === 'en' ? 'In Your CV' : 'Trong CV của bạn'}</div>
                    <div className="col-span-4">{lang === 'en' ? 'Required in JD' : 'Yêu cầu trong JD'}</div>
                    <div className="col-span-1 text-right">{lang === 'en' ? 'Fit' : 'Khớp'}</div>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {atsAnalysis.jdCriteriaComparison.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-12 px-3 py-2.5 items-center gap-2 bg-white dark:bg-slate-900">
                        <div className="col-span-3 font-bold text-slate-800 dark:text-slate-200">{row.criterion}</div>
                        <div className="col-span-4 text-slate-600 dark:text-slate-300">{row.cvValue}</div>
                        <div className="col-span-4 text-slate-600 dark:text-slate-300">{row.jdValue}</div>
                        <div className="col-span-1 flex justify-end">
                          {row.status === 'MATCH' ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              ~
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched vs Missing Skills from CV vs JD */}
              <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 p-3">
                  <p className="text-emerald-800 dark:text-emerald-300 font-bold mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {lang === 'en'
                      ? `Skills found in CV matching JD (${atsAnalysis.matchedSkills.length})`
                      : `Kỹ năng trong CV khớp với JD (${atsAnalysis.matchedSkills.length})`}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {atsAnalysis.matchedSkills.length > 0 ? (
                      atsAnalysis.matchedSkills.map((sk) => (
                        <span
                          key={sk.name}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        >
                          ✓ {sk.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">
                        {lang === 'en' ? 'No direct skill keywords detected yet' : 'Chưa phát hiện từ khóa kỹ năng trùng khớp'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 p-3">
                  <p className="text-amber-800 dark:text-amber-300 font-bold mb-1.5 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    {lang === 'en'
                      ? `JD skills missing in CV (${atsAnalysis.missingSkills.length})`
                      : `Kỹ năng JD yêu cầu nhưng CV còn thiếu (${atsAnalysis.missingSkills.length})`}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {atsAnalysis.missingSkills.length > 0 ? (
                      atsAnalysis.missingSkills.map((sk) => (
                        <span
                          key={sk.name}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        >
                          + {sk.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {lang === 'en' ? '✓ Your CV covers all required JD skills!' : '✓ CV của bạn đã bao phủ đủ kỹ năng JD yêu cầu!'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Recommendations for CV Optimization */}
              {atsAnalysis.preparationTips && atsAnalysis.preparationTips.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    {lang === 'en' ? 'AI Suggestions before submitting:' : 'Gợi ý tối ưu từ AI trước khi nộp hồ sơ:'}
                  </p>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {atsAnalysis.preparationTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* STEP 3: COVER LETTER */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label htmlFor="cover" className="text-sm font-black text-slate-900 dark:text-white">
              {t.coverLetter}
              <span className="font-normal text-slate-500">{t.optional}</span>
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
                <span
                  key={s}
                  className="px-1.5 py-0.5 rounded bg-white dark:bg-purple-900/60 font-semibold border border-purple-200 dark:border-purple-800"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <textarea
            id="cover"
            rows={4}
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
