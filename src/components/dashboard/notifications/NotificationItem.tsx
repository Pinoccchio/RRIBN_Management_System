'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  GraduationCap,
  Megaphone,
  UserCheck,
  AlertCircle,
  Bell,
} from 'lucide-react';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClose,
}) => {
  const router = useRouter();

  const getIcon = () => {
    switch (notification.type) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'training':
        return <GraduationCap className="w-5 h-5 text-green-600" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-purple-600" />;
      case 'account':
        return <UserCheck className="w-5 h-5 text-yellow-600" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleClick = () => {
    // Mark as read if unread
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Navigate to action URL if exists
    if (notification.action_url) {
      router.push(notification.action_url);
      onClose?.();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
        notification.is_read
          ? 'bg-white hover:bg-gray-50'
          : 'bg-blue-50 hover:bg-blue-100'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${notification.is_read ? 'bg-gray-100' : 'bg-white'}`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm ${notification.is_read ? 'font-normal text-gray-900' : 'font-semibold text-navy-900'}`}>
              {notification.title}
            </p>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>

          <p className="text-xs text-gray-500 mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};
