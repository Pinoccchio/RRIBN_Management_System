'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/layout/DashboardHeader';
import { getNavigationByRole } from '@/lib/constants/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Determine role from authenticated user or pathname as fallback
  const role = user?.account?.role
    ? (user.account.role.replace('_', '-') as 'super-admin' | 'admin' | 'staff')
    : pathname.includes('/super-admin')
    ? 'super-admin'
    : pathname.includes('/admin')
    ? 'admin'
    : 'staff';

  const navigationItems = getNavigationByRole(role);

  const handleSignOut = async () => {
    logger.info('Dashboard sign out initiated');
    await signOut();
    router.push('/signin');
  };

  // Prepare user data for header (or loading state)
  const dashboardUser = user && user.profile ? {
    id: user.id,
    name: `${user.profile.first_name} ${user.profile.last_name}`,
    firstName: user.profile.first_name,
    lastName: user.profile.last_name,
    email: user.email || '',
    role: role,
  } : loading ? {
    id: 'loading',
    name: 'Loading...',
    firstName: 'Loading',
    lastName: '',
    email: 'Loading...',
    role: role,
  } : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar
        navigationItems={navigationItems}
        role={role}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        {/* Header */}
        <DashboardHeader
          user={dashboardUser}
          onSignOut={handleSignOut}
          isCollapsed={isCollapsed}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
