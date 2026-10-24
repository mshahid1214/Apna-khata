import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ColdStorageFacility,
  ColdStorageInventoryItem,
  ColdStorageGatePass,
  ColdStorageBookingRequest,
  BookingStatus,
} from '../types';
import { coldStorageRepository } from '../repositories/coldStorageRepository';
import { formatPKR } from '../services/formatters';
import { CreateInwardReceiptModal } from './CreateInwardReceiptModal';
import { CreateGatePassModal } from './CreateGatePassModal';
import { ColdStorageInvoiceModal } from './ColdStorageInvoiceModal';
import { EditFacilityProfileModal } from './EditFacilityProfileModal';
import { EmptyState } from './EmptyState';
import {
  Warehouse,
  Plus,
  Truck,
  Receipt,
  Thermometer,
  Boxes,
  Clock,
  CheckCircle2,
  XCircle,
  Settings,
  Scale,
  Calendar,
  User,
  Volume2,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
} from 'lucide-react';

export const ColdStorageDashboard: React.FC = () => {
  const { currentRole, language, speak } = useApp();

  const [facility, setFacility] = useState<ColdStorageFacility | null>(null);
  const [inventory, setInventory] = useState<ColdStorageInventoryItem[]>([]);
  const [gatePasses, setGatePasses] = useState<ColdStorageGatePass[]>([]);
  const [bookings, setBookings] = useState<ColdStorageBookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sub-tabs: 'active_stock' | 'gate_passes' | 'bookings'
  const [activeSubTab, setActiveSubTab] = useState<'active_stock' | 'gate_passes' | 'bookings'>(
    'active_stock'
  );

  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [selectedItemForInvoice, setSelectedItemForInvoice] =
    useState<ColdStorageInventoryItem | null>(null);
  const [selectedGatePassForInvoice, setSelectedGatePassForInvoice] =
    useState<ColdStorageGatePass | null>(null);
  const [preselectedInventoryItem, setPreselectedInventoryItem] =
    useState<ColdStorageInventoryItem | null>(null);

  // Response note prompt for bookings
  const [respondingBookingId, setRespondingBookingId] = useState<string | null>(null);
  const [responseAction, setResponseAction] = useState<BookingStatus | null>(null);
  const [responseNoteText, setResponseNoteText] = useState('');

  const loadAll = async () => {
    try {
      setIsLoading(true);
      const [primaryFacility, inv, passes, bkg] = await Promise.all([
        coldStorageRepository.getPrimaryFacility(),
        coldStorageRepository.getInventory(),
        coldStorageRepository.getGatePasses(),
        coldStorageRepository.getBookings(),
      ]);
      setFacility(primaryFacility);
      setInventory(inv);
      setGatePasses(passes);
      setBookings(bkg);
    } catch (err) {
      console.error('Failed to load cold storage dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  if (isLoading || !facility) {
    return (
      <div className="py-16 text-center text-stone-600 font-urdu font-bold">
        کولڈ اسٹوریج کا ریکارڈ لوڈ ہو رہا ہے...
      </div>
    );
  }

  const freeTons = Math.max(0, facility.totalCapacityTons - facility.currentUsedTons);
  const percentOccupied = Math.min(
    100,
    Math.round((facility.currentUsedTons / facility.totalCapacityTons) * 100)
  );

  const activeStockItems = inventory.filter(
    (i) => i.status === 'active' && i.currentRemainingTons > 0
  );

  // Filtered views
  const filteredActiveStock = activeStockItems.filter((i) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      i.inwardReceiptNumber.toLowerCase().includes(term) ||
      i.farmerName.toLowerCase().includes(term) ||
      i.variety.toLowerCase().includes(term) ||
      i.commodity.toLowerCase().includes(term) ||
      (i.lotNumber && i.lotNumber.toLowerCase().includes(term))
    );
  });

  const filteredGatePasses = gatePasses.filter((g) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      g.gatePassNumber.toLowerCase().includes(term) ||
      g.farmerName.toLowerCase().includes(term) ||
      g.variety.toLowerCase().includes(term) ||
      g.receiverOrDriver.toLowerCase().includes(term)
    );
  });

  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;

  const handleReadAloud = () => {
    speak(
      `${facility.name}۔ کل گنجائش ${facility.totalCapacityTons} ٹن ہے جس میں سے ${facility.currentUsedTons} ٹن استعمال شدہ اور ${freeTons} ٹن خالی ہے۔ یومیہ ریٹ ${facility.ratePerTonPerDayPKR} روپے فی ٹن ہے۔`
    );
  };

  const handleOpenGatePassForItem = (item: ColdStorageInventoryItem) => {
    setPreselectedInventoryItem(item);
    setIsGatePassModalOpen(true);
  };

  const handleOpenInvoiceForItem = (item: ColdStorageInventoryItem) => {
    setSelectedItemForInvoice(item);
    setSelectedGatePassForInvoice(null);
  };

  const handleOpenInvoiceForGatePass = (gatePass: ColdStorageGatePass) => {
    const parentItem = inventory.find((i) => i.id === gatePass.inventoryItemId) || {
      id: gatePass.inventoryItemId,
      facilityId: gatePass.facilityId,
      inwardReceiptNumber: 'INWARD',
      farmerName: gatePass.farmerName,
      commodity: gatePass.commodity,
      variety: gatePass.variety,
      initialQuantityTons: gatePass.quantityOutTons,
      currentRemainingTons: gatePass.remainingStockTons,
      dateIn: gatePass.dateIn,
      chamberRack: 'چیمبر اسٹوریج',
      conditionNotes: 'معائنہ شدہ',
      ratePerTonPerDayPKR: gatePass.ratePerTonPerDayPKR,
      status: 'cleared',
      createdAt: gatePass.createdAt,
      isSample: false,
    } as ColdStorageInventoryItem;

    setSelectedItemForInvoice(parentItem);
    setSelectedGatePassForInvoice(gatePass);
  };

  const handleConfirmBookingResponse = async () => {
    if (!respondingBookingId || !responseAction) return;
    try {
      await coldStorageRepository.updateBookingStatus(
        respondingBookingId,
        responseAction,
        responseNoteText.trim() ||
          (responseAction === 'accepted'
            ? 'درخواست قبول کر لی گئی ہے۔ جگہ مخصوص ہے۔'
            : 'معذرت، مطلوبہ تاریخ پر گنجائش دستیاب نہیں ہے۔')
      );
      speak(
        responseAction === 'accepted'
          ? 'بکنگ درخواست قبول کر لی گئی۔'
          : 'بکنگ درخواست پر معذرت ارسال کر دی گئی۔'
      );
      setRespondingBookingId(null);
      setResponseAction(null);
      setResponseNoteText('');
      await loadAll();
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Facility Header & Quick Settings */}
      <div className="parchment-slip rounded-3xl p-5 border-2 border-stone-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b-2 border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Warehouse className="w-6 h-6 text-amber-800 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-black font-urdu text-stone-900">
                {facility.name}
              </h2>
            </div>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              {facility.location} • آپریٹر: <strong>{facility.operatorName}</strong> (
              <bdi dir="ltr">{facility.operatorPhone}</bdi>)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleReadAloud}
              type="button"
              className="min-h-[44px] px-3.5 py-2 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>سنیں</span>
            </button>

            <button
              onClick={() => setIsEditProfileModalOpen(true)}
              type="button"
              className="min-h-[44px] px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-4 h-4 text-stone-600" />
              <span>ریٹ و گنجائش ترتیبات</span>
            </button>
          </div>
        </div>

        {/* 2. Capacity Dashboard: Visual Bars & Used vs Free */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-stone-700">
            <span className="flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-amber-800" />
              <span>گنجائش ڈیش بورڈ (Used vs Free Capacity)</span>
            </span>
            <span className="text-stone-500 font-mono">
              بھرتی تناسب: {percentOccupied}%
            </span>
          </div>

          {/* Master Progress Bar */}
          <div className="h-5 w-full bg-stone-200 rounded-full overflow-hidden p-1 border-2 border-stone-800 flex items-center">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentOccupied > 85
                  ? 'bg-red-600'
                  : percentOccupied > 60
                  ? 'bg-amber-600'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${percentOccupied}%` }}
            />
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
            <div className="bg-white p-3 rounded-2xl border border-stone-300 shadow-2xs">
              <span className="text-[11px] text-stone-500 block font-bold">کل گنجائش</span>
              <div className="text-lg sm:text-xl font-bold font-mono text-stone-900 mt-0.5">
                <bdi dir="ltr">{facility.totalCapacityTons} ٹن</bdi>
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-300 shadow-2xs">
              <span className="text-[11px] text-amber-900 block font-bold">استعمال شدہ (Used)</span>
              <div className="text-lg sm:text-xl font-bold font-mono text-amber-950 mt-0.5">
                <bdi dir="ltr">{facility.currentUsedTons} ٹن</bdi>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-300 shadow-2xs">
              <span className="text-[11px] text-emerald-900 block font-bold">دستیاب خالی جگہ (Free)</span>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-950 mt-0.5">
                <bdi dir="ltr">{freeTons} ٹن</bdi>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-300 shadow-2xs">
              <span className="text-[11px] text-stone-500 block font-bold">یومیہ کرایہ ریٹ</span>
              <div className="text-lg sm:text-xl font-bold font-mono text-stone-900 mt-0.5">
                <bdi dir="ltr">Rs. {facility.ratePerTonPerDayPKR}</bdi>
                <span className="text-[10px] text-stone-500 font-urdu block">فی ٹن / دن</span>
              </div>
            </div>
          </div>

          {/* Chamber Breakdown Mini Bars */}
          {facility.chambers && facility.chambers.length > 0 && (
            <div className="pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {facility.chambers.map((ch) => {
                const chPercent = Math.min(
                  100,
                  Math.round((ch.usedTons / ch.capacityTons) * 100)
                );
                return (
                  <div
                    key={ch.id}
                    className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-stone-800 truncate">{ch.name}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-900 font-mono font-bold px-1.5 py-0.5 rounded">
                        {ch.tempCelsius}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-700 rounded-full"
                        style={{ width: `${chPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                      <span>استعمال: {ch.usedTons} ٹن</span>
                      <span>گنجائش: {ch.capacityTons} ٹن</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Action Buttons (Min 56px touch target) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setIsInwardModalOpen(true)}
          type="button"
          className="min-h-[58px] p-4 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98"
        >
          <Plus className="w-6 h-6 text-amber-300 shrink-0" />
          <span>انورڈ مال وصولی چالان بنائیں (Inward Receipt)</span>
        </button>

        <button
          onClick={() => {
            setPreselectedInventoryItem(null);
            setIsGatePassModalOpen(true);
          }}
          type="button"
          className="min-h-[58px] p-4 bg-stone-900 hover:bg-black text-amber-400 rounded-2xl font-bold text-base shadow-md flex items-center justify-center gap-2.5 transition-transform active:scale-98"
        >
          <Truck className="w-5 h-5 text-amber-400 shrink-0" />
          <span>آؤٹ ورڈ گیٹ پاس جاری کریں (Outward Gate Pass)</span>
        </button>
      </div>

      {/* 4. Sub-Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-stone-100 rounded-2xl border border-stone-300">
        <button
          onClick={() => setActiveSubTab('active_stock')}
          type="button"
          className={`min-h-[46px] py-2 px-1 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'active_stock'
              ? 'bg-[#78350F] text-amber-50 shadow-sm'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Boxes className="w-4 h-4 shrink-0" />
          <span className="truncate">فعال اسٹاک ({activeStockItems.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gate_passes')}
          type="button"
          className={`min-h-[46px] py-2 px-1 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'gate_passes'
              ? 'bg-[#78350F] text-amber-50 shadow-sm'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Receipt className="w-4 h-4 shrink-0" />
          <span className="truncate">گیٹ پاس لاگ ({gatePasses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bookings')}
          type="button"
          className={`relative min-h-[46px] py-2 px-1 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'bookings'
              ? 'bg-[#78350F] text-amber-50 shadow-sm'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span className="truncate">کسان بکنگز ({bookings.length})</span>
          {pendingBookingsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="چالان نمبر، کسان کا نام، جنس یا لاٹ نمبر سے تلاش کریں..."
          className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl pr-9 pl-3 text-xs font-urdu"
        />
      </div>

      {/* SUB-TAB 1: ACTIVE INVENTORY STOCK */}
      {activeSubTab === 'active_stock' && (
        <div className="space-y-3">
          {filteredActiveStock.length === 0 ? (
            <EmptyState
              title="اس وقت اسٹوریج میں کوئی فعال مال موجود نہیں ہے"
              description="نئے کسان کی فصل داخل کرنے کے لیے اوپر 'انورڈ مال وصولی چالان' کا بٹن دبائیں۔"
            />
          ) : (
            filteredActiveStock.map((item) => {
              const rentInfo = coldStorageRepository.calculateRent(
                item,
                undefined,
                facility.ratePerTonPerDayPKR
              );

              return (
                <div
                  key={item.id}
                  className="parchment-slip rounded-3xl p-5 border-2 border-stone-300 hover:border-amber-400 shadow-sm space-y-3 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2.5 border-b border-stone-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          {item.inwardReceiptNumber}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold font-urdu text-stone-900">
                          {item.farmerName}
                        </h4>
                      </div>
                      <span className="text-xs text-stone-600 block mt-0.5">
                        جنس: <strong>{item.commodity}</strong> ({item.variety}) • مقام:{' '}
                        {item.chamberRack}
                      </span>
                    </div>

                    {item.lotNumber && (
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold font-mono px-2.5 py-1 rounded-xl self-start sm:self-auto flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{item.lotNumber}</span>
                      </span>
                    )}
                  </div>

                  {/* Stock Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-stone-500 block">آمد تاریخ</span>
                      <span className="font-bold font-mono text-stone-800">
                        <bdi dir="ltr">{item.dateIn}</bdi>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 block">موجودہ بقایا مال</span>
                      <span className="font-bold font-mono text-stone-900 text-sm">
                        <bdi dir="ltr">{item.currentRemainingTons} ٹن</bdi>
                      </span>
                      <span className="text-[9px] text-stone-500 block">
                        (ابتدائی: {item.initialQuantityTons} ٹن)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 block">ذخیرہ مدت (اب تک)</span>
                      <span className="font-bold font-mono text-stone-800">
                        <bdi dir="ltr">{rentInfo.daysStored} دن</bdi>
                      </span>
                    </div>

                    <div className="bg-amber-100/70 p-1.5 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-amber-900 block font-bold">
                        تخمینہ کرایہ (Accrued)
                      </span>
                      <span className="font-bold font-mono text-amber-950 text-sm">
                        <bdi dir="ltr">Rs. {rentInfo.totalRentPKR.toLocaleString()}</bdi>
                      </span>
                    </div>
                  </div>

                  {item.conditionNotes && (
                    <p className="text-xs text-stone-600 font-urdu bg-white/70 p-2 rounded-xl border border-stone-200">
                      معائنہ کیفیت: {item.conditionNotes}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-stone-200">
                    <button
                      onClick={() => handleOpenInvoiceForItem(item)}
                      type="button"
                      className="min-h-[44px] px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Receipt className="w-4 h-4 text-stone-600" />
                      <span>کرایہ بل / انوائس اسٹیٹمنٹ</span>
                    </button>

                    <button
                      onClick={() => handleOpenGatePassForItem(item)}
                      type="button"
                      className="min-h-[44px] px-4 py-2 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-98"
                    >
                      <Truck className="w-4 h-4 text-amber-300" />
                      <span>آؤٹ ورڈ گیٹ پاس جاری کریں</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUB-TAB 2: OUTWARD GATE PASSES */}
      {activeSubTab === 'gate_passes' && (
        <div className="space-y-3">
          {filteredGatePasses.length === 0 ? (
            <EmptyState
              title="کوئی آؤٹ ورڈ گیٹ پاس نہیں ملا"
              description="اسٹوریج سے مال منڈی روانہ کرتے وقت گیٹ پاس جاری کریں۔"
            />
          ) : (
            filteredGatePasses.map((pass) => (
              <div
                key={pass.id}
                className="parchment-slip rounded-3xl p-5 border-2 border-stone-300 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2 border-b border-stone-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-stone-900 bg-red-100 text-red-900 px-2 py-0.5 rounded border border-red-300">
                        {pass.gatePassNumber}
                      </span>
                      <h4 className="text-base font-bold font-urdu text-stone-900">
                        {pass.farmerName}
                      </h4>
                    </div>
                    <span className="text-xs text-stone-600 block mt-0.5">
                      جنس: {pass.commodity} ({pass.variety}) • گاڑی: {pass.vehicleNumber || 'نامعلوم'}
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-stone-500 block">تاریخ اخراج</span>
                    <span className="text-xs font-mono font-bold text-stone-800">
                      <bdi dir="ltr">{pass.dateOut}</bdi>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-50 p-2.5 rounded-2xl border border-stone-200 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-stone-500 block">خارج شدہ وزن</span>
                    <span className="font-bold font-mono text-stone-900">
                      <bdi dir="ltr">{pass.quantityOutTons} ٹن</bdi>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 block">بقایا اسٹاک</span>
                    <span className="font-bold font-mono text-stone-800">
                      <bdi dir="ltr">{pass.remainingStockTons} ٹن</bdi>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 block">ذخیرہ مدت</span>
                    <span className="font-bold font-mono text-stone-800">
                      <bdi dir="ltr">{pass.daysStored} دن</bdi>
                    </span>
                  </div>

                  <div className="bg-stone-800 text-stone-100 p-1.5 rounded-xl">
                    <span className="text-[9px] text-stone-400 block">کل وصول شدہ کرایہ</span>
                    <span className="font-bold font-mono text-amber-300 text-xs sm:text-sm">
                      <bdi dir="ltr">Rs. {pass.totalRentPKR.toLocaleString()}</bdi>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-2 pt-1 border-t border-stone-200">
                  <span>وصول کنندہ / ڈرائیور: {pass.receiverOrDriver}</span>

                  <button
                    onClick={() => handleOpenInvoiceForGatePass(pass)}
                    type="button"
                    className="min-h-[40px] px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 self-end transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-800" />
                    <span>کرایہ بل و چالان دیکھیں</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB-TAB 3: FARMER BOOKING REQUESTS INBOX */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <EmptyState
              title="کسانوں کی کوئی بکنگ درخواست موصول نہیں ہوئی"
              description="کسان اپنے اکاؤنٹ سے کولڈ اسٹوریج براؤز کر کے جگہ مخصوص کرنے کی درخواست بھیج سکتے ہیں۔"
            />
          ) : (
            bookings.map((bkg) => (
              <div
                key={bkg.id}
                className="parchment-slip rounded-3xl p-5 border-2 border-stone-300 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2 border-b border-stone-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-stone-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        {bkg.bookingNumber}
                      </span>
                      <h4 className="text-base font-bold font-urdu text-stone-900">
                        {bkg.farmerName}
                      </h4>
                    </div>
                    <span className="text-xs text-stone-600 block mt-0.5">
                      رابطہ نمبر: <bdi dir="ltr">{bkg.farmerPhone}</bdi> • جنس: {bkg.commodity} ({bkg.variety})
                    </span>
                  </div>

                  {/* Status */}
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

                <div className="grid grid-cols-3 gap-2 bg-stone-50 p-2.5 rounded-2xl text-xs text-center border border-stone-200">
                  <div>
                    <span className="text-[10px] text-stone-500 block">مطلوبہ گنجائش</span>
                    <span className="font-bold font-mono text-stone-800">
                      <bdi dir="ltr">{bkg.requestedTons} ٹن</bdi>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 block">مطلوبہ تاریخ آمد</span>
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
                  <p className="text-xs text-stone-600 font-urdu bg-white p-2 rounded-xl border border-stone-200">
                    کسان کی ہدایات: {bkg.notes}
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

                {/* Operator Accept / Decline Actions */}
                {bkg.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-200">
                    <button
                      onClick={() => {
                        setRespondingBookingId(bkg.id);
                        setResponseAction('declined');
                        setResponseNoteText('معذرت، اس تاریخ کے لیے چیمبرز فل ہیں۔');
                      }}
                      type="button"
                      className="min-h-[44px] px-4 py-2 bg-stone-100 hover:bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>معذرت کریں (Decline)</span>
                    </button>

                    <button
                      onClick={() => {
                        setRespondingBookingId(bkg.id);
                        setResponseAction('accepted');
                        setResponseNoteText('جگہ منظور ہے۔ چیمبر میں جگہ مخصوص کر دی گئی ہے۔');
                      }}
                      type="button"
                      className="min-h-[44px] px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>بکنگ منظور کریں (Accept)</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* RESPONSE CONFIRMATION MODAL */}
      {respondingBookingId && responseAction && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md parchment-slip rounded-3xl border-2 border-stone-800 shadow-2xl p-5 space-y-3">
            <h4 className="font-bold font-urdu text-lg text-stone-900">
              {responseAction === 'accepted' ? 'بکنگ منظور کریں' : 'بکنگ پر معذرت ارسال کریں'}
            </h4>
            <p className="text-xs text-stone-600">
              کسان کو مطلع کرنے کے لیے تصدیقی نوٹ یا ہدایات لکھیں:
            </p>
            <textarea
              rows={2}
              value={responseNoteText}
              onChange={(e) => setResponseNoteText(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs font-urdu"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRespondingBookingId(null);
                  setResponseAction(null);
                }}
                className="min-h-[44px] px-4 bg-stone-200 text-stone-800 rounded-xl text-xs font-bold"
              >
                منسوخ
              </button>
              <button
                onClick={handleConfirmBookingResponse}
                className={`min-h-[44px] px-5 text-white rounded-xl text-xs font-bold shadow-sm ${
                  responseAction === 'accepted' ? 'bg-emerald-700' : 'bg-red-700'
                }`}
              >
                ارسال کریں
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE INWARD RECEIPT */}
      <CreateInwardReceiptModal
        isOpen={isInwardModalOpen}
        onClose={() => setIsInwardModalOpen(false)}
        facility={facility}
        onSuccess={loadAll}
      />

      {/* MODAL: CREATE GATE PASS */}
      <CreateGatePassModal
        isOpen={isGatePassModalOpen}
        onClose={() => {
          setIsGatePassModalOpen(false);
          setPreselectedInventoryItem(null);
        }}
        facility={facility}
        inventory={inventory}
        preselectedItem={preselectedInventoryItem}
        onSuccess={(gp) => {
          loadAll();
          handleOpenInvoiceForGatePass(gp);
        }}
      />

      {/* MODAL: EDIT FACILITY PROFILE */}
      <EditFacilityProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        facility={facility}
        onSuccess={(updated) => {
          setFacility(updated);
          loadAll();
        }}
      />

      {/* MODAL: INVOICE / STATEMENT */}
      {selectedItemForInvoice && (
        <ColdStorageInvoiceModal
          isOpen={Boolean(selectedItemForInvoice)}
          onClose={() => {
            setSelectedItemForInvoice(null);
            setSelectedGatePassForInvoice(null);
          }}
          facility={facility}
          item={selectedItemForInvoice}
          gatePass={selectedGatePassForInvoice}
        />
      )}
    </div>
  );
};
