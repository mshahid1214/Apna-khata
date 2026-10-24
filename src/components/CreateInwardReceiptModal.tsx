import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ColdStorageFacility, Commodity, Lot } from '../types';
import { coldStorageRepository } from '../repositories/coldStorageRepository';
import { lotRepository } from '../repositories/lotRepository';
import {
  X,
  Warehouse,
  Calendar,
  Scale,
  User,
  Tag,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CreateInwardReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: ColdStorageFacility;
  onSuccess: () => void;
}

const COMMODITY_OPTIONS: { id: Commodity; labelUr: string }[] = [
  { id: 'mango', labelUr: 'آم (Mango)' },
  { id: 'citrus', labelUr: 'ترشاوہ / مالٹا (Citrus)' },
  { id: 'dates', labelUr: 'کھجور (Dates)' },
  { id: 'cotton', labelUr: 'کپاس (Cotton)' },
];

export const CreateInwardReceiptModal: React.FC<CreateInwardReceiptModalProps> = ({
  isOpen,
  onClose,
  facility,
  onSuccess,
}) => {
  const { parties, speak } = useApp();

  const todayStr = new Date().toLocaleDateString('en-GB');

  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [selectedLotId, setSelectedLotId] = useState('');
  const [availableLots, setAvailableLots] = useState<Lot[]>([]);

  const [commodity, setCommodity] = useState<Commodity>('mango');
  const [variety, setVariety] = useState('چونسا سفید خاص');
  const [quantityTons, setQuantityTons] = useState<number>(10);
  const [dateIn, setDateIn] = useState<string>(todayStr);
  const [chamberRack, setChamberRack] = useState<string>(
    facility.chambers?.[0] ? `${facility.chambers[0].name}، ریک A-1` : 'چیمبر 1، ریک A-1'
  );
  const [conditionNotes, setConditionNotes] = useState<string>(
    'پھل تازہ اور خشک ہے، رطوبت 85%، کوئی بیماری یا داغ نہیں پایا گیا۔'
  );
  const [ratePerTonPerDay, setRatePerTonPerDay] = useState<number>(facility.ratePerTonPerDayPKR || 180);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available lots for easy linkage
  useEffect(() => {
    if (isOpen) {
      lotRepository.getAll().then((lots) => {
        setAvailableLots(lots);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectParty = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const partyId = e.target.value;
    const found = parties.find((p) => p.id === partyId);
    if (found) {
      setFarmerName(found.name);
      setFarmerPhone(found.phone || '');
    }
  };

  const handleSelectLot = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lotId = e.target.value;
    setSelectedLotId(lotId);
    const lot = availableLots.find((l) => l.id === lotId);
    if (lot) {
      setFarmerName(lot.farmerName);
      setCommodity(lot.crop);
      setVariety(lot.variety);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim()) {
      setError('براہ کرم کسان کا نام درج کریں۔');
      return;
    }
    if (quantityTons <= 0) {
      setError('مقدار کم از کم 0.5 ٹن ہونی چاہیے۔');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const selectedLot = availableLots.find((l) => l.id === selectedLotId);

      await coldStorageRepository.createInwardReceipt({
        facilityId: facility.id,
        farmerName: farmerName.trim(),
        farmerPhone: farmerPhone.trim() || undefined,
        lotId: selectedLotId || undefined,
        lotNumber: selectedLot?.lotNumber,
        commodity,
        variety: variety.trim(),
        initialQuantityTons: Number(quantityTons),
        dateIn: dateIn.trim(),
        chamberRack: chamberRack.trim(),
        conditionNotes: conditionNotes.trim(),
        ratePerTonPerDayPKR: Number(ratePerTonPerDay),
      });

      speak(`انورڈ مال وصولی چالان کامیابی سے درج ہو گیا اور اسٹاک میں ${quantityTons} ٹن شامل کر دیا گیا۔`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'اندراج میں مسئلہ پیش آیا۔');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl parchment-slip rounded-3xl border-2 border-stone-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#78350F] text-amber-50 px-5 py-4 flex items-center justify-between border-b-2 border-amber-600">
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold font-urdu text-lg">
              کولڈ اسٹوریج انورڈ رسید (Inward Receipt)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-xl flex items-center gap-2 text-xs text-red-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick autofill from existing party or lot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">
                کھاتہ دار / کسان منتخب کریں (اختیاری):
              </label>
              <select
                onChange={handleSelectParty}
                className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-2.5 text-xs font-urdu font-bold"
              >
                <option value="">-- رجسٹرڈ کھاتہ دار منتخب کریں --</option>
                {parties
                  .filter((p) => p.role === 'farmer')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone || 'فون نہیں'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">
                زرعی لاٹ لنک کریں (Lot Passport):
              </label>
              <select
                value={selectedLotId}
                onChange={handleSelectLot}
                className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-2.5 text-xs font-mono font-bold"
              >
                <option value="">-- کوئی لاٹ منسلک نہیں --</option>
                {availableLots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.lotNumber} ({l.variety} - {l.farmerName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Farmer Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                کسان / کھاتہ دار کا نام *
              </label>
              <input
                type="text"
                required
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="مثلاً حاجی غلام فرید"
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-bold font-urdu"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                موبائل نمبر (اختیاری)
              </label>
              <input
                type="text"
                value={farmerPhone}
                onChange={(e) => setFarmerPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-mono"
              />
            </div>
          </div>

          {/* Commodity & Variety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">جنس (Commodity)</label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value as Commodity)}
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-xs font-bold font-urdu"
              >
                {COMMODITY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.labelUr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">ورائٹی / قسم</label>
              <input
                type="text"
                required
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="مثلاً چونسا، کینو، اصیل"
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-bold font-urdu"
              />
            </div>
          </div>

          {/* Quantity, Date, & Chamber */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                مقدار وزن (ٹن) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={quantityTons}
                onChange={(e) => setQuantityTons(Number(e.target.value))}
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-bold font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                تاریخ آمد (Date In)
              </label>
              <input
                type="text"
                value={dateIn}
                onChange={(e) => setDateIn(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-mono text-center"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                کرایہ ریٹ (روپے / ٹن / دن)
              </label>
              <input
                type="number"
                required
                value={ratePerTonPerDay}
                onChange={(e) => setRatePerTonPerDay(Number(e.target.value))}
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-bold font-mono text-center"
              />
            </div>
          </div>

          {/* Chamber / Rack */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              مقام / چیمبر و ریک نمبر
            </label>
            <input
              type="text"
              required
              value={chamberRack}
              onChange={(e) => setChamberRack(e.target.value)}
              placeholder="مثلاً چیمبر نمبر 1، ریک B-3"
              className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-bold font-urdu"
            />
          </div>

          {/* Condition Notes */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              مال کی ظاہری کیفیت و معائنہ ریمارکس
            </label>
            <textarea
              rows={2}
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs font-urdu leading-relaxed"
            />
          </div>

          {/* Auto Timeline Badge */}
          {selectedLotId && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-urdu">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                یہ انورڈ رسید محفوظ ہوتے ہی منتخب لاٹ کی مستقل ٹائم لائن پر خودکار درج ہو جائے گی۔
              </span>
            </div>
          )}

          {/* Submit Buttons */}
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
              <span>{isSubmitting ? 'درج ہو رہا ہے...' : 'انورڈ رسید محفوظ کریں'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
