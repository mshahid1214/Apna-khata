import React, { useState } from 'react';
import { CropMarketData } from '../services/priceProvider';
import { formatPKR } from '../services/formatters';
import { priceAlertRepository } from '../repositories/priceAlertRepository';
import { useApp } from '../context/AppContext';
import {
  X,
  Volume2,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Calendar,
  Bell,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CropRateDetailModalProps {
  data: CropMarketData | null;
  isOpen: boolean;
  onClose: () => void;
  onAlertCreated?: () => void;
}

export const CropRateDetailModal: React.FC<CropRateDetailModalProps> = ({
  data,
  isOpen,
  onClose,
  onAlertCreated,
}) => {
  const { speak } = useApp();
  const [selectedPointIdx, setSelectedPointIdx] = useState<number | null>(null);

  // Price alert state
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [alertMessage, setAlertMessage] = useState('');

  if (!isOpen || !data) return null;

  // Rule-based Plain Urdu Hint:
  // Rules based on change7DaysPct:
  let ruleHintUrdu = '';
  let hintTone: 'positive' | 'negative' | 'neutral' = 'neutral';

  if (data.change7DaysPct > 2.0) {
    ruleHintUrdu = `قیمت پچھلے ہفتے سے ${data.change7DaysPct}% زیادہ ہے — منڈی میں خریداروں کی مانگ اور تیزی کا رجحان ہے۔ کسان بھائی موجودہ سازگار ریٹ سے فائدہ اٹھانے پر غور کر سکتے ہیں۔`;
    hintTone = 'positive';
  } else if (data.change7DaysPct < -2.0) {
    ruleHintUrdu = `قیمت پچھلے ہفتے کے مقابلے میں ${Math.abs(data.change7DaysPct)}% کم ہوئی ہے — آمد زیادہ ہونے کی وجہ سے عارضی مندی ہے۔ اگر ممکن ہو اور مال پکا نہ ہو تو چند دن انتظار فائدہ مند ہو سکتا ہے۔`;
    hintTone = 'negative';
  } else {
    ruleHintUrdu = `قیمت پچھلے ہفتے کی سطح کے قریب مستحکم ہے — مارکیٹ میں رسد اور طلب متوازن ہے۔ معمول کے مطابق مال منڈی بھجوایا جا سکتا ہے۔`;
    hintTone = 'neutral';
  }

  // Handle Voice Narration
  const handleRead = () => {
    const text = `${data.commodityNameUr} کی مارکیٹ سمری۔ ملتان اوسط ریٹ ${data.markets.multan.avgPrice} روپے۔ لاہور اوسط ریٹ ${data.markets.lahore.avgPrice} روپے۔ فیصل آباد ${data.markets.faisalabad.avgPrice} روپے۔ رہنمائی: ${ruleHintUrdu}`;
    speak(text);
  };

  // Handle Save Alert
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(alertTargetPrice);
    if (!target || target <= 0) return;

    await priceAlertRepository.save(data.commodity, target, alertCondition);
    setAlertMessage(`الرٹ کامیابی سے فعال ہو گیا: جب ریٹ ${target} روپوں سے ${alertCondition === 'above' ? 'بڑھے' : 'گرے'}۔`);
    speak('ریٹ الرٹ کامیابی سے محفوظ ہو گیا۔');
    if (onAlertCreated) onAlertCreated();
    setTimeout(() => setAlertMessage(''), 4000);
  };

  // 30-day Chart Math
  const history = data.history30Days;
  const minPriceAll = Math.min(...history.map((h) => h.minPrice));
  const maxPriceAll = Math.max(...history.map((h) => h.maxPrice));
  const priceRange = maxPriceAll - minPriceAll || 1;

  const chartWidth = 520;
  const chartHeight = 180;
  const paddingX = 24;
  const paddingY = 20;

  const chartPoints = history.map((pt, i) => {
    const x = paddingX + (i / (history.length - 1)) * (chartWidth - paddingX * 2);
    const y =
      chartHeight -
      paddingY -
      ((pt.avgPrice - minPriceAll) / priceRange) * (chartHeight - paddingY * 2);
    return { x, y, pt };
  });

  const polylineStr = chartPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const activePoint = selectedPointIdx !== null ? chartPoints[selectedPointIdx] : chartPoints[chartPoints.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4">
      <div className="max-w-2xl w-full parchment-slip rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-[#78350F] max-h-[92vh] overflow-y-auto text-stone-900 animate-in fade-in zoom-in-95">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              {data.commodity === 'mango' && '🥭'}
              {data.commodity === 'citrus' && '🍊'}
              {data.commodity === 'dates' && '🌴'}
              {data.commodity === 'cotton' && '☁️'}
            </div>
            <div>
              <h3 className="text-2xl font-bold font-urdu text-stone-900">
                {data.commodityNameUr} — تفصیلی منڈی رپورٹ
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                ملتان، لاہور اور فیصل آباد مارکیٹ کا باہمی تقابل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRead}
              type="button"
              className="min-h-[44px] px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-amber-800 shrink-0" />
              <span>سنیں</span>
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rule-Based Plain-Urdu Hint & Mandatory Guidance Disclaimer */}
        <div
          className={`my-3 p-4 rounded-2xl border-2 space-y-1.5 ${
            hintTone === 'positive'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
              : hintTone === 'negative'
              ? 'bg-rose-50 border-rose-400 text-rose-950'
              : 'bg-amber-50 border-amber-400 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            {hintTone === 'positive' && <TrendingUp className="w-4 h-4 text-emerald-700" />}
            {hintTone === 'negative' && <TrendingDown className="w-4 h-4 text-rose-700" />}
            {hintTone === 'neutral' && <Minus className="w-4 h-4 text-amber-700" />}
            <span>خودکار منڈی رہنمائی اشاریہ (Automated Rule Hint)</span>
          </div>

          <p className="text-sm font-bold font-urdu leading-relaxed">
            "{ruleHintUrdu}"
          </p>

          {/* Mandatory Label: Guidance, not financial/trading advice */}
          <div className="pt-2 border-t border-current/20 flex items-start gap-1.5 text-[11px] opacity-80 leading-normal font-sans">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              <strong>ضروری وضاحت:</strong> یہ خودکار رہنمائی منڈی کے پچھلے 7 دنوں کے اوسط بھاؤ کے تقابل پر مبنی ہے اور صرف کسان بھائیوں کی عمومی آگاہی کے لیے ہے۔ یہ کوئی حتمی مالی یا تجارتی مشورہ نہیں ہے۔
            </span>
          </div>
        </div>

        {/* Market Comparison Table: Multan, Lahore, Faisalabad */}
        <div className="my-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 mb-2">
            <Building2 className="w-4 h-4 text-amber-800" />
            <span>تینوں بڑی منڈیوں کا لائیو ریٹ موازنہ (Rate Comparison Table):</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-amber-100/90 border-y-2 border-stone-800 text-stone-900 font-bold">
                  <th className="py-2.5 px-3 text-start">منڈی / شہر</th>
                  <th className="py-2.5 px-3 text-center">یومیہ آمد</th>
                  <th className="py-2.5 px-3 text-end">کم از کم (Min)</th>
                  <th className="py-2.5 px-3 text-end">زیادہ سے زیادہ (Max)</th>
                  <th className="py-2.5 px-3 text-end text-amber-950 bg-amber-200/60">
                    اوسط ریٹ (Avg)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-200 font-medium">
                {(['multan', 'lahore', 'faisalabad'] as const).map((city) => {
                  const m = data.markets[city];
                  return (
                    <tr key={city} className="hover:bg-amber-50/70">
                      <td className="py-3 px-3 font-bold text-stone-900 font-urdu text-sm">
                        {m.cityNameUr}
                      </td>
                      <td className="py-3 px-3 text-center text-stone-600 font-mono text-xs">
                        {m.arrivalsQuantity}
                      </td>
                      <td className="py-3 px-3 text-end font-mono font-bold text-stone-800">
                        <bdi dir="ltr">Rs. {m.minPrice}</bdi>
                      </td>
                      <td className="py-3 px-3 text-end font-mono font-bold text-stone-800">
                        <bdi dir="ltr">Rs. {m.maxPrice}</bdi>
                      </td>
                      <td className="py-3 px-3 text-end font-mono font-bold text-amber-950 bg-amber-100/40 text-sm">
                        <bdi dir="ltr">Rs. {m.avgPrice}</bdi>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 30-Day Interactive Chart */}
        <div className="my-4 p-4 rounded-2xl bg-white border-2 border-stone-200 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <Calendar className="w-4 h-4 text-amber-800" />
              <span>30 روزہ تاریخی قیمت چارٹ (30-Day Trend Curve)</span>
            </div>
            {activePoint && (
              <div className="text-end text-xs font-mono font-bold text-[#78350F]">
                <span>تاریخ: {activePoint.pt.fullDate}</span> ·{' '}
                <span>اوسط: Rs. {activePoint.pt.avgPrice}</span>
              </div>
            )}
          </div>

          {/* SVG Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 select-none"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = paddingY + pct * (chartHeight - paddingY * 2);
                const priceLabel = Math.round(maxPriceAll - pct * priceRange);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={chartWidth - 4}
                      y={y + 3}
                      fontSize="9"
                      fill="#94a3b8"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {priceLabel}
                    </text>
                  </g>
                );
              })}

              {/* Area Gradient fill */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#b45309" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#b45309" stop-opacity="0.0" />
                </linearGradient>
              </defs>
              <polygon
                points={`${paddingX},${chartHeight - paddingY} ${polylineStr} ${
                  chartWidth - paddingX
                },${chartHeight - paddingY}`}
                fill="url(#chartGrad)"
              />

              {/* Polyline */}
              <polyline
                fill="none"
                stroke="#78350F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />

              {/* Interactive Points */}
              {chartPoints.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={selectedPointIdx === idx ? 5 : 2.5}
                  fill={selectedPointIdx === idx ? '#b45309' : '#ffffff'}
                  stroke="#78350F"
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:scale-150"
                  onMouseEnter={() => setSelectedPointIdx(idx)}
                  onClick={() => setSelectedPointIdx(idx)}
                />
              ))}
            </svg>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-stone-500 pt-1 px-2 border-t border-stone-100">
            <span>30 دن قبل ({history[0]?.date})</span>
            <span>کلک کر کے یومیہ ریٹ دیکھیں</span>
            <span>آج ({history[history.length - 1]?.date})</span>
          </div>
        </div>

        {/* Price Alert Creation Section: "Tell me when mango passes X" */}
        <div className="my-4 p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Bell className="w-4 h-4 text-amber-800" />
            <span>ریٹ الرٹ سیٹ کریں (Price Alert Notification)</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            جب منڈی میں <strong>{data.commodityNameUr}</strong> کا ریٹ آپ کی مطلوبہ حد تک پہنچے تو فوری اطلاع دیجیے۔
          </p>

          <form onSubmit={handleCreateAlert} className="flex flex-col sm:flex-row gap-2.5">
            <select
              value={alertCondition}
              onChange={(e) => setAlertCondition(e.target.value as any)}
              className="h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold shrink-0"
            >
              <option value="above">جب قیمت بڑھ کر X ہو جائے (اوپر)</option>
              <option value="below">جب قیمت گر کر X ہو جائے (نیچے)</option>
            </select>

            <input
              type="number"
              dir="ltr"
              required
              value={alertTargetPrice}
              onChange={(e) => setAlertTargetPrice(e.target.value)}
              placeholder="ہدف ریٹ (مثلاً: 4800)"
              className="flex-1 h-11 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-mono font-bold"
            />

            <button
              type="submit"
              className="min-h-[44px] px-5 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-xl text-xs font-bold shadow-xs shrink-0"
            >
              الرٹ لگائیں
            </button>
          </form>

          {alertMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{alertMessage}</span>
            </div>
          )}
        </div>

        {/* Mandatory Source & Last Updated Stamp Footer */}
        <div className="pt-3 border-t-2 border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-1.5">
          <div className="flex items-center gap-1.5 font-bold text-stone-800">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>ماخذ: {data.dataSource}</span>
          </div>
          <div className="flex items-center gap-1 text-stone-500 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>آخری اپ ڈیٹ: {data.lastUpdated}</span>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-2">
          <button
            onClick={onClose}
            type="button"
            className="w-full min-h-[50px] bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-2xl text-sm"
          >
            بند کریں
          </button>
        </div>
      </div>
    </div>
  );
};
