import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ColdStorageFacility, ColdStorageInventoryItem } from '../types';
import { coldStorageRepository, calculateDaysBetween } from '../repositories/coldStorageRepository';
import {
  X,
  Truck,
  Calendar,
  Scale,
  Receipt,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface CreateGatePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: ColdStorageFacility;
  inventory: ColdStorageInventoryItem[];
  preselectedItem?: ColdStorageInventoryItem | null;
  onSuccess: (gatePass: any) => void;
}

export const CreateGatePassModal: React.FC<CreateGatePassModalProps> = ({
  isOpen,
  onClose,
  facility,
  inventory,
  preselectedItem,
  onSuccess,
}) => {
  const { speak } = useApp();
  const todayStr = new Date().toLocaleDateString('en-GB');

  const activeItems = inventory.filter((i) => i.status === 'active' && i.currentRemainingTons > 0);

  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItem ? preselectedItem.id : activeItems[0]?.id || ''
  );

  const currentItem =
    activeItems.find((i) => i.id === selectedItemId) || preselectedItem || activeItems[0];

  const [quantityOutTons, setQuantityOutTons] = useState<number>(
    currentItem ? currentItem.currentRemainingTons : 1
  );
  const [dateOut, setDateOut] = useState<string>(todayStr);
  const [ratePerTonPerDay, setRatePerTonPerDay] = useState<number>(
    currentItem ? currentItem.ratePerTonPerDayPKR : facility.ratePerTonPerDayPKR || 180
  );
  const [receiverOrDriver, setReceiverOrDriver] = useState<string>('محمد بوٹا (ڈرائیور)');
  const [vehicleNumber, setVehicleNumber] = useState<string>('FSD-7812 (شاہ زور)');
  const [notes, setNotes] = useState<string>('منڈی روانگی کے لیے مال سپردگی دی گئی۔');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time rental calculations
  const daysStored = currentItem ? calculateDaysBetween(currentItem.dateIn, dateOut) : 1;
  const totalRentPKR = currentItem ? Math.round(quantityOutTons * daysStored * ratePerTonPerDay) : 0;
  const remainingAfter = currentItem
    ? Math.max(0, currentItem.currentRemainingTons - quantityOutTons)
    : 0;

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = e.target.value;
    setSelectedItemId(itemId);
    const item = activeItems.find((i) => i.id === itemId);
    if (item) {
      setQuantityOutTons(item.currentRemainingTons);
      setRatePerTonPerDay(item.ratePerTonPerDayPKR);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) {
      setError('کوئی فعال مال منتخب نہیں ہے۔');
      return;
    }
    if (quantityOutTons <= 0) {
      setError('نکالی گئی مقدار 0 سے زیادہ ہونی چاہیے۔');
      return;
    }
    if (quantityOutTons > currentItem.currentRemainingTons) {
      setError(`نکالی گئی مقدار بقایا اسٹاک (${currentItem.currentRemainingTons} ٹن) سے زیادہ نہیں ہو سکتی۔`);
      return;
    }
    if (!receiverOrDriver.trim()) {
      setError('وصول کنندہ یا ڈرائیور کا نام درج کریں۔');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const gatePass = await coldStorageRepository.createGatePass({
        inventoryItemId: currentItem.id,
        facilityId: facility.id,
        quantityOutTons: Number(quantityOutTons),
        dateOut: dateOut.trim(),
        receiverOrDriver: receiverOrDriver.trim(),
        vehicleNumber: vehicleNumber.trim() || undefined,
        notes: notes.trim(),
        ratePerTonPerDayPKR: Number(ratePerTonPerDay),
      });

      speak(`گیٹ پاس جاری ہو گیا اور اسٹاک سے ${quantityOutTons} ٹن خارج کر دیا گیا۔ کل کرایہ ${totalRentPKR} روپے بنا۔`);
      onSuccess(gatePass);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'گیٹ پاس جاری کرنے میں خامی آئی۔');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl parchment-slip rounded-3xl border-2 border-stone-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 px-5 py-4 flex items-center justify-between border-b-2 border-amber-600">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold font-urdu text-lg">
              کولڈ اسٹوریج آؤٹ ورڈ گیٹ پاس (Outward Gate Pass)
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors"
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

          {/* Item Selector */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              اسٹوریج لاٹ / انورڈ مال منتخب کریں *
            </label>
            <select
              value={selectedItemId}
              onChange={handleItemChange}
              className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-xs font-urdu font-bold"
            >
              {activeItems.length === 0 ? (
                <option value="">اس وقت اسٹوریج میں کوئی فعال مال موجود نہیں</option>
              ) : (
                activeItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.inwardReceiptNumber} - {item.farmerName} ({item.commodity} {item.variety} - بقایا: {item.currentRemainingTons} ٹن)
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Selected Item Summary Pill */}
          {currentItem && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
              <div>
                <span className="text-[10px] text-stone-500 block">تاریخ آمد</span>
                <span className="font-bold font-mono text-stone-800">
                  <bdi dir="ltr">{currentItem.dateIn}</bdi>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block">موجودہ بقایا</span>
                <span className="font-bold font-mono text-stone-800">
                  <bdi dir="ltr">{currentItem.currentRemainingTons} ٹن</bdi>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block">چیمبر / ریک</span>
                <span className="font-bold text-stone-800 truncate block">
                  {currentItem.chamberRack}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block">یومیہ ریٹ</span>
                <span className="font-bold font-mono text-stone-800">
                  Rs. {ratePerTonPerDay}
                </span>
              </div>
            </div>
          )}

          {/* Quantity Out & Date Out */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                نکالی گئی مقدار (ٹن) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max={currentItem ? currentItem.currentRemainingTons : 100}
                required
                value={quantityOutTons}
                onChange={(e) => setQuantityOutTons(Number(e.target.value))}
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-bold font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                تاریخ اخراج (Date Out)
              </label>
              <input
                type="text"
                value={dateOut}
                onChange={(e) => setDateOut(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-mono text-center"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                ریٹ (روپے / ٹن / دن)
              </label>
              <input
                type="number"
                value={ratePerTonPerDay}
                onChange={(e) => setRatePerTonPerDay(Number(e.target.value))}
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-mono text-center font-bold"
              />
            </div>
          </div>

          {/* Rent Calculation Preview Banner */}
          <div className="bg-stone-800 text-stone-100 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-300">
              <span className="font-urdu font-bold">خودکار کرایہ کا تخمینہ:</span>
              <span className="font-mono">
                {quantityOutTons} ٹن × {daysStored} دن × Rs. {ratePerTonPerDay}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-400 block">
                  اخراج کے بعد چیمبر میں بقایا مال:
                </span>
                <span className="text-xs font-mono font-bold text-stone-200">
                  <bdi dir="ltr">{remainingAfter.toFixed(1)} ٹن</bdi>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">کل قابل ادائیگی کرایہ</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                  <bdi dir="ltr">Rs. {totalRentPKR.toLocaleString()}</bdi>
                </span>
              </div>
            </div>
          </div>

          {/* Receiver / Driver & Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                وصول کنندہ / ڈرائیور کا نام *
              </label>
              <input
                type="text"
                required
                value={receiverOrDriver}
                onChange={(e) => setReceiverOrDriver(e.target.value)}
                placeholder="مثلاً محمد بوٹا ڈرائیور"
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-bold font-urdu"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                گاڑی / ٹرک نمبر (اختیاری)
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="مثلاً FSD-7812"
                className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              گیٹ پاس ریمارکس / تفصیل
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً مال لاہور منڈی روانہ کیا گیا..."
              className="w-full min-h-[46px] bg-white border border-stone-300 rounded-xl px-3 text-xs font-urdu"
            />
          </div>

          {/* Lot Timeline Linkage Note */}
          {currentItem?.lotId && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-urdu">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                یہ اخراج چالان خودکار طور پر زرعی لاٹ ({currentItem.lotNumber}) کی ٹائم لائن میں اپ ڈیٹ ہو جائے گا۔
              </span>
            </div>
          )}

          {/* Action Buttons */}
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
              disabled={isSubmitting || !currentItem}
              className="min-h-[48px] px-6 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-transform active:scale-98 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
              <span>{isSubmitting ? 'جاری ہو رہا ہے...' : 'آؤٹ ورڈ گیٹ پاس جاری کریں'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
