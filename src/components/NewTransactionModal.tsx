import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  User,
  Phone,
  Banknote,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Coins,
  Wifi,
  Smartphone,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Operator, Transaction, TransactionType, Client, DataBundle } from '../types';
import { getOperatorConfig, formatFCFA } from '../utils/helpers';
import { DATA_BUNDLES } from '../data/internetBundles';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'time' | 'date' | 'reference'>) => void;
  clients: Client[];
  initialType?: TransactionType;
  initialOperator?: Operator;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  clients,
  initialType = 'Dépôt',
  initialOperator = 'Orange',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [operator, setOperator] = useState<Operator>(initialOperator);
  const [amountStr, setAmountStr] = useState<string>(
    initialType === 'Transfert d’unités' ? '2000' : initialType === 'Pass Internet' ? '2000' : '25000'
  );
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [customCommission, setCustomCommission] = useState<string>('');
  const [useCustomCommission, setUseCustomCommission] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');

  // Pass Internet specific state
  const [selectedBundleId, setSelectedBundleId] = useState<string>('');
  const [bundleDurationFilter, setBundleDurationFilter] = useState<string>('Tous');
  const [isCustomBundle, setIsCustomBundle] = useState<boolean>(false);
  const [customVolume, setCustomVolume] = useState<string>('5 Go');
  const [customValidity, setCustomValidity] = useState<string>('7 Jours');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      if (initialType === 'Transfert d’unités') {
        setAmountStr('2000');
      } else if (initialType === 'Pass Internet') {
        // Pre-select first popular bundle for operator
        const opBundles = DATA_BUNDLES[operator] || [];
        const pop = opBundles.find((b) => b.popular) || opBundles[0];
        if (pop) {
          setSelectedBundleId(pop.id);
          setAmountStr(pop.price.toString());
        }
      }
    }
  }, [isOpen, initialType]);

  // When operator changes while in Pass Internet mode, auto-select a suitable bundle
  useEffect(() => {
    if (type === 'Pass Internet' && !isCustomBundle) {
      const opBundles = DATA_BUNDLES[operator] || [];
      const currentExists = opBundles.find((b) => b.id === selectedBundleId);
      if (!currentExists && opBundles.length > 0) {
        const pop = opBundles.find((b) => b.popular) || opBundles[0];
        setSelectedBundleId(pop.id);
        setAmountStr(pop.price.toString());
      }
    }
  }, [operator, type, isCustomBundle]);

  if (!isOpen) return null;

  const operators: Operator[] = ['Orange', 'MTN', 'Moov', 'Wave'];
  const mobileMoneyQuickAmounts = [2000, 5000, 10000, 25000, 50000, 100000];
  const unitTransferQuickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setClientName(found.name);
      setClientPhone(found.phone);
      if (found.preferredOperator) {
        setOperator(found.preferredOperator);
      }
    }
  };

  const parsedAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;

  // Commission calculation based on transaction type
  let defaultCommission = 0;
  if (parsedAmount > 0) {
    if (type === 'Dépôt' || type === 'Retrait') {
      // ~1% mobile money commission
      defaultCommission = Math.max(100, Math.min(1500, Math.round(parsedAmount * 0.01)));
    } else if (type === 'Transfert d’unités') {
      // ~5% telecom unit commission
      defaultCommission = Math.max(50, Math.round(parsedAmount * 0.05));
    } else if (type === 'Pass Internet') {
      // ~6% data pass commission
      defaultCommission = Math.max(50, Math.round(parsedAmount * 0.06));
    }
  }

  const effectiveCommission =
    useCustomCommission && customCommission
      ? parseInt(customCommission.replace(/\D/g, ''), 10) || 0
      : defaultCommission;

  const handleQuickAddAmount = (addVal: number) => {
    setAmountStr(addVal.toString());
  };

  // Select internet bundle
  const handleSelectBundle = (bundle: DataBundle) => {
    setSelectedBundleId(bundle.id);
    setIsCustomBundle(false);
    setAmountStr(bundle.price.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    const finalName = clientName.trim() || 'Client Guichet';
    const finalPhone = clientPhone.trim() || '+225 07 00 00 00 00';

    let bundleInfo: Transaction['bundleInfo'] | undefined = undefined;
    if (type === 'Pass Internet') {
      if (isCustomBundle) {
        bundleInfo = {
          volume: customVolume,
          validity: customValidity,
          packageName: 'Forfait Personnalisé',
        };
      } else {
        const opBundles = DATA_BUNDLES[operator] || [];
        const found = opBundles.find((b) => b.id === selectedBundleId);
        if (found) {
          bundleInfo = {
            volume: found.volume,
            validity: found.validity,
            packageName: found.name,
          };
        }
      }
    }

    onAddTransaction({
      type,
      operator,
      clientName: finalName,
      clientPhone: finalPhone,
      amount: type === 'Retrait' ? -parsedAmount : parsedAmount,
      commission: effectiveCommission,
      note: note.trim() || undefined,
      bundleInfo,
    });

    onClose();
  };

  const currentBundles = DATA_BUNDLES[operator] || [];
  const filteredBundles = currentBundles.filter((b) => {
    if (bundleDurationFilter === 'Tous') return true;
    if (bundleDurationFilter === 'Jour' && (b.validity.includes('Heures') || b.validity.includes('24'))) return true;
    if (bundleDurationFilter === 'Semaine' && (b.validity.includes('3') || b.validity.includes('7'))) return true;
    if (bundleDurationFilter === 'Mois' && b.validity.includes('30')) return true;
    return true;
  });

  const selectedBundle = currentBundles.find((b) => b.id === selectedBundleId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-xl bg-[#0B1728] border border-slate-700/80 rounded-t-[28px] sm:rounded-3xl p-5 text-slate-100 shadow-2xl relative max-h-[92vh] sm:max-h-[88vh] overflow-y-auto no-scrollbar flex flex-col">
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1 bg-slate-600/70 rounded-full mx-auto mb-3 sm:hidden shrink-0"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Nouvelle Transaction</h2>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-[10px] border border-orange-500/30">
                Guichet Cabine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dépôt, Retrait, Transfert d'Unités & Pass Internet
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-4 flex-1">
          {/* Operation Type: 4 Choices */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Service demandé
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#11233D] rounded-2xl border border-slate-700/70">
              {/* Dépôt */}
              <button
                type="button"
                onClick={() => {
                  setType('Dépôt');
                  setAmountStr('25000');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  type === 'Dépôt'
                    ? 'bg-[#22C55E] text-slate-950 shadow-md font-extrabold ring-1 ring-[#22C55E]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Dépôt Cash</span>
              </button>

              {/* Retrait */}
              <button
                type="button"
                onClick={() => {
                  setType('Retrait');
                  setAmountStr('20000');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  type === 'Retrait'
                    ? 'bg-[#FF6B00] text-white shadow-md font-extrabold ring-1 ring-[#FF6B00]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                <span>Retrait Cash</span>
              </button>

              {/* Transfert d'unités (Crédit d'appel) */}
              <button
                type="button"
                onClick={() => {
                  setType('Transfert d’unités');
                  setAmountStr('2000');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  type === 'Transfert d’unités'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold ring-1 ring-sky-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Smartphone className="w-4 h-4 stroke-[2.5]" />
                <span>Unités Appels</span>
              </button>

              {/* Pass Internet (Data) */}
              <button
                type="button"
                onClick={() => {
                  setType('Pass Internet');
                  const opBundles = DATA_BUNDLES[operator] || [];
                  const pop = opBundles.find((b) => b.popular) || opBundles[0];
                  if (pop) {
                    setSelectedBundleId(pop.id);
                    setAmountStr(pop.price.toString());
                  }
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  type === 'Pass Internet'
                    ? 'bg-purple-500 text-white shadow-md font-extrabold ring-1 ring-purple-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Wifi className="w-4 h-4 stroke-[2.5]" />
                <span>Pass Internet</span>
              </button>
            </div>
          </div>

          {/* Contextual notice */}
          {type === 'Transfert d’unités' && (
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-200 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                <strong>Transfert d'Unités (Crédit d'appel) :</strong> Le client remet les espèces et vous débitez les unités de votre puce agent {operator}. Commission moyenne agent : ~5%.
              </span>
            </div>
          )}

          {type === 'Pass Internet' && (
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                <strong>Transfert Unité Connexion Internet :</strong> Sélectionnez le pass data ou saisissez un volume personnalisé. Les unités internet sont activées sur le mobile du client.
              </span>
            </div>
          )}

          {/* Operator Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Opérateur Réseau
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Puce agent : <strong className="text-white">{operator}</strong>
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {operators.map((op) => {
                const config = getOperatorConfig(op);
                const isSelected = operator === op;
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setOperator(op)}
                    className={`py-2 px-2 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer relative ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/20 text-white shadow-md ring-1 ring-orange-500/50'
                        : 'border-slate-700/70 bg-[#11233D] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: config.dotColor }}
                    ></span>
                    <span className="text-xs font-bold tracking-tight">{op}</span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-400"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASS INTERNET CATALOG (When Pass Internet is active) */}
          {type === 'Pass Internet' && (
            <div className="space-y-2 p-3 bg-[#11233D] border border-purple-500/40 rounded-2xl shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Wifi className="w-3.5 h-3.5 text-purple-400" />
                  <span>Catalogue Pass Internet {operator}</span>
                </div>
                <div className="flex gap-1 text-[10px]">
                  {['Tous', 'Jour', 'Semaine', 'Mois'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setBundleDurationFilter(filter)}
                      className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                        bundleDurationFilter === filter
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Bundles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                {filteredBundles.map((bundle) => {
                  const isSelected = selectedBundleId === bundle.id && !isCustomBundle;
                  return (
                    <button
                      key={bundle.id}
                      type="button"
                      onClick={() => handleSelectBundle(bundle)}
                      className={`p-2 rounded-xl text-left border transition relative cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-950/70 border-purple-400 ring-2 ring-purple-500 text-white shadow-md'
                          : 'bg-[#0B1728] border-slate-700/80 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      {bundle.popular && (
                        <span className="absolute -top-1.5 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-sm">
                          Top
                        </span>
                      )}
                      <div>
                        <div className="text-[11px] font-medium text-slate-400 truncate">
                          {bundle.name}
                        </div>
                        <div className="text-sm font-black text-purple-300 mt-0.5">
                          {bundle.volume}
                        </div>
                      </div>
                      <div className="mt-1.5 pt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{bundle.validity}</span>
                        <strong className="text-white font-bold">{formatFCFA(bundle.price)}</strong>
                      </div>
                    </button>
                  );
                })}

                {/* Option for custom bundle */}
                <button
                  type="button"
                  onClick={() => setIsCustomBundle(true)}
                  className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-center items-center text-center ${
                    isCustomBundle
                      ? 'bg-purple-950/70 border-purple-400 ring-2 ring-purple-500 text-white shadow-md'
                      : 'bg-[#0B1728] border-dashed border-slate-700 hover:border-purple-400/60 text-slate-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400 mb-1" />
                  <div className="text-[11px] font-bold text-white">Pass Sur-Mesure</div>
                  <div className="text-[9px] text-slate-400">Saisie libre volume/prix</div>
                </button>
              </div>

              {/* Custom bundle inputs */}
              {isCustomBundle && (
                <div className="p-2.5 rounded-xl bg-[#091322] border border-purple-500/30 grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">
                      Volume Data (Mo / Go)
                    </label>
                    <input
                      type="text"
                      value={customVolume}
                      onChange={(e) => setCustomVolume(e.target.value)}
                      placeholder="ex: 10 Go"
                      className="w-full bg-[#11233D] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">
                      Validité
                    </label>
                    <input
                      type="text"
                      value={customValidity}
                      onChange={(e) => setCustomValidity(e.target.value)}
                      placeholder="ex: 30 Jours"
                      className="w-full bg-[#11233D] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount input & Quick buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                {type === 'Pass Internet' ? 'Prix du Pass (FCFA)' : 'Montant de l’opération'}
              </label>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                <span>+ Comm: {formatFCFA(effectiveCommission)}</span>
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="2 000"
                min="100"
                step="100"
                required
                className="w-full bg-[#11233D] border border-slate-700 rounded-2xl px-4 py-3 text-2xl font-black text-white tracking-wide placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 tabular-nums"
              />
              <span className="absolute right-4 top-4 text-xs font-bold text-slate-400">
                FCFA
              </span>
            </div>

            {/* Quick amount presets based on mode */}
            {type !== 'Pass Internet' && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {(type === 'Transfert d’unités' ? unitTransferQuickAmounts : mobileMoneyQuickAmounts).map(
                  (q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleQuickAddAmount(q)}
                      className={`px-2.5 py-1 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        parsedAmount === q
                          ? 'bg-orange-500 text-white border-orange-400'
                          : 'bg-[#11233D] border-slate-700/80 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {q >= 1000 ? `${q / 1000}k` : q} F
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => setAmountStr('0')}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer ml-auto flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Effacer</span>
                </button>
              </div>
            )}
          </div>

          {/* Client Details Section */}
          <div className="space-y-3 pt-1 border-t border-slate-800">
            {/* Quick select client from database */}
            {clients.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Client habituel (Optionnel)
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="">Sélectionner un client enregistré...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - {c.preferredOperator}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Nom du Client
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nom ou Prénom"
                    className="w-full bg-[#11233D] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    required
                    className="w-full bg-[#11233D] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500 tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Custom Commission Toggle */}
          <div className="pt-1">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setUseCustomCommission(!useCustomCommission)}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>
                  {useCustomCommission ? 'Utiliser commission standard' : 'Personnaliser ma commission'}
                </span>
              </button>
              {useCustomCommission && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={customCommission}
                    onChange={(e) => setCustomCommission(e.target.value)}
                    placeholder={defaultCommission.toString()}
                    className="w-20 bg-[#11233D] border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white text-right tabular-nums focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">F</span>
                </div>
              )}
            </div>
          </div>

          {/* Note input */}
          <div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note ou référence interne (optionnel)..."
              className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Live Impact Summary Card */}
          <div className="p-3 bg-[#11233D] rounded-2xl border border-slate-700/80 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span>Espèces physiques (Tiroir Cash) :</span>
              <strong
                className={
                  type === 'Retrait' ? 'text-orange-400 font-bold' : 'text-emerald-400 font-bold'
                }
              >
                {type === 'Retrait'
                  ? `-${formatFCFA(parsedAmount)} (Sortie)`
                  : `+${formatFCFA(parsedAmount)} (Encaissement)`}
              </strong>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>Compte Marchand {operator} :</span>
              <strong
                className={
                  type === 'Retrait' ? 'text-emerald-400 font-bold' : 'text-orange-400 font-bold'
                }
              >
                {type === 'Retrait'
                  ? `+${formatFCFA(parsedAmount)} UV`
                  : `-${formatFCFA(parsedAmount)} UV`}
              </strong>
            </div>

            {type === 'Pass Internet' && (
              <div className="flex items-center justify-between text-purple-300 pt-1 border-t border-slate-700/50">
                <span>Forfait envoyé au client :</span>
                <strong>
                  {isCustomBundle
                    ? `${customVolume} / ${customValidity}`
                    : `${selectedBundle?.volume || ''} (${selectedBundle?.validity || ''})`}
                </strong>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-700/50">
              <span className="flex items-center gap-1 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Commission nette cabine :
              </span>
              <strong className="text-amber-400 font-bold text-sm">
                +{formatFCFA(effectiveCommission)}
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={parsedAmount <= 0}
              className={`w-2/3 py-3 rounded-2xl text-white font-bold text-xs tracking-wide shadow-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                type === 'Dépôt'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                  : type === 'Retrait'
                  ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/25'
                  : type === 'Transfert d’unités'
                  ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-500/25'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {type === 'Dépôt'
                  ? 'Valider le Dépôt Cash'
                  : type === 'Retrait'
                  ? 'Valider le Retrait Cash'
                  : type === 'Transfert d’unités'
                  ? 'Valider le Transfert d’Unités'
                  : 'Valider & Activer le Pass'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
