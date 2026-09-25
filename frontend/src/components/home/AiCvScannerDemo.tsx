import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MOCK_CV_SCAN_RESULT } from '../../data/mockData';

interface AiCvScannerDemoProps {
  onFindMatchingJobs?: () => void;
}

export const AiCvScannerDemo: React.FC<AiCvScannerDemoProps> = ({ onFindMatchingJobs }) => {
  const { t, language } = useLanguage();
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);
  const [scanStep, setScanStep] = useState(4);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'recommendations'>('overview');

  const startScanSimulation = () => {
    setScanning(true);
    setScanComplete(false);
    setScanStep(1);

    setTimeout(() => setScanStep(2), 700);
    setTimeout(() => setScanStep(3), 1400);
    setTimeout(() => {
      setScanStep(4);
      setScanning(false);
      setScanComplete(true);
    }, 2100);
  };

  return (
    <section id="ai-cv-scanner" className="scroll-mt-24 py-20 sm:py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold tracking-wide shadow-soft-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{t.scanner.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.scanner.headline}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.scanner.subtitle}
          </p>
        </div>

        {/* Interactive Workspace Container */}
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-9 shadow-soft-xl dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] border border-slate-200/90 dark:border-slate-800 max-w-5xl mx-auto relative overflow-hidden">
          
          {/* Upload Zone & Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pb-8 border-b border-slate-100 dark:border-slate-800">
            
            {/* Left: Drag & Drop Mock Zone with Laser Scan Animation when scanning */}
            <div 
              onClick={startScanSimulation}
              className={`md:col-span-7 border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group relative overflow-hidden ${
                scanning 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                  : 'border-emerald-300/80 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-emerald-50/30 dark:bg-slate-800/40 hover:bg-emerald-50/60 dark:hover:bg-slate-800/70'
              }`}
            >
              {scanning && <div className="laser-line animate-scan-laser opacity-95 pointer-events-none" />}
              
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-soft-sm flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <UploadCloud className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {t.scanner.dragDropText} <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-300 dark:decoration-emerald-500 font-extrabold">{t.scanner.browseFile}</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.scanner.fileLimitNote}</p>
              
              {/* Formats Pills */}
              <div className="mt-3 flex items-center justify-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">PDF</span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">DOCX</span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">TXT</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">Max 15MB</span>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.scanner.complianceNote}</span>
              </div>
            </div>

            {/* Right: Demo Trigger & Info */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/70 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.scanner.testingFileLabel.replace(/:+$/, '')}:</span>
                  <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">{t.scanner.sampleBadge}</span>
                </div>
                
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-soft-2xs">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="overflow-hidden flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{MOCK_CV_SCAN_RESULT.fileName}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400">{MOCK_CV_SCAN_RESULT.fileSize} • ATS v2.4</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={scanning}
                onClick={startScanSimulation}
                className="w-full py-3.5 ai-gradient-btn rounded-xl text-xs font-bold shadow-soft flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 overflow-hidden relative group"
              >
                <div className="shimmer-sweep" />
                {scanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>{t.scanner.btnScanning} ({scanStep}/4)...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-200 group-hover:scale-125 transition-transform" />
                    <span>{t.scanner.btnRescan}</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Scanning Progress Bar (Shows during scan) */}
          {scanning && (
            <div className="py-6 space-y-3 animate-fade-in">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>
                    {scanStep === 1 && t.scanner.step1}
                    {scanStep === 2 && t.scanner.step2}
                    {scanStep === 3 && t.scanner.step3}
                    {scanStep === 4 && t.scanner.step4}
                  </span>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">{scanStep * 25}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  style={{ width: `${scanStep * 25}%` }}
                />
              </div>
            </div>
          )}

          {/* Scan Results View */}
          {scanComplete && !scanning && (
            <div className="pt-6 space-y-6 animate-fade-in">
              
              {/* Result Summary Bar with Circular Radial SVG Dial */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-soft-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                
                {/* Score Dial */}
                <div className="md:col-span-4 flex items-center gap-4 relative z-10">
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                    <svg className="w-18 h-18 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.7)] transition-all duration-1000 ease-out"
                        strokeDasharray={`${MOCK_CV_SCAN_RESULT.overallScore}, 100`}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl sm:text-2xl font-black text-white leading-none tracking-tight">
                        {MOCK_CV_SCAN_RESULT.overallScore}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-400 mt-0.5">/100</span>
                    </div>
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      <span>{t.scanner.scoreTitle}</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-white">{t.scanner.scoreRating}</div>
                    <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">Top 5% ATS Benchmark</span>
                  </div>
                </div>

                {/* Candidate Overview & Mini Metrics */}
                <div className="md:col-span-5 text-xs space-y-2 text-slate-300 border-l border-slate-800/80 md:pl-5 relative z-10">
                  <div><span className="text-slate-400">{t.scanner.candidateNameLabel.replace(/:+$/, '')}:</span> <strong className="text-white text-sm ml-1">{MOCK_CV_SCAN_RESULT.candidateInfo.name}</strong></div>
                  <div><span className="text-slate-400">{t.scanner.candidateRoleLabel.replace(/:+$/, '')}:</span> <span className="text-slate-200 font-semibold ml-1">{language === 'vi' ? MOCK_CV_SCAN_RESULT.candidateInfo.currentRole : (MOCK_CV_SCAN_RESULT.candidateInfo.currentRoleEn || MOCK_CV_SCAN_RESULT.candidateInfo.currentRole)}</span></div>
                  
                  {/* 3 Sub-scores pill bar */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
                    <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
                      <div className="text-slate-400 truncate">{language === 'vi' ? 'Từ khóa JD' : 'Keywords'}</div>
                      <div className="font-bold text-emerald-400">95%</div>
                    </div>
                    <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
                      <div className="text-slate-400 truncate">{language === 'vi' ? 'Định dạng ATS' : 'Formatting'}</div>
                      <div className="font-bold text-teal-400">98%</div>
                    </div>
                    <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
                      <div className="text-slate-400 truncate">{language === 'vi' ? 'Đo lường' : 'Metrics'}</div>
                      <div className="font-bold text-cyan-400">88%</div>
                    </div>
                  </div>
                </div>

                {/* Action CTA in Bar */}
                <div className="md:col-span-3 text-right relative z-10">
                  <button
                    type="button"
                    onClick={onFindMatchingJobs}
                    className="w-full sm:w-auto px-4.5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2 overflow-hidden relative group"
                  >
                    <span>{t.scanner.btnMatchJobs}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>

              {/* Sub-tabs for Detailed Breakdown */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-extrabold shadow-soft-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{t.scanner.tabOverview}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveTab('skills')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'skills'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-extrabold shadow-soft-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.scanner.tabSkills}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px]">
                    {MOCK_CV_SCAN_RESULT.skillsDetected.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('recommendations')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'recommendations'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-extrabold shadow-soft-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.scanner.tabRecommendations}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px]">
                    {MOCK_CV_SCAN_RESULT.aiRecommendations.length}
                  </span>
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs pt-1 pb-2">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/80 space-y-3 hover:border-emerald-400 dark:hover:border-emerald-500/60 shadow-soft-xs transition-all flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-[13px] leading-snug">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{t.scanner.auditCard1Title}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                          {language === 'vi' ? 'Xuất sắc' : 'Excellent'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed pt-1">
                        {t.scanner.auditCard1Desc}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/80 space-y-3 hover:border-emerald-400 dark:hover:border-emerald-500/60 shadow-soft-xs transition-all flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-[13px] leading-snug">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{t.scanner.auditCard2Title}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                          {language === 'vi' ? 'Tối ưu' : 'Optimal'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed pt-1">
                        {t.scanner.auditCard2Desc}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/80 space-y-3 hover:border-amber-400 dark:hover:border-amber-500/60 shadow-soft-xs transition-all flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-[13px] leading-snug">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{t.scanner.auditCard3Title}</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                          {language === 'vi' ? 'Cần cải thiện' : 'Needs Work'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed pt-1">
                        {t.scanner.auditCard3Desc}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-3">
                  {MOCK_CV_SCAN_RESULT.skillsDetected.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs shadow-soft-xs hover:border-emerald-400/80 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-slate-800 dark:text-slate-100 font-bold">{skill.name}</strong>
                          <span className="text-slate-400 ml-2">({language === 'vi' ? skill.level : (skill.levelEn || skill.level)})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-36 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden hidden sm:block">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${skill.score}%` }} />
                        </div>
                        <span className="font-black text-emerald-700 dark:text-emerald-400 w-10 text-right">{skill.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-3 text-xs">
                  {MOCK_CV_SCAN_RESULT.aiRecommendations.map((rec, i) => (
                    <div key={i} className="p-4.5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3.5 shadow-soft-xs hover:border-emerald-400/70 transition-all">
                      <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          {language === 'vi' ? rec.text : (rec.textEn || rec.text)}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                        {language === 'vi' ? 'Gợi ý AI' : 'AI Tip'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </section>
  );
};
