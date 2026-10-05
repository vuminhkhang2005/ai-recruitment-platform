import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Activity, 
  Award, 
  X, 
  ChevronRight, 
  Copy, 
  Check, 
  Zap, 
  FileText,
  AlertCircle,
  TrendingUp,
  Radio
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface VoiceQuestion {
  id: string;
  category: 'Behavioral (STAR)' | 'System Architecture' | 'Technical Leadership';
  categoryVi: string;
  questionVi: string;
  questionEn: string;
  sampleTranscriptVi: string;
  sampleTranscriptEn: string;
}

const VOICE_QUESTIONS: VoiceQuestion[] = [
  {
    id: 'vq-1',
    category: 'Behavioral (STAR)',
    categoryVi: 'Hành vi (Mô hình STAR)',
    questionVi: 'Hãy mô tả một sự cố gián đoạn dịch vụ (production outage) nghiêm trọng mà bạn từng giải quyết. Bạn đã phối hợp xử lý và rút ra bài học gì?',
    questionEn: 'Describe a critical production outage you resolved. How did you coordinate the incident mitigation and what post-mortem lessons were learned?',
    sampleTranscriptVi: 'Trong đợt Mega Sale tại hệ thống thương mại điện tử, cụm Kafka broker bị nghẽn dẫn tới nghẽn hàng đợi đơn hàng. Tôi đã lập tức kích hoạt circuit breaker, tái phân vùng topic và scale consumer worker group, xử lý hoàn toàn backlog trong 8 phút mà không mất mát dữ liệu giao dịch.',
    sampleTranscriptEn: 'During a Mega Sale event, our Kafka cluster hit a partition imbalance causing an order queue backlog. I immediately tripped circuit breakers, rebalanced topics, and horizontally autoscaled consumer workers, clearing all backlogs within 8 minutes with zero transaction drop.'
  },
  {
    id: 'vq-2',
    category: 'System Architecture',
    categoryVi: 'Kiến trúc hệ thống',
    questionVi: 'Khi thiết kế một hệ thống xử lý 100,000 yêu cầu/giây với độ trễ dưới 20ms, bạn sẽ lựa chọn chiến lược bộ nhớ đệm (caching) và giải quyết cache stampede như thế nào?',
    questionEn: 'When designing a system handling 100,000 req/sec under 20ms latency, how would you architect multi-tier caching and prevent cache stampede?',
    sampleTranscriptVi: 'Tôi áp dụng chiến lược đa tầng: Local In-Memory Cache kết hợp Redis Cluster phân tán. Để ngăn ngừa Cache Stampede, tôi sử dụng Distributed Mutex Lock (Redlock) kết hợp Probabilistic Early Expiration (XFetch algorithm) để tái tạo cache trước khi key hết hạn.',
    sampleTranscriptEn: 'I implement multi-tier caching: Local in-memory cache backed by a distributed Redis cluster. To prevent cache stampede, I utilize distributed locks combined with probabilistic early expiration (XFetch) to refresh cached data asynchronously prior to TTL expiry.'
  }
];

interface AiVoiceInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  company?: string;
}

export const AiVoiceInterviewModal: React.FC<AiVoiceInterviewModalProps> = ({
  isOpen,
  onClose,
  jobTitle = 'Senior Fullstack Engineer',
  company = 'Công nghệ cao'
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const currentQuestion = VOICE_QUESTIONS[activeQuestionIdx] || VOICE_QUESTIONS[0];

  // Examiner audio synthesis simulation
  const [isPlayingExaminer, setIsPlayingExaminer] = useState<boolean>(false);

  // Recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Analysis results
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [voiceAnalysis, setVoiceAnalysis] = useState<{
    confidenceScore: number;
    pacingWpm: number;
    pacingRating: string;
    fillerWordsCount: number;
    starBreakdown: { situation: number; task: number; action: number; result: number };
    strengthsVi: string[];
    strengthsEn: string[];
    tipsVi: string[];
    tipsEn: string[];
  } | null>(null);

  // Recording timer
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play examiner question audio simulation
  const handlePlayExaminerVoice = () => {
    if (isPlayingExaminer) {
      setIsPlayingExaminer(false);
      return;
    }

    setIsPlayingExaminer(true);
    setTimeout(() => {
      setIsPlayingExaminer(false);
    }, 3500);
  };

  // Start voice answer recording
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setLiveTranscript('');
    setVoiceAnalysis(null);

    // Simulate streaming speech-to-text transcript
    const fullText = isVi ? currentQuestion.sampleTranscriptVi : currentQuestion.sampleTranscriptEn;
    const words = fullText.split(' ');
    let currentWordIdx = 0;

    const streamInterval = setInterval(() => {
      if (currentWordIdx < words.length) {
        setLiveTranscript(prev => (prev ? prev + ' ' : '') + words[currentWordIdx]);
        currentWordIdx++;
      } else {
        clearInterval(streamInterval);
      }
    }, 250);
  };

  // Stop recording & analyze voice speech
  const handleStopRecording = () => {
    setIsRecording(false);
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      setVoiceAnalysis({
        confidenceScore: 96,
        pacingWpm: 135,
        pacingRating: isVi ? 'Chuẩn mực & Điềm tĩnh (135 từ/phút)' : 'Optimal & Composed (135 wpm)',
        fillerWordsCount: 0,
        starBreakdown: {
          situation: 95,
          task: 92,
          action: 98,
          result: 94
        },
        strengthsVi: [
          'Phong thái đĩnh đạc, phát âm rõ ràng, nhịp độ thở và ngắt nghỉ tự nhiên.',
          'Cấu trúc STAR rất chặt chẽ: Phân bổ 60% thời lượng cho phần Action giải thích kỹ thuật.',
          'Số liệu chứng minh kết quả cụ thể (8 phút, zero transaction drop).'
        ],
        strengthsEn: [
          'Composed demeanor, crisp articulation, and natural cadence.',
          'Flawless STAR structure with 60% duration focused on high-leverage Action steps.',
          'Quantifiable impact metrics (8 minutes resolution, zero transaction drop).'
        ],
        tipsVi: [
          'Mẹo nâng cao: Bạn có thể bổ sung thêm 1 câu về giải pháp phòng ngừa dài hạn (Long-term architectural preventive measures) để gây ấn tượng cấp Staff/Principal.'
        ],
        tipsEn: [
          'Pro tip: Conclude with long-term architectural preventive measures to showcase Staff/Principal-level foresight.'
        ]
      });
    }, 1200);
  };

  const handleCopyTranscript = async () => {
    if (!liveTranscript) return;
    try {
      await navigator.clipboard.writeText(liveTranscript);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div 
      data-testid="ai-voice-interview-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200/90 dark:border-slate-800 shadow-soft-2xl flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isVi ? 'Phòng Luyện Phỏng Vấn Giọng Nói AI (Voice Studio)' : 'AI Voice Interview Simulation Studio'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  LIVE AUDIO
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {jobTitle} • {company} • {isVi ? 'Nhận diện giọng nói & Chấm điểm ngữ điệu tức thì' : 'Real-time speech-to-text & acoustic coaching'}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="btn-close-voice-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-7 space-y-6 text-xs">
          
          {/* Question Switcher Pills */}
          <div className="flex items-center gap-2">
            {VOICE_QUESTIONS.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                data-testid={`btn-select-voice-q-${idx}`}
                onClick={() => {
                  setActiveQuestionIdx(idx);
                  setIsRecording(false);
                  setVoiceAnalysis(null);
                  setLiveTranscript('');
                }}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeQuestionIdx === idx
                    ? 'bg-teal-600 text-white shadow-soft-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span>{isVi ? `Câu hỏi ${idx + 1}` : `Question ${idx + 1}`}</span>
                <span className="text-[10px] opacity-80">({q.category})</span>
              </button>
            ))}
          </div>

          {/* Examiner Question Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-850 text-white border border-slate-800 shadow-soft-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full bg-white/10 text-teal-300 text-[10px] font-black uppercase tracking-wider">
                {isVi ? currentQuestion.categoryVi : currentQuestion.category}
              </span>

              {/* Examiner Audio Playback Button */}
              <button
                type="button"
                data-testid="btn-play-examiner-voice"
                onClick={handlePlayExaminerVoice}
                className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                {isPlayingExaminer ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 animate-spin" />
                    <span>{isVi ? 'Đang đọc câu hỏi...' : 'Speaking...'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Nghe AI Đọc Câu Hỏi' : 'Listen to AI Examiner'}</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
              "{isVi ? currentQuestion.questionVi : currentQuestion.questionEn}"
            </p>
          </div>

          {/* Live Audio Visualizer & Voice Recording Controls */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-5 text-center">
            
            {/* Visualizer Waveforms */}
            <div className="flex items-center justify-center gap-1.5 h-16 py-2">
              {[40, 65, 85, 30, 95, 75, 45, 100, 60, 80, 50, 90, 35, 70, 55, 85].map((height, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isRecording
                      ? 'bg-gradient-to-t from-teal-500 to-emerald-400 animate-pulse'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                  style={{
                    height: isRecording ? `${Math.max(15, (height * (1 + (i % 3) * 0.2)) % 60)}px` : '12px'
                  }}
                />
              ))}
            </div>

            {/* Recording Status & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isRecording ? (
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono font-bold text-xs animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <span>{formatTimer(recordingSeconds)} / 02:30</span>
                  </div>

                  <button
                    type="button"
                    data-testid="btn-stop-voice-record"
                    onClick={handleStopRecording}
                    className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs flex items-center gap-2 shadow-soft transition-all cursor-pointer"
                  >
                    <MicOff className="w-4 h-4" />
                    <span>{isVi ? 'Dừng & Phân Tích Giọng Nói' : 'Stop & Analyze Speech'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  data-testid="btn-start-voice-record"
                  onClick={handleStartRecording}
                  disabled={isAnalyzing}
                  className="px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-black text-xs flex items-center gap-2.5 shadow-soft-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <Mic className="w-4 h-4 animate-bounce" />
                  <span>{isVi ? 'Bắt Đầu Ghi Âm Câu Trả Lời' : 'Start Voice Recording'}</span>
                </button>
              )}
            </div>

            {/* Live Speech-to-Text Transcription Box */}
            <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-left space-y-2 shadow-soft-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-teal-500" />
                  <span>{isVi ? 'Bản ghi âm lời nói trực tiếp (Speech-to-Text)' : 'Real-time Speech Transcription'}</span>
                </span>
                {liveTranscript && (
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? (isVi ? 'Đã sao chép' : 'Copied') : (isVi ? 'Sao chép' : 'Copy')}</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed min-h-[50px]">
                {liveTranscript || (
                  <span className="text-slate-400 italic">
                    {isVi ? 'Nhấn "Bắt Đầu Ghi Âm Câu Trả Lời" để nói qua microphone...' : 'Click "Start Voice Recording" and speak into your microphone...'}
                  </span>
                )}
              </p>
            </div>

          </div>

          {/* AI Voice & STAR Analysis Dashboard */}
          {voiceAnalysis && (
            <div 
              data-testid="voice-analysis-results"
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm space-y-5 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {isVi ? 'Báo Cáo Phân Tích Giọng Nói & Ngữ Điệu (Gemini 2.0)' : 'Acoustic & STAR Rubric Speech Intelligence'}
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {voiceAnalysis.confidenceScore}/100 {isVi ? 'Điểm Thuyết Phục' : 'Confidence'}
                </span>
              </div>

              {/* Acoustic Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase">{isVi ? 'Tốc độ nói' : 'Pacing'}</span>
                  <p className="text-base font-black text-teal-800 dark:text-teal-200 mt-0.5">{voiceAnalysis.pacingWpm} wpm</p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">{isVi ? 'Từ ngữ đệm' : 'Filler Words'}</span>
                  <p className="text-base font-black text-emerald-800 dark:text-emerald-200 mt-0.5">{voiceAnalysis.fillerWordsCount} từ (0%)</p>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold uppercase">{isVi ? 'Hành động (Action)' : 'Action Focus'}</span>
                  <p className="text-base font-black text-indigo-800 dark:text-indigo-200 mt-0.5">{voiceAnalysis.starBreakdown.action}%</p>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800">
                  <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold uppercase">{isVi ? 'Kết quả (Result)' : 'Result Impact'}</span>
                  <p className="text-base font-black text-cyan-800 dark:text-cyan-200 mt-0.5">{voiceAnalysis.starBreakdown.result}%</p>
                </div>
              </div>

              {/* Feedback Points */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <h5 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isVi ? 'Nhận xét điểm mạnh khi nói' : 'Spoken Communication Strengths'}</span>
                  </h5>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                    {(isVi ? voiceAnalysis.strengthsVi : voiceAnalysis.strengthsEn).map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1.5">
                  <h5 className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    <span>{isVi ? 'Gợi ý nâng cao phong thái lãnh đạo' : 'Executive Presence Coaching Tip'}</span>
                  </h5>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                    {(isVi ? voiceAnalysis.tipsVi : voiceAnalysis.tipsEn).map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
            >
              {isVi ? 'Đóng phòng Voice' : 'Close Studio'}
            </button>

            <button
              type="button"
              data-testid="btn-next-voice-question"
              onClick={() => {
                setActiveQuestionIdx((activeQuestionIdx + 1) % VOICE_QUESTIONS.length);
                setIsRecording(false);
                setVoiceAnalysis(null);
                setLiveTranscript('');
              }}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold flex items-center gap-1.5 shadow-soft cursor-pointer transition-all"
            >
              <span>{isVi ? 'Luyện Câu Hỏi Tiếp Theo' : 'Next Question'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
