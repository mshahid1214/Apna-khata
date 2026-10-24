import React from 'react';
import { SaleSlip } from '../types';
import { formatPKR } from '../services/formatters';
import { StampSeal } from './StampSeal';
import { ShieldCheck, CheckCircle2, AlertTriangle, X, Printer } from 'lucide-react';

interface PublicSlipVerificationModalProps {
  slip: SaleSlip | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PublicSlipVerificationModal: React.FC<PublicSlipVerificationModalProps> = ({
  slip,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !slip) return null;

  const isCancelled = slip.status === 'cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4">
      <div className="max-w-md w-full bg-[#FFFDF7] rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-[#78350F] relative animate-in fade-in zoom-in-95 text-stone-900">
        <button
          onClick={onClose}
          className="absolute top-4 end-4 w-9 h-9 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Verification Badge */}
        <div className="text-center pb-3 border-b-2 border-stone-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-950 font-bold text-xs mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>سرکاری و ڈیجیٹل تصدیق شدہ ریکارڈ</span>
          </div>

          <h3 className="text-2xl font-bold font-urdu text-stone-950">
            منڈی رسید تصدیقی سند
          </h3>
          <p className="text-xs font-mono font-bold text-stone-600 mt-1">
            سریل نمبر: {slip.serialNumber}
          </p>
        </div>

        {/* Status Callout */}
        <div
          className={`p-3 rounded-2xl my-3 flex items-center gap-2.5 ${
            isCancelled
              ? 'bg-rose-100 border-2 border-rose-500 text-rose-950'
              : 'bg-emerald-50 border-2 border-emerald-400 text-emerald-950'
          }`}
        >
          {isCancelled ? (
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          )}
          <div className="text-xs">
            <span className="font-bold block">
              {isCancelled ? 'یہ پرچی منسوخ (Cancelled) ہو چکی ہے' : 'پرچی مصدقہ اور فعال ہے'}
            </span>
            {isCancelled && slip.cancelledReason && (
              <span className="text-[11px] text-rose-800 mt-0.5 block">
                وجہ منسوخی: {slip.cancelledReason}
              </span>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 text-xs border-y border-amber-200 py-3">
          <div className="flex justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500 font-semibold">تاریخ اجرا:</span>
            <bdi dir="ltr" className="font-mono font-bold text-stone-900">{slip.date}</bdi>
          </div>
          <div className="flex justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500 font-semibold">آڑھت و دفتر:</span>
            <span className="font-bold text-stone-900">{slip.arhtiName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500 font-semibold">کسان (فروخت کنندہ):</span>
            <span className="font-bold text-stone-900">{slip.farmerName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500 font-semibold">خریدار (بیوپاری):</span>
            <span className="font-bold text-stone-900">{slip.buyerName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500 font-semibold">جنس و کوالٹی:</span>
            <span className="font-bold text-stone-900">{slip.variety} ({slip.grade})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500 font-semibold">خالص وزن و تعداد:</span>
            <span className="font-mono font-bold text-stone-900">
              {slip.crateCount} پیٹی · {slip.netWeight} {slip.unit}
            </span>
          </div>
          <div className="flex justify-between py-1.5 bg-amber-100/70 p-2 rounded-xl text-stone-900 font-bold">
            <span className="text-sm">خالص واجب الادا رقم:</span>
            <span className="text-sm font-mono text-[#78350F]">
              <bdi dir="ltr">{formatPKR(slip.netPayable, 'ur')}</bdi>
            </span>
          </div>
        </div>

        {/* Seal */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-[10px] text-stone-500 max-w-[200px]">
            یہ تصدیقی سند اپنا کھاتہ کے محفوظ ڈیجیٹل سرور پر باضابطہ تصدیق شدہ ہے۔
          </div>
          <StampSeal
            date={slip.date}
            color={isCancelled ? 'crimson' : 'emerald'}
            label={isCancelled ? 'منسوخ شدہ رسید' : 'مصدقہ رسید'}
            subLabel="QR تصدیق"
          />
        </div>

        {/* Buttons */}
        <div className="mt-4 pt-3 border-t border-amber-200 flex items-center gap-2">
          <button
            onClick={() => window.print()}
            type="button"
            className="flex-1 h-11 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>پرنٹ کریں</span>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="flex-1 h-11 bg-[#78350F] text-amber-50 rounded-xl font-bold text-xs"
          >
            بند کریں
          </button>
        </div>
      </div>
    </div>
  );
};
