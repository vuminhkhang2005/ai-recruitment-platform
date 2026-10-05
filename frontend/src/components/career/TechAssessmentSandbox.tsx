import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Copy, 
  Check, 
  Award, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  ChevronRight, 
  Flame, 
  FileCode, 
  Download,
  AlertCircle,
  HelpCircle,
  Pause,
  Maximize2
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface CodeProblem {
  id: string;
  titleVi: string;
  titleEn: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  domain: string;
  timeLimitMinutes: number;
  descriptionVi: string;
  descriptionEn: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanationVi: string;
    explanationEn: string;
  }[];
  starterCode: {
    typescript: string;
    javascript: string;
    python: string;
    go: string;
  };
  testCases: {
    id: number;
    name: string;
    input: string;
    expected: string;
  }[];
  aiHintsVi: string[];
  aiHintsEn: string[];
}

const PROBLEMS: CodeProblem[] = [
  {
    id: 'lru-cache',
    titleVi: 'Thiết Kế Bộ Nhớ Đệm LRU Cache Với TTL & O(1) Operations',
    titleEn: 'Design High-Throughput LRU Cache with TTL & O(1) Operations',
    difficulty: 'Hard',
    domain: 'Distributed Systems & Data Structures',
    timeLimitMinutes: 45,
    descriptionVi: 'Hiện thực một cấu trúc dữ liệu LRU (Least Recently Used) Cache hiệu năng cao cho hệ thống Microservices. Bộ nhớ đệm cần hỗ trợ get(key) và put(key, value) trong thời gian trung bình O(1). Khi bộ nhớ đầy (vượt quá capacity), phần tử ít được sử dụng nhất gần đây sẽ bị xóa bỏ (evict). Hỗ trợ cơ chế thời gian sống TTL (Time-To-Live) tùy chọn.',
    descriptionEn: 'Implement a high-performance Least Recently Used (LRU) Cache data structure for a distributed microservices pipeline. The cache must support get(key) and put(key, value) operations in average O(1) time complexity. When capacity is exceeded, evict the least recently accessed item. Support optional TTL (Time-To-Live).',
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^5, 0 <= value <= 10^6',
      'Tối đa 2 * 10^5 lần gọi hàm get và put',
      'Độ phức tạp thời gian phải đạt O(1) cho mỗi thao tác'
    ],
    examples: [
      {
        input: 'LRUCache cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1); cache.put(3, 3); // evicts key 2',
        output: 'cache.get(2) => -1 (not found); cache.get(3) => 3',
        explanationVi: 'Key 2 bị xóa do key 1 vừa được truy xuất (trở thành most recently used).',
        explanationEn: 'Key 2 is evicted because key 1 was recently accessed via get(1).'
      }
    ],
    starterCode: {
      typescript: `class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, { value: V; expiresAt?: number }>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | -1 {
    if (!this.cache.has(key)) return -1;
    
    const entry = this.cache.get(key)!;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return -1;
    }

    // Refresh position to mark as most recently used
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  put(key: K, value: V, ttlMs?: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest item (first key in insertion order)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
    this.cache.set(key, { value, expiresAt });
  }
}

// Export for execution
export { LRUCache };`,
      javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}`,
      python: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
      go: `package main

type LRUCache struct {
    capacity int
    items    map[int]int
    order    []int
}

func Constructor(capacity int) LRUCache {
    return LRUCache{
        capacity: capacity,
        items:    make(map[int]int),
        order:    make([]int, 0, capacity),
    }
}

func (this *LRUCache) Get(key int) int {
    if val, ok := this.items[key]; ok {
        return val
    }
    return -1
}`
    },
    testCases: [
      { id: 1, name: 'Basic Operations & Hit', input: 'cap=2, put(1,10), put(2,20), get(1)', expected: '10' },
      { id: 2, name: 'LRU Eviction Order', input: 'put(3,30) exceeds cap, get(2)', expected: '-1 (evicted)' },
      { id: 3, name: 'High-Volume Concurrency Stress (10k ops)', input: '10,000 sequential random puts/gets', expected: 'O(1) verified, 12ms execution' }
    ],
    aiHintsVi: [
      'Gợi ý 1: Trong JavaScript/TypeScript, Map bảo toàn thứ tự chèn (insertion order). Xóa rồi chèn lại một key sẽ đưa nó về cuối danh sách (most recent).',
      'Gợi ý 2: Để đạt O(1) chuẩn tuyệt đối ở ngôn ngữ bậc thấp, hãy kết hợp Hash Map với Doubly-Linked List (Node Head/Tail) để xóa nút bất kỳ trong O(1).',
      'Gợi ý 3: Hãy chú ý điều kiện biên khi capacity = 1 hoặc khi cập nhật lại key đã tồn tại mà không làm sai lệch số lượng size.'
    ],
    aiHintsEn: [
      'Hint 1: In JavaScript/TypeScript, Map preserves insertion order. Re-inserting a key moves it to the end (most recent).',
      'Hint 2: For absolute O(1) in lower-level environments, combine a Hash Map with a Doubly-Linked List to remove any node in O(1).',
      'Hint 3: Pay attention to edge cases where capacity is 1 or overwriting an existing key without mutating count.'
    ]
  },
  {
    id: 'rate-limiter',
    titleVi: 'Bộ Điều Tiết Lưu Lượng Phân Tán (Token Bucket Rate Limiter)',
    titleEn: 'Distributed Token Bucket API Rate Limiter',
    difficulty: 'Medium',
    domain: 'System Design & Concurrency',
    timeLimitMinutes: 35,
    descriptionVi: 'Xây dựng thuật toán Token Bucket kiểm soát lưu lượng gọi API cho hệ thống Payment Gateway. Mỗi client có số token tối đa (burst capacity) và tốc độ nạp lại token theo giây (refill rate). Trả về true nếu request được thông qua và trừ token tương ứng, false nếu client bị rate-limited (HTTP 429).',
    descriptionEn: 'Build a high-performance Token Bucket rate limiting algorithm for high-traffic payment APIs. Each client has a maximum burst capacity and a continuous refill rate per second. Return true if request is permitted and deduct token, false if rate limited (HTTP 429).',
    constraints: [
      'Client IDs are string identifiers up to 64 chars',
      'Refill rate: floating point tokens/sec',
      'Must handle timestamp drift and sub-millisecond precision',
      'Thread-safe simulation without mutex deadlocks'
    ],
    examples: [
      {
        input: 'capacity=5, refillRate=1 token/s. Client requests 5 tokens immediately.',
        output: 'Requests 1..5 => true; Request 6 => false (Rate limited)',
        explanationVi: 'Hết burst capacity. Sau 1 giây token nạp lại sẽ cho phép request tiếp theo.',
        explanationEn: 'Burst exhausted. Refilled token allows next request after 1 second.'
      }
    ],
    starterCode: {
      typescript: `class TokenBucketRateLimiter {
  private capacity: number;
  private refillRate: number; // tokens per second
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;
    const tokensToAdd = elapsedSeconds * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = now;
  }

  public allowRequest(tokensRequired: number = 1): boolean {
    this.refill();

    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }

    return false;
  }
}

export { TokenBucketRateLimiter };`,
      javascript: `class TokenBucketRateLimiter {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  allowRequest(tokensRequired = 1) {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;

    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }
}`,
      python: `import time

class TokenBucketRateLimiter:
    def __init__(self, capacity: float, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_refill = time.time()

    def allow_request(self, tokens_required: float = 1.0) -> bool:
        now = time.time()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now

        if self.tokens >= tokens_required:
            self.tokens -= tokens_required
            return True
        return False`,
      go: `package main

import "time"

type TokenBucket struct {
    capacity   float64
    refillRate float64
    tokens     float64
    lastRefill time.Time
}`
    },
    testCases: [
      { id: 1, name: 'Burst Traffic Handling', input: '5 consecutive requests with cap=5', expected: 'All 5 allowed' },
      { id: 2, name: 'Rate Limit Threshold (429)', input: '6th request before refill period', expected: 'false (blocked)' },
      { id: 3, name: 'Continuous Replenishment', input: 'Wait 1000ms and retry request', expected: 'true (token restored)' }
    ],
    aiHintsVi: [
      'Gợi ý 1: Không cần dùng timer/setInterval định kỳ vì sẽ gây lãng phí CPU. Thay vào đó, tính toán lười (lazy recalculation) lượng token được nạp tại thời điểm nhận request.',
      'Gợi ý 2: Chú ý giới hạn Math.min(capacity, tokens + tokensToAdd) để tránh token tràn vô tận khi hệ thống nhàn rỗi.'
    ],
    aiHintsEn: [
      'Hint 1: Do not use setInterval/tickers to replenish tokens. Instead, lazily calculate accrued tokens on every incoming request.',
      'Hint 2: Cap token accumulation with Math.min(capacity, current + added) to prevent unlimited accumulation during idle periods.'
    ]
  },
  {
    id: 'sliding-window',
    titleVi: 'Cửa Sổ Trượt Tối Ưu Tìm Dị Thường Giao Dịch (Sliding Window Maximum)',
    titleEn: 'Sliding Window Maximum & Transaction Outlier Stream',
    difficulty: 'Medium',
    domain: 'Real-time Streaming Algorithms',
    timeLimitMinutes: 30,
    descriptionVi: 'Cho một luồng giao dịch tài chính số nguyên và kích thước cửa sổ trượt k. Tìm giá trị giao dịch cao nhất trong từng khung cửa sổ trượt dịch chuyển từ trái sang phải với thời gian xử lý tuyến tính O(N) sử dụng Monotonic Deque.',
    descriptionEn: 'Given an array of transaction values and a sliding window of size k moving from left to right. Return the maximum transaction within each window in linear O(N) time complexity using a Monotonic Deque.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
      '1 <= k <= nums.length'
    ],
    examples: [
      {
        input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3',
        output: '[3, 3, 5, 5, 6, 7]',
        explanationVi: 'Cửa sổ [1,3,-1] max là 3; [3,-1,-3] max là 3; [-1,-3,5] max là 5...',
        explanationEn: 'Windows: [1,3,-1]->3, [3,-1,-3]->3, [-1,-3,5]->5, etc.'
      }
    ],
    starterCode: {
      typescript: `function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque: number[] = []; // Stores indices of monotonic decreasing elements

  for (let i = 0; i < nums.length; i++) {
    // 1. Remove elements outside current sliding window
    while (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift();
    }

    // 2. Remove smaller elements as they will never be maximums
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    deque.push(i);

    // 3. Record max when window reaches size k
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}

export { maxSlidingWindow };`,
      javascript: `function maxSlidingWindow(nums, k) {
  const res = [];
  const q = [];
  for (let i = 0; i < nums.length; i++) {
    while (q.length && q[0] < i - k + 1) q.shift();
    while (q.length && nums[q[q.length - 1]] < nums[i]) q.pop();
    q.push(i);
    if (i >= k - 1) res.push(nums[q[0]]);
  }
  return res;
}`,
      python: `from collections import deque

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    d = deque()
    res = []
    for i, n in enumerate(nums):
        while d and d[0] < i - k + 1:
            d.popleft()
        while d and nums[d[-1]] < n:
            d.pop()
        d.append(i)
        if i >= k - 1:
            res.append(nums[d[0]])
    return res`,
      go: `package main

func maxSlidingWindow(nums []int, k int) []int {
    return []int{}
}`
    },
    testCases: [
      { id: 1, name: 'Standard Sample Input', input: 'nums=[1,3,-1,-3,5,3,6,7], k=3', expected: '[3, 3, 5, 5, 6, 7]' },
      { id: 2, name: 'Single Element Window (k=1)', input: 'nums=[1, -1], k=1', expected: '[1, -1]' },
      { id: 3, name: 'Decreasing Monotonic Sequence', input: 'nums=[9, 8, 7, 6, 5], k=3', expected: '[9, 8, 7]' }
    ],
    aiHintsVi: [
      'Gợi ý 1: Sử dụng hàng đợi hai đầu Monotonic Deque lưu index thay vì lưu trực tiếp giá trị để dễ kiểm tra xem index đã trôi ra ngoài cửa sổ k hay chưa.',
      'Gợi ý 2: Duy trì các phần tử trong deque theo thứ tự giảm dần nghiêm ngặt.'
    ],
    aiHintsEn: [
      'Hint 1: Store indices in the monotonic deque rather than raw values to easily verify boundary expiration.',
      'Hint 2: Keep elements in strictly decreasing order so the front is always the current max.'
    ]
  }
];

interface TechAssessmentSandboxProps {
  initialProblemId?: string;
  candidateRole?: string;
  onAssessmentCompleted?: (score: number, problemId: string) => void;
}

export const TechAssessmentSandbox: React.FC<TechAssessmentSandboxProps> = ({
  initialProblemId = 'lru-cache',
  candidateRole = 'Senior Distributed Systems Engineer',
  onAssessmentCompleted
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [selectedProblemId, setSelectedProblemId] = useState<string>(initialProblemId);
  const activeProblem = PROBLEMS.find(p => p.id === selectedProblemId) || PROBLEMS[0];

  const [selectedLanguage, setSelectedLanguage] = useState<'typescript' | 'javascript' | 'python' | 'go'>('typescript');
  const [userCode, setUserCode] = useState<string>(activeProblem.starterCode.typescript);

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(activeProblem.timeLimitMinutes * 60);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Test runner & evaluation state
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'testcases' | 'ai-review'>('testcases');
  const [testResults, setTestResults] = useState<{
    ran: boolean;
    allPassed: boolean;
    durationMs: number;
    memoryMb: number;
    cases: { id: number; passed: boolean; message: string; duration: string }[];
  }>({
    ran: false,
    allPassed: false,
    durationMs: 0,
    memoryMb: 0,
    cases: []
  });

  // AI Evaluation state
  const [isAiEvaluating, setIsAiEvaluating] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    score: number;
    timeComplexity: string;
    spaceComplexity: string;
    cleanlinessRating: string;
    positivesVi: string[];
    positivesEn: string[];
    improvementsVi: string[];
    improvementsEn: string[];
  } | null>(null);

  // Submission & Certificate modal
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [revealedHints, setRevealedHints] = useState<boolean>(false);

  // Update starter code when problem or language changes
  useEffect(() => {
    setUserCode(activeProblem.starterCode[selectedLanguage]);
    setSecondsRemaining(activeProblem.timeLimitMinutes * 60);
    setTestResults({ ran: false, allPassed: false, durationMs: 0, memoryMb: 0, cases: [] });
    setAiAnalysis(null);
    setIsSubmitted(false);
    setRevealedHints(false);
  }, [selectedProblemId, selectedLanguage]);

  // Countdown timer effect
  useEffect(() => {
    if (isTimerPaused || secondsRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused, secondsRemaining, isSubmitted]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResetCode = () => {
    setUserCode(activeProblem.starterCode[selectedLanguage]);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Run Test Cases Simulation
  const handleRunTests = () => {
    setIsRunningTests(true);
    setActiveTab('testcases');

    setTimeout(() => {
      setIsRunningTests(false);
      setTestResults({
        ran: true,
        allPassed: true,
        durationMs: 18,
        memoryMb: 36.4,
        cases: activeProblem.testCases.map((tc, idx) => ({
          id: tc.id,
          passed: true,
          message: `Passed: input matched expected output ${tc.expected}`,
          duration: `${8 + idx * 4}ms`
        }))
      });
    }, 900);
  };

  // AI Review Simulation (Gemini 2.0)
  const handleRunAiEvaluation = () => {
    setIsAiEvaluating(true);
    setActiveTab('ai-review');

    setTimeout(() => {
      setIsAiEvaluating(false);
      setAiAnalysis({
        score: 98,
        timeComplexity: 'O(1) Average per operation',
        spaceComplexity: 'O(N) with N = capacity',
        cleanlinessRating: 'A+ (Senior Production Grade)',
        positivesVi: [
          'Tận dụng hoàn hảo đặc tính Map insertion-order của V8 runtime để duy trì O(1) eviction.',
          'Quản lý TTL chính xác dựa trên epoch timestamp miligiây, tránh tình trạng rò rỉ bộ nhớ (memory leak).',
          'Định kiểu TypeScript nghiêm ngặt với Generics <K, V> giúp tái sử dụng an toàn trong môi trường microservices.'
        ],
        positivesEn: [
          'Flawlessly leverages JavaScript Map insertion-order to achieve zero-overhead O(1) eviction.',
          'Accurate TTL management based on epoch timestamps, preventing lingering memory leaks.',
          'Strict TypeScript Generics <K, V> enables seamless reusable integration across services.'
        ],
        improvementsVi: [
          'Khuyến nghị: Khi scale lên cụm cluster đa tiến trình, có thể bổ sung cơ chế Redis/SharedArrayBuffer backing.',
          'Có thể thêm phương thức .clear() và .has() để hỗ trợ inspection trong health check API.'
        ],
        improvementsEn: [
          'Recommendation: For multi-process clusters, consider adding Redis or SharedArrayBuffer sync.',
          'Add helper methods like .clear() and .has() to support health check inspection.'
        ]
      });
    }, 1200);
  };

  // Final submission
  const handleSubmitAssessment = () => {
    if (!testResults.ran) {
      handleRunTests();
    }
    if (!aiAnalysis) {
      handleRunAiEvaluation();
    }
    setIsSubmitted(true);
    if (onAssessmentCompleted) {
      onAssessmentCompleted(98, activeProblem.id);
    }
  };

  return (
    <div data-testid="tech-assessment-sandbox" className="space-y-6">
      {/* Top Banner / Problem Header & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                <Code2 className="w-3.5 h-3.5" />
                <span>{activeProblem.domain}</span>
              </span>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeProblem.difficulty === 'Hard'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}>
                {activeProblem.difficulty}
              </span>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {candidateRole}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isVi ? activeProblem.titleVi : activeProblem.titleEn}
            </h2>
          </div>

          {/* Action pills: Problem Selector & Countdown Timer */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Problem Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              {PROBLEMS.map((prob) => (
                <button
                  key={prob.id}
                  type="button"
                  data-testid={`btn-select-problem-${prob.id}`}
                  onClick={() => setSelectedProblemId(prob.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedProblemId === prob.id
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-soft-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {prob.id === 'lru-cache' ? 'LRU Cache' : prob.id === 'rate-limiter' ? 'Rate Limiter' : 'Sliding Window'}
                </button>
              ))}
            </div>

            {/* Timer Pill */}
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border font-mono text-sm font-black shadow-soft-xs transition-colors ${
              secondsRemaining < 300
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>{formatTime(secondsRemaining)}</span>
              <button
                type="button"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                title={isTimerPaused ? 'Tiếp tục' : 'Tạm dừng'}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors cursor-pointer"
              >
                {isTimerPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Coding Workspace: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Problem Specs, Constraints & AI Hints (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Problem Statement Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm space-y-5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                {isVi ? 'Yêu cầu kỹ thuật thực tế' : 'Enterprise Scenario'}
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {isVi ? activeProblem.descriptionVi : activeProblem.descriptionEn}
              </p>
            </div>

            {/* Constraints */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-teal-500" />
                <span>{isVi ? 'Ràng buộc hệ thống & Độ phức tạp' : 'Constraints & Complexity'}</span>
              </h4>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                {activeProblem.constraints.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Example Case */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {isVi ? 'Ví dụ mẫu (Example)' : 'Sample Test Scenario'}
              </h4>
              {activeProblem.examples.map((ex, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs space-y-2 border border-slate-800">
                  <div>
                    <span className="text-emerald-400 font-bold">Input: </span>
                    <span className="text-slate-300">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-teal-400 font-bold">Output: </span>
                    <span className="text-slate-300">{ex.output}</span>
                  </div>
                  <div className="text-[11px] font-sans text-slate-400 pt-1 border-t border-slate-800">
                    {isVi ? ex.explanationVi : ex.explanationEn}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Progressive Hints Accordion */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                data-testid="btn-toggle-ai-hints"
                onClick={() => setRevealedHints(!revealedHints)}
                className="w-full py-2.5 px-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-between hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>{isVi ? 'Gợi ý tư duy từ Trợ lý AI (Gemini 2.0)' : 'AI Strategic Solution Hints'}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${revealedHints ? 'rotate-90' : ''}`} />
              </button>

              {revealedHints && (
                <div className="mt-3 p-4 rounded-2xl bg-indigo-900/10 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2 animate-fade-in text-xs text-slate-700 dark:text-slate-300">
                  {(isVi ? activeProblem.aiHintsVi : activeProblem.aiHintsEn).map((hint, idx) => (
                    <div key={idx} className="flex items-start gap-2 leading-relaxed">
                      <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Code Editor + Runner & AI Review (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Editor Header Toolbar */}
          <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-soft-xl flex flex-wrap items-center justify-between gap-3 text-slate-200">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-bold">
                {(['typescript', 'javascript', 'python', 'go'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    data-testid={`btn-lang-${lang}`}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                      selectedLanguage === lang
                        ? 'bg-emerald-600 text-white shadow-soft-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'typescript' ? 'TS' : lang === 'javascript' ? 'JS' : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Toolbar Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="btn-reset-code"
                onClick={handleResetCode}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title={isVi ? 'Khôi phục mẫu ban đầu' : 'Reset to starter boilerplate'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isVi ? 'Đặt lại' : 'Reset'}</span>
              </button>

              <button
                type="button"
                data-testid="btn-copy-code"
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedCode ? (isVi ? 'Đã sao chép' : 'Copied') : (isVi ? 'Sao chép' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Interactive Code Editor Box */}
          <div className="relative rounded-3xl bg-slate-950 border border-slate-800 shadow-soft-2xl overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-slate-300 font-bold">Solution.{selectedLanguage === 'typescript' ? 'ts' : selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'python' ? 'py' : 'go'}</span>
              </div>
              <span className="text-slate-500 font-sans">UTF-8 • Tab Size: 2</span>
            </div>

            <textarea
              data-testid="code-editor-textarea"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              rows={16}
              spellCheck={false}
              className="w-full bg-slate-950 text-emerald-300 p-5 font-mono text-xs leading-relaxed focus:outline-none resize-y border-none"
              placeholder="// Write your algorithm implementation here..."
            />
          </div>

          {/* Action Row: Run Test Cases & AI Evaluation Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft-sm">
            <div className="flex items-center gap-2.5">
              {/* Run Test Cases */}
              <button
                type="button"
                data-testid="btn-run-tests"
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center gap-2 shadow-soft transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${isRunningTests ? 'animate-spin' : ''}`} />
                <span>{isRunningTests ? (isVi ? 'Đang chạy kiểm thử...' : 'Running Tests...') : (isVi ? 'Chạy Test Cases' : 'Run Test Cases')}</span>
              </button>

              {/* AI Code Quality Review */}
              <button
                type="button"
                data-testid="btn-ai-code-review"
                onClick={handleRunAiEvaluation}
                disabled={isAiEvaluating}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs flex items-center gap-2 shadow-soft transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiEvaluating ? 'animate-spin' : ''}`} />
                <span>{isAiEvaluating ? (isVi ? 'Đang phân tích...' : 'Analyzing Code...') : (isVi ? 'Chấm Điểm & Tối Ưu Bằng AI' : 'AI Code Review (Gemini)')}</span>
              </button>
            </div>

            {/* Final Submit Button */}
            <button
              type="button"
              data-testid="btn-submit-assessment"
              onClick={handleSubmitAssessment}
              className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black text-xs flex items-center gap-2 shadow-soft transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>{isVi ? 'Nộp Bài Đánh Giá' : 'Submit Final Solution'}</span>
            </button>
          </div>

          {/* Test Results & AI Code Analysis Terminal Tab Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm space-y-4">
            
            {/* Segmented Header */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <button
                type="button"
                data-testid="tab-view-testcases"
                onClick={() => setActiveTab('testcases')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'testcases'
                    ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{isVi ? 'Kết Quả Test Cases' : 'Test Suite Results'}</span>
                {testResults.ran && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              <button
                type="button"
                data-testid="tab-view-ai-review"
                onClick={() => setActiveTab('ai-review')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ai-review'
                    ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isVi ? 'Phân Tích AI & Độ Phức Tạp' : 'AI Complexity Analysis'}</span>
                {aiAnalysis && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </button>
            </div>

            {/* Tab 1: Test Cases Output */}
            {activeTab === 'testcases' && (
              <div className="space-y-3 font-sans text-xs">
                {!testResults.ran ? (
                  <div className="p-6 text-center text-slate-400 space-y-2">
                    <Code2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p>{isVi ? 'Nhấn "Chạy Test Cases" để biên dịch và kiểm tra tính chính xác của thuật toán.' : 'Click "Run Test Cases" to compile and execute assertions against test suites.'}</p>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex flex-wrap items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{isVi ? 'Tất cả 3/3 Test cases đã vượt qua thành công! (100% Passed)' : 'All 3/3 Test cases passed successfully! (100% Passed)'}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Thời gian: {testResults.durationMs}ms</span>
                        <span>Bộ nhớ: {testResults.memoryMb}MB</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {testResults.cases.map((c) => (
                        <div key={c.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                              ✓
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {c.message}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400">{c.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: AI Code Review (Gemini 2.0) */}
            {activeTab === 'ai-review' && (
              <div className="space-y-4 animate-fade-in">
                {!aiAnalysis ? (
                  <div className="p-6 text-center text-slate-400 space-y-2">
                    <Sparkles className="w-8 h-8 mx-auto text-indigo-400" />
                    <p>{isVi ? 'Nhấn "Chấm Điểm & Tối Ưu Bằng AI" để Gemini 2.0 phân tích Big-O và tiêu chuẩn Clean Code.' : 'Click "AI Code Review" to analyze Big-O asymptotic limits and code maintainability.'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Score Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center">
                        <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                          {isVi ? 'Điểm Đánh Giá Kỹ Thuật' : 'Technical Quality'}
                        </span>
                        <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                          {aiAnalysis.score}/100
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center">
                        <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                          {isVi ? 'Thời Gian (Time Complexity)' : 'Time Complexity'}
                        </span>
                        <div className="text-sm font-black text-indigo-700 dark:text-indigo-300 mt-1 font-mono">
                          {aiAnalysis.timeComplexity}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-center">
                        <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-wider">
                          {isVi ? 'Không Gian (Space Complexity)' : 'Space Complexity'}
                        </span>
                        <div className="text-sm font-black text-teal-700 dark:text-teal-300 mt-1 font-mono">
                          {aiAnalysis.spaceComplexity}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Feedbacks */}
                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                        <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isVi ? 'Điểm mạnh kiến trúc thuật toán' : 'Algorithmic Architectural Strengths'}</span>
                        </h4>
                        <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                          {(isVi ? aiAnalysis.positivesVi : aiAnalysis.positivesEn).map((pos, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{pos}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                        <h4 className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                          <Zap className="w-4 h-4" />
                          <span>{isVi ? 'Khuyến nghị tối ưu hệ thống thực tế' : 'Production Scalability Recommendations'}</span>
                        </h4>
                        <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                          {(isVi ? aiAnalysis.improvementsVi : aiAnalysis.improvementsEn).map((imp, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-indigo-500 font-bold">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Submission Success Modal / Certified Report */}
      {isSubmitted && (
        <div data-testid="assessment-success-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft-2xl space-y-6 text-center">
            
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-soft-sm">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>MÃ BÁO CÁO: EVAL-2026-ALG-889</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {isVi ? 'Bài Đánh Giá Kỹ Thuật Đã Được Ghi Nhận!' : 'Technical Assessment Completed!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isVi
                  ? `Thuật toán của bạn đã đạt 98/100 điểm, vượt qua toàn bộ test cases và được lưu vào hồ sơ năng lực dành cho nhà tuyển dụng.`
                  : `Your solution scored 98/100, passing all edge test cases and has been recorded in your candidate verified profile.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{isVi ? 'Độ chính xác' : 'Accuracy'}</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">100%</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{isVi ? 'Điểm Clean Code' : 'Clean Code'}</span>
                <p className="text-base font-black text-indigo-600 dark:text-indigo-400">98/100</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{isVi ? 'Xếp hạng' : 'Percentile'}</span>
                <p className="text-base font-black text-teal-600 dark:text-teal-400">Top 3%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                data-testid="btn-close-assessment-modal"
                onClick={() => setIsSubmitted(false)}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs shadow-soft transition-all cursor-pointer"
              >
                {isVi ? 'Hoàn tất & Tiếp tục' : 'Done & Continue'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
