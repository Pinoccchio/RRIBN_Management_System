/**
 * Reservist-related type definitions
 *
 * IMPORTANT: This file defines types for TWO different status fields:
 * 1. Account Status (accounts.status) - Controls system access and approval workflow
 *    Values: 'pending' | 'active' | 'inactive' | 'deactivated'
 * 2. Reservist Status (reservist_details.reservist_status) - Military operational readiness
 *    Values: 'ready' | 'standby' | 'retired'
 *
 * ALSO IMPORTANT: Commission-related fields:
 * 1. Commission Type (reservist_details.commission_type) - NCO vs CO classification
 *    Values: 'NCO' | 'CO' (imported from analytics.ts)
 * 2. Commission Source (reservist_details.source_of_commission) - How they were commissioned
 *    Values: 'ROTC' | 'OCS' | 'PMA' | 'Direct' | 'Other'
 */

import { CommissionType } from './analytics';

/**
 * Military operational readiness status for reservists
 * Stored in: reservist_details.reservist_status
 * - ready: Active and available for immediate deployment
 * - standby: In reserve, not immediately available
 * - retired: Separated from active service
 */
export type ReservistStatus = 'ready' | 'standby' | 'retired';

/**
 * Account access status for all users
 * Stored in: accounts.status
 * - pending: Awaiting admin approval (cannot login)
 * - active: Approved and can access the system
 * - inactive: Temporarily disabled account
 * - deactivated: Rejected or permanently disabled
 */
export type AccountStatus = 'pending' | 'active' | 'inactive' | 'deactivated';

/**
 * Source of commission - how the reservist was commissioned
 * Stored in: reservist_details.source_of_commission
 */
export type CommissionSource = 'ROTC' | 'OCS' | 'PMA' | 'Direct' | 'Other';

export interface ReservistDetails {
  id: string;
  service_number: string;
  afpsn: string | null;
  rank: string | null;
  company: string | null;
  /** NCO vs CO classification - used for filtering system scope */
  commission_type: CommissionType | null;
  date_of_birth: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  reservist_status: ReservistStatus;
  br_svc: string | null;
  mos: string | null;
  /** How the reservist was commissioned (ROTC, OCS, etc.) */
  source_of_commission: CommissionSource | null;
  initial_rank: string | null;
  date_of_commission: string | null;
  commission_authority: string | null;
  mobilization_center: string | null;
  designation: string | null;
  squad_team_section: string | null;
  platoon: string | null;
  battalion_brigade: string | null;
  combat_shoes_size: string | null;
  cap_size: string | null;
  bda_size: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  phone: string | null;
  profile_photo_url: string | null;
}

export interface Approver {
  first_name: string;
  last_name: string;
}

/**
 * Full Reservist type combining account, profile, and reservist details
 */
export interface Reservist {
  id: string;
  email: string;
  role: 'reservist';
  /** Account access status - controls login and system access */
  status: AccountStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  last_login_at: string | null;
  rejection_reason: string | null;
  // Nested objects
  profile: Profile;
  reservist_details: ReservistDetails;
  approver: Approver | null;
}

/**
 * Flattened view data from reservist_accounts_with_details
 */
export interface ReservistViewData {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  last_login_at: string | null;
  rejection_reason: string | null;
  // Profile fields
  first_name: string;
  middle_name: string | null;
  last_name: string;
  phone: string | null;
  profile_photo_url: string | null;
  // Reservist detail fields
  service_number: string;
  afpsn: string | null;
  rank: string | null;
  company: string | null;
  commission_type: string | null;
  date_of_birth: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  reservist_status: string;
  br_svc: string | null;
  mos: string | null;
  source_of_commission: string | null;
  initial_rank: string | null;
  date_of_commission: string | null;
  // Additional fields from view
  commission_authority: string | null;
  mobilization_center: string | null;
  designation: string | null;
  squad_team_section: string | null;
  platoon: string | null;
  battalion_brigade: string | null;
  combat_shoes_size: string | null;
  cap_size: string | null;
  bda_size: string | null;
  // Approver fields
  approver_first_name: string | null;
  approver_last_name: string | null;
}

/**
 * Input for approving a reservist account
 */
export interface ApproveReservistInput {
  approved_by: string;
  notification_message?: string;
}

/**
 * Input for rejecting a reservist account
 */
export interface RejectReservistInput {
  reason?: string;
  rejected_by: string;
}

/**
 * Filters for reservist queries
 */
export interface ReservistFilters {
  status?: 'all' | 'pending' | 'active' | 'inactive' | 'deactivated';
  company?: string;
  rank?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response for reservists
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
