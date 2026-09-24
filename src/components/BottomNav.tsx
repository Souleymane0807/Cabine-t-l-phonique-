import React from 'react';
import { Home, Users, BarChart3, User } from 'lucide-react';

export type TabType = 'accueil' | 'clients' | 'caisse' | 'profil';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'accueil' as TabType, label: 'Accueil', icon: Home },
    { id: 'clients' as TabType, label: 'Clients', icon: Users },
    { id: 'caisse' as TabType, label: 'Caisse', icon: BarChart3 },
    { id: 'profil' as TabType, label: 'Profil', icon: User },
  ];

  return (
    <nav className="md:hidden sticky bottom-0 w-full bg-[#0A192F]/95 backdrop-blur-md border-t border-slate-800/80 px-2 sm:px-4 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] z-40 select-none">
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center py-1 transition-all cursor-pointer active:scale-95 rounded-xl ${
                isActive ? 'text-[#FF6B00]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF6B00]"></span>
                )}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] mt-1 tracking-tight font-medium ${
                  isActive ? 'font-bold text-[#FF6B00]' : 'text-slate-400'
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
