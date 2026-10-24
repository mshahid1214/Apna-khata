import React, { useState } from 'react';
import { SaleSlip, Role } from '../types';
import { AlertOctagon, X } from 'lucide-react';
import { saleSlipRepository } from '../repositories/saleSlipRepository';

interface CancelSlipModalProps {
  slip: SaleSlip | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelled: () => void;
  userRole: Role;
  userName: string;
}

export const CancelSlipModal: React.FC<CancelSlipModalProps> = ({
  slip,
  isOpen,
  onClose,
  onCancelled,
  userRole,
  userName,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !slip) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('منسوخی کی واضح وجہ درج کرنا لازمی ہے۔');
      return;
    }

    await saleSlipRepository.cancelSlip(slip.id, reason.trim(), userRole, userName);
    onCancelled();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="max-w-md w-full bg-[#FFFDF7] rounded-3xl p-6 shadow-2xl border-4 border-rose-600 animate-in fade-in zoom-in-95 text-stone-900">
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
          <div className="flex items-center gap-2 text-rose-800">
            <AlertOctagon className="w-6 h-6 shrink-0" />
            <h3 className="text-xl font-bold font-urdu text-stone-900">پرچی کی منسوخی</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-950 leading-relaxed">
            <strong>اہم نوٹ:</strong> منسوخ شدہ پرچی ڈیلیٹ نہیں ہوگی بلکہ اس پر باقاعدہ سرخ <strong>"منسوخ شدہ (Cancelled)"</strong> مہر لگ جائے گی تاکہ شفاف ریکارڈ برقرار رہے۔
          </div>

          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-500">سریل نمبر:</span>
              <span className="font-mono font-bold">{slip.serialNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">کسان:</span>
              <span className="font-bold">{slip.farmerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">خالص رقم:</span>
              <span className="font-mono font-bold text-rose-800">
                Rs. {slip.netPayable.toLocaleString('en-US')}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              منسوخی کی تفصیلی وجہ درج کیجیے *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="مثلاً: گاڑی کا وزن کانٹا دوبارہ کروانے پر فرق آیا، یا سودا منسوخ ہوا..."
              className="w-full p-2.5 rounded-xl border-2 border-stone-300 focus:border-rose-600 bg-white text-xs"
            />
            {error && <span className="text-xs text-rose-700 font-bold mt-1 block">{error}</span>}
          </div>

          <div className="pt-3 border-t border-amber-200 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[48px] rounded-xl bg-stone-200 text-stone-800 font-bold text-xs"
            >
              واپس
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[48px] rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md"
            >
              منسوخی کی تصدیق کریں
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
