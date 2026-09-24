import React, { useState } from 'react';
import {
  X,
  ArrowLeftRight,
  ArrowRight,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  History,
  Store,
  RefreshCw,
  Coins,
  Send,
  Download,
  Share2
} from 'lucide-react';
import { CaisseBalances, Operator, TransferKind, UnitTransfer } from '../types';
import { formatFCFA } from '../utils/helpers';

interface PasserelleUVModalProps {
  isOpen: boolean;
  onClose: () => void;
  caisse: CaisseBalances;
  onExecuteTransfer: (transfer: Omit<UnitTransfer, 'id' | 'timestamp' | 'date' | 'reference' | 'status'>) => void;
  history: UnitTransfer[];
  initialTargetOperator?: Operator;
  initialTab?: 'swap' | 'cash_to_uv' | 'confrere' | 'uv_to_cash' | 'history';
}

export const PasserelleUVModal: React.FC<PasserelleUVModalProps> = ({
  isOpen,
  onClose,
  caisse,
  onExecuteTransfer,
  history,
  initialTargetOperator,
  initialTab = 'swap',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'swap' | 'cash_to_uv' | 'confrere' | 'uv_to_cash' | 'history'>(initialTab);
  
  // Swap Inter-opérateurs
  const [sourceOp, setSourceOp] = useState<Operator>(() => {
    if (initialTargetOperator === 'Wave') return 'Orange';
    return 'Wave';
  });
  const [targetOp, setTargetOp] = useState<Operator>(initialTargetOperator || 'Orange');
  const [swapAmount, setSwapAmount] = useState<string>('50000');
  const [swapNote, setSwapNote] = useState<string>('');

  // Cash -> UV (Approvisionnement)
  const [cashToUvTarget, setCashToUvTarget] = useState<Operator>(initialTargetOperator || 'Orange');
  const [cashToUvAmount, setCashToUvAmount] = useState<string>('100000');

  // Confrère P2P
  const [confrereOp, setConfrereOp] = useState<Operator>('Orange');
  const [confrerePhone, setConfrerePhone] = useState<string>('');
  const [confrereName, setConfrereName] = useState<string>('');
  const [confrereAmount, setConfrereAmount] = useState<string>('25000');

  // UV -> Cash (Délestage)
  const [uvToCashSource, setUvToCashSource] = useState<Operator>('Orange');
  const [uvToCashAmount, setUvToCashAmount] = useState<string>('50000');

  // Feedback state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getBalance = (op: Operator): number => {
    switch (op) {
      case 'Orange':
        return caisse.orangeUV;
      case 'MTN':
        return caisse.mtnUV;
      case 'Moov':
        return caisse.moovUV;
      case 'Wave':
        return caisse.waveUV;
      default:
        return 0;
    }
  };

  const getOpBadgeClass = (op: Operator) => {
    switch (op) {
      case 'Orange':
        return 'bg-orange-500/20 text-[#FF6B00] border-orange-500/40';
      case 'MTN':
        return 'bg-yellow-500/20 text-[#FFCC00] border-yellow-500/40';
      case 'Moov':
        return 'bg-emerald-500/20 text-[#00A859] border-emerald-500/40';
      case 'Wave':
        return 'bg-sky-500/20 text-[#1DC4FF] border-sky-500/40';
    }
  };

  const parseNumber = (val: string): number => {
    return parseInt(val.replace(/\D/g, ''), 10) || 0;
  };

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumber(swapAmount);
    if (amount <= 0) {
      setErrorMessage('Veuillez saisir un montant supérieur à 0 FCFA.');
      return;
    }

    const available = getBalance(sourceOp);
    if (amount > available) {
      setErrorMessage(`Solde insuffisant sur votre compte ${sourceOp} UV (${formatFCFA(available)} disponible).`);
      return;
    }

    if (sourceOp === targetOp) {
      setErrorMessage("L'opérateur source et l'opérateur cible doivent être différents.");
      return;
    }

    onExecuteTransfer({
      transferKind: 'inter_operator',
      sourceType: 'UV',
      sourceOperator: sourceOp,
      targetType: 'UV',
      targetOperator: targetOp,
      amount,
      fee: 0,
      note: swapNote || `Passerelle ${sourceOp} vers ${targetOp}`,
    });

    setSuccessMessage(`Transfert de ${formatFCFA(amount)} de ${sourceOp} UV vers ${targetOp} UV réussi !`);
    setErrorMessage(null);
    setSwapAmount('');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleCashToUvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumber(cashToUvAmount);
    if (amount <= 0) {
      setErrorMessage('Veuillez saisir un montant supérieur à 0 FCFA.');
      return;
    }

    if (amount > caisse.cash) {
      setErrorMessage(`Espèces en caisse insuffisantes (${formatFCFA(caisse.cash)} disponibles).`);
      return;
    }

    onExecuteTransfer({
      transferKind: 'supply_cash_to_uv',
      sourceType: 'Cash',
      targetType: 'UV',
      targetOperator: cashToUvTarget,
      amount,
      fee: 0,
      note: `Approvisionnement ${cashToUvTarget} UV depuis le tiroir-caisse`,
    });

    setSuccessMessage(`Rechargement de ${formatFCFA(amount)} vers ${cashToUvTarget} UV effectué !`);
    setErrorMessage(null);
    setCashToUvAmount('');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleConfrereSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumber(confrereAmount);
    if (amount <= 0) {
      setErrorMessage('Veuillez saisir un montant supérieur à 0 FCFA.');
      return;
    }

    const available = getBalance(confrereOp);
    if (amount > available) {
      setErrorMessage(`Solde insuffisant sur votre compte ${confrereOp} UV.`);
      return;
    }

    if (!confrerePhone) {
      setErrorMessage('Veuillez renseigner le numéro de puce flotte du confrère.');
      return;
    }

    onExecuteTransfer({
      transferKind: 'p2p_confrere',
      sourceType: 'UV',
      sourceOperator: confrereOp,
      targetType: 'UV',
      targetOperator: confrereOp,
      amount,
      fee: 0,
      recipientPhone: confrerePhone,
      recipientName: confrereName || 'Cabine Confrère',
      note: `Dépannage confrère (${confrereName || 'Cabine'})`,
    });

    setSuccessMessage(`Transfert flotte de ${formatFCFA(amount)} envoyé avec succès !`);
    setErrorMessage(null);
    setConfrereAmount('');
    setConfrerePhone('');
    setConfrereName('');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleUvToCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumber(uvToCashAmount);
    if (amount <= 0) {
      setErrorMessage('Veuillez saisir un montant supérieur à 0 FCFA.');
      return;
    }

    const available = getBalance(uvToCashSource);
    if (amount > available) {
      setErrorMessage(`Solde ${uvToCashSource} UV insuffisant pour le délestage.`);
      return;
    }

    onExecuteTransfer({
      transferKind: 'uv_to_cash',
      sourceType: 'UV',
      sourceOperator: uvToCashSource,
      targetType: 'Cash',
      amount,
      fee: 0,
      note: `Délestage ${uvToCashSource} UV vers Espèces caisse`,
    });

    setSuccessMessage(`Délestage de ${formatFCFA(amount)} vers les espèces de caisse validé !`);
    setErrorMessage(null);
    setUvToCashAmount('');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const operators: Operator[] = ['Orange', 'MTN', 'Moov', 'Wave'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-xl bg-[#0B1728] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-5 text-slate-100 shadow-2xl max-h-[92vh] flex flex-col relative overflow-hidden">
        {/* Mobile Pull Bar */}
        <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Passerelle & Transferts d'Unités
                </h2>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Instantané
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rééquilibrez vos stocks UV, approvisionnez la caisse ou dépannez un confrère
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Balances Ribbon */}
        <div className="py-2.5 flex items-center gap-1.5 text-center text-[10px] sm:text-[11px] border-b border-slate-800/80 overflow-x-auto no-scrollbar touch-pan-x">
          <div className="p-1.5 min-w-[70px] flex-1 rounded-xl bg-orange-500/10 border border-orange-500/30 shrink-0">
            <div className="font-semibold text-orange-400">Orange</div>
            <div className="font-bold text-white tabular-nums mt-0.5">{formatFCFA(caisse.orangeUV)}</div>
          </div>
          <div className="p-1.5 min-w-[70px] flex-1 rounded-xl bg-yellow-500/10 border border-yellow-500/30 shrink-0">
            <div className="font-semibold text-yellow-400">MTN</div>
            <div className="font-bold text-white tabular-nums mt-0.5">{formatFCFA(caisse.mtnUV)}</div>
          </div>
          <div className="p-1.5 min-w-[70px] flex-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shrink-0">
            <div className="font-semibold text-emerald-400">Moov</div>
            <div className="font-bold text-white tabular-nums mt-0.5">{formatFCFA(caisse.moovUV)}</div>
          </div>
          <div className="p-1.5 min-w-[70px] flex-1 rounded-xl bg-sky-500/10 border border-sky-500/30 shrink-0">
            <div className="font-semibold text-sky-400">Wave</div>
            <div className="font-bold text-white tabular-nums mt-0.5">{formatFCFA(caisse.waveUV)}</div>
          </div>
          <div className="p-1.5 min-w-[70px] flex-1 rounded-xl bg-amber-500/10 border border-amber-500/30 shrink-0">
            <div className="font-semibold text-amber-400">Espèces</div>
            <div className="font-bold text-white tabular-nums mt-0.5">{formatFCFA(caisse.cash)}</div>
          </div>
        </div>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 pt-3 pb-1 border-b border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar touch-pan-x select-none">
          <button
            onClick={() => { setActiveTab('swap'); setErrorMessage(null); }}
            className={`min-h-[38px] px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              activeTab === 'swap'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap Inter-Opérateurs</span>
          </button>

          <button
            onClick={() => { setActiveTab('cash_to_uv'); setErrorMessage(null); }}
            className={`min-h-[38px] px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              activeTab === 'cash_to_uv'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Cash ➔ UV</span>
          </button>

          <button
            onClick={() => { setActiveTab('confrere'); setErrorMessage(null); }}
            className={`min-h-[38px] px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              activeTab === 'confrere'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Dépannage Confrère</span>
          </button>

          <button
            onClick={() => { setActiveTab('uv_to_cash'); setErrorMessage(null); }}
            className={`min-h-[38px] px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              activeTab === 'uv_to_cash'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>UV ➔ Cash</span>
          </button>

          <button
            onClick={() => { setActiveTab('history'); setErrorMessage(null); }}
            className={`min-h-[38px] px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              activeTab === 'history'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique ({history.length})</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {/* TAB 1: SWAP INTER-OPÉRATEURS */}
          {activeTab === 'swap' && (
            <form onSubmit={handleSwapSubmit} className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#11233D] border border-slate-700/60">
                <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center">
                  {/* Source Operator */}
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Opérateur Source (À Débiter)
                    </label>
                    <select
                      value={sourceOp}
                      onChange={(e) => setSourceOp(e.target.value as Operator)}
                      className="w-full bg-[#0D1E36] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer font-semibold"
                    >
                      {operators.map((op) => (
                        <option key={op} value={op} disabled={op === targetOp}>
                          {op} UV ({formatFCFA(getBalance(op))})
                        </option>
                      ))}
                    </select>
                    <div className="text-[11px] text-slate-400">
                      Disponible : <span className="font-bold text-white">{formatFCFA(getBalance(sourceOp))}</span>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const prevSource = sourceOp;
                        setSourceOp(targetOp);
                        setTargetOp(prevSource);
                      }}
                      className="p-2 rounded-full bg-slate-800 hover:bg-orange-500 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Intervertir la source et la cible"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Target Operator */}
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Opérateur Cible (À Créditer)
                    </label>
                    <select
                      value={targetOp}
                      onChange={(e) => setTargetOp(e.target.value as Operator)}
                      className="w-full bg-[#0D1E36] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer font-semibold"
                    >
                      {operators.map((op) => (
                        <option key={op} value={op} disabled={op === sourceOp}>
                          {op} UV ({formatFCFA(getBalance(op))})
                        </option>
                      ))}
                    </select>
                    <div className="text-[11px] text-slate-400">
                      Actuel : <span className="font-bold text-white">{formatFCFA(getBalance(targetOp))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Input & Presets */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Montant à transférer (FCFA)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="Ex: 50 000"
                    required
                    className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-white focus:outline-none focus:border-orange-500 tabular-nums"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
                    FCFA
                  </span>
                </div>

                {/* Fast presets */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                  {[25000, 50000, 100000, 200000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSwapAmount(val.toString())}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 transition cursor-pointer shrink-0"
                    >
                      +{val.toLocaleString()}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSwapAmount(getBalance(sourceOp).toString())}
                    className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 text-[11px] font-bold transition cursor-pointer shrink-0"
                  >
                    Tout le solde
                  </button>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Motif ou Note interne (facultatif)
                </label>
                <input
                  type="text"
                  value={swapNote}
                  onChange={(e) => setSwapNote(e.target.value)}
                  placeholder="Ex: Rééquilibrage stock pour dépôts"
                  className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Simulation Card */}
              {parseNumber(swapAmount) > 0 && (
                <div className="p-3 rounded-xl bg-[#0D1E36] border border-slate-800 text-xs space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Simulation de l'impact en temps réel
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{sourceOp} UV après transfert :</span>
                    <span className="font-bold text-red-400 tabular-nums">
                      {formatFCFA(Math.max(0, getBalance(sourceOp) - parseNumber(swapAmount)))}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{targetOp} UV après transfert :</span>
                    <span className="font-bold text-emerald-400 tabular-nums">
                      {formatFCFA(getBalance(targetOp) + parseNumber(swapAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-700/40">
                    <span>Frais de passerelle :</span>
                    <span className="text-emerald-400 font-bold">0 FCFA (Gratuit)</span>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Exécuter le Transfert {sourceOp} ➔ {targetOp}</span>
              </button>
            </form>
          )}

          {/* TAB 2: CASH -> UV (APPROVISIONNEMENT) */}
          {activeTab === 'cash_to_uv' && (
            <form onSubmit={handleCashToUvSubmit} className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#11233D] border border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Espèces physiques en caisse</span>
                  <span className="text-xs font-bold text-amber-400">{formatFCFA(caisse.cash)}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Déposez des espèces du tiroir-caisse auprès du grossiste / banque pour créditer le compte marchand de votre choix.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Opérateur UV à approvisionner
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {operators.map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setCashToUvTarget(op)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center gap-1 ${
                        cashToUvTarget === op
                          ? getOpBadgeClass(op)
                          : 'bg-[#11233D] border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{op}</span>
                      <span className="text-[10px] font-mono">{formatFCFA(getBalance(op))}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Montant en Espèces à convertir en UV (FCFA)
                </label>
                <input
                  type="text"
                  value={cashToUvAmount}
                  onChange={(e) => setCashToUvAmount(e.target.value)}
                  placeholder="Ex: 100 000"
                  required
                  className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-white focus:outline-none focus:border-orange-500 tabular-nums"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Coins className="w-4 h-4" />
                <span>Créditer {cashToUvTarget} UV depuis la Caisse</span>
              </button>
            </form>
          )}

          {/* TAB 3: DÉPANNAGE CONFRÈRE P2P */}
          {activeTab === 'confrere' && (
            <form onSubmit={handleConfrereSubmit} className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#11233D] border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-orange-400" />
                  <span>Transfert Flotte vers Confrère Cabine</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Dépannez un confrère agent en lui envoyant des unités directement sur sa puce flotte marchand.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Opérateur Source
                </label>
                <select
                  value={confrereOp}
                  onChange={(e) => setConfrereOp(e.target.value as Operator)}
                  className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {operators.map((op) => (
                    <option key={op} value={op}>
                      {op} UV (Solde : {formatFCFA(getBalance(op))})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Numéro Puce Flotte du Confrère
                </label>
                <input
                  type="tel"
                  value={confrerePhone}
                  onChange={(e) => setConfrerePhone(e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  required
                  className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Nom de la Cabine / Agent Confrère
                </label>
                <input
                  type="text"
                  value={confrereName}
                  onChange={(e) => setConfrereName(e.target.value)}
                  placeholder="Ex: Cabine Koumassi Remblais"
                  className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Montant à envoyer (FCFA)
                </label>
                <input
                  type="text"
                  value={confrereAmount}
                  onChange={(e) => setConfrereAmount(e.target.value)}
                  placeholder="Ex: 25 000"
                  required
                  className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-white focus:outline-none focus:border-orange-500 tabular-nums"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer les Unités au Confrère</span>
              </button>
            </form>
          )}

          {/* TAB 4: UV -> CASH (DÉLESTAGE) */}
          {activeTab === 'uv_to_cash' && (
            <form onSubmit={handleUvToCashSubmit} className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#11233D] border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Délestage UV ➔ Espèces Physiques</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Convertissez un surplus d'unités virtuelles en billets de banque auprès d'un confrère ou d'un super-agent lorsque votre caisse manque d'espèces.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Opérateur UV à délester
                </label>
                <select
                  value={uvToCashSource}
                  onChange={(e) => setUvToCashSource(e.target.value as Operator)}
                  className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {operators.map((op) => (
                    <option key={op} value={op}>
                      {op} UV (Solde : {formatFCFA(getBalance(op))})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Montant à encaisser en espèces (FCFA)
                </label>
                <input
                  type="text"
                  value={uvToCashAmount}
                  onChange={(e) => setUvToCashAmount(e.target.value)}
                  placeholder="Ex: 50 000"
                  required
                  className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-white focus:outline-none focus:border-orange-500 tabular-nums"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Banknote className="w-4 h-4" />
                <span>Valider le Délestage vers le Tiroir Espèces</span>
              </button>
            </form>
          )}

          {/* TAB 5: HISTORIQUE DES TRANSFERTS */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {history.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-[#11233D]/50 rounded-2xl border border-slate-800">
                  <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs">Aucun transfert d'unités enregistré pour le moment.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#11233D] border border-slate-700/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold shrink-0">
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {item.transferKind === 'inter_operator' && (
                            <span>{item.sourceOperator} ➔ {item.targetOperator}</span>
                          )}
                          {item.transferKind === 'supply_cash_to_uv' && (
                            <span>Espèces ➔ {item.targetOperator} UV</span>
                          )}
                          {item.transferKind === 'p2p_confrere' && (
                            <span>Flotte ➔ {item.recipientName || item.recipientPhone}</span>
                          )}
                          {item.transferKind === 'uv_to_cash' && (
                            <span>{item.sourceOperator} UV ➔ Espèces Cash</span>
                          )}
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                            {item.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.date} à {item.timestamp} · Réf: <span className="font-mono">{item.reference}</span>
                        </div>
                        {item.note && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">
                            {item.note}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-bold text-white tabular-nums">
                        {formatFCFA(item.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400">Frais: {formatFCFA(item.fee)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
