import React, { useMemo, useState } from 'react';
import { Calculator, ArrowRight, HelpCircle, Building2, User, CheckCircle2 } from 'lucide-react';
import { btnPrimary, inputCls } from '../ui/primitives';
import { useLanguage } from '../../i18n/LanguageContext';

export interface SalaryCalculatorSectionProps {
  onFindMatchingJobs?: () => void;
}

// Mức lương cơ sở từ 01/07/2024 (Nghị định 73/2024/NĐ-CP): 2.340.000 đ
const LUONG_CO_SO = 2_340_000;
// Trần đóng BHXH & BHYT = 20 lần lương cơ sở = 46.800.000 đ
const TRAN_BHXH_BHYT = 20 * LUONG_CO_SO;

// Mức lương tối thiểu vùng từ 01/07/2024 (Nghị định 74/2024/NĐ-CP)
const VUNG_CONFIG = [
  { id: 1, name: 'Vùng I (Hà Nội, TP.HCM, Hải Phòng...)', minWage: 4_960_000 },
  { id: 2, name: 'Vùng II (Đà Nẵng, Cần Thơ, Nha Trang...)', minWage: 4_410_000 },
  { id: 3, name: 'Vùng III (Các tỉnh/thành còn lại)', minWage: 3_860_000 },
  { id: 4, name: 'Vùng IV (Địa bàn khó khăn)', minWage: 3_450_000 },
];

// English display labels (display only — calculations use VUNG_CONFIG / BRACKETS)
const VUNG_NAME_EN: Record<number, string> = {
  1: 'Region I (Hanoi, HCMC, Hai Phong...)',
  2: 'Region II (Da Nang, Can Tho, Nha Trang...)',
  3: 'Region III (Other provinces/cities)',
  4: 'Region IV (Disadvantaged areas)',
};

const BRACKET_RANGE_EN: Record<number, string> = {
  1: 'Up to 5M',
  2: 'Over 5M – 10M',
  3: 'Over 10M – 18M',
  4: 'Over 18M – 32M',
  5: 'Over 32M – 52M',
  6: 'Over 52M – 80M',
  7: 'Over 80M',
};

const TEXT = {
  vi: {
    heading: 'Bảng quy đổi Lương Gross ⇄ Net',
    grossInput: 'Lương Gross (VNĐ)',
    netInput: 'Lương Net (VNĐ)',
    region: 'Khu vực làm việc',
    dependents: 'Người phụ thuộc',
    insuranceBasis: 'Mức đóng bảo hiểm',
    insuranceOfficial: 'Trên lương chính thức',
    insuranceCustom: 'Mức khác...',
    customInsuranceLabel: 'Mức lương đóng bảo hiểm (VNĐ)',
    regulationNote: 'Áp dụng quy định mới nhất từ 01/07/2024: Mức lương cơ sở 2,340,000 đ/tháng; Giảm trừ cá nhân 11 tr, người phụ thuộc 4.4 tr.',
    grossCardLabel: 'Lương GROSS',
    currency: 'VNĐ',
    grossCardDesc: 'Tổng thu nhập theo hợp đồng trước khi trích bảo hiểm và thuế thu nhập cá nhân.',
    netCardLabel: 'LƯƠNG NET (THỰC NHẬN)',
    netCardDesc: 'Khoản tiền thực nhận về tài khoản sau khi đã khấu trừ đầy đủ BHXH, BHYT, BHTN và Thuế TNCN.',
    breakdownTitle: 'Diễn giải chi tiết các khoản trích nộp (VNĐ)',
    unit: 'Đơn vị: VNĐ / tháng',
    rowGross: '1. Lương GROSS',
    rowBhxh: '- Bảo hiểm xã hội (8%)',
    rowBhyt: '- Bảo hiểm y tế (1.5%)',
    rowBhtn: '- Bảo hiểm thất nghiệp (1%)',
    capped468: '(đã chạm trần 46.8 tr)',
    capped: '(đã chạm trần)',
    rowIncomeBeforeTax: '2. Thu nhập trước thuế (Lương Gross - Tổng BH)',
    rowPersonalDeduction: '- Giảm trừ gia cảnh bản thân',
    rowTaxable: '3. Thu nhập tính thuế (TNTT)',
    rowPit: '- Thuế thu nhập cá nhân (TNCN) (*)',
    rowNet: '4. LƯƠNG NET THỰC NHẬN (2 - Thuế TNCN)',
    bracketsTitle: '(*) Chi tiết các bậc thuế thu nhập cá nhân (Lũy tiến từng phần)',
    thBracket: 'Bậc',
    thRange: 'Mức thu nhập tính thuế',
    thRate: 'Thuế suất',
    thTaxable: 'Thu nhập tính thuế bậc này',
    thTax: 'Tiền thuế nộp',
    bracket: 'Bậc',
    dong: 'đ',
    employerTitle: 'Chi phí thực tế Người sử dụng lao động (Doanh nghiệp) chi trả',
    employerDesc: 'Bao gồm lương Gross + các khoản bảo hiểm doanh nghiệp nộp (BHXH 17%, BHTNLĐ-BNN 0.5%, BHYT 3%, BHTN 1%).',
    employerTotal: 'Tổng chi phí doanh nghiệp',
    findJobs: 'Tìm việc làm với mức lương này',
  },
  en: {
    heading: 'Gross ⇄ Net Salary Converter',
    grossInput: 'Gross salary (VND)',
    netInput: 'Net salary (VND)',
    region: 'Work region',
    dependents: 'Dependents',
    insuranceBasis: 'Insurance contribution basis',
    insuranceOfficial: 'Based on official salary',
    insuranceCustom: 'Custom amount...',
    customInsuranceLabel: 'Insurance salary base (VND)',
    regulationNote: 'Based on the latest regulations effective July 1, 2024: base salary 2,340,000 VND/month; personal deduction 11M, dependent deduction 4.4M per person.',
    grossCardLabel: 'GROSS salary',
    currency: 'VND',
    grossCardDesc: 'Total contractual income before social insurance and personal income tax deductions.',
    netCardLabel: 'NET SALARY (TAKE-HOME)',
    netCardDesc: 'The amount actually paid into your account after deducting social insurance, health insurance, unemployment insurance and personal income tax.',
    breakdownTitle: 'Detailed breakdown of deductions (VND)',
    unit: 'Unit: VND / month',
    rowGross: '1. GROSS salary',
    rowBhxh: '- Social insurance (8%)',
    rowBhyt: '- Health insurance (1.5%)',
    rowBhtn: '- Unemployment insurance (1%)',
    capped468: '(capped at 46.8M)',
    capped: '(capped)',
    rowIncomeBeforeTax: '2. Pre-tax income (Gross salary − total insurance)',
    rowPersonalDeduction: '- Personal deduction',
    rowTaxable: '3. Taxable income',
    rowPit: '- Personal income tax (PIT) (*)',
    rowNet: '4. NET TAKE-HOME PAY (2 − PIT)',
    bracketsTitle: '(*) Personal income tax brackets (progressive rates)',
    thBracket: 'Bracket',
    thRange: 'Taxable income range',
    thRate: 'Tax rate',
    thTaxable: 'Taxable income in bracket',
    thTax: 'Tax payable',
    bracket: 'Bracket',
    dong: 'VND',
    employerTitle: 'Actual cost to the employer (company)',
    employerDesc: 'Includes gross salary + employer-paid insurance (social insurance 17%, occupational accident & disease insurance 0.5%, health insurance 3%, unemployment insurance 1%).',
    employerTotal: 'Total employer cost',
    findJobs: 'Find jobs at this salary level',
  },
};

// Giảm trừ gia cảnh
const GIAM_TRU_BAN_THAN = 11_000_000;
const GIAM_TRU_PHU_THUOC = 4_400_000;

interface TaxBracketDetail {
  bracket: number;
  range: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

function calculateProgressiveTax(taxableIncome: number): { totalTax: number; brackets: TaxBracketDetail[] } {
  if (taxableIncome <= 0) {
    return {
      totalTax: 0,
      brackets: [
        { bracket: 1, range: 'Đến 5 triệu', rate: 5, taxableAmount: 0, taxAmount: 0 },
        { bracket: 2, range: 'Trên 5 - 10 triệu', rate: 10, taxableAmount: 0, taxAmount: 0 },
        { bracket: 3, range: 'Trên 10 - 18 triệu', rate: 15, taxableAmount: 0, taxAmount: 0 },
        { bracket: 4, range: 'Trên 18 - 32 triệu', rate: 20, taxableAmount: 0, taxAmount: 0 },
        { bracket: 5, range: 'Trên 32 - 52 triệu', rate: 25, taxableAmount: 0, taxAmount: 0 },
        { bracket: 6, range: 'Trên 52 - 80 triệu', rate: 30, taxableAmount: 0, taxAmount: 0 },
        { bracket: 7, range: 'Trên 80 triệu', rate: 35, taxableAmount: 0, taxAmount: 0 },
      ],
    };
  }

  const BRACKETS = [
    { bracket: 1, range: 'Đến 5 triệu', rate: 0.05, max: 5_000_000 },
    { bracket: 2, range: 'Trên 5 - 10 triệu', rate: 0.10, max: 10_000_000 },
    { bracket: 3, range: 'Trên 10 - 18 triệu', rate: 0.15, max: 18_000_000 },
    { bracket: 4, range: 'Trên 18 - 32 triệu', rate: 0.20, max: 32_000_000 },
    { bracket: 5, range: 'Trên 32 - 52 triệu', rate: 0.25, max: 52_000_000 },
    { bracket: 6, range: 'Trên 52 - 80 triệu', rate: 0.30, max: 80_000_000 },
    { bracket: 7, range: 'Trên 80 triệu', rate: 0.35, max: Infinity },
  ];

  let remaining = taxableIncome;
  let prevLimit = 0;
  let totalTax = 0;
  const result: TaxBracketDetail[] = [];

  for (const b of BRACKETS) {
    const bracketSpan = b.max - prevLimit;
    const taxableInBracket = Math.min(Math.max(0, remaining), bracketSpan);
    const taxInBracket = taxableInBracket * b.rate;
    totalTax += taxInBracket;

    result.push({
      bracket: b.bracket,
      range: b.range,
      rate: b.rate * 100,
      taxableAmount: taxableInBracket,
      taxAmount: taxInBracket,
    });

    remaining -= taxableInBracket;
    prevLimit = b.max;
  }

  return { totalTax: Math.round(totalTax), brackets: result };
}

/** Quy đổi Net sang Thu nhập tính thuế theo TT 111/2013/TT-BTC */
function netToTaxableIncome(netAfterDeductions: number): number {
  if (netAfterDeductions <= 0) return 0;
  const q = netAfterDeductions;
  if (q <= 4_750_000) return q / 0.95;
  if (q <= 9_250_000) return (q - 250_000) / 0.9;
  if (q <= 16_050_000) return (q - 750_000) / 0.85;
  if (q <= 27_250_000) return (q - 1_650_000) / 0.8;
  if (q <= 42_250_000) return (q - 3_250_000) / 0.75;
  if (q <= 61_850_000) return (q - 5_850_000) / 0.7;
  return (q - 9_850_000) / 0.65;
}

export const SalaryCalculatorSection: React.FC<SalaryCalculatorSectionProps> = ({ onFindMatchingJobs }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const t = TEXT[isEn ? 'en' : 'vi'];
  const numLocale = isEn ? 'en-US' : 'vi-VN';
  const fmt = (n: number) => n.toLocaleString(numLocale);
  const [mode, setMode] = useState<'gross-to-net' | 'net-to-gross'>('gross-to-net');
  const [salaryInput, setSalaryInput] = useState<string>('30000000');
  const [regionId, setRegionId] = useState<number>(1);
  const [dependents, setDependents] = useState<number>(0);
  const [insuranceType, setInsuranceType] = useState<'official' | 'custom'>('official');
  const [customInsurance, setCustomInsurance] = useState<string>('5000000');

  const selectedRegion = VUNG_CONFIG.find((v) => v.id === regionId) ?? VUNG_CONFIG[0];
  const tranBhtn = 20 * selectedRegion.minWage;

  const rawNumber = Number(salaryInput.replace(/\D/g, '')) || 0;
  const rawCustomIns = Number(customInsurance.replace(/\D/g, '')) || 0;

  // Tính toán Gross ⇄ Net
  const result = useMemo(() => {
    let gross = 0;
    let net = 0;
    const totalDeduction = GIAM_TRU_BAN_THAN + dependents * GIAM_TRU_PHU_THUOC;

    if (mode === 'gross-to-net') {
      gross = rawNumber;
      const insBase = insuranceType === 'custom' ? rawCustomIns : gross;
      const bhxh = Math.min(insBase, TRAN_BHXH_BHYT) * 0.08;
      const bhyt = Math.min(insBase, TRAN_BHXH_BHYT) * 0.015;
      const bhtn = Math.min(insBase, tranBhtn) * 0.01;
      const totalInsurance = Math.round(bhxh + bhyt + bhtn);
      const incomeBeforeTax = Math.max(0, gross - totalInsurance);
      const taxableIncome = Math.max(0, incomeBeforeTax - totalDeduction);
      const { totalTax, brackets } = calculateProgressiveTax(taxableIncome);
      net = Math.max(0, gross - totalInsurance - totalTax);

      // Chi phí NSDLĐ đóng
      const erBhxh = Math.min(insBase, TRAN_BHXH_BHYT) * 0.17;
      const erBhtnld = Math.min(insBase, TRAN_BHXH_BHYT) * 0.005;
      const erBhyt = Math.min(insBase, TRAN_BHXH_BHYT) * 0.03;
      const erBhtn = Math.min(insBase, tranBhtn) * 0.01;
      const employerInsurance = Math.round(erBhxh + erBhtnld + erBhyt + erBhtn);
      const employerTotalCost = gross + employerInsurance;

      return {
        gross,
        net,
        bhxh: Math.round(bhxh),
        bhyt: Math.round(bhyt),
        bhtn: Math.round(bhtn),
        totalInsurance,
        incomeBeforeTax,
        totalDeduction,
        taxableIncome,
        totalTax,
        brackets,
        employerInsurance,
        employerTotalCost,
      };
    } else {
      // Net to Gross
      net = rawNumber;
      const netAfterDeductions = Math.max(0, net - totalDeduction);
      const taxableIncome = Math.round(netToTaxableIncome(netAfterDeductions));
      const { totalTax, brackets } = calculateProgressiveTax(taxableIncome);
      const incomeBeforeTax = net + totalTax;

      if (insuranceType === 'custom') {
        const insBase = rawCustomIns;
        const bhxh = Math.min(insBase, TRAN_BHXH_BHYT) * 0.08;
        const bhyt = Math.min(insBase, TRAN_BHXH_BHYT) * 0.015;
        const bhtn = Math.min(insBase, tranBhtn) * 0.01;
        const totalInsurance = Math.round(bhxh + bhyt + bhtn);
        gross = incomeBeforeTax + totalInsurance;

        const erBhxh = Math.min(insBase, TRAN_BHXH_BHYT) * 0.17;
        const erBhtnld = Math.min(insBase, TRAN_BHXH_BHYT) * 0.005;
        const erBhyt = Math.min(insBase, TRAN_BHXH_BHYT) * 0.03;
        const erBhtn = Math.min(insBase, tranBhtn) * 0.01;
        const employerInsurance = Math.round(erBhxh + erBhtnld + erBhyt + erBhtn);

        return {
          gross,
          net,
          bhxh: Math.round(bhxh),
          bhyt: Math.round(bhyt),
          bhtn: Math.round(bhtn),
          totalInsurance,
          incomeBeforeTax,
          totalDeduction,
          taxableIncome,
          totalTax,
          brackets,
          employerInsurance,
          employerTotalCost: gross + employerInsurance,
        };
      } else {
        // Đóng BH trên lương chính thức:
        // Giải Gross: Gross - Insurance(Gross) = incomeBeforeTax
        let calculatedGross = 0;
        const t1 = TRAN_BHXH_BHYT * 0.895; // 41.886.000
        const t2 = 0.99 * tranBhtn - TRAN_BHXH_BHYT * 0.095;

        if (incomeBeforeTax <= t1) {
          calculatedGross = incomeBeforeTax / 0.895;
        } else if (incomeBeforeTax <= t2) {
          calculatedGross = (incomeBeforeTax + TRAN_BHXH_BHYT * 0.095) / 0.99;
        } else {
          const capTotal = TRAN_BHXH_BHYT * 0.095 + tranBhtn * 0.01;
          calculatedGross = incomeBeforeTax + capTotal;
        }
        gross = Math.round(calculatedGross);

        const bhxh = Math.min(gross, TRAN_BHXH_BHYT) * 0.08;
        const bhyt = Math.min(gross, TRAN_BHXH_BHYT) * 0.015;
        const bhtn = Math.min(gross, tranBhtn) * 0.01;
        const totalInsurance = Math.round(bhxh + bhyt + bhtn);

        const erBhxh = Math.min(gross, TRAN_BHXH_BHYT) * 0.17;
        const erBhtnld = Math.min(gross, TRAN_BHXH_BHYT) * 0.005;
        const erBhyt = Math.min(gross, TRAN_BHXH_BHYT) * 0.03;
        const erBhtn = Math.min(gross, tranBhtn) * 0.01;
        const employerInsurance = Math.round(erBhxh + erBhtnld + erBhyt + erBhtn);

        return {
          gross,
          net,
          bhxh: Math.round(bhxh),
          bhyt: Math.round(bhyt),
          bhtn: Math.round(bhtn),
          totalInsurance,
          incomeBeforeTax,
          totalDeduction,
          taxableIncome,
          totalTax,
          brackets,
          employerInsurance,
          employerTotalCost: gross + employerInsurance,
        };
      }
    }
  }, [mode, rawNumber, rawCustomIns, dependents, regionId, insuranceType, tranBhtn]);

  return (
    <div className="space-y-6">
      {/* Mode switcher */}
      <div className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </span>
            <h2 className="font-black text-slate-900 dark:text-white text-lg">{t.heading}</h2>
          </div>
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMode('gross-to-net')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                mode === 'gross-to-net' ? 'bg-emerald-600 text-white shadow-soft-xs' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              GROSS → NET
            </button>
            <button
              onClick={() => setMode('net-to-gross')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                mode === 'net-to-gross' ? 'bg-emerald-600 text-white shadow-soft-xs' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              NET → GROSS
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {mode === 'gross-to-net' ? t.grossInput : t.netInput}
            </label>
            <input
              type="text"
              value={Number(salaryInput).toLocaleString(numLocale)}
              onChange={(e) => setSalaryInput(e.target.value.replace(/\D/g, ''))}
              placeholder="30,000,000"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.region}</label>
            <select value={regionId} onChange={(e) => setRegionId(Number(e.target.value))} className={inputCls}>
              {VUNG_CONFIG.map((v) => (
                <option key={v.id} value={v.id}>
                  {isEn ? VUNG_NAME_EN[v.id] ?? v.name : v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.dependents}</label>
            <input
              type="number"
              min={0}
              max={20}
              value={dependents}
              onChange={(e) => setDependents(Math.max(0, Number(e.target.value)))}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.insuranceBasis}</label>
            <select
              value={insuranceType}
              onChange={(e) => setInsuranceType(e.target.value as 'official' | 'custom')}
              className={inputCls}
            >
              <option value="official">{t.insuranceOfficial}</option>
              <option value="custom">{t.insuranceCustom}</option>
            </select>
          </div>
        </div>

        {insuranceType === 'custom' && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-sm">
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t.customInsuranceLabel}
            </label>
            <input
              type="text"
              value={Number(customInsurance).toLocaleString(numLocale)}
              onChange={(e) => setCustomInsurance(e.target.value.replace(/\D/g, ''))}
              className={inputCls}
            />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <p>{t.regulationNote}</p>
        </div>
      </div>

      {/* Main KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs" data-testid="gross-card">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.grossCardLabel}</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white" data-testid="gross-amount">{fmt(result.gross)}</span>
            <span className="text-sm font-medium text-slate-500">{t.currency}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {t.grossCardDesc}
          </p>
        </div>

        <div className="rounded-3xl p-6 border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 shadow-[0_12px_35px_-12px_rgba(16,185,129,0.3)]" data-testid="net-card">
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">{t.netCardLabel}</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent" data-testid="net-amount">{fmt(result.net)}</span>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{t.currency}</span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {t.netCardDesc}
          </p>
        </div>
      </div>

      {/* Detailed breakdown table */}
      <div className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft-xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-2 items-center justify-between">
          <h3 className="font-black text-slate-900 dark:text-white text-sm">{t.breakdownTitle}</h3>
          <span className="text-xs text-slate-500">{t.unit}</span>
        </div>

        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            <tr className="bg-slate-50/50 font-medium">
              <td className="px-6 py-3 text-slate-900">{t.rowGross}</td>
              <td className="px-6 py-3 text-right font-bold text-slate-900">{fmt(result.gross)}</td>
            </tr>

            <tr>
              <td className="px-6 py-3 text-slate-700 pl-10">
                {t.rowBhxh}{result.gross > TRAN_BHXH_BHYT && <span className="text-xs text-slate-400 ml-1">{t.capped468}</span>}
              </td>
              <td className="px-6 py-3 text-right text-rose-600 dark:text-rose-400">-{fmt(result.bhxh)}</td>
            </tr>

            <tr>
              <td className="px-6 py-3 text-slate-700 pl-10">
                {t.rowBhyt}{result.gross > TRAN_BHXH_BHYT && <span className="text-xs text-slate-400 ml-1">{t.capped468}</span>}
              </td>
              <td className="px-6 py-3 text-right text-rose-600 dark:text-rose-400">-{fmt(result.bhyt)}</td>
            </tr>

            <tr>
              <td className="px-6 py-3 text-slate-700 pl-10">
                {t.rowBhtn}{result.gross > tranBhtn && <span className="text-xs text-slate-400 ml-1">{t.capped}</span>}
              </td>
              <td className="px-6 py-3 text-right text-rose-600 dark:text-rose-400">-{fmt(result.bhtn)}</td>
            </tr>

            <tr className="font-medium bg-slate-50/30">
              <td className="px-6 py-3 text-slate-900">{t.rowIncomeBeforeTax}</td>
              <td className="px-6 py-3 text-right font-semibold text-slate-900">{fmt(result.incomeBeforeTax)}</td>
            </tr>

            <tr>
              <td className="px-6 py-3 text-slate-700 pl-10">{t.rowPersonalDeduction}</td>
              <td className="px-6 py-3 text-right text-slate-600">-{fmt(GIAM_TRU_BAN_THAN)}</td>
            </tr>

            {dependents > 0 && (
              <tr>
                <td className="px-6 py-3 text-slate-700 pl-10">
                  {isEn ? (
                    <>- Dependent deduction ({dependents} {dependents === 1 ? 'person' : 'people'} × 4,400,000)</>
                  ) : (
                    <>- Giảm trừ người phụ thuộc ({dependents} người x 4.400.000)</>
                  )}
                </td>
                <td className="px-6 py-3 text-right text-slate-600">
                  -{fmt(dependents * GIAM_TRU_PHU_THUOC)}
                </td>
              </tr>
            )}

            <tr className="font-medium bg-slate-50/30">
              <td className="px-6 py-3 text-slate-900">{t.rowTaxable}</td>
              <td className="px-6 py-3 text-right font-semibold text-slate-900">{fmt(result.taxableIncome)}</td>
            </tr>

            <tr>
              <td className="px-6 py-3 text-slate-700 pl-10">{t.rowPit}</td>
              <td className="px-6 py-3 text-right text-rose-600 dark:text-rose-400">-{fmt(result.totalTax)}</td>
            </tr>

            <tr className="bg-emerald-50/70 dark:bg-emerald-950/30 font-black text-base">
              <td className="px-6 py-4 text-slate-900">{t.rowNet}</td>
              <td className="px-6 py-4 text-right text-emerald-700 dark:text-emerald-400">{fmt(result.net)} {t.currency}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tax Brackets Breakdown */}
      {result.taxableIncome > 0 && (
        <div className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs">
          <h4 className="font-black text-slate-900 dark:text-white text-sm mb-3">
            {t.bracketsTitle}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-2">{t.thBracket}</th>
                  <th className="px-4 py-2">{t.thRange}</th>
                  <th className="px-4 py-2">{t.thRate}</th>
                  <th className="px-4 py-2 text-right">{t.thTaxable}</th>
                  <th className="px-4 py-2 text-right">{t.thTax}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.brackets.map((b) => (
                  <tr key={b.bracket} className={b.taxableAmount > 0 ? 'bg-amber-50/50 dark:bg-amber-950/20 font-semibold' : 'text-slate-400'}>
                    <td className="px-4 py-2">{t.bracket} {b.bracket}</td>
                    <td className="px-4 py-2">{isEn ? BRACKET_RANGE_EN[b.bracket] ?? b.range : b.range}</td>
                    <td className="px-4 py-2">{b.rate}%</td>
                    <td className="px-4 py-2 text-right">{fmt(b.taxableAmount)} {t.dong}</td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-900">{fmt(b.taxAmount)} {t.dong}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employer Cost Info Box */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-sm text-slate-700 dark:text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span>{t.employerTitle}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.employerDesc}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-500 uppercase tracking-wide">{t.employerTotal}</p>
          <p className="text-xl font-black text-slate-900 dark:text-white">{fmt(result.employerTotalCost)} {t.currency}</p>
        </div>
      </div>

      {onFindMatchingJobs && (
        <div className="text-center pt-2">
          <button onClick={onFindMatchingJobs} className={btnPrimary}>
            {t.findJobs} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
