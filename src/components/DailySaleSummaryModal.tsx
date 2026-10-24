import React, { useEffect, useState } from 'react';
import { SaleSlip, Commodity } from '../types';
import { formatPKR } from '../services/formatters';
import { COMMODITY_KEYS } from '../constants/app';
import { BarChart3, X, Printer, Volume2, Calendar } from 'lucide-react';
import { saleSlipRepository } from '../repositories/saleSlipRepository';

interface DailySaleSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReadAloud?: (text: string) => void;
}

export const DailySaleSummaryModal: React.FC<DailySaleSummaryModalProps> = ({
  isOpen,
  onClose,
  onReadAloud,
}) => {
  const [summaryData, setSummaryData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('all'); // 'all' or specific DD/MM/YYYY

  const loadSummary = async () => {
    const data = await saleSlipRepository.getDailySummary(selectedDate);
    setSummaryData(data);
  };

  useEffect(() => {
    if (isOpen) {
      loadSummary();
    }
  }, [isOpen, selectedDate]);

  if (!isOpen || !summaryData) return null;

  const handleRead = () => {
    const text = `یومیہ منڈی رپورٹ۔ کل ${summaryData.totalSlips} فعال پرچیاں۔ کل وزن ${Math.round(
      summaryData.totalWeight
    )} کلوگرام ہے۔ کل مالیت ${summaryData.totalGross} روپے۔ خالص واجب الادا ${
      summaryData.totalNet
    } روپے۔`;
    if (onReadAloud) onReadAloud(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4">
      <div className="max-w-2xl w-full bg-[#FFFDF7] rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-[#78350F] max-h-[92vh] overflow-y-auto text-stone-900 animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-urdu text-stone-900">یومیہ منڈی سمری و جائزہ</h3>
              <p className="text-xs text-stone-600">
                کل نیلامی، وزن اور اجناس کا تفصیلی گوشوارہ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRead}
              type="button"
              className="min-h-[40px] px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1"
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

        {/* Date Filter Tabs */}
        <div className="flex items-center justify-between mt-3 py-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate('all')}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedDate === 'all'
                  ? 'bg-[#78350F] text-amber-50 border-[#78350F]'
                  : 'bg-white text-stone-700 border-stone-300'
              }`}
            >
              تمام سیزن
            </button>
            <button
              onClick={() => setSelectedDate(new Date().toLocaleDateString('en-GB'))}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedDate !== 'all'
                  ? 'bg-[#78350F] text-amber-50 border-[#78350F]'
                  : 'bg-white text-stone-700 border-stone-300'
              }`}
            >
              آج کا دن ({new Date().toLocaleDateString('en-GB')})
            </button>
          </div>

          <span className="text-xs font-mono font-bold text-stone-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
            {summaryData.totalSlips} فعال پرچیاں
          </span>
        </div>

        {/* Top 3 Big KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="bg-white/90 p-3.5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-bold text-stone-500 block">کل خالص وزن (Net Weight)</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-stone-900 mt-1">
              <bdi dir="ltr">{Math.round(summaryData.totalWeight).toLocaleString('en-US')} kg</bdi>
            </div>
            <span className="text-[11px] text-stone-500 font-sans block mt-0.5">
              ≈ {Math.round(summaryData.totalWeight / 40).toLocaleString('en-US')} من
            </span>
          </div>

          <div className="bg-white/90 p-3.5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-bold text-stone-500 block">کل مجموعی مالیت (Gross)</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-stone-900 mt-1">
              <bdi dir="ltr">{formatPKR(summaryData.totalGross, 'ur')}</bdi>
            </div>
            <span className="text-[11px] text-stone-500 font-sans block mt-0.5">
              بشمول منڈی کٹوتیاں
            </span>
          </div>

          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-300 shadow-xs">
            <span className="text-xs font-bold text-emerald-900 block">خالص ادائیگی (Net Payable)</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-950 mt-1">
              <bdi dir="ltr">{formatPKR(summaryData.totalNet, 'ur')}</bdi>
            </div>
            <span className="text-[11px] text-emerald-800 font-sans block mt-0.5">
              کسانوں کا خالص حق
            </span>
          </div>
        </div>

        {/* Commodity Breakdown Cards */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-stone-900 font-urdu border-b border-amber-200 pb-1.5">
            فصل اور جنس کے لحاظ سے تفصیلی تقسیم:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMMODITY_KEYS.map((k: Commodity) => {
              const item = summaryData.byCommodity[k];
              if (!item) return null;

              return (
                <div
                  key={k}
                  className="bg-white/95 p-3.5 rounded-2xl border border-stone-200 shadow-xs flex items-start gap-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shrink-0">
                    {k === 'mango' && '🥭'}
                    {k === 'citrus' && '🍊'}
                    {k === 'dates' && '🌴'}
                    {k === 'cotton' && '☁️'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm font-urdu text-stone-900">
                        {k === 'mango' && 'آم (Mango)'}
                        {k === 'citrus' && 'کنو / مالٹا (Citrus)'}
                        {k === 'dates' && 'کھجور (Dates)'}
                        {k === 'cotton' && 'کپاس (Cotton)'}
                      </span>
                      <span className="text-[11px] font-mono font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-stone-700">
                        {item.count} پرچیاں
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-xs mt-2 text-stone-600">
                      <div>
                        وزن: <bdi dir="ltr" className="font-mono font-bold text-stone-900">{item.weight} kg</bdi>
                      </div>
                      <div>
                        پیٹی: <bdi dir="ltr" className="font-mono font-bold text-stone-900">{item.crates}</bdi>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-stone-100 font-semibold text-emerald-900">
                        خالص رقم:{' '}
                        <bdi dir="ltr" className="font-mono font-bold">
                          {formatPKR(item.net, 'ur')}
                        </bdi>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Print & Close Controls */}
        <div className="mt-5 pt-3 border-t border-amber-200 flex items-center gap-3">
          <button
            onClick={() => window.print()}
            type="button"
            className="flex-1 min-h-[48px] rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>گوشوارہ پرنٹ کریں</span>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="flex-1 min-h-[48px] rounded-xl bg-[#78350F] text-amber-50 font-bold text-xs"
          >
            بند کریں
          </button>
        </div>
      </div>
    </div>
  );
};
