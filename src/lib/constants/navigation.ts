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
    description: 'System overview & monitoring',
  },
  {
    label: 'Administrators',
    href: '/super-admin/administrators',
    icon: 'UserCog',
    description: 'Manage administrator accounts',
  },
  {
    label: 'Analytics',
    href: '/super-admin/analytics',
    icon: 'TrendingUp',
    description: 'System analytics & monitoring',
  },
  {
    label: 'Audit Logs',
    href: '/super-admin/audit-logs',
    icon: 'FileSearch',
    description: 'Security & activity logs',
  },
  {
    label: 'Settings',
    href: '/super-admin/settings',
    icon: 'Settings',
    description: 'System configuration',
  },
  {
    label: 'Oversight',
    href: '/super-admin/oversight',
    icon: 'Eye',
    description: 'Monitor system activities',
  },
];

// Admin Navigation
export const ADMIN_NAV: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: 'LayoutDashboard',
    description: 'Battalion overview',
  },
  {
    label: 'Companies',
    href: '/admin/companies',
    icon: 'Building2',
    description: 'Manage battalion companies',
  },
  {
    label: 'Staff',
    href: '/admin/staff',
    icon: 'Users',
    description: 'Manage staff accounts',
  },
  {
    label: 'Reservists',
    href: '/admin/reservists',
    icon: 'Shield',
    description: 'Manage reservists',
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: 'BarChart3',
    description: 'Promotion recommendations',
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
    description: 'Battalion reports',
  },
  {
    label: 'Announcements',
    href: '/admin/announcements',
    icon: 'Bell',
    description: 'Announcements',
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
    label: 'RIDS',
    href: '/staff/rids',
    icon: 'FileUser',
    description: 'Reservist Information Data Sheet - Under Development',
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
