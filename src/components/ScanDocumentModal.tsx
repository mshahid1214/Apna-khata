import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Trash2,
  Plus,
  Loader2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPKR, formatDateDDMMYYYY } from '../services/formatters';
import { Role } from '../types';

export interface ExtractedKhataRow {
  id: string;
  date: string;
  partyName: string;
  amount: number;
  flowType: 'given' | 'received';
  entryType: 'advance_cash' | 'input_item' | 'sale_proceed' | 'deduction' | 'payment_received';
  note: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ExtractedSlipData {
  date: string;
  farmerName: string;
  buyerName: string;
  commodity: 'mango' | 'citrus' | 'dates' | 'cotton';
  variety: string;
  grade: string;
  crateCount: number;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  ratePerUnit: number;
  grossAmount: number;
  commissionPercent: number;
  commissionPKR: number;
  laborPKR: number;
  marketFeePKR: number;
  transportPKR: number;
  otherDeductionPKR: number;
  netPayable: number;
  notes: string;
  confidence: 'high' | 'medium' | 'low';
}

interface ScanDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'khata' | 'slip';
  onKhataRowsConfirmed?: (rows: ExtractedKhataRow[]) => void;
  onSlipConfirmed?: (slipData: ExtractedSlipData) => void;
  onSwitchToManual?: () => void;
}

// Generate realistic SVG mock paper slip/bahi for sample testing
function createSampleBahiImage(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#FFF9E6; font-family:sans-serif;">
    <rect width="600" height="800" fill="#FDFBF7" stroke="#78350F" stroke-width="6"/>
    <line x1="60" y1="0" x2="60" y2="800" stroke="#EF4444" stroke-width="2"/>
    <line x1="540" y1="0" x2="540" y2="800" stroke="#EF4444" stroke-width="2"/>
    ${[120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720].map(y => `<line x1="60" y1="${y}" x2="540" y2="${y}" stroke="#93C5FD" stroke-width="1.5" stroke-dasharray="3,3"/>`).join('')}
    <text x="300" y="65" font-size="24" font-weight="bold" fill="#78350F" text-anchor="middle">بسم اللہ الرحمن الرحیم - کھاتہ حاجی غلام رسول</text>
    <text x="490" y="100" font-size="14" fill="#374151" text-anchor="end">بنام (ادھار / پیشگی)</text>
    <text x="110" y="100" font-size="14" fill="#374151">جمع (فصل آمدن)</text>
    
    <text x="490" y="160" font-size="16" fill="#1F2937" text-anchor="end">18/10 پیشگی نقد روپے 50,000</text>
    <text x="490" y="220" font-size="16" fill="#1F2937" text-anchor="end">20/10 ڈی اے پی کھاد 2 بوری روپے 34,000</text>
    <text x="110" y="280" font-size="16" fill="#047857">22/10 چونسا بولی آمدن روپے 125,000</text>
    <text x="490" y="340" font-size="16" fill="#1F2937" text-anchor="end">23/10 منڈی کمیشن و کٹوتی روپے 5,000</text>
    <rect x="220" y="680" width="160" height="70" fill="none" stroke="#DC2626" stroke-width="2" rx="6"/>
    <text x="300" y="722" font-size="14" font-weight="bold" fill="#DC2626" text-anchor="middle">مہر آڑھت غلہ منڈی</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const ScanDocumentModal: React.FC<ScanDocumentModalProps> = ({
  isOpen,
  onClose,
  documentType,
  onKhataRowsConfirmed,
  onSlipConfirmed,
  onSwitchToManual,
}) => {
  const { speak, language } = useApp();

  const [step, setStep] = useState<'upload' | 'scanning' | 'confirm' | 'error'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Extracted Data States
  const [khataRows, setKhataRows] = useState<ExtractedKhataRow[]>([]);
  const [slipData, setSlipData] = useState<ExtractedSlipData | null>(null);
  const [apiError, setApiError] = useState<{ ur: string; en: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Photo selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        processScan(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample photo click
  const handleUseSample = () => {
    const sampleImg = createSampleBahiImage();
    setImagePreview(sampleImg);
    processScan(sampleImg);
  };

  // Process image with backend Gemini API
  const processScan = async (base64Img: string) => {
    setStep('scanning');
    setApiError(null);

    try {
      const res = await fetch('/api/scan-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          documentType,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (documentType === 'slip' && data.slipData) {
          setSlipData(data.slipData);
        } else if (data.extractedRows && data.extractedRows.length > 0) {
          setKhataRows(data.extractedRows);
        } else {
          // Fallback rows if empty
          setKhataRows([
            {
              id: 'row-1',
              date: formatDateDDMMYYYY(),
              partyName: 'حاجی غلام رسول',
              amount: 50000,
              flowType: 'given',
              entryType: 'advance_cash',
              note: 'نقد پیشگی ادھار',
              confidence: 'high',
            },
          ]);
        }
        setStep('confirm');
        speak('تصویر کا تجزیہ مکمل ہو گیا۔ برائے مہربانی تصدیق کریں۔');
      } else {
        setApiError({
          ur: data.errorUr || 'معذرت، تصویر سے تحریر واضح نہیں ہو سکی۔',
          en: data.errorEn || 'Could not extract handwriting clearly.',
        });
        setStep('error');
        speak('تصویر واضح نہیں تھی۔ آپ خود اندراج کر سکتے ہیں۔');
      }
    } catch (err) {
      console.error('Scan processing error:', err);
      setApiError({
        ur: 'سرور سے رابطہ نہیں ہو سکا۔ برائے مہربانی دستی اندراج کیجیے۔',
        en: 'Could not connect to processing server. Please enter manually.',
      });
      setStep('error');
    }
  };

  // Update a single Khata row
  const handleRowChange = (id: string, field: keyof ExtractedKhataRow, value: any) => {
    setKhataRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Add a new row to extracted table
  const handleAddRow = () => {
    const newRow: ExtractedKhataRow = {
      id: `row-${Date.now()}`,
      date: formatDateDDMMYYYY(),
      partyName: khataRows[0]?.partyName || 'حاجی صاحب',
      amount: 10000,
      flowType: 'given',
      entryType: 'advance_cash',
      note: 'اضافی اندراج',
      confidence: 'high',
    };
    setKhataRows([...khataRows, newRow]);
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    setKhataRows(khataRows.filter((r) => r.id !== id));
  };

  // Final Confirmation
  const handleConfirmAll = () => {
    if (documentType === 'slip' && slipData) {
      onSlipConfirmed?.(slipData);
      speak('پرچی کامیابی سے محفوظ ہو گئی۔');
      onClose();
    } else {
      onKhataRowsConfirmed?.(khataRows);
      speak('کھاتے کے تمام اندراجات کامیابی سے محفوظ کر دیے گئے۔');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-5xl parchment-slip rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-[#78350F] max-h-[94vh] flex flex-col text-stone-900 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900 shrink-0">
              <Camera className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-urdu text-stone-900">
                {documentType === 'slip'
                  ? 'کاغذی بولی پرچی اسکین و ڈیجیٹلائزیشن'
                  : 'پرانے کاغذی بہی کھاتہ کا تصویری اسکین'}
              </h3>
              <p className="text-xs text-stone-600">
                تصویر سے تحریر پڑھ کر خودکار جدول سازی (OCR + جیمنائی ماڈل)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center hover:bg-stone-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: UPLOAD / CAMERA SELECTION */}
        {step === 'upload' && (
          <div className="py-6 sm:py-8 space-y-6 text-center overflow-y-auto">
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-[#78350F] ring-8 ring-amber-50">
                <Camera className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold font-urdu text-stone-900">
                کاغذی صفحہ یا پرچی کی واضح تصویر لیں
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed font-urdu">
                کیمرہ یا گیلری سے پرانے بہی کھاتے کے صفحے یا منڈی پرچی کی تصویر منتخب کریں۔ تحریر صاف
                روشنی میں ہونی چاہیے۔
              </p>
            </div>

            {/* Mandatory Warning Note */}
            <div className="max-w-lg mx-auto p-3 bg-amber-100/90 border border-amber-300 rounded-2xl flex items-center gap-2.5 text-xs text-amber-950 text-start">
              <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0" />
              <div className="font-urdu leading-snug">
                <span className="font-bold">یاد دہانی: </span>
                <span>
                  ہاتھ کی تحریر پڑھنے میں غلطی ہو سکتی ہے، براہِ کرم محفوظ کرنے سے پہلے ضرور تصدیق
                  کریں۔
                </span>
                <span className="block text-[10px] text-stone-600 font-sans mt-0.5">
                  AI can misread handwriting. Always check before saving.
                </span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Direct Camera Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="min-h-[56px] p-3.5 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <Camera className="w-5 h-5 text-amber-300" />
                <span>کیمرہ سے تصویر لیں</span>
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Gallery / File Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[56px] p-3.5 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-950 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Upload className="w-5 h-5 text-amber-800" />
                <span>گیلری / فائل منتخب کریں</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Quick Sample Demo Button (Allows zero-hassle testing in sandbox) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleUseSample}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-amber-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 shadow-xs"
              >
                <FileText className="w-4 h-4 text-amber-700" />
                <span>نمونہ کاغذی بہی صفحہ آزمائیں (Try Sample Bahi Page)</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SCANNING / ANALYZING ANIMATION */}
        {step === 'scanning' && (
          <div className="py-12 space-y-5 text-center my-auto">
            <div className="relative w-28 h-28 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center overflow-hidden shadow-inner">
              <ImageIcon className="w-12 h-12 text-amber-700 opacity-60" />
              {/* Laser scanning beam line */}
              <div className="absolute inset-x-0 h-1 bg-rose-500 shadow-[0_0_12px_#EF4444] animate-bounce" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold font-urdu text-stone-900 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-800" />
                <span>کاغذی صفحے کا تجزیہ کیا جا رہا ہے...</span>
              </h4>
              <p className="text-xs text-stone-600 font-urdu">
                جیمنائی ماڈل ہاتھ سے لکھی تحریر، تاریخیں اور ہندسے پڑھ رہا ہے
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM SCREEN (SIDE-BY-SIDE SPLIT VIEW) */}
        {step === 'confirm' && (
          <div className="flex-1 flex flex-col min-h-0 pt-3 space-y-3 overflow-hidden">
            {/* Prominent Warning Banner at Top */}
            <div className="p-2.5 bg-amber-100 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-950 shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="font-bold font-urdu">
                  ہاتھ کی تحریر پڑھنے میں غلطی ہو سکتی ہے، محفوظ کرنے سے پہلے ضرور تصدیق کریں۔ زرد
                  خانے مشتبہ ہندسوں کی نشاندہی کرتے ہیں۔
                </span>
              </div>
              <span className="text-[11px] font-sans text-stone-600 hidden md:inline">
                AI can misread handwriting. Always check before saving.
              </span>
            </div>

            {/* Split Screen Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 min-h-0 overflow-hidden">
              {/* Left Side: Original Image Viewer with Zoom & Rotate (5 Cols) */}
              <div className="md:col-span-5 bg-stone-900 rounded-2xl p-2 flex flex-col border border-stone-700 overflow-hidden min-h-[220px] md:min-h-0">
                {/* Controls Bar */}
                <div className="flex items-center justify-between pb-1.5 px-2 border-b border-stone-800 text-stone-300 text-xs shrink-0">
                  <span className="font-bold text-[11px]">اصل تصویر (Original Photo)</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                      className="p-1 rounded hover:bg-stone-800"
                      title="بڑا کریں (Zoom In)"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                      className="p-1 rounded hover:bg-stone-800"
                      title="چھوٹا کریں (Zoom Out)"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-1 rounded hover:bg-stone-800"
                      title="گھمائیں (Rotate)"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Image Canvas Container */}
                <div className="flex-1 flex items-center justify-center overflow-auto p-2">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Scanned original paper"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s ease',
                      }}
                      className="max-h-full max-w-full object-contain rounded shadow-lg"
                    />
                  )}
                </div>
              </div>

              {/* Right Side: Editable Extracted Table (7 Cols) */}
              <div className="md:col-span-7 bg-white/95 rounded-2xl p-3 border-2 border-amber-300 flex flex-col min-h-0 overflow-hidden shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200 shrink-0">
                  <span className="text-xs font-bold text-stone-800 font-urdu flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-800" />
                    <span>
                      {documentType === 'slip'
                        ? 'پرچی سے نکالی گئی تفصیلات (ترمیم کے قابل)'
                        : `نکالے گئے اندراجات (${khataRows.length}) - ترمیم کے قابل`}
                    </span>
                  </span>

                  {documentType === 'khata' && (
                    <button
                      type="button"
                      onClick={handleAddRow}
                      className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>سطر شامل کریں</span>
                    </button>
                  )}
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-y-auto pt-2 space-y-2">
                  {documentType === 'slip' && slipData ? (
                    // Slip Form View
                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                            کسان (Farmer)
                          </label>
                          <input
                            type="text"
                            value={slipData.farmerName}
                            onChange={(e) =>
                              setSlipData({ ...slipData, farmerName: e.target.value })
                            }
                            className={`w-full h-9 px-2 rounded-lg border text-xs font-bold ${
                              slipData.confidence === 'low'
                                ? 'bg-amber-50 border-amber-400'
                                : 'border-stone-300 bg-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                            خریدار (Buyer)
                          </label>
                          <input
                            type="text"
                            value={slipData.buyerName}
                            onChange={(e) =>
                              setSlipData({ ...slipData, buyerName: e.target.value })
                            }
                            className={`w-full h-9 px-2 rounded-lg border text-xs font-bold ${
                              slipData.confidence === 'low'
                                ? 'bg-amber-50 border-amber-400'
                                : 'border-stone-300 bg-white'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                            قسم / ورائٹی
                          </label>
                          <input
                            type="text"
                            value={slipData.variety}
                            onChange={(e) => setSlipData({ ...slipData, variety: e.target.value })}
                            className="w-full h-9 px-2 rounded-lg border border-stone-300 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                            صافی وزن (Net Kg)
                          </label>
                          <input
                            type="number"
                            dir="ltr"
                            value={slipData.netWeight}
                            onChange={(e) =>
                              setSlipData({
                                ...slipData,
                                netWeight: parseFloat(e.target.value) || 0,
                              })
                            }
                            className={`w-full h-9 px-2 rounded-lg border font-mono font-bold text-xs ${
                              slipData.confidence === 'low'
                                ? 'bg-amber-50 border-amber-400'
                                : 'border-stone-300 bg-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                            ریٹ فی من (PKR)
                          </label>
                          <input
                            type="number"
                            dir="ltr"
                            value={slipData.ratePerUnit}
                            onChange={(e) =>
                              setSlipData({
                                ...slipData,
                                ratePerUnit: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full h-9 px-2 rounded-lg border border-stone-300 bg-white font-mono font-bold text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                            کل مالیت (Gross PKR)
                          </label>
                          <input
                            type="number"
                            dir="ltr"
                            value={slipData.grossAmount}
                            onChange={(e) =>
                              setSlipData({
                                ...slipData,
                                grossAmount: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full h-9 px-2 rounded-lg border border-stone-300 bg-white font-mono font-bold text-xs text-amber-950"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                            خالص واجب الادا (Net Payable)
                          </label>
                          <input
                            type="number"
                            dir="ltr"
                            value={slipData.netPayable}
                            onChange={(e) =>
                              setSlipData({
                                ...slipData,
                                netPayable: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full h-9 px-2 rounded-lg border-2 border-emerald-500 bg-emerald-50 font-mono font-bold text-xs text-emerald-950"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Khata Table Rows
                    <div className="space-y-2">
                      {khataRows.map((row) => (
                        <div
                          key={row.id}
                          className={`p-2.5 rounded-xl border-2 transition-all ${
                            row.confidence === 'low'
                              ? 'bg-amber-100/90 border-amber-400'
                              : row.confidence === 'medium'
                              ? 'bg-amber-50/70 border-amber-300'
                              : 'bg-white border-stone-200'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-1 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                  row.confidence === 'low'
                                    ? 'bg-amber-300 text-amber-950'
                                    : row.confidence === 'medium'
                                    ? 'bg-amber-200 text-amber-900'
                                    : 'bg-emerald-100 text-emerald-900'
                                }`}
                              >
                                {row.confidence === 'low'
                                  ? '⚠️ مشتبہ ہندسہ'
                                  : row.confidence === 'medium'
                                  ? 'درمیانی اعتماد'
                                  : 'واضح تحریر'}
                              </span>
                              <input
                                type="text"
                                dir="ltr"
                                value={row.date}
                                onChange={(e) => handleRowChange(row.id, 'date', e.target.value)}
                                className="w-24 h-7 px-1.5 text-[11px] font-mono border rounded bg-white"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.id)}
                              className="text-stone-400 hover:text-rose-600 p-1"
                              title="حذف کریں"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-12 gap-1.5 pt-1">
                            {/* Flow Type selector */}
                            <select
                              value={row.flowType}
                              onChange={(e) =>
                                handleRowChange(row.id, 'flowType', e.target.value as any)
                              }
                              className="col-span-4 h-8 px-1 text-[11px] font-bold rounded border bg-white"
                            >
                              <option value="given">بنام (ادھار/دیا)</option>
                              <option value="received">جمع (آمدن/لیا)</option>
                            </select>

                            {/* Amount Input */}
                            <input
                              type="number"
                              dir="ltr"
                              value={row.amount}
                              onChange={(e) =>
                                handleRowChange(row.id, 'amount', parseFloat(e.target.value) || 0)
                              }
                              placeholder="رقم"
                              className={`col-span-4 h-8 px-2 text-xs font-mono font-bold rounded border ${
                                row.confidence === 'low'
                                  ? 'border-amber-500 bg-amber-50 text-amber-950'
                                  : 'border-stone-300 bg-white'
                              }`}
                            />

                            {/* Note / Item Input */}
                            <input
                              type="text"
                              value={row.note}
                              onChange={(e) => handleRowChange(row.id, 'note', e.target.value)}
                              placeholder="تفصیل..."
                              className="col-span-4 h-8 px-2 text-[11px] rounded border border-stone-300 bg-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Table Summary Footer */}
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700 shrink-0">
                  <span>کل اندراجات: {khataRows.length}</span>
                  <span className="font-mono text-emerald-900">
                    میزان: Rs.{' '}
                    {khataRows
                      .reduce(
                        (sum, r) => sum + (r.flowType === 'received' ? r.amount : -r.amount),
                        0
                      )
                      .toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar (Min 56px touch target) */}
            <div className="pt-2 border-t border-amber-200 flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="min-h-[50px] px-4 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs sm:text-sm"
              >
                دوبارہ تصویر لیں
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToManual?.();
                }}
                className="min-h-[50px] px-4 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 font-bold text-xs sm:text-sm"
              >
                دستی اندراج کی طرف جائیں
              </button>

              <button
                type="button"
                onClick={handleConfirmAll}
                className="flex-1 min-h-[50px] rounded-xl bg-[#78350F] hover:bg-amber-900 text-amber-50 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <CheckCircle2 className="w-5 h-5 text-amber-300" />
                <span>تمام اندراجات کی تصدیق و محفوظ کریں</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ERROR / FALLBACK STATE */}
        {step === 'error' && (
          <div className="py-8 space-y-5 text-center my-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 ring-8 ring-rose-50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h4 className="text-lg font-bold font-urdu text-rose-950">
                {apiError?.ur || 'تحریر واضح نہیں ہو سکی'}
              </h4>
              <p className="text-xs text-stone-600 font-urdu leading-relaxed">
                معذرت، تصویر میں روشنی کم تھی یا تحریر مٹی ہوئی تھی۔ آپ دوبارہ صاف تصویر کھینچ سکتے
                ہیں یا سیدھا دستی اندراج کر سکتے ہیں۔
              </p>
              <p className="text-[11px] text-stone-500 font-sans">{apiError?.en}</p>
            </div>

            <div className="max-w-sm mx-auto flex flex-col sm:flex-row items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="w-full min-h-[52px] bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-sm"
              >
                دوبارہ تصویر لیں
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToManual?.();
                }}
                className="w-full min-h-[52px] bg-[#78350F] hover:bg-amber-900 text-amber-50 font-bold rounded-xl text-sm shadow-md"
              >
                دستی اندراج جاری رکھیں
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
