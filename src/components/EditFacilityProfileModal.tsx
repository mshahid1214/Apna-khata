import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ColdStorageFacility } from '../types';
import { coldStorageRepository } from '../repositories/coldStorageRepository';
import {
  X,
  Warehouse,
  Thermometer,
  Scale,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Coins,
} from 'lucide-react';

interface EditFacilityProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: ColdStorageFacility;
  onSuccess: (updated: ColdStorageFacility) => void;
}

export const EditFacilityProfileModal: React.FC<EditFacilityProfileModalProps> = ({
  isOpen,
  onClose,
  facility,
  onSuccess,
}) => {
  const { speak } = useApp();

  const [name, setName] = useState(facility.name);
  const [location, setLocation] = useState(facility.location);
  const [operatorName, setOperatorName] = useState(facility.operatorName);
  const [operatorPhone, setOperatorPhone] = useState(facility.operatorPhone);
  const [totalCapacityTons, setTotalCapacityTons] = useState<number>(facility.totalCapacityTons);
  const [tempRange, setTempRange] = useState(facility.tempRange);
  const [ratePerTonPerDayPKR, setRatePerTonPerDayPKR] = useState<number>(facility.ratePerTonPerDayPKR);
  const [notes, setNotes] = useState(facility.notes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('براہ کرم اسٹوریج کا نام درج کریں۔');
      return;
    }
    if (totalCapacityTons <= 0) {
      setError('کل گنجائش 0 سے زیادہ ہونی چاہیے۔');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const updated = await coldStorageRepository.updateFacilityProfile(facility.id, {
        name: name.trim(),
        location: location.trim(),
        operatorName: operatorName.trim(),
        operatorPhone: operatorPhone.trim(),
        totalCapacityTons: Number(totalCapacityTons),
        tempRange: tempRange.trim(),
        ratePerTonPerDayPKR: Number(ratePerTonPerDayPKR),
        notes: notes.trim(),
      });

      speak('کولڈ اسٹوریج پروفائل اور یومیہ ریٹ کی ترتیبات اپ ڈیٹ ہو گئیں۔');
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'پروفائل اپ ڈیٹ کرنے میں غلطی پیش آئی۔');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg parchment-slip rounded-3xl border-2 border-stone-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#78350F] text-amber-50 px-5 py-4 flex items-center justify-between border-b-2 border-amber-600">
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold font-urdu text-lg">
              کولڈ اسٹوریج پروفائل اور ریٹ ترتیبات
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 text-amber-200 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-xl flex items-center gap-2 text-xs text-red-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Facility Name */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              کولڈ اسٹوریج کا نام *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-bold font-urdu"
            />
          </div>

          {/* Location & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">پتہ / مقام *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-xs font-urdu"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                رابطہ نمبر (موبائل) *
              </label>
              <input
                type="text"
                required
                value={operatorPhone}
                onChange={(e) => setOperatorPhone(e.target.value)}
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-xs font-mono"
              />
            </div>
          </div>

          {/* Operator Name */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              آپریٹر / انچارج کا نام *
            </label>
            <input
              type="text"
              required
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-bold font-urdu"
            />
          </div>

          {/* Capacity & Temp & Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                کل گنجائش (ٹن) *
              </label>
              <input
                type="number"
                min="10"
                required
                value={totalCapacityTons}
                onChange={(e) => setTotalCapacityTons(Number(e.target.value))}
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-mono font-bold text-center"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                درجہ حرارت حد (Temp) *
              </label>
              <input
                type="text"
                required
                value={tempRange}
                onChange={(e) => setTempRange(e.target.value)}
                placeholder="0°C تا +12°C"
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-xs font-mono text-center font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                یومیہ ریٹ (PKR/ٹن) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={ratePerTonPerDayPKR}
                onChange={(e) => setRatePerTonPerDayPKR(Number(e.target.value))}
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-mono font-bold text-center"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              سہولیات و اضافی تفصیلات
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً 24 گھنٹے جنریٹر بیک اپ، کنٹرولڈ ہیومیڈیٹی..."
              className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs font-urdu leading-relaxed"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              type="button"
              className="min-h-[48px] px-5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-sm font-bold"
            >
              منسوخ کریں
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] px-6 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-transform active:scale-98 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
              <span>{isSubmitting ? 'محفوظ ہو رہا ہے...' : 'ترتیبات محفوظ کریں'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
