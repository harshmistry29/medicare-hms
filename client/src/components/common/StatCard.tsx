import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'teal' | 'emerald' | 'rose' | 'amber' | 'indigo' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  onClick,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-sky-50 text-sky-600 border-sky-100',
      bar: 'bg-sky-500',
      iconBg: 'bg-sky-100 text-sky-700',
    },
    teal: {
      bg: 'bg-teal-50 text-teal-600 border-teal-100',
      bar: 'bg-teal-500',
      iconBg: 'bg-teal-100 text-teal-700',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      bar: 'bg-emerald-500',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      bar: 'bg-rose-500',
      iconBg: 'bg-rose-100 text-rose-700',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      bar: 'bg-amber-500',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      bar: 'bg-indigo-500',
      iconBg: 'bg-indigo-100 text-indigo-700',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      bar: 'bg-purple-500',
      iconBg: 'bg-purple-100 text-purple-700',
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${scheme.bar}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ml-auto flex items-center gap-1 ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
