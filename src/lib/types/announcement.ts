/**
 * Announcement Types
 *
 * Type definitions for the announcements feature in RRIBN Management System.
 * Announcements allow staff to broadcast important information to reservists
 * based on company and role targeting.
 */

/**
 * Priority levels for announcements
 */
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Base announcement interface matching the database schema
 */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  target_companies: string[] | null;
  target_roles: string[] | null;
  created_by: string;
  is_active: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Announcement with creator information
 * Used in list and detail views
 */
export interface AnnouncementWithCreator extends Announcement {
  creator: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

/**
 * Input for creating a new announcement
 */
export interface CreateAnnouncementInput {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  target_companies?: string[];
  target_roles?: string[];
  publish_now?: boolean;
  is_active?: boolean;
  expires_at?: string;
}

/**
 * Input for updating an existing announcement
 */
export interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  priority?: AnnouncementPriority;
  target_companies?: string[];
  target_roles?: string[];
  is_active?: boolean;
  published_at?: string;
  expires_at?: string;
}

/**
 * API response for announcement list
 */
export interface AnnouncementListResponse {
  success: boolean;
  data?: AnnouncementWithCreator[];
  total?: number;
  error?: string;
}

/**
 * API response for single announcement
 */
export interface AnnouncementDetailResponse {
  success: boolean;
  data?: AnnouncementWithCreator;
  error?: string;
}

/**
 * API response for delete/deactivate operation
 */
export interface AnnouncementDeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}
