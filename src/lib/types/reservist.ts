/**
 * Reservist-related type definitions
 */

export type ReservistStatus = 'active' | 'inactive' | 'deployed' | 'retired';
export type CommissionType = 'ROTC' | 'OCS' | 'PMA' | 'Direct' | 'Other';

export interface ReservistDetails {
  id: string;
  service_number: string;
  afpsn: string | null;
  rank: string | null;
  company: string | null;
  commission_type: CommissionType | null;
  date_of_birth: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  reservist_status: ReservistStatus;
  br_svc: string | null;
  mos: string | null;
  source_of_commission: string | null;
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
  status: 'pending' | 'active' | 'inactive' | 'deactivated';
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
