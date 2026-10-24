import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { ROLE_KEYS } from '../constants/app';
import { UserPlus, X } from 'lucide-react';

export const AddPartyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { createParty, t, speak } = useApp();
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('farmer');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [balanceType, setBalanceType] = useState<'payable' | 'receivable'>('payable');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.errors.nameRequired);
      speak(t.errors.nameRequired);
      return;
    }

    const bal = parseFloat(initialBalance) || 0;
    const finalBalance = balanceType === 'payable' ? bal : -bal;

    await createParty({
      name: name.trim(),
      nameUr: name.trim(),
      role,
      village: village.trim() || 'غلہ منڈی ایریا',
      phone: phone.trim() || '0300-5550000',
      currentBalance: finalBalance,
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
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-urdu text-stone-900">{t.actions.addParty}</h3>
              <p className="text-xs text-stone-600">نیا کسان، آڑھتی یا بیوپاری کھاتہ</p>
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

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1">
              کھاتہ دار کا نام *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="مثلاً: چوہدری اصغر علی، ملک فرید"
              className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-base font-semibold"
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1">
              منڈی میں کردار
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROLE_KEYS.map((rk) => (
                <button
                  key={rk}
                  type="button"
                  onClick={() => setRole(rk)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-bold transition-all text-start ${
                    role === rk
                      ? 'border-[#78350F] bg-amber-100 text-amber-950 shadow-xs'
                      : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  {t.roles[rk].title}
                </button>
              ))}
            </div>
          </div>

          {/* Village & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-stone-800 mb-1">
                گاؤں / چک / شہر
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="مثلاً: بستی ملوک، ملتان"
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-800 mb-1">
                موبائل فون نمبر
              </label>
              <input
                type="text"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-mono"
              />
            </div>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1">
              ابتدائی بقایا رقم (اگر پہلے کا بقایا ہو)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                dir="ltr"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0"
                className="flex-1 h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-base font-bold font-mono"
              />
              <button
                type="button"
                onClick={() => setBalanceType(balanceType === 'payable' ? 'receivable' : 'payable')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border-2 shrink-0 ${
                  balanceType === 'payable'
                    ? 'border-emerald-600 bg-emerald-100 text-emerald-950'
                    : 'border-rose-600 bg-rose-100 text-rose-950'
                }`}
              >
                {balanceType === 'payable' ? t.khata.youOwe : t.khata.theyOwe}
              </button>
            </div>
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
