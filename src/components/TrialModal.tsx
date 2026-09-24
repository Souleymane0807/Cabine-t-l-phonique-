import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Clock, Award, ArrowRight } from 'lucide-react';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialDaysLeft: number;
  onUpgrade: (plan: string) => void;
}

export const TrialModal: React.FC<TrialModalProps> = ({
  isOpen,
  onClose,
  trialDaysLeft,
  onUpgrade
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'annuel'>('standard');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    onUpgrade(selectedPlan);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-[#0D1E36] border border-orange-500/40 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 text-slate-100 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Mobile pull handle */}
        <div className="w-12 h-1 bg-slate-600/70 rounded-full mx-auto mb-3 sm:hidden shrink-0"></div>

        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge & Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs tracking-wide flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            OFFRE EXCLUSIVE CABINE
          </span>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          1 Mois d'Essai Gratuit Actif
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Votre cabine bénéficie de toutes les fonctionnalités Pro pendant 30 jours sans carte bancaire ni engagement.
        </p>

        {/* Days Left Bar */}
        <div className="my-4 p-3.5 rounded-2xl bg-[#142A4A] border border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              Temps restant d'essai
            </span>
            <span className="font-bold text-orange-400 tabular-nums">
              {trialDaysLeft} jours restants / 30j
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round((trialDaysLeft / 30) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="space-y-2 mb-4 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Gestion unifiée Orange Money, MTN MoMo, Moov & Wave</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Clôture journalière de caisse & calcul des écarts</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Suivi automatique des commissions & gains du gérant</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Partage immédiat de reçus clients via WhatsApp / SMS</span>
          </div>
        </div>

        {/* Plan Selection after trial */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            À la fin des 30 jours gratuits :
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedPlan('standard')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                selectedPlan === 'standard'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-slate-700 bg-[#11223A] opacity-75'
              }`}
            >
              <div className="font-bold text-white text-xs">Forfait Mensuel</div>
              <div className="text-sm font-extrabold text-orange-400 mt-0.5">
                4 900 FCFA
              </div>
              <div className="text-[10px] text-slate-400">/ mois · Sans engagement</div>
            </button>

            <button
              onClick={() => setSelectedPlan('annuel')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
                selectedPlan === 'annuel'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-slate-700 bg-[#11223A] opacity-75'
              }`}
            >
              <span className="absolute top-1 right-1 bg-emerald-500 text-[9px] font-bold text-slate-950 px-1.5 py-0.2 rounded-full">
                -20%
              </span>
              <div className="font-bold text-white text-xs">Forfait Annuel</div>
              <div className="text-sm font-extrabold text-orange-400 mt-0.5">
                49 000 FCFA
              </div>
              <div className="text-[10px] text-slate-400">/ an · 2 mois offerts</div>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-bold text-white text-xs tracking-wide transition shadow-lg shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Profiter de mon mois gratuit maintenant</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSubscribe}
            className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            Confirmer mon abonnement {selectedPlan === 'standard' ? 'Mensuel' : 'Annuel'} dès maintenant
          </button>
        </div>

        {/* Success toast inside modal */}
        {showSuccessToast && (
          <div className="absolute inset-0 bg-[#0D1E36]/95 backdrop-blur flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">Abonnement Confirmé !</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              Votre période d'essai de 30 jours reste active et sans frais. Votre formule débutera après l'essai.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
