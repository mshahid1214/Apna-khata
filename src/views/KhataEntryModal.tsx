import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  KhataEntry,
  KhataEntryType,
  KhataFlowType,
  Party,
  Role,
  KhataInputDetails,
  KhataDeductionDetails,
} from '../types';
import { formatDateDDMMYYYY, formatPKR } from '../services/formatters';
import { BookOpen, X, Camera, Image, History, CheckCircle2, AlertCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { VoiceInputButton } from '../components/VoiceInputButton';

interface KhataEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: KhataEntry | null;
  farmer: Party;
  arhti: Party;
  initialVoiceData?: {
    amount?: number;
    flowType?: 'given' | 'received';
    entryType?: KhataEntryType;
    notes?: string;
    partyName?: string;
  } | null;
}

export const KhataEntryModal: React.FC<KhataEntryModalProps> = ({
  isOpen,
  onClose,
  entryToEdit,
  farmer,
  arhti,
  initialVoiceData,
}) => {
  const { currentRole, language, speak } = useApp();

  const [entryType, setEntryType] = useState<KhataEntryType>('advance_cash');
  const [flowType, setFlowType] = useState<KhataFlowType>('given');
  const [date, setDate] = useState(formatDateDDMMYYYY());
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [season, setSeason] = useState('سیزن آم 2026');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  // Input Details (if input_item)
  const [inputCategory, setInputCategory] = useState<'fertilizer' | 'seed' | 'spray' | 'diesel' | 'other'>(
    'fertilizer'
  );
  const [inputName, setInputName] = useState('');
  const [inputQty, setInputQty] = useState('');
  const [inputUnit, setInputUnit] = useState('بوری (Bags)');
  const [inputRate, setInputRate] = useState('');

  // Deduction Details (if deduction)
  const [commFee, setCommFee] = useState('');
  const [laborFee, setLaborFee] = useState('');
  const [marketTax, setMarketTax] = useState('');
  const [transportFee, setTransportFee] = useState('');

  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Populate when editing
  useEffect(() => {
    if (entryToEdit) {
      setEntryType(entryToEdit.entryType);
      setFlowType(entryToEdit.flowType);
      setDate(entryToEdit.date);
      setAmount(entryToEdit.amountPKR.toString());
      setDescription(entryToEdit.description);
      setSeason(entryToEdit.season || 'سیزن آم 2026');
      setNotes(entryToEdit.notes || '');
      setPhotoUrl(entryToEdit.photoUrl);

      if (entryToEdit.inputDetails) {
        setInputCategory(entryToEdit.inputDetails.itemCategory);
        setInputName(entryToEdit.inputDetails.itemName);
        setInputQty(entryToEdit.inputDetails.quantity.toString());
        setInputUnit(entryToEdit.inputDetails.unit);
        setInputRate(entryToEdit.inputDetails.ratePerUnitPKR?.toString() || '');
      }

      if (entryToEdit.deductionDetails) {
        setCommFee(entryToEdit.deductionDetails.commissionPKR?.toString() || '');
        setLaborFee(entryToEdit.deductionDetails.laborPKR?.toString() || '');
        setMarketTax(entryToEdit.deductionDetails.marketFeePKR?.toString() || '');
        setTransportFee(entryToEdit.deductionDetails.transportPKR?.toString() || '');
      }
    } else {
      // Default new entry or prefill from voice
      setEntryType(initialVoiceData?.entryType || 'advance_cash');
      setFlowType(initialVoiceData?.flowType || 'given');
      setDate(formatDateDDMMYYYY());
      setAmount(initialVoiceData?.amount ? initialVoiceData.amount.toString() : '');
      setDescription(initialVoiceData?.notes || '');
      setSeason('سیزن آم 2026');
      setNotes(initialVoiceData?.notes || '');
      setPhotoUrl(undefined);
      setInputName('');
      setInputQty('');
      setCommFee('');
      setLaborFee('');
    }
  }, [entryToEdit, isOpen, initialVoiceData]);

  // Adjust default flowType based on entryType
  const handleTypeSelect = (type: KhataEntryType) => {
    setEntryType(type);
    if (type === 'advance_cash' || type === 'input_item' || type === 'deduction') {
      setFlowType('given'); // بنام (Given / Advance)
    } else if (type === 'sale_proceed' || type === 'payment_received') {
      setFlowType('received'); // جمع (Received / Sale value)
    }
  };

  // Auto-calculate amount when inputs change
  useEffect(() => {
    if (entryType === 'input_item') {
      const q = parseFloat(inputQty) || 0;
      const r = parseFloat(inputRate) || 0;
      if (q > 0 && r > 0) {
        setAmount((q * r).toString());
      }
    } else if (entryType === 'deduction') {
      const c = parseFloat(commFee) || 0;
      const l = parseFloat(laborFee) || 0;
      const m = parseFloat(marketTax) || 0;
      const t = parseFloat(transportFee) || 0;
      const total = c + l + m + t;
      if (total > 0) {
        setAmount(total.toString());
      }
    }
  }, [entryType, inputQty, inputRate, commFee, laborFee, marketTax, transportFee]);

  if (!isOpen) return null;

  // Handle Photo upload simulation or base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('براہ کرم درست رقم درج کیجیے۔');
      speak('براہ کرم درست رقم درج کیجیے۔');
      return;
    }

    const { khataRepository } = await import('../repositories/khataRepository');

    let desc = description.trim();
    if (!desc) {
      if (entryType === 'advance_cash') desc = 'پیشگی نقد رقم (ادھار)';
      else if (entryType === 'input_item') desc = `${inputName || 'کھاد/بیج'} (${inputQty} ${inputUnit})`;
      else if (entryType === 'sale_proceed') desc = 'فصل فروخت آمدن';
      else if (entryType === 'deduction') desc = 'منڈی اخراجات و کٹوتیاں';
      else desc = 'نقد ادائیگی';
    }

    let inputDetails: KhataInputDetails | undefined;
    if (entryType === 'input_item') {
      inputDetails = {
        itemCategory: inputCategory,
        itemName: inputName.trim() || 'کھاد / بیج',
        quantity: parseFloat(inputQty) || 1,
        unit: inputUnit,
        ratePerUnitPKR: parseFloat(inputRate) || undefined,
      };
    }

    let deductionDetails: KhataDeductionDetails | undefined;
    if (entryType === 'deduction') {
      deductionDetails = {
        commissionPKR: parseFloat(commFee) || 0,
        laborPKR: parseFloat(laborFee) || 0,
        marketFeePKR: parseFloat(marketTax) || 0,
        transportPKR: parseFloat(transportFee) || 0,
      };
    }

    const editorName = currentRole === 'farmer' ? farmer.nameUr || farmer.name : arhti.nameUr || arhti.name;

    await khataRepository.save(
      {
        id: entryToEdit?.id,
        date,
        farmerId: farmer.id,
        farmerName: farmer.nameUr || farmer.name,
        arhtiId: arhti.id,
        arhtiName: arhti.nameUr || arhti.name,
        entryType,
        flowType,
        description: desc,
        amountPKR: val,
        debitPKR: flowType === 'given' ? val : 0,
        creditPKR: flowType === 'received' ? val : 0,
        season,
        inputDetails,
        deductionDetails,
        notes,
        photoUrl,
        farmerConfirmed: entryToEdit ? entryToEdit.farmerConfirmed : currentRole === 'farmer',
        arhtiConfirmed: entryToEdit ? entryToEdit.arhtiConfirmed : currentRole === 'arhti',
        history: entryToEdit?.history || [],
        isSample: false,
      },
      currentRole,
      editorName
    );

    speak('کھاتے کا اندراج کامیابی سے محفوظ کر دیا گیا۔');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-2xl parchment-slip rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-[#78350F] animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto text-stone-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-urdu text-stone-900">
                {entryToEdit ? 'کھاتہ اندراج میں ترمیم' : 'نیا بہی کھاتہ اندراج'}
              </h3>
              <p className="text-xs text-stone-600">
                کسان: {farmer.nameUr || farmer.name} · آڑھتی: {arhti.nameUr || arhti.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit History Toggle if editing */}
        {entryToEdit && entryToEdit.history && entryToEdit.history.length > 0 && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              <span>پچھلی ترامیم کی تاریخ دیکھیں ({entryToEdit.history.length})</span>
            </button>

            {showHistory && (
              <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs space-y-2">
                <span className="font-bold text-stone-800 block">شفاف آڈٹ ٹریل (Edit Audit):</span>
                {entryToEdit.history.map((hist) => (
                  <div key={hist.id} className="p-2 bg-white rounded-lg border border-amber-200">
                    <div className="flex justify-between font-bold text-stone-700">
                      <span>{hist.editedByName} ({hist.editedByRole})</span>
                      <bdi dir="ltr">{hist.timestamp}</bdi>
                    </div>
                    <p className="text-stone-600 mt-1">{hist.changeSummary}</p>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      سابقہ رقم: Rs. {hist.previousAmount.toLocaleString('en-US')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Voice Entry Quick Bar & Required AI Warning Note */}
        <div className="mt-3 p-3 bg-amber-100/90 border border-amber-300 rounded-2xl space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950 font-urdu">
              <Sparkles className="w-4 h-4 text-amber-800" />
              <span>آواز سے فوری اندراج (بول کر فارم خودکار بھریں):</span>
            </div>
            <VoiceInputButton
              field="full"
              placeholderPrompt="مثلاً: 'پچاس ہزار روپے پیشگی ادھار دیے' یا 'paanch hazaar advance diya'"
              onParsed={(parsed) => {
                if (parsed.amount) setAmount(parsed.amount.toString());
                if (parsed.flowType) setFlowType(parsed.flowType);
                if (parsed.entryType) setEntryType(parsed.entryType as any);
                if (parsed.notes) setNotes(parsed.notes);
              }}
            />
          </div>
          <div className="flex items-start gap-1.5 text-[11px] text-amber-900 font-urdu border-t border-amber-200/80 pt-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
            <span>
              <strong>ضروری یاد دہانی: </strong>ہاتھ کی تحریر یا زبانی الفاظ پڑھنے میں غلطی ہو سکتی ہے، براہِ کرم محفوظ کرنے سے پہلے ضرور تصدیق کریں۔
              <span className="font-sans block text-[10px] text-stone-600">AI can misread handwriting. Always check before saving.</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold">
              {error}
            </div>
          )}

          {/* 5-Category Entry Type Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              اندراج کی نوعیت منتخب کیجیے *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { type: 'advance_cash' as const, label: 'پیشگی نقد ادھار', icon: '💵' },
                { type: 'input_item' as const, label: 'کھاد / بیج / اسپرے', icon: '🌱' },
                { type: 'sale_proceed' as const, label: 'فصل فروخت آمدن', icon: '🌾' },
                { type: 'deduction' as const, label: 'منڈی کٹوتیاں', icon: '✂️' },
                { type: 'payment_received' as const, label: 'نقد ادائیگی / وصولی', icon: '🤝' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleTypeSelect(item.type)}
                  className={`min-h-[56px] p-2 rounded-xl border-2 text-start transition-all flex flex-col justify-center ${
                    entryType === item.type
                      ? 'border-[#78350F] bg-amber-100 text-amber-950 font-bold shadow-xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="text-xs font-bold mt-1 leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Jama / Naam Flow Type */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              کھاتے کا رخ (Jama / Naam)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFlowType('given')}
                className={`min-h-[52px] rounded-xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center justify-center transition-all ${
                  flowType === 'given'
                    ? 'border-rose-700 bg-rose-100 text-rose-950 shadow-xs'
                    : 'border-stone-200 bg-white text-stone-700'
                }`}
              >
                <span>بنام / دیا (Debit - ادھار / کٹوتی)</span>
                <span className="text-[10px] font-normal text-rose-800">کسان کے ذمہ رقم کا اندراج</span>
              </button>

              <button
                type="button"
                onClick={() => setFlowType('received')}
                className={`min-h-[52px] rounded-xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center justify-center transition-all ${
                  flowType === 'received'
                    ? 'border-emerald-700 bg-emerald-100 text-emerald-950 shadow-xs'
                    : 'border-stone-200 bg-white text-stone-700'
                }`}
              >
                <span>جمع / لیا (Credit - فصل آمدن)</span>
                <span className="text-[10px] font-normal text-emerald-800">کسان کے حق میں رقم کا اندراج</span>
              </button>
            </div>
          </div>

          {/* If input_item: Show Item details (seed, fertilizer, spray) */}
          {entryType === 'input_item' && (
            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border-2 border-emerald-300 space-y-2.5">
              <span className="text-xs font-bold text-emerald-950 block">
                زرعی جنس کی تفصیل (کھاد، بیج، اسپرے):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    جنس کا نام (مثلاً: ڈی اے پی کھاد، بیج)
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="سونابریک ڈی اے پی / کپاس بیج"
                    className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    تعداد / بوری
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={inputQty}
                    onChange={(e) => setInputQty(e.target.value)}
                    placeholder="مثلاً: 5"
                    className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    فی بوری ریٹ (روپے)
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={inputRate}
                    onChange={(e) => setInputRate(e.target.value)}
                    placeholder="17000"
                    className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* If deduction: Show deduction breakdown */}
          {entryType === 'deduction' && (
            <div className="p-3.5 bg-rose-50/80 rounded-2xl border-2 border-rose-300 space-y-2.5">
              <span className="text-xs font-bold text-rose-950 block">
                کٹوتیاں تفصیلاً درج کیجیے:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    کمیشن (روپے)
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={commFee}
                    onChange={(e) => setCommFee(e.target.value)}
                    placeholder="18000"
                    className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    پلائی / مزدوری
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={laborFee}
                    onChange={(e) => setLaborFee(e.target.value)}
                    placeholder="2000"
                    className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    منڈی فیس / ٹیکس
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={marketTax}
                    onChange={(e) => setMarketTax(e.target.value)}
                    placeholder="500"
                    className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    کرایہ ٹرانسپورٹ
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={transportFee}
                    onChange={(e) => setTransportFee(e.target.value)}
                    placeholder="300"
                    className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-800">
                  کل رقم (روپے) *
                </label>
                <VoiceInputButton
                  field="amount"
                  placeholderPrompt="بولیں: مثلاً 'پچاس ہزار' یا '50 hazaar' یا '2 lakh'"
                  onParsed={(p) => {
                    if (p.amount) setAmount(p.amount.toString());
                  }}
                  className="min-h-[32px] min-w-[32px] px-2 py-0.5 text-[10px]"
                />
              </div>
              <input
                type="number"
                required
                dir="ltr"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="مثلاً: 50000"
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                تاریخ (DD/MM/YYYY) *
              </label>
              <input
                type="text"
                dir="ltr"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-mono font-bold"
              />
            </div>
          </div>

          {/* Description and Season */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                تفصیل / وجہ اندراج
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثلاً: کھاد ادھار، چونسا آم بولی، پیشگی قسط"
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                فصل / سیزن
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-semibold"
              >
                <option value="سیزن آم 2026">سیزن آم 2026</option>
                <option value="خریف 2026 (کپاس / دھان)">خریف 2026 (کپاس / دھان)</option>
                <option value="ربیع 2026 (گندم)">ربیع 2026 (گندم)</option>
                <option value="سیزن کنو 2026">سیزن کنو 2026</option>
                <option value="سیزن کھجور 2026">سیزن کھجور 2026</option>
              </select>
            </div>
          </div>

          {/* Optional Paper Slip Photo (Camera / Upload) */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <Camera className="w-4 h-4 text-amber-800" />
                <span>کاغذی پرچی یا رسید کی تصویر (اختیاری ثبوت)</span>
              </div>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="text-[11px] text-rose-800 hover:underline font-bold"
                >
                  تصویر ہٹائیں
                </button>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-3">
              <label className="cursor-pointer min-h-[44px] px-3.5 py-2 bg-white hover:bg-amber-100 border-2 border-amber-300 rounded-xl text-xs font-bold text-stone-800 flex items-center gap-2 shadow-xs transition-colors">
                <Image className="w-4 h-4 text-amber-700" />
                <span>تصویر منتخب کریں / کیمرہ</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {photoUrl && (
                <div className="relative">
                  <img
                    src={photoUrl}
                    alt="Slip proof"
                    className="w-14 h-14 object-cover rounded-xl border-2 border-amber-400 shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-800">
                اضافی ریمارکس / نوٹس
              </label>
              <VoiceInputButton
                field="note"
                placeholderPrompt="بولیں: مثلاً 'گاڑی نمبر FSD-445 کے ساتھ بھیجا گیا'"
                onParsed={(p) => {
                  if (p.notes) setNotes(p.notes);
                }}
                className="min-h-[32px] min-w-[32px] px-2 py-0.5 text-[10px]"
              />
            </div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="زبانی طے شدہ شرائط، گاڑی نمبر یا گواہ کا حوالہ..."
              className="w-full p-2.5 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-xs"
            />
          </div>

          {/* Action Buttons (Min 56px touch target) */}
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
              {entryToEdit ? 'ترمیم محفوظ کریں' : 'کھاتے میں شامل کریں'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
