'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'document' | 'training' | 'announcement' | 'status_change' | 'account' | 'system';
  reference_id: string | null;
  reference_table: string | null;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch notifications
  const fetchNotifications = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/notifications?limit=${limit}`);
      const result = await response.json();

      if (result.success) {
        setNotifications(result.data);
      } else {
        setError(result.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      const result = await response.json();

      if (result.success) {
        setUnreadCount(result.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        );

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        toast.error('Failed to mark notification as read');
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) => ({
            ...notif,
            is_read: true,
            read_at: new Date().toISOString(),
          }))
        );

        setUnreadCount(0);
        toast.success(result.message || 'All notifications marked as read');
      } else {
        toast.error('Failed to mark all as read');
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all as read');
    }
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification;

            // Add new notification to state
            setNotifications((prev) => [newNotification, ...prev]);

            // Increment unread count
            setUnreadCount((prev) => prev + 1);

            // Show toast notification
            toast.success(
              `${newNotification.title}\n${newNotification.message}`,
              {
                duration: 5000,
                position: 'top-right',
                icon: '🔔',
              }
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updatedNotification = payload.new as Notification;

            // Update notification in state
            setNotifications((prev) =>
              prev.map((notif) =>
                notif.id === updatedNotification.id ? updatedNotification : notif
              )
            );

            // Update unread count if notification was marked as read
            if (updatedNotification.is_read && !payload.old.is_read) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [supabase]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };
}
