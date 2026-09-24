import React from 'react';
import {
  Home,
  Users,
  BarChart3,
  User,
  Plus,
  Sparkles,
  RotateCcw,
  Zap,
  Bell,
  AlertTriangle,
  Layers,
  Store,
  CheckCircle2
} from 'lucide-react';
import { TabType } from './BottomNav';
import { CaisseBalances } from '../types';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onResetData: () => void;
  onOpenTrial: () => void;
  trialDaysLeft: number;
  onNewTransaction: () => void;
  onOpenPasserelle: () => void;
  hasUnreadNotifs: boolean;
  onOpenNotifications: () => void;
  caisse?: CaisseBalances;
  clientsCount?: number;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onResetData,
  onOpenTrial,
  trialDaysLeft,
  onNewTransaction,
  onOpenPasserelle,
  hasUnreadNotifs,
  onOpenNotifications,
  caisse,
  clientsCount,
}) => {
  // Check if any UV balance has an alert (e.g. below 50 000 or Moov below 100 000)
  const isMoovAlert = (caisse?.moovUV ?? 0) < 100000;
  const isOrangeAlert = (caisse?.orangeUV ?? 0) < 50000;
  const isMtnAlert = (caisse?.mtnUV ?? 0) < 50000;
  const isWaveAlert = (caisse?.waveUV ?? 0) < 50000;
  const alertCount = [isMoovAlert, isOrangeAlert, isMtnAlert, isWaveAlert].filter(Boolean).length;

  const navItems = [
    {
      id: 'accueil' as TabType,
      label: 'Tableau de bord',
      shortLabel: 'Accueil',
      icon: Home,
    },
    {
      id: 'caisse' as TabType,
      label: 'Caisse & Stocks UV',
      shortLabel: 'Caisse',
      icon: BarChart3,
      badge: alertCount > 0 ? `${alertCount} alerte${alertCount > 1 ? 's' : ''}` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    },
    {
      id: 'clients' as TabType,
      label: 'Répertoire Clients',
      shortLabel: 'Clients',
      icon: Users,
      badge: clientsCount ? `${clientsCount}` : undefined,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    },
    {
      id: 'profil' as TabType,
      label: 'Paramètres Cabine',
      shortLabel: 'Profil',
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#060D17] text-slate-100 flex flex-col antialiased selection:bg-orange-500/30 selection:text-orange-200">
      {/* ============================================================ */}
      {/* TOP DESKTOP & MOBILE APPLICATION NAVBAR                     */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 w-full bg-[#0A1626]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                onClick={() => onTabChange('accueil')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#FF6B00] via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform duration-200">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-white tracking-tight group-hover:text-orange-400 transition-colors">
                      Cabine<span className="text-[#FF6B00]">Pay</span>
                    </span>
                    <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Direct CI
                    </span>
                  </div>
                  <p className="hidden md:block text-[11px] text-slate-400 font-medium">
                    Gestion Cabine & Point de Vente Mobile Money
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Desktop Navigation Tabs (Hidden on mobile phones, shown on md and above) */}
            <nav className="hidden md:flex items-center gap-1.5 bg-[#0D1E36] p-1.5 rounded-2xl border border-slate-700/60 shadow-inner">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-[#FF7A00] text-white shadow-md shadow-orange-600/30 font-extrabold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isActive ? 'bg-black/30 text-white' : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Actions Bar */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Passerelle UV Button */}
              <button
                onClick={onOpenPasserelle}
                title="Passerelle & Transfert d'Unités UV"
                className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/40 hover:border-orange-500 text-orange-400 font-bold text-xs transition cursor-pointer shadow-sm active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-orange-400 stroke-[2.5]" />
                <span className="hidden sm:inline">Passerelle</span>
                <span>UV</span>
              </button>

              {/* Primary + Nouvelle Transaction Button */}
              <button
                onClick={onNewTransaction}
                className="flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-[#FF5500] hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-600/30 border border-orange-400/40 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Nouvelle</span>
                <span>Opération</span>
              </button>

              {/* 1 Month Free Trial Pill (Desktop / Tablet) */}
              <button
                onClick={onOpenTrial}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs"
                title="Gérer l'abonnement et l'essai gratuit"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold">{trialDaysLeft}j d'essai</span>
              </button>

              {/* Notifications Bell */}
              <button
                onClick={onOpenNotifications}
                aria-label="Afficher les notifications"
                className="relative w-10 h-10 rounded-xl bg-[#0D1E36] hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
              >
                <Bell className="w-4.5 h-4.5" />
                {hasUnreadNotifs && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FF6B00] rounded-full ring-2 ring-[#0A1626] animate-pulse"></span>
                )}
              </button>

              {/* Agent Profile Chip (Desktop) */}
              <div
                onClick={() => onTabChange('profil')}
                className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer group"
                title="Voir le profil du gérant"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                  IT
                </div>
                <div className="text-left text-xs leading-tight">
                  <div className="font-bold text-slate-200 group-hover:text-orange-400 transition-colors">
                    Ibrahim T.
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Cocody R2</div>
                </div>
              </div>

              {/* Demo Reset (Discreet) */}
              <button
                onClick={onResetData}
                title="Restaurer les données de démonstration"
                className="hidden 2xl:flex p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN APPLICATION WORKSPACE (SPACIOUS RESPONSIVE CANVAS)     */}
      {/* ============================================================ */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col">
        {children}
      </main>

      {/* ============================================================ */}
      {/* DESKTOP FOOTER                                               */}
      {/* ============================================================ */}
      <footer className="hidden md:block w-full border-t border-slate-800/60 bg-[#07101E] py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">CabinePay CI</span>
            <span>·</span>
            <span>Logiciel de caisse certifié pour cabines & agences Mobile Money</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Orange · MTN · Moov · Wave synchronisés
            </span>
            <button
              onClick={onOpenTrial}
              className="text-orange-400 hover:underline font-semibold"
            >
              Offre Pro (30j gratuits)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Also export as PhoneContainer for backwards compatibility
export const PhoneContainer = AppLayout;
