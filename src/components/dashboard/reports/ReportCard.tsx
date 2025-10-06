import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';

interface ReportCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  iconColor?: string;
  iconBgColor?: string;
  count?: number;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  iconColor = 'text-navy-600',
  iconBgColor = 'bg-navy-100',
  count,
}) => {
  return (
    <Link href={href}>
      <Card
        variant="elevated"
        padding="lg"
        className="cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 h-full"
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${iconBgColor}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-navy-900 mb-1">{title}</h3>
              {count !== undefined && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                  {count}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
