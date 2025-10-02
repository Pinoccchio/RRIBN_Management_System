'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { NavigationItem } from '@/lib/constants/navigation';
import {
  LayoutDashboard,
  UserCog,
  Users,
  Shield,
  GraduationCap,
  FileText,
  TrendingUp,
  Settings,
  FileSearch,
  Bell,
  FileCheck,
  Megaphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  UserCog,
  Users,
  Shield,
  GraduationCap,
  FileText,
  TrendingUp,
  Settings,
  FileSearch,
  Bell,
  FileCheck,
  Megaphone,
};

interface DashboardSidebarProps {
  navigationItems: NavigationItem[];
  role: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  navigationItems,
  role,
  isCollapsed,
  onToggle,
}) => {
  const pathname = usePathname();

  const getRoleName = (role: string): string => {
    switch (role) {
      case 'super-admin':
        return 'Super Administrator';
      case 'admin':
        return 'Administrator';
      case 'staff':
        return 'Staff';
      default:
        return 'User';
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-navy-900 border-r border-yellow-500/20 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-yellow-500/20">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/logo.jpg"
                  alt="301st RRIBn Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div className="text-yellow-500 font-bold text-sm">301st RRIBn</div>
                  <div className="text-gray-400 text-xs">{getRoleName(role)}</div>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="mx-auto">
                <Image
                  src="/images/logo.jpg"
                  alt="301st RRIBn Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-yellow-500 text-navy-900'
                        : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 font-medium text-sm">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-navy-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-yellow-500/20">
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Collapse Toggle Button */}
          <div className="p-3 border-t border-yellow-500/20">
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <div className="lg:hidden fixed inset-0 bg-black/50 z-30" />
    </>
  );
};
