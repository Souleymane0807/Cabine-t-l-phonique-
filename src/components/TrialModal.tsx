import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowRight,
  AlertTriangle,
  CreditCard,
  Smartphone,
  RotateCcw,
  Zap,
  Lock,
  Check,
  Loader2,
  Calendar,
  Receipt
} from 'lucide-react';
import { Operator } from '../types';
import { formatFCFA } from '../utils/helpers';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialDaysLeft: number;
  isSubscribed?: boolean;
  onUpgrade: (operator: Operator, phone: string) => void;
  onSetTrialDays?: (days: number) => void;
  onCancelSubscription?: () => void;
  forcePayment?: boolean;
}

export const TrialModal: React.FC<TrialModalProps> = ({
  isOpen,
  onClose,
  trialDaysLeft,
  isSubscribed = false,
  onUpgrade,
  onSetTrialDays,
  onCancelSubscription,
  forcePayment = false,
}) => {
  const [selectedOperator, setSelectedOperator] = useState<Operator>('Orange');
  const [phoneNumber, setPhoneNumber] = useState('0708091011');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isExpired = trialDaysLeft <= 0 && !isSubscribed;
  const MONTHLY_PRICE = 10000; // 10 000 FCFA / mois

  const handleProcessPayment = () => {
    setErrorMessage(null);
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setErrorMessage('Veuillez renseigner un numéro de téléphone Mobile Money valide.');
      return;
    }

    setPaymentStatus('processing');

    // Simulate realistic Mobile Money payment authorization flow
    setTimeout(() => {
      setPaymentStatus('success');
      onUpgrade(selectedOperator, phoneNumber);
      setTimeout(() => {
        setPaymentStatus('idle');
        onClose();
      }, 2200);
    }, 1800);
  };

  const operatorDetails: Record<
    Operator,
    { name: string; color: string; border: string; bg: string; logoText: string }
  > = {
    Orange: {
      name: 'Orange Money',
      color: '#FF6B00',
      border: 'border-[#FF6B00]/60',
      bg: 'bg-[#FF6B00]/15',
      logoText: 'OM',
    },
    MTN: {
      name: 'MTN MoMo',
      color: '#FFCC00',
      border: 'border-yellow-500/60',
      bg: 'bg-yellow-500/15',
      logoText: 'MoMo',
    },
    Moov: {
      name: 'Moov Money',
      color: '#00A859',
      border: 'border-emerald-500/60',
      bg: 'bg-emerald-500/15',
      logoText: 'Flooz',
    },
    Wave: {
      name: 'Wave CI',
      color: '#1DC4FF',
      border: 'border-sky-500/60',
      bg: 'bg-sky-500/15',
      logoText: 'Wave',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full sm:max-w-xl bg-[#0B1728] border border-orange-500/50 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 text-slate-100 shadow-2xl relative overflow-hidden max-h-[94vh] overflow-y-auto no-scrollbar">
        {/* Mobile pull handle */}
        <div className="w-12 h-1 bg-slate-600/70 rounded-full mx-auto mb-3 sm:hidden shrink-0"></div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-orange-500/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button (disabled if forced payment and trial expired without subscription) */}
        {!isExpired && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer active:scale-95 z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ============================================================ */}
        {/* CASE 1: ALREADY SUBSCRIBED ACTIVE PRO PLAN                  */}
        {/* ============================================================ */}
        {isSubscribed ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs tracking-wider uppercase inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Abonnement Actif · 10 000 FCFA / mois
              </span>
              <h2 className="text-2xl font-black text-white mt-2">
                Compte Professionnel CabinePay
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                Votre point de vente bénéficie d'un accès illimité à tous les opérateurs (Orange, MTN, Moov, Wave),
                aux transferts d'unités, pass internet et passerelles UV.
              </p>
            </div>

            {/* Plan Info Card */}
            <div className="p-4 rounded-2xl bg-[#11233D] border border-slate-700/70 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Tarif mensuel :</span>
                <span className="font-bold text-white text-sm">{formatFCFA(MONTHLY_PRICE)} / mois</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Statut :</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Opérationnel sans interruption
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Opérateurs connectés :</span>
                <span className="text-slate-200 font-medium">Orange · MTN · Moov · Wave</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Retourner à ma cabine
              </button>
              {onCancelSubscription && (
                <button
                  onClick={onCancelSubscription}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition cursor-pointer"
                >
                  Revenir en période d'essai
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* CASE 2: TRIAL ACTIVE OR EXPIRED -> DIRECT TO 10 000 FCFA/MO  */
          /* ============================================================ */
          <div className="space-y-4">
            {/* Header Badge */}
            <div>
              {isExpired ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black tracking-wide animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  PÉRIODE D'ESSAI TERMINÉE
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs tracking-wide shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  1 MOIS D'ESSAI GRATUIT ACTIF
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isExpired
                  ? 'Abonnement Requis pour Continuer'
                  : 'Tarif Cabine : 10 000 FCFA / mois'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {isExpired
                  ? 'Vos 30 jours gratuits sont arrivés à échéance. Activez votre forfait mensuel de dix mille (10 000) francs CFA pour débloquer immédiatement votre caisse.'
                  : 'Profitez de 30 jours sans engagement. Dès la fin de l’essai, continuez à gérer votre point de vente pour seulement 10 000 FCFA par mois.'}
              </p>
            </div>

            {/* Trial Countdown Bar (if still in trial) */}
            {!isExpired && (
              <div className="p-3.5 rounded-2xl bg-[#11233D] border border-slate-700/60">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    Temps restant sur votre essai gratuit :
                  </span>
                  <span className="font-extrabold text-orange-400 tabular-nums">
                    {trialDaysLeft} jours / 30j
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, Math.round((trialDaysLeft / 30) * 100))}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Pricing Offer Card: 10 000 FCFA / mois */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#11233D] via-[#142A4A] to-[#11233D] border-2 border-orange-500/60 shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-wider border border-orange-500/40">
                    Formule Pro Cabine
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-3xl font-black text-white tracking-tight">
                      10 000
                    </span>
                    <span className="text-sm font-extrabold text-orange-400">FCFA</span>
                    <span className="text-xs text-slate-400 font-normal">/ mois</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Sans engagement · Résiliation libre · Facturation par Mobile Money
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>

              {/* Inclusions */}
              <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Orange, MTN, Moov & Wave</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Transferts unités & Pass Net</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Passerelle UV & dépannages</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Clôtures & alertes de caisse</span>
                </div>
              </div>
            </div>

            {/* Mobile Money Operator Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Régler par Mobile Money (Côte d'Ivoire) :
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Orange', 'MTN', 'Moov', 'Wave'] as Operator[]).map((op) => {
                  const details = operatorDetails[op];
                  const isSelected = selectedOperator === op;

                  return (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setSelectedOperator(op)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
                        isSelected
                          ? `${details.border} ${details.bg} ring-2 ring-orange-500/50 shadow-md`
                          : 'border-slate-700/70 bg-[#11233D] hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] shadow-sm text-white"
                        style={{ backgroundColor: details.color }}
                      >
                        {details.logoText}
                      </div>
                      <span className="text-[11px] font-bold text-white truncate max-w-full">
                        {op}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Numéro du compte {operatorDetails[selectedOperator].name} :
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                  +225
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07 00 00 00 00"
                  className="w-full bg-[#11233D] border border-slate-700/80 rounded-xl pl-16 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Payment Trigger Button */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={paymentStatus === 'processing'}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF6B00] via-orange-500 to-amber-500 hover:from-[#FF5500] hover:to-amber-600 text-white font-black text-sm tracking-wide shadow-xl shadow-orange-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75"
              >
                {paymentStatus === 'processing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Autorisation {selectedOperator} en cours...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Payer 10 000 FCFA via {selectedOperator} Money</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {!isExpired && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-center text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Continuer avec mon essai gratuit ({trialDaysLeft} jours restants)
                </button>
              )}
            </div>

            {/* Test & Simulation Utilities (Developer & Demo Helper) */}
            {onSetTrialDays && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2 bg-[#091422] p-2.5 rounded-xl border border-slate-800/80">
                <span className="font-semibold text-slate-300">Test de démonstration :</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onSetTrialDays(0);
                    }}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition ${
                      trialDaysLeft === 0
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    Simuler fin d'essai (0j)
                  </button>
                  <button
                    onClick={() => {
                      onSetTrialDays(30);
                    }}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition ${
                      trialDaysLeft > 0
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    Rétablir 30 jours
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing / Success Screen Overlay */}
        {paymentStatus === 'success' && (
          <div className="absolute inset-0 bg-[#0B1728]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-3 animate-bounce">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-black text-white">
              Paiement de 10 000 FCFA Validé !
            </h3>
            <p className="text-xs text-slate-300 mt-2 max-w-sm">
              Votre abonnement mensuel à <strong>10 000 FCFA</strong> a été activé avec succès via{' '}
              <strong>{operatorDetails[selectedOperator].name}</strong>. Votre point de vente est débloqué.
            </p>
            <div className="mt-4 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Abonnement Pro Actif pour 30 jours</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
