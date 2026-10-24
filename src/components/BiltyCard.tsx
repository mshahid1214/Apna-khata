import React, { useState } from 'react';
import { Bilty } from '../types';
import { biltyRepository } from '../repositories/biltyRepository';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../services/formatters';
import { StampSeal } from './StampSeal';
import {
  Truck,
  MapPin,
  Calendar,
  User,
  Share2,
  Printer,
  CheckCircle2,
  ArrowRight,
  Clock,
  FileText,
  Volume2,
} from 'lucide-react';

interface BiltyCardProps {
  bilty: Bilty;
  onDelivered: () => void;
}

export const BiltyCard: React.FC<BiltyCardProps> = ({ bilty, onDelivered }) => {
  const { currentRole, t, speak } = useApp();
  const [isMarking, setIsMarking] = useState(false);

  const isDelivered = bilty.status === 'delivered';

  const handleMarkDelivered = async () => {
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('en-GB')}، ${now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })}`;
    await biltyRepository.markDelivered(bilty.id, timeStr, 'وصول کنندہ نے بحفاظت مال وصول کر کے تصدیق کر دی۔');
    speak('بلٹی مکمل اور منزل پر سپردگی تصدیق ہو گئی۔ منسلک لاٹ کی ٹائم لائن اپ ڈیٹ کر دی گئی ہے۔');
    onDelivered();
    setIsMarking(false);
  };

  const handleShareWhatsApp = () => {
    const text = `*ٹرانسپورٹ بلٹی کنسائنمنٹ*: ${bilty.biltyNumber}\nتاریخ: ${bilty.date}\nگاڑی نمبر: ${bilty.vehicleNumber}\nڈرائیور: ${bilty.driverName}\nروانگی: ${bilty.origin}\nمنزل: ${bilty.destination}\nمال: ${bilty.lotSummary}\nتعداد: ${bilty.quantity} ${bilty.unit}\nکل کرایہ: Rs. ${bilty.freightPKR.toLocaleString()}\nپیشگی ادا: Rs. ${bilty.advancePaidPKR.toLocaleString()}\nبقایا عند الوصول: Rs. ${bilty.balancePayablePKR.toLocaleString()}\nحالت: ${isDelivered ? 'منزل پر پہنچ گیا (Delivered)' : 'راستے میں (In Transit)'}\nریکارڈ بذریعہ: اپنا کھاتہ (Apna Khata)`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRead = () => {
    const text = `بلٹی نمبر ${bilty.biltyNumber}۔ گاڑی نمبر ${bilty.vehicleNumber}۔ ڈرائیور ${bilty.driverName}۔ روانگی ${bilty.origin}، منزل ${bilty.destination}۔ کل کرایہ ${bilty.freightPKR} روپے۔ بقایا عند الوصول ${bilty.balancePayablePKR} روپے۔ حالت: ${isDelivered ? 'منزل پر پہنچ چکا ہے' : 'راستے میں ہے'}۔`;
    speak(text);
  };

  return (
    <div className="parchment-slip rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-md space-y-4 hover:border-[#78350F] transition-all">
      {/* Header: Bilty Number, Status & Seals */}
      <div className="flex items-start justify-between pb-3 border-b-2 border-stone-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0 shadow-inner">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                ٹرانسپورٹ بلٹی (Consignment)
              </span>
              <span className="text-xs font-mono font-bold text-stone-500">
                {bilty.biltyNumber}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-urdu text-stone-900 mt-0.5">
              {bilty.vehicleNumber}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio narration button */}
          <button
            onClick={handleRead}
            type="button"
            className="w-10 h-10 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center transition-colors"
            title="سنیں"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Status Stamp */}
          <div className="shrink-0 text-end">
            <StampSeal
              label={isDelivered ? 'سپردگی مکمل' : 'مال لوڈ شدہ'}
              subLabel={isDelivered ? 'وصول تصدیق' : 'راستے میں'}
              color={isDelivered ? 'emerald' : 'indigo'}
            />
          </div>
        </div>
      </div>

      {/* Transit Route Strip: Origin -> Destination */}
      <div className="p-3 bg-white/90 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-stone-900 font-urdu truncate">
          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="truncate">{bilty.origin}</span>
        </div>

        <div className="px-2 shrink-0 flex items-center text-stone-400">
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </div>

        <div className="flex items-center gap-1.5 font-bold text-stone-900 font-urdu truncate text-end">
          <MapPin className="w-4 h-4 text-rose-700 shrink-0" />
          <span className="truncate">{bilty.destination}</span>
        </div>
      </div>

      {/* Parties & Cargo Description */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 text-xs">
        <div>
          <span className="text-[10px] text-stone-500 font-bold block uppercase">بھیجنے والا (Sender)</span>
          <span className="font-bold text-stone-900 text-sm font-urdu block">{bilty.senderName}</span>
        </div>

        <div>
          <span className="text-[10px] text-stone-500 font-bold block uppercase">وصول کنندہ (Receiver)</span>
          <span className="font-bold text-stone-900 text-sm font-urdu block">{bilty.receiverName}</span>
        </div>

        <div className="sm:col-span-2 pt-2 border-t border-amber-200/70">
          <span className="text-[10px] text-stone-500 font-bold block uppercase">مال کی تفصیل (Cargo / Lot)</span>
          <span className="font-bold text-stone-900 text-sm block font-urdu">
            {bilty.lotSummary}
          </span>
          <span className="text-xs text-stone-600 font-mono mt-0.5 block">
            تعداد: {bilty.quantity} {bilty.unit === 'peti' ? 'پیٹی' : bilty.unit === 'man' ? 'من' : bilty.unit}
          </span>
        </div>
      </div>

      {/* Driver & Digital Signature */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/90 rounded-2xl border border-stone-200 text-xs">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-amber-800 shrink-0" />
          <div>
            <strong className="text-stone-900 font-urdu">{bilty.driverName}</strong>
            <span className="block text-[10px] text-stone-500 font-mono">
              تاریخ: {bilty.date} {bilty.signedAt && `· ${bilty.signedAt}`}
            </span>
          </div>
        </div>

        {/* Digital Signature Render */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="p-1 px-3 border border-stone-300 rounded-xl bg-stone-50 text-center">
            {bilty.signatureDataUrl ? (
              <img
                src={bilty.signatureDataUrl}
                alt="دستخط"
                className="h-8 max-w-[120px] object-contain inline-block"
              />
            ) : (
              <span className="text-xs font-serif italic text-stone-600 block">
                {bilty.signedByName || 'دستخط شدہ'}
              </span>
            )}
            <span className="text-[9px] text-stone-400 block font-mono">دستخط ڈرائیور</span>
          </div>
        </div>
      </div>

      {/* Freight Math Breakdown (کل کرایہ، پیشگی، اور بقایا عند الوصول) */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-amber-100/60 rounded-2xl border border-amber-300 text-center">
        <div>
          <span className="text-[10px] text-stone-600 font-bold block">کل کرایہ</span>
          <div className="text-xs sm:text-sm font-bold font-mono text-stone-900 mt-0.5">
            <bdi dir="ltr">Rs. {bilty.freightPKR.toLocaleString()}</bdi>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-stone-600 font-bold block">پیشگی ادا شدہ</span>
          <div className="text-xs sm:text-sm font-bold font-mono text-stone-900 mt-0.5">
            <bdi dir="ltr">Rs. {bilty.advancePaidPKR.toLocaleString()}</bdi>
          </div>
        </div>

        <div className="bg-white/90 p-1 rounded-xl border border-amber-300">
          <span className="text-[10px] text-[#78350F] font-bold block">بقایا عند الوصول</span>
          <div className="text-xs sm:text-sm font-bold font-mono text-[#78350F] mt-0.5">
            <bdi dir="ltr">Rs. {bilty.balancePayablePKR.toLocaleString()}</bdi>
          </div>
        </div>
      </div>

      {/* Action Buttons (Min 56px touch target area) */}
      <div className="pt-2 flex flex-wrap items-center gap-2">
        {/* Deliver Action Button */}
        {!isDelivered ? (
          <button
            onClick={handleMarkDelivered}
            type="button"
            className="flex-1 min-h-[50px] px-3.5 bg-emerald-800 hover:bg-emerald-900 text-emerald-50 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>منزل پر پہنچ گیا (سپردگی تصدیق)</span>
          </button>
        ) : (
          <div className="flex-1 min-h-[50px] px-3.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>بحفاظت سپردگی مکمل ({bilty.deliveredAt})</span>
          </div>
        )}

        {/* Print / PDF */}
        <button
          onClick={handlePrint}
          type="button"
          className="min-h-[50px] px-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1"
          title="بلٹی پرنٹ کریں"
        >
          <Printer className="w-4 h-4" />
          <span>پرنٹ</span>
        </button>

        {/* WhatsApp Share */}
        <button
          onClick={handleShareWhatsApp}
          type="button"
          className="min-h-[50px] px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1"
          title="واٹس ایپ شیئر"
        >
          <Share2 className="w-4 h-4" />
          <span>شیئر</span>
        </button>
      </div>
    </div>
  );
};
