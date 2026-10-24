import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { APP_NAME_URDU, APP_NAME_SHORT, ROLE_KEYS } from '../constants/app';
import { Role, Language } from '../types';
import { Volume2, VolumeX, ShieldCheck, Download, Globe, ChevronDown, Check, ShieldAlert } from 'lucide-react';

export const Header: React.FC<{ onReadAloud?: () => void }> = ({ onReadAloud }) => {
  const {
    language,
    setLanguage,
    currentRole,
    setCurrentRole,
    t,
    isSpeaking,
    stopSpeech,
    isOnline,
    isPWAInstallable,
    isPWAInstalled,
    triggerPWAInstall,
    userProfile,
    setIsAuthModalOpen,
    setIsAdminModalOpen,
  } = useApp();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const roleInfo = t.roles[currentRole];

  const handleSpeakerClick = () => {
    if (isSpeaking) {
      stopSpeech();
    } else if (onReadAloud) {
      onReadAloud();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#78350F] text-amber-50 shadow-md border-b-2 border-amber-800">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Wordmark Zone */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-900 border border-amber-600 flex items-center justify-center text-amber-200 shrink-0 font-bold shadow-inner">
            <span className="text-xl leading-none">کھ</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight font-urdu">
                {language === 'ur' ? APP_NAME_URDU : APP_NAME_SHORT}
              </h1>
            </div>
            <p className="text-[11px] text-amber-200/90 font-medium tracking-wide">
              {roleInfo.badge}
            </p>
          </div>
        </div>

        {/* Action Controls & Role Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Read Aloud Button (Min 56px touch target area) */}
          <button
            onClick={handleSpeakerClick}
            type="button"
            className={`min-h-[44px] min-w-[44px] sm:px-3 sm:py-2 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold transition-all shadow-sm ${
              isSpeaking
                ? 'bg-amber-400 text-amber-950 animate-pulse ring-2 ring-white'
                : 'bg-amber-800/80 hover:bg-amber-700 text-amber-100 border border-amber-600/50'
            }`}
            title={isSpeaking ? t.actions.stopAudio : t.actions.listenAudio}
            aria-label={isSpeaking ? t.actions.stopAudio : t.actions.listenAudio}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-5 h-5 text-amber-950 shrink-0" />
                <span className="hidden sm:inline text-xs font-bold">{t.actions.stopAudio}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-amber-200 shrink-0" />
                <span className="hidden sm:inline text-xs font-bold">{t.actions.listenAudio}</span>
              </>
            )}
          </button>

          {/* User Account & Login Trigger */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            type="button"
            className="min-h-[44px] px-2.5 py-1.5 bg-amber-900/90 hover:bg-amber-800 border border-amber-600/80 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-100 shadow-sm transition-colors"
            title="صارف اکاؤنٹ و لاگ ان"
          >
            <div className="w-5 h-5 rounded-full bg-amber-700 flex items-center justify-center text-[10px] text-amber-200">
              {userProfile ? '👤' : '🔑'}
            </div>
            <span className="truncate max-w-[85px] sm:max-w-none">
              {userProfile ? userProfile.name.split(' ')[0] : 'لاگ ان'}
            </span>
            {userProfile?.isVerified && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="تصدیق شدہ" />
            )}
          </button>

          {/* Admin Console Trigger */}
          <button
            onClick={() => setIsAdminModalOpen(true)}
            type="button"
            className="min-h-[44px] min-w-[44px] px-2 rounded-xl bg-amber-900/60 hover:bg-amber-800 border border-amber-600/50 flex items-center justify-center text-xs font-bold text-amber-200 transition-colors"
            title="ایڈمن کنسول"
            aria-label="Admin Console"
          >
            <ShieldAlert className="w-4 h-4 text-amber-300" />
          </button>

          {/* Role Switcher Button */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            type="button"
            className="min-h-[44px] px-2.5 py-1.5 bg-amber-900/90 hover:bg-amber-800 border border-amber-600/80 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-100 shadow-sm transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate max-w-[85px] sm:max-w-none">{roleInfo.badge}</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          </button>

          {/* Language Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              type="button"
              className="min-h-[44px] min-w-[44px] px-2 rounded-xl bg-amber-900/60 hover:bg-amber-800 border border-amber-600/50 flex items-center justify-center text-xs font-bold text-amber-200 transition-colors"
              title="Language"
            >
              <Globe className="w-4 h-4" />
              <span className="ms-1 uppercase">{language === 'ur-Latn' ? 'ROM' : language}</span>
            </button>

            {isLangMenuOpen && (
              <div
                className={`absolute top-full mt-2 w-36 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl shadow-xl border border-amber-200 z-50 p-1.5 ${
                  language === 'ur' ? 'left-0' : 'right-0'
                }`}
              >
                {[
                  { code: 'ur' as Language, label: 'اردو (RTL)' },
                  { code: 'ur-Latn' as Language, label: 'Roman Urdu' },
                  { code: 'en' as Language, label: 'English' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLanguage(item.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-start px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between ${
                      language === item.code ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
                    }`}
                  >
                    <span>{item.label}</span>
                    {language === item.code && <Check className="w-3.5 h-3.5 text-amber-800" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PWA Install Button (if browser supports install prompt and not installed) */}
          {isPWAInstallable && !isPWAInstalled && (
            <button
              onClick={() => triggerPWAInstall()}
              type="button"
              className="min-h-[44px] px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 rounded-xl flex items-center gap-1 text-xs font-bold text-white shadow-sm transition-colors"
              title={t.actions.installApp}
            >
              <Download className="w-4 h-4 text-emerald-200 shrink-0" />
              <span className="hidden sm:inline">{t.actions.installApp}</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Switcher Modal / Sheet */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-[#FFFDF7] text-stone-900 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border-t-4 border-[#78350F]">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200 mb-3">
              <div>
                <h3 className="text-lg font-bold text-[#78350F]">{t.actions.switchRole}</h3>
                <p className="text-xs text-stone-600">منڈی میں آپ کا کردار کیا ہے؟</p>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="w-10 h-10 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pt-1">
              {ROLE_KEYS.map((rk: Role) => {
                const info = t.roles[rk];
                const isSelected = currentRole === rk;
                return (
                  <button
                    key={rk}
                    onClick={() => {
                      setCurrentRole(rk);
                      setIsRoleModalOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-xl text-start border-2 transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#78350F] bg-amber-50 shadow-sm'
                        : 'border-stone-200 hover:border-amber-400 bg-white'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-base ${
                        isSelected ? 'bg-[#78350F] text-white' : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {rk === 'farmer' && '🌾'}
                      {rk === 'arhti' && '⚖️'}
                      {rk === 'cold_storage' && '❄️'}
                      {rk === 'transporter' && '🚛'}
                      {rk === 'buyer' && '💰'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-stone-900">{info.title}</span>
                        {isSelected && (
                          <span className="text-xs bg-[#78350F] text-amber-100 font-bold px-2 py-0.5 rounded-md">
                            موجودہ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{info.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="w-full h-12 rounded-xl bg-stone-200 text-stone-800 font-bold text-sm"
              >
                {t.actions.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
