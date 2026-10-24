import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SaleSlip, Commodity, WeightUnit, Party } from '../types';
import { COMMODITY_KEYS } from '../constants/app';
import { formatDateDDMMYYYY, formatPKR } from '../services/formatters';
import { Receipt, X, Volume2, Calculator, AlertTriangle, Sparkles } from 'lucide-react';
import { VoiceInputButton } from '../components/VoiceInputButton';

interface CreateSaleSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  slipToEdit?: SaleSlip | null;
  initialData?: any;
  onSaved: () => void;
}

export const CreateSaleSlipModal: React.FC<CreateSaleSlipModalProps> = ({
  isOpen,
  onClose,
  slipToEdit,
  initialData,
  onSaved,
}) => {
  const { parties, currentRole, speak, language } = useApp();

  const farmersList = parties.filter((p) => p.role === 'farmer');
  const buyersList = parties.filter((p) => p.role === 'buyer');
  const arhtisList = parties.filter((p) => p.role === 'arhti');

  const [date, setDate] = useState(formatDateDDMMYYYY());
  const [farmerId, setFarmerId] = useState(farmersList[0]?.id || '');
  const [buyerId, setBuyerId] = useState(buyersList[0]?.id || '');
  const [commodity, setCommodity] = useState<Commodity>('mango');
  const [variety, setVariety] = useState('چونسا سفید');
  const [grade, setGrade] = useState('درجہ اول (Grade A)');
  const [crateCount, setCrateCount] = useState<number>(100);
  const [unit, setUnit] = useState<WeightUnit>('man');

  // Weights
  const [grossWeight, setGrossWeight] = useState<number>(4200);
  const [tareWeight, setTareWeight] = useState<number>(200);

  // Pricing & User-Entered Deductions (No default percentages: user enters them)
  const [ratePerUnit, setRatePerUnit] = useState<number>(4500);
  const [commissionPercent, setCommissionPercent] = useState<string>(''); // User enters!
  const [laborPKR, setLaborPKR] = useState<string>('');
  const [marketFeePKR, setMarketFeePKR] = useState<string>('');
  const [transportPKR, setTransportPKR] = useState<string>('');
  const [otherDeductionPKR, setOtherDeductionPKR] = useState<string>('');
  const [otherDescription, setOtherDescription] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Populate when editing
  useEffect(() => {
    if (slipToEdit) {
      setDate(slipToEdit.date);
      setFarmerId(slipToEdit.farmerId);
      setBuyerId(slipToEdit.buyerId);
      setCommodity(slipToEdit.commodity);
      setVariety(slipToEdit.variety);
      setGrade(slipToEdit.grade);
      setCrateCount(slipToEdit.crateCount);
      setUnit(slipToEdit.unit);
      setGrossWeight(slipToEdit.grossWeight);
      setTareWeight(slipToEdit.tareWeight);
      setRatePerUnit(slipToEdit.ratePerUnit);
      setCommissionPercent(slipToEdit.deductions.commissionPercent.toString());
      setLaborPKR(slipToEdit.deductions.laborPKR.toString());
      setMarketFeePKR(slipToEdit.deductions.marketFeePKR.toString());
      setTransportPKR(slipToEdit.deductions.transportPKR.toString());
      setOtherDeductionPKR(slipToEdit.deductions.otherDeductionPKR.toString());
      setOtherDescription(slipToEdit.deductions.otherDescription || '');
      setNotes(slipToEdit.notes || '');
      if (initialData) {
        if (initialData.date) setDate(initialData.date);
        if (initialData.farmerName) {
          const matchFarmer = farmersList.find(
            (f) => f.name.includes(initialData.farmerName) || f.nameUr?.includes(initialData.farmerName)
          );
          if (matchFarmer) setFarmerId(matchFarmer.id);
        }
        if (initialData.commodity) setCommodity(initialData.commodity);
        if (initialData.variety) setVariety(initialData.variety);
        if (initialData.grade) setGrade(initialData.grade);
        if (initialData.crateCount) setCrateCount(initialData.crateCount);
        if (initialData.netWeight) setGrossWeight(initialData.netWeight + 200);
        if (initialData.ratePerUnit) setRatePerUnit(initialData.ratePerUnit);
        if (initialData.commissionPKR) setCommissionPercent(initialData.commissionPercent?.toString() || '');
        if (initialData.laborPKR) setLaborPKR(initialData.laborPKR.toString());
        if (initialData.marketFeePKR) setMarketFeePKR(initialData.marketFeePKR.toString());
        if (initialData.transportPKR) setTransportPKR(initialData.transportPKR.toString());
        if (initialData.otherDeductionPKR) setOtherDeductionPKR(initialData.otherDeductionPKR.toString());
        if (initialData.notes) setNotes(initialData.notes);
      } else {
        setDate(formatDateDDMMYYYY());
        setFarmerId(farmersList[0]?.id || '');
        setBuyerId(buyersList[0]?.id || '');
        setCommodity('mango');
        setVariety('چونسا سفید');
        setGrade('درجہ اول (Grade A)');
        setCrateCount(100);
        setUnit('man');
        setGrossWeight(4200);
        setTareWeight(200);
        setRatePerUnit(4500);
        setCommissionPercent(''); // No default percentage
        setLaborPKR('');
        setMarketFeePKR('');
        setTransportPKR('');
        setOtherDeductionPKR('');
        setOtherDescription('');
        setNotes('');
      }
    }
  }, [slipToEdit, initialData, isOpen]);

  if (!isOpen) return null;

  // Auto calculations
  const netWeight = Math.max(0, grossWeight - tareWeight);

  // If unit is man, and weight is entered in kg, net in man is netWeight / 40
  // If unit is kg, rate is per kg. If unit is man, rate is per man.
  const grossAmount =
    unit === 'man'
      ? Math.round((netWeight / 40) * ratePerUnit)
      : Math.round(netWeight * ratePerUnit);

  const parsedCommPct = parseFloat(commissionPercent) || 0;
  const commissionPKR = Math.round((grossAmount * parsedCommPct) / 100);
  const parsedLabor = parseFloat(laborPKR) || 0;
  const parsedMarket = parseFloat(marketFeePKR) || 0;
  const parsedTransport = parseFloat(transportPKR) || 0;
  const parsedOther = parseFloat(otherDeductionPKR) || 0;

  const totalDeductions =
    commissionPKR + parsedLabor + parsedMarket + parsedTransport + parsedOther;

  const netPayable = Math.max(0, grossAmount - totalDeductions);

  const handleReadSummary = () => {
    const f = parties.find((p) => p.id === farmerId);
    const b = parties.find((p) => p.id === buyerId);
    const urduSpeech = `بولی پرچی جائزہ۔ کسان ${f?.nameUr || f?.name}۔ خریدار ${
      b?.nameUr || b?.name
    }۔ جنس ${variety}۔ خالص وزن ${netWeight} کلوگرام۔ کل مالیت ${grossAmount} روپے۔ منہا کٹوتیاں ${totalDeductions} روپے۔ خالص واجب الادا رقم ${netPayable} روپے۔`;
    speak(urduSpeech);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const farmer = parties.find((p) => p.id === farmerId) || farmersList[0];
    const buyer = parties.find((p) => p.id === buyerId) || buyersList[0];
    const arhti = arhtisList[0] || parties.find((p) => p.role === 'arhti') || parties[0];

    if (!farmer || !buyer) {
      setError('کسان اور خریدار کا انتخاب لازمی ہے۔');
      return;
    }

    if (netWeight <= 0) {
      setError('خالص وزن صفر سے زیادہ ہونا چاہیے۔');
      return;
    }

    const { saleSlipRepository } = await import('../repositories/saleSlipRepository');

    await saleSlipRepository.save(
      {
        id: slipToEdit?.id,
        serialNumber: slipToEdit?.serialNumber || '',
        date,
        farmerId: farmer.id,
        farmerName: farmer.nameUr || farmer.name,
        buyerId: buyer.id,
        buyerName: buyer.nameUr || buyer.name,
        arhtiId: arhti.id,
        arhtiName: arhti.nameUr || arhti.name,
        commodity,
        variety,
        grade,
        crateCount,
        unit,
        grossWeight,
        tareWeight,
        netWeight,
        ratePerUnit,
        grossAmount,
        deductions: {
          commissionPercent: parsedCommPct,
          commissionPKR,
          laborPKR: parsedLabor,
          marketFeePKR: parsedMarket,
          transportPKR: parsedTransport,
          otherDeductionPKR: parsedOther,
          otherDescription: otherDescription.trim() || undefined,
        },
        totalDeductions,
        netPayable,
        notes,
        status: slipToEdit?.status || 'active',
        isLinkedToKhata: slipToEdit?.isLinkedToKhata || false,
        isSample: false,
      },
      currentRole,
      arhti.nameUr || arhti.name
    );

    speak('بولی پرچی کامیابی سے محفوظ ہو گئی۔');
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-2xl parchment-slip rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-[#78350F] animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto text-stone-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900 shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-urdu text-stone-900">
                {slipToEdit ? 'بولی پرچی میں ترمیم' : 'نئی بولی و نیلامی پرچی'}
              </h3>
              <p className="text-xs text-stone-600">
                آڑھتی کاؤنٹر: کسان و خریدار کے درمیان باضابطہ رسید
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReadSummary}
              type="button"
              className="min-h-[44px] px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Volume2 className="w-4 h-4 text-amber-800 shrink-0" />
              <span>سنیں</span>
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
          {error && (
            <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Date & Serial */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                تاریخ اجرا (DD/MM/YYYY) *
              </label>
              <input
                type="text"
                dir="ltr"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                سریل نمبر (Serial No)
              </label>
              <input
                type="text"
                dir="ltr"
                disabled
                value={slipToEdit ? slipToEdit.serialNumber : 'خودکار جنریٹ ہوگا'}
                className="w-full h-11 px-3 rounded-xl border border-stone-300 bg-stone-100 text-xs font-mono font-bold text-stone-600"
              />
            </div>
          </div>

          {/* Parties: Farmer & Buyer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                🌾 کسان / زمیندار (Farmer) *
              </label>
              <select
                value={farmerId}
                onChange={(e) => setFarmerId(e.target.value)}
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-bold"
              >
                {farmersList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nameUr || f.name} ({f.village})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                💰 خریدار / بیوپاری (Buyer) *
              </label>
              <select
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-bold"
              >
                {buyersList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nameUr || b.name} ({b.village})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Commodity, Variety & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                جنس / فصل *
              </label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value as Commodity)}
                className="w-full h-11 px-2.5 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
              >
                {COMMODITY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k === 'mango' && 'آم (Mango)'}
                    {k === 'citrus' && 'کنو / مالٹا (Citrus)'}
                    {k === 'dates' && 'کھجور (Dates)'}
                    {k === 'cotton' && 'کپاس / پھٹی (Cotton)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                قسم / ورائٹی
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="مثلاً: چونسا، سندھڑی، بی ایس 15"
                className="w-full h-11 px-2.5 rounded-xl border-2 border-stone-300 bg-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                گریڈ / کوالٹی
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="درجہ اول / برآمدی / کمرشل"
                className="w-full h-11 px-2.5 rounded-xl border-2 border-stone-300 bg-white text-xs font-semibold"
              />
            </div>
          </div>

          {/* Crates, Gross Weight, Tare Weight, Net Weight */}
          <div className="p-3.5 bg-amber-50/90 rounded-2xl border-2 border-amber-300 space-y-2">
            <span className="text-xs font-bold text-stone-900 block">
              وزن اور تعداد پیمائش (Weighbridge & Crates):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  تعداد پیٹی / توڑے
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={crateCount}
                  onChange={(e) => setCrateCount(parseInt(e.target.value, 10) || 0)}
                  className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  کل وزن (Gross Kg)
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  خالی وزن (Tare Kg)
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                  صافی وزن (Auto Net)
                </label>
                <div className="w-full h-11 px-2.5 rounded-xl border border-emerald-400 bg-emerald-50 flex items-center font-mono font-bold text-emerald-950 text-xs">
                  <bdi dir="ltr">{netWeight} kg</bdi>
                  {unit === 'man' && (
                    <span className="text-[10px] text-emerald-800 ms-1 font-sans">
                      ({(netWeight / 40).toFixed(1)} من)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rate per Unit & Gross Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                ریٹ فی من / فی یونٹ (PKR) *
              </label>
              <input
                type="number"
                dir="ltr"
                required
                value={ratePerUnit}
                onChange={(e) => setRatePerUnit(parseFloat(e.target.value) || 0)}
                placeholder="مثلاً: 4500"
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-base font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                کل مالیت (Auto Gross Amount)
              </label>
              <div className="w-full h-12 px-3 rounded-xl border-2 border-amber-300 bg-amber-100 flex items-center font-mono font-bold text-lg text-amber-950">
                <bdi dir="ltr">{formatPKR(grossAmount, language)}</bdi>
              </div>
            </div>
          </div>

          {/* User-Editable Deduction Lines (NO default percentages) */}
          <div className="p-3.5 bg-red-50/80 rounded-2xl border-2 border-red-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-950 block">
                منڈی کٹوتیاں (صارف خود فیصد اور رقم درج کرے):
              </span>
              <span className="text-[10px] text-stone-500 font-bold">کوئی ڈیفالٹ لاگو نہیں</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Commission % */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  کمیشن فیصد (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  dir="ltr"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  placeholder="مثلاً: 4.0"
                  className="w-full h-10 px-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-stone-500 font-mono block mt-0.5">
                  = Rs. {commissionPKR.toLocaleString('en-US')}
                </span>
              </div>

              {/* Labor */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  مزدوری / پلائی (PKR)
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={laborPKR}
                  onChange={(e) => setLaborPKR(e.target.value)}
                  placeholder="مثلاً: 2500"
                  className="w-full h-10 px-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                />
              </div>

              {/* Market Fee */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  منڈی فیس / ٹیکس
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={marketFeePKR}
                  onChange={(e) => setMarketFeePKR(e.target.value)}
                  placeholder="مثلاً: 500"
                  className="w-full h-10 px-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                />
              </div>

              {/* Transport */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  کرایہ مال برداری
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={transportPKR}
                  onChange={(e) => setTransportPKR(e.target.value)}
                  placeholder="مثلاً: 3000"
                  className="w-full h-10 px-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Other deduction */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  دیگر کٹوتی (روپے)
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={otherDeductionPKR}
                  onChange={(e) => setOtherDeductionPKR(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  دیگر کٹوتی کی وجہ
                </label>
                <input
                  type="text"
                  value={otherDescription}
                  onChange={(e) => setOtherDescription(e.target.value)}
                  placeholder="باردانہ، سلائی، وغیرہ"
                  className="w-full h-10 px-2 rounded-xl border border-stone-300 bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Net Payable Highlight Banner */}
          <div className="p-4 rounded-2xl bg-[#78350F] text-amber-50 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-amber-200">
                خالص واجب الادا رقم (Auto Net Payable)
              </span>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">
                <bdi dir="ltr">{formatPKR(netPayable, language)}</bdi>
              </div>
            </div>
            <div className="text-end text-xs text-amber-200/90 font-mono">
              <div>کل مالیت: Rs. {grossAmount.toLocaleString('en-US')}</div>
              <div>منہا کٹوتیاں: -Rs. {totalDeductions.toLocaleString('en-US')}</div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              نوٹس / خاص شرائط
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: تمام پیٹیاں موقع پر چیک ہو گئیں۔"
              className="w-full h-11 px-3 rounded-xl border border-stone-300 bg-white text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-amber-200 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[56px] rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-sm"
            >
              منسوخ
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[56px] rounded-2xl bg-[#78350F] hover:bg-amber-900 text-amber-50 font-bold text-base shadow-md"
            >
              {slipToEdit ? 'ترمیم محفوظ کریں' : 'پرچی جاری کریں'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
