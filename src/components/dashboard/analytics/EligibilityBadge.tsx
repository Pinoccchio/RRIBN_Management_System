import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { EligibilityStatus } from '@/lib/types/analytics';

interface EligibilityBadgeProps {
  status: EligibilityStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const config = {
    eligible: {
      label: 'Fully Eligible',
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-800 border border-green-200',
    },
    partially_eligible: {
      label: 'Partially Eligible',
      icon: AlertCircle,
      className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    },
    not_eligible: {
      label: 'Not Eligible',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 border border-red-200',
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${className}`}>
      <Icon className={iconSizes[size]} />
      <span>{label}</span>
    </div>
  );
};
