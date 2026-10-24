import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { KhataEntry, Party, Role, KhataEntryType } from '../types';
import { khataRepository } from '../repositories/khataRepository';
import { formatPKR } from '../services/formatters';
import { shareKhataWhatsApp, exportKhataCSV } from '../services/khataExport';
import { KnowYourNumbersPanel } from '../components/KnowYourNumbersPanel';
import { KhataEntryModal } from './KhataEntryModal';
import { AddPartyModal } from './AddPartyModal';
import { StampSeal } from '../components/StampSeal';
import { EmptyState } from '../components/EmptyState';
import {
  Plus,
  Share2,
  Printer,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Volume2,
  Eye,
  X,
  History,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export const KhataView: React.FC = () => {
  const { currentRole, parties, language, t, speak } = useApp();

  // Selected Farmer and Arhti Pair
  const farmersList = parties.filter((p) => p.role === 'farmer');
  const arhtisList = parties.filter((p) => p.role === 'arhti' || p.role === 'buyer');

  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(
    farmersList[0]?.id || 'p-farmer-1'
  );
  const [selectedArhtiId, setSelectedArhtiId] = useState<string>(
    arhtisList[0]?.id || 'p-arhti-1'
  );

  const [entries, setEntries] = useState<KhataEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<KhataEntryType | 'all'>('all');
  const [filterSeason, setFilterSeason] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<KhataEntry | null>(null);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [viewingHistoryEntry, setViewingHistoryEntry] = useState<KhataEntry | null>(null);

  // Active counterparts
  const activeFarmer =
    parties.find((p) => p.id === selectedFarmerId) ||
    farmersList[0] || {
      id: 'p-farmer-1',
      name: 'Malik Ghulam Farid',
      nameUr: 'ملک غلام فرید (نمونہ)',
      role: 'farmer' as Role,
      village: 'بستی ملوک، شجاع آباد',
      phone: '0300-5550111',
      currentBalance: 0,
      createdAt: '12/10/2026',
      isSample: true,
    };

  const activeArhti =
    parties.find((p) => p.id === selectedArhtiId) ||
    arhtisList[0] || {
      id: 'p-arhti-1',
      name: 'Haji Nazir Ahmad',
      nameUr: 'حاجی نذیر احمد آڑھتی (نمونہ)',
      role: 'arhti' as Role,
      village: 'دکان نمبر 14، نیو غلہ منڈی، ملتان',
      phone: '0302-5550333',
      currentBalance: 0,
      createdAt: '08/10/2026',
      isSample: true,
    };

  // Load entries for this specific pair
  const loadPairEntries = async () => {
    setIsLoadingEntries(true);
    try {
      const all = await khataRepository.getByPair(activeFarmer.id, activeArhti.id);
      setEntries(all);
    } catch (err) {
      console.error('Failed to load Khata pair entries:', err);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  useEffect(() => {
    loadPairEntries();
  }, [selectedFarmerId, selectedArhtiId]);

  // Net Balance: Sum of all credits (جمع - produce/payments) minus sum of all debits (بنام - advances/inputs/deductions)
  const totalCredit = entries.reduce((sum, e) => sum + e.creditPKR, 0);
  const totalDebit = entries.reduce((sum, e) => sum + e.debitPKR, 0);
  const netBalance = totalCredit - totalDebit;

  // Filtered entries
  const filteredEntries = entries.filter((e) => {
    if (filterType !== 'all' && e.entryType !== filterType) return false;
    if (filterSeason !== 'all' && e.season !== filterSeason) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchText =
        e.description.toLowerCase().includes(term) ||
        (e.inputDetails && e.inputDetails.itemName.toLowerCase().includes(term)) ||
        (e.notes && e.notes.toLowerCase().includes(term));
      if (!matchText) return false;
    }
    return true;
  });

  // Toggle confirmation tick
  const handleToggleConfirm = async (entryId: string) => {
    await khataRepository.toggleConfirmation(entryId, currentRole);
    await loadPairEntries();
    speak('اندراج کی تصدیق اپ ڈیٹ کر دی گئی۔');
  };

  // Delete entry
  const handleDelete = async (entryId: string) => {
    if (window.confirm('کیا آپ واقعی یہ اندراج حذف کرنا چاہتے ہیں؟')) {
      await khataRepository.delete(entryId);
      await loadPairEntries();
      speak('اندراج حذف کر دیا گیا۔');
    }
  };

  // Edit entry
  const handleEdit = (entry: KhataEntry) => {
    setEntryToEdit(entry);
    setIsEntryModalOpen(true);
  };

  // Voice narration of Khata
  const handleReadKhata = () => {
    const fName = activeFarmer.nameUr || activeFarmer.name;
    const aName = activeArhti.nameUr || activeArhti.name;
    const statusText =
      netBalance > 0
        ? `آڑھتی ${aName} نے کسان ${fName} کو ${formatPKR(netBalance, 'ur')} دینے ہیں`
        : netBalance < 0
        ? `کسان ${fName} کے ذمہ ${formatPKR(Math.abs(netBalance), 'ur')} واجب الادا ہیں`
        : 'حساب بالکل برابر ہے';

    const urduSpeech = `باہمی بہی کھاتہ۔ کسان ${fName} اور آڑھتی ${aName}۔ کل بنام رقم ${formatPKR(
      totalDebit,
      'ur'
    )}۔ کل جمع رقم ${formatPKR(totalCredit, 'ur')}۔ موجودہ بقایا: ${statusText}۔`;

    const romanSpeech = `Bahi Khata. Farmer ${fName} aur Arhti ${aName}. Total debit ${totalDebit}. Total credit ${totalCredit}. Net balance: ${statusText}.`;
    speak(urduSpeech, romanSpeech);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header Card */}
      <div className="parchment-slip rounded-3xl p-5 border-2 border-amber-300 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-stone-800 gap-2">
          <div>
            <span className="text-xs uppercase tracking-wider text-stone-600 font-semibold block">
              کسان و آڑھتی باہمی بہی کھاتہ
            </span>
            <h2 className="text-2xl font-bold font-urdu text-stone-900">
              روایتی بہی کھاتہ رجسٹر
            </h2>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <button
              onClick={handleReadKhata}
              type="button"
              className="min-h-[44px] px-3.5 py-2 bg-amber-800 text-amber-100 hover:bg-amber-700 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Volume2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t.actions.listenAudio}</span>
            </button>

            <button
              onClick={() => setIsPartyModalOpen(true)}
              type="button"
              className="min-h-[44px] px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl text-xs font-bold text-amber-950 flex items-center gap-1"
            >
              <Plus className="w-4 h-4 text-amber-800" />
              <span>نیا کھاتہ دار</span>
            </button>
          </div>
        </div>

        {/* Khata Pair Selector (Farmer & Arhti) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-1">
          {/* Farmer Picker */}
          <div className="bg-white/90 p-3 rounded-2xl border border-stone-200">
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              🌾 کسان (Grower / Farmer):
            </label>
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-bold text-stone-900"
            >
              {farmersList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nameUr || f.name} ({f.village})
                </option>
              ))}
            </select>
          </div>

          {/* Arhti / Buyer Picker */}
          <div className="bg-white/90 p-3 rounded-2xl border border-stone-200">
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              ⚖️ آڑھتی / بیوپاری (Commission Agent / Buyer):
            </label>
            <select
              value={selectedArhtiId}
              onChange={(e) => setSelectedArhtiId(e.target.value)}
              className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-bold text-stone-900"
            >
              {arhtisList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nameUr || a.name} ({a.village})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Big Balance Card at Top: "You Owe / You Will Receive" in plain Urdu */}
      <div
        className={`rounded-3xl p-5 sm:p-6 border-3 shadow-lg transition-all ${
          netBalance > 0
            ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
            : netBalance < 0
            ? 'bg-rose-50 border-rose-500 text-rose-950'
            : 'bg-amber-50 border-amber-400 text-amber-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold opacity-80 block">
              موجودہ باہمی بقایا میزان (Current Net Balance)
            </span>
            <div className="text-2xl sm:text-4xl font-bold font-mono tracking-tight mt-1">
              <bdi dir="ltr">{formatPKR(Math.abs(netBalance), language)}</bdi>
            </div>
            <p className="text-sm sm:text-base font-bold font-urdu mt-2">
              {netBalance > 0 ? (
                <span>
                  آڑھتی نے کسان کو <bdi dir="ltr">{formatPKR(netBalance, language)}</bdi> ادا کرنے
                  ہیں (ہم نے لینے ہیں)
                </span>
              ) : netBalance < 0 ? (
                <span>
                  کسان کے ذمہ <bdi dir="ltr">{formatPKR(Math.abs(netBalance), language)}</bdi> واجب
                  الادا ہیں (ہم نے دینے ہیں)
                </span>
              ) : (
                <span>حساب بالکل برابر (صفر) ہے</span>
              )}
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col gap-2">
            <div className="text-xs font-semibold bg-white/80 p-2.5 rounded-xl border border-current/20">
              <span>کل جمع (فصل آمدن): </span>
              <bdi dir="ltr" className="font-bold font-mono">
                {formatPKR(totalCredit, language)}
              </bdi>
            </div>
            <div className="text-xs font-semibold bg-white/80 p-2.5 rounded-xl border border-current/20">
              <span>کل بنام (پیشگی/کٹوتیاں): </span>
              <bdi dir="ltr" className="font-bold font-mono">
                {formatPKR(totalDebit, language)}
              </bdi>
            </div>
          </div>
        </div>
      </div>

      {/* Main Single Action Button (Min 56px touch target) */}
      <div>
        <button
          onClick={() => {
            setEntryToEdit(null);
            setIsEntryModalOpen(true);
          }}
          type="button"
          className="w-full min-h-[58px] p-4 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98"
        >
          <Plus className="w-6 h-6 text-amber-300 shrink-0" />
          <span>کھاتے میں نیا اندراج درج کریں (پیشگی / کھاد / بولی / کٹوتی)</span>
        </button>
      </div>

      {/* "Know Your Numbers" Panel (Total advances, total deductions, effective cost of credit with transparent formula) */}
      <KnowYourNumbersPanel entries={entries} language={language} />

      {/* Export & Sharing Bar (WhatsApp, PDF / Print, CSV) */}
      <div className="parchment-slip rounded-2xl p-3.5 border border-amber-200 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-stone-700">اسٹیٹمنٹ برآمد و شیئرنگ:</span>
        <div className="flex items-center gap-2">
          {/* WhatsApp Share */}
          <button
            onClick={() => shareKhataWhatsApp(entries, activeFarmer, activeArhti, netBalance)}
            type="button"
            className="min-h-[44px] px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Share2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>واٹس ایپ اسٹیٹمنٹ</span>
          </button>

          {/* PDF / Print */}
          <button
            onClick={() => window.print()}
            type="button"
            className="min-h-[44px] px-3.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-stone-700 shrink-0" />
            <span>PDF / پرنٹ</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={() =>
              exportKhataCSV(
                entries,
                activeFarmer.nameUr || activeFarmer.name,
                activeArhti.nameUr || activeArhti.name
              )
            }
            type="button"
            className="min-h-[44px] px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-amber-800 shrink-0" />
            <span>ایکسل CSV ڈاؤن لوڈ</span>
          </button>
        </div>
      </div>

      {/* Filters & Search: Season, Entry Type, Person Search */}
      <div className="parchment-slip rounded-2xl p-4 border border-amber-200 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute top-3.5 start-3 text-stone-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="تفصیل، کھاد کا نام یا نوٹ سے تلاش کریں..."
            className="w-full h-11 ps-9 pe-3 rounded-xl border border-stone-300 bg-white text-sm"
          />
        </div>

        {/* Season & Type Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              سیزن منتخب کریں:
            </label>
            <select
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
              className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
            >
              <option value="all">تمام سیزن</option>
              <option value="سیزن آم 2026">سیزن آم 2026</option>
              <option value="خریف 2026 (کپاس / دھان)">خریف 2026 (کپاس / دھان)</option>
              <option value="ربیع 2026 (گندم)">ربیع 2026 (گندم)</option>
              <option value="سیزن کنو 2026">سیزن کنو 2026</option>
              <option value="سیزن کھجور 2026">سیزن کھجور 2026</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              اندراج کی قسم:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
            >
              <option value="all">تمام اقسام (All Entries)</option>
              <option value="advance_cash">پیشگی نقد ادھار</option>
              <option value="input_item">کھاد، بیج و اسپرے</option>
              <option value="sale_proceed">فصل نیلامی فروخت</option>
              <option value="deduction">منڈی کٹوتیاں</option>
              <option value="payment_received">نقد ادائیگی / وصولی</option>
            </select>
          </div>
        </div>
      </div>

      {/* Traditional Paper Khata Ledger Table */}
      {isLoadingEntries ? (
        <div className="parchment-slip rounded-3xl p-8 border-2 border-amber-300 text-center space-y-2 shadow-xs">
          <div className="w-8 h-8 border-4 border-[#78350F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-stone-800 text-sm font-urdu">
            کھاتہ اندراجات کلاؤڈ ڈیٹا بیس سے لوڈ ہو رہے ہیں، برائے مہربانی انتظار کیجیے...
          </p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <EmptyState
          title="کھاتے میں کوئی اندراج نہیں ملا"
          description="اس کسان اور آڑھتی کے درمیان اس فلٹر کے مطابق کوئی ریکارڈ نہیں ہے۔"
          actionLabel="نیا اندراج درج کریں"
          onAction={() => {
            setEntryToEdit(null);
            setIsEntryModalOpen(true);
          }}
          icon="📖"
        />
      ) : (
        <div className="parchment-slip rounded-3xl border-2 border-red-300 p-3 sm:p-6 shadow-md overflow-hidden print:m-0 print:border-none print:shadow-none">
          <div className="text-center pb-3 border-b-2 border-stone-800">
            <span className="text-[11px] uppercase tracking-widest text-stone-600 font-bold block">
              دفتر آڑھت و غلہ منڈی
            </span>
            <h3 className="text-2xl font-bold font-urdu text-stone-950">
              کھاتہ بنام: {activeFarmer.nameUr || activeFarmer.name}
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              آڑھتی: {activeArhti.nameUr || activeArhti.name} · سیزن:{' '}
              {filterSeason === 'all' ? 'تمام سیزنز' : filterSeason}
            </p>
          </div>

          {/* Ledger Table */}
          <div className="my-4 overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-red-50/90 border-y-2 border-stone-800 text-stone-900 font-bold">
                  <th className="py-2.5 px-2 text-start w-20">تاریخ</th>
                  <th className="py-2.5 px-2 text-start">تفصیل اندراج و جنس</th>
                  <th className="py-2.5 px-2 text-end text-rose-900 bg-rose-50/60 w-24 sm:w-32">
                    بنام (دیا)
                  </th>
                  <th className="py-2.5 px-2 text-end text-emerald-900 bg-emerald-50/60 w-24 sm:w-32">
                    جمع (لیا)
                  </th>
                  <th className="py-2.5 px-2 text-end text-stone-900 bg-amber-100/50 w-24 sm:w-32">
                    میزان بقایا
                  </th>
                  <th className="py-2.5 px-2 text-center w-28 print:hidden">باہمی تصدیق</th>
                  <th className="py-2.5 px-2 text-center w-16 print:hidden">عمل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-200 font-medium">
                {filteredEntries.map((entry) => {
                  const isBothConfirmed = entry.farmerConfirmed && entry.arhtiConfirmed;

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        !isBothConfirmed
                          ? 'bg-amber-50/90 border-l-4 border-amber-500'
                          : 'hover:bg-amber-50/40'
                      }`}
                    >
                      {/* Date */}
                      <td className="py-3 px-2 font-mono whitespace-nowrap text-stone-700">
                        <bdi dir="ltr">{entry.date}</bdi>
                      </td>

                      {/* Description & metadata */}
                      <td className="py-3 px-2 text-stone-900">
                        <div className="font-bold flex items-center gap-1.5 flex-wrap">
                          <span>{entry.description}</span>
                          {/* Unconfirmed Warning Badge */}
                          {!isBothConfirmed && (
                            <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-amber-800" />
                              <span>زیر تصدیق</span>
                            </span>
                          )}
                          {/* Photo Icon if attached */}
                          {entry.photoUrl && (
                            <button
                              onClick={() => setPhotoPreview(entry.photoUrl || null)}
                              type="button"
                              className="text-[10px] bg-stone-200 hover:bg-stone-300 text-stone-800 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold"
                              title="کاغذی پرچی تصویر دیکھیں"
                            >
                              <Eye className="w-3 h-3" />
                              <span>رسید ثبوت</span>
                            </button>
                          )}
                          {/* History Badge if edited */}
                          {entry.history && entry.history.length > 0 && (
                            <button
                              onClick={() => setViewingHistoryEntry(entry)}
                              type="button"
                              className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold hover:bg-amber-200"
                            >
                              <History className="w-3 h-3 text-amber-800" />
                              <span>ترمیم شدہ ({entry.history.length})</span>
                            </button>
                          )}
                        </div>

                        {entry.notes && (
                          <p className="text-[11px] text-stone-600 mt-0.5">{entry.notes}</p>
                        )}
                      </td>

                      {/* Debit (Given / Advance) */}
                      <td className="py-3 px-2 text-end font-mono font-bold text-rose-800 bg-rose-50/30 whitespace-nowrap">
                        {entry.debitPKR > 0 ? (
                          <bdi dir="ltr">{formatPKR(entry.debitPKR, language)}</bdi>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Credit (Received / Sale) */}
                      <td className="py-3 px-2 text-end font-mono font-bold text-emerald-800 bg-emerald-50/30 whitespace-nowrap">
                        {entry.creditPKR > 0 ? (
                          <bdi dir="ltr">{formatPKR(entry.creditPKR, language)}</bdi>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Running Balance */}
                      <td className="py-3 px-2 text-end font-mono font-bold text-stone-900 bg-amber-50/40 whitespace-nowrap">
                        <bdi dir="ltr">{formatPKR(Math.abs(entry.runningBalancePKR), language)}</bdi>
                        <span
                          className={`text-[9px] ms-1 block font-sans ${
                            entry.runningBalancePKR > 0 ? 'text-emerald-800' : 'text-rose-800'
                          }`}
                        >
                          {entry.runningBalancePKR > 0 ? 'جمع' : 'بنام'}
                        </span>
                      </td>

                      {/* Mutual Confirmations (Ticks for Farmer & Arhti) */}
                      <td className="py-3 px-2 text-center whitespace-nowrap print:hidden">
                        <div className="flex flex-col gap-1 items-center">
                          <button
                            type="button"
                            onClick={() => handleToggleConfirm(entry.id)}
                            className={`min-h-[32px] px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
                              currentRole === 'farmer'
                                ? entry.farmerConfirmed
                                  ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                                  : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-emerald-50'
                                : entry.arhtiConfirmed
                                ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                                : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-emerald-50'
                            }`}
                            title="کلک کر کے تصدیق ٹوگل کریں"
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                (currentRole === 'farmer' && entry.farmerConfirmed) ||
                                (currentRole !== 'farmer' && entry.arhtiConfirmed)
                                  ? 'text-emerald-700'
                                  : 'text-stone-400'
                              }`}
                            />
                            <span>
                              {currentRole === 'farmer'
                                ? entry.farmerConfirmed
                                  ? 'میری تصدیق شدہ ✓'
                                  : 'تصدیق کریں'
                                : entry.arhtiConfirmed
                                ? 'میری تصدیق شدہ ✓'
                                : 'تصدیق کریں'}
                            </span>
                          </button>

                          <div className="text-[9px] text-stone-500">
                            کسان: {entry.farmerConfirmed ? '✓' : '✗'} · آڑھتی:{' '}
                            {entry.arhtiConfirmed ? '✓' : '✗'}
                          </div>
                        </div>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3 px-2 text-center whitespace-nowrap print:hidden">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(entry)}
                            type="button"
                            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 flex items-center justify-center transition-colors"
                            title="ترمیم کریں"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            type="button"
                            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-900 flex items-center justify-center transition-colors"
                            title="حذف کریں"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-amber-100/90 border-t-2 border-stone-800 font-bold text-xs sm:text-sm">
                  <td colSpan={2} className="py-3 px-2 text-start font-urdu text-stone-900">
                    میزان ٹوٹل (Total Tally)
                  </td>
                  <td className="py-3 px-2 text-end font-mono text-rose-900 bg-rose-100/70">
                    <bdi dir="ltr">{formatPKR(totalDebit, language)}</bdi>
                  </td>
                  <td className="py-3 px-2 text-end font-mono text-emerald-900 bg-emerald-100/70">
                    <bdi dir="ltr">{formatPKR(totalCredit, language)}</bdi>
                  </td>
                  <td colSpan={3} className="py-3 px-2 text-end font-mono text-stone-950">
                    بقایا:{' '}
                    <bdi dir="ltr">{formatPKR(Math.abs(netBalance), language)}</bdi>{' '}
                    ({netBalance >= 0 ? 'جمع' : 'بنام'})
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bottom Seal & Signatures */}
          <div className="mt-4 pt-3 border-t-2 border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-stone-600">
              <p className="font-bold">دستخط کسان و آڑھتی برائے باہمی تصدیق</p>
              <div className="flex gap-8 mt-6">
                <div>
                  <div className="w-28 border-b-2 border-stone-700" />
                  <p className="text-[10px] text-stone-500 mt-1">دستخط کسان</p>
                </div>
                <div>
                  <div className="w-28 border-b-2 border-stone-700" />
                  <p className="text-[10px] text-stone-500 mt-1">دستخط آڑھتی</p>
                </div>
              </div>
            </div>

            <div className="self-center">
              <StampSeal
                date={new Date().toLocaleDateString('en-GB')}
                color="indigo"
                label="مہر تصدیق کھاتہ"
                subLabel="منظور شدہ باہمی حساب"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <KhataEntryModal
        isOpen={isEntryModalOpen}
        onClose={async () => {
          setIsEntryModalOpen(false);
          setEntryToEdit(null);
          await loadPairEntries();
        }}
        entryToEdit={entryToEdit}
        farmer={activeFarmer}
        arhti={activeArhti}
      />

      <AddPartyModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
      />

      {/* Photo Preview Modal */}
      {photoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl p-4 shadow-2xl relative border-4 border-[#78350F]">
            <button
              onClick={() => setPhotoPreview(null)}
              className="absolute top-3 end-3 w-9 h-9 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center"
            >
              ✕
            </button>
            <h4 className="font-bold text-stone-900 mb-2">کاغذی پرچی یا رسید کا ثبوت</h4>
            <img
              src={photoPreview}
              alt="Slip"
              className="w-full max-h-[70vh] object-contain rounded-2xl border"
            />
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {viewingHistoryEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-[#FFFDF7] rounded-3xl p-5 shadow-2xl border-4 border-[#78350F]">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200 mb-3">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <History className="w-5 h-5 text-amber-800" />
                <span>اندراج کی تفصیلی ترمیمی تاریخ</span>
              </div>
              <button
                onClick={() => setViewingHistoryEntry(null)}
                className="w-8 h-8 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {viewingHistoryEntry.history.map((h) => (
                <div key={h.id} className="p-3 bg-white rounded-xl border border-amber-200 text-xs">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>{h.editedByName} ({h.editedByRole})</span>
                    <bdi dir="ltr">{h.timestamp}</bdi>
                  </div>
                  <p className="text-stone-700 mt-1 font-semibold">{h.changeSummary}</p>
                  <p className="text-stone-500 mt-0.5">
                    سابقہ رقم: Rs. {h.previousAmount.toLocaleString('en-US')} ➔ نئی رقم: Rs.{' '}
                    {h.newAmount.toLocaleString('en-US')}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setViewingHistoryEntry(null)}
              className="w-full mt-4 h-11 bg-[#78350F] text-amber-50 font-bold rounded-xl text-xs"
            >
              بند کریں
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
