import React from 'react';
import { StatCardData } from '@/lib/types/dashboard';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface StatCardProps {
  data: StatCardData;
}

const iconMap = Icons as Record<string, LucideIcon>;

export const StatCard: React.FC<StatCardProps> = ({ data }) => {
  const { label, value, change, changeLabel, icon, trend, color = 'primary' } = data;

  // Color variants
  const colorClasses = {
    primary: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    success: 'bg-green-500/10 text-green-600 border-green-500/20',
    warning: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    danger: 'bg-red-500/10 text-red-600 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  };

  const iconColorClasses = {
    primary: 'text-yellow-600',
    success: 'text-green-600',
    warning: 'text-orange-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
  };

  const Icon = icon ? iconMap[icon] : null;

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-navy-900 mb-3">{value}</p>

          {/* Change indicator */}
          {change !== undefined && (
            <div className="flex items-center gap-1">
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-sm font-semibold">
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
              </div>
              {changeLabel && (
                <span className="text-sm text-gray-500 ml-1">{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
          </div>
        )}
      </div>
    </div>
  );
};
