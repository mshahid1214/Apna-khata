import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, ChevronLeft, Volume2, Sparkles } from 'lucide-react';

export const FirstRunIntro: React.FC = () => {
  const { hasSeenIntro, completeIntro, t, speak } = useApp();
  const [step, setStep] = useState(1);

  if (hasSeenIntro) return null;

  const steps = [
    {
      step: 1,
      badge: 'مرحلہ 1 از 3',
      title: t.firstRun.step1Title,
      desc: t.firstRun.step1Desc,
      icon: '📜',
      subIcon: '✍️',
      color: 'bg-amber-100 text-amber-900 border-amber-300',
      audioText: `${t.firstRun.step1Title}۔ ${t.firstRun.step1Desc}`,
    },
    {
      step: 2,
      badge: 'مرحلہ 2 از 3',
      title: t.firstRun.step2Title,
      desc: t.firstRun.step2Desc,
      icon: '🔊',
      subIcon: '🗣️',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      audioText: `${t.firstRun.step2Title}۔ ${t.firstRun.step2Desc}`,
    },
    {
      step: 3,
      badge: 'مرحلہ 3 از 3',
      title: t.firstRun.step3Title,
      desc: t.firstRun.step3Desc,
      icon: '☀️',
      subIcon: '📱',
      color: 'bg-orange-100 text-orange-900 border-orange-300',
      audioText: `${t.firstRun.step3Title}۔ ${t.firstRun.step3Desc}`,
    },
  ];

  const currentStepData = steps[step - 1];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeIntro();
    }
  };

  const handleListenStep = () => {
    speak(currentStepData.audioText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[#FFFDF7] rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-[#78350F] relative animate-in fade-in zoom-in-95">
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200">
          <span className="text-xs font-bold bg-amber-200/80 text-amber-900 px-3 py-1 rounded-full">
            {currentStepData.badge}
          </span>
          <button
            onClick={completeIntro}
            className="text-xs font-bold text-stone-500 hover:text-stone-800 px-2 py-1"
          >
            {t.firstRun.skip}
          </button>
        </div>

        {/* Visual Graphic */}
        <div className="py-6 text-center">
          <div className="relative inline-block">
            <div className={`w-28 h-28 rounded-3xl ${currentStepData.color} border-2 flex items-center justify-center text-5xl shadow-md mx-auto`}>
              {currentStepData.icon}
            </div>
            <div className="absolute -bottom-2 -end-2 w-10 h-10 rounded-full bg-white shadow-md border border-stone-200 flex items-center justify-center text-xl">
              {currentStepData.subIcon}
            </div>
          </div>

          <h3 className="text-2xl font-bold font-urdu text-stone-900 mt-5 leading-snug">
            {currentStepData.title}
          </h3>
          <p className="text-base text-stone-600 mt-2.5 leading-relaxed max-w-sm mx-auto">
            {currentStepData.desc}
          </p>

          {/* Listen aloud button */}
          <button
            onClick={handleListenStep}
            type="button"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full text-xs font-bold border border-amber-300 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-amber-800" />
            <span>{t.actions.listenAudio}</span>
          </button>
        </div>

        {/* Step Dots */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? 'w-8 bg-[#78350F]' : 'w-2 bg-stone-300'
              }`}
            />
          ))}
        </div>

        {/* Actions (Min 56px touch target) */}
        <div className="pt-3 border-t border-amber-200 flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              type="button"
              className="min-h-[56px] px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
            </button>
          )}

          <button
            onClick={handleNext}
            type="button"
            className="flex-1 min-h-[56px] rounded-2xl bg-[#78350F] hover:bg-amber-900 text-amber-50 font-bold text-base shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            <span>{step === 3 ? t.firstRun.getStarted : t.firstRun.next}</span>
            {step === 3 ? (
              <Sparkles className="w-5 h-5 text-amber-300" />
            ) : (
              <ChevronLeft className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
