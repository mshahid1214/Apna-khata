import React from 'react';
import { useApp } from '../context/AppContext';
import { WifiOff, Database } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, t } = useApp();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="bg-amber-900 text-amber-100 px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 border-b border-amber-950 shadow-md transition-all"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
        <span>{t.more.offlineMode}</span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded-md">
        <Database className="w-3.5 h-3.5 text-amber-300" />
        <span>تمام اندراجات مقامی کلاؤڈ کیشے میں محفوظ ہیں</span>
      </div>
    </div>
  );
};
