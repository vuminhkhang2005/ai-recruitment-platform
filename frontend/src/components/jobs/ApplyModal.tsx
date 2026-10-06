import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload } from 'lucide-react';
import { applicationApi, candidateApi } from '../../lib/api';
import type { CvItem, Job } from '../../lib/types';
import { formatDate, formatFileSize } from '../../lib/format';
import { ErrorBox, Modal, Spinner, btnPrimary, btnSecondary, inputCls } from '../ui/primitives';
import { useToast } from '../../context/ToastContext';
import { useMyApplications } from '../../context/MyApplicationsContext';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = '.pdf,.doc,.docx';

export function validateCvFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !['pdf', 'doc', 'docx'].includes(ext)) return 'Chỉ nhận file PDF, DOC hoặc DOCX.';
  if (file.size > MAX_BYTES) return 'File CV tối đa 5MB.';
  return null;
}

export const ApplyModal: React.FC<{ job: Job; onClose: () => void; onApplied: () => void }> = ({ job, onClose, onApplied }) => {
  const toast = useToast();
  const { refresh } = useMyApplications();
  const [cvs, setCvs] = useState<CvItem[] | null>(null);
  const [selected, setSelected] = useState<number | 'new' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
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
  }, []);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    const msg = validateCvFile(f);
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
      setError('Vui lòng chọn file CV để tải lên.');
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
      toast(`Đã nộp hồ sơ vào vị trí ${job.title}`);
      onApplied();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Ứng tuyển: ${job.title}`} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {job.companyName} · {job.salaryFormatted}
        </p>

        <fieldset>
          <legend className="text-sm font-black text-slate-900 dark:text-white mb-2">CV ứng tuyển</legend>
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
                      {cv.fileName} {cv.fileSizeBytes ? `· ${formatFileSize(cv.fileSizeBytes)}` : ''} · Tải lên {formatDate(cv.createdAt)}
                      {cv.isDefault ? ' · Mặc định' : ''}
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
                    <span className="text-slate-700">Tải CV mới từ máy (PDF, DOC, DOCX, tối đa 5MB)</span>
                  )}
                </span>
                <button type="button" onClick={() => fileRef.current?.click()} className={btnSecondary}>
                  Chọn file
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

        <div>
          <label htmlFor="cover" className="text-sm font-black text-slate-900 dark:text-white">
            Thư giới thiệu <span className="font-normal text-slate-500">(không bắt buộc)</span>
          </label>
          <textarea
            id="cover"
            rows={5}
            maxLength={2000}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Giới thiệu ngắn gọn về bản thân và lý do bạn phù hợp với vị trí này."
            className={`${inputCls} mt-2`}
          />
          <p className="text-xs text-slate-400 text-right">{coverLetter.length}/2000</p>
        </div>

        {error && <ErrorBox message={error} />}

        <div className="flex items-center justify-between gap-3">
          <Link to="/profile" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            Quản lý CV
          </Link>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btnSecondary}>
              Hủy
            </button>
            <button type="submit" disabled={submitting || cvs === null} className={btnPrimary}>
              {submitting ? 'Đang nộp…' : 'Nộp hồ sơ'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
