import React, { useState } from 'react';
import { Commodity, WeightUnit, Lot } from '../types';
import { lotRepository } from '../repositories/lotRepository';
import { useApp } from '../context/AppContext';
import {
  X,
  Plus,
  Calendar,
  MapPin,
  Navigation,
  Scale,
  Sparkles,
  Info,
} from 'lucide-react';

interface CreateLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLotCreated: () => void;
}

export const CreateLotModal: React.FC<CreateLotModalProps> = ({
  isOpen,
  onClose,
  onLotCreated,
}) => {
  const { currentRole, t, speak } = useApp();

  const [crop, setCrop] = useState<Commodity>('mango');
  const [variety, setVariety] = useState('چونسا سفید خاص');
  const [grade, setGrade] = useState('درجہ اول (Grade A)');
  const [quantity, setQuantity] = useState('150');
  const [unit, setUnit] = useState<WeightUnit>('peti');
  const [harvestDate, setHarvestDate] = useState(() => new Date().toLocaleDateString('en-GB'));
  const [farmName, setFarmName] = useState('باغ الفرید، چک 18-WB، وہاڑی');
  const [farmGpsPin, setFarmGpsPin] = useState('');
  const [farmerName, setFarmerName] = useState('حاجی غلام فرید');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCropSelect = (c: Commodity) => {
    setCrop(c);
    if (c === 'mango') {
      setVariety('چونسا سفید خاص');
      setUnit('peti');
    } else if (c === 'citrus') {
      setVariety('کنو / مالٹا سپر');
      setUnit('peti');
    } else if (c === 'dates') {
      setVariety('کھجور اصیل اول');
      setUnit('man');
    } else if (c === 'cotton') {
      setVariety('کپاس پھٹی (بی ایس 15)');
      setUnit('man');
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const pin = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
          setFarmGpsPin(pin);
        },
        () => {
          setFarmGpsPin('30.1575° N, 71.5249° E');
        }
      );
    } else {
      setFarmGpsPin('30.1575° N, 71.5249° E');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;

    setIsSubmitting(true);
    try {
      await lotRepository.save({
        farmerId: 'p-farmer-1',
        farmerName: farmerName.trim() || 'باغبان کسان',
        crop,
        variety: variety.trim(),
        grade: grade.trim(),
        quantity: qty,
        unit,
        harvestDate: harvestDate.trim(),
        farmName: farmName.trim(),
        farmGpsPin: farmGpsPin.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      speak('نئی زرعی لاٹ اور پاسپورٹ کارڈ کامیابی سے جاری ہو گیا۔');
      onLotCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create lot:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4">
      <div className="max-w-xl w-full parchment-slip rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-[#78350F] max-h-[92vh] overflow-y-auto text-stone-900 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
              زرعی ٹریس ایبلٹی
            </span>
            <h3 className="text-2xl font-bold font-urdu text-stone-900 mt-0.5">
              نئی زرعی لاٹ بنائیں (Create Lot)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Crop Selector with Large Icons */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              فصل کا انتخاب کریں *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'mango' as const, name: 'آم', icon: '🥭' },
                { id: 'citrus' as const, name: 'کنو', icon: '🍊' },
                { id: 'dates' as const, name: 'کھجور', icon: '🌴' },
                { id: 'cotton' as const, name: 'کپاس', icon: '☁️' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCropSelect(c.id)}
                  className={`min-h-[56px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    crop === c.id
                      ? 'bg-amber-100 border-[#78350F] text-[#78350F] shadow-sm font-bold'
                      : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-2xl">{c.icon}</span>
                  <span className="text-xs font-urdu mt-0.5">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Variety & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                قسم / ورائٹی (Variety) *
              </label>
              <input
                type="text"
                required
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="مثلاً چونسا، انور رٹول، اصیل..."
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                درجہ بندی (Grade) *
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
              >
                <option value="درجہ اول (Grade A)">درجہ اول (Grade A Export)</option>
                <option value="درجہ دوم (Grade B)">درجہ دوم (Grade B Domestic)</option>
                <option value="پریمیئم سپیشل">پریمیئم سپیشل (Handpicked)</option>
                <option value="درجہ سوم (Commercial)">درجہ سوم (Commercial Mix)</option>
              </select>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                مقدار / تعداد *
              </label>
              <input
                type="number"
                required
                dir="ltr"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="150"
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-base font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                پیمانہ (Unit) *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as WeightUnit)}
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
              >
                <option value="peti">پیٹی / گتہ کریٹ (Crates)</option>
                <option value="man">من (40 کلوگرام)</option>
                <option value="kg">کلوگرام (Kilograms)</option>
                <option value="ton">ٹن (Tonnes)</option>
              </select>
            </div>
          </div>

          {/* Harvest Date & Farmer Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                تاریخ چنائی (DD/MM/YYYY) *
              </label>
              <input
                type="text"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                placeholder="24/10/2026"
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 bg-white text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                باغبان / کسان کا نام *
              </label>
              <input
                type="text"
                required
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="حاجی غلام فرید"
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 bg-white text-sm font-bold"
              />
            </div>
          </div>

          {/* Farm Name & GPS Coordinates */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                باغ / فارم کا نام و پتہ *
              </label>
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="مثلاً: الفرید مینگو فارم، چک 18-WB، وہاڑی"
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-800">
                  فارم GPS پن لوکیشن (اختیاری)
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-xs font-bold text-[#78350F] hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>موجودہ GPS پن لیں</span>
                </button>
              </div>
              <input
                type="text"
                value={farmGpsPin}
                onChange={(e) => setFarmGpsPin(e.target.value)}
                placeholder="30.0440° N, 72.3550° E"
                className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              اضافی ریمارکس / پودوں کا بیج یا خاصیت
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: بغیر داغ مال، معیاری مٹھاس، برآمدی باکس میں محفوظ..."
              className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs"
            />
          </div>

          {/* Submit CTA Button (Min 56px touch target) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[58px] p-4 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98"
            >
              <Plus className="w-6 h-6 text-amber-300 shrink-0" />
              <span>{isSubmitting ? 'لاٹ بن رہی ہے...' : 'لاٹ پاسپورٹ کارڈ جاری کریں'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
