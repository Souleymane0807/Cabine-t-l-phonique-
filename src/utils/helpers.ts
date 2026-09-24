import { Operator } from '../types';

export function formatFCFA(amount: number, showSign: boolean = false): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = absVal.toLocaleString('fr-FR');
  
  if (showSign && isNegative) {
    return `- ${formatted} FCFA`;
  } else if (showSign && amount > 0) {
    return `+ ${formatted} FCFA`;
  }
  return `${isNegative ? '- ' : ''}${formatted} FCFA`;
}

export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getOperatorConfig(operator: Operator) {
  switch (operator) {
    case 'Orange':
      return {
        name: 'Orange',
        dotColor: '#FF6B00',
        badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        activeFilterBg: 'bg-[#FF6B00] text-white',
        borderFocus: 'border-orange-500',
        accentColor: '#FF6B00',
        logoText: 'Orange Money'
      };
    case 'MTN':
      return {
        name: 'MTN',
        dotColor: '#FFCC00',
        badgeBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        activeFilterBg: 'bg-[#FFCC00] text-slate-900 font-bold',
        borderFocus: 'border-yellow-400',
        accentColor: '#FFCC00',
        logoText: 'MTN MoMo'
      };
    case 'Moov':
      return {
        name: 'Moov',
        dotColor: '#00A859',
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        activeFilterBg: 'bg-[#00A859] text-white',
        borderFocus: 'border-emerald-500',
        accentColor: '#00A859',
        logoText: 'Moov Money'
      };
    case 'Wave':
      return {
        name: 'Wave',
        dotColor: '#1DC4FF',
        badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        activeFilterBg: 'bg-[#1DC4FF] text-slate-900 font-bold',
        borderFocus: 'border-sky-400',
        accentColor: '#1DC4FF',
        logoText: 'Wave'
      };
  }
}
