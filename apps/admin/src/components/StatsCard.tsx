import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconBg = 'bg-emerald-50',
  iconColor = 'text-[#059669]',
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-[22px] p-6 border border-emerald-900/5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </span>
        <div className={`w-11 h-11 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {value}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-gray-500 font-medium">
            {subtitle}
          </span>
        )}
        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              trend.isPositive ? 'text-[#059669]' : 'text-rose-600'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
            </span>
            {trend.label && <span className="text-gray-400 font-normal">{trend.label}</span>}
          </span>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
