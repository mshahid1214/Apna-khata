/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { SpeechBanner } from './components/SpeechBanner';
import { FirstRunIntro } from './components/FirstRunIntro';
import { HomeView } from './views/HomeView';
import { KhataView } from './views/KhataView';
import { SlipsView } from './views/SlipsView';
import { RatesView } from './views/RatesView';
import { MoreView } from './views/MoreView';
import { PublicSlipVerificationModal } from './components/PublicSlipVerificationModal';
import { PublicLotVerificationModal } from './components/PublicLotVerificationModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { SaleSlip, Lot } from './types';
import { saleSlipRepository } from './repositories/saleSlipRepository';
import { lotRepository } from './repositories/lotRepository';
import { getPublicVerification } from './services/firebase';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    currentRole,
    t,
    speak,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isAdminModalOpen,
    setIsAdminModalOpen,
  } = useApp();
  const [verifiedSlip, setVerifiedSlip] = useState<SaleSlip | null>(null);
  const [verifiedLot, setVerifiedLot] = useState<Lot | null>(null);

  // Check URL for ?verify=<slipId> or ?lotId=<lotId> on mount (e.g. from scanning QR code)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const verifyId = params.get('verify');
      const lotIdParam = params.get('lotId');

      if (verifyId) {
        saleSlipRepository.getById(verifyId).then(async (slip) => {
          if (slip) {
            setVerifiedSlip(slip);
          } else {
            // Non-sensitive public lookup from public_verifications collection
            const publicRecord = await getPublicVerification(`slip-${verifyId}`);
            if (publicRecord) {
              setVerifiedSlip({
                id: publicRecord.identifier,
                serialNumber: publicRecord.identifier,
                date: publicRecord.date,
                farmerId: '',
                farmerName: 'مصدقہ کسان (فروخت کنندہ)',
                buyerId: '',
                buyerName: 'منڈی خریدار',
                arhtiId: '',
                arhtiName: 'مصدقہ آڑھت',
                commodity: (publicRecord.commodity as any) || 'mango',
                variety: publicRecord.variety,
                grade: publicRecord.grade || 'درجہ اول',
                crateCount: typeof publicRecord.quantity === 'number' ? publicRecord.quantity : 0,
                unit: (publicRecord.unit as any) || 'kg',
                grossWeight: typeof publicRecord.quantity === 'number' ? publicRecord.quantity : 0,
                tareWeight: 0,
                netWeight: typeof publicRecord.quantity === 'number' ? publicRecord.quantity : 0,
                ratePerUnit: 0,
                grossAmount: publicRecord.netPayable || 0,
                deductions: {
                  commissionPercent: 0,
                  commissionPKR: 0,
                  laborPKR: 0,
                  marketFeePKR: 0,
                  transportPKR: 0,
                  otherDeductionPKR: 0,
                },
                totalDeductions: 0,
                netPayable: publicRecord.netPayable || 0,
                status: (publicRecord.status as any) || 'active',
                isLinkedToKhata: false,
                history: [],
                isSample: false,
                createdAt: publicRecord.createdAt,
              });
            }
          }
        });
      } else if (lotIdParam) {
        lotRepository.getById(lotIdParam).then(async (lot) => {
          if (lot) {
            setVerifiedLot(lot);
          } else {
            const publicRecord = await getPublicVerification(`lot-${lotIdParam}`);
            if (publicRecord) {
              setVerifiedLot({
                id: publicRecord.identifier,
                lotNumber: publicRecord.identifier,
                farmerId: '',
                farmerName: 'مصدقہ باغبان',
                crop: (publicRecord.commodity as any) || 'mango',
                variety: publicRecord.variety,
                grade: publicRecord.grade || 'درجہ اول',
                quantity: typeof publicRecord.quantity === 'number' ? publicRecord.quantity : 0,
                unit: (publicRecord.unit as any) || 'kg',
                harvestDate: publicRecord.date,
                farmName: 'جنوبی پنجاب باغبان ایسوسی ایشن',
                timeline: [],
                isSample: false,
                createdAt: publicRecord.createdAt,
              });
            }
          }
        });
      }
    }
  }, []);

  const handleReadScreenAloud = () => {
    const roleTitle = t.roles[currentRole].title;
    if (activeTab === 'home') {
      speak(`ہوم اسکرین۔ آپ کا کردار ${roleTitle} ہے۔ نئی بولی اور پرچی بنانے کے لیے بٹن دبائیں۔`);
    } else if (activeTab === 'khata') {
      speak('کھاتہ رجسٹر۔ تمام کسانوں، آڑھتیوں اور بیوپاریوں کے بنام اور جمع کھاتے یہاں موجود ہیں۔');
    } else if (activeTab === 'slips') {
      speak('پرچیاں سیکشن۔ بولی پرچی، کانٹا پرچی، کولڈ اسٹوریج اور بلٹی پرچیاں دیکھیں۔');
    } else if (activeTab === 'rates') {
      speak('آج کے منڈی ریٹس بورڈ۔ تمام نرخ اور اوزان کی ترتیبات تبدیل کر سکتے ہیں۔');
    } else if (activeTab === 'more') {
      speak('سیٹنگز اور مدد۔ زبان تبدیل کریں یا نمونہ ڈیٹا دوبارہ سیٹ کریں۔');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EE] text-[#1F2937] selection:bg-amber-200">
      {/* Offline Status */}
      <OfflineBanner />

      {/* Header with Role Badge & Voice trigger */}
      <Header onReadAloud={handleReadScreenAloud} />

      {/* Synced Floating Speech Wave Banner */}
      <SpeechBanner />

      {/* Main View Area (Responsive Mobile-first with Max Width for tablet/desktop) */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'khata' && <KhataView />}
        {activeTab === 'slips' && <SlipsView />}
        {activeTab === 'rates' && <RatesView />}
        {activeTab === 'more' && <MoreView />}
      </main>

      {/* Persistent Bottom Tab Bar */}
      <BottomNav />

      {/* 3-Step First-Run Illustrated Onboarding */}
      <FirstRunIntro />

      {/* QR Code Scanned Public Verification Modal */}
      <PublicSlipVerificationModal
        slip={verifiedSlip}
        isOpen={Boolean(verifiedSlip)}
        onClose={() => setVerifiedSlip(null)}
      />

      {/* QR Code Scanned Public Lot Verification Modal */}
      <PublicLotVerificationModal
        lot={verifiedLot}
        isOpen={Boolean(verifiedLot)}
        onClose={() => setVerifiedLot(null)}
      />

      {/* User Phone / Google Auth & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* PIN-Protected Admin & Operator Verification Panel */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
