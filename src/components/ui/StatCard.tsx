import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  id?: string;
  label: string;
  value: string | number;
  change?: number | string;
  trendLabel?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  iconBgColor?: string;
  subtext?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  label,
  value,
  change,
  trendLabel = 'vs last 24h',
  isPositive = true,
  icon,
  iconBgColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  subtext,
  onClick
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg border ${iconBgColor}`}>{icon}</div>
      </div>

      <div className="mt-2.5">
        <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">{value}</div>
        
        <div className="flex items-center gap-2 mt-2">
          {change !== undefined && (
            <span
              className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${
                isPositive
                  ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40'
                  : 'text-rose-400 bg-rose-950/60 border border-rose-800/40'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5 inline" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5 inline" />
              )}
              {typeof change === 'number' ? `${change > 0 ? '+' : ''}${change}%` : change}
            </span>
          )}
          {trendLabel && <span className="text-[11px] text-slate-500 font-mono">{trendLabel}</span>}
          {subtext && <span className="text-[11px] text-slate-400 ml-auto font-mono">{subtext}</span>}
        </div>
      </div>
    </div>
  );
};
