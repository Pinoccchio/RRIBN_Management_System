import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  label: string;
  href: string;
  icon: string; // Icon name as string (we'll map to actual icons in the component)
  badge?: string | number;
  description?: string;
}

export interface RoleNavigation {
  role: 'super-admin' | 'admin' | 'staff';
  basePath: string;
  items: NavigationItem[];
}

// Super Admin Navigation
export const SUPER_ADMIN_NAV: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/super-admin',
    icon: 'LayoutDashboard',
    description: 'Overview & system metrics',
  },
  {
    label: 'Administrators',
    href: '/super-admin/administrators',
    icon: 'UserCog',
    description: 'Manage administrator accounts',
  },
  {
    label: 'Staff',
    href: '/super-admin/staff',
    icon: 'Users',
    description: 'Manage staff across companies',
  },
  {
    label: 'Reservists',
    href: '/super-admin/reservists',
    icon: 'Shield',
    description: 'Full reservist oversight',
  },
  {
    label: 'Training',
    href: '/super-admin/training',
    icon: 'GraduationCap',
    description: 'System-wide training management',
  },
  {
    label: 'Reports',
    href: '/super-admin/reports',
    icon: 'FileText',
    description: 'Comprehensive reporting',
  },
  {
    label: 'Analytics',
    href: '/super-admin/analytics',
    icon: 'TrendingUp',
    description: 'Prescriptive analytics',
    badge: 'Exclusive',
  },
  {
    label: 'Settings',
    href: '/super-admin/settings',
    icon: 'Settings',
    description: 'System configuration',
  },
  {
    label: 'Audit Logs',
    href: '/super-admin/audit-logs',
    icon: 'FileSearch',
    description: 'Security & activity logs',
  },
];

// Admin Navigation (for future use)
export const ADMIN_NAV: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: 'LayoutDashboard',
    description: 'Overview & metrics',
  },
  {
    label: 'Staff',
    href: '/admin/staff',
    icon: 'Users',
    description: 'Manage assigned staff',
  },
  {
    label: 'Reservists',
    href: '/admin/reservists',
    icon: 'Shield',
    description: 'Manage reservists',
  },
  {
    label: 'Training',
    href: '/admin/training',
    icon: 'GraduationCap',
    description: 'Training management',
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: 'FileText',
    description: 'Company reports',
  },
  {
    label: 'Announcements',
    href: '/admin/announcements',
    icon: 'Bell',
    description: 'View announcements',
  },
];

// Staff Navigation (for future use)
export const STAFF_NAV: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/staff',
    icon: 'LayoutDashboard',
    description: 'Company overview',
  },
  {
    label: 'Reservists',
    href: '/staff/reservists',
    icon: 'Shield',
    description: 'Manage company reservists',
  },
  {
    label: 'Documents',
    href: '/staff/documents',
    icon: 'FileCheck',
    description: 'Document validation',
  },
  {
    label: 'Training',
    href: '/staff/training',
    icon: 'GraduationCap',
    description: 'Company training',
  },
  {
    label: 'Announcements',
    href: '/staff/announcements',
    icon: 'Megaphone',
    description: 'Create announcements',
  },
  {
    label: 'Reports',
    href: '/staff/reports',
    icon: 'FileText',
    description: 'Company reports',
  },
];

// Role-based navigation mapper
export const ROLE_NAVIGATION: Record<string, NavigationItem[]> = {
  'super-admin': SUPER_ADMIN_NAV,
  'admin': ADMIN_NAV,
  'staff': STAFF_NAV,
};

// Get navigation items by role
export function getNavigationByRole(role: 'super-admin' | 'admin' | 'staff'): NavigationItem[] {
  return ROLE_NAVIGATION[role] || [];
}
