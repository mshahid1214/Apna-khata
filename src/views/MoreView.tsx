import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { APP_NAME, LEGAL_FOOTER_NOTE, LEGAL_FOOTER_NOTE_UR } from '../constants/app';
import { ROLE_KEYS } from '../constants/app';
import { Role, Language } from '../types';
import {
  Globe,
  ShieldCheck,
  RotateCcw,
  Volume2,
  Download,
  Info,
  HelpCircle,
  Database,
  Check,
  Lock,
} from 'lucide-react';

export const MoreView: React.FC = () => {
  const {
    language,
    setLanguage,
    currentRole,
    setCurrentRole,
    resetAllSampleData,
    reopenIntro,
    t,
    speak,
    isPWAInstallable,
    isPWAInstalled,
    triggerPWAInstall,
    userProfile,
    setIsAuthModalOpen,
    setIsAdminModalOpen,
    exportMyDataCSV,
    deleteMyAccountAndData,
  } = useApp();

  const [resetMessage, setResetMessage] = useState('');
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const handleTestSpeech = () => {
    speak(
      'السلام علیکم! اپنا کھاتہ میں خوش آمدید۔ آپ کا صوتی معاون بالکل درست کام کر رہا ہے۔',
      'Assalam-o-Alaikum! Apna Khata mein khush aamdeed. Aapka voice assistant theek kaam kar raha hai.',
      'Welcome to Apna Khata. Your voice assistant is working properly.'
    );
  };

  const handleResetData = async () => {
    if (window.confirm(t.more.sampleDataResetConfirm)) {
      await resetAllSampleData();
      setResetMessage('تمام نمونہ ڈیٹا بحال کر دیا گیا۔');
      speak('تمام نمونہ ڈیٹا دوبارہ سیٹ کر دیا گیا۔');
      setTimeout(() => setResetMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header */}
      <div className="parchment-slip rounded-3xl p-5 border-2 border-amber-300 shadow-md">
        <span className="text-xs uppercase tracking-wider text-stone-600 font-semibold">
          سیٹنگز و اختیارات
        </span>
        <h2 className="text-2xl font-bold font-urdu text-stone-900">{t.more.title}</h2>
        <p className="text-xs text-stone-600 mt-1">{t.more.aboutBody}</p>
      </div>

      {/* Role Switcher Section */}
      <div className="parchment-slip rounded-2xl p-4 border border-amber-200 space-y-2.5">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-amber-800" />
          <span>{t.more.activeRole}</span>
        </div>
        <p className="text-xs text-stone-600">
          منڈی کے مختلف شرکاء کا نظریہ دیکھنے کے لیے کردار تبدیل کیجیے:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {ROLE_KEYS.map((rk: Role) => {
            const info = t.roles[rk];
            const isSelected = currentRole === rk;
            return (
              <button
                key={rk}
                onClick={() => setCurrentRole(rk)}
                type="button"
                className={`min-h-[52px] p-3 rounded-xl border-2 text-start transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#78350F] bg-amber-100 text-amber-950 font-bold shadow-xs'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div>
                  <span className="text-sm font-bold block">{info.title}</span>
                  <span className="text-[11px] text-stone-500 font-normal">{info.badge}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#78350F] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language Selection */}
      <div className="parchment-slip rounded-2xl p-4 border border-amber-200 space-y-2.5">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <Globe className="w-5 h-5 text-amber-800" />
          <span>{t.more.languageSelect}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { code: 'ur' as Language, label: 'اردو', sub: 'دائیں سے بائیں (RTL)' },
            { code: 'ur-Latn' as Language, label: 'Roman Urdu', sub: 'English Script' },
            { code: 'en' as Language, label: 'English', sub: 'Standard LTR' },
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => setLanguage(item.code)}
              type="button"
              className={`min-h-[56px] p-2.5 rounded-xl border-2 text-center transition-all ${
                language === item.code
                  ? 'border-[#78350F] bg-amber-100 text-amber-950 font-bold shadow-xs'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span className="text-sm font-bold block">{item.label}</span>
              <span className="text-[10px] text-stone-500 block leading-tight">{item.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Synthesis Test */}
      <div className="parchment-slip rounded-2xl p-4 border border-amber-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Volume2 className="w-5 h-5 text-amber-800" />
            <span>{t.more.audioVoiceTest}</span>
          </div>
          <button
            onClick={handleTestSpeech}
            type="button"
            className="min-h-[44px] px-4 py-2 bg-amber-800 hover:bg-amber-700 text-amber-50 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            {t.more.testSpeech}
          </button>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          اگر آپ کے براؤزر میں مقامی اردو آواز موجود نہ ہو تو یہ خود بخود رومن اردو صوتی موڈ پر منتقل ہو جاتی ہے۔
        </p>
      </div>

      {/* PWA & Home Screen Install */}
      <div className="parchment-slip rounded-2xl p-4 border border-amber-200 space-y-2.5">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <Download className="w-5 h-5 text-amber-800" />
          <span>موبائل ایپ انسٹالیشن (PWA)</span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          {t.more.installPrompt}
        </p>

        {isPWAInstalled ? (
          <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-950 text-xs font-bold">
            ✓ ایپ پہلے سے ہوم اسکرین پر نصب شدہ ہے۔
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            {isPWAInstallable ? (
              <button
                onClick={() => triggerPWAInstall()}
                type="button"
                className="min-h-[50px] px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors"
              >
                {t.actions.installApp}
              </button>
            ) : (
              <button
                onClick={() => setShowIOSGuide(true)}
                type="button"
                className="min-h-[50px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors"
              >
                آئی فون / سفاری پر انسٹال کرنے کا طریقہ
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Account & Cloud Sync Status */}
      <div className="parchment-slip rounded-2xl p-4 border border-amber-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-amber-800" />
            <span>صارف اکاؤنٹ و لائیو کلاؤڈ کھاتہ</span>
          </div>
          {userProfile?.isVerified && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold">
              ✓ مصدقہ آپریٹر
            </span>
          )}
        </div>

        {userProfile ? (
          <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">{userProfile.name}</h4>
                <p className="text-xs text-stone-500 font-mono">
                  {userProfile.phone} · {userProfile.district}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 text-xs font-bold font-urdu">
                {t.roles[userProfile.role]?.title || userProfile.role}
              </span>
            </div>

            <div className="pt-2 border-t border-stone-100 flex gap-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                type="button"
                className="flex-1 min-h-[40px] px-3 bg-amber-100 hover:bg-amber-200 text-[#78350F] rounded-xl text-xs font-bold transition-colors"
              >
                پروفائل میں ترمیم / سوئچ کریں
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <p className="text-xs font-bold text-stone-900">
                مشترکہ ڈیٹا بیس میں لاگ ان نہیں ہیں۔
              </p>
              <p className="text-[11px] text-stone-600">
                فون نمبر کے ذریعے لاگ ان کر کے کسان اور آڑھتی کے مشترکہ ریکارڈ تک رسائی حاصل کریں۔
              </p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              type="button"
              className="min-h-[44px] px-5 bg-[#78350F] hover:bg-[#602a0c] text-amber-50 rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              فون نمبر / گوگل سے لاگ ان کریں
            </button>
          </div>
        )}
      </div>

      {/* PRIVACY & DATA PROTECTION CONTROLS (GDPR & Mandi Trust) */}
      <div className="parchment-slip rounded-2xl p-4 border border-amber-200 space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-800" />
          <span>پرائیویسی و ڈیٹا حقوق (Privacy & Data Rights)</span>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-xs text-stone-700 space-y-1">
          <div className="font-bold text-emerald-950 flex items-center gap-1.5">
            <span>✓ شناختی کارڈ کی عدم وصولی کی قانونی ضمانت</span>
          </div>
          <p className="leading-relaxed">
            ہم صرف نام، فون نمبر، کردار اور ضلع جمع کرتے ہیں۔ <strong>یہ ایپلیکیشن کسی بھی وقت کسان یا تاجر سے شناختی کارڈ (CNIC) یا کوئی نجی دستاویزات طلب نہیں کرتی۔</strong> تمام ٹرانزیکشنز مکمل طور پر رضاکارانہ ہیں۔
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          {/* Export my data (CSV) */}
          <button
            onClick={async () => {
              await exportMyDataCSV();
              speak('آپ کا ڈیٹا برآمد کر کے فائل ڈاؤن لوڈ کر دی گئی ہے۔');
            }}
            type="button"
            className="flex-1 min-h-[48px] px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-100" />
            <span>میرا ڈیٹا برآمد کریں (Export CSV)</span>
          </button>

          {/* Delete my account and data */}
          <button
            onClick={async () => {
              if (window.confirm('کیا آپ واقعی اپنا اکاؤنٹ اور تمام ذاتی ڈیٹا مستقل طور پر حذف کرنا چاہتے ہیں؟ اس عمل کو واپس نہیں لایا جا سکے گا۔')) {
                await deleteMyAccountAndData();
                speak('آپ کا اکاؤنٹ اور ذاتی ڈیٹا مستقل طور پر حذف کر دیا گیا۔');
              }
            }}
            type="button"
            className="flex-1 min-h-[48px] px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-rose-700" />
            <span>میرا اکاؤنٹ اور ڈیٹا حذف کریں</span>
          </button>
        </div>
      </div>

      {/* Admin Console Access */}
      <div className="parchment-slip rounded-2xl p-4 border border-amber-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Lock className="w-5 h-5 text-amber-800" />
            <span>انتظامی کنسول (Admin Console)</span>
          </div>
          <button
            onClick={() => setIsAdminModalOpen(true)}
            type="button"
            className="min-h-[44px] px-4 py-2 bg-stone-800 hover:bg-stone-900 text-stone-100 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            ایڈمن کنسول کھولیں
          </button>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          کولڈ اسٹوریج آپریٹرز اور آڑھتیوں کی جانچ و تصدیق، اور منڈی کے لائیو اعداد و شمار کے معائنے کے لیے مجاز ایڈمن اکاؤنٹ کے ذریعے محفوظ ہے۔
        </p>
      </div>

      {/* Relaunch First-Run Walkthrough & Sample Reset */}
      <div className="parchment-slip rounded-2xl p-4 border border-amber-200 space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <Database className="w-5 h-5 text-amber-800" />
          <span>ڈیٹا اور تعارفی گائیڈ</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={reopenIntro}
            type="button"
            className="flex-1 min-h-[48px] px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-stone-600" />
            <span>3 نکاتی تصویری تعارف دوبارہ دیکھیں</span>
          </button>

          <button
            onClick={handleResetData}
            type="button"
            className="flex-1 min-h-[48px] px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-rose-700" />
            <span>{t.more.resetSampleData}</span>
          </button>
        </div>

        {resetMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold">
            {resetMessage}
          </div>
        )}
      </div>

      {/* Mandatory Legal Footer Note */}
      <div className="parchment-slip rounded-2xl p-4 border-2 border-stone-300 text-center shadow-xs">
        <p className="text-xs sm:text-sm font-urdu font-bold text-stone-800">
          "{LEGAL_FOOTER_NOTE_UR}"
        </p>
        <p className="text-[11px] text-stone-500 mt-1">
          "{LEGAL_FOOTER_NOTE}"
        </p>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border-4 border-[#78350F]">
            <h3 className="text-lg font-bold text-stone-900">آئی فون پر انسٹالیشن</h3>
            <p className="mt-2 text-xs text-stone-600 leading-relaxed">
              1. سفاری کے نیچے موجود <strong>Share (شیئر)</strong> بٹن پر کلک کیجیے۔<br />
              2. نیچے اسکرول کر کے <strong>Add to Home Screen (ہوم اسکرین پر شامل کریں)</strong> منتخب کیجیے۔
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full h-11 rounded-xl bg-[#78350F] text-amber-50 font-bold text-xs"
            >
              سمجھ آ گئی (بند کریں)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
