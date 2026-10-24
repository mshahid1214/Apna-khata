import React, { useState } from 'react';
import { ColdStorageFacility, ColdStorageInventoryItem, ColdStorageGatePass } from '../types';
import { formatPKR } from '../services/formatters';
import { calculateDaysBetween } from '../repositories/coldStorageRepository';
import { StampSeal } from './StampSeal';
import {
  X,
  Printer,
  Share2,
  Calendar,
  Warehouse,
  User,
  Scale,
  Receipt,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ColdStorageInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: ColdStorageFacility;
  item: ColdStorageInventoryItem;
  gatePass?: ColdStorageGatePass | null;
}

export const ColdStorageInvoiceModal: React.FC<ColdStorageInvoiceModalProps> = ({
  isOpen,
  onClose,
  facility,
  item,
  gatePass,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('en-GB');
  const [statementDate, setStatementDate] = useState<string>(gatePass ? gatePass.dateOut : todayStr);
  const [customRate, setCustomRate] = useState<number>(
    gatePass ? gatePass.ratePerTonPerDayPKR : item.ratePerTonPerDayPKR
  );

  const tons = gatePass ? gatePass.quantityOutTons : item.currentRemainingTons;
  const daysStored = calculateDaysBetween(item.dateIn, statementDate);
  const tonDays = tons * daysStored;
  const totalRentPKR = Math.round(tonDays * (customRate || 0));

  const invoiceNumber = gatePass
    ? `INV-${gatePass.gatePassNumber.replace('CSG-', '')}`
    : `INV-${item.inwardReceiptNumber.replace('CSR-', '')}`;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `*کولڈ اسٹوریج کرایہ بل / انوائس*
بل نمبر: ${invoiceNumber}
ادارہ: ${facility.name}
فون: ${facility.operatorPhone}
کسان / کھاتہ دار: ${item.farmerName}
جنس: ${item.commodity} (${item.variety})
انورڈ رسید: ${item.inwardReceiptNumber}
تاریخ آمد: ${item.dateIn}
تاریخ اخراج/حساب: ${statementDate}
ذخیرہ مدت: ${daysStored} دن
وزن / اسٹاک: ${tons} ٹن
کل ٹن-دن: ${tonDays}
یومیہ ریٹ: Rs. ${customRate}/ٹن
*کل واجب الادا کرایہ: Rs. ${totalRentPKR.toLocaleString()}*

_آپ کے بااعتماد تعاون کا شکریہ!_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl parchment-slip rounded-3xl border-2 border-stone-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Actions Bar */}
        <div className="bg-stone-900 text-stone-100 px-5 py-3.5 flex items-center justify-between border-b-2 border-amber-600">
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-amber-400" />
            <span className="font-bold font-urdu text-base sm:text-lg">
              کولڈ اسٹوریج کرایہ بل و حساب کتاب
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              type="button"
              className="p-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              title="واٹس ایپ پر شیئر کریں"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">واٹس ایپ</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="p-2 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              title="پرنٹ کریں"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">پرنٹ</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b-2 border-stone-800 gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                انوائس و کرایہ گوشوارہ (Storage Invoice)
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-urdu text-stone-900">
                {facility.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  {facility.location}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <bdi dir="ltr">{facility.operatorPhone}</bdi>
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <span className="text-xs text-stone-500 font-bold">انوائس نمبر</span>
              <span className="text-base font-bold font-mono text-stone-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                {invoiceNumber}
              </span>
              <span className="text-[11px] text-stone-500 mt-1">
                تاریخ اجراء: <bdi dir="ltr">{todayStr}</bdi>
              </span>
            </div>
          </div>

          {/* Farmer & Lot Info Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/80 p-4 rounded-2xl border border-amber-200">
            <div>
              <span className="text-xs text-stone-500 block">کھاتہ دار / کسان کا نام:</span>
              <div className="font-bold font-urdu text-lg text-stone-900 flex items-center gap-1.5 mt-0.5">
                <User className="w-4 h-4 text-amber-800 shrink-0" />
                <span>{item.farmerName}</span>
              </div>
              {item.farmerPhone && (
                <span className="text-xs text-stone-600 block mt-0.5">
                  رابطہ نمبر: <bdi dir="ltr">{item.farmerPhone}</bdi>
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">انورڈ چالان نمبر:</span>
                <span className="font-bold font-mono">{item.inwardReceiptNumber}</span>
              </div>
              {item.lotNumber && (
                <div className="flex justify-between">
                  <span className="text-stone-500">منسلک زرعی لاٹ:</span>
                  <span className="font-bold font-mono text-amber-900">{item.lotNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">مقام اسٹوریج:</span>
                <span className="font-bold text-stone-800">{item.chamberRack}</span>
              </div>
            </div>
          </div>

          {/* Item Details Table */}
          <div className="border border-stone-800 rounded-2xl overflow-hidden shadow-xs bg-white">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-stone-800 text-stone-100 text-xs">
                <tr>
                  <th className="py-2.5 px-3">تفصیل جنس و ورائٹی</th>
                  <th className="py-2.5 px-3">تاریخ آمد</th>
                  <th className="py-2.5 px-3">تاریخ اخراج/حساب</th>
                  <th className="py-2.5 px-3 text-center">دن</th>
                  <th className="py-2.5 px-3 text-left">وزن (ٹن)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="py-3 px-3 font-bold text-stone-900">
                    {item.commodity} ({item.variety})
                    <span className="block text-[11px] text-stone-500 font-normal">
                      کیفیت: {item.conditionNotes}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <bdi dir="ltr">{item.dateIn}</bdi>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <bdi dir="ltr">{statementDate}</bdi>
                  </td>
                  <td className="py-3 px-3 text-center font-bold font-mono bg-amber-50/50">
                    <bdi dir="ltr">{daysStored}</bdi>
                  </td>
                  <td className="py-3 px-3 text-left font-bold font-mono">
                    <bdi dir="ltr">{tons} ٹن</bdi>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Transparent Formula & Calculation Card */}
          <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>شفاف فارمولا حساب کتاب (Transparent Calculation)</span>
              </span>
              <span className="text-[11px] text-stone-500">کرایہ = وزن (ٹن) × دن × یومیہ ریٹ</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-200 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">وزن</span>
                <span className="text-base font-bold font-mono text-stone-900">
                  <bdi dir="ltr">{tons} ٹن</bdi>
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">ذخیرہ مدت</span>
                <span className="text-base font-bold font-mono text-stone-900">
                  <bdi dir="ltr">{daysStored} دن</bdi>
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">کل ٹن-دن (Ton-Days)</span>
                <span className="text-base font-bold font-mono text-stone-900">
                  <bdi dir="ltr">{tonDays}</bdi>
                </span>
              </div>

              <div className="bg-amber-100 p-2.5 rounded-xl border border-amber-300">
                <span className="text-[10px] text-stone-600 block">یومیہ ریٹ (فی ٹن)</span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="text-xs text-stone-600 font-bold">Rs.</span>
                  <input
                    type="number"
                    value={customRate}
                    onChange={(e) => setCustomRate(Math.max(0, Number(e.target.value)))}
                    className="w-16 text-center font-bold font-mono bg-white rounded border border-amber-400 py-0.5 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Total Rent Highlight Banner */}
            <div className="bg-[#78350F] text-amber-50 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-200 block">کل واجب الادا کرایہ اسٹوریج</span>
                <span className="text-xs text-amber-300 font-urdu">
                  ({tons} ٹن × {daysStored} دن × Rs. {customRate})
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono">
                <bdi dir="ltr">Rs. {totalRentPKR.toLocaleString()}</bdi>
              </div>
            </div>
          </div>

          {/* Stamp & Signatures */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t-2 border-stone-800 gap-4">
            <div className="flex items-center gap-4">
              <StampSeal
                label={gatePass ? 'گیٹ پاس کلیر' : 'اسٹوریج فعال'}
                subLabel={facility.operatorName}
                color={gatePass ? 'crimson' : 'emerald'}
              />
              <div className="text-xs text-stone-600">
                <p className="font-bold text-stone-800">کولڈ اسٹوریج تصدیق</p>
                <p>کنٹرولڈ درجہ حرارت: {facility.tempRange}</p>
                <p>24 گھنٹے بیک اپ سروس</p>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <div className="w-48 border-b-2 border-stone-800 pb-1 mb-1 text-center font-urdu font-bold text-sm text-stone-700">
                دستخط مینیجر / آپریٹر
              </div>
              <span className="text-[11px] text-stone-500">برائے {facility.name}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-300 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 bg-stone-800 hover:bg-stone-900 text-stone-100 font-bold rounded-xl text-sm"
          >
            بند کریں (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
