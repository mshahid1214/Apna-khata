import React, { useState, useRef, useEffect } from 'react';
import { Bilty, Lot, WeightUnit } from '../types';
import { biltyRepository } from '../repositories/biltyRepository';
import { lotRepository } from '../repositories/lotRepository';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../services/formatters';
import {
  X,
  Truck,
  FileCheck,
  User,
  MapPin,
  Calendar,
  PenTool,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface CreateBiltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBiltyCreated: () => void;
}

export const CreateBiltyModal: React.FC<CreateBiltyModalProps> = ({
  isOpen,
  onClose,
  onBiltyCreated,
}) => {
  const { currentRole, t, speak } = useApp();

  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLotIds, setSelectedLotIds] = useState<string[]>([]);
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-GB'));
  const [senderName, setSenderName] = useState('حاجی غلام فرید (کسان)');
  const [senderPhone, setSenderPhone] = useState('0300-XXXXXXX');
  const [receiverName, setReceiverName] = useState('میاں برادرز کمیشن ایجنٹ، لاہور');
  const [receiverPhone, setReceiverPhone] = useState('0301-XXXXXXX');
  const [vehicleNumber, setVehicleNumber] = useState('LHR-8924 (شاہ زور مزدا)');
  const [driverName, setDriverName] = useState('محمد بوٹا ڈرائیور');
  const [driverPhone, setDriverPhone] = useState('0302-XXXXXXX');
  const [origin, setOrigin] = useState('چک 14-WB، وہاڑی فارم');
  const [destination, setDestination] = useState('بادامی باغ غلہ و فروٹ منڈی، لاہور');
  const [quantity, setQuantity] = useState('220');
  const [unit, setUnit] = useState<WeightUnit>('peti');
  const [freightPKR, setFreightPKR] = useState('38000');
  const [advancePaidPKR, setAdvancePaidPKR] = useState('15000');
  const [notes, setNotes] = useState('ترپال بند گاڑی، بارش و دھوپ سے محفوظ۔');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen) {
      lotRepository.getAll().then((data) => {
        setLots(data);
        if (data.length > 0 && selectedLotIds.length === 0) {
          setSelectedLotIds([data[0].id]);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalFreight = parseFloat(freightPKR) || 0;
  const advance = parseFloat(advancePaidPKR) || 0;
  const balance = Math.max(0, totalFreight - advance);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const toggleLotSelect = (lotId: string) => {
    setSelectedLotIds((prev) =>
      prev.includes(lotId) ? prev.filter((id) => id !== lotId) : [...prev, lotId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let signatureDataUrl: string | undefined = undefined;
      if (hasSignature && canvasRef.current) {
        signatureDataUrl = canvasRef.current.toDataURL('image/png');
      }

      // Find lot summary descriptions
      const linkedLots = lots.filter((l) => selectedLotIds.includes(l.id));
      const lotSummaryText = linkedLots.length > 0
        ? linkedLots.map((l) => `${l.variety} (${l.quantity} ${l.unit})`).join(' + ')
        : `${quantity} ${unit} زرعی مال`;

      await biltyRepository.save({
        biltyNumber: '', // repo creates serial
        date,
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim() || undefined,
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim() || undefined,
        lotIds: selectedLotIds,
        lotSummary: lotSummaryText,
        vehicleNumber: vehicleNumber.trim(),
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim() || undefined,
        origin: origin.trim(),
        destination: destination.trim(),
        quantity: parseFloat(quantity) || 0,
        unit,
        freightPKR: totalFreight,
        advancePaidPKR: advance,
        balancePayablePKR: balance,
        signatureDataUrl,
        signedAt: `${date}، ${new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })}`,
        signedByName: driverName.trim(),
        status: 'loaded',
        notes: notes.trim() || undefined,
      });

      speak('ٹرانسپورٹ بلٹی کامیابی سے جاری ہو گئی۔ لاٹ کی ٹائم لائن پر لوڈنگ کا واقعہ درج ہو گیا۔');
      onBiltyCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create bilty:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4">
      <div className="max-w-2xl w-full parchment-slip rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-[#78350F] max-h-[92vh] overflow-y-auto text-stone-900 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                ٹرانسپورٹر کنسائنمنٹ نوٹ
              </span>
              <h3 className="text-2xl font-bold font-urdu text-stone-900 mt-0.5">
                نئی مال برداری بلٹی جاری کریں (Create Bilty)
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Automatic Timeline Sync Notice */}
        <div className="my-3 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-stone-700">
          <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <p>
            <strong>خودکار ٹائم لائن ربط:</strong> بلٹی بنانے سے منسلک لاٹ کے ریکارڈ میں خودکار طریقے سے <em>"گاڑی میں لوڈنگ"</em> کی پیش رفت درج ہو جاتی ہے، اور منزل پر پہنچ کر <em>"سپردگی"</em> درج کی جا سکے گی۔
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Linked Lot(s) */}
          <div className="p-3 bg-white rounded-2xl border-2 border-stone-300 space-y-2">
            <label className="block text-xs font-bold text-stone-900 font-urdu">
              منسلک زرعی لاٹ کا انتخاب کریں (Link Lots):
            </label>
            {lots.length === 0 ? (
              <p className="text-xs text-stone-500">کوئی پہلے سے موجود لاٹ نہیں ہے۔</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                {lots.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => toggleLotSelect(l.id)}
                    className={`p-2.5 rounded-xl border text-start text-xs flex items-center justify-between transition-all ${
                      selectedLotIds.includes(l.id)
                        ? 'bg-amber-100 border-[#78350F] text-[#78350F] font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-[10px] block opacity-80">{l.lotNumber}</span>
                      <span className="font-urdu text-xs">{l.variety}</span>
                    </div>
                    <span className="font-mono text-[11px]">
                      {l.quantity} {l.unit}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sender & Receiver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                بھیجنے والا (Sender / Farmer / Arhti) *
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="حاجی غلام فرید"
                className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                وصول کنندہ (Receiver / Mandi Arhti / Buyer) *
              </label>
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="میاں برادرز کمیشن ایجنٹ، لاہور"
                className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
              />
            </div>
          </div>

          {/* Vehicle & Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                گاڑی نمبر و ماڈل (Vehicle Number) *
              </label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="LHR-8924 (شاہ زور مزدا)"
                className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                ڈرائیور کا نام (Driver Name) *
              </label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="محمد بوٹا ڈرائیور"
                className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
              />
            </div>
          </div>

          {/* Route: Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                روانگی کی جگہ (Origin) *
              </label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="چک 14-WB وہاڑی فارم"
                className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                منزل مقصود (Destination Mandi) *
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="بادامی باغ منڈی، لاہور"
                className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
              />
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                تعداد / نگ *
              </label>
              <input
                type="number"
                required
                dir="ltr"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                پیمانہ (Unit) *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as WeightUnit)}
                className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
              >
                <option value="peti">پیٹی / Crates</option>
                <option value="man">من (40 کلو)</option>
                <option value="kg">کلوگرام</option>
                <option value="ton">ٹن</option>
              </select>
            </div>
          </div>

          {/* Freight Math (کل کرایہ، پیشگی، اور بقایا) */}
          <div className="p-3.5 bg-amber-100/60 rounded-2xl border-2 border-amber-300 space-y-3">
            <h4 className="font-bold text-stone-900 font-urdu text-xs">
              کرایہ مال برداری کا حساب (Freight Breakdown):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  کل طے شدہ کرایہ (PKR) *
                </label>
                <input
                  type="number"
                  required
                  dir="ltr"
                  value={freightPKR}
                  onChange={(e) => setFreightPKR(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-sm font-mono font-bold text-end"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  پیشگی ادا شدہ (Advance)
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={advancePaidPKR}
                  onChange={(e) => setAdvancePaidPKR(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-sm font-mono font-bold text-end"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  بقایا عند الوصول (Balance)
                </label>
                <div className="h-11 px-3 rounded-xl bg-white border-2 border-stone-300 flex items-center justify-end font-mono font-bold text-sm text-[#78350F]">
                  <bdi dir="ltr">Rs. {balance.toLocaleString()}</bdi>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Box (Interactive Canvas) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 font-urdu flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-amber-800" />
                <span>ڈرائیور / ٹرانسپورٹر کے دستخط (Digital Signature):</span>
              </label>
              <button
                type="button"
                onClick={clearSignature}
                className="text-[11px] font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>صاف کریں</span>
              </button>
            </div>

            <div className="border-2 border-dashed border-[#78350F] rounded-2xl bg-white p-1">
              <canvas
                ref={canvasRef}
                width={480}
                height={100}
                className="w-full h-24 touch-none cursor-crosshair rounded-xl"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <span className="block text-[10px] text-stone-400 text-center pb-1">
                یہاں انگلی یا ماؤس سے دستخط کریں
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              مال برداری ہدایات و ریمارکس
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً ترپال والی گاڑی، راستے میں کولنگ جاری رکھنا..."
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
              <Truck className="w-6 h-6 text-amber-300 shrink-0" />
              <span>{isSubmitting ? 'بلٹی جاری ہو رہی ہے...' : 'ٹرانسپورٹ بلٹی جاری کریں'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
