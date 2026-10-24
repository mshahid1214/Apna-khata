import React from 'react';
import { Lot } from '../types';
import { useApp } from '../context/AppContext';
import { QRCodeView } from './QRCodeView';
import { StampSeal } from './StampSeal';
import {
  X,
  Volume2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Layers,
  Info,
  ExternalLink,
} from 'lucide-react';

interface PublicLotVerificationModalProps {
  lot: Lot | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PublicLotVerificationModal: React.FC<PublicLotVerificationModalProps> = ({
  lot,
  isOpen,
  onClose,
}) => {
  const { speak } = useApp();

  if (!isOpen || !lot) return null;

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?lotId=${lot.id}`
    : `https://apnakhata.pk/lot/${lot.id}`;

  const handleReadAloud = () => {
    const text = `عوامی ٹریس ایبلٹی رپورٹ۔ لاٹ نمبر ${lot.lotNumber}۔ فصل ${lot.variety}، درجہ ${lot.grade}۔ مقدار ${lot.quantity} ${lot.unit}۔ تاریخ چنائی ${lot.harvestDate}۔ باغ کا مقام: ${lot.farmName}۔ کل ${lot.timeline.length} سنگ میل درج ہیں۔`;
    speak(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4">
      <div className="max-w-2xl w-full parchment-slip rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-[#78350F] max-h-[92vh] overflow-y-auto text-stone-900 animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-emerald-800" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                عوامی لاٹ تصدیق (Public Verification)
              </span>
              <h3 className="text-2xl font-bold font-urdu text-stone-900 mt-0.5">
                زرعی لاٹ پاسپورٹ و ٹریس ایبلٹی
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReadAloud}
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

        {/* Mandatory Voluntary Traceability Disclaimer & Privacy Notice */}
        <div className="my-3 p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-300 text-xs text-stone-700 space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <Info className="w-4 h-4 text-amber-800 shrink-0" />
            <span>رضاکارانہ زرعی ٹریس ایبلٹی برائے شفافیت (Voluntary Traceability)</span>
          </div>
          <p>
            یہ تصدیقی صفحہ صرف غیر حساس زرعی معلومات (فصل، مقدار، تاریخ چنائی اور سپلائی چین کے سنگ میل) ظاہر کرتا ہے۔ تجارتی رازداری کے تحت کسان اور خریدار کے فون نمبر اور مالی سودے / قیمتیں یہاں ظاہر نہیں کی جاتیں۔
          </p>
          <div className="pt-1.5 border-t border-amber-200 text-[11px] text-stone-600">
            <strong>قانونی وضاحت:</strong> یہ ریکارڈ کسان و خریدار کے باہمی اعتماد کے لیے رضاکارانہ ہے۔ اس میں کسٹمز یا سرکاری قانونی تعمیل کا کوئی دعویٰ شامل نہیں ہے۔
          </div>
        </div>

        {/* Passport Card Presentation */}
        <div className="bg-white/95 rounded-2xl p-5 border-2 border-stone-300 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-3">
            <div>
              <div className="text-xs font-mono font-bold text-stone-500">
                لاٹ شناخت: <span className="text-[#78350F] text-sm">{lot.lotNumber}</span>
              </div>
              <h4 className="text-2xl font-bold font-urdu text-stone-900 mt-0.5">
                {lot.variety}
              </h4>
              <p className="text-xs text-stone-600">
                درجہ بندی: <strong>{lot.grade}</strong>
              </p>
            </div>

            {/* QR Code Graphic */}
            <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
              <QRCodeView value={publicUrl} size={88} />
            </div>
          </div>

          {/* Non-Sensitive Lot Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
            <div>
              <span className="text-[10px] text-stone-500 font-bold block uppercase">کل مقدار</span>
              <span className="font-bold font-mono text-stone-900 text-sm">
                <bdi dir="ltr">{lot.quantity} {lot.unit === 'peti' ? 'پیٹی' : lot.unit === 'man' ? 'من' : 'کلو'}</bdi>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-stone-500 font-bold block uppercase">تاریخ چنائی (Harvest)</span>
              <span className="font-bold font-mono text-stone-900 text-sm">{lot.harvestDate}</span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-stone-500 font-bold block uppercase">باغبان کا نام</span>
              <span className="font-bold font-urdu text-stone-900 text-sm">{lot.farmerName}</span>
            </div>
          </div>

          {/* Origin Region */}
          <div className="flex items-center gap-2 text-xs text-stone-700 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
            <MapPin className="w-4 h-4 text-amber-800 shrink-0" />
            <div>
              <strong>پیداواری فارم / علاقہ:</strong> {lot.farmName}
              {lot.farmGpsPin && (
                <span className="font-mono text-stone-500 ms-2 text-[11px]">
                  ({lot.farmGpsPin})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Public Append-Only Timeline */}
        <div className="my-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-stone-300">
            <h4 className="font-bold text-stone-900 font-urdu text-base">
              فصل کا تصدیق شدہ سفر (Timeline Milestones)
            </h4>
            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
              {lot.timeline.length} مراحل مکمل
            </span>
          </div>

          <div className="relative border-s-2 border-emerald-600 ms-3 space-y-4 pt-1">
            {lot.timeline.map((evt, idx) => (
              <div key={evt.id || idx} className="relative ps-5">
                <div className="absolute -start-[13px] top-0.5 w-6 h-6 rounded-full bg-emerald-100 border-2 border-emerald-700 flex items-center justify-center text-[10px] font-bold text-emerald-900">
                  ✓
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm font-urdu text-stone-900">
                      {evt.stageTitleUr}
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      {evt.timestamp}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600">
                    <strong>مقام:</strong> {evt.location} · <strong>درج کنندہ:</strong> {evt.recordedBy}
                  </div>

                  {evt.notes && (
                    <p className="text-xs text-stone-700 font-medium bg-stone-50 p-2 rounded-lg mt-1 border border-stone-200">
                      {evt.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Close */}
        <div className="mt-4 pt-3 border-t-2 border-stone-800">
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
