import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getAdminSystemCounts, setOperatorVerification, checkIsAdmin } from '../services/firebase';
import { UserProfile } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Warehouse,
  RefreshCw,
  X,
  BadgeCheck,
  Lock,
  UserX,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const { user, speak, setIsAuthModalOpen } = useApp();
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [stats, setStats] = useState<{
    totalUsers: number;
    farmers: number;
    arhtis: number;
    operators: number;
    transporters: number;
    buyers: number;
    unverifiedOperators: number;
    usersList: UserProfile[];
  }>({
    totalUsers: 0,
    farmers: 0,
    arhtis: 0,
    operators: 0,
    transporters: 0,
    buyers: 0,
    unverifiedOperators: 0,
    usersList: [],
  });

  const checkAuthorization = async () => {
    setIsCheckingAuth(true);
    try {
      const authorized = await checkIsAdmin(user);
      setIsAdminAuthorized(authorized);
      if (authorized) {
        await loadAdminData();
      }
    } catch (err) {
      console.warn('[AdminPanel] Authorization check note:', err);
      setIsAdminAuthorized(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminSystemCounts();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkAuthorization();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleToggleVerification = async (targetUser: UserProfile) => {
    const newStatus = !targetUser.isVerified;
    try {
      await setOperatorVerification(targetUser.id, newStatus);
      setStats((prev) => ({
        ...prev,
        usersList: prev.usersList.map((u) =>
          u.id === targetUser.id ? { ...u, isVerified: newStatus } : u
        ),
      }));
      speak(
        newStatus
          ? `${targetUser.name} کو بطور مصدقہ آپریٹر منظور کر لیا گیا۔`
          : `${targetUser.name} کی تصدیق منسوخ کر دی گئی۔`
      );
    } catch (err) {
      console.error('Failed to update operator status:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-5">
      <div className="max-w-2xl w-full parchment-slip rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-[#78350F] max-h-[90vh] overflow-y-auto text-stone-900 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 end-4 w-9 h-9 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center hover:bg-stone-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center pb-3 border-b-2 border-stone-800 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-[#78350F] font-bold text-xs mb-2">
            <ShieldAlert className="w-4 h-4 text-amber-800" />
            <span>محفوظ انتظامی ڈیش بورڈ (Admin Access)</span>
          </div>
          <h3 className="text-2xl font-bold font-urdu text-stone-900">
            ایڈمن و سپروائزر کنسول
          </h3>
          <p className="text-xs text-stone-600 mt-1">
            کولڈ اسٹوریج آپریٹرز اور آڑھتیوں کی باضابطہ تصدیق و مجموعی اعداد و شمار
          </p>
        </div>

        {isCheckingAuth ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#78350F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-stone-700 font-urdu">
              ایڈمن اجازت نامہ کی تصدیق ہو رہی ہے...
            </p>
          </div>
        ) : !isAdminAuthorized ? (
          /* Access Denied Screen */
          <div className="max-w-md mx-auto text-center space-y-4 py-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 border-2 border-rose-400 flex items-center justify-center text-rose-800 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-rose-900 font-urdu">
                رسائی ممنوع: ایڈمن اکاؤنٹ درکار ہے
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                اس کنسول تک رسائی صرف مجاز ایڈمن یوزر آئی ڈی یا منظور شدہ سرٹیفائیڈ اکاونٹ کے ذریعے ممکن ہے۔ کوئی غیراخلاقی ہارڈ کوڈڈ پن استعمال نہیں کیا جاتا۔
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsAuthModalOpen(true);
                }}
                className="flex-1 min-h-[46px] bg-[#78350F] hover:bg-[#602a0c] text-amber-50 font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                ایڈمن اکاؤنٹ سے سائن ان کریں
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[46px] px-5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors"
              >
                بند کریں
              </button>
            </div>
          </div>
        ) : (
          /* Authorized Admin Console */
          <div className="space-y-5">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-900">
                  ایڈمن اجازت نامہ تصدیق شدہ
                </span>
              </div>

              <button
                onClick={loadAdminData}
                disabled={isLoading}
                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>ریفریش</span>
              </button>
            </div>

            {/* Basic Counts Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 font-bold block">کل رجسٹرڈ صارفین</span>
                <span className="text-2xl font-mono font-bold text-stone-900">
                  {stats.totalUsers}
                </span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-300 shadow-2xs">
                <span className="text-[11px] text-emerald-800 font-bold block">کسان (Farmers)</span>
                <span className="text-2xl font-mono font-bold text-emerald-950">
                  {stats.farmers}
                </span>
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-300 shadow-2xs">
                <span className="text-[11px] text-amber-800 font-bold block">آڑھتی (Commission)</span>
                <span className="text-2xl font-mono font-bold text-amber-950">
                  {stats.arhtis}
                </span>
              </div>

              <div className="bg-sky-50 p-3 rounded-2xl border border-sky-300 shadow-2xs">
                <span className="text-[11px] text-sky-800 font-bold block">کولڈ اسٹوریج آپریٹرز</span>
                <span className="text-2xl font-mono font-bold text-sky-950">
                  {stats.operators}
                </span>
              </div>

              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-300 shadow-2xs">
                <span className="text-[11px] text-purple-800 font-bold block">ٹرانسپورٹرز</span>
                <span className="text-2xl font-mono font-bold text-purple-950">
                  {stats.transporters}
                </span>
              </div>

              <div className="bg-stone-100 p-3 rounded-2xl border border-stone-300 shadow-2xs">
                <span className="text-[11px] text-stone-600 font-bold block">خریدار و بیوپاری</span>
                <span className="text-2xl font-mono font-bold text-stone-900">
                  {stats.buyers}
                </span>
              </div>
            </div>

            {/* Operator Verification Console */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-stone-300">
                <h4 className="font-bold text-stone-900 font-urdu text-base flex items-center gap-1.5">
                  <Warehouse className="w-5 h-5 text-[#78350F]" />
                  <span>آپریٹر و آڑھت تصدیقی فہرست (Verification List)</span>
                </h4>
                <span className="text-xs font-mono font-bold text-stone-600">
                  {stats.usersList.length} ریکارڈز
                </span>
              </div>

              {stats.usersList.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500 bg-white rounded-2xl border border-dashed border-stone-300">
                  ابھی کوئی نیا صارف ڈیٹا بیس میں موجود نہیں ہے۔
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.usersList.map((usr) => (
                    <div
                      key={usr.id}
                      className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">{usr.name}</span>
                          {usr.isVerified ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-bold">
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>مصدقہ</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 border border-stone-300 text-stone-600 text-[10px] font-bold">
                              غیر تصدیق شدہ
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-stone-600 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>
                            <strong>کردار:</strong> {usr.role}
                          </span>
                          <span>
                            <strong>فون:</strong> <bdi dir="ltr">{usr.phone}</bdi>
                          </span>
                          <span>
                            <strong>ضلع:</strong> {usr.district}
                          </span>
                        </div>
                      </div>

                      {/* Verification Toggle (Admin Only) */}
                      <div className="shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleToggleVerification(usr)}
                          className={`min-h-[40px] px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                            usr.isVerified
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {usr.isVerified ? (
                            <>
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>منسوخ کریں</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>تصدیق کریں</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="pt-3 border-t border-stone-300 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors"
              >
                کنسول بند کریں
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
