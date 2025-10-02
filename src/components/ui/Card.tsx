import React from 'react';
import { cn } from '@/lib/design-system/utils';

export type CardVariant = 'default' | 'elevated' | 'bordered' | 'military' | 'glass';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  padding = 'md',
}) => {
  const variantStyles = {
    default: 'bg-white rounded-xl border border-gray-200 shadow-sm',
    elevated: 'bg-white rounded-xl shadow-military border-l-4 border-yellow-500',
    bordered: 'bg-white rounded-xl border-2 border-gray-200',
    military: 'bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl border border-yellow-500/20 text-white shadow-military-lg',
    glass: 'bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover
    ? 'transition-all duration-300 hover:shadow-military-lg hover:-translate-y-1'
    : '';

  return (
    <div className={cn(
      variantStyles[variant],
      paddingStyles[padding],
      hoverStyles,
      className
    )}>
      {children}
    </div>
  );
};

// Card Header
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  gradient = false,
}) => {
  return (
    <div className={cn(
      'border-b border-gray-200 pb-4 mb-4',
      gradient && 'border-b-2 border-yellow-500/20',
      className
    )}>
      {children}
    </div>
  );
};

// Card Title
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  gradient = false,
}) => {
  return (
    <h3 className={cn(
      'text-xl font-bold',
      gradient ? 'bg-gradient-to-r from-navy-900 to-navy-700 bg-clip-text text-transparent' : 'text-navy-900',
      className
    )}>
      {children}
    </h3>
  );
};

// Card Description
interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = '',
}) => {
  return (
    <p className={cn('text-sm text-gray-600 mt-1', className)}>
      {children}
    </p>
  );
};

// Card Content
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Card Footer
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={cn('pt-4 mt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  );
};
