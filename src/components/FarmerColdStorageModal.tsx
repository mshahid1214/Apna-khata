import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ColdStorageFacility,
  ColdStorageBookingRequest,
  Commodity,
} from '../types';
import { coldStorageRepository } from '../repositories/coldStorageRepository';
import {
  X,
  Warehouse,
  Thermometer,
  Coins,
  MapPin,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Sparkles,
  Phone,
} from 'lucide-react';

interface FarmerColdStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMODITIES: { id: Commodity; label: string }[] = [
  { id: 'mango', label: 'آم (Mango)' },
  { id: 'citrus', label: 'ترشاوہ / مالٹا (Citrus)' },
  { id: 'dates', label: 'کھجور (Dates)' },
  { id: 'cotton', label: 'کپاس (Cotton)' },
];

export const FarmerColdStorageModal: React.FC<FarmerColdStorageModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentRole, parties, speak } = useApp();

  const [activeTab, setActiveTab] = useState<'browse' | 'my_bookings'>('browse');
  const [facilities, setFacilities] = useState<ColdStorageFacility[]>([]);
  const [bookings, setBookings] = useState<ColdStorageBookingRequest[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<ColdStorageFacility | null>(null);

  // Booking form state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [farmerName, setFarmerName] = useState('حاجی غلام فرید');
  const [farmerPhone, setFarmerPhone] = useState('0300-1234567');
  const [commodity, setCommodity] = useState<Commodity>('mango');
  const [variety, setVariety] = useState('چونسا سفید');
  const [requestedTons, setRequestedTons] = useState<number>(15);
  const [requestedStartDate, setRequestedStartDate] = useState(
    new Date().toLocaleDateString('en-GB')
  );
  const [estimatedDurationDays, setEstimatedDurationDays] = useState<number>(20);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [facList, bkgList] = await Promise.all([
        coldStorageRepository.getFacilities(),
        coldStorageRepository.getBookings(),
      ]);
      setFacilities(facList);
      setBookings(bkgList);
    } catch (err) {
      console.error('Error loading cold storage data:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenBooking = (facility: ColdStorageFacility) => {
    setSelectedFacility(facility);
    setIsBookingOpen(true);
    setSuccessMsg(null);
  };

  const handleSendBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;

    try {
      setIsSubmitting(true);
      await coldStorageRepository.createBookingRequest({
        facilityId: selectedFacility.id,
        facilityName: selectedFacility.name,
        farmerId: 'p-farmer-1',
        farmerName: farmerName.trim(),
        farmerPhone: farmerPhone.trim(),
        commodity,
        variety: variety.trim(),
        requestedTons: Number(requestedTons),
        requestedStartDate: requestedStartDate.trim(),
        estimatedDurationDays: Number(estimatedDurationDays),
        notes: notes.trim() || undefined,
      });

      speak('کولڈ اسٹوریج بکنگ کی درخواست کامیابی سے بھیج دی گئی۔ آپریٹر کے جواب کا انتظار کریں۔');
      await loadData();
      setIsBookingOpen(false);
      setActiveTab('my_bookings');
      setSuccessMsg('آپ کی بکنگ درخواست کامیابی سے بھیج دی گئی ہے۔');
    } catch (err) {
      console.error('Failed to submit booking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl parchment-slip rounded-3xl border-2 border-stone-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-[#78350F] text-amber-50 px-5 py-4 flex items-center justify-between border-b-2 border-amber-600">
          <div className="flex items-center gap-2.5">
            <Warehouse className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold font-urdu text-lg leading-tight">
                کولڈ اسٹوریج براؤزر و بکنگ سروس (Cold Storage)
              </h3>
              <span className="text-[11px] text-amber-200">
                کسانوں کے لیے مستند سہولیات، خالی گنجائش اور نرخ
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 text-amber-200 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4 pb-2 bg-stone-100 border-b border-stone-300 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('browse')}
            type="button"
            className={`min-h-[44px] px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'browse'
                ? 'bg-[#78350F] text-amber-50 shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Warehouse className="w-4 h-4 shrink-0" />
            <span>سہولیات تلاش کریں ({facilities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my_bookings')}
            type="button"
            className={`min-h-[44px] px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'my_bookings'
                ? 'bg-[#78350F] text-amber-50 shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>میری درخواستیں ({bookings.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-950 font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                {successMsg}
              </span>
              <button onClick={() => setSuccessMsg(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: BROWSE FACILITIES */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              {facilities.map((fac) => {
                const freeTons = Math.max(0, fac.totalCapacityTons - fac.currentUsedTons);
                const percentUsed = Math.min(
                  100,
                  Math.round((fac.currentUsedTons / fac.totalCapacityTons) * 100)
                );

                return (
                  <div
                    key={fac.id}
                    className="p-5 bg-white rounded-3xl border-2 border-stone-200 shadow-sm hover:border-amber-400 transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold font-urdu text-stone-900">{fac.name}</h4>
                          <span className="bg-amber-100 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                            مستند نمونہ
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-600 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                          <span>{fac.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-start">
                        <button
                          onClick={() => handleOpenBooking(fac)}
                          type="button"
                          className="min-h-[46px] px-4 py-2 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-98"
                        >
                          <Send className="w-4 h-4 text-amber-300" />
                          <span>بکنگ درخواست بھیجیں</span>
                        </button>
                      </div>
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-200 text-center">
                      <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">یومیہ ریٹ</span>
                        <div className="text-sm font-bold font-mono text-amber-950 mt-0.5">
                          <bdi dir="ltr">Rs. {fac.ratePerTonPerDayPKR}</bdi>
                          <span className="text-[10px] font-urdu font-normal text-stone-500 block">
                            فی ٹن / روزانہ
                          </span>
                        </div>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">درجہ حرارت</span>
                        <div className="text-xs font-bold font-mono text-stone-800 mt-1 flex items-center justify-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                          <bdi dir="ltr">{fac.tempRange}</bdi>
                        </div>
                      </div>

                      <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-700 block">خالی جگہ (Free)</span>
                        <div className="text-sm font-bold font-mono text-emerald-900 mt-0.5">
                          <bdi dir="ltr">{freeTons} ٹن</bdi>
                        </div>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">کل گنجائش</span>
                        <div className="text-sm font-bold font-mono text-stone-800 mt-0.5">
                          <bdi dir="ltr">{fac.totalCapacityTons} ٹن</bdi>
                        </div>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-stone-600 font-bold">
                        <span>موجودہ بھرتی: {percentUsed}%</span>
                        <span>
                          {fac.currentUsedTons} ٹن استعمال شدہ / {freeTons} ٹن دستیاب
                        </span>
                      </div>
                      <div className="h-3 w-full bg-stone-200 rounded-full overflow-hidden p-0.5 border border-stone-300">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percentUsed > 85 ? 'bg-red-600' : percentUsed > 60 ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </div>

                    {/* Chambers Info */}
                    {fac.chambers && fac.chambers.length > 0 && (
                      <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-2">
                        {fac.chambers.map((ch) => (
                          <span
                            key={ch.id}
                            className="text-[11px] bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200"
                          >
                            ❄️ {ch.name} ({ch.tempCelsius}) - خالی: {ch.capacityTons - ch.usedTons} ٹن
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: MY BOOKING REQUESTS */}
          {activeTab === 'my_bookings' && (
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border border-stone-200 p-6">
                  <Clock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-bold font-urdu text-stone-700">
                    کوئی بکنگ درخواست موجود نہیں ہے
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    سہولیات والے ٹیب سے کسی بھی کولڈ اسٹوریج کے لیے درخواست بھیجیں۔
                  </p>
                </div>
              ) : (
                bookings.map((bkg) => (
                  <div
                    key={bkg.id}
                    className="p-4 bg-white rounded-2xl border border-stone-300 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                            {bkg.bookingNumber}
                          </span>
                          <span className="font-bold font-urdu text-stone-900">
                            {bkg.facilityName}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          درخواست کنندہ: {bkg.farmerName} • جنس: {bkg.commodity} ({bkg.variety})
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {bkg.status === 'pending' && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>زیر غور (Pending)</span>
                          </span>
                        )}
                        {bkg.status === 'accepted' && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>منظور شدہ (Accepted)</span>
                          </span>
                        )}
                        {bkg.status === 'declined' && (
                          <span className="px-3 py-1 bg-red-100 text-red-900 border border-red-300 text-xs font-bold rounded-xl flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-red-700" />
                            <span>معذرت (Declined)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Booking Details Strip */}
                    <div className="grid grid-cols-3 gap-2 bg-stone-50 p-2.5 rounded-xl text-xs text-center border border-stone-200">
                      <div>
                        <span className="text-[10px] text-stone-500 block">مطلوبہ وزن</span>
                        <span className="font-bold font-mono text-stone-800">
                          <bdi dir="ltr">{bkg.requestedTons} ٹن</bdi>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">شروع تاریخ</span>
                        <span className="font-bold font-mono text-stone-800">
                          <bdi dir="ltr">{bkg.requestedStartDate}</bdi>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">تخمینہ مدت</span>
                        <span className="font-bold font-mono text-stone-800">
                          <bdi dir="ltr">{bkg.estimatedDurationDays} دن</bdi>
                        </span>
                      </div>
                    </div>

                    {bkg.notes && (
                      <p className="text-xs text-stone-600 font-urdu bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                        کسان کا نوٹ: {bkg.notes}
                      </p>
                    )}

                    {bkg.responseNotes && (
                      <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-300 text-xs">
                        <span className="font-bold text-stone-800 font-urdu block">
                          آپریٹر کا جواب ({bkg.respondedAt}):
                        </span>
                        <p className="text-stone-700 font-urdu mt-0.5">{bkg.responseNotes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* MODAL: SUBMIT BOOKING REQUEST */}
        {isBookingOpen && selectedFacility && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs">
            <div className="relative w-full max-w-lg parchment-slip rounded-3xl border-2 border-stone-800 shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b-2 border-amber-600">
                <div>
                  <h4 className="font-bold font-urdu text-lg text-stone-900">
                    بکنگ درخواست فارم
                  </h4>
                  <span className="text-xs text-stone-600">{selectedFacility.name}</span>
                </div>
                <button onClick={() => setIsBookingOpen(false)}>
                  <X className="w-5 h-5 text-stone-600" />
                </button>
              </div>

              <form onSubmit={handleSendBooking} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      کسان / درخواست کنندہ کا نام *
                    </label>
                    <input
                      type="text"
                      required
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-bold font-urdu"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      رابطہ نمبر *
                    </label>
                    <input
                      type="text"
                      required
                      value={farmerPhone}
                      onChange={(e) => setFarmerPhone(e.target.value)}
                      className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">جنس</label>
                    <select
                      value={commodity}
                      onChange={(e) => setCommodity(e.target.value as Commodity)}
                      className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3 text-xs font-bold font-urdu"
                    >
                      {COMMODITIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">ورائٹی</label>
                    <input
                      type="text"
                      required
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3 text-sm font-bold font-urdu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      مطلوبہ ٹن *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      value={requestedTons}
                      onChange={(e) => setRequestedTons(Number(e.target.value))}
                      className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-2 text-sm font-bold font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      تاریخ آمد *
                    </label>
                    <input
                      type="text"
                      required
                      value={requestedStartDate}
                      onChange={(e) => setRequestedStartDate(e.target.value)}
                      className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-2 text-sm font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      مدت (دن) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={estimatedDurationDays}
                      onChange={(e) => setEstimatedDurationDays(Number(e.target.value))}
                      className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-2 text-sm font-bold font-mono text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    اضافی نوٹ یا مطلوبہ درجہ حرارت
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثلاً چیمبر میں نمی 80 فیصد اور درجہ حرارت 11°C رکھا جائے..."
                    className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs font-urdu"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsBookingOpen(false)}
                    type="button"
                    className="min-h-[44px] px-4 bg-stone-200 text-stone-800 rounded-xl text-xs font-bold"
                  >
                    منسوخ
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-[44px] px-5 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>{isSubmitting ? 'بھیجا جا رہا ہے...' : 'درخواست ارسال کریں'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
