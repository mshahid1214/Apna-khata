import React from 'react';
import { KhataEntry, Language } from '../types';
import { formatPKR } from '../services/formatters';
import { Calculator, Info, TrendingUp, HelpCircle } from 'lucide-react';

interface KnowYourNumbersProps {
  entries: KhataEntry[];
  language?: Language;
}

export const KnowYourNumbersPanel: React.FC<KnowYourNumbersProps> = ({
  entries,
  language = 'ur',
}) => {
  // 1. Total Advances (Cash + Inputs given)
  const cashAdvances = entries
    .filter((e) => e.entryType === 'advance_cash')
    .reduce((sum, e) => sum + e.amountPKR, 0);

  const inputAdvances = entries
    .filter((e) => e.entryType === 'input_item')
    .reduce((sum, e) => sum + e.amountPKR, 0);

  const totalAdvances = cashAdvances + inputAdvances;

  // 2. Total Sale Proceeds
  const totalSaleProceeds = entries
    .filter((e) => e.entryType === 'sale_proceed')
    .reduce((sum, e) => sum + e.amountPKR, 0);

  // 3. Total Deductions (Direct deduction entries + any deductions recorded)
  const totalDeductions = entries
    .filter((e) => e.entryType === 'deduction')
    .reduce((sum, e) => sum + e.amountPKR, 0);

  // 4. Estimated Effective Cost / Service Ratio
  // Calculated ONLY from user-entered figures: (Total Deductions ÷ Total Advances) * 100
  // Or if no advances, (Total Deductions ÷ Total Sale Proceeds) * 100
  const costOfCreditPct =
    totalAdvances > 0
      ? Number(((totalDeductions / totalAdvances) * 100).toFixed(1))
      : 0;

  const deductionToSalePct =
    totalSaleProceeds > 0
      ? Number(((totalDeductions / totalSaleProceeds) * 100).toFixed(1))
      : 0;

  return (
    <div className="parchment-slip rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              شفاف حساب و کتاب
            </span>
            <h3 className="text-xl font-bold font-urdu text-stone-900">
              اعداد و شمار سمجھیے (Know Your Numbers)
            </h3>
          </div>
        </div>
        <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded-xl">
          غیر جانبدارانہ تجزیہ
        </span>
      </div>

      {/* Neutral Educational Notice */}
      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-stone-700 leading-relaxed">
        <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
        <p>
          یہ تجزیہ مکمل طور پر آپ کے درج کردہ اصل اعداد و شمار سے حساب کیا گیا ہے۔ اس کا مقصد کسان اور آڑھتی دونوں کے درمیان شفافیت اور باہمی اعتماد کو فروغ دینا ہے۔
        </p>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total Advances */}
        <div className="bg-white/90 p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-bold text-stone-600 block">
            1. کل پیشگی ادھار و کھاد بیج
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-stone-950 mt-1">
            <bdi dir="ltr">{formatPKR(totalAdvances, language)}</bdi>
          </div>
          <div className="text-[11px] text-stone-500 mt-1 space-y-0.5">
            <div>نقد: {formatPKR(cashAdvances, language)}</div>
            <div>کھاد و بیج: {formatPKR(inputAdvances, language)}</div>
          </div>
        </div>

        {/* Card 2: Total Deductions */}
        <div className="bg-white/90 p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-bold text-stone-600 block">
            2. کل منڈی کٹوتیاں و اخراجات
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-900 mt-1">
            <bdi dir="ltr">{formatPKR(totalDeductions, language)}</bdi>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            کمیشن، کانٹا، پلائی، مارکیٹ فیس
          </div>
        </div>

        {/* Card 3: Estimated Effective Cost Ratio */}
        <div className="bg-amber-100/70 p-3.5 rounded-2xl border border-amber-300 shadow-xs">
          <span className="text-xs font-bold text-amber-950 block">
            3. پیشگی ادھار پر کٹوتی تناسب
          </span>
          <div className="text-lg sm:text-2xl font-bold font-mono text-[#78350F] mt-1">
            <bdi dir="ltr">{costOfCreditPct}%</bdi>
          </div>
          <div className="text-[11px] text-stone-600 mt-1">
            فروخت آمدن کے مقابلے: {deductionToSalePct}%
          </div>
        </div>
      </div>

      {/* Transparent Formula Display (Mandatory Requirement) */}
      <div className="p-3.5 bg-stone-100/90 rounded-2xl border border-stone-300 text-xs text-stone-800 space-y-1.5 font-mono">
        <div className="flex items-center gap-1.5 font-bold text-stone-900 font-sans">
          <HelpCircle className="w-4 h-4 text-amber-800" />
          <span>حساب کا طریقہ اور شفاف فارمولا:</span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-stone-200 overflow-x-auto text-stone-900">
          <bdi dir="ltr">
            تناسب (%) = (کل کٹوتیاں [{formatPKR(totalDeductions, 'ur-Latn')}] ÷ کل پیشگی ادھار [{formatPKR(totalAdvances, 'ur-Latn')}]) × 100 = {costOfCreditPct}%
          </bdi>
        </div>
        <p className="text-[11px] text-stone-500 font-sans">
          یہ تناسب واضح کرتا ہے کہ فصل آنے تک حاصل شدہ پیشگی سہولت کے مقابلے میں منڈی خدمات اور کٹوتیوں کا کیا تناسب رہا۔
        </p>
      </div>
    </div>
  );
};
