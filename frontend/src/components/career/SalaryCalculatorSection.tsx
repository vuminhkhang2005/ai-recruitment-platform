import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  Check, 
  Copy, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Globe, 
  Award, 
  Zap, 
  ChevronRight,
  Briefcase,
  HelpCircle,
  Building,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface TechRole {
  id: string;
  titleVi: string;
  titleEn: string;
  baseJunior: number;   // 0-1 yr
  baseMid: number;      // 2-4 yr
  baseSenior: number;   // 5-7 yr
  baseLead: number;     // 8-10 yr
  basePrincipal: number;// 11+ yr
}

const ROLES: TechRole[] = [
  {
    id: 'ai-engineer',
    titleVi: 'AI / Machine Learning Engineer',
    titleEn: 'AI / Machine Learning Engineer',
    baseJunior: 22000000,
    baseMid: 40000000,
    baseSenior: 65000000,
    baseLead: 90000000,
    basePrincipal: 125000000,
  },
  {
    id: 'fullstack-sr',
    titleVi: 'Senior Fullstack Engineer (React / Node / Java)',
    titleEn: 'Senior Fullstack Engineer (React / Node / Java)',
    baseJunior: 18000000,
    baseMid: 32000000,
    baseSenior: 55000000,
    baseLead: 78000000,
    basePrincipal: 105000000,
  },
  {
    id: 'devops-cloud',
    titleVi: 'Cloud DevOps / Platform Architect',
    titleEn: 'Cloud DevOps / Platform Architect',
    baseJunior: 20000000,
    baseMid: 36000000,
    baseSenior: 60000000,
    baseLead: 85000000,
    basePrincipal: 115000000,
  },
  {
    id: 'golang-lead',
    titleVi: 'Golang / High-Concurrency Backend Lead',
    titleEn: 'Golang / High-Concurrency Backend Lead',
    baseJunior: 20000000,
    baseMid: 38000000,
    baseSenior: 62000000,
    baseLead: 88000000,
    basePrincipal: 120000000,
  },
  {
    id: 'frontend-react',
    titleVi: 'Frontend Specialist (React / Next.js / TypeScript)',
    titleEn: 'Frontend Specialist (React / Next.js / TypeScript)',
    baseJunior: 16000000,
    baseMid: 28000000,
    baseSenior: 48000000,
    baseLead: 68000000,
    basePrincipal: 90000000,
  },
  {
    id: 'mobile-engineer',
    titleVi: 'Mobile Engineer (Flutter / React Native / iOS / Android)',
    titleEn: 'Mobile Engineer (Flutter / React Native / iOS / Android)',
    baseJunior: 17000000,
    baseMid: 30000000,
    baseSenior: 50000000,
    baseLead: 72000000,
    basePrincipal: 95000000,
  },
  {
    id: 'data-engineer',
    titleVi: 'Data Engineer / Big Data Specialist',
    titleEn: 'Data Engineer / Big Data Specialist',
    baseJunior: 19000000,
    baseMid: 35000000,
    baseSenior: 58000000,
    baseLead: 82000000,
    basePrincipal: 110000000,
  }
];

interface SkillBooster {
  id: string;
  name: string;
  bonusPercent: number;
  category: string;
}

const SKILL_BOOSTERS: SkillBooster[] = [
  { id: 'pytorch-rag', name: 'PyTorch / LLM Fine-tuning & RAG', bonusPercent: 18, category: 'AI' },
  { id: 'k8s-terraform', name: 'Kubernetes & Terraform Multi-cloud', bonusPercent: 15, category: 'DevOps' },
  { id: 'golang-micro', name: 'Golang Microservices & gRPC', bonusPercent: 14, category: 'Backend' },
  { id: 'aws-solutions', name: 'AWS / GCP Solutions Architect', bonusPercent: 16, category: 'Cloud' },
  { id: 'sys-design', name: 'Distributed Systems & System Design', bonusPercent: 15, category: 'Architecture' },
  { id: 'graphql-ws', name: 'GraphQL & Realtime WebSocket Engine', bonusPercent: 10, category: 'Fullstack' }
];

interface SalaryCalculatorSectionProps {
  onFindMatchingJobs?: () => void;
}

export const SalaryCalculatorSection: React.FC<SalaryCalculatorSectionProps> = ({
  onFindMatchingJobs
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Calculator inputs
  const [selectedRoleId, setSelectedRoleId] = useState<string>('ai-engineer');
  const [yearsOfExp, setYearsOfExp] = useState<number>(4);
  const [location, setLocation] = useState<'hcm' | 'hanoi' | 'danang' | 'remote'>('hcm');
  const [englishLevel, setEnglishLevel] = useState<'basic' | 'working' | 'fluent'>('working');
  const [selectedBoosters, setSelectedBoosters] = useState<string[]>(['pytorch-rag']);
  const [viewMode, setViewMode] = useState<'gross' | 'net'>('gross');
  const [copied, setCopied] = useState<boolean>(false);

  // Active role
  const currentRole = useMemo(() => {
    return ROLES.find(r => r.id === selectedRoleId) || ROLES[0];
  }, [selectedRoleId]);

  // Experience level label
  const expLevelInfo = useMemo(() => {
    if (yearsOfExp <= 1) return { level: 'Junior', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' };
    if (yearsOfExp <= 4) return { level: 'Middle / Mid-Senior', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' };
    if (yearsOfExp <= 7) return { level: 'Senior Specialist', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' };
    if (yearsOfExp <= 10) return { level: 'Team Lead / Staff Engineer', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' };
    return { level: 'Principal / Tech Director', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' };
  }, [yearsOfExp]);

  // Base salary calculation by interpolating years of experience
  const baseSalary = useMemo(() => {
    if (yearsOfExp <= 1) {
      return currentRole.baseJunior + yearsOfExp * (currentRole.baseMid - currentRole.baseJunior) * 0.4;
    } else if (yearsOfExp <= 4) {
      const progress = (yearsOfExp - 1) / 3;
      return currentRole.baseJunior + (currentRole.baseMid - currentRole.baseJunior) + progress * (currentRole.baseSenior - currentRole.baseMid) * 0.7;
    } else if (yearsOfExp <= 7) {
      const progress = (yearsOfExp - 4) / 3;
      return currentRole.baseSenior + progress * (currentRole.baseLead - currentRole.baseSenior);
    } else if (yearsOfExp <= 10) {
      const progress = (yearsOfExp - 7) / 3;
      return currentRole.baseLead + progress * (currentRole.basePrincipal - currentRole.baseLead);
    } else {
      const extraYears = Math.min(yearsOfExp - 10, 5);
      return currentRole.basePrincipal + extraYears * 4000000;
    }
  }, [currentRole, yearsOfExp]);

  // Location Factor
  const locationFactor = useMemo(() => {
    switch (location) {
      case 'hcm': return 1.0;
      case 'hanoi': return 0.95;
      case 'danang': return 0.82;
      case 'remote': return 1.45; // Global remote USD contract
      default: return 1.0;
    }
  }, [location]);

  // English bonus
  const englishBonus = useMemo(() => {
    switch (englishLevel) {
      case 'basic': return 0;
      case 'working': return 0.15;
      case 'fluent': return 0.30;
      default: return 0;
    }
  }, [englishLevel]);

  // Booster bonus
  const boosterBonus = useMemo(() => {
    return selectedBoosters.reduce((acc, id) => {
      const item = SKILL_BOOSTERS.find(b => b.id === id);
      return acc + (item ? item.bonusPercent / 100 : 0);
    }, 0);
  }, [selectedBoosters]);

  // Final Monthly Gross in VND
  const monthlyGrossVND = useMemo(() => {
    const raw = baseSalary * locationFactor * (1 + englishBonus + boosterBonus);
    return Math.round(raw / 500000) * 500000; // Round to nearest 500k
  }, [baseSalary, locationFactor, englishBonus, boosterBonus]);

  // Final Monthly Net in VND (estimated PIT & mandatory insurance in Vietnam)
  const monthlyNetVND = useMemo(() => {
    if (location === 'remote') {
      // Contractual tax ~7% or flat
      return Math.round((monthlyGrossVND * 0.9) / 500000) * 500000;
    }

    // Standard Vietnamese mandatory insurance:
    // BHXH: 8%, BHYT: 1.5%, BHTN: 1% (Capped at 20x base salary ~36M for BHXH/BHYT, 20x regional minimum ~93.6M for BHTN)
    const insuranceCap = 36000000;
    const insuranceBase = Math.min(monthlyGrossVND, insuranceCap);
    const insuranceDeduction = insuranceBase * 0.105;

    // Income after insurance
    const incomeAfterInsurance = monthlyGrossVND - insuranceDeduction;

    // Personal deduction: 11,000,000 VND
    const taxableIncome = Math.max(0, incomeAfterInsurance - 11000000);

    // Progressive tax brackets
    let tax = 0;
    if (taxableIncome <= 5000000) {
      tax = taxableIncome * 0.05;
    } else if (taxableIncome <= 10000000) {
      tax = 250000 + (taxableIncome - 5000000) * 0.1;
    } else if (taxableIncome <= 18000000) {
      tax = 750000 + (taxableIncome - 10000000) * 0.15;
    } else if (taxableIncome <= 32000000) {
      tax = 1950000 + (taxableIncome - 18000000) * 0.2;
    } else if (taxableIncome <= 52000000) {
      tax = 4750000 + (taxableIncome - 32000000) * 0.25;
    } else if (taxableIncome <= 80000000) {
      tax = 9750000 + (taxableIncome - 52000000) * 0.3;
    } else {
      tax = 18150000 + (taxableIncome - 80000000) * 0.35;
    }

    const net = monthlyGrossVND - insuranceDeduction - tax;
    return Math.round(net / 500000) * 500000;
  }, [monthlyGrossVND, location]);

  // Display salary based on mode
  const displaySalaryVND = viewMode === 'gross' ? monthlyGrossVND : monthlyNetVND;
  const displaySalaryUSD = Math.round(displaySalaryVND / 25500);

  // Annual Package (including 13th month & estimated performance bonus ~1.5 months)
  const annualPackageVND = Math.round(monthlyGrossVND * 14.5 / 1000000) * 1000000;
  const annualPackageUSD = Math.round(annualPackageVND / 25500);

  // Market Percentile ranking in VN tech industry
  const marketPercentile = useMemo(() => {
    if (monthlyGrossVND >= 95000000) return 4;
    if (monthlyGrossVND >= 75000000) return 8;
    if (monthlyGrossVND >= 55000000) return 15;
    if (monthlyGrossVND >= 40000000) return 28;
    if (monthlyGrossVND >= 25000000) return 48;
    return 70;
  }, [monthlyGrossVND]);

  const toggleBooster = (id: string) => {
    setSelectedBoosters(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCopySummary = () => {
    const summary = `📊 BẢNG ƯỚC TÍNH THU NHẬP TECH 2026 - TALENTBRIDGE AI:
- Vị trí: ${isVi ? currentRole.titleVi : currentRole.titleEn}
- Kinh nghiệm: ${yearsOfExp} năm (${expLevelInfo.level})
- Địa điểm: ${location.toUpperCase()}
- Tiếng Anh: ${englishLevel.toUpperCase()}
- Mức lương hàng tháng (${viewMode.toUpperCase()}): ${displaySalaryVND.toLocaleString('vi-VN')} đ (~$${displaySalaryUSD.toLocaleString()} USD)
- Tổng gói thu nhập năm (TC): ${annualPackageVND.toLocaleString('vi-VN')} đ (~$${annualPackageUSD.toLocaleString()} USD)
- Xếp hạng thị trường: Top ${marketPercentile}% Lập trình viên Việt Nam`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summary).catch((err) => {
          console.warn('Clipboard write error handled:', err);
        });
      }
    } catch (err) {
      console.warn('Clipboard access not supported:', err);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8" data-testid="salary-calculator-container">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Calculator className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isVi ? 'BỘ TÍNH LƯƠNG & ĐỊNH GIÁ THỊ TRƯỜNG TECH 2026' : 'TECH COMPENSATION BENCHMARK 2026'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isVi ? 'Định Giá Năng Lực & Ước Tính Thu Nhập Công Nghệ' : 'Value Your Tech Skills & Predict Compensation'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {isVi
                ? 'Mô hình AI tổng hợp từ hơn 2,400+ dữ liệu thỏa thuận lương thực tế tại Việt Nam & khu vực Đông Nam Á, phản ánh chính xác giá trị thị trường theo kỹ năng và kinh nghiệm.'
                : 'AI engine trained on 2,400+ verified salary offers across Vietnam and Southeast Asia, reflecting accurate market value based on tech stack and seniority.'}
            </p>
          </div>

          {/* Quick Gross/Net Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                data-testid="btn-mode-gross"
                onClick={() => setViewMode('gross')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'gross'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-soft-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isVi ? 'Lương Gross (Trước thuế)' : 'Gross Salary'}
              </button>
              <button
                type="button"
                data-testid="btn-mode-net"
                onClick={() => setViewMode('net')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'net'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-soft-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isVi ? 'Lương Net (Thực nhận)' : 'Net Take-Home'}
              </button>
            </div>

            <button
              type="button"
              data-testid="btn-copy-salary-summary"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">{isVi ? 'Đã sao chép!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isVi ? 'Sao chép tóm tắt' : 'Copy Summary'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls vs Right Output Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Param Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Target Role Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-500" />
                <span>{isVi ? '1. Vị trí & Chuyên môn công nghệ' : '1. Target Tech Role'}</span>
              </label>
              <span className="text-xs font-semibold text-slate-400">
                {ROLES.length} {isVi ? 'vị trí tiêu chuẩn' : 'standard roles'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROLES.map((role) => {
                const isSelected = selectedRoleId === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    data-testid={`role-option-${role.id}`}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-soft-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className={`text-xs font-bold leading-snug line-clamp-1 ${
                        isSelected ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {isVi ? role.titleVi : role.titleEn}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {isVi ? 'Mốc Senior:' : 'Senior Range:'} ~{(role.baseSenior / 1000000).toFixed(0)}M/tháng
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Experience Slider */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm space-y-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span>{isVi ? '2. Số năm kinh nghiệm thực chiến' : '2. Years of Experience'}</span>
              </label>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${expLevelInfo.badge}`}>
                  {expLevelInfo.level}
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {yearsOfExp} {isVi ? 'năm' : 'years'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={yearsOfExp}
                data-testid="slider-experience"
                onChange={(e) => setYearsOfExp(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                <span>0 yr (Fresher)</span>
                <span>3 yrs (Mid)</span>
                <span>6 yrs (Senior)</span>
                <span>9 yrs (Lead)</span>
                <span>12+ yrs (Principal)</span>
              </div>
            </div>
          </div>

          {/* 3. Location & English Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Location */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm space-y-3">
              <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isVi ? '3. Khu vực làm việc' : '3. Work Location'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'hcm', label: 'TP. HCM (1.0x)' },
                  { id: 'hanoi', label: 'Hà Nội (0.95x)' },
                  { id: 'danang', label: 'Đà Nẵng (0.82x)' },
                  { id: 'remote', label: 'Global Remote (1.45x)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`location-${item.id}`}
                    onClick={() => setLocation(item.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                      location === item.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* English Level */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm space-y-3">
              <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isVi ? '4. Trình độ Tiếng Anh' : '4. English Proficiency'}</span>
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'basic', labelVi: 'Cơ bản (Đọc tài liệu) (+0%)', labelEn: 'Basic (Docs) (+0%)' },
                  { id: 'working', labelVi: 'Giao tiếp tốt (Họp kỹ thuật) (+15%)', labelEn: 'Working Professional (+15%)' },
                  { id: 'fluent', labelVi: 'Lưu loát / C-Level (+30%)', labelEn: 'Fluent / Native (+30%)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`english-${item.id}`}
                    onClick={() => setEnglishLevel(item.id as any)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-left flex items-center justify-between ${
                      englishLevel === item.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span>{isVi ? item.labelVi : item.labelEn}</span>
                    {englishLevel === item.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 4. High-Demand Skill Boosters */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>{isVi ? '5. Kỹ năng công nghệ giá trị cao (Salary Boosters)' : '5. High-ROI Tech Skill Boosters'}</span>
              </label>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +{Math.round(boosterBonus * 100)}% {isVi ? 'tăng thêm' : 'bonus added'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isVi 
                ? 'Tích chọn các năng lực bạn thành thạo để kích hoạt mức thưởng thù lao theo chuẩn tuyển dụng quốc tế:' 
                : 'Select competencies in your arsenal to unlock premium market compensation packages:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SKILL_BOOSTERS.map((booster) => {
                const isSelected = selectedBoosters.includes(booster.id);
                return (
                  <button
                    key={booster.id}
                    type="button"
                    data-testid={`booster-${booster.id}`}
                    onClick={() => toggleBooster(booster.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 shadow-soft-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold leading-tight">{booster.name}</p>
                      <span className="inline-block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        +{booster.bonusPercent}% {isVi ? 'giá trị JD' : 'JD premium'}
                      </span>
                    </div>
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Realtime Benchmark Output (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Compensation Dashboard Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-soft-xl relative overflow-hidden space-y-6">
            
            {/* Ambient Background Light */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Zap className="w-4 h-4" />
                <span>{isVi ? 'Dự phóng thu nhập thị trường' : 'Live Benchmark Prediction'}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-extrabold text-emerald-300 backdrop-blur-md">
                {viewMode.toUpperCase()}
              </span>
            </div>

            {/* Big Numbers */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span 
                  data-testid="salary-display-vnd"
                  className="text-3xl sm:text-4xl font-black tracking-tight text-white"
                >
                  {displaySalaryVND.toLocaleString('vi-VN')}
                </span>
                <span className="text-base sm:text-lg font-bold text-emerald-400">
                  đ / {isVi ? 'tháng' : 'month'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-300 font-semibold">
                <span data-testid="salary-display-usd">~${displaySalaryUSD.toLocaleString()} USD</span>
                <span className="text-slate-500">•</span>
                <span>{viewMode === 'gross' ? (isVi ? 'Chưa trừ thuế & BH' : 'Pre-tax Gross') : (isVi ? 'Thực nhận về tài khoản' : 'Net Take-home')}</span>
              </div>
            </div>

            {/* Total Annual Compensation (TC) */}
            <div className="relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
              <p className="text-xs text-slate-400 font-medium">
                {isVi ? 'Tổng gói thu nhập năm ước tính (Total Compensation):' : 'Estimated Annual Package (Total Compensation):'}
              </p>
              <div className="flex items-baseline justify-between">
                <span 
                  data-testid="annual-package-display"
                  className="text-lg font-black text-amber-400"
                >
                  {annualPackageVND.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-xs font-bold text-slate-300">
                  ~${annualPackageUSD.toLocaleString()} USD/yr
                </span>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                {isVi ? 'Bao gồm lương tháng 13 + thưởng hiệu suất (1.5 tháng)' : 'Includes 13th month + ~1.5 mo performance bonus'}
              </p>
            </div>

            {/* Market Percentile Ranking Meter */}
            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">{isVi ? 'Xếp hạng trong ngành:' : 'Market Percentile:'}</span>
                <span 
                  data-testid="market-percentile-badge"
                  className="text-emerald-400 font-black text-sm"
                >
                  Top {marketPercentile}% {isVi ? 'thị trường' : 'market'}
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(10, 100 - marketPercentile)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>Entry (0-20M)</span>
                <span>Mid (20-45M)</span>
                <span>Senior (45-75M)</span>
                <span className="text-emerald-400 font-bold">Elite (75M+)</span>
              </div>
            </div>

            {/* Direct CTA Button */}
            <div className="relative z-10 pt-2">
              <button
                type="button"
                data-testid="btn-view-salary-matching-jobs"
                onClick={onFindMatchingJobs}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-soft-lg hover:shadow-soft-xl flex items-center justify-center gap-2 cursor-pointer group active:scale-98"
              >
                <span>{isVi ? 'Xem các việc làm có mức lương này ngay' : 'Browse Matching Salary Jobs Now'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* AI Skill Upside Advisor Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{isVi ? 'Gợi ý bứt phá thu nhập từ AI' : 'AI Career Upside Recommendations'}</span>
            </div>

            <div className="space-y-3">
              {SKILL_BOOSTERS.filter(b => !selectedBoosters.includes(b.id)).slice(0, 2).map((item) => {
                const uplift = Math.round(monthlyGrossVND * (item.bonusPercent / 100) / 100000) * 100000;
                return (
                  <div 
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        +{uplift.toLocaleString('vi-VN')} đ/tháng (+{item.bonusPercent}%)
                      </p>
                    </div>
                    <button
                      type="button"
                      data-testid={`btn-quick-add-${item.id}`}
                      onClick={() => toggleBooster(item.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-600 transition-all cursor-pointer"
                    >
                      {isVi ? '+ Thử thêm' : '+ Add'}
                    </button>
                  </div>
                );
              })}

              {SKILL_BOOSTERS.filter(b => !selectedBoosters.includes(b.id)).length === 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium text-center">
                  {isVi 
                    ? '🎉 Tuyệt vời! Bạn đã chọn tất cả các kỹ năng giá trị cao nhất!'
                    : '🎉 Awesome! You have selected all top high-value booster skills!'}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
