import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SlipType, Commodity, WeightUnit } from '../types';
import { COMMODITY_KEYS } from '../constants/app';
import { formatDateDDMMYYYY, generateSlipNumber, formatPKR } from '../services/formatters';
import { calculateNetWeight, calculateGrossAmount } from '../services/unitConverter';
import { StampSeal } from '../components/StampSeal';
import { Receipt, X, Volume2, CheckCircle2 } from 'lucide-react';

export const CreateSlipModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  defaultType?: SlipType;
}> = ({ isOpen, onClose, defaultType = 'boli' }) => {
  const { parties, settings, createSlip, t, language, speak } = useApp();

  const [type, setType] = useState<SlipType>(defaultType);
  const [partyId, setPartyId] = useState(parties[0]?.id || '');
  const [commodity, setCommodity] = useState<Commodity>('mango');
  const [variety, setVariety] = useState('چونسا سفید');
  const [date, setDate] = useState(formatDateDDMMYYYY());
  
  // Weights
  const [grossWeight, setGrossWeight] = useState<number>(4000);
  const [tareWeight, setTareWeight] = useState<number>(0);
  const [unit, setUnit] = useState<WeightUnit>('man');
  const [petiWeightKg, setPetiWeightKg] = useState<number>(10);
  
  // Pricing & Deductions
  const [ratePerUnitPKR, setRatePerUnitPKR] = useState<number>(
    settings.cropRates.mango?.ratePerManPKR || 4500
  );
  const [commissionPercent, setCommissionPercent] = useState<number>(settings.defaultCommissionPercent);
  const [kantaFeePKR, setKantaFeePKR] = useState<number>(settings.defaultKantaFeePKR);
  const [laborFeePKR, setLaborFeePKR] = useState<number>(settings.defaultLaborPerManPKR * 100);
  const [freightFeePKR, setFreightFeePKR] = useState<number>(0);
  const [advanceAdjustedPKR, setAdvanceAdjustedPKR] = useState<number>(0);
  
  // Vehicle & notes
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [storageChamber, setStorageChamber] = useState('');
  const [notes, setNotes] = useState('');
  const [stampVerified, setStampVerified] = useState(true);

  // Sync default rate when commodity changes
  useEffect(() => {
    const crop = settings.cropRates[commodity];
    if (crop) {
      setRatePerUnitPKR(crop.ratePerManPKR);
      if (crop.varieties && crop.varieties.length > 0) {
        setVariety(crop.varieties[0]);
      }
    }
  }, [commodity, settings]);

  if (!isOpen) return null;

  // Real-time calculations
  const netWeight = calculateNetWeight(grossWeight, tareWeight);
  const grossAmountPKR = calculateGrossAmount(
    netWeight,
    unit,
    ratePerUnitPKR,
    settings.manKgWeight,
    petiWeightKg
  );
  
  const commissionPKR =
    type === 'boli' ? Math.round((grossAmountPKR * commissionPercent) / 100) : 0;
  
  const totalDeductions =
    commissionPKR + kantaFeePKR + laborFeePKR + freightFeePKR + advanceAdjustedPKR;
  
  const netPayablePKR = Math.max(0, grossAmountPKR - totalDeductions);

  const handleReadSummary = () => {
    const p = parties.find((item) => item.id === partyId);
    const pName = p ? p.nameUr || p.name : 'منتخب پارٹی';
    const urduSpeech = `پرچی جائزہ۔ جنس ${variety}۔ خالص وزن ${netWeight} ${unit}۔ کل مالیت ${grossAmountPKR} روپے۔ منہا کٹوتیاں ${totalDeductions} روپے۔ خالص رقم ${netPayablePKR} روپے۔`;
    const romanSpeech = `Parchi Jaiza. Fasal ${variety}. Net wazan ${netWeight} ${unit}. Kul maaliyat ${grossAmountPKR} rupees. Katoti ${totalDeductions} rupees. Net raqam ${netPayablePKR} rupees.`;
    speak(urduSpeech, romanSpeech);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = parties.find((item) => item.id === partyId) || parties[0];
    if (!p) return;

    const slipNum = generateSlipNumber(type);

    await createSlip({
      slipNumber: slipNum,
      type,
      date,
      partyId: p.id,
      partyName: p.nameUr || p.name,
      partyRole: p.role,
      commodity,
      variety,
      grossWeight,
      tareWeight,
      netWeight,
      unit,
      petiWeightKg: unit === 'peti' ? petiWeightKg : undefined,
      ratePerUnitPKR,
      grossAmountPKR,
      deductions: {
        commissionPercent,
        commissionPKR,
        kantaFeePKR,
        laborFeePKR,
        freightPKR: freightFeePKR,
        advanceAdjustedPKR,
      },
      netPayablePKR,
      notes,
      stampVerified,
      vehicleNumber: vehicleNumber.trim() || undefined,
      storageChamber: storageChamber.trim() || undefined,
      isSample: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-2xl parchment-slip rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-[#78350F] animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900 shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-urdu text-stone-900">{t.slipForm.title}</h3>
              <p className="text-xs text-stone-600">کاغذی پرچی کے نمونے پر ڈیجیٹل اندراج</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReadSummary}
              type="button"
              className="min-h-[44px] px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-amber-800 shrink-0" />
              <span>{t.actions.listenAudio}</span>
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Slip Type Tabs (Prioritized: Boli, Kanta, Challan, Transport) */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              پرچی کی قسم منتخب کریں
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['boli', 'kanta', 'challan', 'transport'] as SlipType[]).map((st) => {
                const info = t.slipTypes[st];
                const isSelected = type === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setType(st)}
                    className={`min-h-[52px] p-2 rounded-xl border-2 text-start transition-all flex flex-col justify-center ${
                      isSelected
                        ? 'border-[#78350F] bg-amber-100 text-amber-950 font-bold shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <span className="text-xs font-bold truncate">{info.title}</span>
                    <span className="text-[10px] text-stone-500 font-mono tracking-wider">{info.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Party and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {t.slipForm.party} *
              </label>
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-semibold"
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameUr || p.name} ({p.village})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {t.slipForm.date} (DD/MM/YYYY)
              </label>
              <input
                type="text"
                dir="ltr"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-mono font-semibold"
              />
            </div>
          </div>

          {/* Commodity & Variety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {t.slipForm.commodity}
              </label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value as Commodity)}
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-semibold"
              >
                {COMMODITY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {t.commodities[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {t.slipForm.variety}
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="مثلاً: چونسا، کنو برآمدی، کپاس"
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-semibold"
              />
            </div>
          </div>

          {/* Physical Form Grid: Weights (Columns & Rows) */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border-2 border-amber-200">
            <span className="text-xs font-bold text-stone-900 block mb-2">
              وزن کا باقاعدہ کانٹا ریکارڈ (Weighbridge Record)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.slipForm.grossWeight}
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={grossWeight || ''}
                  onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.slipForm.tareWeight}
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={tareWeight || ''}
                  onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                  {t.slipForm.netWeight}
                </label>
                <div className="w-full h-11 px-2.5 rounded-xl border border-emerald-400 bg-emerald-50 flex items-center font-mono font-bold text-emerald-950 text-sm">
                  <bdi dir="ltr">{netWeight}</bdi>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.slipForm.unit}
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as WeightUnit)}
                  className="w-full h-11 px-2 rounded-xl border border-stone-300 bg-white text-xs font-bold"
                >
                  <option value="man">{t.units.man}</option>
                  <option value="kg">{t.units.kg}</option>
                  <option value="ton">{t.units.ton}</option>
                  <option value="peti">{t.units.peti}</option>
                </select>
              </div>
            </div>

            {unit === 'peti' && (
              <div className="mt-2.5 pt-2 border-t border-amber-200 flex items-center gap-2">
                <label className="text-xs font-bold text-stone-700">
                  {t.slipForm.petiWeight}:
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={petiWeightKg}
                  onChange={(e) => setPetiWeightKg(parseFloat(e.target.value) || 10)}
                  className="w-24 h-9 px-2 rounded-lg border border-stone-300 bg-white text-xs font-mono font-bold"
                />
              </div>
            )}
          </div>

          {/* Rate & Gross Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {t.slipForm.ratePerUnit}
              </label>
              <input
                type="number"
                dir="ltr"
                value={ratePerUnitPKR || ''}
                onChange={(e) => setRatePerUnitPKR(parseFloat(e.target.value) || 0)}
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-base font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {t.slipForm.grossTotal}
              </label>
              <div className="w-full h-12 px-3 rounded-xl border-2 border-amber-300 bg-amber-100 flex items-center font-mono font-bold text-lg text-amber-950">
                <bdi dir="ltr">{formatPKR(grossAmountPKR, language)}</bdi>
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="p-3.5 bg-red-50/60 rounded-2xl border border-red-200 space-y-2.5">
            <span className="text-xs font-bold text-stone-900 block">
              کٹوتیاں و اخراجات منہا (Deductions)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {type === 'boli' && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    کمیشن فیصد (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    dir="ltr"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-stone-500 font-mono">
                    = Rs. {commissionPKR}
                  </span>
                </div>
              )}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.slipForm.kantaFee}
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={kantaFeePKR}
                  onChange={(e) => setKantaFeePKR(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.slipForm.laborFee}
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={laborFeePKR}
                  onChange={(e) => setLaborFeePKR(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.slipForm.freightFee}
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={freightFeePKR}
                  onChange={(e) => setFreightFeePKR(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.slipForm.advanceAdjusted}
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={advanceAdjustedPKR}
                  onChange={(e) => setAdvanceAdjustedPKR(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Vehicle and Chamber */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {t.slipForm.vehicleNo}
              </label>
              <input
                type="text"
                dir="ltr"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="مثلاً: MN-7814"
                className="w-full h-11 px-3 rounded-xl border border-stone-300 bg-white text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {t.slipForm.chamberNo}
              </label>
              <input
                type="text"
                value={storageChamber}
                onChange={(e) => setStorageChamber(e.target.value)}
                placeholder="مثلاً: چیمبر نمبر 3"
                className="w-full h-11 px-3 rounded-xl border border-stone-300 bg-white text-sm"
              />
            </div>
          </div>

          {/* Net Payable Highlight Banner */}
          <div className="p-4 rounded-2xl bg-[#78350F] text-amber-50 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-amber-200">
                {t.slipForm.netPayable}
              </span>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">
                <bdi dir="ltr">{formatPKR(netPayablePKR, language)}</bdi>
              </div>
            </div>

            {/* Stamp Verified Toggle */}
            <button
              type="button"
              onClick={() => setStampVerified(!stampVerified)}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                stampVerified
                  ? 'bg-amber-400 text-stone-950 border-amber-300'
                  : 'bg-amber-900/60 text-amber-200 border-amber-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>مہر تصدیق شدہ</span>
            </button>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-amber-200 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[56px] rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-sm"
            >
              {t.actions.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[56px] rounded-2xl bg-[#78350F] hover:bg-amber-900 text-amber-50 font-bold text-base shadow-md"
            >
              {t.actions.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
