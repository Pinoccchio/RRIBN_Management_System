'use client';

import React, { useState } from 'react';
import { Bell, User, LogOut, Settings, ChevronDown, Menu, X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { DashboardUser } from '@/lib/types/dashboard';
import { logger } from '@/lib/logger';

interface DashboardHeaderProps {
  user?: DashboardUser;
  onSignOut?: () => void;
  isCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onSignOut,
  isCollapsed = false,
  onToggleSidebar
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count

  // Use provided user data or fallback to mock data
  const currentUser = user || {
    id: '1',
    name: 'Super Administrator',
    firstName: 'Super',
    lastName: 'Administrator',
    email: 'admin@301rribn.mil.ph',
    role: 'super-admin' as const,
  };

  // Log if we're using fallback user data
  if (!user && typeof window !== 'undefined') {
    logger.warn('DashboardHeader: No user data provided, using fallback', {
      context: 'DashboardHeader'
    });
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-600 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Menu className="w-6 h-6" />
          ) : (
            <X className="w-6 h-6" />
          )}
        </button>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                const newState = !isProfileOpen;
                logger.clickEvent(
                  'Profile Dropdown Toggle',
                  newState ? 'Opening profile menu' : 'Closing profile menu',
                  `${currentUser.role?.toUpperCase() || 'UNKNOWN'}_DashboardHeader`
                );
                logger.stateChange('ProfileDropdown', isProfileOpen ? 'open' : 'closed', newState ? 'open' : 'closed');
                setIsProfileOpen(newState);
              }}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Avatar
                firstName={currentUser.firstName || currentUser.name.split(' ')[0]}
                lastName={currentUser.lastName || currentUser.name.split(' ')[1] || ''}
                src={currentUser.avatar}
                size="md"
              />
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-navy-900">{currentUser.name}</div>
                <div className="text-xs text-gray-600 capitalize">{currentUser.role.replace('-', ' ')}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    // Only close if clicking the backdrop itself, not its children
                    if (e.target === e.currentTarget) {
                      setIsProfileOpen(false);
                    }
                  }}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-military-lg border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="font-semibold text-navy-900">{currentUser.name}</div>
                    <div className="text-sm text-gray-600">{currentUser.email}</div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-gray-200 pt-2">
                    <button
                      onClick={() => {
                        const roleContext = `${currentUser.role?.toUpperCase() || 'UNKNOWN'}_DashboardHeader`;

                        // Log the click event
                        logger.clickEvent('Sign Out Button', 'User clicked sign out', roleContext);
                        logger.separator();
                        logger.info('🚪 LOGOUT BUTTON CLICKED', {
                          context: roleContext,
                          email: currentUser.email,
                          userId: currentUser.id,
                          data: {
                            hasOnSignOutHandler: !!onSignOut,
                            profileMenuOpen: isProfileOpen,
                            timestamp: new Date().toISOString()
                          }
                        });

                        // Check if signOut handler is available
                        if (!onSignOut) {
                          logger.signOutError('No signOut handler provided to DashboardHeader', null, roleContext);
                          alert('Sign out handler is missing. Please refresh the page and try again.');
                          return;
                        }

                        // Log state change
                        logger.stateChange('ProfileDropdown', 'open', 'closed');
                        setIsProfileOpen(false);

                        // Log handler invocation
                        logger.signOutStep('Invoking onSignOut handler...', roleContext);

                        // Call the sign out handler asynchronously
                        try {
                          Promise.resolve(onSignOut()).catch((error) => {
                            logger.signOutError('Exception thrown when calling onSignOut', error, roleContext);
                          });
                        } catch (error) {
                          logger.signOutError('Exception thrown when calling onSignOut', error, roleContext);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
