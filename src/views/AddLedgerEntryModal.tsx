import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Party } from '../types';
import { BookOpen, X } from 'lucide-react';
import { formatDateDDMMYYYY } from '../services/formatters';

export const AddLedgerEntryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  defaultParty?: Party;
}> = ({ isOpen, onClose, defaultParty }) => {
  const { parties, createLedgerEntry, t, speak } = useApp();
  const [selectedPartyId, setSelectedPartyId] = useState(defaultParty ? defaultParty.id : parties[0]?.id || '');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDateDDMMYYYY());
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const party = parties.find((p) => p.id === selectedPartyId);
    if (!party) {
      setError(t.errors.nameRequired);
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError(t.errors.validAmount);
      speak(t.errors.validAmount);
      return;
    }

    const debitPKR = type === 'debit' ? val : 0;
    const creditPKR = type === 'credit' ? val : 0;
    const prevBalance = party.currentBalance;
    const newBalance = prevBalance + (creditPKR - debitPKR);

    await createLedgerEntry({
      date,
      partyId: party.id,
      partyName: party.nameUr || party.name,
      description: description.trim() || (type === 'debit' ? 'نقد ادائیگی' : 'رقم وصولی / فصل جمع'),
      debitPKR,
      creditPKR,
      balancePKR: newBalance,
      isSample: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg parchment-slip rounded-3xl p-6 shadow-2xl border-4 border-[#78350F] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-urdu text-stone-900">{t.actions.addLedgerEntry}</h3>
              <p className="text-xs text-stone-600">بہی کھاتے میں بنام یا جمع اندراج</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Party Selection */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1">
              کھاتہ دار منتخب کریں *
            </label>
            <select
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-base font-semibold"
            >
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameUr || p.name} ({p.village})
                </option>
              ))}
            </select>
          </div>

          {/* Type Toggle: بنام (Debit) vs جمع (Credit) */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1">
              اندراج کی قسم
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('debit')}
                className={`min-h-[56px] rounded-2xl border-2 font-bold text-sm sm:text-base flex flex-col items-center justify-center transition-all ${
                  type === 'debit'
                    ? 'border-rose-700 bg-rose-100 text-rose-950 shadow-sm'
                    : 'border-stone-200 bg-white text-stone-700'
                }`}
              >
                <span>{t.khata.debit}</span>
                <span className="text-[11px] font-normal text-rose-800">ہم نے دیے / پیشگی رقم</span>
              </button>

              <button
                type="button"
                onClick={() => setType('credit')}
                className={`min-h-[56px] rounded-2xl border-2 font-bold text-sm sm:text-base flex flex-col items-center justify-center transition-all ${
                  type === 'credit'
                    ? 'border-emerald-700 bg-emerald-100 text-emerald-950 shadow-sm'
                    : 'border-stone-200 bg-white text-stone-700'
                }`}
              >
                <span>{t.khata.credit}</span>
                <span className="text-[11px] font-normal text-emerald-800">ہم نے لیے / مالیت فصل</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1">
              رقم (روپے) *
            </label>
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

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1">
              تفصیل / وجہ ادائیگی
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً: نقد ایڈوانس، ڈیزل خرچ، بینک ٹرانسفر"
              className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-base"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1">
              تاریخ (DD/MM/YYYY)
            </label>
            <input
              type="text"
              dir="ltr"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-mono"
            />
          </div>

          <div className="pt-4 border-t border-amber-200 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[56px] rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-sm"
            >
              {t.actions.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[56px] rounded-2xl bg-[#78350F] hover:bg-amber-900 text-amber-50 font-bold text-base shadow-md"
            >
              {t.actions.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
