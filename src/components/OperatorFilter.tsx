import React from 'react';
import { Operator } from '../types';

interface OperatorFilterProps {
  selectedOperator: string; // 'Tous' | Operator
  onSelectOperator: (op: string) => void;
}

export const OperatorFilter: React.FC<OperatorFilterProps> = ({
  selectedOperator,
  onSelectOperator
}) => {
  const operators: { label: string; value: string; dotColor?: string }[] = [
    { label: 'Tous', value: 'Tous' },
    { label: 'Orange', value: 'Orange', dotColor: '#FF6B00' },
    { label: 'MTN', value: 'MTN', dotColor: '#FFCC00' },
    { label: 'Moov', value: 'Moov', dotColor: '#00A859' },
    { label: 'Wave', value: 'Wave', dotColor: '#1DC4FF' },
  ];

  return (
    <div className="px-4 sm:px-5 py-2 overflow-x-auto no-scrollbar flex items-center gap-2 sm:gap-2.5 touch-pan-x select-none">
      {operators.map((op) => {
        const isSelected = selectedOperator === op.value;

        if (op.value === 'Tous') {
          return (
            <button
              key={op.value}
              onClick={() => onSelectOperator(op.value)}
              className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-600/20'
                  : 'bg-[#11223A] text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              {op.label}
            </button>
          );
        }

        return (
          <button
            key={op.value}
            onClick={() => onSelectOperator(op.value)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
              isSelected
                ? 'bg-[#FF6B00] text-white font-semibold shadow-md shadow-orange-600/20'
                : 'bg-[#11223A] text-slate-300 hover:text-white border border-slate-700/60'
            }`}
          >
            {/* Color dot like in screenshot */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: op.dotColor }}
            ></span>
            <span>{op.label}</span>
          </button>
        );
      })}
    </div>
  );
};
