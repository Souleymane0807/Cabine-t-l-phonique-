import React from 'react';
import { Bell, Sparkles, ChevronRight } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  subtitle?: string;
  hasUnreadNotifs: boolean;
  onOpenNotifications: () => void;
  onOpenTrial: () => void;
  trialDaysLeft: number;
  onNewTransaction?: () => void;
  onOpenPasserelle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Ibrahim',
  subtitle = 'Votre cabine, plus proche de vos clients',
  hasUnreadNotifs,
  onOpenNotifications,
  onOpenTrial,
  trialDaysLeft,
  onNewTransaction,
  onOpenPasserelle,
}) => {
  return (
    <div className="px-2 sm:px-0 pt-1 pb-3 flex flex-col gap-2.5">
      {/* 1 Month Free Trial Mini Banner (Mobile only - on desktop it is in top nav) */}
      <div 
        onClick={onOpenTrial}
        className="md:hidden w-full bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer hover:border-orange-500/50 transition group active:scale-[0.99] min-h-[42px]"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
            <Sparkles className="w-3 h-3 text-orange-400 animate-spin-slow" />
          </div>
          <div className="text-[11px] leading-tight truncate">
            <span className="font-semibold text-orange-300">1 Mois d'essai gratuit</span>
            <span className="text-slate-300"> · {trialDaysLeft}j restants</span>
          </div>
        </div>
        <div className="flex items-center text-[10px] text-orange-400 font-bold group-hover:translate-x-0.5 transition shrink-0 ml-1">
          <span>Gérer</span>
          <ChevronRight className="w-3 h-3 ml-0.5" />
        </div>
      </div>

      {/* Greeting & Header Content */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight truncate">
              Bonjour, {userName} 👋
            </h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Cabine Ouverte
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-normal truncate mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Mobile quick actions (only on small screens where top nav is compact) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          {onOpenPasserelle && (
            <button
              onClick={onOpenPasserelle}
              title="Passerelle & Transferts d'Unités"
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-400 hover:text-white hover:bg-orange-500 transition cursor-pointer text-xs font-semibold shadow-sm active:scale-95"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="text-[11px] font-bold">Passerelle UV</span>
            </button>
          )}

          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-xl bg-[#11223A] border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasUnreadNotifs && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF6B00] rounded-full ring-2 ring-[#0A192F]"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
