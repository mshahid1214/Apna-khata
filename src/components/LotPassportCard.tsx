import React from 'react';
import { Lot } from '../types';
import { QRCodeView } from './QRCodeView';
import { StampSeal } from './StampSeal';
import {
  Calendar,
  MapPin,
  Tag,
  Scale,
  Clock,
  Printer,
  Share2,
  ChevronRight,
  PlusCircle,
  ShieldCheck,
  QrCode,
} from 'lucide-react';

interface LotPassportCardProps {
  lot: Lot;
  onViewTimeline: (lot: Lot) => void;
  onAddEvent: (lot: Lot) => void;
  onOpenPublicVerify: (lot: Lot) => void;
}

export const LotPassportCard: React.FC<LotPassportCardProps> = ({
  lot,
  onViewTimeline,
  onAddEvent,
  onOpenPublicVerify,
}) => {
  const latestEvent = lot.timeline[lot.timeline.length - 1];

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const publicUrl = `${window.location.origin}${window.location.pathname}?lotId=${lot.id}`;
    const text = `زرعی لاٹ پاسپورٹ: ${lot.lotNumber}\nفصل: ${lot.crop === 'mango' ? 'آم چونسا' : lot.crop === 'citrus' ? 'کنو مالٹا' : lot.crop === 'dates' ? 'کھجور اصیل' : 'کپاس پھٹی'}\nتعداد: ${lot.quantity} ${lot.unit}\nفارم: ${lot.farmName}\nآن لائن ٹائم لائن تصدیق:\n${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="parchment-slip rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-md space-y-4 hover:border-[#78350F] transition-all">
      {/* Top Header: Passport Badge & Stamp */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shrink-0 shadow-inner">
            {lot.crop === 'mango' && '🥭'}
            {lot.crop === 'citrus' && '🍊'}
            {lot.crop === 'dates' && '🌴'}
            {lot.crop === 'cotton' && '☁️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                زرعی لاٹ پاسپورٹ
              </span>
              <span className="text-[10px] font-mono font-bold text-stone-500">
                {lot.lotNumber}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-urdu text-stone-900 mt-0.5">
              {lot.variety}
            </h3>
          </div>
        </div>

        {/* Voluntary Traceability Stamp */}
        <div className="shrink-0 text-end">
          <StampSeal label="لاٹ مصدقہ" subLabel="رضاکارانہ پاسپورٹ" color="emerald" />
          <span className="block text-[9px] text-stone-500 font-mono mt-0.5">
            {lot.isSample ? 'SAMPLE' : 'VERIFIED'}
          </span>
        </div>
      </div>

      {/* Main Lot Passport Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/85 p-3.5 rounded-2xl border border-stone-200 text-xs">
        <div>
          <span className="text-[10px] font-bold text-stone-500 block uppercase">درجہ بندی (Grade)</span>
          <span className="font-bold font-urdu text-stone-900 text-sm">{lot.grade}</span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-stone-500 block uppercase">مقدار و پیمانہ</span>
          <span className="font-bold font-mono text-stone-900 text-sm">
            <bdi dir="ltr">
              {lot.quantity} {lot.unit === 'peti' ? 'پیٹی' : lot.unit === 'man' ? 'من' : lot.unit === 'kg' ? 'کلو' : 'بوریاں'}
            </bdi>
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-stone-500 block uppercase">تاریخ چنائی</span>
          <span className="font-bold font-mono text-stone-900 text-sm">{lot.harvestDate}</span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-stone-500 block uppercase">باغبان / کسان</span>
          <span className="font-bold font-urdu text-stone-900 text-sm truncate block">{lot.farmerName}</span>
        </div>
      </div>

      {/* Origin Farm & Optional GPS Coordinates */}
      <div className="flex items-center gap-2 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-stone-700">
        <MapPin className="w-4 h-4 text-amber-800 shrink-0" />
        <div className="flex-1 truncate">
          <strong className="font-urdu text-stone-900">باغ / فارم کا پتہ:</strong> {lot.farmName}
          {lot.farmGpsPin && (
            <span className="font-mono text-stone-500 ms-2 text-[11px]">
              ({lot.farmGpsPin})
            </span>
          )}
        </div>
      </div>

      {/* Latest Timeline Milestone Indicator */}
      <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-800 shrink-0" />
          <div>
            <span className="font-bold text-stone-900 block font-urdu">
              آخری پیش رفت: {latestEvent ? latestEvent.stageTitleUr : 'چنائی مکمل'}
            </span>
            <span className="text-[10px] text-stone-500 font-mono">
              {latestEvent?.timestamp} · {latestEvent?.recordedBy}
            </span>
          </div>
        </div>

        <span className="font-bold text-[11px] bg-amber-200/90 text-amber-950 px-2.5 py-1 rounded-xl">
          {lot.timeline.length} سنگ میل
        </span>
      </div>

      {/* Action Buttons (Min 56px touch target area) */}
      <div className="pt-2 flex flex-wrap items-center gap-2">
        {/* View Timeline Button (Primary) */}
        <button
          onClick={() => onViewTimeline(lot)}
          type="button"
          className="flex-1 min-h-[50px] px-3.5 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-98"
        >
          <span>ٹائم لائن دیکھیں ({lot.timeline.length})</span>
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>

        {/* Add Event Button */}
        <button
          onClick={() => onAddEvent(lot)}
          type="button"
          className="min-h-[50px] px-3 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          title="نئی پیش رفت شامل کریں"
        >
          <PlusCircle className="w-4 h-4 text-amber-800" />
          <span>پیش رفت درج کریں</span>
        </button>

        {/* QR Code & Public Verify Link */}
        <button
          onClick={() => onOpenPublicVerify(lot)}
          type="button"
          className="min-h-[50px] px-3 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-2xs"
          title="عوامی ٹائم لائن اور QR کوڈ"
        >
          <QrCode className="w-4 h-4 text-[#78350F]" />
          <span>QR تصدیق</span>
        </button>

        {/* Print / Save PDF */}
        <button
          onClick={handlePrint}
          type="button"
          className="w-11 h-[50px] bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl flex items-center justify-center"
          title="پاسپورٹ پرنٹ کریں"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* WhatsApp Share */}
        <button
          onClick={handleShare}
          type="button"
          className="w-11 h-[50px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl flex items-center justify-center"
          title="واٹس ایپ شیئر"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
