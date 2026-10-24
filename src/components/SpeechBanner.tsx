import React from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, Square } from 'lucide-react';

export const SpeechBanner: React.FC = () => {
  const { isSpeaking, currentSpokenText, stopSpeech, t } = useApp();

  if (!isSpeaking) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 left-2 right-2 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-[#1C1917] text-amber-50 rounded-2xl p-3.5 shadow-2xl border-2 border-amber-400 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4"
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/40">
          <Volume2 className="w-6 h-6 animate-pulse text-amber-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{t.actions.listenAudio}</span>
          </div>
          <p className="text-sm font-medium text-amber-100 truncate mt-0.5 leading-snug">
            {currentSpokenText || 'آواز چل رہی ہے...'}
          </p>
        </div>
      </div>

      <button
        onClick={stopSpeech}
        type="button"
        className="min-h-[44px] min-w-[44px] px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 shadow-sm transition-all"
        title={t.actions.stopAudio}
      >
        <Square className="w-3.5 h-3.5 fill-current" />
        <span>{t.actions.stopAudio}</span>
      </button>
    </div>
  );
};
