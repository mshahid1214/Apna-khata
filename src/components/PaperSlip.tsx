import React from 'react';
import { Slip } from '../types';
import { formatPKR } from '../services/formatters';
import { StampSeal } from './StampSeal';
import { Volume2, Printer, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PaperSlip: React.FC<{ slip: Slip; onReadAloud?: (slip: Slip) => void }> = ({
  slip,
  onReadAloud,
}) => {
  const { language, t, speak } = useApp();

  const handleRead = () => {
    if (onReadAloud) {
      onReadAloud(slip);
    } else {
      const urduSpeech = `پرچی نمبر ${slip.slipNumber}۔ کھاتہ دار ${slip.partyName}۔ جنس ${slip.variety}۔ خالص وزن ${slip.netWeight} ${slip.unit}۔ کل مالیت ${slip.grossAmountPKR} روپے۔ خالص واجب الادا رقم ${slip.netPayablePKR} روپے۔ تاریخ ${slip.date}۔`;
      const romanSpeech = `Parchi number ${slip.slipNumber}. Party ${slip.partyName}. Fasal ${slip.variety}. Net wazan ${slip.netWeight} ${slip.unit}. Total raqam ${slip.grossAmountPKR} rupees. Net payable ${slip.netPayablePKR} rupees. Tareekh ${slip.date}.`;
      speak(urduSpeech, romanSpeech);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `*${t.appName} - ${slip.slipNumber}*\n` +
      `پارٹی: ${slip.partyName}\n` +
      `تاریخ: ${slip.date}\n` +
      `جنس: ${slip.variety}\n` +
      `وزن: ${slip.netWeight} ${slip.unit}\n` +
      `ریٹ: Rs. ${slip.ratePerUnitPKR}\n` +
      `کل مالیت: Rs. ${slip.grossAmountPKR}\n` +
      `خالص رقم: Rs. ${slip.netPayablePKR}\n` +
      `نوٹ: ذاتی حساب کتاب کے لیے۔`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const typeHeader = t.slipTypes[slip.type] || t.slipTypes.boli;

  return (
    <div className="parchment-slip rounded-2xl border-2 border-amber-300 p-4 sm:p-6 my-4 text-stone-900 relative overflow-hidden print:m-0 print:border-none print:shadow-none">
      {/* Top Perforated Tear Line */}
      <div className="paper-perforation h-3 -mt-4 -mx-4 sm:-mx-6 mb-3 border-b border-amber-200" />

      {/* SAMPLE Badge if sample data */}
      {slip.isSample && (
        <div className="absolute top-4 end-4 z-10">
          <span className="bg-amber-100 text-amber-900 border border-amber-400 font-bold text-[11px] px-2 py-0.5 rounded uppercase tracking-wider">
            SAMPLE (نمونہ)
          </span>
        </div>
      )}

      {/* Mandi Receipt Header */}
      <div className="text-center pb-3 border-b-2 border-stone-800">
        <span className="text-xs tracking-widest uppercase text-stone-600 font-semibold block">
          جنوبی پنجاب غلہ و پھل مارکیٹ
        </span>
        <h3 className="text-xl sm:text-2xl font-bold font-urdu text-stone-900 mt-0.5">
          {typeHeader.title}
        </h3>
        <p className="text-xs text-stone-600 mt-0.5">{typeHeader.subtitle}</p>
      </div>

      {/* Meta Bar: Date & Slip # */}
      <div className="grid grid-cols-2 gap-2 py-2.5 border-b border-red-300 text-xs sm:text-sm font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="text-stone-600">{t.slipForm.slipNumber}:</span>
          <bdi dir="ltr" className="font-mono font-bold text-stone-950 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            {slip.slipNumber}
          </bdi>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-stone-600">{t.slipForm.date}:</span>
          <bdi dir="ltr" className="font-mono font-bold text-stone-950">
            {slip.date}
          </bdi>
        </div>
      </div>

      {/* Party & Vehicle Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-b border-red-200 text-sm">
        <div>
          <span className="text-xs text-stone-600 block">{t.slipForm.party}</span>
          <span className="font-bold text-base text-stone-950">{slip.partyName}</span>
        </div>
        <div className="sm:text-end">
          <span className="text-xs text-stone-600 block">{t.slipForm.variety}</span>
          <span className="font-bold text-base text-stone-950">{slip.variety}</span>
        </div>
        {slip.vehicleNumber && (
          <div>
            <span className="text-xs text-stone-600 block">{t.slipForm.vehicleNo}</span>
            <bdi dir="ltr" className="font-mono font-semibold text-stone-900">
              {slip.vehicleNumber}
            </bdi>
          </div>
        )}
        {slip.storageChamber && (
          <div className="sm:text-end">
            <span className="text-xs text-stone-600 block">{t.slipForm.chamberNo}</span>
            <span className="font-semibold text-stone-900">{slip.storageChamber}</span>
          </div>
        )}
      </div>

      {/* Traditional Ruled Weights & Math Table */}
      <div className="my-3 overflow-x-auto">
        <table className="w-full text-start text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-amber-100/80 border-y-2 border-stone-800 text-stone-800 font-bold">
              <th className="py-2 px-2 text-start">تفصیل وزن / جنس</th>
              <th className="py-2 px-2 text-center">پیمانہ</th>
              <th className="py-2 px-2 text-end">وزن / تعداد</th>
              <th className="py-2 px-2 text-end">ریٹ</th>
              <th className="py-2 px-2 text-end">کل رقم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-200 font-medium">
            <tr>
              <td className="py-2 px-2 font-bold">{slip.variety}</td>
              <td className="py-2 px-2 text-center">{slip.unit}</td>
              <td className="py-2 px-2 text-end font-mono">
                <bdi dir="ltr">{slip.netWeight}</bdi>
              </td>
              <td className="py-2 px-2 text-end font-mono">
                <bdi dir="ltr">{slip.ratePerUnitPKR}</bdi>
              </td>
              <td className="py-2 px-2 text-end font-bold font-mono text-stone-950">
                <bdi dir="ltr">{formatPKR(slip.grossAmountPKR, language)}</bdi>
              </td>
            </tr>

            {/* Deductions breakdown */}
            {slip.deductions.commissionPKR > 0 && (
              <tr className="text-stone-600 text-xs">
                <td colSpan={4} className="py-1 px-2">
                  منہا کمیشن ({slip.deductions.commissionPercent}%)
                </td>
                <td className="py-1 px-2 text-end font-mono text-rose-800">
                  <bdi dir="ltr">-{formatPKR(slip.deductions.commissionPKR, language)}</bdi>
                </td>
              </tr>
            )}
            {slip.deductions.kantaFeePKR > 0 && (
              <tr className="text-stone-600 text-xs">
                <td colSpan={4} className="py-1 px-2">{t.slipForm.kantaFee}</td>
                <td className="py-1 px-2 text-end font-mono text-rose-800">
                  <bdi dir="ltr">-{formatPKR(slip.deductions.kantaFeePKR, language)}</bdi>
                </td>
              </tr>
            )}
            {slip.deductions.laborFeePKR > 0 && (
              <tr className="text-stone-600 text-xs">
                <td colSpan={4} className="py-1 px-2">{t.slipForm.laborFee}</td>
                <td className="py-1 px-2 text-end font-mono text-rose-800">
                  <bdi dir="ltr">-{formatPKR(slip.deductions.laborFeePKR, language)}</bdi>
                </td>
              </tr>
            )}
            {slip.deductions.advanceAdjustedPKR > 0 && (
              <tr className="text-stone-600 text-xs">
                <td colSpan={4} className="py-1 px-2">{t.slipForm.advanceAdjusted}</td>
                <td className="py-1 px-2 text-end font-mono text-rose-800">
                  <bdi dir="ltr">-{formatPKR(slip.deductions.advanceAdjustedPKR, language)}</bdi>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-amber-200/90 border-t-2 border-stone-900 font-bold text-sm sm:text-base">
              <td colSpan={3} className="py-2.5 px-2 text-start font-urdu text-stone-950">
                {t.slipForm.netPayable}
              </td>
              <td colSpan={2} className="py-2.5 px-2 text-end text-emerald-950 font-mono text-base sm:text-lg">
                <bdi dir="ltr">{formatPKR(slip.netPayablePKR, language)}</bdi>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {slip.notes && (
        <div className="py-2 px-3 bg-amber-50/80 rounded-lg border border-amber-200 text-xs text-stone-700 my-2">
          <span className="font-bold text-stone-900">{t.slipForm.notes}: </span>
          {slip.notes}
        </div>
      )}

      {/* Stamp & Signature Section */}
      <div className="mt-4 pt-3 border-t border-dashed border-stone-400 flex items-center justify-between">
        <div className="text-xs text-stone-600">
          <p className="font-bold">{t.slipForm.stampAndSign}</p>
          <div className="w-28 sm:w-36 border-b-2 border-stone-700 mt-6" />
          <p className="text-[10px] text-stone-500 mt-1">دستخط منڈی انچارج</p>
        </div>

        {slip.stampVerified && (
          <div className="shrink-0">
            <StampSeal date={slip.date} color="crimson" label="منظور شدہ پرچی" />
          </div>
        )}
      </div>

      {/* Action Bar (Print / WhatsApp / Listen) */}
      <div className="mt-5 pt-3 border-t border-amber-300 flex items-center justify-end gap-2 print:hidden">
        <button
          onClick={handleRead}
          type="button"
          className="min-h-[44px] px-3.5 py-2 bg-amber-800 text-amber-100 hover:bg-amber-700 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Volume2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{t.actions.listenAudio}</span>
        </button>

        <button
          onClick={handlePrint}
          type="button"
          className="min-h-[44px] px-3 py-2 bg-stone-200 text-stone-800 hover:bg-stone-300 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4 text-stone-700 shrink-0" />
          <span className="hidden sm:inline">{t.actions.printSlip}</span>
        </button>

        <button
          onClick={handleWhatsAppShare}
          type="button"
          className="min-h-[44px] px-3 py-2 bg-emerald-700 text-white hover:bg-emerald-800 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Share2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span className="hidden sm:inline">{t.actions.shareSlip}</span>
        </button>
      </div>
    </div>
  );
};
