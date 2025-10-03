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
    const roleUpper = role.toUpperCase();

    logger.signOutStart(roleUpper, user?.email || undefined, user?.id);

    try {
      // Step 1: Call AuthContext signOut (which clears Supabase session and local state)
      logger.signOutStep('Calling AuthContext.signOut()...', `${roleUpper}_Layout`);
      await signOut();

      logger.signOutStep('AuthContext.signOut() completed successfully', `${roleUpper}_Layout`);

      // Step 2: Force router to refresh and clear cache
      logger.signOutStep('Refreshing router cache...', `${roleUpper}_Layout`);
      router.refresh();

      // Small delay to ensure refresh completes
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 3: Navigate to sign-in using replace (prevents back button issues)
      logger.signOutStep('Navigating to /signin (using replace)...', `${roleUpper}_Layout`);
      router.replace('/signin');

      // Step 4: Fallback hard redirect if router navigation doesn't work
      setTimeout(() => {
        if (window.location.pathname !== '/signin') {
          logger.warn('Router navigation did not redirect, forcing window.location', {
            context: `${roleUpper}_Layout`
          });
          window.location.href = '/signin';
        }
      }, 500);

      logger.signOutSuccess(`${roleUpper}_Layout`);
    } catch (error) {
      logger.signOutError('Sign out failed, forcing redirect anyway', error, `${roleUpper}_Layout`);

      // Force clear and redirect even if error occurs
      logger.signOutStep('Emergency fallback: Using window.location.href', `${roleUpper}_Layout`);

      // Use hard redirect to ensure user gets to signin page
      window.location.href = '/signin';
    }
  };

  // Prepare user data for header (or loading state)
  // IMPORTANT: Always provide a valid user object to ensure logout works
  const dashboardUser = loading ? {
    id: 'loading',
    name: 'Loading...',
    firstName: 'Loading',
    lastName: '',
    email: 'Loading...',
    role: role,
  } : user ? {
    id: user.id,
    name: user.profile
      ? `${user.profile.first_name} ${user.profile.last_name}`
      : user.email || 'User',
    firstName: user.profile?.first_name || user.email?.split('@')[0] || 'User',
    lastName: user.profile?.last_name || '',
    email: user.email || '',
    role: role,
  } : {
    // Fallback for unauthenticated state (should not happen in dashboard)
    id: 'guest',
    name: 'Guest',
    firstName: 'Guest',
    lastName: '',
    email: '',
    role: role,
  };

  // Log when user data is incomplete
  if (user && !user.profile && !loading) {
    logger.warn('User authenticated but profile not loaded yet', {
      context: `${role.toUpperCase()} Dashboard`,
      userId: user.id,
      email: user.email || undefined
    });
  }

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
