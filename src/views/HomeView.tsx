import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../services/formatters';
import { SaleSlip, SlipType } from '../types';
import { saleSlipRepository } from '../repositories/saleSlipRepository';
import { SaleSlipCard } from '../components/SaleSlipCard';
import { CreateSaleSlipModal } from './CreateSaleSlipModal';
import { CancelSlipModal } from './CancelSlipModal';
import { DailySaleSummaryModal } from '../components/DailySaleSummaryModal';
import { AddPartyModal } from './AddPartyModal';
import { CreateLotModal } from '../components/CreateLotModal';
import { CreateBiltyModal } from '../components/CreateBiltyModal';
import { FarmerColdStorageModal } from '../components/FarmerColdStorageModal';
import {
  Plus,
  Receipt,
  Scale,
  Warehouse,
  Truck,
  UserPlus,
  ArrowRight,
  BarChart3,
  Lock,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { currentRole, parties, t, language, speak, setActiveTab } = useApp();
  const [saleSlips, setSaleSlips] = useState<SaleSlip[]>([]);
  const [isSaleSlipModalOpen, setIsSaleSlipModalOpen] = useState(false);
  const [isLotModalOpen, setIsLotModalOpen] = useState(false);
  const [isBiltyModalOpen, setIsBiltyModalOpen] = useState(false);
  const [isFarmerStorageModalOpen, setIsFarmerStorageModalOpen] = useState(false);
  const [slipToEdit, setSlipToEdit] = useState<SaleSlip | null>(null);
  const [slipToCancel, setSlipToCancel] = useState<SaleSlip | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);

  const roleInfo = t.roles[currentRole];
  const isArhti = currentRole === 'arhti';

  const loadSaleSlips = async () => {
    try {
      const all = await saleSlipRepository.getAll();
      setSaleSlips(all);
    } catch (err) {
      console.error('Failed to load sale slips:', err);
    }
  };

  useEffect(() => {
    loadSaleSlips();
  }, []);

  // Filter slips by role context
  const displaySlips = saleSlips.filter((s) => {
    if (currentRole === 'farmer') {
      return s.farmerId === 'p-farmer-1' || s.farmerName.includes('غلام فرید');
    }
    if (currentRole === 'buyer') {
      return s.buyerId === 'p-buyer-1' || s.buyerName.includes('طارق محمود');
    }
    return true;
  });

  const activeSlips = displaySlips.filter((s) => s.status === 'active');
  const totalVolumePKR = activeSlips.reduce((sum, s) => sum + s.netPayable, 0);
  const totalNetWeight = activeSlips.reduce((sum, s) => sum + s.netWeight, 0);

  const handleLinkKhata = async (slipId: string) => {
    await saleSlipRepository.linkToFarmerKhata(slipId);
    await loadSaleSlips();
    speak('پرچی کسان کے کھاتے میں باضابطہ درج کر دی گئی۔');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Role Banner & Daily Briefing */}
      <div className="parchment-slip rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {currentRole === 'farmer' && '🌾'}
                {currentRole === 'arhti' && '⚖️'}
                {currentRole === 'cold_storage' && '❄️'}
                {currentRole === 'transporter' && '🚛'}
                {currentRole === 'buyer' && '💰'}
              </span>
              <h2 className="text-2xl font-bold font-urdu text-stone-900">{roleInfo.title}</h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              {roleInfo.desc}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-xl shrink-0">
              {roleInfo.badge}
            </span>

            {/* Daily summary button */}
            <button
              onClick={() => setIsSummaryModalOpen(true)}
              type="button"
              className="text-xs font-bold text-[#78350F] hover:underline flex items-center gap-1 mt-1"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>یومیہ رپورٹ</span>
            </button>
          </div>
        </div>

        {/* Read-Only Notice for Farmer / Buyer */}
        {!isArhti && (
          <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-xs text-stone-700">
            <Lock className="w-4 h-4 text-amber-800 shrink-0" />
            <p>
              آپ کا موجودہ کردار <strong>{roleInfo.title}</strong> ہے۔ پرچیاں صرف پڑھنے، پرنٹ کرنے اور QR تصدیق کے لیے دستیاب ہیں۔
            </p>
          </div>
        )}

        {/* Daily Tally Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 pt-4 border-t-2 border-amber-200">
          <div className="bg-white/80 p-3 rounded-2xl border border-amber-200">
            <span className="text-[11px] font-bold text-stone-500 block">کل خالص مالیت</span>
            <div className="text-base sm:text-lg font-bold font-mono text-stone-900 mt-0.5">
              <bdi dir="ltr">{formatPKR(totalVolumePKR, language)}</bdi>
            </div>
          </div>

          <div className="bg-white/80 p-3 rounded-2xl border border-amber-200">
            <span className="text-[11px] font-bold text-stone-500 block">کل خالص وزن</span>
            <div className="text-base sm:text-lg font-bold font-mono text-stone-900 mt-0.5">
              <bdi dir="ltr">{Math.round(totalNetWeight / 40)} من</bdi>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white/80 p-3 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-stone-500 block">کل فعال پرچیاں</span>
              <div className="text-base sm:text-lg font-bold font-mono text-stone-900 mt-0.5">
                <bdi dir="ltr">{activeSlips.length} پرچیاں</bdi>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('slips')}
              className="text-xs font-bold text-[#78350F] flex items-center gap-1 hover:underline"
            >
              <span>سب دیکھیں</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Action Pinned for Low-Literacy Ergonomics (Min 56px touch target) */}
      {isArhti ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              setSlipToEdit(null);
              setIsSaleSlipModalOpen(true);
            }}
            type="button"
            className="w-full min-h-[58px] p-4 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98"
          >
            <Plus className="w-6 h-6 text-amber-300 shrink-0" />
            <span>نئی بولی پرچی جاری کریں (Sale Slip)</span>
          </button>

          <button
            onClick={() => setIsBiltyModalOpen(true)}
            type="button"
            className="w-full min-h-[58px] p-4 bg-amber-800 hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base shadow-md flex items-center justify-center gap-2.5 transition-transform active:scale-98"
          >
            <Truck className="w-5 h-5 text-amber-300 shrink-0" />
            <span>نئی ٹرانسپورٹ بلٹی (Create Bilty)</span>
          </button>
        </div>
      ) : currentRole === 'cold_storage' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => setActiveTab('slips')}
            type="button"
            className="w-full min-h-[58px] p-4 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98"
          >
            <Warehouse className="w-6 h-6 text-amber-300 shrink-0" />
            <span>کولڈ اسٹوریج گنجائش و اسٹاک (Cold Storage)</span>
          </button>

          <button
            onClick={() => setActiveTab('slips')}
            type="button"
            className="w-full min-h-[58px] p-4 bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-300 rounded-2xl font-bold text-base shadow-sm flex items-center justify-center gap-2.5 transition-transform active:scale-98"
          >
            <Plus className="w-5 h-5 text-amber-900 shrink-0" />
            <span>انورڈ رسید و آؤٹ ورڈ گیٹ پاس دیکھیں</span>
          </button>
        </div>
      ) : currentRole === 'transporter' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => setIsBiltyModalOpen(true)}
            type="button"
            className="w-full min-h-[58px] p-4 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98"
          >
            <Truck className="w-6 h-6 text-amber-300 shrink-0" />
            <span>نئی ٹرانسپورٹ بلٹی جاری کریں (Create Bilty)</span>
          </button>

          <button
            onClick={() => setActiveTab('slips')}
            type="button"
            className="w-full min-h-[58px] p-4 bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-300 rounded-2xl font-bold text-base shadow-sm flex items-center justify-center gap-2.5 transition-transform active:scale-98"
          >
            <span>تمام بلٹیاں اور لاٹ ٹائم لائن دیکھیں</span>
          </button>
        </div>
      ) : currentRole === 'farmer' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => setIsLotModalOpen(true)}
            type="button"
            className="w-full min-h-[58px] p-4 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98"
          >
            <Plus className="w-6 h-6 text-amber-300 shrink-0" />
            <span>نئی زرعی لاٹ بنائیں</span>
          </button>

          <button
            onClick={() => setIsFarmerStorageModalOpen(true)}
            type="button"
            className="w-full min-h-[58px] p-4 bg-amber-800 hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base shadow-md flex items-center justify-center gap-2.5 transition-transform active:scale-98"
          >
            <Warehouse className="w-5 h-5 text-amber-300 shrink-0" />
            <span>کولڈ اسٹوریج بکنگ</span>
          </button>

          <button
            onClick={() => setActiveTab('khata')}
            type="button"
            className="w-full min-h-[58px] p-4 bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-300 rounded-2xl font-bold text-base shadow-sm flex items-center justify-center gap-2.5 transition-transform active:scale-98"
          >
            <span>اپنا بہی کھاتہ دیکھیں</span>
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setActiveTab('khata')}
            type="button"
            className="w-full min-h-[58px] p-4 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98"
          >
            <span>اپنا بہی کھاتہ دیکھیں (View My Khata)</span>
          </button>
        </div>
      )}

      {/* Quick Party Add Shortcut */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h3 className="text-base font-bold font-urdu text-stone-900">
          حالیہ نیلامی پرچیاں (Recent Sale Slips)
        </h3>
        <button
          onClick={() => setIsPartyModalOpen(true)}
          type="button"
          className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{t.actions.addParty}</span>
        </button>
      </div>

      {/* Sale Slips Stream */}
      <div className="space-y-4">
        {displaySlips.length === 0 ? (
          <div className="p-8 text-center bg-white/90 rounded-2xl border-2 border-dashed border-amber-300">
            <Receipt className="w-10 h-10 text-amber-700/60 mx-auto mb-2" />
            <p className="font-bold text-stone-800 text-sm font-urdu">
              ابھی اس کھاتے میں کوئی نیلامی پرچی موجود نہیں ہے
            </p>
            <p className="text-xs text-stone-600 mt-1">
              نئی بولی یا فروخت پرچی درج کرنے کے لیے اوپر دیے گئے بٹن کا استعمال کیجیے۔
            </p>
          </div>
        ) : (
          displaySlips.slice(0, 3).map((slip) => (
            <SaleSlipCard
              key={slip.id}
              slip={slip}
              onLinkToKhata={handleLinkKhata}
              onEditSlip={(s) => {
                setSlipToEdit(s);
                setIsSaleSlipModalOpen(true);
              }}
              onCancelSlip={(s) => setSlipToCancel(s)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <CreateSaleSlipModal
        isOpen={isSaleSlipModalOpen}
        onClose={() => {
          setIsSaleSlipModalOpen(false);
          setSlipToEdit(null);
        }}
        slipToEdit={slipToEdit}
        onSaved={loadSaleSlips}
      />

      <CancelSlipModal
        slip={slipToCancel}
        isOpen={Boolean(slipToCancel)}
        onClose={() => setSlipToCancel(null)}
        onCancelled={loadSaleSlips}
        userRole={currentRole}
        userName={roleInfo.title}
      />

      <DailySaleSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onReadAloud={(txt) => speak(txt)}
      />

      <AddPartyModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
      />

      <CreateLotModal
        isOpen={isLotModalOpen}
        onClose={() => setIsLotModalOpen(false)}
        onLotCreated={() => {
          speak('زرعی لاٹ بن گئی۔ آپ پرچیاں سیکشن میں پاسپورٹ دیکھ سکتے ہیں۔');
          setActiveTab('slips');
        }}
      />

      <CreateBiltyModal
        isOpen={isBiltyModalOpen}
        onClose={() => setIsBiltyModalOpen(false)}
        onBiltyCreated={() => {
          speak('ٹرانسپورٹ بلٹی بن گئی۔ آپ پرچیاں سیکشن میں بلٹی دیکھ سکتے ہیں۔');
          setActiveTab('slips');
        }}
      />

      <FarmerColdStorageModal
        isOpen={isFarmerStorageModalOpen}
        onClose={() => setIsFarmerStorageModalOpen(false)}
      />
    </div>
  );
};
