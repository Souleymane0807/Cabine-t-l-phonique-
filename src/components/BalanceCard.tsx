import React, { useState } from 'react';
import { Wallet, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { formatFCFA } from '../utils/helpers';

interface BalanceCardProps {
  totalBalance: number;
  totalOperations: number;
  growthPercentage?: number;
  onOpenCaisseModal?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance = 1245000,
  totalOperations = 38,
  growthPercentage = 12,
  onOpenCaisseModal
}) => {
  const [showAmount, setShowAmount] = useState(true);

  return (
    <div className="px-4 sm:px-5 py-2">
      <div className="w-full bg-[#11233D] border border-slate-700/60 rounded-2xl p-4 sm:p-4.5 shadow-lg relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top line: Solde du jour + Wallet Icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Solde du jour</span>
            <button
              onClick={() => setShowAmount(!showAmount)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 transition cursor-pointer active:scale-95"
              title={showAmount ? 'Masquer le solde' : 'Afficher le solde'}
            >
              {showAmount ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Wallet Icon Button */}
          <button
            onClick={onOpenCaisseModal}
            className="w-10 h-10 rounded-xl bg-[#1B3254] flex items-center justify-center text-blue-300 hover:text-white hover:bg-blue-600/30 transition cursor-pointer active:scale-95 shrink-0"
            title="Détails de la caisse"
          >
            <Wallet className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Amount Display */}
        <div className="mt-2 mb-3">
          <div className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight tabular-nums truncate">
            {showAmount ? formatFCFA(totalBalance) : '•••••••• FCFA'}
          </div>
        </div>

        {/* Bottom row: Operations count & Growth vs yesterday */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-700/30 text-[11px] sm:text-xs">
          <span className="text-slate-400 font-medium">
            {totalOperations} opérations
          </span>

          <div className="flex items-center gap-1 text-[#22C55E] font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{growthPercentage}% vs hier</span>
          </div>
        </div>
      </div>
    </div>
  );
};
