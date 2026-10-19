import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  ArrowRight,
  RefreshCw,
  Cpu,
  ShieldCheck,
  User,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Plus,
} from 'lucide-react';
import { aiApi } from '../../lib/api';
import type { AiResumeParseResult, CvItem, ExtractedSkillItem, SkillItem } from '../../lib/types';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Modal, btnPrimary, btnSecondary, Spinner, ErrorBox } from '../ui/primitives';

interface AiResumeParserModalProps {
  onClose: () => void;
  onSkillsSynced?: (skills: SkillItem[]) => void;
  existingCvs?: CvItem[];
}

export const AiResumeParserModal: React.FC<AiResumeParserModalProps> = ({
  onClose,
  onSkillsSynced,
  existingCvs = [],
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const toast = useToast();

  const [inputMode, setInputMode] = useState<'upload' | 'text' | 'existing'>('upload');
  const [selectedCvId, setSelectedCvId] = useState<number | null>(
    existingCvs.length > 0 ? existingCvs[0].id : null
  );
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');

  const [parsing, setParsing] = useState(false);
  const [parseStep, setParseStep] = useState<string>('');
  const [result, setResult] = useState<AiResumeParseResult | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartParsing = async () => {
    setError(null);
    setParsing(true);
    setResult(null);

    try {
      setParseStep(isVi ? 'Đang đọc cấu trúc tài liệu CV...' : 'Reading CV document structure...');
      await new Promise((r) => setTimeout(r, 400));

      setParseStep(
        isVi
          ? 'Đang trích xuất học vấn, kinh nghiệm và kỹ năng bằng AI...'
          : 'Extracting education, experience & tech skills with AI...'
      );

      let parseRes: AiResumeParseResult;
      if (inputMode === 'upload' && file) {
        parseRes = await aiApi.parseCvFile(file);
      } else if (inputMode === 'existing' && selectedCvId) {
        parseRes = await aiApi.parseCvText('', selectedCvId);
      } else {
        if (!rawText.trim()) {
          throw new Error(
            isVi ? 'Vui lòng dán nội dung văn bản CV để phân tích.' : 'Please paste CV text to parse.'
          );
        }
        parseRes = await aiApi.parseCvText(rawText);
      }

      setParseStep(isVi ? 'Đang chuẩn hóa danh mục kỹ năng...' : 'Standardizing skill taxonomy...');
      await new Promise((r) => setTimeout(r, 300));

      setResult(parseRes);
      setSelectedSkills(new Set(parseRes.skills.map((s) => s.name)));
    } catch (err) {
      setError((err as Error).message || (isVi ? 'Lỗi bóc tách CV' : 'Failed to parse CV'));
    } finally {
      setParsing(false);
      setParseStep('');
    }
  };

  const toggleSkill = (skillName: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillName)) next.delete(skillName);
      else next.add(skillName);
      return next;
    });
  };

  const handleSyncSkills = async () => {
    if (!result) return;
    const skillsToSync: SkillItem[] = result.skills
      .filter((s) => selectedSkills.has(s.name))
      .map((s) => ({
        name: s.name,
        proficiency: s.proficiency,
        yearsExperience: s.yearsExperience,
      }));

    if (skillsToSync.length === 0) {
      setError(
        isVi
          ? 'Vui lòng chọn ít nhất 1 kỹ năng để đồng bộ vào hồ sơ.'
          : 'Please select at least 1 skill to sync.'
      );
      return;
    }

    setSyncing(true);
    setError(null);
    try {
      const updated = await aiApi.syncSkills(skillsToSync, replaceExisting);
      toast(
        isVi
          ? `Đã đồng bộ ${skillsToSync.length} kỹ năng vào hồ sơ thành công!`
          : `Successfully synced ${skillsToSync.length} skills to profile!`
      );
      onSkillsSynced?.(updated);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Modal
      title={isVi ? '✨ Bóc Tách CV Bằng AI (AI Resume Parser)' : '✨ AI Resume Parser & Skill Extractor'}
      onClose={onClose}
      wide
    >
      <div className="space-y-6" data-testid="ai-resume-parser-modal">
        {/* Intro Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-soft-xs">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {isVi
                ? 'Trí tuệ nhân tạo tự động đọc và chuẩn hóa hồ sơ ứng viên'
                : 'Intelligent Resume Parsing & Profile Auto-Sync'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              {isVi
                ? 'Hệ thống tự động phát hiện kỹ năng chuyên môn, số năm kinh nghiệm, học vấn và tính điểm chất lượng CV. Bạn có thể chọn và đồng bộ 1 chạm vào hồ sơ TalentBridge.'
                : 'Automatically extract technical skills, estimated experience, education and resume quality score, with 1-click sync to your TalentBridge candidate profile.'}
            </p>
          </div>
        </div>

        {/* Input Mode Selector */}
        {!result && !parsing && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  inputMode === 'upload'
                    ? 'bg-emerald-600 text-white shadow-soft-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                {isVi ? 'Tải tệp CV lên (PDF / DOCX)' : 'Upload CV File'}
              </button>

              {existingCvs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInputMode('existing')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    inputMode === 'existing'
                      ? 'bg-emerald-600 text-white shadow-soft-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                  {isVi ? `Chọn từ CV đã có (${existingCvs.length})` : `From My CVs (${existingCvs.length})`}
                </button>
              )}

              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  inputMode === 'text'
                    ? 'bg-emerald-600 text-white shadow-soft-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
                {isVi ? 'Dán văn bản CV' : 'Paste CV Text'}
              </button>
            </div>

            {/* Upload Area */}
            {inputMode === 'upload' && (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  id="ai-cv-file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="ai-cv-file" className="cursor-pointer block space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {file ? file.name : isVi ? 'Nhấn để chọn file CV hoặc kéo thả vào đây' : 'Click to select CV or drag & drop'}
                  </p>
                  <p className="text-xs text-slate-500">PDF, DOC, DOCX, TXT · {isVi ? 'Tối đa 5MB' : 'Max 5MB'}</p>
                </label>
              </div>
            )}

            {/* Existing CV Select */}
            {inputMode === 'existing' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {isVi ? 'Chọn CV cần bóc tách kỹ năng:' : 'Select CV to analyze:'}
                </label>
                <div className="grid gap-2">
                  {existingCvs.map((cv) => (
                    <label
                      key={cv.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedCvId === cv.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="existingCv"
                        checked={selectedCvId === cv.id}
                        onChange={() => setSelectedCvId(cv.id)}
                        className="accent-emerald-600"
                      />
                      <FileText className="w-4 h-4 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {cv.title || cv.fileName}
                        </p>
                        <p className="text-[11px] text-slate-400">{cv.fileName}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Text Area */}
            {inputMode === 'text' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {isVi ? 'Nội dung CV (họ tên, kỹ năng, kinh nghiệm):' : 'Raw CV Text (name, skills, experience):'}
                </label>
                <textarea
                  rows={6}
                  data-testid="ai-parse-raw-text"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={
                    isVi
                      ? 'Dán nội dung CV vào đây...\nVí dụ:\nNguyễn Văn A - Backend Developer\nKỹ năng: Java, Spring Boot, Docker, MySQL, Redis, RESTful API...\nKinh nghiệm: 3 năm phát triển hệ thống backend...'
                      : 'Paste CV text here...\ne.g. John Doe - Fullstack Engineer\nSkills: React, TypeScript, Node.js, PostgreSQL...'
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                data-testid="btn-run-ai-parser"
                disabled={inputMode === 'upload' && !file}
                onClick={handleStartParsing}
                className={btnPrimary}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isVi ? 'Bắt đầu bóc tách bằng AI' : 'Start AI Extraction'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Progress State */}
        {parsing && (
          <div className="py-10 text-center space-y-4" data-testid="ai-parsing-spinner">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {isVi ? 'AI đang phân tích hồ sơ...' : 'AI is parsing your resume...'}
              </p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
                {parseStep}
              </p>
            </div>
          </div>
        )}

        {/* Results Presentation */}
        {result && (
          <div className="space-y-5" data-testid="ai-parse-results">
            {/* Score & Profile Summary Header */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 shadow-soft-xs flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{result.fullName}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold">
                    {result.headline}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {result.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {result.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {result.city}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    {isVi ? 'Độ chuẩn hóa CV' : 'Resume Score'}
                  </span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {result.overallQualityScore}/100
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center font-black text-xs text-emerald-600 dark:text-emerald-400">
                  {result.overallQualityScore}%
                </div>
              </div>
            </div>

            {/* Extracted Skills Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  <span>
                    {isVi
                      ? `Kỹ năng phát hiện (${result.skills.length}) - Nhấn để chọn:`
                      : `Extracted Skills (${result.skills.length}) - Click to toggle:`}
                  </span>
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSkills(new Set(result.skills.map((s) => s.name)))}
                    className="text-[11px] font-bold text-emerald-600 hover:underline"
                  >
                    {isVi ? 'Chọn tất cả' : 'Select all'}
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSkills(new Set())}
                    className="text-[11px] font-bold text-slate-500 hover:underline"
                  >
                    {isVi ? 'Bỏ chọn' : 'Deselect all'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1" data-testid="extracted-skills-cloud">
                {result.skills.map((s) => {
                  const selected = selectedSkills.has(s.name);
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => toggleSkill(s.name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-soft-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      {selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{s.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                          selected
                            ? 'bg-emerald-700 text-emerald-100'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {s.yearsExperience} {isVi ? 'năm' : 'yr'} · {s.proficiency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extracted Experiences Preview */}
            {result.experiences.length > 0 && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                  <span>{isVi ? 'Kinh nghiệm phát hiện:' : 'Detected Experience:'}</span>
                </h4>
                {result.experiences.map((exp, idx) => (
                  <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 pl-3 border-l-2 border-emerald-500 py-1">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {exp.role} @ {exp.company} ({exp.period})
                    </p>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-500">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Sync Options & Buttons */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="accent-emerald-600 rounded"
                />
                <span>{isVi ? 'Ghi đè kỹ năng cũ (mặc định là bổ sung)' : 'Replace existing skills'}</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className={btnSecondary}
                >
                  {isVi ? 'Bóc tách lại' : 'Parse Another'}
                </button>
                <button
                  type="button"
                  data-testid="btn-sync-extracted-skills"
                  disabled={syncing || selectedSkills.size === 0}
                  onClick={handleSyncSkills}
                  className={btnPrimary}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {syncing
                      ? isVi ? 'Đang lưu...' : 'Syncing...'
                      : isVi
                      ? `Đồng bộ ${selectedSkills.size} kỹ năng vào hồ sơ`
                      : `Sync ${selectedSkills.size} skills to profile`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <ErrorBox message={error} />}
      </div>
    </Modal>
  );
};
