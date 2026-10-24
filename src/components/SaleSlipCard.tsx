import React, { useState } from 'react';
import { SaleSlip, Role } from '../types';
import { formatPKR } from '../services/formatters';
import { StampSeal } from './StampSeal';
import { QRCodeView } from './QRCodeView';
import { PublicSlipVerificationModal } from './PublicSlipVerificationModal';
import { useApp } from '../context/AppContext';
import {
  Printer,
  Share2,
  BookmarkCheck,
  CheckCircle2,
  AlertOctagon,
  Edit3,
  Volume2,
  History,
  Receipt,
  FileText,
} from 'lucide-react';

interface SaleSlipCardProps {
  slip: SaleSlip;
  onLinkToKhata?: (slipId: string) => void;
  onEditSlip?: (slip: SaleSlip) => void;
  onCancelSlip?: (slip: SaleSlip) => void;
}

export const SaleSlipCard: React.FC<SaleSlipCardProps> = ({
  slip,
  onLinkToKhata,
  onEditSlip,
  onCancelSlip,
}) => {
  const { currentRole, language, speak } = useApp();
  const [printLayout, setPrintLayout] = useState<'a5' | 'thermal'>('a5');
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isArhti = currentRole === 'arhti';
  const isCancelled = slip.status === 'cancelled';

  // Read aloud in Urdu
  const handleRead = () => {
    const urduSpeech = `بولی پرچی نمبر ${slip.serialNumber}۔ کسان ${slip.farmerName}۔ خریدار ${slip.buyerName}۔ جنس ${slip.variety} درجہ ${slip.grade}۔ پیٹی تعداد ${slip.crateCount}۔ خالص وزن ${slip.netWeight} ${slip.unit}۔ ریٹ ${slip.ratePerUnit} روپے۔ کل مالیت ${slip.grossAmount} روپے۔ منہا کٹوتیاں ${slip.totalDeductions} روپے۔ خالص واجب الادا رقم ${slip.netPayable} روپے۔`;
    const romanSpeech = `Boli parchi ${slip.serialNumber}. Farmer ${slip.farmerName}. Buyer ${slip.buyerName}. Net wazan ${slip.netWeight} ${slip.unit}. Rate ${slip.ratePerUnit}. Total ${slip.grossAmount}. Deductions ${slip.totalDeductions}. Net payable ${slip.netPayable} rupees.`;
    speak(urduSpeech, romanSpeech);
  };

  // WhatsApp share
  const handleWhatsApp = () => {
    const text =
      `*📜 اپنا کھاتہ | بولی و نیلامی پرچی*\n` +
      `سریل نمبر: *${slip.serialNumber}*\n` +
      `تاریخ: ${slip.date}\n` +
      `🌾 کسان: ${slip.farmerName}\n` +
      `💰 خریدار: ${slip.buyerName}\n` +
      `⚖️ آڑھت: ${slip.arhtiName}\n` +
      `--------------------------\n` +
      `جنس: ${slip.variety} (${slip.grade})\n` +
      `تعداد پیٹی: ${slip.crateCount} | خالص وزن: ${slip.netWeight} ${slip.unit}\n` +
      `ریٹ: Rs. ${slip.ratePerUnit.toLocaleString('en-US')}\n` +
      `کل مالیت: Rs. ${slip.grossAmount.toLocaleString('en-US')}\n` +
      `منہا کٹوتیاں: Rs. ${slip.totalDeductions.toLocaleString('en-US')}\n` +
      `*خالص رقم واجب الادا: Rs. ${slip.netPayable.toLocaleString('en-US')}*\n` +
      `حالت: ${isCancelled ? '❌ منسوخ شدہ (Cancelled)' : '✅ مصدقہ فعال'}\n` +
      `--------------------------\n` +
      `_ذاتی ریکارڈ کے لیے۔_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const verificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?verify=${slip.id}`
      : `https://apnakhata.mandi/verify/${slip.id}`;

  return (
    <div
      className={`relative parchment-slip rounded-3xl border-2 transition-all p-4 sm:p-6 shadow-md my-4 ${
        isCancelled
          ? 'border-rose-400 bg-rose-50/30'
          : 'border-amber-300 hover:border-amber-400'
      }`}
    >
      {/* Top Perforated Line */}
      <div className="paper-perforation h-3 -mt-4 -mx-4 sm:-mx-6 mb-3 border-b border-amber-200" />

      {/* Cancelled Stamp Overlay if cancelled */}
      {isCancelled && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="border-8 border-rose-700 text-rose-700 font-extrabold text-3xl sm:text-5xl px-6 py-2 rounded-2xl tracking-widest uppercase rotate-[-15deg] opacity-85 shadow-lg bg-white/70 select-none">
            منسوخ شدہ · CANCELLED
          </div>
        </div>
      )}

      {/* Top Controls: Layout Selector & Voice Read */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800 gap-2 print:hidden">
        {/* Layout Switcher (A5 Standard vs Thermal 58mm) */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-300">
          <button
            type="button"
            onClick={() => setPrintLayout('a5')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
              printLayout === 'a5'
                ? 'bg-[#78350F] text-amber-50 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>A5 کاغذ</span>
          </button>
          <button
            type="button"
            onClick={() => setPrintLayout('thermal')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
              printLayout === 'thermal'
                ? 'bg-[#78350F] text-amber-50 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>58mm تھرمل</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRead}
            type="button"
            className="min-h-[40px] px-3 py-1.5 bg-amber-800 text-amber-100 hover:bg-amber-700 font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>سنیں</span>
          </button>

          {slip.history && slip.history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              type="button"
              className="min-h-[40px] px-2.5 py-1 bg-amber-100 text-amber-950 font-bold rounded-xl text-xs flex items-center gap-1 border border-amber-300"
            >
              <History className="w-3.5 h-3.5 text-amber-800" />
              <span>ورژن تاریخ ({slip.history.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* History Dropdown */}
      {showHistory && slip.history && slip.history.length > 0 && (
        <div className="my-3 p-3 bg-amber-50 rounded-2xl border border-amber-300 text-xs space-y-2 print:hidden">
          <span className="font-bold text-stone-900 block">پرچی کے پچھلے ورژنز (Version Trail):</span>
          {slip.history.map((ver) => (
            <div key={ver.id} className="p-2 bg-white rounded-lg border border-amber-200">
              <div className="flex justify-between font-bold text-stone-800">
                <span>{ver.editedByName} ({ver.editedByRole})</span>
                <bdi dir="ltr">{ver.timestamp}</bdi>
              </div>
              <p className="text-stone-700 mt-1">{ver.changeSummary}</p>
              <div className="text-[11px] text-stone-500 mt-0.5">
                سابقہ کل مالیت: Rs. {ver.previousGross.toLocaleString('en-US')} ➔ سابقہ خالص: Rs.{' '}
                {ver.previousNet.toLocaleString('en-US')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. STANDARD A5 PARCHI LAYOUT                                  */}
      {/* ------------------------------------------------------------- */}
      {printLayout === 'a5' && (
        <div className="mt-3 space-y-3">
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-stone-800">
            <span className="text-[11px] tracking-widest uppercase text-stone-600 font-bold block">
              غلہ و فروٹ مارکیٹ منڈی بہاولپور / ملتان
            </span>
            <h3 className="text-2xl font-bold font-urdu text-stone-950">
              بولی و نیلامی فروخت پرچی
            </h3>
            <p className="text-xs text-stone-600 font-medium mt-0.5">
              دفتر آڑھت: {slip.arhtiName}
            </p>
          </div>

          {/* Meta Bar: Serial, Date, QR */}
          <div className="flex items-center justify-between py-2 border-b border-red-300 text-xs sm:text-sm">
            <div>
              <span className="text-stone-500 font-semibold">سریل نمبر: </span>
              <bdi dir="ltr" className="font-mono font-bold text-stone-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {slip.serialNumber}
              </bdi>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <span className="text-stone-500 font-semibold">تاریخ: </span>
                <bdi dir="ltr" className="font-mono font-bold text-stone-900">{slip.date}</bdi>
              </div>
              {/* QR Code */}
              <QRCodeView
                value={verificationUrl}
                size={70}
                onOpenVerify={() => setIsVerifyModalOpen(true)}
              />
            </div>
          </div>

          {/* Parties: Farmer & Buyer */}
          <div className="grid grid-cols-2 gap-3 py-2.5 border-b border-red-200 text-xs sm:text-sm">
            <div>
              <span className="text-stone-500 block text-[11px]">کسان / زمیندار:</span>
              <span className="font-bold text-stone-950 text-sm sm:text-base">{slip.farmerName}</span>
            </div>
            <div className="text-end">
              <span className="text-stone-500 block text-[11px]">خریدار / بیوپاری:</span>
              <span className="font-bold text-stone-950 text-sm sm:text-base">{slip.buyerName}</span>
            </div>
          </div>

          {/* Commodity & Weight Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 border-b border-red-200 text-xs">
            <div>
              <span className="text-stone-500 block">جنس و کوالٹی:</span>
              <span className="font-bold text-stone-900">{slip.variety} ({slip.grade})</span>
            </div>
            <div>
              <span className="text-stone-500 block">تعداد پیٹی / توڑے:</span>
              <span className="font-mono font-bold text-stone-900">{slip.crateCount}</span>
            </div>
            <div>
              <span className="text-stone-500 block">کل وزن و کٹوتی خالی:</span>
              <span className="font-mono font-bold text-stone-900">
                {slip.grossWeight} - {slip.tareWeight} kg
              </span>
            </div>
            <div className="sm:text-end">
              <span className="text-stone-500 block">صافی خالص وزن:</span>
              <span className="font-mono font-bold text-emerald-900 text-sm">
                {slip.netWeight} {slip.unit}
              </span>
            </div>
          </div>

          {/* Ruled Accounting Table */}
          <div className="overflow-x-auto my-3">
            <table className="w-full text-start text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-amber-100/90 border-y-2 border-stone-800 text-stone-900 font-bold">
                  <th className="py-2 px-2 text-start">تفصیل وزن و ریٹ</th>
                  <th className="py-2 px-2 text-center">پیمانہ</th>
                  <th className="py-2 px-2 text-end">خالص وزن</th>
                  <th className="py-2 px-2 text-end">بولی ریٹ</th>
                  <th className="py-2 px-2 text-end">کل مالیت (Gross)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-200 font-medium">
                <tr>
                  <td className="py-2 px-2 font-bold">{slip.variety} ({slip.grade})</td>
                  <td className="py-2 px-2 text-center">{slip.unit}</td>
                  <td className="py-2 px-2 text-end font-mono"><bdi dir="ltr">{slip.netWeight}</bdi></td>
                  <td className="py-2 px-2 text-end font-mono"><bdi dir="ltr">{slip.ratePerUnit}</bdi></td>
                  <td className="py-2 px-2 text-end font-bold font-mono text-stone-950">
                    <bdi dir="ltr">{formatPKR(slip.grossAmount, language)}</bdi>
                  </td>
                </tr>

                {/* Deductions Breakdown (User-entered, no default assumption) */}
                {slip.deductions.commissionPKR > 0 && (
                  <tr className="text-stone-600 text-xs">
                    <td colSpan={4} className="py-1 px-2">
                      منہا آڑھت کمیشن ({slip.deductions.commissionPercent}%)
                    </td>
                    <td className="py-1 px-2 text-end font-mono text-rose-800">
                      <bdi dir="ltr">-{formatPKR(slip.deductions.commissionPKR, language)}</bdi>
                    </td>
                  </tr>
                )}
                {slip.deductions.laborPKR > 0 && (
                  <tr className="text-stone-600 text-xs">
                    <td colSpan={4} className="py-1 px-2">مزدوری و پلائی</td>
                    <td className="py-1 px-2 text-end font-mono text-rose-800">
                      <bdi dir="ltr">-{formatPKR(slip.deductions.laborPKR, language)}</bdi>
                    </td>
                  </tr>
                )}
                {slip.deductions.marketFeePKR > 0 && (
                  <tr className="text-stone-600 text-xs">
                    <td colSpan={4} className="py-1 px-2">منڈی فیس / ٹیکس</td>
                    <td className="py-1 px-2 text-end font-mono text-rose-800">
                      <bdi dir="ltr">-{formatPKR(slip.deductions.marketFeePKR, language)}</bdi>
                    </td>
                  </tr>
                )}
                {slip.deductions.transportPKR > 0 && (
                  <tr className="text-stone-600 text-xs">
                    <td colSpan={4} className="py-1 px-2">کرایہ مال برداری</td>
                    <td className="py-1 px-2 text-end font-mono text-rose-800">
                      <bdi dir="ltr">-{formatPKR(slip.deductions.transportPKR, language)}</bdi>
                    </td>
                  </tr>
                )}
                {slip.deductions.otherDeductionPKR > 0 && (
                  <tr className="text-stone-600 text-xs">
                    <td colSpan={4} className="py-1 px-2">
                      {slip.deductions.otherDescription || 'دیگر کٹوتی'}
                    </td>
                    <td className="py-1 px-2 text-end font-mono text-rose-800">
                      <bdi dir="ltr">-{formatPKR(slip.deductions.otherDeductionPKR, language)}</bdi>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-amber-200/90 border-t-2 border-stone-900 font-bold text-sm sm:text-base">
                  <td colSpan={3} className="py-2.5 px-2 text-start font-urdu text-stone-950">
                    خالص واجب الادا رقم (Net Payable)
                  </td>
                  <td colSpan={2} className="py-2.5 px-2 text-end text-emerald-950 font-mono text-base sm:text-lg">
                    <bdi dir="ltr">{formatPKR(slip.netPayable, language)}</bdi>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Stamp & Verification Section */}
          <div className="mt-4 pt-3 border-t border-dashed border-stone-400 flex items-center justify-between">
            <div className="text-xs text-stone-600">
              <p className="font-bold">دستخط و مہر منڈی</p>
              <div className="w-28 sm:w-36 border-b-2 border-stone-700 mt-6" />
              <p className="text-[10px] text-stone-500 mt-1">حاجی نذیر احمد آڑھتی</p>
            </div>

            <div className="shrink-0">
              <StampSeal
                date={slip.date}
                color={isCancelled ? 'crimson' : 'emerald'}
                label={isCancelled ? 'منسوخ شدہ پرچی' : 'منظور شدہ بولی رسید'}
                subLabel="مہر منڈی تصدیق"
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. THERMAL 58MM POS RECEIPT LAYOUT                            */}
      {/* ------------------------------------------------------------- */}
      {printLayout === 'thermal' && (
        <div className="mt-3 max-w-[280px] mx-auto bg-white p-4 font-mono text-xs border border-stone-400 shadow-sm text-stone-950">
          <div className="text-center pb-2 border-b border-dashed border-stone-400">
            <h4 className="font-bold text-sm">APNA KHATA MANDI</h4>
            <p className="text-[10px]">بولی و نیلامی پرچی</p>
            <p className="text-[9px] mt-0.5">{slip.arhtiName}</p>
          </div>

          <div className="py-2 text-[10px] border-b border-dashed border-stone-300 space-y-0.5">
            <div>سریل: {slip.serialNumber}</div>
            <div>تاریخ: {slip.date}</div>
            <div>کسان: {slip.farmerName}</div>
            <div>خریدار: {slip.buyerName}</div>
            <div>جنس: {slip.variety} ({slip.grade})</div>
            <div>تعداد: {slip.crateCount} پیٹی</div>
            <div>خالص وزن: {slip.netWeight} {slip.unit}</div>
            <div>ریٹ: Rs. {slip.ratePerUnit}</div>
          </div>

          <div className="py-2 border-b border-stone-400 text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span>کل مالیت:</span>
              <span>Rs. {slip.grossAmount.toLocaleString('en-US')}</span>
            </div>
            {slip.deductions.commissionPKR > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>کمیشن ({slip.deductions.commissionPercent}%):</span>
                <span>-Rs. {slip.deductions.commissionPKR}</span>
              </div>
            )}
            {slip.deductions.laborPKR > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>پلائی:</span>
                <span>-Rs. {slip.deductions.laborPKR}</span>
              </div>
            )}
            {slip.deductions.marketFeePKR > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>مارکیٹ فیس:</span>
                <span>-Rs. {slip.deductions.marketFeePKR}</span>
              </div>
            )}
            {slip.deductions.transportPKR > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>کرایہ:</span>
                <span>-Rs. {slip.deductions.transportPKR}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-stone-400">
              <span>صافی رقم:</span>
              <span>Rs. {slip.netPayable.toLocaleString('en-US')}</span>
            </div>
          </div>

          <div className="pt-2 text-center">
            <div className="flex justify-center my-1">
              <QRCodeView
                value={verificationUrl}
                size={60}
                onOpenVerify={() => setIsVerifyModalOpen(true)}
              />
            </div>
            <p className="text-[8px] text-stone-500">ذاتی حساب کتاب کے لیے</p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Action Footer (Link Khata, Print, WhatsApp, Edit, Cancel)      */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-4 pt-3 border-t border-amber-300 flex flex-wrap items-center justify-between gap-2 print:hidden">
        {/* Link to Farmer's Khata */}
        <div className="flex items-center gap-1.5">
          {slip.isLinkedToKhata ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-950 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>کھاتے میں درج شدہ ✓</span>
            </span>
          ) : isArhti && !isCancelled ? (
            <button
              onClick={() => onLinkToKhata && onLinkToKhata(slip.id)}
              type="button"
              className="min-h-[42px] px-3.5 py-1.5 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              title="کسان کے کھاتے میں خودکار اندراج کریں"
            >
              <BookmarkCheck className="w-4 h-4 text-amber-300" />
              <span>کسان کھاتے میں درج کریں</span>
            </button>
          ) : (
            <span className="text-xs text-stone-500 italic">کھاتے سے غیر منسلک</span>
          )}
        </div>

        {/* Share, Print, Edit & Cancel Controls */}
        <div className="flex items-center gap-1.5">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            type="button"
            className="min-h-[42px] px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden sm:inline">واٹس ایپ</span>
          </button>

          {/* Print / Save PDF */}
          <button
            onClick={() => window.print()}
            type="button"
            className="min-h-[42px] px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-stone-700" />
            <span className="hidden sm:inline">PDF / پرنٹ</span>
          </button>

          {/* Arhti-only Edit & Cancel */}
          {isArhti && !isCancelled && (
            <>
              <button
                onClick={() => onEditSlip && onEditSlip(slip)}
                type="button"
                className="min-h-[42px] px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold rounded-xl text-xs flex items-center gap-1"
                title="پرچی میں ترمیم کریں"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ترمیم</span>
              </button>

              <button
                onClick={() => onCancelSlip && onCancelSlip(slip)}
                type="button"
                className="min-h-[42px] px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-bold rounded-xl text-xs flex items-center gap-1"
                title="پرچی منسوخ کریں"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">منسوخ</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Public Read-Only Verification Modal */}
      <PublicSlipVerificationModal
        slip={slip}
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
      />
    </div>
  );
};
