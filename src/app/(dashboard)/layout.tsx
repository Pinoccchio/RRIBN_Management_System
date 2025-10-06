'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
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
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        logger.error('Loading timeout reached - forcing dashboard render', null, { context: 'DashboardLayout' });
        setLoadingTimeout(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

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

      // Step 2: Immediate hard redirect - most reliable method
      // Note: The AuthContext onAuthStateChange listener will also trigger redirect
      // but we do it here too for immediate feedback
      logger.signOutStep('Forcing immediate redirect to /signin', `${roleUpper}_Layout`);
      window.location.replace('/signin');

      logger.signOutSuccess(`${roleUpper}_Layout`);
    } catch (error) {
      logger.signOutError('Sign out failed, forcing redirect anyway', error, `${roleUpper}_Layout`);

      // Force clear and redirect even if error occurs
      logger.signOutStep('Emergency fallback: Using window.location.replace', `${roleUpper}_Layout`);

      // Use hard redirect to ensure user gets to signin page
      window.location.replace('/signin');
    }
  };

  // Watch for user becoming null and force redirect
  // This handles the case where auth state changes but component doesn't unmount
  useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const isDashboardRoute = protectedRoutes.some(route => currentPath.startsWith(route));

      if (isDashboardRoute) {
        logger.warn('User is null on dashboard route - forcing redirect to signin', {
          context: `${role.toUpperCase()}_Layout`,
          currentPath
        });
        window.location.replace('/signin');
      }
    }
  }, [user, loading, role]);

  // Define protected routes for the check above
  const protectedRoutes = ['/super-admin', '/admin', '/staff', '/reservist'];

  // Prepare user data for header (or loading state)
  // IMPORTANT: Always provide a valid user object to ensure logout works
  // If loading times out, force render with real user data instead of "Loading..."
  const dashboardUser = (loading && !loadingTimeout) ? {
    id: 'loading',
    name: 'Loading...',
    firstName: 'Loading',
    lastName: '',
    email: 'Loading...',
    role: role,
  } : user ? {
    id: user.id,
    // Priority: profile name > email username > role-based name
    // NEVER show "Guest" if user object exists - always show something meaningful
    name: user.profile
      ? `${user.profile.first_name} ${user.profile.last_name}`
      : user.email
        ? user.email.split('@')[0]
        : `${role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')} User`,
    firstName: user.profile?.first_name || (user.email ? user.email.split('@')[0] : role.charAt(0).toUpperCase() + role.slice(1)),
    lastName: user.profile?.last_name || '',
    email: user.email || '',
    role: role,
  } : {
    // Fallback for unauthenticated state (should not happen in dashboard)
    // This will trigger the redirect in the useEffect above
    id: 'guest',
    name: `${role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')} User`,
    firstName: role.charAt(0).toUpperCase() + role.slice(1),
    lastName: 'User',
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

  // Show loading state while auth is initializing to prevent hydration mismatch
  // This ensures handleSignOut has proper user context before user can interact
  // BUT: If loading takes more than 10 seconds, force render to prevent infinite loading
  // IMPORTANT: Only show loading if we have NO user data at all
  // If we have user but missing profile, render dashboard with email fallback
  const shouldShowLoading = loading && !user && !loadingTimeout;

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
          <p className="text-xs text-gray-400 mt-2">If this takes too long, please refresh the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      <Toaster position="top-right" />

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
