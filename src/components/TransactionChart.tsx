import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { TrendingUp, BarChart3, Calendar, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../types';
import { formatFCFA } from '../utils/helpers';

interface TransactionChartProps {
  transactions: Transaction[];
}

type ChartMetric = 'volume' | 'flux' | 'count';

export const TransactionChart: React.FC<TransactionChartProps> = ({ transactions }) => {
  const [metric, setMetric] = useState<ChartMetric>('volume');
  const [isExpanded, setIsExpanded] = useState(true);

  // Compute 7 days of data ending today
  // Days of week in French
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const today = new Date();

  // Baseline data for the previous 6 days + today calculated from current transactions
  const todayDepots = transactions
    .filter((t) => t.type !== 'Retrait')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const todayRetraits = transactions
    .filter((t) => t.type === 'Retrait')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const todayCount = transactions.length;
  const todayVolume = todayDepots + todayRetraits;

  // 7 days timeline
  const rawDays = [
    { dayOffset: 6, depots: 720000, retraits: 410000, count: 28 },
    { dayOffset: 5, depots: 850000, retraits: 520000, count: 32 },
    { dayOffset: 4, depots: 990000, retraits: 610000, count: 35 },
    { dayOffset: 3, depots: 680000, retraits: 390000, count: 24 },
    { dayOffset: 2, depots: 1120000, retraits: 750000, count: 41 },
    { dayOffset: 1, depots: 1050000, retraits: 680000, count: 36 },
    { dayOffset: 0, depots: todayDepots > 0 ? todayDepots : 1245000, retraits: todayRetraits > 0 ? todayRetraits : 640000, count: todayCount > 0 ? 38 + todayCount : 38 },
  ];

  const chartData = rawDays.map((item, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - item.dayOffset);
    const dayLabel = idx === 6 ? "Auj." : dayNames[d.getDay()];
    const dateNum = `${d.getDate()}/${d.getMonth() + 1}`;

    const totalVolume = item.depots + item.retraits;

    return {
      day: dayLabel,
      fullDate: dateNum,
      volume: totalVolume,
      depots: item.depots,
      retraits: item.retraits,
      count: item.count,
    };
  });

  const total7DaysVolume = chartData.reduce((acc, curr) => acc + curr.volume, 0);
  const avgDaily = Math.round(total7DaysVolume / 7);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#091524] border border-slate-700/90 rounded-xl p-2.5 shadow-xl text-xs z-50 min-w-[150px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
            <span className="font-bold text-white">{data.day} ({data.fullDate})</span>
            <span className="text-[10px] text-slate-400">{data.count} ops</span>
          </div>

          {metric === 'volume' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[11px] text-slate-400">Volume total :</span>
                <span className="font-bold text-orange-400 tabular-nums">
                  {formatFCFA(data.volume)}
                </span>
              </div>
            </div>
          )}

          {metric === 'flux' && (
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-emerald-400">
                <span>Dépôts :</span>
                <span className="font-semibold tabular-nums">{formatFCFA(data.depots)}</span>
              </div>
              <div className="flex items-center justify-between text-orange-400">
                <span>Retraits :</span>
                <span className="font-semibold tabular-nums">-{formatFCFA(data.retraits)}</span>
              </div>
            </div>
          )}

          {metric === 'count' && (
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-[11px] text-slate-400">Transactions :</span>
              <span className="font-bold text-white tabular-nums">{data.count} opérations</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="px-4 sm:px-5 py-2">
      <div className="w-full bg-[#11233D] border border-slate-700/60 rounded-2xl p-3.5 sm:p-4 shadow-lg relative overflow-hidden">
        {/* Header with Title & Expand/Collapse */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs font-bold text-white tracking-wide truncate">
                  Évolution 7 Derniers Jours
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shrink-0">
                  +14%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                Moy. {formatFCFA(avgDaily)} / jour
              </p>
            </div>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center bg-[#091524] rounded-lg p-0.5 border border-slate-800 text-[10px] self-start xs:self-auto shrink-0">
            <button
              onClick={() => setMetric('volume')}
              className={`px-2 py-1 rounded-md transition cursor-pointer active:scale-95 ${
                metric === 'volume'
                  ? 'bg-orange-500 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setMetric('flux')}
              className={`px-2 py-1 rounded-md transition cursor-pointer active:scale-95 ${
                metric === 'flux'
                  ? 'bg-orange-500 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Flux
            </button>
            <button
              onClick={() => setMetric('count')}
              className={`px-2 py-1 rounded-md transition cursor-pointer active:scale-95 ${
                metric === 'count'
                  ? 'bg-orange-500 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ops
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="w-full h-44 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            {metric === 'volume' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 6, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C314E" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={{ stroke: '#1C314E' }}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B', fontSize: 9 }}
                  tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#FF6B00"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#volumeGradient)"
                  dot={{ r: 3, fill: '#FF6B00', strokeWidth: 1, stroke: '#FFFFFF' }}
                  activeDot={{ r: 5, fill: '#FF6B00', strokeWidth: 2, stroke: '#FFFFFF' }}
                />
              </AreaChart>
            ) : metric === 'flux' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C314E" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={{ stroke: '#1C314E' }}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B', fontSize: 9 }}
                  tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="depots" name="Dépôts" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="retraits" name="Retraits" fill="#FF6B00" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C314E" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={{ stroke: '#1C314E' }}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B', fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#countGradient)"
                  dot={{ r: 3, fill: '#38BDF8', strokeWidth: 1, stroke: '#FFFFFF' }}
                  activeDot={{ r: 5, fill: '#38BDF8', strokeWidth: 2, stroke: '#FFFFFF' }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend / Micro Stats */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-700/40 text-[11px]">
          {metric === 'flux' ? (
            <div className="flex items-center gap-4 text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]"></span>
                <span className="text-slate-400">Dépôts (entrées)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FF6B00]"></span>
                <span className="text-slate-400">Retraits (sorties)</span>
              </span>
            </div>
          ) : (
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pic d'activité : <strong>Mardi (1.87M FCFA)</strong></span>
            </span>
          )}

          <span className="text-slate-300 font-bold tabular-nums">
            7j : {formatFCFA(total7DaysVolume)}
          </span>
        </div>
      </div>
    </div>
  );
};
