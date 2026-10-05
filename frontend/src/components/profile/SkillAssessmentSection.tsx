import React, { useState } from 'react';
import { 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  RotateCcw, 
  ShieldCheck, 
  Share2, 
  Download, 
  Cpu, 
  Code2, 
  Cloud, 
  Check, 
  X,
  Zap,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface Question {
  id: number;
  questionVi: string;
  questionEn: string;
  codeSnippet?: string;
  optionsVi: string[];
  optionsEn: string[];
  correctIdx: number;
  explanationVi: string;
  explanationEn: string;
}

interface Track {
  id: string;
  titleVi: string;
  titleEn: string;
  icon: any;
  badgeColor: string;
  levelVi: string;
  levelEn: string;
  durationMinutes: number;
  questions: Question[];
}

const ASSESSMENT_TRACKS: Track[] = [
  {
    id: 'ai-deep-learning',
    titleVi: 'Kiến Trúc AI & LLM Chuyên Sâu',
    titleEn: 'AI & LLM Architecture Specialist',
    icon: Cpu,
    badgeColor: 'from-emerald-500 to-teal-600',
    levelVi: 'Chuyên gia (Senior)',
    levelEn: 'Senior / Specialist',
    durationMinutes: 10,
    questions: [
      {
        id: 1,
        questionVi: 'Trong cơ chế Multi-Head Self-Attention của kiến trúc Transformer, tại sao ma trận trọng số được chia thành nhiều attention heads?',
        questionEn: 'In Multi-Head Self-Attention of Transformer architecture, why are weights partitioned into multiple attention heads?',
        codeSnippet: `Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) * W_O`,
        optionsVi: [
          'Cho phép mô hình đồng thời chú ý đến thông tin từ các không gian biểu diễn (subspaces) khác nhau ở các vị trí khác nhau.',
          'Để giảm kích thước bộ nhớ GPU bằng cách bỏ qua ma trận Value (V).',
          'Nhằm tăng tốc độ huấn luyện bằng cách bỏ qua hàm Softmax ở các head phụ.',
          'Chuyển đổi bài toán tự động từ vector 1D sang tensor 3D.'
        ],
        optionsEn: [
          'Allows the model to jointly attend to information from different representation subspaces at different positions.',
          'Reduces GPU memory footprint by discarding the Value (V) weight matrix.',
          'Accelerates training by bypassing Softmax normalization on secondary heads.',
          'Automatically reshapes sequential 1D vectors into 3D convolutional tensors.'
        ],
        correctIdx: 0,
        explanationVi: 'Multi-Head Attention chiếu Q, K, V thành nhiều không gian biểu diễn con độc lập, giúp mô hình học được ngữ cảnh phong phú (cú pháp, ngữ nghĩa, quan hệ thực thể).',
        explanationEn: 'Multi-Head Attention projects Q, K, V into independent subspaces, enabling the model to capture multifaceted linguistic and semantic relationships simultaneously.'
      },
      {
        id: 2,
        questionVi: 'Kỹ thuật LoRA (Low-Rank Adaptation) tinh chỉnh mô hình ngôn ngữ lớn (LLM) bằng cơ chế nào sau đây?',
        questionEn: 'How does LoRA (Low-Rank Adaptation) efficiently fine-tune Large Language Models (LLMs)?',
        codeSnippet: `W_updated = W_frozen + (B * A) * (alpha / r)
where B in R^(d x r), A in R^(r x k), r << min(d, k)`,
        optionsVi: [
          'Đóng băng trọng số gốc W và xấp xỉ ma trận biến thiên Delta W bằng tích 2 ma trận hạng thấp (B x A).',
          'Loại bỏ 50% số lượng neuron ít kích hoạt nhất trong mô hình.',
          'Nén toàn bộ trọng số float32 xuống định dạng nhị phân 1-bit boolean.',
          'Chỉ cập nhật duy nhất lớp từ vựng (Vocabulary Embedding Layer).'
        ],
        optionsEn: [
          'Freezes pretrained weights and decomposes the delta weight update into two low-rank matrices (B x A).',
          'Prunes 50% of least active neurons across feed-forward blocks.',
          'Quantizes all float32 weights into 1-bit binary representation.',
          'Updates only the initial vocabulary token embedding layer.'
        ],
        correctIdx: 0,
        explanationVi: 'LoRA giữ nguyên trọng số ban đầu của mô hình và đưa vào cặp ma trận phân tích hạng thấp A và B với rank r << d, giúp tiết kiệm tới 90% VRAM khi fine-tuning.',
        explanationEn: 'LoRA freezes base weights and trains lightweight rank decomposition matrices A and B (r << d), slashing trainable parameters and memory by > 90%.'
      },
      {
        id: 3,
        questionVi: 'Khi triển khai hệ thống RAG (Retrieval-Augmented Generation) production, giải pháp nào giúp hạn chế tối đa ảo giác (hallucination)?',
        questionEn: 'In a production RAG pipeline, which architecture best minimizes hallucination on complex domain documents?',
        optionsVi: [
          'Kết hợp Hybrid Search (Dense Vector + BM25 Sparse) cùng Cross-Encoder Re-ranking và Contextual Compression.',
          'Tăng Temperature của LLM lên 1.8 để mô hình tự động bổ sung tri thức còn thiếu.',
          'Chia văn bản thành các chunk kích thước cực lớn (> 10,000 tokens) để tránh mất ngữ cảnh.',
          'Bỏ qua bước trích xuất embedding và chỉ tìm kiếm theo khớp chuỗi ký tự đơn giản.'
        ],
        optionsEn: [
          'Combining Hybrid Search (Dense Vectors + BM25 Sparse) with Cross-Encoder Re-ranking and Contextual Compression.',
          'Increasing LLM temperature to 1.8 to encourage creative knowledge synthesis.',
          'Using oversized text chunks (> 10,000 tokens) to bypass chunking boundaries.',
          'Bypassing semantic embeddings and relying purely on exact string regex matching.'
        ],
        correctIdx: 0,
        explanationVi: 'Hybrid Search kết hợp từ khóa chính xác và ngữ nghĩa vector, sau đó dùng Cross-Encoder để xếp hạng lại độ liên quan giúp cung cấp context chính xác nhất cho LLM.',
        explanationEn: 'Hybrid search couples semantic recall with lexical precision, while Cross-Encoder reranking ensures the most salient context is provided to the generation LLM.'
      }
    ]
  },
  {
    id: 'react-frontend',
    titleVi: 'React 19 & Kiến Trúc Frontend',
    titleEn: 'React 19 & Frontend Architecture',
    icon: Code2,
    badgeColor: 'from-indigo-500 to-cyan-600',
    levelVi: 'Nâng cao (Advanced)',
    levelEn: 'Advanced',
    durationMinutes: 10,
    questions: [
      {
        id: 1,
        questionVi: 'Trong React 19, hook "useActionState" được thiết kế nhằm mục đích chính nào?',
        questionEn: 'In React 19, what is the primary purpose of the "useActionState" hook?',
        codeSnippet: `const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
  const result = await updateProfileApi(formData);
  return result;
}, initialState);`,
        optionsVi: [
          'Quản lý trạng thái form bất đồng bộ, tự động xử lý pending state và kết quả trả về từ Server/Async Actions.',
          'Thay thế hoàn toàn Redux và Zustand cho mọi tác vụ lưu trữ client toàn cục.',
          'Bắt buộc trình duyệt render lại toàn bộ DOM sau mỗi ký tự nhập vào input.',
          'Biến đổi các component Client thành Server Component tĩnh.'
        ],
        optionsEn: [
          'Manages asynchronous form actions, automatically handling pending states and return values from Server/Async actions.',
          'Completely replaces Redux and Zustand for global client-side caching.',
          'Forces the browser to re-render the entire DOM tree on every keystroke.',
          'Transforms client components into static Server Components.'
        ],
        correctIdx: 0,
        explanationVi: 'useActionState giúp đơn giản hóa việc xử lý Form Actions, theo dõi tự động trạng thái isPending và kết quả trả về mà không cần quản lý thủ công nhiều useState.',
        explanationEn: 'useActionState simplifies async form mutations by coordinating pending states, optimistic values, and response state natively.'
      },
      {
        id: 2,
        questionVi: 'Cơ chế Concurrency (Đồng thời) trong React hoạt động theo nguyên lý nào để không làm đơ giao diện người dùng?',
        questionEn: 'How does Concurrent React ensure the main UI thread remains responsive during intensive renders?',
        optionsVi: [
          'Phân mảnh quá trình render thành các khối nhỏ có thể tạm dừng (interruptible) và ưu tiên các tương tác khẩn cấp như click, gõ phím.',
          'Chạy toàn bộ mã React bên trong Service Worker ở luồng ngầm.',
          'Bỏ qua Virtual DOM và chỉnh sửa trực tiếp trên thẻ Canvas.',
          'Tự động vô hiệu hóa CSS animations trong lúc component đang render.'
        ],
        optionsEn: [
          'Breaks rendering into interruptible time slices, prioritizing urgent user interactions like clicks and keystrokes.',
          'Offloads the entire React reconciler into a background Service Worker thread.',
          'Bypasses Virtual DOM diffing to draw directly on HTML5 Canvas.',
          'Disables all CSS transitions and animations during reconciliations.'
        ],
        correctIdx: 0,
        explanationVi: 'Time-slicing trong React Concurrency cho phép trình duyệt ưu tiên xử lý các sự kiện người dùng (User input) ngay cả khi đang tính toán render cây component lớn.',
        explanationEn: 'Concurrent rendering segments work into interruptible units, yielding back to the browser event loop for urgent user inputs.'
      }
    ]
  }
];

export const SkillAssessmentSection: React.FC<{
  onBadgeEarned?: (badgeTitle: string, score: number) => void;
  onShowToast: (msg: string) => void;
}> = ({ onBadgeEarned, onShowToast }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [selectedTrack, setSelectedTrack] = useState<Track>(ASSESSMENT_TRACKS[0]);
  const [isAssessmentRunning, setIsAssessmentRunning] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Active Question
  const activeQuestion = selectedTrack.questions[currentQuestionIdx];

  const handleStartAssessment = (track: Track) => {
    setSelectedTrack(track);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setIsAssessmentRunning(true);
    onShowToast(
      isVi 
        ? `🚀 Bắt đầu bài đánh giá: ${track.titleVi} (${track.questions.length} câu hỏi)` 
        : `🚀 Starting assessment: ${track.titleEn}`
    );
  };

  const handleSelectOption = (optionIdx: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: optionIdx
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < selectedTrack.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Final submission & AI evaluation
      handleSubmitAssessment();
    }
  };

  const handleSubmitAssessment = () => {
    let correctCount = 0;
    selectedTrack.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIdx) {
        correctCount += 1;
      }
    });

    const computedScore = Math.round((correctCount / selectedTrack.questions.length) * 100);
    setScore(computedScore);
    setIsSubmitted(true);

    if (computedScore >= 80) {
      onBadgeEarned?.(selectedTrack.titleVi, computedScore);
      onShowToast(
        isVi 
          ? `🎉 Xuất sắc! Bạn đạt ${computedScore}% và nhận Chứng chỉ Xác thực Năng lực AI!` 
          : `🎉 Excellent! You achieved ${computedScore}% and earned a Verified AI Credential!`
      );
    } else {
      onShowToast(
        isVi 
          ? `Bạn đạt ${computedScore}%. Hãy xem lại giải thích chi tiết và thử lại nhé!` 
          : `Score: ${computedScore}%. Review the explanations and try again!`
      );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-soft-xs space-y-6" data-testid="skill-assessment-section">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-soft">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isVi ? 'Đánh Giá Năng Lực AI & Chứng Chỉ Kỹ Năng' : 'AI Skill Assessments & Digital Credentials'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                ATS Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isVi ? 'Bài test kỹ thuật thực chiến giúp tăng 3.5x tỷ lệ phản hồi từ Tech Lead & Nhà tuyển dụng' : 'Hands-on technical tests boosting recruiter response rate by 3.5x'}
            </p>
          </div>
        </div>

        {isAssessmentRunning && !isSubmitted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Câu {currentQuestionIdx + 1}/{selectedTrack.questions.length}</span>
          </div>
        )}
      </div>

      {/* Screen 1: Track Selection (When not running and not submitted) */}
      {!isAssessmentRunning && !isSubmitted && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ASSESSMENT_TRACKS.map(track => {
              const Icon = track.icon;
              return (
                <div
                  key={track.id}
                  data-testid={`assessment-card-${track.id}`}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/50 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-soft-2xs flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {isVi ? track.levelVi : track.levelEn}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {isVi ? track.titleVi : track.titleEn}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {track.questions.length} {isVi ? 'câu hỏi chuyên sâu' : 'in-depth questions'} • {track.durationMinutes} {isVi ? 'phút' : 'mins'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    data-testid={`btn-start-track-${track.id}`}
                    onClick={() => handleStartAssessment(track)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <span>{isVi ? 'Bắt đầu làm bài test' : 'Start Assessment'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Screen 2: Running Assessment */}
      {isAssessmentRunning && !isSubmitted && activeQuestion && (
        <div className="space-y-5 animate-fade-in" data-testid="assessment-runner">
          
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIdx + 1) / selectedTrack.questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
              {isVi ? activeQuestion.questionVi : activeQuestion.questionEn}
            </h4>

            {activeQuestion.codeSnippet && (
              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
                <pre>{activeQuestion.codeSnippet}</pre>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {(isVi ? activeQuestion.optionsVi : activeQuestion.optionsEn).map((opt, optIdx) => {
              const isSelected = userAnswers[activeQuestion.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  data-testid={`option-btn-${optIdx}`}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs font-medium transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold shadow-soft-2xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 ${
                    isSelected
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAssessmentRunning(false);
                onShowToast(isVi ? 'Đã hủy bài làm' : 'Cancelled assessment');
              }}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              {isVi ? 'Thoát' : 'Exit'}
            </button>

            <button
              type="button"
              data-testid="btn-next-question"
              disabled={userAnswers[activeQuestion.id] === undefined}
              onClick={handleNextQuestion}
              className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-soft flex items-center gap-1.5 transition-all ${
                userAnswers[activeQuestion.id] === undefined
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
                  : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer active:scale-95'
              }`}
            >
              <span>{currentQuestionIdx < selectedTrack.questions.length - 1 ? (isVi ? 'Câu tiếp theo' : 'Next Question') : (isVi ? 'Nộp bài & Chấm điểm' : 'Submit & Grade')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* Screen 3: Submission & Certificate Result */}
      {isSubmitted && (
        <div className="space-y-6 animate-fade-in" data-testid="assessment-result-card">
          
          {/* Certificate Badge Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 text-white shadow-soft-xl space-y-5 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-400/30">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                TalentBridge AI Certified Credential
              </span>
              <h3 className="text-xl font-black text-white">
                {isVi ? selectedTrack.titleVi : selectedTrack.titleEn}
              </h3>
              <p className="text-xs text-slate-300">
                {isVi ? 'Mã chứng chỉ số:' : 'Digital Credential ID:'} <span className="font-mono text-emerald-300 font-bold">TB-CERT-2026-AI98</span>
              </p>
            </div>

            <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div>
                <span className="text-[10px] text-slate-300 font-bold block">{isVi ? 'Điểm Đạt Được' : 'Score'}</span>
                <span className="text-2xl font-black text-emerald-400">{score}%</span>
              </div>
              <div className="h-7 w-px bg-white/20" />
              <div>
                <span className="text-[10px] text-slate-300 font-bold block">{isVi ? 'Xếp Hạng' : 'Percentile'}</span>
                <span className="text-sm font-black text-teal-300">Top 3% Talent</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                data-testid="btn-share-certificate"
                onClick={() => {
                  navigator.clipboard?.writeText?.(window.location.href);
                  onShowToast(isVi ? '✨ Đã sao chép liên kết chứng chỉ kỹ năng vào clipboard!' : '✨ Credential link copied!');
                }}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isVi ? 'Chia sẻ chứng chỉ' : 'Share Credential'}</span>
              </button>

              <button
                type="button"
                data-testid="btn-retake-assessment"
                onClick={() => {
                  setIsSubmitted(false);
                  setIsAssessmentRunning(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isVi ? 'Làm bài test khác' : 'Take Another Test'}</span>
              </button>
            </div>
          </div>

          {/* Question Review & Explanation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isVi ? 'Chi tiết đáp án & Phân tích từ AI' : 'Answers & AI Explanation'}
            </h4>

            {selectedTrack.questions.map((q, idx) => {
              const isCorrect = userAnswers[q.id] === q.correctIdx;
              return (
                <div 
                  key={q.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">Câu {idx + 1}: {isVi ? q.questionVi : q.questionEn}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {isCorrect ? 'Đúng (+100)' : 'Chưa chính xác'}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    💡 <strong className="font-semibold">Giải thích AI:</strong> {isVi ? q.explanationVi : q.explanationEn}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
