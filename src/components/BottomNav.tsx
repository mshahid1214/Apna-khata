import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, BookOpen, Receipt, TrendingUp, MoreHorizontal } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  const tabs = [
    { id: 'home' as const, label: t.tabs.home, icon: Home },
    { id: 'khata' as const, label: t.tabs.khata, icon: BookOpen },
    { id: 'slips' as const, label: t.tabs.slips, icon: Receipt },
    { id: 'rates' as const, label: t.tabs.rates, icon: TrendingUp },
    { id: 'more' as const, label: t.tabs.more, icon: MoreHorizontal },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF7] border-t-2 border-amber-300 shadow-2xl pb-safe"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-5 h-16 sm:h-18 items-stretch">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={`flex flex-col items-center justify-center min-h-[56px] transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${
                isActive
                  ? 'text-[#78350F] bg-amber-100/70 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-amber-50/50 font-medium'
              }`}
            >
              {/* Active top accent pill indicator */}
              {isActive && (
                <span className="absolute top-0 inset-x-2 h-1 bg-[#78350F] rounded-b-md" />
              )}
              <Icon
                className={`w-6 h-6 transition-transform ${
                  isActive ? 'scale-110 text-[#78350F] stroke-[2.4]' : 'text-stone-500 stroke-[1.8]'
                }`}
              />
              <span
                className={`text-[12px] sm:text-[13px] tracking-tight mt-1 truncate max-w-[90%] ${
                  isActive ? 'text-[#78350F] font-bold' : 'text-stone-600'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
