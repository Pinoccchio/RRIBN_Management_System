import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'pending';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variantClasses = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}

// Status Badge Component - Specific for account/admin status
interface StatusBadgeProps {
  status: 'pending' | 'active' | 'inactive' | 'deactivated';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    pending: { variant: 'pending' as BadgeVariant, label: 'Pending' },
    active: { variant: 'success' as BadgeVariant, label: 'Active' },
    inactive: { variant: 'warning' as BadgeVariant, label: 'Inactive' },
    deactivated: { variant: 'error' as BadgeVariant, label: 'Deactivated' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

// Role Badge Component
interface RoleBadgeProps {
  role: 'super_admin' | 'admin' | 'staff' | 'reservist';
  size?: 'sm' | 'md' | 'lg';
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const roleConfig = {
    super_admin: { variant: 'info' as BadgeVariant, label: 'Super Admin' },
    admin: { variant: 'info' as BadgeVariant, label: 'Administrator' },
    staff: { variant: 'default' as BadgeVariant, label: 'Staff' },
    reservist: { variant: 'default' as BadgeVariant, label: 'Reservist' },
  };

  const config = roleConfig[role];

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}
