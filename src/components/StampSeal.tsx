import React from 'react';

interface StampSealProps {
  date?: string;
  color?: 'indigo' | 'crimson' | 'emerald';
  label?: string;
  subLabel?: string;
}

export const StampSeal: React.FC<StampSealProps> = ({
  date = '2026',
  color = 'indigo',
  label = 'منظور شدہ منڈی رسید',
  subLabel = 'مہر تصدیق و اندراج',
}) => {
  const colorStyles = {
    indigo: 'border-indigo-900 text-indigo-900',
    crimson: 'border-rose-900 text-rose-900',
    emerald: 'border-emerald-900 text-emerald-900',
  }[color];

  return (
    <div
      aria-label="Official verification stamp"
      className={`inline-block p-2.5 rounded-full border-4 border-double ${colorStyles} mandi-stamp select-none opacity-85 shadow-xs`}
    >
      <div className="w-28 h-28 rounded-full border-2 border-dashed border-current flex flex-col items-center justify-center p-1 text-center">
        <span className="text-[10px] font-bold tracking-widest uppercase">MANDI SEAL</span>
        <span className="text-xs font-bold font-urdu leading-tight my-0.5">{label}</span>
        <span className="text-[9px] font-medium leading-none">{subLabel}</span>
        <div className="my-1 w-12 border-t border-current opacity-60" />
        <bdi dir="ltr" className="text-[10px] font-mono font-bold tracking-wider">
          {date}
        </bdi>
      </div>
    </div>
  );
};
