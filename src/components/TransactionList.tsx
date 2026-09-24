import React from 'react';
import { ChevronRight, ArrowDownLeft, ArrowUpRight, FileDown } from 'lucide-react';
import { Transaction } from '../types';
import { formatFCFA, getInitials, getOperatorConfig } from '../utils/helpers';

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onViewAll?: () => void;
  showAll?: boolean;
  onExportPDF?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onSelectTransaction,
  onViewAll,
  showAll = false,
  onExportPDF
}) => {
  return (
    <div className="px-4 sm:px-5 py-2 flex flex-col gap-2.5 pb-24">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
          Dernières transactions
        </h2>
        <div className="flex items-center gap-2">
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              title="Exporter les transactions en PDF"
              className="text-xs px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white flex items-center gap-1 transition cursor-pointer font-medium active:scale-95"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          )}
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs text-slate-400 hover:text-orange-400 flex items-center transition cursor-pointer active:scale-95"
            >
              <span>{showAll ? 'Réduire' : 'Voir tout'}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Transaction Items */}
      {transactions.length === 0 ? (
        <div className="bg-[#11233D]/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          <p className="text-sm">Aucune transaction trouvée pour ce filtre.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const config = getOperatorConfig(tx.operator);
            const isDeposit = tx.type === 'Dépôt';
            const isUnit = tx.type === 'Transfert d’unités';
            const isInternet = tx.type === 'Pass Internet';
            const isWithdrawal = tx.type === 'Retrait';

            const amountColor = isDeposit
              ? 'text-[#22C55E]'
              : isUnit
              ? 'text-sky-400'
              : isInternet
              ? 'text-purple-400'
              : 'text-[#FF6B00]';

            const displayAmount = isWithdrawal
              ? `- ${Math.abs(tx.amount).toLocaleString('fr-FR')} FCFA`
              : `+ ${Math.abs(tx.amount).toLocaleString('fr-FR')} FCFA`;

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="w-full bg-[#11233D] hover:bg-[#152B4B] border border-slate-700/50 hover:border-slate-600 rounded-2xl p-3 flex items-center justify-between gap-2.5 transition-all cursor-pointer active:scale-[0.99] select-none"
              >
                {/* Left: Avatar with Initials */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1A3254] border border-slate-600/40 flex items-center justify-center font-bold text-slate-200 text-xs sm:text-sm shrink-0 relative">
                    {getInitials(tx.clientName)}
                    {isInternet && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-600 border border-slate-900 flex items-center justify-center text-[9px] text-white">
                        🌐
                      </span>
                    )}
                    {isUnit && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-sky-600 border border-slate-900 flex items-center justify-center text-[9px] text-white">
                        📞
                      </span>
                    )}
                  </div>

                  {/* Middle: Type & Operator + Client Name */}
                  <div className="text-left min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[13px] sm:text-[14px] font-semibold text-white leading-tight truncate">
                        {tx.type}
                      </span>
                      {isInternet && tx.bundleInfo?.volume && (
                        <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                          {tx.bundleInfo.volume}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 min-w-0">
                      {/* Operator dot */}
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: config.dotColor }}
                      ></span>
                      <span className="font-medium text-slate-300 shrink-0">{tx.operator}</span>
                      <span className="text-slate-400 truncate max-w-[90px] xs:max-w-[130px] sm:max-w-none">{tx.clientName}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Time */}
                <div className="text-right shrink-0 ml-1">
                  <div className={`text-[13px] sm:text-[14px] font-bold tabular-nums tracking-tight ${amountColor}`}>
                    {displayAmount}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 tabular-nums flex items-center justify-end gap-1">
                    <span>{tx.time}</span>
                    {tx.commission > 0 && (
                      <span className="text-[9px] sm:text-[10px] text-amber-400 font-semibold">
                        (+{tx.commission}F)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
