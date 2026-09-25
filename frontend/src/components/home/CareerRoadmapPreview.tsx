import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ArrowRight, 
  Layers,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MOCK_CAREER_ROADMAPS } from '../../data/mockData';

export const CareerRoadmapPreview: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [selectedRoadmapIdx, setSelectedRoadmapIdx] = useState(0);
  const currentRoadmap = MOCK_CAREER_ROADMAPS[selectedRoadmapIdx] || MOCK_CAREER_ROADMAPS[0];

  const tracks = [
    { title: t.roadmap.track1Title, duration: t.roadmap.track1Duration, match: '95%' },
    { title: t.roadmap.track2Title, duration: t.roadmap.track2Duration, match: '92%' },
    { title: t.roadmap.track3Title, duration: t.roadmap.track3Duration, match: '88%' }
  ];

  return (
    <section id="roadmap" className="scroll-mt-24 py-20 sm:py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold tracking-wide shadow-soft-xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.roadmap.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.roadmap.headline}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.roadmap.subtitle}
          </p>
        </div>

        {/* Interactive Track Selector (Clean 1-row layout) */}
        <div className="flex flex-wrap lg:flex-nowrap justify-center items-center gap-2.5 sm:gap-3 max-w-5xl mx-auto">
          {tracks.map((track, i) => (
            <button
              key={track.title}
              type="button"
              onClick={() => setSelectedRoadmapIdx(i)}
              className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs font-bold border transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95 whitespace-nowrap shrink-0 ${
                selectedRoadmapIdx === i
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-500 shadow-soft-md scale-[1.02]'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{track.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedRoadmapIdx === i ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {track.duration}
              </span>
            </button>
          ))}
        </div>

        {/* Roadmap Display Card */}
        <div className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-soft-xl dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] max-w-5xl mx-auto">
          
          {/* Header Info with Salary Trajectory */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-8 border-b border-slate-200/90 dark:border-slate-800 gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.roadmap.targetTitle.replace(/:+$/, '')}:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                  {isEn ? '+65% Income Growth' : '+65% Thu nhập'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {isEn && (currentRoadmap as any).targetRoleEn ? (currentRoadmap as any).targetRoleEn : currentRoadmap.targetRole}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Expected compensation: $2,800 - $3,800/mo • Market demand: Very High 🔥' : 'Mức lương dự kiến: 65 - 90 Triệu/tháng ($2,800 - $3,800) • Nhu cầu tuyển dụng: Rất cao 🔥'}
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft-xs">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.roadmap.readinessLabel.replace(/:+$/, '')}:</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{currentRoadmap.matchCurrent}% → {currentRoadmap.matchTarget}%</div>
                <div className="w-28 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1.5 ml-auto">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${currentRoadmap.matchTarget}%` }} />
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-soft-xs shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Stepper Timeline with Glowing Connecting Line */}
          <div className="py-8 space-y-6">
            {currentRoadmap.milestones.map((m, idx) => (
              <div key={m.step} className="flex items-start gap-4 sm:gap-6 group">
                
                {/* Step Indicator Column with gradient track */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black shadow-soft-sm transition-all duration-300 group-hover:scale-110 ${
                    m.status === 'completed'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                      : m.status === 'in-progress'
                      ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/80 shadow-[0_0_15px_rgba(6,182,212,0.35)] animate-pulse-subtle'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                  }`}>
                    {m.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-white" /> : `0${m.step}`}
                  </div>
                  {idx < currentRoadmap.milestones.length - 1 && (
                    <div className="w-0.5 h-16 bg-gradient-to-b from-emerald-500 via-teal-400 to-slate-200 dark:to-slate-800 my-1 group-hover:scale-y-105 transition-transform" />
                  )}
                </div>

                {/* Milestone Details */}
                <div className="flex-1 bg-white dark:bg-slate-800/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft-sm space-y-3.5 hover:border-emerald-400 dark:hover:border-emerald-500/60 hover:shadow-soft-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                        {isEn && (m as any).titleEn ? (m as any).titleEn : m.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                          : m.status === 'in-progress'
                          ? 'bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                        {m.status === 'completed' ? (isEn ? 'Completed' : 'Đã hoàn thành') : m.status === 'in-progress' ? (isEn ? 'In Progress' : 'Đang thực hiện') : (isEn ? 'Next Up' : 'Mục tiêu tới')}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {isEn ? ((m as any).estimatedHoursEn || m.estimatedHours.replace(/Giờ/gi, 'Hours')) : m.estimatedHours}
                    </span>
                  </div>

                  {/* Skills tags in this step */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.roadmap.skillsGoalLabel.replace(/:+$/, '')}:</span>
                    {m.skills.map((skill) => (
                      <span
                        key={skill}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                          m.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                            : m.status === 'in-progress'
                            ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Roadmap Bottom Action */}
          <div className="pt-6 border-t border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              {t.roadmap.disclaimer}
            </p>
            <button
              type="button"
              className="ai-gradient-btn px-6 py-3 rounded-xl text-xs font-bold shadow-soft flex items-center gap-2 cursor-pointer shrink-0 overflow-hidden relative active:scale-95 group"
            >
              <div className="shimmer-sweep" />
              <Sparkles className="w-4 h-4 text-emerald-200 group-hover:scale-125 transition-transform" />
              <span>{t.roadmap.btnCreateRoadmap}</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
