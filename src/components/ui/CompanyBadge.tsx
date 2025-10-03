import React from 'react';
import { COMPANIES, type CompanyCode } from '@/lib/types/staff';

interface CompanyBadgeProps {
  companyCode: CompanyCode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompanyBadge({ companyCode, size = 'sm', className = '' }: CompanyBadgeProps) {
  const company = COMPANIES.find(c => c.code === companyCode);

  if (!company) {
    return null;
  }

  // Color mapping for each company
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colorClasses[company.color as keyof typeof colorClasses]} ${sizeClasses[size]} ${className}`}
      title={company.name}
    >
      {company.code}
    </span>
  );
}

// Company Badge List Component - Shows multiple company badges
interface CompanyBadgeListProps {
  companyCodes: string[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  className?: string;
}

export function CompanyBadgeList({
  companyCodes,
  size = 'sm',
  maxDisplay = 3,
  className = ''
}: CompanyBadgeListProps) {
  const displayCodes = companyCodes.slice(0, maxDisplay);
  const remaining = companyCodes.length - maxDisplay;

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {displayCodes.map((code) => (
        <CompanyBadge
          key={code}
          companyCode={code as CompanyCode}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-gray-600 ml-1">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
