import React, { useState, useEffect } from 'react';
import {
  Banknote,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  FileDown,
  ArrowLeftRight,
  Zap,
  Sliders,
  AlertTriangle,
  Sparkles,
  X,
  RotateCcw,
  Check,
} from 'lucide-react';
import { CaisseBalances, Transaction, Operator, UVThresholds } from '../types';
import { formatFCFA } from '../utils/helpers';
import { exportTransactionsToPDF } from '../utils/pdfExport';

interface CaisseViewProps {
  caisse: CaisseBalances;
  onUpdateBalances: (updated: CaisseBalances) => void;
  transactions: Transaction[];
  onOpenTrial: () => void;
  onOpenPasserelle?: (operator?: Operator, tab?: 'swap' | 'cash_to_uv' | 'confrere' | 'uv_to_cash' | 'history') => void;
}

const DEFAULT_THRESHOLDS: UVThresholds = {
  orangeUV: 50000,
  mtnUV: 50000,
  moovUV: 100000, // Démonstration immédiate de l'alerte avec le solde initial de 90 000 FCFA
  waveUV: 50000,
  cash: 100000,
};

export const CaisseView: React.FC<CaisseViewProps> = ({
  caisse,
  onUpdateBalances,
  transactions,
  onOpenTrial,
  onOpenPasserelle,
}) => {
  // Clôture state
  const [showClotureModal, setShowClotureModal] = useState(false);
  const [countedCash, setCountedCash] = useState<string>(caisse.cash.toString());
  const [clotureDone, setClotureDone] = useState(false);

  // Thresholds state
  const [thresholds, setThresholds] = useState<UVThresholds>(() => {
    const saved = localStorage.getItem('cabine_uv_thresholds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_THRESHOLDS;
      }
    }
    return DEFAULT_THRESHOLDS;
  });

  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [tempThresholds, setTempThresholds] = useState<UVThresholds>(thresholds);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const [alertBannerDismissed, setAlertBannerDismissed] = useState(false);

  // Sync thresholds to localStorage
  useEffect(() => {
    localStorage.setItem('cabine_uv_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  // Total available across physical cash + all digital UVs
  const totalDispo = caisse.cash + caisse.orangeUV + caisse.mtnUV + caisse.moovUV + caisse.waveUV;

  // Commissions earned today
  const totalCommissions = transactions.reduce((acc, tx) => acc + (tx.commission || 0), 0);

  // Today deposits & withdrawals volume
  const totalDepots = transactions
    .filter((t) => t.type !== 'Retrait')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const totalRetraits = transactions
    .filter((t) => t.type === 'Retrait')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const handleValidateCloture = (e: React.FormEvent) => {
    e.preventDefault();
    const counted = parseInt(countedCash.replace(/\D/g, ''), 10) || 0;
    onUpdateBalances({
      ...caisse,
      cash: counted,
    });
    setClotureDone(true);
    setTimeout(() => {
      setClotureDone(false);
      setShowClotureModal(false);
    }, 2000);
  };

  const parsedCounted = parseInt(countedCash.replace(/\D/g, ''), 10) || 0;
  const ecart = parsedCounted - caisse.cash;

  // Operators List with stock health computation
  const operatorsList: Array<{
    op: Operator;
    name: string;
    sub: string;
    balance: number;
    threshold: number;
    color: string;
    dotColor: string;
    badgeBg: string;
  }> = [
    {
      op: 'Orange',
      name: 'Orange Money UV',
      sub: 'Compte Agent Marchand',
      balance: caisse.orangeUV,
      threshold: thresholds.orangeUV,
      color: '#FF6B00',
      dotColor: 'bg-[#FF6B00]',
      badgeBg: 'bg-orange-500/20 text-[#FF6B00] border-orange-500/40',
    },
    {
      op: 'MTN',
      name: 'MTN MoMo UV',
      sub: 'Compte Agent Marchand',
      balance: caisse.mtnUV,
      threshold: thresholds.mtnUV,
      color: '#FFCC00',
      dotColor: 'bg-[#FFCC00]',
      badgeBg: 'bg-yellow-500/20 text-[#FFCC00] border-yellow-500/40',
    },
    {
      op: 'Moov',
      name: 'Moov Money UV',
      sub: 'Compte Agent Marchand',
      balance: caisse.moovUV,
      threshold: thresholds.moovUV,
      color: '#00A859',
      dotColor: 'bg-[#00A859]',
      badgeBg: 'bg-emerald-500/20 text-[#00A859] border-emerald-500/40',
    },
    {
      op: 'Wave',
      name: 'Wave UV',
      sub: 'Solde Agent Wave',
      balance: caisse.waveUV,
      threshold: thresholds.waveUV,
      color: '#1DC4FF',
      dotColor: 'bg-[#1DC4FF]',
      badgeBg: 'bg-sky-500/20 text-[#1DC4FF] border-sky-500/40',
    },
  ];

  const criticalOperators = operatorsList.filter((o) => o.balance <= o.threshold);
  const cashThreshold = thresholds.cash ?? 100000;
  const isCashCritical = caisse.cash <= cashThreshold;
  const hasAnyCriticalAlert = criticalOperators.length > 0 || isCashCritical;

  // Handle saving thresholds
  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    setThresholds(tempThresholds);
    setShowThresholdModal(false);
    setAlertBannerDismissed(false);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3500);
  };

  // Quick preset application
  const applyPreset = (amount: number) => {
    setTempThresholds({
      orangeUV: amount,
      mtnUV: amount,
      moovUV: amount,
      waveUV: amount,
      cash: Math.max(50000, amount),
    });
  };

  // Count simulated alerts in modal
  const simulatedAlertsCount =
    (caisse.orangeUV <= tempThresholds.orangeUV ? 1 : 0) +
    (caisse.mtnUV <= tempThresholds.mtnUV ? 1 : 0) +
    (caisse.moovUV <= tempThresholds.moovUV ? 1 : 0) +
    (caisse.waveUV <= tempThresholds.waveUV ? 1 : 0) +
    (caisse.cash <= (tempThresholds.cash ?? 100000) ? 1 : 0);

  return (
    <div className="px-5 py-3 flex flex-col gap-3 pb-24">
      {/* Toast confirmation */}
      {saveSuccessToast && (
        <div className="fixed top-4 right-4 z-50 p-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400/50 animate-bounce">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Seuils d'alerte UV enregistrés avec succès !</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Gestion de Caisse</h2>
            {hasAnyCriticalAlert && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                {criticalOperators.length} alerte{criticalOperators.length > 1 ? 's' : ''} UV
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Suivi des espèces physiques & alertes automatiques sur réserves UV
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Thresholds settings trigger button */}
          <button
            onClick={() => {
              setTempThresholds(thresholds);
              setShowThresholdModal(true);
            }}
            title="Configurer les seuils d'alerte critique"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#11233D] hover:bg-[#162C4C] border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition cursor-pointer shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-bold">Seuils d'Alerte</span>
          </button>

          {onOpenPasserelle && (
            <button
              onClick={() => onOpenPasserelle()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Passerelle UV</span>
            </button>
          )}
        </div>
      </div>

      {/* PROMINENT VISUAL ALERT BANNER (CRITICAL UV STOCK) */}
      {hasAnyCriticalAlert && !alertBannerDismissed && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/85 via-amber-950/60 to-[#0F1E33] border-2 border-red-500/80 shadow-2xl p-4 animate-fade-in ring-1 ring-red-500/30">
          {/* Decorative ambient glow */}
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-red-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-start gap-3">
              <div className="relative shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-2xl bg-red-500/25 border border-red-500/60 text-red-400 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black tracking-wider text-red-300 uppercase">
                    Alerte Seuil Critique de Stock UV
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/30 text-red-200 border border-red-500/50">
                    {criticalOperators.length} réseau{criticalOperators.length > 1 ? 'x' : ''} en rupture imminente
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  Le stock d'unités de certains opérateurs est passé sous votre seuil de sécurité.
                  Risque d'échec sur les dépôts clients si non réapprovisionné.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setTempThresholds(thresholds);
                  setShowThresholdModal(true);
                }}
                title="Ajuster les seuils"
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1 border border-slate-700"
              >
                <Sliders className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline text-[11px] font-semibold">Modifier seuils</span>
              </button>
              <button
                onClick={() => setAlertBannerDismissed(true)}
                title="Masquer l'alerte"
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cards for affected critical operators */}
          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 relative z-10">
            {criticalOperators.map((item) => {
              const deficit = item.threshold - item.balance;
              return (
                <div
                  key={item.op}
                  className="p-3 rounded-xl bg-[#091322]/90 border border-red-500/50 flex items-center justify-between shadow-inner"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${item.dotColor} shrink-0 ring-2 ring-red-400/50 animate-pulse`} />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{item.name}</span>
                        <span className="text-[10px] text-red-400 font-bold">
                          (-{formatFCFA(deficit)})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        Actuel : <strong className="text-red-400 font-mono font-bold">{formatFCFA(item.balance)}</strong>{' '}
                        <span className="text-slate-400">/ seuil min {formatFCFA(item.threshold)}</span>
                      </div>
                    </div>
                  </div>

                  {onOpenPasserelle && (
                    <button
                      onClick={() => onOpenPasserelle(item.op, 'swap')}
                      className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white text-[11px] font-bold shadow-md transition flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Recharger</span>
                    </button>
                  )}
                </div>
              );
            })}

            {isCashCritical && (
              <div className="p-3 rounded-xl bg-[#091322]/90 border border-amber-500/50 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2.5">
                  <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Espèces en Caisse Faibles
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Actuel : <strong className="text-amber-400 font-mono font-bold">{formatFCFA(caisse.cash)}</strong>{' '}
                      <span className="text-slate-400">/ seuil {formatFCFA(cashThreshold)}</span>
                    </div>
                  </div>
                </div>

                {onOpenPasserelle && (
                  <button
                    onClick={() => onOpenPasserelle(undefined, 'uv_to_cash')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    <Banknote className="w-3 h-3" />
                    <span>Délestage UV</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick resolution helper */}
          <div className="mt-3 pt-2.5 border-t border-red-500/20 flex flex-wrap items-center justify-between gap-2 relative z-10">
            <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Astuce : Effectuez un <strong>Swap UV</strong> depuis un opérateur disposant d'un surplus d'unités.
              </span>
            </span>
            {onOpenPasserelle && (
              <button
                onClick={() => onOpenPasserelle(criticalOperators[0]?.op, 'swap')}
                className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Ouvrir la Passerelle UV</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-5">
        {/* Left Column on Desktop */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Total Liquidité Card */}
          <div className="w-full bg-[#11233D] border border-slate-700/60 rounded-2xl p-4.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Liquidités Disponibles</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                Cash + UVs
              </span>
            </div>
            <div className="text-2xl font-black text-white mt-1 tabular-nums">
              {formatFCFA(totalDispo)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>
                Commissions cumulées du jour : <strong>+{formatFCFA(totalCommissions)}</strong>
              </span>
            </div>
          </div>

          {/* Dedicated Passerelle & Transferts d'Unités Card */}
          {onOpenPasserelle && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#11233D] via-[#142A4A] to-[#11233D] border border-orange-500/40 shadow-lg relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
                    <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Passerelle & Transfert d'Unités</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                        Direct
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Échangez vos UV entre réseaux (ex: Wave ➔ Orange) ou rechargez depuis vos espèces.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">Swap inter-réseaux</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">Flotte Confrère</span>
                </div>
                <button
                  onClick={() => onOpenPasserelle()}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Ouvrir la Passerelle</span>
                </button>
              </div>
            </div>
          )}

          {/* UV & Cash details with Visual Alerts and Stock Gauges */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Soldes par Guichet & Niveaux de Réserve
              </h3>
              <button
                onClick={() => {
                  setTempThresholds(thresholds);
                  setShowThresholdModal(true);
                }}
                className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>Régler seuils</span>
              </button>
            </div>

            {/* Physical Cash Row */}
            <div
              className={`p-3.5 rounded-2xl transition-all duration-200 ${
                isCashCritical
                  ? 'bg-gradient-to-r from-amber-950/35 via-[#11233D] to-[#11233D] border-2 border-amber-500/70 shadow-lg shadow-amber-500/10'
                  : 'bg-[#11233D] border border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      isCashCritical
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Espèces en Caisse (Cash)</span>
                      {isCashCritical ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[10px] font-black animate-pulse flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Seuil bas
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
                          ✓ Normal
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Billets physiques · Seuil min :{' '}
                      <span className="font-semibold text-slate-300">{formatFCFA(cashThreshold)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm sm:text-base font-bold tabular-nums ${
                      isCashCritical ? 'text-amber-300 font-black' : 'text-white'
                    }`}
                  >
                    {formatFCFA(caisse.cash)}
                  </div>
                  {isCashCritical && onOpenPasserelle && (
                    <button
                      onClick={() => onOpenPasserelle(undefined, 'uv_to_cash')}
                      className="mt-1 px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <Banknote className="w-3 h-3" />
                      <span>Délestage UV</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cash progress bar */}
              <div className="mt-2.5 pt-2 border-t border-slate-700/40">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Niveau espèces</span>
                  <span className={isCashCritical ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    {caisse.cash <= cashThreshold
                      ? `Manque ${formatFCFA(cashThreshold - caisse.cash)} pour le seuil confort`
                      : `Marge de réserve +${formatFCFA(caisse.cash - cashThreshold)}`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCashCritical
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{
                      width: `${Math.max(5, Math.min(100, (caisse.cash / (cashThreshold * 2)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Operator UV Rows */}
            {operatorsList.map((item) => {
              const isCritical = item.balance <= item.threshold;
              const ratio = Math.max(5, Math.min(100, (item.balance / Math.max(1, item.threshold * 2)) * 100));

              return (
                <div
                  key={item.op}
                  className={`p-3.5 rounded-2xl transition-all duration-200 ${
                    isCritical
                      ? 'bg-gradient-to-r from-red-950/35 via-[#11233D] to-[#11233D] border-2 border-red-500/80 shadow-lg shadow-red-500/10'
                      : 'bg-[#11233D] border border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isCritical ? 'bg-red-500/20 border border-red-500/40' : 'bg-slate-800'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${item.dotColor}`}></span>
                        </div>
                        {isCritical && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{item.name}</span>
                          {isCritical ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-red-500/25 border border-red-500/40 text-red-300 text-[10px] font-black animate-pulse flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Seuil critique
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
                              ✓ En stock
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.sub} · Seuil d'alerte :{' '}
                          <span className="font-semibold text-slate-300">{formatFCFA(item.threshold)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-sm sm:text-base font-bold tabular-nums ${
                          isCritical ? 'text-red-400 font-black' : 'text-white'
                        }`}
                      >
                        {formatFCFA(item.balance)}
                      </div>
                      {isCritical && onOpenPasserelle ? (
                        <button
                          onClick={() => onOpenPasserelle(item.op, 'swap')}
                          className="mt-1 px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ml-auto shadow-sm"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Recharger</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Disponible</span>
                      )}
                    </div>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="mt-2.5 pt-2 border-t border-slate-700/40">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Niveau de réserve UV</span>
                      <span className={isCritical ? 'text-red-400 font-bold' : 'text-slate-300'}>
                        {isCritical
                          ? `Déficit de -${formatFCFA(item.threshold - item.balance)} sous le seuil`
                          : `Marge de sécurité +${formatFCFA(item.balance - item.threshold)}`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCritical
                            ? 'bg-gradient-to-r from-red-500 to-amber-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column on Desktop */}
        <div className="lg:col-span-5 flex flex-col gap-3 mt-3 lg:mt-0">
          <div className="p-4 rounded-2xl bg-[#11233D] border border-slate-700/60 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Clôture & Rapports Journaliers
            </h3>
            <p className="text-xs text-slate-400">
              Vérifiez la caisse en fin de journée et comparez les flux d'espèces réels.
            </p>

            <div className="p-3 rounded-xl bg-[#0D1E36] border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Dépôts du jour (Cash IN) :</span>
                <span className="font-bold text-emerald-400">+{formatFCFA(totalDepots)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Retraits du jour (Cash OUT) :</span>
                <span className="font-bold text-orange-400">-{formatFCFA(totalRetraits)}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1.5 border-t border-slate-700/40">
                <span className="font-medium">Espèces théoriques :</span>
                <span className="font-bold text-white">{formatFCFA(caisse.cash)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setCountedCash(caisse.cash.toString());
                  setShowClotureModal(true);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Faire la Clôture de Caisse Journalière</span>
              </button>

              <button
                onClick={() => {
                  exportTransactionsToPDF(
                    transactions,
                    {
                      title: 'Bilan Quotidien de Caisse & Transactions',
                    },
                    caisse
                  );
                }}
                className="w-full py-2.5 rounded-2xl bg-[#0D1E36] hover:bg-[#162D4E] border border-slate-700/80 text-slate-200 font-medium text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4 text-orange-400" />
                <span>Exporter le Bilan de Caisse (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* THRESHOLD CONFIGURATION MODAL */}
      {showThresholdModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-md bg-[#0B1728] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-5 text-slate-100 shadow-2xl max-h-[92vh] flex flex-col relative overflow-hidden">
            {/* Mobile pull bar */}
            <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Seuils d'Alerte Critique UV</h3>
                  <p className="text-[11px] text-slate-400">
                    Déclenchez une alerte visuelle si le solde descend trop bas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowThresholdModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveThresholds} className="flex-1 overflow-y-auto py-3 space-y-3.5">
              {/* Presets Bar */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Préréglages Rapides
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset(30000)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 text-center transition cursor-pointer"
                  >
                    <div>30 000 F</div>
                    <div className="text-[10px] text-slate-400">Modéré</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(50000)}
                    className="p-2 rounded-xl bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/40 text-center transition cursor-pointer"
                  >
                    <div>50 000 F</div>
                    <div className="text-[10px] text-orange-300">Standard</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(100000)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 text-center transition cursor-pointer"
                  >
                    <div>100 000 F</div>
                    <div className="text-[10px] text-slate-400">Sécurisé</div>
                  </button>
                </div>
              </div>

              {/* Per-operator Inputs */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Seuil minimal par opérateur
                </label>

                {/* Orange */}
                <div className="p-2.5 rounded-xl bg-[#11233D] border border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF6B00] shrink-0" />
                    <span className="text-xs font-bold text-white">Orange UV</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="5000"
                      min="0"
                      value={tempThresholds.orangeUV}
                      onChange={(e) =>
                        setTempThresholds({
                          ...tempThresholds,
                          orangeUV: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-24 bg-[#0B1728] border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white text-right tabular-nums focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">F</span>
                  </div>
                </div>

                {/* MTN */}
                <div className="p-2.5 rounded-xl bg-[#11233D] border border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FFCC00] shrink-0" />
                    <span className="text-xs font-bold text-white">MTN UV</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="5000"
                      min="0"
                      value={tempThresholds.mtnUV}
                      onChange={(e) =>
                        setTempThresholds({
                          ...tempThresholds,
                          mtnUV: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-24 bg-[#0B1728] border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white text-right tabular-nums focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">F</span>
                  </div>
                </div>

                {/* Moov */}
                <div className="p-2.5 rounded-xl bg-[#11233D] border border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#00A859] shrink-0" />
                    <span className="text-xs font-bold text-white">Moov UV</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="5000"
                      min="0"
                      value={tempThresholds.moovUV}
                      onChange={(e) =>
                        setTempThresholds({
                          ...tempThresholds,
                          moovUV: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-24 bg-[#0B1728] border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white text-right tabular-nums focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">F</span>
                  </div>
                </div>

                {/* Wave */}
                <div className="p-2.5 rounded-xl bg-[#11233D] border border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#1DC4FF] shrink-0" />
                    <span className="text-xs font-bold text-white">Wave UV</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="5000"
                      min="0"
                      value={tempThresholds.waveUV}
                      onChange={(e) =>
                        setTempThresholds({
                          ...tempThresholds,
                          waveUV: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-24 bg-[#0B1728] border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white text-right tabular-nums focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">F</span>
                  </div>
                </div>

                {/* Cash */}
                <div className="p-2.5 rounded-xl bg-[#11233D] border border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-white">Espèces (Cash)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="10000"
                      min="0"
                      value={tempThresholds.cash ?? 100000}
                      onChange={(e) =>
                        setTempThresholds({
                          ...tempThresholds,
                          cash: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-24 bg-[#0B1728] border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white text-right tabular-nums focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">F</span>
                  </div>
                </div>
              </div>

              {/* Simulation feedback */}
              <div className="p-2.5 rounded-xl bg-[#091322] border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Simulation d'impact :</span>
                <span
                  className={`font-bold ${
                    simulatedAlertsCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {simulatedAlertsCount === 0
                    ? 'Aucune alerte (tous les stocks sont conformes)'
                    : `${simulatedAlertsCount} guichet(s) déclencheront une alerte`}
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTempThresholds(DEFAULT_THRESHOLDS)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer flex items-center gap-1 shrink-0"
                  title="Rétablir les seuils par défaut"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Défaut</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowThresholdModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clôture Modal */}
      {showClotureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#0D1E36] border border-slate-700 rounded-3xl p-5 text-slate-100 shadow-2xl relative">
            <h3 className="text-base font-bold text-white">Clôture Journalière de Caisse</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">
              Vérifiez la concordance entre vos espèces réelles et théoriques
            </p>

            <form onSubmit={handleValidateCloture} className="space-y-3">
              <div className="p-3 bg-[#11233D] rounded-xl border border-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Espèces théoriques attendues :</span>
                  <span className="font-bold text-white">{formatFCFA(caisse.cash)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total dépôts (entrées cash) :</span>
                  <span className="text-emerald-400">+{formatFCFA(totalDepots)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total retraits (sorties cash) :</span>
                  <span className="text-orange-400">-{formatFCFA(totalRetraits)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Espèces réelles comptées dans le tiroir (FCFA)
                </label>
                <input
                  type="number"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-orange-500 tabular-nums"
                  required
                />
              </div>

              {/* Écart status */}
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  ecart === 0
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : ecart > 0
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    : 'bg-red-500/15 text-red-300 border border-red-500/30'
                }`}
              >
                {ecart === 0 ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {ecart === 0
                    ? 'Caisse parfaite (aucun écart constaté)'
                    : ecart > 0
                    ? `Excédent constaté : +${formatFCFA(ecart)}`
                    : `Déficit constaté : -${formatFCFA(Math.abs(ecart))}`}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClotureModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Valider la Clôture
                </button>
              </div>
            </form>

            {clotureDone && (
              <div className="absolute inset-0 bg-[#0D1E36]/95 backdrop-blur rounded-3xl flex flex-col items-center justify-center p-6 text-center z-10">
                <CheckCircle className="w-10 h-10 text-emerald-400 mb-2" />
                <h4 className="text-base font-bold text-white">Clôture Enregistrée !</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Le journal de caisse a été validé avec succès.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
