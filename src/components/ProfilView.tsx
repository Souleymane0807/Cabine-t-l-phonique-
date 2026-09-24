import React, { useState } from 'react';
import { User, Sparkles, Shield, Phone, FileText, HelpCircle, ChevronRight, Settings, Check, Store, ArrowDownToLine } from 'lucide-react';
import { Transaction, CaisseBalances } from '../types';
import { formatFCFA } from '../utils/helpers';
import { exportTransactionsToPDF } from '../utils/pdfExport';

interface ProfilViewProps {
  onOpenTrial: () => void;
  trialDaysLeft: number;
  transactions: Transaction[];
  onResetData: () => void;
  caisse?: CaisseBalances;
}

export const ProfilView: React.FC<ProfilViewProps> = ({
  onOpenTrial,
  trialDaysLeft,
  transactions,
  onResetData,
  caisse
}) => {
  const [cabineName, setCabineName] = useState("Cabine Ibrahim - Espace Mobile Money");
  const [phoneNumber, setPhoneNumber] = useState("+225 07 48 00 12 34");
  const [city, setCity] = useState("Abidjan, Cocody Riviera 2");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const handleExportPDF = () => {
    setPdfGenerating(true);
    try {
      exportTransactionsToPDF(
        transactions,
        {
          cabineName,
          managerName: 'Ibrahim Traoré',
          phoneNumber,
          location: city,
          title: 'Journal & Bilan des Transactions Mobile Money',
        },
        caisse
      );
    } catch (err) {
      console.error('Erreur export PDF', err);
    } finally {
      setTimeout(() => setPdfGenerating(false), 800);
    }
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="px-4 sm:px-5 py-3 flex flex-col gap-3 pb-24">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Profil & Paramètres</h2>
        <p className="text-xs text-slate-400">
          Configuration de votre point de vente et abonnement
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-5">
        {/* Left Column on Desktop */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* Profile Card */}
          <div className="p-4 rounded-2xl bg-[#11233D] border border-slate-700/60 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-amber-500 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-orange-600/20 shrink-0">
              IT
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate">Ibrahim Traoré</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Gérant
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{cabineName}</p>
              <p className="text-[11px] text-slate-400 font-mono">{phoneNumber} · {city}</p>
            </div>
          </div>

          {/* Cabine Information Form */}
          <div className="p-4 rounded-2xl bg-[#11233D] border border-slate-700/50">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-orange-400" />
              Informations de la Cabine
            </h4>

            <form onSubmit={handleSaveInfo} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Nom commercial de la cabine
                </label>
                <input
                  type="text"
                  value={cabineName}
                  onChange={(e) => setCabineName(e.target.value)}
                  className="w-full bg-[#0D1E36] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Numéro de téléphone principal (SMS / Reçus)
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#0D1E36] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Localisation / Quartier
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#0D1E36] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Modifications enregistrées !</span>
                  </>
                ) : (
                  <span>Enregistrer les coordonnées</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column on Desktop */}
        <div className="lg:col-span-6 flex flex-col gap-3 mt-3 lg:mt-0">
          {/* Free Trial Banner Card */}
          <div
            onClick={onOpenTrial}
            className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-orange-500/20 border border-orange-500/50 cursor-pointer hover:border-orange-500 transition relative overflow-hidden group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                    Abonnement en cours
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    1 Mois d'Essai Gratuit
                  </div>
                  <div className="text-xs text-slate-300">
                    {trialDaysLeft} jours restants sur votre offre d'essai
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition" />
            </div>

            <div className="mt-3 pt-3 border-t border-orange-500/20 flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Accès illimité à tous les opérateurs</span>
              <span className="font-bold text-orange-400">Gérer l'offre</span>
            </div>
          </div>

          {/* Data Management & Actions */}
          <div className="space-y-2">
            <button
              onClick={handleExportPDF}
              disabled={pdfGenerating}
              className="w-full p-3.5 rounded-2xl bg-[#11233D] hover:bg-[#162D4E] border border-orange-500/40 hover:border-orange-500 flex items-center justify-between text-xs text-slate-100 transition cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                    <span className="truncate">Journal des Transactions (PDF)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30 shrink-0">
                      PDF
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {pdfGenerating ? 'Génération du fichier PDF...' : 'Rapport officiel avec récapitulatif & commissions'}
                  </div>
                </div>
              </div>
              <ArrowDownToLine className={`w-4.5 h-4.5 text-orange-400 shrink-0 ml-1 ${pdfGenerating ? 'animate-bounce' : 'group-hover:translate-y-0.5 transition'}`} />
            </button>

            <a
              href="https://wa.me/2250700000000?text=Bonjour%2C%20j%27ai%20une%20question%20sur%20mon%20essai%20gratuit%20CabinePay"
              target="_blank"
              rel="noreferrer"
              className="w-full p-3 rounded-2xl bg-[#11233D] hover:bg-[#162D4E] border border-slate-700/60 flex items-center justify-between text-xs text-slate-200 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Assistance & Support WhatsApp Cabine</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </a>

            <button
              onClick={() => {
                if (confirm("Réinitialiser les données aux valeurs de la capture d'écran initiale ?")) {
                  onResetData();
                }
              }}
              className="w-full p-3 rounded-2xl bg-[#11233D] hover:bg-red-500/10 border border-slate-700/60 hover:border-red-500/30 flex items-center justify-between text-xs text-red-400 transition cursor-pointer"
            >
              <span>Réinitialiser les transactions de démo</span>
              <span className="text-[10px] text-slate-400">Restaurer capture</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
