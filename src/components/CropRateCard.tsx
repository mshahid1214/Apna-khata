import React from 'react';
import { CropMarketData } from '../services/priceProvider';
import { formatPKR } from '../services/formatters';
import { TrendingUp, TrendingDown, Minus, ChevronRight, Clock, Building2, Bell } from 'lucide-react';

interface CropRateCardProps {
  data: CropMarketData;
  onOpenDetail: (data: CropMarketData) => void;
  onOpenAlertModal: (data: CropMarketData) => void;
}

export const CropRateCard: React.FC<CropRateCardProps> = ({
  data,
  onOpenDetail,
  onOpenAlertModal,
}) => {
  const isUp = data.trendDirection === 'up';
  const isDown = data.trendDirection === 'down';

  // 7-day SVG Sparkline generator
  const trend = data.trend7Days;
  const minVal = Math.min(...trend);
  const maxVal = Math.max(...trend);
  const range = maxVal - minVal || 1;
  const width = 120;
  const height = 36;
  const points = trend
    .map((val, idx) => {
      const x = (idx / (trend.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = isUp ? '#059669' : isDown ? '#dc2626' : '#d97706';

  return (
    <div className="parchment-slip rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-3.5 transition-all hover:border-[#78350F]">
      {/* Top Header: Crop Name, Icon & Overall Average */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shrink-0 shadow-inner">
            {data.commodity === 'mango' && '🥭'}
            {data.commodity === 'citrus' && '🍊'}
            {data.commodity === 'dates' && '🌴'}
            {data.commodity === 'cotton' && '☁️'}
          </div>
          <div>
            <h3 className="text-xl font-bold font-urdu text-stone-900 leading-tight">
              {data.commodityNameUr}
            </h3>
            <span className="text-xs text-stone-500 font-semibold">
              پیمانہ: {data.unit}
            </span>
          </div>
        </div>

        {/* 7-Day Trend Badge & Arrow */}
        <div className="text-end">
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-bold border ${
              isUp
                ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                : isDown
                ? 'bg-rose-100 text-rose-950 border-rose-300'
                : 'bg-amber-100 text-amber-950 border-amber-300'
            }`}
          >
            {isUp && <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />}
            {isDown && <TrendingDown className="w-3.5 h-3.5 text-rose-700" />}
            {!isUp && !isDown && <Minus className="w-3.5 h-3.5 text-amber-700" />}
            <bdi dir="ltr">{data.change7DaysPct > 0 ? `+${data.change7DaysPct}%` : `${data.change7DaysPct}%`}</bdi>
          </div>
          <span className="block text-[10px] text-stone-500 mt-0.5">7 روزہ رجحان</span>
        </div>
      </div>

      {/* Big Average Price & 7-Day Sparkline */}
      <div className="flex items-center justify-between bg-white/90 p-3.5 rounded-2xl border border-stone-200">
        <div>
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            پنجاب اوسط ہول سیل ریٹ
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-950 mt-0.5">
            <bdi dir="ltr">{formatPKR(data.overallAvg, 'ur')}</bdi>
          </div>
          <div className="text-[11px] text-stone-500 font-mono mt-0.5">
            کم از کم: {data.overallMin} · زیادہ سے زیادہ: {data.overallMax}
          </div>
        </div>

        {/* Sparkline Graphic */}
        <div className="text-end shrink-0 ps-2">
          <svg width={width} height={height} className="overflow-visible inline-block">
            <polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
            {/* End dot */}
            {points.split(' ').slice(-1).map((pt, i) => {
              const [x, y] = pt.split(',');
              return <circle key={i} cx={x} cy={y} r="3.5" fill={strokeColor} />;
            })}
          </svg>
          <span className="block text-[9px] font-mono text-stone-400 text-center mt-1">
            7-Day Sparkline
          </span>
        </div>
      </div>

      {/* 3-City Wholesale Market Grid: Multan, Lahore, Faisalabad */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-2">
          <Building2 className="w-3.5 h-3.5 text-amber-800" />
          <span>اہم منڈیوں کا آج کا جائزہ (Multan, Lahore, Faisalabad):</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Multan */}
          <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-center">
            <span className="text-[11px] font-bold text-stone-900 block font-urdu">
              ملتان منڈی
            </span>
            <div className="text-xs sm:text-sm font-bold font-mono text-[#78350F] mt-1">
              <bdi dir="ltr">Rs. {data.markets.multan.avgPrice}</bdi>
            </div>
            <div className="text-[10px] text-stone-500 font-mono mt-0.5">
              {data.markets.multan.minPrice}-{data.markets.multan.maxPrice}
            </div>
          </div>

          {/* Lahore */}
          <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-center">
            <span className="text-[11px] font-bold text-stone-900 block font-urdu">
              لاہور منڈی
            </span>
            <div className="text-xs sm:text-sm font-bold font-mono text-[#78350F] mt-1">
              <bdi dir="ltr">Rs. {data.markets.lahore.avgPrice}</bdi>
            </div>
            <div className="text-[10px] text-stone-500 font-mono mt-0.5">
              {data.markets.lahore.minPrice}-{data.markets.lahore.maxPrice}
            </div>
          </div>

          {/* Faisalabad */}
          <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-center">
            <span className="text-[11px] font-bold text-stone-900 block font-urdu">
              فیصل آباد
            </span>
            <div className="text-xs sm:text-sm font-bold font-mono text-[#78350F] mt-1">
              <bdi dir="ltr">Rs. {data.markets.faisalabad.avgPrice}</bdi>
            </div>
            <div className="text-[10px] text-stone-500 font-mono mt-0.5">
              {data.markets.faisalabad.minPrice}-{data.markets.faisalabad.maxPrice}
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Source & Timestamp Label (Rule: Never show prices without a source label) */}
      <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-600 gap-1 font-sans">
        <div className="flex items-center gap-1 font-semibold text-stone-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          <span>ماخذ: {data.dataSource}</span>
        </div>
        <div className="flex items-center gap-1 text-stone-500 font-mono">
          <Clock className="w-3 h-3 text-stone-400" />
          <span>{data.lastUpdated}</span>
        </div>
      </div>

      {/* Action Buttons (Min 56px touch target area) */}
      <div className="pt-2 flex items-center gap-2">
        <button
          onClick={() => onOpenDetail(data)}
          type="button"
          className="flex-1 min-h-[50px] px-4 rounded-xl bg-[#78350F] hover:bg-amber-900 text-amber-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-98"
        >
          <span>تفصیلی موازنہ اور 30 روزہ چارٹ دیکھیں</span>
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>

        <button
          onClick={() => onOpenAlertModal(data)}
          type="button"
          className="min-h-[50px] min-w-[50px] px-3 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-xl font-bold flex items-center justify-center transition-colors"
          title="ریٹ الرٹ لگائیں"
        >
          <Bell className="w-4 h-4 text-amber-900" />
        </button>
      </div>
    </div>
  );
};
