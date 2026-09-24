import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingNewTxButtonProps {
  onClick: () => void;
}

export const FloatingNewTxButton: React.FC<FloatingNewTxButtonProps> = ({ onClick }) => {
  return (
    <div className="sticky bottom-[76px] sm:bottom-20 z-40 flex justify-end px-3 sm:px-4 pointer-events-none -mt-14 mb-2">
      <button
        onClick={onClick}
        aria-label="Enregistrer une nouvelle transaction"
        className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-full bg-gradient-to-r from-[#FF6B00] via-[#FF7A00] to-[#FFA000] hover:from-[#FF5500] hover:to-[#FF8500] text-white font-bold text-xs sm:text-sm shadow-[0_8px_25px_-4px_rgba(255,107,0,0.6)] border border-orange-400/40 active:scale-95 transition-all cursor-pointer group"
      >
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
          <Plus className="w-3.5 h-3.5 stroke-[3] text-white" />
        </div>
        <span className="tracking-tight whitespace-nowrap">
          <span className="hidden xs:inline">Nouvelle </span>Transaction
        </span>
      </button>
    </div>
  );
};
