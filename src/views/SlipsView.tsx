import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SaleSlip, Commodity, Lot, Bilty } from '../types';
import { saleSlipRepository } from '../repositories/saleSlipRepository';
import { lotRepository } from '../repositories/lotRepository';
import { biltyRepository } from '../repositories/biltyRepository';
import { SaleSlipCard } from '../components/SaleSlipCard';
import { LotPassportCard } from '../components/LotPassportCard';
import { LotTimelineModal } from '../components/LotTimelineModal';
import { CreateLotModal } from '../components/CreateLotModal';
import { CreateBiltyModal } from '../components/CreateBiltyModal';
import { BiltyCard } from '../components/BiltyCard';
import { PublicLotVerificationModal } from '../components/PublicLotVerificationModal';
import { CreateSaleSlipModal } from './CreateSaleSlipModal';
import { CancelSlipModal } from './CancelSlipModal';
import { DailySaleSummaryModal } from '../components/DailySaleSummaryModal';
import { ColdStorageDashboard } from '../components/ColdStorageDashboard';
import { EmptyState } from '../components/EmptyState';
import {
  Plus,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Volume2,
  Receipt,
  FileCheck2,
  Truck,
  Warehouse,
  Sparkles,
} from 'lucide-react';

export const SlipsView: React.FC = () => {
  const { currentRole, parties, t, speak } = useApp();

  // Section Selector: 'sale_slips' | 'lots' | 'bilties' | 'cold_storage'
  const [activeSection, setActiveSection] = useState<
    'sale_slips' | 'lots' | 'bilties' | 'cold_storage'
  >(() => {
    if (currentRole === 'cold_storage') return 'cold_storage';
    if (currentRole === 'transporter') return 'bilties';
    if (currentRole === 'farmer') return 'lots';
    return 'sale_slips';
  });

  // State: Sale Slips
  const [slips, setSlips] = useState<SaleSlip[]>([]);
  const [isSlipsLoading, setIsSlipsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCommodity, setFilterCommodity] = useState<Commodity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'cancelled' | 'linked'>('all');

  // State: Lots & Passports
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLotForTimeline, setSelectedLotForTimeline] = useState<Lot | null>(null);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isCreateLotModalOpen, setIsCreateLotModalOpen] = useState(false);
  const [publicVerifyLot, setPublicVerifyLot] = useState<Lot | null>(null);

  // State: Bilties
  const [bilties, setBilties] = useState<Bilty[]>([]);
  const [isCreateBiltyModalOpen, setIsCreateBiltyModalOpen] = useState(false);
  const [filterBiltyStatus, setFilterBiltyStatus] = useState<'all' | 'in_transit' | 'delivered'>('all');

  // Sale Slip Modals
  const [isCreateSaleSlipOpen, setIsCreateSaleSlipOpen] = useState(false);
  const [slipToEdit, setSlipToEdit] = useState<SaleSlip | null>(null);
  const [slipToCancel, setSlipToCancel] = useState<SaleSlip | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const isArhti = currentRole === 'arhti';
  const isFarmer = currentRole === 'farmer';
  const isTransporter = currentRole === 'transporter';
  const roleTitle = t.roles[currentRole]?.title || currentRole;

  // Load All Entities
  const loadAll = async () => {
    try {
      setIsSlipsLoading(true);
      const [allSlips, allLots, allBilties] = await Promise.all([
        saleSlipRepository.getAll(),
        lotRepository.getAll(),
        biltyRepository.getAll(),
      ]);
      setSlips(allSlips);
      setLots(allLots);
      setBilties(allBilties);
    } catch (err) {
      console.error('Failed to load data in SlipsView:', err);
    } finally {
      setIsSlipsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Update default tab if role changes
  useEffect(() => {
    if (currentRole === 'cold_storage') setActiveSection('cold_storage');
    else if (currentRole === 'transporter') setActiveSection('bilties');
    else if (currentRole === 'farmer' && activeSection === 'bilties') setActiveSection('lots');
  }, [currentRole]);

  // Filter Slips
  const filteredSlips = slips.filter((s) => {
    if (filterCommodity !== 'all' && s.commodity !== filterCommodity) return false;
    if (filterStatus === 'active' && s.status !== 'active') return false;
    if (filterStatus === 'cancelled' && s.status !== 'cancelled') return false;
    if (filterStatus === 'linked' && !s.isLinkedToKhata) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const match =
        s.serialNumber.toLowerCase().includes(term) ||
        s.farmerName.toLowerCase().includes(term) ||
        s.buyerName.toLowerCase().includes(term) ||
        s.variety.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  // Filter Lots
  const filteredLots = lots.filter((l) => {
    if (filterCommodity !== 'all' && l.crop !== filterCommodity) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const match =
        l.lotNumber.toLowerCase().includes(term) ||
        l.variety.toLowerCase().includes(term) ||
        l.farmerName.toLowerCase().includes(term) ||
        l.farmName.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  // Filter Bilties
  const filteredBilties = bilties.filter((b) => {
    if (filterBiltyStatus === 'in_transit' && b.status === 'delivered') return false;
    if (filterBiltyStatus === 'delivered' && b.status !== 'delivered') return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const match =
        b.biltyNumber.toLowerCase().includes(term) ||
        b.vehicleNumber.toLowerCase().includes(term) ||
        b.driverName.toLowerCase().includes(term) ||
        b.origin.toLowerCase().includes(term) ||
        b.destination.toLowerCase().includes(term) ||
        b.senderName.toLowerCase().includes(term) ||
        b.receiverName.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  // Link to Khata
  const handleLinkKhata = async (slipId: string) => {
    await saleSlipRepository.linkToFarmerKhata(slipId);
    await loadAll();
    speak('پرچی کسان کے کھاتے میں باضابطہ درج کر دی گئی۔');
  };

  const handleReadScreen = () => {
    if (activeSection === 'sale_slips') {
      const activeCount = slips.filter((s) => s.status === 'active').length;
      speak(`نیلامی و فروخت پرچیاں۔ کل ${activeCount} فعال پرچیاں درج ہیں۔`);
    } else if (activeSection === 'lots') {
      speak(`زرعی لاٹ پاسپورٹ سیکشن۔ کل ${lots.length} لاٹس اور ان کی غیر مٹائی جانے والی ٹائم لائنز درج ہیں۔`);
    } else if (activeSection === 'bilties') {
      const transitCount = bilties.filter((b) => b.status !== 'delivered').length;
      speak(`ٹرانسپورٹ بلٹی سیکشن۔ کل ${bilties.length} بلٹیاں درج ہیں، جن میں سے ${transitCount} راستے میں ہیں۔`);
    } else {
      speak(`کولڈ اسٹوریج سیکشن۔ چیمبر گنجائش، انورڈ مال، گیٹ پاس اور کسان بکنگز کا انتظام کریں۔`);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner */}
      <div className="parchment-slip rounded-3xl p-5 border-2 border-amber-300 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-stone-800 gap-2">
          <div>
            <span className="text-xs uppercase tracking-wider text-stone-600 font-semibold block">
              دستاویزات، لاٹ پاسپورٹ، بلٹیاں و کولڈ اسٹوریج
            </span>
            <h2 className="text-2xl font-bold font-urdu text-stone-900">
              پرچیاں، زرعی لاٹس اور گودام
            </h2>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center">
            {/* Read Aloud */}
            <button
              onClick={handleReadScreen}
              type="button"
              className="min-h-[44px] px-3.5 py-2 bg-amber-800 text-amber-100 hover:bg-amber-700 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Volume2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>سنیں</span>
            </button>

            {/* Daily Summary Button */}
            {activeSection === 'sale_slips' && (
              <button
                onClick={() => setIsSummaryModalOpen(true)}
                type="button"
                className="min-h-[44px] px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl text-xs font-bold text-amber-950 flex items-center gap-1.5 transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-amber-800" />
                <span>یومیہ گوشوارہ</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Main Section Tabs: Sale Slips | Lots & Passports | Goods Bilty | Cold Storage */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-stone-100 rounded-2xl border border-stone-300">
          <button
            onClick={() => setActiveSection('sale_slips')}
            type="button"
            className={`min-h-[48px] py-2 px-1 sm:px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeSection === 'sale_slips'
                ? 'bg-[#78350F] text-amber-50 shadow-sm'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Receipt className="w-4 h-4 shrink-0" />
            <span className="truncate">بولی پرچیاں ({slips.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('lots')}
            type="button"
            className={`min-h-[48px] py-2 px-1 sm:px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeSection === 'lots'
                ? 'bg-[#78350F] text-amber-50 shadow-sm'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4 shrink-0" />
            <span className="truncate">لاٹ پاسپورٹ ({lots.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('bilties')}
            type="button"
            className={`min-h-[48px] py-2 px-1 sm:px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeSection === 'bilties'
                ? 'bg-[#78350F] text-amber-50 shadow-sm'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span className="truncate">ٹرانسپورٹ بلٹی ({bilties.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('cold_storage')}
            type="button"
            className={`min-h-[48px] py-2 px-1 sm:px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeSection === 'cold_storage'
                ? 'bg-[#78350F] text-amber-50 shadow-sm'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Warehouse className="w-4 h-4 shrink-0" />
            <span className="truncate">کولڈ اسٹوریج</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: SALE SLIPS (بولی پرچیاں)                           */}
      {/* ============================================================== */}
      {activeSection === 'sale_slips' && (
        <div className="space-y-4">
          {/* Main Action for Arhti */}
          {isArhti && (
            <div>
              <button
                onClick={() => {
                  setSlipToEdit(null);
                  setIsCreateSaleSlipOpen(true);
                }}
                type="button"
                className="w-full min-h-[58px] p-4 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98"
              >
                <Plus className="w-6 h-6 text-amber-300 shrink-0" />
                <span>نئی بولی پرچی بنائیں (Create Sale Slip)</span>
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="parchment-slip rounded-2xl p-4 border border-amber-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute top-3.5 start-3 text-stone-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="سریل نمبر، کسان یا خریدار کے نام سے تلاش کریں..."
                className="w-full h-11 ps-9 pe-3 rounded-xl border border-stone-300 bg-white text-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all' as const, label: `تمام (${slips.length})` },
                {
                  id: 'active' as const,
                  label: `فعال (${slips.filter((s) => s.status === 'active').length})`,
                },
                {
                  id: 'linked' as const,
                  label: `کھاتے میں درج (${slips.filter((s) => s.isLinkedToKhata).length})`,
                },
                {
                  id: 'cancelled' as const,
                  label: `منسوخ شدہ (${slips.filter((s) => s.status === 'cancelled').length})`,
                },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setFilterStatus(st.id)}
                  type="button"
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                    filterStatus === st.id
                      ? 'bg-[#78350F] text-amber-50 border-[#78350F] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slips Stream */}
          {isSlipsLoading ? (
            <div className="parchment-slip rounded-3xl p-8 border-2 border-amber-300 text-center space-y-2 shadow-xs">
              <div className="w-8 h-8 border-4 border-[#78350F] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-bold text-stone-800 text-sm font-urdu">
                پرچیاں کلاؤڈ ڈیٹا بیس سے لوڈ ہو رہی ہیں، برائے مہربانی انتظار کیجیے...
              </p>
            </div>
          ) : filteredSlips.length === 0 ? (
            <EmptyState
              title="کوئی بولی پرچی نہیں ملی"
              description="فلٹر کے مطابق کوئی ریکارڈ موجود نہیں ہے۔ نیا سلیپ جاری کرنے کے لیے اوپر بٹن دبائیں۔"
              actionLabel={isArhti ? 'نئی پرچی بنائیں' : undefined}
              onAction={isArhti ? () => setIsCreateSaleSlipOpen(true) : undefined}
              icon="🧾"
            />
          ) : (
            <div className="space-y-4">
              {filteredSlips.map((slip) => (
                <SaleSlipCard
                  key={slip.id}
                  slip={slip}
                  onLinkToKhata={handleLinkKhata}
                  onEditSlip={(s) => {
                    setSlipToEdit(s);
                    setIsCreateSaleSlipOpen(true);
                  }}
                  onCancelSlip={(s) => setSlipToCancel(s)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: LOTS & TIMELINE TRACEABILITY (زرعی لاٹ پاسپورٹ)     */}
      {/* ============================================================== */}
      {activeSection === 'lots' && (
        <div className="space-y-4">
          {/* Main Action to Create Lot */}
          <div>
            <button
              onClick={() => setIsCreateLotModalOpen(true)}
              type="button"
              className="w-full min-h-[58px] p-4 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98"
            >
              <Plus className="w-6 h-6 text-amber-300 shrink-0" />
              <span>نئی زرعی لاٹ بنائیں (Create Farm Lot)</span>
            </button>
          </div>

          {/* Search & Crop Filter */}
          <div className="parchment-slip rounded-2xl p-4 border border-amber-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute top-3.5 start-3 text-stone-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="لاٹ نمبر، ورائٹی، کسان یا باغ کے نام سے تلاش کریں..."
                className="w-full h-11 ps-9 pe-3 rounded-xl border border-stone-300 bg-white text-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all' as const, label: `تمام فصلیں (${lots.length})` },
                { id: 'mango' as const, label: 'آم (Mango)' },
                { id: 'citrus' as const, label: 'کنو (Citrus)' },
                { id: 'dates' as const, label: 'کھجور (Dates)' },
                { id: 'cotton' as const, label: 'کپاس (Cotton)' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterCommodity(c.id)}
                  type="button"
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                    filterCommodity === c.id
                      ? 'bg-[#78350F] text-amber-50 border-[#78350F] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lots Stream */}
          {filteredLots.length === 0 ? (
            <EmptyState
              title="کوئی زرعی لاٹ نہیں ملی"
              description="فلٹر کے مطابق کوئی لاٹ پاسپورٹ درج نہیں ہے۔ نئی لاٹ بنانے کے لیے اوپر بٹن دبائیں۔"
              actionLabel="نئی زرعی لاٹ بنائیں"
              onAction={() => setIsCreateLotModalOpen(true)}
              icon="🌾"
            />
          ) : (
            <div className="space-y-4">
              {filteredLots.map((lot) => (
                <LotPassportCard
                  key={lot.id}
                  lot={lot}
                  onViewTimeline={(l) => {
                    setSelectedLotForTimeline(l);
                    setIsTimelineModalOpen(true);
                  }}
                  onAddEvent={(l) => {
                    setSelectedLotForTimeline(l);
                    setIsTimelineModalOpen(true);
                  }}
                  onOpenPublicVerify={(l) => setPublicVerifyLot(l)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: BILTY (ٹرانسپورٹ بلٹی کنسائنمنٹ)                   */}
      {/* ============================================================== */}
      {activeSection === 'bilties' && (
        <div className="space-y-4">
          {/* Main Action to Create Bilty */}
          <div>
            <button
              onClick={() => setIsCreateBiltyModalOpen(true)}
              type="button"
              className="w-full min-h-[58px] p-4 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98"
            >
              <Plus className="w-6 h-6 text-amber-300 shrink-0" />
              <span>نئی مال برداری بلٹی جاری کریں (Create Bilty)</span>
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="parchment-slip rounded-2xl p-4 border border-amber-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute top-3.5 start-3 text-stone-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بلٹی نمبر، گاڑی نمبر، ڈرائیور، روانگی یا منزل سے تلاش کریں..."
                className="w-full h-11 ps-9 pe-3 rounded-xl border border-stone-300 bg-white text-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all' as const, label: `تمام بلٹیاں (${bilties.length})` },
                {
                  id: 'in_transit' as const,
                  label: `راستے میں (${bilties.filter((b) => b.status !== 'delivered').length})`,
                },
                {
                  id: 'delivered' as const,
                  label: `منزل پر پہنچ گئیں (${bilties.filter((b) => b.status === 'delivered').length})`,
                },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setFilterBiltyStatus(st.id)}
                  type="button"
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                    filterBiltyStatus === st.id
                      ? 'bg-[#78350F] text-amber-50 border-[#78350F] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bilties Stream */}
          {filteredBilties.length === 0 ? (
            <EmptyState
              title="کوئی ٹرانسپورٹ بلٹی نہیں ملی"
              description="فلٹر کے مطابق کوئی کنسائنمنٹ ریکارڈ درج نہیں ہے۔ نئی بلٹی جاری کرنے کے لیے اوپر بٹن دبائیں۔"
              actionLabel="نئی بلٹی جاری کریں"
              onAction={() => setIsCreateBiltyModalOpen(true)}
              icon="🚛"
            />
          ) : (
            <div className="space-y-4">
              {filteredBilties.map((bilty) => (
                <BiltyCard
                  key={bilty.id}
                  bilty={bilty}
                  onDelivered={loadAll}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: COLD STORAGE (کولڈ اسٹوریج گنجائش و اسٹاک)        */}
      {/* ============================================================== */}
      {activeSection === 'cold_storage' && (
        <ColdStorageDashboard />
      )}

      {/* ============================================================== */}
      {/* MODALS & OVERLAYS                                              */}
      {/* ============================================================== */}

      {/* 1. Create Sale Slip Modal */}
      <CreateSaleSlipModal
        isOpen={isCreateSaleSlipOpen}
        onClose={() => {
          setIsCreateSaleSlipOpen(false);
          setSlipToEdit(null);
        }}
        slipToEdit={slipToEdit}
        onSaved={loadAll}
      />

      {/* 2. Cancel Sale Slip Modal */}
      <CancelSlipModal
        slip={slipToCancel}
        isOpen={Boolean(slipToCancel)}
        onClose={() => setSlipToCancel(null)}
        onCancelled={loadAll}
        userRole={currentRole}
        userName={roleTitle}
      />

      {/* 3. Daily Sale Summary Modal */}
      <DailySaleSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onReadAloud={(txt) => speak(txt)}
      />

      {/* 4. Create Lot Modal */}
      <CreateLotModal
        isOpen={isCreateLotModalOpen}
        onClose={() => setIsCreateLotModalOpen(false)}
        onLotCreated={loadAll}
      />

      {/* 5. Lot Timeline Modal (Append-Only) */}
      <LotTimelineModal
        lot={selectedLotForTimeline}
        isOpen={isTimelineModalOpen}
        onClose={() => {
          setIsTimelineModalOpen(false);
          setSelectedLotForTimeline(null);
        }}
        onEventAdded={loadAll}
      />

      {/* 6. Create Bilty Modal (Consignment Note with Signature) */}
      <CreateBiltyModal
        isOpen={isCreateBiltyModalOpen}
        onClose={() => setIsCreateBiltyModalOpen(false)}
        onBiltyCreated={loadAll}
      />

      {/* 7. Public Lot Verification Modal */}
      <PublicLotVerificationModal
        lot={publicVerifyLot}
        isOpen={Boolean(publicVerifyLot)}
        onClose={() => setPublicVerifyLot(null)}
      />
    </div>
  );
};

