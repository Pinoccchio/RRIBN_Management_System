import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'danger' | 'info' | 'primary' | 'default' | 'pending';

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
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    primary: 'bg-navy-100 text-navy-800 border-navy-200',
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

// Training Status Badge Component
interface TrainingStatusBadgeProps {
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
}

export function TrainingStatusBadge({ status, size = 'md' }: TrainingStatusBadgeProps) {
  const statusConfig = {
    scheduled: { variant: 'pending' as BadgeVariant, label: 'Scheduled' },
    ongoing: { variant: 'info' as BadgeVariant, label: 'Ongoing' },
    completed: { variant: 'success' as BadgeVariant, label: 'Completed' },
    cancelled: { variant: 'error' as BadgeVariant, label: 'Cancelled' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

// Document Status Badge Component
interface DocumentStatusBadgeProps {
  status: 'pending' | 'verified' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
}

export function DocumentStatusBadge({ status, size = 'md' }: DocumentStatusBadgeProps) {
  const statusConfig = {
    pending: { variant: 'pending' as BadgeVariant, label: 'Pending' },
    verified: { variant: 'success' as BadgeVariant, label: 'Verified' },
    rejected: { variant: 'error' as BadgeVariant, label: 'Rejected' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

// RIDS Status Badge Component
interface RIDSStatusBadgeProps {
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
}

export function RIDSStatusBadge({ status, size = 'md' }: RIDSStatusBadgeProps) {
  const statusConfig = {
    draft: { variant: 'default' as BadgeVariant, label: 'Draft' },
    submitted: { variant: 'pending' as BadgeVariant, label: 'Submitted' },
    approved: { variant: 'success' as BadgeVariant, label: 'Approved' },
    rejected: { variant: 'error' as BadgeVariant, label: 'Rejected' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}
