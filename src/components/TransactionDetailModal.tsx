import React, { useState } from 'react';
import { X, Share2, Printer, CheckCircle, Trash2, ArrowDownLeft, ArrowUpRight, Phone, Clock, FileDown } from 'lucide-react';
import { Transaction } from '../types';
import { formatFCFA, getOperatorConfig, getInitials } from '../utils/helpers';
import { exportSingleTransactionReceiptPDF } from '../utils/pdfExport';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onDeleteTransaction
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!isOpen || !transaction) return null;

  const config = getOperatorConfig(transaction.operator);
  const isDeposit = transaction.type === 'Dépôt';
  const isUnit = transaction.type === 'Transfert d’unités';
  const isInternet = transaction.type === 'Pass Internet';
  const isWithdrawal = transaction.type === 'Retrait';

  const typeHeader = isInternet
    ? 'REÇU PASS INTERNET (DATA)'
    : isUnit
    ? 'REÇU RECHARGE CRÉDIT APPEL'
    : `REÇU DE ${transaction.type.toUpperCase()}`;

  const bundleLine = transaction.bundleInfo
    ? `Forfait : ${transaction.bundleInfo.packageName || 'Pass'} - ${transaction.bundleInfo.volume || ''} (${transaction.bundleInfo.validity || ''})\n`
    : '';

  const handleDownloadPDF = () => {
    setDownloadingPdf(true);
    try {
      exportSingleTransactionReceiptPDF(transaction);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 500);
    }
  };

  const receiptText = `*CABINE IBRAHIM - ${typeHeader}*\n--------------------------------\nOpération : ${transaction.type}\nOpérateur : ${transaction.operator}\n${bundleLine}Montant : ${formatFCFA(Math.abs(transaction.amount))}\nClient : ${transaction.clientName}\nContact : ${transaction.clientPhone}\nRéf : ${transaction.reference}\nDate : ${transaction.date} à ${transaction.time}\n--------------------------------\nMerci de votre confiance !`;

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(receiptText);
    const cleanPhone = transaction.clientPhone.replace(/\D/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const amountColor = isDeposit
    ? 'text-[#22C55E]'
    : isUnit
    ? 'text-sky-400'
    : isInternet
    ? 'text-purple-400'
    : 'text-[#FF6B00]';

  const typeBadgeClass = isDeposit
    ? 'bg-emerald-500/20 text-emerald-400'
    : isUnit
    ? 'bg-sky-500/20 text-sky-300'
    : isInternet
    ? 'bg-purple-500/20 text-purple-300'
    : 'bg-orange-500/20 text-orange-400';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-sm bg-[#0D1E36] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 text-slate-100 shadow-2xl relative max-h-[94vh] overflow-y-auto">
        {/* Mobile pull handle */}
        <div className="w-12 h-1 bg-slate-600/70 rounded-full mx-auto mb-3 sm:hidden shrink-0"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Reçu de transaction
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Digital Ticket styling */}
        <div className="mt-4 p-4 rounded-2xl bg-[#11233D] border border-slate-700/60 relative overflow-hidden">
          {/* Subtle watermark logo */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.dotColor }}
              ></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {transaction.operator}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBadgeClass}`}>
              {transaction.type}
            </span>
          </div>

          {/* Big Amount */}
          <div className="text-center my-3">
            <div className={`text-2xl font-extrabold tracking-tight tabular-nums ${amountColor}`}>
              {formatFCFA(Math.abs(transaction.amount))}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Commission cabine : +{formatFCFA(transaction.commission)}
            </div>
          </div>

          {/* Internet Bundle details if available */}
          {transaction.bundleInfo && (
            <div className="mb-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
              <div className="flex items-center justify-between text-purple-200">
                <span className="text-[11px] font-medium">Forfait Internet :</span>
                <strong className="text-white">{transaction.bundleInfo.packageName || 'Pass'}</strong>
              </div>
              <div className="flex items-center justify-between mt-1 text-purple-300 font-bold">
                <span>Volume Data :</span>
                <span className="text-sm font-black text-amber-300">
                  {transaction.bundleInfo.volume}
                </span>
              </div>
              {transaction.bundleInfo.validity && (
                <div className="flex items-center justify-between mt-0.5 text-[10px] text-slate-400">
                  <span>Validité :</span>
                  <span>{transaction.bundleInfo.validity}</span>
                </div>
              )}
            </div>
          )}

          {/* Details list */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-700 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Client :</span>
              <span className="font-semibold text-white">{transaction.clientName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Contact :</span>
              <span className="font-mono text-slate-200">{transaction.clientPhone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Réf. transaction :</span>
              <span className="font-mono text-slate-300 text-[11px]">
                {transaction.reference}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Horodatage :</span>
              <span className="text-slate-300">
                {transaction.date} à {transaction.time}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-orange-600/25"
          >
            <FileDown className="w-4 h-4" />
            <span>{downloadingPdf ? 'Génération du ticket PDF...' : 'Télécharger le reçu officiel (PDF)'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-700/20"
          >
            <Share2 className="w-4 h-4" />
            <span>Partager le reçu via WhatsApp</span>
          </button>

          <button
            onClick={handleCopyReceipt}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>{copied ? 'Reçu copié dans le presse-papier !' : 'Copier le texte du reçu'}</span>
          </button>

          <div className="pt-2 flex justify-between items-center text-xs">
            <button
              onClick={() => {
                if (confirm('Voulez-vous vraiment annuler cette transaction ? Le montant sera réajusté.')) {
                  onDeleteTransaction(transaction.id);
                  onClose();
                }
              }}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 py-1 cursor-pointer transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Annuler la transaction</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white py-1 cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
